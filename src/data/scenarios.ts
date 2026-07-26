// ============================================================================
// Merge — SEEDED SCENARIO CHANGESETS
// Three fully-authored, demo-ready changesets. Each spans multiple Systems,
// carries realistic before/after state, and plants at least TWO `danger`
// landmines whose `conflict` + `evidence` are drawn from companyState.json.
//
// The generator (src/lib/generateChangeset.ts) deep-clones these for the
// demo-safe path. Ids are stable so the UI and execution layer can reason
// about them. Every Change.status starts "pending".
// ============================================================================

import type { Changeset, ScenarioId } from "@/types/changeset";

// NOTE: The shared `System` enum has no dedicated "calendar" system, so
// calendar / scheduling hunks are modeled under `gmail` (Google Workspace)
// with a `noop` execution and a descriptive title. See the final report.

export const SCENARIO_CHANGESETS: Record<ScenarioId, Changeset> = {
  // --------------------------------------------------------------------------
  // 1) LAUNCH ENTERPRISE
  // --------------------------------------------------------------------------
  "launch-enterprise": {
    id: "launch-enterprise",
    goal: "Launch our enterprise plan next Monday.",
    summary:
      "Coordinated enterprise launch: pricing, launch project, customer announcement, permissions, calendar, and CRM — with 2 blocking conflicts flagged.",
    createdAt: "2026-07-25T00:00:00.000Z",
    changes: [
      {
        id: "launch-enterprise-1",
        system: "stripe",
        title: "Raise enterprise plan floor $500 → $1,500/mo",
        before: "Enterprise plan minimum is $500/mo (enterpriseMinMonthly).",
        after:
          "Enterprise plan minimum set to $1,500/mo (proposedEnterpriseMinMonthly).",
        risk: "review",
        requiredRole: "finance",
        conflict: null,
        evidence:
          "pricing.enterpriseMinMonthly = 500; pricing.proposedEnterpriseMinMonthly = 1500 — a 3x price change requires finance sign-off.",
        execution: {
          kind: "noop",
          note: "Would update the Enterprise price object in Stripe from $500 to $1,500/mo (mock).",
        },
        status: "pending",
      },
      {
        id: "launch-enterprise-2",
        system: "linear",
        title: "Create \"Enterprise Launch\" project",
        before: "No launch project exists in Linear.",
        after:
          "New Linear project \"Enterprise Launch\" with milestones for pricing, docs, and GTM.",
        risk: "safe",
        requiredRole: "engineering",
        conflict: null,
        evidence: null,
        execution: {
          kind: "linear",
          title: "Enterprise Launch",
          description:
            "Ship the Enterprise plan by Monday. Milestones: (1) Stripe price object live, (2) pricing page + docs updated, (3) customer announcement approved by Legal, (4) permissions scoped, (5) launch kickoff. Owner: Jordan Reyes.",
        },
        status: "pending",
      },
      {
        id: "launch-enterprise-3",
        system: "slack",
        title: "Announce launch in #launch",
        before: "#launch channel has no launch kickoff post.",
        after: "Internal heads-up posted to #launch with the launch checklist.",
        risk: "safe",
        requiredRole: "marketing",
        conflict: null,
        evidence: null,
        execution: {
          kind: "slack",
          text:
            ":rocket: Enterprise plan goes live Monday! New floor is $1,500/mo. Launch project is in Linear, customer email is pending Legal review, and kickoff is Monday AM. Questions -> #launch.",
        },
        status: "pending",
      },
      {
        id: "launch-enterprise-4",
        system: "gmail",
        title: "Email enterprise launch announcement to customers",
        before: "No launch announcement has been sent to customers.",
        after:
          "Announcement emailed to the customer list touting the new Enterprise plan — copy claims \"SOC 2 certified\".",
        risk: "danger",
        requiredRole: "legal",
        conflict:
          "Acme is NOT SOC 2 certified (in progress, target Q4). The email falsely claims \"SOC 2 certified\" — an unapproved, prohibited marketing claim.",
        evidence:
          "company.soc2Certified = false (soc2Note: \"in progress, target Q4\"); \"SOC 2 certified\" is in claims.prohibitedClaims and absent from claims.approvedMarketingClaims.",
        execution: {
          kind: "email",
          to: "customers@acme.dev",
          subject: "Introducing Acme Enterprise — built for teams that scale",
          html:
            "<div style=\"font-family:system-ui,sans-serif;line-height:1.5\">"
            + "<h1>Acme Enterprise is here</h1>"
            + "<p>Today we're launching the Acme Enterprise plan: dedicated support, advanced controls, and enterprise-grade security.</p>"
            + "<p><strong>Acme is SOC 2 certified</strong>, encrypts your data in transit and at rest, and offers SSO via Google and Okta.</p>"
            + "<p>Plans start at $1,500/mo. <a href=\"https://acme.dev/enterprise\">Talk to sales →</a></p>"
            + "<p>— The Acme Team</p>"
            + "</div>",
        },
        status: "pending",
      },
      {
        id: "launch-enterprise-5",
        system: "permissions",
        title: "Grant marketing agent billing.write access",
        before:
          "Marketing agent is read-only on billing (permissions.roles.marketing.billing = \"read\").",
        after: "Marketing agent granted billing.write (Stripe write) access.",
        risk: "danger",
        requiredRole: "finance",
        conflict:
          "Over-scoped: marketing is read-only on billing; write access is not required for the launch. Violates least-privilege.",
        evidence:
          "permissions.roles.marketing.billing = \"read\" (note: \"Marketing is READ-ONLY on billing / Stripe.\"); permissions.policy = \"least-privilege\".",
        execution: {
          kind: "noop",
          note: "Would elevate the marketing agent's billing scope from read to write (mock). No launch task needs this.",
        },
        status: "pending",
      },
      {
        id: "launch-enterprise-6",
        system: "gmail",
        title: "Schedule launch kickoff — Monday 10:00am",
        before: "No launch kickoff is on the calendar.",
        after:
          "Launch kickoff proposed for Monday 10:00am with Maya, Jordan, Priya.",
        risk: "review",
        requiredRole: "engineering",
        conflict:
          "Scheduling clash: Maya already has the investor meeting Monday 10:00–11:00am. She cannot attend both.",
        evidence:
          "calendar[evt-investor-monday] = \"Investor meeting — Maya + Dana\", Monday 10:00–11:00 (attendees include Maya Chen).",
        execution: {
          kind: "noop",
          note: "Would create a \"Launch Kickoff\" calendar event Monday 10:00am (mock). Conflicts with Maya's investor meeting.",
        },
        status: "pending",
      },
      {
        id: "launch-enterprise-7",
        system: "crm",
        title: "Tag 46 Growth accounts as enterprise-upsell targets",
        before: "Growth accounts are untagged for the enterprise motion.",
        after:
          "~46 Growth accounts tagged \"enterprise-upsell\" for the launch sequence.",
        risk: "safe",
        requiredRole: "marketing",
        conflict: null,
        evidence:
          "crm.growthSegment.count = 46 (combinedMrr $4,554) — existing accounts, no external side-effect.",
        execution: {
          kind: "noop",
          note: "Would add the \"enterprise-upsell\" tag to ~46 Growth accounts in the CRM (mock).",
        },
        status: "pending",
      },
      {
        id: "launch-enterprise-8",
        system: "gmail",
        title: "Schedule launch retro — Friday 3:00pm",
        before: "No post-launch retro is scheduled.",
        after: "Launch retro booked for Friday 3:00pm with the launch team.",
        risk: "safe",
        requiredRole: "engineering",
        conflict: null,
        evidence: null,
        execution: {
          kind: "noop",
          note: "Would create a \"Launch Retro\" calendar event Friday 3:00pm (mock). No conflicts found.",
        },
        status: "pending",
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 2) ONBOARD HIRE (Maya)
  // --------------------------------------------------------------------------
  "onboard-hire": {
    id: "onboard-hire",
    goal: "Onboard our new engineer, Maya, starting Monday.",
    summary:
      "Onboarding for Maya Chen: accounts, first-week plan, welcome, and equipment — with 2 blocking conflicts flagged (over-broad access, credentials emailed externally).",
    createdAt: "2026-07-25T00:00:00.000Z",
    changes: [
      {
        id: "onboard-hire-1",
        system: "linear",
        title: "Create Maya's first-week onboarding checklist",
        before: "No onboarding project exists for Maya.",
        after:
          "Linear project \"Maya — First Week\" with setup, codebase tour, and first PR tasks.",
        risk: "safe",
        requiredRole: "engineering",
        conflict: null,
        evidence: null,
        execution: {
          kind: "linear",
          title: "Maya — First Week Onboarding",
          description:
            "Day 1: laptop + SSO setup, repo access (read), meet the Platform team. Day 2–3: codebase tour with Jordan, dev env running. Day 4–5: first scoped PR. Buddy: Jordan Reyes.",
        },
        status: "pending",
      },
      {
        id: "onboard-hire-2",
        system: "slack",
        title: "Post welcome in #team",
        before: "Team hasn't been introduced to Maya.",
        after: "Welcome message posted to #team introducing Maya.",
        risk: "safe",
        requiredRole: "engineering",
        conflict: null,
        evidence: null,
        execution: {
          kind: "slack",
          text:
            ":wave: Everyone welcome Maya Chen, joining the Platform team as a Staff Engineer this Monday! Say hi in the thread. Buddy: Jordan.",
        },
        status: "pending",
      },
      {
        id: "onboard-hire-3",
        system: "gmail",
        title: "Send Maya a welcome email",
        before: "Maya has not received a welcome / day-one email.",
        after: "Warm welcome email sent to Maya with her first-day logistics.",
        risk: "safe",
        requiredRole: "engineering",
        conflict: null,
        evidence: null,
        execution: {
          kind: "email",
          to: "maya@acme.dev",
          subject: "Welcome to Acme, Maya! 🎉",
          html:
            "<div style=\"font-family:system-ui,sans-serif;line-height:1.5\">"
            + "<h1>Welcome to Acme, Maya!</h1>"
            + "<p>We're thrilled you're joining the Platform team on Monday. Here's your first day:</p>"
            + "<ul>"
            + "<li><strong>9:30am</strong> — Meet Jordan (your onboarding buddy) at the front desk</li>"
            + "<li><strong>10:00am</strong> — Laptop + SSO setup</li>"
            + "<li><strong>12:00pm</strong> — Team lunch</li>"
            + "</ul>"
            + "<p>You'll receive your accounts via SSO and a 1Password invite — no passwords over email. See you Monday!</p>"
            + "<p>— The Acme Team</p>"
            + "</div>",
        },
        status: "pending",
      },
      {
        id: "onboard-hire-4",
        system: "permissions",
        title: "Grant Maya admin + production database write access",
        before:
          "IC engineers get scoped deploy + prod DB read; no admin by default.",
        after:
          "Maya granted org admin and production database WRITE on her first day.",
        risk: "danger",
        requiredRole: "engineering",
        conflict:
          "Over-scoped: a brand-new IC is being granted org admin + prod DB write on day one. Violates least-privilege; prod access is break-glass only.",
        evidence:
          "permissions.roles.engineering.admin = \"no\", prodDb = \"read\"; security.prodAccess = \"Break-glass only; time-boxed; approved by the Engineering Lead.\" Maya is an IC (people[Maya Chen]).",
        execution: {
          kind: "noop",
          note: "Would grant Maya org-admin + production DB write (mock). Standard onboarding only needs repo read + scoped deploy.",
        },
        status: "pending",
      },
      {
        id: "onboard-hire-5",
        system: "gmail",
        title: "Email Maya's initial credentials to her personal Gmail",
        before: "No credentials have been sent.",
        after:
          "Plaintext password + API keys emailed to Maya's external personal Gmail.",
        risk: "danger",
        requiredRole: "engineering",
        conflict:
          "Sends plaintext credentials and API keys to an external personal email — a direct violation of the credential policy. Use SSO + a 1Password invite instead.",
        evidence:
          "security.credentialPolicy = \"Never send passwords, API keys, or tokens over email or to external addresses...\"; equipment.provisioning = \"SSO + 1Password invite. Credentials are never sent over email.\"",
        execution: {
          kind: "noop",
          note: "Would email a temp password + prod API key to maya.personal@gmail.com (mock). Blocked by credential policy.",
        },
        status: "pending",
      },
      {
        id: "onboard-hire-6",
        system: "permissions",
        title: "Add Maya to Slack, Linear, and repo (read) as a member",
        before: "Maya has no accounts provisioned yet.",
        after:
          "Maya added to Slack + Linear as a member and to the monorepo with read access via SSO.",
        risk: "safe",
        requiredRole: "engineering",
        conflict: null,
        evidence:
          "Matches default IC scope: permissions.roles.engineering.prodDb = \"read\", prodDeploy = \"scoped\".",
        execution: {
          kind: "noop",
          note: "Would provision Maya's member-level Slack, Linear, and repo-read access via SSO (mock).",
        },
        status: "pending",
      },
      {
        id: "onboard-hire-7",
        system: "shopping",
        title: "Order Maya's standard engineering equipment",
        before: "Maya has no assigned hardware.",
        after:
          "Standard eng loadout ordered: MacBook Pro 16\", Studio Display, YubiKey x2.",
        risk: "safe",
        requiredRole: "engineering",
        conflict: null,
        evidence:
          "equipment.standardEngLoadout; equipment.budgetPerHireUSD = 4500 (within budget).",
        execution: {
          kind: "noop",
          note: "Would order the standard eng loadout for Maya, ~$4,500, within per-hire budget (mock).",
        },
        status: "pending",
      },
      {
        id: "onboard-hire-8",
        system: "gmail",
        title: "Schedule Maya's day-one setup + team lunch (Monday 12:00pm)",
        before: "No onboarding events are on the calendar.",
        after:
          "Day-one setup (9:30am) and team lunch (12:00pm) booked for Monday.",
        risk: "safe",
        requiredRole: "engineering",
        conflict: null,
        evidence: null,
        execution: {
          kind: "noop",
          note: "Would add Maya's day-one setup and team-lunch calendar events for Monday (mock). Avoids her 10:00am investor meeting.",
        },
        status: "pending",
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 3) CUSTOMER OUTAGE (Acme Corp)
  // --------------------------------------------------------------------------
  "customer-outage": {
    id: "customer-outage",
    goal: "Respond to the production outage affecting Acme Corp.",
    summary:
      "Incident response for the Acme Corp outage: ticket, status post, war-room, postmortem, and credit — with 2 blocking conflicts flagged (over-promised SLA, over-broad prod access).",
    createdAt: "2026-07-25T00:00:00.000Z",
    changes: [
      {
        id: "customer-outage-1",
        system: "linear",
        title: "Open incident ticket for the Acme Corp outage",
        before: "No incident ticket exists for the outage.",
        after:
          "Sev-1 incident ticket opened in Linear with timeline and owner.",
        risk: "safe",
        requiredRole: "engineering",
        conflict: null,
        evidence: null,
        execution: {
          kind: "linear",
          title: "[SEV-1] Production outage affecting Acme Corp",
          description:
            "Impact: Acme Corp (24 seats) seeing elevated errors / degraded service. Owner: Jordan Reyes. Actions: mitigate, confirm scope, comms to customer, postmortem. Started tracking at first alert.",
        },
        status: "pending",
      },
      {
        id: "customer-outage-2",
        system: "slack",
        title: "Post incident status to #incident",
        before: "#incident channel has no post for this outage.",
        after: "Status posted to #incident with impact, owner, and next update.",
        risk: "safe",
        requiredRole: "engineering",
        conflict: null,
        evidence: null,
        execution: {
          kind: "slack",
          text:
            ":rotating_light: SEV-1: production issue affecting Acme Corp. Investigating now. Owner: Jordan. War-room 2–4pm. Next update in 30 min.",
        },
        status: "pending",
      },
      {
        id: "customer-outage-3",
        system: "gmail",
        title: "Email Acme Corp an apology with a 99.99% SLA + full-month credit",
        before: "Acme Corp has not received outage comms.",
        after:
          "Email promises a 99.99% uptime SLA guarantee and a 100% (full-month) service credit.",
        risk: "danger",
        requiredRole: "legal",
        conflict:
          "Over-promises: guarantees a 99.99% uptime SLA and a full-month credit that are not in Acme Corp's contract and not approved by finance/legal.",
        evidence:
          "crm.accounts[Acme Corp].contractSla = \"99.5% monthly uptime; service credits capped at 10% of monthly fee\"; \"99.99% uptime SLA\" is in claims.prohibitedClaims.",
        execution: {
          kind: "email",
          to: "ops@acmecorp.example.com",
          subject: "An update on today's service disruption — and our apology",
          html:
            "<div style=\"font-family:system-ui,sans-serif;line-height:1.5\">"
            + "<h1>We're sorry about today's disruption</h1>"
            + "<p>Earlier today Acme Corp experienced degraded service. Our team is on it and we'll share a full postmortem.</p>"
            + "<p>To make this right, we're upgrading your account to a <strong>99.99% uptime SLA guarantee</strong> and issuing a <strong>full-month (100%) service credit</strong>, effective immediately.</p>"
            + "<p>Thank you for your patience.</p>"
            + "<p>— The Acme Team</p>"
            + "</div>",
        },
        status: "pending",
      },
      {
        id: "customer-outage-4",
        system: "permissions",
        title: "Grant the on-call vendor broad production access",
        before:
          "Prod access is break-glass only, time-boxed, approved by the Eng Lead.",
        after:
          "Standing production root/write access granted to an external on-call vendor.",
        risk: "danger",
        requiredRole: "engineering",
        conflict:
          "Over-scoped: grants an external vendor standing production root access beyond the incident scope. Prod access must be break-glass, time-boxed, and Eng-Lead approved.",
        evidence:
          "security.prodAccess = \"Break-glass only; time-boxed; approved by the Engineering Lead. No standing admin for ICs or vendors.\"",
        execution: {
          kind: "noop",
          note: "Would grant a third-party vendor standing prod root access (mock). Should be time-boxed break-glass instead.",
        },
        status: "pending",
      },
      {
        id: "customer-outage-5",
        system: "gmail",
        title: "Schedule an incident war-room (today 2:00–4:00pm)",
        before: "No war-room is scheduled.",
        after: "War-room booked today 2:00–4:00pm with on-call engineering.",
        risk: "safe",
        requiredRole: "engineering",
        conflict: null,
        evidence: null,
        execution: {
          kind: "noop",
          note: "Would create a \"War-room: Acme Corp outage\" calendar event today 2:00–4:00pm (mock).",
        },
        status: "pending",
      },
      {
        id: "customer-outage-6",
        system: "crm",
        title: "Log the incident on the Acme Corp account",
        before: "Acme Corp's CRM record shows status \"active\", no incident note.",
        after:
          "Incident logged on the Acme Corp account; status flagged \"degraded\" with a timeline note.",
        risk: "safe",
        requiredRole: "engineering",
        conflict: null,
        evidence:
          "crm.accounts[Acme Corp] — largest Growth account (24 seats), currently affected.",
        execution: {
          kind: "noop",
          note: "Would append an incident timeline note to the Acme Corp CRM account and flag it degraded (mock).",
        },
        status: "pending",
      },
      {
        id: "customer-outage-7",
        system: "crm",
        title: "Create a postmortem doc for the Acme Corp outage",
        before: "No postmortem document exists.",
        after:
          "Blameless postmortem doc scaffolded with timeline, root cause, and action items.",
        risk: "safe",
        requiredRole: "engineering",
        conflict: null,
        evidence: null,
        execution: {
          kind: "noop",
          note: "Would create a blameless postmortem doc (timeline / root cause / action items) for the outage (mock).",
        },
        status: "pending",
      },
      {
        id: "customer-outage-8",
        system: "stripe",
        title: "Issue a $99 goodwill service credit to Acme Corp",
        before: "No credit has been applied to Acme Corp's invoice.",
        after:
          "One-month ($99) goodwill credit queued for Acme Corp — within the 10% contract cap policy.",
        risk: "review",
        requiredRole: "finance",
        conflict: null,
        evidence:
          "crm.accounts[Acme Corp].mrr = 99; contract caps credits at 10% of monthly fee — a $99 credit needs finance approval as goodwill above the cap.",
        execution: {
          kind: "noop",
          note: "Would queue a $99 service credit on Acme Corp's next Stripe invoice (mock). Finance to confirm vs. the 10% cap.",
        },
        status: "pending",
      },
    ],
  },
};
