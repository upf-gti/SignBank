import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { getBackupConfig } from './backup.config';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  /**
   * Scheduled backup that runs according to configuration
   */
  @Cron(getBackupConfig().backupSchedule) 
   async scheduledBackup() {
    if (!getBackupConfig().enabled) {
      this.logger.log('Backup is disabled, skipping scheduled backup');
      return;
    }
    
    this.logger.log('Starting scheduled database backup...');
    await this.createBackup();
  }

  /**
   * Manual backup trigger
   */
  async createBackup(): Promise<string> {
    try {
      this.logger.log('Creating database backup...');
      
      // Get the path to the backup script (works in both dev and production)
      const fs = require('fs');
      let scriptPath = path.join(__dirname, '../../../scripts/backup-database.js');
      
      // If running from dist folder, adjust path to source
      if (__dirname.includes('dist')) {
        scriptPath = path.join(__dirname, '../../scripts/backup-database.js');
      }
      
      this.logger.log(`Backup script path: ${scriptPath}`);
      
      // Check if script exists
      if (!fs.existsSync(scriptPath)) {
        throw new Error(`Backup script not found at: ${scriptPath}`);
      }
      
      this.logger.log('Backup script found, executing...');
      
      // Execute the backup script
      const { stdout, stderr } = await execAsync(`node ${scriptPath}`, {
        env: {
          ...process.env,
          NODE_ENV: process.env.NODE_ENV || 'development'
        }
      });

      if (stderr) {
        this.logger.warn('Backup script warnings:', stderr);
      }

      this.logger.log('Database backup completed successfully');
      this.logger.log('Backup output:', stdout);

      return 'Backup completed successfully';
    } catch (error) {
      this.logger.error('Database backup failed:', error);
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  /**
   * Get backup status and information
   */
  async getBackupStatus() {
    try {
      const backupDir = path.join(__dirname, '../../backups');
      const fs = require('fs');
      
      if (!fs.existsSync(backupDir)) {
        return {
          status: 'no_backups',
          message: 'No backup directory found',
          lastBackup: null,
          backupCount: 0
        };
      }

      const files = fs.readdirSync(backupDir);
      const backupFiles = files.filter(file => 
        file.endsWith('.sql') || file.endsWith('.json')
      );

      if (backupFiles.length === 0) {
        return {
          status: 'no_backups',
          message: 'No backup files found',
          lastBackup: null,
          backupCount: 0
        };
      }

      // Get the most recent backup
      const backupStats = backupFiles.map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      });

      backupStats.sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());
      const latestBackup = backupStats[0];

      return {
        status: 'backups_available',
        message: 'Backups are available',
        lastBackup: {
          filename: latestBackup.filename,
          size: latestBackup.size,
          sizeInMB: (latestBackup.size / (1024 * 1024)).toFixed(2),
          createdAt: latestBackup.createdAt,
          modifiedAt: latestBackup.modifiedAt
        },
        backupCount: backupFiles.length,
        totalSize: backupStats.reduce((sum, file) => sum + file.size, 0)
      };
    } catch (error) {
      this.logger.error('Error getting backup status:', error);
      throw new Error(`Failed to get backup status: ${error.message}`);
    }
  }

  /**
   * Clean old backups based on retention configuration
   */
  async cleanOldBackups(): Promise<number> {
    try {
      const config = getBackupConfig();
      const backupDir = path.join(__dirname, '../../backups');
      const fs = require('fs');
      
      if (!fs.existsSync(backupDir)) {
        return 0;
      }

      const files = fs.readdirSync(backupDir);
      const backupFiles = files.filter(file => 
        file.endsWith('.sql') || file.endsWith('.json')
      );

      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - config.retentionDays);

      let deletedCount = 0;

      for (const file of backupFiles) {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.modifiedAt < retentionDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
          this.logger.log(`Deleted old backup: ${file}`);
        }
      }

      this.logger.log(`Cleaned ${deletedCount} old backup files (retention: ${config.retentionDays} days)`);
      return deletedCount;
    } catch (error) {
      this.logger.error('Error cleaning old backups:', error);
      throw new Error(`Failed to clean old backups: ${error.message}`);
    }
  }

  /**
   * Scheduled cleanup that runs according to configuration
   */
  @Cron(getBackupConfig().cleanupSchedule)
  async scheduledCleanup() {
    if (!getBackupConfig().enabled) {
      this.logger.log('Backup is disabled, skipping scheduled cleanup');
      return;
    }
    
    this.logger.log('Starting scheduled backup cleanup...');
    const deletedCount = await this.cleanOldBackups();
    this.logger.log(`Scheduled cleanup completed. Deleted ${deletedCount} old backup files.`);
  }
} 