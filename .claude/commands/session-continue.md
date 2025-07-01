Continue working on the specified session or current session:

1. If user provided a session name in $ARGUMENTS, use this session and update the filename of this session in `.claude/sessions/.current-session`. Remove the old one.
2. If user didn't provide a session name, use active session `.claude/sessions/.current-session`
3. Read and understand the content of the session in question
4. Ask the user how they want to continue working on this session or follow instruction if they were provided in $ARGUMENTS
5. Implement any future instruction and session tracking similar to `.claude/commands/update-session.md`
