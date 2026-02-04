# Event-Driven Architecture

This document describes the event-driven architecture patterns used in the Athyper platform.

## Table of Contents

- [Overview](#overview)
- [Event Types](#event-types)
- [Event Bus](#event-bus)
- [Event Store](#event-store)
- [Event Patterns](#event-patterns)
- [Event Sourcing](#event-sourcing)
- [Implementation Examples](#implementation-examples)

## Overview

The Athyper platform uses **event-driven architecture** to enable:
- **Loose coupling** between components
- **Asynchronous processing** for better performance
- **Audit trail** of all domain changes
- **Event sourcing** capabilities (future)
- **Integration** with external systems

**Event Flow**:
```
Aggregate → Domain Event → Event Bus → Event Handlers
                             ↓
                         Event Store (optional)
```

## Event Types

### Domain Events

**Domain Events** represent business-significant occurrences in the domain.

**Structure** (`framework/core/src/events/domainEvent.ts`):
```typescript
export type DomainEvent<T = unknown> = {
  eventId: string;                    // Unique event ID
  eventType: string;                  // Event type (e.g., 'user.created')
  occurredAt: Date;                   // When event occurred
  aggregateId: string;                // ID of aggregate that emitted event
  aggregateType: string;              // Type of aggregate (e.g., 'User')
  payload: T;                         // Event-specific data
  metadata?: Record<string, unknown>; // Additional context
};
```

**Example Events**:
```typescript
// User domain events
type UserCreatedEvent = DomainEvent<{
  userId: string;
  email: string;
  tenantId: string;
}>;

type UserEmailUpdatedEvent = DomainEvent<{
  userId: string;
  oldEmail: string;
  newEmail: string;
}>;

// Order domain events
type OrderSubmittedEvent = DomainEvent<{
  orderId: string;
  customerId: string;
  items: Array<{ productId: string; quantity: number }>;
  total: number;
  currency: string;
}>;

type OrderCancelledEvent = DomainEvent<{
  orderId: string;
  reason: string;
  cancelledBy: string;
}>;

// Payment domain events
type PaymentCompletedEvent = DomainEvent<{
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
}>;
```

### Integration Events

**Integration Events** are published to external systems (message queues, webhooks).

```typescript
type IntegrationEvent = {
  eventId: string;
  eventType: string;
  occurredAt: Date;
  source: string;        // Source system
  version: string;       // Schema version
  data: unknown;
  metadata: {
    tenantId?: string;
    userId?: string;
    correlationId?: string;
  };
};
```

## Event Bus

The **Event Bus** provides pub/sub functionality for domain events.

**Interface** (`framework/core/src/events/eventBus.ts`):
```typescript
export interface EventBus {
  publish<T>(event: DomainEvent<T>): Promise<void>;
  subscribe<T>(eventType: string, handler: EventHandler<T>): () => void;
}

export type EventHandler<T = unknown> = (
  event: DomainEvent<T>
) => void | Promise<void>;
```

### In-Memory Event Bus

**Implementation** (`framework/core/src/events/eventBus.ts`):
```typescript
export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    const handlers = this.handlers.get(event.eventType);
    if (!handlers) return;

    // Execute handlers in parallel
    await Promise.all(
      Array.from(handlers).map((handler) => handler(event))
    );
  }

  subscribe<T>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }
}
```

**Usage**:
```typescript
const eventBus = new InMemoryEventBus();

// Subscribe to events
eventBus.subscribe<UserCreatedPayload>('user.created', async (event) => {
  console.log('User created:', event.payload.email);

  // Enqueue welcome email job
  await jobQueue.add('email', {
    template: 'welcome',
    to: event.payload.email
  });
});

// Publish event
await eventBus.publish({
  eventId: generateId(),
  eventType: 'user.created',
  occurredAt: new Date(),
  aggregateId: user.id,
  aggregateType: 'User',
  payload: {
    userId: user.id,
    email: user.email,
    tenantId: user.tenantId
  }
});
```

### Redis Event Bus (future)

**Distributed event bus** for multi-instance deployments:

```typescript
export class RedisEventBus implements EventBus {
  constructor(private redis: Redis) {}

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    const channel = `events:${event.eventType}`;
    await this.redis.publish(channel, JSON.stringify(event));
  }

  subscribe<T>(eventType: string, handler: EventHandler<T>): () => void {
    const subscriber = this.redis.duplicate();
    const channel = `events:${eventType}`;

    subscriber.subscribe(channel, (err) => {
      if (err) console.error('Subscribe error:', err);
    });

    subscriber.on('message', async (receivedChannel, message) => {
      if (receivedChannel !== channel) return;

      const event = JSON.parse(message) as DomainEvent<T>;
      await handler(event);
    });

    // Return unsubscribe function
    return () => {
      subscriber.unsubscribe(channel);
      subscriber.quit();
    };
  }
}
```

## Event Store

The **Event Store** persists events for audit trail and event sourcing.

**Interface** (`framework/core/src/events/eventStore.ts`):
```typescript
export interface EventStore {
  append(event: DomainEvent): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
  getEventsByType(eventType: string): Promise<DomainEvent[]>;
}
```

### Database Event Store Implementation

```typescript
export class PgEventStore implements EventStore {
  constructor(private db: Kysely<Database>) {}

  async append(event: DomainEvent): Promise<void> {
    await this.db
      .insertInto('events')
      .values({
        id: event.eventId,
        event_type: event.eventType,
        aggregate_id: event.aggregateId,
        aggregate_type: event.aggregateType,
        payload: JSON.stringify(event.payload),
        metadata: JSON.stringify(event.metadata || {}),
        occurred_at: event.occurredAt
      })
      .execute();
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    const rows = await this.db
      .selectFrom('events')
      .where('aggregate_id', '=', aggregateId)
      .orderBy('occurred_at', 'asc')
      .selectAll()
      .execute();

    return rows.map(this.toDomain);
  }

  async getEventsByType(eventType: string): Promise<DomainEvent[]> {
    const rows = await this.db
      .selectFrom('events')
      .where('event_type', '=', eventType)
      .orderBy('occurred_at', 'asc')
      .selectAll()
      .execute();

    return rows.map(this.toDomain);
  }

  private toDomain(row: any): DomainEvent {
    return {
      eventId: row.id,
      eventType: row.event_type,
      aggregateId: row.aggregate_id,
      aggregateType: row.aggregate_type,
      payload: JSON.parse(row.payload),
      metadata: JSON.parse(row.metadata),
      occurredAt: new Date(row.occurred_at)
    };
  }
}
```

**Database Schema**:
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  event_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  aggregate_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for aggregate history queries
CREATE INDEX idx_events_aggregate_id ON events(aggregate_id, occurred_at);

-- Index for event type queries
CREATE INDEX idx_events_event_type ON events(event_type, occurred_at);

-- Index for time-based queries
CREATE INDEX idx_events_occurred_at ON events(occurred_at);
```

## Event Patterns

### Event Notification

**Pattern**: Publish lightweight notification, subscribers fetch details if needed.

```typescript
// Lightweight event
await eventBus.publish({
  eventId: generateId(),
  eventType: 'order.submitted',
  aggregateId: order.id,
  aggregateType: 'Order',
  payload: { orderId: order.id },  // Minimal data
  occurredAt: new Date()
});

// Handler fetches details
eventBus.subscribe('order.submitted', async (event) => {
  // Fetch full order details
  const order = await orderRepository.findById(event.payload.orderId);
  if (!order) return;

  // Process order
  await fulfillmentService.processOrder(order);
});
```

**Advantages**:
- Small event payload
- Subscribers get latest data
- Loose coupling

**Disadvantages**:
- Requires fetching from repository
- May fail if aggregate deleted

### Event-Carried State Transfer

**Pattern**: Include all necessary data in event payload.

```typescript
// Rich event with all data
await eventBus.publish({
  eventId: generateId(),
  eventType: 'order.submitted',
  aggregateId: order.id,
  aggregateType: 'Order',
  payload: {
    orderId: order.id,
    customerId: order.customerId,
    items: order.items.map(i => ({
      productId: i.productId,
      quantity: i.quantity,
      price: i.price
    })),
    total: order.total,
    currency: order.currency
  },
  occurredAt: new Date()
});

// Handler has all needed data
eventBus.subscribe('order.submitted', async (event) => {
  // No need to fetch from repository
  await fulfillmentService.processOrder(event.payload);
});
```

**Advantages**:
- No repository access needed
- Works even if aggregate deleted
- Faster processing

**Disadvantages**:
- Larger event payload
- Data duplication

### Saga Pattern

**Pattern**: Coordinate multiple aggregates using events.

```typescript
// Order saga coordinates Order, Payment, Inventory
class OrderSaga {
  constructor(
    private eventBus: EventBus,
    private paymentService: PaymentService,
    private inventoryService: InventoryService,
    private orderRepository: OrderRepository
  ) {
    this.registerHandlers();
  }

  private registerHandlers(): void {
    // Step 1: Order submitted
    this.eventBus.subscribe('order.submitted', async (event) => {
      const { orderId, customerId, total } = event.payload;

      try {
        // Reserve inventory
        await this.inventoryService.reserve(orderId, event.payload.items);

        // Process payment
        const payment = await this.paymentService.charge(
          customerId,
          total,
          { orderId }
        );

        // Publish success event
        await this.eventBus.publish({
          eventId: generateId(),
          eventType: 'order.confirmed',
          aggregateId: orderId,
          aggregateType: 'Order',
          payload: { orderId, paymentId: payment.id },
          occurredAt: new Date()
        });
      } catch (error) {
        // Publish failure event
        await this.eventBus.publish({
          eventId: generateId(),
          eventType: 'order.failed',
          aggregateId: orderId,
          aggregateType: 'Order',
          payload: { orderId, reason: error.message },
          occurredAt: new Date()
        });
      }
    });

    // Step 2: Order confirmed
    this.eventBus.subscribe('order.confirmed', async (event) => {
      const order = await this.orderRepository.findById(event.payload.orderId);
      if (!order) return;

      order.markAsConfirmed(event.payload.paymentId);
      await this.orderRepository.save(order);
    });

    // Step 3: Order failed (compensate)
    this.eventBus.subscribe('order.failed', async (event) => {
      const { orderId } = event.payload;

      // Release inventory reservation
      await this.inventoryService.release(orderId);

      // Update order status
      const order = await this.orderRepository.findById(orderId);
      if (!order) return;

      order.markAsFailed(event.payload.reason);
      await this.orderRepository.save(order);
    });
  }
}
```

### Outbox Pattern

**Pattern**: Ensure events are published exactly once using transactional outbox.

```typescript
// Repository saves both aggregate and events in same transaction
class OrderRepository {
  async save(order: Order): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      // Save order state
      await trx
        .insertInto('orders')
        .values(this.toRow(order))
        .execute();

      // Save events to outbox table
      const events = order.getDomainEvents();
      if (events.length > 0) {
        await trx
          .insertInto('outbox')
          .values(
            events.map(event => ({
              id: event.eventId,
              event_type: event.eventType,
              aggregate_id: event.aggregateId,
              aggregate_type: event.aggregateType,
              payload: JSON.stringify(event.payload),
              occurred_at: event.occurredAt,
              published: false
            }))
          )
          .execute();
      }

      order.clearDomainEvents();
    });
  }
}

// Background worker publishes events from outbox
class OutboxProcessor {
  constructor(
    private db: Kysely<Database>,
    private eventBus: EventBus
  ) {}

  async processOutbox(): Promise<void> {
    // Fetch unpublished events
    const events = await this.db
      .selectFrom('outbox')
      .where('published', '=', false)
      .orderBy('occurred_at', 'asc')
      .limit(100)
      .selectAll()
      .execute();

    for (const row of events) {
      try {
        // Publish event
        await this.eventBus.publish({
          eventId: row.id,
          eventType: row.event_type,
          aggregateId: row.aggregate_id,
          aggregateType: row.aggregate_type,
          payload: JSON.parse(row.payload),
          occurredAt: new Date(row.occurred_at)
        });

        // Mark as published
        await this.db
          .updateTable('outbox')
          .set({ published: true, published_at: new Date() })
          .where('id', '=', row.id)
          .execute();
      } catch (error) {
        console.error('Failed to publish event:', error);
        // Will retry on next poll
      }
    }
  }

  // Poll every 5 seconds
  start(): void {
    setInterval(() => this.processOutbox(), 5000);
  }
}
```

**Outbox Table Schema**:
```sql
CREATE TABLE outbox (
  id UUID PRIMARY KEY,
  event_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  aggregate_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outbox_published ON outbox(published, occurred_at)
  WHERE published = FALSE;
```

## Event Sourcing

**Event Sourcing** stores all changes as sequence of events instead of current state.

### Event-Sourced Aggregate

```typescript
class EventSourcedOrder extends Entity<string> implements AggregateRoot {
  private items: Map<string, OrderItem> = new Map();
  private status: OrderStatus = 'draft';
  private events: DomainEvent[] = [];
  public version: number = 0;

  // Reconstruct from events
  static fromEvents(events: DomainEvent[]): EventSourcedOrder {
    const order = new EventSourcedOrder(events[0].aggregateId);

    for (const event of events) {
      order.apply(event);
      order.version++;
    }

    return order;
  }

  // Command methods emit events
  addItem(productId: string, quantity: number, price: Money): void {
    if (this.status !== 'draft') {
      throw new Error('Cannot modify non-draft order');
    }

    const event: DomainEvent = {
      eventId: generateId(),
      eventType: 'order.item_added',
      aggregateId: this.id,
      aggregateType: 'Order',
      payload: { productId, quantity, price: price.getAmount() },
      occurredAt: new Date()
    };

    this.apply(event);
    this.events.push(event);
  }

  submit(): void {
    if (this.items.size === 0) {
      throw new Error('Cannot submit empty order');
    }
    if (this.status !== 'draft') {
      throw new Error('Order already submitted');
    }

    const event: DomainEvent = {
      eventId: generateId(),
      eventType: 'order.submitted',
      aggregateId: this.id,
      aggregateType: 'Order',
      payload: { orderId: this.id },
      occurredAt: new Date()
    };

    this.apply(event);
    this.events.push(event);
  }

  // Apply events to update state
  private apply(event: DomainEvent): void {
    switch (event.eventType) {
      case 'order.created':
        // Already initialized
        break;

      case 'order.item_added':
        const { productId, quantity, price } = event.payload;
        this.items.set(
          productId,
          new OrderItem(productId, quantity, new Money(price, 'USD'))
        );
        break;

      case 'order.item_removed':
        this.items.delete(event.payload.productId);
        break;

      case 'order.submitted':
        this.status = 'submitted';
        break;

      case 'order.cancelled':
        this.status = 'cancelled';
        break;
    }
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this.events];
  }

  clearUncommittedEvents(): void {
    this.events = [];
  }
}
```

### Event-Sourced Repository

```typescript
class EventSourcedOrderRepository {
  constructor(private eventStore: EventStore) {}

  async findById(id: string): Promise<EventSourcedOrder | null> {
    const events = await this.eventStore.getEvents(id);
    if (events.length === 0) return null;

    return EventSourcedOrder.fromEvents(events);
  }

  async save(order: EventSourcedOrder): Promise<void> {
    const events = order.getUncommittedEvents();

    for (const event of events) {
      await this.eventStore.append(event);
    }

    order.clearUncommittedEvents();
  }
}
```

## Implementation Examples

### Complete Event Flow Example

```typescript
// 1. User creates order
const order = Order.create(userId, tenantId);
order.addItem('product-1', 2, new Money(29.99, 'USD'));
order.addItem('product-2', 1, new Money(49.99, 'USD'));

// 2. Submit order (generates domain events)
order.submit();

// 3. Repository saves order and publishes events
await orderRepository.save(order);
// This internally:
// - Saves order to database
// - Publishes 'order.submitted' event to event bus

// 4. Event handlers react
eventBus.subscribe('order.submitted', async (event) => {
  // A. Send confirmation email
  await jobQueue.add('email', {
    template: 'order-confirmation',
    to: await getUserEmail(event.payload.customerId),
    data: event.payload
  });

  // B. Update analytics
  await metricsRegistry.incrementCounter('orders_submitted', {
    tenant: event.payload.tenantId
  });

  // C. Notify fulfillment system
  await fulfillmentService.createShipment(event.payload.orderId);
});
```

### Event Handler Registration

```typescript
// Register all event handlers at application startup
export function registerEventHandlers(
  eventBus: EventBus,
  deps: {
    jobQueue: JobQueue;
    metricsRegistry: MetricsRegistry;
    userRepository: UserRepository;
    orderRepository: OrderRepository;
  }
): void {
  // User events
  eventBus.subscribe('user.created', async (event) => {
    await deps.jobQueue.add('email', {
      template: 'welcome',
      to: event.payload.email
    });

    await deps.metricsRegistry.incrementCounter('users_created', {
      tenant: event.payload.tenantId
    });
  });

  eventBus.subscribe('user.email_updated', async (event) => {
    await deps.jobQueue.add('email', {
      template: 'email-changed-confirmation',
      to: event.payload.newEmail
    });
  });

  // Order events
  eventBus.subscribe('order.submitted', async (event) => {
    await deps.jobQueue.add('email', {
      template: 'order-confirmation',
      to: await getUserEmail(event.payload.customerId),
      data: event.payload
    });
  });

  eventBus.subscribe('order.cancelled', async (event) => {
    await deps.jobQueue.add('email', {
      template: 'order-cancelled',
      to: await getUserEmail(event.payload.customerId),
      data: event.payload
    });

    // Refund payment
    await deps.jobQueue.add('refund', {
      orderId: event.payload.orderId
    });
  });

  // Payment events
  eventBus.subscribe('payment.completed', async (event) => {
    const order = await deps.orderRepository.findById(event.payload.orderId);
    if (!order) return;

    order.markAsPaid(event.payload.paymentId);
    await deps.orderRepository.save(order);
  });
}
```

## See Also

- [System Architecture Overview](./OVERVIEW.md)
- [Domain-Driven Design Patterns](./DDD_PATTERNS.md)
- [Job Queue System](../infrastructure/JOBS.md)
- [Core Framework Documentation](../framework/CORE.md)

---

[← Back to Architecture](./README.md) | [Back to Documentation Home](../README.md)
