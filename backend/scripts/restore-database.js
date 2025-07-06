const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

// Get database URL from environment or use default
const databaseUrl = process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/signbank'

// Parse database connection details from URL
function parseDatabaseUrl(url) {
    const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/
    const match = url.match(regex)

    if (!match) {
        throw new Error('Invalid DATABASE_URL format')
    }

    return {
        username: match[1],
        password: match[2],
        host: match[3],
        port: match[4],
        database: match[5]
    }
}

// Check if psql is available
function checkPsqlAvailable() {
    return new Promise((resolve) => {
        const isWindows = process.platform === 'win32'
        const command = isWindows ? 'where psql' : 'which psql'

        exec(command, (error) => {
            resolve(!error)
        })
    })
}

// Restore from JSON backup using Prisma
async function restoreFromJson(backupPath) {
    console.log('🔄 Restoring from JSON backup using Prisma...')

    try {
        const { PrismaClient } = require('@prisma/client')
        const prisma = new PrismaClient()

        // Read backup file
        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'))

        console.log('⚠️  WARNING: This will completely replace the current database!')
        console.log(`📁 Restoring from: ${backupPath}`)

        // Clear existing data (in reverse order of dependencies)
        console.log('🗑️  Clearing existing data...')
        await prisma.exampleTranslation.deleteMany()
        await prisma.definitionTranslation.deleteMany()
        await prisma.senseTranslation.deleteMany()
        await prisma.video.deleteMany()
        await prisma.signVideo.deleteMany()
        await prisma.videoData.deleteMany()
        await prisma.example.deleteMany()
        await prisma.definition.deleteMany()
        await prisma.sense.deleteMany()
        await prisma.relatedGloss.deleteMany()
        await prisma.minimalPair.deleteMany()
        await prisma.glossRequest.deleteMany()
        await prisma.dictionaryEntry.deleteMany()
        await prisma.glossData.deleteMany()
        await prisma.user.deleteMany()

        // Restore data (in order of dependencies)
        console.log('📥 Restoring data...')

        if (backupData.users) {
            console.log('  - Restoring users...')
            await prisma.user.createMany({ data: backupData.users })
        }

        if (backupData.glossData) {
            console.log('  - Restoring gloss data...')
            await prisma.glossData.createMany({ data: backupData.glossData })
        }

        if (backupData.dictionaryEntries) {
            console.log('  - Restoring dictionary entries...')
            await prisma.dictionaryEntry.createMany({ data: backupData.dictionaryEntries })
        }

        if (backupData.senses) {
            console.log('  - Restoring senses...')
            await prisma.sense.createMany({ data: backupData.senses })
        }

        if (backupData.videoData) {
            console.log('  - Restoring video data...')
            await prisma.videoData.createMany({ data: backupData.videoData })
        }

        if (backupData.signVideos) {
            console.log('  - Restoring sign videos...')
            await prisma.signVideo.createMany({ data: backupData.signVideos })
        }

        if (backupData.videos) {
            console.log('  - Restoring videos...')
            await prisma.video.createMany({ data: backupData.videos })
        }

        if (backupData.definitions) {
            console.log('  - Restoring definitions...')
            await prisma.definition.createMany({ data: backupData.definitions })
        }

        if (backupData.examples) {
            console.log('  - Restoring examples...')
            await prisma.example.createMany({ data: backupData.examples })
        }

        if (backupData.senseTranslations) {
            console.log('  - Restoring sense translations...')
            await prisma.senseTranslation.createMany({ data: backupData.senseTranslations })
        }

        if (backupData.definitionTranslations) {
            console.log('  - Restoring definition translations...')
            await prisma.definitionTranslation.createMany({ data: backupData.definitionTranslations })
        }

        if (backupData.exampleTranslations) {
            console.log('  - Restoring example translations...')
            await prisma.exampleTranslation.createMany({ data: backupData.exampleTranslations })
        }

        if (backupData.relatedGlosses) {
            console.log('  - Restoring related glosses...')
            await prisma.relatedGloss.createMany({ data: backupData.relatedGlosses })
        }

        if (backupData.minimalPairs) {
            console.log('  - Restoring minimal pairs...')
            await prisma.minimalPair.createMany({ data: backupData.minimalPairs })
        }

        if (backupData.glossRequests) {
            console.log('  - Restoring gloss requests...')
            await prisma.glossRequest.createMany({ data: backupData.glossRequests })
        }

        console.log('✅ JSON restore completed successfully!')
        await prisma.$disconnect()

    } catch (error) {
        console.error('❌ JSON restore failed:', error)
        throw error
    }
}

async function restoreDatabase() {
    try {
        console.log('Starting database restore...')

        // Get backup file path from command line argument or use latest
        const backupFile = process.argv[2]
        let backupPath

        if (backupFile) {
            backupPath = path.resolve(backupFile)
        } else {
            // Use latest backup
            const backupDir = path.join(__dirname, '../backups')
            const latestBackupPath = path.join(backupDir, 'latest_backup.sql')

            if (!fs.existsSync(latestBackupPath)) {
                console.error('❌ No backup file specified and no latest backup found.')
                console.error('Usage: node restore-database.js [backup-file-path]')
                console.error('Or ensure there is a latest_backup.sql symlink in the backups directory.')
                process.exit(1)
            }

            backupPath = latestBackupPath
        }

        if (!fs.existsSync(backupPath)) {
            console.error(`❌ Backup file not found: ${backupPath}`)
            process.exit(1)
        }

        // Check if it's a JSON backup
        const isJsonBackup = backupPath.endsWith('.json')

        if (isJsonBackup) {
            return await restoreFromJson(backupPath)
        }

        // Check if psql is available for SQL restore
        const psqlAvailable = await checkPsqlAvailable()

        if (!psqlAvailable) {
            console.error('❌ psql not found and backup is SQL format.')
            console.error('Please install PostgreSQL command-line tools or use a JSON backup.')
            process.exit(1)
        }

        const dbConfig = parseDatabaseUrl(databaseUrl)

        // Set environment variables for psql
        const env = {
            ...process.env,
            PGPASSWORD: dbConfig.password
        }

        // Build psql restore command
        const psqlCommand = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -f "${backupPath}"`

        console.log(`⚠️  WARNING: This will completely replace the current database!`)
        console.log(`📁 Restoring from: ${backupPath}`)
        console.log(`🗄️  Database: ${dbConfig.database}`)
        console.log(`⏳ Executing restore...`)

        // Execute restore
        exec(psqlCommand, { env }, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Restore failed:', error)
                console.error('stderr:', stderr)
                process.exit(1)
            }

            if (stderr) {
                console.warn('⚠️  Restore warnings:', stderr)
            }

            console.log(`✅ Database restored successfully!`)
            console.log(`📁 Restored from: ${backupPath}`)
            console.log(`🗄️  Database: ${dbConfig.database}`)

            if (stdout) {
                console.log('📋 Restore output:', stdout)
            }
        })

    } catch (error) {
        console.error('❌ Restore script failed:', error)
        process.exit(1)
    }
}

// Run restore
restoreDatabase() 