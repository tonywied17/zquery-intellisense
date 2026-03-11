// ---------------------------------------------------------------------------
// zQuery for VS Code — Extension Entry Point
// ---------------------------------------------------------------------------

const vscode = require('vscode');
const { registerCompletionProviders } = require('./completions');
const { registerHoverProviders } = require('./hovers');
const { registerDefinitionProviders } = require('./definitions');
const { registerLinkProviders } = require('./links');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  registerCompletionProviders(context);
  registerHoverProviders(context);
  registerDefinitionProviders(context);
  registerLinkProviders(context);

  // Log activation (visible in Output > "Extension Host")
  const outputChannel = vscode.window.createOutputChannel('zQuery');
  outputChannel.appendLine('zQuery for VS Code activated');
  context.subscriptions.push(outputChannel);
}

function deactivate() {}

module.exports = { activate, deactivate };
