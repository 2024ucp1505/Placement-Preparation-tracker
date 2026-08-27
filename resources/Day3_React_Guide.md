# 📘 Day 3 — React: UI That Makes Sense
> **7-Day Full Stack Interview Prep** | Theory AM · Build PM

---

## 📚 Table of Contents

### 📖 Core Concepts
1. [Virtual DOM](#1-virtual-dom)
2. [Reconciliation & Diffing](#2-reconciliation--diffing)
3. [React Fiber](#3-react-fiber)
4. [JSX](#4-jsx)
5. [Functional vs Class Components](#5-functional-vs-class-components)
6. [Props vs State](#6-props-vs-state)
7. [One-Way Data Flow](#7-one-way-data-flow)
8. [Controlled vs Uncontrolled Components](#8-controlled-vs-uncontrolled-components)
9. [Keys in Lists](#9-keys-in-lists)
10. [Lifting State Up](#10-lifting-state-up)
11. [Composition vs Inheritance](#11-composition-vs-inheritance)

### ⚡ Hooks Deep Dive
12. [useState](#12-usestate)
13. [useEffect — deps array](#13-useeffect--deps-array)
14. [useRef](#14-useref)
15. [useContext](#15-usecontext)
16. [useReducer](#16-usereducer)
17. [useMemo](#17-usememo)
18. [useCallback](#18-usecallback)
19. [Custom Hooks](#19-custom-hooks)
20. [Hook Rules](#20-hook-rules)
21. [useLayoutEffect vs useEffect](#21-uselayouteffect-vs-useeffect)
22. [useId](#22-useid)
23. [useTransition](#23-usetransition)
24. [useDeferredValue](#24-usedeferredvalue)

### 🔥 Patterns & Ecosystem
25. [Context API vs Redux](#25-context-api-vs-redux)
26. [React Query / SWR](#26-react-query--swr)
27. [Code Splitting / Lazy Loading](#27-code-splitting--lazy-loading)
28. [React.memo](#28-reactmemo)
29. [Suspense](#29-suspense)
30. [Error Boundaries](#30-error-boundaries)
31. [Portals](#31-portals)
32. [forwardRef](#32-forwardref)
33. [Render Props](#33-render-props)
34. [HOC Pattern](#34-hoc-pattern)
35. [React Router v6](#35-react-router-v6)
36. [Accessibility Basics](#36-accessibility-basics)
37. [Testing — RTL Basics](#37-testing--rtl-basics)

### [🏗️ Build Project](#build-project)
### [🧪 Quiz — 25 Questions](#quiz--25-questions)

---

# CORE CONCEPTS

---

## 1. Virtual DOM

The **Virtual DOM (VDOM)** is a lightweight JavaScript representation of the actual DOM tree kept in memory by React.

```
Your JSX/components
       │
       ▼
┌─────────────────────┐
│  React renders into │  ← In-memory JavaScript object tree
│   Virtual DOM (JS)  │
└──────────┬──────────┘
           │ diffing (reconciliation)
           ▼
┌─────────────────────┐
│   Actual DOM (HTML) │  ← Only the changed nodes are updated
└─────────────────────┘
```

**Why does it exist?**
- Direct DOM operations are **slow** — every touch triggers layout/paint/composite cycles.
- React batches and minimises DOM writes by computing the **minimum set of changes** first in memory.

**Key insight:** React doesn't always use the VDOM for speed — it uses it for a **programming model**. You describe *what* the UI should look like; React figures out *how* to get there.

```jsx
// You write this (declarative):
function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// React internally builds a JS object like:
// { type: 'button', props: { onClick: fn, children: 0 } }
// On state change, it builds a NEW vDOM, diffs with the old one,
// and only patches the text node that changed.
```

---

## 2. Reconciliation & Diffing

**Reconciliation** is the process by which React updates the DOM to match the latest render output.

**The diffing algorithm has two main heuristics:**

### Heuristic 1 — Elements of different types → tear down and rebuild
```jsx
// Old tree         // New tree
<div>          →   <span>       // Different type → unmount div, mount span
  <Counter />        <Counter />
</div>              </span>
```
`Counter`'s state is **lost** because the entire subtree is destroyed.

### Heuristic 2 — Same type → update props in-place
```jsx
// Old                  // New
<div className="red" /> → <div className="blue" />
// React keeps the same DOM node, just updates className attribute
```

### Lists — Keys matter
```jsx
// Without keys → React re-renders entire list on prepend
// With keys    → React matches by key and only moves/updates
<ul>
  {items.map(item => <li key={item.id}>{item.name}</li>)}
</ul>
```

> **Interview tip:** Reconciliation is O(n) — not O(n³) like naive tree diffing — because of these two assumptions. They're correct ~99% of the time in practice.

---

## 3. React Fiber

**React Fiber** is a complete rewrite of React's core reconciliation algorithm (shipped in React 16).

**The problem with the old reconciler (Stack Reconciler):**
- Reconciliation was **synchronous** and **recursive** — once started, it couldn't be interrupted.
- A large update (e.g., rendering a huge list) would block the main thread, causing jank.

**What Fiber solves:**
- **Incremental rendering** — break reconciliation work into small chunks ("fibers").
- Work can be **paused, aborted, or reused** depending on priority.
- Enables **Concurrent Mode**, `useTransition`, `Suspense`, and time-slicing.

```
Old reconciler (Stack):
  render() ────────────────────────────────────────── done
                 BLOCKED main thread the whole time!

Fiber reconciler:
  render chunk ─ yield ─ render chunk ─ yield ─ done
                 │             │
                 └─ user input handled between chunks
```

**Fiber data structure:** Each component is a "fiber node" — a unit of work with fields like:
- `type` — the component function/class
- `child`, `sibling`, `return` — links to other fibers
- `pendingProps`, `memoizedProps`
- `effectTag` — what DOM operation to perform (insert, update, delete)

---

## 4. JSX

**JSX** is a syntax extension for JavaScript that looks like HTML. It is **not** HTML — it compiles to `React.createElement()` calls.

```jsx
// What you write:
const el = <h1 className="title">Hello, {name}!</h1>;

// What Babel compiles it to (old transform):
const el = React.createElement('h1', { className: 'title' }, 'Hello, ', name, '!');

// New JSX Transform (React 17+) — no need to import React:
// Babel imports from 'react/jsx-runtime' automatically
```

**JSX rules:**
```jsx
// 1. Must return a single root element (use Fragment if needed)
return (
  <>
    <h1>Title</h1>
    <p>Body</p>
  </>
);

// 2. className, not class; htmlFor, not for
<label htmlFor="name" className="label">Name</label>

// 3. Self-closing tags must close
<img src="..." alt="..." />    // ✅
<img src="..." alt="...">     // ❌

// 4. JavaScript expressions in curly braces { }
<p>{isLoggedIn ? 'Welcome!' : 'Please log in'}</p>

// 5. No statements (if, for) — use expressions or extract to variable
const content = isLoggedIn ? <Dashboard /> : <Login />;
return <main>{content}</main>;
```

---

## 5. Functional vs Class Components

Today, **functional components + hooks** are the standard. Class components are legacy.

| Feature | Functional Component | Class Component |
|---|---|---|
| Syntax | Plain function | Extends `React.Component` |
| State | `useState` | `this.state` |
| Lifecycle | `useEffect` | `componentDidMount`, etc. |
| `this` | Not needed | Required (often confusing) |
| Performance | Slightly better | Slightly heavier |
| Code sharing | Custom hooks | HOCs / render props (verbose) |
| Error boundaries | ❌ (must use class) | ✅ |

```jsx
// Functional (modern)
function Greeting({ name }) {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{name}: {count}</button>;
}

// Class (legacy — know it for interviews)
class Greeting extends React.Component {
  state = { count: 0 };
  render() {
    return (
      <button onClick={() => this.setState({ count: this.state.count + 1 })}>
        {this.props.name}: {this.state.count}
      </button>
    );
  }
}
```

> **Interview tip:** You can't write error boundaries as functional components yet — that's the one reason to still know class components.

---

## 6. Props vs State

| | Props | State |
|---|---|---|
| Owned by | Parent component | The component itself |
| Mutable by | Parent only | The component (`setState`/`useState`) |
| Triggers re-render | Yes (if parent re-renders) | Yes (when updated) |
| Purpose | Pass data/config down | Track local, changing data |

```jsx
// Props: passed from parent, read-only inside child
function Card({ title, onClick }) {   // title and onClick are props
  return <div onClick={onClick}>{title}</div>;
}

// State: owned and managed internally
function Toggle() {
  const [isOn, setIsOn] = useState(false);  // isOn is state
  return (
    <button onClick={() => setIsOn(prev => !prev)}>
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
}

// Props can contain functions (callbacks):
// Parent passes down a setter so child can "communicate upward"
function Parent() {
  const [val, setVal] = useState('');
  return <Child value={val} onChange={setVal} />;
}
function Child({ value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}
```

---

## 7. One-Way Data Flow

React enforces **unidirectional data flow**: data flows **down** from parent to child via props, and events flow **up** via callback functions.

```
         ┌─────────────┐
         │  App State  │  (source of truth)
         └──────┬──────┘
                │ props flow down
       ┌────────▼────────┐
       │   Parent Comp   │
       └──────┬──────────┘
              │ props
     ┌────────▼────────┐
     │   Child Comp    │
     └──────┬──────────┘
            │ callback (event up)
     ┌──────▼──────────┐
     │  Child updates  │ ──── calls parent's setState ──→ state updates ──→ re-render flows down
     └─────────────────┘
```

**Why one-way?**
- **Predictable** — you always know where data comes from.
- **Debuggable** — trace data issues from root to leaf.
- **Testable** — components are pure functions of their props.

> This contrasts with two-way binding (Angular, Vue) where a child can directly mutate parent state, which can become hard to trace.

---

## 8. Controlled vs Uncontrolled Components

### Controlled (React owns the value)
```jsx
function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}                          // React controls the value
      onChange={e => setValue(e.target.value)} // React updates on every keystroke
    />
  );
}
// ✅ Single source of truth in React state
// ✅ Easy to validate, transform, or read at any time
// ✅ Recommended for most form use cases
```

### Uncontrolled (DOM owns the value)
```jsx
function UncontrolledInput() {
  const inputRef = useRef();

  function handleSubmit() {
    console.log(inputRef.current.value); // read only when needed
  }

  return (
    <>
      <input ref={inputRef} defaultValue="initial" />
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}
// ✅ Simpler for quick forms / file inputs
// ❌ Can't easily validate on each keystroke
// ❌ Not a single source of truth
```

| | Controlled | Uncontrolled |
|---|---|---|
| Value stored in | React state | DOM node |
| Access value | `state` | `ref.current.value` |
| Initial value | `value` prop | `defaultValue` prop |
| Real-time validation | ✅ Easy | ❌ Hard |
| File inputs | ❌ Can't control | ✅ Must use |

---

## 9. Keys in Lists

**Keys** are special props that help React identify which items in a list changed, were added, or removed.

```jsx
// ❌ BAD — using index as key
items.map((item, index) => <li key={index}>{item.name}</li>)
// Problem: if you prepend or sort, indices shift → React re-renders wrong items

// ✅ GOOD — using stable unique ID
items.map(item => <li key={item.id}>{item.name}</li>)
```

**What happens without keys?**
```jsx
// Old list:           New list (item prepended):
<ul>                   <ul>
  <li>Alice</li>    →    <li>NEW</li>    ← React thinks this is 'Alice' (index 0)
  <li>Bob</li>           <li>Alice</li>  ← React thinks this changed from 'Bob'
</ul>                    <li>Bob</li>    ← React thinks this is new!
</ul>
// React destroys and recreates Alice and Bob unnecessarily
// With keys, React correctly identifies NEW is new, Alice and Bob just shifted
```

**Rules:**
- Keys must be **unique among siblings** (not globally unique).
- Keys must be **stable** — don't generate keys with `Math.random()` or `Date.now()` during render.
- Keys are **not passed as props** to the component — they're internal to React.

---

## 10. Lifting State Up

When two sibling components need to share state, **lift the state** up to their nearest common ancestor and pass it down via props.

```jsx
// ❌ Before lifting — siblings can't share state
function TempInput() {
  const [celsius, setCelsius] = useState(0);
  // Bob can't see Alice's state
}
function TempDisplay() {
  // Has no idea what TempInput's celsius is
}

// ✅ After lifting — parent owns the state
function TemperatureConverter() {
  const [celsius, setCelsius] = useState(0);  // lifted to parent
  const fahrenheit = celsius * 9/5 + 32;

  return (
    <div>
      <TempInput value={celsius} onChange={setCelsius} />
      <TempDisplay fahrenheit={fahrenheit} />
    </div>
  );
}

function TempInput({ value, onChange }) {
  return <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} />;
}
function TempDisplay({ fahrenheit }) {
  return <p>{fahrenheit}°F</p>;
}
```

> **Pattern:** "Lift state to the lowest common ancestor that needs it." The more you lift, the more re-renders you risk — find the right level.

---

## 11. Composition vs Inheritance

React strongly favours **composition** over inheritance. You build complex UIs by combining simpler components.

```jsx
// ✅ COMPOSITION — using children prop
function Card({ children, className }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function ProfileCard({ user }) {
  return (
    <Card className="profile-card">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
    </Card>
  );
}

// ✅ Specialization via props
function Dialog({ title, message, footer }) {
  return (
    <Card>
      <h1>{title}</h1>
      <p>{message}</p>
      <footer>{footer}</footer>
    </Card>
  );
}

// ❌ INHERITANCE — anti-pattern in React
class SpecialButton extends Button {  // Don't do this
  // React components don't benefit from class hierarchies
}
```

> React's component model is already composition. Props, children, and custom hooks give you all the reuse you need. The React team has never found a use case where inheritance was the right answer.

---

# HOOKS DEEP DIVE

---

## 12. useState

`useState` lets you add reactive state to a functional component.

```jsx
const [state, setState] = useState(initialValue);
```

```jsx
// Basic usage
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ✅ Functional update — always use when new state depends on old state
setCount(prev => prev + 1);  // safe with batching
setCount(count + 1);         // ⚠️ stale if batched

// Objects — must spread, React doesn't deep merge
const [user, setUser] = useState({ name: '', age: 0 });
setUser(prev => ({ ...prev, name: 'Alice' })); // ✅
setUser({ name: 'Alice' });                     // ❌ loses age

// Lazy initialization — pass a function for expensive initial computation
const [data, setData] = useState(() => heavyComputation()); // runs once
const [data, setData] = useState(heavyComputation());       // runs every render!

// React 18: automatic batching — multiple setStates in async code are batched
setTimeout(() => {
  setCount(c => c + 1);  // React 18: one re-render for both
  setFlag(f => !f);
}, 1000);
```

---

## 13. useEffect — deps array

`useEffect` synchronizes your component with external systems (APIs, DOM, subscriptions).

```jsx
useEffect(() => {
  // ← setup (runs after render)
  return () => {
    // ← cleanup (runs before next effect or on unmount)
  };
}, [/* dependencies */]);
```

### The 3 dependency array cases:

```jsx
// Case 1: No dependency array — runs after EVERY render
useEffect(() => {
  console.log('Runs after every render');
});

// Case 2: Empty array [] — runs ONCE after mount
useEffect(() => {
  fetchUser(userId);
  return () => cleanup(); // runs on unmount
}, []);

// Case 3: With deps — runs when any dep changes
useEffect(() => {
  fetchUser(userId);
}, [userId]); // re-runs when userId changes
```

### Common patterns:

```jsx
// Data fetching with cleanup (avoid stale data)
useEffect(() => {
  let cancelled = false;

  async function load() {
    const data = await fetchUser(id);
    if (!cancelled) setUser(data);  // don't update if component unmounted
  }

  load();
  return () => { cancelled = true; };
}, [id]);

// Subscriptions
useEffect(() => {
  const sub = store.subscribe(setData);
  return () => sub.unsubscribe(); // cleanup on unmount
}, []);

// Event listeners
useEffect(() => {
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
```

> **Interview trap:** Missing deps cause stale closures. Extra deps cause infinite loops. Lint with `eslint-plugin-react-hooks`.

---

## 14. useRef

`useRef` returns a mutable ref object (`{ current: initialValue }`) that **persists across renders** without causing re-renders when changed.

**Two main use cases:**

```jsx
// Use case 1: Accessing DOM nodes directly
function AutoFocusInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus(); // direct DOM access
  }, []);

  return <input ref={inputRef} />;
}

// Use case 2: Storing mutable values without triggering re-renders
function Timer() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);  // storing interval ID — NOT state

  function start() {
    intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  }

  function stop() {
    clearInterval(intervalRef.current); // accessible via ref
  }

  return (
    <div>
      <p>{seconds}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}

// Use case 3: Previous value pattern
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; });
  return ref.current; // returns value from last render
}
```

> **Key insight:** Changing `ref.current` does NOT trigger a re-render. That's the fundamental difference from state.

---

## 15. useContext

`useContext` lets you read a context value without prop drilling.

```jsx
// 1. Create the context
const ThemeContext = createContext('light'); // 'light' is default

// 2. Provide it high up in the tree
function App() {
  const [theme, setTheme] = useState('dark');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Page />
    </ThemeContext.Provider>
  );
}

// 3. Consume it anywhere in the tree (no prop drilling!)
function Button() {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <button
      className={theme}
      onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
    >
      Toggle Theme
    </button>
  );
}
```

**Performance gotcha:**
```jsx
// ⚠️ Every consumer re-renders when context value changes
// Even if a consumer only uses theme, it re-renders when setTheme changes reference

// ✅ Split contexts by update frequency
const ThemeContext   = createContext(); // read-only, changes rarely
const ThemeDispatch  = createContext(); // dispatch fn, stable reference

// ✅ Or memoize context value
const value = useMemo(() => ({ theme, setTheme }), [theme]); // setTheme from useState is stable
```

---

## 16. useReducer

`useReducer` is an alternative to `useState` for **complex state logic** — state machines, multiple sub-values, or next state depending on previous.

```jsx
const [state, dispatch] = useReducer(reducer, initialState);
```

```jsx
// State shape
const initialState = { count: 0, error: null, loading: false };

// Reducer — pure function: (state, action) => newState
function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'RESET':
      return initialState;
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
    </div>
  );
}
```

**useState vs useReducer:**
| | `useState` | `useReducer` |
|---|---|---|
| Use when | Simple scalar/object state | Complex state transitions |
| State updates | Direct | Via action objects |
| Testability | Test component | Test reducer in isolation |
| Redux-like | No | Yes — very similar |

---

## 17. useMemo

`useMemo` **memoizes the result of a computation** — only recomputes when dependencies change.

```jsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

```jsx
function ProductList({ products, searchTerm }) {
  // ✅ Only filters when products or searchTerm changes
  const filtered = useMemo(
    () => products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [products, searchTerm]
  );

  // ❌ Without useMemo — re-filters on EVERY render (even unrelated state changes)
  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm));

  return <ul>{filtered.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

**When to use useMemo:**
- Genuinely expensive calculations (sorting/filtering large arrays, complex math)
- Creating objects/arrays passed to `React.memo` children (referential equality)
- Dependencies of other hooks (`useEffect`, `useCallback`)

**When NOT to use it:**
- Simple computations — the memoization overhead may be worse than recomputing
- Don't prematurely optimise — profile first

---

## 18. useCallback

`useCallback` **memoizes a function reference** — returns the same function instance between renders unless deps change.

```jsx
const memoizedFn = useCallback(() => doSomething(a, b), [a, b]);
```

```jsx
// ❌ Without useCallback — new function reference every render
function Parent() {
  const [count, setCount] = useState(0);
  const handleClick = () => console.log('clicked'); // new ref each render
  return <Child onClick={handleClick} />;
  // Child re-renders even if nothing relevant changed (if it's wrapped in React.memo)
}

// ✅ With useCallback — stable reference
function Parent() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => console.log('clicked'), []); // stable ref
  return <Child onClick={handleClick} />;
  // React.memo'd Child skips re-render ✓
}
```

**useMemo vs useCallback:**
```jsx
// These are equivalent:
useCallback(fn, deps)
useMemo(() => fn, deps)

// useMemo caches the RETURN VALUE of a function
// useCallback caches the FUNCTION ITSELF
```

---

## 19. Custom Hooks

A **custom hook** is a JavaScript function whose name starts with `use` and that calls other hooks. It lets you extract and **share stateful logic** between components.

```jsx
// Custom hook — encapsulates fetch logic
function useFetch(url) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then(res => { if (!res.ok) throw new Error(res.statusText); return res.json(); })
      .then(data => { if (!cancelled) { setData(data); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });

    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}

// Usage — any component can now reuse this logic
function UserProfile({ id }) {
  const { data: user, loading, error } = useFetch(`/api/users/${id}`);

  if (loading) return <Spinner />;
  if (error)   return <Error message={error} />;
  return <div>{user.name}</div>;
}
```

> **Key insight:** Custom hooks are the React way to share logic. They replaced HOCs and render props for most use cases. No new React API needed — just composing existing hooks.

---

## 20. Hook Rules

React enforces two rules for hooks (linted by `eslint-plugin-react-hooks`):

### Rule 1: Only call hooks at the top level
```jsx
// ❌ INVALID — conditional hook
function Component({ isLoggedIn }) {
  if (isLoggedIn) {
    const [data, setData] = useState(null); // ❌ breaks hook order
  }
}

// ✅ VALID — condition inside the hook
function Component({ isLoggedIn }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (isLoggedIn) fetchData(); // condition inside ✓
  }, [isLoggedIn]);
}
```

### Rule 2: Only call hooks from React functions
```jsx
// ❌ INVALID — hook in a plain JS function
function notAComponent() {
  const [x, setX] = useState(0); // ❌
}

// ✅ VALID — in React function components or custom hooks
function MyComponent() { useState(0); } // ✓
function useMyHook()   { useState(0); } // ✓ custom hook
```

**Why?** React tracks hooks by their **call order** in a component. Every render must call hooks in the exact same order — no conditionals, loops, or early returns before hooks.

---

## 21. useLayoutEffect vs useEffect

Both run after render, but at different times:

```
Render ──► DOM update ──► useLayoutEffect ──► Browser paint ──► useEffect
```

| | `useEffect` | `useLayoutEffect` |
|---|---|---|
| Runs after | Browser paint | DOM mutation, before paint |
| Async? | Yes (async, non-blocking) | No (synchronous, blocks paint) |
| Use for | Data fetching, subscriptions, logging | Reading DOM layout, preventing flash |

```jsx
// useLayoutEffect — read DOM dimensions before paint (no visual flash)
function Tooltip({ text, anchorEl }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef();

  useLayoutEffect(() => {
    // DOM is updated but browser hasn't painted yet
    const rect = anchorEl.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom,
      left: rect.left - tooltipRect.width / 2,
    });
    // Position is set before the browser paints — no flicker!
  }, [anchorEl]);

  return <div ref={tooltipRef} style={pos}>{text}</div>;
}

// useEffect — almost everything else
useEffect(() => {
  document.title = `Page: ${title}`; // fine after paint
}, [title]);
```

> **Interview tip:** Default to `useEffect`. Only reach for `useLayoutEffect` when you see a visual flicker caused by reading/writing DOM measurements.

---

## 22. useId

`useId` generates a **unique, stable ID** for accessibility attributes. It's consistent between server and client (avoiding hydration mismatches).

```jsx
import { useId } from 'react';

function FormField({ label, type }) {
  const id = useId(); // e.g. ":r0:", ":r1:", etc.

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} />
    </div>
  );
}

// ✅ Each instance gets its own unique ID
<FormField label="Name" type="text" />   // id=":r0:"
<FormField label="Email" type="email" /> // id=":r1:"

// ❌ Don't use for list keys — useId is not for that
// ❌ Don't use Math.random() or incrementing counters — breaks SSR
```

---

## 23. useTransition

`useTransition` marks a state update as **non-urgent** (low priority). React can interrupt it to handle more urgent updates (like user input).

```jsx
import { useState, useTransition } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  function handleSearch(e) {
    const val = e.target.value;
    setQuery(val); // urgent — update input immediately

    startTransition(() => {
      // non-urgent — React can defer this if needed
      setResults(expensiveFilter(val));
    });
  }

  return (
    <div>
      <input value={query} onChange={handleSearch} />
      {isPending && <Spinner />}
      <ResultsList results={results} />
    </div>
  );
}
```

> **Use case:** Large renders triggered by user input (filtering long lists, switching tabs with heavy content). The input stays responsive while the slow render happens in the background.

---

## 24. useDeferredValue

`useDeferredValue` defers updating a **value** (not a state setter). The UI renders with the old value first, then re-renders with the new one when React has time.

```jsx
import { useState, useDeferredValue } from 'react';

function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);
  // deferredQuery lags behind query intentionally

  const results = useMemo(
    () => expensiveFilter(deferredQuery),
    [deferredQuery] // only recomputes when deferred value settles
  );

  const isStale = query !== deferredQuery; // shows "old" results during transition

  return (
    <ul style={{ opacity: isStale ? 0.7 : 1 }}>
      {results.map(r => <li key={r.id}>{r.name}</li>)}
    </ul>
  );
}
```

**useTransition vs useDeferredValue:**
| | `useTransition` | `useDeferredValue` |
|---|---|---|
| You control | The state setter call | The value received |
| Access to `isPending` | ✅ | ❌ (infer from staleness) |
| Use when | You own the state update | You receive a value from props |

---

# PATTERNS & ECOSYSTEM

---

## 25. Context API vs Redux

| | Context API | Redux (Toolkit) |
|---|---|---|
| Setup | Minimal (built-in) | More setup |
| Scalability | Good for small/medium | Better for large apps |
| Performance | All consumers re-render | Selective via `useSelector` |
| Devtools | ❌ | ✅ Redux DevTools |
| Middleware | ❌ | ✅ Thunk, Saga, etc. |
| Best for | Theme, locale, auth | Global UI state, complex flows |

```jsx
// Context API (simple global state)
const CountContext = createContext();

function CountProvider({ children }) {
  const [count, setCount] = useState(0);
  return (
    <CountContext.Provider value={{ count, setCount }}>
      {children}
    </CountContext.Provider>
  );
}

// Redux Toolkit (scalable)
import { createSlice, configureStore } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => { state.value += 1; }, // Immer handles immutability
    decrement: state => { state.value -= 1; },
  },
});

const store = configureStore({ reducer: { counter: counterSlice.reducer } });
```

> **Interview answer:** "Use Context for low-frequency updates like theme or auth. Use Redux when you have frequent updates, complex async flows, need DevTools time-travel, or multiple parts of the app need to read/write the same state."

---

## 26. React Query / SWR

Both libraries handle **server state** — data that lives on a server and needs fetching, caching, and synchronisation.

```jsx
// React Query (TanStack Query) — industry standard
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function UserProfile({ id }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', id],   // cache key
    queryFn: () => fetchUser(id),
    staleTime: 5 * 60 * 1000, // 5 min — don't refetch if fresh
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error />;
  return <div>{data.name}</div>;
}

// useMutation + cache invalidation
function EditUser({ id }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (updates) => updateUser(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] }); // refetch
    },
  });

  return <button onClick={() => mutation.mutate({ name: 'Alice' })}>Save</button>;
}
```

**What you get for free:** caching, deduplication, background refetching, stale-while-revalidate, pagination, optimistic updates, error retry.

> "React Query replaces `useEffect` + manual loading/error state for almost all server data fetching."

---

## 27. Code Splitting / Lazy Loading

Split your bundle so users don't download code for routes/components they haven't visited.

```jsx
import React, { lazy, Suspense } from 'react';

// ❌ Static import — all routes bundled together
import Dashboard from './Dashboard';
import Settings from './Settings';

// ✅ Dynamic import — each route is a separate chunk
const Dashboard = lazy(() => import('./Dashboard'));
const Settings  = lazy(() => import('./Settings'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>  {/* required — shows while chunk loads */}
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings"  element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

```jsx
// Lazy-load a heavy component conditionally
const HeavyChart = lazy(() => import('./HeavyChart'));

function Analytics({ show }) {
  return show ? (
    <Suspense fallback={<p>Loading chart...</p>}>
      <HeavyChart />
    </Suspense>
  ) : null;
}
```

> **Interview tip:** Code splitting is one of the most impactful performance optimisations for large React apps. Pair with route-level splitting via React Router.

---

## 28. React.memo

`React.memo` is a **higher-order component** that skips re-rendering a functional component if its props haven't changed (shallow equality).

```jsx
// ❌ Without memo — re-renders whenever Parent re-renders
function ExpensiveChild({ data }) {
  return <HeavyVisualization data={data} />;
}

// ✅ With memo — only re-renders when `data` prop changes
const ExpensiveChild = React.memo(function ExpensiveChild({ data }) {
  return <HeavyVisualization data={data} />;
});

// Custom comparison (if shallow equality isn't enough)
const SmartChild = React.memo(
  function SmartChild({ user }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => prevProps.user.id === nextProps.user.id // return true = skip render
);
```

**The memo + useCallback + useMemo triad:**
```jsx
function Parent() {
  const [count, setCount] = useState(0);
  const data = useMemo(() => computeData(), []);       // stable reference
  const onClick = useCallback(() => doThing(), []);    // stable function

  return <MemoChild data={data} onClick={onClick} />;  // won't re-render
}
const MemoChild = React.memo(({ data, onClick }) => <div onClick={onClick} />);
```

---

## 29. Suspense

`Suspense` lets components **wait for something** (lazy import, data fetch) before rendering, while showing a fallback.

```jsx
// 1. With lazy loading (most common)
const Profile = lazy(() => import('./Profile'));

<Suspense fallback={<Spinner />}>
  <Profile />
</Suspense>

// 2. With data fetching (React 18+, needs Suspense-compatible library)
// React Query, Relay, or `use()` hook support this
function UserList() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Users />  {/* throws a Promise until data is ready */}
    </Suspense>
  );
}

// 3. Nested Suspense boundaries
<Suspense fallback={<PageSkeleton />}>
  <Header />  {/* loads fast */}
  <Suspense fallback={<FeedSkeleton />}>
    <Feed />  {/* loads slow — inner boundary handles it */}
  </Suspense>
</Suspense>
```

---

## 30. Error Boundaries

Error boundaries catch JavaScript errors in their **child component tree** and display a fallback UI instead of crashing the whole app.

```jsx
// Must be a CLASS component (no functional component equivalent yet)
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error }; // update state to show fallback
  }

  componentDidCatch(error, info) {
    // Log to error reporting service (Sentry, etc.)
    logErrorToService(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorPage />}>
  <RiskyComponent />
</ErrorBoundary>
```

**What error boundaries do NOT catch:**
- Errors in event handlers (use try/catch)
- Async errors (`setTimeout`, `fetch`)
- Errors in the error boundary itself

> **Tip:** Libraries like `react-error-boundary` provide a cleaner API and support `useErrorBoundary` hook.

---

## 31. Portals

Portals let you render a child component **outside** its parent's DOM hierarchy while keeping it in the React tree.

```jsx
import { createPortal } from 'react-dom';

function Modal({ children, onClose }) {
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root') // renders here in the DOM
  );
}

// HTML:
// <div id="root"></div>
// <div id="modal-root"></div>  ← modal renders here, above #root

// Usage — events still bubble through React tree (not DOM tree)
function App() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ overflow: 'hidden' }}>  {/* won't clip the modal */}
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      {isOpen && <Modal onClose={() => setIsOpen(false)}>Hello!</Modal>}
    </div>
  );
}
```

**Use cases:** Modals, tooltips, dropdowns, toasts — anything that needs to visually break out of `overflow: hidden` or `z-index` stacking contexts.

---

## 32. forwardRef

`forwardRef` lets a component expose a DOM node or imperative handle to its parent via a ref.

```jsx
import { forwardRef, useRef } from 'react';

// Without forwardRef, you can't pass a ref to a functional component
// ✅ With forwardRef
const FancyInput = forwardRef(function FancyInput(props, ref) {
  return <input ref={ref} className="fancy" {...props} />;
});

function Parent() {
  const inputRef = useRef();

  return (
    <>
      <FancyInput ref={inputRef} placeholder="Type..." />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
    </>
  );
}
```

**Advanced — useImperativeHandle:** expose only a controlled API
```jsx
const VideoPlayer = forwardRef(function VideoPlayer(props, ref) {
  const videoRef = useRef();

  useImperativeHandle(ref, () => ({
    play: () => videoRef.current.play(),
    pause: () => videoRef.current.pause(),
    // Don't expose the raw DOM node — keep it encapsulated
  }));

  return <video ref={videoRef} {...props} />;
});

// Parent can only call .play() and .pause(), not arbitrary DOM methods
```

---

## 33. Render Props

A **render prop** is a prop that is a function — the component calls it to determine what to render. Allows sharing behaviour without HOC.

```jsx
// Mouse tracker with render prop
function MouseTracker({ render }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <div onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}>
      {render(pos)} {/* caller decides what to show */}
    </div>
  );
}

// Usage
<MouseTracker render={({ x, y }) => (
  <p>Mouse is at {x}, {y}</p>
)} />

// The `children` prop is the most ergonomic render prop:
<MouseTracker>
  {({ x, y }) => <p>Mouse is at {x}, {y}</p>}
</MouseTracker>
```

> **Modern note:** Custom hooks have largely replaced render props. The above example would be `const pos = useMousePosition()` today. But render props still appear in libraries (React Query, Formik) and interviews.

---

## 34. HOC Pattern

A **Higher-Order Component (HOC)** is a function that takes a component and returns a new, enhanced component.

```jsx
// HOC that adds loading state
function withLoading(WrappedComponent) {
  return function WithLoading({ isLoading, ...props }) {
    if (isLoading) return <Spinner />;
    return <WrappedComponent {...props} />;
  };
}

// HOC that requires authentication
function withAuth(WrappedComponent) {
  return function WithAuth(props) {
    const { isAuthenticated } = useContext(AuthContext);
    if (!isAuthenticated) return <Navigate to="/login" />;
    return <WrappedComponent {...props} />;
  };
}

const LoadingUserList = withLoading(UserList);
const ProtectedDashboard = withAuth(Dashboard);

// Usage
<LoadingUserList isLoading={loading} users={users} />
```

**HOC conventions:**
- Wrap the display name: `WithLoading.displayName = \`withLoading(\${name})\``
- Pass through all props with `{...props}`
- Don't mutate the original component

> **Modern note:** Custom hooks and composition have largely replaced HOCs, but HOCs still appear in class-component codebases and libraries (React Redux's `connect`).

---

## 35. React Router v6

React Router v6 is the standard for client-side routing in React.

```jsx
import { BrowserRouter, Routes, Route, Link, NavLink, Navigate, Outlet, useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';

// Setup
function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/users"    element={<Users />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*"          element={<Navigate to="/" replace />} /> {/* 404 */}

        {/* Nested routes */}
        <Route path="/settings" element={<SettingsLayout />}>
          <Route index          element={<GeneralSettings />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Access params and navigation
function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  return (
    <div>
      <p>User ID: {id}</p>
      <p>Tab: {searchParams.get('tab')}</p>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate('/users')}>All Users</button>
    </div>
  );
}

// Nested route layout — Outlet renders child route
function SettingsLayout() {
  return (
    <div className="settings">
      <nav>
        <NavLink to="">General</NavLink>
        <NavLink to="profile">Profile</NavLink>
      </nav>
      <Outlet /> {/* child route renders here */}
    </div>
  );
}

// Protected route pattern
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />;
}
```

---

## 36. Accessibility Basics

```jsx
// 1. Semantic HTML — use the right elements
<button onClick={handleClick}>Submit</button>  // ✅
<div onClick={handleClick}>Submit</div>         // ❌ not keyboard accessible

// 2. aria-* attributes for custom interactive elements
<div
  role="button"
  tabIndex={0}
  aria-label="Close modal"
  aria-pressed={isPressed}
  onClick={onClose}
  onKeyDown={e => e.key === 'Enter' && onClose()}
>✕</div>

// 3. Form labels — always associate
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// 4. Images — meaningful alt text
<img src="avatar.jpg" alt="Profile picture of Alice" /> // informative image
<img src="divider.png" alt="" role="presentation" />    // decorative image

// 5. Focus management — trap focus in modals
useEffect(() => {
  if (isOpen) modalRef.current.focus();
}, [isOpen]);

// 6. Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage} {/* screen reader announces changes */}
</div>

// 7. Colour contrast — WCAG AA minimum 4.5:1 for text
// Use tools: axe DevTools, Lighthouse, react-axe
```

---

## 37. Testing — RTL Basics

**React Testing Library (RTL)** tests components the way users interact with them — via the DOM, not implementation details.

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

// Basic render + query
test('renders count of 0', () => {
  render(<Counter />);
  expect(screen.getByText('Count: 0')).toBeInTheDocument();
});

// User interaction
test('increments on click', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  await user.click(screen.getByRole('button', { name: /increment/i }));

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});

// Async — waiting for data to load
test('loads and displays user name', async () => {
  render(<UserProfile id="1" />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});

// Mocking
jest.mock('../api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ name: 'Alice', id: 1 }),
}));
```

**RTL query priority (highest to lowest):**
1. `getByRole` — best, matches accessible role
2. `getByLabelText` — forms
3. `getByPlaceholderText`
4. `getByText` — visible text
5. `getByTestId` — last resort (`data-testid`)

> **Interview tip:** RTL philosophy — "The more your tests resemble the way your software is used, the more confidence they give you."

---

# BUILD PROJECT

---

## 🏗️ GitHub User Search App

> **Goal:** A fully functional GitHub user search app demonstrating hooks, API integration, React Router, and real-world patterns.

### Features
- Search input with debounce (no API call on every keystroke)
- Fetch from GitHub API with loading/error states
- Results list with user avatars and usernames
- User detail view (React Router v6)
- Back navigation

### Project Structure
```
src/
├── hooks/
│   ├── useDebounce.js       ← custom hook
│   └── useFetch.js          ← reusable data fetching
├── components/
│   ├── SearchBar.jsx
│   ├── UserCard.jsx
│   └── Spinner.jsx
├── pages/
│   ├── SearchPage.jsx
│   └── UserDetailPage.jsx
├── App.jsx
└── main.jsx
```

### Step 1 — Custom Hooks

```jsx
// hooks/useDebounce.js
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer); // cleanup clears timer on next keystroke
  }, [value, delay]);

  return debouncedValue;
}
```

```jsx
// hooks/useFetch.js
import { useState, useEffect } from 'react';

export function useFetch(url) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then(data => { if (!cancelled) { setData(data); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });

    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}
```

### Step 2 — Search Page

```jsx
// pages/SearchPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery    = useDebounce(query, 500);
  const navigate          = useNavigate();

  const apiUrl = debouncedQuery
    ? `https://api.github.com/search/users?q=${debouncedQuery}&per_page=10`
    : null;

  const { data, loading, error } = useFetch(apiUrl);

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 16px' }}>
      <h1>GitHub User Search</h1>

      <input
        type="text"
        placeholder="Search GitHub users..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ width: '100%', padding: '10px', fontSize: 16 }}
      />

      {loading && <p>Loading...</p>}
      {error   && <p style={{ color: 'red' }}>Error: {error}</p>}

      {data?.items?.map(user => (
        <div
          key={user.id}
          onClick={() => navigate(`/user/${user.login}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                   cursor: 'pointer', borderBottom: '1px solid #eee' }}
        >
          <img src={user.avatar_url} alt={user.login} width={40} style={{ borderRadius: '50%' }} />
          <span>{user.login}</span>
        </div>
      ))}
    </div>
  );
}
```

### Step 3 — User Detail Page

```jsx
// pages/UserDetailPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';

export function UserDetailPage() {
  const { username } = useParams();
  const navigate     = useNavigate();
  const { data: user, loading, error } = useFetch(
    `https://api.github.com/users/${username}`
  );

  if (loading) return <p>Loading {username}...</p>;
  if (error)   return <p>Error: {error}</p>;
  if (!user)   return null;

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: '0 16px' }}>
      <button onClick={() => navigate(-1)}>← Back</button>
      <img src={user.avatar_url} alt={user.name} width={100} style={{ borderRadius: '50%' }} />
      <h1>{user.name}</h1>
      <p>@{user.login}</p>
      <p>{user.bio}</p>
      <p>📦 Repos: {user.public_repos} | 👥 Followers: {user.followers}</p>
      <a href={user.html_url} target="_blank" rel="noreferrer">View on GitHub</a>
    </div>
  );
}
```

### Step 4 — App.jsx with Routing

```jsx
// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SearchPage }     from './pages/SearchPage';
import { UserDetailPage } from './pages/UserDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<SearchPage />} />
        <Route path="/user/:username" element={<UserDetailPage />} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### What this project demonstrates:

| Concept | Where shown |
|---|---|
| Custom hooks | `useDebounce`, `useFetch` |
| useState | `query` state in SearchPage |
| useEffect | Inside both custom hooks |
| Debouncing | `useDebounce` prevents API spam |
| Loading/error states | `useFetch` returns these |
| Conditional rendering | Loading / error / results |
| Keys in lists | `user.id` as key |
| React Router v6 | `useParams`, `useNavigate`, nested routes |
| Cleanup (no stale data) | `cancelled` flag in `useFetch` |

---

# QUIZ — 25 QUESTIONS

---

**Q1.** What is the virtual DOM and how does reconciliation work?

<details>
<summary>Answer</summary>

The **Virtual DOM** is a lightweight JavaScript object tree that React maintains in memory as a representation of the real DOM.

**Reconciliation** is how React updates the real DOM to match the latest render:
1. On a state/prop change, React creates a new VDOM tree.
2. React **diffs** the new tree against the previous one using the diffing algorithm.
3. The algorithm uses two heuristics:
   - Elements of **different types** → tear down the old tree, mount a new one.
   - Elements of **same type** → update props in place, recurse into children.
4. React computes the **minimum set of DOM operations** needed.
5. Those operations are committed to the real DOM in a single batch.

Keys help the diffing algorithm correctly identify which list items changed, moved, or were added/removed.

</details>

---

**Q2.** Explain `useEffect` with all three dependency array cases.

<details>
<summary>Answer</summary>

```jsx
// Case 1: No dependency array — runs after EVERY render
useEffect(() => {
  console.log('Runs after every render');
});

// Case 2: Empty array — runs ONCE after mount, cleanup on unmount
useEffect(() => {
  const sub = api.subscribe(handler);
  return () => sub.unsubscribe();
}, []);

// Case 3: With dependencies — runs after mount, and after any dep changes
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

**Cleanup function:** the returned function runs:
- Before the next effect fires (if deps changed)
- When the component unmounts

**Common mistake:** missing deps cause stale closures; extra deps cause infinite loops. Use the `eslint-plugin-react-hooks` exhaustive-deps rule.

</details>

---

**Q3.** `useMemo` vs `useCallback` — when to use each?

<details>
<summary>Answer</summary>

- **`useMemo`** memoizes the **return value** of a function.
- **`useCallback`** memoizes the **function itself** (its reference).

```jsx
// useMemo — expensive calculation
const sortedList = useMemo(() => [...items].sort(compare), [items]);

// useCallback — stable function ref for child components
const handleSave = useCallback(() => saveItem(id), [id]);
```

**Use `useMemo` when:**
- You have an expensive computation (filtering/sorting large arrays)
- You need a stable object/array reference as a prop to `React.memo` children or as a `useEffect` dep

**Use `useCallback` when:**
- Passing a callback to a `React.memo`'d child component
- A function is a dependency of `useEffect`

**Don't use either when:** the computation is trivial — memoization has overhead too.

They are equivalent: `useCallback(fn, deps)` is `useMemo(() => fn, deps)`.

</details>

---

**Q4.** What are controlled components?

<details>
<summary>Answer</summary>

A **controlled component** is one whose form data is driven by React state. The input's `value` is set from state, and `onChange` updates that state — React is the single source of truth.

```jsx
function ControlledInput() {
  const [text, setText] = useState('');
  return (
    <input
      value={text}                        // controlled by state
      onChange={e => setText(e.target.value)} // state updated on change
    />
  );
}
```

**Benefits:**
- Real-time validation
- Conditional disabling of submit button
- Easy to transform input (e.g., force uppercase)
- Predictable — React state always matches what's displayed

**Contrast with uncontrolled:** where the DOM holds the value and you read it with a `ref` only when needed (e.g., `ref.current.value`).

</details>

---

**Q5.** How does Context API work? When would you use Redux instead?

<details>
<summary>Answer</summary>

**Context API:**
1. Create a context: `const Ctx = createContext(defaultValue)`
2. Wrap the tree: `<Ctx.Provider value={value}>...</Ctx.Provider>`
3. Consume: `const value = useContext(Ctx)` anywhere in the tree

**Performance:** every consumer re-renders when the context value changes (by reference). Mitigate by splitting contexts or memoizing values.

**Use Context when:**
- Low-frequency global data: theme, locale, auth user, feature flags
- The data doesn't change often
- App is small to medium scale

**Use Redux when:**
- Frequent, complex state updates
- Multiple slices of state with complex inter-dependencies
- Need Redux DevTools (time-travel debugging)
- Need middleware (async thunks, sagas, logging)
- Performance matters at scale (`useSelector` only re-renders on selected slice change)
- Large teams — enforced, predictable patterns

</details>

---

**Q6.** What is a custom hook? Give an example.

<details>
<summary>Answer</summary>

A custom hook is a JavaScript function starting with `use` that calls other React hooks. It extracts and shares stateful logic between components without changing component hierarchy.

```jsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch { return initialValue; }
  });

  const setAndPersist = useCallback((val) => {
    setValue(val);
    localStorage.setItem(key, JSON.stringify(val));
  }, [key]);

  return [value, setAndPersist];
}

// Usage
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  return <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>{theme}</button>;
}
```

Custom hooks are the modern replacement for render props and HOCs when sharing logic.

</details>

---

**Q7.** How do you prevent unnecessary re-renders in React?

<details>
<summary>Answer</summary>

**1. `React.memo`** — skip re-render if props haven't changed (shallow equality):
```jsx
const Child = React.memo(({ data }) => <div>{data}</div>);
```

**2. `useCallback`** — stable function references for callbacks passed as props:
```jsx
const handleClick = useCallback(() => doSomething(id), [id]);
```

**3. `useMemo`** — stable object/array references:
```jsx
const options = useMemo(() => ({ color: 'red' }), []);
```

**4. State structure** — co-locate state close to where it's used, don't lift unnecessarily.

**5. Split contexts** — separate read and write contexts so readers don't re-render when writers change.

**6. `useReducer`** — complex state in one place; consumers use selectors.

**7. Lazy initialisation** — `useState(() => expensiveCompute())` instead of `useState(expensiveCompute())`.

**Rule of thumb:** measure first (React DevTools Profiler), then optimise. Premature memoisation adds complexity and can even hurt performance if deps change frequently.

</details>

---

**Q8.** What are keys in lists and why do they matter?

<details>
<summary>Answer</summary>

Keys are special props that React uses to identify which list items changed, were added, or removed during reconciliation.

**Without keys:** React must re-render the entire list on any change.

**With keys:** React matches old and new items by key, and only re-renders items that actually changed.

```jsx
// ✅ Stable unique ID
items.map(item => <Item key={item.id} {...item} />)

// ❌ Index as key — breaks when list is sorted, filtered, or prepended
items.map((item, i) => <Item key={i} {...item} />)
```

**Why index is wrong:**
If you have `[Alice(0), Bob(1)]` and prepend Carol:
- `Carol(0)` — React sees index 0 changed from Alice to Carol → updates Alice's component with Carol's data
- `Alice(1)` — React sees index 1 changed from Bob to Alice → updates Bob's component with Alice's data

This breaks component state (like controlled input values) and causes performance issues.

Keys must be unique among siblings, stable, and not generated at render time (`Math.random()`).

</details>

---

**Q9.** Explain React Fiber.

<details>
<summary>Answer</summary>

**React Fiber** is the reconciliation engine introduced in React 16 — a complete rewrite of the old Stack reconciler.

**Problem with old reconciler:** reconciliation was synchronous and recursive. A large render would block the main thread, causing dropped frames and janky UI.

**What Fiber adds:**
- **Incremental rendering** — reconciliation work is split into "fiber" units that can be paused, resumed, aborted, or reused.
- **Priority scheduling** — urgent updates (user input) preempt non-urgent ones (data loading).
- Enables **Concurrent Mode**, `useTransition`, `useDeferredValue`, and streaming server rendering.

**Fiber node:** each React element gets a corresponding fiber — a JS object with fields: `type`, `key`, `child`, `sibling`, `return`, `pendingProps`, `memoizedProps`, `effectTag`, `lanes` (priority).

**Two phases:**
1. **Render phase** (interruptible) — walk the fiber tree, compute changes.
2. **Commit phase** (synchronous) — apply DOM mutations, run effects.

</details>

---

**Q10.** Difference between `useEffect` and `useLayoutEffect`.

<details>
<summary>Answer</summary>

```
Render → DOM update → useLayoutEffect → Browser paint → useEffect
```

| | `useEffect` | `useLayoutEffect` |
|---|---|---|
| Fires | After browser paint | After DOM mutation, before paint |
| Async? | Yes | No (synchronous, blocks paint) |
| Use for | Data fetching, subscriptions | DOM measurements, preventing flash |

**Use `useLayoutEffect` when:**
- You need to read DOM layout (e.g., `getBoundingClientRect()`) and update state before the browser paints.
- Without it, you'd see a flicker: old position → paint → correct position.

```jsx
useLayoutEffect(() => {
  const rect = el.current.getBoundingClientRect();
  setPosition({ top: rect.bottom, left: rect.left });
  // Position is set before browser paints → no flicker
}, []);
```

**Default to `useEffect`.** Only reach for `useLayoutEffect` when you observe a visual flicker.

Note: `useLayoutEffect` cannot be used in SSR — it fires synchronously on the client but not on the server. Use `useEffect` or `isMounted` guards for SSR-compatible code.

</details>

---

**Q11.** What is `React.memo`? How does it differ from `useMemo`?

<details>
<summary>Answer</summary>

**`React.memo`** is a HOC that memoizes an entire **component** — it skips re-rendering if props haven't changed (shallow equality by default).

```jsx
const Child = React.memo(function Child({ count }) {
  return <p>{count}</p>;
});
// Only re-renders when `count` prop changes
```

**`useMemo`** memoizes a **computed value** inside a component:
```jsx
const sortedItems = useMemo(() => [...items].sort(), [items]);
```

| | `React.memo` | `useMemo` |
|---|---|---|
| Memoizes | A component | A computed value |
| Usage | Wraps component definition | Inside a component |
| Re-runs when | Props change | Dependencies change |

**Together:** wrap child in `React.memo`, then use `useCallback`/`useMemo` in the parent to stabilise props passed to it.

</details>

---

**Q12.** What is the purpose of `useReducer`? When do you prefer it over `useState`?

<details>
<summary>Answer</summary>

`useReducer` manages state via a **reducer** function: `(state, action) => newState`. It mirrors Redux locally.

```jsx
function reducer(state, action) {
  switch (action.type) {
    case 'fetch_start': return { ...state, loading: true, error: null };
    case 'fetch_success': return { loading: false, error: null, data: action.payload };
    case 'fetch_error': return { loading: false, error: action.payload, data: null };
    default: throw new Error();
  }
}

function UserProfile() {
  const [state, dispatch] = useReducer(reducer, { loading: false, data: null, error: null });
  // ...
}
```

**Prefer `useReducer` over `useState` when:**
- Multiple pieces of state are interrelated (e.g., loading + data + error)
- The next state depends on complex logic applied to the previous state
- State transitions are numerous and well-defined
- You want to test state logic in isolation (pure function)
- You're implementing something like a form, wizard, or state machine

</details>

---

**Q13.** What is `Suspense` and how does it work?

<details>
<summary>Answer</summary>

`Suspense` is a React component that lets you declaratively handle asynchronous rendering. It renders a `fallback` while its children are "suspended" (waiting for something).

**How it works:** A component can "suspend" by throwing a Promise. React catches it, shows the nearest `Suspense` fallback, and waits for the promise to resolve. Then React retries rendering the suspended component.

**Current uses:**
1. **Lazy loading** — `React.lazy(() => import('./Component'))` throws a Promise until the chunk loads.
2. **Data fetching** — React Query / SWR / Relay support Suspense mode; `React.use()` (React 19) works with any Promise.

```jsx
const LazyDash = lazy(() => import('./Dashboard'));

<Suspense fallback={<Skeleton />}>
  <LazyDash />
</Suspense>
```

**Nested boundaries:** each boundary catches suspense from its children independently, allowing different fallbacks at different granularity.

</details>

---

**Q14.** What is an Error Boundary? Can you create one with hooks?

<details>
<summary>Answer</summary>

An **Error Boundary** is a React component that catches JavaScript errors in its child tree, logs them, and displays a fallback UI instead of crashing the whole app.

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };  // triggers fallback render
  }

  componentDidCatch(error, info) {
    logToService(error, info.componentStack);
  }

  render() {
    return this.state.hasError
      ? this.props.fallback
      : this.props.children;
  }
}
```

**Can you create one with hooks?** No — not yet. `getDerivedStateFromError` and `componentDidCatch` are class-only lifecycle methods. There is no hook equivalent as of React 18.

**Workaround:** use the `react-error-boundary` library which provides `<ErrorBoundary>` with a `useErrorBoundary()` hook for imperative error triggering from functional components.

**What Error Boundaries do NOT catch:** errors in event handlers, async errors, SSR errors, or errors in the boundary itself.

</details>

---

**Q15.** Explain how React Router v6 differs from v5.

<details>
<summary>Answer</summary>

Key differences in React Router v6:

| Feature | v5 | v6 |
|---|---|---|
| Route definition | `<Switch>` + exact | `<Routes>` — exact by default |
| Nested routes | Defined in child components | Defined together in parent |
| Redirect | `<Redirect>` | `<Navigate>` |
| `useHistory` | `useHistory()` | `useNavigate()` |
| Route element | `component={Comp}` | `element={<Comp />}` |
| Relative links | Complex | Simple (relative by default) |
| Bundle size | Larger | ~40% smaller |

```jsx
// v5
<Switch>
  <Route exact path="/" component={Home} />
  <Route path="/user/:id" component={User} />
</Switch>

// v6
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/user/:id" element={<User />} />
</Routes>
```

v6 also adds nested routes via `<Outlet>`, the `useSearchParams` hook, and first-class support for relative navigation.

</details>

---

**Q16.** What are portals in React?

<details>
<summary>Answer</summary>

Portals render a React subtree into a different DOM node than the parent:

```jsx
createPortal(children, domNode)
```

**Why:** Components like modals, tooltips, and dropdowns need to escape `overflow: hidden` or `z-index` stacking contexts of their parent. By rendering into `document.body` or a dedicated `#portal-root`, they appear visually on top of everything.

**Key behaviour:** Although the portal renders in a different DOM node, it still behaves as a child in the React tree:
- Events bubble up through the React tree (not the DOM tree)
- Context providers wrapping the portal still provide values inside it
- React lifecycle works normally

```jsx
function Modal({ children }) {
  return createPortal(
    <div className="modal">{children}</div>,
    document.getElementById('modal-root')
  );
}
```

</details>

---

**Q17.** What is `forwardRef` and when do you need it?

<details>
<summary>Answer</summary>

`forwardRef` lets a parent component pass a `ref` through to a DOM element or another component **inside** a functional component.

Without `forwardRef`, if you pass a `ref` to a functional component, React logs a warning and the ref doesn't work — `ref` is not a prop.

```jsx
// ✅ With forwardRef
const Input = forwardRef(function Input(props, ref) {
  return <input ref={ref} {...props} />;
});

function Parent() {
  const ref = useRef();
  return <Input ref={ref} />;
  // ref.current is now the <input> DOM node
}
```

**Use cases:**
- Design system components (Button, Input, Modal) that need to expose their DOM node to parents.
- Combining refs with `useImperativeHandle` to expose a custom imperative API.
- Building accessible components that need focus management from outside.

</details>

---

**Q18.** What are the rules of hooks and why do they exist?

<details>
<summary>Answer</summary>

**Rule 1: Only call hooks at the top level**
Never call hooks inside conditionals, loops, or nested functions.

**Rule 2: Only call hooks from React functions**
Call them from function components or custom hooks — not from plain JS functions, class components, or event handlers.

**Why?** React tracks hooks by their **call order** within a component. On every render, React expects hooks to be called in the exact same order. This is how it associates `useState` call #1 with its state slot #1, call #2 with slot #2, etc.

```jsx
// React internally tracks [slot0, slot1, slot2, ...]
// Call 1 → slot0 = useState(0)
// Call 2 → slot1 = useState('')
// Call 3 → slot2 = useEffect(...)
```

If a hook is inside an `if`, it might be skipped on some renders — the call order shifts, and all subsequent hooks get the wrong state. This is why it errors.

</details>

---

**Q19.** What is `useTransition` and when would you use it?

<details>
<summary>Answer</summary>

`useTransition` marks a state update as **non-urgent**. React can interrupt the transition render to handle urgent updates (like typing).

```jsx
const [isPending, startTransition] = useTransition();

function handleInput(e) {
  setQuery(e.target.value);         // urgent — input stays responsive
  startTransition(() => {
    setFilteredResults(filter(e.target.value)); // non-urgent — can defer
  });
}

{isPending && <Spinner />}
```

**Use cases:**
- Filtering or sorting large lists triggered by typing
- Switching between expensive tabs or views
- Any render that would cause noticeable lag without deferral

**Difference from `useDeferredValue`:**
- `useTransition` — you control the update call
- `useDeferredValue` — you receive a prop/value and want to defer it

</details>

---

**Q20.** How does code splitting work in React?

<details>
<summary>Answer</summary>

Code splitting uses **dynamic imports** to split the JS bundle. Instead of loading all code upfront, each chunk is loaded on demand.

```jsx
// Without code splitting — one big bundle
import Dashboard from './Dashboard';
import Settings from './Settings';
import Reports from './Reports';

// With code splitting — separate chunks per route
const Dashboard = lazy(() => import('./Dashboard'));
const Settings  = lazy(() => import('./Settings'));
const Reports   = lazy(() => import('./Reports'));

// Wrap in Suspense for loading state
<Suspense fallback={<Spinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/settings"  element={<Settings />} />
  </Routes>
</Suspense>
```

**Under the hood:** Webpack/Vite sees `import()` and creates separate chunks. The browser only downloads a chunk when the corresponding route is visited.

**Benefits:** Faster initial load time (less JS parsed and executed), better Core Web Vitals.

**Best practice:** split at route level first. Then split large, rarely used components (e.g., a rich text editor, a chart library).

</details>

---

**Q21.** Explain the concept of "lifting state up" with an example.

<details>
<summary>Answer</summary>

When two or more sibling components need to share the same state, move that state up to their **lowest common ancestor** and pass it down via props.

```jsx
// ❌ Problem — siblings can't share local state
function TemperatureA() {
  const [celsius, setCelsius] = useState(0); // isolated
}
function TemperatureB() {
  // has no way to see TemperatureA's celsius
}

// ✅ Solution — lift state to common parent
function App() {
  const [celsius, setCelsius] = useState(0); // shared state lives here

  return (
    <>
      <CelsiusInput value={celsius} onChange={setCelsius} />
      <FahrenheitDisplay celsius={celsius} />
    </>
  );
}

function CelsiusInput({ value, onChange }) {
  return <input value={value} onChange={e => onChange(+e.target.value)} />;
}

function FahrenheitDisplay({ celsius }) {
  return <p>{celsius * 9/5 + 32}°F</p>;
}
```

**Trade-off:** lifting state can cause more re-renders (the ancestor and all its children re-render). Use `React.memo` on siblings that don't depend on the lifted state.

</details>

---

**Q22.** What is the difference between `null`, `undefined`, and not rendering in React?

<details>
<summary>Answer</summary>

React renders nothing for the following values: `null`, `undefined`, `false`, empty string `''`. This is useful for conditional rendering.

```jsx
// All of these render nothing:
return null;
return undefined;
return false;
return <>{false}</>;
return <>{null}</>;

// Conditional rendering patterns:
return condition ? <Component /> : null;    // ternary
return condition && <Component />;          // short-circuit

// ⚠️ Short-circuit pitfall with numbers!
return count && <p>{count} items</p>;
// If count is 0 → renders "0" (a number, which IS rendered!)
// Fix:
return count > 0 && <p>{count} items</p>;
return !!count && <p>{count} items</p>;
```

**In JSX:** `0` and `NaN` are rendered (they're valid numbers). `false`, `null`, `undefined` are not.

</details>

---

**Q23.** How would you implement a debounce in React?

<details>
<summary>Answer</summary>

```jsx
// Using a custom hook (best approach)
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer); // cleanup cancels pending timer on next keystroke
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery) fetchResults(debouncedQuery);
  }, [debouncedQuery]); // only fires 500ms after user stops typing

  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

**Why useRef-based approach:**
```jsx
// Alternative — debounce the handler function itself
function Search() {
  const timerRef = useRef(null);

  function handleChange(e) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fetchResults(e.target.value);
    }, 500);
  }

  return <input onChange={handleChange} />;
}
```

The custom hook approach is preferred — it's reusable and the debounced value is available as a reactive value you can put in `useEffect` or `useMemo` deps.

</details>

---

**Q24.** What is React Query and why would you use it over `useEffect` for data fetching?

<details>
<summary>Answer</summary>

React Query (TanStack Query) is a server state management library. It handles all the complexity around fetching, caching, synchronising, and updating server data.

**Problems with `useEffect` + `useState` for fetching:**
- Manual loading/error state management
- No caching — same data refetched on every mount
- Race conditions (stale responses overwriting fresh ones)
- No background refetching when window regains focus
- No deduplication of parallel requests
- No retry logic on failure

**What React Query gives you automatically:**
```jsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['user', id],            // cache key
  queryFn: () => fetchUser(id),
  staleTime: 5 * 60 * 1000,         // 5 min before refetch
  retry: 3,                          // retry failed requests
  refetchOnWindowFocus: true,        // auto-sync when tab regains focus
});
```

- **Caching** — same `queryKey` = same cached response across components
- **Deduplication** — one network request even if 10 components query the same key simultaneously
- **Background sync** — stale-while-revalidate pattern
- **Optimistic updates** — update UI before server confirms
- **Pagination, infinite scroll** — built-in patterns

</details>

---

**Q25.** Walk me through how you'd architect a React app for a medium-sized team. What state management and data fetching strategy would you use?

<details>
<summary>Answer</summary>

**Architecture approach:**

**State categories:**
1. **Server state** (data from APIs) → **React Query** / TanStack Query
   - Handles caching, loading/error states, background sync
   - Eliminates 80% of custom `useEffect` data fetching
2. **Global UI state** (theme, auth user, sidebar open) → **Zustand** or **Context API**
   - Zustand: lightweight, no boilerplate, fine-grained subscriptions
   - Context: fine for auth/theme — low update frequency
3. **Local component state** → `useState` / `useReducer`
   - Form state, toggle state, UI interactions — keep it local

**Folder structure:**
```
src/
├── api/           ← API functions (fetchUser, createPost, etc.)
├── hooks/         ← custom hooks (useAuth, useDebounce, usePrevious)
├── store/         ← Zustand stores (ui.store.ts, etc.)
├── components/    ← reusable UI components
├── pages/         ← route-level components
├── utils/         ← pure utility functions
└── types/         ← TypeScript types
```

**Performance defaults:**
- Route-level code splitting with `React.lazy`
- `React.memo` on heavy list items
- `React Query` + `staleTime` to prevent unnecessary refetches

**Testing:**
- Unit: React Testing Library for components, Jest for hooks/utils
- Integration: RTL + MSW (mock service worker) to mock API calls
- E2E: Playwright or Cypress

**Key principle:** keep server state in React Query, UI state local or in Zustand, avoid putting server data in Redux.

</details>

---

## 🎯 Quick Cheat Sheet

```
📌 Virtual DOM = in-memory JS tree; reconciliation = diff + minimal DOM update
📌 React Fiber = incremental, interruptible rendering (enables Concurrent Mode)
📌 Functional components + hooks = modern standard; class components = legacy
📌 Props = read-only input from parent; State = mutable, triggers re-render
📌 Controlled input: value from state + onChange updates state
📌 Keys in lists: must be stable, unique IDs — never use array index

📌 useState(fn) — lazy init; setCount(c => c + 1) — functional update
📌 useEffect deps: [] = once, [x] = on x change, none = every render
📌 useEffect return = cleanup (unsubscribe, clearTimeout, cancel fetch)
📌 useRef — mutable, persists across renders, does NOT cause re-render
📌 useMemo — memoize value; useCallback — memoize function reference
📌 useReducer = local Redux; prefer over useState for complex state logic
📌 Custom hooks — share stateful logic, start with "use", can call other hooks
📌 useLayoutEffect — sync, before paint (DOM measure); useEffect — async, after paint
📌 useTransition — mark update as non-urgent; isPending for loading indicator
📌 useDeferredValue — defer a received value; stale check = value !== deferredValue

📌 React.memo — skip re-render if props unchanged (shallow eq)
📌 Context: low-freq global data (theme/auth); Redux: high-freq, complex flows
📌 React Query = server state (cache + sync); useState = local UI state
📌 React.lazy + Suspense = route-level code splitting → faster initial load
📌 Error Boundary — class only; catches render errors, not async/event handler errors
📌 Portal — render outside parent DOM; events still bubble through React tree
📌 forwardRef — expose DOM node to parent; useImperativeHandle — custom API
📌 React Router v6: Routes > Switch; element={<C/>} > component={C}; useNavigate > useHistory
📌 RTL philosophy: test what the user sees, not implementation details
```

---

*Day 3 done — you now own React. 🔥*

> **Next:** [Day 4 — MongoDB + MySQL: Data Layer](./Day4_MongoDB_MySQL_Guide.md)  
> **Previous:** [Day 2 — Node.js + Express: Backend Foundation](./Day2_NodeJS_Express_Guide.md)
