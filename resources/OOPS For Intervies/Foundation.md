# OOP Foundations & Classes — Elite Interview Revision Sheet
> Not a textbook. A **survival guide** for OOP interview follow-ups.

---
---
# 🧠 SECTION 1: THINKING FIRST
---
## What paradigm question is this?
```
Read the question. Ask:
1. "What is OOP?"                       → 4 pillars, procedural vs OOP comparison
2. "Explain class vs object"            → Memory model, blueprint analogy
3. "Access specifiers?"                 → public/private/protected + inheritance table
4. "Constructor question?"              → Default/Copy/Move/Parameterized/Initializer List
5. "Destructor question?"               → Virtual destructor, order of destruction
6. "this pointer?"                      → Chaining, self-reference
7. "Static members?"                    → Shared state, no this, singleton
8. "const correctness?"                 → const objects, const methods, mutable
9. "Friend?"                            → Not inherited, not commutative, not transitive
10. "Encapsulation vs Abstraction?"     → Hiding DATA vs hiding IMPLEMENTATION
11. "struct vs class?"                  → Default access, POD, when to use which
12. "RAII?"                             → Resource tied to object lifetime
13. "Rule of Zero/Three/Five?"          → Resource management strategy
14. "Smart pointers?"                   → unique_ptr, shared_ptr, weak_ptr
```

---

## Why OOP over Procedural? (1-Minute Interview Answer) `[Every company]`

```
PROCEDURAL (C style):
  - Functions operate on data
  - Data is exposed, anyone can modify
  - Code duplication across related functions
  - Hard to maintain at scale (10K+ lines)

OOP (C++ style):
  - Data + Functions bundled together (encapsulation)
  - Access control (private/protected)
  - Code reuse via inheritance
  - Runtime flexibility via polymorphism
  - Maps to real-world entities

INTERVIEW ONE-LINER:
  "OOP bundles data with behavior, enforces access control,
   enables code reuse via inheritance, and provides runtime
   flexibility via polymorphism — making large codebases
   maintainable and extensible."
```

---

## The Four Pillars (Quick Reference)

| Pillar | One-Liner | C++ Mechanism |
|--------|-----------|---------------|
| **Encapsulation** | Bundle data + methods, hide internals | `private` members + public getters/setters |
| **Abstraction** | Show WHAT, hide HOW | Abstract classes, pure virtual functions |
| **Inheritance** | Reuse + extend existing classes | `class Derived : public Base` |
| **Polymorphism** | Same interface, different behavior | Virtual functions, overloading |

---
---

# 🔗 SECTION 2: CORE CONCEPTS
---

## 🔗 2.1 — Class vs Object `[Every company]`

**Class** = Blueprint/Template. No memory allocated.
**Object** = Instance of a class. Memory allocated on stack or heap.

```cpp
class Car {
    string brand;   // data member
    int speed;
public:
    void accelerate() { speed += 10; }  // member function
};

// Objects — memory allocated here
Car myCar;              // Stack allocation
Car* heapCar = new Car; // Heap allocation (you manage memory)
delete heapCar;         // Must free manually
```

### 📦 Memory Layout — Class Object
```
Stack Object (Car myCar):
┌──────────────────────┐
│  brand (std::string) │  ← 32 bytes (typical implementation)
│  speed (int)         │  ← 4 bytes
│  [padding]           │  ← 4 bytes (alignment to 8-byte boundary)
└──────────────────────┘
sizeof(Car) ≈ 40 bytes

Heap Object (new Car):
  Stack: pointer variable   → 8 bytes (on 64-bit)
  Heap:  actual Car data    → same layout as above

⚠️ sizeof(Car) does NOT include heap data inside string.
   It only counts string's internal pointer + metadata.
```

### 🌳 Interviewer Follow-Up Tree
```
Class vs Object
├── What's the difference?
├── Where is an object stored — stack or heap?
├── What does sizeof(ClassName) return?
├── Does sizeof include dynamically allocated data?
├── Can you have a class with no objects?           → Yes (abstract class)
└── Can you have an object without a class?         → No (in C++)
```

---

## 🔗 2.2 — Access Modifiers `[Amazon, Microsoft, Adobe, Samsung]`

| Modifier | Within Class | Derived Class | Outside |
|----------|:----------:|:------------:|:-------:|
| `public` | ✅ | ✅ | ✅ |
| `protected` | ✅ | ✅ | ❌ |
| `private` | ✅ | ❌ | ❌ |

```cpp
class Account {
private:
    double balance;        // Only this class can touch

protected:
    string accountType;    // This class + children

public:
    string ownerName;      // Everyone can access
    
    double getBalance() { return balance; }  // Controlled access
};

class SavingsAccount : public Account {
    void show() {
        // cout << balance;       ❌ private in parent
        cout << accountType;   // ✅ protected = accessible in derived
        cout << ownerName;     // ✅ public
    }
};
```

### Access with Different Inheritance Types `[Adobe, Samsung]`

| Base Member → | `public` inheritance | `protected` inheritance | `private` inheritance |
|---------------|:-------------------:|:----------------------:|:--------------------:|
| `public` | stays `public` | becomes `protected` | becomes `private` |
| `protected` | stays `protected` | stays `protected` | becomes `private` |
| `private` | **NOT accessible** | **NOT accessible** | **NOT accessible** |

> **Key Insight:** Private members are NEVER accessible in derived class, regardless of inheritance type. But they still EXIST in the derived object's memory — they take up space.

### 📦 Memory Layout — Access Modifiers Don't Affect Layout
```
class Base { private: int x; protected: int y; public: int z; };

Object memory layout:
┌──────┐
│  x   │  4 bytes  ← exists in memory, just can't ACCESS from outside
│  y   │  4 bytes
│  z   │  4 bytes
└──────┘
sizeof(Base) = 12

Access modifiers = COMPILE-TIME restriction only.
They don't change memory layout or size.
```

---

## 🔗 2.3 — Constructors (DEEP DIVE)

### 2.3.1 — Default Constructor `[Every company]`

```cpp
class Widget {
    int x;
public:
    // Compiler generates default constructor ONLY IF
    // you don't define ANY constructor yourself
};

Widget w;  // Compiler-generated default ctor called
           // x is UNINITIALIZED (garbage value for built-in types)
```

**When does compiler generate a default constructor?**
```
Compiler generates default ctor when:
  1. You define NO constructors at all
  2. You explicitly say: Widget() = default;

Compiler does NOT generate when:
  1. You define ANY other constructor (parameterized, copy, etc.)
  2. You explicitly say: Widget() = delete;

⚠️ TRAP: If you define Widget(int x), then Widget w; will NOT compile
         unless you also define Widget() or Widget() = default;
```

---

### 2.3.2 — Parameterized Constructor

```cpp
class Point {
    int x, y;
public:
    Point(int x, int y) : x(x), y(y) {}  // Initializer list (preferred)
    
    // Alternative (less efficient for non-trivial types):
    // Point(int a, int b) { x = a; y = b; }  // Assignment, not initialization
};

Point p(3, 4);         // Direct initialization
Point p2 = {3, 4};     // C++11 brace initialization
Point p3{3, 4};        // C++11 uniform initialization
```

---

### 2.3.3 — Copy Constructor (⭐ VERY IMPORTANT) `[Amazon, Microsoft, Goldman Sachs, Adobe]`

**Signature:** `ClassName(const ClassName& other)`

```cpp
class MyString {
    char* data;
    int len;
public:
    MyString(const char* s) {
        len = strlen(s);
        data = new char[len + 1];
        strcpy(data, s);
    }
    
    // ===== SHALLOW COPY (DEFAULT — DANGEROUS) =====
    // Compiler-generated copy ctor does this:
    // MyString(const MyString& other) : data(other.data), len(other.len) {}
    // Both objects point to SAME memory → double free → CRASH
    
    // ===== DEEP COPY (YOU MUST WRITE) =====
    MyString(const MyString& other) {
        len = other.len;
        data = new char[len + 1];       // Allocate NEW memory
        strcpy(data, other.data);        // Copy contents
    }
    
    ~MyString() { delete[] data; }
};
```

### 📦 Shallow vs Deep Copy — Memory Visual
```
SHALLOW COPY (default):
  obj1.data ──→ ┌─────────┐ ←── obj2.data
                │ "Hello"  │
                └─────────┘
  PROBLEM: delete obj1 → obj2.data = dangling pointer → CRASH

DEEP COPY (manual):
  obj1.data ──→ ┌─────────┐
                │ "Hello"  │
                └─────────┘
  obj2.data ──→ ┌─────────┐
                │ "Hello"  │  (separate memory, separate lifecycle)
                └─────────┘
  SAFE: Each object manages its own memory
```

**When is Copy Constructor called?**
```
1. MyString b = a;              // Copy initialization
2. MyString b(a);               // Direct copy
3. func(MyString obj)           // Pass by value
4. return obj;                  // Return by value (may be elided by RVO)
```

### 🌳 Interviewer Follow-Up Tree — Copy Constructor
```
Copy Constructor
├── What is shallow copy vs deep copy?
├── When does default copy fail?              → Raw pointers, file handles
├── What's the signature?                     → const ClassName&
├── When is it called?                        → Init, pass-by-value, return
├── What's the Rule of Three?                 → dtor + copy ctor + copy assign
├── What's the Rule of Five?                  → Rule of Three + move ctor + move assign
├── What's the Rule of Zero?                  → Use RAII types, write nothing
└── What about copy elision / RVO?            → Compiler skips copy entirely
```

---

### 2.3.4 — Move Constructor (C++11) `[Google, Microsoft, Goldman Sachs, DE Shaw]`

**Signature:** `ClassName(ClassName&& other) noexcept`

```cpp
class MyString {
    char* data;
    int len;
public:
    // Move Constructor — STEAL resources instead of copying
    MyString(MyString&& other) noexcept 
        : data(other.data), len(other.len) {
        other.data = nullptr;  // Leave source in valid but empty state
        other.len = 0;
    }
    
    // Move Assignment Operator
    MyString& operator=(MyString&& other) noexcept {
        if (this != &other) {
            delete[] data;          // Free existing resource
            data = other.data;      // Steal
            len = other.len;
            other.data = nullptr;   // Nullify source
            other.len = 0;
        }
        return *this;
    }
};

MyString createString() {
    MyString temp("Hello");
    return temp;                    // Move constructor called (or RVO)
}

MyString s = createString();        // Efficient — no deep copy
MyString s2 = std::move(s);         // Explicit move — s is now empty
```

### 📦 Copy vs Move — Performance
```
Copy: O(n) — allocate new memory + copy all data byte by byte
Move: O(1) — just swap 2 pointers + 1 int

Copy:                           Move:
┌─────────┐   copy    ┌─────────┐   ┌─────────┐  steal  ┌─────────┐
│ "Hello"  │  ───→    │ "Hello"  │   │ "Hello"  │  ───→  │ nullptr │
└─────────┘  O(n)     └─────────┘   └─────────┘  O(1)   └─────────┘
 new memory allocated              same memory, just pointer swap
```

> **Key:** `std::move()` does NOT move. It CASTS an lvalue to rvalue reference, *enabling* the move constructor to be called. The actual moving (resource transfer) happens in YOUR move constructor.

---

### 2.3.5 — Constructor Initializer List `[Google, Microsoft, Amazon]`

```cpp
class Engine {
    const int horsepower;   // Must be initialized in init list
    int& refVar;            // References must be initialized in init list
    string name;
public:
    // ✅ CORRECT — Initializer List
    Engine(int hp, int& r, string n) 
        : horsepower(hp), refVar(r), name(n) {}
    
    // ❌ WRONG — Can't assign to const or reference in body
    // Engine(int hp, int& r, string n) {
    //     horsepower = hp;  // ERROR: const
    //     refVar = r;       // ERROR: reference
    // }
};
```

**MUST use initializer list when:**
```
1. const members           → Can't assign after creation
2. Reference members       → Must bind at creation
3. Base class constructors → Must call before derived body
4. Members without default ctor → No default to call first
```

**⚠️ TRAP: Order of Initialization** `[Google, Arcesium, Goldman Sachs]`
```cpp
class Gotcha {
    int a;  // Declared FIRST → initialized FIRST
    int b;  // Declared SECOND → initialized SECOND
public:
    // ⚠️ Even though b appears first in init list, a is initialized first
    // a(b) uses b which is NOT yet initialized → a = garbage!
    Gotcha(int x) : b(x), a(b) {}  // BUG: a = garbage (b not yet initialized)
};
```

> **Rule:** Members are initialized in **declaration order**, NOT initializer list order. The compiler will warn about this (`-Wreorder`).

---

### 2.3.6 — Delegating Constructors (C++11)

```cpp
class Player {
    string name;
    int health;
    int level;
public:
    // Primary constructor
    Player(string n, int h, int l) : name(n), health(h), level(l) {}
    
    // Delegating to primary
    Player(string n) : Player(n, 100, 1) {}   // Default health & level
    Player() : Player("Unknown") {}             // Chain delegation
};
```

> **Rule:** You cannot have BOTH delegation AND other initializers. `Player() : Player("X"), health(50) {}` is ILLEGAL.

---

### 2.3.7 — `explicit` Keyword `[Goldman Sachs, DE Shaw, Arcesium, Adobe]`

```cpp
class Fraction {
    int num, den;
public:
    Fraction(int n, int d = 1) : num(n), den(d) {}
};

Fraction f = 5;      // ✅ Implicit conversion: 5 → Fraction(5, 1)
// This is usually UNINTENDED and dangerous

class SafeFraction {
    int num, den;
public:
    explicit SafeFraction(int n, int d = 1) : num(n), den(d) {}
};

// SafeFraction sf = 5;    ❌ Compile error — no implicit conversion
SafeFraction sf(5);         // ✅ Direct initialization OK
SafeFraction sf2{5};        // ✅ Brace initialization OK
```

**Interview one-liner:** "`explicit` prevents the compiler from using a constructor for implicit type conversions. Use it on single-argument constructors to avoid surprise conversions."

---

### 2.3.8 — Can Constructor Be Virtual? ❌ `[Google, Microsoft, Adobe]`

```
NO. Here's why (3-second answer):

1. Virtual dispatch needs vtable → vtable is set up BY the constructor
2. During construction, the object doesn't exist yet → no vtable to look up
3. Constructor MUST know the exact type → contradicts virtual's "decide at runtime"

WORKAROUND — Clone pattern (Prototype):
```

```cpp
class Shape {
public:
    virtual ~Shape() {}
    virtual Shape* clone() const = 0;   // "Virtual constructor" (copy)
};

class Circle : public Shape {
public:
    Circle* clone() const override { return new Circle(*this); }
};

Shape* original = new Circle();
Shape* copy = original->clone();    // Creates Circle without knowing type
```

---

## 🔗 2.4 — Destructor `[Amazon, Microsoft, Adobe, Samsung]`

### When is destructor called?
```
1. Stack object goes out of scope     → automatic
2. delete is called on heap object    → manual
3. Program ends                       → static/global objects
4. Exception unwinds stack            → automatic for stack objects
```

### Order of Destruction
```
For inheritance: REVERSE of construction order
Construction: Base → Derived
Destruction:  Derived → Base

For members: REVERSE of declaration order
```

```cpp
class Base {
public:
    Base()  { cout << "Base ctor\n"; }
    ~Base() { cout << "Base dtor\n"; }
};

class Derived : public Base {
public:
    Derived()  { cout << "Derived ctor\n"; }
    ~Derived() { cout << "Derived dtor\n"; }
};

// Output for: { Derived d; }
// Base ctor
// Derived ctor
// Derived dtor    ← Reverse order
// Base dtor
```

---

### Virtual Destructor (⭐ CRITICAL) `[Amazon, Microsoft, Adobe, Goldman Sachs, Samsung]`

```cpp
class Base {
public:
    ~Base() { cout << "Base dtor\n"; }  // NON-virtual — DANGEROUS
};

class Derived : public Base {
    int* data;
public:
    Derived() : data(new int[1000]) {}
    ~Derived() { delete[] data; cout << "Derived dtor\n"; }
};

Base* ptr = new Derived();
delete ptr;    // ⚠️ ONLY calls ~Base() → Derived::data LEAKED!

// Output:
// Base dtor       ← Derived dtor NEVER called → 4000 bytes LEAKED
```

**FIX:** Make base destructor virtual:
```cpp
class Base {
public:
    virtual ~Base() { cout << "Base dtor\n"; }  // ✅ Virtual
};

// Now: delete ptr → calls ~Derived() THEN ~Base() ✅
```

### 📦 Memory Layout — Why Virtual Destructor Works
```
Without virtual dtor:
  delete basePtr → compiler calls ~Base() directly (compile-time binding)
  → ~Derived() SKIPPED → data leaked

With virtual dtor:
  Base class gets vtable:
  ┌────────────────┐
  │ vptr ──────────┼──→ vtable: [~Derived()]  ← overridden
  │ int* data      │
  └────────────────┘
  
  delete basePtr → follows vptr → vtable → calls ~Derived() → then ~Base()
  sizeof increased by: 8 bytes (vptr)
```

### 🌳 Interviewer Follow-Up Tree — Virtual Destructor
```
Virtual Destructor
├── Why is it needed?                    → Correct cleanup through base pointer
├── What if missing?                     → Memory leak (undefined behavior)
├── Show the memory leak scenario?       → delete basePtr without virtual dtor
├── Why must it be virtual specifically? → Destructor call goes through vtable
├── Can destructor be pure virtual?      → Yes, but must still provide body
├── What if class already has virtual function? → Destructor should be virtual too
├── Performance cost?                    → 8 bytes (vptr) per object
└── Rule of thumb?                       → Any virtual function → virtual dtor
```

> **Rule of thumb:** If a class has ANY virtual function, its destructor MUST be virtual.

> **Pure virtual destructor:** `virtual ~Base() = 0;` — legal, makes class abstract, but you MUST provide a body because destructors are always called up the chain. Use when you want an abstract class but have no other pure virtual method.

---

## 🔗 2.5 — `this` Pointer `[Amazon, Flipkart, Oracle]`

**What:** Implicit pointer to the current object. Available in all non-static member functions.
**Type:** `ClassName* const this` (const pointer to non-const object, or `const ClassName* const this` in const methods)

```cpp
class Counter {
    int count;
public:
    Counter(int count) : count(count) {}
    
    // this-> disambiguates member from parameter
    void setCount(int count) { this->count = count; }
    
    // Method chaining with return *this
    Counter& increment() { count++; return *this; }
    Counter& decrement() { count--; return *this; }
    
    void show() { cout << count; }
};

Counter c(0);
c.increment().increment().decrement().show();  // Output: 1
// Chaining works because each method returns reference to same object
```

### `this` in Constructor
```cpp
class Node {
    int data;
    Node* next;
public:
    Node(int d) : data(d), next(nullptr) {
        // 'this' IS available in constructor
        // But the object isn't fully constructed if in base class
        cout << "Created node at: " << this << endl;
    }
};
```

> **`delete this`:** Legal but extremely dangerous. Must be heap-allocated. No member access after. Mention only if interviewer explicitly asks. Real use: reference-counted objects (COM, some smart pointer implementations).

---

## 🔗 2.6 — Static Members `[Samsung, Qualcomm, Oracle]`

### Static Data Members
```cpp
class Student {
    string name;
    static int totalStudents;  // Shared across ALL objects
public:
    Student(string n) : name(n) { totalStudents++; }
    ~Student() { totalStudents--; }
    
    static int getTotal() { return totalStudents; }
};

// MUST define outside class (exactly once, usually in .cpp)
int Student::totalStudents = 0;

Student s1("Alice"), s2("Bob");
cout << Student::getTotal();  // 2 — called on class, not object
```

### 📦 Memory Layout — Static Members
```
Regular members (per-object):
  Student s1: ┌──────┐   Student s2: ┌──────┐
              │ name │               │ name │
              └──────┘               └──────┘
              Each has own copy. On stack/heap.

Static members (per-class):
  ┌──────────────────┐
  │ totalStudents = 2 │  ← ONE copy. In data segment. Shared.
  └──────────────────┘

sizeof(Student) does NOT include static members.
```

### Static Member Functions
```
Key properties:
1. No 'this' pointer → can't access non-static members
2. Can only access static members and other static functions
3. Can be called without creating an object: ClassName::func()
4. Cannot be virtual (no object = no vtable lookup)
5. Cannot be const (const applies to 'this', but static has no 'this')
```

### Static vs Global
```
Global variable:
  - Accessible everywhere (no namespace control)
  - Pollutes global namespace
  - No access control

Static class member:
  - Scoped to the class
  - Access control (public/private/protected)
  - Better encapsulation
  
ALWAYS prefer static class member over global variable.
```

---

## 🔗 2.7 — Singleton `[Amazon, Microsoft, Walmart, Flipkart]`

```cpp
// Meyers' Singleton — only version you need to know
class Logger {
    Logger() {}
public:
    Logger(const Logger&) = delete;
    Logger& operator=(const Logger&) = delete;
    
    static Logger& getInstance() {
        static Logger instance;  // C++11 guarantees thread safety
        return instance;
    }
    
    void log(const string& msg) {
        cout << "[LOG] " << msg << endl;
    }
};

// Usage: Logger::getInstance().log("Server started");
```

### 🌳 Interviewer Follow-Up Tree — Singleton (Focus on TRADEOFFS)
```
Singleton
├── Why use Singleton?           → Logger, config, thread pool — truly one instance
├── What are the PROBLEMS?
│   ├── Global state             → Hidden dependencies between classes
│   ├── Hard to test             → Can't mock/replace in unit tests
│   ├── Thread safety?           → Meyers' = safe (C++11 guarantees static init)
│   └── Violates SRP             → Class manages its OWN lifecycle + its job
├── When to AVOID?               → If you can inject the dependency instead
├── Alternatives?                → Dependency injection, service locator
└── Is Meyers' Singleton thread-safe? → YES in C++11+ (standard guarantees it)
```

> **Senior-level insight:** In modern systems, **dependency injection is often preferred over Singleton**. DI makes code testable (inject mocks), explicit (dependencies visible in constructor), and avoids hidden global state. Many senior interviewers love hearing this distinction.

> **Interview focus:** They care more about WHY Singleton is problematic than HOW to implement it. Lead with tradeoffs.

---

## 🔗 2.8 — `const` with Classes `[Goldman Sachs, DE Shaw, Microsoft, Arcesium]`

### const Objects
```cpp
class Rectangle {
    int width, height;
public:
    Rectangle(int w, int h) : width(w), height(h) {}
    
    int area() const { return width * height; }  // const method
    void resize(int w) { width = w; }            // non-const method
};

const Rectangle r(10, 5);
cout << r.area();    // ✅ const method on const object
// r.resize(20);     // ❌ Can't call non-const method on const object
```

### `mutable` Keyword
```
Purpose: Allow modification of a member even in const methods.

Use cases:
1. Caching (compute once, store result)
2. Mutex locks (need to lock in const read methods)  
3. Access counters / debugging
```

```cpp
class ExpensiveComputer {
    mutable int cachedResult = -1;   // Can modify in const methods
    mutable bool cacheValid = false;
    
    int data;
public:
    ExpensiveComputer(int d) : data(d) {}
    
    int compute() const {           // const method
        if (!cacheValid) {
            cachedResult = data * data; // ✅ OK — mutable
            cacheValid = true;
        }
        return cachedResult;
    }
};
```

### 📦 Memory Layout — const Doesn't Change Layout
```
const Rectangle r(10, 5);

Object layout (SAME as non-const):
┌──────┐
│ w=10 │  4 bytes
│ h=5  │  4 bytes
└──────┘
sizeof = 8

const = COMPILE-TIME restriction only.
No extra memory. No runtime cost.
```

---

## 🔗 2.9 — Friend Function & Friend Class `[Microsoft, Adobe, Amazon]`

```cpp
class BankAccount {
    double balance;
public:
    BankAccount(double b) : balance(b) {}
    
    // Friend function — NOT a member, but can access private members
    friend void audit(const BankAccount& acc);
    
    // Friend class — ALL methods of Auditor can access BankAccount privates
    friend class Auditor;
};

void audit(const BankAccount& acc) {
    cout << "Balance: " << acc.balance << endl;  // ✅ Accessing private
}

class Auditor {
public:
    void inspect(const BankAccount& acc) {
        cout << acc.balance;  // ✅ Friend class access
    }
};
```

### Friend Rules (Frequently Asked) `[Microsoft, Adobe, Amazon]`

| Property | Answer |
|----------|--------|
| Is friend inherited? | ❌ **NO** — friendship is not inherited |
| Is friend commutative? | ❌ **NO** — A friends B ≠ B friends A |
| Is friend transitive? | ❌ **NO** — A friends B, B friends C ≠ A friends C |
| Does friend break encapsulation? | ⚠️ **Partially** — it's a controlled breach |
| Is friend a member? | ❌ **NO** — it's an external function/class |

### When to Use Friend?
```
1. Operator overloading (e.g., operator<< needs access to private members)
2. Two classes that need to work closely together (Iterator + Container)
3. Testing frameworks (test class as friend)

AVOID: Using friend just because you're too lazy to write getters.
       That's a design smell.
```

---

## 🔗 2.10 — Encapsulation `[Every company]`

**One-liner:** Bundling data + methods that operate on it, restricting direct access to internals.

### Real-World Analogy: ATM Machine
```
ATM Machine = Encapsulated System
  - You can: checkBalance(), withdraw(), deposit()
  - You CANNOT: directly access the vault, modify the database
  - Internal state (cash count, DB connection) is hidden
  - Only controlled operations are exposed
```

```cpp
class Temperature {
    double celsius;  // Internal representation
public:
    void set(double c) {
        if (c < -273.15) throw invalid_argument("Below absolute zero");
        celsius = c;
    }
    double getCelsius() const { return celsius; }
    double getFahrenheit() const { return celsius * 9.0/5.0 + 32; }
    
    // Tomorrow you can change internal to Kelvin without breaking users
};
```

### Why It Matters (What to Say in Interview)
```
Without Encapsulation:
  - Anyone can set balance = -1000 → invalid state
  - Changing internal representation breaks ALL dependent code
  - No input validation → bugs everywhere

With Encapsulation:
  - Setter validates input before storing
  - Change internal storage freely (celsius→kelvin) — users unaffected
  - Single point of access → easier debugging, thread safety
```

---

## 🔗 2.11 — Abstraction `[Every company]`

**One-liner:** Showing only WHAT something does, hiding HOW it does it.

### Encapsulation vs Abstraction — THE difference `[Every company]`
```
ENCAPSULATION = Hiding DATA (private members, getters/setters)
ABSTRACTION   = Hiding IMPLEMENTATION (pure virtual functions, interfaces)

Encapsulation says: "You can't see my variables"
Abstraction says:   "You don't need to know how I work, just call me"
```

```cpp
// Abstraction through abstract class
class PaymentGateway {
public:
    virtual bool processPayment(double amount) = 0;  // WHAT
    virtual bool refund(string transactionId) = 0;    // WHAT
    virtual ~PaymentGateway() {}
};

// Implementation hidden in derived classes
class StripeGateway : public PaymentGateway {
    string apiKey;
    // HOW — Stripe API calls, HTTP requests, JSON parsing...
public:
    bool processPayment(double amount) override { /* Stripe-specific */ return true; }
    bool refund(string txnId) override { /* Stripe-specific */ return true; }
};

// Client code doesn't care about implementation
void checkout(PaymentGateway* pg, double amount) {
    pg->processPayment(amount);  // Works with ANY gateway — Stripe, Razorpay, etc.
}
```

---

## 🔗 2.12 — `struct` vs `class` in C++ `[Every company]`

| Feature | `struct` | `class` |
|---------|----------|---------|
| Default access | `public` | `private` |
| Default inheritance | `public` | `private` |
| Can have methods? | ✅ Yes | ✅ Yes |
| Can have constructors? | ✅ Yes | ✅ Yes |
| Can have virtual functions? | ✅ Yes | ✅ Yes |

```
When to use which:
  struct → Simple data container (POD), all public, no invariants
           Examples: Point, Color, Config, pair-like types
  class  → Has private state, invariants, virtual functions, lifecycle
           Examples: BankAccount, Engine, anything with encapsulation

CONVENTION (Google, LLVM style):
  struct = passive data, no behavior
  class  = has behavior, invariants, lifecycle
```

### 📦 Memory Layout — struct vs class
```
struct Point { int x, y; };
class  Point2 { int x, y; public: Point2(int x,int y):x(x),y(y){} };

IDENTICAL memory layout:
┌──────┐
│ x    │  4 bytes
│ y    │  4 bytes
└──────┘
sizeof = 8 (same for both)

Only compile-time access checking differs.
```

---

## 🔗 2.13 — RAII (⭐ NEW — CRITICAL) `[Amazon, Microsoft, Google, DE Shaw]`

**Resource Acquisition Is Initialization** — THE most important C++ idiom.

**Core Idea:** Bind resource lifetime to object lifetime.
- Constructor **acquires** (open file, allocate memory, lock mutex)
- Destructor **releases** (close file, free memory, unlock mutex)
- Resource is ALWAYS cleaned up — even if exception is thrown

```cpp
// Without RAII — manual management (DANGEROUS)
void riskyFunction() {
    int* data = new int[1000];
    // ... code that might throw ...
    delete[] data;  // ⚠️ NEVER reached if exception thrown → LEAK
}

// With RAII — automatic management (SAFE)
void safeFunction() {
    vector<int> data(1000);  // RAII — vector manages memory
    // ... code that might throw ...
}  // vector destructor frees memory — GUARANTEED, even on exception
```

### RAII Examples in C++
```
Resource          RAII Wrapper            Acquires          Releases
─────────────────────────────────────────────────────────────────────
Heap memory       unique_ptr / vector     new               delete
File handle       fstream / ifstream      open()            close()
Mutex lock        lock_guard              lock()            unlock()
Database conn     custom RAII class       connect()         disconnect()
```

```cpp
// RAII mutex example
class ThreadSafeCounter {
    int count = 0;
    mutex mtx;
public:
    void increment() {
        lock_guard<mutex> lock(mtx);  // RAII: locks mutex
        count++;
    }  // lock_guard destructor unlocks mutex — even if exception thrown
};
```

### 🌳 Interviewer Follow-Up Tree — RAII
```
RAII
├── What does RAII stand for?           → Resource Acquisition Is Initialization
├── Why is it important in C++?         → No garbage collector → must manage resources
├── How does it relate to destructors?  → Destructor guarantees cleanup
├── What about exceptions?              → Stack unwinding calls destructors → safe
├── Give examples of RAII in STL?       → vector, string, unique_ptr, lock_guard, fstream
├── How does RAII relate to smart pointers? → Smart pointers ARE RAII for heap memory
└── What's the alternative?             → Manual try/finally (Java) — C++ has no finally
```

> **Why C++ doesn't have `finally`:** It doesn't need it. RAII makes finally unnecessary — destructors guarantee cleanup.

---

## 🔗 2.14 — Rule of Zero / Three / Five `[Google, Microsoft, DE Shaw, Amazon]`

### The Hierarchy
```
RULE OF ZERO (PREFERRED — modern C++):
  "If your class doesn't directly manage a resource, don't write any of the 5."
  Use vector, string, unique_ptr etc. — they handle everything for you.

RULE OF THREE (C++98):
  "If you write any of: destructor, copy constructor, copy assignment
   → you probably need ALL THREE."

RULE OF FIVE (C++11):
  "Rule of Three + move constructor + move assignment operator."
  
DECISION:
  ┌─ Do you manage raw resources (raw new/delete, raw file handles)?
  │   YES → Rule of Five (or better: refactor to Rule of Zero)
  │   NO  → Rule of Zero (let compiler generate everything)
  └──────────────────────────────────────────────────────────────
```

### Rule of Zero (⭐ THE MODERN ANSWER) `[Google, Amazon, Microsoft]`
```cpp
// ❌ OLD WAY — Rule of Five (manual resource management)
class OldStudent {
    char* name;      // raw pointer — YOU manage memory
    int age;
public:
    OldStudent(const char* n, int a) : age(a) {
        name = new char[strlen(n)+1];
        strcpy(name, n);
    }
    ~OldStudent() { delete[] name; }
    OldStudent(const OldStudent& other) { /* deep copy */ }
    OldStudent& operator=(const OldStudent& other) { /* deep copy */ }
    OldStudent(OldStudent&& other) noexcept { /* steal */ }
    OldStudent& operator=(OldStudent&& other) noexcept { /* steal */ }
};

// ✅ MODERN WAY — Rule of Zero (RAII types manage everything)
class ModernStudent {
    string name;     // string manages its own memory (RAII)
    int age;
public:
    ModernStudent(string n, int a) : name(move(n)), age(a) {}
    // NO destructor, NO copy ctor, NO move ctor needed!
    // Compiler generates ALL of them correctly because string handles itself.
};
```

### 🌳 Interviewer Follow-Up Tree — Rule of Zero/Three/Five
```
Rule of Zero/Three/Five
├── What is Rule of Three?             → dtor + copy ctor + copy assign
├── What is Rule of Five?              → Rule of Three + move ctor + move assign
├── What is Rule of Zero?              → Use RAII types, write nothing yourself
├── Which is preferred?                → Rule of Zero (modern C++)
├── When MUST you use Rule of Five?    → Direct raw resource management
├── Why not just always write Rule of Five? → Unnecessary complexity, bug-prone
└── How does Rule of Zero work?        → string, vector, unique_ptr handle cleanup
```

> **Interview answer:** "In modern C++, I prefer Rule of Zero — use RAII types like `string`, `vector`, and `unique_ptr` so the compiler generates correct copy/move/destroy for free. I only write Rule of Five when I'm directly managing a raw resource, which is rare."

---

## 🔗 2.15 — Smart Pointer Preview `[Google, Amazon, Microsoft, Goldman Sachs]`

> Full depth in Part 3. This is the essentials you need NOW.

### Why Smart Pointers Exist
```
Raw pointers are DANGEROUS:
  int* p = new int(42);
  // ... code that throws exception ...
  delete p;  // NEVER reached → LEAK

  // Or: forget to delete → leak
  // Or: delete twice → crash
  // Or: use after delete → undefined behavior

Smart pointers = RAII for heap memory.
Constructor: takes ownership of pointer.
Destructor: automatically calls delete.
```

### The Three Smart Pointers
```cpp
#include <memory>

// 1. unique_ptr — EXCLUSIVE ownership (most common, zero overhead)
unique_ptr<int> p1 = make_unique<int>(42);
// Only ONE owner. Can't copy. Can move.
// When p1 goes out of scope → auto delete.

// 2. shared_ptr — SHARED ownership (reference counted)
shared_ptr<int> p2 = make_shared<int>(42);
shared_ptr<int> p3 = p2;  // ref count = 2
// Deleted when LAST shared_ptr is destroyed (ref count → 0)

// 3. weak_ptr — NON-OWNING observer (breaks circular references)
weak_ptr<int> w = p2;  // Observes but doesn't keep alive
// Use w.lock() to get shared_ptr (may return nullptr if object is gone)
```

### 📦 Memory Layout — Smart Pointers
```
unique_ptr<int>:
┌──────────────┐
│ int* raw_ptr │  8 bytes — SAME as raw pointer. Zero overhead!
└──────────────┘

shared_ptr<int>:
┌──────────────┐
│ int* raw_ptr │  8 bytes
│ ControlBlock* │  8 bytes → { ref_count, weak_count, deleter }
└──────────────┘
sizeof = 16 bytes (2x raw pointer)

RULE: Use unique_ptr by default. shared_ptr only when truly shared.
```

### Smart Pointers + Polymorphism `[Google, Amazon]`
```cpp
class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;        // ⚠️ MUST be virtual
};

class Circle : public Shape {
    double radius;
public:
    Circle(double r) : radius(r) {}
    double area() const override { return 3.14159 * radius * radius; }
};

// Polymorphic container — the MODERN way
vector<unique_ptr<Shape>> shapes;
shapes.push_back(make_unique<Circle>(5.0));
// shapes[0]->area() → virtual dispatch → Circle::area()
// Cleanup: automatic when vector is destroyed
```

> **Guideline:** `unique_ptr` + virtual destructor = safe polymorphic ownership. No `new`/`delete` needed.

---
---

# ⚠️ SECTION 3: COMMON TRAPS

| # | Trap | What Happens | Fix | Companies |
|---|------|-------------|-----|-----------|
| 1 | No virtual destructor on base class | Memory leak when `delete basePtr` | Always make base dtor `virtual` | `[Amazon, Microsoft, Adobe]` |
| 2 | Shallow copy with raw pointers | Double free crash | Write deep copy or use smart pointers | `[Goldman, Microsoft]` |
| 3 | Initializer list order ≠ declaration order | Uninitialized member used | Match init list order to declaration | `[Google, Arcesium]` |
| 4 | Forgetting `explicit` on single-arg ctor | Unintended implicit conversion | Add `explicit` | `[Goldman, DE Shaw]` |
| 5 | Calling virtual function in constructor | Calls BASE version, not derived | Never call virtual funcs in ctor/dtor | `[Google, Microsoft]` |
| 6 | Using raw `new/delete` in modern C++ | Leaks, double-free, exception-unsafe | Use smart pointers (Rule of Zero) | `[Google, Amazon]` |
| 7 | Assuming `friend` is inherited | Derived can't access friend's privates | Friendship is NOT inherited | `[Microsoft, Adobe]` |
| 8 | Static member not defined outside class | Linker error: undefined reference | Define: `int Class::member = 0;` in .cpp | `[Samsung, Oracle]` |
| 9 | Using `=` in ctor body for const/ref members | Compile error | Use initializer list | `[Every company]` |
| 10 | Forgetting `noexcept` on move constructor | Container (vector) won't use move, falls back to copy | Mark move ctor/assign `noexcept` | `[Google, Goldman]` |

---
---

# 🌳 SECTION 4: MENTAL MODELS

| Concept | Think of it as... |
|---------|-------------------|
| **Class** | Blueprint of a house — defines rooms and layout |
| **Object** | Actual house built from the blueprint |
| **Constructor** | Builder who sets up the house when you move in |
| **Destructor** | Demolition crew that tears down when you leave |
| **Copy Constructor** | Xerox machine — shallow = same page, deep = new photocopy |
| **Move Constructor** | Moving truck — steal furniture, leave old house empty |
| **`this` pointer** | "Me" — how the object refers to itself |
| **Static member** | Community bulletin board — shared by all residents |
| **`const` method** | Read-only mode — look but don't touch |
| **`mutable`** | Hidden drawer in read-only mode — one exception |
| **`friend`** | Trusted neighbor with spare key — limited access |
| **Encapsulation** | ATM machine — use buttons, can't touch cash |
| **Abstraction** | TV remote — press button, don't care about signals |
| **RAII** | Automatic door closer — enter = open, leave = guaranteed close |
| **Smart pointer** | Rented car — return policy built in, can't forget to return |
| **Rule of Zero** | Buy furniture from IKEA — they handle everything, you just use it |
| **Virtual destructor** | Fire escape — ensures EVERYONE exits, not just ground floor |

---
---

# ⚡ SECTION 5: INTERVIEW SPEED MODE

```
"What is OOP?"              → 4 pillars: Encapsulation, Abstraction, Inheritance, Polymorphism
"Class vs Object?"           → Blueprint vs Instance. Class = no memory, Object = memory allocated.
"Access specifiers?"         → public (all), protected (class + derived), private (class only)
"Default ctor?"              → Generated only if NO other ctor defined
"Copy ctor?"                 → Deep copy for raw pointers, default = shallow (dangerous)
"Move ctor?"                 → Steal resources, O(1), leave source empty. noexcept.
"Initializer list?"          → Required for const, ref, base class. Order = declaration order.
"explicit?"                  → Prevents implicit single-arg constructor conversions
"Virtual ctor?"              → NO. Use clone() pattern (Prototype)
"Virtual dtor?"              → YES and REQUIRED when deleting via base pointer
"Rule of Three?"             → dtor + copy ctor + copy assign (if any, need all)
"Rule of Five?"              → Rule of Three + move ctor + move assign
"Rule of Zero?"              → Use RAII types (string/vector/unique_ptr), write nothing
"RAII?"                      → Resource tied to object lifetime. Ctor acquires, dtor releases.
"Smart pointers?"            → unique_ptr (exclusive), shared_ptr (shared), weak_ptr (observer)
"this pointer?"              → Implicit pointer to current object. Not in static methods.
"static member?"             → Shared across all objects. No 'this'. Define outside class.
"const method?"              → Promises not to modify object. Only method callable on const obj.
"mutable?"                   → Exception to const — allows modification in const methods.
"Friend inherited?"          → NO. Not inherited, not commutative, not transitive.
"Encapsulation?"             → Hide DATA with private + getters/setters
"Abstraction?"               → Hide IMPLEMENTATION with pure virtual functions
"struct vs class?"           → Only difference: default access (public vs private)
"Singleton?"                 → Meyers' static local. Know tradeoffs > implementation.
```

---
---

# 🔧 SECTION 6: CODE MEMORY BLOCKS

---

### 🔧 Rule of Five (Complete Resource Management)
```cpp
class Buffer {
    int* data;
    size_t size;
    
public:
    // Constructor
    Buffer(size_t n) : data(new int[n]()), size(n) {}
    
    // 1. Destructor
    ~Buffer() { delete[] data; }
    
    // 2. Copy Constructor (deep copy)
    Buffer(const Buffer& other) 
        : data(new int[other.size]), size(other.size) {
        copy(other.data, other.data + size, data);
    }
    
    // 3. Copy Assignment (copy-and-swap idiom)
    Buffer& operator=(Buffer other) {     // by value = copy
        swap(data, other.data);
        swap(size, other.size);
        return *this;
    }  // old data destroyed when 'other' goes out of scope
    
    // 4. Move Constructor
    Buffer(Buffer&& other) noexcept 
        : data(other.data), size(other.size) {
        other.data = nullptr;
        other.size = 0;
    }
    
    // 5. Move Assignment
    Buffer& operator=(Buffer&& other) noexcept {
        if (this != &other) {
            delete[] data;
            data = other.data;
            size = other.size;
            other.data = nullptr;
            other.size = 0;
        }
        return *this;
    }
};
```

---

### 🔧 Rule of Zero (Modern C++ — PREFERRED)
```cpp
// Same functionality as above — ZERO special members written
class ModernBuffer {
    vector<int> data;  // vector handles EVERYTHING
    
public:
    ModernBuffer(size_t n) : data(n, 0) {}
    
    // Compiler auto-generates:
    // - Destructor (vector cleans up)
    // - Copy constructor (vector deep copies)
    // - Copy assignment (vector deep copies)
    // - Move constructor (vector moves)
    // - Move assignment (vector moves)
    // ALL CORRECT. ALL FREE.
};
```

---

### 🔧 RAII File Wrapper
```cpp
class FileGuard {
    FILE* fp;
public:
    FileGuard(const char* path, const char* mode) {
        fp = fopen(path, mode);
        if (!fp) throw runtime_error("Failed to open file");
    }
    ~FileGuard() { if (fp) fclose(fp); }  // GUARANTEED cleanup
    
    // Non-copyable (file handle can't be shared this way)
    FileGuard(const FileGuard&) = delete;
    FileGuard& operator=(const FileGuard&) = delete;
    
    // Moveable
    FileGuard(FileGuard&& other) noexcept : fp(other.fp) { other.fp = nullptr; }
    
    FILE* get() { return fp; }
};

void safeFileOp() {
    FileGuard f("data.txt", "r");
    // use f.get() ...
}  // file closed automatically — even if exception thrown
```

---

### 🔧 Method Chaining with this
```cpp
class QueryBuilder {
    string table, condition, order;
public:
    QueryBuilder& from(string t)    { table = t; return *this; }
    QueryBuilder& where(string c)   { condition = c; return *this; }
    QueryBuilder& orderBy(string o) { order = o; return *this; }
    
    string build() {
        return "SELECT * FROM " + table + 
               " WHERE " + condition + 
               " ORDER BY " + order;
    }
};

// Usage:
string sql = QueryBuilder()
    .from("users")
    .where("age > 18")
    .orderBy("name")
    .build();
```

---

### 🔧 Deep Copy vs Smart Pointer (Side by Side)
```cpp
// MANUAL deep copy (Rule of Five required)
class ManualOwner {
    int* data;
public:
    ManualOwner(int v) : data(new int(v)) {}
    ~ManualOwner() { delete data; }
    ManualOwner(const ManualOwner& o) : data(new int(*o.data)) {}
    // + copy assign, move ctor, move assign... 😩
};

// SMART POINTER (Rule of Zero — just works)
class SmartOwner {
    unique_ptr<int> data;
public:
    SmartOwner(int v) : data(make_unique<int>(v)) {}
    // Everything else auto-generated correctly ✅
    // Non-copyable by default (unique_ptr), moveable ✅
};
```

---
---

# 🔍 SECTION 7: INTERVIEW QUESTIONS BANK

---

### Q1. What are the four pillars of OOP? `[Amazon] [Infosys] [Capgemini]`
**Answer:** Encapsulation (data hiding), Abstraction (implementation hiding), Inheritance (code reuse), Polymorphism (same interface, different behavior). In C++: private members for encapsulation, pure virtual functions for abstraction, `:` for inheritance, `virtual` for polymorphism.

---

### Q2. What is the difference between a class and an object? `[Infosys] [Capgemini] [Wipro]`
**Answer:** A class is a user-defined blueprint that defines data members and member functions. An object is an instance of a class that occupies memory. Class is a logical entity (compile-time), object is a physical entity (runtime). Multiple objects can be created from one class.

---

### Q3. Explain shallow copy vs deep copy. When would you need each? `[Amazon] [Microsoft] [Goldman Sachs]`
**Answer:** Shallow copy copies member values as-is — pointers in the copy point to the same memory as the original. Deep copy allocates new memory and copies the pointed-to data. You NEED deep copy when your class manages resources (raw pointers, file handles). Without it, you get double-free bugs. The default copy constructor does shallow copy.

---

### Q4. What is the Rule of Zero/Three/Five? `[Google] [Microsoft] [DE Shaw] [Amazon]`
**Answer:** Rule of Three (C++98): If you write any of destructor, copy ctor, copy assign → need all three. Rule of Five (C++11): add move ctor + move assign. **Rule of Zero (modern, preferred):** Use RAII types (string, vector, unique_ptr) so you don't need to write any of the five — the compiler generates them all correctly. I prefer Rule of Zero whenever possible.

---

### Q5. Why must a base class destructor be virtual? `[Amazon] [Adobe] [Samsung] [Microsoft]`
**Answer:** When you delete a derived object through a base pointer (`delete basePtr`), without a virtual destructor, only the base destructor runs — derived resources leak. With virtual destructor, the correct destructor chain is called via vtable. Rule: if a class has any virtual function, its destructor should be virtual.

---

### Q6. Can a constructor be virtual? Why not? `[Google] [Microsoft] [Adobe]`
**Answer:** No. Virtual dispatch requires the vtable pointer, which is set up BY the constructor. During construction, the object doesn't fully exist yet. The constructor must know the exact type. Workaround: Prototype pattern (virtual `clone()` method) for "virtual construction."

---

### Q7. What is `explicit` and when should you use it? `[Goldman Sachs] [DE Shaw] [Arcesium]`
**Answer:** `explicit` prevents the compiler from using a constructor for implicit type conversions. Without it, `Fraction f = 5;` silently converts int to Fraction. With `explicit`, only `Fraction f(5)` works. Use on all single-argument constructors to prevent unintended conversions.

---

### Q8. What is RAII? Why is it important in C++? `[Amazon] [Microsoft] [Google] [DE Shaw]`
**Answer:** Resource Acquisition Is Initialization. Bind resource lifetime to object lifetime — constructor acquires, destructor releases. Critical because C++ has no garbage collector. Smart pointers, lock_guard, fstream are all RAII. It guarantees cleanup even when exceptions are thrown. C++ doesn't need `finally` because RAII handles it.

---

### Q9. What are smart pointers? When do you use each? `[Google] [Amazon] [Microsoft] [Goldman]`
**Answer:** RAII wrappers for heap memory. `unique_ptr` = exclusive ownership (zero overhead, default choice). `shared_ptr` = shared ownership (reference counted, 16 bytes). `weak_ptr` = non-owning observer (breaks circular references). Use `unique_ptr` by default, `shared_ptr` only when genuinely shared.

---

### Q10. What is the `mutable` keyword? Give a practical use case. `[DE Shaw] [Arcesium] [Goldman Sachs]`
**Answer:** `mutable` allows a member to be modified in a `const` method. Use case: caching — a `const` method computes something expensive and stores the result in a `mutable` cache member. Another: `mutable mutex` for thread safety in const read methods. It breaks physical constness while maintaining logical constness.

---

### Q11. Is `friend` inherited? Is it commutative? `[Microsoft] [Adobe] [Amazon]`
**Answer:** Neither. Friendship is NOT inherited — a friend of the parent is NOT a friend of the child. It's NOT commutative — if A declares B as friend, B cannot access A's privates unless A also declares B as friend. It's also NOT transitive.

---

### Q12. What is the difference between Encapsulation and Abstraction? `[Every company]`
**Answer:** Encapsulation hides DATA — bundling members with methods, making members private. Abstraction hides IMPLEMENTATION — exposing only the interface (pure virtual functions). Encapsulation = access modifiers; Abstraction = abstract classes/interfaces.

---

### Q13. What is the order of constructor/destructor calls in inheritance? `[Amazon] [Microsoft] [Samsung]`
**Answer:** Construction: Base → Derived. Destruction: Derived → Base (reverse). For members: constructed in declaration order, destroyed in reverse. This ensures base parts are ready before derived uses them.

---

### Q14. What happens if you call a virtual function in a constructor? `[Google] [Microsoft]`
**Answer:** The BASE class version is called, NOT the derived override. During base constructor, the vtable pointer still points to the base vtable — derived part doesn't exist yet. Same in destructor — during base destructor, derived part is already destroyed.

---

### Q15. Explain the copy-and-swap idiom. `[Google] [DE Shaw] [Arcesium]`
**Answer:** A technique for exception-safe copy assignment. Take the parameter by value (which copies it), then swap the internals. When the function exits, the copy (holding old data) is destroyed. Benefits: exception-safe, handles self-assignment, clean code.

---

### Q16. What is the difference between move and copy semantics? `[Google] [Microsoft] [Amazon]`
**Answer:** Copy creates a new independent copy of data — O(n) for dynamic data. Move transfers ownership by stealing the internals (swap pointers) — O(1). `std::move` is just a cast to rvalue reference — it doesn't actually move. Move happens automatically on return from functions (RVO) or when using `std::move()`.

---

### Q17. What is the difference between `struct` and `class`? `[Every company]`
**Answer:** Only difference: default access specifier. `struct` defaults to `public`, `class` defaults to `private`. Same for inheritance. Convention: `struct` for POD types, `class` for objects with behavior.

---

### Q18. Why should the initializer list order match the declaration order? `[Google] [Arcesium]`
**Answer:** Members are initialized in DECLARATION order regardless of init list order. If mismatch exists, you might use an uninitialized member to initialize another → garbage value. Compiler warns with `-Wreorder`.

---

### Q19. Explain Singleton pattern. What are its problems? `[Amazon] [Walmart] [Flipkart]`
**Answer:** Ensures only one instance. Implementation: Meyers' Singleton (static local in getInstance()). **Problems:** (1) Global state = hidden dependencies, (2) Hard to unit test — can't mock, (3) Violates SRP (manages own lifecycle + its job). Alternative: dependency injection.

---

### Q20. What is the `this` pointer? `[Amazon] [Flipkart] [Oracle]`
**Answer:** Implicit pointer to the current object, available in all non-static member functions. Type: `ClassName* const`. Used for: disambiguating members from parameters (`this->x = x`), method chaining (`return *this`). Not available in static methods (no object to point to).

---
---

# 📎 ADVANCED NOTES (Optional — <5% interview frequency)

These are valid C++ topics but rarely asked. Know they exist; explain only if interviewer digs.

### `delete this`
> Legal if object is heap-allocated. Must not access any member after. Rare use: reference-counted objects (COM). **Don't volunteer this in an interview.**

### Pure virtual destructor details
> `virtual ~Base() = 0;` makes class abstract. MUST provide body: `Base::~Base() {}`. Used when no other method is naturally pure virtual. **One-line answer is enough.**

### Can destructor throw?
> By default `noexcept` in C++11+. Throwing during stack unwinding → `terminate()`. **Rule: never throw from destructor.**

### Trivially Copyable Types (replaces older "POD" terminology)
> A type with no virtual functions, no user-defined copy/move/dtor. Can be safely `memcpy`'d, has C-compatible layout. Modern interviews use "trivially copyable" and "standard layout" instead of the older C++03 term "POD". Check with `std::is_trivially_copyable<T>::value`.

---
---

> **Next:** [02_inheritance_and_polymorphism.md](./02_inheritance_and_polymorphism.md) — Inheritance, Diamond Problem, Virtual Functions (vtable), Polymorphism, Casting, Object Slicing, RTTI.
