import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.test.js'],
    setupFiles: ['tests/__mocks__/setup.js'],
  },
  resolve: {
    alias: {
      vscode: path.resolve(__dirname, 'tests/__mocks__/vscode.js'),
    },
  },
});
