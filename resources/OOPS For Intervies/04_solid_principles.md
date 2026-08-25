# SOLID Principles & Design Philosophy — Elite Interview Revision Sheet

> 🎯 **Purpose:** Design principles that separate "code that works" from "code that's maintainable."
> Interviewers test SOLID to check if you can build REAL systems, not just solve algorithmic puzzles.

---

## 📑 TABLE OF CONTENTS

| # | Topic | Interview Weight |
|---|-------|-----------------|
| 1 | Why SOLID Matters | ⭐⭐⭐ |
| 2 | S — Single Responsibility Principle | ⭐⭐⭐⭐⭐ |
| 3 | O — Open/Closed Principle | ⭐⭐⭐⭐⭐ |
| 4 | L — Liskov Substitution Principle | ⭐⭐⭐⭐⭐ |
| 5 | I — Interface Segregation Principle | ⭐⭐⭐⭐ |
| 6 | D — Dependency Inversion Principle | ⭐⭐⭐⭐⭐ |
| 7 | Composition vs Inheritance | ⭐⭐⭐⭐⭐ |
| 8 | Coupling & Cohesion | ⭐⭐⭐⭐ |
| 9 | DRY, KISS, YAGNI | ⭐⭐⭐ |
| 10 | GRASP Principles Refresh | ⭐⭐⭐ |

---

# SECTION 1: 🧠 THINKING FIRST — Why Design Principles?

```
Interviewer: "Design a notification system for an e-commerce platform."

BAD Answer (Coding-only mindset):
  "I'll make a NotificationManager class that handles email, SMS,
   push notifications, and Slack messages. It'll have a switch-case
   for each type..."

GOOD Answer (Design-principled mindset):
  "I'll create a Notification interface with send(). Each channel
   (Email, SMS, Push, Slack) implements it. A NotificationService
   takes a vector of Notification* and sends through all channels.
   Adding WhatsApp later means just adding a new class — no existing
   code changes. This follows OCP and DIP..."

The difference? SOLID principles.
```

### What Interviewers Look For When They Ask About SOLID

```
┌──────────────────────────────────────────────────────────┐
│  They're NOT checking if you memorized definitions.     │
│  They're checking if you can:                            │
│                                                          │
│  1. IDENTIFY violations in existing code                 │
│  2. REFACTOR code using these principles                 │
│  3. DESIGN new systems with these principles             │
│  4. EXPLAIN trade-offs (over-engineering vs good design) │
│  5. USE the right principle for the right situation      │
└──────────────────────────────────────────────────────────┘
```

---

# SECTION 2: CORE CONCEPTS

---

## 1️⃣ WHY SOLID MATTERS

### 🧠 One-Line Definition
> SOLID principles are five design guidelines that make software **flexible, maintainable, and resilient to change.**

### ⚡ Bad Code vs Good Code — A Real Example

```cpp
// ═══════════════════════════════════════════════════
// BAD CODE: Everything crammed into one class
// ═══════════════════════════════════════════════════
class OrderProcessor {
public:
    void processOrder(Order& order) {
        // Validate order
        if (order.items.empty()) throw runtime_error("Empty order");
        if (order.total < 0) throw runtime_error("Negative total");

        // Calculate tax (changes when tax laws change)
        double tax = order.total * 0.18;  // GST
        order.total += tax;

        // Process payment (changes when we add new payment methods)
        if (order.paymentType == "CREDIT_CARD") {
            // Credit card processing logic...
            cout << "Processing credit card...\n";
        } else if (order.paymentType == "UPI") {
            // UPI processing logic...
            cout << "Processing UPI...\n";
        } else if (order.paymentType == "WALLET") {
            // Wallet logic...
            cout << "Processing wallet...\n";
        }

        // Save to database (changes when we switch databases)
        // MySQL-specific code here...
        cout << "Saving to MySQL...\n";

        // Send confirmation (changes when we add notification channels)
        // Email sending code here...
        cout << "Sending email...\n";

        // Generate invoice (changes when invoice format changes)
        // PDF generation code here...
        cout << "Generating PDF invoice...\n";
    }
};
// Problems:
// 1. ONE class with SIX reasons to change → violates SRP
// 2. Adding PayPal requires modifying this class → violates OCP
// 3. Tightly coupled to MySQL, Email, PDF → violates DIP
// 4. Can't test payment without testing email → untestable
// 5. Any change risks breaking everything → fragile
```

```
WHAT HAPPENS IN REAL COMPANIES:
─────────────────────────────────
Day 1:   Developer writes OrderProcessor. It works. Ship it.
Day 30:  Add PayPal. Modify processOrder. Break UPI. Hotfix.
Day 60:  Add SMS notifications. Modify processOrder. Break invoice.
Day 90:  Switch from MySQL to PostgreSQL. Touch processOrder.
         Accidentally break payment flow. Production down for 2 hours.
Day 120: New developer joins. Takes 3 weeks to understand one class.
Day 150: Nobody wants to touch this file. It's the "God class."

COST: $$$$$ in developer time, bugs, and production incidents.
```

---

## 2️⃣ S — SINGLE RESPONSIBILITY PRINCIPLE (SRP)

### 🧠 One-Line Definition
> **"A class should have only ONE reason to change."** — Robert C. Martin

### ⚡ Why It Matters
- **Interview:** "How would you refactor this class?" — universal refactoring question
- **Real-world:** SRP violations are the #1 cause of "spaghetti code" in large codebases

### 🔍 Understanding "Reason to Change"

```
"Reason to change" = one ACTOR or STAKEHOLDER that might request changes.

Example: OrderProcessor has these actors:
  1. Tax Department    → tax calculation changes
  2. Payment Team      → new payment methods
  3. DBA Team          → database changes
  4. Marketing Team    → notification changes
  5. Finance Team      → invoice format changes

Each actor = one reason to change = one responsibility = one class!
```

### 🔧 BAD → GOOD Refactoring

```cpp
// ═══════════════════════════════════════════════════
// GOOD CODE: Each class has exactly ONE responsibility
// ═══════════════════════════════════════════════════

struct Order {
    vector<string> items;
    double total;
    string paymentType;
    string customerEmail;
};

// ─── Responsibility 1: Validation ───
class OrderValidator {
public:
    bool validate(const Order& order) const {
        if (order.items.empty()) {
            cerr << "Error: Empty order\n";
            return false;
        }
        if (order.total < 0) {
            cerr << "Error: Negative total\n";
            return false;
        }
        return true;
    }
};

// ─── Responsibility 2: Tax Calculation ───
class TaxCalculator {
    double gstRate;
public:
    TaxCalculator(double rate = 0.18) : gstRate(rate) {}

    double calculateTax(double amount) const {
        return amount * gstRate;
    }
};

// ─── Responsibility 3: Payment Processing ───
class PaymentProcessor {
public:
    virtual bool processPayment(const Order& order) = 0;
    virtual ~PaymentProcessor() = default;
};

class CreditCardProcessor : public PaymentProcessor {
public:
    bool processPayment(const Order& order) override {
        cout << "Processing credit card for ₹" << order.total << "\n";
        return true;
    }
};

class UPIProcessor : public PaymentProcessor {
public:
    bool processPayment(const Order& order) override {
        cout << "Processing UPI for ₹" << order.total << "\n";
        return true;
    }
};

// ─── Responsibility 4: Persistence ───
class OrderRepository {
public:
    virtual void save(const Order& order) = 0;
    virtual ~OrderRepository() = default;
};

class MySQLOrderRepository : public OrderRepository {
public:
    void save(const Order& order) override {
        cout << "Saved order to MySQL\n";
    }
};

// ─── Responsibility 5: Notification ───
class NotificationService {
public:
    virtual void notify(const Order& order) = 0;
    virtual ~NotificationService() = default;
};

class EmailNotification : public NotificationService {
public:
    void notify(const Order& order) override {
        cout << "Email sent to " << order.customerEmail << "\n";
    }
};

// ─── Orchestrator (coordinates, but has SINGLE responsibility: orchestration) ───
class OrderService {
    OrderValidator validator;
    TaxCalculator taxCalc;
    unique_ptr<PaymentProcessor> payment;
    unique_ptr<OrderRepository> repo;
    unique_ptr<NotificationService> notifier;

public:
    OrderService(unique_ptr<PaymentProcessor> pay,
                 unique_ptr<OrderRepository> rep,
                 unique_ptr<NotificationService> notif)
        : payment(move(pay)), repo(move(rep)), notifier(move(notif)) {}

    bool processOrder(Order& order) {
        if (!validator.validate(order)) return false;

        order.total += taxCalc.calculateTax(order.total);

        if (!payment->processPayment(order)) return false;

        repo->save(order);
        notifier->notify(order);
        return true;
    }
};
```

### ⚠️ SRP — Common Trap

```
OVER-ENGINEERING TRAP:
  Don't create a class for EVERY tiny thing.
  SRP doesn't mean "a class should do only one thing."
  SRP means "a class should have one REASON TO CHANGE."

  BAD over-engineering:
    class StringAdder { string add(string a, string b) { return a + b; } };
    class StringPrinter { void print(string s) { cout << s; } };

  These two are not separate stakeholders. That's overkill.

BALANCE: Group related functionality that changes for the SAME reason.
```

---

## 3️⃣ O — OPEN/CLOSED PRINCIPLE (OCP)

### 🧠 One-Line Definition
> **"Software entities should be OPEN for extension, but CLOSED for modification."** — Bertrand Meyer

### ⚡ The Core Idea

```
CLOSED for modification = Don't change existing, tested, working code.
OPEN for extension       = You CAN add new behavior by adding new code.

HOW? Polymorphism! Interfaces! Strategy pattern!
```

### 🔧 BAD: The switch/if-else Anti-pattern

```cpp
// ═══ BAD: Adding a new shape requires modifying this function! ═══
class AreaCalculator {
public:
    double calculateArea(const string& shapeType,
                         double param1, double param2 = 0) {
        if (shapeType == "circle") {
            return 3.14159 * param1 * param1;
        } else if (shapeType == "rectangle") {
            return param1 * param2;
        } else if (shapeType == "triangle") {
            return 0.5 * param1 * param2;
        }
        // Adding hexagon? Pentagon? MODIFY this function!
        // Every modification risks breaking existing shapes!
        return 0;
    }
};
```

### 🔧 GOOD: Polymorphism-based Extension

```cpp
#include <iostream>
#include <vector>
#include <memory>
#include <cmath>
using namespace std;

// ─── Abstract base — the "closed" part ───
class Shape {
public:
    virtual double area() const = 0;
    virtual string name() const = 0;
    virtual ~Shape() = default;
};

// ─── Concrete shapes — the "open" part (extend by adding new classes) ───
class Circle : public Shape {
    double radius;
public:
    Circle(double r) : radius(r) {}
    double area() const override { return M_PI * radius * radius; }
    string name() const override { return "Circle"; }
};

class Rectangle : public Shape {
    double width, height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    double area() const override { return width * height; }
    string name() const override { return "Rectangle"; }
};

class Triangle : public Shape {
    double base, height;
public:
    Triangle(double b, double h) : base(b), height(h) {}
    double area() const override { return 0.5 * base * height; }
    string name() const override { return "Triangle"; }
};

// ─── This function is CLOSED for modification ───
// ─── It works with ANY shape — even ones not yet invented! ───
class AreaCalculator {
public:
    static double totalArea(const vector<unique_ptr<Shape>>& shapes) {
        double total = 0;
        for (const auto& shape : shapes) {
            total += shape->area();
        }
        return total;
    }

    static void printAreas(const vector<unique_ptr<Shape>>& shapes) {
        for (const auto& shape : shapes) {
            cout << shape->name() << ": " << shape->area() << "\n";
        }
    }
};

int main() {
    vector<unique_ptr<Shape>> shapes;
    shapes.push_back(make_unique<Circle>(5.0));
    shapes.push_back(make_unique<Rectangle>(4.0, 6.0));
    shapes.push_back(make_unique<Triangle>(3.0, 8.0));

    AreaCalculator::printAreas(shapes);
    cout << "Total: " << AreaCalculator::totalArea(shapes) << "\n";
    return 0;
}

// Want to add a Hexagon? Just create a new class!
// NO changes to AreaCalculator, Shape, or any existing code!
class Hexagon : public Shape {
    double side;
public:
    Hexagon(double s) : side(s) {}
    double area() const override { return 1.5 * sqrt(3) * side * side; }
    string name() const override { return "Hexagon"; }
};
// Done! Open for extension, closed for modification. ✅
```

### 🔗 Strategy Pattern — OCP in Action

```cpp
#include <iostream>
#include <memory>
using namespace std;

// ─── Strategy interface ───
class SortStrategy {
public:
    virtual void sort(vector<int>& data) = 0;
    virtual ~SortStrategy() = default;
};

class BubbleSort : public SortStrategy {
public:
    void sort(vector<int>& data) override {
        cout << "Sorting with Bubble Sort\n";
        // ... bubble sort implementation
    }
};

class QuickSort : public SortStrategy {
public:
    void sort(vector<int>& data) override {
        cout << "Sorting with Quick Sort\n";
        // ... quick sort implementation
    }
};

class MergeSort : public SortStrategy {
public:
    void sort(vector<int>& data) override {
        cout << "Sorting with Merge Sort\n";
        // ... merge sort implementation
    }
};

// ─── Context — CLOSED for modification ───
class DataProcessor {
    unique_ptr<SortStrategy> strategy;
public:
    DataProcessor(unique_ptr<SortStrategy> s) : strategy(move(s)) {}

    void setStrategy(unique_ptr<SortStrategy> s) { strategy = move(s); }

    void process(vector<int>& data) {
        cout << "Processing data...\n";
        strategy->sort(data);
        cout << "Done.\n";
    }
};

int main() {
    vector<int> data = {5, 2, 8, 1, 9};

    DataProcessor processor(make_unique<QuickSort>());
    processor.process(data);

    processor.setStrategy(make_unique<MergeSort>());
    processor.process(data);
    // Adding RadixSort? Just write a new class. No changes to DataProcessor!
    return 0;
}
```

---

## 4️⃣ L — LISKOV SUBSTITUTION PRINCIPLE (LSP)

### 🧠 One-Line Definition
> **"Subtypes must be substitutable for their base types without breaking the program."** — Barbara Liskov

### ⚡ The Litmus Test

```
If S is a subtype of T, then objects of type T can be replaced with
objects of type S WITHOUT altering correctness.

In simple words:
  If you have a function that takes a Base*, you should be able to
  pass a Derived* and EVERYTHING should still work correctly.
```

### 🔧 THE Classic Violation: Rectangle-Square Problem

```cpp
// ═══ LSP VIOLATION — The Rectangle-Square Problem ═══

class Rectangle {
protected:
    int width, height;
public:
    Rectangle(int w, int h) : width(w), height(h) {}

    virtual void setWidth(int w)  { width = w; }
    virtual void setHeight(int h) { height = h; }
    int getWidth() const  { return width; }
    int getHeight() const { return height; }

    int area() const { return width * height; }
};

// Mathematically, a square IS-A rectangle.
// But in OOP, this breaks LSP!
class Square : public Rectangle {
public:
    Square(int side) : Rectangle(side, side) {}

    // Must keep width == height!
    void setWidth(int w) override  { width = w; height = w; }
    void setHeight(int h) override { width = h; height = h; }
};

// ─── This function expects Rectangle behavior ───
void testRectangle(Rectangle& r) {
    r.setWidth(5);
    r.setHeight(3);
    // EXPECTATION: area should be 5 * 3 = 15
    cout << "Expected area: 15, Actual: " << r.area() << "\n";
}

int main() {
    Rectangle rect(2, 2);
    testRectangle(rect);  // Expected: 15, Actual: 15 ✅

    Square sq(2);
    testRectangle(sq);    // Expected: 15, Actual: 9 ❌ LSP VIOLATION!
    // setWidth(5) also set height to 5
    // setHeight(3) then set width to 3
    // So area = 3 * 3 = 9, not 15!
    return 0;
}
```

### 🔧 FIX: Separate Hierarchy

```cpp
// ═══ LSP-COMPLIANT Design ═══

class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};

class Rectangle : public Shape {
    int width, height;
public:
    Rectangle(int w, int h) : width(w), height(h) {}
    void setWidth(int w) { width = w; }
    void setHeight(int h) { height = h; }
    double area() const override { return width * height; }
};

class Square : public Shape {
    int side;
public:
    Square(int s) : side(s) {}
    void setSide(int s) { side = s; }
    double area() const override { return side * side; }
};

// Now Rectangle and Square are siblings, not parent-child.
// No one assumes Square behaves like Rectangle.
// Both satisfy the Shape contract: they have an area.
```

### 📊 LSP Violation Checklist

| Violation Type | What It Means | Example |
|---------------|---------------|---------|
| **Strengthened precondition** | Subclass requires MORE from caller than base | Base accepts any int, subclass only positive |
| **Weakened postcondition** | Subclass guarantees LESS than base | Base always returns sorted list, subclass doesn't |
| **Exception surprise** | Subclass throws exceptions base didn't | Base's save() never throws, subclass does |
| **Behavioral change** | Subclass does something unexpected | Square::setWidth also changes height |
| **Type violation** | Subclass returns narrower type | Overriding clone() returns wrong type |

### ⚡ Quick LSP Check

```
Ask yourself: "Can I use Derived EVERYWHERE I use Base
              without ANY unexpected behavior?"

YES → LSP satisfied ✅
NO  → LSP violated ❌ → Rethink the hierarchy!
```

---

## 5️⃣ I — INTERFACE SEGREGATION PRINCIPLE (ISP)

### 🧠 One-Line Definition
> **"No client should be forced to depend on methods it does not use."** — Robert C. Martin

### ⚡ Fat Interface = Bad

```
If a class implements an interface, it MUST implement ALL methods.
A "fat" interface forces classes to implement methods they don't need.
Result: Empty methods, thrown exceptions for "not supported", brittle code.
```

### 🔧 BAD: Fat Interface

```cpp
// ═══ BAD: One fat interface for all workers ═══

class IWorker {
public:
    virtual void work() = 0;
    virtual void eat() = 0;
    virtual void sleep() = 0;
    virtual void attendMeeting() = 0;
    virtual void writeReport() = 0;
    virtual ~IWorker() = default;
};

// A human worker — OK, implements everything
class HumanWorker : public IWorker {
public:
    void work() override          { cout << "Working...\n"; }
    void eat() override           { cout << "Eating lunch...\n"; }
    void sleep() override         { cout << "Sleeping...\n"; }
    void attendMeeting() override { cout << "In meeting...\n"; }
    void writeReport() override   { cout << "Writing report...\n"; }
};

// A robot worker — FORCED to implement eat() and sleep()! 🤦
class RobotWorker : public IWorker {
public:
    void work() override          { cout << "Working efficiently...\n"; }
    void eat() override           { /* DOES NOTHING — robot doesn't eat! */ }
    void sleep() override         { /* DOES NOTHING — robot doesn't sleep! */ }
    void attendMeeting() override { /* DOES NOTHING */ }
    void writeReport() override   { cout << "Generating report...\n"; }
};
// RobotWorker is polluted with meaningless methods!
```

### 🔧 GOOD: Segregated Interfaces

```cpp
// ═══ GOOD: Small, focused interfaces ═══

class IWorkable {
public:
    virtual void work() = 0;
    virtual ~IWorkable() = default;
};

class IFeedable {
public:
    virtual void eat() = 0;
    virtual ~IFeedable() = default;
};

class ISleepable {
public:
    virtual void sleep() = 0;
    virtual ~ISleepable() = default;
};

class IMeetingAttendee {
public:
    virtual void attendMeeting() = 0;
    virtual ~IMeetingAttendee() = default;
};

class IReportWriter {
public:
    virtual void writeReport() = 0;
    virtual ~IReportWriter() = default;
};

// Human — implements all relevant interfaces
class HumanWorker : public IWorkable, public IFeedable,
                    public ISleepable, public IMeetingAttendee,
                    public IReportWriter {
public:
    void work() override          { cout << "Working...\n"; }
    void eat() override           { cout << "Eating lunch...\n"; }
    void sleep() override         { cout << "Sleeping...\n"; }
    void attendMeeting() override { cout << "In meeting...\n"; }
    void writeReport() override   { cout << "Writing report...\n"; }
};

// Robot — implements ONLY what it actually does
class RobotWorker : public IWorkable, public IReportWriter {
public:
    void work() override        { cout << "Working efficiently...\n"; }
    void writeReport() override { cout << "Generating report...\n"; }
};
// Clean! Robot has no empty methods. Each interface is focused.

// Functions depend ONLY on the interfaces they need:
void manageWork(IWorkable& worker) {
    worker.work();  // Works for both Human and Robot
}

void scheduleLunch(IFeedable& feeder) {
    feeder.eat();  // Only callable with things that eat
}
```

---

## 6️⃣ D — DEPENDENCY INVERSION PRINCIPLE (DIP)

### 🧠 One-Line Definition
> **"High-level modules should not depend on low-level modules. Both should depend on abstractions."** — Robert C. Martin

### ⚡ The Problem Without DIP

```
WITHOUT DIP:
  OrderService ──────→ MySQLDatabase
  (high-level)         (low-level)

  Change from MySQL to PostgreSQL?
  → Must MODIFY OrderService!
  → OrderService is tightly coupled to MySQL.

WITH DIP:
  OrderService ──────→ IDatabase (interface/abstraction)
                          ↑
                    ┌─────┴──────┐
                    │            │
              MySQLDatabase  PostgresDatabase

  Change databases? Just swap the implementation.
  OrderService never changes!
```

### 🔧 BAD: Direct Dependency

```cpp
// ═══ BAD: High-level depends on low-level directly ═══

class MySQLDatabase {
public:
    void connect() { cout << "Connected to MySQL\n"; }
    void query(const string& sql) { cout << "MySQL query: " << sql << "\n"; }
    void disconnect() { cout << "Disconnected from MySQL\n"; }
};

class UserService {
    MySQLDatabase db;  // DIRECTLY coupled to MySQL!
public:
    void getUser(int id) {
        db.connect();
        db.query("SELECT * FROM users WHERE id = " + to_string(id));
        db.disconnect();
    }
};
// What if we want to switch to PostgreSQL? Or use an in-memory DB for tests?
// Must MODIFY UserService! ❌
```

### 🔧 GOOD: Depend on Abstraction

```cpp
#include <iostream>
#include <memory>
using namespace std;

// ═══ GOOD: Both depend on abstraction ═══

// ─── Abstraction (interface) ───
class IDatabase {
public:
    virtual void connect() = 0;
    virtual void query(const string& sql) = 0;
    virtual void disconnect() = 0;
    virtual ~IDatabase() = default;
};

// ─── Low-level implementations ───
class MySQLDatabase : public IDatabase {
public:
    void connect() override    { cout << "Connected to MySQL\n"; }
    void query(const string& sql) override { cout << "MySQL: " << sql << "\n"; }
    void disconnect() override { cout << "Disconnected from MySQL\n"; }
};

class PostgresDatabase : public IDatabase {
public:
    void connect() override    { cout << "Connected to PostgreSQL\n"; }
    void query(const string& sql) override { cout << "Postgres: " << sql << "\n"; }
    void disconnect() override { cout << "Disconnected from PostgreSQL\n"; }
};

class InMemoryDatabase : public IDatabase {
public:
    void connect() override    { cout << "In-memory DB ready\n"; }
    void query(const string& sql) override { cout << "InMem: " << sql << "\n"; }
    void disconnect() override { cout << "In-memory DB cleared\n"; }
};

// ─── High-level module depends on ABSTRACTION ───
class UserService {
    unique_ptr<IDatabase> db;  // Depends on interface, not concrete class!
public:
    // Dependency Injection via constructor
    UserService(unique_ptr<IDatabase> database) : db(move(database)) {}

    void getUser(int id) {
        db->connect();
        db->query("SELECT * FROM users WHERE id = " + to_string(id));
        db->disconnect();
    }
};

int main() {
    // Production
    auto prodService = UserService(make_unique<MySQLDatabase>());
    prodService.getUser(42);

    cout << "\n";

    // Testing — swap to in-memory DB. NO code changes in UserService!
    auto testService = UserService(make_unique<InMemoryDatabase>());
    testService.getUser(42);

    return 0;
}
```

### 🔗 Dependency Injection — Three Flavors

```cpp
class Service {
    unique_ptr<IDatabase> db;
    unique_ptr<ILogger> logger;

public:
    // ─── 1. Constructor Injection (PREFERRED) ───
    // Dependencies provided at construction time
    Service(unique_ptr<IDatabase> db, unique_ptr<ILogger> log)
        : db(move(db)), logger(move(log)) {}

    // ─── 2. Setter Injection ───
    // Dependencies can be changed after construction
    void setDatabase(unique_ptr<IDatabase> newDb) { db = move(newDb); }

    // ─── 3. Interface Injection ───
    // Method parameter — dependency passed per-call
    void process(IDatabase& database) {
        database.query("...");
    }
};

// Constructor injection is preferred because:
// - Object is ALWAYS in valid state (can't forget to set dependency)
// - Dependencies are clear from the constructor signature
// - Easy to test (inject mocks)
```

---

## 7️⃣ COMPOSITION VS INHERITANCE

### 🧠 One-Line Definition
> **"Prefer composition over inheritance"** — favor HAS-A relationships over IS-A when possible.

### ⚡ Why This Is One of the Most Important Design Decisions

```
Inheritance creates TIGHT COUPLING:
  - Derived is coupled to Base's implementation
  - Changes in Base can break Derived (Fragile Base Class Problem)
  - Can't change the "IS-A" relationship at runtime

Composition creates LOOSE COUPLING:
  - Object has another object as a member
  - Easy to swap implementations at runtime
  - Changes to components don't break the container
```

### 🔧 The Classic Problem: Penguin Can't Fly

```cpp
// ═══ BAD: Inheritance hierarchy that breaks ═══

class Bird {
public:
    virtual void eat()  { cout << "Eating\n"; }
    virtual void fly()  { cout << "Flying high!\n"; }  // All birds fly... right?
    virtual ~Bird() = default;
};

class Sparrow : public Bird {
public:
    void fly() override { cout << "Sparrow flying\n"; }  // ✅ Fine
};

class Penguin : public Bird {
public:
    void fly() override {
        throw runtime_error("Penguins can't fly!");  // ❌ LSP violation!
    }
    void swim() { cout << "Penguin swimming\n"; }
};

// This BREAKS:
void makeBirdFly(Bird& bird) {
    bird.fly();  // Crashes for Penguin! 💥
}
```

### 🔧 FIX: Composition with Strategy Pattern

```cpp
#include <iostream>
#include <memory>
using namespace std;

// ═══ GOOD: Use composition for behaviors ═══

// ─── Behavior interfaces (strategies) ───
class FlyBehavior {
public:
    virtual void fly() = 0;
    virtual ~FlyBehavior() = default;
};

class SwimBehavior {
public:
    virtual void swim() = 0;
    virtual ~SwimBehavior() = default;
};

// ─── Concrete behaviors ───
class CanFly : public FlyBehavior {
public:
    void fly() override { cout << "Flying high!\n"; }
};

class CantFly : public FlyBehavior {
public:
    void fly() override { cout << "I can't fly.\n"; }
};

class CanSwim : public SwimBehavior {
public:
    void swim() override { cout << "Swimming!\n"; }
};

class CantSwim : public SwimBehavior {
public:
    void swim() override { cout << "I can't swim.\n"; }
};

// ─── Bird uses COMPOSITION for behaviors ───
class Bird {
    string name;
    unique_ptr<FlyBehavior> flyBehavior;
    unique_ptr<SwimBehavior> swimBehavior;

public:
    Bird(const string& n,
         unique_ptr<FlyBehavior> fb,
         unique_ptr<SwimBehavior> sb)
        : name(n), flyBehavior(move(fb)), swimBehavior(move(sb)) {}

    void performFly()  { cout << name << ": "; flyBehavior->fly(); }
    void performSwim() { cout << name << ": "; swimBehavior->swim(); }

    // Can even change behavior at runtime!
    void setFlyBehavior(unique_ptr<FlyBehavior> fb) {
        flyBehavior = move(fb);
    }
};

int main() {
    Bird sparrow("Sparrow", make_unique<CanFly>(), make_unique<CantSwim>());
    Bird penguin("Penguin", make_unique<CantFly>(), make_unique<CanSwim>());
    Bird duck("Duck", make_unique<CanFly>(), make_unique<CanSwim>());

    sparrow.performFly();   // Sparrow: Flying high!
    sparrow.performSwim();  // Sparrow: I can't swim.

    penguin.performFly();   // Penguin: I can't fly. (No exception! Clean!)
    penguin.performSwim();  // Penguin: Swimming!

    duck.performFly();      // Duck: Flying high!
    duck.performSwim();     // Duck: Swimming!

    // Dynamic behavior change at runtime!
    cout << "\n--- Duck got injured, can no longer fly ---\n";
    duck.setFlyBehavior(make_unique<CantFly>());
    duck.performFly();      // Duck: I can't fly.

    return 0;
}
```

### 📊 When to Use Which?

| Use Inheritance When | Use Composition When |
|---------------------|---------------------|
| True IS-A relationship | HAS-A relationship |
| Need polymorphism through base pointer | Need to swap behavior at runtime |
| Relationship won't change | Behaviors are independent of each other |
| Base class designed for inheritance | You want loose coupling |
| `Dog` IS-A `Animal` | `Car` HAS-A `Engine` |
| `Circle` IS-A `Shape` | `Bird` HAS-A `FlyBehavior` |

### ⚡ Decision Tree

```
"Should I use inheritance or composition?"
│
├── Is there a clear IS-A relationship that won't cause LSP violations?
│   ├── YES → Can the subclass substitute for the base EVERYWHERE?
│   │         ├── YES → Inheritance might be OK
│   │         └── NO  → Use composition
│   └── NO  → Use composition
│
├── Do different objects need different COMBINATIONS of behaviors?
│   └── YES → Use composition (mix and match)
│
├── Do behaviors need to change at runtime?
│   └── YES → Use composition (strategy pattern)
│
└── Default → Prefer composition
```

---

## 8️⃣ COUPLING & COHESION

### 🧠 One-Line Definitions
> **Coupling:** Degree of interdependence between modules. LOW = good.
> **Cohesion:** Degree to which elements inside a module belong together. HIGH = good.

### 📊 Coupling Types (Best to Worst)

| Coupling Type | Description | Example | Quality |
|--------------|-------------|---------|---------|
| **No coupling** | Modules independent | Two unrelated classes | ⭐⭐⭐⭐⭐ |
| **Message coupling** | Only communicate via messages/APIs | Function calls with params | ⭐⭐⭐⭐ |
| **Data coupling** | Share data via parameters | `void process(int id)` | ⭐⭐⭐⭐ |
| **Stamp coupling** | Share composite data structures | `void process(Order& order)` | ⭐⭐⭐ |
| **Control coupling** | One controls another's flow | Passing a flag that changes behavior | ⭐⭐ |
| **Common coupling** | Share global data | Global variables | ⭐ |
| **Content coupling** | One modifies another's internals | Accessing private data (friend abuse) | 💀 |

### 📊 Cohesion Types (Best to Worst)

| Cohesion Type | Description | Example | Quality |
|--------------|-------------|---------|---------|
| **Functional** | All elements contribute to ONE task | `MathUtils::sqrt()` | ⭐⭐⭐⭐⭐ |
| **Sequential** | Output of one is input to next | Pipeline stages | ⭐⭐⭐⭐ |
| **Communicational** | Operate on same data | CRUD operations on User | ⭐⭐⭐ |
| **Temporal** | Related by time | `init()` method doing unrelated setup | ⭐⭐ |
| **Logical** | Related by category but different | `Utils` class with random methods | ⭐ |
| **Coincidental** | No meaningful relationship | God class | 💀 |

### 🔧 Code Example: Good vs Bad Cohesion

```cpp
// ═══ BAD COHESION: "Utils" dump class ═══
class Utils {
public:
    static double calculateTax(double amount) { return amount * 0.18; }
    static string formatDate(time_t t) { /* ... */ return ""; }
    static void sendEmail(const string& to, const string& body) { /* ... */ }
    static int fibonacci(int n) { /* ... */ return 0; }
    static bool isValidURL(const string& url) { /* ... */ return false; }
    // These have NOTHING in common! Coincidental cohesion.
};

// ═══ GOOD COHESION: Focused classes ═══
class TaxCalculator {
public:
    static double calculateGST(double amount) { return amount * 0.18; }
    static double calculateIncomeTax(double income) { /* ... */ return 0; }
    static double calculateTDS(double salary) { /* ... */ return 0; }
    // All about tax! Functional cohesion. ✅
};

class EmailService {
    string smtpServer;
public:
    void connect() { /* ... */ }
    void send(const string& to, const string& body) { /* ... */ }
    void disconnect() { /* ... */ }
    // All about email! Functional cohesion. ✅
};
```

### ⚡ Memory Aid

```
                    COUPLING               COHESION
                    ────────               ────────
Goal:              LOW                    HIGH
Meaning:           Less dependency        More relatedness
                   between classes        within a class
Metaphor:          Loose handshake        Tight-knit team
                   between strangers      of specialists
Change impact:     Change in A doesn't   Everything in A
                   break B               changes together
```

---

## 9️⃣ DRY, KISS, YAGNI

### 📊 Quick Reference Table

| Principle | Full Form | Meaning | Violation Example | Fix |
|-----------|-----------|---------|-------------------|-----|
| **DRY** | Don't Repeat Yourself | Every piece of knowledge should have a single, unambiguous representation | Same validation logic in 5 places | Extract to a function |
| **KISS** | Keep It Simple, Stupid | The simplest solution that works is usually the best | Using template metaprogramming for a config parser | Use simple if-else |
| **YAGNI** | You Aren't Gonna Need It | Don't build features until you actually need them | Building a plugin system "just in case" | Build it when needed |

### 🔧 DRY Example

```cpp
// ═══ BAD: Repeated validation logic ═══
class UserController {
public:
    void createUser(const string& email) {
        // Email validation — DUPLICATED!
        if (email.find('@') == string::npos ||
            email.find('.') == string::npos ||
            email.length() < 5) {
            throw runtime_error("Invalid email");
        }
        // ... create user
    }

    void updateEmail(int userId, const string& newEmail) {
        // SAME validation — COPY-PASTED!
        if (newEmail.find('@') == string::npos ||
            newEmail.find('.') == string::npos ||
            newEmail.length() < 5) {
            throw runtime_error("Invalid email");
        }
        // ... update email
    }
};

// ═══ GOOD: Extract validation to one place ═══
class EmailValidator {
public:
    static bool isValid(const string& email) {
        return email.find('@') != string::npos &&
               email.find('.') != string::npos &&
               email.length() >= 5;
    }

    static void validate(const string& email) {
        if (!isValid(email))
            throw runtime_error("Invalid email: " + email);
    }
};

class UserController {
public:
    void createUser(const string& email) {
        EmailValidator::validate(email);
        // ... create user
    }

    void updateEmail(int userId, const string& newEmail) {
        EmailValidator::validate(newEmail);
        // ... update email
    }
};
```

### 🔧 YAGNI Example

```cpp
// ═══ BAD: Over-engineered "just in case" ═══
class Logger {
    // 200 lines of plugin system, 5 abstract interfaces,
    // template metaprogramming, reflection...
    // All to support "future logging backends"
    // that nobody has asked for.
};

// ═══ GOOD: Build what you need NOW ═══
class Logger {
    ofstream logFile;
public:
    Logger(const string& filename) : logFile(filename, ios::app) {}

    void log(const string& message) {
        logFile << "[" << time(nullptr) << "] " << message << "\n";
    }
};
// When you ACTUALLY need multiple backends, refactor then.
// Not before.
```

---

## 🔟 GRASP PRINCIPLES REFRESH

### 📊 GRASP → SOLID Mapping

Since you already studied GRASP from your OOAD course, here's how they connect:

| GRASP Principle | Meaning | SOLID Equivalent | Connection |
|----------------|---------|------------------|------------|
| **Information Expert** | Assign responsibility to the class with the most data | SRP | Both about putting responsibility in the right place |
| **Creator** | Class B creates A if B contains/uses A | DIP (partially) | Both about managing object creation |
| **Controller** | Assign system events to a non-UI class | SRP | Controller has single responsibility: handling events |
| **Low Coupling** | Minimize dependencies | DIP + ISP | DIP reduces coupling via abstractions, ISP via small interfaces |
| **High Cohesion** | Keep related things together | SRP | Single responsibility = high cohesion |
| **Polymorphism** | Use polymorphism for varying behavior | OCP + LSP | OCP extends via polymorphism, LSP ensures correctness |
| **Pure Fabrication** | Create a class not in the domain model | SRP + DIP | Service classes, repositories — exist for design, not domain |
| **Indirection** | Add intermediary to reduce coupling | DIP | DIP uses abstractions as indirection |
| **Protected Variations** | Shield from variations | OCP | Both protect existing code from changes |

### ⚡ Quick Connection

```
GRASP is about WHO does what (responsibility assignment).
SOLID is about HOW to structure classes (design constraints).

GRASP answers: "Which class should handle this?"
SOLID answers: "How should that class be designed?"

They're COMPLEMENTARY, not competing.
```

---

# SECTION 3: ⚠️ COMMON TRAPS

| # | Trap | What Happens | Fix |
|---|------|-------------|-----|
| 1 | Treating SRP as "one method per class" | Over-engineering, class explosion | SRP = one REASON to change, not one method |
| 2 | Using inheritance for code reuse | Tight coupling, fragile base class | Use composition; inherit only for true IS-A + LSP |
| 3 | Rectangle-Square in interviews | Saying "Square IS-A Rectangle" | Recognize LSP violation; make them siblings under Shape |
| 4 | Fat interfaces | Concrete classes forced to implement unused methods | Split into focused interfaces (ISP) |
| 5 | Direct dependencies on concrete classes | Can't test, can't swap implementations | Depend on abstractions (DIP) |
| 6 | switch/if-else chains for type checking | Violates OCP; must modify for new types | Use polymorphism |
| 7 | Applying SOLID everywhere dogmatically | Over-engineering simple problems | Use judgment — SOLID is a guideline, not a law |
| 8 | Confusing DIP with DI | DIP = principle (depend on abstractions). DI = technique (inject deps) | DI is ONE way to implement DIP |
| 9 | Thinking composition means NO inheritance | Missing legitimate IS-A relationships | Use inheritance when correct + LSP-safe |
| 10 | Creating "Utils" dump classes | Low cohesion, hard to discover functionality | Group by domain: EmailUtils, MathUtils |

---

# SECTION 4: 🧠 MENTAL MODELS

### SRP = Chef in a Restaurant
```
BAD: One chef does cooking, serving, cleaning, billing, marketing.
GOOD: Chef cooks. Waiter serves. Cleaner cleans. Cashier bills.

Each person has ONE job. If the menu changes, only the chef changes.
If the payment system changes, only the cashier adapts.
```

### OCP = USB Port
```
A USB port is CLOSED (you can't modify the port hardware).
But it's OPEN for extension (plug in keyboard, mouse, drive, phone...).

Adding a new device doesn't require redesigning the port.
The "interface" (USB standard) stays the same.
```

### LSP = Plug-Compatible
```
If your function expects a "USB device," you should be able to plug in
ANY USB device and it works. If one USB device explodes when you plug
it in, THAT device violates the USB "contract."

Same with classes: any subclass should work wherever the base class works.
```

### DIP = Power Outlet
```
Your laptop (high-level) doesn't connect directly to the power plant (low-level).
Both connect to a STANDARD OUTLET (abstraction).

Change power source? Laptop doesn't care.
Change laptop? Power source doesn't care.
```

### Composition vs Inheritance = Lego vs Inheritance Tax
```
INHERITANCE = inheriting a house. You get EVERYTHING — even the problems.
             Leaky roof in the parent's house? You inherit that too.

COMPOSITION = building with Lego blocks. Pick exactly what you need.
              Wrong piece? Swap it out. No baggage.
```

---

# SECTION 5: ⚡ INTERVIEW SPEED MODE

### "How would you refactor this God class?"

```
1. Identify different REASONS TO CHANGE → each becomes a class (SRP)
2. Extract interfaces for dependencies → depend on abstractions (DIP)
3. Replace switch/if-else with polymorphism (OCP)
4. Check: can every subclass substitute for base? (LSP)
5. Are interfaces too fat? Split them (ISP)
```

### "Inheritance or Composition?"

```
TRUE IS-A that passes LSP check? → Inheritance OK
HAS-A? Need runtime flexibility? → Composition
NOT SURE? → Composition (safer default)
```

### "How do you design for extensibility?"

```
1. Define interfaces (abstract classes in C++)
2. Depend on interfaces, not implementations (DIP)
3. Use factory pattern for object creation
4. Use strategy pattern for varying behavior
5. New features = new classes, not modified old classes (OCP)
```

### SOLID Quick Recall Mnemonics

```
S → "One class, One boss" (one reason to change)
O → "Add, don't edit" (extend, don't modify)
L → "Kids behave like parents" (substitutable)
I → "Don't force extras" (small interfaces)
D → "Talk through abstractions" (depend on interfaces)
```

---

# SECTION 6: 🔧 CODE MEMORY BLOCKS

### Memory Block 1: OCP-Compliant Shape System

```cpp
// Ready-to-write in interviews
class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
    double r;
public:
    Circle(double r) : r(r) {}
    double area() const override { return 3.14159 * r * r; }
};

class Rectangle : public Shape {
    double w, h;
public:
    Rectangle(double w, double h) : w(w), h(h) {}
    double area() const override { return w * h; }
};

// Add new shapes without touching existing code!
double totalArea(const vector<unique_ptr<Shape>>& shapes) {
    double total = 0;
    for (auto& s : shapes) total += s->area();
    return total;
}
```

### Memory Block 2: DIP with Dependency Injection

```cpp
// Ready-to-write pattern
class IRepository {
public:
    virtual void save(const string& data) = 0;
    virtual string load(int id) = 0;
    virtual ~IRepository() = default;
};

class Service {
    unique_ptr<IRepository> repo;
public:
    Service(unique_ptr<IRepository> r) : repo(move(r)) {}
    void process() {
        repo->save("data");
        auto result = repo->load(1);
    }
};

// Swap implementations freely:
// Service s(make_unique<MySQLRepo>());     // Production
// Service s(make_unique<InMemoryRepo>());  // Testing
```

### Memory Block 3: Composition over Inheritance (Strategy)

```cpp
// Ready-to-write pattern
class IBehavior {
public:
    virtual void execute() = 0;
    virtual ~IBehavior() = default;
};

class Entity {
    unique_ptr<IBehavior> behavior;
public:
    Entity(unique_ptr<IBehavior> b) : behavior(move(b)) {}
    void setBehavior(unique_ptr<IBehavior> b) { behavior = move(b); }
    void act() { behavior->execute(); }
};
```

---

# SECTION 7: 📋 INTERVIEW QUESTIONS BANK

## Scenario-Based Questions (15 Questions)

| # | Question | Company Tags | What They're Testing | Key Points in Answer |
|---|----------|-------------|---------------------|---------------------|
| 1 | "You have a class with 2000 lines. How do you refactor it?" | Amazon, Microsoft, Walmart | SRP | Identify responsibilities → extract to separate classes → connect via interfaces |
| 2 | "Design a payment system that supports credit card, UPI, and PayPal. New methods may be added." | Amazon, Flipkart, Google | OCP + Strategy | PaymentStrategy interface → each method is a class → PaymentProcessor takes strategy |
| 3 | "Is a Square a Rectangle? Discuss in OOP context." | Google, Microsoft, Adobe | LSP | Mathematically yes, but OOP no. Square violates Rectangle's postconditions. Make siblings. |
| 4 | "You need to test a service that uses a real database. How?" | Google, Goldman Sachs, DE Shaw | DIP + DI | Depend on IDatabase → inject MockDatabase in tests → no code changes in service |
| 5 | "A Robot class must implement IWorker which has eat() and sleep(). How to fix?" | Microsoft, Samsung R&D, Atlassian | ISP | Split IWorker into IWorkable, IFeedable, ISleepable → Robot only implements IWorkable |
| 6 | "Design a notification system: email, SMS, push, Slack. Users choose channels." | Amazon, Walmart, Flipkart | OCP + DIP + Composition | INotifier interface → EmailNotifier, SMSNotifier etc. → User has vector of INotifier |
| 7 | "When would you use inheritance over composition?" | Adobe, Oracle, Qualcomm | Composition vs Inheritance | True IS-A with LSP + need base pointer polymorphism. Otherwise composition. |
| 8 | "A base class Logger has methods logToFile(), logToConsole(), logToDB(). Critique this." | Google, Amazon, DE Shaw | ISP + SRP | Fat interface! Each logging method = separate class behind ILogger interface |
| 9 | "Your team copies the same validation logic across 8 microservices. Problem?" | Microsoft, Goldman Sachs, Arcesium | DRY | Extract to shared validation library. Single source of truth. |
| 10 | "Design a game character system where characters can have different abilities: fly, swim, fight, heal." | Samsung R&D, Adobe, Atlassian | Composition + Strategy | IBehavior interfaces → characters COMPOSE behaviors → can change at runtime |
| 11 | "You added a DiscountedProduct subclass. Now getPrice() sometimes returns negative. Diagnose." | Amazon, Flipkart, Capgemini | LSP | Subclass weakened postcondition (price should be ≥ 0). Fix: add validation in DiscountedProduct |
| 12 | "How does DIP differ from Dependency Injection?" | Google, DE Shaw, Oracle | DIP clarification | DIP = principle (depend on abstractions). DI = technique/pattern to implement DIP. |
| 13 | "Design a document export system: PDF, CSV, Excel, HTML." | Microsoft, Adobe, Walmart | OCP + Factory | IExporter interface → concrete exporters → ExportFactory creates the right one |
| 14 | "What's wrong with a Utils class that has 50 static methods?" | Amazon, Infosys, Capgemini | SRP + Cohesion | Low cohesion — coincidental grouping. Split by domain: MathUtils, StringUtils, DateUtils |
| 15 | "Design a system where different users see different UI themes." | Atlassian, Adobe, Flipkart | Strategy + OCP + DIP | ITheme interface → DarkTheme, LightTheme, etc. → UIRenderer depends on ITheme abstraction |

---

## 🎯 Quick SOLID Identification — Rapid Fire

| Code Smell | SOLID Violation | Fix |
|------------|----------------|-----|
| Giant class doing everything | SRP | Split by responsibility |
| switch on type to decide behavior | OCP | Use polymorphism |
| Subclass breaks when used as base | LSP | Redesign hierarchy |
| Class implements methods that do nothing | ISP | Split interface |
| `#include "MySQLDatabase.h"` in business logic | DIP | Depend on IDatabase |
| Copy-pasted code in multiple places | DRY | Extract to function/class |
| Complex solution for simple problem | KISS | Simplify |
| Building features nobody asked for | YAGNI | Remove/defer |
| "Utils" class with unrelated methods | Low Cohesion (SRP) | Group by domain |
| Every class knows about every other class | High Coupling (DIP) | Add interfaces |

---

## 🏆 The Ultimate Interview Framework

When asked "Design X system" in an interview, follow this mental checklist:

```
STEP 1: IDENTIFY ENTITIES
  → What are the main objects? (nouns in the problem)

STEP 2: IDENTIFY BEHAVIORS
  → What can each entity do? (verbs in the problem)

STEP 3: APPLY SRP
  → Does any class have multiple reasons to change? Split it.

STEP 4: DEFINE INTERFACES (OCP + DIP)
  → What behaviors might vary? Create interfaces for them.

STEP 5: CHECK HIERARCHY (LSP)
  → Can every subclass substitute for its base? If not, restructure.

STEP 6: CHECK INTERFACES (ISP)
  → Are any interfaces too fat? Split them.

STEP 7: CHECK DEPENDENCIES (DIP)
  → Is any high-level class directly using a low-level class?
  → Add abstraction layer.

STEP 8: COMPOSITION CHECK
  → Am I using inheritance where composition would be better?

STEP 9: DRY CHECK
  → Any duplicated logic? Extract it.

STEP 10: KISS CHECK
  → Am I over-engineering? Simplify.
```

---

> 🏁 **END OF FILE 4** — You now know HOW to design good OOP systems.
> These principles will be tested in EVERY system design and LLD interview.
> Practice: Pick any real system (Uber, Netflix, Amazon) and identify SOLID principles in its design.
