const { Client } = require('typesense')
const { PrismaClient } = require('@prisma/client')

// Initialize Prisma client
const prisma = new PrismaClient()

// Initialize Typesense client
const typesense = new Client({
    nodes: [
        {
            host: 'localhost', // Your Typesense host
            port: 8108, // Your Typesense port
            protocol: 'http',
        },
    ],
    apiKey: 'xyz123',
    connectionTimeoutSeconds: 2,
})

async function setupTypesense() {
    try {
        console.log('Setting up Typesense collection for words...')

        // Define schema for words collection
        const schema = {
            name: 'words',
            fields: [
                { name: 'id', type: 'string' },
                { name: 'word', type: 'string', facet: false, sort: true },
                { name: 'description', type: 'string' },
                { name: 'createdAt', type: 'string', facet: true },
                { name: 'status', type: 'string', facet: true },
                { name: 'isNative', type: 'bool', facet: true },
                { name: 'creatorId', type: 'int32' },
                { name: 'creatorUsername', type: 'string' },
                { name: 'senseDefinitions', type: 'string[]' },
                { name: 'senseExamples', type: 'string[]' },
                { name: 'translations', type: 'string[]' },
            ],
            default_sorting_field: 'word',
        }

        // Delete collection if it exists
        try {
            await typesense.collections('words').retrieve()
            console.log('Existing collection found, deleting...')
            await typesense.collections('words').delete()
            console.log('Collection deleted')
        } catch (err) {
            console.log('No existing collection found or error:', err.message)
        }

        // Create the collection
        await typesense.collections().create(schema)
        console.log('Collection created successfully')

        // Query words from database with relations
        const words = await prisma.words.findMany({
            include: {
                creator: true,
                senses: {
                    include: {
                        Translation: true,
                    },
                },
            },
        })

        if (words.length === 0) {
            console.log('No words found in the database')
            return
        }

        console.log(`Found ${words.length} words in the database`)

        // Prepare documents for Typesense
        const documents = words.map(word => {
            // Extract sense-specific information
            const senseDefinitions = []
            const senseExamples = []
            const translations = []

            word.senses.forEach(sense => {
                if (sense.definition) senseDefinitions.push(sense.definition)
                if (sense.example) senseExamples.push(sense.example)

                // Add translations linked to this sense
                sense.Translation.forEach(translation => {
                    translations.push(`${translation.language}:${translation.text}`)
                })
            })

            return {
                id: word.id.toString(),
                word: word.word,
                description: word.description,
                createdAt: word.createdAt.toISOString(),
                status: word.status,
                isNative: word.isNative,
                creatorId: word.creatorId,
                creatorUsername: word.creator?.username,
                senseDefinitions,
                senseExamples,
                translations,
            }
        })

        // Import documents into Typesense
        await typesense
            .collections('words')
            .documents()
            .import(documents)

        console.log(`Successfully indexed ${documents.length} words in Typesense`)

        // Perform a test search
        const searchResults = await typesense
            .collections('words')
            .documents()
            .search({
                q: 'test',
                query_by: 'word,description,senseDefinitions',
            })

        console.log('Search results for "test":')
        console.log(JSON.stringify(searchResults, null, 2))
    } catch (error) {
        console.error('Error setting up Typesense:', error)
    } finally {
        await prisma.$disconnect()
    }
}

setupTypesense() 