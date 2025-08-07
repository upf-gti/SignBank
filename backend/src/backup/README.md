# Database Backup Service

This module provides automated database backup functionality for the SignBank application.

## Features

- **Scheduled Backups**: Automatic daily backups at configurable times
- **Manual Backups**: API endpoints to trigger backups on demand
- **Backup Management**: Status checking and cleanup of old backups
- **Configurable Retention**: Automatic cleanup of old backup files
- **Multiple Backup Methods**: Supports both pg_dump and Prisma-based backups

## Configuration

The backup service can be configured using environment variables:

### Schedule Configuration
- `BACKUP_SCHEDULE`: Cron expression for backup schedule (default: `0 2 * * *` - daily at 2:00 AM)
- `BACKUP_CLEANUP_SCHEDULE`: Cron expression for cleanup schedule (default: `0 3 * * 0` - weekly on Sunday at 3:00 AM)

### Retention Configuration
- `BACKUP_RETENTION_DAYS`: Number of days to keep backups (default: 7)
- `BACKUP_MAX_SIZE_MB`: Maximum backup size in MB (default: 1024)

### Feature Toggles
- `BACKUP_ENABLED`: Enable/disable backup functionality (default: true)
- `BACKUP_NOTIFICATIONS`: Enable/disable notifications (default: true)
- `BACKUP_NOTIFY_SUCCESS`: Notify on successful backups (default: true)
- `BACKUP_NOTIFY_FAILURE`: Notify on failed backups (default: true)

## API Endpoints

### Create Manual Backup
```http
POST /backup/create
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Backup completed successfully",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Get Backup Status
```http
GET /backup/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "backups_available",
    "message": "Backups are available",
    "lastBackup": {
      "filename": "backup_2024-01-01T02-00-00-000Z.sql",
      "size": 1048576,
      "sizeInMB": "1.00",
      "createdAt": "2024-01-01T02:00:00.000Z",
      "modifiedAt": "2024-01-01T02:00:00.000Z"
    },
    "backupCount": 7,
    "totalSize": 7340032
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Clean Old Backups
```http
POST /backup/cleanup
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Cleaned 3 old backup files",
  "deletedCount": 3,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Scheduled Tasks

### Daily Backup
- **Schedule**: Daily at 2:00 AM (configurable)
- **Action**: Creates a new database backup
- **Location**: `backend/backups/`

### Weekly Cleanup
- **Schedule**: Weekly on Sunday at 3:00 AM (configurable)
- **Action**: Removes backup files older than retention period
- **Retention**: 7 days by default (configurable)

## Backup Methods

The service supports two backup methods:

### 1. pg_dump (Preferred)
- Uses PostgreSQL's native `pg_dump` utility
- Creates SQL files that can be restored with `psql`
- Faster and more efficient for large databases
- Requires `pg_dump` to be installed on the system

### 2. Prisma Export (Fallback)
- Uses Prisma Client to export data as JSON
- Works when `pg_dump` is not available
- Slower but more portable
- Creates JSON files with all database records

## File Structure

```
backend/
├── backups/                    # Backup storage directory
│   ├── backup_2024-01-01T02-00-00-000Z.sql
│   ├── backup_2024-01-02T02-00-00-000Z.sql
│   └── latest_backup.sql      # Symlink to latest backup
├── scripts/
│   ├── backup-database.js     # Backup script
│   └── restore-database.js    # Restore script
└── src/
    └── backup/
        ├── backup.service.ts   # Backup service
        ├── backup.controller.ts # API controller
        ├── backup.module.ts    # Module definition
        ├── backup.config.ts    # Configuration
        └── README.md          # This file
```

## Security

- All backup endpoints require authentication
- Only users with `ADMIN` role can access backup functionality
- Backup files are stored in a secure directory
- Sensitive data in logs is masked

## Monitoring

The service provides comprehensive logging:
- Backup start/completion events
- Error messages with details
- Cleanup operations
- File size and count information

## Troubleshooting

### Common Issues

1. **Backup fails with pg_dump error**
   - Ensure `pg_dump` is installed and accessible
   - Check database connection settings
   - Verify database user permissions

2. **Scheduled backups not running**
   - Check if `BACKUP_ENABLED` is set to `true`
   - Verify cron expression format
   - Check application logs for errors

3. **Backup files not being cleaned**
   - Verify `BACKUP_RETENTION_DAYS` setting
   - Check file permissions on backup directory
   - Ensure cleanup schedule is correct

### Logs

Check application logs for backup-related messages:
```bash
# View backup logs
docker logs <container-name> | grep -i backup

# Or check application logs
tail -f logs/application.log | grep -i backup
``` 