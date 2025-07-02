import { z } from 'zod';
import { EmailContent } from '../providers/types';

/**
 * Abstract email template interface
 * 
 * Each email template must implement this interface to be registered
 * in the template system. This provides type safety and consistency.
 * 
 * @template TData - The type of data expected by the template
 */
export interface EmailTemplate<TData = any> {
  /** Unique template identifier (e.g., 'auth.otp', 'transaction.notification') */
  readonly id: string;
  
  /** Path to the template file relative to the feature directory */
  readonly templatePath: string;
  
  /** Path to the plain text template file (optional, will auto-generate if missing) */
  readonly textTemplatePath?: string;
  
  /** Zod schema for validating template data */
  readonly schema: z.ZodSchema<TData>;
  
  /** i18n key for the email subject */
  readonly subjectKey: string;
  
  /** Default locale if not specified */
  readonly defaultLocale?: string;
  
  /** Category for organizing templates */
  readonly category: string;
  
  /** Description of what this template is for */
  readonly description: string;
}

/**
 * Template data with recipient information
 * 
 * @template TData - The template-specific data type
 */
export interface TemplateEmailData<TData = any> {
  /** Template-specific data */
  data: TData;
  
  /** Recipient email address and name */
  to: {
    email: string;
    name?: string;
  } | Array<{
    email: string;
    name?: string;
  }>;
  
  /** Locale for internationalization (defaults to template's defaultLocale or 'en') */
  locale?: string;
  
  /** Custom sender (optional, defaults to service configuration) */
  from?: {
    email: string;
    name?: string;
  };
  
  /** Custom reply-to (optional) */
  replyTo?: {
    email: string;
    name?: string;
  };
  
  /** Custom tags for tracking (optional) */
  tags?: Record<string, string>;
  
  /** Custom headers (optional) */
  headers?: Record<string, string>;
}

/**
 * Template registry for managing all email templates
 * 
 * This singleton class maintains a registry of all available email templates
 * and provides type-safe access to them.
 */
export class EmailTemplateRegistry {
  private static instance: EmailTemplateRegistry;
  private templates = new Map<string, EmailTemplate<any>>();

  private constructor() {}

  /**
   * Gets the singleton instance of the template registry
   */
  static getInstance(): EmailTemplateRegistry {
    if (!EmailTemplateRegistry.instance) {
      EmailTemplateRegistry.instance = new EmailTemplateRegistry();
    }
    return EmailTemplateRegistry.instance;
  }

  /**
   * Registers a template in the registry
   * 
   * @param template - The template to register
   * @throws {Error} If a template with the same ID is already registered
   * 
   * @example
   * ```typescript
   * const registry = EmailTemplateRegistry.getInstance();
   * registry.register(new OTPTemplate());
   * ```
   */
  register<TData>(template: EmailTemplate<TData>): void {
    if (this.templates.has(template.id)) {
      throw new Error(`Template with ID '${template.id}' is already registered`);
    }
    
    this.templates.set(template.id, template);
  }

  /**
   * Gets a template by its ID
   * 
   * @param id - The template ID
   * @returns The template if found
   * @throws {Error} If template is not found
   */
  get<TData>(id: string): EmailTemplate<TData> {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template with ID '${id}' not found. Available templates: ${this.getAvailableTemplateIds().join(', ')}`);
    }
    return template;
  }

  /**
   * Gets all registered templates
   */
  getAll(): EmailTemplate<any>[] {
    return Array.from(this.templates.values());
  }

  /**
   * Gets all available template IDs
   */
  getAvailableTemplateIds(): string[] {
    return Array.from(this.templates.keys());
  }

  /**
   * Gets templates by category
   * 
   * @param category - The category to filter by
   */
  getByCategory(category: string): EmailTemplate<any>[] {
    return this.getAll().filter(template => template.category === category);
  }

  /**
   * Validates template data using the template's schema
   * 
   * @param templateId - The template ID
   * @param data - The data to validate
   * @returns Validated data
   * @throws {Error} If validation fails
   */
  validateTemplateData<TData>(templateId: string, data: unknown): TData {
    const template = this.get<TData>(templateId);
    
    try {
      return template.schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        throw new Error(`Template data validation failed for '${templateId}': ${issues}`);
      }
      throw error;
    }
  }

  /**
   * Checks if a template exists
   * 
   * @param id - The template ID to check
   */
  has(id: string): boolean {
    return this.templates.has(id);
  }

  /**
   * Removes a template from the registry (mainly for testing)
   * 
   * @param id - The template ID to remove
   */
  unregister(id: string): boolean {
    return this.templates.delete(id);
  }

  /**
   * Clears all templates from the registry (mainly for testing)
   */
  clear(): void {
    this.templates.clear();
  }
}

/**
 * Template registry singleton instance
 */
export const templateRegistry = EmailTemplateRegistry.getInstance();

/**
 * Type helper to extract template data type from template ID
 * 
 * This will be extended as templates are registered
 */
export interface TemplateDataMap {
  // Will be extended by feature modules
}

/**
 * Type-safe template ID union
 * 
 * This will be extended as templates are registered
 */
export type TemplateId = keyof TemplateDataMap;