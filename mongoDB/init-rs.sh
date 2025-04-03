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
mongod --dbpath /data/db --bind_ip_all --replSet rs0 &
MONGO_PID=$!

# Wait for MongoDB to start with replica set configuration
sleep 10

# Initialize the replica set
echo "Configuring replica set..."
mongosh admin -u root -p password --eval 'rs.initiate({
    _id: "rs0",
    members: [
        { _id: 0, host: "mongoDB:27017" }
    ]
})'

# Keep MongoDB running in the foreground
wait $MONGO_PID 