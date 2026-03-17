COMPOSE_LOCAL  = docker compose -f docker-compose-local.yaml
COMPOSE_TEST   = docker compose -f docker-compose-test.yaml
COMPOSE_PROD   = docker compose -f docker-compose-production.yaml

.PHONY: setup up down build logs seed migrate clean rebuild shell help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: ## First-time setup: copy .env, build, and start everything
	@test -f .env || cp .env.example .env
	@echo "--- .env file ready (edit it if needed) ---"
	$(COMPOSE_LOCAL) build
	$(COMPOSE_LOCAL) up -d
	@echo "--- SignBank is starting. Run 'make logs' to follow progress ---"

up: ## Start the local environment
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
