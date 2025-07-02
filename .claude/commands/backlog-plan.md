# Command: Plan Backlog Topics

This command identifies and outlines new backlog topics.

## 1. Analyze Context

- Review project `CLAUDE.md` files (root, `src/`, `src/features/`) for architecture and patterns.
- Scan the codebase to understand the application's purpose.

## 2. Review Backlog

- Check `.claude/backlog/` for existing topics to avoid duplication.

## 3. Brainstorm Improvements

- Identify new topics:
    - **New Features**: Core functionality additions.
    - **Enhancements**: UI/UX or capability upgrades to existing features.
    - **Refactoring**: Code structure and maintainability improvements.
    - **Performance**: Optimizations for speed and resource usage.
    - **DevEx**: Tooling, scripts, and documentation enhancements.

## 4. Outline Topics

For each topic, create a new file: `.claude/backlog/YYYY-MM-DD-HHMM-[topic-slug].md`.

Each file must contain the following sections. Before writing, ensure your plan aligns with guidelines from relevant `CLAUDE.md` files and leverages existing features for code consistency.

- `## Objectives`: Brief summary.

- `## Development Plan`:

    - Provide a step-by-step implementation guide.
    - Include a file-by-file breakdown of all proposed changes.
    - Outline new file and directory structures for features.

- `## Alternatives Considered`:

    - Document other technical approaches.
    - Justify the chosen path by detailing the pros and cons of each alternative.

- `## Progress`: An empty section for updates.
