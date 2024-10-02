#!make

# Docker
# We must include the .env file for postgres since postgres init scripts needs it on build time
docker-up:
	docker compose -f docker-compose.yml --project-directory . up -d --build --force-recreate --remove-orphans