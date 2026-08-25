# Design Patterns — Elite Interview Revision Sheet
> Not textbook theory. A **pattern recognition + implementation system** for interviews.

---
---

# 🧠 SECTION 1: THINKING FIRST (Why Patterns Matter in Interviews)

---

## What are Design Patterns?

```
One-line: Reusable solutions to commonly occurring problems in software design.

NOT code you copy-paste.
They are TEMPLATES for solving categories of problems.
```

## Why do interviewers ask them?

```
Interview Question: "Design a ___"
                          │
        ┌─────────────────┴──────────────────┐
        │ Without Patterns                   │ With Patterns
        │ - God class, spaghetti code        │ - Clean separation of concerns
        │ - Tightly coupled                  │ - Extensible, testable
        │ - "I'd just put it all in main()"  │ - "I'd use Strategy for this"
        └────────────────────────────────────┘
```

## The 3 Categories

```
┌─────────────────────────────────────────────────────────┐
│ CREATIONAL          │ STRUCTURAL         │ BEHAVIORAL   │
│ How objects          │ How objects        │ How objects   │
│ are CREATED          │ are COMPOSED       │ COMMUNICATE  │
│                      │                    │              │
│ • Singleton          │ • Adapter          │ • Observer   │
│ • Factory Method     │ • Decorator        │ • Strategy   │
│ • Abstract Factory   │                    │ • State      │
│ • Builder            │                    │ • Template   │
└──────────────────────┴────────────────────┴──────────────┘
```

## Step-by-step: How to Pick a Pattern (say this in interviews)

```
1. "The problem requires ___" (identify the need)
2. "This maps to ___ pattern because ___"
3. "Here's how I'd structure it..."
4. "This makes it extensible because ___"
```

---
---

# ⚡ SECTION 2: CORE PATTERNS (Detailed with Code)

---
---

## 🏗️ CREATIONAL PATTERN 1: SINGLETON

---

### One-line Definition
> Ensures a class has **only one instance** and provides a **global point of access** to it.

### When to Use (Decision Trigger)
```
Do I need EXACTLY ONE instance shared across the entire application?
    ├─ YES → Singleton
    │   Examples: Logger, Config Manager, DB Connection Pool, Cache
    └─ NO  → Regular class
```

### ASCII Class Diagram
```
┌───────────────────────────────┐
│         Singleton             │
├───────────────────────────────┤
│ - static instance: Singleton* │
│ - data: ...                   │
├───────────────────────────────┤
│ - Singleton()         // private constructor
│ - Singleton(const&)   // deleted
│ - operator=(const&)   // deleted
│ + static getInstance(): Singleton&
│ + doSomething(): void
└───────────────────────────────┘
```

### Real-World Analogy
> **President of a country** — there's only ONE at any time. Everyone refers to "the President."
> You don't create a new President object — you ask for the existing one.

### ❌ Anti-Pattern: What NOT to Do
```cpp
// BAD: Global variable pretending to be Singleton
Logger* globalLogger = new Logger();  // No control, no thread safety, memory leak

// BAD: Eager init with pointer (memory leak, no destruction)
class Bad {
    static Bad* instance;
public:
    static Bad* get() {
        if (!instance) instance = new Bad();  // NOT thread-safe!
        return instance;
    }
};
```

### ✅ C++ Implementation — Meyer's Singleton (Thread-Safe, Modern C++)

```cpp
#include <iostream>
#include <string>
#include <mutex>

// ═══════════════════════════════════════════════════════
// Meyer's Singleton — THE way to do it in modern C++
// Uses static local variable (thread-safe since C++11)
// ═══════════════════════════════════════════════════════

class Logger {
private:
    std::string logFile_;
    
    // Private constructor — no one can create instances
    Logger() : logFile_("app.log") {
        std::cout << "Logger initialized (this happens ONCE)\n";
    }
    
    // Delete copy and assignment — no cloning allowed
    Logger(const Logger&) = delete;
    Logger& operator=(const Logger&) = delete;

public:
    // THE key method — static local guaranteed thread-safe in C++11+
    static Logger& getInstance() {
        static Logger instance;  // Created on first call, destroyed at program end
        return instance;
    }
    
    void log(const std::string& message) {
        std::cout << "[LOG] " << message << "\n";
    }
    
    void setLogFile(const std::string& file) { logFile_ = file; }
    std::string getLogFile() const { return logFile_; }
};

// Usage:
// Logger::getInstance().log("Server started");
// Logger& logger = Logger::getInstance();  // Same instance every time
```

### Lazy vs Eager Initialization

| Aspect | Lazy (Meyer's) | Eager |
|--------|----------------|-------|
| When created | First call to `getInstance()` | Program startup |
| Thread-safe | ✅ C++11 guarantees it | ✅ No race condition |
| Memory | Only if needed | Always allocated |
| **Use when** | **Default choice** | Cheap to create, always needed |

```cpp
// EAGER initialization (if you need it)
class EagerSingleton {
    static EagerSingleton instance;  // Created before main()
    EagerSingleton() {}
public:
    static EagerSingleton& getInstance() { return instance; }
};
EagerSingleton EagerSingleton::instance;  // Definition
```

### Why Global State is Dangerous
```
Problems with Singleton overuse:
  1. Hidden dependencies — code depends on global state you can't see
  2. Hard to test — can't inject mock/stub easily
  3. Tight coupling — everything depends on one concrete class
  4. Thread safety — shared mutable state = bugs

Rule: Use Singleton for INFRASTRUCTURE (logger, config), NOT for business logic.
```

### 🎯 Interview Question — Amazon, Microsoft, Adobe, Goldman Sachs
**Q: "Implement a thread-safe Singleton in C++."**

**Model Answer:**
> "I'd use Meyer's Singleton — a static local variable inside getInstance().
> In C++11 and later, the standard guarantees that static local variables are
> initialized exactly once, even in the presence of concurrent threads.
> This eliminates the need for explicit locking. The destructor is called
> automatically at program exit, so there's no memory leak."

---
---

## 🏗️ CREATIONAL PATTERN 2: FACTORY METHOD

---

### One-line Definition
> Defines an interface for creating objects, but lets **subclasses decide** which class to instantiate.

### When to Use (Decision Trigger)
```
Am I creating objects where the EXACT TYPE depends on some condition?
    ├─ YES → Factory
    │   "I don't know the type at compile time"
    │   "New types may be added later"
    └─ NO  → Direct construction (new/stack allocation)
```

### Simple Factory vs Factory Method vs Abstract Factory

| | Simple Factory | Factory Method | Abstract Factory |
|---|---|---|---|
| **What** | One function creates objects | Subclass decides creation | Creates FAMILIES of objects |
| **How** | switch/if-else in one place | Override in derived class | Multiple factory methods |
| **OCP** | ❌ Modify factory for new type | ✅ Add new subclass | ✅ Add new factory |
| **Use** | Quick & dirty | Framework extensibility | Cross-platform families |

### ASCII Class Diagram — Factory Method
```
         ┌──────────────┐
         │  Creator      │ (abstract)
         │───────────────│
         │+ createShape()│ = 0  ← factory method
         │+ render()     │      ← uses createShape()
         └──────┬────────┘
                │ inherits
        ┌───────┴────────┐
        │                │
┌───────┴──────┐  ┌──────┴───────┐
│CircleCreator │  │SquareCreator │
│──────────────│  │──────────────│
│+createShape()│  │+createShape()│
│ return Circle│  │ return Square│
└──────────────┘  └──────────────┘

         ┌──────────┐
         │  Shape   │ (abstract)
         │──────────│
         │+ draw()  │ = 0
         └────┬─────┘
              │
      ┌───────┴────────┐
      │                │
  ┌───┴───┐       ┌───┴────┐
  │Circle │       │ Square │
  │───────│       │────────│
  │+draw()│       │+draw() │
  └───────┘       └────────┘
```

### Real-World Analogy
> **A pizza store franchise** — each city's store (subclass) decides HOW to make the pizza,
> but they all follow the same ordering process (base class).
> NYC store makes thin crust, Chicago store makes deep dish.

### ❌ Anti-Pattern
```cpp
// BAD: Giant switch statement that violates Open-Closed Principle
Shape* createShape(string type) {
    if (type == "circle") return new Circle();
    else if (type == "square") return new Square();
    // Every new shape = modify THIS function. Violates OCP!
}
```

### ✅ C++ Implementation — Shape Factory

```cpp
#include <iostream>
#include <memory>
#include <string>
#include <unordered_map>
#include <functional>

// ═══════════════════════════════════════════════════════
// APPROACH 1: Simple Factory (quick, not ideal for OCP)
// ═══════════════════════════════════════════════════════

class Shape {
public:
    virtual void draw() const = 0;
    virtual double area() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
    double radius_;
public:
    explicit Circle(double r = 1.0) : radius_(r) {}
    void draw() const override { std::cout << "Drawing Circle (r=" << radius_ << ")\n"; }
    double area() const override { return 3.14159 * radius_ * radius_; }
};

class Square : public Shape {
    double side_;
public:
    explicit Square(double s = 1.0) : side_(s) {}
    void draw() const override { std::cout << "Drawing Square (s=" << side_ << ")\n"; }
    double area() const override { return side_ * side_; }
};

class Triangle : public Shape {
    double base_, height_;
public:
    Triangle(double b = 1.0, double h = 1.0) : base_(b), height_(h) {}
    void draw() const override { std::cout << "Drawing Triangle\n"; }
    double area() const override { return 0.5 * base_ * height_; }
};

// ── Simple Factory ──
class ShapeFactory {
public:
    static std::unique_ptr<Shape> create(const std::string& type) {
        if (type == "circle")   return std::make_unique<Circle>();
        if (type == "square")   return std::make_unique<Square>();
        if (type == "triangle") return std::make_unique<Triangle>();
        return nullptr;
    }
};

// ═══════════════════════════════════════════════════════
// APPROACH 2: Self-Registering Factory (OCP-compliant!)
// New shapes register themselves — no factory modification needed
// ═══════════════════════════════════════════════════════

class ShapeRegistry {
    using Creator = std::function<std::unique_ptr<Shape>()>;
    std::unordered_map<std::string, Creator> registry_;
    
    ShapeRegistry() = default;
public:
    static ShapeRegistry& instance() {
        static ShapeRegistry reg;
        return reg;
    }
    
    void registerShape(const std::string& name, Creator creator) {
        registry_[name] = std::move(creator);
    }
    
    std::unique_ptr<Shape> create(const std::string& name) {
        auto it = registry_.find(name);
        if (it != registry_.end()) return it->second();
        return nullptr;
    }
};

// Auto-registration helper
template<typename T>
struct ShapeRegistrar {
    ShapeRegistrar(const std::string& name) {
        ShapeRegistry::instance().registerShape(name, 
            []() { return std::make_unique<T>(); });
    }
};

// Each shape registers itself — adding new shapes needs ZERO factory changes
static ShapeRegistrar<Circle>   reg_circle("circle");
static ShapeRegistrar<Square>   reg_square("square");
static ShapeRegistrar<Triangle> reg_triangle("triangle");

// Usage:
// auto shape = ShapeRegistry::instance().create("circle");
// shape->draw();
```

### 🎯 Interview Question — Amazon, Google, Atlassian
**Q: "When would you use Factory Method over direct construction?"**

**Model Answer:**
> "When I don't know the exact type at compile time, or when I want to decouple
> the client from concrete classes. For example, if I'm building a document editor
> that supports multiple formats, I'd use a Factory so adding a new format (PDF, DOCX)
> doesn't require modifying existing code — just add a new creator subclass.
> This follows the Open-Closed Principle."

---
---

## 🏗️ CREATIONAL PATTERN 3: ABSTRACT FACTORY

---

### One-line Definition
> Creates **families of related objects** without specifying their concrete classes.

### When to Use (Decision Trigger)
```
Am I creating GROUPS of objects that must work together?
    ├─ YES → Abstract Factory
    │   "Windows button + Windows scrollbar" must be same family
    │   "Dark theme icon + Dark theme background" must match
    └─ NO  → Simple Factory or Factory Method
```

### ASCII Class Diagram
```
     ┌──────────────────┐
     │ GUIFactory       │ (abstract)
     │──────────────────│
     │+ createButton()  │ = 0
     │+ createCheckbox()│ = 0
     └───────┬──────────┘
             │
     ┌───────┴──────────┐
     │                  │
┌────┴─────────┐  ┌────┴──────────┐
│WinFactory    │  │MacFactory     │
│──────────────│  │───────────────│
│+createButton │  │+createButton  │
│  →WinButton  │  │  →MacButton   │
│+createCheckbox│ │+createCheckbox│
│  →WinCheckbox│  │  →MacCheckbox │
└──────────────┘  └───────────────┘

Products:
  Button (abstract) → WinButton, MacButton
  Checkbox (abstract) → WinCheckbox, MacCheckbox
```

### Real-World Analogy
> **IKEA furniture collections** — if you buy "Modern" collection, ALL pieces (table, chair, shelf)
> have the same style. You pick a COLLECTION, not individual pieces.

### ✅ C++ Implementation

```cpp
#include <iostream>
#include <memory>

// ── Abstract Products ──
class Button {
public:
    virtual void render() const = 0;
    virtual ~Button() = default;
};

class Checkbox {
public:
    virtual void toggle() const = 0;
    virtual ~Checkbox() = default;
};

// ── Windows Family ──
class WinButton : public Button {
public:
    void render() const override { std::cout << "[Windows Button]\n"; }
};

class WinCheckbox : public Checkbox {
public:
    void toggle() const override { std::cout << "[Windows Checkbox toggled]\n"; }
};

// ── Mac Family ──
class MacButton : public Button {
public:
    void render() const override { std::cout << "[Mac Button]\n"; }
};

class MacCheckbox : public Checkbox {
public:
    void toggle() const override { std::cout << "[Mac Checkbox toggled]\n"; }
};

// ── Abstract Factory ──
class GUIFactory {
public:
    virtual std::unique_ptr<Button> createButton() const = 0;
    virtual std::unique_ptr<Checkbox> createCheckbox() const = 0;
    virtual ~GUIFactory() = default;
};

class WinFactory : public GUIFactory {
public:
    std::unique_ptr<Button> createButton() const override {
        return std::make_unique<WinButton>();
    }
    std::unique_ptr<Checkbox> createCheckbox() const override {
        return std::make_unique<WinCheckbox>();
    }
};

class MacFactory : public GUIFactory {
public:
    std::unique_ptr<Button> createButton() const override {
        return std::make_unique<MacButton>();
    }
    std::unique_ptr<Checkbox> createCheckbox() const override {
        return std::make_unique<MacCheckbox>();
    }
};

// ── Client code: works with ANY factory ──
void buildUI(const GUIFactory& factory) {
    auto btn = factory.createButton();
    auto chk = factory.createCheckbox();
    btn->render();
    chk->toggle();
}

// Usage:
// WinFactory winFactory;
// buildUI(winFactory);  // All Windows widgets
// MacFactory macFactory;
// buildUI(macFactory);  // All Mac widgets
```

### 🎯 Interview Question — Google, Atlassian
**Q: "How is Abstract Factory different from Factory Method?"**

**Model Answer:**
> "Factory Method creates ONE product type — you override a single method.
> Abstract Factory creates a FAMILY of related products — you override
> multiple creation methods. Use Abstract Factory when you need to ensure
> that products from the same family are used together (e.g., all Windows
> widgets or all Mac widgets, never mixed)."

---
---

## 🏗️ CREATIONAL PATTERN 4: BUILDER

---

### One-line Definition
> Constructs a **complex object step by step**, separating construction from representation.

### When to Use (Decision Trigger)
```
Does the object have MANY optional parameters or construction steps?
    ├─ YES → Builder
    │   "Constructor with 10 parameters is unreadable"
    │   "Some fields are optional, some required"
    └─ NO  → Regular constructor
```

### ASCII Class Diagram
```
┌──────────────────────┐         ┌──────────────┐
│      Director        │ uses    │   Builder     │ (abstract)
│──────────────────────│────────>│──────────────-│
│+ construct(builder)  │         │+ buildWalls() │= 0
└──────────────────────┘         │+ buildRoof()  │= 0
                                 │+ buildGarage()│= 0
                                 │+ getResult()  │= 0
                                 └──────┬────────┘
                                        │
                              ┌─────────┴──────────┐
                              │                    │
                       ┌──────┴──────┐      ┌──────┴──────┐
                       │HouseBuilder │      │IglooBuilder │
                       └─────────────┘      └─────────────┘
```

### Real-World Analogy
> **Subway sandwich** — you don't order "Sandwich #47." You build it step by step:
> bread → meat → veggies → sauce → toast? Each step is optional and customizable.

### ❌ Anti-Pattern: Telescoping Constructor
```cpp
// BAD: Unreadable, error-prone
Computer(string cpu, string gpu, int ram, int ssd, bool wifi, 
         bool bluetooth, string os, string keyboard);

// What does this mean?
Computer c("i7", "RTX4090", 32, 1024, true, false, "Linux", "mechanical");
//                                     ^^^^  ^^^^^  — which is which??
```

### ✅ C++ Implementation — Fluent Builder with Method Chaining

```cpp
#include <iostream>
#include <string>

// ═══════════════════════════════════════════════════════
// Builder Pattern: Computer Builder with fluent interface
// ═══════════════════════════════════════════════════════

class Computer {
    // Many fields, some optional
    std::string cpu_;
    std::string gpu_;
    int ramGB_;
    int storageGB_;
    bool hasWifi_;
    bool hasBluetooth_;
    std::string os_;

    // Private constructor — only Builder can create
    Computer() : ramGB_(8), storageGB_(256), hasWifi_(true), 
                 hasBluetooth_(true), os_("None") {}

public:
    // ── Inner Builder class ──
    class Builder {
        Computer computer_;
    public:
        // Required fields
        Builder(const std::string& cpu) { computer_.cpu_ = cpu; }
        
        // Optional fields — each returns *this for chaining
        Builder& gpu(const std::string& g) { computer_.gpu_ = g; return *this; }
        Builder& ram(int gb)               { computer_.ramGB_ = gb; return *this; }
        Builder& storage(int gb)           { computer_.storageGB_ = gb; return *this; }
        Builder& wifi(bool w)              { computer_.hasWifi_ = w; return *this; }
        Builder& bluetooth(bool b)         { computer_.hasBluetooth_ = b; return *this; }
        Builder& os(const std::string& o)  { computer_.os_ = o; return *this; }
        
        // Final build step
        Computer build() { return computer_; }
    };
    
    void display() const {
        std::cout << "=== Computer ===" << "\n"
                  << "CPU: " << cpu_ << "\n"
                  << "GPU: " << gpu_ << "\n"
                  << "RAM: " << ramGB_ << "GB\n"
                  << "Storage: " << storageGB_ << "GB\n"
                  << "WiFi: " << (hasWifi_ ? "Yes" : "No") << "\n"
                  << "Bluetooth: " << (hasBluetooth_ ? "Yes" : "No") << "\n"
                  << "OS: " << os_ << "\n";
    }
};

// Usage — clean, readable, self-documenting:
// Computer gaming = Computer::Builder("Intel i9")
//     .gpu("RTX 4090")
//     .ram(64)
//     .storage(2048)
//     .os("Windows 11")
//     .build();
//
// Computer basic = Computer::Builder("Intel i3")
//     .ram(8)
//     .build();  // Uses defaults for everything else
```

### 🎯 Interview Question — Amazon, Google
**Q: "When would you use Builder over a constructor?"**

**Model Answer:**
> "When a class has many parameters, especially optional ones. A constructor with
> 8 parameters is error-prone — you might swap arguments. Builder makes each parameter
> explicit via named methods, supports defaults for optional fields, and the fluent
> interface with method chaining makes the code self-documenting. It's also great
> when construction needs validation or when the object should be immutable after creation."

---
---

## 🔧 STRUCTURAL PATTERN 5: ADAPTER

---

### One-line Definition
> Makes **incompatible interfaces work together** by wrapping one interface to match another.

### When to Use (Decision Trigger)
```
Do I have an existing class whose interface DOESN'T MATCH what I need?
    ├─ YES → Adapter
    │   "Legacy code meets new interface"
    │   "Third-party library with different API"
    └─ NO  → Direct usage
```

### ASCII Class Diagram
```
Client expects:              You have:
┌────────────┐              ┌───────────────┐
│  Target    │              │  Adaptee      │
│────────────│              │───────────────│
│+ request() │              │+ specificReq()│
└─────┬──────┘              └───────┬───────┘
      │ implements                  │ wraps
      │                             │
┌─────┴──────────────────────────────┐
│           Adapter                  │
│────────────────────────────────────│
│ - adaptee: Adaptee                │
│ + request() { adaptee.specificReq() }
└────────────────────────────────────┘
```

### Real-World Analogy
> **Power adapter for travel** — your Indian laptop (round pins) doesn't fit US sockets (flat pins).
> The adapter doesn't change the laptop OR the socket — it translates between them.

### ✅ C++ Implementation

```cpp
#include <iostream>
#include <string>

// ═══════════════════════════════════════════════════════
// Adapter Pattern: Legacy XML system → Modern JSON interface
// ═══════════════════════════════════════════════════════

// Target interface — what client expects
class JsonDataProvider {
public:
    virtual std::string getJsonData() const = 0;
    virtual ~JsonDataProvider() = default;
};

// Adaptee — existing class with incompatible interface
class LegacyXmlSystem {
public:
    std::string getXmlData() const {
        return "<data><name>John</name><age>25</age></data>";
    }
};

// Object Adapter (composition — preferred)
class XmlToJsonAdapter : public JsonDataProvider {
    LegacyXmlSystem xmlSystem_;  // composition: HAS-A
public:
    std::string getJsonData() const override {
        std::string xml = xmlSystem_.getXmlData();
        // Simplified conversion (real code would parse XML)
        return R"({"name": "John", "age": 25})";
    }
};

// Class Adapter (inheritance — less flexible, rarely used)
class XmlToJsonClassAdapter : public JsonDataProvider, private LegacyXmlSystem {
public:
    std::string getJsonData() const override {
        std::string xml = getXmlData();  // inherited from LegacyXmlSystem
        return R"({"name": "John", "age": 25})";
    }
};

// Client code — works with JsonDataProvider interface
void processData(const JsonDataProvider& provider) {
    std::cout << "Received: " << provider.getJsonData() << "\n";
}

// Usage:
// XmlToJsonAdapter adapter;
// processData(adapter);  // Client thinks it's JSON, but data comes from XML
```

### Class Adapter vs Object Adapter

| | Class Adapter (Inheritance) | Object Adapter (Composition) |
|---|---|---|
| **Mechanism** | `class A : public Target, private Adaptee` | `class A : public Target { Adaptee a; }` |
| **Flexibility** | Can override Adaptee methods | Can adapt Adaptee's subclasses too |
| **Coupling** | Tightly coupled to one Adaptee | Loosely coupled |
| **Recommendation** | ❌ Rarely used | ✅ **Preferred** |

### 🎯 Interview Question — Microsoft, Oracle
**Q: "Class Adapter vs Object Adapter — which do you prefer and why?"**

**Model Answer:**
> "Object Adapter using composition. It's more flexible because it works with
> any subclass of the adaptee, follows 'composition over inheritance' principle,
> and doesn't create the diamond problem. Class adapter couples you to a specific
> adaptee class via multiple inheritance."

---
---

## 🔧 STRUCTURAL PATTERN 6: DECORATOR

---

### One-line Definition
> **Adds behavior dynamically** to an object without modifying its class, by wrapping it in decorator objects.

### When to Use (Decision Trigger)
```
Do I need to ADD or MODIFY behavior without changing existing classes?
    ├─ YES → Decorator
    │   "Adding toppings to a coffee"
    │   "Adding encryption to a data stream"
    │   "Adding logging to an API call"
    └─ NO  → Regular inheritance or composition
```

### ASCII Class Diagram
```
┌──────────────┐
│  Beverage    │ (abstract)
│──────────────│
│+ cost()      │ = 0
│+ description()│= 0
└──────┬───────┘
       │
  ┌────┴──────────────┐
  │                   │
┌─┴──────────┐  ┌────┴────────────┐
│ Espresso   │  │ CondimentDecorator│ (abstract)
│────────────│  │─────────────────-│
│+cost()→1.99│  │- beverage: Bev*  │  ← wraps a Beverage
│            │  │+cost()           │
└────────────┘  └────┬─────────────┘
                     │
              ┌──────┴───────┐
              │              │
        ┌─────┴────┐  ┌─────┴────┐
        │ Milk     │  │ Sugar    │
        │──────────│  │──────────│
        │+cost()   │  │+cost()   │
        │→bev+0.50 │  │→bev+0.30│
        └──────────┘  └──────────┘
```

### Real-World Analogy
> **Gift wrapping** — you have a book (base object). You can wrap it in paper (first decorator),
> then add a ribbon (second decorator), then put it in a bag (third decorator).
> Each layer adds something, the book underneath stays the same.

### ❌ Anti-Pattern: Inheritance Explosion
```
Without decorator:
  Coffee
  CoffeeWithMilk
  CoffeeWithSugar
  CoffeeWithMilkAndSugar
  CoffeeWithMilkAndSugarAndWhip
  ... 2^N subclasses for N toppings! 💀
```

### ✅ C++ Implementation — Coffee Shop

```cpp
#include <iostream>
#include <memory>
#include <string>

// ═══════════════════════════════════════════════════════
// Decorator Pattern: Coffee ordering system
// ═══════════════════════════════════════════════════════

// Base component
class Beverage {
public:
    virtual double cost() const = 0;
    virtual std::string description() const = 0;
    virtual ~Beverage() = default;
};

// Concrete components
class Espresso : public Beverage {
public:
    double cost() const override { return 1.99; }
    std::string description() const override { return "Espresso"; }
};

class HouseBlend : public Beverage {
public:
    double cost() const override { return 0.89; }
    std::string description() const override { return "House Blend"; }
};

// Base decorator — wraps a Beverage
class CondimentDecorator : public Beverage {
protected:
    std::unique_ptr<Beverage> beverage_;  // wraps another beverage
public:
    explicit CondimentDecorator(std::unique_ptr<Beverage> bev) 
        : beverage_(std::move(bev)) {}
};

// Concrete decorators
class Milk : public CondimentDecorator {
public:
    explicit Milk(std::unique_ptr<Beverage> bev) 
        : CondimentDecorator(std::move(bev)) {}
    double cost() const override { return beverage_->cost() + 0.50; }
    std::string description() const override {
        return beverage_->description() + " + Milk";
    }
};

class Sugar : public CondimentDecorator {
public:
    explicit Sugar(std::unique_ptr<Beverage> bev) 
        : CondimentDecorator(std::move(bev)) {}
    double cost() const override { return beverage_->cost() + 0.30; }
    std::string description() const override {
        return beverage_->description() + " + Sugar";
    }
};

class WhippedCream : public CondimentDecorator {
public:
    explicit WhippedCream(std::unique_ptr<Beverage> bev) 
        : CondimentDecorator(std::move(bev)) {}
    double cost() const override { return beverage_->cost() + 0.70; }
    std::string description() const override {
        return beverage_->description() + " + Whipped Cream";
    }
};

// Usage — dynamic composition at runtime:
// auto order = std::make_unique<Espresso>();         // Espresso: $1.99
// order = std::make_unique<Milk>(std::move(order));  // + Milk:   $2.49
// order = std::make_unique<Sugar>(std::move(order)); // + Sugar:  $2.79
// std::cout << order->description() << ": $" << order->cost() << "\n";
// Output: "Espresso + Milk + Sugar: $2.79"
```

### 🎯 Interview Question — Amazon, Atlassian
**Q: "How is Decorator different from inheritance?"**

**Model Answer:**
> "Inheritance adds behavior at compile time — it's static. Decorator adds behavior
> at runtime — it's dynamic. With inheritance, adding N optional features requires
> 2^N subclasses. With decorator, you compose features by wrapping objects, so you
> only need N decorator classes. Decorator follows the Open-Closed Principle — you
> add new decorators without modifying existing code."

---
---

## 📡 BEHAVIORAL PATTERN 7: OBSERVER

---

### One-line Definition
> Defines a **one-to-many dependency** so that when one object changes state, all its dependents are **automatically notified**.

### When to Use (Decision Trigger)
```
Does a change in ONE object need to UPDATE MULTIPLE other objects?
    ├─ YES → Observer
    │   "Stock price change → update all displays"
    │   "User action → update UI, log, analytics"
    └─ NO  → Direct method calls
```

### ASCII Class Diagram
```
┌────────────────────┐          ┌──────────────────┐
│ Subject (Publisher) │ 1──────* │ Observer         │
│────────────────────│          │──────────────────│
│- observers: list   │          │+ update(data)    │ = 0
│+ attach(observer)  │          └────────┬─────────┘
│+ detach(observer)  │                   │
│+ notify()          │          ┌────────┴──────────┐
└────────────────────┘          │                   │
                          ┌─────┴──────┐    ┌───────┴─────┐
                          │PhoneDisplay│    │WebDashboard │
                          │────────────│    │─────────────│
                          │+update()   │    │+update()    │
                          └────────────┘    └─────────────┘
```

### Real-World Analogy
> **YouTube subscription** — when a channel (Subject) uploads a video, ALL subscribers
> (Observers) get notified. You can subscribe/unsubscribe anytime. The channel
> doesn't know WHO the subscribers are — it just broadcasts.

### ✅ C++ Implementation — Event Notification System

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <memory>
#include <functional>

// ═══════════════════════════════════════════════════════
// Observer Pattern: Stock price notification system
// ═══════════════════════════════════════════════════════

// Forward declaration
class StockExchange;

// Observer interface
class StockObserver {
public:
    virtual void onPriceChange(const std::string& stock, double price) = 0;
    virtual ~StockObserver() = default;
};

// Subject (Publisher)
class StockExchange {
    struct StockData {
        std::string symbol;
        double price;
    };
    std::vector<StockData> stocks_;
    std::vector<StockObserver*> observers_;  // raw ptrs — doesn't own observers
    
public:
    void attach(StockObserver* obs) {
        observers_.push_back(obs);
    }
    
    void detach(StockObserver* obs) {
        observers_.erase(
            std::remove(observers_.begin(), observers_.end(), obs),
            observers_.end());
    }
    
    void setPrice(const std::string& symbol, double price) {
        // Update internal state
        for (auto& s : stocks_) {
            if (s.symbol == symbol) { s.price = price; notify(symbol, price); return; }
        }
        stocks_.push_back({symbol, price});
        notify(symbol, price);
    }
    
private:
    void notify(const std::string& symbol, double price) {
        for (auto* obs : observers_) {
            obs->onPriceChange(symbol, price);
        }
    }
};

// Concrete Observers
class PhoneApp : public StockObserver {
    std::string owner_;
public:
    explicit PhoneApp(const std::string& owner) : owner_(owner) {}
    void onPriceChange(const std::string& stock, double price) override {
        std::cout << "📱 " << owner_ << "'s phone: " 
                  << stock << " = $" << price << "\n";
    }
};

class WebDashboard : public StockObserver {
public:
    void onPriceChange(const std::string& stock, double price) override {
        std::cout << "🖥️  Dashboard: " << stock << " updated to $" << price << "\n";
    }
};

class AlertSystem : public StockObserver {
    double threshold_;
public:
    explicit AlertSystem(double thresh) : threshold_(thresh) {}
    void onPriceChange(const std::string& stock, double price) override {
        if (price > threshold_) {
            std::cout << "🚨 ALERT: " << stock << " crossed $" << threshold_ << "!\n";
        }
    }
};

// Usage:
// StockExchange exchange;
// PhoneApp rahul("Rahul");
// WebDashboard dashboard;
// AlertSystem alert(1500.0);
//
// exchange.attach(&rahul);
// exchange.attach(&dashboard);
// exchange.attach(&alert);
//
// exchange.setPrice("GOOG", 1520.0);
// // All three observers get notified automatically!
//
// exchange.detach(&rahul);  // Rahul unsubscribes
// exchange.setPrice("GOOG", 1480.0);  // Only dashboard and alert notified
```

### 🎯 Interview Question — Atlassian, Amazon, Google
**Q: "Implement an event notification system using Observer pattern."**

**Model Answer:**
> "I'd create a Subject base that maintains a list of Observer pointers.
> Attach/detach add/remove observers. When state changes, notify() iterates
> through the list and calls each observer's update method. This decouples
> the publisher from subscribers — the publisher doesn't know concrete types.
> In modern C++, I might use `std::function` for even more flexibility."

---
---

## 📡 BEHAVIORAL PATTERN 8: STRATEGY

---

### One-line Definition
> Encapsulates a **family of algorithms**, makes them interchangeable, and lets the algorithm vary independently from clients.

### When to Use (Decision Trigger)
```
Do I have MULTIPLE WAYS to do the same thing, switchable at runtime?
    ├─ YES → Strategy
    │   "Sort by price OR by name OR by rating"
    │   "Pay by credit card OR PayPal OR UPI"
    │   "Compress with ZIP OR RAR OR GZIP"
    └─ NO  → Direct implementation
```

### ASCII Class Diagram
```
┌──────────────────────┐        ┌──────────────────┐
│    Context           │ has-a  │ Strategy          │ (abstract)
│──────────────────────│───────>│──────────────────│
│- strategy: Strategy* │        │+ execute(data)   │ = 0
│+ setStrategy(s)      │        └────────┬─────────┘
│+ doWork()            │                 │
└──────────────────────┘        ┌────────┼──────────┐
                                │        │          │
                          ┌─────┴──┐ ┌───┴───┐ ┌───┴─────┐
                          │BubSort │ │MerSort│ │QuikSort │
                          └────────┘ └───────┘ └─────────┘
```

### Real-World Analogy
> **Google Maps navigation** — you choose "Car" OR "Walk" OR "Public Transit."
> The destination stays the same, but the ALGORITHM for finding the route changes.
> You can switch strategies anytime without changing the map itself.

### ❌ Anti-Pattern
```cpp
// BAD: Giant if-else that violates OCP
void processPayment(string method, double amount) {
    if (method == "credit") { /* ... */ }
    else if (method == "paypal") { /* ... */ }
    else if (method == "upi") { /* ... */ }
    // Adding new payment = modify this function!
}
```

### ✅ C++ Implementation — Payment System

```cpp
#include <iostream>
#include <memory>
#include <string>

// ═══════════════════════════════════════════════════════
// Strategy Pattern: Payment processing system
// ═══════════════════════════════════════════════════════

// Strategy interface
class PaymentStrategy {
public:
    virtual bool pay(double amount) const = 0;
    virtual std::string name() const = 0;
    virtual ~PaymentStrategy() = default;
};

// Concrete strategies
class CreditCardPayment : public PaymentStrategy {
    std::string cardNumber_;
public:
    explicit CreditCardPayment(const std::string& card) : cardNumber_(card) {}
    bool pay(double amount) const override {
        std::cout << "Paid $" << amount << " via Credit Card (" 
                  << cardNumber_.substr(cardNumber_.size()-4) << ")\n";
        return true;
    }
    std::string name() const override { return "Credit Card"; }
};

class PayPalPayment : public PaymentStrategy {
    std::string email_;
public:
    explicit PayPalPayment(const std::string& email) : email_(email) {}
    bool pay(double amount) const override {
        std::cout << "Paid $" << amount << " via PayPal (" << email_ << ")\n";
        return true;
    }
    std::string name() const override { return "PayPal"; }
};

class UPIPayment : public PaymentStrategy {
    std::string upiId_;
public:
    explicit UPIPayment(const std::string& id) : upiId_(id) {}
    bool pay(double amount) const override {
        std::cout << "Paid $" << amount << " via UPI (" << upiId_ << ")\n";
        return true;
    }
    std::string name() const override { return "UPI"; }
};

// Context — uses a strategy
class ShoppingCart {
    std::unique_ptr<PaymentStrategy> paymentMethod_;
    double total_ = 0;
public:
    void addItem(const std::string& item, double price) {
        total_ += price;
        std::cout << "Added: " << item << " ($" << price << ")\n";
    }
    
    void setPaymentMethod(std::unique_ptr<PaymentStrategy> method) {
        paymentMethod_ = std::move(method);
    }
    
    bool checkout() {
        if (!paymentMethod_) {
            std::cout << "No payment method set!\n";
            return false;
        }
        std::cout << "Checking out... Total: $" << total_ << "\n";
        return paymentMethod_->pay(total_);
    }
};

// Usage:
// ShoppingCart cart;
// cart.addItem("Laptop", 999.99);
// cart.addItem("Mouse", 29.99);
//
// cart.setPaymentMethod(std::make_unique<CreditCardPayment>("1234-5678-9012-3456"));
// cart.checkout();
//
// // Switch strategy at runtime!
// cart.setPaymentMethod(std::make_unique<UPIPayment>("rahul@upi"));
// cart.checkout();
```

### 🎯 Interview Question — Atlassian, Amazon, Google ⭐ VERY POPULAR
**Q: "Design a system where the sorting algorithm can be changed at runtime."**

**Model Answer:**
> "I'd use the Strategy pattern. Define a SortStrategy interface with a sort() method.
> Create concrete strategies: BubbleSortStrategy, MergeSortStrategy, QuickSortStrategy.
> The context class holds a pointer to SortStrategy and delegates sorting to it.
> The client can swap strategies at runtime via setStrategy(). This follows OCP —
> adding HeapSort just means adding a new class, no modification to existing code."

---
---

## 📡 BEHAVIORAL PATTERN 9: STATE

---

### One-line Definition
> Allows an object to **alter its behavior when its internal state changes** — the object appears to change its class.

### When to Use (Decision Trigger)
```
Does the object behave DIFFERENTLY depending on what STATE it's in?
    ├─ YES → State Pattern
    │   "Vending machine: idle → has money → dispensing"
    │   "Order: placed → shipped → delivered"
    │   "Traffic light: red → green → yellow"
    └─ NO  → Regular conditionals
```

### State vs Strategy — THE Interview Comparison

| Aspect | State | Strategy |
|--------|-------|----------|
| **Intent** | Change behavior based on internal state | Choose algorithm at runtime |
| **Who decides** | State objects trigger transitions | Client explicitly sets strategy |
| **Awareness** | States know about other states | Strategies don't know each other |
| **Transitions** | Automatic (state machine) | Manual (client calls setStrategy) |
| **Example** | Vending machine states | Payment methods |

### ASCII Class Diagram
```
┌──────────────────────┐         ┌────────────────┐
│ VendingMachine       │ has-a   │ State           │ (abstract)
│──────────────────────│────────>│────────────────│
│- state: State*       │         │+insertMoney()  │= 0
│- balance: int        │         │+selectProduct()│= 0
│+ setState(s)         │         │+dispense()     │= 0
│+ insertMoney()       │         └───────┬────────┘
│+ selectProduct()     │                 │
│+ dispense()          │     ┌───────────┼────────────┐
└──────────────────────┘     │           │            │
                       ┌─────┴──┐  ┌─────┴───┐  ┌────┴──────┐
                       │ Idle   │  │HasMoney │  │Dispensing │
                       └────────┘  └─────────┘  └───────────┘
```

### Real-World Analogy
> **Your mood** — when you're happy, you react positively to the same joke. When you're angry,
> you react differently to the SAME joke. Your behavior changes based on your internal state,
> not because someone told you "use happy-algorithm."

### ✅ C++ Implementation — Vending Machine (Classic Interview)

```cpp
#include <iostream>
#include <memory>
#include <string>
#include <unordered_map>

// ═══════════════════════════════════════════════════════
// State Pattern: Vending Machine — CLASSIC interview question
// ═══════════════════════════════════════════════════════

class VendingMachine;  // Forward declaration

// ── State interface ──
class VendingState {
public:
    virtual void insertMoney(VendingMachine& vm, int amount) = 0;
    virtual void selectProduct(VendingMachine& vm, const std::string& product) = 0;
    virtual void dispense(VendingMachine& vm) = 0;
    virtual std::string name() const = 0;
    virtual ~VendingState() = default;
};

// ── Forward declare concrete states ──
class IdleState;
class HasMoneyState;
class DispensingState;

// ── Context ──
class VendingMachine {
    std::unique_ptr<VendingState> state_;
    int balance_ = 0;
    std::unordered_map<std::string, int> inventory_;  // product → price
    std::string selectedProduct_;

public:
    VendingMachine();  // Defined after states are declared
    
    void setState(std::unique_ptr<VendingState> state) { 
        std::cout << "  [State: " << state_->name() << " → " << state->name() << "]\n";
        state_ = std::move(state); 
    }
    
    void insertMoney(int amount) { state_->insertMoney(*this, amount); }
    void selectProduct(const std::string& product) { state_->selectProduct(*this, product); }
    void dispense() { state_->dispense(*this); }
    
    // Accessors for states
    int getBalance() const { return balance_; }
    void addBalance(int amount) { balance_ += amount; }
    void resetBalance() { balance_ = 0; }
    
    int getPrice(const std::string& product) const {
        auto it = inventory_.find(product);
        return (it != inventory_.end()) ? it->second : -1;
    }
    
    void setSelectedProduct(const std::string& p) { selectedProduct_ = p; }
    std::string getSelectedProduct() const { return selectedProduct_; }
    
    void addProduct(const std::string& name, int price) { inventory_[name] = price; }
};

// ── Concrete States ──
class IdleState : public VendingState {
public:
    void insertMoney(VendingMachine& vm, int amount) override {
        vm.addBalance(amount);
        std::cout << "Inserted $" << amount << ". Balance: $" << vm.getBalance() << "\n";
        vm.setState(std::make_unique<HasMoneyState>());
    }
    void selectProduct(VendingMachine& vm, const std::string& product) override {
        std::cout << "Please insert money first!\n";
    }
    void dispense(VendingMachine& vm) override {
        std::cout << "Please insert money and select a product first!\n";
    }
    std::string name() const override { return "Idle"; }
};

class HasMoneyState : public VendingState {
public:
    void insertMoney(VendingMachine& vm, int amount) override {
        vm.addBalance(amount);
        std::cout << "Added $" << amount << ". Balance: $" << vm.getBalance() << "\n";
    }
    void selectProduct(VendingMachine& vm, const std::string& product) override {
        int price = vm.getPrice(product);
        if (price < 0) {
            std::cout << "Product '" << product << "' not available!\n";
            return;
        }
        if (vm.getBalance() < price) {
            std::cout << "Insufficient balance! Need $" << price 
                      << ", have $" << vm.getBalance() << "\n";
            return;
        }
        vm.setSelectedProduct(product);
        std::cout << "Selected: " << product << " ($" << price << ")\n";
        vm.setState(std::make_unique<DispensingState>());
    }
    void dispense(VendingMachine& vm) override {
        std::cout << "Please select a product first!\n";
    }
    std::string name() const override { return "HasMoney"; }
};

class DispensingState : public VendingState {
public:
    void insertMoney(VendingMachine& vm, int amount) override {
        std::cout << "Please wait, dispensing in progress...\n";
    }
    void selectProduct(VendingMachine& vm, const std::string& product) override {
        std::cout << "Please wait, dispensing in progress...\n";
    }
    void dispense(VendingMachine& vm) override {
        std::string product = vm.getSelectedProduct();
        int price = vm.getPrice(product);
        std::cout << "🎉 Dispensing: " << product << "\n";
        int change = vm.getBalance() - price;
        if (change > 0) std::cout << "Change: $" << change << "\n";
        vm.resetBalance();
        vm.setState(std::make_unique<IdleState>());
    }
    std::string name() const override { return "Dispensing"; }
};

// Constructor definition (after states are declared)
VendingMachine::VendingMachine() : state_(std::make_unique<IdleState>()) {
    addProduct("Coke", 2);
    addProduct("Pepsi", 2);
    addProduct("Water", 1);
}

// Usage:
// VendingMachine vm;
// vm.selectProduct("Coke");      // "Please insert money first!"
// vm.insertMoney(3);             // State: Idle → HasMoney
// vm.selectProduct("Coke");      // State: HasMoney → Dispensing
// vm.dispense();                  // "Dispensing: Coke", Change: $1
//                                 // State: Dispensing → Idle
```

### 🎯 Interview Question — Amazon, Flipkart
**Q: "Design a vending machine using OOP principles."**

**Model Answer:**
> "I'd use the State pattern. The vending machine has three states: Idle, HasMoney,
> and Dispensing. Each state is a class implementing the same interface (insertMoney,
> selectProduct, dispense). The machine delegates all actions to its current state object.
> States handle transitions themselves — e.g., HasMoney transitions to Dispensing when
> a valid product is selected. This eliminates complex if-else chains and makes adding
> new states (like 'OutOfStock') trivial."

---
---

## 📡 BEHAVIORAL PATTERN 10: TEMPLATE METHOD

---

### One-line Definition
> Defines the **skeleton of an algorithm** in a base class, letting subclasses override specific steps without changing the overall structure.

### When to Use (Decision Trigger)
```
Do multiple algorithms share the SAME STRUCTURE but differ in SPECIFIC STEPS?
    ├─ YES → Template Method
    │   "All games: init → play loop → end — but each game's loop is different"
    │   "All reports: header → body → footer — but content varies"
    └─ NO  → Strategy (if algorithms are completely different)
```

### ASCII Class Diagram
```
┌──────────────────────────────┐
│ Game (abstract)              │
│──────────────────────────────│
│ + play()        // TEMPLATE  │ ← final: defines skeleton
│   calls:                     │
│   1. initialize()            │
│   2. while(!gameOver)        │
│       startTurn()            │
│       playerTurn()           │
│       endTurn()              │
│   3. displayResult()         │
│──────────────────────────────│
│ # initialize()     = 0      │ ← overridden by subclass
│ # startTurn()      = 0      │
│ # playerTurn()     = 0      │
│ # endTurn()        = 0      │
│ # gameOver(): bool = 0      │
│ # displayResult()  = 0      │
└──────────┬───────────────────┘
           │
    ┌──────┴──────┐
    │             │
┌───┴──────┐  ┌──┴──────────┐
│ Chess    │  │ TicTacToe   │
│──────────│  │─────────────│
│overrides │  │ overrides   │
│all steps │  │ all steps   │
└──────────┘  └─────────────┘
```

### Real-World Analogy
> **Making tea vs coffee** — both follow: boil water → brew → pour → add condiments.
> The STEPS are the same, but WHAT you brew (tea leaves vs coffee grounds) and
> what you add (sugar vs cream) differ. The recipe template is fixed.

### Template Method vs Strategy

| Aspect | Template Method | Strategy |
|--------|----------------|----------|
| **Uses** | Inheritance | Composition |
| **Override** | Selected steps | Entire algorithm |
| **Control** | Base class controls flow | Client controls which strategy |
| **When** | Same algorithm structure, different steps | Completely different algorithms |

### ✅ C++ Implementation — Report Generator

```cpp
#include <iostream>
#include <string>
#include <vector>

// ═══════════════════════════════════════════════════════
// Template Method: Report generation framework
// ═══════════════════════════════════════════════════════

class ReportGenerator {
public:
    // THE Template Method — defines the skeleton
    // Mark as final so subclasses can't change the structure
    void generateReport() final {
        collectData();
        formatHeader();
        formatBody();
        formatFooter();
        std::cout << "\n=== Report Complete ===\n\n";
    }
    
    virtual ~ReportGenerator() = default;

protected:
    // Steps to be overridden by subclasses
    virtual void collectData() = 0;
    virtual void formatHeader() = 0;
    virtual void formatBody() = 0;
    
    // Hook — optional override (has default implementation)
    virtual void formatFooter() {
        std::cout << "--- End of Report ---\n";
    }
};

class PDFReport : public ReportGenerator {
protected:
    void collectData() override {
        std::cout << "[PDF] Collecting data from database...\n";
    }
    void formatHeader() override {
        std::cout << "[PDF] ╔═══════════════════════╗\n";
        std::cout << "[PDF] ║   MONTHLY REPORT      ║\n";
        std::cout << "[PDF] ╚═══════════════════════╝\n";
    }
    void formatBody() override {
        std::cout << "[PDF] Revenue: $50,000\n";
        std::cout << "[PDF] Expenses: $30,000\n";
        std::cout << "[PDF] Profit: $20,000\n";
    }
    void formatFooter() override {
        std::cout << "[PDF] Generated on: 2024-01-15\n";
        std::cout << "[PDF] Confidential\n";
    }
};

class HTMLReport : public ReportGenerator {
protected:
    void collectData() override {
        std::cout << "[HTML] Fetching data via API...\n";
    }
    void formatHeader() override {
        std::cout << "[HTML] <h1>Monthly Report</h1>\n";
    }
    void formatBody() override {
        std::cout << "[HTML] <table><tr><td>Revenue</td><td>$50,000</td></tr></table>\n";
    }
    // Uses default formatFooter() — hook method
};

// Usage:
// PDFReport pdf;
// pdf.generateReport();   // Follows same skeleton, PDF-specific steps
//
// HTMLReport html;
// html.generateReport();  // Follows same skeleton, HTML-specific steps
```

### 🎯 Interview Question — Adobe, Samsung R&D
**Q: "How does Template Method differ from Strategy?"**

**Model Answer:**
> "Template Method uses inheritance — the base class defines the algorithm skeleton
> and subclasses override specific steps. Strategy uses composition — the entire
> algorithm is encapsulated in a separate object and injected into the context.
> Use Template Method when the overall algorithm is fixed but steps vary.
> Use Strategy when the entire algorithm can change."

---
---

# ⚠️ SECTION 3: COMMON TRAPS

---

| # | Trap | What Goes Wrong | Fix |
|---|------|-----------------|-----|
| 1 | **Singleton as global variable** | Hidden dependencies, hard to test | Use dependency injection + Singleton only for infrastructure |
| 2 | **Factory with switch/if-else** | Adding new types requires modifying factory (violates OCP) | Use self-registering factory or Abstract Factory |
| 3 | **Decorator without common interface** | Can't stack decorators or mix with base | All decorators + base must share same interface |
| 4 | **Observer memory leaks** | Forgotten observers never detached | Use weak_ptr or explicit detach in destructor |
| 5 | **State transitions in context** | Giant if-else in context class | States should manage their own transitions |
| 6 | **Strategy: passing context data** | Strategy doesn't have info it needs | Pass context reference or relevant data in execute() |
| 7 | **Overusing patterns** | Simple code becomes needlessly complex | Use a pattern only when it solves a REAL problem |
| 8 | **Builder without validation** | Invalid objects can be constructed | Validate in build() method before returning |
| 9 | **Abstract Factory for 1 product** | Overkill — just use Factory Method | Abstract Factory is for FAMILIES of related objects |
| 10 | **Template Method with too many steps** | Subclasses forced to override 10+ methods | Use hooks (optional overrides with default behavior) |
| 11 | **Confusing State and Strategy** | Using wrong pattern | State: automatic transitions. Strategy: client explicitly chooses |
| 12 | **Singleton in multithreaded code** | Double initialization, data races | Use Meyer's Singleton (C++11 guarantees thread safety) |

---
---

# 🧠 SECTION 4: MENTAL MODELS (Quick Recall)

---

```
Singleton    = "There can be only one" (Highlander)
Factory      = "I'll build it, you tell me what kind" (Pizza store)
Abstract Factory = "Pick a COLLECTION" (IKEA furniture set)
Builder      = "Subway sandwich — step by step" (Build your own)
Adapter      = "Travel power adapter" (Round pin → flat pin)
Decorator    = "Gift wrapping layers" (Add without modifying)
Observer     = "YouTube subscription" (Subscribe → get notified)
Strategy     = "Google Maps route type" (Same destination, different algorithm)
State        = "Your mood changes your reaction" (Same input, different behavior)
Template Method = "Tea vs Coffee recipe" (Same steps, different ingredients)
```

---

## Pattern Selection Decision Tree

```
What problem are you solving?

├─ CREATING objects?
│   ├─ Need exactly ONE instance? → SINGLETON
│   ├─ Don't know exact type at compile time?
│   │   ├─ One product type? → FACTORY METHOD
│   │   └─ Family of related products? → ABSTRACT FACTORY
│   └─ Complex object with many optional params? → BUILDER
│
├─ STRUCTURING classes?
│   ├─ Incompatible interface? → ADAPTER
│   └─ Add behavior without modifying class? → DECORATOR
│
└─ BEHAVIORAL communication?
    ├─ One change notifies many? → OBSERVER
    ├─ Multiple interchangeable algorithms? → STRATEGY
    ├─ Behavior changes with internal state? → STATE
    └─ Same algorithm structure, different steps? → TEMPLATE METHOD
```

---
---

# ⚡ SECTION 5: INTERVIEW SPEED MODE

---

### 15-Second Pattern Identification

```
Interviewer says...                    You think...
──────────────────────────────────────────────────────────
"only one instance"                  → Singleton
"create objects without specifying"  → Factory
"family of related objects"          → Abstract Factory
"complex construction step by step"  → Builder
"make it compatible with"            → Adapter
"add features dynamically"           → Decorator
"notify all when something changes"  → Observer
"switch algorithm at runtime"        → Strategy
"behavior changes based on state"    → State
"same process, different details"    → Template Method
```

### Patterns That Combine (Interview Bonus Points)

```
Observer + Singleton     → Event Manager (single event bus, many listeners)
Factory + Strategy       → Create appropriate strategy based on config
State + Singleton        → State Machine with single instance (Vending Machine)
Decorator + Factory      → Factory creates base, decorators add features
Builder + Factory        → Factory selects builder, builder constructs object
Template + Strategy      → Template defines skeleton, Strategy handles a step
```

### What to Say When You Don't Know a Pattern

```
"This looks like it needs [decoupling / extensibility / encapsulation].
 I'd use [composition / inheritance / interface] to separate the [varying part]
 from the [fixed part]. Let me think about the structure..."

→ Then naturally arrive at the pattern through first principles.
```

---
---

# 🔧 SECTION 6: CODE MEMORY BLOCKS (Ready-to-Write)

---

### Memory Block 1: Singleton (5 lines to memorize)
```cpp
class Singleton {
    Singleton() = default;
    Singleton(const Singleton&) = delete;
    Singleton& operator=(const Singleton&) = delete;
public:
    static Singleton& getInstance() {
        static Singleton instance;
        return instance;
    }
};
```

### Memory Block 2: Strategy Interface (4 lines)
```cpp
class Strategy {
public:
    virtual void execute(/* params */) = 0;
    virtual ~Strategy() = default;
};
// Context holds: std::unique_ptr<Strategy> strategy_;
// Context calls: strategy_->execute();
```

### Memory Block 3: Observer Core (10 lines)
```cpp
class Observer { public: virtual void update(/* data */) = 0; virtual ~Observer()=default; };
class Subject {
    std::vector<Observer*> observers_;
public:
    void attach(Observer* o) { observers_.push_back(o); }
    void detach(Observer* o) { 
        observers_.erase(std::remove(observers_.begin(), observers_.end(), o), observers_.end()); 
    }
    void notify(/* data */) { for(auto* o : observers_) o->update(/* data */); }
};
```

### Memory Block 4: State Pattern Core (8 lines)
```cpp
class State {
public:
    virtual void handle(Context& ctx) = 0;
    virtual ~State() = default;
};
class Context {
    std::unique_ptr<State> state_;
public:
    void setState(std::unique_ptr<State> s) { state_ = std::move(s); }
    void request() { state_->handle(*this); }
};
```

### Memory Block 5: Decorator Core (7 lines)
```cpp
class Component { public: virtual int operation() = 0; virtual ~Component()=default; };
class Decorator : public Component {
protected:
    std::unique_ptr<Component> wrapped_;
public:
    explicit Decorator(std::unique_ptr<Component> c) : wrapped_(std::move(c)) {}
    int operation() override { return wrapped_->operation(); }  // delegates
};
// ConcreteDecorator: override operation() { return wrapped_->operation() + extra; }
```

---
---

# 📊 SECTION 7: INTERVIEW QUESTIONS BANK

---

## Conceptual Questions

| # | Question | Pattern | Companies |
|---|----------|---------|-----------|
| 1 | "Implement a thread-safe Singleton" | Singleton | Amazon, Microsoft, Adobe, Goldman Sachs |
| 2 | "Design a shape factory that's extensible" | Factory | Amazon, Google, Atlassian |
| 3 | "When would you use Abstract Factory over Factory Method?" | Both | Google, Microsoft |
| 4 | "Design a fluent builder for a complex object" | Builder | Amazon, Google |
| 5 | "How would you integrate a legacy system with a new API?" | Adapter | Microsoft, Oracle |
| 6 | "Add features to a class without modifying it" | Decorator | Amazon, Atlassian |
| 7 | "Design an event notification system" | Observer | Atlassian, Amazon, Google |
| 8 | "Design a system where the sorting algorithm can change at runtime" | Strategy | Atlassian, Amazon, Google |
| 9 | "Design a vending machine" | State | Amazon, Samsung, Flipkart |
| 10 | "How does Template Method differ from Strategy?" | Both | Adobe, Samsung R&D |

## Design Questions (Patterns Applied)

| # | Question | Patterns Used | Companies |
|---|----------|---------------|-----------|
| 1 | "Design a parking lot" | Strategy + Factory + Singleton | Amazon, Google, Microsoft |
| 2 | "Design an elevator system" | State + Strategy + Observer | Amazon, Microsoft, Adobe |
| 3 | "Design a notification service" | Observer + Strategy + Factory | Atlassian, Amazon |
| 4 | "Design a logging framework" | Singleton + Strategy + Decorator | Amazon, Microsoft, Goldman Sachs |
| 5 | "Design a cache system" | Singleton + Strategy (eviction) | Amazon, Google, DE Shaw |
| 6 | "Design a payment system" | Strategy + Factory | Amazon, Walmart, Flipkart |
| 7 | "Design a file compression tool" | Strategy + Template Method | Adobe, Qualcomm |
| 8 | "Design a game engine framework" | Template + State + Observer | Samsung R&D, Adobe |

## Rapid-Fire (One-Liners)

| Question | Answer |
|----------|--------|
| Singleton vs Static class? | Singleton can implement interfaces, be lazy-loaded, and be passed as parameter |
| Can Singleton be inherited? | Technically yes, but it defeats the purpose. Don't do it. |
| How to break Singleton? | Reflection, serialization, cloning. Prevent via deleted copy + private constructor |
| Factory vs Constructor? | Factory can return cached objects, subclass types, or null. Constructor always creates new. |
| Decorator vs Proxy? | Decorator adds behavior. Proxy controls access. |
| Observer vs Pub-Sub? | Observer is direct coupling. Pub-Sub has a message broker in between. |
| State vs Strategy? | State: transitions are automatic. Strategy: client explicitly sets algorithm. |
| Why is Builder useful? | Readable construction of complex objects with many optional parameters. |

---
---

# 📋 PATTERN SELECTION CHEAT SHEET (Tear-Out Reference)

---

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DESIGN PATTERN CHEAT SHEET                          │
├──────────────────┬──────────────────────────────────────────────────────┤
│ PATTERN          │ USE WHEN...                                         │
├──────────────────┼──────────────────────────────────────────────────────┤
│ Singleton        │ Exactly one instance needed globally                │
│ Factory Method   │ Type decided at runtime, new types may be added     │
│ Abstract Factory │ Need families of related objects                    │
│ Builder          │ Complex object, many optional params, step-by-step  │
│ Adapter          │ Incompatible interface needs to fit                 │
│ Decorator        │ Add/remove behavior dynamically, no modification    │
│ Observer         │ One change → many updates (event-driven)            │
│ Strategy         │ Multiple algorithms, switchable at runtime          │
│ State            │ Behavior depends on internal state                  │
│ Template Method  │ Same algorithm skeleton, different step details     │
├──────────────────┼──────────────────────────────────────────────────────┤
│ ANTI-PATTERNS    │ WHAT TO AVOID                                       │
├──────────────────┼──────────────────────────────────────────────────────┤
│ God Class        │ One class does everything                           │
│ Spaghetti Code   │ No structure, everything calls everything           │
│ Lava Flow        │ Dead code nobody dares remove                       │
│ Golden Hammer    │ Using one pattern for everything                    │
│ Copy-Paste       │ Duplicating code instead of abstracting             │
└──────────────────┴──────────────────────────────────────────────────────┘
```

---
> **Last Updated:** June 2026 | **Target:** B.Tech CSE Interviews | **Language:** C++17
