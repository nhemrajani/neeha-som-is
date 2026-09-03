import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const LOG_DIR = path.join(process.cwd(), "content", "log");

export type LogEntry = {
  slug: string;
  title: string;
  date: string;
  week: number | null;
  hours: number | null;
  tags: string[];
  summary: string;
  html: string;
};

export type Deliverable = { name: string; due: string; status: string };

export type Study = {
  title: string;
  subtitle: string;
  student: string;
  advisor: string;
  term: string;
  creditHours: string;
  question: string;
  motivation: string;
  methods: string;
  deliverables: Deliverable[];
};

export function getStudy(): Study {
  const file = path.join(process.cwd(), "content", "study.json");
  return JSON.parse(fs.readFileSync(file, "utf8")) as Study;
}

export function getEntries(): LogEntry[] {
  if (!fs.existsSync(LOG_DIR)) return [];

  return fs
    .readdirSync(LOG_DIR)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const raw = fs.readFileSync(path.join(LOG_DIR, name), "utf8");
      const { data, content } = matter(raw);
      const slug = name.replace(/\.md$/, "");
      return {
        slug,
        title: String(data.title ?? slug),
        // gray-matter turns unquoted YAML dates into Date objects; keep ISO strings.
        date: toISODate(data.date) ?? slug.slice(0, 10),
        week: typeof data.week === "number" ? data.week : null,
        hours: typeof data.hours === "number" ? data.hours : null,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        summary: String(data.summary ?? ""),
        html: marked.parse(content, { async: false }),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

function toISODate(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && value.trim()) return value.trim().slice(0, 10);
  return null;
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
