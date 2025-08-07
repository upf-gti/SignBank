import { Controller, Post, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '@prisma/client';

@Controller('backup')
@UseGuards(JwtGuard, RolesGuard)
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  /**
   * Trigger a manual backup
   */
  @Post('create')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async createBackup() {
    const result = await this.backupService.createBackup();
    return {
      success: true,
      message: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get backup status and information
   */
  @Get('status')
  @Roles(Role.ADMIN)
  async getBackupStatus() {
    const status = await this.backupService.getBackupStatus();
    return {
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Clean old backups manually
   */
  @Post('cleanup')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async cleanOldBackups() {
    const deletedCount = await this.backupService.cleanOldBackups();
    return {
      success: true,
      message: `Cleaned ${deletedCount} old backup files`,
      deletedCount,
      timestamp: new Date().toISOString(),
    };
  }
} 