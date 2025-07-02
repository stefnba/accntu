# Start a new development session

1. Create a session file in `.claude/sessions/` with the format YYYY-MM-DD-HHMM-$ARGUMENTS.md (or just YYYY-MM-DD-HHMM.md if no name provided).

2. Populate the session file with

    - Session name and timestamp as the title
    - Session overview section with start time

3. Plan really carefully the instructions the users gave you (ask user for goals and instructions if not clear). IMPORTANT: Plan, don't code!

    - Think about them really hard how you would approach the, balance alternative approaches with pros and cons, and then plan the approach.
    - If it's a coding development instruction: outline which files would you change, how you would structure the codebase if it's a new feature to develop.
    - Read the relevant CLAUDE.md files to understand the guidelines that are key for this objective
    - Always read and understand the relevant codebase and look for other parts like other features for inspiration and coding standards

4. Update the session file with

    - Objectives section (short summary)
    - Detailed development plan and approach
    - Alternatives considered
    - Empty progress section ready for updates

5. After creating the file, create or update .claude/sessions/.current-session to track the active session filename.

6. Confirm the session has started

7. If it's a development instructions, show the approach from point 3 to the user and ask if they want to proceed with implemenation or if they want to clarify anything. In case the user has clarifications, update the session file afterwards to reflect those.
