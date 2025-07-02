import { I18n } from 'i18n';
import juice from 'juice';
import fs from 'node:fs';
import path from 'node:path';
import { configure as nunjucksConfigure, render as nunjucksRender } from 'nunjucks';
import type { EmailConfig } from './email-config';
import type { TemplateRenderData } from './types';

/**
 * Configuration options for the EmailTemplateEngine.
 */
export interface TemplateEngineConfig {
    /** The root directory where email templates are stored. Defaults to `src`. */
    rootDir?: string;
    /** A list of supported locales (e.g., ['en', 'es']). Defaults to `['en']`. */
    locales?: string[];
    /** The directory where locale translation files are stored. Defaults to `src/server/lib/email/locales`. */
    localesDir?: string;
    /** The path to the global CSS file for inlining styles. Defaults to `src/server/lib/email/styles/global.css`. */
    cssPath?: string;
    /** Whether to cache templates. Recommended for production. Defaults to `false`. */
    enableCache?: boolean;
}

/**
 * ## Email Template Engine
 *
 * Handles the rendering of Nunjucks templates, internationalization (i18n),
 * and inlining of CSS for emails.
 */
export class EmailTemplateEngine {
    private i18n: I18n;
    private config: Required<TemplateEngineConfig>;

    /**
     * Initializes the template engine with the given configuration.
     * @param config - Configuration for the template engine.
     */
    constructor(config: TemplateEngineConfig = {}) {
        this.config = {
            rootDir: config.rootDir || path.join(process.cwd(), 'src'),
            locales: config.locales || ['en'],
            localesDir:
                config.localesDir ||
                path.join(process.cwd(), 'src', 'server', 'lib', 'email', 'locales'),
            cssPath:
                config.cssPath ||
                path.join(process.cwd(), 'src', 'server', 'lib', 'email', 'styles', 'global.css'),
            enableCache: config.enableCache || false,
        };

        // Configure nunjucks to load templates from the specified root directory
        nunjucksConfigure(this.config.rootDir, {
            autoescape: true,
            noCache: !this.config.enableCache,
        });

        // Configure i18n for localization
        this.i18n = new I18n({
            locales: this.config.locales,
            directory: this.config.localesDir,
            defaultLocale: 'en',
        });
    }

    /**
     * Renders an email template with the given data and locale.
     *
     * @param template - The `EmailConfig` instance defining the template.
     * @param data - The data payload for rendering the template.
     * @param locale - The target locale for translation.
     * @returns The rendered subject, HTML, and text content.
     * @throws If the template file cannot be found.
     */
    async render<TData extends TemplateRenderData>(
        template: EmailConfig<any>,
        data: TData,
        locale: string = 'en'
    ): Promise<{ subject: string; html: string; text: string }> {
        this.i18n.setLocale(locale);

        const templatePath = path.join(this.config.rootDir, template.templatePath);
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template file not found: ${template.templatePath}`);
        }

        const templateData = {
            ...data,
            // Provide the __ i18n function to the template context
            __: this.i18n.__.bind(this.i18n),
        };

        const subject = this.i18n.__(template.subjectKey, data as any);
        const html = nunjucksRender(template.templatePath, templateData);

        // If a text version of the template exists, render it.
        // Otherwise, this will be handled later by converting HTML to text.
        const textTemplatePath = template.templatePath.replace('.njk', '.txt');
        const fullTextPath = path.join(this.config.rootDir, textTemplatePath);
        const text = fs.existsSync(fullTextPath)
            ? nunjucksRender(textTemplatePath, templateData)
            : '';

        const inlinedHtml = await this.inlineCss(html);

        return { subject, html: inlinedHtml, text };
    }

    /**
     * Inlines global CSS styles into the given HTML content.
     *
     * @param html - The HTML content to process.
     * @returns HTML with CSS styles inlined.
     */
    private async inlineCss(html: string): Promise<string> {
        if (!fs.existsSync(this.config.cssPath)) {
            return html; // Return original HTML if no CSS file is found
        }
        const css = fs.readFileSync(this.config.cssPath, 'utf-8');
        return juice.inlineContent(html, css);
    }
}
