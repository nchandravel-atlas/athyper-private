# Domain-Driven Design Patterns

This document describes the Domain-Driven Design (DDD) patterns implemented in the Athyper platform.

## Table of Contents

- [DDD Overview](#ddd-overview)
- [Building Blocks](#building-blocks)
- [Aggregate Pattern](#aggregate-pattern)
- [Repository Pattern](#repository-pattern)
- [Domain Events](#domain-events)
- [Value Objects](#value-objects)
- [Domain Services](#domain-services)
- [Example Implementation](#example-implementation)

## DDD Overview

Domain-Driven Design focuses on:
1. **Ubiquitous Language** - Shared vocabulary between developers and domain experts
2. **Bounded Contexts** - Clear boundaries between different parts of the system
3. **Strategic Design** - High-level organization and relationships
4. **Tactical Design** - Low-level patterns (entities, aggregates, value objects)

**Athyper follows DDD tactical patterns** in the core layer to maintain clean separation between business logic and infrastructure.

## Building Blocks

### Entity

**Entities** have identity that persists over time, even if attributes change.

**Base Class** (`framework/core/src/model/index.ts`):
```typescript
export abstract class Entity<ID extends EntityId = string> {
  constructor(public readonly id: ID) {}

  equals(other: Entity<ID>): boolean {
    if (!other) return false;
    if (!(other instanceof Entity)) return false;
    return this.id === other.id;
  }
}
```

**Example**:
```typescript
class User extends Entity<string> {
  constructor(
    id: string,
    private email: string,
    private name: string,
    private createdAt: Date
  ) {
    super(id);
  }

  updateEmail(newEmail: string): void {
    // Business logic for email update
    if (!this.isValidEmail(newEmail)) {
      throw new Error('Invalid email format');
    }
    this.email = newEmail;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Getters
  getEmail(): string {
    return this.email;
  }

  getName(): string {
    return this.name;
  }
}
```

### Value Object

**Value Objects** have no identity - two value objects with same attributes are considered equal.

**Base Class** (`framework/core/src/model/index.ts`):
```typescript
export abstract class ValueObject<T> {
  constructor(protected readonly value: T) {}

  equals(other: ValueObject<T>): boolean {
    if (!other) return false;
    if (!(other instanceof ValueObject)) return false;
    return JSON.stringify(this.value) === JSON.stringify(other.value);
  }

  getValue(): T {
    return this.value;
  }
}
```

**Example**:
```typescript
class Email extends ValueObject<string> {
  constructor(value: string) {
    if (!Email.isValid(value)) {
      throw new Error(`Invalid email: ${value}`);
    }
    super(value.toLowerCase());
  }

  static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  getDomain(): string {
    return this.value.split('@')[1];
  }
}

class Money extends ValueObject<{ amount: number; currency: string }> {
  constructor(amount: number, currency: string) {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    super({ amount, currency });
  }

  add(other: Money): Money {
    if (this.value.currency !== other.value.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(
      this.value.amount + other.value.amount,
      this.value.currency
    );
  }

  getAmount(): number {
    return this.value.amount;
  }

  getCurrency(): string {
    return this.value.currency;
  }
}
```

### Aggregate Root

**Aggregate Roots** define consistency boundaries. All changes to the aggregate go through the root.

**Interface** (`framework/core/src/model/index.ts`):
```typescript
export interface AggregateRoot<ID extends EntityId = string> {
  readonly id: ID;
  readonly version?: number;
}
```

**Example**:
```typescript
class Order extends Entity<string> implements AggregateRoot<string> {
  private items: OrderItem[] = [];
  private status: OrderStatus = 'draft';
  public readonly version: number = 1;

  constructor(
    id: string,
    private customerId: string,
    private createdAt: Date
  ) {
    super(id);
  }

  // Aggregate root controls all changes to items
  addItem(productId: string, quantity: number, price: Money): void {
    if (this.status !== 'draft') {
      throw new Error('Cannot modify non-draft order');
    }

    const item = new OrderItem(generateId(), productId, quantity, price);
    this.items.push(item);
  }

  removeItem(itemId: string): void {
    if (this.status !== 'draft') {
      throw new Error('Cannot modify non-draft order');
    }

    this.items = this.items.filter(item => item.id !== itemId);
  }

  submit(): void {
    if (this.items.length === 0) {
      throw new Error('Cannot submit empty order');
    }
    if (this.status !== 'draft') {
      throw new Error('Order already submitted');
    }

    this.status = 'submitted';
    // Emit domain event
    this.addDomainEvent(new OrderSubmittedEvent(this.id, this.customerId));
  }

  calculateTotal(): Money {
    return this.items.reduce(
      (total, item) => total.add(item.getSubtotal()),
      new Money(0, 'USD')
    );
  }

  // Only aggregate root can be retrieved from repository
  getItems(): ReadonlyArray<OrderItem> {
    return Object.freeze([...this.items]);
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  // Domain events
  private domainEvents: DomainEventPayload[] = [];

  private addDomainEvent(event: DomainEventPayload): void {
    this.domainEvents.push(event);
  }

  getDomainEvents(): ReadonlyArray<DomainEventPayload> {
    return Object.freeze([...this.domainEvents]);
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }
}

// OrderItem is part of the Order aggregate
class OrderItem extends Entity<string> {
  constructor(
    id: string,
    private productId: string,
    private quantity: number,
    private price: Money
  ) {
    super(id);
  }

  getSubtotal(): Money {
    return new Money(
      this.price.getAmount() * this.quantity,
      this.price.getCurrency()
    );
  }
}
```

## Aggregate Pattern

### Aggregate Rules

1. **Consistency Boundary**: Aggregates enforce invariants within their boundary
2. **Transaction Boundary**: Changes to an aggregate are committed in a single transaction
3. **Single Root**: External references only to the aggregate root, not internal entities
4. **Small Aggregates**: Keep aggregates small for performance and scalability

### Aggregate Design Guidelines

**Good Aggregate**:
```typescript
class ShoppingCart extends Entity<string> implements AggregateRoot {
  private items: Map<string, CartItem> = new Map();
  private customerId: string;

  addItem(productId: string, quantity: number): void {
    const existing = this.items.get(productId);
    if (existing) {
      existing.increaseQuantity(quantity);
    } else {
      this.items.set(productId, new CartItem(productId, quantity));
    }
  }

  removeItem(productId: string): void {
    this.items.delete(productId);
  }

  // Aggregate maintains its own invariants
  checkout(): Order {
    if (this.items.size === 0) {
      throw new Error('Cannot checkout empty cart');
    }

    const order = new Order(generateId(), this.customerId);
    for (const item of this.items.values()) {
      order.addItem(item.productId, item.quantity);
    }

    this.items.clear();
    return order;
  }
}
```

**Bad Aggregate** (too large):
```typescript
// ❌ DON'T: Order aggregate includes Customer and Products
class Order extends Entity<string> {
  private customer: Customer;        // ❌ Separate aggregate
  private products: Product[];       // ❌ Separate aggregate
  private items: OrderItem[];
}

// ✅ DO: Order aggregate references other aggregates by ID
class Order extends Entity<string> {
  private customerId: string;        // ✅ Reference by ID
  private items: OrderItem[];        // ✅ Part of aggregate
}
```

## Repository Pattern

**Repositories** provide collection-like interface for aggregates. Only aggregate roots have repositories.

**Interface** (`framework/core/src/data/repository.ts`):
```typescript
export interface Repository<T extends AggregateRoot> {
  findById(id: EntityId): Promise<T | null>;
  save(aggregate: T): Promise<void>;
  delete(id: EntityId): Promise<void>;
}
```

**Implementation** (in infrastructure layer):
```typescript
// framework/adapters/db/src/repositories/orderRepository.ts
export class OrderRepository implements Repository<Order> {
  constructor(private db: Kysely<Database>) {}

  async findById(id: string): Promise<Order | null> {
    // Query database
    const row = await this.db
      .selectFrom('orders')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    if (!row) return null;

    // Query order items
    const items = await this.db
      .selectFrom('order_items')
      .where('order_id', '=', id)
      .selectAll()
      .execute();

    // Reconstruct aggregate
    return this.toDomain(row, items);
  }

  async save(order: Order): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      // Save order
      await trx
        .insertInto('orders')
        .values({
          id: order.id,
          customer_id: order.getCustomerId(),
          status: order.getStatus(),
          created_at: order.getCreatedAt(),
          version: order.version
        })
        .onConflict((oc) =>
          oc.column('id').doUpdateSet({
            status: order.getStatus(),
            version: order.version
          })
        )
        .execute();

      // Delete existing items
      await trx
        .deleteFrom('order_items')
        .where('order_id', '=', order.id)
        .execute();

      // Save items
      const items = order.getItems().map(item => ({
        id: item.id,
        order_id: order.id,
        product_id: item.getProductId(),
        quantity: item.getQuantity(),
        price: item.getPrice().getAmount()
      }));

      if (items.length > 0) {
        await trx.insertInto('order_items').values(items).execute();
      }

      // Publish domain events
      const events = order.getDomainEvents();
      for (const event of events) {
        await this.eventBus.publish(event);
      }
      order.clearDomainEvents();
    });
  }

  async delete(id: string): Promise<void> {
    await this.db
      .deleteFrom('orders')
      .where('id', '=', id)
      .execute();
  }

  private toDomain(row: any, itemRows: any[]): Order {
    const order = new Order(row.id, row.customer_id, new Date(row.created_at));

    for (const itemRow of itemRows) {
      order.addItem(
        itemRow.product_id,
        itemRow.quantity,
        new Money(itemRow.price, 'USD')
      );
    }

    if (row.status === 'submitted') {
      order.submit();
    }

    return order;
  }
}
```

## Domain Events

**Domain Events** represent something that happened in the domain that domain experts care about.

**Type** (`framework/core/src/model/index.ts`):
```typescript
export type DomainEventPayload<T = unknown> = {
  eventType: string;
  aggregateId: EntityId;
  payload: T;
  occurredAt: Date;
};
```

**Example Events**:
```typescript
class OrderSubmittedEvent implements DomainEventPayload<OrderSubmittedPayload> {
  readonly eventType = 'order.submitted';
  readonly occurredAt = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly payload: OrderSubmittedPayload
  ) {}
}

type OrderSubmittedPayload = {
  orderId: string;
  customerId: string;
  total: number;
  currency: string;
};

class UserRegisteredEvent implements DomainEventPayload<UserRegisteredPayload> {
  readonly eventType = 'user.registered';
  readonly occurredAt = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly payload: UserRegisteredPayload
  ) {}
}

type UserRegisteredPayload = {
  userId: string;
  email: string;
  tenantId: string;
};
```

**Publishing Events**:
```typescript
// In aggregate
class Order extends Entity<string> implements AggregateRoot {
  submit(): void {
    // Business logic
    this.status = 'submitted';

    // Emit domain event
    this.addDomainEvent(
      new OrderSubmittedEvent(this.id, {
        orderId: this.id,
        customerId: this.customerId,
        total: this.calculateTotal().getAmount(),
        currency: 'USD'
      })
    );
  }
}

// In repository
class OrderRepository {
  async save(order: Order): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      // Save aggregate state
      await this.saveOrderData(trx, order);

      // Publish domain events
      const events = order.getDomainEvents();
      for (const event of events) {
        await this.eventBus.publish({
          eventId: generateId(),
          eventType: event.eventType,
          aggregateId: event.aggregateId,
          aggregateType: 'Order',
          payload: event.payload,
          occurredAt: event.occurredAt
        });
      }
      order.clearDomainEvents();
    });
  }
}
```

**Subscribing to Events**:
```typescript
// Event handler
eventBus.subscribe<OrderSubmittedPayload>('order.submitted', async (event) => {
  // Send confirmation email
  await jobQueue.add('email', {
    template: 'order-confirmation',
    to: await getCustomerEmail(event.payload.customerId),
    data: {
      orderId: event.payload.orderId,
      total: event.payload.total
    }
  });

  // Update analytics
  await metricsRegistry.incrementCounter('orders_submitted', {
    tenant: getTenantId()
  });
});
```

## Value Objects

### Common Value Objects

**Email**:
```typescript
class Email extends ValueObject<string> {
  constructor(value: string) {
    if (!Email.isValid(value)) {
      throw new Error(`Invalid email: ${value}`);
    }
    super(value.toLowerCase());
  }

  static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  getDomain(): string {
    return this.value.split('@')[1];
  }
}
```

**PhoneNumber**:
```typescript
class PhoneNumber extends ValueObject<string> {
  constructor(value: string) {
    const normalized = value.replace(/\D/g, '');
    if (normalized.length < 10) {
      throw new Error('Invalid phone number');
    }
    super(normalized);
  }

  format(): string {
    const match = this.value.match(/^(\d{3})(\d{3})(\d{4})$/);
    return match ? `(${match[1]}) ${match[2]}-${match[3]}` : this.value;
  }
}
```

**DateRange**:
```typescript
class DateRange extends ValueObject<{ start: Date; end: Date }> {
  constructor(start: Date, end: Date) {
    if (end < start) {
      throw new Error('End date must be after start date');
    }
    super({ start, end });
  }

  contains(date: Date): boolean {
    return date >= this.value.start && date <= this.value.end;
  }

  overlaps(other: DateRange): boolean {
    return (
      this.contains(other.value.start) ||
      this.contains(other.value.end) ||
      other.contains(this.value.start)
    );
  }

  getDuration(): number {
    return this.value.end.getTime() - this.value.start.getTime();
  }
}
```

## Domain Services

**Domain Services** contain business logic that doesn't naturally fit in an entity or value object.

**Example**:
```typescript
// Domain service for order pricing
class OrderPricingService {
  constructor(
    private productRepository: ProductRepository,
    private pricingRules: PricingRuleRepository
  ) {}

  async calculateOrderTotal(order: Order): Promise<Money> {
    let total = new Money(0, 'USD');

    for (const item of order.getItems()) {
      const product = await this.productRepository.findById(item.getProductId());
      if (!product) {
        throw new Error(`Product not found: ${item.getProductId()}`);
      }

      const price = product.getPrice();
      const subtotal = new Money(
        price.getAmount() * item.getQuantity(),
        price.getCurrency()
      );

      total = total.add(subtotal);
    }

    // Apply pricing rules (discounts, promotions)
    const rules = await this.pricingRules.findActive();
    for (const rule of rules) {
      total = rule.apply(total, order);
    }

    return total;
  }
}

// Domain service for user authentication
class UserAuthenticationService {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher
  ) {}

  async authenticate(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;

    const isValid = await this.passwordHasher.verify(
      password,
      user.getPasswordHash()
    );

    if (!isValid) return null;

    user.updateLastLogin(new Date());
    await this.userRepository.save(user);

    return user;
  }
}
```

## Example Implementation

**Complete example** of User aggregate with DDD patterns:

```typescript
// Domain Layer (framework/core/src/domain/user/)

// Value Objects
class Email extends ValueObject<string> {
  constructor(value: string) {
    if (!Email.isValid(value)) {
      throw new Error(`Invalid email: ${value}`);
    }
    super(value.toLowerCase());
  }

  static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

class UserRole extends ValueObject<string> {
  private static readonly VALID_ROLES = ['user', 'admin', 'manager'];

  constructor(value: string) {
    if (!UserRole.VALID_ROLES.includes(value)) {
      throw new Error(`Invalid role: ${value}`);
    }
    super(value);
  }
}

// Aggregate Root
class User extends Entity<string> implements AggregateRoot<string> {
  public readonly version: number = 1;
  private domainEvents: DomainEventPayload[] = [];

  constructor(
    id: string,
    private email: Email,
    private name: string,
    private roles: UserRole[],
    private tenantId: string,
    private createdAt: Date,
    private lastLoginAt?: Date
  ) {
    super(id);
  }

  // Factory method
  static create(email: string, name: string, tenantId: string): User {
    const user = new User(
      generateId(),
      new Email(email),
      name,
      [new UserRole('user')],
      tenantId,
      new Date()
    );

    user.addDomainEvent({
      eventType: 'user.created',
      aggregateId: user.id,
      payload: { userId: user.id, email, tenantId },
      occurredAt: new Date()
    });

    return user;
  }

  // Business logic
  updateEmail(newEmail: string): void {
    const email = new Email(newEmail);
    if (this.email.equals(email)) return;

    this.email = email;
    this.addDomainEvent({
      eventType: 'user.email_updated',
      aggregateId: this.id,
      payload: { userId: this.id, newEmail },
      occurredAt: new Date()
    });
  }

  assignRole(role: string): void {
    const userRole = new UserRole(role);
    if (this.roles.some(r => r.equals(userRole))) return;

    this.roles.push(userRole);
    this.addDomainEvent({
      eventType: 'user.role_assigned',
      aggregateId: this.id,
      payload: { userId: this.id, role },
      occurredAt: new Date()
    });
  }

  updateLastLogin(date: Date): void {
    this.lastLoginAt = date;
  }

  // Invariants
  hasRole(role: string): boolean {
    return this.roles.some(r => r.getValue() === role);
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Getters
  getEmail(): string {
    return this.email.getValue();
  }

  getName(): string {
    return this.name;
  }

  getRoles(): string[] {
    return this.roles.map(r => r.getValue());
  }

  getTenantId(): string {
    return this.tenantId;
  }

  // Domain events
  private addDomainEvent(event: DomainEventPayload): void {
    this.domainEvents.push(event);
  }

  getDomainEvents(): ReadonlyArray<DomainEventPayload> {
    return Object.freeze([...this.domainEvents]);
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }
}

// Repository Interface
interface UserRepository extends Repository<User> {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByTenant(tenantId: string): Promise<User[]>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

// Infrastructure Layer Implementation
class PgUserRepository implements UserRepository {
  constructor(
    private db: Kysely<Database>,
    private eventBus: EventBus
  ) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db
      .selectFrom('users')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    return row ? this.toDomain(row) : null;
  }

  async save(user: User): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      await trx
        .insertInto('users')
        .values({
          id: user.id,
          email: user.getEmail(),
          name: user.getName(),
          roles: JSON.stringify(user.getRoles()),
          tenant_id: user.getTenantId(),
          created_at: user.getCreatedAt(),
          version: user.version
        })
        .onConflict((oc) =>
          oc.column('id').doUpdateSet({
            email: user.getEmail(),
            name: user.getName(),
            roles: JSON.stringify(user.getRoles()),
            version: user.version
          })
        )
        .execute();

      // Publish domain events
      const events = user.getDomainEvents();
      for (const event of events) {
        await this.eventBus.publish({
          eventId: generateId(),
          eventType: event.eventType,
          aggregateId: event.aggregateId,
          aggregateType: 'User',
          payload: event.payload,
          occurredAt: event.occurredAt,
          metadata: {}
        });
      }
      user.clearDomainEvents();
    });
  }

  private toDomain(row: any): User {
    return new User(
      row.id,
      new Email(row.email),
      row.name,
      JSON.parse(row.roles).map((r: string) => new UserRole(r)),
      row.tenant_id,
      new Date(row.created_at),
      row.last_login_at ? new Date(row.last_login_at) : undefined
    );
  }
}
```

## See Also

- [System Architecture Overview](./OVERVIEW.md)
- [Event-Driven Architecture](./EVENTS.md)
- [Core Framework Documentation](../framework/CORE.md)

---

[← Back to Architecture](./README.md) | [Back to Documentation Home](../README.md)
