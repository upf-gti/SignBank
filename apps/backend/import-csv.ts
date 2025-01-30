import { PrismaClient } from '@prisma/client';
import * as csv from 'csv-parser';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const filePath = './dict.csv'; // Path to your CSV file

    const words = [];

    // Read the CSV file
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            words.push({
                word: row.word,
                description: row.definition,
                videoUrl: '',
            });
        })
        .on('end', async () => {
            console.log(`Parsed ${words.length} words from CSV.`);

            // Insert data into the database
            try {
                const result = await prisma.words.createMany({
                    data: words,
                    skipDuplicates: true, // Avoid inserting duplicates
                });
                console.log(`Successfully added ${result.count} words to the database.`);
            } catch (error) {
                console.error('Error inserting words into the database:', error);
            } finally {
                await prisma.$disconnect();
            }
        });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
