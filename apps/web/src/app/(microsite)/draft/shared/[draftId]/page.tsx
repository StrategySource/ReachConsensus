import { notFound } from "next/navigation";
import { SharedDraftMicrositePreview } from "@/components/microsite/SharedDraftMicrositePreview";
import { readConfiguredSharedDraft } from "@/lib/reach-consensus/shared-draft-reader";

export default async function SharedDraftMicrositePreviewPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  const draft = await readConfiguredSharedDraft(draftId);

  if (!draft) {
    notFound();
  }

  return <SharedDraftMicrositePreview draft={draft} />;
}
