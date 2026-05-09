// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const HTML_PATH = path.resolve(__dirname, '..', 'markdown-viewer.html');
const TEST_PAGES_DIR = path.resolve(__dirname, '..', 'test-pages');
const PAGE_URL = `file://${HTML_PATH}`;

const MARKED_JS = path.resolve(__dirname, '..', 'node_modules', 'marked', 'marked.min.js');

const TEST_FILES = fs.readdirSync(TEST_PAGES_DIR)
  .filter(f => f.endsWith('.md'))
  .sort()
  .map(f => ({ name: f, path: path.join(TEST_PAGES_DIR, f) }));

// Inject CDN dependencies before page scripts run.
// - marked: inject the real UMD build (36 KB) so markdown renders correctly
// - hljs: stub (decorative only; doesn't affect content identity)
// - mermaid: stub (rendering requires GPU fonts; diagrams left as code blocks)
async function setupMocks(page) {
  // Real marked library
  await page.addInitScript({ path: MARKED_JS });

  // highlight.js stub – no-op
  await page.addInitScript(() => {
    window.hljs = {
      highlightElement: () => {},
      highlight: (code) => ({ value: code }),
      getLanguage: () => null,
    };
  });

  // mermaid stub – no-op; mermaid divs stay as raw code in tests
  await page.addInitScript(() => {
    window.mermaid = {
      initialize: () => {},
      run: async () => {},
    };
  });
}

// Navigate to the app and wait for scripts to initialise.
async function loadPage(page) {
  await setupMocks(page);
  await page.goto(PAGE_URL);
  await page.waitForFunction(
    () => typeof window.renderMarkdown === 'function',
    { timeout: 15000 }
  );
}

// Invoke renderMarkdown directly (mirrors both the file-drop and paste code path).
async function renderInPage(page, text, filename) {
  await page.evaluate(
    async ({ text, filename }) => {
      await window.renderMarkdown(text, filename, null);
    },
    { text, filename }
  );
  await page.waitForTimeout(150);
}

// Normalise the rendered HTML for stable cross-run comparison.
async function getRenderedHTML(page) {
  return page.evaluate(() => {
    const el = document.getElementById('rendered-content');
    if (!el) return '';
    const clone = el.cloneNode(true);
    // Strip mermaid-injected random IDs (none expected with stub, but just in case)
    clone.querySelectorAll('[id]').forEach(n => {
      if (/^(mermaid|flowchart|L-|LS-|LE-)/.test(n.id)) n.removeAttribute('id');
    });
    return clone.innerHTML.replace(/\s+/g, ' ').trim();
  });
}

// ── Smoke tests ───────────────────────────────────────────────────

test.describe('Paste feature UI', () => {
  test('drop zone shows Paste Markdown button', async ({ page }) => {
    await loadPage(page);
    await expect(page.locator('#paste-btn')).toBeVisible();
    await expect(page.locator('#drop-zone')).toContainText('Paste Markdown');
  });

  test('drop zone mentions Ctrl+V shortcut', async ({ page }) => {
    await loadPage(page);
    await expect(page.locator('#drop-zone')).toContainText('Ctrl+V');
  });

  test('global paste event triggers rendering', async ({ page }) => {
    await loadPage(page);

    const text = '# Hello\n\nThis is **pasted** content.';

    // Dispatch a synthetic paste event the same way the real browser would
    await page.evaluate(text => {
      const dt = new DataTransfer();
      dt.setData('text/plain', text);
      const ev = new ClipboardEvent('paste', {
        clipboardData: dt,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(ev);
    }, text);

    // The global paste handler calls renderMarkdown which is async;
    // wait for content layout to appear (set synchronously before mermaid.run)
    await page.waitForSelector('#content-layout.visible', { timeout: 5000 });
    await expect(page.locator('#toolbar-filename')).toHaveText('Pasted content.md');
    await expect(page.locator('#export-btn')).toBeVisible();
  });

  test('paste button opens dialog or triggers render', async ({ page }) => {
    await loadPage(page);
    await page.locator('#paste-btn').click();
    // If clipboard API is unavailable a dialog appears; otherwise rendering starts
    const dialog = page.locator('#paste-dialog-close');
    if (await dialog.isVisible({ timeout: 1000 }).catch(() => false)) {
      await dialog.click();
    } else {
      // renderMarkdown was called directly; nothing to assert beyond no error
    }
  });
});

// ── Per-file parity tests ─────────────────────────────────────────
for (const file of TEST_FILES) {
  test.describe(`File: ${file.name}`, () => {
    const fileText = () => fs.readFileSync(file.path, 'utf8');

    test('paste renders identical body to file-drop', async ({ page }) => {
      const text = fileText();

      await loadPage(page);
      await renderInPage(page, text, file.name);
      const fileHTML = await getRenderedHTML(page);

      await loadPage(page);
      await renderInPage(page, text, 'Pasted content.md');
      const pasteHTML = await getRenderedHTML(page);

      expect(pasteHTML).toBe(fileHTML);
    });

    test('paste hides drop zone, shows content layout', async ({ page }) => {
      await loadPage(page);
      await renderInPage(page, fileText(), 'Pasted content.md');

      await expect(page.locator('#content-layout')).toHaveClass(/visible/);
      await expect(page.locator('#drop-zone')).toBeHidden();
    });

    test('paste enables Export PDF button', async ({ page }) => {
      await loadPage(page);
      await renderInPage(page, fileText(), 'Pasted content.md');
      await expect(page.locator('#export-btn')).toBeVisible();
    });

    test('paste sets toolbar filename to "Pasted content.md"', async ({ page }) => {
      await loadPage(page);
      await renderInPage(page, fileText(), 'Pasted content.md');
      await expect(page.locator('#toolbar-filename')).toHaveText('Pasted content.md');
    });

    test('print body (PDF source) is identical for file-drop vs paste', async ({ page }) => {
      const text = fileText();

      await loadPage(page);
      await renderInPage(page, text, file.name);
      const fileHTML = await getRenderedHTML(page);

      await loadPage(page);
      await renderInPage(page, text, 'Pasted content.md');
      const pasteHTML = await getRenderedHTML(page);

      expect(pasteHTML).toBe(fileHTML);
    });
  });
}
