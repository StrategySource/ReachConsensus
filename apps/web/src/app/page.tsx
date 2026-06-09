import Link from "next/link";

export default function HomePage() {
  return (
    <main className="entry-page">
      <section className="entry-panel">
        <p className="eyebrow">Cisco proposal workspace</p>
        <h1>Reach Consensus</h1>
        <p>
          Build customer-ready proposal microsites that explain the One Cisco
          platform story, route approvals, and track engagement.
        </p>
        <Link className="primary-link" href="/dashboard">
          Open dashboard
        </Link>
      </section>
    </main>
  );
}
