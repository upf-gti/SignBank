#!/bin/bash

echo "Initializing MongoDB replica set..."

# Start MongoDB without --replSet for initial setup
mongod --dbpath /data/db --bind_ip_all &
MONGO_PID=$!

# Wait for MongoDB to start
sleep 10

# Create root user
echo "Creating root user..."
mongosh admin --eval "db.createUser({user: 'root', pwd: 'password', roles: [{role: 'root', db: 'admin'}]})"

# Stop MongoDB
kill $MONGO_PID
wait $MONGO_PID

# Start MongoDB with replica set
echo "Starting MongoDB with replica set..."
exec mongod --dbpath /data/db --bind_ip_all --replSet rs0 