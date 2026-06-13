"use client";

import { useRouter } from "next/navigation";
import { NewProposalWizard, type ProposalDraftCreatedResult } from "./NewProposalWizard";

export function NewProposalWizardPage() {
  const router = useRouter();

  function openDraftWorkspace(result: ProposalDraftCreatedResult) {
    router.push(result.workspaceUrl);
  }

  return <NewProposalWizard onDraftCreated={openDraftWorkspace} />;
}
