# Tricky OOP Interview Questions — Elite Revision Sheet

> 🎯 **55+ trap questions** that interviewers ACTUALLY use. Every question has: answer, WHY, and company tags.
> ⚠️ These are designed to trick you. Read CAREFULLY before answering.

---

## 📋 Quick Navigation

| Category | Count | Difficulty |
|----------|-------|------------|
| [1. Output Prediction](#category-1--output-prediction) | 15 | ⭐⭐⭐ |
| [2. Spot the Bug](#category-2--spot-the-bug) | 10 | ⭐⭐⭐ |
| [3. Compare & Contrast](#category-3--compare--contrast) | 10 | ⭐⭐ |
| [4. Can You Do This?](#category-4--can-you-do-this) | 10 | ⭐⭐ |
| [5. Explain the Behavior](#category-5--explain-the-behavior) | 5 | ⭐⭐⭐ |
| [6. Real-World Reasoning](#category-6--real-world-reasoning) | 5 | ⭐⭐ |

---
---

# CATEGORY 1 — 🔍 OUTPUT PREDICTION

> "What is the output of this program?" — The #1 most asked OOP question format.

---

### Q1. Constructor/Destructor Order in Inheritance
**Tags:** `Microsoft` `Adobe` `Samsung R&D` `Goldman Sachs`

```cpp
#include <iostream>
using namespace std;

class A {
public:
    A()  { cout << "A "; }
    ~A() { cout << "~A "; }
};

class B : public A {
public:
    B()  { cout << "B "; }
    ~B() { cout << "~B "; }
};

class C : public B {
public:
    C()  { cout << "C "; }
    ~C() { cout << "~C "; }
};

int main() {
    C obj;
    return 0;
}
```

<details>
<summary>▶ Answer</summary>

```
A B C ~C ~B ~A
```

**WHY:** Constructors are called **base → derived** (top-down). Destructors are called **derived → base** (bottom-up). This is ALWAYS the rule — no exceptions.

**Mental Model:** Think of building a house — you lay the foundation (base) first, build walls (middle), then roof (derived). Demolition is the reverse.

**🚨 Trap:** If someone says "C B A ~A ~B ~C" — they confused constructor order with destructor order.

</details>

---

### Q2. Virtual Function Call in Constructor
**Tags:** `Google` `Microsoft` `Goldman Sachs` `DE Shaw`

```cpp
#include <iostream>
using namespace std;

class Base {
public:
    Base() { show(); }           // ← calling virtual in constructor!
    virtual void show() { cout << "Base::show" << endl; }
};

class Derived : public Base {
public:
    Derived() { show(); }
    void show() override { cout << "Derived::show" << endl; }
};

int main() {
    Derived d;
    return 0;
}
```

<details>
<summary>▶ Answer</summary>

```
Base::show
Derived::show
```

**WHY:** When `Base()` constructor runs, the `Derived` part of the object **doesn't exist yet**. The vtable pointer still points to `Base`'s vtable. So `show()` resolves to `Base::show`. By the time `Derived()` constructor runs, the vtable is updated to `Derived`'s vtable.

**🔑 Rule:** Virtual mechanism is **disabled** inside constructors and destructors. The call resolves to the class currently being constructed/destroyed.

**🚨 Trap:** Many candidates say "Derived::show" twice — WRONG. The virtual dispatch doesn't work in the base constructor.

</details>

---

### Q3. Object Slicing When Passing by Value
**Tags:** `Amazon` `Adobe` `Goldman Sachs` `Qualcomm`

```cpp
#include <iostream>
using namespace std;

class Base {
public:
    virtual void greet() { cout << "Hello from Base" << endl; }
};

class Derived : public Base {
public:
    void greet() override { cout << "Hello from Derived" << endl; }
};

void sayHello(Base b) {    // ← pass by VALUE
    b.greet();
}

int main() {
    Derived d;
    sayHello(d);
    return 0;
}
```

<details>
<summary>▶ Answer</summary>

```
Hello from Base
```

**WHY:** When you pass `Derived` object by value to a function expecting `Base`, **object slicing** occurs. The `Derived` part is chopped off. Only the `Base` portion is copied. The vtable pointer in the copy points to `Base`'s vtable.

**🔑 Fix:** Pass by reference or pointer:
```cpp
void sayHello(Base& b) { b.greet(); }   // → "Hello from Derived"
void sayHello(Base* b) { b->greet(); }  // → "Hello from Derived"
```

**🚨 Trap:** Students who say "Hello from Derived" don't understand slicing.

</details>

---

### Q4. Static Member Behavior
**Tags:** `Amazon` `Infosys` `Oracle` `Walmart`

```cpp
#include <iostream>
using namespace std;

class Counter {
    static int count;
public:
    Counter()  { count++; }
    ~Counter() { count--; }
    static int getCount() { return count; }
};

int Counter::count = 0;

int main() {
    Counter c1;
    {
        Counter c2;
        Counter c3;
        cout << Counter::getCount() << " ";  // ← ?
    }
    cout << Counter::getCount() << endl;      // ← ?
    return 0;
}
```

<details>
<summary>▶ Answer</summary>

```
3 1
```

**WHY:** 
- After creating `c1`, `c2`, `c3` → count = 3
- Inner block prints 3
- `c2` and `c3` go out of scope (reverse order) → destructors decrement count to 1
- Outer block prints 1

**🔑 Key:** Static members are **shared across ALL objects**. They're not per-instance. They live until program ends.

</details>

---

### Q5. Multiple Inheritance Ambiguity
**Tags:** `Adobe` `Samsung R&D` `Qualcomm` `Microsoft`

```cpp
#include <iostream>
using namespace std;

class A {
public:
    void show() { cout << "A" << endl; }
};

class B {
public:
    void show() { cout << "B" << endl; }
};

class C : public A, public B {};

int main() {
    C obj;
    obj.show();   // ← What happens?
    return 0;
}
```

<details>
<summary>▶ Answer</summary>

```
COMPILATION ERROR: ambiguous call to 'show'
```

**WHY:** Both `A` and `B` have `show()`. The compiler can't decide which one to call. This is the **ambiguity problem** in multiple inheritance.

**🔑 Fix:** Use scope resolution:
```cpp
obj.A::show();  // calls A's show
obj.B::show();  // calls B's show
```
Or override `show()` in class C.

</details>

---

### Q6. Order of Member Initialization (Initializer List vs Declaration Order)
**Tags:** `Google` `Goldman Sachs` `DE Shaw` `Microsoft`

```cpp
#include <iostream>
using namespace std;

class Demo {
    int a, b;
public:
    Demo(int x) : b(x), a(b) {   // ← initializer list order != declaration order
        cout << "a = " << a << ", b = " << b << endl;
    }
};

int main() {
    Demo d(10);
    return 0;
}
```

<details>
<summary>▶ Answer</summary>

```
a = <garbage>, b = 10
```

**WHY:** Members are initialized in **declaration order** (`a` then `b`), NOT in initializer list order. So `a` is initialized first using `b`, but `b` hasn't been initialized yet → `a` gets garbage. Then `b` is initialized to 10.

**🔑 Rule:** ALWAYS match initializer list order with declaration order. Most compilers will warn you (`-Wreorder`).

**🚨 Trap:** This is one of the MOST asked questions at Goldman Sachs and DE Shaw. Many candidates say `a = 10, b = 10`.

</details>

---

### Q7. Copy Constructor vs Assignment Operator
**Tags:** `Microsoft` `Adobe` `Goldman Sachs` `Amazon`

```cpp
#include <iostream>
using namespace std;

class Box {
public:
    Box()                   { cout << "Default "; }
    Box(const Box& other)   { cout << "Copy "; }
    Box& operator=(const Box& other) { cout << "Assign "; return *this; }
    ~Box()                  { cout << "Destroy "; }
};

int main() {
    Box b1;           // line 1
    Box b2 = b1;      // line 2 ← COPY or ASSIGN?
    Box b3;           // line 3
    b3 = b1;          // line 4 ← COPY or ASSIGN?
    return 0;
}
```

<details>
<summary>▶ Answer</summary>

```
Default Copy Default Assign Destroy Destroy Destroy
```

**WHY:**
- Line 1: Default constructor → `"Default"`
- Line 2: **Copy constructor** (NOT assignment!) — `Box b2 = b1` is initialization, not assignment → `"Copy"`
- Line 3: Default constructor → `"Default"`
- Line 4: **Assignment operator** — `b3` already exists, so `=` is assignment → `"Assign"`
- Destructors for b3, b2, b1 in reverse order → `"Destroy Destroy Destroy"`

**🔑 Rule:** `Type obj = other;` is ALWAYS copy constructor. `obj = other;` (when obj already exists) is assignment.

</details>

---

### Q8. Temporary Object Creation and Destruction
**Tags:** `Goldman Sachs` `DE Shaw` `Google` `Adobe`

```cpp
#include <iostream>
using namespace std;

class Temp {
public:
    Temp()            { cout << "C "; }
    Temp(const Temp&) { cout << "CC "; }
    ~Temp()           { cout << "D "; }
};

Temp createTemp() {
    Temp t;
    return t;
}

int main() {
    Temp t = createTemp();
    cout << "END ";
    return 0;
}
```

<details>
<summary>▶ Answer</summary>

```
With copy elision (C++17 mandatory):   C END D
Without copy elision (pre-C++17):      C CC D CC D END D  (or C CC D END D)
```

**WHY:** C++17 guarantees **copy elision** (Return Value Optimization / Named Return Value Optimization). The temporary is constructed directly in `t`'s memory. No copy constructor is called.

**🔑 Key:** In interviews, ALWAYS mention copy elision but state both possibilities:
- "With C++17 mandatory copy elision: `C END D`"
- "Without elision: there would be additional copy constructor and destructor calls"

**🚨 Trap:** If interviewer says "assume no optimization", the answer changes. Always clarify.

</details>

---

### Q9. const Correctness Violation
**Tags:** `Google` `Microsoft` `Goldman Sachs`

```cpp
#include <iostream>
using namespace std;

class Data {
    int value;
public:
    Data(int v) : value(v) {}
    void print()       { cout << value << endl; }   // non-const
    // void print() const { cout << value << endl; }  // const version missing
};

int main() {
    const Data d(42);
    d.print();    // ← What happens?
    return 0;
}
```

<details>
<summary>▶ Answer</summary>

```
COMPILATION ERROR: 'this' argument to member function 'print' has type 'const Data', 
but function is not marked const
```

**WHY:** `d` is a `const` object. You can only call `const` member functions on a `const` object. `print()` is not marked `const`, so the compiler rejects the call.

**🔑 Fix:** Mark `print()` as const:
```cpp
void print() const { cout << value << endl; }
```

**🔑 Rule:** If a function doesn't modify the object, ALWAYS mark it `const`. This is essential for working with `const` references.

</details>

---

### Q10. Virtual vs Non-Virtual Function Resolution
**Tags:** `Amazon` `Microsoft` `Adobe` `Samsung R&D`

```cpp
#include <iostream>
using namespace std;

class Base {
public:
    void func()         { cout << "Base::func" << endl; }
    virtual void vfunc() { cout << "Base::vfunc" << endl; }
};

class Derived : public Base {
public:
    void func()          { cout << "Derived::func" << endl; }
    void vfunc() override { cout << "Derived::vfunc" << endl; }
};

int main() {
    Base* ptr = new Derived();
    ptr->func();      // ← non-virtual
    ptr->vfunc();     // ← virtual
    delete ptr;
    return 0;
}
```

<details>
<summary>▶ Answer</summary>

```
Base::func
Derived::vfunc
```

**WHY:**
- `func()` is **non-virtual** → resolved at **compile time** based on pointer TYPE (`Base*`) → calls `Base::func`
- `vfunc()` is **virtual** → resolved at **runtime** based on actual OBJECT type (`Derived`) → calls `Derived::vfunc`

**🔑 Rule:** 
- Non-virtual → **early binding** (compile-time, based on pointer/reference type)
- Virtual → **late binding** (runtime, based on actual object type via vtable)

</details>

---

### Q11. Diamond Problem Output
**Tags:** `Adobe` `Samsung R&D` `Qualcomm` `DE Shaw`

```cpp
#include <iostream>
using namespace std;

class A {
public:
    int x;
    A() : x(10) { cout << "A(" << x << ") "; }
};

class B : virtual public A {
public:
    B() { cout << "B "; }
};

class C : virtual public A {
public:
    C() { cout << "C "; }
};

class D : public B, public C {
public:
    D() { cout << "D "; }
};

int main() {
    D obj;
    cout << endl << "x = " << obj.x << endl;
    return 0;
}
```

<details>
<summary>▶ Answer</summary>

```
A(10) B C D
x = 10
```

**WHY:** With `virtual` inheritance, `A` is constructed **only once** (by the most derived class `D`). Order: virtual bases first (`A`), then direct bases left-to-right (`B`, `C`), then `D`. There's only ONE copy of `x`.

**Without `virtual`:** `A` would be constructed TWICE, and `obj.x` would be ambiguous (compilation error).

</details>

---

### Q12. Static Function Can't Access `this`
**Tags:** `Infosys` `Oracle` `Walmart` `Capgemini`

```cpp
#include <iostream>
using namespace std;

class MyClass {
    int data = 5;
public:
    static void display() {
        cout << data << endl;   // ← What happens?
    }
};

int main() {
    MyClass::display();
    return 0;
}
```

<details>
<summary>▶ Answer</summary>

```
COMPILATION ERROR: invalid use of member 'data' in static member function
```

**WHY:** Static member functions do NOT have a `this` pointer. They belong to the **class**, not to any object. They can only access static members.

**🔑 Fix:** Either make `data` static, or pass an object to the function:
```cpp
static void display(const MyClass& obj) { cout << obj.data << endl; }
```

</details>

---

### Q13. Pointer Type vs Object Type with Non-Virtual Destructor
**Tags:** `Microsoft` `Goldman Sachs` `DE Shaw` `Adobe`

```cpp
#include <iostream>
using namespace std;

class Base {
public:
    Base()  { cout << "Base() "; }
    ~Base() { cout << "~Base() "; }     // ← NOT virtual!
};

class Derived : public Base {
    int* data;
public:
    Derived() : data(new int[100]) { cout << "Derived() "; }
    ~Derived() { delete[] data; cout << "~Derived() "; }
};

int main() {
    Base* ptr = new Derived();
    cout << "| ";
    delete ptr;                         // ← What's called?
    return 0;
}
```

<details>
<summary>▶ Answer</summary>

```
Base() Derived() | ~Base()
```

**WHY:** `delete ptr` calls destructor based on **pointer type** (`Base*`), not object type. Since `~Base()` is NOT virtual, only `~Base()` is called. `~Derived()` is NEVER called → **memory leak** (100 ints leaked!).

**🔑 Fix:** Make destructor virtual: `virtual ~Base() { ... }`

**🚨 This is UNDEFINED BEHAVIOR.** The C++ standard says deleting a derived object through a base pointer when the base destructor is non-virtual is UB. In practice, the derived destructor is skipped.

</details>

---

### Q14. Overloaded Function with Default Arguments
**Tags:** `Oracle` `Infosys` `Amazon` `Flipkart`

```cpp
#include <iostream>
using namespace std;

class Calc {
public:
    void compute(int a, int b = 10) { cout << a + b << endl; }
    void compute(int a)              { cout << a * 2 << endl; }
};

int main() {
    Calc c;
    c.compute(5);   // ← Which overload?
    return 0;
}
```

<details>
<summary>▶ Answer</summary>

```
COMPILATION ERROR: call to 'compute' is ambiguous
```

**WHY:** `compute(5)` matches BOTH:
- `compute(int a, int b = 10)` → with default argument
- `compute(int a)` → exact match

The compiler can't decide → ambiguity error.

**🔑 Rule:** Never have an overloaded function where one version's default arguments create the same signature as another version.

</details>

---

### Q15. Pure Virtual Function with Definition
**Tags:** `Google` `Microsoft` `DE Shaw` `Goldman Sachs`

```cpp
#include <iostream>
using namespace std;

class Abstract {
public:
    virtual void action() = 0;    // pure virtual
};

void Abstract::action() {         // ← definition of pure virtual!
    cout << "Abstract::action" << endl;
}

class Concrete : public Abstract {
public:
    void action() override {
        Abstract::action();       // ← calling pure virtual's body
        cout << "Concrete::action" << endl;
    }
};

int main() {
    Concrete obj;
    obj.action();
    return 0;
}
```

<details>
<summary>▶ Answer</summary>

```
Abstract::action
Concrete::action
```

**WHY:** A pure virtual function CAN have a definition (body). You just can't call it through virtual dispatch — you must use `ClassName::function()` explicitly. The class is STILL abstract (can't instantiate directly).

**🔑 Use Case:** Providing a default implementation that derived classes can optionally call via `Base::function()`.

</details>

---
---

# CATEGORY 2 — 🐛 SPOT THE BUG

> "What's wrong with this code?" — Tests your ability to find subtle issues.

---

### Q1. Missing Virtual Destructor Causing Memory Leak
**Tags:** `Microsoft` `Goldman Sachs` `Google` `Amazon`

```cpp
class Shape {
public:
    Shape() {}
    ~Shape() {}                    // ← BUG HERE
};

class Circle : public Shape {
    double* radius;
public:
    Circle(double r) : radius(new double(r)) {}
    ~Circle() { delete radius; }
};

int main() {
    Shape* s = new Circle(5.0);
    delete s;                      // ← Memory leak!
    return 0;
}
```

<details>
<summary>▶ Bug & Fix</summary>

**🐛 Bug:** `~Shape()` is NOT virtual. When we `delete s` (a `Shape*` pointing to `Circle`), only `~Shape()` is called. `~Circle()` is NEVER called → `radius` leaks.

**✅ Fix:**
```cpp
virtual ~Shape() {}
```

**🔑 Rule:** If a class has ANY virtual function, its destructor MUST be virtual. If a class is meant to be a base class, make the destructor virtual.

</details>

---

### Q2. Object Slicing in Function Parameters
**Tags:** `Adobe` `Amazon` `Qualcomm`

```cpp
class Animal {
public:
    virtual string speak() { return "..."; }
};

class Dog : public Animal {
    string name;
public:
    Dog(string n) : name(n) {}
    string speak() override { return name + " says Woof!"; }
};

void makeSpeak(Animal a) {        // ← BUG HERE
    cout << a.speak() << endl;
}

int main() {
    Dog d("Rex");
    makeSpeak(d);    // Expected: "Rex says Woof!", Actual: "..."
}
```

<details>
<summary>▶ Bug & Fix</summary>

**🐛 Bug:** `makeSpeak` takes `Animal` by VALUE. Object slicing occurs — the `Dog` part (including `name`) is chopped off.

**✅ Fix:**
```cpp
void makeSpeak(const Animal& a) {    // pass by reference
    cout << a.speak() << endl;
}
```

**🔑 Rule:** ALWAYS pass polymorphic objects by reference or pointer, NEVER by value.

</details>

---

### Q3. Dangling Pointer After Object Goes Out of Scope
**Tags:** `Goldman Sachs` `DE Shaw` `Microsoft`

```cpp
class Widget {
    int value;
public:
    Widget(int v) : value(v) {}
    int getValue() { return value; }
};

Widget* createWidget() {
    Widget w(42);
    return &w;            // ← BUG HERE
}

int main() {
    Widget* ptr = createWidget();
    cout << ptr->getValue();    // ← Undefined behavior!
}
```

<details>
<summary>▶ Bug & Fix</summary>

**🐛 Bug:** `w` is a local variable. It's destroyed when `createWidget()` returns. `ptr` becomes a **dangling pointer** — it points to freed stack memory. Accessing it is UB.

**✅ Fix:** Allocate on heap:
```cpp
Widget* createWidget() {
    return new Widget(42);    // caller must delete
}
// Or better: use smart pointers
unique_ptr<Widget> createWidget() {
    return make_unique<Widget>(42);
}
```

</details>

---

### Q4. Self-Assignment in operator=
**Tags:** `Google` `Goldman Sachs` `DE Shaw` `Microsoft`

```cpp
class String {
    char* data;
    int len;
public:
    String(const char* s) {
        len = strlen(s);
        data = new char[len + 1];
        strcpy(data, s);
    }
    String& operator=(const String& other) {
        delete[] data;                      // ← BUG: deletes own data first!
        len = other.len;
        data = new char[len + 1];
        strcpy(data, other.data);           // ← if self-assign, data is already freed!
        return *this;
    }
    ~String() { delete[] data; }
};

int main() {
    String s("hello");
    s = s;                // ← CRASH or corruption!
}
```

<details>
<summary>▶ Bug & Fix</summary>

**🐛 Bug:** No self-assignment check. When `s = s`, we first `delete[] data`, then try to `strcpy` from `other.data` — which IS the same deleted memory!

**✅ Fix (3 approaches):**
```cpp
// Approach 1: Self-assignment check
String& operator=(const String& other) {
    if (this == &other) return *this;    // ← guard
    delete[] data;
    len = other.len;
    data = new char[len + 1];
    strcpy(data, other.data);
    return *this;
}

// Approach 2: Copy-and-Swap idiom (BEST — also exception-safe)
String& operator=(String other) {       // pass by value (makes a copy)
    swap(data, other.data);
    swap(len, other.len);
    return *this;                        // old data destroyed with 'other'
}
```

</details>

---

### Q5. Missing Deep Copy Leading to Double-Free
**Tags:** `Microsoft` `Adobe` `Goldman Sachs` `Samsung R&D`

```cpp
class Array {
    int* arr;
    int size;
public:
    Array(int n) : size(n), arr(new int[n]) {}
    ~Array() { delete[] arr; }
    // No copy constructor or operator= defined!
};

int main() {
    Array a(10);
    Array b = a;     // ← BUG: shallow copy
}   // ← CRASH: double-free!
```

<details>
<summary>▶ Bug & Fix</summary>

**🐛 Bug:** The compiler generates a **default copy constructor** that does a shallow copy. Both `a.arr` and `b.arr` point to the SAME memory. When `b` is destroyed, it `delete[]`s the array. When `a` is destroyed, it tries to `delete[]` the SAME array → **double-free → crash**.

**✅ Fix:** Implement the **Rule of Three** (or Rule of Five in C++11):
```cpp
class Array {
    int* arr;
    int size;
public:
    Array(int n) : size(n), arr(new int[n]) {}
    
    // Copy constructor (deep copy)
    Array(const Array& other) : size(other.size), arr(new int[other.size]) {
        copy(other.arr, other.arr + size, arr);
    }
    
    // Assignment operator (deep copy)
    Array& operator=(const Array& other) {
        if (this != &other) {
            delete[] arr;
            size = other.size;
            arr = new int[size];
            copy(other.arr, other.arr + size, arr);
        }
        return *this;
    }
    
    ~Array() { delete[] arr; }
};
```

</details>

---

### Q6. Calling Virtual Function in Constructor (Unexpected Dispatch)
**Tags:** `Google` `Microsoft` `DE Shaw`

```cpp
class Base {
public:
    Base() { init(); }                  // ← BUG: virtual call in constructor
    virtual void init() { cout << "Base::init" << endl; }
};

class Derived : public Base {
    int* resource;
public:
    Derived() { /* expects init() to set up resource */ }
    void init() override {
        resource = new int(42);         // ← NEVER called from Base()!
        cout << "Derived::init" << endl;
    }
    void use() { cout << *resource << endl; }  // ← resource uninitialized!
};

int main() {
    Derived d;
    d.use();    // ← Undefined behavior: resource was never allocated!
}
```

<details>
<summary>▶ Bug & Fix</summary>

**🐛 Bug:** `Base()` constructor calls `init()`, but virtual dispatch in constructors uses the BASE version. `Derived::init()` is NEVER called → `resource` is never allocated → `d.use()` dereferences an uninitialized pointer.

**✅ Fix:** Don't call virtual functions from constructors. Use a factory pattern instead:
```cpp
class Derived : public Base {
public:
    Derived() { 
        resource = new int(42);   // do initialization directly
    }
};

// Or use a two-phase initialization with a factory:
static unique_ptr<Derived> create() {
    auto d = make_unique<Derived>();
    d->init();    // called AFTER construction is complete
    return d;
}
```

</details>

---

### Q7. Returning Reference to Local Variable
**Tags:** `Amazon` `Microsoft` `Oracle` `Flipkart`

```cpp
class Calculator {
public:
    int& add(int a, int b) {
        int result = a + b;
        return result;           // ← BUG: returning reference to local!
    }
};

int main() {
    Calculator c;
    int& r = c.add(3, 4);
    cout << r << endl;           // ← UB: dangling reference
}
```

<details>
<summary>▶ Bug & Fix</summary>

**🐛 Bug:** `result` is a local variable on the stack. Returning a reference to it creates a **dangling reference** — the memory is freed when `add()` returns.

**✅ Fix:** Return by value:
```cpp
int add(int a, int b) { return a + b; }
```

**🔑 Rule:** NEVER return references or pointers to local variables. Only return references to:
- Member variables
- Static variables
- Heap-allocated objects
- Parameters passed by reference

</details>

---

### Q8. Infinite Loop in Copy Constructor
**Tags:** `Goldman Sachs` `DE Shaw` `Adobe`

```cpp
class Broken {
public:
    Broken() {}
    Broken(Broken other) {        // ← BUG: pass by VALUE!
        // copy stuff...
    }
};

int main() {
    Broken b1;
    Broken b2 = b1;    // ← infinite recursion → stack overflow
}
```

<details>
<summary>▶ Bug & Fix</summary>

**🐛 Bug:** The copy constructor takes its argument **by value**. To pass by value, the compiler needs to COPY the argument — which calls the copy constructor — which needs to copy — which calls the copy constructor... → **infinite recursion**.

**✅ Fix:** Copy constructor MUST take a `const reference`:
```cpp
Broken(const Broken& other) { /* copy stuff */ }
```

**🔑 Rule:** Copy constructors ALWAYS take `const ClassName&`. The compiler will refuse to compile a copy constructor that takes by value (this is actually a compilation error in modern C++).

</details>

---

### Q9. Memory Leak with Polymorphic Containers
**Tags:** `Google` `Amazon` `Microsoft`

```cpp
#include <vector>
using namespace std;

class Shape {
public:
    virtual void draw() = 0;
    virtual ~Shape() {}           // at least destructor is virtual
};

class Circle : public Shape {
    double* radius;
public:
    Circle(double r) : radius(new double(r)) {}
    void draw() override { cout << "Circle" << endl; }
    ~Circle() { delete radius; }
};

int main() {
    vector<Shape*> shapes;
    shapes.push_back(new Circle(5));
    shapes.push_back(new Circle(10));
    shapes.push_back(new Circle(15));
    
    shapes.clear();    // ← BUG: only removes pointers, doesn't delete objects!
    return 0;
}
```

<details>
<summary>▶ Bug & Fix</summary>

**🐛 Bug:** `vector::clear()` removes the pointers from the vector but does NOT call `delete` on them. The `Circle` objects (and their `radius` allocations) are leaked.

**✅ Fix:** Delete before clearing, or use smart pointers:
```cpp
// Option 1: Manual cleanup
for (Shape* s : shapes) delete s;
shapes.clear();

// Option 2: Smart pointers (PREFERRED)
vector<unique_ptr<Shape>> shapes;
shapes.push_back(make_unique<Circle>(5));
// shapes.clear() now automatically deletes everything
```

</details>

---

### Q10. Diamond Problem Without Virtual Inheritance
**Tags:** `Adobe` `Samsung R&D` `Qualcomm` `DE Shaw`

```cpp
class Animal {
public:
    int legs;
    Animal() : legs(4) {}
};

class Dog : public Animal {};       // ← NOT virtual
class Pet : public Animal {};       // ← NOT virtual

class PetDog : public Dog, public Pet {};

int main() {
    PetDog pd;
    cout << pd.legs << endl;        // ← BUG: ambiguous!
}
```

<details>
<summary>▶ Bug & Fix</summary>

**🐛 Bug:** `PetDog` has TWO copies of `Animal` — one through `Dog` and one through `Pet`. Accessing `legs` is ambiguous: which `legs`?

```
COMPILATION ERROR: request for member 'legs' is ambiguous
```

**✅ Fix:** Use virtual inheritance:
```cpp
class Dog : virtual public Animal {};
class Pet : virtual public Animal {};
```

Now there's only ONE copy of `Animal` in `PetDog`, and `pd.legs` is unambiguous.

</details>

---
---

# CATEGORY 3 — ⚖️ COMPARE & CONTRAST

> Table format with deep explanations. Interviewers love these.

---

### Q1. struct vs class
**Tags:** `Amazon` `Microsoft` `Infosys` `Capgemini`

| Aspect | `struct` | `class` |
|--------|----------|---------|
| Default access | `public` | `private` |
| Default inheritance | `public` | `private` |
| Usage convention | POD/data holders | Complex objects with behavior |
| Can have methods? | YES | YES |
| Can have constructors? | YES | YES |
| Can inherit? | YES | YES |
| Can be templated? | YES | YES |

**🔑 The ONLY technical difference** is default access specifier. Everything else is convention.

```cpp
struct Point { int x, y; };          // x, y are public by default
class Point { int x, y; };          // x, y are private by default

struct D : Base {};                  // public inheritance by default
class D : Base {};                   // private inheritance by default
```

**Interview answer:** "In C++, `struct` and `class` are identical except for default access — `struct` defaults to public, `class` defaults to private. By convention, I use `struct` for simple data aggregates and `class` for objects with invariants and behavior."

---

### Q2. Abstract Class vs Interface
**Tags:** `Amazon` `Oracle` `Atlassian` `Walmart`

| Aspect | Abstract Class | Interface (C++ style) |
|--------|---------------|----------------------|
| Definition | Has at least one pure virtual function | ALL functions are pure virtual, no data members |
| Data members | Can have | Should NOT have (by convention) |
| Constructor | Can have | Can have (but rarely) |
| Method implementations | Can have (mix of pure and concrete) | Only pure virtual (no implementations) |
| Multiple inheritance | Single base typical | Multiple "interfaces" common |
| Use case | "is-a" with shared code | "can-do" / capability contract |

**⚠️ C++ has no `interface` keyword!** It's a design pattern — a class with only pure virtual functions.

```cpp
// Abstract class
class Shape {
protected:
    string color;          // has data
public:
    Shape(string c) : color(c) {}    // has constructor
    virtual double area() = 0;       // pure virtual
    string getColor() { return color; }  // concrete method
};

// "Interface" (C++ convention)
class Drawable {
public:
    virtual void draw() = 0;
    virtual void resize(double factor) = 0;
    virtual ~Drawable() = default;
    // no data, no concrete methods
};
```

---

### Q3. Overloading vs Overriding
**Tags:** `Every company` `Most common question`

| Aspect | Overloading | Overriding |
|--------|------------|------------|
| Where | Same class (or global scope) | Derived class |
| Function name | Same | Same |
| Parameters | MUST differ | MUST be same |
| Return type | Can differ | Must be same (or covariant) |
| `virtual` needed? | No | Yes |
| Binding | Compile-time (static) | Runtime (dynamic) |
| Also called | Static polymorphism | Dynamic polymorphism |

```cpp
// OVERLOADING — same class, different params
class Printer {
public:
    void print(int x)    { cout << x; }
    void print(double x) { cout << x; }
    void print(string x) { cout << x; }
};

// OVERRIDING — derived class, same signature, virtual
class Base {
public:
    virtual void show() { cout << "Base"; }
};
class Derived : public Base {
public:
    void show() override { cout << "Derived"; }  // OVERRIDE
};
```

---

### Q4. Compile-Time vs Runtime Polymorphism
**Tags:** `Microsoft` `Adobe` `Samsung R&D` `Google`

| Aspect | Compile-Time | Runtime |
|--------|-------------|---------|
| Also called | Static polymorphism | Dynamic polymorphism |
| Mechanism | Overloading, templates | Virtual functions |
| Binding | Early binding | Late binding |
| Decision made at | Compile time | Runtime |
| Performance | Faster (no vtable lookup) | Slightly slower (vtable indirection) |
| Flexibility | Less flexible | More flexible |
| Examples | Function overloading, operator overloading, templates | Virtual function dispatch |

```cpp
// COMPILE-TIME — decided by compiler
template<typename T>
T add(T a, T b) { return a + b; }   // compiler generates code for each type

// RUNTIME — decided at execution
Base* ptr = getShape();    // could be Circle, Square, Triangle
ptr->draw();               // which draw()? Decided at runtime via vtable
```

---

### Q5. Shallow Copy vs Deep Copy
**Tags:** `Goldman Sachs` `Microsoft` `Adobe` `Amazon`

| Aspect | Shallow Copy | Deep Copy |
|--------|-------------|-----------|
| Copies pointer? | YES (copies address) | NO (copies pointed-to data) |
| Shared memory? | YES (both point to same) | NO (independent copies) |
| Default behavior | Compiler-generated copy ctor/operator= | Must implement manually |
| Risk | Double-free, dangling ptrs | None (but more expensive) |
| When to use | No dynamic memory, POD types | When class owns heap memory |

```cpp
class Shallow {
    int* data;
public:
    Shallow(int v) : data(new int(v)) {}
    // Default copy: both objects share same 'data' pointer
    // ↓ When one is destroyed, other has dangling pointer!
    ~Shallow() { delete data; }
};

class Deep {
    int* data;
public:
    Deep(int v) : data(new int(v)) {}
    Deep(const Deep& other) : data(new int(*other.data)) {}  // ← deep copy
    ~Deep() { delete data; }
};
```

---

### Q6. Composition vs Inheritance
**Tags:** `Google` `Amazon` `Atlassian` `Walmart` `Arcesium`

| Aspect | Composition | Inheritance |
|--------|------------|-------------|
| Relationship | "has-a" | "is-a" |
| Coupling | Loose (can swap at runtime) | Tight (fixed at compile time) |
| Code reuse | By delegating to member | By inheriting methods |
| Flexibility | High (can change behavior at runtime) | Low (hierarchy is fixed) |
| Encapsulation | Strong (internal details hidden) | Weak (base exposes to derived) |
| Fragile base class | Not affected | Affected |
| Recommended | ✅ Prefer this | Use only when truly "is-a" |

```cpp
// INHERITANCE — tight coupling
class Engine { /* ... */ };
class Car : public Engine {};   // ← Car "is-a" Engine? NO! Bad design.

// COMPOSITION — loose coupling
class Car {
    Engine engine;              // ← Car "has-a" Engine. Correct!
public:
    void start() { engine.ignite(); }
};
```

**Interview answer:** "I favor composition over inheritance because it provides looser coupling, better encapsulation, and more flexibility. Inheritance should only be used for genuine 'is-a' relationships where polymorphism is needed."

---

### Q7. Virtual vs Pure Virtual
**Tags:** `Adobe` `Samsung R&D` `Oracle` `Infosys`

| Aspect | Virtual Function | Pure Virtual Function |
|--------|-----------------|---------------------|
| Syntax | `virtual void f() { }` | `virtual void f() = 0;` |
| Has body? | YES (always) | Optional (can have outside-class definition) |
| Must override? | No (optional) | YES (mandatory to instantiate derived) |
| Makes class abstract? | No | Yes |
| Can instantiate class? | Yes | No (abstract class) |

```cpp
class Base {
public:
    virtual void optional() { cout << "default behavior"; }   // virtual
    virtual void required() = 0;                              // pure virtual
};

// Base b;  ← ERROR: can't instantiate abstract class

class Derived : public Base {
public:
    // optional() inherited with default behavior — override is optional
    void required() override { cout << "must implement"; }    // mandatory
};
```

---

### Q8. static_cast vs dynamic_cast
**Tags:** `Google` `Goldman Sachs` `DE Shaw` `Microsoft`

| Aspect | `static_cast` | `dynamic_cast` |
|--------|--------------|----------------|
| Check time | Compile-time | Runtime |
| Safety | Unsafe (no runtime check) | Safe (returns nullptr/throws) |
| Requires virtual? | No | YES (needs vtable for RTTI) |
| Direction | Up/Down/Sideways | Down only (safely) |
| Performance | Zero overhead | Slight overhead (RTTI lookup) |
| Failure behavior | Undefined behavior | Returns `nullptr` (ptr) or throws `bad_cast` (ref) |

```cpp
Base* b = new Derived();

// STATIC_CAST — fast but dangerous
Derived* d1 = static_cast<Derived*>(b);     // works, no runtime check
// If b was actually Base, this would compile but cause UB!

// DYNAMIC_CAST — safe
Derived* d2 = dynamic_cast<Derived*>(b);     // runtime check via RTTI
if (d2) {
    // safe to use d2
} else {
    // b was not actually a Derived
}
```

---

### Q9. Stack vs Heap Allocation
**Tags:** `Microsoft` `Qualcomm` `Samsung R&D` `Goldman Sachs`

| Aspect | Stack | Heap |
|--------|-------|------|
| Allocation | Automatic (compiler) | Manual (`new`/`malloc`) |
| Deallocation | Automatic (scope exit) | Manual (`delete`/`free`) or smart ptr |
| Speed | Very fast (pointer bump) | Slower (allocator overhead) |
| Size limit | Small (1-8 MB typical) | Large (limited by RAM) |
| Fragmentation | None | Possible |
| Thread safety | Each thread has own stack | Shared, needs synchronization |
| Object lifetime | Until scope exit | Until explicitly freed |

```cpp
void example() {
    int x = 10;                    // stack — fast, automatic cleanup
    int* y = new int(20);          // heap — slower, must manually delete
    
    unique_ptr<int> z = make_unique<int>(30);  // heap, but automatic cleanup
    
    delete y;                      // must remember this!
}   // x destroyed automatically, z destroyed automatically (smart ptr)
```

---

### Q10. Early Binding vs Late Binding
**Tags:** `Adobe` `Microsoft` `Samsung R&D` `Oracle`

| Aspect | Early Binding | Late Binding |
|--------|--------------|-------------|
| Also called | Static binding | Dynamic binding |
| When resolved | Compile time | Runtime |
| Mechanism | Direct function call | vtable lookup |
| Functions | Non-virtual, overloaded, template | Virtual functions |
| Performance | Faster | Slightly slower (1 extra indirection) |
| Flexibility | Type must be known at compile time | Actual type determined at runtime |

```cpp
class Animal {
public:
    void eat()          { cout << "Animal eats"; }      // early binding
    virtual void speak() { cout << "..."; }             // late binding
};

class Dog : public Animal {
public:
    void eat()           { cout << "Dog eats"; }
    void speak() override { cout << "Woof!"; }
};

Animal* a = new Dog();
a->eat();     // "Animal eats"  — early binding (resolved by pointer type)
a->speak();   // "Woof!"        — late binding (resolved by object type via vtable)
```

---
---

# CATEGORY 4 — ❓ CAN YOU DO THIS?

> YES/NO questions with deep WHY. Interviewers love testing edge cases.

---

### Q1. Can constructor be virtual?
**Tags:** `Microsoft` `Adobe` `Samsung R&D` `Goldman Sachs`

**❌ NO.**

**WHY:** Virtual dispatch requires a vtable pointer (`vptr`). The `vptr` is set UP during construction. At the time the constructor runs, the vtable hasn't been fully established yet. It's a chicken-and-egg problem — you need the vtable to do virtual dispatch, but the constructor sets up the vtable.

**Workaround — Virtual Constructor Idiom (Factory Method):**
```cpp
class Base {
public:
    virtual Base* clone() const = 0;      // "virtual copy constructor"
    virtual Base* create() const = 0;     // "virtual default constructor"
    virtual ~Base() = default;
};

class Derived : public Base {
public:
    Derived* clone() const override { return new Derived(*this); }
    Derived* create() const override { return new Derived(); }
};
```

---

### Q2. Can destructor be pure virtual?
**Tags:** `Google` `Microsoft` `DE Shaw` `Goldman Sachs`

**✅ YES, but you MUST provide a definition.**

**WHY:** When destroying a derived object, ALL destructors in the chain are called (derived → base). If the base destructor has no body, the linker will fail.

```cpp
class Abstract {
public:
    virtual ~Abstract() = 0;    // pure virtual destructor
};

Abstract::~Abstract() {}        // ← MUST provide definition!

class Concrete : public Abstract {
public:
    ~Concrete() override {}
};
```

**Use Case:** When you want to make a class abstract but every function has a reasonable default implementation. Making the destructor pure virtual forces the class to be abstract.

---

### Q3. Can we override private virtual functions?
**Tags:** `Google` `DE Shaw` `Goldman Sachs`

**✅ YES! This is unique to C++.**

**WHY:** Access control (`private/protected/public`) is checked at **compile time** based on the calling context. Virtual dispatch happens at **runtime**. The derived class can override a private virtual function, but can only call it through the base class interface.

```cpp
class Base {
    virtual void doWork() { cout << "Base work"; }   // private virtual!
public:
    void execute() { doWork(); }    // public interface calls private virtual
};

class Derived : public Base {
    void doWork() override { cout << "Derived work"; }   // ← VALID override!
};

int main() {
    Base* b = new Derived();
    b->execute();     // prints "Derived work" — virtual dispatch works!
    // b->doWork();   // ERROR: doWork is private in Base
}
```

**🔑 This is the NVI (Non-Virtual Interface) pattern** — a recommended design pattern in C++.

---

### Q4. Can static functions be virtual?
**Tags:** `Adobe` `Samsung R&D` `Oracle`

**❌ NO.**

**WHY:** `static` functions belong to the CLASS, not to any object. They don't have a `this` pointer. Virtual dispatch requires an object (to look up the vtable via `vptr`). No object → no `vptr` → no virtual dispatch.

```cpp
class Base {
public:
    // virtual static void func();  ← COMPILATION ERROR
    static void func() { cout << "Base"; }
};

class Derived : public Base {
public:
    static void func() { cout << "Derived"; }  // This HIDES, not overrides
};

Base* b = new Derived();
b->func();            // Calls Base::func() — no virtual dispatch!
```

---

### Q5. Can we have virtual constructor?
**Tags:** `Microsoft` `Goldman Sachs`

**❌ NO (directly). But we can simulate it with the Clone pattern.**

Already covered in Q1. The key patterns:
- **clone()** — virtual copy constructor
- **create()** — virtual default constructor
- **Factory Method** — use a static factory + virtual dispatch

---

### Q6. Can abstract class have constructors?
**Tags:** `Amazon` `Oracle` `Infosys` `Capgemini`

**✅ YES!**

**WHY:** Even though you can't instantiate an abstract class directly, its constructor is called when creating DERIVED objects (base part must be initialized).

```cpp
class Shape {
protected:
    string color;
public:
    Shape(string c) : color(c) {
        cout << "Shape constructor: " << color << endl;
    }
    virtual double area() = 0;    // makes it abstract
    virtual ~Shape() = default;
};

class Circle : public Shape {
    double radius;
public:
    Circle(double r, string c) : Shape(c), radius(r) {}   // ← calls Shape's ctor
    double area() override { return 3.14159 * radius * radius; }
};

int main() {
    // Shape s("red");          // ERROR: can't instantiate abstract class
    Circle c(5.0, "red");      // OK: Shape("red") is called during Circle construction
}
```

---

### Q7. Can we instantiate abstract class?
**Tags:** `Infosys` `Capgemini` `Oracle` `Walmart`

**❌ NO (as an object). But ✅ YES (as pointer/reference).**

```cpp
class Shape {
public:
    virtual void draw() = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
public:
    void draw() override { cout << "Circle"; }
};

int main() {
    // Shape s;                // ❌ ERROR: cannot instantiate abstract class
    Shape* ptr = new Circle(); // ✅ pointer to abstract type
    Shape& ref = *ptr;         // ✅ reference to abstract type
    ptr->draw();               // "Circle" — virtual dispatch works
    delete ptr;
}
```

**🔑 Key:** You can have pointers and references of abstract class type. You just can't create an OBJECT of that type.

---

### Q8. Can friend function be virtual?
**Tags:** `Adobe` `Samsung R&D` `Goldman Sachs`

**❌ NO.**

**WHY:** `friend` functions are NOT member functions. Virtual dispatch requires a member function (to use `this->vptr`). Since friend functions don't have `this`, they can't participate in virtual dispatch.

**Workaround:** Make the friend function call a virtual member function:
```cpp
class Base {
    virtual void doprint(ostream& os) const { os << "Base"; }
    friend ostream& operator<<(ostream& os, const Base& obj) {
        obj.doprint(os);    // delegates to virtual member
        return os;
    }
};

class Derived : public Base {
    void doprint(ostream& os) const override { os << "Derived"; }
};

Base* b = new Derived();
cout << *b;    // "Derived" — virtual dispatch through doprint()
```

---

### Q9. Can operator overloading change precedence?
**Tags:** `Adobe` `Oracle` `Infosys`

**❌ NO.**

**WHY:** Operator precedence is fixed by the C++ language standard. When you overload `+`, `*`, etc., you change their BEHAVIOR, not their precedence or associativity.

```cpp
class Num {
    int val;
public:
    Num(int v) : val(v) {}
    Num operator+(const Num& other) { return Num(val + other.val); }
    Num operator*(const Num& other) { return Num(val * other.val); }
};

Num a(2), b(3), c(4);
Num result = a + b * c;    // * still executes before + (precedence unchanged)
                            // equivalent to: a + (b * c) = 2 + 12 = 14
```

**Also cannot change:**
- Arity (number of operands)
- Associativity (left-to-right vs right-to-left)
- Cannot create NEW operators

---

### Q10. Can we overload destructor?
**Tags:** `Infosys` `Capgemini` `Oracle`

**❌ NO.**

**WHY:** A destructor takes NO parameters and each class can have exactly ONE destructor. Overloading requires different parameter lists. Since destructors have no parameters, there's nothing to vary → can't overload.

```cpp
class MyClass {
public:
    ~MyClass() {}           // ← only one destructor allowed
    // ~MyClass(int) {}     // ← ERROR: destructors can't have parameters
};
```

**🔑 Key distinctions:**
- Can you have virtual destructor? ✅ YES
- Can you have pure virtual destructor? ✅ YES (with definition)
- Can you overload destructor? ❌ NO
- Can destructor be const? ❌ NO
- Can destructor have parameters? ❌ NO
- Can destructor return a value? ❌ NO

---
---

# CATEGORY 5 — 🧠 EXPLAIN THE BEHAVIOR

> "Why does this happen?" — Tests conceptual depth.

---

### Q1. Why Does This Print "Base" Instead of "Derived"?
**Tags:** `Amazon` `Microsoft` `Adobe` `Every Interview`

```cpp
class Base {
public:
    void show() { cout << "Base" << endl; }     // ← NOT virtual!
};

class Derived : public Base {
public:
    void show() { cout << "Derived" << endl; }
};

int main() {
    Base* ptr = new Derived();
    ptr->show();    // Output: "Base" — WHY?
    delete ptr;
}
```

**Explanation:**

`show()` is **not virtual**. Without `virtual`, the compiler uses **early binding** (static dispatch) — it decides which function to call based on the **pointer type** at compile time.

The pointer type is `Base*` → compiler calls `Base::show()`.

```
Decision tree:
Is the function virtual?
├── YES → Runtime dispatch (check actual object type via vtable) → Derived::show()
└── NO  → Compile-time dispatch (use pointer/reference type) → Base::show()
```

**Fix:** Add `virtual` to `Base::show()`:
```cpp
virtual void show() { cout << "Base" << endl; }
```

---

### Q2. Why Does This Crash?
**Tags:** `Microsoft` `Goldman Sachs` `DE Shaw` `Google`

```cpp
class Base {
public:
    ~Base() { cout << "~Base"; }       // ← NOT virtual!
};

class Derived : public Base {
    int* data;
public:
    Derived() : data(new int[1000]) {}
    ~Derived() { delete[] data; cout << "~Derived"; }
};

int main() {
    Base* ptr = new Derived();
    delete ptr;    // ← UNDEFINED BEHAVIOR → likely crash or memory corruption
}
```

**Explanation:**

When you `delete ptr` through a `Base*`:
1. Compiler sees `Base*` type
2. Destructor is NOT virtual → early binding → calls `~Base()` only
3. `~Derived()` is NEVER called
4. `data` (1000 ints) is leaked
5. The C++ standard says this is **Undefined Behavior** — anything can happen

**Why "undefined behavior" and not just "memory leak"?** Because the object was constructed as `Derived` but only partially destroyed. The memory layout may be corrupted. The allocator received wrong size information for deallocation.

**Rule:** If a class has ANY virtual function OR is meant to be inherited from, make its destructor virtual.

---

### Q3. Why Does This Compile in C++ But Not Java?
**Tags:** `Google` `Amazon` `DE Shaw`

```cpp
class Flyable {
public:
    virtual void fly() = 0;
};

class Swimmable {
public:
    virtual void swim() = 0;
};

class Duck : public Flyable, public Swimmable {    // ← multiple inheritance!
public:
    void fly() override  { cout << "Duck flies"; }
    void swim() override { cout << "Duck swims"; }
};
```

**Explanation:**

C++ supports **multiple inheritance** — a class can inherit from multiple base classes. Java does NOT allow multiple class inheritance (only multiple interface implementation).

**Why C++ allows it:** C++ philosophy is "you don't pay for what you don't use" and trusts the programmer. Multiple inheritance is powerful when used correctly.

**Why Java disallows it:** To avoid the **Diamond Problem** and simplify the language. Java uses interfaces (with `implements`) for multiple type contracts.

**C++ handles the Diamond Problem** with `virtual` inheritance, which Java doesn't need because it doesn't have the problem.

---

### Q4. Why is sizeof(EmptyClass) == 1?
**Tags:** `Google` `Goldman Sachs` `DE Shaw` `Qualcomm`

```cpp
class Empty {};
cout << sizeof(Empty);    // Output: 1
```

**Explanation:**

Every object must have a **unique address** in memory. If `sizeof(Empty)` were 0, then:
```cpp
Empty a, b;
&a == &b    // would be true! Two different objects at same address — ILLEGAL
```

The C++ standard mandates that every object has a unique address. The minimum size to ensure this is **1 byte** (as a placeholder).

**Exception — Empty Base Optimization (EBO):**
```cpp
class Empty {};
class Derived : public Empty {
    int x;
};
cout << sizeof(Derived);    // Output: 4 (not 5!) — EBO kicks in
```
When an empty class is used as a base class, the compiler can optimize away the 1-byte overhead.

---

### Q5. Why is sizeof(ClassWithVirtual) == 8 (or 4)?
**Tags:** `Microsoft` `Goldman Sachs` `DE Shaw` `Samsung R&D`

```cpp
class NoVirtual {
    int x;
};

class WithVirtual {
    int x;
    virtual void func() {}
};

cout << sizeof(NoVirtual);     // 4
cout << sizeof(WithVirtual);   // 16 (on 64-bit) or 8 (on 32-bit)
```

**Explanation:**

When a class has at least one virtual function, the compiler adds a **hidden pointer** called `vptr` (vtable pointer) to each object.

```
NoVirtual memory layout:
┌──────┐
│ x(4) │ = 4 bytes
└──────┘

WithVirtual memory layout (64-bit):
┌────────────┬──────┬─────────┐
│ vptr (8)   │ x(4) │ pad (4) │ = 16 bytes
└────────────┴──────┴─────────┘
```

- `vptr` is 8 bytes on 64-bit systems (pointer size)
- `x` is 4 bytes (int)
- 4 bytes padding for alignment (8-byte boundary)
- Total: 16 bytes

**On 32-bit systems:** vptr = 4, x = 4, total = 8 bytes (no padding needed).

**🔑 Key:** EVERY virtual function adds a `vptr` — but only ONE vptr per class (not per virtual function). Adding more virtual functions increases the vtable size, not the object size.

---
---

# CATEGORY 6 — 🌍 REAL-WORLD REASONING

> "Why/When would you...?" — Tests design judgment.

---

### Q1. Why is Multiple Inheritance Considered Harmful?
**Tags:** `Google` `Amazon` `Atlassian` `Arcesium`

**Problems with Multiple Inheritance:**

| Problem | Description |
|---------|-------------|
| Diamond Problem | Same base class inherited through multiple paths → ambiguity |
| Name Collisions | Two bases with same method name → which one? |
| Complexity | Harder to understand, maintain, and debug |
| Fragile Hierarchy | Changes in one base class can break unrelated code paths |
| Constructor Order | Complex, non-obvious construction order |

**When it IS acceptable:**
1. Inheriting from multiple **pure interfaces** (abstract classes with no data)
2. Mixin classes (small, stateless utility classes)
3. CRTP (Curiously Recurring Template Pattern)

**Interview answer:** "Multiple inheritance increases complexity and can cause the diamond problem. I prefer composition + interfaces. But in C++, I'd use it for inheriting from multiple pure abstract classes (interfaces) or small mixins."

---

### Q2. When Would You Use Private Inheritance?
**Tags:** `Google` `Goldman Sachs` `DE Shaw`

**Private inheritance** means "is-implemented-in-terms-of" (NOT "is-a").

```cpp
class Timer {
public:
    void start() { /* ... */ }
    void stop()  { /* ... */ }
};

// Private inheritance: Widget IS-IMPLEMENTED-USING Timer
// Users of Widget can't see Timer interface
class Widget : private Timer {
public:
    void activate() {
        start();    // can use Timer internally
    }
};

Widget w;
w.start();      // ← ERROR: start() is private (hidden from users)
w.activate();   // ← OK: public interface
```

**When to use:**
1. When you need to override virtual functions of the base but don't want a public "is-a" relationship
2. When you need access to protected members of the base
3. Empty Base Optimization (EBO) — private inheritance of empty class takes 0 bytes

**Usually prefer composition instead.** Private inheritance is rarely needed.

---

### Q3. Why Favor Composition Over Inheritance?
**Tags:** `Google` `Amazon` `Atlassian` `Walmart` `Arcesium`

| Problem with Inheritance | Solution with Composition |
|-------------------------|--------------------------|
| Tight coupling (fragile base class) | Loose coupling (interface-based) |
| Can't change at runtime | Can swap components at runtime |
| Exposes internals to derived | Hides internals completely |
| Deep hierarchies = complexity | Flat, modular design |
| Single inheritance limits in some cases | No limits on composition |

**Example: Notification System**
```cpp
// BAD — Inheritance
class EmailNotification : public Notification { /* ... */ };
class SMSNotification : public Notification { /* ... */ };
class EmailAndSMSNotification : public ??? { /* stuck! */ };

// GOOD — Composition
class NotificationService {
    vector<unique_ptr<INotifier>> notifiers;    // can have any combination
public:
    void addNotifier(unique_ptr<INotifier> n) { notifiers.push_back(move(n)); }
    void notify(string msg) {
        for (auto& n : notifiers) n->send(msg);
    }
};
```

**Interview answer:** "Composition gives us flexibility to change behavior at runtime, avoids tight coupling, and doesn't suffer from the fragile base class problem. I use inheritance only for genuine 'is-a' relationships where I need polymorphism."

---

### Q4. What's Wrong with the Singleton Pattern?
**Tags:** `Google` `Amazon` `Atlassian` `Arcesium`

| Problem | Description |
|---------|-------------|
| Hidden dependencies | Classes that use Singleton have invisible coupling |
| Hard to test | Can't mock/substitute the singleton in unit tests |
| Thread safety | Naive implementations are not thread-safe |
| Violates SRP | Controls its own lifecycle AND does its job |
| Global state | Essentially a global variable in disguise |
| Lifetime issues | Destruction order across singletons is undefined |

**If you MUST use Singleton (thread-safe C++11):**
```cpp
class Database {
    Database() {}                           // private constructor
    Database(const Database&) = delete;     // no copying
    Database& operator=(const Database&) = delete;
public:
    static Database& getInstance() {
        static Database instance;           // thread-safe in C++11+
        return instance;
    }
    void query(string sql) { /* ... */ }
};
```

**Better alternative — Dependency Injection:**
```cpp
class Service {
    IDatabase& db;    // injected dependency — easy to test, swap, mock
public:
    Service(IDatabase& database) : db(database) {}
};
```

---

### Q5. When to Use Abstract Class vs Templates?
**Tags:** `Google` `Microsoft` `DE Shaw` `Goldman Sachs`

| Aspect | Abstract Class | Templates |
|--------|---------------|-----------|
| Polymorphism type | Runtime | Compile-time |
| Performance | Slight overhead (vtable) | Zero overhead (inlined) |
| Type checking | Runtime (`dynamic_cast`) | Compile-time (concepts in C++20) |
| Compilation | Separate compilation possible | Header-only (code bloat) |
| Flexibility | Can add new types without recompiling | All types must be known at compile time |
| Binary size | Smaller | Larger (code duplication per type) |

**Use Abstract Class when:**
- Types are determined at runtime (e.g., plugin systems, user input)
- You need separate compilation (library + client code)
- You need heterogeneous containers (`vector<Base*>`)
- You want to minimize binary size

**Use Templates when:**
- Types are known at compile time
- Performance is critical (zero overhead)
- You want type-safe generic code
- You're writing libraries (STL style)

```cpp
// Abstract class — runtime flexibility
void processShape(Shape& s) { s.draw(); }    // works with ANY Shape subclass
// Adding new shape = just inherit and override. No recompilation of this function.

// Template — compile-time performance
template<typename T>
void process(T& obj) { obj.draw(); }         // code generated per type
// Zero overhead, but every type must be known at compile time.
```

---
---

# 🧠 MASTER DECISION TREES

## When You See "What's the Output?" Questions

```
Step 1: Is there inheritance?
├── YES → Check constructor/destructor order
│        → Are there virtual functions?
│        │   ├── YES → Are they called in constructor/destructor?
│        │   │         ├── YES → Virtual dispatch DISABLED → Base version called
│        │   │         └── NO  → Normal virtual dispatch
│        │   └── NO  → Early binding (pointer type decides)
│        → Is anything passed by value?
│             ├── YES → Object slicing! Base version called
│             └── NO  → Polymorphism works normally
└── NO  → Check: static members? const correctness? copy vs assign?
```

## When You See "What's Wrong?" Questions

```
Step 1: Dynamic memory (new/delete)?
├── YES → Rule of Three/Five followed?
│        → Self-assignment handled in operator=?
│        → Virtual destructor in base class?
│        → Returning reference/pointer to local?
│        → Double-free risk (shallow copy)?
└── NO  → Check: infinite recursion? ambiguity? const violations?
```

---

# ⚡ INTERVIEW SPEED MODE — Quick Facts

| Fact | Answer |
|------|--------|
| Constructor call order | Base → Derived |
| Destructor call order | Derived → Base |
| Virtual in constructor? | Disabled — calls Base version |
| Object slicing occurs when? | Pass/assign derived to base BY VALUE |
| Member init order | Declaration order (not initializer list order) |
| `Type obj = other;` calls | Copy constructor (NOT assignment) |
| Copy elision in C++17 | Mandatory (guaranteed) |
| sizeof(empty class) | 1 byte |
| Adding virtual adds? | One vptr (pointer size: 4 or 8 bytes) |
| Can constructor be virtual? | NO |
| Can destructor be pure virtual? | YES (must provide definition) |
| Can private virtual be overridden? | YES (C++ only, NVI pattern) |
| Can static be virtual? | NO |
| Can friend be virtual? | NO |
| Can operator overloading change precedence? | NO |
| Can destructor be overloaded? | NO |
| struct vs class difference | Default access (public vs private) |
| Multiple inheritance risk? | Diamond problem, ambiguity |

---

# 📊 COMMON TRAPS — Master Table

| Trap | What Candidates Say | Correct Answer | Why |
|------|-------------------|----------------|-----|
| Virtual in constructor | "Calls Derived version" | Calls Base version | vtable not set up yet |
| Object slicing | "Polymorphism works by value" | Derived part chopped off | Only Base portion copied |
| Member init order | "Follows initializer list" | Follows declaration order | C++ standard rule |
| `T obj = other;` | "Assignment operator" | Copy constructor | Initialization ≠ assignment |
| Non-virtual destructor + delete | "Both destructors called" | Only Base destructor | Early binding, UB |
| `static` + virtual | "Yes, both can combine" | No, compilation error | Static has no `this`/vptr |
| `sizeof(Empty)` | "0 bytes" | 1 byte | Unique address requirement |
| Deep vs shallow copy default | "Compiler does deep copy" | Compiler does shallow copy | Default copies bits only |
| Self-assignment | "Assignment works fine" | Potential crash/corruption | Deletes own data first |
| Pure virtual + body | "Can't have a body" | CAN have out-of-class body | Callable via `Base::func()` |

---

> 🎯 **Final tip:** For OUTPUT PREDICTION questions, always **trace through the code line by line**. Don't guess. Write down the state of each variable and the vtable status at each step. This is how you avoid traps.
