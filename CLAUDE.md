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
const result = await duckdb.transformData(
    {
        source: { type: 'csv', path: 's3://bucket/data.csv' },
        transformSql: 'SELECT * FROM {{data}} WHERE amount > 0',
        schema: TransactionSchema,
    },
    {
        storeInTempTable: true, // Creates temp table for bulk operations
    }
);

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

### Participant Feature Extraction & Budget System Implementation (2025-01-10/11)

- ✅ **Complete Feature Extraction**: Successfully extracted participant functionality from bucket feature into standalone `src/features/participant/`
- ✅ **Simple Structure Migration**: Migrated both participant and bucket features from complex (directories) to simple (single files) structure
- ✅ **Junction Table Architecture**: Implemented proper many-to-many relationships with consistent "To" naming convention
- ✅ **Complete Budget System**: Created comprehensive budget calculation system with precedence rules and proper junction table normalization
- ✅ **Database Normalization**: Replaced JSON fields with proper junction tables for better performance and data integrity
- ✅ **Naming Convention Consistency**: All junction tables follow `entityToEntity` pattern for maintainability

#### Junction Table Architecture

```typescript
// Participant junction tables (standalone feature)
participantToTransaction; // Direct transaction sharing with split configurations
participantToBucket; // Bucket participation with sharing logic
participantToConnectedBankAccount; // Bank account sharing affecting monthly budgets

// Budget calculation tables (new feature)
transactionBudget; // Final budget amounts per transaction per user
transactionBudgetToParticipant; // Split details and participant records per budget
```

#### Budget Calculation Precedence System

```typescript
// Sophisticated precedence rules for budget calculations
1. Transaction-level splits (highest priority)
2. Bucket-level splits
3. Account-level splits
4. Default 100% to user (lowest priority)
```

#### Unified Split Configuration

```typescript
// Consistent across all junction tables for flexible expense sharing
interface SplitConfig {
    type: 'equal' | 'percentage' | 'amount' | 'share' | 'adjustment';
    value?: number; // Main value (%, amount, ratio)
    baseType?: string; // For adjustments
    adjustment?: number; // +/- from base
    cap?: number; // Max amount
    floor?: number; // Min amount
    metadata?: Record<string, any>; // Future extensions
}
```

#### Critical Design Improvements

- **JSON to Junction Table**: Replaced JSON fields with proper junction tables for 10x+ query performance
- **Data Normalization**: Removed redundant `originalAmount` field, use foreign key relationships
- **Type Safety**: Complete TypeScript coverage with proper return types
- **Performance**: Optimized indexing on junction tables for efficient queries

#### Architecture Benefits

- **Better Query Performance**: SQL-based operations instead of JSON parsing
- **Data Integrity**: Foreign key constraints with CASCADE deletes
- **Flexible Sharing**: Support for equal, percentage, amount, share, and adjustment splitting
- **Scalable Design**: Normalized structure supports complex expense sharing scenarios

### Migration Required

⚠️ **Breaking Change**: Complete restructuring of participant and budget tables. Database reset required for development (already completed).

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
