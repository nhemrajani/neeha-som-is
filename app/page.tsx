import { formatDate, getEntries, getStudy } from "@/lib/log";

export const dynamic = "force-dynamic";

function statusClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("done") || s.includes("complete") || s.includes("submitted")) return "pill done";
  if (s.includes("progress") || s.includes("draft") || s.includes("active")) return "pill active";
  return "pill";
}

export default function Dashboard() {
  const study = getStudy();
  const entries = getEntries();

  const totalHours = entries.reduce((sum, e) => sum + (e.hours ?? 0), 0);
  const weeks = new Set(entries.map((e) => e.week).filter((w) => w !== null)).size;
  const lastUpdated = entries[0]?.date;

  return (
    <main className="shell">
      <header className="masthead">
        <p className="eyebrow">Research Log</p>
        <h1>{study.title}</h1>
        <p className="subtitle">{study.subtitle}</p>
        <dl className="meta">
          <div>
            <dt>Student</dt>
            <dd>{study.student}</dd>
          </div>
          <div>
            <dt>Supervisor</dt>
            <dd>{study.supervisor}</dd>
          </div>
          <div>
            <dt>Term</dt>
            <dd>{study.term}</dd>
          </div>
        </dl>
      </header>

      <section className="stats">
        <div className="stat">
          <div className="num">{entries.length}</div>
          <div className="label">Log entries</div>
        </div>
        <div className="stat">
          <div className="num">{weeks}</div>
          <div className="label">Weeks logged</div>
        </div>
        <div className="stat">
          <div className="num">{totalHours || "—"}</div>
          <div className="label">Hours recorded</div>
        </div>
      </section>

      <h2>The Question</h2>
      <div className="card prose">
        <div className="field">
          <h3>Research Question</h3>
          <p>{study.question}</p>
        </div>
        <div className="field">
          <h3>Why It Matters</h3>
          <p>{study.motivation}</p>
        </div>
        <div className="field">
          <h3>Approach</h3>
          <p>{study.methods}</p>
        </div>
      </div>

      <h2>Deliverables</h2>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Deliverable</th>
              <th>Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {study.deliverables.map((d) => (
              <tr key={d.name}>
                <td>{d.name}</td>
                <td>{d.due}</td>
                <td>
                  <span className={statusClass(d.status)}>{d.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Log</h2>
      {entries.length === 0 ? (
        <p className="empty">No entries yet. Add a markdown file to content/log/ to start the log.</p>
      ) : (
        entries.map((entry) => (
          <article className="entry" key={entry.slug}>
            <div className="entry-head">
              <h3>{entry.title}</h3>
              <span className="entry-date">
                {formatDate(entry.date)}
                {entry.week !== null ? ` · Week ${entry.week}` : ""}
                {entry.hours !== null ? ` · ${entry.hours}h` : ""}
              </span>
            </div>
            {entry.summary ? <p className="entry-summary">{entry.summary}</p> : null}
            <div className="entry-body" dangerouslySetInnerHTML={{ __html: entry.html }} />
            {entry.tags.length > 0 ? (
              <div className="tags">
                {entry.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))
      )}

      <footer className="footer">
        {lastUpdated ? `Last entry ${formatDate(lastUpdated)}. ` : ""}
        This log is private and updates whenever a new entry is pushed to the repository.
      </footer>
    </main>
  );
}
