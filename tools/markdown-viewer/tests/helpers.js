// @ts-check
// Shared test setup: serve the viewer's CDN dependencies locally so tests
// are deterministic and need no network access.
//   - marked, github-markdown-css, highlight.js theme: real files from node_modules
//   - highlight.js, mermaid: stubs (decorative / nondeterministic output;
//     mermaid divs stay as raw source text)
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const NM = path.join(ROOT, 'node_modules');

const HLJS_STUB = `window.hljs = {
  highlightElement: () => {},
  highlight: (code) => ({ value: code }),
  getLanguage: () => null,
};`;

const MERMAID_STUB = `window.mermaid = {
  initialize: () => {},
  run: async () => {},
};`;

const JS = 'application/javascript';
const CSS = 'text/css';

async function serveCdnLocally(page) {
  await page.route(/^https?:\/\//, route => {
    const url = route.request().url();
    if (/\/marked@[^/]+\/marked\.min\.js$/.test(url))
      return route.fulfill({ path: path.join(NM, 'marked', 'marked.min.js'), contentType: JS });
    if (/\/highlight\.min\.js$/.test(url))
      return route.fulfill({ body: HLJS_STUB, contentType: JS });
    if (/\/mermaid(\.min)?\.js$/.test(url))
      return route.fulfill({ body: MERMAID_STUB, contentType: JS });
    if (/\/github-markdown-light(\.min)?\.css$/.test(url))
      return route.fulfill({ path: path.join(NM, 'github-markdown-css', 'github-markdown-light.css'), contentType: CSS });
    if (/\/highlight\.js\/.*\/styles\/github\.min\.css$/.test(url))
      return route.fulfill({ path: path.join(NM, 'highlight.js', 'styles', 'github.min.css'), contentType: CSS });
    return route.abort();
  });
}

const PAGE_URL = `file://${path.join(ROOT, 'markdown-viewer.html')}`;

// Navigate to the app and wait for scripts to initialise.
async function loadPage(page) {
  await serveCdnLocally(page);
  await page.goto(PAGE_URL);
  await page.waitForFunction(
    () => typeof window.renderMarkdown === 'function',
    { timeout: 15000 }
  );
}

module.exports = { loadPage, PAGE_URL, ROOT };
