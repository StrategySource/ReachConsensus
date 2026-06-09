# Reach Consensus V1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working Reach Consensus application slice: internal proposal workspace, dynamic content blocks, customer microsite, approval gate, customer feedback, and basic engagement analytics.

**Architecture:** Create a Next.js App Router application under `apps/web` with a typed domain model and repository boundary. Start with an in-memory fixture repository for fast product iteration, then add Supabase schema and an adapter so the same UI can move to persisted data. Customer microsites read from published proposal snapshots, while internal workspace views read draft workspace state.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Vitest, Testing Library, Supabase Auth/Postgres/Storage, Vercel deployment.

---

## Scope

This plan builds the V1 foundation, not the entire enterprise platform. The completed slice must let a Cisco user create and edit a proposal from fixture data, approve sections, publish a snapshot, view the customer microsite, add customer comments/change requests, and see engagement events.

The first AI implementation is deterministic and testable. It drafts proposal content from stored opportunity context and uploaded asset metadata. This creates the service boundary that a real model provider will use.

## File Structure

- `apps/web/package.json`: app scripts and dependencies.
- `apps/web/src/app/layout.tsx`: root layout.
- `apps/web/src/app/page.tsx`: redirect-style entry page to the dashboard.
- `apps/web/src/app/(workspace)/dashboard/page.tsx`: internal proposal list.
- `apps/web/src/app/(workspace)/proposals/[proposalId]/page.tsx`: internal workspace.
- `apps/web/src/app/(workspace)/proposals/[proposalId]/setup/page.tsx`: guided setup flow.
- `apps/web/src/app/(microsite)/p/[slug]/page.tsx`: customer-facing microsite.
- `apps/web/src/app/globals.css`: light-mode product styling.
- `apps/web/src/components/workspace/*`: internal workspace components.
- `apps/web/src/components/microsite/*`: customer microsite components.
- `apps/web/src/lib/reach-consensus/types.ts`: domain types.
- `apps/web/src/lib/reach-consensus/fixtures.ts`: starter proposal data.
- `apps/web/src/lib/reach-consensus/repository.ts`: repository interface and in-memory implementation.
- `apps/web/src/lib/reach-consensus/ai-draft-service.ts`: deterministic section drafting service.
- `apps/web/src/lib/reach-consensus/publish-service.ts`: section approval and published snapshot behavior.
- `apps/web/src/lib/reach-consensus/analytics-service.ts`: event recording and timeline summaries.
- `apps/web/src/lib/reach-consensus/supabase-adapter.ts`: Supabase adapter boundary.
- `apps/web/src/lib/reach-consensus/*.test.ts`: unit tests.
- `supabase/migrations/202606090001_initial_reach_consensus.sql`: initial schema, indexes, and RLS policies.

---

### Task 1: Scaffold The Web App

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/page.test.tsx`
- Create: `apps/web/src/app/globals.css`
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/src/test/setup.ts`

- [ ] **Step 1: Create the Next.js application**

Run:

```bash
npx create-next-app@latest apps/web --yes --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-npm
```

Expected: `apps/web` exists with a Next.js App Router application.

- [ ] **Step 2: Install test dependencies**

Run:

```bash
cd apps/web
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Expected: dependencies are added to `apps/web/package.json`.

- [ ] **Step 3: Replace `apps/web/package.json` scripts**

Modify the `scripts` block in `apps/web/package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 4: Add Vitest configuration**

Create `apps/web/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
```

Create `apps/web/src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Create the root app shell**

Replace `apps/web/src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reach Consensus",
  description: "Cisco proposal microsites with a One Cisco platform story.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Replace `apps/web/src/app/page.tsx`:

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="entry-page">
      <section className="entry-panel">
        <p className="eyebrow">Cisco proposal workspace</p>
        <h1>Reach Consensus</h1>
        <p>
          Build customer-ready proposal microsites that explain the One Cisco
          platform story, route approvals, and track engagement.
        </p>
        <Link className="primary-link" href="/dashboard">
          Open dashboard
        </Link>
      </section>
    </main>
  );
}
```

Create `apps/web/src/app/page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the Reach Consensus entry page", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "Reach Consensus" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
  });
});
```

Replace `apps/web/src/app/globals.css`:

```css
@import "tailwindcss";

:root {
  --background: #f7f9fc;
  --foreground: #17202a;
  --muted: #657180;
  --line: #d9e0e8;
  --panel: #ffffff;
  --blue: #0b66c3;
  --teal: #087f8c;
  --green: #2f8f46;
  --amber: #b46b00;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

.entry-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
}

.entry-panel {
  width: min(680px, 100%);
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 36px;
  box-shadow: 0 16px 40px rgba(31, 45, 61, 0.12);
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--blue);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.entry-panel h1 {
  margin: 0 0 12px;
  font-size: 42px;
  letter-spacing: 0;
}

.entry-panel p {
  color: var(--muted);
  font-size: 17px;
  line-height: 1.55;
}

.primary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  min-height: 42px;
  border-radius: 8px;
  padding: 0 16px;
  background: var(--blue);
  color: #ffffff;
  font-weight: 800;
}
```

- [ ] **Step 6: Verify scaffold**

Run:

```bash
cd apps/web
npm run test
npm run build
```

Expected: both commands pass.

- [ ] **Step 7: Commit**

Run:

```bash
git add apps/web
git commit -m "feat: scaffold Reach Consensus web app"
```

---

### Task 2: Define The Proposal Domain Model

**Files:**
- Create: `apps/web/src/lib/reach-consensus/types.ts`
- Create: `apps/web/src/lib/reach-consensus/types.test.ts`

- [ ] **Step 1: Write the failing type behavior test**

Create `apps/web/src/lib/reach-consensus/types.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isPublishedSection, type SectionLike, visibleSectionsForCustomer } from "./types";

describe("proposal section visibility", () => {
  it("shows only published sections to customers", () => {
    const sections: SectionLike[] = [
      { id: "exec", title: "Executive Summary", status: "published" },
      { id: "services", title: "Services", status: "approved" },
      { id: "licensing", title: "Licensing", status: "draft" },
    ];

    expect(visibleSectionsForCustomer(sections)).toEqual([
      { id: "exec", title: "Executive Summary", status: "published" },
    ]);
  });

  it("identifies published sections", () => {
    expect(isPublishedSection({ id: "a", title: "A", status: "published" })).toBe(true);
    expect(isPublishedSection({ id: "b", title: "B", status: "approved" })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd apps/web
npm run test -- src/lib/reach-consensus/types.test.ts
```

Expected: FAIL because `./types` does not exist.

- [ ] **Step 3: Create the domain model**

Create `apps/web/src/lib/reach-consensus/types.ts`:

```ts
export type ProposalRole =
  | "workspace_owner"
  | "cisco_contributor"
  | "partner_contributor"
  | "customer_commenter"
  | "admin";

export type SectionStatus = "draft" | "needs_review" | "approved" | "published";

export type ContentBlockType =
  | "narrative"
  | "embedded_document"
  | "download"
  | "quote_table"
  | "licensing_table"
  | "architecture_visual"
  | "infographic"
  | "services_map"
  | "value_timeline"
  | "risk_callout";

export type AssetVisibility = "source_material" | "published_asset";

export type ChangeRequestStatus = "open" | "in_review" | "resolved";

export type AnalyticsEventType =
  | "proposal_viewed"
  | "section_viewed"
  | "file_downloaded"
  | "comment_created"
  | "change_request_created"
  | "section_approved"
  | "proposal_published";

export type ProposalSection = {
  id: string;
  title: string;
  slug: string;
  status: SectionStatus;
  ownerName: string;
  summary: string;
  blocks: ContentBlock[];
};

export type ContentBlock = {
  id: string;
  type: ContentBlockType;
  title: string;
  body: string;
  sourceAssetIds: string[];
};

export type ProposalAsset = {
  id: string;
  name: string;
  fileType: string;
  visibility: AssetVisibility;
  digestStatus: "queued" | "digested" | "manual_review";
  customerDownloadEnabled: boolean;
};

export type ProposalMember = {
  id: string;
  name: string;
  organization: string;
  role: ProposalRole;
};

export type ProposalComment = {
  id: string;
  sectionId: string;
  blockId?: string;
  authorName: string;
  authorRole: ProposalRole;
  body: string;
  createdAt: string;
};

export type ChangeRequest = {
  id: string;
  sectionId: string;
  title: string;
  body: string;
  ownerName: string;
  status: ChangeRequestStatus;
  dueDate: string;
};

export type AnalyticsEvent = {
  id: string;
  proposalId: string;
  actorName: string;
  type: AnalyticsEventType;
  label: string;
  occurredAt: string;
};

export type PublishedProposalVersion = {
  id: string;
  proposalId: string;
  versionNumber: number;
  publishedAt: string;
  publishedBy: string;
  sections: ProposalSection[];
};

export type Proposal = {
  id: string;
  slug: string;
  customerName: string;
  title: string;
  opportunitySummary: string;
  oneCiscoStory: string;
  members: ProposalMember[];
  assets: ProposalAsset[];
  sections: ProposalSection[];
  comments: ProposalComment[];
  changeRequests: ChangeRequest[];
  analyticsEvents: AnalyticsEvent[];
  publishedVersions: PublishedProposalVersion[];
};

export type SectionLike = Pick<ProposalSection, "id" | "title" | "status">;

export function isPublishedSection(section: SectionLike) {
  return section.status === "published";
}

export function visibleSectionsForCustomer<T extends SectionLike>(sections: T[]) {
  return sections.filter(isPublishedSection);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd apps/web
npm run test -- src/lib/reach-consensus/types.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add apps/web/src/lib/reach-consensus/types.ts apps/web/src/lib/reach-consensus/types.test.ts
git commit -m "feat: define proposal domain model"
```

---

### Task 3: Add Fixture Data And Repository Boundary

**Files:**
- Create: `apps/web/src/lib/reach-consensus/fixtures.ts`
- Create: `apps/web/src/lib/reach-consensus/repository.ts`
- Create: `apps/web/src/lib/reach-consensus/repository.test.ts`

- [ ] **Step 1: Write the failing repository test**

Create `apps/web/src/lib/reach-consensus/repository.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createFixtureRepository } from "./repository";

describe("fixture repository", () => {
  it("loads the starter proposal by slug", async () => {
    const repo = createFixtureRepository();
    const proposal = await repo.getProposalBySlug("acme-health-ai-ready-network");

    expect(proposal?.customerName).toBe("Acme Health");
    expect(proposal?.sections.map((section) => section.slug)).toContain("platform-story");
  });

  it("publishes immutable customer-visible sections", async () => {
    const repo = createFixtureRepository();
    const published = await repo.publishProposal("proposal_acme", "Dana Roberts");

    expect(published.versionNumber).toBe(1);
    expect(published.sections.every((section) => section.status === "published")).toBe(true);

    const proposal = await repo.getProposal("proposal_acme");
    expect(proposal?.publishedVersions).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd apps/web
npm run test -- src/lib/reach-consensus/repository.test.ts
```

Expected: FAIL because `./repository` does not exist.

- [ ] **Step 3: Add fixture proposal data**

Create `apps/web/src/lib/reach-consensus/fixtures.ts`:

```ts
import type { Proposal } from "./types";

export const starterProposal: Proposal = {
  id: "proposal_acme",
  slug: "acme-health-ai-ready-network",
  customerName: "Acme Health",
  title: "Secure AI-Ready Network Transformation",
  opportunitySummary:
    "Acme Health wants to modernize network, security, and operations capabilities before expanding AI-enabled clinical workflows.",
  oneCiscoStory:
    "Cisco Secure Access, modern networking, observability, services, licensing, and operational readiness combine into a platform architecture that lowers delivery risk and accelerates value.",
  members: [
    { id: "m_ae", name: "Dana Roberts", organization: "Cisco", role: "workspace_owner" },
    { id: "m_se", name: "Jordan Lee", organization: "Cisco", role: "cisco_contributor" },
    { id: "m_partner", name: "Casey Morgan", organization: "PartnerCo", role: "partner_contributor" },
    { id: "m_customer", name: "Riley Chen", organization: "Acme Health", role: "customer_commenter" },
  ],
  assets: [
    {
      id: "asset_arch",
      name: "Current-state network diagram.pdf",
      fileType: "pdf",
      visibility: "source_material",
      digestStatus: "digested",
      customerDownloadEnabled: false,
    },
    {
      id: "asset_bom",
      name: "Approved bill of materials.xlsx",
      fileType: "spreadsheet",
      visibility: "published_asset",
      digestStatus: "digested",
      customerDownloadEnabled: true,
    },
  ],
  sections: [
    {
      id: "section_exec",
      title: "Executive Summary",
      slug: "executive-summary",
      status: "approved",
      ownerName: "Dana Roberts",
      summary: "CIO-level case for transformation.",
      blocks: [
        {
          id: "block_exec_story",
          type: "narrative",
          title: "Why now",
          body: "Acme Health can reduce operational risk and create an AI-ready foundation by aligning network, security, and operations around one Cisco architecture.",
          sourceAssetIds: ["asset_arch"],
        },
      ],
    },
    {
      id: "section_platform",
      title: "Platform Story",
      slug: "platform-story",
      status: "approved",
      ownerName: "Jordan Lee",
      summary: "One Cisco platform spine.",
      blocks: [
        {
          id: "block_platform_formula",
          type: "infographic",
          title: "1+1=3 platform value",
          body: "Secure access plus modern networking plus operations visibility creates compounding platform value.",
          sourceAssetIds: ["asset_arch", "asset_bom"],
        },
      ],
    },
    {
      id: "section_services",
      title: "Services",
      slug: "services",
      status: "needs_review",
      ownerName: "Casey Morgan",
      summary: "Cisco recommended value delivery path.",
      blocks: [
        {
          id: "block_services_map",
          type: "services_map",
          title: "Delivery responsibility map",
          body: "Cisco Advanced Services owns design validation, PartnerCo owns advanced configuration, the traditional partner owns rack and stack, and Acme Health owns stakeholder readiness.",
          sourceAssetIds: [],
        },
      ],
    },
  ],
  comments: [],
  changeRequests: [],
  analyticsEvents: [],
  publishedVersions: [],
};
```

- [ ] **Step 4: Add repository implementation**

Create `apps/web/src/lib/reach-consensus/repository.ts`:

```ts
import { starterProposal } from "./fixtures";
import type { AnalyticsEvent, ChangeRequest, Proposal, ProposalComment, PublishedProposalVersion } from "./types";

export type ProposalRepository = {
  listProposals(): Promise<Proposal[]>;
  getProposal(proposalId: string): Promise<Proposal | undefined>;
  getProposalBySlug(slug: string): Promise<Proposal | undefined>;
  saveProposal(proposal: Proposal): Promise<Proposal>;
  publishProposal(proposalId: string, publishedBy: string): Promise<PublishedProposalVersion>;
  addComment(proposalId: string, comment: ProposalComment): Promise<ProposalComment>;
  addChangeRequest(proposalId: string, request: ChangeRequest): Promise<ChangeRequest>;
  recordAnalyticsEvent(event: AnalyticsEvent): Promise<AnalyticsEvent>;
};

function cloneProposal(proposal: Proposal): Proposal {
  return structuredClone(proposal);
}

export function createFixtureRepository(initialProposal: Proposal = starterProposal): ProposalRepository {
  const proposals = new Map<string, Proposal>([[initialProposal.id, cloneProposal(initialProposal)]]);

  return {
    async listProposals() {
      return Array.from(proposals.values()).map(cloneProposal);
    },
    async getProposal(proposalId) {
      const proposal = proposals.get(proposalId);
      return proposal ? cloneProposal(proposal) : undefined;
    },
    async getProposalBySlug(slug) {
      const proposal = Array.from(proposals.values()).find((item) => item.slug === slug);
      return proposal ? cloneProposal(proposal) : undefined;
    },
    async saveProposal(proposal) {
      proposals.set(proposal.id, cloneProposal(proposal));
      return cloneProposal(proposal);
    },
    async publishProposal(proposalId, publishedBy) {
      const proposal = proposals.get(proposalId);
      if (!proposal) {
        throw new Error(`Proposal not found: ${proposalId}`);
      }

      const publishableSections = proposal.sections
        .filter((section) => section.status === "approved" || section.status === "published")
        .map((section) => ({ ...section, status: "published" as const }));

      const version: PublishedProposalVersion = {
        id: `version_${proposal.publishedVersions.length + 1}`,
        proposalId,
        versionNumber: proposal.publishedVersions.length + 1,
        publishedAt: new Date().toISOString(),
        publishedBy,
        sections: publishableSections,
      };

      proposal.sections = proposal.sections.map((section) =>
        publishableSections.some((published) => published.id === section.id)
          ? { ...section, status: "published" }
          : section,
      );
      proposal.publishedVersions.push(version);
      proposals.set(proposalId, cloneProposal(proposal));
      return cloneProposal(version);
    },
    async addComment(proposalId, comment) {
      const proposal = proposals.get(proposalId);
      if (!proposal) {
        throw new Error(`Proposal not found: ${proposalId}`);
      }
      proposal.comments.push(comment);
      proposals.set(proposalId, cloneProposal(proposal));
      return structuredClone(comment);
    },
    async addChangeRequest(proposalId, request) {
      const proposal = proposals.get(proposalId);
      if (!proposal) {
        throw new Error(`Proposal not found: ${proposalId}`);
      }
      proposal.changeRequests.push(request);
      proposals.set(proposalId, cloneProposal(proposal));
      return structuredClone(request);
    },
    async recordAnalyticsEvent(event) {
      const proposal = proposals.get(event.proposalId);
      if (!proposal) {
        throw new Error(`Proposal not found: ${event.proposalId}`);
      }
      proposal.analyticsEvents.push(event);
      proposals.set(event.proposalId, cloneProposal(proposal));
      return structuredClone(event);
    },
  };
}

export const proposalRepository = createFixtureRepository();
```

- [ ] **Step 5: Run test to verify it passes**

Run:

```bash
cd apps/web
npm run test -- src/lib/reach-consensus/repository.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add apps/web/src/lib/reach-consensus/fixtures.ts apps/web/src/lib/reach-consensus/repository.ts apps/web/src/lib/reach-consensus/repository.test.ts
git commit -m "feat: add proposal fixture repository"
```

---

### Task 4: Build Internal Dashboard And Workspace Shell

**Files:**
- Create: `apps/web/src/components/workspace/AppFrame.tsx`
- Create: `apps/web/src/components/workspace/ProposalList.tsx`
- Create: `apps/web/src/components/workspace/WorkspaceOverview.tsx`
- Create: `apps/web/src/app/(workspace)/dashboard/page.tsx`
- Create: `apps/web/src/app/(workspace)/proposals/[proposalId]/page.tsx`
- Test: `apps/web/src/components/workspace/WorkspaceOverview.test.tsx`

- [ ] **Step 1: Write the failing workspace overview test**

Create `apps/web/src/components/workspace/WorkspaceOverview.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { starterProposal } from "@/lib/reach-consensus/fixtures";
import { WorkspaceOverview } from "./WorkspaceOverview";

describe("WorkspaceOverview", () => {
  it("shows proposal spine, section statuses, and dynamic asset counts", () => {
    render(<WorkspaceOverview proposal={starterProposal} />);

    expect(screen.getByRole("heading", { name: /secure ai-ready network transformation/i })).toBeInTheDocument();
    expect(screen.getByText(/one cisco story/i)).toBeInTheDocument();
    expect(screen.getByText(/3 sections/i)).toBeInTheDocument();
    expect(screen.getByText(/2 assets/i)).toBeInTheDocument();
    expect(screen.getByText(/^1 needs review$/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd apps/web
npm run test -- src/components/workspace/WorkspaceOverview.test.tsx
```

Expected: FAIL because `WorkspaceOverview` does not exist.

- [ ] **Step 3: Create internal workspace components**

Create `apps/web/src/components/workspace/AppFrame.tsx`:

```tsx
import Link from "next/link";

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#17202a]">
      <header className="border-b border-[#d9e0e8] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-3 font-extrabold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0b66c3] text-white">RC</span>
            <span>Reach Consensus</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-semibold text-[#657180]">
            <Link href="/dashboard">Dashboard</Link>
            <span>Internal workspace</span>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  );
}
```

Create `apps/web/src/components/workspace/ProposalList.tsx`:

```tsx
import Link from "next/link";
import type { Proposal } from "@/lib/reach-consensus/types";

export function ProposalList({ proposals }: { proposals: Proposal[] }) {
  return (
    <div className="grid gap-4">
      {proposals.map((proposal) => (
        <Link
          key={proposal.id}
          href={`/proposals/${proposal.id}`}
          className="rounded-lg border border-[#d9e0e8] bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">
            {proposal.customerName}
          </p>
          <h2 className="mt-2 text-2xl font-bold">{proposal.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#657180]">{proposal.opportunitySummary}</p>
          <div className="mt-4 flex gap-3 text-sm font-semibold text-[#657180]">
            <span>{proposal.sections.length} sections</span>
            <span>{proposal.assets.length} assets</span>
            <span>{proposal.members.length} invited users</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
```

Create `apps/web/src/components/workspace/WorkspaceOverview.tsx`:

```tsx
import type { Proposal } from "@/lib/reach-consensus/types";

export function WorkspaceOverview({ proposal }: { proposal: Proposal }) {
  const needsReview = proposal.sections.filter((section) => section.status === "needs_review").length;

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-[#d9e0e8] bg-white p-6 shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">One Cisco story</p>
        <h1 className="mt-2 text-3xl font-bold">{proposal.title}</h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-[#657180]">{proposal.oneCiscoStory}</p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
          <span className="rounded-full border border-[#d9e0e8] px-3 py-2">{proposal.sections.length} sections</span>
          <span className="rounded-full border border-[#d9e0e8] px-3 py-2">{proposal.assets.length} assets</span>
          <span className="rounded-full border border-[#d9e0e8] px-3 py-2">{needsReview} needs review</span>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {proposal.sections.map((section) => (
          <article key={section.id} className="rounded-lg border border-[#d9e0e8] bg-white p-4">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#657180]">{section.status.replace("_", " ")}</p>
            <h2 className="mt-2 text-lg font-bold">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#657180]">{section.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create workspace routes**

Create `apps/web/src/app/(workspace)/dashboard/page.tsx`:

```tsx
import { AppFrame } from "@/components/workspace/AppFrame";
import { ProposalList } from "@/components/workspace/ProposalList";
import { proposalRepository } from "@/lib/reach-consensus/repository";

export default async function DashboardPage() {
  const proposals = await proposalRepository.listProposals();

  return (
    <AppFrame>
      <div className="mb-6">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">Internal workspace</p>
        <h1 className="mt-2 text-3xl font-bold">Proposal spaces</h1>
      </div>
      <ProposalList proposals={proposals} />
    </AppFrame>
  );
}
```

Create `apps/web/src/app/(workspace)/proposals/[proposalId]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/workspace/AppFrame";
import { WorkspaceOverview } from "@/components/workspace/WorkspaceOverview";
import { proposalRepository } from "@/lib/reach-consensus/repository";

export default async function ProposalWorkspacePage({ params }: { params: Promise<{ proposalId: string }> }) {
  const { proposalId } = await params;
  const proposal = await proposalRepository.getProposal(proposalId);

  if (!proposal) {
    notFound();
  }

  return (
    <AppFrame>
      <WorkspaceOverview proposal={proposal} />
    </AppFrame>
  );
}
```

- [ ] **Step 5: Run test and build**

Run:

```bash
cd apps/web
npm run test -- src/components/workspace/WorkspaceOverview.test.tsx
npm run build
```

Expected: test and build pass.

- [ ] **Step 6: Commit**

Run:

```bash
git add apps/web/src/components/workspace apps/web/src/app
git commit -m "feat: add internal proposal workspace"
```

---

### Task 5: Add Guided Setup And Section Selection

**Files:**
- Create: `apps/web/src/components/workspace/SetupChecklist.tsx`
- Create: `apps/web/src/components/workspace/SetupChecklist.test.tsx`
- Create: `apps/web/src/app/(workspace)/proposals/[proposalId]/setup/page.tsx`

- [ ] **Step 1: Write the failing setup checklist test**

Create `apps/web/src/components/workspace/SetupChecklist.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { starterProposal } from "@/lib/reach-consensus/fixtures";
import { SetupChecklist } from "./SetupChecklist";

describe("SetupChecklist", () => {
  it("shows configurable sections and invited parties", () => {
    render(<SetupChecklist proposal={starterProposal} />);

    expect(screen.getByText("Executive Summary")).toBeInTheDocument();
    expect(screen.getByText("Platform Story")).toBeInTheDocument();
    expect(screen.getByText("Dana Roberts")).toBeInTheDocument();
    expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
    expect(screen.getByText("Casey Morgan")).toBeInTheDocument();
    expect(screen.getByText("Riley Chen")).toBeInTheDocument();
    expect(screen.getAllByText("Cisco")).toHaveLength(2);
    expect(screen.getByText("PartnerCo")).toBeInTheDocument();
    expect(screen.getByText("Acme Health")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd apps/web
npm run test -- src/components/workspace/SetupChecklist.test.tsx
```

Expected: FAIL because `SetupChecklist` does not exist.

- [ ] **Step 3: Create setup checklist component**

Create `apps/web/src/components/workspace/SetupChecklist.tsx`:

```tsx
import type { Proposal } from "@/lib/reach-consensus/types";

export function SetupChecklist({ proposal }: { proposal: Proposal }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="rounded-lg border border-[#d9e0e8] bg-white p-6">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">Guided setup</p>
        <h1 className="mt-2 text-3xl font-bold">{proposal.customerName} proposal setup</h1>
        <p className="mt-3 text-sm leading-6 text-[#657180]">
          Choose customer-facing sections, confirm invited parties, and capture enough context for AI drafting.
        </p>
        <div className="mt-6 grid gap-3">
          {proposal.sections.map((section) => (
            <label key={section.id} className="flex items-start gap-3 rounded-lg border border-[#d9e0e8] p-4">
              <input type="checkbox" defaultChecked className="mt-1 h-4 w-4" aria-label={`Include ${section.title}`} />
              <span>
                <strong className="block">{section.title}</strong>
                <span className="text-sm text-[#657180]">{section.summary}</span>
              </span>
            </label>
          ))}
        </div>
      </section>
      <aside className="rounded-lg border border-[#d9e0e8] bg-white p-6">
        <h2 className="text-lg font-bold">Invited parties</h2>
        <div className="mt-4 grid gap-3">
          {proposal.members.map((member) => (
            <div key={member.id} className="rounded-lg bg-[#f7f9fc] p-3">
              <strong className="block">{member.name}</strong>
              <span className="text-sm text-[#657180]">{member.organization}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
```

- [ ] **Step 4: Create setup route**

Create `apps/web/src/app/(workspace)/proposals/[proposalId]/setup/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/workspace/AppFrame";
import { SetupChecklist } from "@/components/workspace/SetupChecklist";
import { proposalRepository } from "@/lib/reach-consensus/repository";

export default async function ProposalSetupPage({ params }: { params: Promise<{ proposalId: string }> }) {
  const { proposalId } = await params;
  const proposal = await proposalRepository.getProposal(proposalId);

  if (!proposal) {
    notFound();
  }

  return (
    <AppFrame>
      <SetupChecklist proposal={proposal} />
    </AppFrame>
  );
}
```

- [ ] **Step 5: Run test and build**

Run:

```bash
cd apps/web
npm run test -- src/components/workspace/SetupChecklist.test.tsx
npm run build
```

Expected: test and build pass.

- [ ] **Step 6: Commit**

Run:

```bash
git add apps/web/src/components/workspace/SetupChecklist.tsx apps/web/src/components/workspace/SetupChecklist.test.tsx apps/web/src/app
git commit -m "feat: add guided proposal setup"
```

---

### Task 6: Add AI Draft Service And Section Approval Rules

**Files:**
- Create: `apps/web/src/lib/reach-consensus/ai-draft-service.ts`
- Create: `apps/web/src/lib/reach-consensus/ai-draft-service.test.ts`
- Create: `apps/web/src/lib/reach-consensus/publish-service.ts`
- Create: `apps/web/src/lib/reach-consensus/publish-service.test.ts`

- [ ] **Step 1: Write failing AI draft service test**

Create `apps/web/src/lib/reach-consensus/ai-draft-service.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { starterProposal } from "./fixtures";
import { draftOneCiscoNarrative } from "./ai-draft-service";

describe("draftOneCiscoNarrative", () => {
  it("generates sourced draft language from proposal context and assets", () => {
    const draft = draftOneCiscoNarrative(starterProposal);

    expect(draft.title).toBe("One Cisco platform narrative");
    expect(draft.body).toContain("Acme Health");
    expect(draft.body).toContain("Secure AI-Ready Network Transformation");
    expect(draft.sourceAssetIds).toEqual(["asset_arch", "asset_bom"]);
  });
});
```

- [ ] **Step 2: Write failing publish rules test**

Create `apps/web/src/lib/reach-consensus/publish-service.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { starterProposal } from "./fixtures";
import { publishableSections, sectionCanPublish } from "./publish-service";

describe("publish-service", () => {
  it("allows only approved or already published sections to publish", () => {
    expect(sectionCanPublish({ ...starterProposal.sections[0], status: "approved" })).toBe(true);
    expect(sectionCanPublish({ ...starterProposal.sections[0], status: "published" })).toBe(true);
    expect(sectionCanPublish({ ...starterProposal.sections[0], status: "needs_review" })).toBe(false);
    expect(sectionCanPublish({ ...starterProposal.sections[0], status: "draft" })).toBe(false);
  });

  it("returns only publishable sections", () => {
    expect(publishableSections(starterProposal.sections).map((section) => section.slug)).toEqual([
      "executive-summary",
      "platform-story",
    ]);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
cd apps/web
npm run test -- src/lib/reach-consensus/ai-draft-service.test.ts src/lib/reach-consensus/publish-service.test.ts
```

Expected: FAIL because the services do not exist.

- [ ] **Step 4: Create AI draft service**

Create `apps/web/src/lib/reach-consensus/ai-draft-service.ts`:

```ts
import type { ContentBlock, Proposal } from "./types";

export function draftOneCiscoNarrative(proposal: Proposal): ContentBlock {
  const digestedAssetIds = proposal.assets
    .filter((asset) => asset.digestStatus === "digested")
    .map((asset) => asset.id);

  return {
    id: `draft_${proposal.id}_one_cisco`,
    type: "narrative",
    title: "One Cisco platform narrative",
    body:
      `${proposal.customerName} can use ${proposal.title} to move from disconnected initiatives to an integrated Cisco platform. ` +
      `${proposal.oneCiscoStory} This draft is based on digested proposal assets and should be reviewed by the Cisco section owner before publishing.`,
    sourceAssetIds: digestedAssetIds,
  };
}
```

- [ ] **Step 5: Create publish rules service**

Create `apps/web/src/lib/reach-consensus/publish-service.ts`:

```ts
import type { ProposalSection } from "./types";

export function sectionCanPublish(section: ProposalSection) {
  return section.status === "approved" || section.status === "published";
}

export function publishableSections(sections: ProposalSection[]) {
  return sections.filter(sectionCanPublish);
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
cd apps/web
npm run test -- src/lib/reach-consensus/ai-draft-service.test.ts src/lib/reach-consensus/publish-service.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add apps/web/src/lib/reach-consensus/ai-draft-service.ts apps/web/src/lib/reach-consensus/ai-draft-service.test.ts apps/web/src/lib/reach-consensus/publish-service.ts apps/web/src/lib/reach-consensus/publish-service.test.ts
git commit -m "feat: add AI drafting and publish rules"
```

---

### Task 7: Build Customer Microsite From Published Snapshot

**Files:**
- Create: `apps/web/src/components/microsite/MicrositeView.tsx`
- Create: `apps/web/src/components/microsite/MicrositeView.test.tsx`
- Create: `apps/web/src/app/(microsite)/p/[slug]/page.tsx`

- [ ] **Step 1: Write failing microsite test**

Create `apps/web/src/components/microsite/MicrositeView.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { starterProposal } from "@/lib/reach-consensus/fixtures";
import { MicrositeView } from "./MicrositeView";

describe("MicrositeView", () => {
  it("renders only customer-visible published sections", () => {
    const publishedProposal = {
      ...starterProposal,
      sections: starterProposal.sections.map((section) =>
        section.slug === "services" ? section : { ...section, status: "published" as const },
      ),
    };

    render(<MicrositeView proposal={publishedProposal} />);

    expect(screen.getByRole("heading", { name: "Executive Summary" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Platform Story" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Services" })).not.toBeInTheDocument();
    expect(screen.getByText(/compounding platform value/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd apps/web
npm run test -- src/components/microsite/MicrositeView.test.tsx
```

Expected: FAIL because `MicrositeView` does not exist.

- [ ] **Step 3: Create microsite component**

Create `apps/web/src/components/microsite/MicrositeView.tsx`:

```tsx
import type { Proposal } from "@/lib/reach-consensus/types";
import { visibleSectionsForCustomer } from "@/lib/reach-consensus/types";

export function MicrositeView({ proposal }: { proposal: Proposal }) {
  const sections = visibleSectionsForCustomer(proposal.sections);

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#17202a]">
      <header className="border-b border-[#d9e0e8] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">Reach Consensus proposal</p>
          <h1 className="mt-2 text-3xl font-bold">{proposal.customerName}: {proposal.title}</h1>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-[#657180]">{proposal.oneCiscoStory}</p>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[260px_1fr]">
        <nav className="rounded-lg border border-[#d9e0e8] bg-white p-4">
          {sections.map((section) => (
            <a key={section.id} href={`#${section.slug}`} className="block rounded-md px-3 py-2 text-sm font-bold text-[#657180]">
              {section.title}
            </a>
          ))}
        </nav>
        <section className="grid gap-5">
          <article className="rounded-lg border border-[#c8d9ee] bg-white p-6">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">Platform spine</p>
            <h2 className="mt-2 text-2xl font-bold">Compounding platform value</h2>
            <p className="mt-3 text-sm leading-6 text-[#657180]">{proposal.oneCiscoStory}</p>
          </article>
          {sections.map((section) => (
            <article key={section.id} id={section.slug} className="rounded-lg border border-[#d9e0e8] bg-white p-6">
              <p className="text-xs font-extrabold uppercase tracking-wide text-[#2f8f46]">Approved customer content</p>
              <h2 className="mt-2 text-2xl font-bold">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#657180]">{section.summary}</p>
              <div className="mt-5 grid gap-3">
                {section.blocks.map((block) => (
                  <div key={block.id} className="rounded-lg bg-[#f7f9fc] p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#657180]">{block.type.replace("_", " ")}</p>
                    <h3 className="mt-1 font-bold">{block.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#657180]">{block.body}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Create microsite route**

Create `apps/web/src/app/(microsite)/p/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { MicrositeView } from "@/components/microsite/MicrositeView";
import { proposalRepository } from "@/lib/reach-consensus/repository";

export default async function CustomerMicrositePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const proposal = await proposalRepository.getProposalBySlug(slug);

  if (!proposal) {
    notFound();
  }

  const customerVisibleProposal = {
    ...proposal,
    sections: proposal.sections.map((section) =>
      section.status === "approved" ? { ...section, status: "published" as const } : section,
    ),
  };

  return <MicrositeView proposal={customerVisibleProposal} />;
}
```

- [ ] **Step 5: Run test and build**

Run:

```bash
cd apps/web
npm run test -- src/components/microsite/MicrositeView.test.tsx
npm run build
```

Expected: test and build pass.

- [ ] **Step 6: Commit**

Run:

```bash
git add apps/web/src/components/microsite apps/web/src/app
git commit -m "feat: add customer proposal microsite"
```

---

### Task 8: Add Customer Feedback And Change Requests

**Files:**
- Create: `apps/web/src/lib/reach-consensus/feedback-service.ts`
- Create: `apps/web/src/lib/reach-consensus/feedback-service.test.ts`
- Create: `apps/web/src/components/workspace/FeedbackPanel.tsx`
- Create: `apps/web/src/components/workspace/FeedbackPanel.test.tsx`

- [ ] **Step 1: Write failing feedback service test**

Create `apps/web/src/lib/reach-consensus/feedback-service.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createChangeRequestFromComment } from "./feedback-service";

describe("feedback-service", () => {
  it("converts a customer comment into a tracked change request", () => {
    const request = createChangeRequestFromComment({
      commentId: "comment_1",
      sectionId: "section_services",
      body: "Please clarify which team owns advanced configuration.",
      ownerName: "Jordan Lee",
      dueDate: "2026-06-15",
    });

    expect(request.title).toBe("Clarify customer feedback");
    expect(request.status).toBe("open");
    expect(request.sectionId).toBe("section_services");
    expect(request.body).toContain("advanced configuration");
  });
});
```

- [ ] **Step 2: Write failing feedback panel test**

Create `apps/web/src/components/workspace/FeedbackPanel.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { starterProposal } from "@/lib/reach-consensus/fixtures";
import { FeedbackPanel } from "./FeedbackPanel";

describe("FeedbackPanel", () => {
  it("shows comments and change requests", () => {
    const proposal = {
      ...starterProposal,
      comments: [
        {
          id: "comment_1",
          sectionId: "section_services",
          authorName: "Riley Chen",
          authorRole: "customer_commenter" as const,
          body: "Please clarify services ownership.",
          createdAt: "2026-06-09T12:00:00.000Z",
        },
      ],
      changeRequests: [
        {
          id: "cr_1",
          sectionId: "section_services",
          title: "Clarify customer feedback",
          body: "Please clarify services ownership.",
          ownerName: "Jordan Lee",
          status: "open" as const,
          dueDate: "2026-06-15",
        },
      ],
    };

    render(<FeedbackPanel proposal={proposal} />);

    expect(screen.getByText("Please clarify services ownership.")).toBeInTheDocument();
    expect(screen.getByText("Clarify customer feedback")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
cd apps/web
npm run test -- src/lib/reach-consensus/feedback-service.test.ts src/components/workspace/FeedbackPanel.test.tsx
```

Expected: FAIL because feedback files do not exist.

- [ ] **Step 4: Create feedback service**

Create `apps/web/src/lib/reach-consensus/feedback-service.ts`:

```ts
import type { ChangeRequest } from "./types";

type CommentConversionInput = {
  commentId: string;
  sectionId: string;
  body: string;
  ownerName: string;
  dueDate: string;
};

export function createChangeRequestFromComment(input: CommentConversionInput): ChangeRequest {
  return {
    id: `cr_${input.commentId}`,
    sectionId: input.sectionId,
    title: "Clarify customer feedback",
    body: input.body,
    ownerName: input.ownerName,
    status: "open",
    dueDate: input.dueDate,
  };
}
```

- [ ] **Step 5: Create feedback panel**

Create `apps/web/src/components/workspace/FeedbackPanel.tsx`:

```tsx
import type { Proposal } from "@/lib/reach-consensus/types";

export function FeedbackPanel({ proposal }: { proposal: Proposal }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-lg border border-[#d9e0e8] bg-white p-5">
        <h2 className="text-xl font-bold">Customer comments</h2>
        <div className="mt-4 grid gap-3">
          {proposal.comments.map((comment) => (
            <div key={comment.id} className="rounded-lg bg-[#f7f9fc] p-4">
              <strong>{comment.authorName}</strong>
              <p className="mt-2 text-sm leading-6 text-[#657180]">{comment.body}</p>
            </div>
          ))}
        </div>
      </article>
      <article className="rounded-lg border border-[#d9e0e8] bg-white p-5">
        <h2 className="text-xl font-bold">Change requests</h2>
        <div className="mt-4 grid gap-3">
          {proposal.changeRequests.map((request) => (
            <div key={request.id} className="rounded-lg bg-[#f7f9fc] p-4">
              <strong>{request.title}</strong>
              <p className="mt-2 text-sm leading-6 text-[#657180]">{request.body}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[#0b66c3]">
                {request.status} · Owner: {request.ownerName}
              </p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
```

- [ ] **Step 6: Add `FeedbackPanel` to workspace page**

Modify `apps/web/src/app/(workspace)/proposals/[proposalId]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/workspace/AppFrame";
import { FeedbackPanel } from "@/components/workspace/FeedbackPanel";
import { WorkspaceOverview } from "@/components/workspace/WorkspaceOverview";
import { proposalRepository } from "@/lib/reach-consensus/repository";

export default async function ProposalWorkspacePage({ params }: { params: Promise<{ proposalId: string }> }) {
  const { proposalId } = await params;
  const proposal = await proposalRepository.getProposal(proposalId);

  if (!proposal) {
    notFound();
  }

  return (
    <AppFrame>
      <div className="grid gap-6">
        <WorkspaceOverview proposal={proposal} />
        <FeedbackPanel proposal={proposal} />
      </div>
    </AppFrame>
  );
}
```

- [ ] **Step 7: Run tests and build**

Run:

```bash
cd apps/web
npm run test -- src/lib/reach-consensus/feedback-service.test.ts src/components/workspace/FeedbackPanel.test.tsx
npm run build
```

Expected: tests and build pass.

- [ ] **Step 8: Commit**

Run:

```bash
git add apps/web/src/lib/reach-consensus/feedback-service.ts apps/web/src/lib/reach-consensus/feedback-service.test.ts apps/web/src/components/workspace/FeedbackPanel.tsx apps/web/src/components/workspace/FeedbackPanel.test.tsx apps/web/src/app
git commit -m "feat: add customer feedback tracking"
```

---

### Task 9: Add Engagement Analytics Timeline

**Files:**
- Create: `apps/web/src/lib/reach-consensus/analytics-service.ts`
- Create: `apps/web/src/lib/reach-consensus/analytics-service.test.ts`
- Create: `apps/web/src/components/workspace/ActivityTimeline.tsx`
- Create: `apps/web/src/components/workspace/ActivityTimeline.test.tsx`

- [ ] **Step 1: Write failing analytics service test**

Create `apps/web/src/lib/reach-consensus/analytics-service.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { summarizeEngagement } from "./analytics-service";

describe("analytics-service", () => {
  it("summarizes named engagement events", () => {
    const summary = summarizeEngagement([
      {
        id: "event_1",
        proposalId: "proposal_acme",
        actorName: "Riley Chen",
        type: "section_viewed",
        label: "Viewed Executive Summary",
        occurredAt: "2026-06-09T12:00:00.000Z",
      },
      {
        id: "event_2",
        proposalId: "proposal_acme",
        actorName: "Riley Chen",
        type: "file_downloaded",
        label: "Downloaded Approved bill of materials.xlsx",
        occurredAt: "2026-06-09T12:05:00.000Z",
      },
    ]);

    expect(summary.totalEvents).toBe(2);
    expect(summary.uniqueActors).toEqual(["Riley Chen"]);
    expect(summary.downloadCount).toBe(1);
  });
});
```

- [ ] **Step 2: Write failing activity timeline test**

Create `apps/web/src/components/workspace/ActivityTimeline.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AnalyticsEvent } from "@/lib/reach-consensus/types";
import { ActivityTimeline } from "./ActivityTimeline";

describe("ActivityTimeline", () => {
  it("shows activity labels and actors", () => {
    const events: AnalyticsEvent[] = [
      {
        id: "event_1",
        proposalId: "proposal_acme",
        actorName: "Riley Chen",
        type: "section_viewed",
        label: "Viewed Executive Summary",
        occurredAt: "2026-06-09T12:00:00.000Z",
      },
    ];

    render(<ActivityTimeline events={events} />);

    expect(screen.getByText("Riley Chen")).toBeInTheDocument();
    expect(screen.getByText("Viewed Executive Summary")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
cd apps/web
npm run test -- src/lib/reach-consensus/analytics-service.test.ts src/components/workspace/ActivityTimeline.test.tsx
```

Expected: FAIL because analytics files do not exist.

- [ ] **Step 4: Create analytics service**

Create `apps/web/src/lib/reach-consensus/analytics-service.ts`:

```ts
import type { AnalyticsEvent } from "./types";

export function summarizeEngagement(events: AnalyticsEvent[]) {
  const uniqueActors = Array.from(new Set(events.map((event) => event.actorName))).sort();
  const downloadCount = events.filter((event) => event.type === "file_downloaded").length;
  const commentCount = events.filter((event) => event.type === "comment_created").length;
  const changeRequestCount = events.filter((event) => event.type === "change_request_created").length;

  return {
    totalEvents: events.length,
    uniqueActors,
    downloadCount,
    commentCount,
    changeRequestCount,
  };
}
```

- [ ] **Step 5: Create activity timeline component**

Create `apps/web/src/components/workspace/ActivityTimeline.tsx`:

```tsx
import type { AnalyticsEvent } from "@/lib/reach-consensus/types";

export function ActivityTimeline({ events }: { events: AnalyticsEvent[] }) {
  return (
    <section className="rounded-lg border border-[#d9e0e8] bg-white p-5">
      <h2 className="text-xl font-bold">Engagement timeline</h2>
      <div className="mt-4 grid gap-3">
        {events.map((event) => (
          <div key={event.id} className="rounded-lg bg-[#f7f9fc] p-4">
            <strong>{event.actorName}</strong>
            <p className="mt-1 text-sm text-[#657180]">{event.label}</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[#0b66c3]">{event.type.replace("_", " ")}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Add `ActivityTimeline` to workspace page**

Modify `apps/web/src/app/(workspace)/proposals/[proposalId]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { ActivityTimeline } from "@/components/workspace/ActivityTimeline";
import { AppFrame } from "@/components/workspace/AppFrame";
import { FeedbackPanel } from "@/components/workspace/FeedbackPanel";
import { WorkspaceOverview } from "@/components/workspace/WorkspaceOverview";
import { proposalRepository } from "@/lib/reach-consensus/repository";

export default async function ProposalWorkspacePage({ params }: { params: Promise<{ proposalId: string }> }) {
  const { proposalId } = await params;
  const proposal = await proposalRepository.getProposal(proposalId);

  if (!proposal) {
    notFound();
  }

  return (
    <AppFrame>
      <div className="grid gap-6">
        <WorkspaceOverview proposal={proposal} />
        <FeedbackPanel proposal={proposal} />
        <ActivityTimeline events={proposal.analyticsEvents} />
      </div>
    </AppFrame>
  );
}
```

- [ ] **Step 7: Run tests and build**

Run:

```bash
cd apps/web
npm run test -- src/lib/reach-consensus/analytics-service.test.ts src/components/workspace/ActivityTimeline.test.tsx
npm run build
```

Expected: tests and build pass.

- [ ] **Step 8: Commit**

Run:

```bash
git add apps/web/src/lib/reach-consensus/analytics-service.ts apps/web/src/lib/reach-consensus/analytics-service.test.ts apps/web/src/components/workspace/ActivityTimeline.tsx apps/web/src/components/workspace/ActivityTimeline.test.tsx apps/web/src/app
git commit -m "feat: add proposal engagement timeline"
```

---

### Task 10: Add Supabase Schema And Adapter Boundary

**Files:**
- Create: `supabase/migrations/202606090001_initial_reach_consensus.sql`
- Create: `apps/web/src/lib/reach-consensus/supabase-adapter.ts`
- Create: `apps/web/src/lib/reach-consensus/supabase-adapter.test.ts`

- [ ] **Step 1: Write failing adapter mapping test**

Create `apps/web/src/lib/reach-consensus/supabase-adapter.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { mapProposalRow } from "./supabase-adapter";

describe("supabase-adapter", () => {
  it("maps proposal rows into proposal summary fields", () => {
    const summary = mapProposalRow({
      id: "proposal_acme",
      slug: "acme-health-ai-ready-network",
      customer_name: "Acme Health",
      title: "Secure AI-Ready Network Transformation",
      opportunity_summary: "Modernization opportunity",
      one_cisco_story: "Integrated platform story",
    });

    expect(summary).toEqual({
      id: "proposal_acme",
      slug: "acme-health-ai-ready-network",
      customerName: "Acme Health",
      title: "Secure AI-Ready Network Transformation",
      opportunitySummary: "Modernization opportunity",
      oneCiscoStory: "Integrated platform story",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd apps/web
npm run test -- src/lib/reach-consensus/supabase-adapter.test.ts
```

Expected: FAIL because `supabase-adapter` does not exist.

- [ ] **Step 3: Create initial Supabase migration**

Create `supabase/migrations/202606090001_initial_reach_consensus.sql`:

```sql
create type public.proposal_role as enum (
  'workspace_owner',
  'cisco_contributor',
  'partner_contributor',
  'customer_commenter',
  'admin'
);

create type public.section_status as enum (
  'draft',
  'needs_review',
  'approved',
  'published'
);

create type public.asset_visibility as enum (
  'source_material',
  'published_asset'
);

create type public.change_request_status as enum (
  'open',
  'in_review',
  'resolved'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization_type text not null check (organization_type in ('cisco', 'partner', 'customer')),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles(id),
  slug text not null unique,
  customer_name text not null,
  title text not null,
  opportunity_summary text not null,
  one_cisco_story text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.proposal_members (
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.proposal_role not null,
  created_at timestamptz not null default now(),
  primary key (proposal_id, profile_id)
);

create table public.proposal_sections (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  title text not null,
  slug text not null,
  status public.section_status not null default 'draft',
  owner_name text not null,
  summary text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (proposal_id, slug)
);

create table public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.proposal_sections(id) on delete cascade,
  block_type text not null,
  title text not null,
  body text not null,
  source_asset_ids uuid[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.proposal_assets (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  storage_path text not null,
  name text not null,
  file_type text not null,
  visibility public.asset_visibility not null default 'source_material',
  digest_status text not null check (digest_status in ('queued', 'digested', 'manual_review')),
  customer_download_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.published_versions (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  version_number integer not null,
  published_by uuid not null references public.profiles(id),
  snapshot jsonb not null,
  published_at timestamptz not null default now(),
  unique (proposal_id, version_number)
);

create table public.proposal_comments (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  section_id uuid not null references public.proposal_sections(id) on delete cascade,
  block_id uuid references public.content_blocks(id) on delete set null,
  author_profile_id uuid not null references public.profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table public.change_requests (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  section_id uuid not null references public.proposal_sections(id) on delete cascade,
  title text not null,
  body text not null,
  owner_name text not null,
  status public.change_request_status not null default 'open',
  due_date date not null,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  label text not null,
  occurred_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_members enable row level security;
alter table public.proposal_sections enable row level security;
alter table public.content_blocks enable row level security;
alter table public.proposal_assets enable row level security;
alter table public.published_versions enable row level security;
alter table public.proposal_comments enable row level security;
alter table public.change_requests enable row level security;
alter table public.analytics_events enable row level security;

create schema if not exists private;

create or replace function private.is_proposal_member(proposal_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.proposal_members pm
    where pm.proposal_id = proposal_uuid
      and pm.profile_id = auth.uid()
  );
$$;

create or replace function private.proposal_role_for(proposal_uuid uuid)
returns public.proposal_role
language sql
security definer
set search_path = public
as $$
  select pm.role
  from public.proposal_members pm
  where pm.proposal_id = proposal_uuid
    and pm.profile_id = auth.uid()
  limit 1;
$$;

grant usage on schema private to authenticated;
grant execute on function private.is_proposal_member(uuid) to authenticated;
grant execute on function private.proposal_role_for(uuid) to authenticated;

create policy "users can read their own profile"
on public.profiles for select
using (id = auth.uid());

create policy "users can read their own organization"
on public.organizations for select
using (
  exists (
    select 1
    from public.profiles p
    where p.organization_id = organizations.id
      and p.id = auth.uid()
  )
);

create policy "members can read their proposals"
on public.proposals for select
using (private.is_proposal_member(id));

create policy "owners can update proposals"
on public.proposals for update
using (private.proposal_role_for(id) in ('workspace_owner', 'admin'))
with check (private.proposal_role_for(id) in ('workspace_owner', 'admin'));

create policy "members can read proposal membership"
on public.proposal_members for select
using (private.is_proposal_member(proposal_id));

create policy "owners can manage proposal membership"
on public.proposal_members for all
using (private.proposal_role_for(proposal_id) in ('workspace_owner', 'admin'))
with check (private.proposal_role_for(proposal_id) in ('workspace_owner', 'admin'));

create policy "members can read proposal sections"
on public.proposal_sections for select
using (private.is_proposal_member(proposal_id));

create policy "contributors can manage proposal sections"
on public.proposal_sections for all
using (private.proposal_role_for(proposal_id) in ('workspace_owner', 'cisco_contributor', 'partner_contributor', 'admin'))
with check (private.proposal_role_for(proposal_id) in ('workspace_owner', 'cisco_contributor', 'partner_contributor', 'admin'));

create policy "members can read content blocks"
on public.content_blocks for select
using (
  exists (
    select 1
    from public.proposal_sections ps
    where ps.id = content_blocks.section_id
      and private.is_proposal_member(ps.proposal_id)
  )
);

create policy "contributors can manage content blocks"
on public.content_blocks for all
using (
  exists (
    select 1
    from public.proposal_sections ps
    where ps.id = content_blocks.section_id
      and private.proposal_role_for(ps.proposal_id) in ('workspace_owner', 'cisco_contributor', 'partner_contributor', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.proposal_sections ps
    where ps.id = content_blocks.section_id
      and private.proposal_role_for(ps.proposal_id) in ('workspace_owner', 'cisco_contributor', 'partner_contributor', 'admin')
  )
);

create policy "members can read proposal assets"
on public.proposal_assets for select
using (private.is_proposal_member(proposal_id));

create policy "contributors can manage proposal assets"
on public.proposal_assets for all
using (private.proposal_role_for(proposal_id) in ('workspace_owner', 'cisco_contributor', 'partner_contributor', 'admin'))
with check (private.proposal_role_for(proposal_id) in ('workspace_owner', 'cisco_contributor', 'partner_contributor', 'admin'));

create policy "members can read published versions"
on public.published_versions for select
using (private.is_proposal_member(proposal_id));

create policy "owners can create published versions"
on public.published_versions for insert
with check (private.proposal_role_for(proposal_id) in ('workspace_owner', 'admin'));

create policy "members can read proposal comments"
on public.proposal_comments for select
using (private.is_proposal_member(proposal_id));

create policy "members can create proposal comments"
on public.proposal_comments for insert
with check (
  private.is_proposal_member(proposal_id)
  and author_profile_id = auth.uid()
);

create policy "members can read change requests"
on public.change_requests for select
using (private.is_proposal_member(proposal_id));

create policy "contributors can manage change requests"
on public.change_requests for all
using (private.proposal_role_for(proposal_id) in ('workspace_owner', 'cisco_contributor', 'partner_contributor', 'admin'))
with check (private.proposal_role_for(proposal_id) in ('workspace_owner', 'cisco_contributor', 'partner_contributor', 'admin'));

create policy "members can read analytics events"
on public.analytics_events for select
using (private.is_proposal_member(proposal_id));

create policy "members can create analytics events"
on public.analytics_events for insert
with check (
  private.is_proposal_member(proposal_id)
  and (actor_profile_id is null or actor_profile_id = auth.uid())
);

create index proposal_sections_proposal_id_idx on public.proposal_sections(proposal_id);
create index content_blocks_section_id_idx on public.content_blocks(section_id);
create index proposal_assets_proposal_id_idx on public.proposal_assets(proposal_id);
create index proposal_comments_proposal_id_idx on public.proposal_comments(proposal_id);
create index change_requests_proposal_id_idx on public.change_requests(proposal_id);
create index analytics_events_proposal_id_occurred_at_idx on public.analytics_events(proposal_id, occurred_at desc);
```

- [ ] **Step 4: Create Supabase adapter boundary**

Create `apps/web/src/lib/reach-consensus/supabase-adapter.ts`:

```ts
export type ProposalRow = {
  id: string;
  slug: string;
  customer_name: string;
  title: string;
  opportunity_summary: string;
  one_cisco_story: string;
};

export function mapProposalRow(row: ProposalRow) {
  return {
    id: row.id,
    slug: row.slug,
    customerName: row.customer_name,
    title: row.title,
    opportunitySummary: row.opportunity_summary,
    oneCiscoStory: row.one_cisco_story,
  };
}
```

- [ ] **Step 5: Run test**

Run:

```bash
cd apps/web
npm run test -- src/lib/reach-consensus/supabase-adapter.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add supabase/migrations/202606090001_initial_reach_consensus.sql apps/web/src/lib/reach-consensus/supabase-adapter.ts apps/web/src/lib/reach-consensus/supabase-adapter.test.ts
git commit -m "feat: add Supabase schema boundary"
```

---

### Task 11: Final Verification

**Files:**
- Modify: `docs/superpowers/plans/2026-06-09-reach-consensus-v1-foundation.md`

- [ ] **Step 1: Run full test suite**

Run:

```bash
cd apps/web
npm run test
```

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run:

```bash
cd apps/web
npm run build
```

Expected: build completes successfully and produces a Next.js production build.

- [ ] **Step 3: Run local app**

Run:

```bash
cd apps/web
npm run dev
```

Expected: the app starts on a local port and shows the Reach Consensus entry page.

- [ ] **Step 4: Verify routes in browser**

Open these routes:

```text
/
/dashboard
/proposals/proposal_acme
/proposals/proposal_acme/setup
/p/acme-health-ai-ready-network
```

Expected: each route renders without console errors. The customer microsite shows approved/published content only.

- [ ] **Step 5: Commit verification note if plan checkboxes were updated**

Run:

```bash
git add docs/superpowers/plans/2026-06-09-reach-consensus-v1-foundation.md
git commit -m "docs: record Reach Consensus plan verification"
```

---

## Self-Review Notes

Spec coverage:

- Internal workspace: Tasks 4, 5, 6, 8, and 9.
- Customer microsite: Task 7.
- One Cisco story spine: Tasks 3, 4, 6, and 7.
- Dynamic content blocks and published assets: Tasks 2, 3, 7, and 10.
- Human approval gate: Tasks 3 and 6.
- Section-level feedback and change requests: Task 8.
- Engagement analytics and audit foundation: Tasks 9 and 10.
- Supabase persistence foundation: Task 10.
- Light-mode low-friction UI: Tasks 1, 4, 5, and 7.

The plan intentionally starts with fixture-backed software so the product workflow can be tested before connecting live Supabase projects and AI providers. The Supabase migration and adapter boundary are included in V1 foundation so persistence work has a concrete schema contract.
