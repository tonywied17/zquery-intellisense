// ---------------------------------------------------------------------------
// Minimal vscode module mock for unit-testing outside the Extension Host
// ---------------------------------------------------------------------------

class Position {
  constructor(line, character) {
    this.line = line;
    this.character = character;
  }
}

class Range {
  constructor(startLineOrPos, startCharOrEnd, endLine, endChar) {
    if (typeof startLineOrPos === 'number' && endLine !== undefined) {
      this.start = new Position(startLineOrPos, startCharOrEnd);
      this.end = new Position(endLine, endChar);
    } else if (typeof startLineOrPos === 'number' && endLine === undefined) {
      // Range(startLine, startChar)  — used as two-arg shorthand
      this.start = new Position(startLineOrPos, startCharOrEnd || 0);
      this.end = new Position(startLineOrPos, startCharOrEnd || 0);
    } else {
      this.start = startLineOrPos;
      this.end = startCharOrEnd;
    }
  }
}

class Location {
  constructor(uri, positionOrRange) {
    this.uri = uri;
    if (positionOrRange instanceof Range) {
      this.range = positionOrRange;
    } else {
      this.range = new Range(positionOrRange, positionOrRange);
    }
  }
}

class Uri {
  constructor(fsPath) {
    this.fsPath = fsPath;
    this.scheme = 'file';
  }
  static file(p) {
    return new Uri(p);
  }
  toString() {
    return `file://${this.fsPath}`;
  }
}

class MarkdownString {
  constructor(value = '') {
    this.value = value;
    this.isTrusted = false;
  }
  appendCodeblock(code, lang) {
    this.value += `\n\`\`\`${lang || ''}\n${code}\n\`\`\`\n`;
    return this;
  }
  appendMarkdown(md) {
    this.value += md;
    return this;
  }
}

class SnippetString {
  constructor(value = '') {
    this.value = value;
  }
}

class CompletionItem {
  constructor(label, kind) {
    this.label = label;
    this.kind = kind;
  }
}

class Hover {
  constructor(contents, range) {
    this.contents = contents;
    this.range = range;
  }
}

class DocumentLink {
  constructor(range, target) {
    this.range = range;
    this.target = target;
  }
}

const CompletionItemKind = {
  Text: 0,
  Method: 1,
  Function: 2,
  Constructor: 3,
  Field: 4,
  Variable: 5,
  Class: 6,
  Interface: 7,
  Module: 8,
  Property: 9,
  Unit: 10,
  Value: 11,
  Enum: 12,
  Keyword: 13,
  Snippet: 14,
  Color: 15,
  File: 16,
  Reference: 17,
  Folder: 18,
  Event: 22,
};

// Stub workspace config
const workspace = {
  getConfiguration(section) {
    return {
      get(key, defaultVal) {
        return defaultVal;
      },
    };
  },
  findFiles() {
    return Promise.resolve([]);
  },
  fs: {
    stat() {
      return Promise.reject(new Error('not found'));
    },
  },
};

const languages = {
  registerCompletionItemProvider() { return { dispose() {} }; },
  registerHoverProvider() { return { dispose() {} }; },
  registerDefinitionProvider() { return { dispose() {} }; },
  registerDocumentLinkProvider() { return { dispose() {} }; },
};

const window = {
  createOutputChannel() {
    return { appendLine() {}, dispose() {} };
  },
};

module.exports = {
  Position,
  Range,
  Location,
  Uri,
  MarkdownString,
  SnippetString,
  CompletionItem,
  CompletionItemKind,
  Hover,
  DocumentLink,
  workspace,
  languages,
  window,
};
