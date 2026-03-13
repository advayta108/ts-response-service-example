# Quick targets (Bun + Next). Default: dev
SHELL := /bin/sh
BUN ?= bun

.PHONY: all install dev build test migrate seed deploy vercel docker-up docker-down

.DEFAULT_GOAL := dev

all: dev

install:
	$(BUN) install

migrate:
	$(BUN) run db:migrate

seed:
	$(BUN) run db:seed

test:
	$(BUN) test tests

dev: install migrate
	$(BUN) run dev

build: install migrate
	$(BUN) run build

# Local stack (SQLite in volume)
deploy: docker-up

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

# Vercel CLI (you run login / link locally)
vercel:
	vercel --prod
