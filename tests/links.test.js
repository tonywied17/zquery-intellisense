// ---------------------------------------------------------------------------
// Tests for links.js  — Document Link provider
// ---------------------------------------------------------------------------

const vscode = require('../tests/__mocks__/vscode');
const { _test } = require('../src/links');

const { linkProvider } = _test;

// Helper: create a mock document from a full text string
function mockDocument(text, fsPath = '/project/scripts/components/counter.js') {
  const lines = text.split('\n');
  let offsetMap = [];
  let running = 0;
  for (const line of lines) {
    offsetMap.push(running);
    running += line.length + 1; // +1 for newline
  }

  return {
    uri: new vscode.Uri(fsPath),
    languageId: 'javascript',
    getText() {
      return text;
    },
    positionAt(offset) {
      for (let i = offsetMap.length - 1; i >= 0; i--) {
        if (offset >= offsetMap[i]) {
          return new vscode.Position(i, offset - offsetMap[i]);
        }
      }
      return new vscode.Position(0, 0);
    },
    offsetAt(pos) {
      return offsetMap[pos.line] + pos.character;
    },
    lineAt(line) {
      return { text: lines[line] };
    },
  };
}


// ---------------------------------------------------------------------------
// linkProvider.provideDocumentLinks
// ---------------------------------------------------------------------------
describe('linkProvider.provideDocumentLinks', () => {
  it('creates a link for templateUrl', () => {
    const doc = mockDocument(`$.component('my-comp', {
  templateUrl: './my-comp.html',
});`);
    const links = linkProvider.provideDocumentLinks(doc);
    expect(links).toHaveLength(1);
    expect(links[0].target.fsPath).toContain('my-comp.html');
    expect(links[0].tooltip).toBe('Open ./my-comp.html');
  });

  it('creates a link for styleUrl', () => {
    const doc = mockDocument(`$.component('my-comp', {
  styleUrl: './my-comp.css',
});`);
    const links = linkProvider.provideDocumentLinks(doc);
    expect(links).toHaveLength(1);
    expect(links[0].target.fsPath).toContain('my-comp.css');
  });

  it('creates links for both templateUrl and styleUrl', () => {
    const doc = mockDocument(`$.component('my-comp', {
  templateUrl: './my-comp.html',
  styleUrl: './my-comp.css',
});`);
    const links = linkProvider.provideDocumentLinks(doc);
    expect(links).toHaveLength(2);
  });

  it('handles single-quoted paths', () => {
    const doc = mockDocument(`$.component('x', {
  templateUrl: './x.html',
});`);
    const links = linkProvider.provideDocumentLinks(doc);
    expect(links).toHaveLength(1);
    expect(links[0].target.fsPath).toContain('x.html');
  });

  it('returns empty for files with no templateUrl/styleUrl', () => {
    const doc = mockDocument('const x = 42;');
    const links = linkProvider.provideDocumentLinks(doc);
    expect(links).toHaveLength(0);
  });

  it('handles subdirectory paths', () => {
    const doc = mockDocument(`$.component('contacts', {
  templateUrl: '../contacts/contacts.html',
  styleUrl: '../contacts/contacts.css',
});`);
    const links = linkProvider.provideDocumentLinks(doc);
    expect(links).toHaveLength(2);
    expect(links[0].target.fsPath).toContain('contacts.html');
    expect(links[1].target.fsPath).toContain('contacts.css');
  });

  it('link ranges point at the file path string only', () => {
    const text = `templateUrl: './my-comp.html',`;
    const doc = mockDocument(text);
    const links = linkProvider.provideDocumentLinks(doc);
    expect(links).toHaveLength(1);
    // The range should cover './my-comp.html' (not the quotes)
    const rangeStart = links[0].range.start.character;
    const rangeEnd = links[0].range.end.character;
    expect(text.substring(rangeStart, rangeEnd)).toBe('./my-comp.html');
  });

  it('handles multiple components in one file', () => {
    const doc = mockDocument(`$.component('a', { templateUrl: './a.html' });
$.component('b', { templateUrl: './b.html' });`);
    const links = linkProvider.provideDocumentLinks(doc);
    expect(links).toHaveLength(2);
  });
});


// ---------------------------------------------------------------------------
// templateUrl / styleUrl regex pattern
// ---------------------------------------------------------------------------
describe('templateUrl/styleUrl regex', () => {
  const regex = /(?:templateUrl|styleUrl)\s*:\s*(['"])([^'"]+)\1/g;

  it('matches templateUrl with double quotes', () => {
    const text = 'templateUrl: "./template.html"';
    const m = regex.exec(text);
    expect(m).not.toBeNull();
    expect(m[2]).toBe('./template.html');
  });

  it('matches styleUrl with single quotes', () => {
    regex.lastIndex = 0;
    const text = "styleUrl: './styles.css'";
    const m = regex.exec(text);
    expect(m).not.toBeNull();
    expect(m[2]).toBe('./styles.css');
  });

  it('matches with extra spacing', () => {
    regex.lastIndex = 0;
    const text = "templateUrl:  './path/to/file.html'";
    const m = regex.exec(text);
    expect(m).not.toBeNull();
    expect(m[2]).toBe('./path/to/file.html');
  });
});
