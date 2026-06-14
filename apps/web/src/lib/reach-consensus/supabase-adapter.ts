export type ProposalRow = {
  id: string;
  slug: string;
  customer_name: string;
  title: string;
  opportunity_summary: string;
  one_cisco_story: string;
};

export function mapProposalRow(row: ProposalRow) {
  return {
    id: row.id,
    slug: row.slug,
    customerName: row.customer_name,
    title: row.title,
    opportunitySummary: row.opportunity_summary,
    oneCiscoStory: row.one_cisco_story,
  };
}
