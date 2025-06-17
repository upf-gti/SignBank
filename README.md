
TODOS
- Remove quick info. 
- Si no hi ha trad de descripcio, amagar.
- Traduccions de SPANISH ENGLISH a traduccions
- Afegir video a la definicio
- Treure sortir de edicio quan estas editant una request
- Cambiar configuracio a configCat
- Config Lexica double titol al editar, arreglar
- Lexica pot estar buida
- Direccio Moviment FALTA
- Moviment repetit,  boolean
- Mute videos
- Al mes o i, canviar les lletres per el signe
- Traduccions de relacions
- Allow empty in configuration

## How to change the app host

In the .env file, change the BASEURL to the domain you want to use for your app.
In the nginx.conf file, change the server_name directive to match the domain you want to use.

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

## Local Development

To start the project locally:

```bash
docker-compose -f docker-compose-local.yaml build
docker-compose -f docker-compose-local.yaml up
```

## Production Deployment

To deploy the project in production mode:

```bash
docker-compose -f docker-compose-production.yaml build
docker-compose -f docker-compose-production.yaml up -d
```

-d is for running docker compose in detached mode, so you can still use the terminal.

The first time we run the application, we will need to create the database, so, while the docker compose is running we will go to /backend folder.

There we need a .env file with the following:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/signbank
```

Then, in the backend folder we will run:
```
npx prisma migrate dev
```

To create the databse.

Then to see if everything is working we can go to the url we set. 
Or we can go back to the project folder and run:

```
docker compose -f docker-compose-production.yaml down
docker-compose -f docker-compose-production.yaml up
```

## Project Structure

- `frontend/` - The web client application
- `backend/` - API server
- `mongoDB/` - Database configuration and seed scripts
- `nginx/` - Nginx configuration for serving the application
- `FileServer/` - Server for file storage
- `typesense/` - Search engine configuration
- `certbot/` - SSL certificate management
