# Command: Implement Backlog Topic

This command implements a development plan from a selected backlog topic file.

**Input**: A topic file selected from `.claude/backlog/pending/`.
**Output**: Implemented code, followed by moving the topic file to `.claude/backlog/completed/`.

---

## 1. Select and Review Topic

- Ask the user to specify which topic from `.claude/backlog/pending/` they want to implement.
- Thoroughly read and parse the selected topic file, paying close attention to the `Objectives` and `Development Plan`.

## 2. Clarify and Confirm (Mandatory)

This is the most critical step. **Do not proceed to implementation without explicit user approval.**

- **Analyze the Plan**: Identify any ambiguities, potential conflicts, or missing details in the development plan.
- **Formulate Questions**: Prepare specific, targeted questions to resolve any uncertainties. For example:
    - _"The plan mentions updating the `User` schema. Should this include adding a `lastActive` field, or only modifying existing ones?"_
    - _"To implement the `Billing` feature, which authentication middleware should be applied to the new `/api/billing` endpoint?"_
- **Confirm with User**:
    - Present a concise summary of your understanding of the plan.
    - List your clarifying questions.
    - Explicitly state: **"Please review the plan and answer the questions above. I will await your confirmation before beginning implementation."**

## 3. Execute Implementation

- Once the user provides answers and gives a clear "go-ahead," begin executing the development plan.
- Follow the plan's file-by-file breakdown, adhering strictly to the project's `CLAUDE.md` guidelines and coding standards.

## 4. Finalize and Archive

- After implementation is complete, run any necessary checks (e.g., `bun lint`).
- Move the completed topic file from `.claude/backlog/pending/` to `.claude/backlog/completed/`.
- Inform the user that the implementation is finished and the backlog has been updated.
