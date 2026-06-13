import { notFound } from "next/navigation";
import { AppFrame } from "@/components/workspace/AppFrame";
import { SharedDraftWorkspaceView } from "@/components/workspace/SharedDraftWorkspaceView";
import { readConfiguredSharedDraft } from "@/lib/reach-consensus/shared-draft-reader";

export default async function SharedDraftWorkspacePage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  const draft = await readConfiguredSharedDraft(draftId);

  if (!draft) {
    notFound();
  }

  return (
    <AppFrame>
      <SharedDraftWorkspaceView draft={draft} />
    </AppFrame>
  );
}
