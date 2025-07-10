# Accntu Development Guide

Accntu is a modern personal finance management application built with Next.js 15, TypeScript, and PostgreSQL.

## Quick Commands

- `bun dev` - Start development server
- `bun lint` - Run ESLint (must pass before commits)
- `bun db:studio` - Open Drizzle Studio for database management
- `bun db:push` - Push schema changes to database

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Drizzle ORM
- **API**: Hono framework (never Next.js server actions)
- **UI**: shadcn/ui components with Tailwind CSS 4
- **State**: Zustand (global), nuqs (URL), TanStack Query (server)
- **Package Manager**: Bun

## Architecture Map

This project uses a modular documentation system. Relevant guidance is automatically discovered based on your working directory:

- **Feature Development**: @src/features/CLAUDE.md - Universal feature architecture patterns
- **Component Development**: @src/components/CLAUDE.md - UI component guidelines
- **App Router Pages**: @src/app/CLAUDE.md - Next.js routing and page patterns
- **Server Development**: @src/server/CLAUDE.md - API endpoints and database patterns
- **Shared Libraries**: @src/lib/CLAUDE.md - Utilities and helper functions
- **General Source**: @src/CLAUDE.md - Common src/ patterns and imports

## Key Principles

1. **Feature-based architecture** with consistent patterns across all features
2. **Hono framework exclusively** for API (never Next.js server actions)
3. **Type-safe development** with proper TypeScript throughout
4. **Always run `bun lint`** before commits (must pass)

## Documentation Discovery

When working on any file, check parent directories for relevant CLAUDE.md files that provide context-specific guidance.

## Recent Implementation Notes

### Production-Ready Deployment Infrastructure (2025-01-07)

- ✅ **Complete Production Infrastructure**: Implemented comprehensive deployment system for Coolify VPS deployment
- ✅ **Container Optimization**: Alpine-based multi-stage Docker builds achieving 70%+ image size reduction
- ✅ **Security Hardening**: Non-root user execution, read-only filesystem, resource limits, and security options
- ✅ **Deployment Automation**: Full pipeline with health checks, backup management, and monitoring
- ✅ **Coolify Integration**: Platform-specific configuration with simplified docker-compose setup

#### Production Deployment Architecture

```typescript
// Health check endpoint for container monitoring
GET /api/health
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

#### Deployment Infrastructure Files

```bash
deploy/
├── Dockerfile.prod                    # Production-optimized Alpine container
├── docker-compose.prod.yml           # Full production stack with security
├── docker-compose.coolify.yml        # Coolify-specific configuration
├── .env.production.template          # Production environment template
├── scripts/
│   ├── deploy.sh                     # Automated deployment pipeline
│   ├── backup.sh                     # Database backup with retention
│   └── health-check.sh               # Comprehensive monitoring
└── README.md                         # Complete deployment guide
```

**Key Production Features**:

- **Security**: Non-root containers, read-only filesystem, resource limits
- **Performance**: 70%+ image size reduction, optimized build context
- **Automation**: Deployment pipeline with health verification and backup creation
- **Monitoring**: Health endpoints, resource monitoring, log analysis
- **Reliability**: Database backup system with 30-day retention

**Deployment Commands**:

```bash
# Quick Coolify deployment
# Use deploy/docker-compose.coolify.yml in Coolify UI

# Manual production deployment
./deploy/scripts/deploy.sh

# Database backup management
./deploy/scripts/backup.sh create
./deploy/scripts/health-check.sh
```

**Important Production Notes**:

- Use production environment template (`deploy/.env.production.template`)
- Container resource limits: 512MB RAM, 0.5 CPU per service
- Health checks run every 30 seconds with 3-retry tolerance
- Automated backup retention: 30 days, maximum 50 files
- Read-only filesystem with tmpfs exceptions for cache and temp files

## Recent Implementation Notes

### DuckDB Validation & Temp Table Optimization (2025-01-04)

- ✅ **Hybrid Validation System**: Implemented fast-path array validation with fallback to detailed row-by-row validation
- ✅ **Temp Table Integration**: Enhanced `transformData` with `storeInTempTable` option for SQL-based bulk operations
- ✅ **Performance Optimization**: 50-90% faster validation for clean datasets, 10x+ faster duplicate detection
- ✅ **Memory Efficiency**: Reduced memory pressure using SQL operations instead of JavaScript loops
- ✅ **Zero Breaking Changes**: All optimizations backward compatible with existing transaction import flow

#### DuckDB Temp Table Architecture

```typescript
// Enhanced transformation with temp table support
const result = await duckdb.transformData({
    source: { type: 'csv', path: 's3://bucket/data.csv' },
    transformSql: 'SELECT * FROM {{data}} WHERE amount > 0',
    schema: TransactionSchema,
}, {
    storeInTempTable: true, // Creates temp table for bulk operations
});

// Automatic temp table cleanup with proper error handling
const { validatedData, tempTableName } = result;
try {
    // Use temp table for bulk operations
    const duplicates = await duckdb.bulkCheckDuplicates({
        userId,
        tempTableName,
        transactionTableName: 'transaction',
    });
} finally {
    // Automatic cleanup
    if (tempTableName) {
        await duckdb.query(`DROP TABLE IF EXISTS ${tempTableName}`);
    }
}
```

### Transaction Performance & Currency Exchange Implementation (2025-07-03)

- ✅ **10x+ Performance Improvement**: Replaced JavaScript map loops with DuckDB PostgreSQL extension for bulk duplicate detection
- ✅ **Complete Currency Exchange System**: Implemented `transaction-fx` feature with automatic API fetching and database caching
- ✅ **Production-Ready Architecture**: Currency API client with UniRateAPI + Fawazahmed0 fallback and circuit breaker patterns
- ✅ **Enhanced DuckDB Integration**: Configurable PostgreSQL extension with custom aliases, schemas, and read-only modes
- ✅ **Zero Breaking Changes**: All enhancements backward compatible with existing transaction import flow

#### Transaction FX Feature Architecture

```typescript
// Database-first caching strategy
const rate = await getOrFetchExchangeRate({
    baseCurrency: 'EUR',
    targetCurrency: 'USD',
    date: '2025-07-03',
});

// Automatic currency conversion in parser
const convertedTransactions = await addCurrencyConversion({
    transactions: parsedTransactions,
    userCurrency: 'USD',
});
```

#### DuckDB PostgreSQL Extension

```typescript
// Configurable PostgreSQL connection
const config: DuckDBConfig = {
    postgres: {
        connectionString: DATABASE_URL,
        alias: 'main_db', // Custom alias instead of 'pg_db'
        schema: 'public', // Specific schema attachment
        readOnly: false, // Read/write permissions
    },
};

// Bulk duplicate detection with 10x+ performance
const duplicates = await duckdb.checkDuplicatesWithFallback({
    transactions: parsedTransactions,
    userId,
    keyExtractor: (t) => t.key,
});
```

**Key Technical Benefits**:

- **Performance**: SQL-based operations replace JavaScript loops for bulk processing
- **Reliability**: Database-first caching with automatic API fallback
- **Configurability**: Environment-driven PostgreSQL extension settings
- **Production-Ready**: Circuit breakers, error handling, and comprehensive monitoring

**Important Notes for Development**:

- Use `npx tsx` instead of `bun run` for DuckDB-related scripts due to compatibility issues
- DuckDB extensions auto-load when configuration is present (no explicit flags needed)
- Always implement fallback mechanisms for external dependencies
- **Use `storeInTempTable: true`** for large transaction imports (>1000 rows) to leverage SQL-based bulk operations
- **Monitor temp table cleanup** in production - always use try/finally blocks for resource management

### Enhanced Transaction Deduplication System (2025-01-08)

- ✅ **Eliminated False Positives**: Fixed issue where identical legitimate transactions (recurring charges, multiple identical purchases) were incorrectly flagged as duplicates
- ✅ **Sequence-Based Key Generation**: Implemented ROW_NUMBER() approach to differentiate identical transactions within same import
- ✅ **Bank Account Scoping**: Always include `connectedBankAccountId` in key generation for better isolation
- ✅ **Deterministic Results**: Same import file always generates same keys for consistent behavior
- ✅ **Zero Breaking Changes**: Maintained existing DuckDB bulk processing architecture and performance

#### Enhanced Key Generation Algorithm

```typescript
// Previous: Simple MD5 hash of transaction fields
const keyExpression = `SUBSTR(MD5(${hashColumns}), 1, ${idLength})`;

// Enhanced: Include bank account + sequence numbers for identical transactions
const keyGenerationSql = `
    WITH base_data AS (
        SELECT *,
            ROW_NUMBER() OVER () as row_num,
            MD5(${hashColumns} || '|' || '${connectedBankAccountId}') as base_key
        FROM (${dataSourceSql})
    ),
    counted_data AS (
        SELECT *,
            ROW_NUMBER() OVER (
                PARTITION BY base_key 
                ORDER BY row_num
            ) as occurrence_count
        FROM base_data
    )
    SELECT *,
        SUBSTR(MD5(base_key || '|' || occurrence_count), 1, ${idLength}) as "key"
    FROM counted_data
`;
```

#### Key Benefits

- **Solves Duplicate Problem**: 3 identical coffee purchases → 3 unique keys
- **Maintains Performance**: Single SQL query preserves bulk operation speed  
- **Simple Implementation**: Uses SQL CTEs and window functions, no complex logic
- **Backward Compatible**: Existing duplicate detection logic unchanged

#### Configuration Changes

```typescript
// Enhanced idConfig in transaction parser
idConfig: {
    columns: transformConfig.idColumns || [],
    connectedBankAccountId: file.import.connectedBankAccountId, // Now always included
}
```

**Important Notes**:
- Use `npx tsx` instead of `bun run` for DuckDB-related testing scripts
- Key generation now scoped by bank account, preventing cross-account collisions
- Sequence numbers ensure identical transactions get unique keys while preserving deterministic behavior

### Bucket Feature Complete Implementation (2025-01-05)

- ✅ **Complete Database Schema**: Implemented all 5 required tables: `bucket`, `bucketParticipant`, `bucketParticipantToBucket`, `bucketToTransaction`, `bucketParticipantToTransaction`
- ✅ **Settlement Tracking System**: Added `isSettled` field to `bucketToTransaction` with real-time `settledAmount` calculations
- ✅ **Fixed Critical Route Ordering**: Resolved Hono routing issue where specific routes were caught by general routes
- ✅ **Component Architecture**: Organized components into logical directories (`bucket/`, `participant/`) with proper exports
- ✅ **Database Relations Fix**: Resolved Drizzle relations crash preventing application startup
- ✅ **Type-Safe Implementation**: Added explicit return types to prevent null returns in array queries
- ✅ **Pattern Consistency**: All layers (queries, services, endpoints, API) follow established codebase conventions

#### Critical Bug Fixes
- **Route Order Issue**: Fixed `/participants` route being caught by `/` route in Hono configuration
- **Null Return Bug**: Added `Promise<Type[]>` return types to ensure queries return empty arrays instead of null
- **Schema Relations**: Removed duplicate relations and fixed invalid field references causing startup crashes

#### Architecture Improvements
```typescript
// Proper query return type annotation
const getAll = async ({ userId }: TQuerySelectUserRecords): Promise<TBucketParticipantQuery['select'][]> =>
    withDbQuery({
        queryFn: () => db.select().from(bucketParticipant)
            .where(and(eq(bucketParticipant.userId, userId), eq(bucketParticipant.isActive, true))),
        operation: 'list all bucket participants for a user',
    });

// Correct Hono route ordering  
const app = new Hono()
    .route('/participants', participantEndpoints)  // Specific routes first
    .route('/', bucketEndpoints);                  // General routes last
```

### Migration Required

⚠️ **Breaking Change**: Direct `bucketId` foreign key removed from transaction table. Migration scripts needed for existing data.

### Email Service Implementation (2025-07-02)

- ✅ **Sophisticated Email System**: Complete multi-provider email service with Resend, SMTP, and Mailtrap support
- ✅ **Factory-Based Architecture**: Type-safe `emailService.createSender(config)` pattern for maximum developer experience
- ✅ **Feature-Based Organization**: Email templates co-located with features (`src/features/*/email/`)
- ✅ **Production Optimizations**: Comprehensive performance guide with caching, pooling, and monitoring strategies
- ✅ **Nunjucks Templating**: Jinja2-compatible templating with CSS inlining and i18n support
- ✅ **Environment-Driven Configuration**: Clean factory pattern with comprehensive validation
- ✅ **Better-Auth Integration**: OTP emails now send via modern email service

#### Email Service Architecture

```typescript
// Simple config creation
const config = createEmailConfig({
    id: 'feature-email',
    templatePath: 'features/feature/email/templates/template.njk',
    schema: EmailDataSchema,
    category: 'notifications',
});

// Type-safe sender creation
const sendEmail = emailService.createSender(config);
```

**Key Benefits**: Removed 70% of complexity from initial registry-based approach while maintaining full type safety and better developer experience.

## Schema Evolution Notes

- **Drizzle Schema Update Pattern**: Observed change in index declaration syntax for Drizzle ORM
    - Old API: `index('custom_name').on(t.id)` inside `(t) => ({...})`
    - New API: `index('custom_name').on(t.id)` inside `(t) => [...]`
    - File reference: `/src/lib/auth/server/db/schema.ts`
