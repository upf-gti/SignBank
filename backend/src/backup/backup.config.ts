export interface BackupConfig {
  // Cron expressions for scheduled tasks
  backupSchedule: string;
  cleanupSchedule: string;
  
  // Backup retention settings
  retentionDays: number;
  
  // Backup settings
  enabled: boolean;
  maxBackupSize: number; // in MB
  
  // Notification settings
  enableNotifications: boolean;
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
}

export const getBackupConfig = (): BackupConfig => {
  return {
    // Default to daily at 2:00 AM, can be overridden by environment variable
    backupSchedule: '* * * * *',
    
    // Default to weekly cleanup on Sunday at 3:00 AM
    cleanupSchedule: process.env.BACKUP_CLEANUP_SCHEDULE || '0 3 * * 0',
    
    // Keep backups for 7 days by default
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '7', 10),
    
    // Enable/disable backup functionality
    enabled: process.env.BACKUP_ENABLED !== 'false',
    
    // Maximum backup size in MB (default 1GB)
    maxBackupSize: parseInt(process.env.BACKUP_MAX_SIZE_MB || '1024', 10),
    
    // Notification settings
    enableNotifications: process.env.BACKUP_NOTIFICATIONS !== 'false',
    notifyOnSuccess: process.env.BACKUP_NOTIFY_SUCCESS !== 'false',
    notifyOnFailure: process.env.BACKUP_NOTIFY_FAILURE !== 'false',
  };
}; 