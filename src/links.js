// ---------------------------------------------------------------------------
// zQuery Document Link Provider
// ---------------------------------------------------------------------------
// Makes templateUrl and styleUrl string values Ctrl+clickable links that
// open the referenced file directly.
// ---------------------------------------------------------------------------

const vscode = require('vscode');
const path = require('path');

const JS_SELECTOR = [
  { language: 'javascript', scheme: 'file' },
  { language: 'javascriptreact', scheme: 'file' },
  { language: 'typescript', scheme: 'file' },
  { language: 'typescriptreact', scheme: 'file' },
];

const linkProvider = {
  provideDocumentLinks(document) {
    if (!vscode.workspace.getConfiguration('zquery').get('enable', true))
      return;

    const links = [];
    const text = document.getText();
    const regex = /(?:templateUrl|styleUrl)\s*:\s*(['"])([^'"]+)\1/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const filePath = match[2];
      const quoteChar = match[1];
      const fullStr = match[0];
      const quoteIdx = fullStr.indexOf(quoteChar);
      const pathStart = match.index + quoteIdx + 1;
      const pathEnd = pathStart + filePath.length;

      const dir = path.dirname(document.uri.fsPath);
      const resolved = path.resolve(dir, filePath);
      const targetUri = vscode.Uri.file(resolved);

      const range = new vscode.Range(
        document.positionAt(pathStart),
        document.positionAt(pathEnd),
      );

      const link = new vscode.DocumentLink(range, targetUri);
      link.tooltip = `Open ${filePath}`;
      links.push(link);
    }

    return links;
  },
};

function registerLinkProviders(context) {
  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(JS_SELECTOR, linkProvider),
  );
}

module.exports = {
  registerLinkProviders,
  // Exported for testing
  _test: { linkProvider },
};
