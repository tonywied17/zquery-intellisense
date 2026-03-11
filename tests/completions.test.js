// ---------------------------------------------------------------------------
// Tests for completions.js  — Completion provider helpers
// ---------------------------------------------------------------------------

const vscode = require('../tests/__mocks__/vscode');
const { _test } = require('../src/completions');

const { isInsideTag, toCompletion } = _test;


// ---------------------------------------------------------------------------
// isInsideTag
// ---------------------------------------------------------------------------
describe('isInsideTag', () => {
  it('returns true when cursor is inside an HTML tag', () => {
    expect(isInsideTag('<div ')).toBe(true);
    expect(isInsideTag('<button class="btn" ')).toBe(true);
    expect(isInsideTag('<input type="text" z-')).toBe(true);
  });

  it('returns true inside self-closing tags', () => {
    expect(isInsideTag('<img src="x" ')).toBe(true);
    expect(isInsideTag('<br ')).toBe(true);
  });

  it('returns false outside tags', () => {
    expect(isInsideTag('hello world')).toBe(false);
    expect(isInsideTag('<div>content')).toBe(false);
    expect(isInsideTag('<div>text</div>')).toBe(false);
  });

  it('returns false after tag is closed', () => {
    expect(isInsideTag('<div>')).toBe(false);
    expect(isInsideTag('<div class="a">')).toBe(false);
    expect(isInsideTag('<br />')).toBe(false);
  });

  it('handles multiple tags — only checks last open/close', () => {
    expect(isInsideTag('<div><span ')).toBe(true);
    expect(isInsideTag('<div></div><span ')).toBe(true);
    expect(isInsideTag('<div></div><span>')).toBe(false);
  });

  it('handles edge cases', () => {
    expect(isInsideTag('')).toBe(false);
    expect(isInsideTag('<')).toBe(true);
    expect(isInsideTag('>')).toBe(false);
  });
});


// ---------------------------------------------------------------------------
// toCompletion
// ---------------------------------------------------------------------------
describe('toCompletion', () => {
  it('creates a CompletionItem with correct label and kind', () => {
    const entry = {
      name: 'component',
      kind: 'Function',
      detail: '(name, def) → void',
      documentation: 'Registers a component.',
    };
    const item = toCompletion(entry, '00');
    expect(item.label).toBe('component');
    expect(item.kind).toBe(vscode.CompletionItemKind.Function);
    expect(item.detail).toBe('(name, def) → void');
    expect(item.sortText).toBe('00_component');
  });

  it('creates a SnippetString for insertText', () => {
    const entry = {
      name: 'get',
      kind: 'Method',
      detail: '(url, options?) → Promise',
      documentation: 'HTTP GET.',
      insertText: "get('$1')",
    };
    const item = toCompletion(entry);
    expect(item.insertText).toBeInstanceOf(vscode.SnippetString);
    expect(item.insertText.value).toBe("get('$1')");
  });

  it('handles missing optional fields', () => {
    const entry = { name: 'test', kind: 'Property' };
    const item = toCompletion(entry);
    expect(item.label).toBe('test');
    expect(item.detail).toBe('');
  });

  it('falls back to Text kind for unknown kind strings', () => {
    const entry = { name: 'x', kind: 'UnknownKind' };
    const item = toCompletion(entry);
    expect(item.kind).toBe(vscode.CompletionItemKind.Text);
  });

  it('maps all known kind strings', () => {
    const kinds = ['Function', 'Method', 'Property', 'Variable', 'Module', 'Field', 'Value', 'Snippet'];
    for (const k of kinds) {
      const item = toCompletion({ name: 'x', kind: k });
      expect(item.kind).toBe(vscode.CompletionItemKind[k]);
    }
  });
});


// ---------------------------------------------------------------------------
// Completion provider trigger patterns (regex testing)
// ---------------------------------------------------------------------------
describe('completion trigger patterns', () => {
  describe('$ namespace triggers', () => {
    const dotRegex = /(?:^|[^.\w])\$\.\s*$/;
    const zQueryRegex = /zQuery\.\s*$/;

    it('matches $.', () => {
      expect(dotRegex.test('$.')).toBe(true);
      expect(dotRegex.test('const x = $.')).toBe(true);
    });

    it('matches zQuery.', () => {
      expect(zQueryRegex.test('zQuery.')).toBe(true);
    });

    it('does not match x$.', () => {
      expect(dotRegex.test('x$.')).toBe(false);
    });
  });

  describe('sub-namespace triggers', () => {
    const httpRegex = /(?:^|[^.\w])\$\.http\.\s*$/;
    const storageRegex = /(?:^|[^.\w])\$\.storage\.\s*$/;
    const sessionRegex = /(?:^|[^.\w])\$\.session\.\s*$/;
    const busRegex = /(?:^|[^.\w])\$\.bus\.\s*$/;

    it('matches $.http.', () => {
      expect(httpRegex.test('$.http.')).toBe(true);
      expect(httpRegex.test('const r = $.http.')).toBe(true);
    });

    it('matches $.storage.', () => {
      expect(storageRegex.test('$.storage.')).toBe(true);
    });

    it('matches $.session.', () => {
      expect(sessionRegex.test('$.session.')).toBe(true);
    });

    it('matches $.bus.', () => {
      expect(busRegex.test('$.bus.')).toBe(true);
    });

    it('does not false-positive on $.httpx.', () => {
      expect(httpRegex.test('$.httpx.')).toBe(false);
    });
  });

  describe('collection chain trigger', () => {
    const chainRegex = /(?:\$\.(?:all|create|classes|tag|name|children)|(?:^|[^.\w])\$)\([^)]*\)(?:\.\w+\([^)]*\))*\.\s*$/;

    it('matches $().', () => {
      expect(chainRegex.test("$('.card').")).toBe(true);
    });

    it('matches $.all().', () => {
      expect(chainRegex.test("$.all('.item').")).toBe(true);
    });

    it('matches chained calls', () => {
      expect(chainRegex.test("$('.card').addClass('x').")).toBe(true);
    });

    it('matches $.create().', () => {
      expect(chainRegex.test("$.create('div').")).toBe(true);
    });

    it('does not match just $.', () => {
      expect(chainRegex.test('$.')).toBe(false);
    });
  });

  describe('HTML directive triggers', () => {
    const eventRegex = /@[\w.]*$/;
    const zRegex = /\bz-[\w]*$/;
    const bindRegex = /\s:[\w]*$/;

    it('matches @click', () => {
      expect(eventRegex.test('@click')).toBe(true);
      expect(eventRegex.test('@')).toBe(true);
      expect(eventRegex.test('@submit.prevent')).toBe(true);
    });

    it('matches z-*', () => {
      expect(zRegex.test('z-')).toBe(true);
      expect(zRegex.test('z-if')).toBe(true);
      expect(zRegex.test('z-model')).toBe(true);
    });

    it('matches :attr shorthand', () => {
      expect(bindRegex.test(' :')).toBe(true);
      expect(bindRegex.test(' :href')).toBe(true);
    });
  });
});
