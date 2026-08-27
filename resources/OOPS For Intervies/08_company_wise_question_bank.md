# Company-Wise OOP Question Bank — Elite Interview Revision Sheet

> Your **final weapon**. Organized by company. Use this 2–3 days before a specific company's interview.

---
---

# 🧠 SECTION 1: HOW TO USE THIS FILE

```
1. Find the company you're interviewing with
2. Read "What They Value" — this shapes HOW you answer
3. Study the Round Format — know what to expect
4. Go through Top Questions — these are MOST LIKELY to be asked
5. Practice Code Questions — write them on paper, not IDE
6. Read Pro Tips — the edge that gets you selected
```

### 🎯 Company Tiers at a Glance

```
┌────────────────────────────────────────────────────────────────────┐
│  TIER 1 — Deep OOP + Design Rounds                                │
│  Google, Amazon, Microsoft, Adobe, Goldman Sachs, DE Shaw,        │
│  Atlassian, Samsung R&D                                           │
│  → Expect: vtable, SOLID, design patterns, LLD, tricky code      │
├────────────────────────────────────────────────────────────────────┤
│  TIER 2 — Standard OOP (Conceptual + Code)                        │
│  Oracle, Walmart, Flipkart, Qualcomm, Arcesium                   │
│  → Expect: 4 pillars, inheritance, polymorphism, design questions │
├────────────────────────────────────────────────────────────────────┤
│  TIER 3 — Basic OOP (Theory + MCQs)                               │
│  Infosys, TCS, Capgemini, HCL, Cognizant, Accenture              │
│  → Expect: definitions, real-world examples, simple output qs     │
└────────────────────────────────────────────────────────────────────┘
```

---
---

# 🏢 COMPANY 1: GOOGLE

### What They Value
```
→ Design THINKING, not just definitions
→ Trade-off discussions (why X over Y?)
→ Composition over inheritance reasoning
→ Clean, extensible code
→ SOLID principles applied naturally
→ They NEVER ask "define polymorphism" — they ask you to DESIGN something
```

### Round Format
| Round | OOP Content |
|-------|-------------|
| Online Assessment | Rarely pure OOP — mostly DSA |
| Phone Screen | May ask OOP design as follow-up to coding |
| Onsite — Coding | Clean OOP code expected in solutions |
| Onsite — System Design | OOP design is EMBEDDED in system design |

### Top 15 Questions

**Conceptual (asked during design discussions):**

**Q1: "When would you use composition over inheritance?"**
> **Answer:** Use inheritance when there's a true "is-a" relationship AND the subclass genuinely extends base behavior. Use composition when you need "has-a" or when behavior needs to change at runtime. Example: A `Bird` class shouldn't inherit `Flyable` because penguins can't fly. Instead, compose with a `FlyBehavior` strategy.
> ```cpp
> // BAD — Inheritance
> class Bird { virtual void fly() { cout << "flying"; } };
> class Penguin : public Bird { void fly() override { /* can't fly! */ } }; // LSP violation
>
> // GOOD — Composition
> class FlyBehavior { public: virtual void fly() = 0; };
> class CanFly : public FlyBehavior { public: void fly() override { cout << "flying"; } };
> class NoFly  : public FlyBehavior { public: void fly() override { cout << "can't fly"; } };
>
> class Bird {
>     unique_ptr<FlyBehavior> flyBehavior;
> public:
>     Bird(unique_ptr<FlyBehavior> fb) : flyBehavior(move(fb)) {}
>     void performFly() { flyBehavior->fly(); }
> };
> ```

**Q2: "How does virtual dispatch work internally in C++?"**
> **Answer:** Every class with virtual functions has a vtable (virtual function table) — a static array of function pointers. Every object of that class has a hidden vptr (virtual pointer) pointing to its class's vtable. When you call a virtual function through a base pointer, the compiler: (1) follows the vptr to the vtable, (2) indexes into the vtable for that function, (3) calls the function pointer found there. This adds one indirection compared to non-virtual calls.

**Q3: "Explain Liskov Substitution Principle with an example where it's violated."**
> **Answer:** LSP says any subclass should be usable wherever the base class is expected without breaking behavior. Classic violation: Rectangle-Square problem.
> ```cpp
> class Rectangle {
> public:
>     virtual void setWidth(int w) { width = w; }
>     virtual void setHeight(int h) { height = h; }
>     int area() { return width * height; }
> protected:
>     int width, height;
> };
>
> class Square : public Rectangle {
> public:
>     void setWidth(int w) override { width = height = w; }  // VIOLATES LSP
>     void setHeight(int h) override { width = height = h; } // Caller expects independent w/h
> };
>
> void test(Rectangle& r) {
>     r.setWidth(5);
>     r.setHeight(10);
>     assert(r.area() == 50); // FAILS for Square! LSP violated.
> }
> ```
> **Fix:** Don't make Square inherit Rectangle. Use a Shape interface with area().

**Q4: "What are the trade-offs of virtual functions?"**
> **Answer:** (1) Space: extra vptr per object (typically 8 bytes on 64-bit). (2) Time: indirect function call through vtable — prevents inlining, can cause cache miss. (3) Prevents certain compiler optimizations. Alternative: CRTP (Curiously Recurring Template Pattern) for static polymorphism — zero overhead, but no runtime flexibility.

**Q5: "How would you design a notification system that supports email, SMS, and push notifications?"**
> **Answer:** Strategy pattern + Observer pattern.
> ```cpp
> class NotificationStrategy {
> public:
>     virtual void send(const string& message, const string& recipient) = 0;
>     virtual ~NotificationStrategy() = default;
> };
> class EmailNotification : public NotificationStrategy { /* impl */ };
> class SMSNotification : public NotificationStrategy { /* impl */ };
> class PushNotification : public NotificationStrategy { /* impl */ };
>
> class NotificationService {
>     vector<unique_ptr<NotificationStrategy>> channels;
> public:
>     void addChannel(unique_ptr<NotificationStrategy> ch) {
>         channels.push_back(move(ch));
>     }
>     void notifyAll(const string& msg, const string& to) {
>         for (auto& ch : channels) ch->send(msg, to);
>     }
> };
> ```
> Open/Closed: Adding WhatsApp notification = just add new class, no modification.

**Q6: "What's wrong with Singleton pattern? When would you still use it?"**
> **Answer:** Problems: (1) Global state — hidden dependencies, (2) Hard to test — can't mock easily, (3) Thread-safety complexity, (4) Violates SRP (manages own lifecycle + its job). Use when: truly one instance needed (logger, thread pool, config manager) AND you accept the trade-offs.

**Q7: "Explain CRTP. Why would you use it over virtual functions?"**
> **Answer:** CRTP = Curiously Recurring Template Pattern. Base class is templated on the derived class.
> ```cpp
> template<typename Derived>
> class Shape {
> public:
>     double area() { return static_cast<Derived*>(this)->areaImpl(); }
> };
> class Circle : public Shape<Circle> {
> public:
>     double areaImpl() { return 3.14 * r * r; }
>     double r;
> };
> ```
> Benefit: Zero runtime overhead (no vtable, no vptr, calls resolved at compile time). Use when you know all types at compile time and need maximum performance.

**Q8: "How do smart pointers interact with inheritance/polymorphism?"**
> **Answer:** `unique_ptr<Base>` can hold `Derived*` and will correctly destroy via virtual destructor. Use `make_unique<Derived>()` and store in `unique_ptr<Base>`. For shared ownership, use `shared_ptr<Base>`. Key: Base MUST have virtual destructor.

**Q9: "What is object slicing and how do you prevent it?"**
> **Answer:** When a derived object is assigned to a base object BY VALUE, the derived part is "sliced off". Prevent by using pointers or references.
> ```cpp
> Derived d;
> Base b = d;  // SLICING! Only Base part is copied.
> Base& ref = d;  // OK — no slicing
> Base* ptr = &d;  // OK — no slicing
> ```

**Q10: "Design a plugin system where new functionality can be added without recompiling."**
> **Answer:** Abstract base class as interface + dynamic loading.
> ```cpp
> class Plugin {
> public:
>     virtual string name() const = 0;
>     virtual void execute() = 0;
>     virtual ~Plugin() = default;
> };
> // Plugins implement this interface, compiled as shared libraries
> // Main app loads .so/.dll at runtime, creates Plugin* via factory function
> ```
> This is Open/Closed principle in its purest form.

**Q11: "Difference between abstract class and interface in C++?"**
> **Answer:** C++ has no `interface` keyword. An "interface" in C++ is a class with ONLY pure virtual functions and no data members. An abstract class CAN have data members, concrete methods, constructors. Use interface when you want a pure contract. Use abstract class when you want shared implementation.

**Q12: "When would you use private inheritance?"**
> **Answer:** Private inheritance means "implemented-in-terms-of" (not "is-a"). The public interface of the base is NOT exposed. Use when you want to reuse implementation but NOT the interface. Usually, composition is preferred over private inheritance.

**Q13: "Explain dependency injection in C++."**
> **Answer:** Pass dependencies through constructor/setter rather than creating them inside the class.
> ```cpp
> // BAD — hard-coded dependency
> class OrderService {
>     MySQLDatabase db;  // tightly coupled
> };
>
> // GOOD — dependency injection
> class OrderService {
>     unique_ptr<Database> db;  // abstract interface
> public:
>     OrderService(unique_ptr<Database> db) : db(move(db)) {}
> };
> // Can inject MockDatabase for testing, PostgresDB for production
> ```

**Q14: "What is the diamond problem and how does C++ solve it?"**
> **Answer:** When class D inherits from B and C, both of which inherit from A, class D gets TWO copies of A's members. C++ solves this with virtual inheritance: `class B : virtual public A {}`. This ensures only ONE copy of A exists in D.

**Q15: "Why should destructors be virtual in polymorphic base classes?"**
> **Answer:** Without virtual destructor, `delete basePtr` (pointing to derived) only calls Base destructor → derived resources leak. With virtual destructor, correct destructor chain is called via vtable.

### 💡 Pro Tips for Google
```
✅ Think out loud — explain WHY you chose a design
✅ Discuss trade-offs before the interviewer asks
✅ Use SOLID vocabulary naturally ("this follows OCP because...")
✅ Show awareness of performance implications
✅ Don't over-engineer — Google values simplicity
❌ Don't just recite definitions
❌ Don't use raw pointers — use smart pointers
```

---
---

# 🏢 COMPANY 2: AMAZON

### What They Value
```
→ SOLID principles (maps to Leadership Principles)
→ Extensible, maintainable code
→ Real-world OOP design (Parking Lot, Library, etc.)
→ "How would you extend this?" follow-ups
→ Clean code that a team can maintain
→ Design patterns used APPROPRIATELY (not forced)
```

### Round Format
| Round | OOP Content |
|-------|-------------|
| Online Assessment | MCQs on OOP + Coding problems |
| Phone Screen | Coding + OOP design follow-up |
| Onsite — LLD Round | Full OOP design question (45 min) |
| Onsite — Bar Raiser | May discuss OOP design decisions |

### Top 15 Questions

**Q1: "Design a Parking Lot system." (MOST ASKED at Amazon)**
> Key classes: `ParkingLot` (Singleton), `ParkingFloor`, `ParkingSpot` (hierarchy: Compact/Large/Handicapped), `Vehicle` (hierarchy: Car/Truck/Motorcycle), `Ticket`, `PricingStrategy` (Strategy pattern).
> See Part 6 for full implementation.

**Q2: "What are the SOLID principles? Give a real example for each."**
> - **S**: `InvoiceGenerator` should only generate invoices, NOT send emails
> - **O**: Add new discount types without modifying existing code (Strategy pattern)
> - **L**: Every subclass of `Shape` should correctly compute `area()`
> - **I**: Don't force `Bird` to implement `swim()` if it can't
> - **D**: `OrderService` depends on `Database` interface, not `MySQL` class

**Q3: "What's the difference between method overloading and method overriding?"**
> | Feature | Overloading | Overriding |
> |---------|------------|-----------|
> | When | Compile-time | Runtime |
> | Where | Same class | Base → Derived |
> | Signature | Different params | Same signature |
> | `virtual` needed? | No | Yes |
> | Return type | Can differ | Must match (or covariant) |
> | Binding | Early (static) | Late (dynamic) |

**Q4: "Explain encapsulation with a real-world example and code."**
> ```cpp
> class BankAccount {
>     double balance;  // PRIVATE — can't access directly
> public:
>     void deposit(double amount) {
>         if (amount > 0) balance += amount;  // VALIDATION inside
>     }
>     bool withdraw(double amount) {
>         if (amount > 0 && amount <= balance) {
>             balance -= amount;
>             return true;
>         }
>         return false;  // CONTROLLED access
>     }
>     double getBalance() const { return balance; }
> };
> // No one can set balance to -1000. Data is PROTECTED.
> ```

**Q5: "How does polymorphism help in writing extensible code?"**
> **Answer:** With polymorphism, you can add new types without modifying existing code. Example: a `PaymentProcessor` that handles `CreditCard`, `UPI`, `Wallet`. Adding `Crypto` payment = just add new class implementing `Payment` interface. No switch-case modification needed. This IS the Open/Closed principle.

**Q6: "What is the Strategy pattern? Implement it."**
> ```cpp
> class SortStrategy {
> public:
>     virtual void sort(vector<int>& data) = 0;
>     virtual ~SortStrategy() = default;
> };
> class BubbleSort : public SortStrategy {
> public:
>     void sort(vector<int>& data) override { /* bubble sort */ }
> };
> class QuickSort : public SortStrategy {
> public:
>     void sort(vector<int>& data) override { /* quick sort */ }
> };
>
> class Sorter {
>     unique_ptr<SortStrategy> strategy;
> public:
>     void setStrategy(unique_ptr<SortStrategy> s) { strategy = move(s); }
>     void doSort(vector<int>& data) { strategy->sort(data); }
> };
> ```
> Allows swapping algorithm at RUNTIME without modifying Sorter class.

**Q7: "What is an abstract class? Can it have constructors?"**
> **Answer:** A class with at least one pure virtual function (`= 0`). Cannot be instantiated directly. YES, it can have constructors — they're called when derived class is constructed. Used to set up common state.
> ```cpp
> class Shape {
> protected:
>     string color;
> public:
>     Shape(string c) : color(c) {}           // Constructor — YES!
>     virtual double area() const = 0;         // Pure virtual
>     string getColor() const { return color; } // Concrete method — also YES!
> };
> ```

**Q8: "Explain shallow copy vs deep copy with code."**
> ```cpp
> class MyString {
>     char* data;
>     int size;
> public:
>     MyString(const char* s) {
>         size = strlen(s);
>         data = new char[size + 1];
>         strcpy(data, s);
>     }
>     // SHALLOW COPY — compiler-generated (DANGEROUS)
>     // Both objects point to SAME memory → double-free crash!
>
>     // DEEP COPY — must write manually
>     MyString(const MyString& other) {
>         size = other.size;
>         data = new char[size + 1];    // allocate NEW memory
>         strcpy(data, other.data);     // copy contents
>     }
>     ~MyString() { delete[] data; }
> };
> ```

**Q9: "What is the Factory pattern? When would you use it?"**
> Use when: the exact type of object to create is decided at runtime.
> ```cpp
> class Vehicle { public: virtual void drive() = 0; virtual ~Vehicle() = default; };
> class Car : public Vehicle { public: void drive() override { cout << "Driving car\n"; } };
> class Truck : public Vehicle { public: void drive() override { cout << "Driving truck\n"; } };
>
> class VehicleFactory {
> public:
>     static unique_ptr<Vehicle> create(const string& type) {
>         if (type == "car") return make_unique<Car>();
>         if (type == "truck") return make_unique<Truck>();
>         return nullptr;
>     }
> };
> ```

**Q10: "What happens if you don't declare destructor as virtual in a base class?"**
> Memory leak. If you `delete` a derived object through a base pointer, only the base destructor runs. Derived class resources (heap memory, file handles, etc.) are never freed. This is **undefined behavior** per the C++ standard.

**Q11: "Design an Online Shopping Cart with discounts."**
> Key classes: `Product`, `CartItem`, `ShoppingCart`, `DiscountStrategy` (Strategy: PercentDiscount, FlatDiscount, BuyOneGetOne), `Order`, `PaymentProcessor`.
> See Part 6 for full implementation.

**Q12: "What is the Observer pattern? Give a real use case."**
> One-to-many: when one object changes state, all dependents are notified.
> Use case: Stock price changes → notify all investors watching that stock.
> ```cpp
> class Observer {
> public:
>     virtual void update(const string& event, double data) = 0;
>     virtual ~Observer() = default;
> };
> class Subject {
>     vector<Observer*> observers;
> public:
>     void attach(Observer* o) { observers.push_back(o); }
>     void notify(const string& event, double data) {
>         for (auto* o : observers) o->update(event, data);
>     }
> };
> ```

**Q13: "Explain constructor delegation and initializer list."**
> ```cpp
> class Server {
>     string host;
>     int port;
>     bool ssl;
> public:
>     // Delegating: one constructor calls another
>     Server() : Server("localhost", 8080) {}
>     Server(string h, int p) : Server(h, p, false) {}
>     Server(string h, int p, bool s) : host(h), port(p), ssl(s) {}
>     // Initializer list: members initialized BEFORE constructor body runs
>     // Order = order of DECLARATION, not order in initializer list
> };
> ```

**Q14: "What is the Single Responsibility Principle? Show a violation and fix."**
> ```cpp
> // BAD — SRP violation
> class Employee {
>     void calculatePay() { /* payroll logic */ }
>     void saveToDatabase() { /* DB logic */ }
>     void generateReport() { /* report logic */ }
> };
>
> // GOOD — SRP applied
> class Employee { /* just employee data */ };
> class PayrollCalculator { void calculatePay(Employee& e); };
> class EmployeeRepository { void save(Employee& e); };
> class ReportGenerator { void generate(Employee& e); };
> ```

**Q15: "What's the difference between association, aggregation, and composition?"**
> | Relationship | Lifetime | Example |
> |-------------|----------|---------|
> | **Association** | Independent | Teacher ↔ Student (both exist independently) |
> | **Aggregation** | Independent (weak "has-a") | Department → Professor (professor survives if dept closes) |
> | **Composition** | Dependent (strong "has-a") | House → Room (room destroyed when house destroyed) |

### 💡 Pro Tips for Amazon
```
✅ Connect OOP answers to Amazon Leadership Principles:
   - "Ownership" → SRP, clean code
   - "Invent and Simplify" → right pattern, not over-engineering
   - "Bias for Action" → choose a design, don't overthink
✅ Always say "I would make this extensible by..."
✅ Show you think about edge cases
✅ For LLD: start with requirements, then classes, then code
❌ Don't use raw `new/delete` — use smart pointers
❌ Don't overcomplicate — Amazon values working code
```

---
---

# 🏢 COMPANY 3: MICROSOFT

### What They Value
```
→ Deep C++ knowledge (they BUILD C++ compilers)
→ Virtual functions, vtable, memory layout
→ Smart pointer usage and memory management
→ Design patterns in practice
→ Performance awareness
→ Exception safety
```

### Round Format
| Round | OOP Content |
|-------|-------------|
| Online Assessment | MCQs on C++ OOP + coding |
| Phone Screen | C++ OOP concepts + coding |
| Onsite — Coding | Clean C++ OOP expected |
| Onsite — Design | System/OOP design round |

### Top 12 Questions

**Q1: "Explain the vtable mechanism with a memory layout diagram."**
> ```
> class Base { virtual void f(); virtual void g(); int x; };
> class Derived : public Base { void f() override; virtual void h(); int y; };
>
> Base object layout:          Derived object layout:
> ┌────────────┐               ┌────────────┐
> │ vptr ──────┼──→ Base       │ vptr ──────┼──→ Derived
> │            │    vtable     │            │    vtable
> │ x          │    ┌──────┐   │ x          │    ┌──────┐
> └────────────┘    │ Base::f│  │ y          │    │ Der::f│ ← overridden
>                   │ Base::g│  └────────────┘    │ Base::g│ ← inherited
>                   └──────┘                      │ Der::h│ ← new
>                                                 └──────┘
> ```

**Q2: "What is the Rule of Five? Write a complete example."**
> ```cpp
> class Buffer {
>     int* data;
>     size_t size;
> public:
>     // Constructor
>     Buffer(size_t n) : size(n), data(new int[n]{}) {}
>
>     // 1. Destructor
>     ~Buffer() { delete[] data; }
>
>     // 2. Copy Constructor
>     Buffer(const Buffer& other) : size(other.size), data(new int[other.size]) {
>         copy(other.data, other.data + size, data);
>     }
>
>     // 3. Copy Assignment
>     Buffer& operator=(const Buffer& other) {
>         if (this != &other) {  // self-assignment check!
>             delete[] data;
>             size = other.size;
>             data = new int[size];
>             copy(other.data, other.data + size, data);
>         }
>         return *this;
>     }
>
>     // 4. Move Constructor
>     Buffer(Buffer&& other) noexcept : data(other.data), size(other.size) {
>         other.data = nullptr;  // leave source in valid state
>         other.size = 0;
>     }
>
>     // 5. Move Assignment
>     Buffer& operator=(Buffer&& other) noexcept {
>         if (this != &other) {
>             delete[] data;
>             data = other.data;
>             size = other.size;
>             other.data = nullptr;
>             other.size = 0;
>         }
>         return *this;
>     }
> };
> ```

**Q3: "What is std::move? Does it actually move anything?"**
> NO! `std::move` doesn't move. It CASTS an lvalue to an rvalue reference, enabling the move constructor/assignment to be called. The actual "moving" (transferring resources) happens in YOUR move constructor.

**Q4: "Can you call a virtual function inside a constructor?"**
> YES, but it calls the BASE version, not the derived override. During construction, the vtable points to the current class being constructed. The derived class isn't fully constructed yet, so its overrides aren't available.
> ```cpp
> class Base {
> public:
>     Base() { print(); }  // Calls Base::print, NOT Derived::print
>     virtual void print() { cout << "Base\n"; }
> };
> class Derived : public Base {
> public:
>     void print() override { cout << "Derived\n"; }
> };
> Derived d;  // Output: "Base" — NOT "Derived"!
> ```

**Q5: "Explain const correctness in C++ classes."**
> ```cpp
> class Widget {
>     int value;
>     mutable int cacheHits;  // CAN be modified in const methods
> public:
>     int getValue() const {   // const method — can't modify members
>         cacheHits++;         // OK because mutable
>         return value;
>     }
>     void setValue(int v) { value = v; }  // non-const — can modify
> };
>
> const Widget w;
> w.getValue();  // OK — const method on const object
> w.setValue(5); // ERROR — non-const method on const object
> ```

**Q6: "What is object slicing? How do you prevent it?"**
> Pass by value slices: `void f(Base b)` → derived data lost. Fix: use `void f(Base& b)` or `void f(Base* b)`.

**Q7: "Implement the Singleton pattern (thread-safe)."**
> ```cpp
> class Logger {
>     Logger() = default;
>     Logger(const Logger&) = delete;
>     Logger& operator=(const Logger&) = delete;
> public:
>     static Logger& getInstance() {
>         static Logger instance;  // Meyer's Singleton — thread-safe in C++11
>         return instance;
>     }
>     void log(const string& msg) { cout << msg << "\n"; }
> };
> ```

**Q8: "What is the diamond problem? Draw the memory layout with and without virtual inheritance."**
> Without virtual: D has TWO copies of A (ambiguous).
> With virtual: D has ONE copy of A (resolved).
> ```
> Without virtual:                With virtual:
> D object:                       D object:
> ┌─── B part ───┐               ┌─── B part ───┐
> │ A::x (copy 1)│               │ vbptr ────────┼──→ A
> │ B::y         │               │ B::y          │
> ├─── C part ───┤               ├─── C part ───┤
> │ A::x (copy 2)│               │ vbptr ────────┼──→ A
> │ C::z         │               │ C::z          │
> ├──────────────┤               ├─── A part ───┤  ← SHARED
> │ D::w         │               │ A::x          │
> └──────────────┘               ├──────────────┤
>                                │ D::w          │
>                                └──────────────┘
> ```

**Q9: "What are the different types of casts in C++?"**
> | Cast | Use | Safe? |
> |------|-----|-------|
> | `static_cast` | Compile-time, related types | Mostly safe |
> | `dynamic_cast` | Runtime, polymorphic downcast | Safe (returns nullptr on fail) |
> | `const_cast` | Remove/add const | Use carefully |
> | `reinterpret_cast` | Bit-level reinterpretation | DANGEROUS |

**Q10: "When should you use unique_ptr vs shared_ptr?"**
> | | `unique_ptr` | `shared_ptr` |
> |---|---|---|
> | Ownership | Exclusive (one owner) | Shared (reference counted) |
> | Overhead | Zero (no ref count) | Ref count + control block |
> | Copy | Not copyable (move only) | Copyable (ref count++) |
> | Use when | Single owner clear | Multiple owners needed |
> | With polymorphism | `unique_ptr<Base>` + virtual dtor | Same |

**Q11: "What is RAII and why is it important?"**
> Resource Acquisition Is Initialization. Bind resource lifetime to object lifetime. Constructor acquires, destructor releases. Smart pointers ARE RAII. File handles, mutexes — all should use RAII wrappers.

**Q12: "Explain exception safety guarantees."**
> - **No-throw**: Function never throws (`noexcept`)
> - **Strong**: If exception thrown, state rolls back to before the call
> - **Basic**: If exception thrown, no resource leaks, object in valid state
> - No guarantee: Anything can happen (BAD)

### 💡 Pro Tips for Microsoft
```
✅ Show deep C++ knowledge — they respect it
✅ Talk about memory layout and performance
✅ Use modern C++ (C++11/14/17 features)
✅ Mention RAII and smart pointers naturally
✅ Know vtable inside-out
❌ Don't use C-style casts — use C++ casts
❌ Don't forget virtual destructors
```

---
---

# 🏢 COMPANY 4: ADOBE

### What They Value
```
→ Advanced C++ OOP (they use C++ heavily)
→ Operator overloading (PDF/image processing needs custom operators)
→ Templates + OOP combination
→ Multiple inheritance handling
→ Diamond problem resolution
→ Performance-critical design
```

### Round Format
| Round | OOP Content |
|-------|-------------|
| Online Assessment | C++ MCQs (output prediction), coding |
| Technical Round 1 | C++ OOP deep dive + coding |
| Technical Round 2 | Design + architecture |

### Top 12 Questions

**Q1: "Implement operator overloading for a Complex number class."**
> ```cpp
> class Complex {
>     double real, imag;
> public:
>     Complex(double r = 0, double i = 0) : real(r), imag(i) {}
>
>     // Member operator
>     Complex operator+(const Complex& other) const {
>         return Complex(real + other.real, imag + other.imag);
>     }
>
>     // Friend for << (stream)
>     friend ostream& operator<<(ostream& os, const Complex& c) {
>         os << c.real << " + " << c.imag << "i";
>         return os;
>     }
>
>     // Prefix ++
>     Complex& operator++() { ++real; return *this; }
>     // Postfix ++
>     Complex operator++(int) { Complex temp = *this; ++real; return temp; }
> };
> ```

**Q2: "Which operators CANNOT be overloaded in C++?"**
> `.` (member access), `::` (scope resolution), `?:` (ternary), `sizeof`, `typeid`, `.*` (pointer-to-member).

**Q3: "Explain virtual inheritance with code showing diamond problem resolution."**
> ```cpp
> class Animal { public: string name; Animal(string n) : name(n) {} };
> class Mammal : virtual public Animal { public: Mammal(string n) : Animal(n) {} };
> class WingedAnimal : virtual public Animal { public: WingedAnimal(string n) : Animal(n) {} };
> class Bat : public Mammal, public WingedAnimal {
> public:
>     // MUST call Animal constructor directly (virtual base rule)
>     Bat(string n) : Animal(n), Mammal(n), WingedAnimal(n) {}
> };
> // Bat b("Bruce");
> // b.name — UNAMBIGUOUS! Only one Animal subobject.
> ```

**Q4: "What is the difference between function overloading and operator overloading?"**
> Both are compile-time polymorphism. Function overloading: same function name, different parameters. Operator overloading: giving new meaning to existing operators for user-defined types. Both resolved at compile time.

**Q5: "Can you overload `new` and `delete`? Why would you?"**
> YES. For custom memory management — memory pools, tracking allocations, debugging memory leaks.
> ```cpp
> class PoolAllocated {
> public:
>     void* operator new(size_t size) {
>         cout << "Custom allocation: " << size << " bytes\n";
>         return malloc(size);
>     }
>     void operator delete(void* ptr) {
>         cout << "Custom deallocation\n";
>         free(ptr);
>     }
> };
> ```

**Q6: "Explain template specialization with a practical example."**
> ```cpp
> // Generic template
> template<typename T>
> class Printer {
> public:
>     void print(T value) { cout << value << "\n"; }
> };
>
> // Full specialization for bool
> template<>
> class Printer<bool> {
> public:
>     void print(bool value) { cout << (value ? "true" : "false") << "\n"; }
> };
> ```

**Q7: "What is CRTP? Give a practical use case."**
> See Google Q7 above. Adobe use case: image processing pipelines where performance matters more than runtime flexibility.

**Q8: "Constructor/destructor order in multiple inheritance?"**
> ```cpp
> class A { public: A() { cout << "A "; } ~A() { cout << "~A "; } };
> class B : public A { public: B() { cout << "B "; } ~B() { cout << "~B "; } };
> class C : public A { public: C() { cout << "C "; } ~C() { cout << "~C "; } };
> class D : public B, public C { public: D() { cout << "D "; } ~D() { cout << "~D "; } };
> // D d; → Output: A B A C D
> // d goes out of scope → Output: ~D ~C ~A ~B ~A
> // (Destruction is REVERSE of construction)
> ```

**Q9: "Friend function vs member function for operator overloading?"**
> | | Member | Friend |
> |---|---|---|
> | Left operand | Must be class type | Can be any type |
> | Access | Has `this` | Gets both operands |
> | Use for `<<` | Can't (left is ostream) | MUST use friend |
> | Symmetry | `obj + 5` works, `5 + obj` doesn't | Both work |

**Q10: "What is name mangling and why does C++ need it?"**
> C++ supports overloading — multiple functions with same name but different params. Compiler encodes parameter types into the symbol name to differentiate. `void f(int)` → `_Z1fi`, `void f(double)` → `_Z1fd`. Use `extern "C"` to disable mangling for C interoperability.

**Q11: "Explain the explicit keyword."**
> Prevents implicit type conversions via constructors.
> ```cpp
> class Foo {
> public:
>     explicit Foo(int x) {}
> };
> Foo f1(42);      // OK — direct initialization
> Foo f2 = 42;     // ERROR — implicit conversion blocked by explicit
> ```

**Q12: "What is a pure virtual destructor? When would you use one?"**
> ```cpp
> class Base {
> public:
>     virtual ~Base() = 0;  // Pure virtual destructor
> };
> Base::~Base() {}  // MUST provide definition (called during derived destruction)
> ```
> Use when: you want to make a class abstract but have no other pure virtual function.

### 💡 Pro Tips for Adobe
```
✅ Practice operator overloading thoroughly
✅ Know templates deeply — Adobe uses heavy template code
✅ Be ready for "What's the output?" questions
✅ Know diamond problem cold
✅ Understand memory layout
❌ Don't confuse constructor/destructor order
```

---
---

# 🏢 COMPANY 5: SAMSUNG R&D

### What They Value
```
→ Pure C++ OOP (Samsung uses C++ for embedded/firmware)
→ Multiple inheritance
→ Templates + OOP
→ Memory management (no smart pointer luxury sometimes)
→ Constructor/destructor mechanics
→ Low-level understanding
```

### Top 10 Questions

**Q1: "What is the difference between struct and class in C++?"**
> Only difference: default access specifier. `struct` = `public`, `class` = `private`. In practice, `struct` is used for POD (Plain Old Data) types, `class` for OOP with encapsulation.

**Q2: "Explain all types of constructors with examples."**
> Default, Parameterized, Copy, Move, Delegating. See Part 1 for all implementations.

**Q3: "What is a virtual destructor? Why is it necessary?"**
> See Amazon Q10 and Microsoft Q1 vtable explanation.

**Q4: "What is the Template Method design pattern?"**
> ```cpp
> class Game {
> public:
>     // Template method — defines skeleton
>     void play() {
>         initialize();
>         while (!gameOver()) { makeMove(); }
>         displayResult();
>     }
> protected:
>     virtual void initialize() = 0;
>     virtual bool gameOver() = 0;
>     virtual void makeMove() = 0;
>     virtual void displayResult() = 0;
> };
>
> class Chess : public Game {
>     void initialize() override { cout << "Setting up chess board\n"; }
>     bool gameOver() override { /* check checkmate */ return true; }
>     void makeMove() override { cout << "Chess move\n"; }
>     void displayResult() override { cout << "Checkmate!\n"; }
> };
> ```

**Q5: "Static member variable — where is it stored? When is it initialized?"**
> Stored in the data segment (not on heap or stack). Initialized ONCE before `main()` (for global static) or on first function call (for local static). Shared across ALL objects of the class.

**Q6: "What is the difference between early binding and late binding?"**
> Early = compile-time (non-virtual functions, overloaded functions). Late = runtime (virtual functions, via vtable). Late binding has slight overhead (vtable lookup).

**Q7: "Explain access modifiers with inheritance."**
> | Base member \ Inheritance type | `public` | `protected` | `private` |
> |------|------|------|------|
> | `public` | public | protected | private |
> | `protected` | protected | protected | private |
> | `private` | Not accessible | Not accessible | Not accessible |

**Q8: "What is a friend class? Give a use case."**
> A class that can access private/protected members of another class. Use case: `Iterator` needs access to `Container`'s internal data structure.
> ```cpp
> class LinkedList {
>     friend class ListIterator;  // Iterator can access private nodes
>     Node* head;
> };
> ```

**Q9: "Can you have a static virtual function? Why or why not?"**
> NO. `static` means no `this` pointer (called on class, not object). `virtual` requires `this` pointer to access vtable through vptr. These are contradictory.

**Q10: "Explain the order of construction and destruction in a class with member objects."**
> Members are constructed in ORDER OF DECLARATION (not initializer list order). Destroyed in reverse order.
> ```cpp
> class Engine { public: Engine() { cout << "Engine\n"; } };
> class Wheels { public: Wheels() { cout << "Wheels\n"; } };
> class Car {
>     Engine e;   // constructed FIRST (declared first)
>     Wheels w;   // constructed SECOND
> public:
>     Car() : w(), e() {} // Order in init list IGNORED — declaration order used
> };
> // Output: Engine, Wheels (NOT Wheels, Engine)
> ```

### 💡 Pro Tips for Samsung
```
✅ Focus on pure C++ — they may not allow STL in coding tests
✅ Know memory management without smart pointers
✅ Practice writing classes from scratch on paper
✅ Know constructor/destructor order perfectly
❌ Don't rely on Java-style OOP thinking
```

---
---

# 🏢 COMPANY 6: GOLDMAN SACHS

### What They Value
```
→ C++ internals (they run high-frequency trading systems in C++)
→ vtable, vptr, object layout
→ Copy/move semantics — Rule of 3/5
→ Object slicing, RTTI
→ Performance implications of every OOP decision
→ Clean, efficient code
```

### Top 10 Questions

**Q1: "What is object slicing? Give an example and explain how to prevent it."**
> See Google Q9. Goldman asks this very frequently with output prediction.

**Q2: "Explain RTTI. When would you use dynamic_cast vs static_cast?"**
> RTTI = Runtime Type Information. `dynamic_cast` uses RTTI to safely downcast polymorphic types. Returns `nullptr` if cast fails (for pointers) or throws `bad_cast` (for references). `static_cast` is compile-time — no runtime check, unsafe if wrong type.
> ```cpp
> Base* b = new Derived();
> Derived* d1 = dynamic_cast<Derived*>(b);  // Safe — checks at runtime
> Derived* d2 = static_cast<Derived*>(b);   // Unsafe — no check, but faster
> ```

**Q3: "What is copy elision? What is RVO?"**
> Compiler optimization that eliminates unnecessary copies. RVO = Return Value Optimization. Object is constructed directly in the caller's space.
> ```cpp
> MyClass createObject() {
>     return MyClass();  // Copy/move constructor NOT called (elided)
> }
> MyClass obj = createObject();  // Directly constructed in obj's memory
> ```
> Guaranteed in C++17 for prvalue returns.

**Q4: "What is the size of an empty class? Why?"**
> `sizeof(EmptyClass) == 1`. Why? Every object needs a unique address. If size were 0, two objects could have the same address, breaking identity.

**Q5: "What is the size of a class with a virtual function?"**
> Typically 8 bytes (on 64-bit) — the vptr. Plus member data aligned appropriately.

**Q6: "Implement deep copy for a class managing a linked list."**
> ```cpp
> class MyList {
>     struct Node { int val; Node* next; };
>     Node* head;
> public:
>     // Deep copy constructor
>     MyList(const MyList& other) : head(nullptr) {
>         if (!other.head) return;
>         head = new Node{other.head->val, nullptr};
>         Node* curr = head;
>         Node* otherCurr = other.head->next;
>         while (otherCurr) {
>             curr->next = new Node{otherCurr->val, nullptr};
>             curr = curr->next;
>             otherCurr = otherCurr->next;
>         }
>     }
>     // Must also implement: destructor, copy assignment (Rule of 3)
> };
> ```

**Q7: "What is the virtual function call overhead?"**
> One extra pointer dereference (through vtable). Prevents inlining. Can cause cache miss if vtable not in L1 cache. For hot paths in trading systems, this matters — hence CRTP.

**Q8: "Explain the difference between aggregation and composition."**
> See Amazon Q15 table.

**Q9: "What happens if you throw an exception in a destructor?"**
> DANGEROUS. If destructor is called during stack unwinding (from another exception) and it throws → `std::terminate()` is called. Program crashes. Rule: destructors should NEVER throw. Mark them `noexcept`.

**Q10: "What is the copy-and-swap idiom?"**
> ```cpp
> class MyClass {
>     int* data; size_t size;
> public:
>     // Using copy-and-swap for exception-safe assignment
>     MyClass& operator=(MyClass other) {  // Note: passed BY VALUE (copy made)
>         swap(*this, other);               // swap contents
>         return *this;                     // old data destroyed in 'other'
>     }
>     friend void swap(MyClass& a, MyClass& b) noexcept {
>         using std::swap;
>         swap(a.data, b.data);
>         swap(a.size, b.size);
>     }
> };
> ```
> Strong exception safety: if copy fails, original object unchanged.

### 💡 Pro Tips for Goldman Sachs
```
✅ Know memory layout and sizeof for every class you write
✅ Discuss performance implications of every design choice
✅ Know Rule of 3/5 cold
✅ Be ready for "What's the output?" with subtle bugs
✅ Mention copy elision and move semantics proactively
❌ Don't ignore const correctness
```

---
---

# 🏢 COMPANY 7: DE SHAW

### What They Value
```
→ Very similar to Goldman Sachs but even MORE low-level
→ Memory model, cache effects
→ Virtual dispatch overhead
→ Template metaprogramming basics
→ Design patterns with performance awareness
```

### Top 8 Questions

**Q1: "How does virtual dispatch work? Trace through the assembly-level steps."**
> 1. Load object's vptr (first field in object memory)
> 2. Index into vtable (compile-time known offset)
> 3. Load function pointer from vtable entry
> 4. Call through function pointer (indirect call)
> This is 2-3 memory dereferences vs 0 for non-virtual (direct call).

**Q2: "What is the difference between virtual and non-virtual function resolution?"**
> Non-virtual: resolved at compile time based on POINTER TYPE (early binding).
> Virtual: resolved at runtime based on OBJECT TYPE (late binding via vtable).
> ```cpp
> Base* p = new Derived();
> p->nonVirtualFunc();  // Calls Base::nonVirtualFunc (pointer type = Base)
> p->virtualFunc();     // Calls Derived::virtualFunc (object type = Derived)
> ```

**Q3: "Implement a class that cannot be inherited."**
> ```cpp
> class Final final {  // C++11 final keyword
>     // ...
> };
> class Attempt : public Final {};  // COMPILATION ERROR
> ```

**Q4: "What is POD (Plain Old Data) type? Why does it matter?"**
> A class with no virtual functions, no user-defined constructors/destructors, no base classes, only public data. POD types can be `memcpy`'d safely, have C-compatible memory layout, and are more cache-friendly.

**Q5: "Explain placement new."**
> Construct an object at a specific memory address (pre-allocated buffer).
> ```cpp
> char buffer[sizeof(MyClass)];
> MyClass* obj = new (buffer) MyClass();  // construct in buffer
> obj->~MyClass();  // must manually call destructor (no delete!)
> ```
> Used in: memory pools, custom allocators, embedded systems.

**Q6: "What is type erasure in C++?"**
> Hiding concrete type behind a uniform interface. `std::function` is the classic example — it can hold ANY callable (function pointer, lambda, functor) behind a single type.

**Q7: "Compare virtual functions vs std::variant + std::visit."**
> | | Virtual | variant + visit |
> |---|---|---|
> | Dispatch | Runtime (vtable) | Compile-time (switch) |
> | Adding types | Open (new class) | Closed (modify variant) |
> | Performance | Indirect call, cache miss | Direct call, cache friendly |
> | Use when | Unknown types at compile time | Known set of types |

**Q8: "What is the Pimpl (Pointer to Implementation) idiom?"**
> ```cpp
> // widget.h — public header (stable ABI)
> class Widget {
>     struct Impl;           // forward declaration
>     unique_ptr<Impl> pImpl; // pointer to hidden implementation
> public:
>     Widget();
>     ~Widget();
>     void doWork();
> };
>
> // widget.cpp — implementation hidden
> struct Widget::Impl {
>     // all private data and methods here
>     // changes here DON'T force recompilation of users
> };
> ```
> Benefit: compile-time firewall, stable ABI, faster recompilation.

### 💡 Pro Tips for DE Shaw
```
✅ Think like a systems programmer
✅ Know the cost of EVERY abstraction
✅ Be ready for "can you make this faster?" follow-ups
✅ Discuss cache-friendliness of your data layout
✅ Know Pimpl, CRTP, type erasure
```

---
---

# 🏢 COMPANY 8: ATLASSIAN

### What They Value
```
→ Clean, maintainable code
→ Design patterns (Strategy, Observer are FAVORITES)
→ SOLID principles applied practically
→ Testability of code
→ Readable code > clever code
```

### Top 8 Questions

**Q1: "Implement the Strategy pattern for a payment system."**
> See Amazon Q6. Atlassian loves this pattern for its flexibility.

**Q2: "Implement the Observer pattern for a notification system."**
> See Amazon Q12.

**Q3: "Explain each SOLID principle with a one-line example."**
> - **S**: Invoice class shouldn't handle email sending
> - **O**: Add new shapes without modifying area calculator
> - **L**: Every Bird subclass should fly correctly (or don't inherit Flyable)
> - **I**: Don't force a simple Printer to implement scan/fax
> - **D**: Business logic depends on `Database` interface, not `MySQL` class

**Q4: "What's the Decorator pattern? When would you use it?"**
> Add behavior WITHOUT modifying original class.
> ```cpp
> class Coffee { public: virtual double cost() = 0; virtual ~Coffee() = default; };
> class SimpleCoffee : public Coffee { public: double cost() override { return 50; } };
>
> class CoffeeDecorator : public Coffee {
> protected:
>     unique_ptr<Coffee> wrappee;
> public:
>     CoffeeDecorator(unique_ptr<Coffee> c) : wrappee(move(c)) {}
> };
>
> class MilkDecorator : public CoffeeDecorator {
> public:
>     using CoffeeDecorator::CoffeeDecorator;
>     double cost() override { return wrappee->cost() + 20; }
> };
>
> class SugarDecorator : public CoffeeDecorator {
> public:
>     using CoffeeDecorator::CoffeeDecorator;
>     double cost() override { return wrappee->cost() + 10; }
> };
>
> // Usage:
> auto coffee = make_unique<SimpleCoffee>();              // 50
> auto withMilk = make_unique<MilkDecorator>(move(coffee)); // 70
> auto withMilkAndSugar = make_unique<SugarDecorator>(move(withMilk)); // 80
> ```

**Q5: "How would you make your code testable?"**
> - Dependency injection (pass interfaces, not concrete classes)
> - Program to interfaces, not implementations
> - Keep classes small (SRP)
> - Avoid Singleton (hard to mock)
> - Use composition over inheritance

**Q6: "What is the Adapter pattern?"**
> ```cpp
> // Old interface
> class OldPrinter { public: void printOld(string s) { cout << s; } };
>
> // New interface expected
> class Printer { public: virtual void print(string s) = 0; };
>
> // Adapter: makes old work with new interface
> class PrinterAdapter : public Printer {
>     OldPrinter old;
> public:
>     void print(string s) override { old.printOld(s); }
> };
> ```

**Q7: "Compare inheritance and composition. When to use each?"**
> See Google Q1. Atlassian strongly favors composition.

**Q8: "Design a simple event system using Observer pattern."**
> See Part 5 for full implementation with typed events.

### 💡 Pro Tips for Atlassian
```
✅ Write CLEAN code — they value readability
✅ Know Strategy and Observer patterns deeply
✅ Discuss testability for every design
✅ Use composition over inheritance by default
❌ Don't write clever-but-unreadable code
```

---
---

# 🏢 COMPANY 9: ORACLE

### What They Value
```
→ OOP fundamentals (solid understanding of all 4 pillars)
→ Exception handling (hierarchies, custom exceptions)
→ Abstract class vs interface concepts
→ Inheritance and polymorphism basics
→ Constructor/destructor mechanics
```

### Top 8 Questions

**Q1: "What are the 4 pillars of OOP? Explain each with real-world example."**
> | Pillar | Definition | Real-world Example |
> |--------|-----------|-------------------|
> | **Encapsulation** | Bundling data + methods, restricting access | ATM: you deposit/withdraw, can't access vault directly |
> | **Abstraction** | Hiding implementation details | Car: you press gas pedal, don't know engine internals |
> | **Inheritance** | Child acquires parent properties | Student is a Person (inherits name, age) |
> | **Polymorphism** | Same interface, different behavior | `draw()` works differently for Circle, Rectangle, Triangle |

**Q2: "Difference between abstract class and interface in C++?"**
> | Feature | Abstract Class | Interface (pure abstract) |
> |---------|---------------|--------------------------|
> | Pure virtual functions | At least one | ALL functions |
> | Data members | Can have | Should NOT have |
> | Constructors | Can have | Usually not |
> | Concrete methods | Can have | No |
> | Use case | Shared implementation | Pure contract |

**Q3: "Explain exception handling with custom exceptions."**
> ```cpp
> class AppException : public runtime_error {
> public:
>     AppException(const string& msg) : runtime_error(msg) {}
> };
>
> class DatabaseException : public AppException {
>     int errorCode;
> public:
>     DatabaseException(const string& msg, int code)
>         : AppException(msg), errorCode(code) {}
>     int getCode() const { return errorCode; }
> };
>
> void connectDB() {
>     throw DatabaseException("Connection failed", 503);
> }
>
> int main() {
>     try { connectDB(); }
>     catch (const DatabaseException& e) {
>         cout << "DB Error " << e.getCode() << ": " << e.what() << "\n";
>     }
>     catch (const AppException& e) { cout << "App Error: " << e.what() << "\n"; }
>     catch (...) { cout << "Unknown error\n"; }
> }
> ```

**Q4: "What is the difference between function overloading and overriding?"**
> See Amazon Q3 comparison table.

**Q5: "Can we overload the assignment operator? How?"**
> ```cpp
> class MyClass {
>     int* data;
> public:
>     MyClass& operator=(const MyClass& other) {
>         if (this != &other) {          // self-assignment guard
>             delete[] data;             // free old
>             data = new int(*other.data); // allocate + copy
>         }
>         return *this;
>     }
> };
> ```

**Q6: "What is the 'this' pointer?"**
> Implicit pointer passed to every non-static member function. Points to the object on which the method was called. Type: `ClassName* const` (constant pointer, non-constant data).

**Q7: "What is a virtual destructor and when is it needed?"**
> Needed when a class is used as a base class with virtual functions. Without it, deleting a derived object through a base pointer won't call derived's destructor → resource leak.

**Q8: "Explain the concept of upcasting and downcasting."**
> - **Upcasting**: Derived* → Base* (always safe, implicit)
> - **Downcasting**: Base* → Derived* (unsafe unless `dynamic_cast` used)
> ```cpp
> Derived d;
> Base* b = &d;                          // Upcasting — safe, implicit
> Derived* d2 = dynamic_cast<Derived*>(b); // Downcasting — safe with dynamic_cast
> ```

### 💡 Pro Tips for Oracle
```
✅ Be thorough with fundamentals — Oracle asks basics deeply
✅ Know exception handling well
✅ Practice abstract class vs interface questions
✅ Know constructors inside-out
```

---
---

# 🏢 COMPANY 10: WALMART

### What They Value
```
→ OOP design for real-world systems (they're a retail giant)
→ SOLID principles
→ Clean, extensible code
→ Design questions based on e-commerce scenarios
```

### Top 8 Questions

**Q1: "Design a simple e-commerce product catalog system."**
> Classes: `Product` (abstract), `Electronics`, `Clothing`, `Grocery` (concrete), `Catalog`, `SearchStrategy`.
> Apply: Strategy pattern for search, Factory for product creation.

**Q2: "Explain polymorphism with a retail scenario."**
> ```cpp
> class DiscountCalculator {
> public:
>     virtual double calculate(double price) const = 0;
>     virtual ~DiscountCalculator() = default;
> };
> class SeasonalDiscount : public DiscountCalculator {
> public:
>     double calculate(double price) const override { return price * 0.20; }
> };
> class EmployeeDiscount : public DiscountCalculator {
> public:
>     double calculate(double price) const override { return price * 0.30; }
> };
> class LoyaltyDiscount : public DiscountCalculator {
> public:
>     double calculate(double price) const override { return price * 0.15; }
> };
> // Adding "StudentDiscount" = just new class. No modification needed. OCP!
> ```

**Q3: "What is the Open/Closed Principle? Show with code."**
> See Q2 above — new discount types without modifying existing code.

**Q4: "Explain encapsulation in context of an inventory management system."**
> ```cpp
> class InventoryItem {
>     int quantity;         // PRIVATE — protected from invalid state
>     double pricePerUnit;
> public:
>     bool reduceStock(int amount) {
>         if (amount > 0 && amount <= quantity) {
>             quantity -= amount;
>             return true;
>         }
>         return false;  // Can't go negative — ENCAPSULATED
>     }
>     double totalValue() const { return quantity * pricePerUnit; }
> };
> ```

**Q5: "How would you handle different payment methods using OOP?"**
> Strategy pattern: `PaymentMethod` (abstract), `CreditCard`, `DebitCard`, `UPI`, `COD` (concrete).

**Q6: "What is inheritance? Types with examples."**
> Single: Dog → Animal. Multiple: Smartphone → Phone, Camera. Multilevel: Puppy → Dog → Animal. Hierarchical: Cat, Dog → Animal. Hybrid: combination.

**Q7: "Explain the difference between composition and aggregation with retail examples."**
> - **Composition**: Order → OrderItems (items destroyed when order is cancelled)
> - **Aggregation**: Store → Employees (employees exist even if store closes)

**Q8: "What are access specifiers? How do they work with inheritance?"**
> See Samsung Q7 table.

### 💡 Pro Tips for Walmart
```
✅ Use retail/e-commerce examples in your answers
✅ Show you think about scalability
✅ Know SOLID principles well — they ask about extensibility
✅ Practice LLD with shopping/inventory scenarios
```

---
---

# 🏢 COMPANY 11: FLIPKART

### What They Value
```
→ Machine coding round (LLD) — build working OOP code in 60 min
→ Design patterns in practice
→ State pattern (Vending Machine is a CLASSIC)
→ Strategy pattern for pricing/shipping
→ Clean, WORKING code
```

### Top 8 Questions

**Q1: "Design a Vending Machine" (CLASSIC Flipkart question)**
> Uses State pattern. States: HasMoney, NoMoney, Dispensing, SoldOut.
> See Part 6 for full implementation.

**Q2: "Design a Ride Sharing system (Uber/Ola clone)"**
> Classes: `Rider`, `Driver`, `Ride`, `RideMatchingStrategy` (Strategy), `PricingStrategy`.

**Q3: "Implement the State pattern."**
> ```cpp
> class VendingState {
> public:
>     virtual void insertCoin(class VendingMachine& vm) = 0;
>     virtual void selectProduct(class VendingMachine& vm) = 0;
>     virtual void dispense(class VendingMachine& vm) = 0;
>     virtual ~VendingState() = default;
> };
> ```

**Q4: "How is machine coding round different from DSA round?"**
> | DSA Round | Machine Coding (LLD) |
> |-----------|---------------------|
> | Algorithm focus | OOP design focus |
> | Optimize time/space | Optimize extensibility |
> | Single function/class | Multiple classes, relationships |
> | Correctness first | Design quality first |
> | 30-45 min | 60-90 min |

**Q5: "What patterns would you use for a food ordering system?"**
> - Observer: notify restaurant when order placed
> - Strategy: pricing (surge, discount, base)
> - State: order lifecycle (Placed → Preparing → OutForDelivery → Delivered)
> - Factory: create different order types (dine-in, delivery, takeaway)

**Q6-Q8:** Standard OOP questions similar to Amazon/Walmart tier.

### 💡 Pro Tips for Flipkart
```
✅ Practice machine coding — write complete classes in 60 min
✅ Have State + Strategy patterns memorized
✅ Start with requirements → classes → relationships → code
✅ Your code MUST compile and run
❌ Don't spend too long on design — code matters more
```

---
---

# 🏢 COMPANY 12: QUALCOMM

### What They Value
```
→ C++ for embedded/firmware systems
→ Memory management (no garbage collector)
→ Virtual function costs in resource-constrained environments
→ Templates for zero-overhead abstraction
→ RAII for resource management
```

### Top 6 Questions

**Q1: "What is RAII? Why is it critical in embedded systems?"**
> See Microsoft Q11. In embedded: no exception handler, no GC → resource leaks are fatal.

**Q2: "Explain virtual function overhead and alternatives."**
> See Google Q4. In embedded, vtable overhead matters. Use CRTP for static polymorphism.

**Q3: "What is placement new? When would you use it?"**
> See DE Shaw Q5. Embedded systems often pre-allocate fixed memory pools.

**Q4: "How do you manage memory without smart pointers?"**
> Rule of Three strictly. RAII wrappers. Custom allocators. Clear ownership documentation.

**Q5: "What is a POD type?"**
> See DE Shaw Q4. POD types are compatible with C, can be safely memcpy'd.

**Q6: "Explain static vs dynamic polymorphism trade-offs for embedded."**
> Static (templates/CRTP): zero runtime overhead, larger binary (code bloat).
> Dynamic (virtual): runtime flexibility, vtable overhead per object.
> For embedded: prefer static when types known at compile time.

### 💡 Pro Tips for Qualcomm
```
✅ Focus on low-level C++ — they care about hardware proximity
✅ Know memory management without smart pointers
✅ Understand virtual function cost in embedded context
✅ Practice CRTP and template-based designs
```

---
---

# 🏢 COMPANY 13: ARCESIUM

### What They Value
```
→ Clean OOP code
→ SOLID principles
→ Composition patterns
→ Financial domain modeling
```

### Top 5 Questions

**Q1: "Explain and demonstrate Dependency Inversion Principle."**
> See Google Q13 (dependency injection).

**Q2: "How would you model a financial transaction system using OOP?"**
> Classes: `Transaction` (abstract), `Deposit`, `Withdrawal`, `Transfer` (concrete), `Account`, `TransactionLog` (Observer pattern for audit).

**Q3: "What is the Builder pattern? When do you use it?"**
> ```cpp
> class TradeOrder {
>     string symbol;
>     int quantity;
>     double price;
>     string type;  // market, limit
>     friend class TradeOrderBuilder;
> public:
>     void display() { /* print details */ }
> };
>
> class TradeOrderBuilder {
>     TradeOrder order;
> public:
>     TradeOrderBuilder& setSymbol(string s) { order.symbol = s; return *this; }
>     TradeOrderBuilder& setQuantity(int q) { order.quantity = q; return *this; }
>     TradeOrderBuilder& setPrice(double p) { order.price = p; return *this; }
>     TradeOrderBuilder& setType(string t) { order.type = t; return *this; }
>     TradeOrder build() { return order; }
> };
>
> // Usage:
> auto order = TradeOrderBuilder()
>     .setSymbol("AAPL").setQuantity(100).setPrice(150.0).setType("limit").build();
> ```

**Q4: "Composition vs Inheritance — which would you use for a trading system?"**
> Composition. Trading strategies change frequently. Use Strategy pattern (composition) to swap algorithms, not inheritance hierarchies.

**Q5: "Explain SOLID principles briefly."**
> See Amazon Q2.

### 💡 Pro Tips for Arcesium
```
✅ Use financial domain examples
✅ Show clean, well-structured code
✅ Emphasize composition and SOLID
```

---
---

# 🏢 COMPANY 14: INFOSYS / TCS / CAPGEMINI / HCL

### What They Value
```
→ BASIC OOP definitions (clear, textbook-perfect)
→ Real-world examples for every concept
→ MCQ-type questions (output prediction)
→ Simple code writing
→ No design patterns or SOLID usually
→ This is your SAFETY NET — nail these companies
```

### Round Format
| Round | OOP Content |
|-------|-------------|
| Online Test | 5-10 MCQs on OOP basics |
| Technical Interview | Definition questions + simple code |

### Top 15 Questions (These companies ask THESE exact questions)

**Q1: "What is Object-Oriented Programming?"**
> A programming paradigm based on the concept of "objects" which contain data (attributes) and code (methods). It organizes code around objects rather than functions. Key principles: Encapsulation, Abstraction, Inheritance, Polymorphism.

**Q2: "What is a class? What is an object?"**
> Class = blueprint/template. Object = instance of a class. Class defines WHAT properties and methods exist. Object IS a specific entity with actual values.

**Q3: "What is encapsulation?"**
> Wrapping data and methods that operate on that data within a single unit (class), and restricting direct access to data using access modifiers. Example: BankAccount class hides balance, exposes deposit/withdraw methods.

**Q4: "What is abstraction?"**
> Showing only essential features and hiding implementation details. Example: You drive a car without knowing engine internals. In code: abstract classes and interfaces define WHAT to do, derived classes define HOW.

**Q5: "What is inheritance?"**
> A mechanism where a new class (derived/child) acquires properties and behaviors of an existing class (base/parent). Promotes code reuse.
> ```cpp
> class Animal { public: void eat() { cout << "Eating\n"; } };
> class Dog : public Animal { public: void bark() { cout << "Barking\n"; } };
> // Dog has eat() + bark()
> ```

**Q6: "What is polymorphism?"**
> "Many forms" — same function name behaves differently. Two types:
> - **Compile-time**: Function/operator overloading
> - **Runtime**: Virtual functions (method overriding)

**Q7: "What is a constructor?"**
> Special member function called automatically when an object is created. Same name as class. No return type. Used to initialize object data.

**Q8: "What is a destructor?"**
> Called when object is destroyed. Cleanup resources. Same name as class with `~` prefix.

**Q9: "What is function overloading?"**
> Multiple functions with same name but different parameter lists. Resolved at compile time.
> ```cpp
> int add(int a, int b) { return a + b; }
> double add(double a, double b) { return a + b; }
> ```

**Q10: "What is function overriding?"**
> Derived class redefines a base class virtual function. Same name, same parameters. Resolved at runtime.

**Q11: "What is the difference between private, public, and protected?"**
> - `public`: Accessible from anywhere
> - `private`: Accessible only within the class
> - `protected`: Accessible within class AND its derived classes

**Q12: "What is a virtual function?"**
> A function in a base class declared with `virtual` keyword. Tells compiler to use late binding — call the function based on OBJECT type, not pointer type.

**Q13: "What is an abstract class?"**
> A class with at least one pure virtual function. Cannot be instantiated. Serves as interface for derived classes.

**Q14: "Difference between class and structure?"**
> In C++: default access — struct is public, class is private. That's it.

**Q15: "What are access specifiers?"**
> Keywords that set accessibility of class members: `public`, `private`, `protected`.

### 💡 Pro Tips for Service-based Companies
```
✅ Give TEXTBOOK-PERFECT definitions
✅ Always provide a real-world example
✅ Keep answers short and clear (1-2 min max)
✅ Practice basic MCQ output questions
✅ These are your safety net — score 100% here
❌ Don't overcomplicate with design patterns
❌ Don't use advanced C++ features they won't understand
```

---
---

# ⚡ QUICK REFERENCE: WHAT TO REVISE BEFORE EACH COMPANY

```
┌──────────────────────┬────────────────────────────────────────────┐
│ Company              │ Last-minute revision Parts                 │
├──────────────────────┼────────────────────────────────────────────┤
│ Google               │ Parts 4 (SOLID) + 5 (Patterns) + 6 (LLD) │
│ Amazon               │ Parts 4 + 5 + 6 (Parking Lot!)           │
│ Microsoft            │ Parts 2 (vtable) + 3 (Rule of 5) + 5     │
│ Adobe                │ Parts 2 + 3 (operators, templates)        │
│ Samsung R&D          │ Parts 1 + 2 + 3 (pure C++)               │
│ Goldman Sachs        │ Parts 2 + 3 (internals) + 7 (tricky)     │
│ DE Shaw              │ Parts 3 (advanced) + 7 (tricky)           │
│ Atlassian            │ Parts 4 (SOLID) + 5 (Strategy/Observer)   │
│ Oracle               │ Parts 1 + 2 (fundamentals)               │
│ Walmart              │ Parts 4 + 6 (design questions)            │
│ Flipkart             │ Parts 5 + 6 (machine coding)             │
│ Qualcomm             │ Parts 3 (memory, CRTP, embedded)          │
│ Arcesium             │ Parts 4 + 5 (SOLID, patterns)            │
│ Infosys/TCS/etc      │ Parts 1 + 2 (basics only)                │
└──────────────────────┴────────────────────────────────────────────┘
```

---
---

# 📊 MASTER TOPIC → COMPANY MAPPING

| Topic | Companies That Ask |
|-------|-------------------|
| 4 Pillars (basic definitions) | ALL |
| Virtual functions / vtable | Microsoft, Goldman, DE Shaw, Adobe, Samsung |
| SOLID principles | Google, Amazon, Atlassian, Walmart, Arcesium |
| Design patterns (Strategy, Observer, Singleton, Factory) | Google, Amazon, Atlassian, Flipkart |
| Diamond problem / Virtual inheritance | Adobe, Samsung, Microsoft, Goldman |
| Operator overloading | Adobe, Samsung, Oracle |
| Copy/Move semantics (Rule of 3/5) | Microsoft, Goldman, DE Shaw |
| Object slicing | Goldman, DE Shaw, Microsoft |
| Smart pointers + polymorphism | Google, Microsoft, Amazon |
| Abstract class vs Interface | ALL |
| Constructor/destructor order | Adobe, Samsung, Microsoft |
| CRTP / Static polymorphism | Google, DE Shaw, Qualcomm |
| Exception handling | Oracle, Microsoft |
| LLD design questions | Amazon, Flipkart, Walmart, Google |
| Composition vs Inheritance | Google, Atlassian, Amazon |
| Templates + OOP | Adobe, Samsung, Google |
| RTTI / dynamic_cast | Goldman, DE Shaw |
| Const correctness | Goldman, Microsoft |

---

> **🎯 FINAL TIP:** Don't memorize. UNDERSTAND. The best interview answers sound like you're explaining to a friend, not reciting from a book. Use analogies. Draw diagrams. Write code. That's how you crack it.
