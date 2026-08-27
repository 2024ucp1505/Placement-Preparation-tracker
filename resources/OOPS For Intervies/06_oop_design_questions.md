# OOP Design Questions — Elite Interview Revision Sheet
> Not theory. A **systematic approach** to solve ANY "Design a ___" question in interviews.

---
---

# 🧠 SECTION 1: THE SYSTEMATIC APPROACH (Learn This FIRST)

---

> Before looking at ANY design problem, memorize this 7-step framework.
> **Say these steps out loud** at the start of every design question.

## The 7-Step Framework

```
Step 1: CLARIFY REQUIREMENTS
        "What are the core features?"
        "What are the constraints?" (scale, users, concurrency)
        "What's out of scope?"
        
Step 2: IDENTIFY CORE OBJECTS
        Nouns in requirements → Classes
        "Parking Lot, Vehicle, Ticket, Floor, Spot"
        
Step 3: DEFINE RELATIONSHIPS
        IS-A (inheritance): Car IS-A Vehicle
        HAS-A (composition): ParkingLot HAS Floors
        USES (dependency): Ticket USES Vehicle
        
Step 4: DEFINE INTERFACES
        Verbs in requirements → Methods
        "park(), unpark(), calculateRate(), findSpot()"
        
Step 5: APPLY DESIGN PATTERNS
        "Pricing varies → Strategy"
        "Only one system → Singleton"
        "State changes → State Pattern"
        
Step 6: IMPLEMENT KEY CLASSES
        Write the core 3-4 classes in C++
        Focus on public interface, not implementation details
        
Step 7: DISCUSS EXTENSIBILITY
        "If we add motorcycles..." → How easy is it?
        "If we add a new payment method..." → Is OCP followed?
```

## What to Ask the Interviewer (ALWAYS ask these)

```
1. "What are the main use cases?" (feature scope)
2. "How many users/objects?" (scale)
3. "Single-threaded or multi-threaded?" (concurrency)
4. "Do we need persistence?" (database layer)
5. "What about error handling?" (edge cases)
```

## Object Identification Trick

```
Read the requirements. Highlight:
  - NOUNS → Candidate classes (Vehicle, Spot, Ticket)
  - VERBS → Candidate methods (park, pay, reserve)
  - ADJECTIVES → Candidate enums/subtypes (small, medium, large)
  - NUMBERS → Candidate constants (max 5 floors, 3 vehicle types)
```

---
---

# ⚡ SECTION 2: DESIGN PROBLEMS (Complete Solutions)

---
---

## 🅿️ PROBLEM 1: PARKING LOT SYSTEM

### Companies: Amazon, Google, Microsoft
### Difficulty: ⭐⭐ Most Common OOP Design Question

---

### Step 1: Requirements (What to Ask)

```
Functional:
  ✅ Multi-floor parking lot
  ✅ Different vehicle types: Car, Bike, Truck
  ✅ Different spot sizes: Small, Medium, Large
  ✅ Vehicle → appropriate spot matching
  ✅ Ticket generation on entry
  ✅ Rate calculation on exit (hourly)
  ✅ Check available spots per type

Non-functional:
  ✅ Only ONE parking lot instance
  ✅ Thread-safe spot allocation (bonus)
```

### Step 2: Core Objects

```
┌──────────────┐     ┌─────────────┐     ┌───────────────┐
│ ParkingLot   │────>│ Floor       │────>│ ParkingSpot   │
│ (Singleton)  │  *  │             │  *  │               │
└──────────────┘     └─────────────┘     └───────┬───────┘
       │                                         │ parks
       │ generates                               │
┌──────┴───────┐                         ┌───────┴───────┐
│   Ticket     │─────────────────────────│   Vehicle     │
│              │         for             │   (abstract)  │
└──────────────┘                         └───────┬───────┘
                                                 │
                                    ┌────────────┼───────────┐
                                    │            │           │
                                ┌───┴──┐    ┌───┴──┐   ┌───┴───┐
                                │ Car  │    │ Bike │   │ Truck │
                                └──────┘    └──────┘   └───────┘
```

### Step 3: Patterns Applied

```
Singleton  → ParkingLot (only one instance)
Factory    → VehicleFactory (create vehicles by type)
Strategy   → PricingStrategy (hourly, flat rate, weekend rate)
```

### Full C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <memory>
#include <chrono>
#include <ctime>
#include <optional>

// ═══════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════

enum class VehicleType { BIKE, CAR, TRUCK };
enum class SpotSize { SMALL, MEDIUM, LARGE };

// ═══════════════════════════════════════════════════════
// VEHICLE HIERARCHY
// ═══════════════════════════════════════════════════════

class Vehicle {
protected:
    std::string licensePlate_;
    VehicleType type_;
public:
    Vehicle(const std::string& plate, VehicleType type)
        : licensePlate_(plate), type_(type) {}
    virtual ~Vehicle() = default;
    
    std::string getLicensePlate() const { return licensePlate_; }
    VehicleType getType() const { return type_; }
    virtual SpotSize requiredSpotSize() const = 0;
    virtual std::string typeName() const = 0;
};

class Bike : public Vehicle {
public:
    explicit Bike(const std::string& plate) : Vehicle(plate, VehicleType::BIKE) {}
    SpotSize requiredSpotSize() const override { return SpotSize::SMALL; }
    std::string typeName() const override { return "Bike"; }
};

class Car : public Vehicle {
public:
    explicit Car(const std::string& plate) : Vehicle(plate, VehicleType::CAR) {}
    SpotSize requiredSpotSize() const override { return SpotSize::MEDIUM; }
    std::string typeName() const override { return "Car"; }
};

class Truck : public Vehicle {
public:
    explicit Truck(const std::string& plate) : Vehicle(plate, VehicleType::TRUCK) {}
    SpotSize requiredSpotSize() const override { return SpotSize::LARGE; }
    std::string typeName() const override { return "Truck"; }
};

// ═══════════════════════════════════════════════════════
// PARKING SPOT
// ═══════════════════════════════════════════════════════

class ParkingSpot {
    int spotId_;
    SpotSize size_;
    bool occupied_ = false;
    Vehicle* currentVehicle_ = nullptr;

public:
    ParkingSpot(int id, SpotSize size) : spotId_(id), size_(size) {}
    
    bool isAvailable() const { return !occupied_; }
    bool canFit(const Vehicle& vehicle) const {
        return !occupied_ && (vehicle.requiredSpotSize() <= size_);
    }
    
    bool park(Vehicle* vehicle) {
        if (!canFit(*vehicle)) return false;
        currentVehicle_ = vehicle;
        occupied_ = true;
        return true;
    }
    
    Vehicle* unpark() {
        Vehicle* v = currentVehicle_;
        currentVehicle_ = nullptr;
        occupied_ = false;
        return v;
    }
    
    int getId() const { return spotId_; }
    SpotSize getSize() const { return size_; }
    Vehicle* getVehicle() const { return currentVehicle_; }
};

// ═══════════════════════════════════════════════════════
// FLOOR
// ═══════════════════════════════════════════════════════

class Floor {
    int floorNumber_;
    std::vector<ParkingSpot> spots_;

public:
    Floor(int floorNum, int smallSpots, int mediumSpots, int largeSpots)
        : floorNumber_(floorNum) {
        int id = floorNum * 100;
        for (int i = 0; i < smallSpots; ++i)  spots_.emplace_back(++id, SpotSize::SMALL);
        for (int i = 0; i < mediumSpots; ++i) spots_.emplace_back(++id, SpotSize::MEDIUM);
        for (int i = 0; i < largeSpots; ++i)  spots_.emplace_back(++id, SpotSize::LARGE);
    }
    
    ParkingSpot* findAvailableSpot(const Vehicle& vehicle) {
        for (auto& spot : spots_) {
            if (spot.canFit(vehicle)) return &spot;
        }
        return nullptr;
    }
    
    int getAvailableCount(SpotSize size) const {
        int count = 0;
        for (const auto& spot : spots_) {
            if (spot.isAvailable() && spot.getSize() == size) ++count;
        }
        return count;
    }
    
    int getFloorNumber() const { return floorNumber_; }
};

// ═══════════════════════════════════════════════════════
// PRICING STRATEGY (Strategy Pattern)
// ═══════════════════════════════════════════════════════

class PricingStrategy {
public:
    virtual double calculatePrice(int hoursParked, VehicleType type) const = 0;
    virtual std::string name() const = 0;
    virtual ~PricingStrategy() = default;
};

class HourlyPricing : public PricingStrategy {
public:
    double calculatePrice(int hours, VehicleType type) const override {
        double rate = 0;
        switch (type) {
            case VehicleType::BIKE:  rate = 10.0; break;
            case VehicleType::CAR:   rate = 20.0; break;
            case VehicleType::TRUCK: rate = 30.0; break;
        }
        return rate * hours;
    }
    std::string name() const override { return "Hourly"; }
};

class FlatRatePricing : public PricingStrategy {
public:
    double calculatePrice(int hours, VehicleType type) const override {
        switch (type) {
            case VehicleType::BIKE:  return 50.0;
            case VehicleType::CAR:   return 100.0;
            case VehicleType::TRUCK: return 200.0;
        }
        return 0;
    }
    std::string name() const override { return "Flat Rate"; }
};

// ═══════════════════════════════════════════════════════
// TICKET
// ═══════════════════════════════════════════════════════

class Ticket {
    static int nextId_;
    int ticketId_;
    std::string vehiclePlate_;
    int spotId_;
    int floorNumber_;
    std::time_t entryTime_;

public:
    Ticket(const std::string& plate, int spotId, int floor)
        : ticketId_(++nextId_), vehiclePlate_(plate), 
          spotId_(spotId), floorNumber_(floor),
          entryTime_(std::time(nullptr)) {}
    
    int getId() const { return ticketId_; }
    std::string getVehiclePlate() const { return vehiclePlate_; }
    int getSpotId() const { return spotId_; }
    
    int getHoursParked() const {
        auto now = std::time(nullptr);
        int hours = static_cast<int>(std::difftime(now, entryTime_) / 3600);
        return std::max(1, hours);  // Minimum 1 hour
    }
    
    void print() const {
        std::cout << "=== TICKET #" << ticketId_ << " ===\n"
                  << "Vehicle: " << vehiclePlate_ << "\n"
                  << "Floor: " << floorNumber_ << " | Spot: " << spotId_ << "\n";
    }
};
int Ticket::nextId_ = 0;

// ═══════════════════════════════════════════════════════
// PARKING LOT (Singleton)
// ═══════════════════════════════════════════════════════

class ParkingLot {
    std::vector<Floor> floors_;
    std::unordered_map<std::string, Ticket> activeTickets_;  // plate → ticket
    std::unique_ptr<PricingStrategy> pricing_;
    
    ParkingLot() : pricing_(std::make_unique<HourlyPricing>()) {
        // Default: 3 floors with different spot configurations
        floors_.emplace_back(1, 10, 20, 5);   // Floor 1: 10S, 20M, 5L
        floors_.emplace_back(2, 10, 20, 5);   // Floor 2
        floors_.emplace_back(3, 5, 15, 10);   // Floor 3
    }
    
    ParkingLot(const ParkingLot&) = delete;
    ParkingLot& operator=(const ParkingLot&) = delete;

public:
    static ParkingLot& getInstance() {
        static ParkingLot instance;
        return instance;
    }
    
    void setPricingStrategy(std::unique_ptr<PricingStrategy> strategy) {
        pricing_ = std::move(strategy);
    }
    
    // ── Park a vehicle ──
    Ticket* parkVehicle(Vehicle* vehicle) {
        if (activeTickets_.count(vehicle->getLicensePlate())) {
            std::cout << "Vehicle already parked!\n";
            return nullptr;
        }
        
        for (auto& floor : floors_) {
            ParkingSpot* spot = floor.findAvailableSpot(*vehicle);
            if (spot) {
                spot->park(vehicle);
                auto [it, inserted] = activeTickets_.emplace(
                    vehicle->getLicensePlate(),
                    Ticket(vehicle->getLicensePlate(), spot->getId(), floor.getFloorNumber())
                );
                it->second.print();
                return &it->second;
            }
        }
        std::cout << "No available spot for " << vehicle->typeName() << "!\n";
        return nullptr;
    }
    
    // ── Unpark and calculate fee ──
    double unparkVehicle(const std::string& licensePlate) {
        auto it = activeTickets_.find(licensePlate);
        if (it == activeTickets_.end()) {
            std::cout << "Vehicle not found!\n";
            return 0;
        }
        
        int hours = it->second.getHoursParked();
        // Find and free the spot (simplified - in production, store spot reference)
        double fee = pricing_->calculatePrice(hours, VehicleType::CAR);
        
        std::cout << "Vehicle " << licensePlate << " unparked.\n"
                  << "Duration: " << hours << " hours\n"
                  << "Fee (" << pricing_->name() << "): $" << fee << "\n";
        
        activeTickets_.erase(it);
        return fee;
    }
    
    void displayAvailability() const {
        std::cout << "\n=== PARKING AVAILABILITY ===\n";
        for (const auto& floor : floors_) {
            std::cout << "Floor " << floor.getFloorNumber() << ": "
                      << "Small=" << floor.getAvailableCount(SpotSize::SMALL) << " "
                      << "Medium=" << floor.getAvailableCount(SpotSize::MEDIUM) << " "
                      << "Large=" << floor.getAvailableCount(SpotSize::LARGE) << "\n";
        }
    }
};

// Usage:
// auto& lot = ParkingLot::getInstance();
// Car myCar("RJ-14-AB-1234");
// lot.parkVehicle(&myCar);
// lot.displayAvailability();
// lot.unparkVehicle("RJ-14-AB-1234");
```

### SOLID Principles Applied

```
S — Single Responsibility: Each class has one job (Spot manages occupancy, Floor manages spots)
O — Open-Closed: New vehicle types/pricing don't modify existing code
L — Liskov Substitution: Bike/Car/Truck are interchangeable as Vehicle
I — Interface Segregation: Small, focused interfaces (PricingStrategy)
D — Dependency Inversion: ParkingLot depends on PricingStrategy (abstraction), not HourlyPricing
```

---
---

## 🛗 PROBLEM 2: ELEVATOR SYSTEM

### Companies: Amazon, Microsoft, Adobe
### Difficulty: ⭐⭐⭐ Medium-Hard

---

### Step 1: Requirements

```
Functional:
  ✅ Building with N floors
  ✅ M elevators
  ✅ External buttons (up/down) on each floor
  ✅ Internal buttons (floor numbers) inside elevator
  ✅ Elevator scheduling algorithm
  ✅ State management: IDLE, MOVING_UP, MOVING_DOWN, DOOR_OPEN

Non-functional:
  ✅ Minimize wait time
  ✅ Handle concurrent requests
```

### Step 2: Core Objects

```
┌──────────────────┐      ┌────────────────┐      ┌────────────────┐
│ ElevatorSystem   │─────>│ Elevator       │─────>│ ElevatorState  │
│ (Singleton)      │  *   │                │      │ (State Pattern)│
└──────────────────┘      └────────┬───────┘      └────────────────┘
        │                          │
        │                          │ has
        │                    ┌─────┴──────┐
        │ uses               │            │
┌───────┴──────────┐  ┌─────┴───┐  ┌─────┴─────────┐
│SchedulingStrategy│  │InternalBtn│ │ ExternalBtn  │
│ (Strategy)       │  └─────────┘  └───────────────┘
└──────────────────┘
```

### Step 3: Patterns Applied

```
Singleton  → ElevatorSystem (one building, one system)
State      → Elevator states (IDLE, MOVING_UP, MOVING_DOWN, DOOR_OPEN)
Strategy   → Scheduling algorithm (nearest elevator, least loaded, etc.)
Observer   → Floor displays show elevator position
```

### Full C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <queue>
#include <set>
#include <memory>
#include <string>
#include <cmath>
#include <algorithm>

// ═══════════════════════════════════════════════════════
// ENUMS & REQUEST
// ═══════════════════════════════════════════════════════

enum class Direction { UP, DOWN, IDLE };
enum class ElevatorStatus { IDLE, MOVING_UP, MOVING_DOWN, DOOR_OPEN };

struct Request {
    int floor;
    Direction direction;  // Which direction the person wants to go
    
    Request(int f, Direction d) : floor(f), direction(d) {}
};

// ═══════════════════════════════════════════════════════
// ELEVATOR
// ═══════════════════════════════════════════════════════

class Elevator {
    int id_;
    int currentFloor_ = 0;
    ElevatorStatus status_ = ElevatorStatus::IDLE;
    Direction direction_ = Direction::IDLE;
    std::set<int> upStops_;    // Floors to stop at going UP
    std::set<int> downStops_;  // Floors to stop at going DOWN (reverse order)
    int capacity_ = 10;
    int currentLoad_ = 0;

public:
    explicit Elevator(int id) : id_(id) {}
    
    int getId() const { return id_; }
    int getCurrentFloor() const { return currentFloor_; }
    ElevatorStatus getStatus() const { return status_; }
    Direction getDirection() const { return direction_; }
    int getCurrentLoad() const { return currentLoad_; }
    bool isFull() const { return currentLoad_ >= capacity_; }
    
    // Add a floor request
    void addStop(int floor) {
        if (floor > currentFloor_) {
            upStops_.insert(floor);
        } else if (floor < currentFloor_) {
            downStops_.insert(floor);
        }
        // If idle, determine direction
        if (direction_ == Direction::IDLE) {
            direction_ = (floor > currentFloor_) ? Direction::UP : Direction::DOWN;
            status_ = (direction_ == Direction::UP) ? 
                ElevatorStatus::MOVING_UP : ElevatorStatus::MOVING_DOWN;
        }
    }
    
    // Simulate one step of movement
    void step() {
        if (direction_ == Direction::UP) {
            if (!upStops_.empty()) {
                currentFloor_++;
                if (upStops_.count(currentFloor_)) {
                    upStops_.erase(currentFloor_);
                    openDoor();
                }
            }
            // If no more up stops, switch direction
            if (upStops_.empty()) {
                if (!downStops_.empty()) {
                    direction_ = Direction::DOWN;
                    status_ = ElevatorStatus::MOVING_DOWN;
                } else {
                    direction_ = Direction::IDLE;
                    status_ = ElevatorStatus::IDLE;
                }
            }
        } else if (direction_ == Direction::DOWN) {
            if (!downStops_.empty()) {
                currentFloor_--;
                if (downStops_.count(currentFloor_)) {
                    downStops_.erase(currentFloor_);
                    openDoor();
                }
            }
            if (downStops_.empty()) {
                if (!upStops_.empty()) {
                    direction_ = Direction::UP;
                    status_ = ElevatorStatus::MOVING_UP;
                } else {
                    direction_ = Direction::IDLE;
                    status_ = ElevatorStatus::IDLE;
                }
            }
        }
    }
    
    int totalPendingStops() const {
        return upStops_.size() + downStops_.size();
    }
    
    void display() const {
        std::string dir = (direction_ == Direction::UP) ? "↑" :
                          (direction_ == Direction::DOWN) ? "↓" : "•";
        std::cout << "Elevator " << id_ << ": Floor " << currentFloor_ 
                  << " " << dir << " (stops: " << totalPendingStops() << ")\n";
    }

private:
    void openDoor() {
        std::cout << "  🔔 Elevator " << id_ << " stopped at floor " 
                  << currentFloor_ << "\n";
        status_ = ElevatorStatus::DOOR_OPEN;
    }
};

// ═══════════════════════════════════════════════════════
// SCHEDULING STRATEGY (Strategy Pattern)
// ═══════════════════════════════════════════════════════

class SchedulingStrategy {
public:
    virtual Elevator* selectElevator(
        std::vector<std::unique_ptr<Elevator>>& elevators,
        const Request& request) = 0;
    virtual std::string name() const = 0;
    virtual ~SchedulingStrategy() = default;
};

// Nearest elevator that's idle or going in same direction
class NearestElevatorStrategy : public SchedulingStrategy {
public:
    Elevator* selectElevator(
        std::vector<std::unique_ptr<Elevator>>& elevators,
        const Request& request) override {
        
        Elevator* best = nullptr;
        int minDistance = INT_MAX;
        
        for (auto& elev : elevators) {
            if (elev->isFull()) continue;
            
            int distance = std::abs(elev->getCurrentFloor() - request.floor);
            bool sameDirection = (elev->getDirection() == request.direction);
            bool isIdle = (elev->getDirection() == Direction::IDLE);
            
            // Prefer idle elevators, then same-direction, then nearest
            int score = distance;
            if (isIdle) score -= 100;           // Bonus for idle
            if (sameDirection) score -= 50;      // Bonus for same direction
            
            if (score < minDistance) {
                minDistance = score;
                best = elev.get();
            }
        }
        return best;
    }
    std::string name() const override { return "Nearest Elevator"; }
};

// Least loaded elevator
class LeastLoadedStrategy : public SchedulingStrategy {
public:
    Elevator* selectElevator(
        std::vector<std::unique_ptr<Elevator>>& elevators,
        const Request& request) override {
        
        Elevator* best = nullptr;
        int minStops = INT_MAX;
        
        for (auto& elev : elevators) {
            if (elev->isFull()) continue;
            if (elev->totalPendingStops() < minStops) {
                minStops = elev->totalPendingStops();
                best = elev.get();
            }
        }
        return best;
    }
    std::string name() const override { return "Least Loaded"; }
};

// ═══════════════════════════════════════════════════════
// ELEVATOR SYSTEM (Singleton + uses Strategy)
// ═══════════════════════════════════════════════════════

class ElevatorSystem {
    std::vector<std::unique_ptr<Elevator>> elevators_;
    std::unique_ptr<SchedulingStrategy> scheduler_;
    int totalFloors_;
    
    ElevatorSystem() = default;
    ElevatorSystem(const ElevatorSystem&) = delete;
    ElevatorSystem& operator=(const ElevatorSystem&) = delete;

public:
    static ElevatorSystem& getInstance() {
        static ElevatorSystem instance;
        return instance;
    }
    
    void initialize(int numElevators, int numFloors) {
        totalFloors_ = numFloors;
        elevators_.clear();
        for (int i = 0; i < numElevators; ++i) {
            elevators_.push_back(std::make_unique<Elevator>(i + 1));
        }
        scheduler_ = std::make_unique<NearestElevatorStrategy>();
        std::cout << "Elevator System: " << numElevators 
                  << " elevators, " << numFloors << " floors\n";
    }
    
    void setScheduler(std::unique_ptr<SchedulingStrategy> strategy) {
        scheduler_ = std::move(strategy);
    }
    
    // External button pressed (from a floor)
    void requestElevator(int fromFloor, Direction direction) {
        std::cout << "\n📍 Request: Floor " << fromFloor 
                  << (direction == Direction::UP ? " ↑" : " ↓") << "\n";
        
        Request req(fromFloor, direction);
        Elevator* selected = scheduler_->selectElevator(elevators_, req);
        
        if (selected) {
            selected->addStop(fromFloor);
            std::cout << "  → Assigned to Elevator " << selected->getId() << "\n";
        } else {
            std::cout << "  → All elevators busy!\n";
        }
    }
    
    // Internal button pressed (inside elevator)
    void selectFloor(int elevatorId, int floor) {
        if (elevatorId < 1 || elevatorId > (int)elevators_.size()) return;
        elevators_[elevatorId - 1]->addStop(floor);
        std::cout << "Elevator " << elevatorId << ": Floor " << floor << " selected\n";
    }
    
    // Simulate one time step
    void simulate() {
        for (auto& elev : elevators_) {
            elev->step();
        }
    }
    
    void displayStatus() const {
        std::cout << "\n=== ELEVATOR STATUS ===\n";
        for (const auto& elev : elevators_) {
            elev->display();
        }
    }
};

// Usage:
// auto& system = ElevatorSystem::getInstance();
// system.initialize(3, 10);  // 3 elevators, 10 floors
// system.requestElevator(5, Direction::UP);
// system.requestElevator(2, Direction::DOWN);
// system.selectFloor(1, 8);
// system.simulate();
// system.displayStatus();
```

---
---

## 📚 PROBLEM 3: LIBRARY MANAGEMENT SYSTEM

### Companies: Amazon, Flipkart, Oracle
### Difficulty: ⭐⭐

---

### Step 1: Requirements

```
Functional:
  ✅ Book catalog (add, search, remove books)
  ✅ Member management (register, deactivate)
  ✅ Book lending (issue, return, renew)
  ✅ Fine calculation for late returns
  ✅ Search by title, author, ISBN
  ✅ Maximum books per member (e.g., 5)

Non-functional:
  ✅ Single library instance
  ✅ Track book availability
```

### Step 2: Core Objects

```
┌──────────────┐     ┌─────────────┐
│   Library    │────>│  BookItem   │  (physical copy)
│ (Singleton)  │  *  │             │
└──────┬───────┘     └──────┬──────┘
       │                    │ is copy of
       │              ┌─────┴──────┐
       │              │   Book     │  (catalog entry)
       │              └────────────┘
       │ has
┌──────┴───────┐
│   Member     │
│              │
└──────┬───────┘
       │ extends
┌──────┴──────────────┐
│                     │
│  Librarian          │
└─────────────────────┘

┌─────────────┐
│ LendRecord  │  (tracks who borrowed what, when)
└─────────────┘
```

### Full C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <memory>
#include <ctime>
#include <algorithm>

// ═══════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════

enum class BookStatus { AVAILABLE, BORROWED, RESERVED, LOST };
enum class MemberStatus { ACTIVE, INACTIVE, BLACKLISTED };

// ═══════════════════════════════════════════════════════
// BOOK (Catalog entry — information about a book)
// ═══════════════════════════════════════════════════════

class Book {
    std::string isbn_;
    std::string title_;
    std::string author_;
    std::string publisher_;
    int year_;

public:
    Book(const std::string& isbn, const std::string& title,
         const std::string& author, int year)
        : isbn_(isbn), title_(title), author_(author), year_(year) {}
    
    std::string getISBN() const { return isbn_; }
    std::string getTitle() const { return title_; }
    std::string getAuthor() const { return author_; }
    int getYear() const { return year_; }
    
    void display() const {
        std::cout << "\"" << title_ << "\" by " << author_ 
                  << " (" << year_ << ") [" << isbn_ << "]\n";
    }
};

// ═══════════════════════════════════════════════════════
// BOOK ITEM (Physical copy of a book)
// ═══════════════════════════════════════════════════════

class BookItem {
    std::string barcode_;
    Book* book_;  // Which book this is a copy of
    BookStatus status_ = BookStatus::AVAILABLE;
    std::time_t dueDate_ = 0;
    std::string borrowerId_;

public:
    BookItem(const std::string& barcode, Book* book)
        : barcode_(barcode), book_(book) {}
    
    std::string getBarcode() const { return barcode_; }
    Book* getBook() const { return book_; }
    BookStatus getStatus() const { return status_; }
    std::string getBorrower() const { return borrowerId_; }
    
    bool isAvailable() const { return status_ == BookStatus::AVAILABLE; }
    
    bool checkout(const std::string& memberId, int days = 14) {
        if (!isAvailable()) return false;
        status_ = BookStatus::BORROWED;
        borrowerId_ = memberId;
        dueDate_ = std::time(nullptr) + (days * 24 * 3600);
        return true;
    }
    
    double returnBook() {
        double fine = calculateFine();
        status_ = BookStatus::AVAILABLE;
        borrowerId_.clear();
        dueDate_ = 0;
        return fine;
    }
    
    double calculateFine() const {
        if (status_ != BookStatus::BORROWED) return 0;
        auto now = std::time(nullptr);
        if (now <= dueDate_) return 0;
        int overdueDays = static_cast<int>(std::difftime(now, dueDate_) / 86400);
        return overdueDays * 1.0;  // $1 per day
    }
};

// ═══════════════════════════════════════════════════════
// MEMBER
// ═══════════════════════════════════════════════════════

class Member {
    std::string memberId_;
    std::string name_;
    std::string email_;
    MemberStatus status_ = MemberStatus::ACTIVE;
    std::vector<std::string> borrowedBarcodes_;  // Barcodes of borrowed items
    static const int MAX_BOOKS = 5;

public:
    Member(const std::string& id, const std::string& name, const std::string& email)
        : memberId_(id), name_(name), email_(email) {}
    
    std::string getId() const { return memberId_; }
    std::string getName() const { return name_; }
    bool isActive() const { return status_ == MemberStatus::ACTIVE; }
    int getBorrowedCount() const { return borrowedBarcodes_.size(); }
    
    bool canBorrow() const {
        return isActive() && (int)borrowedBarcodes_.size() < MAX_BOOKS;
    }
    
    void addBorrowedBook(const std::string& barcode) {
        borrowedBarcodes_.push_back(barcode);
    }
    
    void removeBorrowedBook(const std::string& barcode) {
        borrowedBarcodes_.erase(
            std::remove(borrowedBarcodes_.begin(), borrowedBarcodes_.end(), barcode),
            borrowedBarcodes_.end());
    }
    
    void display() const {
        std::cout << "Member: " << name_ << " [" << memberId_ << "] — "
                  << borrowedBarcodes_.size() << "/" << MAX_BOOKS << " books\n";
    }
};

// ═══════════════════════════════════════════════════════
// LIBRARY (Singleton — manages everything)
// ═══════════════════════════════════════════════════════

class Library {
    std::unordered_map<std::string, std::unique_ptr<Book>> catalog_;       // ISBN → Book
    std::unordered_map<std::string, std::unique_ptr<BookItem>> items_;     // barcode → BookItem
    std::unordered_map<std::string, std::unique_ptr<Member>> members_;    // memberId → Member
    
    Library() = default;
    Library(const Library&) = delete;
    Library& operator=(const Library&) = delete;

public:
    static Library& getInstance() {
        static Library instance;
        return instance;
    }
    
    // ── Book management ──
    void addBook(const std::string& isbn, const std::string& title,
                 const std::string& author, int year, int copies = 1) {
        if (!catalog_.count(isbn)) {
            catalog_[isbn] = std::make_unique<Book>(isbn, title, author, year);
        }
        for (int i = 0; i < copies; ++i) {
            std::string barcode = isbn + "-" + std::to_string(items_.size() + 1);
            items_[barcode] = std::make_unique<BookItem>(barcode, catalog_[isbn].get());
        }
        std::cout << "Added " << copies << " copies of \"" << title << "\"\n";
    }
    
    // ── Member management ──
    void registerMember(const std::string& id, const std::string& name,
                        const std::string& email) {
        members_[id] = std::make_unique<Member>(id, name, email);
        std::cout << "Registered: " << name << " [" << id << "]\n";
    }
    
    // ── Issue a book ──
    bool issueBook(const std::string& memberId, const std::string& isbn) {
        auto memberIt = members_.find(memberId);
        if (memberIt == members_.end()) { std::cout << "Member not found!\n"; return false; }
        
        Member* member = memberIt->second.get();
        if (!member->canBorrow()) {
            std::cout << member->getName() << " cannot borrow (limit reached or inactive)!\n";
            return false;
        }
        
        // Find available copy
        for (auto& [barcode, item] : items_) {
            if (item->getBook()->getISBN() == isbn && item->isAvailable()) {
                item->checkout(memberId);
                member->addBorrowedBook(barcode);
                std::cout << "✅ Issued \"" << item->getBook()->getTitle() 
                          << "\" to " << member->getName() << "\n";
                return true;
            }
        }
        std::cout << "No available copies!\n";
        return false;
    }
    
    // ── Return a book ──
    double returnBook(const std::string& memberId, const std::string& barcode) {
        auto memberIt = members_.find(memberId);
        auto itemIt = items_.find(barcode);
        
        if (memberIt == members_.end() || itemIt == items_.end()) return -1;
        
        double fine = itemIt->second->returnBook();
        memberIt->second->removeBorrowedBook(barcode);
        
        std::cout << "✅ Returned: \"" << itemIt->second->getBook()->getTitle() << "\"";
        if (fine > 0) std::cout << " | Fine: $" << fine;
        std::cout << "\n";
        return fine;
    }
    
    // ── Search ──
    std::vector<Book*> searchByTitle(const std::string& keyword) const {
        std::vector<Book*> results;
        for (const auto& [isbn, book] : catalog_) {
            if (book->getTitle().find(keyword) != std::string::npos) {
                results.push_back(book.get());
            }
        }
        return results;
    }
    
    std::vector<Book*> searchByAuthor(const std::string& author) const {
        std::vector<Book*> results;
        for (const auto& [isbn, book] : catalog_) {
            if (book->getAuthor().find(author) != std::string::npos) {
                results.push_back(book.get());
            }
        }
        return results;
    }
    
    void displayCatalog() const {
        std::cout << "\n=== LIBRARY CATALOG ===\n";
        for (const auto& [isbn, book] : catalog_) {
            book->display();
            int available = 0, total = 0;
            for (const auto& [bc, item] : items_) {
                if (item->getBook()->getISBN() == isbn) {
                    ++total;
                    if (item->isAvailable()) ++available;
                }
            }
            std::cout << "  Available: " << available << "/" << total << "\n";
        }
    }
};

// Usage:
// auto& lib = Library::getInstance();
// lib.addBook("978-0-13-468599-1", "The C++ Programming Language", "Stroustrup", 2013, 3);
// lib.registerMember("M001", "Rahul Saini", "rahul@mnit.ac.in");
// lib.issueBook("M001", "978-0-13-468599-1");
// lib.displayCatalog();
```

---
---

## 🃏 PROBLEM 4: DECK OF CARDS

### Companies: Goldman Sachs, Amazon
### Difficulty: ⭐⭐

---

### Step 1: Requirements

```
Functional:
  ✅ Standard 52-card deck
  ✅ Shuffle, deal, reset operations
  ✅ Support MULTIPLE card games (Blackjack, Poker, etc.)
  ✅ Hand management (hold cards, calculate score)
  ✅ Game-specific rules as separate classes

Key OOP aspect: Make it GENERIC enough for any card game
```

### Full C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <random>
#include <memory>
#include <numeric>

// ═══════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════

enum class Suit { HEARTS, DIAMONDS, CLUBS, SPADES };
enum class Rank {
    ACE = 1, TWO, THREE, FOUR, FIVE, SIX, SEVEN,
    EIGHT, NINE, TEN, JACK, QUEEN, KING
};

// ═══════════════════════════════════════════════════════
// CARD
// ═══════════════════════════════════════════════════════

class Card {
    Suit suit_;
    Rank rank_;
    bool faceUp_ = false;

public:
    Card(Suit suit, Rank rank) : suit_(suit), rank_(rank) {}
    
    Suit getSuit() const { return suit_; }
    Rank getRank() const { return rank_; }
    int getValue() const { return static_cast<int>(rank_); }
    bool isFaceUp() const { return faceUp_; }
    void flip() { faceUp_ = !faceUp_; }
    
    std::string toString() const {
        const char* suits[] = {"♥", "♦", "♣", "♠"};
        const char* ranks[] = {"", "A", "2", "3", "4", "5", "6", "7",
                               "8", "9", "10", "J", "Q", "K"};
        return std::string(ranks[static_cast<int>(rank_)]) + 
               suits[static_cast<int>(suit_)];
    }
};

// ═══════════════════════════════════════════════════════
// DECK
// ═══════════════════════════════════════════════════════

class Deck {
    std::vector<Card> cards_;
    int topIndex_ = 0;

public:
    Deck() { reset(); }
    
    void reset() {
        cards_.clear();
        topIndex_ = 0;
        for (int s = 0; s < 4; ++s) {
            for (int r = 1; r <= 13; ++r) {
                cards_.emplace_back(static_cast<Suit>(s), static_cast<Rank>(r));
            }
        }
    }
    
    void shuffle() {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::shuffle(cards_.begin() + topIndex_, cards_.end(), gen);
    }
    
    Card* dealCard() {
        if (topIndex_ >= (int)cards_.size()) return nullptr;
        return &cards_[topIndex_++];
    }
    
    int remainingCards() const { return cards_.size() - topIndex_; }
};

// ═══════════════════════════════════════════════════════
// HAND
// ═══════════════════════════════════════════════════════

class Hand {
protected:
    std::vector<Card*> cards_;

public:
    virtual ~Hand() = default;
    
    void addCard(Card* card) {
        if (card) cards_.push_back(card);
    }
    
    void clear() { cards_.clear(); }
    int size() const { return cards_.size(); }
    const std::vector<Card*>& getCards() const { return cards_; }
    
    virtual int score() const {
        int total = 0;
        for (const auto* card : cards_) total += card->getValue();
        return total;
    }
    
    void display() const {
        for (const auto* card : cards_) {
            std::cout << card->toString() << " ";
        }
        std::cout << "(Score: " << score() << ")\n";
    }
};

// ═══════════════════════════════════════════════════════
// BLACKJACK HAND (specialized scoring)
// ═══════════════════════════════════════════════════════

class BlackjackHand : public Hand {
public:
    int score() const override {
        int total = 0;
        int aces = 0;
        
        for (const auto* card : cards_) {
            int val = card->getValue();
            if (val >= 10) val = 10;  // Face cards = 10
            if (card->getRank() == Rank::ACE) { aces++; val = 11; }
            total += val;
        }
        
        // Adjust aces from 11 to 1 if busting
        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }
        return total;
    }
    
    bool isBlackjack() const {
        return cards_.size() == 2 && score() == 21;
    }
    
    bool isBusted() const { return score() > 21; }
};

// ═══════════════════════════════════════════════════════
// ABSTRACT GAME (Template Method Pattern)
// ═══════════════════════════════════════════════════════

class CardGame {
protected:
    Deck deck_;
    
    virtual void setup() = 0;
    virtual void playRound() = 0;
    virtual void determineWinner() = 0;
    virtual std::string gameName() const = 0;

public:
    virtual ~CardGame() = default;
    
    // Template method — defines game skeleton
    void play() {
        std::cout << "\n╔═══ " << gameName() << " ═══╗\n";
        deck_.reset();
        deck_.shuffle();
        setup();
        playRound();
        determineWinner();
        std::cout << "╚═══ Game Over ═══╝\n\n";
    }
};

// ═══════════════════════════════════════════════════════
// BLACKJACK GAME
// ═══════════════════════════════════════════════════════

class BlackjackGame : public CardGame {
    BlackjackHand playerHand_;
    BlackjackHand dealerHand_;

protected:
    std::string gameName() const override { return "BLACKJACK"; }
    
    void setup() override {
        playerHand_.clear();
        dealerHand_.clear();
        // Deal 2 cards each
        for (int i = 0; i < 2; ++i) {
            playerHand_.addCard(deck_.dealCard());
            dealerHand_.addCard(deck_.dealCard());
        }
    }
    
    void playRound() override {
        std::cout << "Player: "; playerHand_.display();
        std::cout << "Dealer: "; dealerHand_.display();
        
        // Simple AI: player hits until 17+
        while (playerHand_.score() < 17) {
            playerHand_.addCard(deck_.dealCard());
            std::cout << "Player hits: "; playerHand_.display();
        }
        
        // Dealer hits until 17+
        while (dealerHand_.score() < 17) {
            dealerHand_.addCard(deck_.dealCard());
            std::cout << "Dealer hits: "; dealerHand_.display();
        }
    }
    
    void determineWinner() override {
        int playerScore = playerHand_.score();
        int dealerScore = dealerHand_.score();
        
        if (playerHand_.isBlackjack()) std::cout << "🎉 BLACKJACK! Player wins!\n";
        else if (playerHand_.isBusted()) std::cout << "💥 Player busted! Dealer wins.\n";
        else if (dealerHand_.isBusted()) std::cout << "💥 Dealer busted! Player wins!\n";
        else if (playerScore > dealerScore) std::cout << "🎉 Player wins! (" << playerScore << " vs " << dealerScore << ")\n";
        else if (dealerScore > playerScore) std::cout << "Dealer wins. (" << dealerScore << " vs " << playerScore << ")\n";
        else std::cout << "Push! (tie at " << playerScore << ")\n";
    }
};

// Usage:
// BlackjackGame game;
// game.play();
```

---
---

## 🎰 PROBLEM 5: VENDING MACHINE

### Companies: Amazon, Samsung
### Difficulty: ⭐⭐⭐ Classic State Pattern Question

---

### Step 1: Requirements

```
Functional:
  ✅ Display product list with prices
  ✅ Accept money (coins, bills)
  ✅ Select product
  ✅ Dispense product
  ✅ Return change
  ✅ Handle: no stock, insufficient money, cancel

States: IDLE → HAS_MONEY → PRODUCT_SELECTED → DISPENSING → (back to IDLE)
```

### Full C++ Implementation (State Pattern)

```cpp
#include <iostream>
#include <string>
#include <unordered_map>
#include <memory>

// ═══════════════════════════════════════════════════════
// PRODUCT
// ═══════════════════════════════════════════════════════

struct Product {
    std::string name;
    double price;
    int quantity;
    
    Product() : price(0), quantity(0) {}
    Product(const std::string& n, double p, int q) : name(n), price(p), quantity(q) {}
};

// ═══════════════════════════════════════════════════════
// FORWARD DECLARATIONS
// ═══════════════════════════════════════════════════════

class VendingMachine;

class VMState {
public:
    virtual void insertMoney(VendingMachine& vm, double amount) = 0;
    virtual void selectProduct(VendingMachine& vm, const std::string& code) = 0;
    virtual void dispense(VendingMachine& vm) = 0;
    virtual void cancel(VendingMachine& vm) = 0;
    virtual std::string stateName() const = 0;
    virtual ~VMState() = default;
};

// Forward declare states
class IdleVMState;
class HasMoneyVMState;
class DispenseVMState;

// ═══════════════════════════════════════════════════════
// VENDING MACHINE (Context)
// ═══════════════════════════════════════════════════════

class VendingMachine {
    std::unique_ptr<VMState> currentState_;
    std::unordered_map<std::string, Product> inventory_;  // code → product
    double balance_ = 0;
    std::string selectedCode_;
    
    VendingMachine();  // Defined after states
    VendingMachine(const VendingMachine&) = delete;
    VendingMachine& operator=(const VendingMachine&) = delete;

public:
    static VendingMachine& getInstance() {
        static VendingMachine instance;
        return instance;
    }
    
    void setState(std::unique_ptr<VMState> state) {
        std::cout << "  [" << currentState_->stateName() << " → " << state->stateName() << "]\n";
        currentState_ = std::move(state);
    }
    
    // Delegate to current state
    void insertMoney(double amount) { currentState_->insertMoney(*this, amount); }
    void selectProduct(const std::string& code) { currentState_->selectProduct(*this, code); }
    void dispense() { currentState_->dispense(*this); }
    void cancel() { currentState_->cancel(*this); }
    
    // Inventory management
    void addProduct(const std::string& code, const std::string& name, double price, int qty) {
        inventory_[code] = Product(name, price, qty);
    }
    
    Product* getProduct(const std::string& code) {
        auto it = inventory_.find(code);
        return (it != inventory_.end()) ? &it->second : nullptr;
    }
    
    // Balance management
    double getBalance() const { return balance_; }
    void addBalance(double amount) { balance_ += amount; }
    void resetBalance() { balance_ = 0; }
    
    void setSelectedCode(const std::string& code) { selectedCode_ = code; }
    std::string getSelectedCode() const { return selectedCode_; }
    
    void displayProducts() const {
        std::cout << "\n╔═══════════════════════════════════╗\n";
        std::cout << "║      VENDING MACHINE MENU         ║\n";
        std::cout << "╠═══════════════════════════════════╣\n";
        for (const auto& [code, prod] : inventory_) {
            std::cout << "║ " << code << " | " << prod.name 
                      << " | $" << prod.price 
                      << " | Qty: " << prod.quantity << "\n";
        }
        std::cout << "╚═══════════════════════════════════╝\n";
        std::cout << "Balance: $" << balance_ << " | State: " << currentState_->stateName() << "\n";
    }
};

// ═══════════════════════════════════════════════════════
// CONCRETE STATES
// ═══════════════════════════════════════════════════════

class IdleVMState : public VMState {
public:
    void insertMoney(VendingMachine& vm, double amount) override {
        vm.addBalance(amount);
        std::cout << "💰 Inserted $" << amount << " | Balance: $" << vm.getBalance() << "\n";
        vm.setState(std::make_unique<HasMoneyVMState>());
    }
    void selectProduct(VendingMachine& vm, const std::string& code) override {
        std::cout << "⚠️  Please insert money first.\n";
    }
    void dispense(VendingMachine& vm) override {
        std::cout << "⚠️  Insert money and select a product.\n";
    }
    void cancel(VendingMachine& vm) override {
        std::cout << "Nothing to cancel.\n";
    }
    std::string stateName() const override { return "IDLE"; }
};

class HasMoneyVMState : public VMState {
public:
    void insertMoney(VendingMachine& vm, double amount) override {
        vm.addBalance(amount);
        std::cout << "💰 Added $" << amount << " | Balance: $" << vm.getBalance() << "\n";
    }
    void selectProduct(VendingMachine& vm, const std::string& code) override {
        Product* prod = vm.getProduct(code);
        if (!prod) {
            std::cout << "❌ Invalid product code.\n";
            return;
        }
        if (prod->quantity <= 0) {
            std::cout << "❌ " << prod->name << " is out of stock.\n";
            return;
        }
        if (vm.getBalance() < prod->price) {
            std::cout << "❌ Insufficient balance. Need $" << prod->price 
                      << ", have $" << vm.getBalance() << "\n";
            return;
        }
        vm.setSelectedCode(code);
        std::cout << "✅ Selected: " << prod->name << " ($" << prod->price << ")\n";
        vm.setState(std::make_unique<DispenseVMState>());
    }
    void dispense(VendingMachine& vm) override {
        std::cout << "⚠️  Select a product first.\n";
    }
    void cancel(VendingMachine& vm) override {
        double refund = vm.getBalance();
        vm.resetBalance();
        std::cout << "🔄 Cancelled. Refund: $" << refund << "\n";
        vm.setState(std::make_unique<IdleVMState>());
    }
    std::string stateName() const override { return "HAS_MONEY"; }
};

class DispenseVMState : public VMState {
public:
    void insertMoney(VendingMachine& vm, double amount) override {
        std::cout << "⚠️  Please wait, dispensing...\n";
    }
    void selectProduct(VendingMachine& vm, const std::string& code) override {
        std::cout << "⚠️  Please wait, dispensing...\n";
    }
    void dispense(VendingMachine& vm) override {
        Product* prod = vm.getProduct(vm.getSelectedCode());
        double change = vm.getBalance() - prod->price;
        prod->quantity--;
        
        std::cout << "🎉 Dispensing: " << prod->name << "\n";
        if (change > 0) {
            std::cout << "💰 Change: $" << change << "\n";
        }
        vm.resetBalance();
        vm.setState(std::make_unique<IdleVMState>());
    }
    void cancel(VendingMachine& vm) override {
        double refund = vm.getBalance();
        vm.resetBalance();
        std::cout << "🔄 Cancelled. Refund: $" << refund << "\n";
        vm.setState(std::make_unique<IdleVMState>());
    }
    std::string stateName() const override { return "DISPENSING"; }
};

// Constructor definition
VendingMachine::VendingMachine() : currentState_(std::make_unique<IdleVMState>()) {
    addProduct("A1", "Coke", 1.50, 10);
    addProduct("A2", "Pepsi", 1.50, 8);
    addProduct("B1", "Chips", 2.00, 5);
    addProduct("B2", "Candy", 1.00, 15);
    addProduct("C1", "Water", 1.00, 20);
}

// Usage:
// auto& vm = VendingMachine::getInstance();
// vm.displayProducts();
// vm.insertMoney(2.00);
// vm.selectProduct("A1");
// vm.dispense();         // Coke dispensed, $0.50 change
```

---
---

## 🛒 PROBLEM 6: ONLINE SHOPPING CART

### Companies: Amazon, Walmart, Flipkart
### Difficulty: ⭐⭐

---

### Step 1: Requirements

```
Functional:
  ✅ Product catalog with categories
  ✅ Shopping cart (add, remove, update quantity)
  ✅ Multiple discount types (percentage, flat, buy-one-get-one)
  ✅ Checkout with total calculation
  ✅ Multiple payment methods
  ✅ Order tracking
  ✅ Notifications on order status change

Patterns:
  Strategy   → Discount calculation
  Strategy   → Payment method
  Observer   → Order status notifications
```

### Core Object Diagram

```
┌──────────────┐     ┌────────────┐     ┌─────────────────┐
│   Product    │<────│  CartItem  │────>│  ShoppingCart    │
│              │     │            │     │                 │
└──────────────┘     └────────────┘     └────────┬────────┘
                                                 │ checkout
                                         ┌───────┴────────┐
                                         │     Order      │
                                         │                │
                                         └───────┬────────┘
                                                 │ uses
                                    ┌────────────┼─────────────┐
                                    │            │             │
                             ┌──────┴──────┐ ┌───┴──────┐ ┌───┴─────────┐
                             │DiscountStrat│ │PaymentSt │ │OrderObserver│
                             │  (Strategy) │ │(Strategy)│ │ (Observer)  │
                             └─────────────┘ └──────────┘ └─────────────┘
```

### Full C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <memory>
#include <algorithm>
#include <ctime>
#include <functional>

// ═══════════════════════════════════════════════════════
// PRODUCT
// ═══════════════════════════════════════════════════════

class Product {
    std::string id_;
    std::string name_;
    std::string category_;
    double price_;
    int stockQuantity_;

public:
    Product(const std::string& id, const std::string& name,
            const std::string& category, double price, int stock)
        : id_(id), name_(name), category_(category), 
          price_(price), stockQuantity_(stock) {}
    
    std::string getId() const { return id_; }
    std::string getName() const { return name_; }
    std::string getCategory() const { return category_; }
    double getPrice() const { return price_; }
    int getStock() const { return stockQuantity_; }
    
    bool isInStock(int qty = 1) const { return stockQuantity_ >= qty; }
    void reduceStock(int qty) { stockQuantity_ -= qty; }
    
    void display() const {
        std::cout << "[" << id_ << "] " << name_ << " — $" << price_
                  << " (Stock: " << stockQuantity_ << ")\n";
    }
};

// ═══════════════════════════════════════════════════════
// CART ITEM
// ═══════════════════════════════════════════════════════

struct CartItem {
    Product* product;
    int quantity;
    
    double subtotal() const { return product->getPrice() * quantity; }
    
    void display() const {
        std::cout << "  " << product->getName() << " x" << quantity 
                  << " = $" << subtotal() << "\n";
    }
};

// ═══════════════════════════════════════════════════════
// DISCOUNT STRATEGY (Strategy Pattern)
// ═══════════════════════════════════════════════════════

class DiscountStrategy {
public:
    virtual double applyDiscount(double total) const = 0;
    virtual std::string description() const = 0;
    virtual ~DiscountStrategy() = default;
};

class NoDiscount : public DiscountStrategy {
public:
    double applyDiscount(double total) const override { return total; }
    std::string description() const override { return "No Discount"; }
};

class PercentageDiscount : public DiscountStrategy {
    double percentage_;
public:
    explicit PercentageDiscount(double pct) : percentage_(pct) {}
    double applyDiscount(double total) const override {
        return total * (1 - percentage_ / 100.0);
    }
    std::string description() const override {
        return std::to_string((int)percentage_) + "% Off";
    }
};

class FlatDiscount : public DiscountStrategy {
    double amount_;
public:
    explicit FlatDiscount(double amt) : amount_(amt) {}
    double applyDiscount(double total) const override {
        return std::max(0.0, total - amount_);
    }
    std::string description() const override {
        return "$" + std::to_string((int)amount_) + " Off";
    }
};

class BuyOneGetOneFree : public DiscountStrategy {
public:
    double applyDiscount(double total) const override {
        return total * 0.5;  // Simplified: 50% off total
    }
    std::string description() const override { return "Buy 1 Get 1 Free"; }
};

// ═══════════════════════════════════════════════════════
// PAYMENT STRATEGY (Strategy Pattern)
// ═══════════════════════════════════════════════════════

class PaymentMethod {
public:
    virtual bool processPayment(double amount) = 0;
    virtual std::string methodName() const = 0;
    virtual ~PaymentMethod() = default;
};

class CreditCardPayment : public PaymentMethod {
    std::string cardLast4_;
public:
    explicit CreditCardPayment(const std::string& card) 
        : cardLast4_(card.substr(card.size() - 4)) {}
    bool processPayment(double amount) override {
        std::cout << "💳 Charged $" << amount << " to card ending " << cardLast4_ << "\n";
        return true;
    }
    std::string methodName() const override { return "Credit Card"; }
};

class UPIPayment : public PaymentMethod {
    std::string upiId_;
public:
    explicit UPIPayment(const std::string& id) : upiId_(id) {}
    bool processPayment(double amount) override {
        std::cout << "📱 Paid $" << amount << " via UPI (" << upiId_ << ")\n";
        return true;
    }
    std::string methodName() const override { return "UPI"; }
};

// ═══════════════════════════════════════════════════════
// ORDER & OBSERVER
// ═══════════════════════════════════════════════════════

enum class OrderStatus { PLACED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED };

std::string statusToString(OrderStatus s) {
    switch (s) {
        case OrderStatus::PLACED:    return "Placed";
        case OrderStatus::CONFIRMED: return "Confirmed";
        case OrderStatus::SHIPPED:   return "Shipped";
        case OrderStatus::DELIVERED: return "Delivered";
        case OrderStatus::CANCELLED: return "Cancelled";
    }
    return "Unknown";
}

// Observer interface
class OrderObserver {
public:
    virtual void onStatusChange(int orderId, OrderStatus newStatus) = 0;
    virtual ~OrderObserver() = default;
};

class EmailNotifier : public OrderObserver {
    std::string email_;
public:
    explicit EmailNotifier(const std::string& email) : email_(email) {}
    void onStatusChange(int orderId, OrderStatus status) override {
        std::cout << "📧 Email to " << email_ << ": Order #" << orderId 
                  << " is now " << statusToString(status) << "\n";
    }
};

class SMSNotifier : public OrderObserver {
    std::string phone_;
public:
    explicit SMSNotifier(const std::string& phone) : phone_(phone) {}
    void onStatusChange(int orderId, OrderStatus status) override {
        std::cout << "📱 SMS to " << phone_ << ": Order #" << orderId 
                  << " — " << statusToString(status) << "\n";
    }
};

// ═══════════════════════════════════════════════════════
// ORDER (Subject in Observer pattern)
// ═══════════════════════════════════════════════════════

class Order {
    static int nextId_;
    int orderId_;
    std::vector<CartItem> items_;
    double totalAmount_;
    OrderStatus status_ = OrderStatus::PLACED;
    std::vector<OrderObserver*> observers_;

public:
    Order(const std::vector<CartItem>& items, double total)
        : orderId_(++nextId_), items_(items), totalAmount_(total) {}
    
    int getId() const { return orderId_; }
    OrderStatus getStatus() const { return status_; }
    
    void addObserver(OrderObserver* obs) { observers_.push_back(obs); }
    void removeObserver(OrderObserver* obs) {
        observers_.erase(std::remove(observers_.begin(), observers_.end(), obs), observers_.end());
    }
    
    void updateStatus(OrderStatus newStatus) {
        status_ = newStatus;
        notifyObservers();
    }
    
    void display() const {
        std::cout << "\n╔═══ ORDER #" << orderId_ << " ═══╗\n";
        for (const auto& item : items_) item.display();
        std::cout << "  Total: $" << totalAmount_ << "\n";
        std::cout << "  Status: " << statusToString(status_) << "\n";
        std::cout << "╚═══════════════════╝\n";
    }

private:
    void notifyObservers() {
        for (auto* obs : observers_) {
            obs->onStatusChange(orderId_, status_);
        }
    }
};
int Order::nextId_ = 0;

// ═══════════════════════════════════════════════════════
// SHOPPING CART
// ═══════════════════════════════════════════════════════

class ShoppingCart {
    std::vector<CartItem> items_;
    std::unique_ptr<DiscountStrategy> discount_;

public:
    ShoppingCart() : discount_(std::make_unique<NoDiscount>()) {}
    
    void addItem(Product* product, int quantity = 1) {
        if (!product->isInStock(quantity)) {
            std::cout << "❌ " << product->getName() << " out of stock!\n";
            return;
        }
        // Check if already in cart
        for (auto& item : items_) {
            if (item.product->getId() == product->getId()) {
                item.quantity += quantity;
                std::cout << "Updated: " << product->getName() << " x" << item.quantity << "\n";
                return;
            }
        }
        items_.push_back({product, quantity});
        std::cout << "Added: " << product->getName() << " x" << quantity << "\n";
    }
    
    void removeItem(const std::string& productId) {
        items_.erase(
            std::remove_if(items_.begin(), items_.end(),
                [&](const CartItem& item) { return item.product->getId() == productId; }),
            items_.end());
    }
    
    void setDiscount(std::unique_ptr<DiscountStrategy> disc) {
        discount_ = std::move(disc);
    }
    
    double getSubtotal() const {
        double total = 0;
        for (const auto& item : items_) total += item.subtotal();
        return total;
    }
    
    double getTotal() const {
        return discount_->applyDiscount(getSubtotal());
    }
    
    std::unique_ptr<Order> checkout(std::unique_ptr<PaymentMethod> payment) {
        if (items_.empty()) {
            std::cout << "Cart is empty!\n";
            return nullptr;
        }
        
        double total = getTotal();
        displayCart();
        
        if (!payment->processPayment(total)) {
            std::cout << "Payment failed!\n";
            return nullptr;
        }
        
        // Reduce stock
        for (auto& item : items_) {
            item.product->reduceStock(item.quantity);
        }
        
        auto order = std::make_unique<Order>(items_, total);
        items_.clear();
        discount_ = std::make_unique<NoDiscount>();
        
        return order;
    }
    
    void displayCart() const {
        std::cout << "\n🛒 SHOPPING CART\n";
        std::cout << "────────────────────────\n";
        for (const auto& item : items_) item.display();
        std::cout << "────────────────────────\n";
        std::cout << "  Subtotal: $" << getSubtotal() << "\n";
        if (getSubtotal() != getTotal()) {
            std::cout << "  Discount: " << discount_->description() << "\n";
        }
        std::cout << "  Total:    $" << getTotal() << "\n";
    }
};

// Usage:
// Product laptop("P001", "MacBook Pro", "Electronics", 1999.99, 10);
// Product mouse("P002", "Wireless Mouse", "Electronics", 29.99, 50);
//
// ShoppingCart cart;
// cart.addItem(&laptop);
// cart.addItem(&mouse, 2);
// cart.setDiscount(std::make_unique<PercentageDiscount>(10));
// 
// auto order = cart.checkout(std::make_unique<CreditCardPayment>("1234-5678-9012-3456"));
//
// EmailNotifier emailNotif("rahul@mnit.ac.in");
// SMSNotifier smsNotif("+91-98765-43210");
// order->addObserver(&emailNotif);
// order->addObserver(&smsNotif);
//
// order->updateStatus(OrderStatus::CONFIRMED);  // Both notified
// order->updateStatus(OrderStatus::SHIPPED);     // Both notified
// order->display();
```

---
---

# ⚠️ SECTION 3: COMMON TRAPS IN OOP DESIGN INTERVIEWS

---

| # | Trap | What Goes Wrong | Fix |
|---|------|-----------------|-----|
| 1 | **Starting to code immediately** | Miss requirements, wrong design | Always spend 5-10 min on Steps 1-4 BEFORE coding |
| 2 | **God Class** | One class does everything (ParkingLot with 50 methods) | Split into focused classes (SRP) |
| 3 | **Forgetting enums** | Using strings for types ("car", "bike") | Use `enum class VehicleType { CAR, BIKE, TRUCK }` |
| 4 | **No abstraction** | Hardcoded to specific types | Use interfaces: `Vehicle*`, `PaymentStrategy*` |
| 5 | **Ignoring edge cases** | "What if the lot is full? What if payment fails?" | Discuss explicitly, handle in code |
| 6 | **Not using smart pointers** | Memory leaks, ownership confusion | `unique_ptr` for ownership, raw ptr for non-owning refs |
| 7 | **Skipping design patterns** | Interviewer specifically wants to see them | Name the pattern: "I'm using Strategy here because..." |
| 8 | **Over-engineering** | 15 classes for a simple problem | YAGNI — start simple, add complexity when needed |
| 9 | **No extensibility discussion** | Interviewer asks "what if we add X?" | End with: "This design supports adding X by just creating a new Y" |
| 10 | **Mixing concerns** | Pricing logic inside ParkingSpot class | Keep pricing in PricingStrategy, spot just tracks occupancy |

---
---

# 🧠 SECTION 4: MENTAL MODELS (Quick Recall)

---

```
Parking Lot    = "Real parking garage" — floors, spots, tickets
Elevator       = "State machine that moves between floors"
Library        = "Rental service" — catalog, copies, borrowers, fines
Deck of Cards  = "Template game engine" — same deck, different rules
Vending Machine = "State machine" — idle → money → select → dispense
Shopping Cart  = "Amazon checkout flow" — browse → cart → discount → pay → track
```

## Design Problem → Pattern Mapping (Memorize This)

```
┌─────────────────────┬────────────────────────────────────┐
│ DESIGN PROBLEM      │ KEY PATTERNS                       │
├─────────────────────┼────────────────────────────────────┤
│ Parking Lot         │ Singleton + Factory + Strategy     │
│ Elevator            │ Singleton + State + Strategy       │
│ Library             │ Singleton + (simple inheritance)   │
│ Deck of Cards       │ Template Method + inheritance      │
│ Vending Machine     │ Singleton + State                  │
│ Shopping Cart       │ Strategy×2 + Observer              │
│ ATM Machine         │ State + Strategy + Singleton       │
│ Hotel Booking       │ Strategy + Observer + Factory      │
│ Snake & Ladder      │ Template + Strategy + Observer     │
│ Chess               │ Strategy + Factory + Observer      │
└─────────────────────┴────────────────────────────────────┘
```

---
---

# ⚡ SECTION 5: INTERVIEW SPEED MODE

---

### First 2 Minutes of Any Design Question

```
Step 1 (30s): Repeat the question, ask 2-3 clarifying questions
Step 2 (30s): List 4-5 core classes (nouns from requirements)
Step 3 (30s): Draw relationships (is-a, has-a) on paper
Step 4 (30s): Name 1-2 patterns you'll use and WHY
Then: Start implementing the most important class first
```

### Which Class to Code FIRST

```
Always implement in this order:
  1. Enums and simple data classes (Product, Card)
  2. Core entity with behavior (Vehicle, Elevator, BookItem)
  3. The "manager" class (ParkingLot, Library, ShoppingCart)
  4. Pattern classes (Strategy implementations, State classes)
  5. Observer/notification (if time permits)
```

### What to Skip if Running Out of Time

```
✅ MUST show: Core classes, key pattern (Strategy/State), relationships
⚠️  NICE to have: Full implementation, edge cases, Observer
❌ SKIP: Detailed error handling, thread safety, database layer
```

---
---

# 🔧 SECTION 6: CODE MEMORY BLOCKS (Templates)

---

### Memory Block 1: Class with Enum (start every design with this)
```cpp
enum class Type { A, B, C };

class Entity {
    std::string id_;
    Type type_;
public:
    Entity(const std::string& id, Type t) : id_(id), type_(t) {}
    std::string getId() const { return id_; }
    Type getType() const { return type_; }
    virtual ~Entity() = default;
};
```

### Memory Block 2: Singleton Manager
```cpp
class SystemManager {
    SystemManager() = default;
    SystemManager(const SystemManager&) = delete;
    SystemManager& operator=(const SystemManager&) = delete;
public:
    static SystemManager& getInstance() {
        static SystemManager instance;
        return instance;
    }
};
```

### Memory Block 3: Strategy Pattern
```cpp
class Strategy {
public:
    virtual double calculate(double input) const = 0;
    virtual ~Strategy() = default;
};

class Context {
    std::unique_ptr<Strategy> strategy_;
public:
    void setStrategy(std::unique_ptr<Strategy> s) { strategy_ = std::move(s); }
    double execute(double input) { return strategy_->calculate(input); }
};
```

### Memory Block 4: State Pattern
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

### Memory Block 5: Observer Pattern
```cpp
class Observer {
public:
    virtual void update(int id, const std::string& data) = 0;
    virtual ~Observer() = default;
};
class Subject {
    std::vector<Observer*> obs_;
public:
    void attach(Observer* o) { obs_.push_back(o); }
    void notify(int id, const std::string& data) {
        for (auto* o : obs_) o->update(id, data);
    }
};
```

---
---

# 📊 SECTION 7: INTERVIEW QUESTIONS BANK

---

## Design Problems by Company

| # | Problem | Companies | Key Pattern | Difficulty |
|---|---------|-----------|-------------|------------|
| 1 | Parking Lot | Amazon, Google, Microsoft | Singleton + Strategy | ⭐⭐ |
| 2 | Elevator System | Amazon, Microsoft, Adobe | State + Strategy | ⭐⭐⭐ |
| 3 | Library Management | Amazon, Flipkart, Oracle | Singleton | ⭐⭐ |
| 4 | Deck of Cards | Goldman Sachs, Amazon | Template Method | ⭐⭐ |
| 5 | Vending Machine | Amazon, Samsung | State + Singleton | ⭐⭐⭐ |
| 6 | Shopping Cart | Amazon, Walmart, Flipkart | Strategy + Observer | ⭐⭐ |
| 7 | ATM Machine | Goldman Sachs, DE Shaw | State + Strategy | ⭐⭐⭐ |
| 8 | Hotel Booking | Atlassian, Amazon | Strategy + Observer | ⭐⭐⭐ |
| 9 | Snake & Ladder | Amazon, Flipkart | Template + Strategy | ⭐⭐ |
| 10 | Chess Game | Google, Amazon | Strategy + Factory | ⭐⭐⭐⭐ |
| 11 | Tic Tac Toe | Microsoft, Infosys | Simple OOP | ⭐ |
| 12 | Movie Ticket Booking | Amazon, Samsung | Strategy + Observer | ⭐⭐ |

## Follow-up Questions Interviewers Ask

| Question | What They're Testing | Good Answer |
|----------|---------------------|-------------|
| "How would you add a new vehicle type?" | OCP | "Just create a new class extending Vehicle. No existing code changes." |
| "How would you handle concurrency?" | Thread safety | "Mutex on ParkingSpot allocation. Atomic operations for counters." |
| "How would you persist this data?" | Architecture | "Repository pattern. Each manager delegates persistence to a repo interface." |
| "What if pricing changes hourly?" | Flexibility | "Strategy pattern already handles this — just swap the PricingStrategy at runtime." |
| "How would you test this?" | Testability | "Inject mock strategies via interfaces. Test each class independently." |
| "How does this scale to 10,000 spots?" | Performance | "Index spots by type using hash maps. Spot allocation becomes O(1) average." |

## Quick Self-Check (Before Interview)

```
Can I...
  □ Draw class diagram for Parking Lot in 2 minutes?
  □ Code Singleton from memory?
  □ Explain State vs Strategy difference?
  □ Write Strategy pattern in 3 minutes?
  □ Name 3 patterns in any design problem?
  □ Discuss SOLID principles in my design?
  □ Handle "what if we add X?" questions?
  □ Identify core classes from requirements?
```

---
> **Last Updated:** June 2026 | **Target:** B.Tech CSE Interviews | **Language:** C++17
