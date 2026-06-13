"use client";

import { useMemo, useState } from "react";
import {
  buildLocalDraft,
  documentMetadataFromFiles,
  draftSectionOptions,
  saveLocalDraft,
  solutionAreaOptions,
  type DraftDocumentCategory,
  type DraftSectionId,
  type LocalDraftDocument,
  type LocalDraftProposal,
  type SolutionArea,
} from "@/lib/reach-consensus/local-drafts";
import {
  proposalDraftFormDataFromIntake,
  type DraftFileUpload,
  type SharedDraftCreateResult,
} from "@/lib/reach-consensus/shared-drafts";

export type ProposalDraftCreatedResult =
  | { kind: "local"; draft: LocalDraftProposal; workspaceUrl: string; previewUrl: string }
  | SharedDraftCreateResult;

type NewProposalWizardProps = {
  onDraftCreated?: (result: ProposalDraftCreatedResult) => void;
};

const documentInputs: {
  category: DraftDocumentCategory;
  label: string;
  helper: string;
}[] = [
  {
    category: "architecture",
    label: "Architecture drawings",
    helper: "Current state, future state, logical diagrams, and topology sketches.",
  },
  {
    category: "quote",
    label: "Quote or bill of materials",
    helper: "Quotes, BOMs, pricing worksheets, and approved line-item detail.",
  },
  {
    category: "services",
    label: "Services scope",
    helper: "SOWs, responsibility maps, implementation notes, and partner scopes.",
  },
  {
    category: "licensing",
    label: "Licensing documents",
    helper: "EA terms, licensing details, entitlement references, and renewals.",
  },
  {
    category: "supporting",
    label: "Supporting documents",
    helper: "Requirements, discovery notes, business case material, and customer context.",
  },
];

function formatBytes(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  const kilobytes = size / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`;
}

export function NewProposalWizard({ onDraftCreated }: NewProposalWizardProps) {
  const [customerName, setCustomerName] = useState("");
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [members, setMembers] = useState("");
  const [solutionAreas, setSolutionAreas] = useState<SolutionArea[]>([]);
  const [selectedSectionIds, setSelectedSectionIds] = useState<DraftSectionId[]>(
    draftSectionOptions.map((section) => section.id),
  );
  const [documents, setDocuments] = useState<LocalDraftDocument[]>([]);
  const [files, setFiles] = useState<DraftFileUpload[]>([]);
  const [createdDraft, setCreatedDraft] = useState<ProposalDraftCreatedResult | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAreaLabels = useMemo(
    () =>
      solutionAreas.map(
        (area) => solutionAreaOptions.find((option) => option.id === area)?.label ?? area,
      ),
    [solutionAreas],
  );

  function toggleSolutionArea(area: SolutionArea) {
    setSolutionAreas((current) =>
      current.includes(area) ? current.filter((item) => item !== area) : [...current, area],
    );
  }

  function toggleSection(sectionId: DraftSectionId) {
    setSelectedSectionIds((current) =>
      current.includes(sectionId)
        ? current.filter((item) => item !== sectionId)
        : [...current, sectionId],
    );
  }

  function addDocuments(category: DraftDocumentCategory, files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const selectedFiles = Array.from(files);
    setDocuments((current) => [
      ...current,
      ...documentMetadataFromFiles(category, selectedFiles),
    ]);
    setFiles((current) => [
      ...current,
      ...selectedFiles.map((file) => ({
        category,
        file,
      })),
    ]);
  }

  function createLocalDraft() {
    const draft = buildLocalDraft({
      customerName,
      title,
      problem,
      solution,
      solutionAreas,
      selectedSectionIds,
      members,
      documents,
    });

    saveLocalDraft(draft);
    return {
      kind: "local" as const,
      draft,
      workspaceUrl: `/proposals/local/${draft.id}`,
      previewUrl: `/draft/${draft.id}`,
    };
  }

  async function createSharedDraft() {
    const response = await fetch("/api/proposal-drafts", {
      method: "POST",
      body: proposalDraftFormDataFromIntake(
        {
          customerName,
          title,
          problem,
          solution,
          solutionAreas,
          selectedSectionIds,
          members,
        },
        files,
      ),
    });

    if (!response.ok) {
      throw new Error("Shared proposal persistence is unavailable.");
    }

    return (await response.json()) as SharedDraftCreateResult;
  }

  async function createDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createSharedDraft();
      setCreatedDraft(result);
      onDraftCreated?.(result);
    } catch {
      const result = createLocalDraft();
      setCreatedDraft(result);
      onDraftCreated?.(result);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={createDraft} className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="rounded-lg border border-[#d9e0e8] bg-white p-6 shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">
          New proposal
        </p>
        <h1 className="mt-2 text-3xl font-bold">Create a proposal site</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#657180]">
          Capture the customer context, One Cisco platform story, selected proposal sections,
          and source documents. When Supabase is configured, files are uploaded into a
          shared draft workspace; otherwise the draft stays local to this browser.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            Customer name
            <input
              required
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="min-h-11 rounded-md border border-[#d9e0e8] px-3 text-base font-normal"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Opportunity title
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="min-h-11 rounded-md border border-[#d9e0e8] px-3 text-base font-normal"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4">
          <label className="grid gap-2 text-sm font-bold">
            Customer problem
            <textarea
              required
              value={problem}
              onChange={(event) => setProblem(event.target.value)}
              rows={4}
              className="rounded-md border border-[#d9e0e8] px-3 py-3 text-base font-normal leading-6"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Proposed solution
            <textarea
              required
              value={solution}
              onChange={(event) => setSolution(event.target.value)}
              rows={4}
              className="rounded-md border border-[#d9e0e8] px-3 py-3 text-base font-normal leading-6"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            People to invite
            <textarea
              value={members}
              onChange={(event) => setMembers(event.target.value)}
              rows={3}
              placeholder="Name - organization or role"
              className="rounded-md border border-[#d9e0e8] px-3 py-3 text-base font-normal leading-6"
            />
          </label>
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-extrabold">Solution areas</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {solutionAreaOptions.map((area) => (
              <label
                key={area.id}
                className="flex items-center gap-3 rounded-lg border border-[#d9e0e8] px-3 py-3 text-sm font-bold"
              >
                <input
                  type="checkbox"
                  checked={solutionAreas.includes(area.id)}
                  onChange={() => toggleSolutionArea(area.id)}
                  className="h-4 w-4"
                />
                {area.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-extrabold">Proposal sections</legend>
          <div className="mt-3 grid gap-3">
            {draftSectionOptions.map((section) => (
              <label
                key={section.id}
                className="flex items-start gap-3 rounded-lg border border-[#d9e0e8] p-4"
              >
                <input
                  type="checkbox"
                  checked={selectedSectionIds.includes(section.id)}
                  onChange={() => toggleSection(section.id)}
                  className="mt-1 h-4 w-4"
                />
                <span>
                  <strong className="block">{section.title}</strong>
                  <span className="text-sm font-normal leading-6 text-[#657180]">
                    {section.summary}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <aside className="grid gap-5 self-start">
        <section className="rounded-lg border border-[#d9e0e8] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Source documents</h2>
          <p className="mt-2 text-sm leading-6 text-[#657180]">
            Files are captured as draft metadata in this prototype. Permanent upload,
            document viewing, and AI digestion come with the Supabase storage layer.
          </p>
          <div className="mt-5 grid gap-4">
            {documentInputs.map((input) => (
              <label key={input.category} className="grid gap-2 text-sm font-bold">
                {input.label}
                <span className="text-xs font-normal leading-5 text-[#657180]">
                  {input.helper}
                </span>
                <input
                  type="file"
                  multiple
                  aria-label={input.label}
                  onChange={(event) => addDocuments(input.category, event.target.files)}
                  className="rounded-md border border-[#d9e0e8] bg-[#f7f9fc] px-3 py-3 text-sm"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[#d9e0e8] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Draft summary</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="font-bold text-[#657180]">Sections</dt>
              <dd>{selectedSectionIds.length} selected</dd>
            </div>
            <div>
              <dt className="font-bold text-[#657180]">Solution areas</dt>
              <dd>{selectedAreaLabels.length ? selectedAreaLabels.join(", ") : "None selected"}</dd>
            </div>
            <div>
              <dt className="font-bold text-[#657180]">Documents</dt>
              <dd>{documents.length} attached</dd>
            </div>
          </dl>
          {documents.length ? (
            <ul className="mt-4 grid gap-2">
              {documents.map((document) => (
                <li key={document.id} className="rounded-md bg-[#f7f9fc] p-3 text-sm">
                  <strong className="block">{document.name}</strong>
                  <span className="text-xs text-[#657180]">
                    {document.category} - {formatBytes(document.size)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 min-h-11 w-full rounded-md bg-[#0b66c3] px-4 py-2 text-sm font-extrabold text-white"
          >
            {isSubmitting ? "Creating draft..." : "Create proposal draft"}
          </button>
          {createdDraft ? (
            <p className="mt-3 text-sm font-bold text-[#2f8f46]">
              {createdDraft.kind === "shared"
                ? `Shared draft created for ${createdDraft.draft.customerName}.`
                : `Local draft created for ${createdDraft.draft.customerName}.`}
            </p>
          ) : null}
        </section>
      </aside>
    </form>
  );
}
