#!/bin/bash

# Copy keyfile to a writable location
cp /tmp/keyfile /data/keyfile
# Set correct permissions
chmod 400 /data/keyfile
# Start MongoDB with the keyfile
exec mongod --replSet rs0 --bind_ip_all --keyFile /data/keyfile 