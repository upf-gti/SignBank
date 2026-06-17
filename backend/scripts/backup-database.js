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

// Check if pg_dump is available
function checkPgDumpAvailable() {
    return new Promise((resolve) => {
        const isWindows = process.platform === 'win32'
        const command = isWindows ? 'where pg_dump' : 'which pg_dump'

        exec(command, (error) => {
            resolve(!error)
        })
    })
}

// Alternative backup using Prisma
async function backupWithPrisma() {
    console.log('🔄 Creating backup using Prisma...')

    try {
        const { PrismaClient } = require('@prisma/client')
        const prisma = new PrismaClient()

        // Create backup directory if it doesn't exist
        const backupDir = path.join(__dirname, '../backups')
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true })
        }

        // Generate backup filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const backupFilename = `prisma_backup_${timestamp}.json`
        const backupPath = path.join(backupDir, backupFilename)

        // Export all data using Prisma
        const data = {
            users: await prisma.user.findMany(),
            dictionaryEntries: await prisma.dictionaryEntry.findMany(),
            glossData: await prisma.glossData.findMany(),
            signVideos: await prisma.signVideo.findMany(),
            videoData: await prisma.videoData.findMany(),
            videos: await prisma.video.findMany(),
            definitions: await prisma.definition.findMany(),
            examples: await prisma.example.findMany(),
            glossTranslations: await prisma.glossTranslation.findMany(),
            definitionTranslations: await prisma.definitionTranslation.findMany(),
            exampleTranslations: await prisma.exampleTranslation.findMany(),
            relatedGlosses: await prisma.relatedGloss.findMany(),
            minimalPairs: await prisma.minimalPair.findMany(),
            glossRequests: await prisma.glossRequest.findMany(),
        }

        // Write to file
        fs.writeFileSync(backupPath, JSON.stringify(data, null, 2))

        // Get file size
        const stats = fs.statSync(backupPath)
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2)

        console.log(`✅ Prisma backup completed successfully!`)
        console.log(`📁 Backup location: ${backupPath}`)
        console.log(`📊 File size: ${fileSizeInMB} MB`)
        console.log(`⏰ Timestamp: ${timestamp}`)

        await prisma.$disconnect()
        return backupPath

    } catch (error) {
        console.error('❌ Prisma backup failed:', error)
        throw error
    }
}

async function backupDatabase() {
    try {
        console.log('Starting database backup...')

        const dbConfig = parseDatabaseUrl(databaseUrl)

        // Check if pg_dump is available
        const pgDumpAvailable = await checkPgDumpAvailable()

        if (!pgDumpAvailable) {
            console.log('⚠️  pg_dump not found. Using Prisma backup method...')
            return await backupWithPrisma()
        }

        // Create backup directory if it doesn't exist
        const backupDir = path.join(__dirname, '../backups')
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true })
        }

        // Generate backup filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const backupFilename = `backup_${timestamp}.sql`
        const backupPath = path.join(backupDir, backupFilename)

        // Set environment variables for pg_dump
        const env = {
            ...process.env,
            PGPASSWORD: dbConfig.password
        }

        // Build pg_dump command
        const pgDumpCommand = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -f "${backupPath}"`

        console.log(`Executing: ${pgDumpCommand.replace(dbConfig.password, '***')}`)

        // Execute backup
        exec(pgDumpCommand, { env }, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ pg_dump backup failed:', error)
                console.log('🔄 Trying Prisma backup method...')
                backupWithPrisma().catch(err => {
                    console.error('❌ All backup methods failed:', err)
                    process.exit(1)
                })
                return
            }

            if (stderr) {
                console.warn('⚠️  Backup warnings:', stderr)
            }

            // Get file size
            const stats = fs.statSync(backupPath)
            const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2)

            console.log(`✅ Backup completed successfully!`)
            console.log(`📁 Backup location: ${backupPath}`)
            console.log(`📊 File size: ${fileSizeInMB} MB`)
            console.log(`⏰ Timestamp: ${timestamp}`)

            // Create a symlink to the latest backup
            const latestBackupPath = path.join(backupDir, 'latest_backup.sql')
            if (fs.existsSync(latestBackupPath)) {
                fs.unlinkSync(latestBackupPath)
            }
            fs.symlinkSync(backupPath, latestBackupPath)

            console.log(`🔗 Latest backup symlink: ${latestBackupPath}`)
        })

    } catch (error) {
        console.error('Backup script failed:', error)
        process.exit(1)
    }
}

// Run backup
backupDatabase() 