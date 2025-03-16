const { spawn } = require('child_process')

console.log('Running Prisma seed script...')

// Execute the Prisma seed command
const seedProcess = spawn('npx', ['prisma', 'db', 'seed'], {
    stdio: 'inherit',
    shell: true
})

seedProcess.on('close', (code) => {
    if (code === 0) {
        console.log('Database seeded successfully!')
    } else {
        console.error(`Seed process exited with code ${code}`)
    }
}) 