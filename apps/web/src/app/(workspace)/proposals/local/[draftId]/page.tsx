import { AppFrame } from "@/components/workspace/AppFrame";
import { DraftWorkspaceView } from "@/components/workspace/DraftWorkspaceView";

export default async function LocalDraftWorkspacePage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;

  return (
    <AppFrame>
      <DraftWorkspaceView draftId={draftId} />
    </AppFrame>
  );
}
