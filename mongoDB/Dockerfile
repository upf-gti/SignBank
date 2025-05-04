FROM mongo:latest

# Install Node.js and npm
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Copy seeding files
COPY package*.json ./
COPY seed-mongodb.js ./

# Install dependencies and run seed script during build
RUN npm install && \
    mongod --fork --logpath /var/log/mongodb.log && \
    sleep 10 && \
    node seed-mongodb.js && \
    mongod --shutdown

# Start MongoDB
CMD ["mongod", "--bind_ip_all"] 