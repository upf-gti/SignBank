// Configure the replica set
rsconf = {
    _id: "rs0",
    members: [
        { _id: 0, host: "mongoDB" },
        { _id: 1, host: "localhost" },
    ]
}

// Initialize the replica set
rs.initiate(rsconf)

// Create admin user after replica set is initialized
admin = db.getSiblingDB("admin")
admin.createUser({
    user: "root",
    pwd: "password",
    roles: [
        { role: "root", db: "admin" }
    ]
})

// Wait for the replica set to be initialized
while (!rs.isMaster().ismaster) {
    print("Waiting for replica set to be initialized...")
    sleep(10)
}

print("Replica set initialized successfully!") 