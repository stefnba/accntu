#!/bin/bash

# =================================================================
# Accntu Health Check Script
# =================================================================
# Monitors application health and service status

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="deploy/docker-compose.prod.yml"
HEALTH_ENDPOINT="http://localhost:3000/api/health"
TIMEOUT=10
MAX_RETRIES=3

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Docker containers
check_containers() {
    print_status "Checking Docker containers..."
    echo ""
    
    if ! command_exists docker || ! command_exists docker-compose; then
        print_error "Docker or docker-compose not found"
        return 1
    fi
    
    # Get container status
    local containers=$(docker-compose -f "$COMPOSE_FILE" ps 2>/dev/null || echo "")
    
    if [[ -z "$containers" ]]; then
        print_error "No containers found. Is the application deployed?"
        return 1
    fi
    
    echo "$containers"
    echo ""
    
    # Check individual container health
    local all_healthy=true
    
    # Check app container
    if docker-compose -f "$COMPOSE_FILE" ps app 2>/dev/null | grep -q "Up"; then
        print_success "✓ Application container is running"
    else
        print_error "✗ Application container is not running"
        all_healthy=false
    fi
    
    # Check database container
    if docker-compose -f "$COMPOSE_FILE" ps db 2>/dev/null | grep -q "Up"; then
        print_success "✓ Database container is running"
    else
        print_error "✗ Database container is not running"
        all_healthy=false
    fi
    
    # Check Redis container (if exists)
    if docker-compose -f "$COMPOSE_FILE" ps redis 2>/dev/null | grep -q "Up"; then
        print_success "✓ Redis container is running"
    elif docker-compose -f "$COMPOSE_FILE" ps redis 2>/dev/null | grep -q "redis"; then
        print_error "✗ Redis container is not running"
        all_healthy=false
    fi
    
    echo ""
    return $([[ "$all_healthy" == true ]] && echo 0 || echo 1)
}

# Function to check application health endpoint
check_health_endpoint() {
    print_status "Checking application health endpoint..."
    
    local retry_count=0
    local success=false
    
    while [[ $retry_count -lt $MAX_RETRIES ]]; do
        if command_exists curl; then
            if response=$(curl -s --max-time "$TIMEOUT" "$HEALTH_ENDPOINT" 2>/dev/null); then
                success=true
                break
            fi
        elif command_exists wget; then
            if response=$(wget -qO- --timeout="$TIMEOUT" "$HEALTH_ENDPOINT" 2>/dev/null); then
                success=true
                break
            fi
        else
            print_error "Neither curl nor wget is available for health check"
            return 1
        fi
        
        ((retry_count++))
        if [[ $retry_count -lt $MAX_RETRIES ]]; then
            print_status "Health check attempt $retry_count failed, retrying..."
            sleep 2
        fi
    done
    
    if [[ "$success" == true ]]; then
        print_success "✓ Health endpoint is responding"
        echo ""
        
        # Parse and display health information
        if command_exists jq && echo "$response" | jq . >/dev/null 2>&1; then
            print_status "Health details:"
            echo "$response" | jq .
        else
            print_status "Health response:"
            echo "$response"
        fi
        echo ""
        return 0
    else
        print_error "✗ Health endpoint is not responding after $MAX_RETRIES attempts"
        return 1
    fi
}

# Function to check resource usage
check_resource_usage() {
    print_status "Checking resource usage..."
    echo ""
    
    if ! command_exists docker; then
        print_error "Docker not found, cannot check resource usage"
        return 1
    fi
    
    # Get container stats
    local stats=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}" 2>/dev/null | grep -E "(accntu|postgres|redis)" || echo "")
    
    if [[ -n "$stats" ]]; then
        echo "$stats"
        echo ""
        
        # Check for high resource usage
        local high_cpu=false
        local high_memory=false
        
        while IFS=$'\t' read -r container cpu memory mem_perc net_io block_io; do
            if [[ "$container" == "CONTAINER" ]]; then
                continue
            fi
            
            # Extract CPU percentage (remove % sign)
            local cpu_num=$(echo "$cpu" | sed 's/%//')
            if (( $(echo "$cpu_num > 80" | bc -l 2>/dev/null || echo 0) )); then
                print_warning "High CPU usage detected: $container ($cpu)"
                high_cpu=true
            fi
            
            # Extract memory percentage (remove % sign)
            local mem_num=$(echo "$mem_perc" | sed 's/%//')
            if (( $(echo "$mem_num > 85" | bc -l 2>/dev/null || echo 0) )); then
                print_warning "High memory usage detected: $container ($mem_perc)"
                high_memory=true
            fi
        done <<< "$stats"
        
        if [[ "$high_cpu" == false && "$high_memory" == false ]]; then
            print_success "✓ Resource usage is within normal limits"
        fi
    else
        print_warning "No container stats found"
    fi
    
    return 0
}

# Function to check disk space
check_disk_space() {
    print_status "Checking disk space..."
    
    local disk_usage=$(df -h . 2>/dev/null | tail -1 || echo "")
    
    if [[ -n "$disk_usage" ]]; then
        echo "$disk_usage"
        
        # Extract usage percentage
        local usage_percent=$(echo "$disk_usage" | awk '{print $5}' | sed 's/%//')
        
        if [[ $usage_percent -gt 90 ]]; then
            print_error "✗ Critical disk space: ${usage_percent}% used"
            return 1
        elif [[ $usage_percent -gt 80 ]]; then
            print_warning "⚠ High disk usage: ${usage_percent}% used"
        else
            print_success "✓ Disk space is adequate: ${usage_percent}% used"
        fi
    else
        print_warning "Could not determine disk usage"
    fi
    
    echo ""
    return 0
}

# Function to check database connectivity
check_database() {
    print_status "Checking database connectivity..."
    
    if ! docker-compose -f "$COMPOSE_FILE" ps db 2>/dev/null | grep -q "Up"; then
        print_error "✗ Database container is not running"
        return 1
    fi
    
    # Test database connection
    local db_user="${POSTGRES_USER:-accntu}"
    local db_name="${POSTGRES_DB:-accntu}"
    
    if docker-compose -f "$COMPOSE_FILE" exec -T db psql -U "$db_user" -d "$db_name" -c "SELECT 1;" >/dev/null 2>&1; then
        print_success "✓ Database is accessible"
    else
        print_error "✗ Database connection failed"
        return 1
    fi
    
    return 0
}

# Function to check logs for errors
check_logs() {
    print_status "Checking recent logs for errors..."
    echo ""
    
    # Check app logs for errors
    local app_errors=$(docker-compose -f "$COMPOSE_FILE" logs --tail=50 app 2>/dev/null | grep -i "error\|fatal\|exception" || echo "")
    
    if [[ -n "$app_errors" ]]; then
        print_warning "Recent errors found in application logs:"
        echo "$app_errors" | tail -5
        echo ""
    else
        print_success "✓ No recent errors in application logs"
    fi
    
    # Check database logs for errors
    local db_errors=$(docker-compose -f "$COMPOSE_FILE" logs --tail=50 db 2>/dev/null | grep -i "error\|fatal\|panic" || echo "")
    
    if [[ -n "$db_errors" ]]; then
        print_warning "Recent errors found in database logs:"
        echo "$db_errors" | tail -5
        echo ""
    else
        print_success "✓ No recent errors in database logs"
    fi
}

# Function to generate health report
generate_report() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local report_file="health_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Accntu Health Check Report"
        echo "=========================="
        echo "Generated: $timestamp"
        echo ""
        
        echo "Container Status:"
        docker-compose -f "$COMPOSE_FILE" ps 2>/dev/null || echo "No containers found"
        echo ""
        
        echo "Resource Usage:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" 2>/dev/null | grep -E "(CONTAINER|accntu|postgres|redis)" || echo "No stats available"
        echo ""
        
        echo "Disk Usage:"
        df -h . 2>/dev/null || echo "Disk usage unavailable"
        echo ""
        
        echo "Health Endpoint Response:"
        if command_exists curl; then
            curl -s --max-time "$TIMEOUT" "$HEALTH_ENDPOINT" 2>/dev/null || echo "Health endpoint unavailable"
        else
            echo "curl not available"
        fi
        echo ""
        
        echo "Recent Application Logs:"
        docker-compose -f "$COMPOSE_FILE" logs --tail=20 app 2>/dev/null || echo "No app logs available"
        
    } > "$report_file"
    
    print_success "Health report generated: $report_file"
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  check      Run all health checks (default)"
    echo "  containers Check container status only"
    echo "  endpoint   Check health endpoint only"
    echo "  resources  Check resource usage only"
    echo "  database   Check database connectivity only"
    echo "  logs       Check logs for errors only"
    echo "  report     Generate comprehensive health report"
    echo ""
    echo "Options:"
    echo "  --endpoint URL    Set custom health endpoint (default: $HEALTH_ENDPOINT)"
    echo "  --timeout SEC     Set request timeout (default: $TIMEOUT)"
    echo "  --retries NUM     Set max retries (default: $MAX_RETRIES)"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Run all checks"
    echo "  $0 endpoint                  # Check health endpoint only"
    echo "  $0 --timeout 20             # Use 20 second timeout"
    echo "  $0 report                   # Generate health report"
}

# Function to run all checks
run_all_checks() {
    local overall_status=0
    
    echo "=========================================="
    echo "Accntu Health Check - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "=========================================="
    echo ""
    
    # Run all checks
    check_containers || overall_status=1
    check_health_endpoint || overall_status=1
    check_resource_usage || overall_status=1
    check_disk_space || overall_status=1
    check_database || overall_status=1
    check_logs
    
    echo "=========================================="
    if [[ $overall_status -eq 0 ]]; then
        print_success "🎉 All health checks passed!"
    else
        print_error "❌ Some health checks failed"
    fi
    echo "=========================================="
    
    return $overall_status
}

# Main function
main() {
    local command="check"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            check|containers|endpoint|resources|database|logs|report)
                command="$1"
                shift
                ;;
            --endpoint)
                HEALTH_ENDPOINT="$2"
                shift 2
                ;;
            --timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            --retries)
                MAX_RETRIES="$2"
                shift 2
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    case $command in
        check)
            run_all_checks
            ;;
        containers)
            check_containers
            ;;
        endpoint)
            check_health_endpoint
            ;;
        resources)
            check_resource_usage
            ;;
        database)
            check_database
            ;;
        logs)
            check_logs
            ;;
        report)
            generate_report
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"