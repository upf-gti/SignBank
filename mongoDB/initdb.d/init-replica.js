// This script initializes the replica set
rs.initiate({
    _id: "rs0",
    members: [
        { _id: 0, host: "mongoDB:27017" }
    ]
})

// Wait for the replica set to be initialized
while (!rs.isMaster().ismaster) {
    print("Waiting for replica set to be initialized...")
    sleep(1000)
}

print("Replica set initialized successfully!") 