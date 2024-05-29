#!make
include .env

# Python setup with poetry
ifeq ($(PY_VERSION),)
PY_VERSION := 3.12.2
endif
ifeq ($(PY_MAJOR_VERSION),)
PY_MAJOR_VERSION := 3.12
endif

setup:
	export POETRY_VIRTUALENVS_IN_PROJECT=true
	poetry init --python ^${PY_MAJOR_VERSION} -n
	pyenv local ${PY_VERSION}
	poetry env use ${PY_VERSION}
	poetry run poetry add --group dev black ruff mypy

activate:
	poetry shell


install:
	poetry env use ${PY_VERSION}
	poetry install


# Start server
dev:
	uvicorn app.main:app --reload


# Docker
docker-up:
	docker compose -f docker/docker-compose.yml --project-directory . up -d --build --force-recreate --remove-orphans