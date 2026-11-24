// @ts-check
// Wide tables / code blocks: landscape pages in the PDF (Chrome named
// pages) and landscape-width sheets on screen. Uses
// test-pages/wide-content.md, whose elements carry markers naming where
// they should go.
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { loadPage, ROOT } = require('./helpers');

const WIDE_MD = fs.readFileSync(path.join(ROOT, 'test-pages', 'wide-content.md'), 'utf8');

// Must match PORTRAIT_PX / LANDSCAPE_PX in markdown-viewer.html.
const PORTRAIT_PX = 680;
const LANDSCAPE_PX = 942;

// Expected classes per marker (first text in the element).
const EXPECTED = {
  'P-CODE-NARROW': [],
  'P-TABLE-NARROW': [],
  'P-TABLE-PROSE': [],
  'P-TABLE-COMMA': [],
  'L-CODE-WIDE': ['wide'],
  'L-TABLE-WIDE': ['wide'],
  'F-TABLE-FORCE': ['wide', 'wide-force'],
  'W-CODE-WRAP': ['wide', 'wide-wrap'],
  'L-CODE-LIST': ['wide'],
};

// Headings directly above a wide element move to its landscape page.
const EXPECTED_WIDE_HEADINGS = [
  'Code block that needs landscape',
  'Table too wide even for landscape',
  'Code block too wide even for landscape',
];

// Screen sheets, top to bottom: P = portrait, L = landscape. The last L
// holds W-CODE-WRAP and the list (with its heading) containing L-CODE-LIST.
const EXPECTED_SHEETS = 'PLPLPLP';
const SHEET_PX = { P: 770, L: 1032 }; // content width + padding + border

// Measurements depend on the real GitHub markdown CSS, which loadPage
// serves from node_modules. The viewport is wide enough for a landscape
// sheet beside the TOC.
async function renderWidePage(page) {
  await page.setViewportSize({ width: 1400, height: 900 });
  await loadPage(page);
  await page.evaluate(t => window.renderMarkdown(t, 'wide-content.md', null), WIDE_MD);
  await page.evaluate(() => document.fonts.ready);
}

// Min-content width (narrowest without breaking words) of the table
// whose text contains `marker`, optionally ignoring the comma breaks.
function tableMinWidth(page, marker, { withoutCommaBreaks = false } = {}) {
  return page.evaluate(({ marker, withoutCommaBreaks }) => {
    const article = document.getElementById('rendered-content');
    const table = [...article.querySelectorAll('table')]
      .find(t => t.textContent.includes(marker));
    const box = document.createElement('div');
    box.style.cssText = 'position:absolute;width:0;visibility:hidden';
    const clone = table.cloneNode(true);
    clone.style.cssText = 'display:table;width:auto;max-width:none';
    if (withoutCommaBreaks) clone.querySelectorAll('wbr.comma-wbr').forEach(w => w.remove());
    article.appendChild(box);
    box.appendChild(clone);
    const w = clone.offsetWidth;
    box.remove();
    return w;
  }, { marker, withoutCommaBreaks });
}

function wideClasses(page) {
  return page.evaluate(() => {
    const out = {};
    document.querySelectorAll('#rendered-content pre, #rendered-content table').forEach(el => {
      const marker = (el.textContent.match(/[PLWF]-(?:CODE|TABLE)-[A-Z]+/) || [])[0];
      if (marker) {
        out[marker] = ['wide', 'wide-wrap', 'wide-force']
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

test.describe('Wide content layout', () => {
  test('classifies tables and code blocks by required page width', async ({ page }) => {
    await renderWidePage(page);
    expect(await wideClasses(page)).toEqual(EXPECTED);
  });

  test('headings directly above a wide element go on its landscape page', async ({ page }) => {
    await renderWidePage(page);
    const wideHeadings = await page.evaluate(() =>
      [...document.querySelectorAll('#rendered-content :is(h1,h2,h3,h4,h5,h6).wide')]
        .map(h => h.textContent.trim()));
    expect(wideHeadings).toEqual(EXPECTED_WIDE_HEADINGS);
  });

  test('comma breaks are applied before deciding on landscape', async ({ page }) => {
    await renderWidePage(page);
    // Without comma breaks the table is too wide for portrait...
    expect(await tableMinWidth(page, 'P-TABLE-COMMA', { withoutCommaBreaks: true }))
      .toBeGreaterThan(PORTRAIT_PX);
    // ...with them it fits, so it stays portrait.
    expect(await tableMinWidth(page, 'P-TABLE-COMMA')).toBeLessThanOrEqual(PORTRAIT_PX);
    expect((await wideClasses(page))['P-TABLE-COMMA']).toEqual([]);
  });

  test('comma breaks go only in table-cell code', async ({ page }) => {
    await renderWidePage(page);
    const counts = await page.evaluate(() => ({
      inCellCode: document.querySelectorAll('td code wbr.comma-wbr, th code wbr.comma-wbr').length,
      total: document.querySelectorAll('wbr.comma-wbr').length,
    }));
    expect(counts.inCellCode).toBeGreaterThan(0);
    expect(counts.total).toBe(counts.inCellCode);
  });

  test('re-running the layout before printing changes nothing', async ({ page }) => {
    await renderWidePage(page);
    const html = () => page.evaluate(() => document.getElementById('rendered-content').innerHTML);
    const before = await html();
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    expect(await html()).toBe(before);
  });

  test('screen: content is grouped into portrait and landscape sheets', async ({ page }) => {
    await renderWidePage(page);
    const sheets = await page.evaluate(() =>
      [...document.querySelectorAll('#rendered-content > .sheet')].map(s => ({
        kind: s.classList.contains('sheet-landscape') ? 'L' : 'P',
        width: Math.round(s.getBoundingClientRect().width),
      })));
    expect(sheets.map(s => s.kind).join('')).toBe(EXPECTED_SHEETS);
    for (const s of sheets) expect(s.width).toBe(SHEET_PX[s.kind]);
  });

  test('screen: no table or code block needs horizontal scrolling', async ({ page }) => {
    await renderWidePage(page);
    const overflows = await page.evaluate(() =>
      [...document.querySelectorAll('#rendered-content pre, #rendered-content table')]
        .filter(el => el.scrollWidth > el.clientWidth + 1)
        .map(el => el.textContent.trim().slice(0, 20)));
    expect(overflows).toEqual([]);
  });

  test('PDF: every table and code block fits its page width', async ({ page }) => {
    await renderWidePage(page);
    await page.emulateMedia({ media: 'print' });

    // Lay the article out at each page width and look for overflow.
    const overflows = await page.evaluate(({ P, L }) => {
      const article = document.getElementById('rendered-content');
      const items = [...article.querySelectorAll('pre, table')];
      const bad = [];
      for (const [width, wide] of [[P, false], [L, true]]) {
        article.style.width = width + 'px';
        const right = article.getBoundingClientRect().right;
        items.filter(el => el.classList.contains('wide') === wide).forEach(el => {
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

  test('PDF: background colours print as on screen', async ({ page }) => {
    await renderWidePage(page);
    await page.emulateMedia({ media: 'print' });
    const adjust = await page.evaluate(() =>
      getComputedStyle(document.querySelector('#rendered-content code')).printColorAdjust);
    expect(adjust).toBe('exact');
  });

  for (const format of ['Letter', 'A4']) {
    test(`PDF (${format}) switches to landscape only for wide elements`, async ({ page }) => {
      await renderWidePage(page);
      await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
      const pdf = await page.pdf({ format, preferCSSPageSize: true });

      // Collapse consecutive pages of the same orientation into runs.
      const runs = pageOrientations(pdf).join('').replace(/(.)\1+/g, '$1');
      // Groups: [L-CODE-WIDE + L-TABLE-WIDE], [F-TABLE-FORCE], [W-CODE-WRAP],
      // [L-CODE-LIST], each followed by portrait text.
      expect(runs).toBe('PLPLPLPLP');
    });
  }
});
