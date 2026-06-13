"use client";

import { useRouter } from "next/navigation";
import { type LocalDraftProposal } from "@/lib/reach-consensus/local-drafts";
import { NewProposalWizard } from "./NewProposalWizard";

export function NewProposalWizardPage() {
  const router = useRouter();

  function openDraftWorkspace(draft: LocalDraftProposal) {
    router.push(`/proposals/local/${draft.id}`);
  }

  return <NewProposalWizard onDraftCreated={openDraftWorkspace} />;
}
