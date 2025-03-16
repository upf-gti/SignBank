const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        // Create a test user
        const user = await prisma.users.create({
            data: {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                role: 'USER',
            },
        })

        // Create a test word
        const word = await prisma.words.create({
            data: {
                word: 'TEST',
                description: 'A test word',
                creatorId: user.id,
                status: 'PUBLISHED',
                isNative: true,
            },
        })

        // Create a test sense
        const sense = await prisma.sense.create({
            data: {
                definition: 'A definition for test',
                example: 'This is a test example',
                wordId: word.id,
            },
        })

        // Create a test translation
        const translation = await prisma.translation.create({
            data: {
                text: 'Test',
                language: 'ENGLISH',
                senseId: sense.id,
            },
        })

        console.log('Created test data successfully:')
        console.log('Word:', word)
        console.log('Sense:', sense)
        console.log('Translation:', translation)
    } catch (error) {
        console.error('Error creating test data:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main() 