import { db } from '../../db';
import { withDbQuery } from '../handler';
import { sql } from 'drizzle-orm';

export interface SecurityAuditResult {
    score: number;
    issues: SecurityIssue[];
    recommendations: string[];
}

export interface SecurityIssue {
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    table?: string;
    column?: string;
}

export const performDatabaseSecurityAudit = async (): Promise<SecurityAuditResult> => {
    return withDbQuery({
        operation: 'database security audit',
        queryFn: async () => {
            const issues: SecurityIssue[] = [];
            const recommendations: string[] = [];

            // 1. Check for missing indexes on critical columns
            await auditIndexes(issues, recommendations);

            // 2. Check for foreign key constraints
            await auditForeignKeys(issues, recommendations);

            // 3. Check for sensitive data exposure
            await auditSensitiveData(issues, recommendations);

            // 4. Check session cleanup requirements
            await auditSessionCleanup(issues, recommendations);

            // Calculate security score based on issues
            const score = calculateSecurityScore(issues);

            return {
                score,
                issues,
                recommendations,
            };
        },
    });
};

const auditIndexes = async (issues: SecurityIssue[], recommendations: string[]) => {
    // Check if critical indexes exist by querying PostgreSQL system tables
    const indexQuery = sql`
        SELECT 
            schemaname,
            tablename,
            indexname,
            indexdef
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename IN ('user', 'auth_session', 'auth_account', 'auth_verification', 'auth_passkey')
        ORDER BY tablename, indexname;
    `;

    const indexes = await db.execute(indexQuery);
    
    // Critical indexes that should exist
    const requiredIndexes = [
        { table: 'user', column: 'email', type: 'unique' },
        { table: 'auth_session', column: 'token', type: 'unique' },
        { table: 'auth_session', column: 'expires_at', type: 'btree' },
        { table: 'auth_session', column: 'user_id', type: 'btree' },
        { table: 'auth_verification', column: 'expires_at', type: 'btree' },
    ];

    const existingIndexNames = indexes.rows.map(row => 
        (row as any).indexname?.toLowerCase()
    );

    for (const required of requiredIndexes) {
        const expectedIndexName = `${required.table}_${required.column}_idx`;
        if (!existingIndexNames.some(name => name?.includes(required.column))) {
            issues.push({
                severity: 'high',
                category: 'Missing Index',
                description: `Missing index on ${required.table}.${required.column}`,
                table: required.table,
                column: required.column,
            });
            recommendations.push(`Add index on ${required.table}.${required.column} for security queries`);
        }
    }
};

const auditForeignKeys = async (issues: SecurityIssue[], recommendations: string[]) => {
    // Check foreign key constraints for proper cascade/restrict settings
    const fkQuery = sql`
        SELECT 
            tc.table_name,
            tc.constraint_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            rc.delete_rule,
            rc.update_rule
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            JOIN information_schema.referential_constraints AS rc
              ON tc.constraint_name = rc.constraint_name
              AND tc.table_schema = rc.constraint_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        ORDER BY tc.table_name, tc.constraint_name;
    `;

    const foreignKeys = await db.execute(fkQuery);

    for (const fk of foreignKeys.rows) {
        const row = fk as any;
        
        // Auth tables should cascade delete when user is deleted
        if (row.foreign_table_name === 'user' && row.delete_rule !== 'CASCADE') {
            issues.push({
                severity: 'medium',
                category: 'Foreign Key Policy',
                description: `${row.table_name}.${row.column_name} should CASCADE on user deletion`,
                table: row.table_name,
                column: row.column_name,
            });
            recommendations.push(`Set CASCADE delete for ${row.table_name}.${row.column_name} -> user.id`);
        }
    }
};

const auditSensitiveData = async (issues: SecurityIssue[], recommendations: string[]) => {
    // Check for sensitive data patterns in text columns
    try {
        // Look for potential hardcoded credentials or test data
        const suspiciousPatterns = [
            { pattern: '%test%', description: 'Test data found' },
            { pattern: '%password%', description: 'Potential password in plain text' },
            { pattern: '%secret%', description: 'Potential secret in plain text' },
            { pattern: '%admin@%', description: 'Hardcoded admin email' },
        ];

        for (const { pattern, description } of suspiciousPatterns) {
            // Check user table for suspicious data
            const userCheck = await db.execute(sql`
                SELECT COUNT(*) as count 
                FROM "user" 
                WHERE email ILIKE ${pattern} OR name ILIKE ${pattern}
            `);

            const count = (userCheck.rows[0] as any)?.count;
            if (count && parseInt(count) > 0) {
                issues.push({
                    severity: 'medium',
                    category: 'Sensitive Data',
                    description: `${description} in user table`,
                    table: 'user',
                });
                recommendations.push(`Review and sanitize data matching pattern: ${pattern}`);
            }
        }
    } catch (error) {
        // If audit fails, log as a warning but don't fail the entire audit
        issues.push({
            severity: 'low',
            category: 'Audit Error',
            description: 'Could not complete sensitive data audit',
        });
    }
};

const auditSessionCleanup = async (issues: SecurityIssue[], recommendations: string[]) => {
    // Check for expired sessions that should be cleaned up
    try {
        const expiredSessionsQuery = sql`
            SELECT COUNT(*) as count 
            FROM auth_session 
            WHERE expires_at < NOW()
        `;

        const result = await db.execute(expiredSessionsQuery);
        const expiredCount = parseInt((result.rows[0] as any)?.count || '0');

        if (expiredCount > 100) {
            issues.push({
                severity: 'medium',
                category: 'Data Cleanup',
                description: `${expiredCount} expired sessions need cleanup`,
                table: 'auth_session',
            });
            recommendations.push('Implement automated cleanup job for expired sessions');
        }

        // Check for old verification tokens
        const expiredVerificationQuery = sql`
            SELECT COUNT(*) as count 
            FROM auth_verification 
            WHERE expires_at < NOW()
        `;

        const verificationResult = await db.execute(expiredVerificationQuery);
        const expiredVerificationCount = parseInt((verificationResult.rows[0] as any)?.count || '0');

        if (expiredVerificationCount > 50) {
            issues.push({
                severity: 'low',
                category: 'Data Cleanup',
                description: `${expiredVerificationCount} expired verification tokens need cleanup`,
                table: 'auth_verification',
            });
            recommendations.push('Implement automated cleanup job for expired verification tokens');
        }
    } catch (error) {
        issues.push({
            severity: 'low',
            category: 'Audit Error',
            description: 'Could not complete session cleanup audit',
        });
    }
};

const calculateSecurityScore = (issues: SecurityIssue[]): number => {
    let score = 100;
    
    for (const issue of issues) {
        switch (issue.severity) {
            case 'critical':
                score -= 25;
                break;
            case 'high':
                score -= 15;
                break;
            case 'medium':
                score -= 10;
                break;
            case 'low':
                score -= 5;
                break;
        }
    }
    
    return Math.max(0, score);
};

export const runDatabaseCleanup = async (): Promise<{ cleaned: number; errors: string[] }> => {
    return withDbQuery({
        operation: 'database security cleanup',
        queryFn: async () => {
            let cleaned = 0;
            const errors: string[] = [];

            try {
                // Clean up expired sessions
                const expiredSessionsResult = await db.execute(sql`
                    DELETE FROM auth_session 
                    WHERE expires_at < NOW()
                `);
                cleaned += expiredSessionsResult.rowCount || 0;

                // Clean up expired verification tokens
                const expiredVerificationResult = await db.execute(sql`
                    DELETE FROM auth_verification 
                    WHERE expires_at < NOW() - INTERVAL '1 day'
                `);
                cleaned += expiredVerificationResult.rowCount || 0;

                // Clean up old OAuth tokens
                const expiredOAuthResult = await db.execute(sql`
                    UPDATE auth_account 
                    SET access_token = NULL, refresh_token = NULL 
                    WHERE (access_token_expires_at < NOW() OR refresh_token_expires_at < NOW())
                    AND (access_token IS NOT NULL OR refresh_token IS NOT NULL)
                `);
                cleaned += expiredOAuthResult.rowCount || 0;

            } catch (error) {
                errors.push(`Cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }

            return { cleaned, errors };
        },
    });
};