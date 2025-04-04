const { MongoClient } = require('mongodb')
const argon2 = require('argon2')

// Define constants to match your database schema
const Role = {
    ADMIN: 'ADMIN',
    USER: 'USER'
}

const Language = {
    CATALAN: 'CATALAN',
    ENGLISH: 'ENGLISH',
    SPANISH: 'SPANISH'
}

const LexicalCategory = {
    NOUN: 'NOUN',
    VERB: 'VERB',
    ADJECTIVE: 'ADJECTIVE',
    ADVERB: 'ADVERB',
    PRONOUN: 'PRONOUN',
    PREPOSITION: 'PREPOSITION',
    CONJUNCTION: 'CONJUNCTION',
    INTERJECTION: 'INTERJECTION',
    DETERMINER: 'DETERMINER',
    NUMERAL: 'NUMERAL'
}

const Hand = {
    RIGHT: 'RIGHT',
    LEFT: 'LEFT',
    BOTH: 'BOTH'
}

// Update WordStatus enum to exactly match what's in the Prisma schema
// These must match the values in your production schema.prisma file
const WordStatus = {
    PUBLISHED: 'PUBLISHED',
    ARCHIVED: 'ARCHIVED'
}

// Define collection names with correct capitalization to match Prisma's conventions
// This ensures consistency between development and production
const Collections = {
    WORDS: 'Words',                 // Capitalized to match Prisma's convention
    WORD_EDIT: 'WordEdit',          // Capitalized
    WORD_EDIT_HISTORIC: 'WordEditHistoric', // Capitalized
    WORD_REQUEST: 'WordRequest',     // Capitalized
    DIALECT: 'Dialect',             // Capitalized
    USERS: 'Users'                  // Capitalized
}

async function main() {
    // Replace with your MongoDB connection string
    const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/signbank'
    const client = new MongoClient(uri)

    try {
        // Connect to the MongoDB server
        await client.connect()
        console.log('Connected to MongoDB')

        // Get database reference
        const db = client.db()

        // Clean existing data
        try {
            console.log('Deleting existing data...')
            await db.collection(Collections.WORD_EDIT_HISTORIC).deleteMany({})
            await db.collection(Collections.WORD_EDIT).deleteMany({})
            await db.collection(Collections.WORD_REQUEST).deleteMany({})
            await db.collection(Collections.WORDS).deleteMany({})
            await db.collection(Collections.DIALECT).deleteMany({})
            await db.collection(Collections.USERS).deleteMany({})
            console.log('Deleted existing data')
        } catch (error) {
            console.error('Error cleaning up data:', error)
            // Continue with seeding even if cleanup fails
        }

        // Create users
        const adminPassword = await argon2.hash('admin123')
        const userPassword = await argon2.hash('user123')

        console.log('Creating users...')
        const admin = await db.collection(Collections.USERS).insertOne({
            username: 'admin',
            email: 'admin@signbank.com',
            password: adminPassword,
            role: Role.ADMIN,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        const user1 = await db.collection(Collections.USERS).insertOne({
            username: 'maria',
            email: 'maria@example.com',
            password: userPassword,
            role: Role.USER,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        const user2 = await db.collection(Collections.USERS).insertOne({
            username: 'jordi',
            email: 'jordi@example.com',
            password: userPassword,
            role: Role.USER,
            createdAt: new Date(),
            updatedAt: new Date()
        })
        console.log('Created users')

        // Create dialects
        console.log('Creating dialects...')
        const barcelonaDialect = await db.collection(Collections.DIALECT).insertOne({
            name: 'Barcelona',
            region: 'Catalonia',
            mapCoordinates: '41.3851,2.1734',
            description: 'The dialect of Catalan Sign Language used in Barcelona area',
            createdAt: new Date(),
            updatedAt: new Date()
        })

        const gironaDialect = await db.collection(Collections.DIALECT).insertOne({
            name: 'Girona',
            region: 'Catalonia',
            mapCoordinates: '41.9794,2.8214',
            description: 'The dialect of Catalan Sign Language used in Girona area',
            createdAt: new Date(),
            updatedAt: new Date()
        })
        console.log('Created dialects')

        // Create words
        console.log('Creating words...')

        // Words data array
        const wordsData = [
            {
                status: WordStatus.PUBLISHED,  // Ensure this matches exactly what your app expects
                currentVersion: 1,
                isCreatedFromRequest: false,
                isCreatedFromEdit: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                wordData: {
                    word: 'Cafe',
                    isNative: true,
                    register: 'Estàndard',
                    lexicalCategory: LexicalCategory.NOUN,
                    dominantHand: Hand.RIGHT,
                    facialExpression: 'Neutral',
                    hasContact: false,
                    senses: [
                        {
                            priority: 1,
                            dominantHand: Hand.RIGHT,
                            facialExpression: 'Neutral',
                            hasContact: true,
                            movementType: 'Moviment del signe Cafè',
                            nonManualComponents: 'Pronunciar Cafe',
                            morphologicalVariants: '-',
                            phonologicalTranscription: '-',
                            usageFrequency: 'Comú',
                            usageEra: 'Contemporani',
                            descriptions: [
                                {
                                    text: 'Arbret del gènere Coffea, de la família de les rubiàcies, conreat als països tropicals, de fulles lluents i flors blanques, els fruits del qual contenen ordinàriament dues llavors planoconvexes amb un solc al llarg de la cara plana.',
                                    examples: ['Als matins prenem un cafe', 'El meu amic beu cafe cada dia'],
                                    translations: [
                                        { text: 'Coffe', language: Language.ENGLISH },
                                        { text: 'Café', language: Language.SPANISH }
                                    ]
                                },
                                {
                                    text: 'Cafè moca Cafè: d\'una varietat procedent d\'Aràbia.',
                                    examples: [],
                                    translations: []
                                },
                                {
                                    text: 'Llavor del cafè: Torrar cafè. Cafè molt. Cafè descafeïnat.',
                                    examples: [],
                                    translations: []
                                },
                                {
                                    text: 'Cafè torrefacte: Cafè que ha estat barrejat amb sucre en torrar-lo.',
                                    examples: [],
                                    translations: []
                                },
                                {
                                    text: 'Beguda feta per infusió de les llavors de cafè torrades i moltes. Prendre cafè. Una tassa de cafè. Cafè amb llet.',
                                    examples: [],
                                    translations: []
                                }
                            ],
                            videos: [
                                {
                                    url: 'https://signbank.upf.com/images/LSC_-_Cafe.mp4',
                                    angle: 'Frontal',
                                    priority: 1
                                }
                            ]
                        }
                    ],
                    relatedWords: []
                }
            },
            {
                status: WordStatus.PUBLISHED,
                currentVersion: 1,
                isCreatedFromRequest: false,
                isCreatedFromEdit: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                wordData: {
                    word: 'Camell',
                    isNative: true,
                    register: 'Estàndard',
                    lexicalCategory: LexicalCategory.NOUN,
                    dominantHand: Hand.RIGHT,
                    facialExpression: 'Neutral',
                    hasContact: false,
                    senses: [
                        {
                            priority: 1,
                            dominantHand: Hand.RIGHT,
                            facialExpression: 'Neutral',
                            hasContact: true,
                            movementType: 'Moviment del signe camell',
                            nonManualComponents: 'Pronunciar Cafe',
                            morphologicalVariants: '-',
                            phonologicalTranscription: '-',
                            usageFrequency: 'Comú',
                            usageEra: 'Contemporani',
                            descriptions: [
                                {
                                    text: 'Mamífer artiodàctil del gènere Camelus, de la família dels camèlids, de dimensions grans i cos robust, amb potes llargues i primes i coll llarg, fort i flexible, que té al dors un o dos geps.',
                                    examples: ['El meu camell és molt gros'],
                                    translations: [
                                        { text: 'Camel', language: Language.ENGLISH },
                                        { text: 'Camell', language: Language.SPANISH }
                                    ]
                                },
                                {
                                    text: 'Persona que comercia amb droga a la menuda.',
                                    examples: ['El seu vei es camell'],
                                    translations: []
                                }
                            ],
                            videos: [
                                {
                                    url: 'https://signbank.upf.com/images/LSC_-_Camell.mp4',
                                    angle: 'Frontal',
                                    priority: 1
                                }
                            ]
                        }
                    ],
                    relatedWords: []
                }
            },
            {
                status: WordStatus.PUBLISHED,
                currentVersion: 1,
                isCreatedFromRequest: false,
                isCreatedFromEdit: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                wordData: {
                    word: 'Cames',
                    isNative: true,
                    register: 'Estàndard',
                    lexicalCategory: LexicalCategory.NOUN,
                    dominantHand: Hand.RIGHT,
                    facialExpression: 'Neutral',
                    hasContact: false,
                    senses: [
                        {
                            priority: 1,
                            dominantHand: Hand.RIGHT,
                            facialExpression: 'Neutral',
                            hasContact: true,
                            movementType: 'Moviment del signe cames',
                            nonManualComponents: 'Pronunciar Cames',
                            morphologicalVariants: '-',
                            phonologicalTranscription: '-',
                            usageFrequency: 'Comú',
                            usageEra: 'Contemporani',
                            descriptions: [
                                {
                                    text: 'Extremitat inferior del cos humà, que va des del genoll fins al peu.',
                                    examples: ['Les meves cames estan cansades', 'Té unes cames molt llargues'],
                                    translations: [
                                        { text: 'Legs', language: Language.ENGLISH },
                                        { text: 'Piernas', language: Language.SPANISH }
                                    ]
                                }
                            ],
                            videos: [
                                {
                                    url: 'https://signbank.upf.com/images/LSC_-_Cames.mp4',
                                    angle: 'Frontal',
                                    priority: 1
                                }
                            ]
                        }
                    ],
                    relatedWords: []
                }
            },
            {
                // Changed to match appropriate enum value
                status: WordStatus.DRAFT,
                currentVersion: 1,
                isCreatedFromRequest: false,
                isCreatedFromEdit: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                wordData: {
                    word: 'Cami',
                    isNative: true,
                    register: 'Estàndard',
                    lexicalCategory: LexicalCategory.NOUN,
                    dominantHand: Hand.RIGHT,
                    facialExpression: 'Neutral',
                    hasContact: false,
                    senses: [
                        {
                            priority: 1,
                            dominantHand: Hand.RIGHT,
                            facialExpression: 'Neutral',
                            hasContact: true,
                            movementType: 'Moviment del signe cami',
                            nonManualComponents: 'Pronunciar Cami',
                            morphologicalVariants: '-',
                            phonologicalTranscription: '-',
                            usageFrequency: 'Comú',
                            usageEra: 'Contemporani',
                            descriptions: [
                                {
                                    text: 'Via que es fa servir per anar d\'un lloc a un altre.',
                                    examples: ['El cami era molt llarg', 'Van perdre el cami'],
                                    translations: [
                                        { text: 'Path', language: Language.ENGLISH },
                                        { text: 'Camino', language: Language.SPANISH }
                                    ]
                                }
                            ],
                            videos: [
                                {
                                    url: 'https://signbank.upf.com/images/LSC_-_Cami.mp4',
                                    angle: 'Frontal',
                                    priority: 1
                                }
                            ]
                        }
                    ],
                    relatedWords: []
                }
            },
            {
                status: WordStatus.PUBLISHED,
                currentVersion: 1,
                isCreatedFromRequest: false,
                isCreatedFromEdit: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                wordData: {
                    word: 'Cap',
                    isNative: true,
                    register: 'Estàndard',
                    lexicalCategory: LexicalCategory.NOUN,
                    dominantHand: Hand.RIGHT,
                    facialExpression: 'Neutral',
                    hasContact: false,
                    senses: [
                        {
                            priority: 1,
                            dominantHand: Hand.RIGHT,
                            facialExpression: 'Neutral',
                            hasContact: true,
                            movementType: 'Moviment del signe cap (part del cos)',
                            nonManualComponents: 'Pronunciar Cap',
                            morphologicalVariants: '-',
                            phonologicalTranscription: '-',
                            usageFrequency: 'Comú',
                            usageEra: 'Contemporani',
                            descriptions: [
                                {
                                    text: 'Part superior del cos dels animals vertebrats que conté el cervell, els principals òrgans dels sentits i l\'extrem superior o anterior del tub digestiu.',
                                    examples: ['Em fa mal el cap', 'Va moure el cap'],
                                    translations: [
                                        { text: 'Head', language: Language.ENGLISH },
                                        { text: 'Cabeza', language: Language.SPANISH }
                                    ]
                                }
                            ],
                            videos: [
                                {
                                    url: 'https://signbank.upf.com/images/LSC_-_Cap.mp4',
                                    angle: 'Frontal',
                                    priority: 1
                                }
                            ]
                        },
                        {
                            priority: 2,
                            dominantHand: Hand.RIGHT,
                            facialExpression: 'Negació',
                            hasContact: false,
                            movementType: 'Moviment del signe cap (negació)',
                            nonManualComponents: 'Pronunciar Cap amb expressió de negació',
                            morphologicalVariants: '-',
                            phonologicalTranscription: '-',
                            usageFrequency: 'Comú',
                            usageEra: 'Contemporani',
                            descriptions: [
                                {
                                    text: 'Ni un, ningú, res; absència total.',
                                    examples: ['No hi ha cap persona', 'No en queda cap'],
                                    translations: [
                                        { text: 'None', language: Language.ENGLISH },
                                        { text: 'Ninguno', language: Language.SPANISH }
                                    ]
                                }
                            ],
                            videos: [
                                {
                                    url: 'https://signbank.upf.com/images/LSC_-_Cap.mp4',
                                    angle: 'Frontal',
                                    priority: 1
                                }
                            ]
                        }
                    ],
                    relatedWords: []
                }
            },
            {
                status: WordStatus.PUBLISHED,
                currentVersion: 1,
                isCreatedFromRequest: false,
                isCreatedFromEdit: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                wordData: {
                    word: 'Capa',
                    isNative: true,
                    register: 'Estàndard',
                    lexicalCategory: LexicalCategory.NOUN,
                    dominantHand: Hand.RIGHT,
                    facialExpression: 'Neutral',
                    hasContact: false,
                    senses: [
                        {
                            priority: 1,
                            dominantHand: Hand.RIGHT,
                            facialExpression: 'Neutral',
                            hasContact: true,
                            movementType: 'Moviment del signe capa',
                            nonManualComponents: 'Pronunciar Capa',
                            morphologicalVariants: '-',
                            phonologicalTranscription: '-',
                            usageFrequency: 'Comú',
                            usageEra: 'Contemporani',
                            descriptions: [
                                {
                                    text: 'Peça de roba llarga, folgada, oberta de davant, sense mànigues, que es porta tirada a les espatlles cobrint el vestit.',
                                    examples: ['Porta una capa negra', 'La capa el protegia del fred'],
                                    translations: [
                                        { text: 'Cape', language: Language.ENGLISH },
                                        { text: 'Capa', language: Language.SPANISH }
                                    ]
                                }
                            ],
                            videos: [
                                {
                                    url: 'https://signbank.upf.com/images/LSC_-_Capa.mp4',
                                    angle: 'Frontal',
                                    priority: 1
                                }
                            ]
                        }
                    ],
                    relatedWords: []
                }
            },
            {
                status: WordStatus.PUBLISHED,
                currentVersion: 1,
                isCreatedFromRequest: false,
                isCreatedFromEdit: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                wordData: {
                    word: 'Car',
                    isNative: true,
                    register: 'Estàndard',
                    lexicalCategory: LexicalCategory.ADJECTIVE,
                    dominantHand: Hand.RIGHT,
                    facialExpression: 'Neutral',
                    hasContact: false,
                    senses: [
                        {
                            priority: 1,
                            dominantHand: Hand.RIGHT,
                            facialExpression: 'Neutral',
                            hasContact: true,
                            movementType: 'Moviment del signe car',
                            nonManualComponents: 'Pronunciar Car',
                            morphologicalVariants: '-',
                            phonologicalTranscription: '-',
                            usageFrequency: 'Comú',
                            usageEra: 'Contemporani',
                            descriptions: [
                                {
                                    text: 'Que té un preu elevat, que costa molt de diners.',
                                    examples: ['Aquest cotxe és molt car', 'El pis era massa car'],
                                    translations: [
                                        { text: 'Expensive', language: Language.ENGLISH },
                                        { text: 'Caro', language: Language.SPANISH }
                                    ]
                                }
                            ],
                            videos: [
                                {
                                    url: 'https://signbank.upf.com/images/LSC_-_Car.mp4',
                                    angle: 'Frontal',
                                    priority: 1
                                }
                            ]
                        }
                    ],
                    relatedWords: []
                }
            },
            {
                status: WordStatus.PUBLISHED,
                currentVersion: 1,
                isCreatedFromRequest: false,
                isCreatedFromEdit: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                wordData: {
                    word: 'Cara',
                    isNative: true,
                    register: 'Estàndard',
                    lexicalCategory: LexicalCategory.NOUN,
                    dominantHand: Hand.RIGHT,
                    facialExpression: 'Neutral',
                    hasContact: false,
                    senses: [
                        {
                            priority: 1,
                            dominantHand: Hand.RIGHT,
                            facialExpression: 'Neutral',
                            hasContact: true,
                            movementType: 'Moviment del signe cara',
                            nonManualComponents: 'Pronunciar Cara',
                            morphologicalVariants: '-',
                            phonologicalTranscription: '-',
                            usageFrequency: 'Comú',
                            usageEra: 'Contemporani',
                            descriptions: [
                                {
                                    text: 'Part anterior del cap, on hi ha els ulls, el nas i la boca.',
                                    examples: ['Té una cara molt expressiva', 'Es va rentar la cara'],
                                    translations: [
                                        { text: 'Face', language: Language.ENGLISH },
                                        { text: 'Cara', language: Language.SPANISH }
                                    ]
                                }
                            ],
                            videos: [
                                {
                                    url: 'https://signbank.upf.com/images/LSC_-_Cara_1.mp4',
                                    angle: 'Frontal',
                                    priority: 1
                                },
                                {
                                    url: 'https://signbank.upf.com/images/LSC_-_Cara_2.mp4',
                                    angle: 'Frontal',
                                    priority: 2
                                }
                            ]
                        }
                    ],
                    relatedWords: []
                }
            },
            {
                status: WordStatus.PUBLISHED,
                currentVersion: 1,
                isCreatedFromRequest: false,
                isCreatedFromEdit: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                wordData: {
                    word: 'Casa',
                    isNative: true,
                    register: 'Estàndard',
                    lexicalCategory: LexicalCategory.NOUN,
                    dominantHand: Hand.RIGHT,
                    facialExpression: 'Neutral',
                    hasContact: false,
                    senses: [
                        {
                            priority: 1,
                            dominantHand: Hand.RIGHT,
                            facialExpression: 'Neutral',
                            hasContact: true,
                            movementType: 'Moviment del signe casa',
                            nonManualComponents: 'Pronunciar Casa',
                            morphologicalVariants: '-',
                            phonologicalTranscription: '-',
                            usageFrequency: 'Comú',
                            usageEra: 'Contemporani',
                            descriptions: [
                                {
                                    text: 'Edifici destinat a l\'habitatge de persones.',
                                    examples: ['Viu en una casa gran', 'La casa té un jardí'],
                                    translations: [
                                        { text: 'House', language: Language.ENGLISH },
                                        { text: 'Casa', language: Language.SPANISH }
                                    ]
                                }
                            ],
                            videos: [
                                {
                                    url: 'https://signbank.upf.com/images/LSC_-_Casa.mp4',
                                    angle: 'Frontal',
                                    priority: 1
                                }
                            ]
                        }
                    ],
                    relatedWords: []
                }
            },
            {
                status: WordStatus.PUBLISHED,
                currentVersion: 1,
                isCreatedFromRequest: false,
                isCreatedFromEdit: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                wordData: {
                    word: 'Casat',
                    isNative: true,
                    register: 'Estàndard',
                    lexicalCategory: LexicalCategory.NOUN,
                    dominantHand: Hand.RIGHT,
                    facialExpression: 'Neutral',
                    hasContact: false,
                    senses: [
                        {
                            priority: 1,
                            dominantHand: Hand.RIGHT,
                            facialExpression: 'Neutral',
                            hasContact: true,
                            movementType: 'Moviment del signe casat',
                            nonManualComponents: 'Pronunciar Casat',
                            morphologicalVariants: '-',
                            phonologicalTranscription: '-',
                            usageFrequency: 'Comú',
                            usageEra: 'Contemporani',
                            descriptions: [
                                {
                                    text: 'Estat de tenir un cònjuge o una cònjuge.',
                                    examples: ['Està casat amb una persona meravellosa', 'El seu estat civil és casat'],
                                    translations: [
                                        { text: 'Married', language: Language.ENGLISH },
                                        { text: 'Casado', language: Language.SPANISH }
                                    ]
                                }
                            ],
                            videos: [
                                {
                                    url: 'https://signbank.upf.com/images/LSC_-_Casat_casada.mp4',
                                    angle: 'Frontal',
                                    priority: 1
                                }
                            ]
                        }
                    ],
                    relatedWords: []
                }
            },
            {
                status: WordStatus.PUBLISHED,
                currentVersion: 1,
                isCreatedFromRequest: false,
                isCreatedFromEdit: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                wordData: {
                    word: 'Dur',
                    isNative: true,
                    register: 'Estàndard',
                    lexicalCategory: LexicalCategory.ADJECTIVE,
                    dominantHand: Hand.RIGHT,
                    facialExpression: 'Neutral',
                    hasContact: false,
                    senses: [
                        {
                            priority: 1,
                            dominantHand: Hand.RIGHT,
                            facialExpression: 'Neutral',
                            hasContact: true,
                            movementType: 'Moviment del signe dur',
                            nonManualComponents: 'Pronunciar Dur',
                            morphologicalVariants: '-',
                            phonologicalTranscription: '-',
                            usageFrequency: 'Comú',
                            usageEra: 'Contemporani',
                            descriptions: [
                                {
                                    text: 'Que té una consistència ferma o difícil de trencar.',
                                    examples: ['El material és molt dur', 'El gel és dur'],
                                    translations: [
                                        { text: 'Hard', language: Language.ENGLISH },
                                        { text: 'Duro', language: Language.SPANISH }
                                    ]
                                }
                            ],
                            videos: [
                                {
                                    url: 'https://signbank.upf.com/images/LSC_-_Dur_dura.mp4',
                                    angle: 'Frontal',
                                    priority: 1
                                }
                            ]
                        }
                    ],
                    relatedWords: []
                }
            },
            {
                status: WordStatus.PUBLISHED,
                currentVersion: 1,
                isCreatedFromRequest: false,
                isCreatedFromEdit: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                wordData: {
                    word: 'Xocolata',
                    isNative: true,
                    register: 'Estàndard',
                    lexicalCategory: LexicalCategory.NOUN,
                    dominantHand: Hand.RIGHT,
                    facialExpression: 'Neutral',
                    hasContact: false,
                    senses: [
                        {
                            priority: 1,
                            dominantHand: Hand.RIGHT,
                            facialExpression: 'Neutral',
                            hasContact: true,
                            movementType: 'Moviment del signe xocolata',
                            nonManualComponents: 'Pronunciar Xocolata',
                            morphologicalVariants: '-',
                            phonologicalTranscription: '-',
                            usageFrequency: 'Comú',
                            usageEra: 'Contemporani',
                            descriptions: [
                                {
                                    text: 'Producte alimentari obtingut a partir de la fruita del cacau, que es pot consumir en diverses formes, com a beguda o en forma sòlida.',
                                    examples: ["M'agrada la xocolata negra", "La xocolata és dolça"],
                                    translations: [
                                        { text: 'Chocolate', language: Language.ENGLISH },
                                        { text: 'Chocolate', language: Language.SPANISH }
                                    ]
                                }
                            ],
                            videos: [
                                {
                                    url: 'https://signbank.upf.com/images/LSC_-_Xocolata.mp4',
                                    angle: 'Frontal',
                                    priority: 1
                                }
                            ]
                        }
                    ],
                    relatedWords: []
                }
            }
        ]

        // Insert all words - now using the capitalized collection name
        const result = await db.collection(Collections.WORDS).insertMany(wordsData)

        // Verify that words were inserted using the correct collection name
        console.log(`Inserted ${result.insertedCount} words`)

        // Check if words can be found - using capitalized collection name
        const wordCount = await db.collection(Collections.WORDS).countDocuments()
        console.log(`Total words in "${Collections.WORDS}" collection: ${wordCount}`)

        // Check if published words can be found
        const publishedWordCount = await db.collection(Collections.WORDS).countDocuments({ status: WordStatus.PUBLISHED })
        console.log(`Published words in database: ${publishedWordCount}`)

        // Check for any collection called "words" (lowercase) - this might help troubleshoot
        try {
            const lowerWordCount = await db.collection('words').countDocuments()
            console.log(`WARNING: Found ${lowerWordCount} words in lowercase "words" collection. This might cause confusion.`)
        } catch (e) {
            console.log('No lowercase "words" collection found - good!')
        }

        // List all collections to verify
        const collections = await db.listCollections().toArray()
        console.log('All collections in database:')
        collections.forEach(coll => console.log(` - ${coll.name}`))

        console.log('Created words with new schema structure')
        console.log('Seeding finished.')
    } catch (error) {
        console.error('Error during seeding:', error)
        process.exit(1)
    } finally {
        // Close the connection
        await client.close()
        console.log('MongoDB connection closed')
    }
}

// Run the main function
main().catch(console.error) 