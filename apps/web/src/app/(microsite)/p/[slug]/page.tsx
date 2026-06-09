import { notFound } from "next/navigation";
import { MicrositeView } from "@/components/microsite/MicrositeView";
import { proposalRepository } from "@/lib/reach-consensus/repository";

export default async function CustomerMicrositePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const proposal = await proposalRepository.getProposalBySlug(slug);

  if (!proposal) {
    notFound();
  }

  const customerVisibleProposal = {
    ...proposal,
    sections: proposal.sections.map((section) =>
      section.status === "approved" ? { ...section, status: "published" as const } : section,
    ),
  };

  return <MicrositeView proposal={customerVisibleProposal} />;
}
