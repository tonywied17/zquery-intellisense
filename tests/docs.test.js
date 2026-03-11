// ---------------------------------------------------------------------------
// Tests for docs.js  — Data integrity checks
// ---------------------------------------------------------------------------

const docs = require('../src/docs');


describe('docs data integrity', () => {
  // Verify every entry in each array has the required fields.

  const requiredFields = ['name'];
  const optionalFields = ['kind', 'detail', 'documentation', 'insertText'];

  function checkEntries(entries, label) {
    it(`${label} entries all have a name`, () => {
      for (const entry of entries) {
        expect(entry).toHaveProperty('name');
        expect(typeof entry.name).toBe('string');
        expect(entry.name.length).toBeGreaterThan(0);
      }
    });

    it(`${label} entries have no duplicate names`, () => {
      const names = entries.map((e) => e.name);
      const unique = new Set(names);
      const dupes = names.filter((n, i) => names.indexOf(n) !== i);
      expect(dupes).toEqual([]);
    });
  }

  checkEntries(docs.dollarMethods, 'dollarMethods');
  checkEntries(docs.httpMethods, 'httpMethods');
  checkEntries(docs.storageMethods, 'storageMethods');
  checkEntries(docs.busMethods, 'busMethods');
  checkEntries(docs.collectionMethods, 'collectionMethods');
  checkEntries(docs.componentKeys, 'componentKeys');
  checkEntries(docs.zDirectives, 'zDirectives');
  checkEntries(docs.eventDirectives, 'eventDirectives');

  it('dollarMethods contains core methods', () => {
    const names = docs.dollarMethods.map((e) => e.name);
    expect(names).toContain('$');
    expect(names).toContain('component');
    expect(names).toContain('mount');
    expect(names).toContain('router');
    expect(names).toContain('store');
    expect(names).toContain('reactive');
    expect(names).toContain('signal');
  });

  it('httpMethods contains REST methods', () => {
    const names = docs.httpMethods.map((e) => e.name);
    expect(names).toContain('get');
    expect(names).toContain('post');
    expect(names).toContain('put');
    expect(names).toContain('delete');
  });

  it('busMethods contains core event bus methods', () => {
    const names = docs.busMethods.map((e) => e.name);
    expect(names).toContain('on');
    expect(names).toContain('emit');
    expect(names).toContain('off');
  });

  it('storageMethods contains CRUD methods', () => {
    const names = docs.storageMethods.map((e) => e.name);
    expect(names).toContain('get');
    expect(names).toContain('set');
    expect(names).toContain('remove');
    expect(names).toContain('clear');
  });

  it('zDirectives contains core directives', () => {
    const names = docs.zDirectives.map((e) => e.name);
    expect(names).toContain('z-if');
    expect(names).toContain('z-for');
    expect(names).toContain('z-show');
    expect(names).toContain('z-model');
    expect(names).toContain('z-bind');
    expect(names).toContain('z-link');
    expect(names).toContain('z-ref');
    expect(names).toContain('z-class');
    expect(names).toContain('z-style');
  });

  it('eventDirectives contains common events', () => {
    const names = docs.eventDirectives.map((e) => e.name);
    expect(names).toContain('@click');
    expect(names).toContain('@submit');
    expect(names).toContain('@input');
    expect(names).toContain('@change');
  });

  it('componentKeys contains required keys', () => {
    const names = docs.componentKeys.map((e) => e.name);
    expect(names).toContain('state');
    expect(names).toContain('render');
    expect(names).toContain('styles');
    expect(names).toContain('templateUrl');
    expect(names).toContain('init');
    expect(names).toContain('mounted');
    expect(names).toContain('destroyed');
  });

  it('collectionMethods has significant number of entries', () => {
    expect(docs.collectionMethods.length).toBeGreaterThan(50);
  });
});
