// ---------------------------------------------------------------------------
// Tests for extension.js  — Activation / Registration
// ---------------------------------------------------------------------------

// globals: true in vitest.config.js provides describe/it/expect

describe('extension', () => {
  it('exports activate and deactivate functions', () => {
    const ext = require('../src/extension');
    expect(typeof ext.activate).toBe('function');
    expect(typeof ext.deactivate).toBe('function');
  });

  it('activate registers providers without throwing', () => {
    const ext = require('../src/extension');
    const context = { subscriptions: [] };
    expect(() => ext.activate(context)).not.toThrow();
    // completion (4) + hover (2) + definition (1) + link (1) + outputChannel = 9
    expect(context.subscriptions.length).toBeGreaterThanOrEqual(8);
  });

  it('deactivate returns without error', () => {
    const ext = require('../src/extension');
    expect(() => ext.deactivate()).not.toThrow();
  });
});
