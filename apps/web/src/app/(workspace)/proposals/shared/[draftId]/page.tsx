import { notFound } from "next/navigation";
import { AppFrame } from "@/components/workspace/AppFrame";
import { SharedDraftWorkspaceView } from "@/components/workspace/SharedDraftWorkspaceView";
import { readConfiguredSharedDraft } from "@/lib/reach-consensus/shared-draft-reader";

export default async function SharedDraftWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ draftId: string }>;
  searchParams: Promise<{ access?: string }>;
}) {
  const { draftId } = await params;
  const { access } = await searchParams;
  const draft = await readConfiguredSharedDraft(draftId, access, "workspace:read");

  if (!draft) {
    notFound();
  }

  return (
    <AppFrame>
      <SharedDraftWorkspaceView draft={draft} />
    </AppFrame>
  );
}
