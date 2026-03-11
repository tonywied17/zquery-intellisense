// ---------------------------------------------------------------------------
// Tests for snippets — Structure & syntax validation
// ---------------------------------------------------------------------------

const fs = require('fs');
const path = require('path');

const snippetsDir = path.resolve(__dirname, '..', 'snippets');
const htmlSnippets = JSON.parse(fs.readFileSync(path.join(snippetsDir, 'html.json'), 'utf-8'));
const jsSnippets = JSON.parse(fs.readFileSync(path.join(snippetsDir, 'javascript.json'), 'utf-8'));

/**
 * Get actual snippet entries (skip _comment_ keys).
 */
function getEntries(snippets) {
  return Object.entries(snippets).filter(([key]) => !key.startsWith('_comment'));
}

// ---------------------------------------------------------------------------
// Shared structure tests
// ---------------------------------------------------------------------------

function describeSnippets(label, snippets) {
  const entries = getEntries(snippets);

  describe(`${label} — structure`, () => {
    it('has at least one snippet', () => {
      expect(entries.length).toBeGreaterThan(0);
    });

    it.each(entries)('%s has required fields', (_name, snippet) => {
      expect(snippet).toHaveProperty('prefix');
      expect(snippet).toHaveProperty('body');
      expect(snippet).toHaveProperty('description');
    });

    it.each(entries)('%s prefix is a non-empty string', (_name, snippet) => {
      expect(typeof snippet.prefix).toBe('string');
      expect(snippet.prefix.length).toBeGreaterThan(0);
    });

    it.each(entries)('%s body is an array of strings', (_name, snippet) => {
      expect(Array.isArray(snippet.body)).toBe(true);
      expect(snippet.body.length).toBeGreaterThan(0);
      for (const line of snippet.body) {
        expect(typeof line).toBe('string');
      }
    });

    it.each(entries)('%s description is a non-empty string', (_name, snippet) => {
      expect(typeof snippet.description).toBe('string');
      expect(snippet.description.length).toBeGreaterThan(0);
    });
  });

  describe(`${label} — no duplicate prefixes`, () => {
    it('all prefixes are unique', () => {
      const prefixes = entries.map(([, s]) => s.prefix);
      const seen = new Set();
      const dupes = [];
      for (const p of prefixes) {
        if (seen.has(p)) dupes.push(p);
        seen.add(p);
      }
      expect(dupes).toEqual([]);
    });
  });

  describe(`${label} — tab-stop syntax`, () => {
    // Tabstops: $1, $2, ${1:placeholder}, ${1|choice1,choice2|}
    // Verify no obviously broken placeholders like unclosed ${ without }
    it.each(entries)('%s has balanced snippet placeholders', (_name, snippet) => {
      const joined = snippet.body.join('\n');
      // Count ${ and } — every ${ should have a matching }
      const opens = (joined.match(/\$\{/g) || []).length;
      const closes = (joined.match(/\}/g) || []).length;
      // closes >= opens because } can appear in other contexts (e.g. CSS)
      expect(closes).toBeGreaterThanOrEqual(opens);
    });

    it.each(entries)('%s does not have negative tab-stop numbers', (_name, snippet) => {
      const joined = snippet.body.join('\n');
      // $-1 or ${-1:...} would be invalid
      expect(joined).not.toMatch(/\$-\d/);
      expect(joined).not.toMatch(/\$\{-\d/);
    });
  });
}

// ---------------------------------------------------------------------------
// HTML snippets
// ---------------------------------------------------------------------------

describeSnippets('HTML snippets', htmlSnippets);

describe('HTML snippets — content validation', () => {
  const entries = getEntries(htmlSnippets);

  it('contains core z-* directive snippets', () => {
    const prefixes = entries.map(([, s]) => s.prefix);
    expect(prefixes).toContain('z-if');
    expect(prefixes).toContain('z-for');
    expect(prefixes).toContain('z-show');
    expect(prefixes).toContain('z-model');
    expect(prefixes).toContain('z-bind');
    expect(prefixes).toContain('z-class');
    expect(prefixes).toContain('z-style');
    expect(prefixes).toContain('z-ref');
  });

  it('contains @ event snippets', () => {
    const prefixes = entries.map(([, s]) => s.prefix);
    const hasEvent = prefixes.some((p) => p.startsWith('@') || p.startsWith('z-on'));
    expect(hasEvent).toBe(true);
  });

  it('z-for snippet includes iteration syntax', () => {
    const zFor = entries.find(([, s]) => s.prefix === 'z-for');
    expect(zFor).toBeDefined();
    const body = zFor[1].body.join('\n');
    expect(body).toContain('z-for=');
    expect(body).toMatch(/\bin\b/); // "item in items"
  });

  it('z-model snippet includes two-way binding', () => {
    const zModel = entries.find(([, s]) => s.prefix === 'z-model');
    expect(zModel).toBeDefined();
    const body = zModel[1].body.join('\n');
    expect(body).toContain('z-model=');
  });
});


// ---------------------------------------------------------------------------
// JavaScript snippets
// ---------------------------------------------------------------------------

describeSnippets('JavaScript snippets', jsSnippets);

describe('JavaScript snippets — content validation', () => {
  const entries = getEntries(jsSnippets);

  it('contains core zQuery snippets', () => {
    const prefixes = entries.map(([, s]) => s.prefix);
    expect(prefixes).toContain('zq-select');
    expect(prefixes).toContain('zq-component');
    expect(prefixes).toContain('zq-mount');
  });

  it('has significant number of snippets', () => {
    expect(entries.length).toBeGreaterThan(50);
  });

  it('component snippet includes $.component call', () => {
    const comp = entries.find(([, s]) => s.prefix === 'zq-component');
    expect(comp).toBeDefined();
    const body = comp[1].body.join('\n');
    expect(body).toContain('$.component');
  });

  it('signal snippet includes $.signal', () => {
    const sig = entries.find(([, s]) => s.prefix === 'zq-signal');
    expect(sig).toBeDefined();
    const body = sig[1].body.join('\n');
    expect(body).toContain('$.signal');
  });

  it('router snippet includes $.router', () => {
    const router = entries.find(([, s]) => s.prefix === 'zq-router');
    expect(router).toBeDefined();
    const body = router[1].body.join('\n');
    expect(body).toContain('$.router');
  });
});
