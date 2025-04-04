TODOS
- Unit testing
- Code coverage
- Integration testing

## Local Development

To start the project locally:

```bash
docker-compose -f docker-compose-local.yaml build
docker-compose -f docker-compose-local.yaml up
```

## Production Deployment

To deploy the project in production mode:

```bash
docker-compose -f docker-compose-production.yaml up
```

## Seeding the Database

To seed the database with initial data:

1. Navigate to the MongoDB folder:

```bash
cd mongoDB
```

2. Install dependencies and run the seed script:

```bash
npm install
npm run seed
```

## Project Structure

- `frontend/` - The web client application
- `backend/` - API server
- `mongoDB/` - Database configuration and seed scripts
- `nginx/` - Nginx configuration for serving the application
- `FileServer/` - Server for file storage
- `typesense/` - Search engine configuration
- `certbot/` - SSL certificate management
