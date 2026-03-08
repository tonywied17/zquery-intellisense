// ---------------------------------------------------------------------------
// zQuery Completion Providers
// ---------------------------------------------------------------------------

const vscode = require('vscode');
const docs = require('./docs');

// Map string kind → vscode CompletionItemKind
const KIND_MAP = {
  Function: vscode.CompletionItemKind.Function,
  Method:   vscode.CompletionItemKind.Method,
  Property: vscode.CompletionItemKind.Property,
  Variable: vscode.CompletionItemKind.Variable,
  Module:   vscode.CompletionItemKind.Module,
  Field:    vscode.CompletionItemKind.Field,
  Value:    vscode.CompletionItemKind.Value,
  Snippet:  vscode.CompletionItemKind.Snippet,
};

/**
 * Convert a docs entry into a VS Code CompletionItem.
 */
function toCompletion(entry, sortPrefix) {
  const item = new vscode.CompletionItem(entry.name, KIND_MAP[entry.kind] || vscode.CompletionItemKind.Text);
  item.detail = entry.detail || '';
  item.documentation = new vscode.MarkdownString(entry.documentation || '');
  item.documentation.isTrusted = true;
  if (entry.insertText) {
    item.insertText = new vscode.SnippetString(entry.insertText);
  }
  if (sortPrefix !== undefined) {
    item.sortText = `${sortPrefix}_${entry.name}`;
  }
  return item;
}


// -- JavaScript / TypeScript provider ---------------------------------------

const JS_SELECTOR = [
  { language: 'javascript', scheme: 'file' },
  { language: 'javascript', scheme: 'untitled' },
  { language: 'javascriptreact', scheme: 'file' },
  { language: 'javascriptreact', scheme: 'untitled' },
  { language: 'typescript', scheme: 'file' },
  { language: 'typescript', scheme: 'untitled' },
  { language: 'typescriptreact', scheme: 'file' },
  { language: 'typescriptreact', scheme: 'untitled' },
];

/**
 * Provides completions for:
 *   $.           → all $ namespace methods
 *   zQuery.      → all $ namespace methods
 *   $.http.      → HTTP client methods
 *   $.storage.   → storage wrapper methods
 *   $.session.   → session wrapper methods
 *   $.bus.       → event bus methods
 */
const jsDotProvider = {
  provideCompletionItems(document, position) {
    if (!vscode.workspace.getConfiguration('zquery').get('enable', true)) return;

    const linePrefix = document.lineAt(position).text.substring(0, position.character);

    // Sub-namespace completions (check these first — they are more specific)
    if (/(?:^|[^.\w])\$\.http\.\s*$/.test(linePrefix) || /zQuery\.http\.\s*$/.test(linePrefix)) {
      return docs.httpMethods.map((e, i) => toCompletion(e, String(i).padStart(2, '0')));
    }
    if (/(?:^|[^.\w])\$\.storage\.\s*$/.test(linePrefix) || /zQuery\.storage\.\s*$/.test(linePrefix)) {
      return docs.storageMethods.map((e, i) => toCompletion(e, String(i).padStart(2, '0')));
    }
    if (/(?:^|[^.\w])\$\.session\.\s*$/.test(linePrefix) || /zQuery\.session\.\s*$/.test(linePrefix)) {
      return docs.storageMethods.map((e, i) => toCompletion(e, String(i).padStart(2, '0')));
    }
    if (/(?:^|[^.\w])\$\.bus\.\s*$/.test(linePrefix) || /zQuery\.bus\.\s*$/.test(linePrefix)) {
      return docs.busMethods.map((e, i) => toCompletion(e, String(i).padStart(2, '0')));
    }

    // Top-level $ namespace
    if (/(?:^|[^.\w])\$\.\s*$/.test(linePrefix) || /zQuery\.\s*$/.test(linePrefix)) {
      return docs.dollarMethods.map((e, i) => toCompletion(e, String(i).padStart(2, '0')));
    }

    return undefined;
  },
};

/**
 * Provides ZQueryCollection method completions after patterns like:
 *   $('…').             (since $() returns ZQueryCollection)
 *   $.all('…').
 *   $.all(…).method().
 */
const jsCollectionProvider = {
  provideCompletionItems(document, position) {
    if (!vscode.workspace.getConfiguration('zquery').get('enable', true)) return;

    const linePrefix = document.lineAt(position).text.substring(0, position.character);

    // Heuristic: detect chained calls following $() or $.all()
    if (/(?:\$\.all|(?:^|[^.\w])\$)\([^)]*\)(?:\.\w+\([^)]*\))*\.\s*$/.test(linePrefix)) {
      return docs.collectionMethods.map((e, i) => toCompletion(e, String(i).padStart(2, '0')));
    }

    return undefined;
  },
};

/**
 * Provides component definition key completions inside $.component({…}).
 * Triggers on property names for: state, render, pages, styles, etc.
 */
const jsComponentKeyProvider = {
  provideCompletionItems(document, position) {
    if (!vscode.workspace.getConfiguration('zquery').get('enable', true)) return;

    // Scan backwards to see if we're inside a $.component('…', { … }) block
    const text = document.getText(new vscode.Range(
      Math.max(0, position.line - 40), 0,
      position.line, position.character
    ));
    if (!/\$\.component\s*\(\s*['"][^'"]+['"]/.test(text)) return;

    // Only suggest if the cursor looks like it's at a key position
    // (start of a line inside the object, after a comma/opening brace)
    const linePrefix = document.lineAt(position).text.substring(0, position.character).trimStart();
    // Skip if we're clearly inside a value (after a colon, inside a string, etc.)
    if (/:\s*\S/.test(linePrefix)) return;

    return docs.componentKeys.map((e, i) => toCompletion(e, String(i).padStart(2, '0')));
  },
};


// -- HTML directive provider ------------------------------------------------

const HTML_SELECTOR = [
  { language: 'html', scheme: 'file' },
  { language: 'html', scheme: 'untitled' },
  // Also trigger inside JS/TS template literals
  ...JS_SELECTOR,
];

/**
 * Provides completions for zQuery HTML directives:
 *   @event  — event binding directives (@click, @submit, etc.)
 *   z-*     — z-model, z-ref, z-link, z-lazy, z-trim, z-number
 */
const htmlDirectiveProvider = {
  provideCompletionItems(document, position) {
    if (!vscode.workspace.getConfiguration('zquery').get('enable', true)) return;

    const lineText = document.lineAt(position).text;
    const prefix = lineText.substring(0, position.character);

    // We want to trigger inside HTML tags. Quick check: look for an unclosed <
    const insideTag = isInsideTag(prefix);

    // Event directives: triggered by @
    if (/@[\w.]*$/.test(prefix) && insideTag) {
      return docs.eventDirectives.map((e, i) => {
        const item = new vscode.CompletionItem(e.name, vscode.CompletionItemKind.Event);
        item.detail = `zQuery: ${e.detail}`;
        item.documentation = new vscode.MarkdownString(e.documentation);
        item.documentation.isTrusted = true;
        item.insertText = new vscode.SnippetString(e.insertText);
        item.sortText = String(i).padStart(2, '0');
        // Replace the @ that was already typed
        const atPos = prefix.lastIndexOf('@');
        item.range = new vscode.Range(position.line, atPos, position.line, position.character);
        return item;
      });
    }

    // z-* directives: triggered by z- (or just z)
    if (/\bz-[\w]*$/.test(prefix) && insideTag) {
      return docs.zDirectives.map((e, i) => {
        const item = new vscode.CompletionItem(e.name, vscode.CompletionItemKind.Property);
        item.detail = `zQuery: ${e.detail}`;
        item.documentation = new vscode.MarkdownString(e.documentation);
        item.documentation.isTrusted = true;
        item.insertText = new vscode.SnippetString(e.insertText);
        item.sortText = String(i).padStart(2, '0');
        // Replace the z- prefix already typed
        const zPos = prefix.lastIndexOf('z-');
        if (zPos >= 0) {
          item.range = new vscode.Range(position.line, zPos, position.line, position.character);
        }
        return item;
      });
    }

    // :attr shorthand binding (z-bind shorthand)
    if (/\s:[\w]*$/.test(prefix) && insideTag) {
      const common = ['href', 'src', 'alt', 'title', 'disabled', 'hidden', 'id', 'class', 'style', 'value', 'placeholder', 'type', 'name', 'action', 'method', 'target', 'aria-label', 'role'];
      return common.map((attr, i) => {
        const item = new vscode.CompletionItem(':' + attr, vscode.CompletionItemKind.Property);
        item.detail = `zQuery: Bind :${attr}`;
        item.documentation = new vscode.MarkdownString(`Dynamic attribute binding shorthand for \`z-bind:${attr}\`.\n\n\`\`\`html\n<element :${attr}="expression">\n\`\`\``);
        item.documentation.isTrusted = true;
        item.insertText = new vscode.SnippetString(`:${attr}="\$1"`);
        item.sortText = String(i).padStart(2, '0');
        const colonPos = prefix.lastIndexOf(':');
        if (colonPos >= 0) {
          item.range = new vscode.Range(position.line, colonPos, position.line, position.character);
        }
        return item;
      });
    }

    return undefined;
  },
};

/**
 * Simple heuristic: check if cursor is inside an HTML tag (< ... >).
 */
function isInsideTag(prefix) {
  const lastOpen = prefix.lastIndexOf('<');
  const lastClose = prefix.lastIndexOf('>');
  return lastOpen > lastClose;
}


// -- Registration -----------------------------------------------------------

function registerCompletionProviders(context) {
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(JS_SELECTOR, jsDotProvider, '.'),
    vscode.languages.registerCompletionItemProvider(JS_SELECTOR, jsCollectionProvider, '.'),
    vscode.languages.registerCompletionItemProvider(JS_SELECTOR, jsComponentKeyProvider),
    vscode.languages.registerCompletionItemProvider(HTML_SELECTOR, htmlDirectiveProvider, '@', '-', ':'),
  );
}

module.exports = { registerCompletionProviders };
