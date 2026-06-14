import { DraftMicrositePreview } from "@/components/microsite/DraftMicrositePreview";

export default async function DraftMicrositePreviewPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;

  return <DraftMicrositePreview draftId={draftId} />;
}
