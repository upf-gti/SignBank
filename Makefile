COMPOSE_LOCAL  = docker compose -f docker-compose-local.yaml
COMPOSE_TEST   = docker compose -f docker-compose-test.yaml
COMPOSE_PROD   = docker compose -f docker-compose-production.yaml
CERT_CRT       = nginx/certs/server.crt
CERT_KEY       = nginx/certs/server.key

.PHONY: setup up down build logs seed migrate clean rebuild shell help check-certs

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

check-certs: ## Verify local SSL certs exist for nginx
	@test -f "$(CERT_CRT)" && test -f "$(CERT_KEY)" || ( \
		echo "Missing nginx certs. Expected files:" && \
		echo "  - $(CERT_CRT)" && \
		echo "  - $(CERT_KEY)" && \
		echo "" && \
		echo "Generate local self-signed certs with (Git Bash):" && \
		echo "MSYS_NO_PATHCONV=1 openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout $(CERT_KEY) -out $(CERT_CRT) -subj '/CN=localhost'" && \
		echo "" && \
		echo "Or in PowerShell:" && \
		echo "openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout $(CERT_KEY) -out $(CERT_CRT) -subj '/CN=localhost'" && \
		exit 1 )

setup: check-certs ## First-time setup: copy .env, build, and start everything
	@test -f .env || cp .env.example .env
	@echo "--- .env file ready (edit it if needed) ---"
	$(COMPOSE_LOCAL) build
	$(COMPOSE_LOCAL) up -d
	@echo "--- SignBank is starting. Run 'make logs' to follow progress ---"

up: check-certs ## Start the local environment
	$(COMPOSE_LOCAL) up -d

down: ## Stop the local environment
	$(COMPOSE_LOCAL) down

build: ## Rebuild all containers
	$(COMPOSE_LOCAL) build

logs: ## Tail logs for all services
	$(COMPOSE_LOCAL) logs -f

seed: ## Run the database seed script
	$(COMPOSE_LOCAL) exec backend npx prisma db seed

migrate: ## Run pending database migrations
	$(COMPOSE_LOCAL) exec backend npx prisma migrate deploy

clean: ## Stop everything and remove all volumes (full reset)
	$(COMPOSE_LOCAL) down -v
	@echo "--- All containers stopped and volumes removed ---"

rebuild: ## Rebuild and restart a specific service (usage: make rebuild s=backend)
	@test -n "$(s)" || (echo "Usage: make rebuild s=<service>" && exit 1)
	$(COMPOSE_LOCAL) build $(s)
	$(COMPOSE_LOCAL) up --no-deps -d --force-recreate $(s)

shell: ## Open a shell inside a service (usage: make shell s=backend)
	@test -n "$(s)" || (echo "Usage: make shell s=<service>" && exit 1)
	$(COMPOSE_LOCAL) exec $(s) sh

# --- Test and Production targets ---

test-up: ## Start the test environment
	$(COMPOSE_TEST) up -d --build

test-down: ## Stop the test environment
	$(COMPOSE_TEST) down

prod-up: ## Start the production environment
	$(COMPOSE_PROD) up -d --build

prod-down: ## Stop the production environment
	$(COMPOSE_PROD) down
