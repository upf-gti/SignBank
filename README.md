TODOS
- Edit Glosses
- Minimal Pairs relations to videos and not to entire gloss
- Delete Relations
- Edit Senses and delete

## How to change the app host

In the .env file, change the BASEURL to the domain you want to use for your app.
In the nginx.conf file, change the server_name directive to match the domain you want to use.

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

### Environment Configuration

Set the following environment variables in your `.env` file:

- `BASEURL`: The base URL of your application (e.g., `https://signbank.example.com`)
- Other variables as specified in schema.env file

### Nginx Configuration

The Nginx configuration is located in the `nginx/` directory. To update the configuration:

1. Edit the `nginx/nginx.conf` file, for test, local or production
2. Update the `server_name` directive to match your domain
4. Restart the Nginx container:

```bash
docker-compose restart nginx
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

Or if you don't have npm, you can execute this command from inside mongoDB container

Then restart backend container to sync all words into typesense

## Project Structure

- `frontend/` - The web client application
- `backend/` - API server
- `mongoDB/` - Database configuration and seed scripts
- `nginx/` - Nginx configuration for serving the application
- `FileServer/` - Server for file storage
- `typesense/` - Search engine configuration
- `certbot/` - SSL certificate management
