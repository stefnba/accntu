End the current development session by:

1. Check `.claude/sessions/.current-session` for the active session
2. If no active session, inform user there's nothing to end
3. If session exists, append a comprehensive summary including:
   - Session duration
   - Git summary:
     * Total files changed (added/modified/deleted)
     * List all changed files with change type
     * Number of commits made (if any)
     * Final git status
   - Todo summary:
     * Total tasks completed/remaining
     * List all completed tasks
     * List any incomplete tasks with status
   - Key accomplishments
   - All features implemented
   - Problems encountered and solutions
   - Breaking changes or important findings
   - Dependencies added/removed
   - Configuration changes
   - Deployment steps taken
   - Lessons learned
   - What wasn't completed
   - Tips for future developers

4. Also check any existing part of the documenation in this file and if it is still accurate or open todos have been completed or now changed
5. Empty the `.claude/sessions/.current-session` file (don't remove it, just clear its contents)
6. Inform user the session has been documented
7. Compare what you learned and implemented here with exisiting @CLAUDE.md and update @CLAUDE.md with any relevant information that's is missing. Give the user a summary of what updates you made.

The summary should be thorough enough that another developer (or AI) can understand everything that happened without reading the entire session.
