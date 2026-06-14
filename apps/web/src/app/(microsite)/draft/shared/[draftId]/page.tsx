import { notFound } from "next/navigation";
import { SharedDraftMicrositePreview } from "@/components/microsite/SharedDraftMicrositePreview";
import { readConfiguredSharedDraft } from "@/lib/reach-consensus/shared-draft-reader";

export default async function SharedDraftMicrositePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ draftId: string }>;
  searchParams: Promise<{ access?: string }>;
}) {
  const { draftId } = await params;
  const { access } = await searchParams;
  const draft = await readConfiguredSharedDraft(draftId, access, "preview:read");

  if (!draft) {
    notFound();
  }

  return <SharedDraftMicrositePreview draft={draft} />;
}
