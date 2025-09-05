import type { Rule } from 'eslint';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rule: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Prevent direct imports from feature table files, enforce central schema imports',
            category: 'Best Practices',
            recommended: true,
        },
        schema: [],
        messages: {
            noDirectFeatureTableImport:
                'Tables should be imported as "import { dbTable } from \'@/server/db\'" instead of "{{importPath}}". Only "@/server/db/tables.ts" can import from feature table files.',
            wrongServerDbImport:
                'Import from "@/server/db" should use "import { dbTable } from \'@/server/db\'" pattern instead of destructuring individual tables.',
        },
    },
    create(context: Rule.RuleContext) {
        function isFeatureTableImport(importPath: string): boolean {
            return (
                (importPath.includes('@/features/') ||
                    importPath.includes('./server/db/tables') ||
                    importPath.includes('../server/db/tables') ||
                    !!importPath.match(/\.\.?\/.*server[/\\]db[/\\]tables/)) &&
                (importPath.includes('/server/db/tables') ||
                    importPath.includes('\\server\\db\\tables') ||
                    !!importPath.match(/server[/\\]db[/\\]tables/))
            );
        }

        function isAuthTableImport(importPath: string): boolean {
            return importPath.includes('@/lib/auth/server/db/tables');
        }

        function isServerDbImport(importPath: string): boolean {
            return importPath === '@/server/db';
        }

        function isAllowedFile(filePath: string): boolean {
            const normalized = path.normalize(filePath);
            // Central tables file and db index are allowed to import from feature tables
            // Feature table files themselves are also allowed (they can't import centrally due to circular deps)
            return (
                normalized.endsWith('src/server/db/tables.ts') ||
                normalized.endsWith('src\\server\\db\\tables.ts') ||
                normalized.endsWith('src/server/db/index.ts') ||
                normalized.endsWith('src\\server\\db\\index.ts') ||
                normalized.includes('server/db/tables.ts') ||
                normalized.includes('server\\db\\tables.ts')
            );
        }

        function isCorrectDbTableImport(node: any): boolean {
            // Allow { db, dbTable } or just { dbTable } imports
            const allowedImports = new Set(['db', 'dbTable']);
            const allSpecifiersValid = node.specifiers.every(
                (spec: any) =>
                    spec.type === 'ImportSpecifier' && allowedImports.has(spec.imported.name)
            );
            return allSpecifiersValid && node.specifiers.length > 0;
        }

        return {
            ImportDeclaration(node: any) {
                const currentFilePath = context.getFilename();
                const importPath = node.source.value;

                // Skip if this is an allowed file
                if (isAllowedFile(currentFilePath)) {
                    return;
                }

                // Check for direct feature table imports
                if (isFeatureTableImport(importPath) || isAuthTableImport(importPath)) {
                    context.report({
                        node: node.source,
                        messageId: 'noDirectFeatureTableImport',
                        data: {
                            importPath: importPath,
                        },
                    });
                    return;
                }

                // Check for @/server/db imports that don't use the dbTable pattern
                if (isServerDbImport(importPath) && !isCorrectDbTableImport(node)) {
                    context.report({
                        node: node.source,
                        messageId: 'wrongServerDbImport',
                    });
                }
            },
        };
    },
};

export default rule;
