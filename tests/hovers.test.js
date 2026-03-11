// ---------------------------------------------------------------------------
// Tests for hovers.js  — Hover provider helpers
// ---------------------------------------------------------------------------

const vscode = require('../tests/__mocks__/vscode');
const { _test } = require('../src/hovers');

const { getExtendedWord, buildHover } = _test;

// Helper: create a minimal mock document from a single line of text
function mockDocument(lineText) {
  return {
    lineAt(line) {
      return { text: lineText };
    },
  };
}


// ---------------------------------------------------------------------------
// getExtendedWord
// ---------------------------------------------------------------------------
describe('getExtendedWord', () => {
  it('expands a simple word', () => {
    const doc = mockDocument('hello world');
    const pos = new vscode.Position(0, 2); // 'l' in hello
    const { word, range } = getExtendedWord(doc, pos);
    expect(word).toBe('hello');
    expect(range.start.character).toBe(0);
    expect(range.end.character).toBe(5);
  });

  it('expands $.method', () => {
    const doc = mockDocument('$.component');
    const pos = new vscode.Position(0, 5);
    const { word } = getExtendedWord(doc, pos);
    expect(word).toBe('$.component');
  });

  it('expands $.http.get', () => {
    const doc = mockDocument('$.http.get');
    const pos = new vscode.Position(0, 8);
    const { word } = getExtendedWord(doc, pos);
    expect(word).toBe('$.http.get');
  });

  it('expands @click', () => {
    const doc = mockDocument('<button @click="save">');
    const pos = new vscode.Position(0, 10);
    const { word } = getExtendedWord(doc, pos);
    expect(word).toBe('@click');
  });

  it('expands @click.prevent', () => {
    const doc = mockDocument('@click.prevent');
    const pos = new vscode.Position(0, 2);
    const { word } = getExtendedWord(doc, pos);
    // getExtendedWord uses /[\w.$@-]/ so it should get the whole thing
    expect(word).toContain('@click');
  });

  it('expands z-if (right expansion stops at hyphen)', () => {
    const doc = mockDocument('z-if="show"');
    const pos = new vscode.Position(0, 1);
    const { word } = getExtendedWord(doc, pos);
    // getExtendedWord expands right only on /[\w]/, so hyphen stops it
    // when positioned before '-', left expansion reaches 'z', right stays at '-'
    expect(word).toBe('z');
  });

  it('expands z-if when positioned on the "i"', () => {
    const doc = mockDocument('z-if="show"');
    const pos = new vscode.Position(0, 2); // on 'i'
    const { word } = getExtendedWord(doc, pos);
    expect(word).toBe('z-if');
  });

  it('expands z-model', () => {
    const doc = mockDocument('<input z-model="name">');
    const pos = new vscode.Position(0, 9);
    const { word } = getExtendedWord(doc, pos);
    expect(word).toBe('z-model');
  });

  it('stops at whitespace', () => {
    const doc = mockDocument('one two');
    const pos = new vscode.Position(0, 0);
    const { word } = getExtendedWord(doc, pos);
    expect(word).toBe('one');
  });

  it('handles cursor at end of line', () => {
    const doc = mockDocument('abc');
    const pos = new vscode.Position(0, 3);
    const { word } = getExtendedWord(doc, pos);
    expect(word).toBe('abc');
  });
});


// ---------------------------------------------------------------------------
// buildHover
// ---------------------------------------------------------------------------
describe('buildHover', () => {
  it('builds hover with prefix for JS methods', () => {
    const entry = { name: 'get', detail: '(url) → Promise', documentation: 'Fetches data.' };
    const hover = buildHover(entry, '$.http');
    expect(hover).toBeInstanceOf(vscode.Hover);
    expect(hover.contents.value).toContain('$.http.get');
    expect(hover.contents.value).toContain('Fetches data.');
  });

  it('builds hover for z-* directives (no prefix)', () => {
    const entry = { name: 'z-if', detail: 'Conditional rendering', documentation: 'Removes from DOM.' };
    const hover = buildHover(entry);
    expect(hover.contents.value).toContain('z-if');
    expect(hover.contents.value).toContain('Conditional rendering');
    expect(hover.contents.value).toContain('Removes from DOM.');
  });

  it('builds hover for @event directives (no prefix)', () => {
    const entry = { name: '@click', detail: 'Click handler', documentation: 'Handles click.' };
    const hover = buildHover(entry);
    expect(hover.contents.value).toContain('@click');
  });

  it('builds hover for plain entries without prefix', () => {
    const entry = { name: 'state', detail: '() => object', documentation: 'Returns state.' };
    const hover = buildHover(entry);
    expect(hover.contents.value).toContain('state');
    expect(hover.contents.value).toContain('Returns state.');
  });

  it('handles entry with no documentation', () => {
    const entry = { name: 'test', detail: 'detail' };
    const hover = buildHover(entry, '$');
    expect(hover).toBeInstanceOf(vscode.Hover);
    expect(hover.contents.value).toContain('$.test');
  });
});


// ---------------------------------------------------------------------------
// Hover lookup pattern testing (regex patterns used in hover providers)
// ---------------------------------------------------------------------------
describe('hover lookup patterns', () => {
  describe('$.http.method pattern', () => {
    const regex = /(?:\$|zQuery)\.http\.(\w+)$/;

    it('matches $.http.get', () => {
      const m = '$.http.get'.match(regex);
      expect(m).not.toBeNull();
      expect(m[1]).toBe('get');
    });

    it('matches zQuery.http.post', () => {
      const m = 'zQuery.http.post'.match(regex);
      expect(m).not.toBeNull();
      expect(m[1]).toBe('post');
    });
  });

  describe('$.storage/session pattern', () => {
    const regex = /(?:\$|zQuery)\.(storage|session)\.(\w+)$/;

    it('matches $.storage.get', () => {
      const m = '$.storage.get'.match(regex);
      expect(m[1]).toBe('storage');
      expect(m[2]).toBe('get');
    });

    it('matches $.session.set', () => {
      const m = '$.session.set'.match(regex);
      expect(m[1]).toBe('session');
      expect(m[2]).toBe('set');
    });
  });

  describe('$.bus.method pattern', () => {
    const regex = /(?:\$|zQuery)\.bus\.(\w+)$/;

    it('matches $.bus.emit', () => {
      const m = '$.bus.emit'.match(regex);
      expect(m[1]).toBe('emit');
    });
  });

  describe('$.method pattern', () => {
    const regex = /(?:\$|zQuery)\.(\w+)$/;

    it('matches $.component', () => {
      const m = '$.component'.match(regex);
      expect(m[1]).toBe('component');
    });

    it('matches zQuery.router', () => {
      const m = 'zQuery.router'.match(regex);
      expect(m[1]).toBe('router');
    });
  });

  describe('event directive pattern', () => {
    const regex = /^(@[\w]+(?:\.[\w]+)*)/;

    it('matches @click', () => {
      const m = '@click'.match(regex);
      expect(m[1]).toBe('@click');
    });

    it('matches @click.prevent', () => {
      const m = '@click.prevent'.match(regex);
      expect(m[1]).toBe('@click.prevent');
    });

    it('matches @submit.prevent.stop', () => {
      const m = '@submit.prevent.stop'.match(regex);
      expect(m[1]).toBe('@submit.prevent.stop');
    });
  });

  describe('z-* directive pattern', () => {
    const regex = /^(z-[\w]+)/;

    it('matches z-if', () => {
      expect('z-if'.match(regex)[1]).toBe('z-if');
    });

    it('matches z-model', () => {
      expect('z-model'.match(regex)[1]).toBe('z-model');
    });

    it('matches z-on', () => {
      expect('z-on'.match(regex)[1]).toBe('z-on');
    });
  });
});
