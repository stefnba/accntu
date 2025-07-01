import type { Rule } from 'eslint';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rule: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Prevent features from importing queries from other features',
            category: 'Best Practices',
            recommended: true,
        },
        schema: [],
        messages: {
            noCrossFeatureQueryImport:
                'Features should not import queries from other features ({{from}} -> {{to}}). Use services instead for cross-feature communication.',
        },
    },
    create(context: Rule.RuleContext) {
        function getFeatureName(filePath: string): string | null {
            const normalized = path.normalize(filePath);
            const match = normalized.match(/src[/\\]features[/\\]([^/\\]+)/);
            return match ? match[1] : null;
        }

        function isQueryImport(importPath: string): boolean {
            return (
                importPath.includes('/server/db/queries') ||
                importPath.includes('\\server\\db\\queries') ||
                importPath.match(/server[/\\]db[/\\]queries/) !== null
            );
        }

        function resolveImportPath(importPath: string, currentFilePath: string): string {
            if (importPath.startsWith('.')) {
                // Relative import
                const currentDir = path.dirname(currentFilePath);
                return path.resolve(currentDir, importPath);
            } else if (importPath.startsWith('~/') || importPath.startsWith('@/')) {
                // Absolute import with alias
                const withoutAlias = importPath.replace(/^[~@]\//, '');
                const projectRoot = path.resolve(__dirname, '..');
                return path.resolve(projectRoot, 'src', withoutAlias);
            } else if (importPath.startsWith('src/')) {
                // Absolute import from src
                const projectRoot = path.resolve(__dirname, '..');
                return path.resolve(projectRoot, importPath);
            }
            return importPath;
        }

        return {
            ImportDeclaration(node: any) {
                const currentFilePath = context.getFilename();
                const importPath = node.source.value;

                // Skip if not importing from features
                if (!importPath.includes('features')) {
                    return;
                }

                // Skip if not a query import
                if (!isQueryImport(importPath)) {
                    return;
                }

                const currentFeature = getFeatureName(currentFilePath);
                if (!currentFeature) {
                    return;
                }

                const resolvedImportPath = resolveImportPath(importPath, currentFilePath);
                const importedFeature = getFeatureName(resolvedImportPath);

                // If importing queries from a different feature, report error
                if (importedFeature && importedFeature !== currentFeature) {
                    context.report({
                        node: node.source,
                        messageId: 'noCrossFeatureQueryImport',
                        data: {
                            from: currentFeature,
                            to: importedFeature,
                        },
                    });
                }
            },
        };
    },
};

export default rule;
