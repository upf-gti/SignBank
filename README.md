# SignBank

A modern fullstack platform for sign language management and search.

- **Frontend:** Quasar (Vue.js)
- **Backend:** NestJS (Node.js)
- **Database:** PostgreSQL
- **Search Engine:** Typesense
- **Proxy/SSL:** NGINX
- **Orchestration:** Docker & Docker Compose

---

## 🧠 Project Overview

SignBank is a platform for managing, searching, and administering sign language glossaries, with advanced search and multimedia support. The system is designed for secure production deployment using HTTPS and a decoupled architecture.

---

## 🔧 Prerequisites

- Docker
- Docker Compose
- Node.js (only if you want to run services outside Docker)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/youruser/SignBank.git
cd SignBank
```

### 2. Configure environment variables

Copy the example file and edit as needed:

```bash
cp schema.env .env
```

- Set your domain in `.env` and configure it in the NGINX config files (`nginx/default.conf` or in production).

- In order to create the DB for the first time, it is also needed to have an .env file in ./backend folder

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/signbank
```


### 3. Start the services

```bash
docker-compose -f docker-compose-local.yaml up --build
```

- For production, use `docker-compose-production.yaml` and ensure you have valid SSL certificates in `nginx/certs/`.

### 4. Access the services

- **Frontend:** https://<your-domain>/
- **Backend API:** https://<your-domain>/api

---

## 🛠 Project Structure


```
SignBank/
├── backend/         # NestJS API
├── frontend/        # Quasar (Vue.js) client
├── nginx/           # NGINX configuration and SSL
├── typesense/       # Typesense config (if needed)
├── docker-compose-local.yaml
├── docker-compose-production.yaml
└── README.md
```

---


## 🧹 Maintenance

- Rebuild containers:
  ```bash
  docker-compose down -v --remove-orphans
  docker-compose build
  ```
- Clean Docker cache:
  ```bash
  docker system prune -a
  ```

---

## 🔐 Security

- Never hardcode the Typesense API key.
- Use HTTPS in production (configure NGINX and SSL certificates).
- Control access via backend authentication.

---

## 📦 Deployment

- Use Docker volumes for persistent DB and Typesense data.
- Open required ports: 443 (HTTPS).
- Use valid SSL certificates (e.g., Let’s Encrypt) in `nginx/certs/`.

---

## 📄 API Documentation

> API documentation will be provided in the future.  
> See `backend/README.md` for endpoints and authentication details.

---

## 🧩 Component Documentation

Each main folder contains its own `README.md` for technical details:

- [`backend/README.md`](./backend/README.md): Endpoints, authentication, Typesense integration, etc.
- [`frontend/README.md`](./frontend/README.md): Framework, structure, communication with backend, etc.
- [`nginx/README.md`](./nginx/README.md): Reverse proxy, SSL, routing.
- [`typesense/README.md`](./typesense/README.md): Collections, schema, data import.

---

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
