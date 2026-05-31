/**
 * Backup and Restore Scripts
 * Let Investments - Database backup/restore utilities
 * 
 * ============================================================================
 * 
 * Usage:
 *   Backup:  node scripts/backup.js
 *   Restore: node scripts/restore.js <backup_file>
 * 
 * ============================================================================
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const config = {
  // Database configuration - override with environment variables
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'let',
  
  // Backup directory
  backupDir: process.env.BACKUP_DIR || './backups',
  
  // Retention (days)
  retentionDays: 7,
};

/**
 * Get database connection string
 */
function getConnectionString() {
  return `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
}

/**
 * Create backup filename with timestamp
 */
function getBackupFilename() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `backup_${timestamp}.dump`;
}

/**
 * Ensure backup directory exists
 */
function ensureBackupDir() {
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
  }
}

/**
 * Create database backup
 */
function createBackup() {
  console.log('Starting database backup...');
  console.log(`Database: ${config.database}`);
  
  ensureBackupDir();
  
  const backupFile = path.join(config.backupDir, getBackupFilename());
  const connStr = getConnectionString();
  
  try {
    // Use pg_dump to create backup
    execSync(`pg_dump -Fc -f "${backupFile}" "${connStr}"`, {
      stdio: 'inherit',
      env: { ...process.env, PGPASSWORD: config.password },
    });
    
    // Compress the backup
    const compressedFile = `${backupFile}.gz`;
    execSync(`gzip -c "${backupFile}" > "${compressedFile}"`);
    
    // Remove uncompressed file
    fs.unlinkSync(backupFile);
    
    console.log(`Backup created: ${compressedFile}`);
    console.log(`File size: ${(fs.statSync(compressedFile).size / 1024 / 1024).toFixed(2)} MB`);
    
    // Clean old backups
    cleanOldBackups();
    
    return compressedFile;
  } catch (error) {
    console.error('Backup failed:', error.message);
    throw error;
  }
}

/**
 * Restore database from backup
 */
function restoreBackup(backupFile) {
  console.log('Starting database restore...');
  console.log(`Backup file: ${backupFile}`);
  
  if (!fs.existsSync(backupFile)) {
    throw new Error(`Backup file not found: ${backupFile}`);
  }
  
  const connStr = getConnectionString();
  
  // Check if file is compressed
  let dumpFile = backupFile;
  if (backupFile.endsWith('.gz')) {
    const tempFile = backupFile.replace('.gz', '');
    console.log('Decompressing backup...');
    execSync(`gunzip -c "${backupFile}" > "${tempFile}"`);
    dumpFile = tempFile;
  }
  
  try {
    // Drop existing connections
    console.log('Terminating existing connections...');
    execSync(`psql -h ${config.host} -p ${config.port} -U ${config.user} -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE datname = '${config.database}' AND pid <> pg_backend_pid();"`, {
      env: { ...process.env, PGPASSWORD: config.password },
    });
    
    // Drop and recreate database
    console.log('Recreating database...');
    execSync(`psql -h ${config.host} -p ${config.port} -U ${config.user} -d postgres -c "DROP DATABASE IF EXISTS ${config.database};"`, {
      env: { ...process.env, PGPASSWORD: config.password },
    });
    execSync(`psql -h ${config.host} -p ${config.port} -U ${config.user} -d postgres -c "CREATE DATABASE ${config.database};"`, {
      env: { ...process.env, PGPASSWORD: config.password },
    });
    
    // Restore from backup
    console.log('Restoring data...');
    execSync(`pg_restore -d "${connStr}" "${dumpFile}"`, {
      env: { ...process.env, PGPASSWORD: config.password },
      stdio: 'inherit',
    });
    
    // Clean up temp file if decompressed
    if (backupFile.endsWith('.gz')) {
      fs.unlinkSync(dumpFile);
    }
    
    console.log('Restore completed successfully!');
  } catch (error) {
    console.error('Restore failed:', error.message);
    throw error;
  }
}

/**
 * Clean old backups based on retention policy
 */
function cleanOldBackups() {
  console.log('Cleaning old backups...');
  
  const files = fs.readdirSync(config.backupDir)
    .filter(f => f.startsWith('backup_') && f.endsWith('.gz'))
    .map(f => ({
      name: f,
      path: path.join(config.backupDir, f),
      time: fs.statSync(path.join(config.backupDir, f)).mtime,
    }))
    .sort((a, b) => b.time - a.time);
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays);
  
  let deletedCount = 0;
  for (let i = config.retentionDays; i < files.length; i++) {
    if (files[i].time < cutoffDate) {
      fs.unlinkSync(files[i].path);
      console.log(`Deleted: ${files[i].name}`);
      deletedCount++;
    }
  }
  
  console.log(`Deleted ${deletedCount} old backup(s)`);
}

/**
 * List available backups
 */
function listBackups() {
  ensureBackupDir();
  
  const files = fs.readdirSync(config.backupDir)
    .filter(f => f.startsWith('backup_') && f.endsWith('.gz'))
    .map(f => {
      const stats = fs.statSync(path.join(config.backupDir, f));
      return {
        name: f,
        size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
        date: stats.mtime.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (files.length === 0) {
    console.log('No backups found');
    return [];
  }
  
  console.log('\nAvailable backups:');
  files.forEach((f, i) => {
    console.log(`${i + 1}. ${f.name} - ${f.size} - ${f.date}`);
  });
  
  return files;
}

// CLI handling
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'backup':
    createBackup();
    break;
  case 'restore':
    if (!args[1]) {
      console.error('Usage: node backup.js restore <backup_file>');
      process.exit(1);
    }
    restoreBackup(args[1]);
    break;
  case 'list':
    listBackups();
    break;
  default:
    console.log(`
Let Investments - Database Backup/Restore

Usage:
  node backup.js backup      - Create a new backup
  node backup.js restore <file> - Restore from backup file
  node backup.js list       - List available backups

Environment variables:
  DB_HOST      - Database host (default: localhost)
  DB_PORT      - Database port (default: 5432)
  DB_USER      - Database user (default: postgres)
  DB_PASSWORD  - Database password
  DB_NAME      - Database name (default: let)
  BACKUP_DIR   - Backup directory (default: ./backups)
`);
}

module.exports = {
  createBackup,
  restoreBackup,
  cleanOldBackups,
  listBackups,
  config,
};



