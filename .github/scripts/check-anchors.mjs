// docs/*.md の内部アンカーリンクが実在する見出しに解決するか検証する。
// GitHub の slug 生成規則（小文字化 → 記号除去 → 空白をハイフン → 重複時に連番）に準拠。
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DOCS = 'docs';

const slug = (heading) =>
  heading
    .trim()
    .replace(/<[^>]*>/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\s-]/gu, '')
    .replace(/\s/g, '-');

const files = readdirSync(DOCS).filter((f) => f.endsWith('.md'));

const anchors = new Map();
for (const f of files) {
  const text = readFileSync(join(DOCS, f), 'utf8');
  const set = new Set();
  const seen = new Map();
  for (const m of text.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)) {
    const base = slug(m[1]);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    set.add(n === 0 ? base : `${base}-${n}`);
  }
  anchors.set(f, set);
}

let broken = 0;
let checked = 0;
for (const f of files) {
  const text = readFileSync(join(DOCS, f), 'utf8');
  for (const m of text.matchAll(/\]\(([^)\s]*#[^)\s]+)\)/g)) {
    const [file, anchor] = m[1].split('#');
    const target = file === '' ? f : file;
    checked++;
    if (!anchors.has(target)) {
      console.error(`${f}: unknown target file -> ${m[1]}`);
      broken++;
    } else if (!anchors.get(target).has(decodeURIComponent(anchor))) {
      console.error(`${f}: broken anchor -> ${m[1]}`);
      broken++;
    }
  }
}

console.log(`checked ${checked} anchor links across ${files.length} files`);
if (broken > 0) {
  console.error(`${broken} broken anchor link(s)`);
  process.exit(1);
}
