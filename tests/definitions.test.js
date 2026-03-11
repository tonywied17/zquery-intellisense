// ---------------------------------------------------------------------------
// Tests for definitions.js  — Go-to-Definition helpers
// ---------------------------------------------------------------------------

const { _test } = require('../src/definitions');

const {
  isInsideInterpolation,
  isInsideDirectiveValue,
  extractDotPath,
  findMatchingBrace,
  escapeRegex,
} = _test;


// ---------------------------------------------------------------------------
// escapeRegex
// ---------------------------------------------------------------------------
describe('escapeRegex', () => {
  it('escapes special regex characters', () => {
    expect(escapeRegex('hello.world')).toBe('hello\\.world');
    expect(escapeRegex('a+b*c?')).toBe('a\\+b\\*c\\?');
    expect(escapeRegex('$price')).toBe('\\$price');
    expect(escapeRegex('(group)')).toBe('\\(group\\)');
    expect(escapeRegex('[class]')).toBe('\\[class\\]');
  });

  it('leaves plain strings unchanged', () => {
    expect(escapeRegex('hello')).toBe('hello');
    expect(escapeRegex('counter-page')).toBe('counter-page');
  });
});


// ---------------------------------------------------------------------------
// isInsideInterpolation
// ---------------------------------------------------------------------------
describe('isInsideInterpolation', () => {
  it('returns true when cursor is inside {{…}}', () => {
    const line = '<p>{{count}}</p>';
    //            0123456789...
    // {{ at 3-4, count starts at 5, }} at 10-11
    expect(isInsideInterpolation(line, 5)).toBe(true);  // 'c' in count
    expect(isInsideInterpolation(line, 7)).toBe(true);  // 'u' in count
    expect(isInsideInterpolation(line, 9)).toBe(true);  // 't' in count
  });

  it('returns false when cursor is outside {{…}}', () => {
    const line = '<p>{{count}}</p>';
    expect(isInsideInterpolation(line, 0)).toBe(false);  // '<'
    expect(isInsideInterpolation(line, 2)).toBe(false);  // '>'
    expect(isInsideInterpolation(line, 12)).toBe(false); // after '}}'
  });

  it('returns false on the {{ and }} delimiters themselves', () => {
    const line = '{{count}}';
    expect(isInsideInterpolation(line, 0)).toBe(false);  // first {
    expect(isInsideInterpolation(line, 1)).toBe(false);  // second {
    // After }}: offset 7 is the first }, 8 is second }
  });

  it('handles multiple interpolations on the same line', () => {
    const line = '{{a}} and {{b}}';
    //            01234 5678 901234
    expect(isInsideInterpolation(line, 2)).toBe(true);   // 'a'
    expect(isInsideInterpolation(line, 6)).toBe(false);  // 'a' in "and"
    expect(isInsideInterpolation(line, 12)).toBe(true);  // 'b'
  });

  it('handles dot paths inside interpolation', () => {
    const line = '<span>{{user.name}}</span>';
    expect(isInsideInterpolation(line, 8)).toBe(true);   // 'u' in user
    expect(isInsideInterpolation(line, 13)).toBe(true);  // 'n' in name
  });

  it('handles expression with operators', () => {
    const line = "{{count > 0 ? 'yes' : 'no'}}";
    expect(isInsideInterpolation(line, 3)).toBe(true);   // 'o' in count
    expect(isInsideInterpolation(line, 10)).toBe(true);  // '0'
  });

  it('returns false for unclosed interpolation', () => {
    const line = '{{count';
    expect(isInsideInterpolation(line, 3)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isInsideInterpolation('', 0)).toBe(false);
  });
});


// ---------------------------------------------------------------------------
// isInsideDirectiveValue
// ---------------------------------------------------------------------------
describe('isInsideDirectiveValue', () => {
  it('detects cursor inside @click value', () => {
    const line = '<button @click="increment">';
    const valStart = line.indexOf('increment');
    expect(isInsideDirectiveValue(line, valStart)).toBe(true);
    expect(isInsideDirectiveValue(line, valStart + 4)).toBe(true);
  });

  it('detects cursor inside @click.prevent value', () => {
    const line = '<form @submit.prevent="handleSubmit">';
    const valStart = line.indexOf('handleSubmit');
    expect(isInsideDirectiveValue(line, valStart)).toBe(true);
  });

  it('detects cursor inside :href value', () => {
    const line = '<a :href="someUrl">';
    const valStart = line.indexOf('someUrl');
    expect(isInsideDirectiveValue(line, valStart)).toBe(true);
    expect(isInsideDirectiveValue(line, valStart + 3)).toBe(true);
  });

  it('detects cursor inside z-if value', () => {
    const line = '<div z-if="isLoggedIn">';
    const valStart = line.indexOf('isLoggedIn');
    expect(isInsideDirectiveValue(line, valStart)).toBe(true);
  });

  it('detects cursor inside z-model value', () => {
    const line = '<input z-model="search">';
    const valStart = line.indexOf('search');
    expect(isInsideDirectiveValue(line, valStart)).toBe(true);
  });

  it('detects cursor inside z-for value', () => {
    const line = '<li z-for="item in items">';
    const valStart = line.indexOf('item');
    expect(isInsideDirectiveValue(line, valStart)).toBe(true);
  });

  it('detects cursor inside z-class value', () => {
    const line = `<div z-class="{'active': isActive}">`;
    const valStart = line.indexOf('active');
    expect(isInsideDirectiveValue(line, valStart)).toBe(true);
  });

  it('returns false outside directive value', () => {
    const line = '<button @click="increment">Click</button>';
    // "Click" text is outside
    const clickPos = line.indexOf('Click');
    expect(isInsideDirectiveValue(line, clickPos)).toBe(false);
  });

  it('returns false on regular HTML attributes', () => {
    const line = '<div class="myclass">';
    const valStart = line.indexOf('myclass');
    expect(isInsideDirectiveValue(line, valStart)).toBe(false);
  });

  it('returns false for cursor before the value', () => {
    const line = '<button @click="increment">';
    expect(isInsideDirectiveValue(line, 0)).toBe(false);
    expect(isInsideDirectiveValue(line, 8)).toBe(false); // on '@'
  });

  it('handles single-quoted values', () => {
    const line = "<button @click='doSomething'>";
    const valStart = line.indexOf('doSomething');
    expect(isInsideDirectiveValue(line, valStart)).toBe(true);
  });

  it('handles function call expressions', () => {
    const line = '<button @click="someFunc($event, 42)">';
    const funcStart = line.indexOf('someFunc');
    expect(isInsideDirectiveValue(line, funcStart)).toBe(true);
    expect(isInsideDirectiveValue(line, funcStart + 4)).toBe(true);
  });

  it('handles multiple directives on one line', () => {
    const line = '<div z-if="show" z-class="{active: isOn}">';
    const showPos = line.indexOf('show');
    const isOnPos = line.indexOf('isOn');
    expect(isInsideDirectiveValue(line, showPos)).toBe(true);
    expect(isInsideDirectiveValue(line, isOnPos)).toBe(true);
  });
});


// ---------------------------------------------------------------------------
// extractDotPath
// ---------------------------------------------------------------------------
describe('extractDotPath', () => {
  it('extracts simple dot path and identifies segment index', () => {
    const line = '{{user.name}}';
    // user starts at 2, name starts at 7
    const resultUser = extractDotPath(line, 3); // cursor on 'e' in user
    expect(resultUser.dotPath).toEqual(['user', 'name']);
    expect(resultUser.segmentIndex).toBe(0);

    const resultName = extractDotPath(line, 8); // cursor on 'a' in name
    expect(resultName.dotPath).toEqual(['user', 'name']);
    expect(resultName.segmentIndex).toBe(1);
  });

  it('extracts three-level dot path', () => {
    const line = '{{user.profile.email}}';
    // user=2, profile=7, email=15
    const r0 = extractDotPath(line, 3);
    expect(r0.dotPath).toEqual(['user', 'profile', 'email']);
    expect(r0.segmentIndex).toBe(0);

    const r1 = extractDotPath(line, 9);
    expect(r1.dotPath).toEqual(['user', 'profile', 'email']);
    expect(r1.segmentIndex).toBe(1);

    const r2 = extractDotPath(line, 16);
    expect(r2.dotPath).toEqual(['user', 'profile', 'email']);
    expect(r2.segmentIndex).toBe(2);
  });

  it('returns null dotPath for single identifiers (no dots)', () => {
    const line = '{{count}}';
    const result = extractDotPath(line, 3);
    expect(result.dotPath).toBeNull();
  });

  it('handles dot path in directive values', () => {
    const line = ':href="item.url"';
    // item starts at 7, url starts at 12
    const r = extractDotPath(line, 12);
    expect(r.dotPath).toEqual(['item', 'url']);
    expect(r.segmentIndex).toBe(1);
  });

  it('handles dot path at start of line', () => {
    const line = 'user.profile';
    const r = extractDotPath(line, 0);
    expect(r.dotPath).toEqual(['user', 'profile']);
    expect(r.segmentIndex).toBe(0);
  });

  it('returns null for empty input', () => {
    const r = extractDotPath('', 0);
    expect(r.dotPath).toBeNull();
  });
});


// ---------------------------------------------------------------------------
// findMatchingBrace
// ---------------------------------------------------------------------------
describe('findMatchingBrace', () => {
  it('matches simple braces', () => {
    expect(findMatchingBrace('{}', 0)).toBe(1);
    expect(findMatchingBrace('{ a: 1 }', 0)).toBe(7);
  });

  it('matches nested braces', () => {
    const text = '{ a: { b: 1 } }';
    expect(findMatchingBrace(text, 0)).toBe(14);
    expect(findMatchingBrace(text, 5)).toBe(12);
  });

  it('handles strings with braces inside', () => {
    const text = '{ a: "{ not a brace }" }';
    expect(findMatchingBrace(text, 0)).toBe(23);
  });

  it('handles single-quoted strings with braces', () => {
    const text = "{ a: '{ not }' }";
    expect(findMatchingBrace(text, 0)).toBe(15);
  });

  it('handles escaped quotes in strings', () => {
    const text = '{ a: "he said \\"}\\"" }';
    expect(findMatchingBrace(text, 0)).toBe(text.length - 1);
  });

  it('handles template literals with braces', () => {
    const text = '{ a: `${x}` }';
    expect(findMatchingBrace(text, 0)).toBe(12);
  });

  it('returns -1 for unclosed brace', () => {
    expect(findMatchingBrace('{ a: 1', 0)).toBe(-1);
  });

  it('returns -1 when startIdx is not a brace', () => {
    expect(findMatchingBrace('abc', 0)).toBe(-1);
  });

  it('handles deeply nested objects like component state', () => {
    const text = `{
      count: 0,
      user: {
        name: 'Alice',
        profile: {
          email: 'a@b.com'
        }
      },
      items: []
    }`;
    expect(findMatchingBrace(text, 0)).toBe(text.length - 1);
  });
});
