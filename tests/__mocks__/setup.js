// ---------------------------------------------------------------------------
// Pre-register the vscode mock so require('vscode') works in CJS source files
// ---------------------------------------------------------------------------

const Module = require('module');
const path = require('path');

const mockPath = path.resolve(__dirname, 'vscode.js');
const originalResolve = Module._resolveFilename;

Module._resolveFilename = function (request, parent, ...rest) {
  if (request === 'vscode') {
    return mockPath;
  }
  return originalResolve.call(this, request, parent, ...rest);
};
