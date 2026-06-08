# Reach Consensus V1 Product Design

Date: 2026-06-08

## Product Summary

Reach Consensus is a light-mode proposal platform for Cisco account teams. It lets AEs, SEs, services contributors, and invited channel partners create customer-facing microsites for complex sales proposals. Customers access the microsite by named invitation, review approved material, comment by section, and request changes.

The central product principle is that every proposal should tell the "One Cisco" platform story. Reach Consensus should help the Cisco team explain how multiple products, architectures, services, licensing terms, and operational changes compound into a larger business outcome: 1+1=3.

## V1 Product Shape

Reach Consensus has two primary surfaces:

1. Internal workspace
2. Customer microsite

The internal workspace is where Cisco and invited partners build the proposal. It supports guided setup, AI chat, source uploads, section selection, AI drafting, section approval, internal discussion, versioning, publishing, and engagement analytics.

The customer microsite is the polished, invite-only proposal experience. It shows only approved published content. It supports section-level comments, tracked change requests, approved embedded documents, approved generated visuals, and controlled downloads.

Cisco controls the narrative and publishing. Customers interact with the approved story.

## V1 Workflow

The first successful workflow should be:

1. AE creates a proposal space.
2. AE invites Cisco users, partner contributors, and named customer contacts.
3. AE chooses which proposal sections to include.
4. Cisco and partner users describe the customer, problem, current state, proposed solution, business drivers, stakeholders, timeline, risks, and desired outcomes through structured fields and chat.
5. Users upload supporting material such as architecture drawings, quotes, BOMs, licensing docs, services scopes, SOWs, partner notes, customer requirements, and other proposal files.
6. AI digests the source material, extracts facts, identifies gaps, generates the One Cisco platform story, drafts selected sections, proposes value threads, and flags unsupported claims or missing inputs.
7. Cisco owners review and approve each section.
8. The AE publishes a customer-facing microsite version.
9. Customers view the proposal, comment by section, and submit change requests.
10. Cisco and partner users discuss internally, revise sections, approve updates, and republish.
11. Cisco users track engagement, version history, approvals, comments, downloads, and change requests.

## Proposal Microsite Sections

Sections are modular. During setup, the AE chooses which sections to include. The internal team can add or remove sections before publishing.

Recommended default sections:

- Executive Summary: CIO-level narrative focused on business outcomes, risk, urgency, and why the architecture matters now.
- Platform Story: the One Cisco spine explaining how multiple products and architectures compound into platform value.
- Reference Architecture: current-state versus future-state architecture, with support for multiple architecture domains inside one proposal.
- Business Value: value drivers, expected outcomes, risks avoided, operational impact, and business rationale where supportable.
- Quote / BOM: customer-readable quote and bill of materials, with optional downloadable detail.
- Services: Cisco-recommended value delivery path, including responsibilities for Cisco Advanced Services, specialized partners, traditional partners, and customer resources.
- Licensing: licensing terms, enterprise agreement and pricing term context, entitlement notes, renewal considerations, and linked supporting documents.
- Operations & Management: training, managed service options, operating model changes, day-2 support, adoption, and change management.
- Discussion: customer comments, questions, and requested changes tied back to proposal sections.
- Decision & Next Steps: buying decision path, open dependencies, approval milestones, and implementation kickoff path.
- Assumptions & Risks: customer-facing record of design assumptions, delivery dependencies, scope boundaries, and tradeoffs of deviating from the recommended services path.

## One Cisco Story Spine

The One Cisco story should be persistent across the microsite, not isolated to a single tab.

The platform should help the team show:

- The customer's current-state fragmentation.
- The recommended future-state platform architecture.
- The role each Cisco product, architecture, and service plays.
- How individual parts reinforce each other.
- What business outcomes the integrated design enables.
- How the services path converts purchase into value delivery.
- What risks the customer assumes when they deviate from the Cisco recommended approach.

The story spine should appear in the Executive Summary, Platform Story, Architecture, Business Value, Services, Licensing, Operations, and Discussion flows.

## Dynamic Content Model

Reach Consensus should be a dynamic proposal content system, not only an AI-written page generator.

Microsite sections should support flexible content blocks:

- AI-generated narrative blocks
- embedded uploaded documents, especially PDFs and approved proposal files
- downloadable files
- quote and BOM tables
- licensing tables and linked terms
- current-state and future-state architecture visuals
- generated infographics
- services responsibility maps
- value journey timelines
- assumptions and risk callouts
- customer comment threads tied to a section or block

Uploaded files have two paths:

- Source material: internal-only documents used by AI to understand the deal.
- Published assets: approved files or generated visuals that can be embedded in the customer microsite or made downloadable.

This allows a proposal section to combine a traditional proposal document, generated infographic, services matrix, pricing table, architecture visual, and AI-authored narrative in the same customer experience.

## Roles and Permissions

V1 roles:

- Workspace Owner: usually the AE. Creates proposal spaces, manages access, publishes versions, and owns the customer relationship.
- Cisco Contributor: SEs, services, specialists, leadership, pricing, and licensing contributors. Can add source material, draft or edit sections, comment internally, and approve sections they own.
- Partner Contributor: invited channel partner users. Can contribute to assigned sections, upload files, comment internally, and review services responsibilities. Cannot publish.
- Customer Viewer / Commenter: invited customer users. Can view published microsite sections, comment, request changes, and download approved files when allowed.
- Admin: manages templates, organization settings, audit policy, retention, and approved AI/model settings.

Access should be invite-only and named-user based. V1 should not support anonymous public proposal links.

## Governance

Governance rules:

- AI output is always draft until approved by a Cisco owner.
- Every section has an owner and state: draft, needs review, approved, published.
- Customer-facing publishes create immutable version snapshots.
- Internal notes, source files, AI prompts, draft content, and private strategy discussion never appear on the customer microsite unless deliberately promoted into approved content.
- Customer comments can become tracked change requests with owner, status, due date, and linked section.
- Analytics are visible only to internal Cisco and partner users with permission.
- If permissions are unclear, content defaults to internal-only.
- If a section is unpublished or unapproved, customers never see it.

## AI Experience

AI should feel like a guided proposal partner rather than a blank chatbot.

The internal workspace AI panel should support:

- Opportunity intake: asks clarifying questions about the customer, current state, desired outcomes, stakeholders, urgency, constraints, and Cisco solution components.
- Document digestion: summarizes uploaded drawings, quotes, BOMs, SOWs, licensing docs, and customer requirements; extracts key facts; flags contradictions and missing inputs.
- One Cisco story builder: identifies how multiple architectures reinforce each other and turns that into a platform narrative, value threads, and executive summary language.
- Section drafting: generates drafts for selected microsite sections using approved templates and uploaded source material.
- Infographic and diagram support: suggests visuals such as current versus future state, value journey, services responsibility map, or business value model.
- Risk and gap detection: calls out unsupported claims, missing assumptions, unclear services ownership, licensing ambiguity, and scope decisions that may increase customer-held risk.
- Revision assistant: helps respond to customer comments and change requests and proposes section updates.

AI should cite or reference the source material it used wherever practical. Unsupported content should be labeled as an assumption or recommendation, not a fact.

## Comments and Change Requests

V1 should include two collaboration channels:

- Section-level customer feedback: comments and questions pinned to microsite sections or content blocks.
- Internal deal-team discussion: Cisco and partner-only threads for strategy, clarifications, edits, and approvals.

Customer comments can be converted into tracked change requests. Change requests should include a linked section, owner, status, due date, and resolution notes.

## Engagement Analytics and Audit

The analytics experience should help the AE understand customer momentum without becoming creepy or noisy.

V1 should track:

- named user visits
- section views
- approximate time spent by section
- comments and change requests
- file views and downloads
- quote/BOM and licensing engagement
- publish/version history
- invite status and last access date

Each proposal should have an activity timeline for deal-team review. Example events include:

- CIO viewed Executive Summary.
- Director of Infrastructure opened Services.
- Customer requested a change on Operations.
- PDF downloaded.
- Version 4 published.

Reach Consensus should also keep an audit record of who approved sections, who published versions, and what content was visible to the customer at any point in time.

Screenshot detection should not be promised as reliable V1 telemetry. The product should instead support confidentiality markings, named-user access, download tracking, and optional watermarking on exported materials.

## Platform Architecture Direction

Recommended first-build architecture:

- Next.js on Vercel for the app, internal workspace, customer microsites, server routes, and deployment.
- Supabase Postgres for proposals, organizations, users, roles, sections, approvals, comments, change requests, analytics events, versions, and audit records.
- Supabase Auth for named invite-only access, role and permission checks, and row-level security.
- Supabase Storage for uploaded source materials and approved customer downloads.
- Vector/RAG layer over uploaded artifacts and proposal context so AI drafts from the actual opportunity record.
- AI generation service layer for digestion, section generation, diagrams, infographics, claim checking, and revision suggestions.
- Event tracking pipeline for section views, time spent, comments, downloads, publish events, and version snapshots.

Internal source materials, draft content, AI intermediate outputs, and customer-facing published versions should be stored separately enough that permissions are easy to reason about. The customer microsite should read from published snapshots, not live draft workspace content.

## UX Principles

Reach Consensus should feel like a guided, high-value workbench rather than a heavy proposal authoring system.

Principles:

- Light mode, enterprise-clean, low friction.
- Wizard for setup, workspace for collaboration, polished microsite for the customer.
- AI suggests; humans approve.
- Tabs are configurable, but the One Cisco spine remains visible.
- Every important customer-facing claim should be traceable to a source, assumption, or Cisco recommendation.
- Dynamic content blocks allow narratives, uploaded docs, infographics, tables, diagrams, and embedded files to live together.

V1 should avoid:

- public anonymous proposal links
- reliable screenshot detection promises
- fully autonomous publishing
- overcomplicated template administration
- trying to support every possible analytics signal before the core workflow works

## Error Handling and Trust

Trust rules:

- If AI cannot support a claim, mark it as an assumption.
- If a file cannot be digested, keep it available as an upload and flag it for manual review.
- If permissions are unclear, default to internal-only.
- If section content is unapproved, it cannot be published.
- If a published version changes, create a new version snapshot rather than mutating what the customer already saw.

## Open Product Questions for Later

These questions do not block V1 design:

- Which Cisco identity provider should be primary for internal users?
- Which customer identity flow is preferred for invite-only access?
- Which AI providers and image/diagram generation tools should be approved?
- Which source document formats must be supported first beyond PDFs, images, spreadsheets, and common office documents?
- Which Cisco proposal templates or solution-area templates should seed the template library?
- How should watermarking be handled for customer exports?
