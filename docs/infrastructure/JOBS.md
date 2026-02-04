# Job Queue System

The job queue system provides reliable background job processing with Redis-backed persistence using BullMQ.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Job Types](#job-types)
- [Job Options](#job-options)
- [Worker Pool](#worker-pool)
- [Retry and Backoff](#retry-and-backoff)
- [Monitoring](#monitoring)
- [Examples](#examples)

## Overview

The job queue system enables:
- **Asynchronous processing** - Offload long-running tasks from HTTP requests
- **Reliable execution** - Redis persistence ensures jobs aren't lost
- **Retry logic** - Automatic retry with exponential backoff
- **Priority queues** - Critical jobs processed first
- **Concurrency control** - Limit concurrent workers per job type
- **Job tracking** - Monitor job status and progress

**Components**:
1. **Job Queue** - Enqueues jobs to Redis
2. **Worker Pool** - Processes jobs with configurable concurrency
3. **BullMQ** - Redis-backed job queue library
4. **Lua Scripts** - Atomic operations for job state management

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  API Mode (Producers)                │
│  ┌──────────────────────────────────────────────┐  │
│  │  HTTP Request Handler                         │  │
│  │    ↓                                          │  │
│  │  jobQueue.add('email', { ... })               │  │
│  │    ↓                                          │  │
│  │  Response (202 Accepted)                      │  │
│  └──────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │
                        ↓
              ┌─────────────────┐
              │  Redis (BullMQ)  │
              │   Job Queues     │
              └─────────────────┘
                        │
                        ↓
┌───────────────────────┴─────────────────────────────┐
│              Worker Mode (Consumers)                 │
│  ┌──────────────────────────────────────────────┐  │
│  │  Worker Pool (concurrency: 5)                 │  │
│  │    ↓                                          │  │
│  │  Job Handler (email)                          │  │
│  │    ↓                                          │  │
│  │  emailService.send(...)                       │  │
│  │    ↓                                          │  │
│  │  Job Completed / Failed                       │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Job Types

### Defining Job Types

**Job Data Structure**:
```typescript
import type { JobData } from '@athyper/core';

// Define job payload types
type EmailJobData = {
  type: 'email';
  payload: {
    template: string;
    to: string;
    data: Record<string, unknown>;
  };
};

type ExportJobData = {
  type: 'export';
  payload: {
    format: 'csv' | 'xlsx' | 'pdf';
    query: Record<string, unknown>;
    userId: string;
  };
};

type ReportJobData = {
  type: 'report';
  payload: {
    reportType: string;
    dateRange: { start: string; end: string };
    tenantId: string;
  };
};
```

### Enqueueing Jobs

**In API Handler**:
```typescript
import { TOKENS } from '@athyper/runtime';

export async function sendWelcomeEmail(req: Request, res: Response) {
  const jobQueue = await req.container.resolve(TOKENS.jobQueue);

  // Enqueue email job
  const job = await jobQueue.add<EmailJobData>({
    type: 'email',
    payload: {
      template: 'welcome',
      to: req.body.email,
      data: {
        name: req.body.name,
        verificationUrl: generateVerificationUrl()
      }
    }
  }, {
    priority: 'normal',
    maxAttempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
  });

  res.status(202).json({
    message: 'Email queued',
    jobId: job.id
  });
}
```

### Processing Jobs

**In Worker Startup** (`framework/runtime/src/startup/startWorkerRuntime.ts`):
```typescript
export async function startWorkerRuntime(ctx: BootstrapContext) {
  const jobQueue = await ctx.container.resolve(TOKENS.jobQueue);
  const emailService = await ctx.container.resolve(TOKENS.emailService);
  const exportService = await ctx.container.resolve(TOKENS.exportService);

  // Register job handlers
  await jobQueue.process<EmailJobData, void>(
    'email',
    5, // concurrency: 5 workers
    async (job) => {
      await emailService.send(job.data.payload);
      return { success: true };
    }
  );

  await jobQueue.process<ExportJobData, { downloadUrl: string }>(
    'export',
    2, // concurrency: 2 workers (resource-intensive)
    async (job) => {
      const file = await exportService.generate(job.data.payload);
      const url = await storage.putPresignedUrl(file.path);
      return { downloadUrl: url };
    }
  );

  await jobQueue.process<ReportJobData, void>(
    'report',
    3, // concurrency: 3 workers
    async (job) => {
      await reportService.generate(job.data.payload);
      return { success: true };
    }
  );

  logger.info('Worker mode started, processing jobs');
}
```

## Job Options

### Priority

Control job processing order with priority levels:

```typescript
await jobQueue.add(jobData, {
  priority: 'critical'  // Processed first
});

await jobQueue.add(jobData, {
  priority: 'high'      // After critical
});

await jobQueue.add(jobData, {
  priority: 'normal'    // Default
});

await jobQueue.add(jobData, {
  priority: 'low'       // Processed last
});
```

### Retry and Backoff

Configure automatic retry behavior:

```typescript
await jobQueue.add(jobData, {
  maxAttempts: 5,
  backoff: {
    type: 'exponential',  // exponential | linear | fixed
    delay: 1000           // Base delay in ms
  }
});

// Custom backoff
await jobQueue.add(jobData, {
  maxAttempts: 3,
  backoff: {
    type: 'fixed',
    delay: 5000  // Always wait 5 seconds between retries
  }
});
```

### Delayed Jobs

Schedule jobs to run in the future:

```typescript
// Run in 5 minutes
await jobQueue.add(jobData, {
  delay: 5 * 60 * 1000
});

// Run at specific time
const scheduledTime = new Date('2024-01-01T00:00:00Z');
await jobQueue.add(jobData, {
  delay: scheduledTime.getTime() - Date.now()
});
```

### Job Timeout

Set maximum execution time:

```typescript
await jobQueue.add(jobData, {
  timeout: 30000  // 30 seconds
});
```

## Worker Pool

### Configuration

**File**: `framework/runtime/src/jobs/worker-pool.ts`

```typescript
export class WorkerPool {
  constructor(
    private queue: Queue,
    private concurrency: number,
    private handler: JobHandler
  );

  async start(): Promise<void>;
  async stop(): Promise<void>;
  getMetrics(): WorkerPoolMetrics;
}
```

### Worker Metrics

```typescript
const metrics = workerPool.getMetrics();
// {
//   activeJobs: 3,
//   completedJobs: 150,
//   failedJobs: 5,
//   avgProcessingTime: 1250,
//   uptimeMs: 3600000
// }
```

### Graceful Shutdown

Workers automatically finish in-progress jobs before shutting down:

```typescript
// On SIGTERM
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down workers');

  // Stop accepting new jobs
  await workerPool.stop();

  // Wait for in-progress jobs to complete (with timeout)
  await workerPool.waitForCompletion(30000);

  process.exit(0);
});
```

## Retry and Backoff

### Exponential Backoff

Delay doubles after each retry:

```
Attempt 1: 1000ms
Attempt 2: 2000ms
Attempt 3: 4000ms
Attempt 4: 8000ms
Attempt 5: 16000ms
```

```typescript
await jobQueue.add(jobData, {
  maxAttempts: 5,
  backoff: { type: 'exponential', delay: 1000 }
});
```

### Linear Backoff

Delay increases by fixed amount:

```
Attempt 1: 1000ms
Attempt 2: 2000ms
Attempt 3: 3000ms
Attempt 4: 4000ms
Attempt 5: 5000ms
```

```typescript
await jobQueue.add(jobData, {
  maxAttempts: 5,
  backoff: { type: 'linear', delay: 1000 }
});
```

### Fixed Backoff

Same delay for all retries:

```
Attempt 1: 5000ms
Attempt 2: 5000ms
Attempt 3: 5000ms
```

```typescript
await jobQueue.add(jobData, {
  maxAttempts: 3,
  backoff: { type: 'fixed', delay: 5000 }
});
```

### Custom Retry Logic

```typescript
await jobQueue.process('email', 5, async (job) => {
  try {
    await emailService.send(job.data.payload);
    return { success: true };
  } catch (error) {
    // Retry only on transient errors
    if (isTransientError(error)) {
      throw error;  // Will be retried
    }

    // Don't retry on permanent errors
    logger.error({ error }, 'Permanent error, not retrying');
    return { success: false, error: error.message };
  }
});
```

## Monitoring

### Queue Metrics

```typescript
const metrics = await jobQueue.getMetrics();
// {
//   waiting: 150,    // Jobs in queue
//   active: 5,       // Jobs being processed
//   completed: 1000, // Successfully completed
//   failed: 10,      // Failed jobs
//   delayed: 20      // Scheduled for future
// }
```

### Job Status

```typescript
// Get specific job
const job = await jobQueue.getJob('job-id-123');
console.log(job.status);  // 'waiting' | 'active' | 'completed' | 'failed'

// Get all jobs by status
const failedJobs = await jobQueue.getJobs('failed');
for (const job of failedJobs) {
  console.log(`Job ${job.id} failed: ${job.failedReason}`);
}
```

### Metrics Integration

```typescript
// In worker handler
await jobQueue.process('email', 5, async (job) => {
  const startTime = Date.now();

  try {
    await emailService.send(job.data.payload);

    // Record success metric
    metricsRegistry.incrementCounter('jobs_processed', {
      job_type: 'email',
      status: 'success'
    });

    metricsRegistry.recordHistogram('job_duration_ms', Date.now() - startTime, {
      job_type: 'email'
    });

    return { success: true };
  } catch (error) {
    // Record failure metric
    metricsRegistry.incrementCounter('jobs_processed', {
      job_type: 'email',
      status: 'failed'
    });

    throw error;
  }
});
```

### Health Checks

```typescript
// Register job queue health check
healthRegistry.register(
  'job-queue',
  async () => {
    const metrics = await jobQueue.getMetrics();

    // Healthy if queue depth is reasonable
    const healthy = metrics.waiting < 1000 && metrics.failed < 100;

    return {
      healthy,
      message: healthy
        ? 'Job queue healthy'
        : `Job queue unhealthy: ${metrics.waiting} waiting, ${metrics.failed} failed`
    };
  },
  { required: true }
);
```

## Examples

### Complete Email Job Example

**Job Definition**:
```typescript
// types/jobs.ts
export type EmailJobData = {
  type: 'email';
  payload: {
    template: string;
    to: string;
    subject?: string;
    data: Record<string, unknown>;
  };
};
```

**Enqueue in API**:
```typescript
// routes/users.ts
import type { EmailJobData } from '../types/jobs.js';

router.post('/register', async (req, res) => {
  const user = await userService.createUser(req.body);

  // Enqueue welcome email
  await jobQueue.add<EmailJobData>({
    type: 'email',
    payload: {
      template: 'welcome',
      to: user.email,
      data: {
        name: user.name,
        verificationUrl: generateVerificationUrl(user.id)
      }
    }
  }, {
    priority: 'high',
    maxAttempts: 3
  });

  res.status(201).json({ user });
});
```

**Process in Worker**:
```typescript
// worker.ts
import type { EmailJobData } from './types/jobs.js';

await jobQueue.process<EmailJobData, void>(
  'email',
  5,
  async (job) => {
    const { template, to, data } = job.data.payload;

    logger.info({ template, to }, 'Sending email');

    await emailService.send({
      template,
      to,
      subject: data.subject || getDefaultSubject(template),
      data
    });

    logger.info({ template, to }, 'Email sent successfully');

    return { success: true };
  }
);
```

### Bulk Job Processing

```typescript
// Enqueue multiple jobs at once
const jobs = users.map(user => ({
  data: {
    type: 'email',
    payload: {
      template: 'newsletter',
      to: user.email,
      data: { name: user.name }
    }
  },
  options: {
    priority: 'low' as const
  }
}));

await jobQueue.addBulk(jobs);
```

### Job Chaining

```typescript
// Job 1: Generate report
await jobQueue.add({
  type: 'report',
  payload: { reportType: 'monthly-sales' }
}, {
  jobId: 'report-123'  // Specific job ID
});

// Job 2: Email report (depends on Job 1)
await jobQueue.add({
  type: 'email-report',
  payload: {
    reportJobId: 'report-123',
    to: 'manager@example.com'
  }
}, {
  delay: 5000  // Wait 5 seconds for report to be ready
});
```

## See Also

- [Resilience Patterns](./RESILIENCE.md)
- [Observability](./OBSERVABILITY.md)
- [Core Framework](../framework/CORE.md)

---

[← Back to Documentation Home](../README.md)
