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
                'Prevent endpoints from importing queries directly - they should use services instead',
            category: 'Best Practices',
            recommended: true,
        },
        schema: [],
        messages: {
            noEndpointQueryImport:
                'Endpoints should not import queries directly. Use services instead to maintain proper layered architecture.',
        },
    },
    create(context: Rule.RuleContext) {
        function isEndpointFile(filePath: string): boolean {
            const normalized = path.normalize(filePath);
            return (
                normalized.includes('/server/endpoints.ts') ||
                normalized.includes('\\server\\endpoints.ts') ||
                normalized.includes('/server/endpoints/') ||
                normalized.includes('\\server\\endpoints\\') ||
                normalized.match(/server[/\\]endpoints\.ts$/) !== null ||
                normalized.match(/server[/\\]endpoints[/\\]/) !== null
            );
        }

        function isQueryImport(importPath: string): boolean {
            return (
                importPath.includes('/server/db/queries') ||
                importPath.includes('\\server\\db\\queries') ||
                importPath.match(/server[/\\]db[/\\]queries/) !== null
            );
        }

        return {
            ImportDeclaration(node: any) {
                const currentFilePath = context.getFilename();
                const importPath = node.source.value;

                // Only check files that are endpoints
                if (!isEndpointFile(currentFilePath)) {
                    return;
                }

                // Skip if not importing from features
                if (!importPath.includes('features')) {
                    return;
                }

                // Check if importing queries
                if (isQueryImport(importPath)) {
                    context.report({
                        node: node.source,
                        messageId: 'noEndpointQueryImport',
                    });
                }
            },
        };
    },
};

export default rule;
