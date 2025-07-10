#!/bin/bash

# =================================================================
# Accntu Database Backup Script
# =================================================================
# Creates backups of PostgreSQL database with retention management

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="deploy/docker-compose.prod.yml"
BACKUP_DIR="./backups"
RETENTION_DAYS=30
MAX_BACKUPS=50

# Default database settings (can be overridden by environment)
DEFAULT_DB_USER="accntu"
DEFAULT_DB_NAME="accntu"

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

# Function to check if database container is running
check_database() {
    print_status "Checking database container..."
    
    if ! docker-compose -f "$COMPOSE_FILE" ps db | grep -q "Up"; then
        print_error "Database container is not running"
        print_status "Start the database with: docker-compose -f $COMPOSE_FILE up -d db"
        exit 1
    fi
    
    print_success "Database container is running"
}

# Function to create backup directory
create_backup_dir() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        mkdir -p "$BACKUP_DIR"
        print_status "Created backup directory: $BACKUP_DIR"
    fi
}

# Function to create database backup
create_backup() {
    local backup_type="$1"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/${backup_type}_backup_$timestamp.sql"
    
    # Get database credentials from environment or use defaults
    local db_user="${POSTGRES_USER:-$DEFAULT_DB_USER}"
    local db_name="${POSTGRES_DB:-$DEFAULT_DB_NAME}"
    
    print_status "Creating $backup_type backup..."
    print_status "Database: $db_name"
    print_status "User: $db_user"
    print_status "Output: $backup_file"
    
    # Create backup based on type
    case $backup_type in
        "full")
            # Full database backup with schema and data
            if docker-compose -f "$COMPOSE_FILE" exec -T db pg_dump \
                -U "$db_user" \
                -d "$db_name" \
                --verbose \
                --clean \
                --create \
                --if-exists > "$backup_file"; then
                print_success "Full backup created successfully"
            else
                print_error "Full backup failed"
                rm -f "$backup_file"
                exit 1
            fi
            ;;
        "schema")
            # Schema-only backup
            if docker-compose -f "$COMPOSE_FILE" exec -T db pg_dump \
                -U "$db_user" \
                -d "$db_name" \
                --schema-only \
                --verbose \
                --clean \
                --create \
                --if-exists > "$backup_file"; then
                print_success "Schema backup created successfully"
            else
                print_error "Schema backup failed"
                rm -f "$backup_file"
                exit 1
            fi
            ;;
        "data")
            # Data-only backup
            if docker-compose -f "$COMPOSE_FILE" exec -T db pg_dump \
                -U "$db_user" \
                -d "$db_name" \
                --data-only \
                --verbose > "$backup_file"; then
                print_success "Data backup created successfully"
            else
                print_error "Data backup failed"
                rm -f "$backup_file"
                exit 1
            fi
            ;;
        *)
            print_error "Unknown backup type: $backup_type"
            exit 1
            ;;
    esac
    
    # Compress backup if it's large
    local file_size=$(stat -c%s "$backup_file" 2>/dev/null || stat -f%z "$backup_file" 2>/dev/null || echo 0)
    if [[ $file_size -gt 10485760 ]]; then # 10MB
        print_status "Compressing large backup file..."
        gzip "$backup_file"
        backup_file="${backup_file}.gz"
        print_success "Backup compressed: $backup_file"
    fi
    
    # Show backup info
    local final_size=$(stat -c%s "$backup_file" 2>/dev/null || stat -f%z "$backup_file" 2>/dev/null || echo 0)
    local size_mb=$((final_size / 1024 / 1024))
    
    print_success "Backup completed:"
    echo "  File: $backup_file"
    echo "  Size: ${size_mb}MB"
    echo "  Type: $backup_type"
}

# Function to verify backup integrity
verify_backup() {
    local backup_file="$1"
    
    print_status "Verifying backup integrity..."
    
    # Check if file exists and is not empty
    if [[ ! -f "$backup_file" ]] || [[ ! -s "$backup_file" ]]; then
        print_error "Backup file is empty or does not exist"
        return 1
    fi
    
    # For compressed files, test compression integrity
    if [[ "$backup_file" == *.gz ]]; then
        if gzip -t "$backup_file"; then
            print_success "Compressed backup integrity verified"
        else
            print_error "Compressed backup is corrupted"
            return 1
        fi
    fi
    
    # Basic SQL syntax check (for uncompressed files)
    if [[ "$backup_file" == *.sql ]]; then
        if head -n 10 "$backup_file" | grep -q "PostgreSQL database dump"; then
            print_success "Backup format verified"
        else
            print_warning "Backup format could not be verified"
        fi
    fi
    
    return 0
}

# Function to cleanup old backups
cleanup_old_backups() {
    print_status "Cleaning up old backups..."
    
    local deleted_count=0
    
    # Remove backups older than retention period
    if command -v find >/dev/null; then
        local old_files=$(find "$BACKUP_DIR" -name "*_backup_*.sql*" -type f -mtime +$RETENTION_DAYS 2>/dev/null || true)
        if [[ -n "$old_files" ]]; then
            echo "$old_files" | while read -r file; do
                rm -f "$file"
                ((deleted_count++))
                print_status "Removed old backup: $(basename "$file")"
            done
        fi
    fi
    
    # Keep only the most recent backups if we exceed max count
    local backup_count=$(ls -1 "$BACKUP_DIR"/*_backup_*.sql* 2>/dev/null | wc -l || echo 0)
    if [[ $backup_count -gt $MAX_BACKUPS ]]; then
        print_status "Too many backups ($backup_count), keeping only the most recent $MAX_BACKUPS"
        ls -1t "$BACKUP_DIR"/*_backup_*.sql* | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -f
        ((deleted_count += backup_count - MAX_BACKUPS))
    fi
    
    if [[ $deleted_count -gt 0 ]]; then
        print_success "Cleaned up $deleted_count old backup(s)"
    else
        print_status "No old backups to clean up"
    fi
}

# Function to list existing backups
list_backups() {
    print_status "Existing backups:"
    echo ""
    
    if [[ ! -d "$BACKUP_DIR" ]] || [[ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]]; then
        print_warning "No backups found in $BACKUP_DIR"
        return
    fi
    
    # List backups with details
    printf "%-20s %-15s %-10s %s\n" "DATE" "TYPE" "SIZE" "FILE"
    printf "%-20s %-15s %-10s %s\n" "----" "----" "----" "----"
    
    for backup in "$BACKUP_DIR"/*_backup_*.sql*; do
        if [[ -f "$backup" ]]; then
            local basename=$(basename "$backup")
            local date_part=$(echo "$basename" | sed 's/.*_backup_\([0-9_]*\)\.sql.*/\1/')
            local type_part=$(echo "$basename" | sed 's/\(.*\)_backup_.*/\1/')
            local size=$(stat -c%s "$backup" 2>/dev/null || stat -f%z "$backup" 2>/dev/null || echo 0)
            local size_mb=$((size / 1024 / 1024))
            
            # Format date for display
            local display_date=$(echo "$date_part" | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)_\([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\1-\2-\3 \4:\5:\6/')
            
            printf "%-20s %-15s %-10s %s\n" "$display_date" "$type_part" "${size_mb}MB" "$basename"
        fi
    done
}

# Function to restore from backup
restore_backup() {
    local backup_file="$1"
    
    if [[ ! -f "$backup_file" ]]; then
        print_error "Backup file does not exist: $backup_file"
        exit 1
    fi
    
    print_warning "WARNING: This will restore the database and may overwrite existing data!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [[ "$confirm" != "yes" ]]; then
        print_status "Restore cancelled"
        exit 0
    fi
    
    local db_user="${POSTGRES_USER:-$DEFAULT_DB_USER}"
    local db_name="${POSTGRES_DB:-$DEFAULT_DB_NAME}"
    
    print_status "Restoring from backup: $backup_file"
    
    # Handle compressed files
    if [[ "$backup_file" == *.gz ]]; then
        if gunzip -c "$backup_file" | docker-compose -f "$COMPOSE_FILE" exec -T db psql -U "$db_user" -d "$db_name"; then
            print_success "Database restored successfully from compressed backup"
        else
            print_error "Database restore failed"
            exit 1
        fi
    else
        if docker-compose -f "$COMPOSE_FILE" exec -T db psql -U "$db_user" -d "$db_name" < "$backup_file"; then
            print_success "Database restored successfully"
        else
            print_error "Database restore failed"
            exit 1
        fi
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  create [TYPE]    Create a backup (TYPE: full, schema, data - default: full)"
    echo "  list             List existing backups"
    echo "  cleanup          Remove old backups according to retention policy"
    echo "  restore FILE     Restore database from backup file"
    echo "  verify FILE      Verify backup file integrity"
    echo ""
    echo "Options:"
    echo "  --retention-days DAYS    Set retention period in days (default: $RETENTION_DAYS)"
    echo "  --max-backups COUNT     Set maximum number of backups to keep (default: $MAX_BACKUPS)"
    echo "  --backup-dir DIR        Set backup directory (default: $BACKUP_DIR)"
    echo "  --help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 create                # Create full backup"
    echo "  $0 create schema         # Create schema-only backup"
    echo "  $0 list                  # List all backups"
    echo "  $0 cleanup               # Clean old backups"
    echo "  $0 restore backup.sql    # Restore from backup"
}

# Main function
main() {
    local command="create"
    local backup_type="full"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            create|list|cleanup|restore|verify)
                command="$1"
                shift
                ;;
            full|schema|data)
                backup_type="$1"
                shift
                ;;
            --retention-days)
                RETENTION_DAYS="$2"
                shift 2
                ;;
            --max-backups)
                MAX_BACKUPS="$2"
                shift 2
                ;;
            --backup-dir)
                BACKUP_DIR="$2"
                shift 2
                ;;
            --help)
                show_help
                exit 0
                ;;
            -*)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
            *)
                # Assume it's a file for restore/verify commands
                backup_file="$1"
                shift
                ;;
        esac
    done
    
    case $command in
        create)
            check_database
            create_backup_dir
            create_backup "$backup_type"
            verify_backup "$BACKUP_DIR"/*_backup_*.sql* | tail -1
            cleanup_old_backups
            ;;
        list)
            list_backups
            ;;
        cleanup)
            cleanup_old_backups
            ;;
        restore)
            if [[ -z "${backup_file:-}" ]]; then
                print_error "Please specify a backup file to restore"
                exit 1
            fi
            check_database
            restore_backup "$backup_file"
            ;;
        verify)
            if [[ -z "${backup_file:-}" ]]; then
                print_error "Please specify a backup file to verify"
                exit 1
            fi
            verify_backup "$backup_file"
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