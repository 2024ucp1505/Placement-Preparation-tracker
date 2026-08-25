# Inheritance & Polymorphism — Elite Interview Revision Sheet
> Not a textbook. A **survival guide** for inheritance & polymorphism follow-ups.

---
---
# 🧠 SECTION 1: THINKING FIRST
---
## What kind of Inheritance/Polymorphism question is this?
```
Read the question. Ask:
1. "Types of inheritance?"              → Single, Multiple, Multilevel, Hierarchical, Hybrid
2. "Constructor/destructor order?"      → Base first, Derived first to destruct
3. "Diamond problem?"                   → Ambiguity + virtual inheritance solution
4. "Overloading vs Overriding?"         → Compile-time vs Runtime, same class vs hierarchy
5. "Virtual function internals?"        → vtable + vptr, memory layout, cost
6. "Abstract class?"                    → Pure virtual, can have data + concrete methods
7. "Object slicing?"                    → Pass derived by value → loses derived part
8. "Casting question?"                  → static_cast / dynamic_cast / const_cast / reinterpret_cast
9. "override/final?"                    → Compiler-checked overriding, prevent further override
10. "Name hiding?"                      → Derived hides ALL base overloads with same name
```

---
---

# 🔗 SECTION 2: CORE CONCEPTS
---

## 🔗 2.1 — Inheritance Basics `[Every company]`

**One-liner:** A class acquires properties and behaviors of another class — code reuse + hierarchical classification.

### Types of Inheritance

```
1. SINGLE:        Base → Derived
                  class Dog : public Animal {}

2. MULTIPLE:      Base1, Base2 → Derived
                  class FlyingFish : public Fish, public Bird {}

3. MULTILEVEL:    Base → Mid → Derived
                  class Puppy : public Dog {}   (Dog : Animal)

4. HIERARCHICAL:  Base → Derived1, Derived2
                  class Dog : public Animal {}
                  class Cat : public Animal {}

5. HYBRID:        Combination (usually involves diamond)
                  D inherits from B and C, both inherit from A → Diamond!
```

```cpp
// Single Inheritance
class Animal {
protected:
    string name;
public:
    Animal(string n) : name(n) { cout << "Animal ctor\n"; }
    virtual ~Animal() { cout << "Animal dtor\n"; }
    virtual void speak() { cout << name << " makes a sound\n"; }
};

class Dog : public Animal {
    string breed;
public:
    Dog(string n, string b) : Animal(n), breed(b) { cout << "Dog ctor\n"; }
    ~Dog() { cout << "Dog dtor\n"; }
    void speak() override { cout << name << " barks\n"; }
};

// Multiple Inheritance — interfaces pattern (SAFE)
class Printable {
public:
    virtual void print() = 0;
    virtual ~Printable() {}
};

class Serializable {
public:
    virtual string serialize() = 0;
    virtual ~Serializable() {}
};

class Document : public Printable, public Serializable {
    string content;
public:
    void print() override { cout << content; }
    string serialize() override { return content; }
};
```

### 📦 Memory Layout — Single Inheritance
```
class Animal { string name; };          // 32 bytes (string)
class Dog : public Animal { string breed; };

Dog object:
┌────────────────────┐
│ [vptr]             │  8 bytes  ← points to Dog_vtable
│ name (string)      │  32 bytes ← inherited from Animal
│ breed (string)     │  32 bytes ← Dog's own member
└────────────────────┘
sizeof(Dog) ≈ 72 bytes

Base part comes FIRST in memory layout.
Derived members are appended AFTER.
```

> **Interview tip:** `public` inheritance = **IS-A** relationship. `private` inheritance = **IS-IMPLEMENTED-IN-TERMS-OF** (composition is usually better).

---

### Constructor/Destructor Order in Inheritance (⭐ VERY COMMONLY ASKED) `[Amazon, Microsoft, Samsung]`

```
CONSTRUCTION ORDER:
  1. Virtual base classes (left-to-right, depth-first)
  2. Non-virtual base classes (left-to-right)
  3. Member objects (declaration order)
  4. Derived class body

DESTRUCTION ORDER:
  Exact REVERSE of construction
```

```cpp
class A {
public:
    A() { cout << "A ctor\n"; }
    virtual ~A() { cout << "A dtor\n"; }
};

class B : public A {
public:
    B() { cout << "B ctor\n"; }
    ~B() { cout << "B dtor\n"; }
};

class C : public B {
    A memberObj;  // Member object of type A
public:
    C() : memberObj() { cout << "C ctor\n"; }
    ~C() { cout << "C dtor\n"; }
};

// { C obj; } produces:
// A ctor      ← Base class (A is base of B)
// B ctor      ← Intermediate base
// A ctor      ← Member object (memberObj)
// C ctor      ← Derived class body
// C dtor      ← Reverse starts
// A dtor      ← Member object destroyed
// B dtor
// A dtor      ← Base destroyed last
```

### 🌳 Interviewer Follow-Up Tree — Constructor/Destructor Order
```
Constructor/Destructor Order
├── What's the construction order?          → Base → Member → Derived
├── What's the destruction order?           → Exact reverse
├── What about multiple inheritance?        → Left-to-right base order
├── What about virtual base classes?        → Virtual bases constructed FIRST
├── Who calls virtual base constructor?     → Most-derived class (not intermediate)
├── What if member has no default ctor?     → MUST use initializer list
└── What if base destructor isn't virtual?  → Only base dtor called → LEAK
```

---

## 🔗 2.2 — The Diamond Problem (⭐ CRITICAL) `[Google, Amazon, Adobe, Microsoft]`

### What is it?
```
         Animal
        /      \
     Dog        Cat
        \      /
       DogCat (Hybrid)

Problem: DogCat has TWO copies of Animal's members
         DogCat::speak() → Which Animal::speak()? Ambiguous!
```

```cpp
// WITHOUT virtual inheritance — BROKEN
class Animal {
public:
    int age;
    Animal() : age(0) { cout << "Animal ctor\n"; }
};

class Dog : public Animal {};
class Cat : public Animal {};

class DogCat : public Dog, public Cat {};

DogCat dc;
// dc.age = 5;      ❌ ERROR: ambiguous — Dog::age or Cat::age?
dc.Dog::age = 5;    // ✅ Explicit disambiguation (ugly)
```

### Solution: Virtual Inheritance

```cpp
class Animal {
public:
    int age;
    Animal() : age(0) { cout << "Animal ctor\n"; }
};

class Dog : virtual public Animal {};     // ← virtual
class Cat : virtual public Animal {};     // ← virtual

class DogCat : public Dog, public Cat {
public:
    // With virtual inheritance, DogCat MUST call Animal's ctor directly
    DogCat() : Animal() { cout << "DogCat ctor\n"; }
};

DogCat dc;
dc.age = 5;    // ✅ Only ONE copy of Animal — no ambiguity
```

### 📦 Memory Layout — Diamond Problem
```
WITHOUT virtual inheritance:
┌──────────────────────┐
│ Dog's Animal copy:   │
│   age (int)          │  4 bytes ← FIRST copy
│ Dog's own members    │
├──────────────────────┤
│ Cat's Animal copy:   │
│   age (int)          │  4 bytes ← SECOND copy (DUPLICATE!)
│ Cat's own members    │
├──────────────────────┤
│ DogCat's own members │
└──────────────────────┘
Two Animal copies → ambiguity, wasted memory

WITH virtual inheritance:
┌──────────────────────┐
│ Dog subobject:       │
│   vbptr ──────────┐  │  ← Virtual Base Pointer
│   Dog's own data  │  │
├──────────────────────┤
│ Cat subobject:    │  │
│   vbptr ──────────┤  │  ← Virtual Base Pointer
│   Cat's own data  │  │
├──────────────────────┤
│ DogCat's own data │  │
├──────────────────────┤
│ Animal (SHARED):  ←──┘  ← Single copy, at END of object
│   age (int)          │
└──────────────────────┘
One Animal → no ambiguity, but extra vbptr cost (8 bytes each)
```

### 🌳 Interviewer Follow-Up Tree — Diamond Problem
```
Diamond Problem
├── What IS the diamond problem?         → Two paths to same base → duplicate + ambiguity
├── How does C++ solve it?               → virtual inheritance → single shared base
├── Memory impact?                       → Extra vbptr (8 bytes) per virtual base path
├── Who calls virtual base constructor?  → Most-derived class (DogCat), NOT Dog/Cat
├── Construction order?                  → Virtual bases FIRST, then left-to-right
├── Does Java have this problem?         → No — single inheritance + interfaces only
├── Performance cost?                    → Extra indirection to access virtual base
└── When is virtual inheritance needed?  → ONLY for diamond patterns (rare in practice)
```

> **Construction order with virtual inheritance:** Virtual bases first (Animal), then left-to-right non-virtual bases (Dog, Cat), then derived (DogCat).

---

## 🔗 2.3 — Function Overloading (Compile-Time Polymorphism) `[Every company]`

**One-liner:** Same function name, different parameter lists, resolved at compile time.

### Rules for Overloading
```
Functions can be overloaded based on:
  ✅ Number of parameters
  ✅ Types of parameters
  ✅ Order of parameters
  ❌ Return type alone (NOT sufficient)
  ❌ Default arguments that create ambiguity
```

```cpp
class Calculator {
public:
    int add(int a, int b) { return a + b; }
    double add(double a, double b) { return a + b; }
    int add(int a, int b, int c) { return a + b + c; }
    
    // ❌ Can't overload by return type only:
    // double add(int a, int b) { return a + b; }  // ERROR: ambiguous
};
```

---

### Operator Overloading `[Amazon, Goldman Sachs, Flipkart, Adobe]`

```cpp
class Complex {
    double real, imag;
public:
    Complex(double r = 0, double i = 0) : real(r), imag(i) {}
    
    // Member operator
    Complex operator+(const Complex& other) const {
        return Complex(real + other.real, imag + other.imag);
    }
    
    // Prefix ++ (returns reference)
    Complex& operator++() {
        ++real;
        return *this;
    }
    
    // Postfix ++ (int is dummy to distinguish from prefix)
    Complex operator++(int) {
        Complex temp = *this;
        ++real;
        return temp;
    }
    
    bool operator==(const Complex& other) const {
        return real == other.real && imag == other.imag;
    }
    
    // Stream operators MUST be non-member (left operand is ostream)
    friend ostream& operator<<(ostream& os, const Complex& c);
};

// Non-member friend
ostream& operator<<(ostream& os, const Complex& c) {
    os << c.real << " + " << c.imag << "i";
    return os;  // Return stream for chaining: cout << a << b;
}
```

### Key Operator Overloading Rules
```
CANNOT overload:  ::   .   .*   ?:   sizeof   typeid   alignof

MUST be member:   =   ()   []   ->   ->*
  Why? Left operand must be the class type.

MUST be non-member:  <<  >>  (stream operators)
  Why? Left operand is ostream/istream, not your class.

MEMBER:      a + b  →  a.operator+(b)     (left MUST be class)
NON-MEMBER:  a + b  →  operator+(a, b)    (either can be non-class)
  
Example: 5 + Complex(1,2) NEEDS non-member (int has no operator+)
```

### 🌳 Interviewer Follow-Up Tree — Operator Overloading
```
Operator Overloading
├── Which operators can't be overloaded?  → ::  .  .*  ?:  sizeof  typeid  alignof
├── Which MUST be member?                 → =  ()  []  ->  ->*
├── Why << >> must be non-member?         → Left operand is ostream, not your class
├── Prefix vs Postfix ++?                 → Prefix: returns &, Postfix: takes dummy int, returns copy
├── Why return ostream& from <<?          → For chaining: cout << a << b
├── Can you overload new/delete?          → Yes — for custom memory management
└── What about 5 + obj?                   → Needs non-member (friend) overload
```

---

## 🔗 2.4 — Function Overriding (Runtime Polymorphism) `[Google, Microsoft, Amazon, Adobe]`

**One-liner:** Derived class redefines a base class virtual function with the same signature.

```cpp
class Shape {
public:
    virtual double area() const { return 0; }
    virtual ~Shape() {}
};

class Circle : public Shape {
    double radius;
public:
    Circle(double r) : radius(r) {}
    double area() const override {    // ← override = compiler-checked
        return 3.14159 * radius * radius;
    }
};

// Polymorphism in action
void printArea(const Shape& s) {
    cout << "Area: " << s.area() << endl;  // Calls correct version at RUNTIME
}

Circle c(5);
printArea(c);    // "Area: 78.5398" — Circle::area() via vtable
```

### `override` and `final` Keywords (C++11) `[Google, Microsoft, Adobe]`

```cpp
class Base {
public:
    virtual void func(int x) {}
};

class Derived : public Base {
public:
    // Without override — SILENT BUG (creates new function, doesn't override)
    void func(double x) {}           // Different param type → HIDES, not overrides

    // With override — compiler ERROR catches the bug
    // void func(double x) override {}  ❌ ERROR: doesn't override any base method
    void func(int x) override {}       // ✅ Correctly overrides
};

// final on function — no further overriding
class Dog : public Base {
    void func(int x) final {}         // No class can override func() after this
};

// final on class — no inheritance allowed
class Singleton final {};
// class MySingleton : public Singleton {};  ❌ ERROR
```

> **Always use `override`.** It catches subtle bugs where you think you're overriding but you've got a typo, wrong parameter type, or missing const.

### Covariant Return Types `[Google, DE Shaw]`
```cpp
class Base {
public:
    virtual Base* clone() const { return new Base(*this); }
    virtual ~Base() {}
};

class Derived : public Base {
public:
    // Return Derived* instead of Base* — ALLOWED (covariant)
    Derived* clone() const override { return new Derived(*this); }
};

// Why useful? Client with Derived* gets Derived* back — no downcast needed
Derived d;
Derived* copy = d.clone();  // ✅ Direct, no casting
```

---

## 🔗 2.5 — Overloading vs Overriding — The Comparison `[Every company]`

| Feature | Overloading | Overriding |
|---------|-------------|------------|
| **When resolved** | Compile time | Runtime |
| **Where** | Same class (or via `using`) | Base + Derived |
| **Parameters** | Must differ | Must be identical |
| **`virtual` needed?** | No | Yes |
| **Binding** | Static (early) | Dynamic (late) |
| **Also called** | Compile-time polymorphism | Runtime polymorphism |

```
KEY INSIGHT:
  Overloading = same name, DIFFERENT signatures → compiler picks
  Overriding  = same name, SAME signature       → vtable picks
```

---

## 🔗 2.6 — Virtual Functions DEEP DIVE (⭐⭐ MOST IMPORTANT) `[Google, Microsoft, Goldman Sachs, Adobe, Samsung]`

### How Virtual Functions Work: vtable + vptr

```
Every class with virtual functions gets a VTABLE (virtual table):
  - Array of function pointers
  - One vtable per CLASS (not per object — shared)
  - Contains pointers to the most derived versions of virtual functions

Every object of such a class gets a VPTR (virtual pointer):
  - Hidden pointer stored in the object (8 bytes on 64-bit)
  - Points to the class's vtable
  - Set up by the constructor
```

```cpp
class Animal {
public:
    virtual void speak() { cout << "...\n"; }
    virtual void eat()   { cout << "eating\n"; }
    virtual ~Animal() {}
};

class Dog : public Animal {
public:
    void speak() override { cout << "Woof\n"; }
    // eat() NOT overridden — uses Animal::eat()
};

class Cat : public Animal {
public:
    void speak() override { cout << "Meow\n"; }
    void eat() override   { cout << "cat eating\n"; }
};
```

### 📦 Memory Layout — vtable + vptr (⭐ MUST KNOW)
```
VTABLES (one per class, stored in read-only section — .rodata):

Animal_vtable:                Dog_vtable:                Cat_vtable:
┌──────────────────┐         ┌──────────────────┐       ┌──────────────────┐
│ [0] Animal::speak│         │ [0] Dog::speak   │       │ [0] Cat::speak   │
│ [1] Animal::eat  │         │ [1] Animal::eat  │       │ [1] Cat::eat     │
│ [2] Animal::~dtor│         │ [2] Dog::~dtor   │       │ [2] Cat::~dtor   │
└──────────────────┘         └──────────────────┘       └──────────────────┘
    ↑                             ↑                          ↑
OBJECTS (each has hidden vptr as FIRST member):

Animal a;           Dog d;              Cat c;
┌─────────┐        ┌─────────┐         ┌─────────┐
│ vptr ────┼──→    │ vptr ────┼──→     │ vptr ────┼──→
│ (data)   │       │ (data)   │        │ (data)   │
└─────────┘        └─────────┘         └─────────┘

DISPATCH (the magic):
  Animal* ptr = new Dog();
  ptr->speak();
  
  Step 1: Read ptr->vptr           → Dog_vtable
  Step 2: Read Dog_vtable[0]       → Dog::speak
  Step 3: Call Dog::speak()        → "Woof"
  
  Compiler generates: call [ptr->vptr + offset]
  ALL resolved at RUNTIME
```

### 📦 Memory Layout — Object Size with Virtual Functions
```
class Empty {};                    → sizeof = 1  (minimum)
class NoVirtual { int x; };       → sizeof = 4
class WithVirtual {               
    int x;                         
    virtual void f() {}            
};                                 → sizeof = 16 (8 vptr + 4 int + 4 padding)

Why 16, not 12?
┌──────────┐
│ vptr     │  8 bytes (pointer, 8-byte aligned)
│ int x    │  4 bytes
│ [padding]│  4 bytes (alignment to 8-byte boundary)
└──────────┘

Adding virtual functions to a class:
  - Adds 8 bytes per OBJECT (one vptr)
  - Adds ONE vtable per CLASS (shared, negligible)
  - Does NOT add 8 bytes per virtual function per object
```

### Cost of Virtual Functions `[Google, Qualcomm, DE Shaw, Samsung]`

```
SPACE COST:
  +8 bytes per object (vptr) — that's it
  vtable is per-class (shared) — negligible

TIME COST:
  Extra indirection: ptr → vptr → vtable → function  (~2-5ns)
  Prevents inlining (compiler doesn't know target at compile time)
  Potential cache miss (vtable may not be in L1)

WHEN IT MATTERS:
  - Tight loops with millions of virtual calls (game engines, HFT)
  - Embedded systems with severe memory constraints
  - For 99% of interviews: "negligible overhead, I'd use virtual"

ALTERNATIVES when it matters:
  - CRTP (static polymorphism, zero overhead)
  - final keyword (enables devirtualization)
  - std::variant + std::visit (type-safe union)
```

### 🌳 Interviewer Follow-Up Tree — Virtual Functions (⭐ THE BIG ONE)
```
Virtual Functions
├── How do they work?                    → vtable (per class) + vptr (per object)
├── Where is vtable stored?              → Read-only section (.rodata), one per class
├── Where is vptr in the object?         → First member (before user data)
├── When is vptr set?                    → By the constructor
├── What's the space cost?               → +8 bytes per object (vptr)
├── What's the time cost?                → One indirection (~2-5ns), prevents inlining
├── What happens in constructor?         → vptr = current class's vtable (not derived!)
├── What about in destructor?            → Same — vptr reset to current class's vtable
├── Can virtual function be inlined?     → Only if compiler KNOWS exact type (devirtualization)
├── What is devirtualization?            → Compiler optimization: resolves virtual at compile time
├── What does 'final' enable?            → Devirtualization (compiler knows no further override)
├── Alternative to virtual dispatch?     → CRTP (static polymorphism), no runtime cost
└── Multiple inheritance vtable?         → Multiple vptrs — one per base with virtuals
```

---

### Pure Virtual Functions → Abstract Classes `[Amazon, Microsoft, Oracle, Samsung]`

```cpp
class Shape {
public:
    virtual double area() const = 0;       // Pure virtual — MUST override
    virtual double perimeter() const = 0;  // Pure virtual
    
    // CAN have concrete methods in abstract class
    void describe() const {
        cout << "Area: " << area() << endl;  // Calls derived version!
    }
    
    virtual ~Shape() {}
};

// Shape s;  ❌ Can't instantiate abstract class

class Circle : public Shape {
    double r;
public:
    Circle(double r) : r(r) {}
    double area() const override { return 3.14159 * r * r; }
    double perimeter() const override { return 2 * 3.14159 * r; }
};

Circle c(5);
c.describe();  // Uses concrete method + polymorphic call to area()
```

### Interface vs Abstract Class (C++ Perspective)
```
C++ has NO "interface" keyword (unlike Java). But the concept exists:

INTERFACE (convention):           ABSTRACT CLASS:
┌─────────────────────────┐      ┌─────────────────────────┐
│ ALL pure virtual methods│      │ At least ONE pure virtual│
│ NO data members         │      │ CAN have data members   │
│ NO implementations      │      │ CAN have concrete methods│
│ Only virtual destructor │      │ CAN have constructors   │
└─────────────────────────┘      └─────────────────────────┘

In C++, both are implemented as classes.
"Interface" is just a coding convention.
```

---

### Virtual Function in Constructor/Destructor (⭐ TRAP QUESTION) `[Google, Microsoft, Amazon]`

```cpp
class Base {
public:
    Base() {
        print();  // Calls Base::print(), NOT Derived::print()!
    }
    virtual void print() { cout << "Base\n"; }
    virtual ~Base() {
        print();  // Calls Base::print(), NOT Derived::print()!
    }
};

class Derived : public Base {
public:
    Derived() { cout << "Derived ctor\n"; }
    void print() override { cout << "Derived\n"; }
    ~Derived() { cout << "Derived dtor\n"; }
};

Derived d;
// Output:
// Base           ← Base ctor calls Base::print() (NOT Derived!)
// Derived ctor
// Derived dtor
// Base           ← Base dtor calls Base::print() (NOT Derived!)
```

```
WHY?
During Base constructor:
  - Derived part doesn't exist yet
  - vptr = Base's vtable (not Derived's!)
  - Virtual call → Base version

During Base destructor:
  - Derived part is ALREADY destroyed
  - vptr = Base's vtable (reset during unwinding)
  - Virtual call → Base version

RULE: Never call virtual functions from constructor or destructor.
      You won't get polymorphic behavior — it's a silent logic bug.
```

---

## 🔗 2.7 — Name Hiding in Inheritance `[Google, Microsoft, Adobe]`

**The trap most candidates miss:**

```cpp
class Base {
public:
    void func(int x)    { cout << "Base int\n"; }
    void func(double x) { cout << "Base double\n"; }
};

class Derived : public Base {
public:
    void func(string s) { cout << "Derived string\n"; }
    // ⚠️ THIS HIDES ALL BASE OVERLOADS — not just func(string)!
};

Derived d;
d.func("hello");  // ✅ "Derived string"
// d.func(42);    // ❌ ERROR: Base::func(int) is HIDDEN!
// d.func(3.14);  // ❌ ERROR: Base::func(double) is HIDDEN!
```

**Fix: `using` declaration**
```cpp
class Derived : public Base {
public:
    using Base::func;            // ← Unhide ALL base overloads
    void func(string s) { cout << "Derived string\n"; }
};

Derived d;
d.func("hello");  // ✅ "Derived string"
d.func(42);       // ✅ "Base int" — now accessible
d.func(3.14);     // ✅ "Base double" — now accessible
```

> **Key insight:** This is NOT overriding (no virtual). It's name **hiding**. Any derived function with the same NAME hides ALL base overloads. Fix: `using Base::funcName;`

---

## 🔗 2.8 — Upcasting & Downcasting `[Google, DE Shaw, Arcesium, Amazon]`

### The Four C++ Casts (Overview)
```
┌──────────────────────────────────────────────────────────────┐
│  static_cast      — Compile-time, no runtime check           │
│  dynamic_cast     — Runtime check using RTTI, needs virtual  │
│  const_cast       — Add/remove const qualification           │
│  reinterpret_cast — Bit-level reinterpretation (dangerous)   │
└──────────────────────────────────────────────────────────────┘
```

### Upcasting (Derived → Base) — Always Safe
```cpp
class Animal {
public:
    virtual void speak() { cout << "...\n"; }
    virtual ~Animal() {}
};

class Dog : public Animal {
public:
    void speak() override { cout << "Woof\n"; }
    void fetch() { cout << "Fetching!\n"; }
};

Dog d;
Animal* aPtr = &d;        // Implicit upcast — always safe, no cast needed
Animal& aRef = d;          // Implicit upcast
aPtr->speak();             // "Woof" — polymorphism works
// aPtr->fetch();          // ❌ fetch() not in Animal interface
```

### Downcasting (Base → Derived) — Potentially Unsafe `[Amazon, Goldman Sachs, Arcesium]`

```cpp
// STATIC_CAST — No runtime check (fast but risky)
Animal* aPtr = new Dog();
Dog* dPtr = static_cast<Dog*>(aPtr);      // ✅ Works (aPtr IS a Dog)
dPtr->fetch();                              // ✅ OK

Animal* aPtr2 = new Animal();
Dog* dPtr2 = static_cast<Dog*>(aPtr2);    // Compiles but WRONG!
// dPtr2->fetch();                         // ⚠️ UNDEFINED BEHAVIOR


// DYNAMIC_CAST — Runtime check (safe but needs virtual in base)
Animal* aPtr3 = new Dog();
Dog* dPtr3 = dynamic_cast<Dog*>(aPtr3);   // ✅ Returns valid pointer
if (dPtr3) dPtr3->fetch();                 // ✅ Safe — null check first

Animal* aPtr4 = new Animal();
Dog* dPtr4 = dynamic_cast<Dog*>(aPtr4);   // Returns nullptr (not a Dog)
if (dPtr4) dPtr4->fetch();                 // Not executed — safe!
```

### 📦 dynamic_cast Failure Behavior
```
POINTER:    dynamic_cast<Derived*>(basePtr)  → returns nullptr on failure
REFERENCE:  dynamic_cast<Derived&>(baseRef)  → throws std::bad_cast on failure

Always null-check pointer results!
```

### When to Use Each Cast

| Cast | Use When | Safety | Runtime Cost |
|------|----------|--------|-------------|
| `static_cast` | You're SURE about the type | ⚠️ Unsafe downcast | None |
| `dynamic_cast` | You're NOT sure, need check | ✅ Safe | RTTI lookup |
| `const_cast` | Legacy API needs non-const | ⚠️ Don't modify data | None |
| `reinterpret_cast` | Low-level bit manipulation | ❌ Very dangerous | None |

### 🌳 Interviewer Follow-Up Tree — Casting
```
C++ Casts
├── Why not use C-style casts?              → No type safety, can't grep/search for them
├── static_cast vs dynamic_cast?            → Compile-time vs runtime, speed vs safety
├── dynamic_cast requirement?               → Base must have at least one virtual function
├── dynamic_cast failure?                   → Pointer: nullptr. Reference: bad_cast exception
├── When is static_cast safe for downcast?  → When you're 100% certain of the type
├── const_cast: when is it OK?              → Only when underlying data is truly non-const
├── What is RTTI?                           → Runtime Type Information (enables dynamic_cast, typeid)
├── Can RTTI be disabled?                   → Yes: -fno-rtti (game engines, embedded)
└── Best practice for downcasting?          → dynamic_cast with null check, or redesign with virtual
```

---

## 🔗 2.9 — Object Slicing (⭐ CRITICAL) `[Amazon, Adobe, Flipkart, Microsoft]`

**One-liner:** When a derived object is assigned to a base object BY VALUE, the derived part is "sliced off."

```cpp
class Animal {
public:
    string name;
    Animal(string n) : name(n) {}
    virtual void speak() { cout << name << " says ...\n"; }
};

class Dog : public Animal {
    string breed;
public:
    Dog(string n, string b) : Animal(n), breed(b) {}
    void speak() override { cout << name << " (" << breed << ") barks\n"; }
};

Dog d("Rex", "Labrador");

// ⚠️ OBJECT SLICING — breed is lost!
Animal a = d;        // Copies only the Animal part
a.speak();           // "Rex says ..." — NOT "Rex (Labrador) barks"
                     // Dog::speak() is gone, breed is gone

// ✅ No slicing with pointers/references
Animal* ptr = &d;
ptr->speak();        // "Rex (Labrador) barks" — polymorphism preserved

Animal& ref = d;
ref.speak();         // "Rex (Labrador) barks" — polymorphism preserved
```

### 📦 Memory Layout — Object Slicing Visual
```
Dog d("Rex", "Lab"):
┌────────────────────┐
│ vptr → Dog_vtable  │  8 bytes
│ name = "Rex"       │  32 bytes  ← Animal part
├────────────────────┤
│ breed = "Lab"      │  32 bytes  ← Derived part
└────────────────────┘

After: Animal a = d;    ← VALUE copy, only Animal-sized memory
┌────────────────────┐
│ vptr → Animal_vtbl │  8 bytes   ← RESET to Animal's vtable!
│ name = "Rex"       │  32 bytes  ← Only Animal part copied
└────────────────────┘
breed is GONE. vtable is Animal's. Polymorphism is DEAD.
```

### How to Prevent Object Slicing
```
1. Pass by pointer:    void func(Animal* a)                    → no copy
2. Pass by reference:  void func(const Animal& a)              → no copy
3. Smart pointers:     void func(unique_ptr<Animal>& a)        → no copy
4. Polymorphic containers: vector<unique_ptr<Animal>>          → no slicing

NEVER store derived by value in base container:
  vector<Animal> animals;
  animals.push_back(Dog("Rex", "Lab"));  // ⚠️ SLICED!
  
USE:
  vector<unique_ptr<Animal>> animals;
  animals.push_back(make_unique<Dog>("Rex", "Lab"));  // ✅ No slicing
```

### 🌳 Interviewer Follow-Up Tree — Object Slicing
```
Object Slicing
├── What is it?                  → Derived → Base by value, derived part lost
├── Why does it happen?          → Base-sized memory can't hold derived data
├── Is vtable preserved?         → NO — vptr reset to base vtable
├── How to prevent?              → Use pointers, references, or smart pointers
├── What about containers?       → vector<Base> slices. Use vector<unique_ptr<Base>>
├── Does this happen with &?     → NO — references preserve polymorphism
└── Is this undefined behavior?  → No — it's well-defined, just usually unintended
```

---

## 🔗 2.10 — RTTI (Runtime Type Information) `[Qualcomm, Samsung, Google]`

### `typeid` Operator
```cpp
#include <typeinfo>

class Base {
public:
    virtual ~Base() {}  // MUST have virtual for RTTI to work on pointers
};

class Derived : public Base {};

Base* bPtr = new Derived();
cout << typeid(*bPtr).name();   // "Derived" (implementation-specific mangling)

if (typeid(*bPtr) == typeid(Derived)) {
    cout << "It's a Derived!\n";  // ✅ This prints
}
```

### When to Use RTTI
```
USE when:                           AVOID when:
  1. Serialization/deserialization    1. Virtual functions solve it (prefer polymorphism)
  2. Debug logging with type names    2. Performance-critical hot loops
  3. Plugin architectures             3. Every function checks type (design smell)

RTTI can be disabled: -fno-rtti (GCC/Clang)
When disabled: typeid and dynamic_cast won't work.

BETTER ALTERNATIVE in most cases:
  Instead of: if (typeid(*s) == typeid(Circle)) { ... }
  Prefer:     s->describe();  // virtual function — cleaner, faster
```

---
---

# ⚠️ SECTION 3: COMMON TRAPS

| # | Trap | What Happens | Fix | Companies |
|---|------|-------------|-----|-----------|
| 1 | Virtual function in ctor/dtor | Calls BASE version, not derived | Never call virtual in ctor/dtor | `[Google] [Microsoft]` |
| 2 | Missing `override` keyword | Creates new function (hides, doesn't override) | Always use `override` | `[Every company]` |
| 3 | Object slicing (pass by value) | Derived part + vtable lost | Use pointers/references | `[Amazon] [Adobe]` |
| 4 | Diamond without virtual inheritance | Two copies of base, ambiguous access | `class B : virtual public A` | `[Google] [Amazon]` |
| 5 | `static_cast` downcast on wrong type | Undefined behavior | Use `dynamic_cast` + null check | `[Goldman] [DE Shaw]` |
| 6 | `dynamic_cast` without virtual base | Compile error | Base needs ≥1 virtual function | `[Arcesium]` |
| 7 | Name hiding in inheritance | Base overloads hidden by derived | `using Base::func;` in derived | `[Google] [Microsoft]` |
| 8 | Confusing overloading vs overriding | Different params = overload, not override | Same signature + virtual = override | `[Every company]` |
| 9 | Storing polymorphic objects by value | Object slicing in containers | `vector<unique_ptr<Base>>` | `[Amazon] [Google]` |
| 10 | Missing virtual destructor in base | Memory leak when `delete basePtr` | Virtual dtor if ANY virtual func | `[Amazon] [Adobe]` |

---
---

# 🌳 SECTION 4: MENTAL MODELS

| Concept | Think of it as... |
|---------|-------------------|
| **Inheritance** | Family tree — children get parents' traits + add own |
| **Virtual function** | Job title — "Manager" does different things in different depts |
| **vtable** | Phone directory — lookup table: which function to call |
| **vptr** | Speed-dial button — each object has shortcut to its directory |
| **Overloading** | Same word, different context — "run" a race vs "run" a program |
| **Overriding** | Upgraded version — child replaces parent's method |
| **Abstract class** | Job description — defines requirements, not the actual person |
| **Upcast** | Generalization — "This Labrador IS an Animal" (always safe) |
| **Downcast** | Specialization — "Is this Animal a Labrador?" (risky, check first) |
| **Object slicing** | Photocopy of a 3D model — you only get the flat 2D version |
| **Diamond problem** | Two parents who are siblings — child inherits grandparent twice |
| **Name hiding** | New employee with same name — old one becomes invisible |
| **dynamic_cast** | ID check at door — verify before entry |
| **static_cast** | Trust-based entry — no check, you better be right |

---
---

# ⚡ SECTION 5: INTERVIEW SPEED MODE

```
"Types of inheritance?"             → Single, Multiple, Multilevel, Hierarchical, Hybrid
"Constructor order?"                → Base → Member → Derived. Destruction = reverse.
"Diamond problem?"                  → Two paths to same base → ambiguity. Fix: virtual inheritance.
"virtual keyword?"                  → Enables runtime polymorphism via vtable dispatch
"override keyword?"                 → Compiler-checked guarantee of correct override
"final keyword?"                    → Prevent further overriding (function) or inheriting (class)
"Overloading vs Overriding?"        → Overloading = diff params, compile-time
                                      Overriding = same params + virtual, runtime
"How do virtual functions work?"    → vtable (per class) + vptr (per object) → indirect call
"Where is vptr in object?"          → First member, before user data. 8 bytes on 64-bit.
"Cost of virtual?"                  → +8 bytes/object (vptr), indirect call (~2-5ns)
"Abstract class?"                   → Has ≥1 pure virtual. Can't instantiate. CAN have data + methods.
"Interface in C++?"                 → No keyword. Convention: class with ONLY pure virtuals.
"Virtual in ctor/dtor?"             → Calls BASE version, not derived. NEVER do this.
"Object slicing?"                   → Derived→Base by value → derived part lost. Use ptr/ref.
"Name hiding?"                      → Derived func hides ALL base overloads. Fix: using Base::func.
"static_cast vs dynamic_cast?"      → static = no check, fast. dynamic = RTTI check, safe.
"dynamic_cast failure?"             → Pointer: nullptr. Reference: std::bad_cast.
"Operator overloading?"             → Can't overload: ::  .  .*  ?:  sizeof  typeid  alignof
"<< >> overloading?"                → Must be non-member (friend). Return stream& for chaining.
"Covariant return?"                 → Override can return more-derived pointer/reference.
"RTTI?"                             → typeid + dynamic_cast. Needs virtual. Can disable: -fno-rtti.
```

---
---

# 🔧 SECTION 6: CODE MEMORY BLOCKS

---

### 🔧 Polymorphism Demo (Complete Working Example)
```cpp
#include <iostream>
#include <vector>
#include <memory>
using namespace std;

class Shape {
protected:
    string name;
public:
    Shape(string n) : name(n) {}
    virtual double area() const = 0;
    virtual void draw() const { cout << "Drawing " << name << endl; }
    virtual ~Shape() {}
};

class Circle : public Shape {
    double r;
public:
    Circle(double r) : Shape("Circle"), r(r) {}
    double area() const override { return 3.14159 * r * r; }
};

class Rectangle : public Shape {
    double w, h;
public:
    Rectangle(double w, double h) : Shape("Rectangle"), w(w), h(h) {}
    double area() const override { return w * h; }
};

int main() {
    vector<unique_ptr<Shape>> shapes;
    shapes.push_back(make_unique<Circle>(5));
    shapes.push_back(make_unique<Rectangle>(3, 4));
    
    for (auto& s : shapes) {
        s->draw();
        cout << "Area: " << s->area() << endl;
    }
    // Virtual destructor ensures proper cleanup
    // unique_ptr handles memory — no manual delete
}
```

---

### 🔧 Diamond Problem Solution (Complete)
```cpp
#include <iostream>
using namespace std;

class Person {
protected:
    string name;
public:
    Person(string n) : name(n) { cout << "Person ctor: " << n << endl; }
    virtual ~Person() { cout << "Person dtor\n"; }
};

class Student : virtual public Person {
protected:
    int studentId;
public:
    Student(string n, int id) : Person(n), studentId(id) {
        cout << "Student ctor\n";
    }
};

class Employee : virtual public Person {
protected:
    int empId;
public:
    Employee(string n, int id) : Person(n), empId(id) {
        cout << "Employee ctor\n";
    }
};

class TA : public Student, public Employee {
public:
    // Most-derived class calls virtual base ctor directly
    TA(string n, int sid, int eid) 
        : Person(n), Student(n, sid), Employee(n, eid) {
        cout << "TA ctor\n";
    }
};

int main() {
    TA ta("Rishi", 101, 202);
    cout << "Name: " << ta.name << endl;  // ✅ No ambiguity — one Person
}
// Output: Person ctor → Student ctor → Employee ctor → TA ctor
```

---

### 🔧 Preventing Object Slicing with Smart Pointers
```cpp
#include <iostream>
#include <vector>
#include <memory>
using namespace std;

class Animal {
public:
    virtual void speak() const = 0;
    virtual unique_ptr<Animal> clone() const = 0;  // Virtual "copy constructor"
    virtual ~Animal() {}
};

class Dog : public Animal {
    string breed;
public:
    Dog(string b) : breed(b) {}
    void speak() const override { cout << breed << " barks\n"; }
    unique_ptr<Animal> clone() const override {
        return make_unique<Dog>(*this);
    }
};

class Cat : public Animal {
public:
    void speak() const override { cout << "Cat meows\n"; }
    unique_ptr<Animal> clone() const override {
        return make_unique<Cat>(*this);
    }
};

int main() {
    // ✅ Polymorphic container with smart pointers — no slicing
    vector<unique_ptr<Animal>> zoo;
    zoo.push_back(make_unique<Dog>("Labrador"));
    zoo.push_back(make_unique<Cat>());
    zoo.push_back(zoo[0]->clone());  // Deep copy via virtual clone
    
    for (auto& animal : zoo)
        animal->speak();
    // Labrador barks / Cat meows / Labrador barks (clone)
}
```

---

### 🔧 Complete Operator Overloading (Complex Number)
```cpp
#include <iostream>
#include <cmath>
using namespace std;

class Complex {
    double real, imag;
public:
    Complex(double r = 0, double i = 0) : real(r), imag(i) {}
    
    Complex operator+(const Complex& o) const { return {real+o.real, imag+o.imag}; }
    Complex operator-(const Complex& o) const { return {real-o.real, imag-o.imag}; }
    Complex operator*(const Complex& o) const {
        return {real*o.real - imag*o.imag, real*o.imag + imag*o.real};
    }
    bool operator==(const Complex& o) const { return real==o.real && imag==o.imag; }
    
    Complex& operator++() { ++real; return *this; }                   // Prefix
    Complex operator++(int) { Complex t=*this; ++real; return t; }    // Postfix
    
    double magnitude() const { return sqrt(real*real + imag*imag); }
    
    friend ostream& operator<<(ostream& os, const Complex& c) {
        os << c.real;
        if (c.imag >= 0) os << "+";
        os << c.imag << "i";
        return os;
    }
};

int main() {
    Complex a(3, 4), b(1, -2);
    cout << "a = " << a << endl;             // 3+4i
    cout << "a+b = " << (a+b) << endl;       // 4+2i
    cout << "|a| = " << a.magnitude() << endl; // 5
}
```

---
---

# 🔍 SECTION 7: INTERVIEW QUESTIONS BANK

---

### Q1. What are the types of inheritance in C++? `[Infosys] [TCS] [Capgemini]`
**Answer:** Five types: Single (one base → one derived), Multiple (multiple bases → one derived), Multilevel (chain: A→B→C), Hierarchical (one base → multiple derived), Hybrid (combination, often creates diamond). C++ supports all five; Java doesn't support multiple inheritance of classes.

---

### Q2. What is the order of constructor and destructor calls? `[Amazon] [Microsoft] [Samsung]`
**Answer:** Construction: virtual bases first (left-to-right), then non-virtual bases (left-to-right), then members (declaration order), then derived body. Destruction: exact reverse. Virtual bases are constructed by the most-derived class.

---

### Q3. Explain the Diamond Problem and its solution. `[Google] [Amazon] [Adobe] [Microsoft]`
**Answer:** When class D inherits from B and C, both inheriting from A, D gets two copies of A → ambiguity. Fix: `class B : virtual public A` and `class C : virtual public A`. Now only ONE shared A exists. The most-derived class (D) must call A's constructor directly. Cost: extra vbptr (8 bytes) per virtual base path.

---

### Q4. Overloading vs Overriding? `[Every company]`
**Answer:** Overloading = same name, DIFFERENT parameters, resolved at compile time, same class. Overriding = same name AND same parameters, requires `virtual`, resolved at runtime via vtable, across base-derived. Overloading = compile-time polymorphism; Overriding = runtime polymorphism.

---

### Q5. How do virtual functions work internally? `[Google] [Microsoft] [Goldman Sachs] [Adobe]`
**Answer:** Each class with virtuals gets a vtable — array of function pointers to most-derived versions. Each object gets a hidden vptr (8 bytes) pointing to its class's vtable. Virtual call: `ptr→vptr→vtable[index]→call`. One vtable per class (shared), one vptr per object. Cost: one extra indirection per call + prevents inlining.

---

### Q6. What happens when you call a virtual function in a constructor? `[Google] [Microsoft] [Amazon]`
**Answer:** The BASE version is called, not derived. During base construction, vptr points to base's vtable because derived part doesn't exist yet. Same in destructor — derived already destroyed, vptr reset to base's vtable. Rule: never rely on polymorphic behavior in ctor/dtor.

---

### Q7. What is object slicing? How to prevent? `[Amazon] [Adobe] [Flipkart] [Microsoft]`
**Answer:** When derived object assigned to base BY VALUE, derived members + vtable are sliced off. Only base part remains. Polymorphism is lost. Prevention: use pointers or references. In containers: `vector<unique_ptr<Base>>` instead of `vector<Base>`.

---

### Q8. Explain the four C++ casts. `[Google] [DE Shaw] [Arcesium] [Goldman Sachs]`
**Answer:** `static_cast`: compile-time, no check — for known-safe conversions. `dynamic_cast`: runtime RTTI check, returns nullptr (ptr) or throws bad_cast (ref), requires virtual base. `const_cast`: add/remove const. `reinterpret_cast`: bit-level, most dangerous. Prefer `dynamic_cast` for downcasting.

---

### Q9. What is an abstract class? Can it have constructors? `[Amazon] [Oracle] [Samsung]`
**Answer:** Has ≥1 pure virtual function (`= 0`). Can't instantiate. YES, can have constructors (called by derived ctors), data members, concrete methods, static members. Defines an interface that derived classes must implement.

---

### Q10. What is name hiding in inheritance? `[Google] [Microsoft] [Adobe]`
**Answer:** When derived class declares a function with the same name as base (even different params), ALL base overloads are hidden — not just matching ones. Fix: `using Base::funcName;` in derived. This is different from overriding; hiding affects all overloads regardless of params.

---

### Q11. Explain `override` and `final`. `[Google] [Microsoft] [Adobe]`
**Answer:** `override`: declares intent to override a base virtual. Compiler error if no matching base virtual — catches typos, wrong params, missing const. `final` on function: prevents further overriding. `final` on class: prevents inheritance. Both also enable compiler optimizations (devirtualization).

---

### Q12. Which operators can't be overloaded? `[Amazon] [Goldman Sachs] [Flipkart]`
**Answer:** Cannot overload: `::` `.` `.*` `?:` `sizeof` `typeid` `alignof`. Must be member: `= () [] -> ->*`. Stream `<< >>` must be non-member (left operand is ostream). Return `ostream&` for chaining.

---

### Q13. Why use `friend` for `<<` overloading? `[Adobe] [Oracle] [Samsung]`
**Answer:** `<<`'s left operand is `ostream`, not our class. Member function would need `obj << cout` (unnatural). Non-member friend gives natural `cout << obj` syntax while accessing private members. Return `ostream&` for chaining: `cout << a << b`.

---

### Q14. What is virtual inheritance? When needed? `[Google] [Microsoft] [Amazon]`
**Answer:** Ensures one shared copy of base in diamond patterns. `class B : virtual public A`. Most-derived class calls virtual base ctor. Cost: vbptr (8 bytes) per virtual path, slight indirection. Only needed for diamond inheritance — rare in practice.

---

### Q15. Cost of virtual functions — would you use in performance-critical code? `[Google] [Qualcomm] [DE Shaw]`
**Answer:** Space: +8 bytes/object (vptr). Time: one indirection (~2-5ns), prevents inlining. For most code: negligible. In hot loops: consider CRTP for static polymorphism, or `final` for devirtualization. The compiler can devirtualize when exact type is known at compile time.

---

### Q16. How does `dynamic_cast` differ from `static_cast`? `[Amazon] [Goldman Sachs] [Arcesium]`
**Answer:** `static_cast`: compile-time, no overhead, no safety — UB if wrong type. `dynamic_cast`: runtime RTTI check, returns nullptr (ptr) or throws bad_cast (ref), requires ≥1 virtual in base. `dynamic_cast` is safer but slower; `static_cast` is faster but riskier.

---

### Q17. `public` vs `protected` vs `private` inheritance? `[Adobe] [Goldman Sachs] [Oracle]`
**Answer:** `public`: IS-A, most common, keeps access levels. `protected`: IS-A for children only, public→protected. `private`: IS-IMPLEMENTED-IN-TERMS-OF, all base members become private. Prefer composition over private inheritance. Multiple interface inheritance (all pure virtual) is the safe form of multiple inheritance.

---

### Q18. What is covariant return type? `[Google] [DE Shaw]`
**Answer:** Override can return a pointer/reference to a more-derived type. `Base::clone()` returns `Base*`, `Derived::clone()` returns `Derived*`. Avoids downcasting when static type is known.

---

### Q19. Can constructors be inherited? `[Amazon] [Oracle]`
**Answer:** Not automatically. C++11: `using Base::Base;` inherits all base constructors. They only init base part; derived members get default-initialized.

---

### Q20. Design implications of multiple inheritance? `[Google] [Microsoft] [Atlassian]`
**Answer:** Risks: diamond problem, ambiguity, complex ctor order. Acceptable when: inheriting from multiple pure interfaces (no data, only pure virtuals) — this is essentially Java's "implements". Avoid multiple concrete bases. Prefer composition. Use virtual inheritance for diamonds.

---
---

# 📎 ADVANCED NOTES (Optional — <5% interview frequency)

### CRTP (Curiously Recurring Template Pattern) `[Google, DE Shaw]`
> `class Derived : public Base<Derived>` — static polymorphism, zero overhead. Base calls derived methods via `static_cast<Derived*>(this)->method()`. Used in Eigen, `enable_shared_from_this`. Know it exists; explain only if asked.

```cpp
template <typename Derived>
class Shape {
public:
    double area() {
        return static_cast<Derived*>(this)->areaImpl();
    }
};

class Circle : public Shape<Circle> {
    double r;
public:
    Circle(double r) : r(r) {}
    double areaImpl() { return 3.14159 * r * r; }
};
// No vtable, no vptr — fully inlineable, zero overhead
```

### reinterpret_cast details
> Treats memory as different type at bit level. Uses: memory-mapped I/O, serialization, C interop. Highly platform-specific. Almost never needed in interviews.

### Pure virtual destructor
> `virtual ~Base() = 0;` — legal, makes class abstract, MUST provide body. Use when you want abstract class but no other pure virtual. One-line answer is enough.

### RTTI internals
> `typeid` reads type info embedded in vtable. `dynamic_cast` traverses class hierarchy at runtime. Can be disabled with `-fno-rtti` for smaller binaries. Prefer virtual functions over RTTI-based type checking.

### Overloading with type promotion
> `char` promotes to `int`, `float` to `double`, `bool` to `int`. Promotion order: bool → char → short → int → long → float → double. Rarely asked directly.

---
---

> **Previous:** [01_foundations_and_classes.md](./01_foundations_and_classes.md) — OOP Basics, Classes, Constructors, Destructors, RAII, Smart Pointers, Rule of Zero.
>
> **Next:** [03_advanced_cpp_oop.md](./03_advanced_cpp_oop.md) — Smart Pointers Deep Dive, Move Semantics, Copy Elision, Memory Layout with Polymorphism, RTTI.
