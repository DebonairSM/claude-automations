// Next.js extends RequestInit with a `next` property for cache control.
type NextRequestInit = RequestInit & { next?: { revalidate?: number } };

const REPO = "DebonairSM/claude-automations";
const BRANCH = process.env.GITHUB_BRANCH ?? "master";
const API_BASE = `https://api.github.com/repos/${REPO}/contents`;

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    h["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

interface GHEntry {
  name: string;
  type: "file" | "dir";
}

interface GHFile {
  content: string;
  encoding: "base64";
}

const FETCH_OPTS: NextRequestInit = { next: { revalidate: 60 } };

async function fetchDir(path: string): Promise<GHEntry[]> {
  const res = await fetch(`${API_BASE}/${path}?ref=${BRANCH}`, {
    ...FETCH_OPTS,
    headers: headers(),
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${path}`);
  return res.json() as Promise<GHEntry[]>;
}

async function fetchFile(path: string): Promise<string> {
  const res = await fetch(`${API_BASE}/${path}?ref=${BRANCH}`, {
    ...FETCH_OPTS,
    headers: headers(),
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${path}`);
  const data = (await res.json()) as GHFile;
  return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
}

function parseFrontmatter(content: string): { name?: string; description?: string } {
  const block = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  const get = (key: string) => block.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
  return { name: get("name"), description: get("description") };
}

export async function listSkills() {
  const dirs = (await fetchDir("skills")).filter((e) => e.type === "dir");
  return Promise.all(
    dirs.map(async (d) => {
      try {
        const { name, description } = parseFrontmatter(await fetchFile(`skills/${d.name}/SKILL.md`));
        return { name: name ?? d.name, description: description ?? "" };
      } catch {
        return { name: d.name, description: "" };
      }
    })
  );
}

export async function getSkill(name: string) {
  return fetchFile(`skills/${name}/SKILL.md`);
}

export async function listAgents() {
  const files = (await fetchDir("agents")).filter(
    (e) => e.type === "file" && e.name.endsWith(".md")
  );
  return Promise.all(
    files.map(async (f) => {
      const slug = f.name.replace(/\.md$/, "");
      try {
        const { name, description } = parseFrontmatter(await fetchFile(`agents/${f.name}`));
        return { name: name ?? slug, description: description ?? "" };
      } catch {
        return { name: slug, description: "" };
      }
    })
  );
}

export async function getAgent(name: string) {
  return fetchFile(`agents/${name}.md`);
}
