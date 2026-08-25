# Advanced C++ OOP — Elite Interview Revision Sheet

> 🎯 **Purpose:** Deep internals of C++ OOP — the stuff that separates senior-level answers from textbook answers.
> Every topic here is ACTUALLY asked in interviews. Know these cold.

---

## 📑 TABLE OF CONTENTS

| # | Topic | Interview Weight |
|---|-------|-----------------|
| 1 | Virtual Table (vtable) Internals | ⭐⭐⭐⭐⭐ |
| 2 | Copy Semantics (Rule of Three) | ⭐⭐⭐⭐⭐ |
| 3 | Move Semantics (Rule of Five) | ⭐⭐⭐⭐⭐ |
| 4 | Smart Pointers & OOP | ⭐⭐⭐⭐⭐ |
| 5 | Templates & OOP | ⭐⭐⭐⭐ |
| 6 | Exception Handling in OOP | ⭐⭐⭐ |
| 7 | Const Correctness (Deep) | ⭐⭐⭐⭐ |
| 8 | Name Mangling | ⭐⭐ |
| 9 | Copy Elision & RVO | ⭐⭐⭐ |
| 10 | Object Lifecycle | ⭐⭐⭐⭐ |

---

# SECTION 1: 🧠 THINKING FIRST — Why Advanced OOP?

```
Q: "Why do interviewers ask about vtables, move semantics, smart pointers?"

A: Because ANYONE can write a class. They want to know if you understand
   what the COMPILER does behind the scenes, how MEMORY works, and if
   you can write PRODUCTION-QUALITY C++ code.

Basic OOP   →  "I know what polymorphism is"
Advanced OOP →  "I know HOW polymorphism works at the assembly level,
                 and I know how to manage resources without leaks"
```

**The Three Pillars of Advanced C++ OOP:**
```
┌─────────────────────────────────────────────────┐
│           ADVANCED C++ OOP                      │
├────────────────┬────────────────┬────────────────┤
│  HOW IT WORKS  │  RESOURCE MGMT │  PERFORMANCE  │
│  INTERNALLY    │  (RAII)        │  OPTIMIZATION  │
│                │                │                │
│  vtable/vptr   │  Rule of 3/5  │  Move semantics│
│  Name mangling │  Smart pointers│  Copy elision  │
│  Object layout │  Exceptions   │  Templates     │
│  Construction  │  const correct │  CRTP          │
│  order         │                │                │
└────────────────┴────────────────┴────────────────┘
```

---

# SECTION 2: CORE CONCEPTS

---

## 1️⃣ VIRTUAL TABLE (VTABLE) INTERNALS

### 🧠 One-Line Definition
> **vtable** is a compiler-generated lookup table of function pointers that enables runtime polymorphism. **vptr** is a hidden pointer in each polymorphic object that points to its class's vtable.

### ⚡ Why It Matters
- **Interview:** "Explain how `virtual` works at the hardware level" — asked at Google, Microsoft, Samsung
- **Real-world:** Understanding vtable = understanding why virtual calls are slower, why you can't inline them, and the memory cost per object

### 🔍 Step-by-Step: How Virtual Dispatch Works

```
STEP 1: Compiler sees `virtual` keyword
        → Creates a vtable (array of function pointers) for that class

STEP 2: Compiler adds a hidden vptr (pointer) to every object of that class
        → vptr points to the class's vtable

STEP 3: When you call obj->virtualFunc():
        → Compiler generates: obj->vptr->vtable[index_of_func]()
        → This is an INDIRECT call (pointer chase)

STEP 4: At runtime, vptr points to the ACTUAL class's vtable
        → So the correct overridden function gets called
```

### 📊 Memory Layout — Single Inheritance

```cpp
class Animal {
public:
    virtual void speak() { cout << "..."; }
    virtual void eat()   { cout << "eating"; }
    int age;
};

class Dog : public Animal {
public:
    void speak() override { cout << "Woof!"; }
    int barkVolume;
};
```

```
MEMORY LAYOUT OF Dog OBJECT:
┌──────────────────────────────────┐
│  vptr (8 bytes on 64-bit)        │ ──→ Dog's vtable
├──────────────────────────────────┤
│  age (4 bytes, from Animal)      │
├──────────────────────────────────┤
│  padding (4 bytes, alignment)    │
├──────────────────────────────────┤
│  barkVolume (4 bytes, from Dog)  │
├──────────────────────────────────┤
│  padding (4 bytes, alignment)    │
└──────────────────────────────────┘

VTABLE FOR Animal:                  VTABLE FOR Dog:
┌─────────────────────┐            ┌─────────────────────┐
│ [0] → Animal::speak │            │ [0] → Dog::speak    │  ← OVERRIDDEN
│ [1] → Animal::eat   │            │ [1] → Animal::eat   │  ← INHERITED
└─────────────────────┘            └─────────────────────┘
```

### 📊 Memory Layout — Multiple Inheritance

```cpp
class Flyable {
public:
    virtual void fly() { cout << "flying"; }
};

class Swimmable {
public:
    virtual void swim() { cout << "swimming"; }
};

class Duck : public Flyable, public Swimmable {
public:
    void fly() override  { cout << "Duck flies"; }
    void swim() override { cout << "Duck swims"; }
};
```

```
MEMORY LAYOUT OF Duck OBJECT:
┌──────────────────────────────────┐
│  vptr_Flyable (8 bytes)          │ ──→ Duck's Flyable vtable
├──────────────────────────────────┤
│  vptr_Swimmable (8 bytes)        │ ──→ Duck's Swimmable vtable
└──────────────────────────────────┘

Duck's Flyable vtable:              Duck's Swimmable vtable:
┌─────────────────────┐            ┌─────────────────────┐
│ [0] → Duck::fly     │            │ [0] → Duck::swim    │
└─────────────────────┘            └─────────────────────┘

KEY INSIGHT: Multiple inheritance = MULTIPLE vptrs in the object!
             One vptr per base class that has virtual functions.
```

### ⚠️ Cost of Virtual Dispatch

| Aspect | Cost |
|--------|------|
| Memory per object | +8 bytes (one vptr on 64-bit) per polymorphic base |
| Call overhead | One pointer dereference (vptr → vtable → function) |
| Inlining | Compiler CANNOT inline virtual calls through base pointer |
| Cache | vtable access can cause cache miss |
| Branch prediction | Indirect call = harder for CPU to predict |

### 🔧 Code: Proving vptr Exists

```cpp
#include <iostream>
using namespace std;

class Base {
public:
    virtual void foo() { cout << "Base::foo\n"; }
    int x = 10;
};

class Derived : public Base {
public:
    void foo() override { cout << "Derived::foo\n"; }
    int y = 20;
};

int main() {
    cout << "Size of int:    " << sizeof(int) << endl;      // 4
    cout << "Size of Base:   " << sizeof(Base) << endl;     // 16 (8 vptr + 4 int + 4 padding)
    cout << "Size of Derived:" << sizeof(Derived) << endl;  // 16 or 24

    // Without virtual:
    // Size of Base would be just 4 (only int x)
    // The extra 8+ bytes = vptr!

    Base* ptr = new Derived();
    ptr->foo();  // "Derived::foo" — vtable dispatch!
    delete ptr;

    return 0;
}
```

---

## 2️⃣ COPY SEMANTICS (RULE OF THREE)

### 🧠 One-Line Definition
> **Rule of Three:** If a class needs a custom destructor, copy constructor, or copy assignment operator, it almost certainly needs ALL THREE.

### ⚡ Why It Matters
- **Interview:** "What happens when you copy this object?" — universal question
- **Real-world:** Failing to follow Rule of Three = double-free, memory leaks, undefined behavior

### 🔍 Shallow Copy vs Deep Copy

```
SHALLOW COPY (DEFAULT):
┌─────────────┐    copy    ┌─────────────┐
│ obj1         │  ──────→  │ obj2         │
│ data* ──────────────┐    │ data* ───┐   │
└─────────────┘       │    └──────────│───┘
                      ▼               ▼
                ┌──────────────────────┐
                │  SAME HEAP MEMORY    │  ← DANGER! Both point here!
                └──────────────────────┘
                When obj1 dies, it frees this memory.
                obj2 now has a DANGLING pointer! 💀

DEEP COPY (CUSTOM):
┌─────────────┐    copy    ┌─────────────┐
│ obj1         │  ──────→  │ obj2         │
│ data* ───┐   │           │ data* ───┐   │
└──────────│───┘           └──────────│───┘
           ▼                          ▼
   ┌──────────────┐          ┌──────────────┐
   │  HEAP MEM 1  │          │  HEAP MEM 2  │  ← SAFE! Separate copies!
   └──────────────┘          └──────────────┘
```

### 🔧 Complete Rule of Three Example

```cpp
#include <iostream>
#include <cstring>
using namespace std;

class MyString {
private:
    char* data;
    size_t length;

public:
    // ─── Constructor ───
    MyString(const char* str = "") {
        length = strlen(str);
        data = new char[length + 1];
        strcpy(data, str);
        cout << "Constructor: \"" << data << "\"\n";
    }

    // ─── 1. Destructor ───
    ~MyString() {
        cout << "Destructor: \"" << data << "\"\n";
        delete[] data;
    }

    // ─── 2. Copy Constructor ───
    // Called when: MyString b = a;  OR  MyString b(a);  OR  pass-by-value
    MyString(const MyString& other) {
        length = other.length;
        data = new char[length + 1];    // Allocate NEW memory
        strcpy(data, other.data);       // Copy the content
        cout << "Copy Constructor: \"" << data << "\"\n";
    }

    // ─── 3. Copy Assignment Operator ───
    // Called when: b = a;  (b already exists)
    MyString& operator=(const MyString& other) {
        cout << "Copy Assignment: \"" << other.data << "\"\n";

        if (this == &other) return *this;  // Self-assignment check!

        delete[] data;                     // Free OLD memory

        length = other.length;
        data = new char[length + 1];       // Allocate NEW memory
        strcpy(data, other.data);          // Copy content

        return *this;                      // Return *this for chaining: a = b = c
    }

    void print() const { cout << data << " (len=" << length << ")\n"; }
};

int main() {
    MyString s1("Hello");        // Constructor
    MyString s2 = s1;            // Copy Constructor (NOT assignment!)
    MyString s3("World");        // Constructor
    s3 = s1;                     // Copy Assignment Operator

    s1.print();  // Hello
    s2.print();  // Hello (independent copy)
    s3.print();  // Hello (was World, now copied)

    return 0;
    // Destructors called in reverse order: s3, s2, s1
}
```

### ⚠️ Copy Constructor vs Assignment — When is Which Called?

| Scenario | What's Called | Example |
|----------|--------------|---------|
| Initializing new object from existing | Copy Constructor | `MyString b = a;` |
| Initializing with parentheses | Copy Constructor | `MyString b(a);` |
| Passing by value to function | Copy Constructor | `void foo(MyString s)` |
| Returning by value from function | Copy Constructor (maybe elided) | `return s;` |
| Assigning to already-existing object | Copy Assignment | `b = a;` (b already declared) |

---

## 3️⃣ MOVE SEMANTICS (RULE OF FIVE)

### 🧠 One-Line Definition
> **Move semantics** allow transferring resources from a temporary (dying) object instead of copying them — turning an O(n) copy into an O(1) pointer swap.

### ⚡ Lvalues vs Rvalues — The Foundation

```
LVALUE: Has a name. Has an address. Lives beyond the expression.
        Example: int x = 5;    // x is an lvalue

RVALUE: Temporary. No name. Dies at semicolon.
        Example: 5             // 5 is an rvalue
                 x + y         // result is an rvalue
                 getString()   // returned temporary is an rvalue
```

```cpp
int x = 10;        // x = lvalue, 10 = rvalue
int& ref = x;      // OK: lvalue reference binds to lvalue
// int& ref2 = 10; // ERROR: lvalue reference can't bind to rvalue
int&& rref = 10;   // OK: rvalue reference binds to rvalue
// int&& rref2 = x;// ERROR: rvalue reference can't bind to lvalue

int&& rref3 = std::move(x);  // OK: std::move CASTS x to rvalue reference
```

### ⚠️ CRITICAL: What `std::move` Actually Does

```
std::move DOES NOT MOVE ANYTHING!

It is a CAST. It converts an lvalue into an rvalue reference.
This ALLOWS a move constructor/assignment to be called.
The actual "moving" happens in YOUR move constructor/assignment.

std::move(x) ≈ static_cast<MyString&&>(x)
```

### 🔧 Complete Rule of Five Example

```cpp
#include <iostream>
#include <cstring>
#include <utility>  // for std::move, std::exchange
using namespace std;

class MyString {
private:
    char* data;
    size_t length;

public:
    // ─── Constructor ───
    MyString(const char* str = "") {
        length = strlen(str);
        data = new char[length + 1];
        strcpy(data, str);
        cout << "  [Construct] \"" << data << "\"\n";
    }

    // ─── 1. Destructor ───
    ~MyString() {
        cout << "  [Destruct]  \"" << (data ? data : "null") << "\"\n";
        delete[] data;
    }

    // ─── 2. Copy Constructor (deep copy) ───
    MyString(const MyString& other)
        : length(other.length), data(new char[length + 1]) {
        strcpy(data, other.data);
        cout << "  [Copy Ctor] \"" << data << "\"\n";
    }

    // ─── 3. Copy Assignment ───
    MyString& operator=(const MyString& other) {
        cout << "  [Copy =]    \"" << other.data << "\"\n";
        if (this != &other) {
            delete[] data;
            length = other.length;
            data = new char[length + 1];
            strcpy(data, other.data);
        }
        return *this;
    }

    // ─── 4. Move Constructor (STEAL resources) ───
    MyString(MyString&& other) noexcept
        : data(other.data), length(other.length) {
        // Steal the pointer — O(1)!
        other.data = nullptr;   // Leave source in valid state
        other.length = 0;
        cout << "  [Move Ctor] \"" << data << "\"\n";
    }

    // ─── 5. Move Assignment (STEAL resources) ───
    MyString& operator=(MyString&& other) noexcept {
        cout << "  [Move =]    \"" << other.data << "\"\n";
        if (this != &other) {
            delete[] data;          // Free our old resource

            data = other.data;      // Steal their resource
            length = other.length;

            other.data = nullptr;   // Leave source in valid state
            other.length = 0;
        }
        return *this;
    }

    void print() const {
        cout << "  Value: " << (data ? data : "null") << "\n";
    }
};

int main() {
    cout << "--- Creating s1 ---\n";
    MyString s1("Hello World");

    cout << "\n--- Copy construct s2 from s1 ---\n";
    MyString s2 = s1;                    // Copy constructor (s1 is lvalue)

    cout << "\n--- Move construct s3 from temporary ---\n";
    MyString s3 = MyString("Temporary"); // Move constructor (rvalue)

    cout << "\n--- Move construct s4 using std::move ---\n";
    MyString s4 = std::move(s1);         // Move constructor (cast to rvalue)

    cout << "\n--- s1 after move ---\n";
    s1.print();                          // null! Resources stolen.

    cout << "\n--- s4 has s1's old data ---\n";
    s4.print();                          // "Hello World"

    cout << "\n--- Destructors ---\n";
    return 0;
}
```

### 📊 Copy vs Move — Performance Comparison

```
COPY a string of 1 million chars:
  1. Allocate 1,000,001 bytes on heap    → O(1) but slow (system call)
  2. Copy 1,000,000 characters           → O(n)  ← THE BOTTLENECK
  Total: O(n)

MOVE a string of 1 million chars:
  1. Copy the pointer (8 bytes)          → O(1)
  2. Copy the length (8 bytes)           → O(1)
  3. Set source pointer to nullptr       → O(1)
  Total: O(1)  ← MASSIVE win!
```

### 🔧 `= default` and `= delete`

```cpp
class Widget {
public:
    Widget() = default;                          // Use compiler-generated default
    Widget(const Widget&) = delete;              // FORBID copying
    Widget& operator=(const Widget&) = delete;   // FORBID copy assignment
    Widget(Widget&&) = default;                  // Use compiler-generated move
    Widget& operator=(Widget&&) = default;       // Use compiler-generated move assign

    // This is the "move-only" idiom — used by unique_ptr, thread, etc.
};
```

### 📊 Rule of 0 / 3 / 5 Decision Tree

```
Does your class manage a resource (raw pointer, file handle, mutex)?
│
├── NO → Rule of Zero
│        Don't write any of the 5.
│        Use smart pointers, std::string, std::vector instead.
│        Let the compiler handle everything.
│
└── YES → Do you need to support copying?
          │
          ├── YES → Rule of Five
          │         Write: destructor + copy ctor + copy = + move ctor + move =
          │
          └── NO  → Rule of Five (with delete)
                    Write: destructor + move ctor + move =
                    Delete: copy ctor + copy =
```

---

## 4️⃣ SMART POINTERS & OOP

### 🧠 One-Line Definition
> Smart pointers are RAII wrappers around raw pointers that automatically manage memory lifetime — no manual `delete` needed.

### ⚡ Why It Matters
- **Interview:** "How do you manage memory in modern C++?" — if you say `new/delete`, you've dated yourself
- **Real-world:** Smart pointers eliminate entire categories of bugs: leaks, double-free, dangling pointers

### 📊 Smart Pointer Comparison

| Feature | `unique_ptr` | `shared_ptr` | `weak_ptr` |
|---------|-------------|-------------|------------|
| Ownership | Exclusive (1 owner) | Shared (N owners) | No ownership |
| Overhead | Zero (same as raw ptr) | Reference count (2 atomic ints) | Points to control block |
| Copyable | ❌ No (move only) | ✅ Yes | ✅ Yes |
| Movable | ✅ Yes | ✅ Yes | ✅ Yes |
| Use case | Default choice | Shared ownership needed | Break circular refs |
| Thread-safe ref count | N/A | ✅ Yes | ✅ Yes |

### 🔧 `unique_ptr` — The Default Choice

```cpp
#include <iostream>
#include <memory>
#include <vector>
using namespace std;

class Animal {
public:
    virtual void speak() const = 0;
    virtual ~Animal() = default;  // Virtual destructor — ESSENTIAL!
};

class Dog : public Animal {
public:
    void speak() const override { cout << "Woof!\n"; }
    ~Dog() { cout << "Dog destroyed\n"; }
};

class Cat : public Animal {
public:
    void speak() const override { cout << "Meow!\n"; }
    ~Cat() { cout << "Cat destroyed\n"; }
};

int main() {
    // ─── Basic unique_ptr ───
    auto dog = make_unique<Dog>();  // Preferred over unique_ptr<Dog>(new Dog())
    dog->speak();

    // ─── Polymorphism with unique_ptr ───
    vector<unique_ptr<Animal>> zoo;
    zoo.push_back(make_unique<Dog>());
    zoo.push_back(make_unique<Cat>());
    zoo.push_back(make_unique<Dog>());

    for (const auto& animal : zoo) {
        animal->speak();  // Polymorphic call!
    }

    // ─── Transfer ownership ───
    unique_ptr<Animal> pet = make_unique<Dog>();
    // unique_ptr<Animal> pet2 = pet;        // ERROR: can't copy!
    unique_ptr<Animal> pet2 = move(pet);     // OK: transfer ownership
    // pet is now nullptr

    return 0;
    // All animals automatically destroyed when vector goes out of scope!
}
```

### 🔧 `shared_ptr` — Shared Ownership

```cpp
#include <iostream>
#include <memory>
using namespace std;

class Node {
public:
    int value;
    shared_ptr<Node> next;

    Node(int v) : value(v) { cout << "Node " << v << " created\n"; }
    ~Node() { cout << "Node " << value << " destroyed\n"; }
};

int main() {
    shared_ptr<Node> a = make_shared<Node>(1);
    cout << "Ref count of a: " << a.use_count() << "\n";  // 1

    {
        shared_ptr<Node> b = a;  // Share ownership
        cout << "Ref count of a: " << a.use_count() << "\n";  // 2
        cout << "Ref count of b: " << b.use_count() << "\n";  // 2
    }
    // b goes out of scope, ref count drops to 1

    cout << "Ref count of a: " << a.use_count() << "\n";  // 1
    return 0;
    // a goes out of scope, ref count drops to 0, Node destroyed
}
```

### 🔧 `weak_ptr` — Breaking Circular References

```cpp
#include <iostream>
#include <memory>
using namespace std;

// ─── THE PROBLEM: Circular reference with shared_ptr ───
class PersonBad {
public:
    string name;
    shared_ptr<PersonBad> partner;  // Circular!

    PersonBad(string n) : name(n) { cout << name << " created\n"; }
    ~PersonBad() { cout << name << " destroyed\n"; }
};

// ─── THE FIX: Use weak_ptr to break the cycle ───
class Person {
public:
    string name;
    weak_ptr<Person> partner;  // weak_ptr does NOT own!

    Person(string n) : name(n) { cout << name << " created\n"; }
    ~Person() { cout << name << " destroyed\n"; }

    void showPartner() {
        if (auto p = partner.lock()) {  // Convert weak_ptr → shared_ptr
            cout << name << "'s partner is " << p->name << "\n";
        } else {
            cout << name << " has no partner (expired)\n";
        }
    }
};

int main() {
    // Bad example (memory leak):
    {
        auto alice = make_shared<PersonBad>("Alice");
        auto bob = make_shared<PersonBad>("Bob");
        alice->partner = bob;
        bob->partner = alice;
        // Neither gets destroyed! Ref counts never reach 0!
    }
    cout << "--- Bad example done (notice: no destructor calls!) ---\n\n";

    // Good example (no leak):
    {
        auto alice = make_shared<Person>("Alice");
        auto bob = make_shared<Person>("Bob");
        alice->partner = bob;   // weak_ptr, doesn't increase ref count
        bob->partner = alice;

        alice->showPartner();
        bob->showPartner();
    }
    cout << "--- Good example done (destructors called!) ---\n";

    return 0;
}
```

### 🔧 Factory Pattern with Smart Pointers

```cpp
#include <iostream>
#include <memory>
using namespace std;

class Shape {
public:
    virtual void draw() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
public:
    void draw() const override { cout << "Drawing Circle\n"; }
};

class Square : public Shape {
public:
    void draw() const override { cout << "Drawing Square\n"; }
};

// Factory function returns unique_ptr — caller gets ownership
unique_ptr<Shape> createShape(const string& type) {
    if (type == "circle") return make_unique<Circle>();
    if (type == "square") return make_unique<Square>();
    return nullptr;
}

int main() {
    auto shape1 = createShape("circle");
    auto shape2 = createShape("square");

    if (shape1) shape1->draw();
    if (shape2) shape2->draw();
    // Automatic cleanup!
    return 0;
}
```

### ⚠️ Why `make_unique` / `make_shared` Over `new`

```cpp
// BAD: Two separate operations — can leak if exception between them
void bad(unique_ptr<A> a, unique_ptr<B> b);
bad(unique_ptr<A>(new A()), unique_ptr<B>(new B()));
// If new A() succeeds but new B() throws, A leaks!

// GOOD: Single expression — exception safe
bad(make_unique<A>(), make_unique<B>());
// Also: make_shared does ONE allocation (object + control block together)
```

---

## 5️⃣ TEMPLATES & OOP

### 🧠 One-Line Definition
> **Templates** enable compile-time polymorphism — the compiler generates specialized code for each type used, giving zero runtime overhead.

### 🔧 Class Templates

```cpp
#include <iostream>
#include <stdexcept>
using namespace std;

template <typename T, int MaxSize = 100>
class Stack {
private:
    T data[MaxSize];
    int top;

public:
    Stack() : top(-1) {}

    void push(const T& val) {
        if (top >= MaxSize - 1)
            throw overflow_error("Stack overflow");
        data[++top] = val;
    }

    T pop() {
        if (top < 0)
            throw underflow_error("Stack underflow");
        return data[top--];
    }

    T peek() const {
        if (top < 0)
            throw underflow_error("Stack empty");
        return data[top];
    }

    bool isEmpty() const { return top < 0; }
    int size() const { return top + 1; }
};

int main() {
    Stack<int, 50> intStack;
    intStack.push(10);
    intStack.push(20);
    cout << "Top: " << intStack.peek() << "\n";  // 20

    Stack<string> strStack;  // Uses default MaxSize = 100
    strStack.push("hello");
    strStack.push("world");
    cout << "Top: " << strStack.peek() << "\n";  // "world"

    return 0;
}
```

### 🔧 Function Templates

```cpp
template <typename T>
T maxOf(T a, T b) {
    return (a > b) ? a : b;
}

// Template specialization for C-strings
template <>
const char* maxOf<const char*>(const char* a, const char* b) {
    return (strcmp(a, b) > 0) ? a : b;
}

int main() {
    cout << maxOf(3, 7) << "\n";              // 7 (int version)
    cout << maxOf(3.14, 2.71) << "\n";        // 3.14 (double version)
    cout << maxOf("apple", "banana") << "\n"; // banana (specialized version)
    return 0;
}
```

### 🔧 CRTP — Static Polymorphism (Curiously Recurring Template Pattern)

```
CRTP: A class Derived inherits from Base<Derived>.
      The base class can call methods on the derived class at COMPILE TIME.
      No vtable, no virtual functions, no runtime overhead!
```

```cpp
#include <iostream>
using namespace std;

// CRTP Base
template <typename Derived>
class Shape {
public:
    void draw() const {
        // Compile-time dispatch — no vtable!
        static_cast<const Derived*>(this)->drawImpl();
    }

    double area() const {
        return static_cast<const Derived*>(this)->areaImpl();
    }
};

class Circle : public Shape<Circle> {
    double radius;
public:
    Circle(double r) : radius(r) {}

    void drawImpl() const { cout << "Drawing Circle (r=" << radius << ")\n"; }
    double areaImpl() const { return 3.14159 * radius * radius; }
};

class Square : public Shape<Square> {
    double side;
public:
    Square(double s) : side(s) {}

    void drawImpl() const { cout << "Drawing Square (s=" << side << ")\n"; }
    double areaImpl() const { return side * side; }
};

// No virtual function calls! Everything resolved at compile time.
template <typename ShapeType>
void printArea(const Shape<ShapeType>& shape) {
    shape.draw();
    cout << "Area: " << shape.area() << "\n";
}

int main() {
    Circle c(5.0);
    Square s(3.0);
    printArea(c);  // Drawing Circle, Area: 78.5398
    printArea(s);  // Drawing Square, Area: 9
    return 0;
}
```

### 📊 Virtual Functions vs Templates — Tradeoff

| Aspect | Virtual (Runtime) | Templates/CRTP (Compile-time) |
|--------|-------------------|-------------------------------|
| Polymorphism type | Runtime | Compile-time |
| Performance | Indirect call, no inlining | Direct call, fully inlined |
| Binary size | Smaller | Larger (code bloat) |
| Flexibility | Can mix types in one container | Cannot (different template instantiations = different types) |
| Compilation | Faster | Slower (template instantiation) |
| Use case | Heterogeneous collections | Performance-critical, known types |

---

## 6️⃣ EXCEPTION HANDLING IN OOP

### 🧠 One-Line Definition
> Exceptions provide a structured way to handle errors by separating error-detection code from error-handling code, using `try-catch-throw`.

### 🔧 Custom Exception Hierarchy

```cpp
#include <iostream>
#include <exception>
#include <string>
using namespace std;

// ─── Custom Exception Hierarchy ───
class AppException : public exception {
protected:
    string message;
public:
    AppException(const string& msg) : message(msg) {}
    const char* what() const noexcept override { return message.c_str(); }
};

class DatabaseException : public AppException {
public:
    DatabaseException(const string& msg)
        : AppException("Database Error: " + msg) {}
};

class ConnectionException : public DatabaseException {
public:
    ConnectionException(const string& host)
        : DatabaseException("Cannot connect to " + host) {}
};

class QueryException : public DatabaseException {
public:
    QueryException(const string& query)
        : DatabaseException("Invalid query: " + query) {}
};

class AuthException : public AppException {
public:
    AuthException(const string& user)
        : AppException("Auth Error: Access denied for " + user) {}
};

// ─── Usage ───
class Database {
public:
    void connect(const string& host) {
        // Simulate connection failure
        throw ConnectionException(host);
    }

    void query(const string& sql) {
        if (sql.empty())
            throw QueryException("(empty query)");
    }
};

int main() {
    Database db;

    try {
        db.connect("192.168.1.100");
    }
    catch (const ConnectionException& e) {
        // Most specific catch first!
        cout << "Connection failed: " << e.what() << "\n";
    }
    catch (const DatabaseException& e) {
        cout << "DB error: " << e.what() << "\n";
    }
    catch (const AppException& e) {
        cout << "App error: " << e.what() << "\n";
    }
    catch (const exception& e) {
        cout << "Unknown: " << e.what() << "\n";
    }

    return 0;
}
```

### 📊 Exception Safety Guarantees

| Guarantee | Meaning | Example |
|-----------|---------|---------|
| **No-throw** | Function never throws. Marked `noexcept`. | Destructors, move ops, swap |
| **Strong** | If exception thrown, state rolls back to before the call. | `vector::push_back` (usually) |
| **Basic** | If exception thrown, no leaks, invariants preserved, but state may change. | Most standard library ops |
| **No guarantee** | Anything can happen. | Bad code ❌ |

### 🔧 `noexcept` — Performance Impact

```cpp
class Buffer {
    int* data;
    size_t sz;
public:
    // Move constructor MUST be noexcept for std::vector to use it!
    Buffer(Buffer&& other) noexcept
        : data(other.data), sz(other.sz) {
        other.data = nullptr;
        other.sz = 0;
    }
    // If move ctor is NOT noexcept, vector::push_back will COPY instead!
    // This is because vector needs strong exception guarantee during reallocation.
};
```

---

## 7️⃣ CONST CORRECTNESS (DEEP)

### 🧠 One-Line Definition
> **Const correctness** means using `const` everywhere possible to communicate intent, enable compiler optimizations, and catch bugs at compile time.

### 🔧 Const Member Functions

```cpp
class BankAccount {
    double balance;
    mutable int accessCount;  // Can be modified even in const functions!

public:
    BankAccount(double b) : balance(b), accessCount(0) {}

    // const member function — promises not to modify the object
    double getBalance() const {
        accessCount++;  // OK! mutable allows this
        return balance;
    }

    // Non-const — can modify the object
    void deposit(double amount) {
        balance += amount;
    }

    int getAccessCount() const { return accessCount; }
};

int main() {
    const BankAccount savings(1000);
    cout << savings.getBalance() << "\n";  // OK: getBalance is const
    // savings.deposit(100);                // ERROR: deposit is non-const!

    BankAccount checking(500);
    cout << checking.getBalance() << "\n"; // OK: const func callable on non-const obj
    checking.deposit(200);                 // OK: non-const obj can call non-const func

    return 0;
}
```

### 🔧 `const_cast` — Removing const (use SPARINGLY)

```cpp
// LEGITIMATE use: calling a non-const API from a const context
void legacyPrint(char* str) {  // Old C API, doesn't modify str but forgot const
    printf("%s\n", str);
}

void modernFunc(const char* str) {
    legacyPrint(const_cast<char*>(str));  // OK if legacyPrint truly doesn't modify
}
```

### 🔧 `constexpr` in Classes

```cpp
class Point {
    double x, y;
public:
    constexpr Point(double x, double y) : x(x), y(y) {}

    constexpr double getX() const { return x; }
    constexpr double getY() const { return y; }

    constexpr double distanceFromOrigin() const {
        return x * x + y * y;  // Computed at COMPILE TIME if possible
    }
};

int main() {
    constexpr Point p(3.0, 4.0);
    constexpr double dist = p.distanceFromOrigin();  // Computed at compile time!
    // dist = 25.0, no runtime calculation needed

    static_assert(dist == 25.0, "Distance should be 25");
    return 0;
}
```

### 📊 Const Correctness Cheat Sheet

| Declaration | Meaning |
|------------|---------|
| `const int x = 5;` | x cannot be changed |
| `const int* p = &x;` | Pointer to const int — can't change *p |
| `int* const p = &x;` | Const pointer to int — can't change p itself |
| `const int* const p = &x;` | Both pointer and pointee are const |
| `void foo() const;` | Member function won't modify the object |
| `mutable int x;` | x can be modified even in const member functions |
| `constexpr int f();` | Function can be evaluated at compile time |

**Read pointer declarations RIGHT to LEFT:**
- `const int* p` → "p is a pointer to int that is const" → pointer to const
- `int* const p` → "p is a const pointer to int" → const pointer

---

## 8️⃣ NAME MANGLING

### 🧠 One-Line Definition
> **Name mangling** is the compiler's process of encoding function signatures (name + parameter types + namespace + class) into unique symbol names to support function overloading.

### ⚡ Why C++ Needs It, But C Doesn't

```
C:   Only function name matters → void foo(int) and void foo(double) CAN'T coexist
C++: Supports overloading → compiler must differentiate foo(int) from foo(double)

Compiler encodes:
  foo(int)         →  _Z3fooi
  foo(double)      →  _Z3food
  foo(int, double) →  _Z3fooid
  MyClass::foo()   →  _ZN7MyClass3fooEv
```

### 🔧 `extern "C"` — Interoperability

```cpp
// When you need C++ code callable from C, or call a C library from C++:

extern "C" {
    void my_c_function(int x);        // No mangling applied
    int another_c_function(double d); // Linker sees plain name
}

// Common pattern in header files:
#ifdef __cplusplus
extern "C" {
#endif

void c_api_function(int param);

#ifdef __cplusplus
}
#endif
```

### 🔧 Viewing Mangled Names

```bash
# Linux/macOS: use c++filt to demangle
$ nm myprogram | c++filt

# Or compile and look at symbols:
$ g++ -c example.cpp
$ nm example.o
# Output: _Z3fooi    → mangled name for foo(int)
$ echo _Z3fooi | c++filt
# Output: foo(int)   → demangled!

# Windows (MSVC): use undname or dumpbin
$ dumpbin /symbols example.obj
```

---

## 9️⃣ COPY ELISION & RVO

### 🧠 One-Line Definition
> **Copy elision** is a compiler optimization that eliminates unnecessary copy/move operations by constructing objects directly in their final location.

### 🔧 Return Value Optimization (RVO / NRVO)

```cpp
#include <iostream>
using namespace std;

class Heavy {
public:
    Heavy() { cout << "Constructor\n"; }
    Heavy(const Heavy&) { cout << "Copy Constructor\n"; }
    Heavy(Heavy&&) { cout << "Move Constructor\n"; }
};

// RVO (unnamed return) — GUARANTEED in C++17
Heavy createRVO() {
    return Heavy();  // Constructed directly in caller's space
}

// NRVO (Named Return Value Optimization) — NOT guaranteed but usually happens
Heavy createNRVO() {
    Heavy h;
    // ... do stuff with h ...
    return h;  // Compiler MIGHT construct h directly in caller's space
}

int main() {
    cout << "--- RVO ---\n";
    Heavy h1 = createRVO();
    // Output: Constructor (only! No copy or move — guaranteed C++17)

    cout << "\n--- NRVO ---\n";
    Heavy h2 = createNRVO();
    // Output: Constructor (usually just this — NRVO kicks in)
    // Without NRVO: Constructor + Move Constructor

    return 0;
}
```

### 📊 Copy Elision Rules

| Scenario | C++11/14 | C++17 |
|----------|----------|-------|
| Return temporary: `return T();` | Permitted (optional) | **Guaranteed (mandatory)** |
| Return named local: `return x;` | Permitted (optional) | Permitted (optional) |
| Initialize from temporary: `T x = T();` | Permitted (optional) | **Guaranteed (mandatory)** |

### ⚠️ Impact on Object Lifecycle

```
WITHOUT copy elision:
  1. Construct temporary in function
  2. Copy/Move to return slot
  3. Copy/Move from return slot to caller's variable
  = Up to 3 constructions!

WITH copy elision (C++17):
  1. Construct directly in caller's variable
  = 1 construction!

IMPORTANT: Don't rely on copy/move constructor side effects!
           The compiler may skip them entirely.
```

---

## 🔟 OBJECT LIFECYCLE

### 🧠 One-Line Definition
> Objects follow a strict lifecycle: memory allocation → construction (base → members → derived body) → usage → destruction (reverse order) → deallocation.

### 📊 Construction Order

```cpp
#include <iostream>
using namespace std;

class Member {
    string name;
public:
    Member(const string& n) : name(n) { cout << "  Member constructed: " << name << "\n"; }
    ~Member() { cout << "  Member destroyed: " << name << "\n"; }
};

class Base {
    Member baseMember{"BaseMember"};
public:
    Base() { cout << "  Base constructor body\n"; }
    virtual ~Base() { cout << "  Base destructor body\n"; }
};

class Derived : public Base {
    Member derivedMember1{"DerivedMember1"};
    Member derivedMember2{"DerivedMember2"};
public:
    Derived() { cout << "  Derived constructor body\n"; }
    ~Derived() { cout << "  Derived destructor body\n"; }
};

int main() {
    cout << "=== CONSTRUCTION ORDER ===\n";
    Derived d;
    cout << "\n=== DESTRUCTION ORDER (reverse!) ===\n";
    return 0;
}

/* OUTPUT:
=== CONSTRUCTION ORDER ===
  Member constructed: BaseMember         ← 1. Base's members first
  Base constructor body                  ← 2. Base constructor body
  Member constructed: DerivedMember1     ← 3. Derived's members (declaration order!)
  Member constructed: DerivedMember2     ← 4. Next member
  Derived constructor body               ← 5. Derived constructor body

=== DESTRUCTION ORDER (reverse!) ===
  Derived destructor body                ← 5 → 1 (reverse)
  Member destroyed: DerivedMember2
  Member destroyed: DerivedMember1
  Base destructor body
  Member destroyed: BaseMember
*/
```

### 🔧 `explicit` Keyword

```cpp
class Celsius {
    double temp;
public:
    explicit Celsius(double t) : temp(t) {}  // explicit prevents implicit conversion
    double get() const { return temp; }
};

void printTemp(Celsius c) {
    cout << c.get() << "°C\n";
}

int main() {
    Celsius c1(36.6);         // OK: direct initialization
    // Celsius c2 = 36.6;     // ERROR: implicit conversion blocked by explicit
    Celsius c3 = Celsius(36.6); // OK: explicit construction
    // printTemp(36.6);       // ERROR: implicit conversion blocked
    printTemp(Celsius(36.6)); // OK: explicit conversion
    return 0;
}
```

### ⚠️ Temporary Object Lifetime

```cpp
class Temp {
public:
    Temp()  { cout << "Created\n"; }
    ~Temp() { cout << "Destroyed\n"; }
    void use() const { cout << "Using\n"; }
};

int main() {
    Temp().use();  // Created → Using → Destroyed (at semicolon!)

    const Temp& ref = Temp();  // Lifetime EXTENDED to match reference!
    ref.use();
    // Destroyed when ref goes out of scope
    return 0;
}
```

---

# SECTION 3: ⚠️ COMMON TRAPS

| # | Trap | What Happens | Fix |
|---|------|-------------|-----|
| 1 | Slicing: `Base b = derived;` | Derived part is cut off | Use `Base* ptr` or `Base&` |
| 2 | Forgetting virtual destructor | Derived destructor never called → leak | Always make base destructor virtual |
| 3 | `std::move` doesn't move | It's just a cast, move happens in move ctor | Understand it's `static_cast<T&&>` |
| 4 | Using object after `std::move` | Object is in "valid but unspecified" state | Don't use moved-from objects |
| 5 | Forgetting `noexcept` on move ops | `vector` will COPY instead of move on realloc | Always mark move ops `noexcept` |
| 6 | Shallow copy with raw pointers | Double-free on destruction | Implement deep copy or use smart pointers |
| 7 | `const` function returning non-const ref | Breaks const correctness | Return `const T&` from const methods |
| 8 | Catching exceptions by value | Object slicing on exception hierarchy | Always catch by `const reference` |
| 9 | Circular `shared_ptr` | Memory leak — ref count never hits 0 | Use `weak_ptr` for back-references |
| 10 | Member init order ≠ declaration order | Members initialize in DECLARATION order, not initializer list order | Match init list to declaration order |

---

# SECTION 4: 🧠 MENTAL MODELS

### vtable = Restaurant Menu
```
The menu (vtable) lists all dishes (virtual functions) the restaurant serves.
Each restaurant (class) has its own menu.
When you order (call a virtual function), the waiter (vptr) looks at the
specific restaurant's menu to find the right dish.

Different restaurants can serve the same dish differently (override).
```

### Smart Pointers = Apartment Lease
```
unique_ptr = You're the SOLE tenant. You leave, apartment gets demolished.
shared_ptr = Multiple roommates. Last one to leave turns off the lights.
weak_ptr   = You have a FRIEND's address. You can visit if they're still there,
             but you don't stop the apartment from being demolished.
```

### Move Semantics = Moving House
```
COPY: Photocopy every piece of furniture and put it in the new house.
      Original house still has everything. EXPENSIVE.

MOVE: Load furniture onto a truck and drive to the new house.
      Original house is now EMPTY. CHEAP.

std::move = Putting a "FOR MOVING" sign on the house.
            The actual moving happens when the moving company (move ctor) arrives.
```

### CRTP = Crystal Ball
```
The base class has a crystal ball (template parameter) that lets it see
the derived class at COMPILE TIME. No need to wait until runtime (no vtable).
```

---

# SECTION 5: ⚡ INTERVIEW SPEED MODE

### "Which smart pointer should I use?"
```
Need shared ownership? ──→ shared_ptr
Breaking a cycle?      ──→ weak_ptr
Everything else?       ──→ unique_ptr (DEFAULT CHOICE)
```

### "Should I use virtual or CRTP?"
```
Need heterogeneous container (vector of different types)? ──→ Virtual
Know all types at compile time + need performance?        ──→ CRTP
```

### "Rule of 0 / 3 / 5?"
```
Managing raw resource? ──→ Rule of 5 (or 5 with delete for move-only)
Using only RAII types?  ──→ Rule of 0 (write nothing)
```

### "When to use `const`?"
```
If it shouldn't change → make it const.
Member function doesn't modify object? → const.
Parameter only read? → const reference.
WHEN IN DOUBT → ADD CONST.
```

---

# SECTION 6: 🔧 CODE MEMORY BLOCKS

### Memory Block 1: Rule of Five Template

```cpp
class Resource {
    int* data;
    size_t size;

public:
    // Constructor
    explicit Resource(size_t sz) : size(sz), data(new int[sz]{}) {}

    // 1. Destructor
    ~Resource() { delete[] data; }

    // 2. Copy Constructor
    Resource(const Resource& other) : size(other.size), data(new int[size]) {
        copy(other.data, other.data + size, data);
    }

    // 3. Copy Assignment (copy-and-swap idiom)
    Resource& operator=(Resource other) {  // Note: pass by VALUE
        swap(*this, other);
        return *this;
    }

    // 4. Move Constructor
    Resource(Resource&& other) noexcept
        : data(exchange(other.data, nullptr)), size(exchange(other.size, 0)) {}

    // 5. Move Assignment
    // (Handled by copy assignment with pass-by-value — works for both copy and move!)

    // Friend swap
    friend void swap(Resource& a, Resource& b) noexcept {
        using std::swap;
        swap(a.data, b.data);
        swap(a.size, b.size);
    }
};
```

### Memory Block 2: Polymorphism with Smart Pointers

```cpp
class Base {
public:
    virtual void execute() = 0;
    virtual ~Base() = default;
};

class DerivedA : public Base {
public:
    void execute() override { /* ... */ }
};

class DerivedB : public Base {
public:
    void execute() override { /* ... */ }
};

// Factory
unique_ptr<Base> create(const string& type) {
    if (type == "A") return make_unique<DerivedA>();
    if (type == "B") return make_unique<DerivedB>();
    return nullptr;
}

// Usage
vector<unique_ptr<Base>> items;
items.push_back(create("A"));
items.push_back(create("B"));
for (auto& item : items) item->execute();
```

### Memory Block 3: Custom Exception Class

```cpp
class AppError : public runtime_error {
    int code;
public:
    AppError(const string& msg, int code)
        : runtime_error(msg), code(code) {}
    int getCode() const noexcept { return code; }
};

// Usage
try {
    throw AppError("File not found", 404);
} catch (const AppError& e) {
    cerr << "Error " << e.getCode() << ": " << e.what() << "\n";
}
```

---

# SECTION 7: 📋 INTERVIEW QUESTIONS BANK

## Deep-Dive Questions (20 Questions)

### vtable & Virtual Dispatch

| # | Question | Company Tags | Key Points |
|---|----------|-------------|------------|
| 1 | "Explain how virtual function dispatch works at the assembly level." | Google, Microsoft, Samsung R&D | vptr → vtable → function pointer → indirect call. Mention cache miss cost. |
| 2 | "What is the size overhead of virtual functions? How does multiple inheritance affect it?" | Qualcomm, Adobe, DE Shaw | +8 bytes per polymorphic base. Multiple inheritance = multiple vptrs. |
| 3 | "Can you call a virtual function from a constructor? What happens?" | Amazon, Microsoft, Goldman Sachs | Yes, but it calls BASE version, not derived! vtable not fully set up yet. |
| 4 | "Why should destructors be virtual in base classes?" | EVERY COMPANY | Without virtual destructor, `delete basePtr` won't call derived destructor → resource leak. |

### Copy & Move Semantics

| # | Question | Company Tags | Key Points |
|---|----------|-------------|------------|
| 5 | "What is the difference between copy constructor and copy assignment operator?" | Amazon, Flipkart, Infosys | Copy ctor: creates NEW object. Copy =: overwrites EXISTING object. Must handle self-assignment in operator=. |
| 6 | "What does std::move actually do? Does it move anything?" | Google, Microsoft, DE Shaw | NO! It's just a `static_cast<T&&>`. The actual move happens in the move ctor/assignment. |
| 7 | "Explain the Rule of Five with an example." | Adobe, Samsung R&D, Oracle | Destructor + copy ctor + copy = + move ctor + move =. Show complete class managing dynamic memory. |
| 8 | "What happens to an object after std::move?" | Amazon, Goldman Sachs, Arcesium | It's in a "valid but unspecified" state. Only safe operations: destruction and assignment. |
| 9 | "Why should move operations be marked noexcept?" | Google, Microsoft, Qualcomm | std::vector uses move during reallocation ONLY if noexcept. Otherwise falls back to copy for strong exception guarantee. |

### Smart Pointers

| # | Question | Company Tags | Key Points |
|---|----------|-------------|------------|
| 10 | "Explain the difference between unique_ptr, shared_ptr, and weak_ptr." | EVERY COMPANY | unique=exclusive ownership, shared=ref counted, weak=non-owning observer. |
| 11 | "How does shared_ptr reference counting work? Is it thread-safe?" | Google, Amazon, DE Shaw | Control block with atomic ref count. The ref count ops are thread-safe, but the pointed-to object is NOT. |
| 12 | "What is a circular reference? How do you break it?" | Microsoft, Adobe, Walmart | Two shared_ptrs pointing to each other → ref count never 0 → leak. Fix: make one a weak_ptr. |
| 13 | "Why is make_shared preferred over shared_ptr constructor?" | Goldman Sachs, Arcesium, Oracle | Single allocation (object + control block together), exception safety, cache friendliness. |

### Templates & CRTP

| # | Question | Company Tags | Key Points |
|---|----------|-------------|------------|
| 14 | "What is CRTP? How does it achieve static polymorphism?" | Google, Samsung R&D, Qualcomm | Derived inherits Base<Derived>. Base can call Derived methods via static_cast. No vtable overhead. |
| 15 | "Templates vs virtual functions — when would you choose each?" | Microsoft, Adobe, DE Shaw | Virtual: heterogeneous containers, runtime flexibility. Templates: performance-critical, compile-time known types. |

### Exception Handling

| # | Question | Company Tags | Key Points |
|---|----------|-------------|------------|
| 16 | "What are the exception safety guarantees?" | Google, Amazon, Microsoft | No-throw (never throws), Strong (rollback), Basic (no leaks, invariants hold). |
| 17 | "Should destructors throw exceptions? Why or why not?" | Adobe, Samsung R&D, Goldman Sachs | NO! If destructor throws during stack unwinding from another exception → std::terminate(). Mark `noexcept`. |

### Const Correctness & Lifecycle

| # | Question | Company Tags | Key Points |
|---|----------|-------------|------------|
| 18 | "What is the 'mutable' keyword used for?" | Amazon, Flipkart, Capgemini | Allows modification of a member even in const member functions. Use for caches, mutexes, counters. |
| 19 | "Explain object construction and destruction order in inheritance." | Microsoft, Adobe, Oracle | Construction: Base members → Base body → Derived members → Derived body. Destruction: EXACT reverse. |
| 20 | "What is copy elision? Is it guaranteed?" | Google, DE Shaw, Qualcomm | Compiler skips copy/move by constructing directly in target. Guaranteed for temporaries in C++17 (prvalue). NRVO is optional. |

---

## 🎯 Quick Interview Answers — Rapid Fire

| Question | 10-Second Answer |
|----------|-----------------|
| What is a vtable? | Compiler-generated array of virtual function pointers. Each polymorphic class gets one. |
| What is a vptr? | Hidden pointer in every polymorphic object, pointing to its class's vtable. |
| Rule of Three? | If you write destructor, copy ctor, or copy =, write all three. |
| Rule of Five? | Rule of Three + move ctor + move =. Modern C++. |
| Rule of Zero? | Don't write any of the five. Use smart pointers and RAII containers. |
| std::move does what? | Casts lvalue to rvalue reference. Doesn't actually move anything. |
| unique_ptr vs shared_ptr? | unique = sole owner (zero overhead). shared = ref counted (has overhead). |
| Why make_shared? | One allocation instead of two. Exception safe. Cache friendly. |
| What is CRTP? | Derived : Base<Derived>. Static polymorphism. No vtable. |
| extern "C"? | Disables name mangling. Needed for C/C++ interop. |
| noexcept on move? | Required for vector to use move during reallocation. |
| Copy elision? | Compiler builds object directly in target, skipping copy/move. |
| mutable? | Member modifiable even in const functions. |
| explicit? | Prevents implicit type conversions in constructors. |
| Catch by value or reference? | ALWAYS by const reference. Avoids slicing and copying. |

---

> 🏁 **END OF FILE 3** — You now understand HOW C++ OOP works under the hood.
> Next: `04_solid_principles.md` — Design principles that make you write GOOD OOP code.
