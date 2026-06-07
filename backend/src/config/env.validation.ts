export function validateEnvironment(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'TYPESENSE_API_KEY',
    'TYPESENSE_HOST',
    'TYPESENSE_PORT',
    'DUFS_URL',
  ];

  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables in production: ${missing.join(', ')}`,
    );
  }

  if (process.env.JWT_SECRET!.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
}

export function getCorsOrigins(): string[] {
  const baseUrl = process.env.BASE_URL || 'localhost';
  const origins = new Set<string>();
  const isProduction = process.env.NODE_ENV === 'production';

  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    origins.add(baseUrl);
  } else {
    origins.add(`https://${baseUrl}`);
    if (!isProduction) {
      origins.add(`http://${baseUrl}`);
    }
  }

  if (!isProduction) {
    origins.add('https://localhost');
    origins.add('http://localhost');
  }

  return [...origins];
}
