# Merge

**The pull request for reality.** An AI agent proposes a coordinated changeset across your company's tools; you review a git-style diff, approve or reject individual hunks, and hit **Merge** — only then do real side effects execute. One click to **Revert**.

> Agents propose. Humans merge.

Built for c0mpiled-13 (Transpose Platform · YC Startup School Hackathon II).

## Stack
- Next.js 15 (App Router) · TypeScript · Tailwind · Framer Motion
- Anthropic Claude (`claude-opus-4-8`, structured outputs) — changeset generation
- Hexclave — auth, RBAC hunk-gating, Data Vault
- Real execution adapters: Resend (email), Linear (issues), Slack (messages)
- Stretch: Channel3 (agentic shopping), CrustData (company enrichment)

## Status
🚧 Hackathon build in progress.
