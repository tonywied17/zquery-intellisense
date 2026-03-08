// ---------------------------------------------------------------------------
// zQuery API documentation — shared data for completions & hovers
// ---------------------------------------------------------------------------

/** @type {'Function'|'Method'|'Property'|'Variable'|'Module'|'Field'|'Value'|'Snippet'} */

// -- $ namespace methods ----------------------------------------------------

const dollarMethods = [
  // -- Selectors -----------------------------------------------------------
  {
    name: '$',
    kind: 'Function',
    detail: '(selector, context?) → Element | null',
    documentation:
      'CSS selector — returns the first matching element via `querySelector`.\n' +
      'Also accepts elements, NodeLists, HTML strings, and functions (DOM-ready).\n\n' +
      '```js\n' +
      "const email = $('input[name=\"email\"]');  // first matching input\n" +
      "const nested = $('li', '#todo-list');     // scoped to parent\n" +
      "const el = $('<div class=\"alert\">Hi</div>'); // create from HTML\n" +
      '$(() => console.log(\'DOM ready\'));        // DOM-ready callback\n' +
      '```',
    insertText: "('$1')",
  },
  {
    name: 'all',
    kind: 'Function',
    detail: '(selector, context?) → ZQueryCollection',
    documentation:
      'Collection selector — returns a `ZQueryCollection` of all matching elements.\n' +
      '`queryAll` is the ES module export name for `$.all()`.\n\n' +
      '```js\n' +
      "$.all('.card')           // all .card elements\n" +
      "$.all('<div>Hi</div>')   // create elements as collection\n" +
      "$.all(element)           // wrap single element\n" +
      '```',
    insertText: "all('$1')",
  },
  {
    name: 'id',
    kind: 'Function',
    detail: '(id) → Element | null',
    documentation: '`document.getElementById(id)`\n\n```js\n$.id(\'main\') // <div id="main">…</div>\n```',
    insertText: "id('$1')",
  },
  {
    name: 'class',
    kind: 'Function',
    detail: '(name) → Element | null',
    documentation: "`document.querySelector('.name')`\n\n```js\n$.class('card') // first .card element\n```",
    insertText: "class('$1')",
  },
  {
    name: 'classes',
    kind: 'Function',
    detail: '(name) → Element[]',
    documentation: '`document.getElementsByClassName(name)` as array.\n\n```js\n$.classes(\'card\') // all .card elements as array\n```',
    insertText: "classes('$1')",
  },
  {
    name: 'tag',
    kind: 'Function',
    detail: '(name) → Element[]',
    documentation: '`document.getElementsByTagName(name)` as array.\n\n```js\n$.tag(\'li\') // all <li> elements\n```',
    insertText: "tag('$1')",
  },
  {
    name: 'children',
    kind: 'Function',
    detail: '(parentId) → Element[]',
    documentation: 'Children of `#parentId` as an array.\n\n```js\n$.children(\'nav\') // children of #nav\n```',
    insertText: "children('$1')",
  },
  {
    name: 'create',
    kind: 'Function',
    detail: "(tag, attrs?, ...children) → HTMLElement",
    documentation:
      'Create a DOM element with attributes and children.\n\n' +
      'Special `attrs` keys: `class`, `style` (object), `on*` (handler), `data` (object).\n\n' +
      '```js\n' +
      "const el = $.create('div', {\n" +
      "  class: 'card',\n" +
      "  style: { padding: '1rem' },\n" +
      "  onclick: (e) => console.log('clicked'),\n" +
      "  data: { id: '42' }\n" +
      "}, 'Content');\n" +
      '```',
    insertText: "create('${1:div}', { $2 })",
  },
  {
    name: 'ready',
    kind: 'Function',
    detail: '(fn) → void',
    documentation: 'Register a DOMContentLoaded callback (fires immediately if already loaded).\n\n```js\n$.ready(() => console.log(\'DOM ready\'));\n```',
    insertText: 'ready(() => {\n\t$1\n})',
  },
  {
    name: 'on',
    kind: 'Function',
    detail: '(event, selector, handler) | (event, handler) → void',
    documentation:
      'Global event delegation on `document`, or direct event listener when called with two arguments.\n\n' +
      '**Delegated (3-arg)** — listens on `document`, fires when a matching descendant is the target:\n' +
      "```js\n$.on('click', '.nav-link', function(e) {\n  console.log(this.href);\n});\n```\n\n" +
      '**Direct (2-arg)** — attaches directly to `document` (ideal for `keydown`, `resize`, etc.):\n' +
      "```js\n$.on('keydown', (e) => {\n  if (e.key === 'Escape') closeModal();\n});\n```",
    insertText: "on('${1:click}', '${2:selector}', function(e) {\n\t$3\n})",
  },
  {
    name: 'off',
    kind: 'Function',
    detail: '(event, handler) → void',
    documentation:
      'Remove a direct global event listener previously attached with the 2-arg `$.on(event, handler)`.\n\n' +
      "```js\nfunction onKey(e) { console.log(e.key); }\n$.on('keydown', onKey);\n$.off('keydown', onKey); // removed\n```",
    insertText: "off('${1:event}', ${2:handler})",
  },
  {
    name: 'fn',
    kind: 'Property',
    detail: 'ZQueryCollection.prototype',
    documentation:
      'Alias for `ZQueryCollection.prototype` — extend to add custom methods to all collections.\n\n' +
      '```js\n$.fn.disable = function() {\n  return this.prop(\'disabled\', true).addClass(\'disabled\');\n};\n```',
    insertText: 'fn',
  },

  // -- Reactive ------------------------------------------------------------
  {
    name: 'reactive',
    kind: 'Function',
    detail: '(target, onChange) → Proxy',
    documentation:
      'Wrap an object in a deep Proxy that fires `onChange` on any set/delete.\n\n' +
      '```js\nconst state = $.reactive({ count: 0 }, (key, val, old) => {\n  console.log(`${key}: ${old} → ${val}`);\n});\nstate.count = 1; // logs "count: 0 → 1"\n```',
    insertText: 'reactive({ $1 }, (key, value, old) => {\n\t$2\n})',
  },
  {
    name: 'signal',
    kind: 'Function',
    detail: '(initial) → Signal',
    documentation:
      'Create a reactive Signal primitive.\n\n' +
      '```js\nconst count = $.signal(0);\nconsole.log(count.value); // 0\ncount.value = 5;          // triggers subscribers\n```',
    insertText: 'signal(${1:initialValue})',
  },
  {
    name: 'computed',
    kind: 'Function',
    detail: '(fn) → Signal (read-only)',
    documentation:
      'Create a derived Signal that recomputes when its dependencies change.\n\n' +
      '```js\nconst count = $.signal(5);\nconst doubled = $.computed(() => count.value * 2);\nconsole.log(doubled.value); // 10\n```',
    insertText: 'computed(() => $1)',
  },
  {
    name: 'effect',
    kind: 'Function',
    detail: '(fn) → dispose()',
    documentation:
      'Run a side-effect that auto-subscribes to signals read during execution. Returns a dispose function.\n\n' +
      '```js\nconst x = $.signal(1);\nconst dispose = $.effect(() => {\n  console.log(x.value);\n});\ndispose(); // stop tracking\n```',
    insertText: 'effect(() => {\n\t$1\n})',
  },

  // -- Components ----------------------------------------------------------
  {
    name: 'component',
    kind: 'Function',
    detail: "(name, definition) → void",
    documentation:
      'Register a new component. Name **must contain a hyphen**.\n\n' +
      "```js\n$.component('app-counter', {\n  state: () => ({ count: 0 }),\n  render() {\n    return `<p>${this.state.count}</p>`;\n  },\n});\n```",
    insertText: "component('${1:my-component}', {\n\tstate: () => ({ $2 }),\n\n\trender() {\n\t\treturn `$3`;\n\t},\n})",
  },
  {
    name: 'mount',
    kind: 'Function',
    detail: '(target, name, props?) → ComponentInstance',
    documentation:
      'Mount a registered component into a target element.\n\n' +
      "```js\nconst inst = $.mount('#app', 'home-page', { title: 'Welcome' });\n```",
    insertText: "mount('${1:#app}', '${2:component-name}')",
  },
  {
    name: 'mountAll',
    kind: 'Function',
    detail: '(root?) → void',
    documentation:
      'Scan `root` (default: `document.body`) for any elements whose tag matches a registered component and auto-mount them.\n\n' +
      '```js\n$.mountAll();\n```',
    insertText: 'mountAll()',
  },
  {
    name: 'getInstance',
    kind: 'Function',
    detail: '(target) → ComponentInstance | null',
    documentation: 'Get the component instance for a given element.\n\n```js\nconst inst = $.getInstance(\'#app\');\n```',
    insertText: "getInstance('${1:#target}')",
  },
  {
    name: 'destroy',
    kind: 'Function',
    detail: '(target) → void',
    documentation: 'Destroy the component at the given target.',
    insertText: "destroy('${1:#target}')",
  },
  {
    name: 'components',
    kind: 'Function',
    detail: '() → Record<string, ComponentDefinition>',
    documentation: 'Returns an object of all registered component definitions (for debugging).\n\n```js\nconsole.log($.components());\n```',
    insertText: 'components()',
  },
  {
    name: 'style',
    kind: 'Function',
    detail: '(urls, opts?) → { remove(), ready }',
    documentation:
      'Dynamically load global (unscoped) stylesheet file(s) into `<head>`.\n' +
      'Relative paths resolve relative to the calling file.\n\n' +
      "```js\nconst dark = $.style('themes/dark.css');\nawait dark.ready;\n// later...\ndark.remove();\n```",
    insertText: "style('${1:path/to/style.css}')",
  },

  // -- Router --------------------------------------------------------------
  {
    name: 'router',
    kind: 'Function',
    detail: '(config) → RouterInstance',
    documentation:
      'Create and activate a client-side SPA router.\n\n' +
      "```js\n$.router({\n  el: '#app',\n  routes: [\n    { path: '/', component: 'home-page' },\n    { path: '/user/:id', component: 'user-page' },\n  ],\n  fallback: 'not-found',\n});\n```",
    insertText: "router({\n\tel: '${1:#app}',\n\troutes: [\n\t\t{ path: '${2:/}', component: '${3:home-page}' },\n\t],\n\tfallback: '${4:not-found}',\n})",
  },
  {
    name: 'getRouter',
    kind: 'Function',
    detail: '() → RouterInstance | null',
    documentation: 'Get the currently active router instance.\n\n```js\nconst router = $.getRouter();\nrouter.navigate(\'/settings\');\n```',
    insertText: 'getRouter()',
  },

  // -- Store ---------------------------------------------------------------
  {
    name: 'store',
    kind: 'Function',
    detail: '(config) | (name, config) → StoreInstance',
    documentation:
      'Create a new global reactive store.\n\n' +
      "```js\n$.store({\n  state: { items: [], filter: 'all' },\n  actions: {\n    addItem(state, item) { state.items = [...state.items, item]; },\n  },\n  getters: {\n    count: (state) => state.items.length,\n  },\n});\n```",
    insertText: "store({\n\tstate: { $1 },\n\tactions: {\n\t\t$2\n\t},\n\tgetters: {\n\t\t$3\n\t},\n})",
  },
  {
    name: 'getStore',
    kind: 'Function',
    detail: "(name?) → StoreInstance | null",
    documentation: "Retrieve a previously created store by name (default: `'default'`).\n\n```js\nconst store = $.getStore();\nconst users = $.getStore('users');\n```",
    insertText: "getStore(${1})",
  },

  // -- HTTP ----------------------------------------------------------------
  {
    name: 'http',
    kind: 'Module',
    detail: 'HttpClient',
    documentation:
      'HTTP client namespace with `get`, `post`, `put`, `patch`, `delete` methods, plus `configure`, interceptors, and more.\n\n' +
      "```js\n$.http.configure({ baseURL: '/api', timeout: 10000 });\n```",
    insertText: 'http',
  },
  {
    name: 'get',
    kind: 'Function',
    detail: '(url, params?, opts?) → Promise<HttpResponse>',
    documentation:
      'HTTP GET request. `params` appended as query string.\n\n' +
      "```js\nconst { data } = await $.get('/api/users', { role: 'admin' });\n```",
    insertText: "get('${1:/api/endpoint}')$2",
  },
  {
    name: 'post',
    kind: 'Function',
    detail: '(url, data?, opts?) → Promise<HttpResponse>',
    documentation:
      'HTTP POST request. `data` sent as JSON body.\n\n' +
      "```js\nconst { data } = await $.post('/api/users', { name: 'Tony' });\n```",
    insertText: "post('${1:/api/endpoint}', { $2 })",
  },
  {
    name: 'put',
    kind: 'Function',
    detail: '(url, data?, opts?) → Promise<HttpResponse>',
    documentation: 'HTTP PUT request. Data sent as JSON body.',
    insertText: "put('${1:/api/endpoint}', { $2 })",
  },
  {
    name: 'patch',
    kind: 'Function',
    detail: '(url, data?, opts?) → Promise<HttpResponse>',
    documentation: 'HTTP PATCH request. Data sent as JSON body.',
    insertText: "patch('${1:/api/endpoint}', { $2 })",
  },
  {
    name: 'delete',
    kind: 'Function',
    detail: '(url, data?, opts?) → Promise<HttpResponse>',
    documentation: 'HTTP DELETE request.',
    insertText: "delete('${1:/api/endpoint}')",
  },

  // -- Utilities: Functions ------------------------------------------------
  {
    name: 'debounce',
    kind: 'Function',
    detail: '(fn, ms?) → DebouncedFunction',
    documentation:
      'Returns a debounced function (default 250 ms). Has `.cancel()` method.\n\n' +
      '```js\nconst search = $.debounce((q) => fetchResults(q), 300);\nsearch.cancel();\n```',
    insertText: 'debounce(($1) => {\n\t$2\n}, ${3:250})',
  },
  {
    name: 'throttle',
    kind: 'Function',
    detail: '(fn, ms?) → ThrottledFunction',
    documentation:
      'Returns a throttled function that fires at most once per `ms` ms (default 250).\n\n' +
      '```js\nconst scroll = $.throttle(() => update(), 100);\n```',
    insertText: 'throttle(($1) => {\n\t$2\n}, ${3:250})',
  },
  {
    name: 'pipe',
    kind: 'Function',
    detail: '(...fns) → (input) => output',
    documentation:
      'Left-to-right function composition.\n\n' +
      '```js\nconst process = $.pipe(\n  str => str.trim(),\n  str => str.toLowerCase(),\n);\n```',
    insertText: 'pipe(\n\t(val) => $1,\n)',
  },
  {
    name: 'once',
    kind: 'Function',
    detail: '(fn) → CachedFunction',
    documentation:
      'Returns a function that executes only once and caches the result.\n\n' +
      '```js\nconst load = $.once(async () => await fetch(\'/config\'));\n```',
    insertText: 'once(() => {\n\t$1\n})',
  },
  {
    name: 'sleep',
    kind: 'Function',
    detail: '(ms) → Promise<void>',
    documentation: 'Returns a Promise that resolves after `ms` milliseconds.\n\n```js\nawait $.sleep(1000);\n```',
    insertText: 'sleep(${1:1000})',
  },

  // -- Utilities: Strings --------------------------------------------------
  {
    name: 'escapeHtml',
    kind: 'Function',
    detail: '(str) → string',
    documentation: 'Escape HTML entities: `&`, `<`, `>`, `"`, `\'`.\n\n```js\n$.escapeHtml(\'<script>alert("xss")</script>\');\n```',
    insertText: 'escapeHtml(${1})',
  },
  {
    name: 'html',
    kind: 'Function',
    detail: 'tagged template → string',
    documentation:
      'Tagged template literal that auto-escapes interpolated values. Use `$.trust()` to mark values as safe.\n\n' +
      '```js\nconst name = \'<b>Tony</b>\';\nconst safe = $.html`<div>Hello, ${name}!</div>`;\n// \'<div>Hello, &lt;b&gt;Tony&lt;/b&gt;!</div>\'\n```',
    insertText: 'html`$1`',
  },
  {
    name: 'trust',
    kind: 'Function',
    detail: '(htmlStr) → TrustedHTML',
    documentation:
      'Mark an HTML string as trusted — it won\'t be escaped inside `$.html`.\n\n' +
      '```js\nconst bold = $.trust(\'<strong>Bold</strong>\');\nconst out = $.html`<p>${bold}</p>`;\n```',
    insertText: 'trust(${1})',
  },
  {
    name: 'uuid',
    kind: 'Function',
    detail: '() → string',
    documentation: 'Generate a UUID v4 string.\n\n```js\n$.uuid() // \'f47ac10b-58cc-4372-a567-0e02b2c3d479\'\n```',
    insertText: 'uuid()',
  },
  {
    name: 'camelCase',
    kind: 'Function',
    detail: '(str) → string',
    documentation: "Convert kebab-case to camelCase.\n\n```js\n$.camelCase('my-component') // 'myComponent'\n```",
    insertText: "camelCase('$1')",
  },
  {
    name: 'kebabCase',
    kind: 'Function',
    detail: '(str) → string',
    documentation: "Convert camelCase to kebab-case.\n\n```js\n$.kebabCase('myComponent') // 'my-component'\n```",
    insertText: "kebabCase('$1')",
  },

  // -- Utilities: Objects --------------------------------------------------
  {
    name: 'deepClone',
    kind: 'Function',
    detail: '(obj) → T',
    documentation: 'Deep clone using `structuredClone` (JSON fallback).\n\n```js\nconst clone = $.deepClone({ nested: { a: 1 } });\n```',
    insertText: 'deepClone(${1})',
  },
  {
    name: 'deepMerge',
    kind: 'Function',
    detail: '(target, ...sources) → merged',
    documentation: 'Recursively merge objects. Arrays are replaced, not merged.\n\n```js\nconst config = $.deepMerge({}, defaults, userConfig);\n```',
    insertText: 'deepMerge({}, ${1})',
  },
  {
    name: 'isEqual',
    kind: 'Function',
    detail: '(a, b) → boolean',
    documentation: 'Deep equality comparison.\n\n```js\n$.isEqual({ a: 1 }, { a: 1 }) // true\n```',
    insertText: 'isEqual(${1}, ${2})',
  },

  // -- Utilities: URL ------------------------------------------------------
  {
    name: 'param',
    kind: 'Function',
    detail: '(obj) → string',
    documentation: "Serialize an object to a URL query string.\n\n```js\n$.param({ page: 1, sort: 'name' }) // 'page=1&sort=name'\n```",
    insertText: 'param({ $1 })',
  },
  {
    name: 'parseQuery',
    kind: 'Function',
    detail: '(str) → Record<string, string>',
    documentation: "Parse a URL query string into an object.\n\n```js\n$.parseQuery('page=1&sort=name') // { page: '1', sort: 'name' }\n```",
    insertText: "parseQuery('$1')",
  },

  // -- Utilities: Storage --------------------------------------------------
  {
    name: 'storage',
    kind: 'Module',
    detail: 'StorageWrapper (localStorage)',
    documentation:
      'JSON-aware `localStorage` wrapper.\n\n' +
      "```js\n$.storage.set('prefs', { theme: 'dark' });\n$.storage.get('prefs');         // { theme: 'dark' }\n$.storage.get('missing', null); // null\n$.storage.remove('prefs');\n$.storage.clear();\n```",
    insertText: 'storage',
  },
  {
    name: 'session',
    kind: 'Module',
    detail: 'StorageWrapper (sessionStorage)',
    documentation:
      'JSON-aware `sessionStorage` wrapper. Same API as `$.storage`.\n\n' +
      "```js\n$.session.set('token', 'abc');\n$.session.get('token');\n```",
    insertText: 'session',
  },

  // -- Utilities: Event Bus ------------------------------------------------
  {
    name: 'bus',
    kind: 'Module',
    detail: 'EventBus',
    documentation:
      'Singleton event bus for cross-component communication.\n\n' +
      "```js\n$.bus.on('cart:updated', (data) => console.log(data));\n$.bus.emit('cart:updated', { count: 3 });\n```",
    insertText: 'bus',
  },

  // -- Meta ----------------------------------------------------------------
  {
    name: 'version',
    kind: 'Property',
    detail: 'string',
    documentation: "Library version string (e.g. `'0.5.1'`).",
    insertText: 'version',
  },
  {
    name: 'meta',
    kind: 'Property',
    detail: 'Record<string, any>',
    documentation: 'Metadata populated at build time by the CLI bundler.',
    insertText: 'meta',
  },
  {
    name: 'noConflict',
    kind: 'Function',
    detail: '() → $',
    documentation: 'Remove `$` from `window` and return the library object.\n\n```js\nconst zq = $.noConflict();\n```',
    insertText: 'noConflict()',
  },

  // -- DOM Morphing --------------------------------------------------------
  {
    name: 'morph',
    kind: 'Function',
    detail: '(rootEl, newHTML) → void',
    documentation:
      'Patch a live DOM tree to match new HTML using real-DOM diffing.\n' +
      'Preserves focus, scroll position, and form state. Used automatically by the component system on re-renders.\n\n' +
      '```js\nconst el = $.id(\'content\');\n$.morph(el, \'<div id="content"><p>Updated</p></div>\');\n```',
    insertText: "morph(${1:element}, '${2:newHTML}')",
  },

  // -- Expression Evaluator ------------------------------------------------
  {
    name: 'safeEval',
    kind: 'Function',
    detail: '(expr, scope) → any',
    documentation:
      'CSP-safe expression evaluator — parses and evaluates JS expressions without `eval()` or `new Function()`.\n' +
      'Supports property access, arithmetic, comparisons, logical ops, ternary, optional chaining, nullish coalescing, template literals, arrow functions, and more.\n' +
      'Used internally by all template directives.\n\n' +
      '```js\nconst result = $.safeEval(\'count > 0 ? "yes" : "no"\', [state]);\n```',
    insertText: "safeEval('${1:expression}', [${2:scope}])",
  },
];


// -- $.http sub-namespace ---------------------------------------------------

const httpMethods = [
  {
    name: 'get',
    kind: 'Function',
    detail: '(url, params?, opts?) → Promise<HttpResponse>',
    documentation: 'HTTP GET request. `params` appended as query string.\n\n```js\nconst { data } = await $.http.get(\'/api/users\', { page: 1 });\n```',
    insertText: "get('${1:/api/endpoint}')$2",
  },
  {
    name: 'post',
    kind: 'Function',
    detail: '(url, data?, opts?) → Promise<HttpResponse>',
    documentation: 'HTTP POST request. `data` sent as JSON body.\n\n```js\nawait $.http.post(\'/api/users\', { name: \'Tony\' });\n```',
    insertText: "post('${1:/api/endpoint}', { $2 })",
  },
  {
    name: 'put',
    kind: 'Function',
    detail: '(url, data?, opts?) → Promise<HttpResponse>',
    documentation: 'HTTP PUT request.',
    insertText: "put('${1:/api/endpoint}', { $2 })",
  },
  {
    name: 'patch',
    kind: 'Function',
    detail: '(url, data?, opts?) → Promise<HttpResponse>',
    documentation: 'HTTP PATCH request.',
    insertText: "patch('${1:/api/endpoint}', { $2 })",
  },
  {
    name: 'delete',
    kind: 'Function',
    detail: '(url, data?, opts?) → Promise<HttpResponse>',
    documentation: 'HTTP DELETE request.',
    insertText: "delete('${1:/api/endpoint}')",
  },
  {
    name: 'configure',
    kind: 'Function',
    detail: '(options) → void',
    documentation:
      'Update default configuration for all subsequent requests.\n\n' +
      "```js\n$.http.configure({\n  baseURL: 'https://api.example.com',\n  headers: { Authorization: 'Bearer abc' },\n  timeout: 10000,\n});\n```",
    insertText: "configure({\n\tbaseURL: '${1}',\n\theaders: { $2 },\n\ttimeout: ${3:30000},\n})",
  },
  {
    name: 'onRequest',
    kind: 'Function',
    detail: '(fn) → void',
    documentation:
      'Add a request interceptor. Called before every request.\n\n' +
      "```js\n$.http.onRequest(async (opts, url) => {\n  opts.headers['Authorization'] = 'Bearer ' + getToken();\n});\n```",
    insertText: 'onRequest(async (fetchOpts, url) => {\n\t$1\n})',
  },
  {
    name: 'onResponse',
    kind: 'Function',
    detail: '(fn) → void',
    documentation:
      'Add a response interceptor. Called after every response.\n\n' +
      '```js\n$.http.onResponse(async (result) => {\n  if (result.status === 401) await refreshToken();\n});\n```',
    insertText: 'onResponse(async (result) => {\n\t$1\n})',
  },
  {
    name: 'createAbort',
    kind: 'Function',
    detail: '() → AbortController',
    documentation:
      'Create a new `AbortController` for request cancellation.\n\n' +
      "```js\nconst ctrl = $.http.createAbort();\n$.get('/api/slow', null, { signal: ctrl.signal });\nctrl.abort();\n```",
    insertText: 'createAbort()',
  },
  {
    name: 'raw',
    kind: 'Function',
    detail: '(url, opts?) → Promise<Response>',
    documentation: 'Direct passthrough to native `fetch()` — no JSON handling, no interceptors, no timeout.',
    insertText: "raw('${1}')",
  },
];


// -- $.storage / $.session sub-namespace ------------------------------------

const storageMethods = [
  {
    name: 'get',
    kind: 'Function',
    detail: '(key, fallback?) → T',
    documentation: 'Get and JSON-parse a value. Returns `fallback` on missing or error.\n\n```js\n$.storage.get(\'prefs\', {});\n```',
    insertText: "get('${1:key}')",
  },
  {
    name: 'set',
    kind: 'Function',
    detail: '(key, value) → void',
    documentation: 'JSON-stringify and store.\n\n```js\n$.storage.set(\'prefs\', { theme: \'dark\' });\n```',
    insertText: "set('${1:key}', ${2:value})",
  },
  {
    name: 'remove',
    kind: 'Function',
    detail: '(key) → void',
    documentation: 'Remove a key from storage.',
    insertText: "remove('${1:key}')",
  },
  {
    name: 'clear',
    kind: 'Function',
    detail: '() → void',
    documentation: 'Clear all entries in storage.',
    insertText: 'clear()',
  },
];


// -- $.bus sub-namespace ----------------------------------------------------

const busMethods = [
  {
    name: 'on',
    kind: 'Function',
    detail: '(event, fn) → unsubscribe()',
    documentation: "Subscribe to an event. Returns an unsubscribe function.\n\n```js\nconst off = $.bus.on('user:login', (data) => console.log(data));\noff(); // unsubscribe\n```",
    insertText: "on('${1:event}', ($2) => {\n\t$3\n})",
  },
  {
    name: 'off',
    kind: 'Function',
    detail: '(event, fn) → void',
    documentation: 'Unsubscribe a specific handler.',
    insertText: "off('${1:event}', ${2:handler})",
  },
  {
    name: 'emit',
    kind: 'Function',
    detail: '(event, ...args) → void',
    documentation: "Emit an event with arguments.\n\n```js\n$.bus.emit('cart:updated', { count: 3 });\n```",
    insertText: "emit('${1:event}', $2)",
  },
  {
    name: 'once',
    kind: 'Function',
    detail: '(event, fn) → unsubscribe()',
    documentation: 'Subscribe for a single invocation. Returns an unsubscribe function.',
    insertText: "once('${1:event}', ($2) => {\n\t$3\n})",
  },
  {
    name: 'clear',
    kind: 'Function',
    detail: '() → void',
    documentation: 'Remove all listeners from the bus.',
    insertText: 'clear()',
  },
];


// -- ZQueryCollection methods -----------------------------------------------

const collectionMethods = [
  // Iteration
  { name: 'each', kind: 'Method', detail: '(fn(index, element)) → this', documentation: 'Iterate elements. `this` inside callback is the element.', insertText: 'each((i, el) => {\n\t$1\n})' },
  { name: 'map', kind: 'Method', detail: '(fn(index, element)) → Array', documentation: 'Map over elements, returns plain array.', insertText: 'map((i, el) => $1)' },
  { name: 'first', kind: 'Method', detail: '() → Element | null', documentation: 'First raw element.', insertText: 'first()' },
  { name: 'last', kind: 'Method', detail: '() → Element | null', documentation: 'Last raw element.', insertText: 'last()' },
  { name: 'eq', kind: 'Method', detail: '(index) → ZQueryCollection', documentation: 'New collection with element at index.', insertText: 'eq(${1:0})' },
  { name: 'toArray', kind: 'Method', detail: '() → Element[]', documentation: 'Convert to plain array.', insertText: 'toArray()' },
  // Traversal
  { name: 'find', kind: 'Method', detail: '(selector) → ZQueryCollection', documentation: 'Descendants matching selector.', insertText: "find('$1')" },
  { name: 'parent', kind: 'Method', detail: '() → ZQueryCollection', documentation: 'Unique parent elements.', insertText: 'parent()' },
  { name: 'closest', kind: 'Method', detail: '(selector) → ZQueryCollection', documentation: 'Nearest ancestor matching selector.', insertText: "closest('$1')" },
  { name: 'children', kind: 'Method', detail: '(selector?) → ZQueryCollection', documentation: 'Direct children, optionally filtered.', insertText: 'children($1)' },
  { name: 'siblings', kind: 'Method', detail: '() → ZQueryCollection', documentation: 'All sibling elements.', insertText: 'siblings()' },
  { name: 'next', kind: 'Method', detail: '() → ZQueryCollection', documentation: 'Next sibling of each element.', insertText: 'next()' },
  { name: 'prev', kind: 'Method', detail: '() → ZQueryCollection', documentation: 'Previous sibling of each element.', insertText: 'prev()' },
  // Filtering
  { name: 'filter', kind: 'Method', detail: '(selector | fn) → ZQueryCollection', documentation: 'Keep matching elements.', insertText: "filter('$1')" },
  { name: 'not', kind: 'Method', detail: '(selector | fn) → ZQueryCollection', documentation: 'Remove matching elements.', insertText: "not('$1')" },
  { name: 'has', kind: 'Method', detail: '(selector) → ZQueryCollection', documentation: 'Keep elements that have a matching descendant.', insertText: "has('$1')" },
  // Classes
  { name: 'addClass', kind: 'Method', detail: '(...names) → this', documentation: 'Add one or more classes (space-separated strings accepted).', insertText: "addClass('$1')" },
  { name: 'removeClass', kind: 'Method', detail: '(...names) → this', documentation: 'Remove one or more classes.', insertText: "removeClass('$1')" },
  { name: 'toggleClass', kind: 'Method', detail: '(name, force?) → this', documentation: 'Toggle a class. Optional `force` boolean.', insertText: "toggleClass('$1')" },
  { name: 'hasClass', kind: 'Method', detail: '(name) → boolean', documentation: 'Check if first element has the given class.', insertText: "hasClass('$1')" },
  // Attributes
  { name: 'attr', kind: 'Method', detail: '(name) | (name, value) → string | this', documentation: 'Get or set attribute.', insertText: "attr('$1')" },
  { name: 'removeAttr', kind: 'Method', detail: '(name) → this', documentation: 'Remove attribute from all elements.', insertText: "removeAttr('$1')" },
  { name: 'prop', kind: 'Method', detail: '(name) | (name, value) → any | this', documentation: 'Get or set JS property.', insertText: "prop('$1')" },
  { name: 'data', kind: 'Method', detail: '(key?) | (key, value) → any | this', documentation: 'Get/set data attribute. JSON auto-parsed.', insertText: "data('$1')" },
  // CSS
  { name: 'css', kind: 'Method', detail: '(prop) | ({ styles }) → string | this', documentation: 'Get computed style or set inline styles.', insertText: 'css({ $1 })' },
  { name: 'width', kind: 'Method', detail: '() → number', documentation: 'First element\'s width (from `getBoundingClientRect`).', insertText: 'width()' },
  { name: 'height', kind: 'Method', detail: '() → number', documentation: 'First element\'s height.', insertText: 'height()' },
  { name: 'offset', kind: 'Method', detail: '() → { top, left, width, height }', documentation: 'Position relative to document.', insertText: 'offset()' },
  { name: 'position', kind: 'Method', detail: '() → { top, left }', documentation: 'Position relative to offset parent.', insertText: 'position()' },
  // Content
  { name: 'html', kind: 'Method', detail: '() | (content) → string | this', documentation: 'Get or set innerHTML.', insertText: 'html($1)' },
  { name: 'text', kind: 'Method', detail: '() | (content) → string | this', documentation: 'Get or set textContent.', insertText: 'text($1)' },
  { name: 'val', kind: 'Method', detail: '() | (value) → string | this', documentation: 'Get or set input value.', insertText: 'val($1)' },
  // DOM Manipulation
  { name: 'append', kind: 'Method', detail: '(content) → this', documentation: 'Insert content at end.', insertText: 'append($1)' },
  { name: 'prepend', kind: 'Method', detail: '(content) → this', documentation: 'Insert content at beginning.', insertText: 'prepend($1)' },
  { name: 'after', kind: 'Method', detail: '(content) → this', documentation: 'Insert content after each element.', insertText: 'after($1)' },
  { name: 'before', kind: 'Method', detail: '(content) → this', documentation: 'Insert content before each element.', insertText: 'before($1)' },
  { name: 'wrap', kind: 'Method', detail: '(wrapper) → this', documentation: 'Wrap each element with HTML or Node.', insertText: "wrap('$1')" },
  { name: 'remove', kind: 'Method', detail: '() → this', documentation: 'Remove all elements from DOM.', insertText: 'remove()' },
  { name: 'empty', kind: 'Method', detail: '() → this', documentation: 'Clear innerHTML of all elements.', insertText: 'empty()' },
  { name: 'clone', kind: 'Method', detail: '(deep?) → ZQueryCollection', documentation: 'Clone elements (default: deep).', insertText: 'clone()' },
  { name: 'replaceWith', kind: 'Method', detail: '(content) → this', documentation: 'Replace elements with new content.', insertText: 'replaceWith($1)' },
  // Visibility
  { name: 'show', kind: 'Method', detail: '(display?) → this', documentation: 'Show elements. Optional display value.', insertText: 'show()' },
  { name: 'hide', kind: 'Method', detail: '() → this', documentation: 'Set `display: none`.', insertText: 'hide()' },
  { name: 'toggle', kind: 'Method', detail: '(display?) → this', documentation: 'Toggle visibility.', insertText: 'toggle()' },
  // Events
  { name: 'on', kind: 'Method', detail: '(events, handler) | (events, selector, handler) → this', documentation: 'Attach event handler. Supports delegation and space-separated events.', insertText: "on('${1:click}', (e) => {\n\t$2\n})" },
  { name: 'off', kind: 'Method', detail: '(events, handler) → this', documentation: 'Remove event handler.', insertText: "off('$1', $2)" },
  { name: 'one', kind: 'Method', detail: '(event, handler) → this', documentation: 'One-time event handler.', insertText: "one('$1', (e) => {\n\t$2\n})" },
  { name: 'trigger', kind: 'Method', detail: '(event, detail?) → this', documentation: 'Dispatch CustomEvent with optional detail.', insertText: "trigger('$1')" },
  { name: 'click', kind: 'Method', detail: '(fn?) → this', documentation: 'Attach click handler or trigger click.', insertText: 'click($1)' },
  { name: 'submit', kind: 'Method', detail: '(fn?) → this', documentation: 'Attach submit handler or trigger submit.', insertText: 'submit($1)' },
  { name: 'focus', kind: 'Method', detail: '() → this', documentation: 'Focus first element.', insertText: 'focus()' },
  { name: 'blur', kind: 'Method', detail: '() → this', documentation: 'Blur first element.', insertText: 'blur()' },
  // Animation
  { name: 'animate', kind: 'Method', detail: '(props, duration?, easing?) → Promise<ZQueryCollection>', documentation: 'CSS transition animation. Returns a Promise.', insertText: "animate({ $1 }, ${2:300})" },
  { name: 'fadeIn', kind: 'Method', detail: '(duration?) → Promise<ZQueryCollection>', documentation: 'Fade in (opacity 0→1). Default 300 ms.', insertText: 'fadeIn(${1:300})' },
  { name: 'fadeOut', kind: 'Method', detail: '(duration?) → Promise<ZQueryCollection>', documentation: 'Fade out (opacity 1→0) then hide. Default 300 ms.', insertText: 'fadeOut(${1:300})' },
  { name: 'slideToggle', kind: 'Method', detail: '(duration?) → this', documentation: 'Toggle height with slide animation.', insertText: 'slideToggle(${1:300})' },
  // Form
  { name: 'serialize', kind: 'Method', detail: '() → string', documentation: 'URL-encoded form data string.', insertText: 'serialize()' },
  { name: 'serializeObject', kind: 'Method', detail: '() → object', documentation: 'Form data as key/value object. Duplicate keys become arrays.', insertText: 'serializeObject()' },
];


// -- HTML directives (z-*) --------------------------------------------------

const zDirectives = [
  // -- Conditional Rendering -----------------------------------------------
  {
    name: 'z-if',
    detail: 'Conditional Rendering',
    documentation:
      'Conditionally render an element based on a state expression. The element is removed from the DOM when the expression is falsy.\n\n' +
      '```html\n<div z-if="isLoggedIn">Welcome back!</div>\n<div z-if="items.length > 0">Has items</div>\n<div z-if="status === \'ok\'">Success</div>\n```',
    insertText: 'z-if="$1"',
  },
  {
    name: 'z-else-if',
    detail: 'Else-If Branch',
    documentation:
      'Must follow a `z-if` or another `z-else-if` element. Renders when the preceding conditions are falsy and this expression is truthy.\n\n' +
      '```html\n<div z-if="status === \'ok\'">Success</div>\n<div z-else-if="status === \'loading\'">Loading...</div>\n<div z-else>Error</div>\n```',
    insertText: 'z-else-if="$1"',
  },
  {
    name: 'z-else',
    detail: 'Else Branch',
    documentation:
      'Must follow a `z-if` or `z-else-if` element. Renders when all preceding conditions are falsy.\n\n' +
      '```html\n<div z-if="items.length">Has items</div>\n<div z-else>No items found</div>\n```',
    insertText: 'z-else',
  },
  // -- List Rendering ------------------------------------------------------
  {
    name: 'z-for',
    detail: 'List Rendering',
    documentation:
      'Repeat an element for each item in an array. Exposes the loop variable and `$index` inside `{{…}}` expressions.\n\n' +
      '```html\n<li z-for="item in items">\n  {{$index}}: {{item.name}}\n</li>\n```\n\n' +
      '**Additional forms:**\n' +
      '- `(item, index) in items` — destructured index\n' +
      '- `n in 5` — number range → `[1, 2, 3, 4, 5]`\n' +
      '- `(val, key) in object` — object iteration (key/value entries)\n\n' +
      'Nested loops are supported. Each `z-for` creates its own scope.',
    insertText: 'z-for="$1 in $2"',
  },
  // -- Visibility ----------------------------------------------------------
  {
    name: 'z-show',
    detail: 'Toggle Visibility',
    documentation:
      'Toggle `display: none` based on a state expression. Unlike `z-if`, the element stays in the DOM.\n\n' +
      '```html\n<div z-show="isOpen">Dropdown content</div>\n```',
    insertText: 'z-show="$1"',
  },
  // -- Attribute Binding ---------------------------------------------------
  {
    name: 'z-bind',
    detail: 'Dynamic Attribute',
    documentation:
      'Bind a state expression to an HTML attribute. Shorthand: `:attr="expr"`\n\n' +
      '```html\n<a z-bind:href="url">Link</a>\n<a :href="url">Link</a>\n<img :src="imageUrl" :alt="imageAlt">\n<button :disabled="isLoading">Submit</button>\n```',
    insertText: 'z-bind:$1="$2"',
  },
  // -- Class & Style Binding -----------------------------------------------
  {
    name: 'z-class',
    detail: 'Dynamic CSS Classes',
    documentation:
      'Bind CSS classes dynamically using an object expression. Keys are class names, values are boolean state expressions.\n\n' +
      '```html\n<div z-class="{active: isActive, disabled: isOff}">\n<li z-class="{selected: item.id === selectedId}">\n```',
    insertText: 'z-class="{$1: $2}"',
  },
  {
    name: 'z-style',
    detail: 'Dynamic Inline Styles',
    documentation:
      'Bind inline styles dynamically using an object expression. Keys are CSS properties, values are state expressions.\n\n' +
      '```html\n<div z-style="{color: textColor, fontSize: size + \'px\'}">\n<div z-style="{background: theme.bg}">\n```',
    insertText: 'z-style="{$1: $2}"',
  },
  // -- Content Injection ---------------------------------------------------
  {
    name: 'z-text',
    detail: 'Text Content',
    documentation:
      'Set the element\'s `textContent` from a state expression. Content is auto-escaped (safe from XSS).\n\n' +
      '```html\n<span z-text="username"></span>\n<p z-text="message"></p>\n```',
    insertText: 'z-text="$1"',
  },
  {
    name: 'z-html',
    detail: 'HTML Content',
    documentation:
      'Set the element\'s `innerHTML` from a state expression. **Warning:** only use with trusted content.\n\n' +
      '```html\n<div z-html="richContent"></div>\n```',
    insertText: 'z-html="$1"',
  },
  // -- Two-Way Binding -----------------------------------------------------
  {
    name: 'z-model',
    detail: 'Two-Way Binding',
    documentation:
      'Reactive two-way sync between a form element and a component state property.\n' +
      'Supports text inputs, checkboxes, radio buttons, selects, and contenteditable.\n' +
      'Use dot-notation for nested keys: `z-model="user.name"`\n\n' +
      '```html\n<input z-model="search" placeholder="Search...">\n```',
    insertText: 'z-model="$1"',
  },
  // -- Element Reference ---------------------------------------------------
  {
    name: 'z-ref',
    detail: 'Element Reference',
    documentation:
      'Mark an element so it\'s accessible via `this.refs.name` in component code.\n\n' +
      '```html\n<input z-ref="searchInput">\n<canvas z-ref="chart"></canvas>\n```\n\nAccess: `this.refs.searchInput.focus()`',
    insertText: 'z-ref="$1"',
  },
  // -- Event Binding (z-on: form) ------------------------------------------
  {
    name: 'z-on',
    detail: 'Event Binding (z-on:event)',
    documentation:
      'Bind an event to a component method. Identical to `@event` shorthand.\n' +
      'Supports modifiers: `.prevent`, `.stop`, `.self`, `.once`, `.capture`, `.passive`, `.debounce.{ms}`, `.throttle.{ms}`\n\n' +
      'Pass `$event` to inject the native DOM event, plus strings, numbers, booleans, `null`, and `state.key` references.\n\n' +
      '```html\n<button z-on:click="save">Save</button>\n<button z-on:click.prevent="handleClick">Click</button>\n<input z-on:input.debounce.300="search">\n<button z-on:click="doSomething($event, \'foo\')">With args</button>\n```',
    insertText: 'z-on:$1="$2"',
  },
  // -- Router Navigation ---------------------------------------------------
  {
    name: 'z-link',
    detail: 'Router Navigation Link',
    documentation:
      'SPA navigation link — clicks are intercepted by the router (no page reload).\n\n' +
      '```html\n<a z-link="/">Home</a>\n<a z-link="/user/42">Profile</a>\n```',
    insertText: 'z-link="$1"',
  },
  // -- Utility Directives --------------------------------------------------
  {
    name: 'z-cloak',
    detail: 'Hide Until Rendered',
    documentation:
      'Hides an element until the component has rendered. Prevents flash of unprocessed template expressions.\n' +
      'Add `[z-cloak] { display: none; }` to your CSS.\n\n' +
      '```html\n<div z-cloak>{{title}}</div>\n```',
    insertText: 'z-cloak',
  },
  {
    name: 'z-pre',
    detail: 'Skip Directive Processing',
    documentation:
      'Skip directive processing for this element and its children. Useful for displaying raw template syntax.\n\n' +
      '```html\n<div z-pre>\n  This z-if="x" won\'t be processed\n</div>\n```',
    insertText: 'z-pre',
  },
  // -- z-model Modifiers ---------------------------------------------------
  {
    name: 'z-lazy',
    detail: 'Lazy z-model modifier',
    documentation:
      'Boolean attribute modifier for `z-model`. Listens on `change` instead of `input` (update on blur, not every keystroke).\n\n' +
      '```html\n<input z-model="search" z-lazy>\n```',
    insertText: 'z-lazy',
  },
  {
    name: 'z-trim',
    detail: 'Trim z-model modifier',
    documentation:
      'Boolean attribute modifier for `z-model`. Trims whitespace from string values before writing to state.\n\n' +
      '```html\n<input z-model="username" z-trim>\n```',
    insertText: 'z-trim',
  },
  {
    name: 'z-number',
    detail: 'Number z-model modifier',
    documentation:
      'Boolean attribute modifier for `z-model`. Forces `Number()` conversion regardless of input type.\n\n' +
      '```html\n<input z-model="price" z-number>\n```',
    insertText: 'z-number',
  },
  // -- Keyed Reconciliation ------------------------------------------------
  {
    name: 'z-key',
    detail: 'Keyed Reconciliation',
    documentation:
      'Assign a unique key to elements inside `z-for` loops for efficient DOM morphing. ' +
      'When the list is re-rendered, `z-key` lets the morph engine match old and new elements by identity instead of position — preserving focus, animations, and local state.\n\n' +
      '```html\n<li z-for="item in items" z-key="{{item.id}}">\n  {{item.name}}\n</li>\n```',
    insertText: 'z-key="{{$1}}"',
  },
];


// -- HTML event directives (@event) -----------------------------------------

const eventDirectives = [
  {
    name: '@click',
    detail: 'Click Event',
    documentation:
      'Bind a click handler to a component method. Shorthand for `z-on:click`.\n' +
      'Pass `$event` for the native event, plus strings, numbers, booleans, `null`, and `state.key` references.\n\n' +
      '```html\n<button @click="increment">+1</button>\n<button @click="remove(${item.id})">Delete</button>\n<button @click="handle($event, \'edit\')">With $event</button>\n```',
    insertText: '@click="$1"',
  },
  {
    name: '@click.prevent',
    detail: 'Click + preventDefault',
    documentation: 'Click handler with `e.preventDefault()` applied automatically.',
    insertText: '@click.prevent="$1"',
  },
  {
    name: '@click.stop',
    detail: 'Click + stopPropagation',
    documentation: 'Click handler with `e.stopPropagation()` applied automatically.',
    insertText: '@click.stop="$1"',
  },
  {
    name: '@click.prevent.stop',
    detail: 'Click + prevent + stop',
    documentation: 'Click handler with both `preventDefault()` and `stopPropagation()`.',
    insertText: '@click.prevent.stop="$1"',
  },
  {
    name: '@click.once',
    detail: 'Click (one-time)',
    documentation: 'Click handler that fires only once, then auto-removes itself.',
    insertText: '@click.once="$1"',
  },
  {
    name: '@click.self',
    detail: 'Click (self only)',
    documentation: 'Click handler that only fires if the event target is the element itself (not a child).',
    insertText: '@click.self="$1"',
  },
  {
    name: '@click.capture',
    detail: 'Click (capture phase)',
    documentation: 'Click handler that listens during the capture phase instead of the bubble phase.',
    insertText: '@click.capture="$1"',
  },
  {
    name: '@click.passive',
    detail: 'Click (passive)',
    documentation: 'Click handler registered with `{ passive: true }` for performance optimization.',
    insertText: '@click.passive="$1"',
  },
  {
    name: '@click.debounce',
    detail: 'Click (debounced)',
    documentation:
      'Click handler debounced by a specified number of milliseconds. Default 250 ms.\n\n' +
      '```html\n<button @click.debounce.300="search">Search</button>\n```',
    insertText: '@click.debounce.${1:300}="$2"',
  },
  {
    name: '@click.throttle',
    detail: 'Click (throttled)',
    documentation:
      'Click handler throttled to fire at most once per specified milliseconds. Default 250 ms.\n\n' +
      '```html\n<button @click.throttle.500="save">Save</button>\n```',
    insertText: '@click.throttle.${1:250}="$2"',
  },
  {
    name: '@submit',
    detail: 'Submit Event',
    documentation:
      'Bind a submit handler (typically on `<form>`).\n\n' +
      '```html\n<form @submit.prevent="save">...</form>\n```',
    insertText: '@submit="$1"',
  },
  {
    name: '@submit.prevent',
    detail: 'Submit + preventDefault',
    documentation: 'Submit handler with `e.preventDefault()` — the most common form pattern.\n\n```html\n<form @submit.prevent="handleSubmit">...</form>\n```',
    insertText: '@submit.prevent="$1"',
  },
  {
    name: '@input',
    detail: 'Input Event',
    documentation: 'Fires on every keystroke / input change.\n\n```html\n<input @input="handleInput">\n```',
    insertText: '@input="$1"',
  },
  {
    name: '@input.debounce',
    detail: 'Input (debounced)',
    documentation:
      'Input handler debounced by a specified number of milliseconds. Ideal for search-as-you-type.\n\n' +
      '```html\n<input @input.debounce.300="search">\n```',
    insertText: '@input.debounce.${1:300}="$2"',
  },
  {
    name: '@change',
    detail: 'Change Event',
    documentation: 'Fires when the element value changes and loses focus.\n\n```html\n<select @change="onSelect">...</select>\n```',
    insertText: '@change="$1"',
  },
  {
    name: '@keydown',
    detail: 'Keydown Event',
    documentation: 'Fires when a key is pressed down.',
    insertText: '@keydown="$1"',
  },
  {
    name: '@keyup',
    detail: 'Keyup Event',
    documentation: 'Fires when a key is released.',
    insertText: '@keyup="$1"',
  },
  {
    name: '@mouseenter',
    detail: 'Mouse Enter Event',
    documentation: 'Fires when the mouse enters the element (does not bubble).',
    insertText: '@mouseenter="$1"',
  },
  {
    name: '@mouseleave',
    detail: 'Mouse Leave Event',
    documentation: 'Fires when the mouse leaves the element (does not bubble).',
    insertText: '@mouseleave="$1"',
  },
  {
    name: '@focus',
    detail: 'Focus Event',
    documentation: 'Fires when the element receives focus.',
    insertText: '@focus="$1"',
  },
  {
    name: '@blur',
    detail: 'Blur Event',
    documentation: 'Fires when the element loses focus.',
    insertText: '@blur="$1"',
  },
  {
    name: '@dblclick',
    detail: 'Double Click Event',
    documentation: 'Fires on double-click.',
    insertText: '@dblclick="$1"',
  },
  {
    name: '@contextmenu',
    detail: 'Context Menu Event',
    documentation: 'Fires on right-click / context menu.',
    insertText: '@contextmenu="$1"',
  },
  {
    name: '@scroll',
    detail: 'Scroll Event',
    documentation: 'Fires when the element is scrolled.',
    insertText: '@scroll="$1"',
  },
  {
    name: '@scroll.throttle',
    detail: 'Scroll (throttled)',
    documentation:
      'Scroll handler throttled to fire at most once per specified milliseconds.\n\n' +
      '```html\n<div @scroll.throttle.100="onScroll">...</div>\n```',
    insertText: '@scroll.throttle.${1:100}="$2"',
  },
  {
    name: '@scroll.passive',
    detail: 'Scroll (passive)',
    documentation: 'Scroll handler registered with `{ passive: true }` for performance.',
    insertText: '@scroll.passive="$1"',
  },
  {
    name: '@load',
    detail: 'Load Event',
    documentation: 'Fires when the element finishes loading (images, iframes, etc.).',
    insertText: '@load="$1"',
  },
];


// -- Component definition keys (for inside $.component({…})) ----------------

const componentKeys = [
  { name: 'state', kind: 'Property', detail: 'object | () => object', documentation: 'Initial reactive state. Function form recommended for reusability.', insertText: 'state: () => ({ $1 }),' },
  { name: 'render', kind: 'Method', detail: '() → string', documentation: 'Returns HTML string. Called on every state change. `this` is the component instance.', insertText: 'render() {\n\treturn `$1`;\n},' },
  { name: 'styles', kind: 'Property', detail: 'string', documentation: 'CSS string — automatically scoped to this component\'s root element.', insertText: 'styles: `\n\t$1\n`,' },
  { name: 'templateUrl', kind: 'Property', detail: 'string | string[] | { key: url }', documentation: 'URL to external HTML template file(s). If `render()` is also defined, `render()` takes priority.', insertText: "templateUrl: '$1'," },
  { name: 'styleUrl', kind: 'Property', detail: 'string | string[]', documentation: 'URL(s) to external CSS file(s). Fetched and scoped automatically.', insertText: "styleUrl: '$1'," },
  {
    name: 'pages',
    kind: 'Property',
    detail: '{ dir, param, default, ext?, items }',
    documentation:
      'Declarative multi-page config with **lazy loading**.\n\n' +
      'Only the active page is fetched on first render — remaining pages are prefetched in the background for instant navigation.\n\n' +
      '```js\npages: {\n  dir:     \'pages\',\n  param:   \'section\',\n  default: \'getting-started\',\n  items: [\n    \'getting-started\',\n    { id: \'http\', label: \'HTTP Client\' },\n  ],\n}\n```\n\n' +
      '**Exposes on `this`:**\n' +
      '- `this.pages` — `Array<{id, label}>` normalized metadata\n' +
      '- `this.activePage` — current page id from route param\n' +
      '- `this.templates` — `{ id: \'…html…\' }` keyed template map\n\n' +
      '**Interactivity:** Page HTML is static content. To add interactive widgets, embed a registered component tag (e.g. `<my-widget></my-widget>`) inside the page HTML — the component system initializes it automatically.',
    insertText: "pages: {\n\tdir:     '$1',\n\tparam:   '$2',\n\tdefault: '$3',\n\titems: [\n\t\t'$3',\n\t\t$4\n\t],\n},",
  },
  { name: 'base', kind: 'Property', detail: 'string', documentation: 'Override for the base path used to resolve relative `templateUrl`, `styleUrl`, and `pages.dir` URLs. Normally auto-detected from the component file.', insertText: "base: '$1'," },
  { name: 'init', kind: 'Method', detail: '() → void', documentation: 'Called before first render (during construction).', insertText: 'init() {\n\t$1\n},' },
  { name: 'mounted', kind: 'Method', detail: '() → void', documentation: 'Called once after first render and DOM insertion.', insertText: 'mounted() {\n\t$1\n},' },
  { name: 'updated', kind: 'Method', detail: '() → void', documentation: 'Called after every subsequent re-render.', insertText: 'updated() {\n\t$1\n},' },
  { name: 'destroyed', kind: 'Method', detail: '() → void', documentation: 'Called when the component is destroyed. Clean up here.', insertText: 'destroyed() {\n\t$1\n},' },
  { name: 'computed', kind: 'Property', detail: '{ name: (state) => value }', documentation: 'Define lazy computed getters derived from state. Accessed as regular state properties — they recompute automatically when dependencies change.\n\n```js\ncomputed: {\n  fullName(state) { return state.first + \' \' + state.last; },\n  itemCount(state) { return state.items.length; },\n}\n```\n\nUse in templates: `<span z-text="fullName"></span>`', insertText: 'computed: {\n\t${1:name}(state) { return ${2:state.value}; },\n},' },
  { name: 'watch', kind: 'Property', detail: '{ key: (newVal, oldVal) => void }', documentation: 'Watch state keys and run callbacks when they change. Watchers fire after the state update and before re-render.\n\n```js\nwatch: {\n  selectedId(newVal, oldVal) {\n    console.log(`Changed from ${oldVal} to ${newVal}`);\n    this.loadDetail(newVal);\n  },\n}\n```', insertText: 'watch: {\n\t${1:key}(newVal, oldVal) {\n\t\t$2\n\t},\n},' },
];


module.exports = {
  dollarMethods,
  httpMethods,
  storageMethods,
  busMethods,
  collectionMethods,
  zDirectives,
  eventDirectives,
  componentKeys,
};
