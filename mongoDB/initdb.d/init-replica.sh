#!/bin/bash
# Wait for MongoDB to start
sleep 15

echo "Starting MongoDB replica set initialization..."

# Initialize replica set
echo "Initializing replica set..."
mongosh --eval "rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] })"

# Wait a moment
sleep 5

echo "MongoDB replica set initialized successfully!" 