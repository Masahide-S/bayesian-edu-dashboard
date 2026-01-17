.PHONY: help install-backend install-frontend install build-backend build-frontend build run-backend run-frontend run docker-build docker-up docker-down test clean

help:
	@echo "Bayesian Education Dashboard - Makefile Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install          - Install all dependencies (backend + frontend)"
	@echo "  make install-backend  - Install backend dependencies"
	@echo "  make install-frontend - Install frontend dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make run             - Run both backend and frontend (requires 2 terminals)"
	@echo "  make run-backend     - Run backend server"
	@echo "  make run-frontend    - Run frontend dev server"
	@echo ""
	@echo "Build:"
	@echo "  make build           - Build both backend and frontend"
	@echo "  make build-backend   - Build backend binary"
	@echo "  make build-frontend  - Build frontend for production"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build    - Build Docker images"
	@echo "  make docker-up       - Start containers"
	@echo "  make docker-down     - Stop containers"
	@echo ""
	@echo "Data:"
	@echo "  make generate-data   - Generate dummy grades data"
	@echo ""
	@echo "Testing:"
	@echo "  make test            - Run all tests"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean           - Clean build artifacts"

install: install-backend install-frontend

install-backend:
	@echo "Installing backend dependencies..."
	cd backend && go mod download

install-frontend:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

build: build-backend build-frontend

build-backend:
	@echo "Building backend..."
	cd backend && go build -o bin/server ./cmd/server/main.go

build-frontend:
	@echo "Building frontend..."
	cd frontend && npm run build

run-backend:
	@echo "Starting backend server on http://localhost:8080..."
	cd backend && go run cmd/server/main.go

run-frontend:
	@echo "Starting frontend dev server on http://localhost:3000..."
	cd frontend && npm start

generate-data:
	@echo "Generating dummy grades data..."
	python3 generate_data.py

docker-build:
	@echo "Building Docker images..."
	docker-compose build

docker-up:
	@echo "Starting Docker containers..."
	docker-compose up -d

docker-down:
	@echo "Stopping Docker containers..."
	docker-compose down

test:
	@echo "Running backend tests..."
	cd backend && go test -v ./...
	@echo "Running frontend tests..."
	cd frontend && npm test -- --watchAll=false

clean:
	@echo "Cleaning build artifacts..."
	rm -rf backend/bin
	rm -rf frontend/build
	rm -rf frontend/node_modules
	@echo "Clean complete!"
