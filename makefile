#!make

# Docker
# We must include the .env file for postgres since postgres init scripts needs it on build time
docker-up:
	docker compose --env-file services/postgres/.env up -d --build --force-recreate --remove-orphans
	
	
docker-test-prod:
	docker compose --project-directory . --env-file services/app/.env -f deploy/docker-compose.yml -f docker/docker-compose.test.yml up -d --build --force-recreate --remove-orphans

docker-up-dev-db:
	docker compose -f docker/docker-compose.dev.yml up -d --build --force-recreate --remove-orphans