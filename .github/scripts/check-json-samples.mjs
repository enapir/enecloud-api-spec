// docs/*.md の ```json ブロックが構文的に正しい JSON であることを検証する。
// 解説目的で // コメントや ... を含むブロックは意図的な省略記法のためスキップする。
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DOCS = 'docs';
const files = readdirSync(DOCS).filter((f) => f.endsWith('.md'));

let parsed = 0;
let skipped = 0;
let failed = 0;

for (const f of files) {
  const text = readFileSync(join(DOCS, f), 'utf8');
  for (const block of text.matchAll(/```json\r?\n([\s\S]*?)```/g)) {
    const body = block[1];
    const line = text.slice(0, block.index).split(/\r?\n/).length;
    if (/\/\/\s/.test(body) || /^\s*\.\.\.\s*$/m.test(body)) {
      skipped++;
      continue;
    }
    try {
      JSON.parse(body);
      parsed++;
    } catch (e) {
      console.error(`${f}:${line}: invalid JSON sample -> ${e.message}`);
      failed++;
    }
  }
}

console.log(`parsed ${parsed} JSON samples, skipped ${skipped} annotated blocks`);
if (failed > 0) {
  console.error(`${failed} invalid JSON sample(s)`);
  process.exit(1);
}
