# 📘 Day 1 — JavaScript: The Full Picture
> **7-Day Full Stack Interview Prep** | Theory AM · Build PM

---

## 📚 Table of Contents

### Core Theory
1. [var vs let vs const](#1-var-vs-let-vs-const)
2. [Hoisting](#2-hoisting)
3. [Temporal Dead Zone (TDZ)](#3-temporal-dead-zone-tdz)
4. [Scope Chain](#4-scope-chain)
5. [Closures](#5-closures)
6. [IIFE](#6-iife-immediately-invoked-function-expression)
7. [this Keyword](#7-this-keyword)
8. [call / apply / bind](#8-call--apply--bind)
9. [Arrow fn vs Regular Function](#9-arrow-function-vs-regular-function)
10. [Prototype Chain](#10-prototype-chain)
11. [OOP in JS](#11-oop-in-javascript)
12. [Classes & Inheritance](#12-classes--inheritance)
13. [Event Loop](#13-event-loop)
14. [Call Stack](#14-call-stack)
15. [Microtask vs Macrotask](#15-microtask-vs-macrotask)
16. [Promises](#16-promises)
17. [async / await](#17-asyncawait)
18. [Error Handling — try/catch/finally](#18-error-handling--trycatchfinally)
19. [Promise.all vs race vs allSettled vs any](#19-promiseall-vs-race-vs-allsettled-vs-any)

### Must-Know Diffs
20. [== vs ===](#20--vs-)
21. [null vs undefined](#21-null-vs-undefined)
22. [Deep vs Shallow Copy](#22-deep-vs-shallow-copy)
23. [Spread vs Rest](#23-spread-vs-rest)
24. [map vs forEach vs filter vs reduce](#24-map-vs-foreach-vs-filter-vs-reduce)
25. [for..in vs for..of](#25-forin-vs-forof)
26. [Synchronous vs Asynchronous](#26-synchronous-vs-asynchronous)
27. [Callbacks vs Promises vs async/await](#27-callbacks-vs-promises-vs-asyncawait)
28. [localStorage vs sessionStorage vs Cookies](#28-localstorage-vs-sessionstorage-vs-cookies)
29. [Debounce vs Throttle](#29-debounce-vs-throttle)

### Advanced / Tricky
30. [Currying](#30-currying)
31. [Memoization](#31-memoization)
32. [Generator Functions](#32-generator-functions)
33. [Iterators](#33-iterators)
34. [WeakMap / WeakSet](#34-weakmap--weakset)
35. [Symbol](#35-symbol)
36. [Proxy / Reflect](#36-proxy--reflect)
37. [Garbage Collection](#37-garbage-collection)
38. [Memory Leaks](#38-memory-leaks)
39. [Event Delegation](#39-event-delegation)
40. [Optional Chaining ?.](#40-optional-chaining-)
41. [Nullish Coalescing ??](#41-nullish-coalescing-)
42. [Tagged Template Literals](#42-tagged-template-literals)
43. [Module System — CJS vs ESM](#43-module-system--cjs-vs-esm)

### [🏗️ Build Project](#build-project)
### [🧪 Quiz — 30 Questions](#quiz--30-questions)

---

# CORE THEORY

---

## 1. var vs let vs const

| Feature | `var` | `let` | `const` |
|---|---|---|---|
| Scope | Function | Block | Block |
| Hoisted | Yes (as `undefined`) | Yes (TDZ) | Yes (TDZ) |
| Re-declare | ✅ | ❌ | ❌ |
| Re-assign | ✅ | ✅ | ❌ |

```js
// var is function-scoped
function example() {
  if (true) {
    var x = 10;    // accessible outside the if block
  }
  console.log(x); // 10 ✅
}

// let is block-scoped
function example2() {
  if (true) {
    let y = 20;
  }
  console.log(y); // ❌ ReferenceError: y is not defined
}

// const — must initialize, cannot reassign
const PI = 3.14;
PI = 3;           // ❌ TypeError: Assignment to constant variable

// BUT — objects/arrays declared with const ARE mutable
const obj = { name: "Alice" };
obj.name = "Bob"; // ✅ — you're mutating the object, not reassigning the reference
obj = {};         // ❌ — reassigning reference is not allowed
```

> **Interview tip:** `const` means the *binding* is constant, not the *value*.

---

## 2. Hoisting

JavaScript moves **declarations** (not initializations) to the top of their scope before execution.

```js
// What you write:
console.log(name); // undefined (not an error!)
var name = "Alice";

// How JS sees it:
var name;           // declaration hoisted
console.log(name);  // undefined
name = "Alice";     // initialization stays in place

// Function declarations are FULLY hoisted:
greet(); // ✅ "Hello!"
function greet() {
  console.log("Hello!");
}

// Function expressions are NOT fully hoisted:
sayHi(); // ❌ TypeError: sayHi is not a function
var sayHi = function() {
  console.log("Hi!");
};
```

---

## 3. Temporal Dead Zone (TDZ)

`let` and `const` ARE hoisted, but they cannot be accessed before their declaration — this window is called the **Temporal Dead Zone**.

```js
console.log(a); // ❌ ReferenceError: Cannot access 'a' before initialization
let a = 5;

// TDZ starts at the beginning of the block and ends at the declaration line
{
  // TDZ for 'b' starts here ↓
  console.log(b); // ❌ ReferenceError
  let b = 10;     // TDZ ends here ↑
  console.log(b); // ✅ 10
}
```

---

## 4. Scope Chain

When JS looks up a variable, it searches the current scope first, then moves to the outer scope, all the way to the global scope. This chain is called the **scope chain**.

```js
const globalVar = "I'm global";

function outer() {
  const outerVar = "I'm outer";

  function inner() {
    const innerVar = "I'm inner";
    console.log(innerVar);  // ✅ found in inner scope
    console.log(outerVar);  // ✅ found in outer scope (scope chain)
    console.log(globalVar); // ✅ found in global scope (scope chain)
  }

  inner();
}

outer();
```

> **Lexical Scoping:** A function's scope is determined by where it is *defined*, not where it is *called*.

---

## 5. Closures

A **closure** is a function that **remembers** the variables from its outer scope even after the outer function has returned.

```js
function makeCounter() {
  let count = 0;           // count is enclosed in the returned function
  return function() {
    count++;
    return count;
  };
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
// makeCounter() has returned, but count is still alive via closure!

// Real-world use case — private data / factory functions
function createUser(name) {
  let _id = Math.random(); // private, cannot be accessed directly
  return {
    getName: () => name,
    getId: () => _id,
  };
}

const user = createUser("Alice");
console.log(user.getName()); // "Alice"
console.log(user._id);       // undefined — truly private!
```

---

## 6. IIFE (Immediately Invoked Function Expression)

A function that is **defined and called immediately**. Used to create an isolated scope.

```js
// Syntax: (function definition)(call)
(function() {
  const secret = "I am private";
  console.log(secret); // "I am private"
})();

console.log(secret); // ❌ ReferenceError

// Arrow function IIFE
(() => {
  console.log("Arrow IIFE!");
})();

// Real use case — avoid polluting global scope (before ES modules)
(function($) {
  // $ is jQuery, safely scoped here
})(jQuery);
```

---

## 7. `this` Keyword

`this` refers to the **execution context** — *who* called the function.

```js
// 1. Global context
console.log(this); // window (browser) / {} (strict mode Node)

// 2. Object method — this = the object
const person = {
  name: "Alice",
  greet() {
    console.log(this.name); // "Alice"
  }
};
person.greet();

// 3. Regular function — this = caller or global
function show() {
  console.log(this); // global object (or undefined in strict mode)
}

// 4. Arrow function — this = inherited from enclosing scope (lexical this)
const obj = {
  name: "Bob",
  greet: () => {
    console.log(this.name); // undefined! arrow fn doesn't have its own 'this'
  },
  greetCorrect() {
    const arrow = () => console.log(this.name); // "Bob" — inherits from greetCorrect
    arrow();
  }
};

// 5. Constructor — this = new instance
function Dog(name) {
  this.name = name;
}
const d = new Dog("Rex");
console.log(d.name); // "Rex"
```

---

## 8. call / apply / bind

All three let you **manually set `this`** for a function.

```js
function introduce(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const alice = { name: "Alice" };
const bob   = { name: "Bob"   };

// call — invoke immediately, args passed individually
introduce.call(alice, "Hello", "!"); // "Hello, I'm Alice!"
introduce.call(bob,   "Hi",   ".");  // "Hi, I'm Bob."

// apply — invoke immediately, args passed as ARRAY
introduce.apply(alice, ["Hey", "?"]); // "Hey, I'm Alice?"

// bind — returns a NEW function with 'this' bound, doesn't invoke
const aliceGreet = introduce.bind(alice, "Howdy");
aliceGreet("~"); // "Howdy, I'm Alice~"

// Practical use case — borrowing methods
const arrayLike = { 0: "a", 1: "b", length: 2 };
const arr = Array.prototype.slice.call(arrayLike); // ["a", "b"]
```

> **Mnemonic:** **C**all = **C**omma-separated, **A**pply = **A**rray, **B**ind = **B**orrowed later

---

## 9. Arrow Function vs Regular Function

| Feature | Regular Function | Arrow Function |
|---|---|---|
| `this` binding | Dynamic (caller) | Lexical (enclosing scope) |
| `arguments` object | ✅ Has it | ❌ Does not |
| Can be constructor | ✅ | ❌ |
| `prototype` property | ✅ | ❌ |
| Implicit return | ❌ | ✅ (single expression) |

```js
// this difference
const timer = {
  seconds: 0,
  start() {
    // Regular — 'this' inside setInterval would be window/global
    setInterval(function() {
      this.seconds++; // ❌ 'this' is not timer
    }, 1000);

    // Arrow — inherits 'this' from start()
    setInterval(() => {
      this.seconds++; // ✅ 'this' IS timer
    }, 1000);
  }
};

// arguments object
function regular() {
  console.log(arguments); // [1, 2, 3]
}
const arrow = () => {
  console.log(arguments); // ❌ ReferenceError (use rest params instead)
};
regular(1, 2, 3);
```

---

## 10. Prototype Chain

Every JS object has an internal `[[Prototype]]` link. When you access a property, JS walks this chain until it finds it or hits `null`.

```js
const animal = {
  breathe() { return "breathing..."; }
};

const dog = Object.create(animal); // dog's prototype = animal
dog.bark = function() { return "Woof!"; };

console.log(dog.bark());    // "Woof!" — found on dog
console.log(dog.breathe()); // "breathing..." — found on dog's prototype (animal)
console.log(dog.hasOwnProperty("bark"));    // true
console.log(dog.hasOwnProperty("breathe")); // false — inherited

// Chain: dog → animal → Object.prototype → null
console.log(Object.getPrototypeOf(dog) === animal); // true
```

---

## 11. OOP in JavaScript

JS uses **prototypal inheritance**, not classical. We can simulate OOP using constructor functions or classes.

```js
// Constructor function style
function Person(name, age) {
  this.name = name;
  this.age  = age;
}
Person.prototype.greet = function() {
  return `Hi, I'm ${this.name}`;
};

const alice = new Person("Alice", 25);
console.log(alice.greet()); // "Hi, I'm Alice"

// What 'new' does internally:
// 1. Creates a new empty object {}
// 2. Sets its [[Prototype]] to Person.prototype
// 3. Runs the constructor with 'this' = the new object
// 4. Returns the new object (unless constructor explicitly returns an object)
```

---

## 12. Classes & Inheritance

ES6 `class` is **syntactic sugar** over prototypal inheritance.

```js
class Animal {
  #sound; // private field (ES2022)

  constructor(name, sound) {
    this.name  = name;
    this.#sound = sound;
  }

  speak() {
    return `${this.name} says ${this.#sound}`;
  }

  static create(name, sound) { // static method — called on class, not instance
    return new Animal(name, sound);
  }
}

class Dog extends Animal {
  constructor(name) {
    super(name, "Woof"); // MUST call super() before using 'this'
    this.tricks = [];
  }

  learn(trick) {
    this.tricks.push(trick);
    return this;       // enables method chaining
  }

  speak() {
    return super.speak() + "!"; // call parent method
  }
}

const rex = new Dog("Rex");
rex.learn("sit").learn("shake");
console.log(rex.speak());  // "Rex says Woof!"
console.log(rex.tricks);   // ["sit", "shake"]
```

---

## 13. Event Loop

JavaScript is **single-threaded** but handles async operations via the Event Loop.

```
┌────────────────────────┐
│      Call Stack        │  ← executes synchronous code
└───────────┬────────────┘
            │ (stack empty?)
┌───────────▼────────────┐
│    Microtask Queue     │  ← Promises, queueMicrotask, MutationObserver
│   (drained FIRST)      │
└───────────┬────────────┘
            │ (microtask queue empty?)
┌───────────▼────────────┐
│    Macrotask Queue     │  ← setTimeout, setInterval, I/O, UI events
│  (one task per cycle)  │
└────────────────────────┘
```

```js
console.log("1 — sync");

setTimeout(() => console.log("2 — macrotask"), 0);

Promise.resolve().then(() => console.log("3 — microtask"));

console.log("4 — sync");

// Output order:
// 1 — sync
// 4 — sync
// 3 — microtask    ← microtasks run before macrotasks
// 2 — macrotask
```

---

## 14. Call Stack

The **call stack** is a LIFO (Last In, First Out) data structure that tracks function execution.

```js
function c() { console.log("c"); }
function b() { c(); }
function a() { b(); }

a();
// Stack frames:
// a() pushed → b() pushed → c() pushed
// c() returns → b() returns → a() returns
// Stack is empty again

// Stack overflow example:
function infinite() { return infinite(); }
infinite(); // ❌ RangeError: Maximum call stack size exceeded
```

---

## 15. Microtask vs Macrotask

| | Microtask | Macrotask |
|---|---|---|
| **Examples** | `Promise.then`, `queueMicrotask`, `MutationObserver` | `setTimeout`, `setInterval`, `setImmediate`, I/O |
| **When runs** | After current task, before next macrotask | One per event loop cycle |
| **Priority** | **Higher** — drains completely | Lower — one at a time |

```js
setTimeout(() => console.log("macro 1"), 0);
setTimeout(() => console.log("macro 2"), 0);

Promise.resolve()
  .then(() => console.log("micro 1"))
  .then(() => console.log("micro 2"));

// Output:
// micro 1
// micro 2
// macro 1
// macro 2
// All microtasks drain before ANY macrotask runs
```

---

## 16. Promises

A **Promise** represents a value that will be available now, in the future, or never.

```js
// States: pending → fulfilled | rejected

const fetchUser = (id) => new Promise((resolve, reject) => {
  if (id > 0) {
    resolve({ id, name: "Alice" }); // success
  } else {
    reject(new Error("Invalid ID")); // failure
  }
});

// Chaining
fetchUser(1)
  .then(user => {
    console.log(user.name); // "Alice"
    return user.id * 10;    // value passed to next .then
  })
  .then(result => console.log(result)) // 10
  .catch(err => console.error(err.message))
  .finally(() => console.log("always runs"));

// Creating resolved/rejected promises
Promise.resolve(42).then(v => console.log(v)); // 42
Promise.reject("error").catch(e => console.log(e)); // "error"
```

---

## 17. async/await

`async/await` is **syntactic sugar** over Promises. Makes async code look synchronous.

```js
// Every async function returns a Promise
async function getUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`); // waits here
    if (!response.ok) throw new Error("Not found");
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error:", err.message);
    throw err; // re-throw if needed
  }
}

// Sequential vs Parallel
async function sequential() {
  const a = await fetchA(); // waits for A to finish
  const b = await fetchB(); // then waits for B
  // Total time = time(A) + time(B)
}

async function parallel() {
  const [a, b] = await Promise.all([fetchA(), fetchB()]); // both start together
  // Total time = max(time(A), time(B))
}
```

---

## 18. Error Handling — try/catch/finally

```js
function riskyOp(val) {
  if (val < 0) throw new RangeError("Must be positive");
  return val * 2;
}

try {
  const result = riskyOp(-1);
  console.log(result); // never runs if above throws
} catch (err) {
  console.error(err.name);    // "RangeError"
  console.error(err.message); // "Must be positive"
} finally {
  console.log("Cleanup always runs"); // runs regardless of throw/return
}

// Custom error classes
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name  = "ValidationError";
    this.field = field;
  }
}

try {
  throw new ValidationError("Too short", "username");
} catch (err) {
  if (err instanceof ValidationError) {
    console.log(`Field "${err.field}": ${err.message}`);
  }
}
```

---

## 19. Promise.all vs race vs allSettled vs any

| Method | Resolves when | Rejects when |
|---|---|---|
| `Promise.all` | ALL resolve | ANY rejects |
| `Promise.race` | FIRST settles (resolve or reject) | FIRST settles (if it rejects) |
| `Promise.allSettled` | ALL settle (never rejects) | Never |
| `Promise.any` | FIRST resolves | ALL reject |

```js
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.reject("error");

// all — fails fast
Promise.all([p1, p2])
  .then(([a, b]) => console.log(a, b)); // 1 2
Promise.all([p1, p3])
  .catch(e => console.log(e)); // "error" — p3 rejected

// allSettled — wait for all, get status of each
Promise.allSettled([p1, p3])
  .then(results => console.log(results));
// [{status:"fulfilled", value:1}, {status:"rejected", reason:"error"}]

// any — first success wins
Promise.any([p3, p1, p2])
  .then(v => console.log(v)); // 1 — p1 is first to resolve

// race — first to settle wins
Promise.race([
  new Promise(r => setTimeout(() => r("slow"), 2000)),
  new Promise(r => setTimeout(() => r("fast"), 100))
]).then(v => console.log(v)); // "fast"
```

---

# MUST-KNOW DIFFS

---

## 20. == vs ===

```js
// == (loose equality) — performs TYPE COERCION
0  == false  // true  (false → 0)
"" == false  // true
1  == "1"    // true  (string "1" → number 1)
null == undefined // true (special rule)
null == 0    // false (null only == undefined)

// === (strict equality) — NO coercion, checks type AND value
0   === false // false (different types)
1   === "1"   // false
null === undefined // false

// Always use === in interviews unless you have a specific reason for ==
```

---

## 21. null vs undefined

```js
let a;           // undefined — declared but not assigned
let b = null;    // null — explicitly set to "no value"

console.log(typeof undefined); // "undefined"
console.log(typeof null);      // "object" ← famous JS bug!

// null is intentional absence; undefined is accidental absence
function findUser(id) {
  if (id) return { id, name: "Alice" };
  return null; // intentionally returning "not found"
}
```

---

## 22. Deep vs Shallow Copy

```js
const original = { name: "Alice", address: { city: "Delhi" } };

// Shallow copy — only top level is copied, nested objects are SHARED
const shallow = { ...original };
shallow.name = "Bob";           // ✅ original unchanged
shallow.address.city = "Mumbai"; // ❌ original.address.city ALSO changes!

// Deep copy methods:
// 1. JSON trick (loses functions, undefined, Date, etc.)
const deep1 = JSON.parse(JSON.stringify(original));

// 2. structuredClone (modern, recommended)
const deep2 = structuredClone(original);
deep2.address.city = "Chennai";
console.log(original.address.city); // "Delhi" — truly independent!

// 3. Recursive custom function (interview answer)
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  const copy = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      copy[key] = deepClone(obj[key]);
    }
  }
  return copy;
}
```

---

## 23. Spread vs Rest

```js
// Spread (...) — EXPANDS an iterable into individual elements
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]

const obj1 = { a: 1 };
const obj2 = { ...obj1, b: 2 }; // { a: 1, b: 2 }

Math.max(...arr1); // same as Math.max(1, 2, 3)

// Rest (...) — COLLECTS multiple arguments into an array
function sum(...numbers) { // numbers = [1, 2, 3, 4]
  return numbers.reduce((acc, n) => acc + n, 0);
}
sum(1, 2, 3, 4); // 10

// Destructuring with rest
const [first, ...rest] = [10, 20, 30, 40];
console.log(first); // 10
console.log(rest);  // [20, 30, 40]
```

---

## 24. map vs forEach vs filter vs reduce

```js
const nums = [1, 2, 3, 4, 5];

// map — transforms each element, RETURNS new array
const doubled = nums.map(n => n * 2); // [2, 4, 6, 8, 10]

// forEach — iterates for side effects, returns undefined
nums.forEach(n => console.log(n)); // no return value

// filter — returns new array with elements matching predicate
const evens = nums.filter(n => n % 2 === 0); // [2, 4]

// reduce — accumulates to a single value
const sum    = nums.reduce((acc, n) => acc + n, 0);  // 15
const product= nums.reduce((acc, n) => acc * n, 1);  // 120

// Chain them together!
const result = [1, 2, 3, 4, 5, 6]
  .filter(n => n % 2 === 0) // [2, 4, 6]
  .map(n => n * n)           // [4, 16, 36]
  .reduce((a, b) => a + b, 0); // 56
```

---

## 25. for..in vs for..of

```js
// for..in — iterates over KEYS (enumerable properties)
const obj = { a: 1, b: 2, c: 3 };
for (let key in obj) {
  console.log(key, obj[key]); // "a" 1, "b" 2, "c" 3
}
// ⚠️ Also iterates inherited properties — use hasOwnProperty check!

// for..of — iterates over VALUES of iterables (arrays, strings, sets, maps)
const arr = [10, 20, 30];
for (let val of arr) {
  console.log(val); // 10, 20, 30
}

for (let char of "hello") {
  console.log(char); // h, e, l, l, o
}

// for..of with Map
const map = new Map([["a", 1], ["b", 2]]);
for (let [key, val] of map) {
  console.log(key, val);
}
```

---

## 26. Synchronous vs Asynchronous

```js
// Synchronous — code runs line by line, blocks execution
console.log("start");
const result = heavyComputation(); // blocks thread!
console.log("end"); // only after heavyComputation finishes

// Asynchronous — non-blocking, uses callback/promise/event
console.log("start");
fetch("/api/data") // starts the request, doesn't wait
  .then(r => r.json())
  .then(data => console.log(data)); // runs later
console.log("end"); // runs BEFORE the fetch completes
// Output: "start" → "end" → (data from fetch)
```

---

## 27. Callbacks vs Promises vs async/await

```js
// Callback style — leads to "callback hell"
getUser(1, function(user) {
  getPosts(user.id, function(posts) {
    getComments(posts[0].id, function(comments) {
      // deeply nested — hard to read, hard to handle errors
    });
  });
});

// Promise style — flat chaining
getUser(1)
  .then(user => getPosts(user.id))
  .then(posts => getComments(posts[0].id))
  .then(comments => console.log(comments))
  .catch(err => console.error(err)); // single error handler

// async/await style — reads like sync code
async function loadData() {
  const user     = await getUser(1);
  const posts    = await getPosts(user.id);
  const comments = await getComments(posts[0].id);
  return comments; // automatically wrapped in Promise
}
```

---

## 28. localStorage vs sessionStorage vs Cookies

| Feature | localStorage | sessionStorage | Cookies |
|---|---|---|---|
| Capacity | ~5MB | ~5MB | ~4KB |
| Expires | Never (manual) | Tab closed | Configurable |
| Sent to server | ❌ | ❌ | ✅ (every request) |
| Access | JS only | JS only | JS + Server |
| Scope | Origin | Tab+Origin | Domain |

```js
// localStorage
localStorage.setItem("token", "abc123");
localStorage.getItem("token"); // "abc123"
localStorage.removeItem("token");
localStorage.clear();

// sessionStorage — same API, but cleared when tab closes
sessionStorage.setItem("formData", JSON.stringify({ name: "Alice" }));

// Cookies
document.cookie = "user=Alice; expires=Fri, 31 Dec 2026 12:00:00 UTC; path=/";
// HttpOnly cookies (set by server) can't be accessed via JS — more secure
```

---

## 29. Debounce vs Throttle

Both are techniques to limit how often a function runs.

```js
// DEBOUNCE — wait until the user STOPS doing something, then fire ONCE
// Use case: search-as-you-type, resize handler
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);           // reset the timer on every call
    timer = setTimeout(() => {
      fn.apply(this, args);        // only fires after 'delay' ms of silence
    }, delay);
  };
}

const searchInput = document.getElementById("search");
searchInput.addEventListener("input", debounce((e) => {
  fetchResults(e.target.value); // called only when user pauses typing
}, 300));

// THROTTLE — fire at most ONCE per interval, no matter how many calls
// Use case: scroll handler, mousemove, button spam prevention
function throttle(fn, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

window.addEventListener("scroll", throttle(() => {
  checkScrollPosition(); // called at most once every 200ms
}, 200));
```

> **Key diff:** Debounce fires **after** silence. Throttle fires at a **regular rate**.

---

# ADVANCED / TRICKY

---

## 30. Currying

Transforming a function that takes multiple arguments into a series of functions, each taking **one argument at a time**.

```js
// Normal function
const add = (a, b, c) => a + b + c;
add(1, 2, 3); // 6

// Curried version
const curriedAdd = a => b => c => a + b + c;
curriedAdd(1)(2)(3); // 6

// Practical use — partial application
const multiply = a => b => a * b;
const double   = multiply(2); // a=2 is fixed
const triple   = multiply(3);
double(5); // 10
triple(5); // 15

// Generic curry utility
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}
```

---

## 31. Memoization

Caching the results of expensive function calls. If same inputs → return cached result.

```js
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log("Cache hit!");
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Expensive function
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const memoFib = memoize(fibonacci);
memoFib(40); // slow first time
memoFib(40); // instant — cache hit!
```

---

## 32. Generator Functions

Functions that can **pause** and **resume** execution, yielding values one at a time.

```js
function* counter(start = 0) {
  while (true) {
    yield start++;  // pauses here each time, remembers state
  }
}

const gen = counter(1);
console.log(gen.next().value); // 1
console.log(gen.next().value); // 2
console.log(gen.next().value); // 3

// Finite generator
function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}

for (let num of range(0, 10, 2)) {
  console.log(num); // 0, 2, 4, 6, 8
}
```

---

## 33. Iterators

An **iterator** is any object with a `next()` method that returns `{ value, done }`.

```js
function makeRangeIterator(start, end) {
  let current = start;
  return {
    next() {
      if (current < end) {
        return { value: current++, done: false };
      }
      return { value: undefined, done: true };
    },
    [Symbol.iterator]() { return this; } // make it iterable too
  };
}

const iter = makeRangeIterator(1, 4);
console.log(iter.next()); // { value: 1, done: false }
console.log(iter.next()); // { value: 2, done: false }
console.log(iter.next()); // { value: 3, done: false }
console.log(iter.next()); // { value: undefined, done: true }
```

---

## 34. WeakMap / WeakSet

Like Map/Set but keys must be **objects** and are held **weakly** — allowing garbage collection.

```js
// WeakMap — use for private data / metadata on objects without preventing GC
const privateData = new WeakMap();

function createPerson(name) {
  const obj = {};
  privateData.set(obj, { name, secret: Math.random() });
  return obj;
}

const p = createPerson("Alice");
console.log(privateData.get(p).name); // "Alice"
// When 'p' is garbage collected, the WeakMap entry is automatically removed

// WeakSet — track if an object has been processed
const processed = new WeakSet();
function process(obj) {
  if (processed.has(obj)) return "already done";
  processed.add(obj);
  return "processed";
}
```

---

## 35. Symbol

A **unique, immutable primitive** used as object keys to avoid collisions.

```js
const id1 = Symbol("id");
const id2 = Symbol("id");
console.log(id1 === id2); // false — every Symbol is unique!

// Use as object key — won't clash with string keys
const user = {
  name: "Alice",
  [id1]: 123        // symbol key
};
console.log(user[id1]); // 123
console.log(Object.keys(user)); // ["name"] — symbols not enumerated!

// Well-known symbols — customize object behavior
class MyArray {
  [Symbol.iterator]() { // makes the object iterable with for..of
    let i = 0;
    const data = [1, 2, 3];
    return {
      next: () => i < data.length
        ? { value: data[i++], done: false }
        : { value: undefined, done: true }
    };
  }
}
```

---

## 36. Proxy / Reflect

**Proxy** wraps an object and intercepts operations on it. **Reflect** provides default behavior.

```js
const handler = {
  get(target, prop) {
    console.log(`Getting: ${prop}`);
    return prop in target ? target[prop] : `Property '${prop}' not found`;
  },
  set(target, prop, value) {
    if (typeof value !== "number") throw new TypeError("Only numbers allowed!");
    target[prop] = value;
    return true; // must return true
  }
};

const scores = new Proxy({}, handler);
scores.math = 95;  // set intercepted
scores.math;       // "Getting: math" → 95
scores.science;    // "Getting: science" → "Property 'science' not found"
scores.name = "x"; // ❌ TypeError: Only numbers allowed!

// Use cases: validation, logging, reactive systems (Vue 3 uses Proxy!)
```

---

## 37. Garbage Collection

JS uses **mark-and-sweep** algorithm. Objects not reachable from the root (global) are eligible for GC.

```js
let user = { name: "Alice" }; // object is reachable
user = null;                   // reference removed → object eligible for GC

// Circular references used to cause issues, but modern GC handles them
function leaky() {
  let a = {};
  let b = {};
  a.ref = b;
  b.ref = a;
  // Both go out of scope → both collected by mark-and-sweep
}
```

---

## 38. Memory Leaks

Common causes of memory leaks in JavaScript:

```js
// 1. Global variables — never collected
function badCode() {
  leakedVar = "I'm global!"; // forgot 'let/const' — attaches to window
}

// 2. Forgotten event listeners
const btn = document.getElementById("btn");
function handleClick() { /* ... */ }
btn.addEventListener("click", handleClick);
// Fix: removeEventListener when component unmounts

// 3. Closures holding references
function outer() {
  const bigArray = new Array(1000000).fill("data");
  return function inner() {
    return bigArray[0]; // bigArray can't be GC'd as long as inner exists
  };
}

// 4. Forgotten timers
const id = setInterval(() => { /* references outer scope */ }, 1000);
// Fix: clearInterval(id) when no longer needed

// 5. Detached DOM nodes
let div = document.createElement("div");
document.body.appendChild(div);
document.body.removeChild(div);
// div is removed from DOM but JS still holds a reference to it!
div = null; // fix: nullify the reference
```

---

## 39. Event Delegation

Instead of adding listeners to each child element, add **one listener to a parent** and use `event.target` to identify the source.

```js
// ❌ Bad — separate listener for each item
document.querySelectorAll(".item").forEach(item => {
  item.addEventListener("click", handleClick); // 100 items = 100 listeners!
});

// ✅ Good — one listener on parent (event delegation)
document.getElementById("list").addEventListener("click", function(e) {
  if (e.target.classList.contains("item")) {
    handleClick(e.target);
  }
});

// Benefits:
// - Works for dynamically added elements
// - Better memory performance
// - Simpler code
```

---

## 40. Optional Chaining `?.`

Safely access deeply nested properties without throwing if intermediate values are `null`/`undefined`.

```js
const user = {
  profile: {
    address: null
  }
};

// Without optional chaining — dangerous
const city = user.profile.address.city; // ❌ TypeError!

// With optional chaining
const city = user?.profile?.address?.city; // undefined (no error)

// Works with methods and array indexes
user?.getProfile?.();         // calls only if method exists
users?.[0]?.name;             // safe array access
```

---

## 41. Nullish Coalescing `??`

Returns the **right side** only when the left side is `null` or `undefined` (not for 0, "", false).

```js
// || returns right side for ANY falsy value
0     || "default" // "default" ← 0 is falsy
""    || "default" // "default" ← "" is falsy
false || "default" // "default"
null  || "default" // "default"

// ?? returns right side ONLY for null/undefined
0     ?? "default" // 0 ← 0 is NOT null/undefined!
""    ?? "default" // ""
false ?? "default" // false
null  ?? "default" // "default"
undefined ?? "default" // "default"

// Practical — user settings with 0 as valid value
const timeout = userSettings.timeout ?? 3000; // 0 is valid here!
const volume  = userSettings.volume  ?? 50;   // 0 volume is valid!
```

---

## 42. Tagged Template Literals

Functions that process template literals with full control over substitutions.

```js
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] !== undefined
      ? `<strong>${values[i]}</strong>`
      : "";
    return result + str + value;
  }, "");
}

const name  = "Alice";
const score = 95;
const output = highlight`Hello ${name}, your score is ${score}!`;
// "Hello <strong>Alice</strong>, your score is <strong>95</strong>!"

// Real-world — SQL injection prevention, i18n, styled-components
const query = sql`SELECT * FROM users WHERE id = ${userId}`; // safe!
```

---

## 43. Module System — CJS vs ESM

| Feature | CommonJS (CJS) | ES Modules (ESM) |
|---|---|---|
| Syntax | `require()` / `module.exports` | `import` / `export` |
| Loading | Synchronous, runtime | Asynchronous, parse-time |
| Scope | `this = module.exports` | Strict mode by default |
| Tree shaking | ❌ Harder | ✅ Static analysis |
| Used in | Node.js (older) | Browsers, modern Node |
| File ext | `.js` / `.cjs` | `.mjs` or `"type":"module"` |

```js
// CJS
const fs = require("fs");
module.exports = { myFunction };
exports.myFunction = myFunction; // shorthand

// ESM
import fs from "fs";
import { readFile } from "fs";      // named import
import * as fsAll from "fs";        // namespace import

export const PI = 3.14;            // named export
export default function main() {}  // default export
export { PI, main };               // re-export

// Dynamic import (works in both) — code splitting
const module = await import("./heavy-module.js");
```

---

# 🏗️ Build Project

**Todo List with Local Storage** — Pure HTML+CSS+JS, no frameworks.

Features to implement:
- ✅ Add / Delete / Edit todos
- ✅ Filter todos (All / Active / Completed)
- ✅ Persist data with `localStorage`
- ✅ Clear all completed
- ✅ Item count display

**What it demonstrates:**
- DOM manipulation
- Event handling (with delegation)
- `localStorage` read/write
- Array `filter`, `map`, `reduce`
- Closures in event handlers
- Debounce on input

**Tip for interviews:** Be ready to explain every line — how you chose event delegation over individual listeners, why localStorage, how you structured state.

---

# 🧪 Quiz — 30 Questions

> Test yourself! Try answering each before revealing the answer.

---

### Section A — Core Theory

**Q1.** What is the output?
```js
console.log(typeof null);
```
<details>
<summary>Answer</summary>

`"object"` — This is a historical JavaScript bug. `null` is a primitive, but `typeof null` returns `"object"`. This was a mistake in the original JS implementation and was never fixed to maintain backward compatibility.

</details>

---

**Q2.** What is the output?
```js
var x = 1;
function foo() {
  console.log(x);
  var x = 2;
  console.log(x);
}
foo();
```
<details>
<summary>Answer</summary>

```
undefined
2
```
Inside `foo`, `var x` is hoisted to the top of the function scope as `undefined`. The outer `x` is **shadowed** by the local one.

</details>

---

**Q3.** What does the Temporal Dead Zone mean for `let` and `const`?

<details>
<summary>Answer</summary>

`let` and `const` declarations are hoisted to the top of their block but are **not initialized** until the declaration is reached. Accessing them before the declaration throws a `ReferenceError`. The period between the start of the block and the declaration is called the Temporal Dead Zone (TDZ).

</details>

---

**Q4.** What is the output?
```js
function outer() {
  let count = 0;
  return () => ++count;
}
const inc = outer();
console.log(inc()); // ?
console.log(inc()); // ?
console.log(inc()); // ?
```
<details>
<summary>Answer</summary>

```
1
2
3
```
Classic closure — the arrow function closes over `count` from `outer`'s scope. `count` persists across calls because the closure holds a reference to the variable, not a copy.

</details>

---

**Q5.** Explain the difference between `call`, `apply`, and `bind`.

<details>
<summary>Answer</summary>

All three explicitly set `this`:
- **`call(thisArg, arg1, arg2)`** — invokes immediately, args passed individually
- **`apply(thisArg, [arg1, arg2])`** — invokes immediately, args passed as array
- **`bind(thisArg, arg1)`** — returns a **new function** with `this` bound (does NOT invoke immediately)

Mnemonic: **C**omma, **A**rray, **B**ound-later

</details>

---

**Q6.** What is the output?
```js
const obj = {
  value: 42,
  getValue: function() { return this.value; },
  getValueArrow: () => this.value
};
console.log(obj.getValue());       // ?
console.log(obj.getValueArrow());  // ?
```
<details>
<summary>Answer</summary>

```
42
undefined
```
`getValue` is a regular function — `this` = `obj`. `getValueArrow` is an arrow function — `this` is lexically inherited from the enclosing scope (module/global level), not `obj`. `this.value` is `undefined` there.

</details>

---

**Q7.** What is the output?
```js
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
```
<details>
<summary>Answer</summary>

```
A
D
C
B
```
Synchronous code runs first (A, D). Then the microtask queue is drained (Promise → C). Then the macrotask queue (setTimeout → B).

</details>

---

**Q8.** How does `new` work internally in JavaScript?

<details>
<summary>Answer</summary>

When you call `new Foo()`:
1. A new empty object `{}` is created
2. Its `[[Prototype]]` is set to `Foo.prototype`
3. The constructor `Foo` is called with `this` = the new object
4. If the constructor returns a non-primitive object, that is returned; otherwise, the new object is returned

</details>

---

**Q9.** What is the output?
```js
Promise.all([
  Promise.resolve(1),
  Promise.reject("error"),
  Promise.resolve(3)
]).then(console.log).catch(console.error);
```
<details>
<summary>Answer</summary>

`"error"` — `Promise.all` rejects immediately when any promise rejects. The rejection reason is `"error"` from the second promise. Promises 1 and 3 are ignored.

</details>

---

**Q10.** What is the difference between `Promise.allSettled` and `Promise.all`?

<details>
<summary>Answer</summary>

- **`Promise.all`**: Resolves when ALL resolve; **rejects immediately** if ANY rejects (fail-fast). Returns array of values.
- **`Promise.allSettled`**: Waits for ALL to settle (never rejects itself). Returns array of `{status: "fulfilled", value}` or `{status: "rejected", reason}` objects. Use when you want results of ALL operations regardless of failures.

</details>

---

### Section B — Must-Know Diffs

**Q11.** What is the output?
```js
console.log(0 == false);   // ?
console.log(0 === false);  // ?
console.log("" == false);  // ?
console.log(null == undefined); // ?
console.log(null === undefined); // ?
```
<details>
<summary>Answer</summary>

```
true   (0 coerced to false)
false  (different types)
true   ("" coerced to 0, false to 0)
true   (special case in == spec)
false  (different types)
```

</details>

---

**Q12.** What is the difference between a shallow copy and a deep copy? When would you use `structuredClone`?

<details>
<summary>Answer</summary>

- **Shallow copy**: Only the top-level properties are copied. Nested objects/arrays are **shared** by reference. Methods: `Object.assign`, spread `{...obj}`.
- **Deep copy**: All levels are copied recursively. Nested objects are independent. Use `structuredClone()` (modern JS), `JSON.parse(JSON.stringify())` (has limitations), or a recursive function.

Use `structuredClone` when you need a complete independent copy and the object may contain nested references.

</details>

---

**Q13.** Implement a `debounce` function from scratch.

<details>
<summary>Answer</summary>

```js
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
```
The returned function resets the timer on every call. The original function only executes after `delay` ms of inactivity.

</details>

---

**Q14.** What is the difference between `map` and `forEach`?

<details>
<summary>Answer</summary>

- **`map`**: Returns a **new array** with transformed values. Doesn't mutate original. Use when you want to transform data.
- **`forEach`**: Returns **`undefined`**. Used purely for **side effects** (logging, DOM updates, etc.). Cannot be chained.

```js
const arr = [1, 2, 3];
const doubled = arr.map(n => n * 2); // [2, 4, 6]
arr.forEach(n => console.log(n));    // undefined returned
```

</details>

---

**Q15.** What does this `reduce` do?
```js
const data = ["a", "b", "a", "c", "b", "a"];
const result = data.reduce((acc, val) => {
  acc[val] = (acc[val] || 0) + 1;
  return acc;
}, {});
```
<details>
<summary>Answer</summary>

It counts the frequency of each element:
```js
{ a: 3, b: 2, c: 1 }
```
`reduce` is used here to build a frequency map (object) from an array.

</details>

---

### Section C — Advanced

**Q16.** What is currying? Give a real use case.

<details>
<summary>Answer</summary>

Currying transforms `f(a, b, c)` into `f(a)(b)(c)`. Each call takes one argument and returns a function waiting for the next.

**Real use case — partial application:**
```js
const multiply = a => b => a * b;
const double = multiply(2); // pre-filled with a=2
const triple = multiply(3);
[1, 2, 3].map(double); // [2, 4, 6]
```
Common in functional programming, logging utilities, event handlers.

</details>

---

**Q17.** What is memoization? Implement it.

<details>
<summary>Answer</summary>

Memoization caches the result of a function for given inputs. If the same inputs are passed again, the cached result is returned without re-computing.

```js
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
```

</details>

---

**Q18.** What is a Generator function? What does `yield` do?

<details>
<summary>Answer</summary>

A generator function (`function*`) can **pause** execution and **resume** it later. `yield` pauses the function and sends a value out. `.next()` resumes execution until the next `yield`.

```js
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}
const g = gen();
g.next(); // { value: 1, done: false }
g.next(); // { value: 2, done: false }
g.next(); // { value: 3, done: false }
g.next(); // { value: undefined, done: true }
```
Use cases: infinite sequences, lazy evaluation, async control flow.

</details>

---

**Q19.** Why would you use `WeakMap` instead of `Map`?

<details>
<summary>Answer</summary>

`WeakMap` holds its keys **weakly** — if there are no other references to the key object, it can be **garbage collected**, and the entry is automatically removed. This prevents memory leaks.

Use `WeakMap` when:
- Storing **private data** associated with objects
- Caching **computed results** per object instance
- Adding **metadata** to objects you don't own

`Map` keeps strong references — the object cannot be GC'd as long as it's a key in the Map.

</details>

---

**Q20.** What is event delegation and why is it useful?

<details>
<summary>Answer</summary>

Event delegation adds a **single event listener** to a **parent** element instead of individual listeners on each child. It relies on **event bubbling** — events bubble up from target to parent.

**Benefits:**
1. **Memory efficient** — one listener vs hundreds
2. **Works for dynamic elements** — future children automatically handled
3. **Simpler code** — less setup/teardown

```js
document.getElementById("list").addEventListener("click", (e) => {
  if (e.target.matches(".item")) {
    handleItem(e.target);
  }
});
```

</details>

---

**Q21.** What is the difference between `?.` and `??`?

<details>
<summary>Answer</summary>

- **Optional chaining `?.`**: Safely access nested properties. Returns `undefined` if any part of the chain is `null`/`undefined` (instead of throwing).
  ```js
  user?.profile?.email // undefined if user or profile is null
  ```

- **Nullish coalescing `??`**: Provides a fallback value **only** for `null` or `undefined` (not for `0`, `""`, `false`).
  ```js
  userVolume ?? 50 // 50 only if userVolume is null/undefined; 0 is valid!
  ```

They work great together: `user?.settings?.volume ?? 100`

</details>

---

**Q22.** What is the difference between CommonJS (`require`) and ES Modules (`import`)?

<details>
<summary>Answer</summary>

| | CJS | ESM |
|---|---|---|
| Syntax | `require()` / `module.exports` | `import` / `export` |
| Loading | Synchronous | Asynchronous |
| When resolved | Runtime | Parse time (static) |
| Tree shaking | Hard | ✅ Easy |
| `this` at top level | `module.exports` | `undefined` |
| Default in | Node.js (old) | Browsers, modern Node |

ESM's static nature enables **tree shaking** (removing unused exports) and better tooling.

</details>

---

### Section D — Tricky Outputs

**Q23.** What is the output?
```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```
<details>
<summary>Answer</summary>

```
3
3
3
```
`var` is function-scoped. By the time the timeouts run, the loop has finished and `i = 3`. Fix with `let` (block-scoped, new binding per iteration) or a closure: `setTimeout(((j) => () => console.log(j))(i), 0)`.

</details>

---

**Q24.** What is the output?
```js
const a = [1, 2, 3];
const b = a;
b.push(4);
console.log(a); // ?
console.log(a === b); // ?
```
<details>
<summary>Answer</summary>

```
[1, 2, 3, 4]
true
```
`b = a` copies the **reference**, not the value. Both `a` and `b` point to the same array. Modifying `b` modifies `a`. `a === b` is `true` because they're the same reference.

</details>

---

**Q25.** What is the output?
```js
async function main() {
  console.log("A");
  await Promise.resolve();
  console.log("B");
}
console.log("C");
main();
console.log("D");
```
<details>
<summary>Answer</summary>

```
C
A
D
B
```
`main()` starts synchronously, logs "A". `await` pauses `main` and puts the rest in the microtask queue. "C" runs first (before main is called), then "A" inside main, then "D" (sync after main call), then "B" (from microtask queue).

</details>

---

**Q26.** Explain what happens step by step:
```js
function* makeId() {
  let id = 1;
  while (true) {
    yield id++;
  }
}
const gen = makeId();
console.log(gen.next().value); // ?
console.log(gen.next().value); // ?
```
<details>
<summary>Answer</summary>

```
1
2
```
The generator starts at `id = 1`. First `next()` runs until `yield id++` — yields `1` (post-increment: yields current value then increments). Second `next()` resumes, `id` is now `2`, yields `2`. The `while(true)` creates an **infinite** sequence that only advances when `.next()` is called.

</details>

---

**Q27.** What is the output?
```js
console.log(1 + "2" + "2");
console.log(1 + +"2" + "2");
console.log(+"1" + "1" + "2");
console.log("A" - "B" + "2");
console.log("A" - "B" + 2);
```
<details>
<summary>Answer</summary>

```
"122"   // 1+"2"="12", "12"+"2"="122"
"32"    // +"2"=2, 1+2=3, 3+"2"="32"
"112"   // +"1"=1, 1+"1"="11", "11"+"2"="112"
"NaN2"  // "A"-"B"=NaN, NaN+"2"="NaN2"
NaN     // "A"-"B"=NaN, NaN+2=NaN
```
`+` with a string = concatenation. Unary `+` converts to number. `-` always converts to numbers.

</details>

---

**Q28.** What are the 4 ways to lose `this` context and how do you fix each?

<details>
<summary>Answer</summary>

1. **Callback functions:**
   ```js
   // Lost: setTimeout(this.method, 100)
   // Fix: setTimeout(this.method.bind(this), 100)
   // Fix: setTimeout(() => this.method(), 100)
   ```
2. **Destructuring methods:**
   ```js
   // Lost: const { method } = obj; method();
   // Fix: const method = obj.method.bind(obj);
   ```
3. **Event handlers:**
   ```js
   // Lost: btn.addEventListener("click", this.handler)
   // Fix: btn.addEventListener("click", this.handler.bind(this))
   ```
4. **Passing methods as callbacks:**
   ```js
   // Lost: [1,2,3].forEach(this.process)
   // Fix: [1,2,3].forEach(x => this.process(x))
   ```

</details>

---

**Q29.** Implement a simple `Promise` from scratch (conceptually).

<details>
<summary>Answer</summary>

```js
class MyPromise {
  constructor(executor) {
    this.state    = "pending";
    this.value    = undefined;
    this.handlers = [];

    const resolve = (value) => {
      if (this.state !== "pending") return;
      this.state = "fulfilled";
      this.value = value;
      this.handlers.forEach(h => h(value));
    };

    const reject = (reason) => {
      if (this.state !== "pending") return;
      this.state = "rejected";
      this.value = reason;
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFulfilled) {
    if (this.state === "fulfilled") {
      onFulfilled(this.value);
    } else {
      this.handlers.push(onFulfilled);
    }
    return this;
  }
}
```
This is a simplified version — full implementation includes async execution, chaining, and rejection handling.

</details>

---

**Q30.** Final Boss — What is the output?
```js
const obj = {
  a: 1,
  b: function() { return this.a; },
  c: () => this.a,
  d: {
    a: 2,
    e: function() { return this.a; }
  }
};

console.log(obj.b());   // ?
console.log(obj.c());   // ?
console.log(obj.d.e()); // ?

const { b } = obj;
console.log(b());       // ?
```
<details>
<summary>Answer</summary>

```
1       // b() called on obj, this.a = obj.a = 1
undefined // c() is arrow, this = global/module scope, no 'a' there
2       // e() called on obj.d, this = obj.d, obj.d.a = 2
undefined // b extracted, called without context, this = global (no 'a')
```

</details>

---

## 🎯 Quick Interview Cheat Sheet

```
📌 var = function scoped, hoisted as undefined
📌 let/const = block scoped, TDZ
📌 Closure = inner fn remembers outer scope variables
📌 this = who called the function (arrow = lexical)
📌 Event loop: sync → microtasks (Promises) → macrotasks (setTimeout)
📌 Promise.all = fail fast | allSettled = wait all | any = first win | race = first settle
📌 == coerces type | === does not
📌 Debounce = delay after stop | Throttle = rate limit
📌 Spread = expand | Rest = collect
📌 Shallow copy shares nested refs | Deep copy is fully independent
📌 WeakMap = GC-friendly | Map = strong reference
📌 ?. = safe access | ?? = null/undefined fallback only
📌 CJS = synchronous require | ESM = static import + tree-shakeable
```

---

*Good luck! You've got this! 💪*

> **Next:** [Day 2 — Node.js + Express: Backend Foundation](./Day2_NodeJS_Express_Guide.md)
