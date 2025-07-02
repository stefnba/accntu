# Command: Add Backlog Topic

This command creates a detailed development plan for a user-provided topic and adds it to the backlog.

**Input**: A topic name or description from the user.
**Output**: A markdown file at `.claude/backlog/pending/YYYY-MM-DD-HHMM-[topic-slug].md`.

---

## 1. Clarify and Validate

- If the user's instructions are unclear, ask for clarification before proceeding.
- Check for duplicate topics in `.claude/backlog/pending/` and `.claude/backlog/completed/`. If a similar topic exists, inform the user and abort.

## 2. Research and Analyze

- **Review Guidelines**: Read relevant `CLAUDE.md` files (root, `src/`, `src/features/`) to understand architectural principles and coding standards.
- **Analyze Existing Code**: Examine the current codebase, especially related features, to understand patterns and the impact of the new topic.

## 3. Create Backlog File

Create the topic file at `.claude/backlog/pending/YYYY-MM-DD-HHMM-[topic-slug].md`.

The file must contain the following sections. Ensure the plan aligns with project guidelines and leverages existing patterns for consistency.

- `## Objectives`: Write a concise summary of the topic's goals.

- `## Development Plan`:

    - Propose a detailed, step-by-step implementation strategy. **Do not write code.**
    - Outline all file modifications, including additions and structural changes.
    - For new features, describe the proposed directory and file structure.

- `## Alternatives Considered`:

    - Document alternative technical approaches.
    - Justify the chosen approach with a clear pros-and-cons analysis for each alternative.

- `## Progress`:
    - Add this heading and leave the section empty for future updates.
