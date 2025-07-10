# Accntu Production Deployment Guide

This directory contains production-optimized deployment configurations for Accntu, specifically designed for Coolify VPS deployment.

## 🚀 Quick Start for Coolify

### 1. Prerequisites

- Coolify instance running on your VPS
- Domain name pointed to your VPS
- PostgreSQL database (can be deployed via Coolify)

### 2. Deployment Steps

1. **Clone Repository in Coolify**

    ```bash
    # Add your Git repository to Coolify
    # Use the main branch for production deployment
    ```

2. **Environment Configuration**

    ```bash
    # Copy and configure environment variables
    cp deploy/.env.production.template .env.production
    # Edit .env.production with your production values
    ```

3. **Deploy with Coolify**
    - Use `deploy/docker-compose.coolify.yml` as your docker-compose file
    - Set build context to repository root
    - Configure environment variables through Coolify UI

## 📁 File Structure

```
deploy/
├── README.md                          # This documentation
├── Dockerfile.prod                    # Production-optimized Dockerfile
├── docker-compose.prod.yml           # Full production stack
├── docker-compose.coolify.yml        # Coolify-specific configuration
├── .env.production.template          # Production environment template
├── scripts/                          # Deployment automation scripts
│   ├── deploy.sh                     # Deployment script
│   ├── backup.sh                     # Database backup script
│   └── health-check.sh               # Health monitoring script
└── docs/                             # Additional documentation
    ├── SECURITY.md                   # Security best practices
    ├── MONITORING.md                 # Monitoring setup
    └── TROUBLESHOOTING.md            # Common issues and solutions
```

## 🐳 Docker Configurations

### Production Dockerfile (`Dockerfile.prod`)

**Optimizations:**

- ✅ Multi-stage build for smaller images (~300MB vs ~1GB)
- ✅ Alpine Linux base for security and size
- ✅ Non-root user for enhanced security
- ✅ Health checks built-in
- ✅ Proper signal handling with dumb-init
- ✅ DuckDB native bindings support

### Docker Compose Variants

**`docker-compose.prod.yml`** - Full production stack:

- Application server with resource limits
- PostgreSQL with optimized settings
- Redis for caching (optional)
- Volume management for persistence
- Security hardening (read-only filesystem, security opts)

**`docker-compose.coolify.yml`** - Coolify optimized:

- Simplified configuration for Coolify platform
- External database support
- Volume management for uploads
- Health check integration

## 🔧 Configuration

### Environment Variables

Critical production variables:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Authentication
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# Email
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_api_key
```

### Resource Requirements

**Minimum VPS Specifications:**

- **CPU**: 1 vCPU
- **RAM**: 1GB (2GB recommended)
- **Storage**: 20GB SSD
- **Network**: 1Gbps

**Production Resource Limits:**

- **App Container**: 512MB RAM, 0.5 CPU
- **Database**: 256MB RAM, 0.25 CPU
- **Redis**: 64MB RAM, 0.1 CPU

## 🔒 Security Features

### Container Security

- ✅ Non-root user execution
- ✅ Read-only root filesystem
- ✅ Security options (`no-new-privileges`)
- ✅ Resource limits to prevent DoS
- ✅ Health checks for service monitoring

### Application Security

- ✅ Environment variable validation
- ✅ HTTPS enforcement (via Coolify reverse proxy)
- ✅ Database connection encryption
- ✅ Secure headers configuration

## 📊 Monitoring & Health Checks

### Health Endpoint

```bash
# Application health check
curl https://yourdomain.com/api/health

# Response format:
{
  "status": "healthy",
  "timestamp": "2025-01-07T15:30:00.000Z",
  "uptime": 3600,
  "services": {
    "database": "connected",
    "application": "running"
  }
}
```

### Docker Health Checks

- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 40 seconds

## 🚀 Deployment Automation

### Using Deployment Scripts

```bash
# Deploy to production
./deploy/scripts/deploy.sh

# Create database backup
./deploy/scripts/backup.sh

# Check application health
./deploy/scripts/health-check.sh
```

### Manual Deployment

```bash
# Build and deploy with docker-compose
docker-compose -f deploy/docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f deploy/docker-compose.prod.yml logs -f app

# Scale application (if needed)
docker-compose -f deploy/docker-compose.prod.yml up -d --scale app=2
```

## 🔄 Database Management

### Migrations

```bash
# Run database migrations
docker-compose exec app bun run db:migrate

# Seed production data (if needed)
docker-compose exec app bun run db:seed
```

### Backups

```bash
# Create backup
./deploy/scripts/backup.sh

# Restore from backup
docker-compose exec db psql -U accntu_user -d accntu_prod < backup.sql
```

## 🐛 Troubleshooting

### Common Issues

**Container won't start:**

```bash
# Check logs
docker-compose logs app

# Common causes:
# - Missing environment variables
# - Database connection issues
# - Port conflicts
```

**Health check failing:**

```bash
# Test health endpoint manually
curl http://localhost:3000/api/health

# Check database connectivity
docker-compose exec app bun run db:push
```

**High memory usage:**

```bash
# Monitor container resources
docker stats

# Adjust resource limits in docker-compose.yml
```

## 📝 Production Checklist

Before deploying to production:

- [ ] Update all environment variables in `.env.production`
- [ ] Configure domain and SSL in Coolify
- [ ] Set up database with proper credentials
- [ ] Configure email provider (Resend/SMTP)
- [ ] Set up GitHub OAuth app for production domain
- [ ] Test health endpoints
- [ ] Configure monitoring and alerting
- [ ] Set up automated backups
- [ ] Review security settings
- [ ] Test deployment process

## 🆘 Support

For deployment issues:

1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Test database connectivity
4. Review [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

For application issues:

1. Check health endpoint: `/api/health`
2. Review application logs
3. Verify external service connectivity
4. Check resource usage

## 📚 Additional Resources

- [Security Best Practices](docs/SECURITY.md)
- [Monitoring Setup](docs/MONITORING.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- [Coolify Documentation](https://coolify.io/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
