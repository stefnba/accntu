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