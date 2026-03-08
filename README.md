# zQuery for VS Code

Full developer tooling for the [zQuery (zero-query)](https://github.com/tonywied17/zero-query) frontend library — autocomplete, hover documentation, HTML directive support, and **155+ code snippets**.

---

## Features

### Autocomplete

Type `$.` anywhere in JavaScript or TypeScript to instantly see every method on the `$` namespace — complete with descriptions, signatures, and smart insert text.

- **Namespace completions** — `$.*`, `$.http.*`, `$.storage.*`, `$.session.*`, `$.bus.*`
- **Collection chain completions** — `$('selector').` and `$.all('selector').` suggest 50+ chainable methods
- **Component key completions** — Inside `$.component({})` get suggestions for `state`, `render`, `styles`, `templateUrl`, `styleUrl`, `pages`, `base`, `computed`, `watch`, lifecycle hooks, and more
- **HTML directive completions** — `@` triggers event directives, `z-` triggers structural directives, `:` triggers attribute binding shorthands

### Hover Documentation

Hover over any `$` method call or HTML directive to see rich inline documentation with code examples.

- `$`, `$.id`, `$.class`, `$.name`, `$.all`, `$.component`, `$.mount`, `$.http.get`, `$.storage.get`, `$.bus.on`, and more
- **Structural directives** — `z-if`, `z-else-if`, `z-else`, `z-for`, `z-show`, `z-cloak`, `z-pre`
- **Data binding directives** — `z-bind` / `:attr`, `z-class`, `z-style`, `z-text`, `z-html`, `z-model`, `z-ref`
- **Event directives** — `@click`, `z-on:click`, `@submit.prevent`, and all event modifiers (`.prevent`, `.stop`, `.once`, `.self`, `.capture`, `.passive`, `.debounce.{ms}`, `.throttle.{ms}`)
- Works across **JavaScript**, **TypeScript**, and **HTML** files

### Code Snippets

**155+ snippets** covering the entire zQuery API — type `zq-` to browse them all.

---

## JavaScript / TypeScript Snippets

### Selectors & DOM

| Prefix | Description |
|--------|-------------|
| `zq-select` | Chainable selector → `ZQueryCollection` |
| `zq-select-scoped` | Scoped selector → `ZQueryCollection` inside a parent |
| `zq-id` | Select by ID |
| `zq-class` | Select first element with class |
| `zq-classes` | Select all elements with class → `ZQueryCollection` |
| `zq-bytag` | Select all elements by tag name → `ZQueryCollection` |
| `zq-name` | Select elements by name attribute → `ZQueryCollection` |
| `zq-children` | Direct children of a parent element → `ZQueryCollection` |
| `zq-all` | Query all matching elements and chain — alias for `$()` |
| `zq-create` | Create a DOM element with attributes |
| `zq-domready` | DOM-ready callback shorthand `$(fn)` |
| `zq-ready` | DOM ready callback (`DOMContentLoaded`) |

### Collection Operations

| Prefix | Description |
|--------|-------------|
| `zq-all-on` | Attach event handler to all matching elements |
| `zq-all-addclass` | Add a class to all matching elements |
| `zq-all-css` | Set inline styles on all matching elements |
| `zq-all-animate` | Animate CSS properties (returns Promise) |
| `zq-all-fadein` | Fade in elements (opacity 0→1) |
| `zq-all-fadeout` | Fade out elements (opacity 1→0) |
| `zq-all-slidetoggle` | Toggle height with slide animation |
| `zq-serialize` | Serialize form data as key/value object |
| `zq-plugin` | Extend `ZQueryCollection` with a custom method |

### Events

| Prefix | Description |
|--------|-------------|
| `zq-on` | Global delegated event listener (3-arg) |
| `zq-on-direct` | Direct global event listener (2-arg) |
| `zq-off` | Remove a global event listener |

### Reactive

| Prefix | Description |
|--------|-------------|
| `zq-signal` | Create a reactive signal |
| `zq-signal-sub` | Subscribe to a signal's changes |
| `zq-computed` | Create a computed (derived) signal |
| `zq-effect` | Create a reactive effect |
| `zq-reactive` | Create a deep reactive proxy |

### Components

| Prefix | Description |
|--------|-------------|
| `zq-component` | Full component with state, lifecycle, methods, render |
| `zq-component-simple` | Minimal component scaffold |
| `zq-component-pages` | Component with pages config (lazy-loaded sections) |
| `zq-component-template` | Component with external template and stylesheet |
| `zq-mount` | Mount a registered component |
| `zq-mountall` | Auto-mount all registered component tags |
| `zq-getinstance` | Get the component instance at a target element |
| `zq-destroy` | Destroy a mounted component |
| `zq-components` | List all registered component definitions |
| `zq-setstate` | Merge partial state (triggers re-render) |
| `zq-emit` | Dispatch a CustomEvent from the component root |
| `zq-component-computed` | Component with computed properties (lazy getters derived from state) |
| `zq-component-watch` | Component with watchers (callbacks when state keys change) |

### Router

| Prefix | Description |
|--------|-------------|
| `zq-router` | SPA router with routes and fallback |
| `zq-router-hash` | Hash-mode router (`#/path`) |
| `zq-route-lazy` | Lazy-loaded route definition |
| `zq-route-fallback` | Route with fallback path |
| `zq-guard` | Navigation guard |
| `zq-route-change` | Subscribe to route changes |
| `zq-getrouter` | Get the active router instance |
| `zq-navigate` | Navigate to a path |
| `zq-replace` | Replace the current route (no history entry) |
| `zq-route-add` | Add a route dynamically at runtime |

### Store

| Prefix | Description |
|--------|-------------|
| `zq-store` | Store with state, actions, and getters |
| `zq-store-named` | Named store (retrieve via `$.getStore`) |
| `zq-getstore` | Retrieve a store by name |
| `zq-store-sub` | Subscribe to a store state key |
| `zq-dispatch` | Dispatch a store action |
| `zq-snapshot` | Deep clone of current store state |
| `zq-store-use` | Add store middleware |

### HTTP Client

| Prefix | Description |
|--------|-------------|
| `zq-http-config` | Configure HTTP client defaults |
| `zq-get` | HTTP GET request |
| `zq-post` | HTTP POST request |
| `zq-put` | HTTP PUT request |
| `zq-patch` | HTTP PATCH request |
| `zq-delete` | HTTP DELETE request |
| `zq-http-try` | HTTP request with error handling |
| `zq-http-abort` | AbortController for request cancellation |
| `zq-interceptor-req` | HTTP request interceptor |
| `zq-interceptor-res` | HTTP response interceptor |

### Utilities

| Prefix | Description |
|--------|-------------|
| `zq-debounce` | Debounced function |
| `zq-throttle` | Throttled function |
| `zq-pipe` | Left-to-right function composition |
| `zq-once` | Function that executes only once |
| `zq-sleep` | Promise that resolves after N ms |
| `zq-uuid` | Generate a UUID v4 |
| `zq-escapehtml` | Escape HTML entities |
| `zq-html-safe` | Tagged template with auto-escaping |
| `zq-trust` | Mark HTML as trusted (skip escaping) |
| `zq-camelcase` | kebab-case → camelCase |
| `zq-kebabcase` | camelCase → kebab-case |
| `zq-deepclone` | Deep clone an object |
| `zq-deepmerge` | Recursive object merge |
| `zq-isequal` | Deep equality comparison |
| `zq-param` | Serialize object to query string |
| `zq-parsequery` | Parse query string to object |
| `zq-morph` | Patch a live DOM tree via real-DOM diffing |
| `zq-safeeval` | CSP-safe expression evaluator (no eval/new Function) |

### Storage & Event Bus

| Prefix | Description |
|--------|-------------|
| `zq-storage-set` | Store value in localStorage |
| `zq-storage-get` | Get value from localStorage |
| `zq-session-set` | Store value in sessionStorage |
| `zq-session-get` | Get value from sessionStorage |
| `zq-bus-on` | Subscribe to a bus event |
| `zq-bus-emit` | Emit a bus event |
| `zq-bus-once` | One-time bus event subscription |
| `zq-bus-clear` | Remove all bus listeners |

### Global & ESM

| Prefix | Description |
|--------|-------------|
| `zq-style` | Dynamically load a global stylesheet |
| `zq-import` | Import zQuery named exports (ESM) |
| `zq-noconflict` | Remove `$` from window and return zQuery |

---

## HTML Snippets

### Structural Directives

| Prefix | Description |
|--------|-------------|
| `z-if` | Conditional rendering — removes element when falsy |
| `z-if-else` | `z-if` / `z-else` block pair |
| `z-if-elseif-else` | Full `z-if` / `z-else-if` / `z-else` chain |
| `z-else-if` | Else-if branch (must follow `z-if` or `z-else-if`) |
| `z-else` | Else branch (must follow `z-if` or `z-else-if`) |
| `z-for` | List rendering — repeats element for each item |
| `z-for-index` | List rendering with `$index` |
| `z-show` | Toggle visibility via `display:none` (stays in DOM) |
| `z-cloak` | Hide until rendered — prevents template flash |
| `z-pre` | Skip directive processing for element and children |
| `z-key` | Keyed reconciliation attribute for `z-for` loops |

### Data Binding Directives

| Prefix | Description |
|--------|-------------|
| `z-bind` | Dynamic attribute binding (`z-bind:attr="expr"`) |
| `:bind` | Attribute binding shorthand (`:href`, `:src`, etc.) |
| `z-class` | Dynamic CSS class binding with object syntax |
| `z-style` | Dynamic inline style binding with object syntax |
| `z-text` | Text content binding — sets `textContent` (auto-escaped) |
| `z-html` | HTML content binding — sets `innerHTML` (trusted content) |
| `z-model` | Two-way data binding |
| `z-model-nested` | Nested state binding (`parent.child`) |
| `z-model-mods` | Binding with modifier (`z-lazy`, `z-trim`, `z-number`) |
| `z-model-checkbox` | Checkbox with boolean binding |
| `z-model-radio` | Radio button group |
| `z-model-number` | Number input |
| `z-model-select` | Select dropdown |
| `z-model-textarea` | Textarea with optional lazy modifier |
| `z-ref` | Element reference (`this.refs.name`) |
| `z-link` | SPA navigation link |
| `z-on` | Event binding (`z-on:event` form) |
| `z-on-mod` | Event binding with modifier |

### Slots

| Prefix | Description |
|--------|-------------|
| `zq-slot` | Default slot for content distribution |
| `zq-slot-named` | Named slot for targeted content distribution |

### Event Bindings

| Prefix | Description |
|--------|-------------|
| `@click` | Click handler |
| `@click-args` | Click with arguments |
| `@click-prevent` | Click with `preventDefault` |
| `@submit` | Form submit with `preventDefault` |
| `@input` | Input handler |
| `@change` | Change handler |
| `@keydown` | Keydown handler |
| `@keyup` | Keyup handler |
| `@event` | Custom event binding |
| `@event-prevent-stop` | Event with `prevent` + `stop` modifiers |
| `@event-once` | One-time event — auto-removes after first fire |
| `@event-self` | Self-only — fires only when target is the element |
| `@event-capture` | Capture-phase event listener |
| `@event-passive` | Passive listener for scroll performance |
| `@event-debounce` | Debounced event — delays by specified ms |
| `@event-throttle` | Throttled event — fires at most once per specified ms |

### Component Templates

| Prefix | Description |
|--------|-------------|
| `zq-tag` | Custom component element |
| `zq-embed` | Embed a component with props |
| `zq-expr` | Template expression (`{{…}}`) |
| `zq-if` | Conditional rendering (ternary) |
| `zq-list` | List rendering (map/join) |
| `zq-for-key` | `z-for` loop with `z-key` for keyed DOM reconciliation |

### Forms

| Prefix | Description |
|--------|-------------|
| `zq-form` | Complete form with z-model bindings |
| `zq-select-el` | Select element with z-model |
| `zq-checkbox` | Checkbox with z-model |

### Layout & Navigation

| Prefix | Description |
|--------|-------------|
| `zq-outlet` | Router outlet element |
| `zq-nav` | Navigation bar with z-links |

---

## Event Modifiers

zQuery supports chaining modifiers on any event binding (`@event` or `z-on:event`):

| Modifier | Description |
|----------|-------------|
| `.prevent` | Calls `event.preventDefault()` |
| `.stop` | Calls `event.stopPropagation()` |
| `.once` | Handler fires once then auto-removes |
| `.self` | Only fires when `event.target` is the element itself |
| `.capture` | Uses capture-phase event listener |
| `.passive` | Marks listener as passive (performance hint) |
| `.debounce.{ms}` | Debounces handler by specified milliseconds |
| `.throttle.{ms}` | Throttles handler to fire at most once per specified ms |

Modifiers can be chained: `@click.prevent.stop="handler"`, `@scroll.passive.throttle.100="onScroll"`

---

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `zquery.enable` | `boolean` | `true` | Enable or disable zQuery IntelliSense |

## Supported Languages

- JavaScript
- TypeScript
- JavaScript React (JSX)
- TypeScript React (TSX)
- HTML

## Requirements

- VS Code **1.75.0** or later
- No additional dependencies

## Links

- [zQuery on npm](https://www.npmjs.com/package/zero-query)
- [zQuery on GitHub](https://github.com/tonywied17/zero-query)
- [API Reference](https://github.com/tonywied17/zero-query/blob/main/API.md)
- [Report an Issue](https://github.com/tonywied17/zquery-vs-code/issues)

## License

MIT
