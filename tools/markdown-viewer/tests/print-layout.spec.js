// @ts-check
// PDF export: tables / code blocks too wide for portrait go on landscape
// pages (Chrome named pages). Uses test-pages/wide-content.md, whose
// elements carry markers naming where they should print.
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const PAGE_URL = `file://${path.resolve(__dirname, '..', 'markdown-viewer.html')}`;
const WIDE_MD = fs.readFileSync(
  path.resolve(__dirname, '..', 'test-pages', 'wide-content.md'), 'utf8');

// Must match PRINT_PORTRAIT_PX / PRINT_LANDSCAPE_PX in markdown-viewer.html.
const PORTRAIT_PX = 680;
const LANDSCAPE_PX = 942;

// Expected classes per marker (first text in the element).
const EXPECTED = {
  'P-CODE-NARROW': [],
  'P-TABLE-NARROW': [],
  'P-TABLE-PROSE': [],
  'P-TABLE-COMMA': [],
  'L-CODE-WIDE': ['print-wide'],
  'L-TABLE-WIDE': ['print-wide'],
  'F-TABLE-FORCE': ['print-wide', 'print-force'],
  'W-CODE-WRAP': ['print-wide', 'print-wrap'],
  'L-CODE-LIST': ['print-wide'],
};

// Real libraries and stylesheets are loaded (no stubs): measurements
// depend on the actual GitHub markdown CSS.
async function renderWidePage(page) {
  await page.goto(PAGE_URL);
  await page.waitForFunction(() => typeof window.renderMarkdown === 'function');
  await page.evaluate(t => window.renderMarkdown(t, 'wide-content.md', null), WIDE_MD);
  await page.evaluate(() => document.fonts.ready);
}

function printClasses(page) {
  return page.evaluate(() => {
    const out = {};
    document.querySelectorAll('#rendered-content pre, #rendered-content table').forEach(el => {
      const marker = (el.textContent.match(/[PLWF]-(?:CODE|TABLE)-[A-Z]+/) || [])[0];
      if (marker) {
        out[marker] = ['print-wide', 'print-wrap', 'print-force']
          .filter(c => el.classList.contains(c));
      }
    });
    return out;
  });
}

// Page sizes in page order, read from the PDF's /MediaBox entries.
function pageOrientations(pdf) {
  return [...pdf.toString('latin1').matchAll(/\/MediaBox\s*\[([^\]]+)\]/g)]
    .map(m => m[1].trim().split(/\s+/).map(Number))
    .map(([x0, y0, x1, y1]) => (x1 - x0 > y1 - y0 ? 'L' : 'P'));
}

test.describe('Print layout for wide content', () => {
  test('classifies tables and code blocks by required page width', async ({ page }) => {
    await renderWidePage(page);
    await page.evaluate(() => window.preparePrintLayout());
    expect(await printClasses(page)).toEqual(EXPECTED);
  });

  test('beforeprint / afterprint add and remove print state', async ({ page }) => {
    await renderWidePage(page);
    const html = () => page.evaluate(() => document.getElementById('rendered-content').innerHTML);
    const before = await html();

    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    const during = await page.evaluate(() => ({
      wbrInCellCode: document.querySelectorAll('td code wbr.print-wbr, th code wbr.print-wbr').length,
      wbrTotal: document.querySelectorAll('wbr.print-wbr').length,
      wide: document.querySelectorAll('.print-wide').length,
    }));
    expect(during.wbrInCellCode).toBeGreaterThan(0);
    expect(during.wbrTotal).toBe(during.wbrInCellCode); // only in table-cell code
    expect(during.wide).toBeGreaterThan(0);

    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    expect(await html()).toBe(before);
  });

  test('every table and code block fits its page width', async ({ page }) => {
    await renderWidePage(page);
    await page.evaluate(() => window.preparePrintLayout());
    await page.emulateMedia({ media: 'print' });

    // Lay the article out at each page width and look for overflow.
    const overflows = await page.evaluate(({ P, L }) => {
      const article = document.getElementById('rendered-content');
      const items = [...article.querySelectorAll('pre, table')];
      const bad = [];
      for (const [width, wide] of [[P, false], [L, true]]) {
        article.style.width = width + 'px';
        const right = article.getBoundingClientRect().right;
        items.filter(el => el.classList.contains('print-wide') === wide).forEach(el => {
          if (el.getBoundingClientRect().right > right + 0.5 ||
              el.scrollWidth > el.clientWidth + 1) {
            bad.push(`${el.textContent.trim().slice(0, 20)} @ ${width}px`);
          }
        });
      }
      article.style.width = '';
      return bad;
    }, { P: PORTRAIT_PX, L: LANDSCAPE_PX });

    expect(overflows).toEqual([]);
  });

  for (const format of ['Letter', 'A4']) {
    test(`PDF (${format}) switches to landscape only for wide elements`, async ({ page }) => {
      await renderWidePage(page);
      await page.evaluate(() => window.preparePrintLayout());
      const pdf = await page.pdf({ format, preferCSSPageSize: true });

      // Collapse consecutive pages of the same orientation into runs.
      const runs = pageOrientations(pdf).join('').replace(/(.)\1+/g, '$1');
      // Groups: [L-CODE-WIDE + L-TABLE-WIDE], [F-TABLE-FORCE], [W-CODE-WRAP],
      // [L-CODE-LIST], each followed by portrait text.
      expect(runs).toBe('PLPLPLPLP');
    });
  }
});
