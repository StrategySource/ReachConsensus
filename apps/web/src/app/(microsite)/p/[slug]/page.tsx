import { notFound } from "next/navigation";
import { MicrositeView } from "@/components/microsite/MicrositeView";
import { proposalRepository } from "@/lib/reach-consensus/repository";

export default async function CustomerMicrositePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const proposal = await proposalRepository.getPublishedProposalBySlug(slug);

  if (!proposal) {
    notFound();
  }

  return <MicrositeView proposal={proposal} />;
}
