import * as nunjucks from 'nunjucks';
import * as juice from 'juice';
import { I18n } from 'i18n';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { EmailContent } from '../providers/types';
import { EmailTemplate, templateRegistry } from './template-registry';

/**
 * Core template engine for rendering email templates
 * 
 * This engine handles the actual template rendering using Nunjucks (Jinja2-style)
 * and CSS inlining. It works with the template registry to load templates
 * from their feature-specific locations.
 */
export class EmailTemplateEngine {
  private nunjucks: nunjucks.Environment;
  private i18n: I18n;
  private cssContent: string;
  private templateCache = new Map<string, { html: nunjucks.Template; text?: nunjucks.Template }>();

  /**
   * Initialize the template engine
   * 
   * @param options - Configuration options
   */
  constructor(options: {
    /** Root directory for resolving template paths */
    rootDir?: string;
    /** Available locales */
    locales?: string[];
    /** Locale directory path */
    localesDir?: string;
    /** CSS file path for email styling */
    cssPath?: string;
    /** Whether to cache templates (default: true in production) */
    enableCache?: boolean;
  } = {}) {
    const {
      rootDir = process.cwd(),
      locales = ['en', 'es', 'fr'],
      localesDir = join(rootDir, 'src', 'server', 'lib', 'email', 'locales'),
      cssPath = join(rootDir, 'src', 'server', 'lib', 'email', 'styles', 'email.css'),
      enableCache = process.env.NODE_ENV === 'production'
    } = options;

    // Configure Nunjucks with flexible path resolution
    this.nunjucks = new nunjucks.Environment(
      new nunjucks.FileSystemLoader(rootDir, {
        watch: process.env.NODE_ENV === 'development',
        noCache: !enableCache,
      }),
      {
        autoescape: true,
        trimBlocks: true,
        lstripBlocks: true,
      }
    );

    // Configure i18n
    this.i18n = new I18n({
      locales,
      directory: localesDir,
      defaultLocale: 'en',
      updateFiles: false,
      syncFiles: false,
    });

    // Load CSS content
    try {
      this.cssContent = existsSync(cssPath) ? readFileSync(cssPath, 'utf8') : '';
    } catch {
      this.cssContent = '';
    }
  }

  /**
   * Renders an email template using the template registry
   * 
   * @param templateId - The registered template ID
   * @param data - Template data (will be validated against template schema)
   * @param locale - Locale for internationalization
   * @returns Rendered email content
   * 
   * @example
   * ```typescript
   * const content = await engine.renderTemplate('auth.otp', {
   *   user: { name: 'John', email: 'john@example.com' },
   *   otpCode: '123456'
   * }, 'en');
   * ```
   */
  async renderTemplate<TData>(
    templateId: string,
    data: TData,
    locale = 'en'
  ): Promise<EmailContent> {
    // Get template configuration from registry
    const template = templateRegistry.get<TData>(templateId);
    
    // Validate data against template schema
    const validatedData = templateRegistry.validateTemplateData(templateId, data);
    
    // Set locale for translations
    this.i18n.setLocale(locale);
    
    // Prepare template context
    const templateContext = {
      ...validatedData,
      __: this.i18n.__.bind(this.i18n),
      locale,
      appName: 'Accntu',
      logoUrl: process.env.LOGO_URL || '',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@accntu.com',
    };

    try {
      // Render HTML template
      const htmlContent = await this.renderHtmlTemplate(template, templateContext);
      
      // Inline CSS
      const htmlWithInlinedCSS = this.cssContent 
        ? juice.inlineContent(htmlContent, this.cssContent, {
            removeStyleTags: false,
            preserveMediaQueries: true,
            webResources: {
              images: false,
              svgs: false,
              scripts: false,
              links: false,
            },
          })
        : htmlContent;

      // Render text template or generate from HTML
      const textContent = await this.renderTextTemplate(template, templateContext, htmlContent);

      // Render subject
      const subject = this.i18n.__(template.subjectKey);

      return {
        html: htmlWithInlinedCSS,
        text: textContent,
        subject,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown template error';
      throw new Error(`Failed to render template '${templateId}': ${errorMessage}`);
    }
  }

  /**
   * Renders the HTML template
   * 
   * @private
   */
  private async renderHtmlTemplate(template: EmailTemplate, context: any): Promise<string> {
    // Try to get from cache first
    let htmlTemplate = this.templateCache.get(template.id)?.html;
    
    if (!htmlTemplate) {
      try {
        htmlTemplate = this.nunjucks.getTemplate(template.templatePath);
        
        // Cache if enabled
        if (process.env.NODE_ENV === 'production') {
          const cached = this.templateCache.get(template.id) || {};
          cached.html = htmlTemplate;
          this.templateCache.set(template.id, cached);
        }
      } catch (error) {
        throw new Error(`HTML template not found at path: ${template.templatePath}`);
      }
    }
    
    return htmlTemplate.render(context);
  }

  /**
   * Renders the text template or generates from HTML
   * 
   * @private
   */
  private async renderTextTemplate(
    template: EmailTemplate, 
    context: any, 
    htmlFallback: string
  ): Promise<string> {
    // If text template path is specified, try to use it
    if (template.textTemplatePath) {
      let textTemplate = this.templateCache.get(template.id)?.text;
      
      if (!textTemplate) {
        try {
          textTemplate = this.nunjucks.getTemplate(template.textTemplatePath);
          
          // Cache if enabled
          if (process.env.NODE_ENV === 'production') {
            const cached = this.templateCache.get(template.id) || {};
            cached.text = textTemplate;
            this.templateCache.set(template.id, cached);
          }
        } catch {
          // Fall back to HTML conversion if text template not found
          return this.htmlToText(htmlFallback);
        }
      }
      
      return textTemplate.render(context);
    }
    
    // Generate text from HTML
    return this.htmlToText(htmlFallback);
  }

  /**
   * Converts HTML to plain text
   * 
   * @private
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Gets available locales
   */
  getAvailableLocales(): string[] {
    return this.i18n.getLocales();
  }

  /**
   * Precompiles templates for production performance
   */
  precompileTemplates(): void {
    if (process.env.NODE_ENV === 'production') {
      const templates = templateRegistry.getAll();
      
      for (const template of templates) {
        try {
          // Precompile HTML template
          const htmlTemplate = this.nunjucks.getTemplate(template.templatePath);
          
          // Precompile text template if exists
          let textTemplate;
          if (template.textTemplatePath) {
            try {
              textTemplate = this.nunjucks.getTemplate(template.textTemplatePath);
            } catch {
              // Text template is optional
            }
          }
          
          // Cache precompiled templates
          this.templateCache.set(template.id, {
            html: htmlTemplate,
            text: textTemplate,
          });
        } catch (error) {
          console.warn(`Failed to precompile template '${template.id}':`, error);
        }
      }
    }
  }

  /**
   * Clears template cache (mainly for development/testing)
   */
  clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * Gets cache statistics
   */
  getCacheStats(): { size: number; templates: string[] } {
    return {
      size: this.templateCache.size,
      templates: Array.from(this.templateCache.keys()),
    };
  }
}