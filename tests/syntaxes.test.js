// ---------------------------------------------------------------------------
// Tests for syntaxes — TextMate grammar validation
// ---------------------------------------------------------------------------

const fs = require('fs');
const path = require('path');

const grammarPath = path.resolve(__dirname, '..', 'syntaxes', 'zquery-html.tmLanguage.json');
const grammar = JSON.parse(fs.readFileSync(grammarPath, 'utf-8'));


// ---------------------------------------------------------------------------
// Structure validation
// ---------------------------------------------------------------------------

describe('grammar — top-level structure', () => {
  it('has a scopeName', () => {
    expect(grammar.scopeName).toBe('zquery.html.interpolation');
  });

  it('has a name', () => {
    expect(typeof grammar.name).toBe('string');
    expect(grammar.name.length).toBeGreaterThan(0);
  });

  it('has an injectionSelector for HTML', () => {
    expect(grammar.injectionSelector).toBeDefined();
    expect(grammar.injectionSelector).toContain('text.html');
  });

  it('has patterns array', () => {
    expect(Array.isArray(grammar.patterns)).toBe(true);
    expect(grammar.patterns.length).toBeGreaterThan(0);
  });

  it('has a repository', () => {
    expect(grammar.repository).toBeDefined();
    expect(typeof grammar.repository).toBe('object');
  });

  it('patterns reference repository rules', () => {
    for (const pattern of grammar.patterns) {
      if (pattern.include) {
        const ref = pattern.include.replace('#', '');
        expect(grammar.repository).toHaveProperty(ref);
      }
    }
  });
});


// ---------------------------------------------------------------------------
// Interpolation rule validation
// ---------------------------------------------------------------------------

describe('grammar — interpolation rule', () => {
  const interp = grammar.repository.interpolation;

  it('exists', () => {
    expect(interp).toBeDefined();
  });

  it('has begin/end patterns for {{ and }}', () => {
    expect(interp.begin).toBeDefined();
    expect(interp.end).toBeDefined();
    // Verify the regex matches {{ and }}
    expect(new RegExp(interp.begin).test('{{')).toBe(true);
    expect(new RegExp(interp.end).test('}}')).toBe(true);
  });

  it('has beginCaptures and endCaptures', () => {
    expect(interp.beginCaptures).toBeDefined();
    expect(interp.beginCaptures['0'].name).toContain('punctuation');
    expect(interp.endCaptures).toBeDefined();
    expect(interp.endCaptures['0'].name).toContain('punctuation');
  });

  it('has a contentName', () => {
    expect(interp.contentName).toBeDefined();
    expect(interp.contentName).toContain('meta.embedded');
  });

  it('has inner patterns', () => {
    expect(Array.isArray(interp.patterns)).toBe(true);
    expect(interp.patterns.length).toBeGreaterThan(0);
  });
});


// ---------------------------------------------------------------------------
// Regex pattern validation — all match patterns must be valid
// ---------------------------------------------------------------------------

describe('grammar — regex validity', () => {
  function collectPatterns(obj, patterns = []) {
    if (!obj || typeof obj !== 'object') return patterns;
    if (obj.match) patterns.push({ regex: obj.match, name: obj.name || '(unnamed)' });
    if (obj.begin) patterns.push({ regex: obj.begin, name: (obj.name || '(unnamed)') + ' [begin]' });
    if (obj.end) patterns.push({ regex: obj.end, name: (obj.name || '(unnamed)') + ' [end]' });
    if (Array.isArray(obj.patterns)) {
      for (const p of obj.patterns) collectPatterns(p, patterns);
    }
    if (obj.repository) {
      for (const val of Object.values(obj.repository)) collectPatterns(val, patterns);
    }
    return patterns;
  }

  const allPatterns = collectPatterns(grammar);

  it('found patterns to validate', () => {
    expect(allPatterns.length).toBeGreaterThan(5);
  });

  it.each(allPatterns)('$name regex is valid', ({ regex }) => {
    expect(() => new RegExp(regex)).not.toThrow();
  });
});


// ---------------------------------------------------------------------------
// Scope naming conventions
// ---------------------------------------------------------------------------

describe('grammar — scope naming conventions', () => {
  function collectScopes(obj, scopes = [], depth = 0) {
    if (!obj || typeof obj !== 'object') return scopes;
    // Skip the top-level grammar 'name' (it's a display name, not a scope)
    if (depth > 0 && obj.name && typeof obj.name === 'string') scopes.push(obj.name);
    if (obj.contentName) scopes.push(obj.contentName);
    // Check captures
    for (const key of ['beginCaptures', 'endCaptures', 'captures']) {
      if (obj[key]) {
        for (const val of Object.values(obj[key])) {
          if (val.name) scopes.push(val.name);
        }
      }
    }
    if (Array.isArray(obj.patterns)) {
      for (const p of obj.patterns) collectScopes(p, scopes, depth + 1);
    }
    if (obj.repository) {
      for (const val of Object.values(obj.repository)) collectScopes(val, scopes, depth + 1);
    }
    return scopes;
  }

  const allScopes = collectScopes(grammar);

  it('found scopes to validate', () => {
    expect(allScopes.length).toBeGreaterThan(5);
  });

  it('all scopes end with .zquery', () => {
    for (const scope of allScopes) {
      expect(scope, `scope "${scope}" should end with .zquery`).toMatch(/\.zquery$/);
    }
  });

  it('all scopes follow TextMate dot notation', () => {
    for (const scope of allScopes) {
      expect(scope, `scope "${scope}" must be dot-separated lowercase`).toMatch(/^[a-z][a-z0-9._-]*$/);
    }
  });

  it('has expected scope categories', () => {
    const categories = new Set(allScopes.map((s) => s.split('.')[0]));
    // Should have at least: meta, punctuation, constant, keyword, string, variable
    expect(categories.has('meta')).toBe(true);
    expect(categories.has('punctuation')).toBe(true);
    expect(categories.has('constant')).toBe(true);
    expect(categories.has('keyword')).toBe(true);
    expect(categories.has('string')).toBe(true);
    expect(categories.has('variable')).toBe(true);
  });
});


// ---------------------------------------------------------------------------
// Tokenization behaviour (regex match testing)
// ---------------------------------------------------------------------------

describe('grammar — tokenization patterns', () => {
  const patterns = grammar.repository.interpolation.patterns;

  function findPattern(nameFragment) {
    return patterns.find((p) => p.name && p.name.includes(nameFragment));
  }

  describe('boolean', () => {
    const p = findPattern('boolean');
    it('matches true and false', () => {
      expect(new RegExp(p.match).test('true')).toBe(true);
      expect(new RegExp(p.match).test('false')).toBe(true);
    });
    it('does not match truely', () => {
      expect(new RegExp(p.match).test('truely')).toBe(false);
    });
  });

  describe('null/undefined', () => {
    const p = findPattern('null');
    it('matches null and undefined', () => {
      expect(new RegExp(p.match).test('null')).toBe(true);
      expect(new RegExp(p.match).test('undefined')).toBe(true);
    });
  });

  describe('numbers', () => {
    const p = findPattern('numeric');
    it('matches integers', () => {
      expect(new RegExp(p.match).test('42')).toBe(true);
      expect(new RegExp(p.match).test('0')).toBe(true);
    });
    it('matches decimals', () => {
      expect(new RegExp(p.match).test('3.14')).toBe(true);
    });
    it('does not match bare dot', () => {
      expect(new RegExp(p.match).test('.')).toBe(false);
    });
  });

  describe('comparison operators', () => {
    const p = findPattern('comparison');
    it('matches ===, ==, !==, !=', () => {
      expect(new RegExp(p.match).test('===')).toBe(true);
      expect(new RegExp(p.match).test('==')).toBe(true);
      expect(new RegExp(p.match).test('!==')).toBe(true);
      expect(new RegExp(p.match).test('!=')).toBe(true);
    });
  });

  describe('logical operators', () => {
    const p = findPattern('logical.zquery');
    // The scope is keyword.operator.logical.zquery
    const logicalP = patterns.find(
      (pat) => pat.name === 'keyword.operator.logical.zquery',
    );
    it('matches && and || and ??', () => {
      expect(new RegExp(logicalP.match).test('&&')).toBe(true);
      expect(new RegExp(logicalP.match).test('||')).toBe(true);
      expect(new RegExp(logicalP.match).test('??')).toBe(true);
    });
  });

  describe('relational operators', () => {
    const p = findPattern('relational');
    it('matches < > <= >=', () => {
      const re = new RegExp(p.match);
      expect(re.test('<')).toBe(true);
      expect(re.test('>')).toBe(true);
      expect(re.test('<=')).toBe(true);
      expect(re.test('>=')).toBe(true);
    });
  });

  describe('ternary operators', () => {
    const p = findPattern('ternary');
    it('matches ? and :', () => {
      const re = new RegExp(p.match);
      expect(re.test('?')).toBe(true);
      expect(re.test(':')).toBe(true);
    });
  });

  describe('arithmetic operators', () => {
    const p = findPattern('arithmetic');
    it('matches + - * / %', () => {
      const re = new RegExp(p.match);
      expect(re.test('+')).toBe(true);
      expect(re.test('-')).toBe(true);
      expect(re.test('*')).toBe(true);
      expect(re.test('/')).toBe(true);
      expect(re.test('%')).toBe(true);
    });
  });

  describe('variable identifiers', () => {
    const p = findPattern('variable');
    it('matches valid identifiers', () => {
      const re = new RegExp(p.match);
      expect(re.test('count')).toBe(true);
      expect(re.test('_private')).toBe(true);
      expect(re.test('$index')).toBe(true);
      expect(re.test('myVar2')).toBe(true);
    });
    it('does not match starting with number', () => {
      expect(new RegExp('^' + p.match + '$').test('2abc')).toBe(false);
    });
  });

  describe('dot accessor', () => {
    const p = findPattern('accessor');
    it('matches a single dot', () => {
      expect(new RegExp(p.match).test('.')).toBe(true);
    });
  });

  describe('strings', () => {
    const single = patterns.find((p) => p.name && p.name.includes('single'));
    const double = patterns.find((p) => p.name && p.name.includes('double'));
    it('has single-quote string rule', () => {
      expect(single).toBeDefined();
      expect(single.begin).toBe("'");
      expect(single.end).toBe("'");
    });
    it('has double-quote string rule', () => {
      expect(double).toBeDefined();
      expect(double.begin).toBe('"');
      expect(double.end).toBe('"');
    });
  });
});
