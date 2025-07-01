Start a new development session by creating a session file in .claude/sessions/ with the format YYYY-MM-DD-HHMM-$ARGUMENTS.md (or just YYYY-MM-DD-HHMM.md if no name provided).

The session file should begin with:

Session name and timestamp as the title
Session overview section with start time
Goals section (ask user for goals if not clear)
Empty progress section ready for updates
After creating the file, create or update .claude/sessions/.current-session to track the active session filename.

Confirm the session has started and remind the user they can:

Update it with /project:session-update
End it with /project:session-end
