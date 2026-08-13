import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const builtIndex = new URL("../dist/client/index.html", import.meta.url);

test("exports a complete static FAB CITY page", async () => {
  const html = await readFile(builtIndex, "utf8");

  assert.match(html, /<html lang="zh-Hant">/);
  assert.match(html, /<title>晶圓城 FAB CITY｜半導體製造模擬<\/title>/);
  assert.match(html, /LOW-POLY SEMICONDUCTOR SIM/);
  assert.match(html, /矽原料・單晶/);
  assert.match(html, /CMP 平坦化/);
  assert.match(html, /金屬互連/);
  assert.match(html, /最終測試/);
  assert.match(html, /可拖曳晶圓批次/);
  assert.match(html, /製程知識庫/);

  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/);
});

test("ships the static and social-preview assets", async () => {
  await Promise.all([
    access(new URL("../dist/client/.nojekyll", import.meta.url)),
    access(new URL("../dist/client/og.png", import.meta.url)),
    access(new URL("../.github/workflows/deploy-pages.yml", import.meta.url)),
    access(new URL("../scripts/prepare-pages.mjs", import.meta.url)),
    access(new URL("../README.md", import.meta.url)),
  ]);

  const [workflow, readme, packageJson] = await Promise.all([
    readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /node scripts\/prepare-pages\.mjs/);
  assert.match(readme, /Settings → Pages/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});

test("keeps the source knowledge base technically bounded", async () => {
  const game = await readFile(new URL("../app/FabCityGame.tsx", import.meta.url), "utf8");

  for (const correction of [
    "光刻主要是在光阻上成像",
    "熱氧化會消耗一部分表面矽",
    "後續退火讓摻雜原子電性活化",
    "遊戲用 3 輪代表大量重複",
    "封裝不只是外殼",
  ]) {
    assert.match(game, new RegExp(correction));
  }

  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
  await access(new URL("../public/og.png", import.meta.url));
  await access(root);
});
