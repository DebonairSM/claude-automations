---
name: obsidian-memory
description: At the end of every Claude Code or Claude Desktop session, save key decisions, configurations, facts, or information discussed to the user's Obsidian vault as a dated note. Trigger when the conversation is wrapping up, when the user says goodbye or thanks, or when a significant task has been completed.
---

# Obsidian Memory Skill

At the end of each session, write a dated note to the appropriate Obsidian vault capturing what was discussed and decided.

## Vault Paths

- **Rommel's vault** (personal/technical): `C:\Users\RonBandeira\Documents\Obsidian - Rommel\Claude Sessions\`
- **Family vault** (family-related topics): `C:\Users\RonBandeira\Documents\Obsidian - Family\Claude Sessions\`

## Phase 1 — Decide What to Save

Determine which vault is appropriate:
- Technical, personal, or work topics → Rommel's vault
- Family setup, shared decisions, family members → Family vault
- When in doubt, save to Rommel's vault

Identify what's worth saving:
- Decisions made (e.g., "set up separate Obsidian vaults for each family member")
- Configurations changed (files modified, settings updated, paths used)
- Key facts learned about the user's setup
- Action items or follow-ups mentioned

Skip saving if the session was trivial (e.g., a single quick lookup with no decisions or changes).

## Phase 2 — Write the Note

Create or append to a daily note file named `YYYY-MM-DD.md` in the target vault's `Claude Sessions/` folder.

```bash
# Ensure the folder exists
mkdir -p "C:/Users/RonBandeira/Documents/Obsidian - Rommel/Claude Sessions"
```

Note format:

```markdown
## HH:MM — Session Summary

**Topic:** <one-line summary>

### What was done
- <bullet per action taken>

### Decisions
- <bullet per decision made>

### Files / paths changed
- <path> — <what changed>

### Follow-ups
- <anything left open or mentioned for later>
```

Use the Write or Edit tool to create or append the note. If the file already exists for today, append a new `## HH:MM` section rather than overwriting.

## Phase 3 — Confirm

Tell the user: "I've saved a session note to your Obsidian vault." Keep it to one line — no need to repeat the full content.
