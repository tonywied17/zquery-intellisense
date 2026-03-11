// ---------------------------------------------------------------------------
// zQuery Hover Providers
// ---------------------------------------------------------------------------

const vscode = require('vscode');
const docs = require('./docs');


// -- Build lookup maps ------------------------------------------------------

/** @type {Map<string, {detail:string, documentation:string}>} */
const dollarMap = new Map();
for (const entry of docs.dollarMethods) {
  dollarMap.set(entry.name, entry);
}

const httpMap = new Map();
for (const entry of docs.httpMethods) {
  httpMap.set(entry.name, entry);
}

const storageMap = new Map();
for (const entry of docs.storageMethods) {
  storageMap.set(entry.name, entry);
}

const busMap = new Map();
for (const entry of docs.busMethods) {
  busMap.set(entry.name, entry);
}

const collectionMap = new Map();
for (const entry of docs.collectionMethods) {
  collectionMap.set(entry.name, entry);
}

const componentKeyMap = new Map();
for (const entry of docs.componentKeys) {
  componentKeyMap.set(entry.name, entry);
}

const directiveMap = new Map();
for (const entry of [...docs.zDirectives, ...docs.eventDirectives]) {
  directiveMap.set(entry.name, entry);
}


// -- Helpers ----------------------------------------------------------------

/**
 * Build a MarkdownString hover from a docs entry.
 */
function buildHover(entry, prefix) {
  const md = new vscode.MarkdownString();
  md.isTrusted = true;

  if (prefix) {
    md.appendCodeblock(`${prefix}.${entry.name}  ${entry.detail || ''}`, 'typescript');
  } else if (entry.name.startsWith('@') || entry.name.startsWith('z-')) {
    md.appendCodeblock(entry.name, 'html');
    if (entry.detail) md.appendMarkdown(`\n**${entry.detail}**\n\n`);
  } else {
    md.appendCodeblock(`${entry.name}  ${entry.detail || ''}`, 'typescript');
  }

  if (entry.documentation) {
    md.appendMarkdown('\n---\n\n');
    md.appendMarkdown(entry.documentation);
  }

  return new vscode.Hover(md);
}

/**
 * Get the word at a position, including dots and @ and hyphens.
 */
function getExtendedWord(document, position) {
  // Expand left
  let start = position.character;
  const lineText = document.lineAt(position.line).text;
  while (start > 0 && /[\w.$@-]/.test(lineText[start - 1])) start--;
  // Expand right
  let end = position.character;
  while (end < lineText.length && /[\w]/.test(lineText[end])) end++;
  return {
    word: lineText.substring(start, end),
    range: new vscode.Range(position.line, start, position.line, end),
  };
}


// -- JavaScript / TypeScript hover ------------------------------------------

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

const jsHoverProvider = {
  provideHover(document, position) {
    if (!vscode.workspace.getConfiguration('zquery').get('enable', true)) return;

    const { word } = getExtendedWord(document, position);

    // $.http.method
    const httpMatch = word.match(/(?:\$|zQuery)\.http\.(\w+)$/);
    if (httpMatch && httpMap.has(httpMatch[1])) {
      return buildHover(httpMap.get(httpMatch[1]), '$.http');
    }

    // $.storage.method or $.session.method
    const storageMatch = word.match(/(?:\$|zQuery)\.(storage|session)\.(\w+)$/);
    if (storageMatch && storageMap.has(storageMatch[2])) {
      return buildHover(storageMap.get(storageMatch[2]), `$.${storageMatch[1]}`);
    }

    // $.bus.method
    const busMatch = word.match(/(?:\$|zQuery)\.bus\.(\w+)$/);
    if (busMatch && busMap.has(busMatch[1])) {
      return buildHover(busMap.get(busMatch[1]), '$.bus');
    }

    // $.method
    const dollarMatch = word.match(/(?:\$|zQuery)\.(\w+)$/);
    if (dollarMatch && dollarMap.has(dollarMatch[1])) {
      return buildHover(dollarMap.get(dollarMatch[1]), '$');
    }

    // ZQueryCollection methods — hover on .method() after $() or $.all(…) chains
    const lineText = document.lineAt(position.line).text;
    const beforeCursor = lineText.substring(0, position.character);
    const collMatch = word.match(/\.?(\w+)$/);
    if (collMatch && collectionMap.has(collMatch[1])) {
      // Check if this looks like a collection chain: $() / $.all(…) / $.create(…) / $.classes(…) / .method().method
      if (/(?:\$|zQuery)(?:\.(?:all|create|classes|tag|name|children))?\s*\(/.test(beforeCursor) || /\)\s*\.\s*\w*$/.test(beforeCursor)) {
        return buildHover(collectionMap.get(collMatch[1]), 'ZQueryCollection');
      }
    }

    // Component definition keys (pages, state, render, etc.)
    // Detect if cursor is on a key inside a $.component({…}) block
    if (componentKeyMap.has(word)) {
      const text = document.getText(new vscode.Range(
        Math.max(0, position.line - 50), 0,
        position.line, position.character
      ));
      if (/\$\.component\s*\(\s*['"][^'"]+['"]/.test(text)) {
        return buildHover(componentKeyMap.get(word), 'ComponentDefinition');
      }
    }

    return undefined;
  },
};


// -- HTML / template hover --------------------------------------------------

const HTML_SELECTOR = [
  { language: 'html', scheme: 'file' },
  { language: 'html', scheme: 'untitled' },
  ...JS_SELECTOR,
];

const htmlHoverProvider = {
  provideHover(document, position) {
    if (!vscode.workspace.getConfiguration('zquery').get('enable', true)) return;

    const { word, range } = getExtendedWord(document, position);

    // @event directives (including modifiers like @click.prevent)
    const eventMatch = word.match(/^(@[\w]+(?:\.[\w]+)*)/);
    if (eventMatch) {
      // Try exact match first, then base event
      const fullName = eventMatch[1];
      if (directiveMap.has(fullName)) {
        return buildHover(directiveMap.get(fullName));
      }
      const baseName = fullName.split('.')[0];
      if (directiveMap.has(baseName)) {
        const entry = directiveMap.get(baseName);
        const modifiers = fullName.split('.').slice(1);
        const modDoc = modifiers.map(m => {
          if (m === 'prevent') return '`.prevent` — calls `e.preventDefault()`';
          if (m === 'stop') return '`.stop` — calls `e.stopPropagation()`';
          if (m === 'once') return '`.once` — handler fires once then auto-removes';
          if (m === 'self') return '`.self` — only fires if target is the element itself';
          if (m === 'capture') return '`.capture` — listens during capture phase';
          if (m === 'passive') return '`.passive` — registered with `{ passive: true }`';
          if (m === 'debounce') return '`.debounce` — debounce handler (next value is ms)';
          if (m === 'throttle') return '`.throttle` — throttle handler (next value is ms)';
          if (/^\d+$/.test(m)) return `\`${m}ms\` delay`;
          return `\`.${m}\``;
        }).join('\n');
        const augmented = {
          ...entry,
          documentation: entry.documentation + '\n\n**Modifiers applied:**\n' + modDoc,
        };
        return buildHover(augmented);
      }
    }

    // z-* directives (including z-on:event with modifiers)
    const zMatch = word.match(/^(z-[\w]+)/);
    if (zMatch) {
      // z-on:event → treat like @event for hover
      if (zMatch[1] === 'z-on' && directiveMap.has('z-on')) {
        return buildHover(directiveMap.get('z-on'));
      }
      if (directiveMap.has(zMatch[1])) {
        return buildHover(directiveMap.get(zMatch[1]));
      }
    }

    return undefined;
  },
};


// -- Registration -----------------------------------------------------------

function registerHoverProviders(context) {
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(JS_SELECTOR, jsHoverProvider),
    vscode.languages.registerHoverProvider(HTML_SELECTOR, htmlHoverProvider),
  );
}

module.exports = {
  registerHoverProviders,
  // Exported for testing
  _test: { getExtendedWord, buildHover },
};
