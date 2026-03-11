// ---------------------------------------------------------------------------
// zQuery Definition Provider (Go-to-Definition / Ctrl+Click)
// ---------------------------------------------------------------------------

const vscode = require('vscode');
const path = require('path');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if the character offset is inside a {{…}} interpolation on the line.
 */
function isInsideInterpolation(lineText, offset) {
  let i = 0;
  while (i < lineText.length - 1) {
    if (lineText[i] === '{' && lineText[i + 1] === '{') {
      const closeIdx = lineText.indexOf('}}', i + 2);
      if (closeIdx !== -1 && offset > i + 1 && offset < closeIdx) {
        return true;
      }
      i = closeIdx !== -1 ? closeIdx + 2 : i + 2;
    } else {
      i++;
    }
  }
  return false;
}

/**
 * Check if the character offset is inside the quoted value of a zQuery
 * directive attribute (z-*, @event, :attr).
 */
function isInsideDirectiveValue(lineText, offset) {
  const regex = /(?:z-[\w-]+|@[\w.]+|:[\w-]+)\s*=\s*(["'])/g;
  let match;
  while ((match = regex.exec(lineText)) !== null) {
    const quoteChar = match[1];
    const valueStart = match.index + match[0].length; // position after opening quote
    const closeIdx = lineText.indexOf(quoteChar, valueStart);
    if (closeIdx < 0) continue;

    if (offset >= valueStart && offset <= closeIdx) {
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Component Discovery
// ---------------------------------------------------------------------------

/**
 * Find the $.component() definition that "owns" the template at `position`.
 *
 * - JS/TS files → scans backwards from cursor for $.component(…, {
 * - HTML files  → searches workspace for a component whose templateUrl
 *                 references this HTML file
 *
 * @returns {{ document: vscode.TextDocument, componentStart: number } | null}
 */
async function findOwningComponent(document, position) {
  if (document.languageId !== 'html') {
    // JS / TS — scan backwards for the enclosing $.component() call
    const text = document.getText();
    const cursorOffset = document.offsetAt(position);
    const beforeText = text.substring(0, cursorOffset);

    const regex = /\$\.component\s*\(\s*['"][^'"]+['"]\s*,\s*\{/g;
    let lastMatch = null;
    let m;
    while ((m = regex.exec(beforeText)) !== null) lastMatch = m;

    if (lastMatch) {
      return { document, componentStart: lastMatch.index };
    }
    return null;
  }

  // HTML file — search workspace for a component that uses this template
  const htmlFileName = path.basename(document.uri.fsPath);
  let files;
  try {
    files = await vscode.workspace.findFiles(
      '**/*.{js,ts,jsx,tsx}',
      '**/node_modules/**',
      200,
    );
  } catch {
    return null;
  }

  for (const uri of files) {
    let doc;
    try {
      doc = await vscode.workspace.openTextDocument(uri);
    } catch {
      continue;
    }
    const text = doc.getText();
    if (!text.includes(htmlFileName)) continue;

    const compRegex = /\$\.component\s*\(\s*['"][^'"]+['"]\s*,\s*\{/g;
    let compMatch;
    while ((compMatch = compRegex.exec(text)) !== null) {
      // Grab a reasonable chunk so we can check for the templateUrl key
      const block = text.substring(
        compMatch.index,
        Math.min(text.length, compMatch.index + 5000),
      );
      const tplRegex = new RegExp(
        `templateUrl\\s*:\\s*['"][^'"]*${escapeRegex(htmlFileName)}['"]`,
      );
      if (tplRegex.test(block)) {
        return { document: doc, componentStart: compMatch.index };
      }
    }
  }
  return null;
}

/**
 * Find a property / method definition inside a component definition block.
 *
 * If `dotPath` is provided (e.g. ['user', 'profile', 'name']), and
 * `segmentIndex` indicates which segment the cursor is on, we try to
 * drill into the state object's initialiser to land on the nested key.
 *
 * Returns a Location pointing at the identifier.
 */
function findPropertyInComponent(owner, word, dotPath, segmentIndex) {
  const { document: doc, componentStart } = owner;
  const text = doc.getText();
  const searchText = text.substring(componentStart);

  // If the cursor is on a non-root segment of a dot path, try to resolve
  // through nested object literals in state().
  if (dotPath && segmentIndex > 0) {
    const nested = findNestedProperty(searchText, componentStart, dotPath, segmentIndex, doc);
    if (nested) return nested;
  }

  // Root-level: match `word:`, `word(`, `word =`, or word inside state()
  // First try top-level component keys / methods
  const regex = new RegExp(`\\b(${escapeRegex(word)})\\s*(?:[:(=])`, 'gm');
  const match = regex.exec(searchText);

  if (match) {
    const wordIdx = match.index + match[0].indexOf(word);
    const offset = componentStart + wordIdx;
    return new vscode.Location(doc.uri, doc.positionAt(offset));
  }

  // Also try to find the word inside the state() return object as a key
  const stateMatch = findPropertyInState(searchText, componentStart, word, doc);
  if (stateMatch) return stateMatch;

  return null;
}

/**
 * Find a property key inside the state() function's returned object literal.
 */
function findPropertyInState(searchText, componentStart, word, doc) {
  // Find `state:` or `state(` or `state =`
  const stateRegex = /\bstate\s*(?::\s*(?:\(\s*\)\s*=>|function)|[\(=])/g;
  const stateMatch = stateRegex.exec(searchText);
  if (!stateMatch) return null;

  // From the state match, find the opening { of the returned object
  const afterState = searchText.substring(stateMatch.index);
  const braceIdx = afterState.indexOf('{');
  if (braceIdx < 0) return null;

  const objStart = stateMatch.index + braceIdx;
  const objEnd = findMatchingBrace(searchText, objStart);
  if (objEnd < 0) return null;

  const objText = searchText.substring(objStart, objEnd + 1);
  const keyRegex = new RegExp(`\\b(${escapeRegex(word)})\\s*:`, 'gm');
  const keyMatch = keyRegex.exec(objText);
  if (keyMatch) {
    const offset = componentStart + objStart + keyMatch.index + keyMatch[0].indexOf(word);
    return new vscode.Location(doc.uri, doc.positionAt(offset));
  }
  return null;
}

/**
 * Drill into nested object literals following a dot path.
 * For `user.profile.name` with segmentIndex=2 (name), we:
 *   1. Find `user:` in state
 *   2. Find `profile:` inside that object
 *   3. Find `name:` inside that object
 */
function findNestedProperty(searchText, componentStart, dotPath, segmentIndex, doc) {
  // Start by finding the state() function's object
  const stateRegex = /\bstate\s*(?::\s*(?:\(\s*\)\s*=>|function)|[\(=])/g;
  const stateMatch = stateRegex.exec(searchText);
  if (!stateMatch) return null;

  const afterState = searchText.substring(stateMatch.index);
  const braceIdx = afterState.indexOf('{');
  if (braceIdx < 0) return null;

  let scopeStart = stateMatch.index + braceIdx;
  let scopeEnd = findMatchingBrace(searchText, scopeStart);
  if (scopeEnd < 0) return null;

  // Walk the dot path up to and including the segment the cursor is on
  for (let i = 0; i <= segmentIndex; i++) {
    const segment = dotPath[i];
    const scopeText = searchText.substring(scopeStart, scopeEnd + 1);
    const keyRegex = new RegExp(`\\b(${escapeRegex(segment)})\\s*:`, 'gm');
    const keyMatch = keyRegex.exec(scopeText);

    if (!keyMatch) return null;

    if (i === segmentIndex) {
      // This is the target — return its location
      const offset = componentStart + scopeStart + keyMatch.index + keyMatch[0].indexOf(segment);
      return new vscode.Location(doc.uri, doc.positionAt(offset));
    }

    // Drill deeper: find the { after this key's colon
    const afterKey = scopeStart + keyMatch.index + keyMatch[0].length;
    const restText = searchText.substring(afterKey);
    const nextBrace = restText.indexOf('{');
    if (nextBrace < 0) return null;

    // Make sure the { is actually the value of this key (not some later key)
    // by checking there's no comma or closing brace before it
    const between = restText.substring(0, nextBrace);
    if (/[,}]/.test(between.replace(/\s/g, ''))) return null;

    scopeStart = afterKey + nextBrace;
    scopeEnd = findMatchingBrace(searchText, scopeStart);
    if (scopeEnd < 0) return null;
  }

  return null;
}

/**
 * Find the matching closing brace for an opening { at `startIdx`.
 */
function findMatchingBrace(text, startIdx) {
  if (text[startIdx] !== '{') return -1;
  let depth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = startIdx; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === stringChar) inString = false;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
      continue;
    }

    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Specific Resolvers
// ---------------------------------------------------------------------------

/**
 * templateUrl / styleUrl string value → open the referenced file.
 */
async function resolveFileReference(document, position, lineText) {
  const match = lineText.match(
    /(?:templateUrl|styleUrl)\s*:\s*(['"])([^'"]+)\1/,
  );
  if (!match) return null;

  const filePath = match[2];
  const quoteChar = match[1];
  const fullStr = match[0];
  const quoteIdx = fullStr.indexOf(quoteChar);
  const pathStartInMatch = quoteIdx + 1;
  const pathStart =
    lineText.indexOf(fullStr) + pathStartInMatch;
  const pathEnd = pathStart + filePath.length;

  if (position.character < pathStart || position.character > pathEnd)
    return null;

  const dir = path.dirname(document.uri.fsPath);
  const resolved = path.resolve(dir, filePath);
  const uri = vscode.Uri.file(resolved);

  try {
    await vscode.workspace.fs.stat(uri);
    return new vscode.Location(uri, new vscode.Position(0, 0));
  } catch {
    return null;
  }
}

/**
 * <component-name> custom-element tag → $.component('component-name', …).
 */
async function resolveComponentTag(document, position, lineText) {
  const tagRegex = /<\/?\s*([a-z][a-z0-9]*-[a-z0-9-]*)/g;
  let match;
  while ((match = tagRegex.exec(lineText)) !== null) {
    const name = match[1];
    const nameStart = match.index + match[0].indexOf(name);
    const nameEnd = nameStart + name.length;

    if (position.character >= nameStart && position.character <= nameEnd) {
      return findComponentDefinition(name);
    }
  }
  return null;
}

/**
 * Search the workspace for $.component('name', …) and return its Location.
 */
async function findComponentDefinition(name) {
  let files;
  try {
    files = await vscode.workspace.findFiles(
      '**/*.{js,ts,jsx,tsx}',
      '**/node_modules/**',
      200,
    );
  } catch {
    return null;
  }

  for (const uri of files) {
    let doc;
    try {
      doc = await vscode.workspace.openTextDocument(uri);
    } catch {
      continue;
    }
    const text = doc.getText();

    const regex = new RegExp(
      `\\$\\.component\\s*\\(\\s*['"]${escapeRegex(name)}['"]`,
    );
    const match = regex.exec(text);
    if (match) {
      return new vscode.Location(uri, doc.positionAt(match.index));
    }
  }
  return null;
}

/**
 * z-link="/path" → route definition (path: '/path' in a router config).
 */
async function resolveZLink(document, position, lineText) {
  const regex = /z-link\s*=\s*(["'])([^"']+)\1/g;
  let match;
  while ((match = regex.exec(lineText)) !== null) {
    const linkPath = match[2];
    const quoteChar = match[1];
    const fullStr = match[0];
    const quoteIdx = fullStr.indexOf(quoteChar);
    const valueStart = match.index + quoteIdx + 1;
    const valueEnd = valueStart + linkPath.length;

    if (position.character < valueStart || position.character > valueEnd)
      continue;

    let files;
    try {
      files = await vscode.workspace.findFiles(
        '**/*.{js,ts,jsx,tsx}',
        '**/node_modules/**',
        200,
      );
    } catch {
      return null;
    }

    for (const uri of files) {
      let doc;
      try {
        doc = await vscode.workspace.openTextDocument(uri);
      } catch {
        continue;
      }
      const text = doc.getText();

      const routeRegex = new RegExp(
        `path\\s*:\\s*['"]${escapeRegex(linkPath)}['"]`,
      );
      const routeMatch = routeRegex.exec(text);
      if (routeMatch) {
        return new vscode.Location(uri, doc.positionAt(routeMatch.index));
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main Provider
// ---------------------------------------------------------------------------

const JS_KEYWORDS = new Set([
  'true', 'false', 'null', 'undefined', 'this', 'new', 'typeof',
  'instanceof', 'in', 'of', 'if', 'else', 'for', 'while', 'do', 'switch',
  'case', 'break', 'continue', 'return', 'throw', 'try', 'catch', 'finally',
  'var', 'let', 'const', 'function', 'class', 'import', 'export', 'default',
  'from', 'Math', 'JSON', 'Date', 'Array', 'Object', 'String', 'Number',
  'Boolean', 'console', 'window', 'document', 'parseInt', 'parseFloat',
  'isNaN',
]);

const definitionProvider = {
  async provideDefinition(document, position, _token) {
    if (!vscode.workspace.getConfiguration('zquery').get('enable', true))
      return;

    const lineText = document.lineAt(position.line).text;

    // 1. templateUrl / styleUrl → open file
    const fileDef = await resolveFileReference(document, position, lineText);
    if (fileDef) return fileDef;

    // 2. Component tag → definition
    const tagDef = await resolveComponentTag(document, position, lineText);
    if (tagDef) return tagDef;

    // 3. z-link → route definition
    const linkDef = await resolveZLink(document, position, lineText);
    if (linkDef) return linkDef;

    // 4. Word inside {{…}} or directive value → component property / method
    //    Handles dot paths like {{user.profile.name}} and expressions like
    //    @click="someFunc" or @click="someFunc($event)" or :href="someVar"
    const wordRange = document.getWordRangeAtPosition(
      position,
      /[a-zA-Z_$][\w$]*/,
    );
    if (!wordRange) return;
    const word = document.getText(wordRange);
    if (JS_KEYWORDS.has(word)) return;

    const inInterpolation = isInsideInterpolation(lineText, position.character);
    const inDirective = isInsideDirectiveValue(lineText, position.character);

    if (inInterpolation || inDirective) {
      const owner = await findOwningComponent(document, position);
      if (!owner) return;

      // Build the full dot path surrounding the cursor and figure out which
      // segment the cursor is on.  e.g. for "user.profile.name":
      //   dotPath = ['user', 'profile', 'name'], segmentIndex = 0|1|2
      const { dotPath, segmentIndex } = extractDotPath(lineText, position.character);

      if (dotPath && dotPath.length > 1) {
        // Check if root segment is a z-for loop variable
        const zForTarget = resolveZForVariable(document, position, dotPath[0]);
        if (zForTarget) {
          if (segmentIndex === 0) {
            // Ctrl+click on the loop variable itself → go to z-for declaration
            return zForTarget;
          }
          // For deeper segments of a z-for var (e.g. clicking `name` in
          // `e.name`), we can't statically resolve into the array item type,
          // so fall through to best-effort search.
        }

        return findPropertyInComponent(owner, word, dotPath, segmentIndex);
      }

      // Single identifier (no dots)
      // Check z-for variable first
      const zForSingle = resolveZForVariable(document, position, word);
      if (zForSingle) return zForSingle;

      return findPropertyInComponent(owner, word);
    }

    return undefined;
  },
};

// ---------------------------------------------------------------------------
// Dot-path and z-for helpers
// ---------------------------------------------------------------------------

/**
 * Given a line and a character offset, extract the full dotted expression
 * surrounding the cursor and determine which segment the cursor is on.
 *
 * Example: for `{{user.profile.name}}` with cursor on "profile":
 *   → { dotPath: ['user', 'profile', 'name'], segmentIndex: 1 }
 */
function extractDotPath(lineText, offset) {
  // Expand left from offset to find the beginning of the dotted expression
  let start = offset;
  while (start > 0 && /[\w$.]/.test(lineText[start - 1])) start--;
  // Expand right from offset
  let end = offset;
  while (end < lineText.length && /[\w$.]/.test(lineText[end])) end++;

  const expr = lineText.substring(start, end);
  // Strip leading/trailing dots
  const trimmed = expr.replace(/^\.+|\.+$/g, '');
  if (!trimmed) return { dotPath: null, segmentIndex: 0 };

  const parts = trimmed.split('.');
  if (parts.length <= 1) return { dotPath: null, segmentIndex: 0 };

  // Figure out which segment the cursor falls in
  let pos = start;
  // Skip any leading dots that were stripped
  if (lineText[start] === '.') pos++;
  let segIdx = 0;
  for (let i = 0; i < parts.length; i++) {
    const segStart = pos;
    const segEnd = pos + parts[i].length;
    if (offset >= segStart && offset < segEnd) {
      segIdx = i;
      break;
    }
    pos = segEnd + 1; // +1 for the dot
    segIdx = i;
  }

  return { dotPath: parts, segmentIndex: segIdx };
}

/**
 * Try to find a z-for declaration that introduces `varName` as a loop
 * variable in the template before `position`. Returns a Location to
 * the z-for attribute if found.
 */
function resolveZForVariable(document, position, varName) {
  // Search backwards from the cursor for z-for="varName in …" or
  // z-for="(varName, …) in …"
  const text = document.getText(new vscode.Range(
    0, 0,
    position.line, position.character,
  ));

  // Patterns:   z-for="item in items"
  //             z-for="(item, i) in items"
  //             z-for="(val, key) in obj"
  const regex = new RegExp(
    `z-for\\s*=\\s*["']` +
    `(?:\\(?\\s*${escapeRegex(varName)}\\s*(?:,\\s*\\w+)?\\s*\\)?` +
    `|\\(?\\s*\\w+\\s*,\\s*${escapeRegex(varName)}\\s*\\)?)` +
    `\\s+in\\s`,
    'g',
  );

  let lastMatch = null;
  let m;
  while ((m = regex.exec(text)) !== null) lastMatch = m;

  if (lastMatch) {
    const varIdx = text.indexOf(varName, lastMatch.index);
    return new vscode.Location(
      document.uri,
      document.positionAt(varIdx),
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

function registerDefinitionProviders(context) {
  const selector = [
    { language: 'javascript', scheme: 'file' },
    { language: 'javascript', scheme: 'untitled' },
    { language: 'javascriptreact', scheme: 'file' },
    { language: 'javascriptreact', scheme: 'untitled' },
    { language: 'typescript', scheme: 'file' },
    { language: 'typescript', scheme: 'untitled' },
    { language: 'typescriptreact', scheme: 'file' },
    { language: 'typescriptreact', scheme: 'untitled' },
    { language: 'html', scheme: 'file' },
    { language: 'html', scheme: 'untitled' },
  ];

  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(selector, definitionProvider),
  );
}

module.exports = {
  registerDefinitionProviders,
  // Exported for testing
  _test: {
    isInsideInterpolation,
    isInsideDirectiveValue,
    extractDotPath,
    findMatchingBrace,
    escapeRegex,
  },
};
