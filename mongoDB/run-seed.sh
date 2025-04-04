#!/bin/bash

# This script runs the MongoDB seeding script for SignBank

# Check for MongoDB connection string
if [ -z "$DATABASE_URL" ]; then
  echo "Warning: DATABASE_URL environment variable is not set."
  echo "Using default connection string: mongodb://localhost:27017/signbank"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run the seed script
echo "Starting database seed..."
node seed-mongodb.js

# Check exit status
if [ $? -eq 0 ]; then
  echo "Seed completed successfully!"
else
  echo "Seed failed. See error message above."
  exit 1
fi 