#!/bin/bash

# =================================================================
# Accntu Production Deployment Script
# =================================================================
# This script automates the deployment process for production

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="accntu"
COMPOSE_FILE="deploy/docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="./backups"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        exit 1
    fi
    
    # Check if docker-compose is available
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed or not in PATH"
        exit 1
    fi
    
    # Check if environment file exists
    if [[ ! -f "$ENV_FILE" ]]; then
        print_warning "Environment file $ENV_FILE not found"
        print_status "Copying from template..."
        cp deploy/.env.production.template "$ENV_FILE"
        print_warning "Please update $ENV_FILE with your production values before continuing"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to create backup
create_backup() {
    print_status "Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Create database backup if container is running
    if docker-compose -f "$COMPOSE_FILE" ps db | grep -q "Up"; then
        BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
        docker-compose -f "$COMPOSE_FILE" exec -T db pg_dump -U "${POSTGRES_USER:-accntu}" "${POSTGRES_DB:-accntu}" > "$BACKUP_FILE"
        print_success "Database backup created: $BACKUP_FILE"
    else
        print_warning "Database container not running, skipping backup"
    fi
}

# Function to deploy application
deploy_application() {
    print_status "Starting deployment..."
    
    # Pull latest images if not building locally
    print_status "Pulling base images..."
    docker-compose -f "$COMPOSE_FILE" pull --ignore-pull-failures
    
    # Build and start services
    print_status "Building and starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d --build --remove-orphans
    
    # Wait for services to be healthy
    print_status "Waiting for services to be healthy..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose -f "$COMPOSE_FILE" ps | grep -q "healthy\|Up"; then
            print_success "Services are healthy"
            break
        elif [[ $attempt -eq $max_attempts ]]; then
            print_error "Services failed to become healthy within timeout"
            docker-compose -f "$COMPOSE_FILE" logs --tail=50
            exit 1
        else
            print_status "Attempt $attempt/$max_attempts - waiting for services..."
            sleep 10
            ((attempt++))
        fi
    done
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait for database to be ready
    sleep 5
    
    if docker-compose -f "$COMPOSE_FILE" exec -T app bun run db:migrate; then
        print_success "Database migrations completed"
    else
        print_error "Database migrations failed"
        exit 1
    fi
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check if containers are running
    if ! docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        print_error "Some containers are not running"
        docker-compose -f "$COMPOSE_FILE" ps
        exit 1
    fi
    
    # Check health endpoint
    sleep 10
    if curl -f -s http://localhost:3000/api/health > /dev/null; then
        print_success "Health check passed"
    else
        print_error "Health check failed"
        print_status "Application logs:"
        docker-compose -f "$COMPOSE_FILE" logs --tail=20 app
        exit 1
    fi
    
    print_success "Deployment verification completed"
}

# Function to show deployment status
show_status() {
    print_status "Deployment Status:"
    echo ""
    
    # Show running containers
    print_status "Running containers:"
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    
    # Show resource usage
    print_status "Resource usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
    echo ""
    
    # Show logs
    print_status "Recent logs (last 10 lines):"
    docker-compose -f "$COMPOSE_FILE" logs --tail=10
}

# Function to cleanup old images
cleanup() {
    print_status "Cleaning up old images..."
    
    # Remove dangling images
    if docker images -f "dangling=true" -q | wc -l | grep -q "^0"; then
        print_status "No dangling images to remove"
    else
        docker rmi $(docker images -f "dangling=true" -q) || true
        print_success "Removed dangling images"
    fi
    
    # Remove old backups (keep last 5)
    if [[ -d "$BACKUP_DIR" ]]; then
        find "$BACKUP_DIR" -name "backup_*.sql" -type f | sort -r | tail -n +6 | xargs -r rm
        print_success "Cleaned up old backups"
    fi
}

# Main deployment process
main() {
    print_status "Starting Accntu production deployment..."
    echo ""
    
    # Parse command line arguments
    SKIP_BACKUP=false
    SKIP_MIGRATIONS=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --skip-migrations)
                SKIP_MIGRATIONS=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-backup      Skip database backup"
                echo "  --skip-migrations  Skip database migrations"
                echo "  --help            Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run deployment steps
    check_prerequisites
    
    if [[ "$SKIP_BACKUP" != true ]]; then
        create_backup
    fi
    
    deploy_application
    
    if [[ "$SKIP_MIGRATIONS" != true ]]; then
        run_migrations
    fi
    
    verify_deployment
    cleanup
    show_status
    
    echo ""
    print_success "🚀 Deployment completed successfully!"
    print_status "Application is available at: http://localhost:3000"
    print_status "Health check: http://localhost:3000/api/health"
    echo ""
    print_status "Next steps:"
    echo "  1. Configure your reverse proxy/load balancer"
    echo "  2. Set up SSL certificates"
    echo "  3. Configure monitoring and alerting"
    echo "  4. Set up automated backups"
}

# Trap errors and cleanup
trap 'print_error "Deployment failed at line $LINENO"' ERR

# Run main function
main "$@"