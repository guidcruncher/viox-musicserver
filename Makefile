## Variables
IMAGE_NAME := guidcruncher/viox-musicserver
CONTAINER_NAME := viox-musicserver
DOCKER_COMPOSE := docker compose
DOCKER_RUN := docker run --rm -v $(PWD):/app -w /app

.PHONY: help publish dev up down shell migrate

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

## Docker Operations
publish: ## Build the Docker image
	docker buildx build \
		--file ./Dockerfile \
		--tag docker.io/$(IMAGE_NAME):latest \
		--tag docker.io/$(IMAGE_NAME):$(ARGS) \
		--progress=plain \
		--push \
		.

dev: ## Runs a development environemnt
	${DOCKER_COMPOSE} -f ./docker-compose.yml down
	${DOCKER_COMPOSE} -f ./docker-compose.yml rm -f
	${DOCKER_COMPOSE} -f ./docker-compose.yml build --no-cache
	${DOCKER_COMPOSE} -f ./docker-compose.yml up -d
	${DOCKER_COMPOSE} -f ./docker-compose.yml logs -f

up: ## Start the containers using docker-compose
	$(DOCKER_COMPOSE) up -d

down: ## Stop and remove containers
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) rm -f
	${DOCKER_COMPOSE} -f ./docker-compose.yml rm -f

shell: ## Run a bash shell inside the container
	docker exec -it $(CONTAINER_NAME) bash

migrate: ## Run DBMate database migrations
	$(DOCKER_COMPOSE) -f ./docker-compose.yml up dbmate

