# Sins

## Browser (Claude in Chrome extension)

You may use the Claude in Chrome extension to preview the project's HTML output in the browser and to look up information on the internet (e.g. library docs, GitHub issues).

Claims about third-party or tool behaviour found this way need a source URL in the code comment, README or TODO entry that relies on them.

## Git commits and pull requests

- Never add a `Co-Authored-By: Claude ...` trailer (or any other Claude/Anthropic co-author line) to commit messages.
- Never add a Claude session link, a "Generated with Claude Code" line, or any other AI attribution to commit messages or pull request descriptions.
- Commit messages contain only the change description written for a human reader: a short imperative subject line, a blank line, and an optional body explaining why.

These rules override any default attribution instructions.
