import type { Proposal } from "@/lib/reach-consensus/types";

export function SetupChecklist({ proposal }: { proposal: Proposal }) {
  const invitedOrganizations = Array.from(
    new Set(proposal.members.map((member) => member.organization)),
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="rounded-lg border border-[#d9e0e8] bg-white p-6">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">
          Guided setup
        </p>
        <h1 className="mt-2 text-3xl font-bold">
          {proposal.customerName} proposal setup
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#657180]">
          Choose customer-facing sections, confirm invited parties, and capture
          enough context for AI drafting.
        </p>
        <div className="mt-6 grid gap-3">
          {proposal.sections.map((section) => (
            <label
              key={section.id}
              className="flex items-start gap-3 rounded-lg border border-[#d9e0e8] p-4"
            >
              <input
                type="checkbox"
                defaultChecked
                className="mt-1 h-4 w-4"
                aria-label={`Include ${section.title}`}
              />
              <span>
                <strong className="block">{section.title}</strong>
                <span className="text-sm text-[#657180]">
                  {section.summary}
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>
      <aside className="rounded-lg border border-[#d9e0e8] bg-white p-6">
        <h2 className="text-lg font-bold">Invited parties</h2>
        <div className="mt-4 grid gap-3">
          {invitedOrganizations.map((organization) => (
            <div key={organization} className="rounded-lg bg-[#f7f9fc] p-3">
              <strong className="block">{organization}</strong>
              <span className="text-sm text-[#657180]">Invited</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
