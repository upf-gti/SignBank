import * as fs from 'fs';
import * as path from 'path';
import { PhonologyDimension, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type PhonologyCatalogDefault = {
  dimension: PhonologyDimension;
  code: string;
  labelCa: string;
  labelEn: string | null;
  labelEs: string | null;
  descriptionCa: string | null;
  descriptionEn: string | null;
  descriptionEs: string | null;
  aliases: string[];
  sortOrder: number;
};

function loadDefaults(): PhonologyCatalogDefault[] {
  const candidates = [
    path.join(__dirname, 'phonology-catalog.defaults.json'),
    path.join(process.cwd(), 'src/phonology-values/phonology-catalog.defaults.json'),
    path.join(process.cwd(), 'dist/phonology-values/phonology-catalog.defaults.json'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return JSON.parse(fs.readFileSync(candidate, 'utf8')) as PhonologyCatalogDefault[];
    }
  }
  throw new Error(`phonology-catalog.defaults.json not found. Tried: ${candidates.join(', ')}`);
}

export async function ensurePhonologyCatalog(
  prisma: PrismaClient | PrismaService,
): Promise<number> {
  const defaults = loadDefaults();
  const existing = await prisma.phonologyValue.findMany({
    select: { dimension: true, code: true },
  });
  const have = new Set(existing.map((row) => `${row.dimension}:${row.code}`));
  const missing = defaults.filter((row) => !have.has(`${row.dimension}:${row.code}`));
  if (missing.length === 0) return 0;

  await prisma.phonologyValue.createMany({ data: missing });
  return missing.length;
}
