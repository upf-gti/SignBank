# SignBank MongoDB Seeding

This folder contains scripts to populate a MongoDB database with initial data for the SignBank application. These scripts are intended for testing purposes.

## Prerequisites

- Node.js (v14 or higher)
- npm
- MongoDB server running locally or remotely

## Setup

1. Make sure you have MongoDB running
2. Install the dependencies:
   ```
   npm install
   ```

## Seeding the Database

There are two ways to seed the database:

### 1. Using npm

```bash
npm run seed
```

### 2. Using the shell script

Make the script executable first:

```bash
chmod +x run-seed.sh
```

Then run it:

```bash
./run-seed.sh
```

## Configuration

By default, the script connects to MongoDB at `mongodb://localhost:27017/signbank`. 

To use a different connection string, set the `DATABASE_URL` environment variable:

```bash
DATABASE_URL=mongodb://username:password@your-mongo-host:27017/signbank ./run-seed.sh
```

Or with npm:

```bash
DATABASE_URL=mongodb://username:password@your-mongo-host:27017/signbank npm run seed
```

## What Gets Seeded?

The script populates the database with:

1. User accounts:
   - Admin user (username: `admin`, password: `admin123`)
   - Regular users (username: `maria` and `jordi`, password: `user123`)

2. Dialects:
   - Barcelona
   - Girona

3. Words:
   - Several sample words with their definitions, translations, and videos

## Note for Testers

This is a testing tool and the data is simplified for development purposes. In a production environment, a more robust seeding mechanism would be used.

Create keyfile in mongoDB folder for replica set
openssl rand -base64 756 > mongoDB/keyfile && chmod 400 mongoDB/keyfile