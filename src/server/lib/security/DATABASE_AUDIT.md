# Database Security Audit System

> **⚠️ Future Potential Improvement**
>
> This document describes a database security audit system that is **not currently implemented** in the codebase. It represents a potential future enhancement that can be built when needed. The specifications below are preserved from a previous implementation to serve as a blueprint for future development.

## Overview

A comprehensive database security audit and cleanup system that analyzes PostgreSQL database for security issues, missing indexes, foreign key policies, sensitive data exposure, and performs automated cleanup of expired data.

## Core Features

### 1. Security Audit (`performDatabaseSecurityAudit`)

Performs a complete database security audit and returns a security score (0-100) with detailed issues and recommendations.

**Return Type:**

```typescript
interface SecurityAuditResult {
    score: number;
    issues: SecurityIssue[];
    recommendations: string[];
}

interface SecurityIssue {
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    table?: string;
    column?: string;
}
```

**Audit Components:**

#### a) Index Audit (`auditIndexes`)

- Queries `pg_indexes` system table to check for critical indexes
- Required indexes on:
    - `user.email` (unique)
    - `auth_session.token` (unique)
    - `auth_session.expires_at` (btree)
    - `auth_session.user_id` (btree)
    - `auth_verification.expires_at` (btree)
- **Severity:** High if missing
- **Recommendation:** Add missing indexes for security queries

#### b) Foreign Key Audit (`auditForeignKeys`)

- Queries `information_schema` for foreign key constraints
- Checks `delete_rule` and `update_rule` policies
- Validates that auth tables CASCADE delete when user is deleted
- **Severity:** Medium for improper cascade policies
- **Recommendation:** Set CASCADE delete for user-related foreign keys

#### c) Sensitive Data Audit (`auditSensitiveData`)

- Scans user table for suspicious patterns:
    - `%test%` - Test data
    - `%password%` - Plain text passwords
    - `%secret%` - Plain text secrets
    - `%admin@%` - Hardcoded admin emails
- Checks both `email` and `name` columns
- **Severity:** Medium if found
- **Recommendation:** Review and sanitize matching data

#### d) Session Cleanup Audit (`auditSessionCleanup`)

- Counts expired sessions in `auth_session` table
- Counts expired verification tokens in `auth_verification` table
- Thresholds:
    - Sessions: >100 triggers medium severity
    - Verification tokens: >50 triggers low severity
- **Recommendation:** Implement automated cleanup jobs

### 2. Database Cleanup (`runDatabaseCleanup`)

Performs automated cleanup of expired/stale security data.

**Return Type:**

```typescript
{
    cleaned: number; // Total rows affected
    errors: string[];
}
```

**Cleanup Operations:**

1. **Expired Sessions**
    - Deletes from `auth_session` where `expires_at < NOW()`

2. **Expired Verification Tokens**
    - Deletes from `auth_verification` where `expires_at < NOW() - INTERVAL '1 day'`
    - Extra 1-day grace period before deletion

3. **Expired OAuth Tokens**
    - Updates `auth_account` to NULL out expired tokens
    - Checks both `access_token_expires_at` and `refresh_token_expires_at`
    - Only updates rows with non-null tokens

## Security Score Calculation

Score starts at 100 and deducts points based on issue severity:

- **Critical:** -25 points
- **High:** -15 points
- **Medium:** -10 points
- **Low:** -5 points
- Minimum score: 0

## Implementation Details

### Dependencies

```typescript
import { db } from '../../db';
import { withDbQuery } from '../db/query';
import { sql } from 'drizzle-orm';
```

### Error Handling

- All audit operations wrapped in try-catch
- Failed audits add low-severity "Audit Error" issues
- Cleanup errors collected in returned errors array
- Audit continues even if individual checks fail

### Database Operations

- Uses raw SQL queries via Drizzle `sql` template
- Queries PostgreSQL system tables (`pg_indexes`, `information_schema`)
- All operations wrapped in `withDbQuery` for consistent error handling

## Usage Examples

### Running Security Audit

```typescript
const result = await performDatabaseSecurityAudit();
console.log(`Security Score: ${result.score}/100`);
console.log(`Issues Found: ${result.issues.length}`);
console.log('Recommendations:', result.recommendations);
```

### Running Cleanup

```typescript
const { cleaned, errors } = await runDatabaseCleanup();
console.log(`Cleaned ${cleaned} records`);
if (errors.length > 0) {
    console.error('Cleanup errors:', errors);
}
```

## Future Enhancements

### Potential Additions

1. **Scheduled Audits**: Cron job to run periodic security audits
2. **Audit History**: Store audit results in database for trend analysis
3. **Email Notifications**: Alert admins on critical/high severity issues
4. **Custom Audit Rules**: Configurable audit checks per environment
5. **Performance Metrics**: Track query execution times
6. **Compliance Checks**: GDPR, SOC2, PCI-DSS specific audits
7. **Data Encryption Audit**: Check for unencrypted sensitive columns
8. **Rate Limiting Audit**: Verify rate limit configurations
9. **Webhook on Issues**: Integrate with Slack/Discord for alerts
10. **Automated Fixes**: Auto-apply safe recommendations

### Integration Points

- Admin dashboard endpoint: `GET /api/admin/security/audit`
- Scheduled cleanup task: Daily cron via task scheduler
- Health check integration: Include security score in health endpoint
- CLI command: `bun run audit:security`

## Tables Referenced

- `user` - Main user table
- `auth_session` - User sessions
- `auth_account` - OAuth accounts
- `auth_verification` - Email verification tokens
- `auth_passkey` - WebAuthn passkeys

## Related Documentation

- [Session Security](/docs/SESSION_SECURITY.md)
- Database query utilities: `/src/server/lib/db/query`
- Database schema: `/src/server/db`
