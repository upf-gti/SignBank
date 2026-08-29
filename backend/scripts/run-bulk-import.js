const { readdirSync, readFileSync } = require('fs');
const { join } = require('path');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/src/app.module');
const { BulkImportService } = require('../dist/src/bulk-import/bulk-import.service');

async function main() {
  const dir = process.argv[2] || join(__dirname, '../src/bulk-import/fixtures');
  const overwriteAll = process.argv[3] === 'true';

  const files = readdirSync(dir)
    .filter((name) => name.toLowerCase().endsWith('.json'))
    .map((name) => ({
      originalname: name,
      buffer: readFileSync(join(dir, name)),
    }));

  if (!files.length) {
    throw new Error(`No JSON files found in ${dir}`);
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const importer = app.get(BulkImportService);
  const result = await importer.importFiles(files, overwriteAll);
  console.log(JSON.stringify(result, null, 2));
  await app.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
