---
name: obsidian-configure
description: Interview a business owner to configure their Obsidian vault for their specific workflow. Use when setting up Obsidian for a new Sunny Cowork customer, or when a user wants to configure or restructure their Obsidian vault based on how their business actually works.
---

# Obsidian Business Configuration Interview

Your goal is to understand how the business owner thinks and works, then configure their Obsidian vault to match — not impose a generic system on them.

Work through the interview phases below. Ask one section at a time. Listen for the actual workflow before suggesting structure. Do not recommend templates, plugins, or folder structures until Phase 3.

---

## Phase 1 — Business Overview

Ask the following questions. Wait for full answers before moving on.

1. What does your business do, and what's your role day-to-day?
2. What kinds of things do you most need to keep track of? (clients, projects, ideas, meetings, finances, tasks?)
3. Do you currently use any system for notes — paper, apps, spreadsheets? What works and what doesn't?
4. Who else, if anyone, will use or see this vault? (solo use, shared with a team, or exported for clients?)

---

## Phase 2 — Workflow Deep Dive

Based on their answers, dig into the specific areas they mentioned. Pick the relevant sub-sections.

### If they track clients or customers:
- How do you manage client relationships? (ongoing retainers, one-time projects, leads?)
- What do you need to know at a glance about a client?
- Do you have recurring touchpoints (weekly calls, monthly reports)?

### If they run projects:
- How do you define a project? Does it have a start/end date, deliverables, a team?
- What does done look like for a project?
- Do projects have sub-tasks or phases?

### If they take a lot of meetings:
- How often do you have meetings, and with whom?
- What do you do with meeting notes afterward? (share them, action items, archive?)

### If they manage ideas or content:
- How do ideas come to you — in a rush or slowly over time?
- Do ideas connect to projects, or do they live separately?
- Do you publish or share content externally?

### If they track finances or sales:
- Do you need to track invoices, pipeline, or revenue in notes?
- Or is that handled in a separate tool (QuickBooks, a spreadsheet)?

---

## Phase 3 — Synthesize and Propose

Based on the interview, propose a vault structure. Present it as a starting point, not a final answer.

### Folder Structure

Derive the folder structure from what they actually said. Common patterns:

**Client-focused business:**
```
📁 Clients/
   📁 [Client Name]/
      - Profile.md
      - Meeting Notes/
      - Projects/
📁 Projects/
📁 Meetings/
📁 Inbox/          ← quick capture, processed weekly
📁 Archive/
```

**Creator / knowledge worker:**
```
📁 Areas/          ← ongoing responsibilities
📁 Projects/       ← active work with a finish line
📁 Resources/      ← reference material
📁 Archive/
📁 Inbox/
```

**Solo operator / consultant:**
```
📁 Clients/
📁 Operations/     ← SOPs, templates, recurring processes
📁 Finance/        ← invoices, pipeline notes
📁 Inbox/
📁 Archive/
```

Adjust based on what came out of the interview. Explain each folder in one sentence tied to something they said.

---

## Phase 4 — Templates

Create starter templates for the 2–3 note types they will use most. Ask which types they want:

- **Client Profile** — fields for contact info, relationship history, active projects
- **Meeting Note** — date, attendees, agenda, decisions, action items
- **Project Brief** — goal, deliverables, timeline, status
- **Weekly Review** — wins, open loops, priorities for next week
- **Idea Note** — one-liner summary, context, related projects

For each chosen template, create the file at `<VAULT>/Templates/<TemplateName>.md`.

---

## Phase 5 — Plugin Recommendations

Recommend only plugins that directly address something they said in the interview. Do not recommend more than 5.

| Plugin | When to recommend |
|--------|------------------|
| **Templater** | They want auto-populated templates (dates, prompts) |
| **Dataview** | They want to query across notes (e.g. "show all active clients") |
| **Calendar** | They have daily or weekly notes as a core habit |
| **Tasks** | They want to track action items across notes |
| **Kanban** | They think in boards/stages (leads pipeline, project phases) |
| **Excalidraw** | They sketch, diagram, or think visually |
| **QuickAdd** | They want fast capture without leaving the keyboard |

For each recommended plugin, explain in one sentence why it fits their specific workflow.

---

## Phase 6 — Build the Vault

Once the structure and templates are agreed on, create the folders and template files.

### Create folders

```powershell
$vault = $env:OBSIDIAN_VAULT
# Create agreed-upon folders (adjust list to match Phase 3 proposal)
"Inbox","Archive","Templates" | ForEach-Object {
    New-Item -ItemType Directory -Force -Path "$vault\$_"
}
```

Create the business-specific folders based on the Phase 3 proposal:

```powershell
# Example — adjust to actual agreed structure
New-Item -ItemType Directory -Force -Path "$vault\Clients"
New-Item -ItemType Directory -Force -Path "$vault\Projects"
New-Item -ItemType Directory -Force -Path "$vault\Meetings"
```

### Create templates

Write each agreed-upon template file to `$vault\Templates\`. Use the content from Phase 4.

---

## Phase 7 — Handoff

Summarize the vault setup:
- Folder structure created (list folders)
- Templates created (list templates)
- Plugins to install (list with links to the Obsidian community plugin browser)
- One quick tip tailored to how they said they work

Remind them: the vault should evolve. If a folder never gets used, delete it. If they keep putting things in Inbox and never processing it, change the workflow — not themselves.
