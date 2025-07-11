const fs = require('fs')
const path = require('path')

// Read the backup file
const backupPath = path.join(__dirname, '../backups/HardMigrate.json')
const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'))

console.log('Starting video migration...')

// Create a map of senseId to glossDataId for quick lookup
const senseToGlossDataMap = new Map()
backupData.senses.forEach(sense => {
    senseToGlossDataMap.set(sense.id, sense.glossDataId)
})

console.log(`Found ${senseToGlossDataMap.size} senses to process`)

// Process signVideos: remove senseId and add glossDataId
const updatedSignVideos = backupData.signVideos.map(signVideo => {
    const glossDataId = senseToGlossDataMap.get(signVideo.senseId)

    if (!glossDataId) {
        console.warn(`Warning: No glossDataId found for senseId ${signVideo.senseId}`)
        return signVideo // Keep original if no mapping found
    }

    // Create new signVideo object without senseId and with glossDataId
    const updatedSignVideo = {
        ...signVideo,
        glossDataId: glossDataId
    }

    // Remove senseId property
    delete updatedSignVideo.senseId

    return updatedSignVideo
})

// Update the backup data
backupData.signVideos = updatedSignVideos

// Write the updated data back to the file
const outputPath = path.join(__dirname, '../backups/HardMigrate.json')
fs.writeFileSync(outputPath, JSON.stringify(backupData, null, 2))

console.log(`Migration completed!`)
console.log(`- Processed ${backupData.signVideos.length} signVideos`)
console.log(`- Updated file: ${outputPath}`)

// Print some statistics
const glossDataVideoCounts = new Map()
updatedSignVideos.forEach(signVideo => {
    const count = glossDataVideoCounts.get(signVideo.glossDataId) || 0
    glossDataVideoCounts.set(signVideo.glossDataId, count + 1)
})

console.log('\nVideos per glossData:')
glossDataVideoCounts.forEach((count, glossDataId) => {
    const glossData = backupData.glossData.find(g => g.id === glossDataId)
    const glossName = glossData ? glossData.gloss : 'Unknown'
    console.log(`- ${glossName} (${glossDataId}): ${count} videos`)
}) 