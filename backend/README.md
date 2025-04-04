# SignBank Backend

This directory contains the API server for the SignBank application built with NestJS.

## Setup and Configuration

### Prisma ORM Setup

To initialize and configure Prisma:

```bash
# Deploy database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## Development

To start the backend in development mode:

```bash
# Install dependencies
npm install

# Start the development server
npm run start:dev
```

## Docker

The backend can be run in Docker containers:

- For local development: `Dockerfile.local`
- For production: `Dockerfile.prod`

These are typically managed through the root docker-compose configuration.

## Environment Variables

The backend requires environment variables for configuration. Copy the `.env.example` file (if available) to `.env` and adjust the values as needed.

Key variables include:
- Database connection strings
- API keys
- Authentication settings
