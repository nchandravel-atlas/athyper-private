/**
 * Notification Service
 *
 * Handles sending notifications for approval tasks through various channels.
 */

import type {
  ApprovalTask,
  NotificationChannel,
  NotificationType,
  NotificationPriority,
  NotificationRecord,
  NotificationRecipient,
  NotificationPreferences,
  NotificationTemplate,
  INotificationService,
  INotificationSender,
} from "./types.js";
import type { ApprovalInstance } from "../instance/types.js";

/**
 * Generate unique ID
 */
function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Default notification templates
 */
const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  {
    id: "tpl_task_assigned_email",
    code: "task_assigned_email",
    type: "task_assigned",
    channel: "email",
    subject: "New approval task: {{entityDisplayName}}",
    body: "You have a new approval task for {{entityType}} {{entityDisplayName}}.\n\nWorkflow: {{workflowName}}\nStep: {{stepName}}\nRequester: {{requesterName}}\nDue: {{dueDate}}\n\nPlease review and take action.",
    htmlBody: `
      <h2>New Approval Task</h2>
      <p>You have a new approval task for <strong>{{entityType}}</strong> <strong>{{entityDisplayName}}</strong>.</p>
      <table>
        <tr><td>Workflow:</td><td>{{workflowName}}</td></tr>
        <tr><td>Step:</td><td>{{stepName}}</td></tr>
        <tr><td>Requester:</td><td>{{requesterName}}</td></tr>
        <tr><td>Due:</td><td>{{dueDate}}</td></tr>
      </table>
      <p><a href="{{taskUrl}}">Review and take action</a></p>
    `,
    variables: ["entityType", "entityDisplayName", "workflowName", "stepName", "requesterName", "dueDate", "taskUrl"],
    active: true,
    locale: "en",
  },
  {
    id: "tpl_task_assigned_inapp",
    code: "task_assigned_inapp",
    type: "task_assigned",
    channel: "in_app",
    body: "New approval task: {{entityDisplayName}} ({{stepName}})",
    variables: ["entityDisplayName", "stepName"],
    active: true,
    locale: "en",
  },
  {
    id: "tpl_sla_warning_email",
    code: "sla_warning_email",
    type: "sla_warning",
    channel: "email",
    subject: "SLA Warning: {{entityDisplayName}} approval due soon",
    body: "The approval task for {{entityType}} {{entityDisplayName}} is approaching its SLA deadline.\n\nDue: {{dueDate}}\nTime remaining: {{timeRemaining}}\n\nPlease take action soon to avoid SLA breach.",
    variables: ["entityType", "entityDisplayName", "dueDate", "timeRemaining"],
    active: true,
    locale: "en",
  },
  {
    id: "tpl_sla_breached_email",
    code: "sla_breached_email",
    type: "sla_breached",
    channel: "email",
    subject: "SLA Breached: {{entityDisplayName}} approval overdue",
    body: "The approval task for {{entityType}} {{entityDisplayName}} has exceeded its SLA deadline.\n\nDue date was: {{dueDate}}\nOverdue by: {{overdueBy}}\n\nImmediate action required.",
    variables: ["entityType", "entityDisplayName", "dueDate", "overdueBy"],
    active: true,
    locale: "en",
  },
  {
    id: "tpl_task_escalated_email",
    code: "task_escalated_email",
    type: "task_escalated",
    channel: "email",
    subject: "Escalated approval task: {{entityDisplayName}}",
    body: "An approval task has been escalated to you for {{entityType}} {{entityDisplayName}}.\n\nReason: {{escalationReason}}\nOriginal assignee: {{originalAssignee}}\nDue: {{dueDate}}\n\nPlease review and take action.",
    variables: ["entityType", "entityDisplayName", "escalationReason", "originalAssignee", "dueDate"],
    active: true,
    locale: "en",
  },
  {
    id: "tpl_approval_complete_email",
    code: "approval_complete_email",
    type: "approval_complete",
    channel: "email",
    subject: "Approval {{outcome}}: {{entityDisplayName}}",
    body: "The approval workflow for {{entityType}} {{entityDisplayName}} has been completed.\n\nOutcome: {{outcome}}\nCompleted at: {{completedAt}}",
    variables: ["entityType", "entityDisplayName", "outcome", "completedAt"],
    active: true,
    locale: "en",
  },
  {
    id: "tpl_task_reminder_email",
    code: "task_reminder_email",
    type: "task_reminder",
    channel: "email",
    subject: "Reminder: Approval pending for {{entityDisplayName}}",
    body: "This is reminder #{{reminderNumber}} for your pending approval task.\n\n{{entityType}}: {{entityDisplayName}}\nDue: {{dueDate}}\nTime remaining: {{timeRemaining}}\n\nPlease review and take action.",
    variables: ["reminderNumber", "entityType", "entityDisplayName", "dueDate", "timeRemaining"],
    active: true,
    locale: "en",
  },
];

/**
 * In-memory notification storage
 */
class InMemoryNotificationStore {
  private notifications: Map<string, NotificationRecord[]> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    // Load default templates
    for (const template of DEFAULT_TEMPLATES) {
      this.templates.set(`${template.type}_${template.channel}_${template.locale}`, template);
    }
  }

  addNotification(tenantId: string, notification: NotificationRecord): void {
    const key = `${tenantId}_${notification.recipientId}`;
    const existing = this.notifications.get(key) || [];
    existing.push(notification);
    this.notifications.set(key, existing);
  }

  getNotifications(
    tenantId: string,
    userId: string,
    options?: { unreadOnly?: boolean; type?: NotificationType; limit?: number; offset?: number }
  ): NotificationRecord[] {
    const key = `${tenantId}_${userId}`;
    let notifications = this.notifications.get(key) || [];

    if (options?.unreadOnly) {
      notifications = notifications.filter((n) => n.status !== "read");
    }

    if (options?.type) {
      notifications = notifications.filter((n) => n.type === options.type);
    }

    // Sort by created date descending
    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const offset = options?.offset || 0;
    const limit = options?.limit || 50;

    return notifications.slice(offset, offset + limit);
  }

  markAsRead(tenantId: string, notificationId: string): void {
    for (const [, notifications] of this.notifications) {
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification) {
        notification.status = "read";
        notification.readAt = new Date();
        break;
      }
    }
  }

  markAllAsRead(tenantId: string, userId: string): void {
    const key = `${tenantId}_${userId}`;
    const notifications = this.notifications.get(key) || [];
    const now = new Date();
    for (const notification of notifications) {
      if (notification.status !== "read") {
        notification.status = "read";
        notification.readAt = now;
      }
    }
  }

  getPreferences(tenantId: string, userId: string): NotificationPreferences | undefined {
    return this.preferences.get(`${tenantId}_${userId}`);
  }

  setPreferences(tenantId: string, userId: string, prefs: NotificationPreferences): void {
    this.preferences.set(`${tenantId}_${userId}`, prefs);
  }

  getTemplate(
    type: NotificationType,
    channel: NotificationChannel,
    locale: string = "en"
  ): NotificationTemplate | undefined {
    return this.templates.get(`${type}_${channel}_${locale}`);
  }
}

/**
 * Render template with variables
 */
function renderTemplate(template: string, variables: Record<string, unknown>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), String(value ?? ""));
  }
  return result;
}

/**
 * Format duration for display
 */
function formatDuration(ms: number): string {
  const absMs = Math.abs(ms);
  const hours = Math.floor(absMs / (1000 * 60 * 60));
  const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""}`;
  }

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${minutes > 1 ? "s" : ""}`;
  }

  return `${minutes} minute${minutes > 1 ? "s" : ""}`;
}

/**
 * Default notification preferences
 */
function getDefaultPreferences(tenantId: string, userId: string): NotificationPreferences {
  return {
    userId,
    tenantId,
    enabled: true,
    enabledChannels: ["email", "in_app"],
    typePreferences: {
      task_assigned: { enabled: true, channels: ["email", "in_app"] },
      task_reminder: { enabled: true, channels: ["email"] },
      task_escalated: { enabled: true, channels: ["email", "in_app"] },
      sla_warning: { enabled: true, channels: ["email", "in_app"] },
      sla_breached: { enabled: true, channels: ["email", "in_app"] },
      approval_complete: { enabled: true, channels: ["email"] },
      approval_rejected: { enabled: true, channels: ["email"] },
    },
  };
}

/**
 * Notification Service Implementation
 */
export class NotificationService implements INotificationService {
  private store: InMemoryNotificationStore;
  private senders: Map<NotificationChannel, INotificationSender> = new Map();

  constructor(senders?: INotificationSender[]) {
    this.store = new InMemoryNotificationStore();

    // Register provided senders
    if (senders) {
      for (const sender of senders) {
        this.senders.set(sender.channel, sender);
      }
    }
  }

  /**
   * Register a notification sender
   */
  registerSender(sender: INotificationSender): void {
    this.senders.set(sender.channel, sender);
  }

  /**
   * Send task assigned notification
   */
  async sendTaskAssigned(tenantId: string, task: ApprovalTask): Promise<void> {
    const recipient = await this.getRecipient(tenantId, task.assigneeId);
    const prefs = await this.getPreferences(tenantId, task.assigneeId);

    if (!prefs?.enabled || !prefs.typePreferences.task_assigned?.enabled) {
      return;
    }

    const variables: Record<string, unknown> = {
      entityType: task.entity.type,
      entityDisplayName: task.entity.displayName || task.entity.id,
      workflowName: task.workflow.templateName,
      stepName: task.workflow.stepName,
      requesterName: task.requester.displayName || task.requester.userId,
      dueDate: task.sla.dueAt.toISOString(),
      taskUrl: `/inbox/tasks/${task.id}`,
    };

    const channels = prefs.typePreferences.task_assigned?.channels || ["email", "in_app"];

    for (const channel of channels) {
      await this.sendNotification(
        tenantId,
        "task_assigned",
        channel,
        recipient,
        variables,
        task.id,
        task.instanceId,
        "normal"
      );
    }
  }

  /**
   * Send reminder notification
   */
  async sendReminder(
    tenantId: string,
    task: ApprovalTask,
    reminderNumber: number
  ): Promise<void> {
    const recipient = await this.getRecipient(tenantId, task.assigneeId);
    const prefs = await this.getPreferences(tenantId, task.assigneeId);

    if (!prefs?.enabled || !prefs.typePreferences.task_reminder?.enabled) {
      return;
    }

    const variables: Record<string, unknown> = {
      reminderNumber,
      entityType: task.entity.type,
      entityDisplayName: task.entity.displayName || task.entity.id,
      dueDate: task.sla.dueAt.toISOString(),
      timeRemaining: formatDuration(task.sla.timeRemainingMs),
    };

    const channels = prefs.typePreferences.task_reminder?.channels || ["email"];

    for (const channel of channels) {
      await this.sendNotification(
        tenantId,
        "task_reminder",
        channel,
        recipient,
        variables,
        task.id,
        task.instanceId,
        "normal"
      );
    }
  }

  /**
   * Send SLA warning notification
   */
  async sendSlaWarning(tenantId: string, task: ApprovalTask): Promise<void> {
    const recipient = await this.getRecipient(tenantId, task.assigneeId);
    const prefs = await this.getPreferences(tenantId, task.assigneeId);

    if (!prefs?.enabled || !prefs.typePreferences.sla_warning?.enabled) {
      return;
    }

    const variables: Record<string, unknown> = {
      entityType: task.entity.type,
      entityDisplayName: task.entity.displayName || task.entity.id,
      dueDate: task.sla.dueAt.toISOString(),
      timeRemaining: formatDuration(task.sla.timeRemainingMs),
    };

    const channels = prefs.typePreferences.sla_warning?.channels || ["email", "in_app"];

    for (const channel of channels) {
      await this.sendNotification(
        tenantId,
        "sla_warning",
        channel,
        recipient,
        variables,
        task.id,
        task.instanceId,
        "high"
      );
    }
  }

  /**
   * Send SLA breach notification
   */
  async sendSlaBreach(tenantId: string, task: ApprovalTask): Promise<void> {
    const recipient = await this.getRecipient(tenantId, task.assigneeId);
    const prefs = await this.getPreferences(tenantId, task.assigneeId);

    if (!prefs?.enabled || !prefs.typePreferences.sla_breached?.enabled) {
      return;
    }

    const variables: Record<string, unknown> = {
      entityType: task.entity.type,
      entityDisplayName: task.entity.displayName || task.entity.id,
      dueDate: task.sla.dueAt.toISOString(),
      overdueBy: formatDuration(Math.abs(task.sla.timeRemainingMs)),
    };

    const channels = prefs.typePreferences.sla_breached?.channels || ["email", "in_app"];

    for (const channel of channels) {
      await this.sendNotification(
        tenantId,
        "sla_breached",
        channel,
        recipient,
        variables,
        task.id,
        task.instanceId,
        "high"
      );
    }
  }

  /**
   * Send escalation notification
   */
  async sendEscalation(
    tenantId: string,
    task: ApprovalTask,
    escalatedTo: NotificationRecipient
  ): Promise<void> {
    const prefs = await this.getPreferences(tenantId, escalatedTo.userId);

    if (!prefs?.enabled || !prefs.typePreferences.task_escalated?.enabled) {
      return;
    }

    const variables: Record<string, unknown> = {
      entityType: task.entity.type,
      entityDisplayName: task.entity.displayName || task.entity.id,
      escalationReason: task.escalation?.reason || "SLA breach",
      originalAssignee: task.delegation?.originalAssigneeDisplayName || task.assigneeDisplayName,
      dueDate: task.sla.dueAt.toISOString(),
    };

    const channels = prefs.typePreferences.task_escalated?.channels || ["email", "in_app"];

    for (const channel of channels) {
      await this.sendNotification(
        tenantId,
        "task_escalated",
        channel,
        escalatedTo,
        variables,
        task.id,
        task.instanceId,
        "high"
      );
    }
  }

  /**
   * Send approval complete notification
   */
  async sendApprovalComplete(
    tenantId: string,
    instance: ApprovalInstance,
    outcome: "approved" | "rejected"
  ): Promise<void> {
    const recipient = await this.getRecipient(tenantId, instance.requester.userId);
    const prefs = await this.getPreferences(tenantId, instance.requester.userId);

    const notifType = outcome === "approved" ? "approval_complete" : "approval_rejected";

    if (!prefs?.enabled || !prefs.typePreferences[notifType]?.enabled) {
      return;
    }

    const variables: Record<string, unknown> = {
      entityType: instance.entity.type,
      entityDisplayName: instance.entity.displayName || instance.entity.id,
      outcome: outcome === "approved" ? "Approved" : "Rejected",
      completedAt: new Date().toISOString(),
    };

    const channels = prefs.typePreferences[notifType]?.channels || ["email"];

    for (const channel of channels) {
      await this.sendNotification(
        tenantId,
        notifType,
        channel,
        recipient,
        variables,
        undefined,
        instance.id,
        "normal"
      );
    }
  }

  /**
   * Send bulk reminders
   */
  async sendBulkReminders(tenantId: string, tasks: ApprovalTask[]): Promise<void> {
    for (const task of tasks) {
      await this.sendReminder(tenantId, task, 1);
    }
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(
    tenantId: string,
    userId: string,
    options?: {
      unreadOnly?: boolean;
      type?: NotificationType;
      limit?: number;
      offset?: number;
    }
  ): Promise<NotificationRecord[]> {
    return this.store.getNotifications(tenantId, userId, options);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(tenantId: string, notificationId: string): Promise<void> {
    this.store.markAsRead(tenantId, notificationId);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(tenantId: string, userId: string): Promise<void> {
    this.store.markAllAsRead(tenantId, userId);
  }

  /**
   * Get notification preferences
   */
  async getPreferences(
    tenantId: string,
    userId: string
  ): Promise<NotificationPreferences | undefined> {
    const stored = this.store.getPreferences(tenantId, userId);
    return stored || getDefaultPreferences(tenantId, userId);
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    tenantId: string,
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const existing = await this.getPreferences(tenantId, userId);
    const updated: NotificationPreferences = {
      ...existing!,
      ...preferences,
      userId,
      tenantId,
    };
    this.store.setPreferences(tenantId, userId, updated);
    return updated;
  }

  /**
   * Get notification template
   */
  async getTemplate(
    tenantId: string,
    type: NotificationType,
    channel: NotificationChannel,
    locale?: string
  ): Promise<NotificationTemplate | undefined> {
    return this.store.getTemplate(type, channel, locale || "en");
  }

  /**
   * Helper: Get recipient info
   */
  private async getRecipient(
    tenantId: string,
    userId: string
  ): Promise<NotificationRecipient> {
    // In a real implementation, this would fetch from user service
    return {
      userId,
      email: `${userId}@example.com`, // Placeholder
    };
  }

  /**
   * Helper: Send notification through channel
   */
  private async sendNotification(
    tenantId: string,
    type: NotificationType,
    channel: NotificationChannel,
    recipient: NotificationRecipient,
    variables: Record<string, unknown>,
    taskId?: string,
    instanceId?: string,
    priority: NotificationPriority = "normal"
  ): Promise<void> {
    const template = await this.getTemplate(tenantId, type, channel);

    const body = template ? renderTemplate(template.body, variables) : JSON.stringify(variables);
    const subject = template?.subject
      ? renderTemplate(template.subject, variables)
      : undefined;
    const htmlBody = template?.htmlBody
      ? renderTemplate(template.htmlBody, variables)
      : undefined;

    const notification: NotificationRecord = {
      id: generateId(),
      tenantId,
      type,
      channel,
      priority,
      status: "pending",
      recipientId: recipient.userId,
      recipientAddress: channel === "email" ? recipient.email : undefined,
      taskId,
      instanceId,
      subject,
      body,
      htmlBody,
      templateCode: template?.code,
      variables,
      attempts: 0,
      createdAt: new Date(),
    };

    // Store the notification
    this.store.addNotification(tenantId, notification);

    // Try to send through the appropriate sender
    const sender = this.senders.get(channel);
    if (sender) {
      try {
        const result = await sender.send(notification, recipient);
        notification.status = result.success ? "sent" : "failed";
        notification.sentAt = result.success ? new Date() : undefined;
        notification.lastError = result.error;
        notification.attempts = 1;
      } catch (error) {
        notification.status = "failed";
        notification.lastError = String(error);
        notification.attempts = 1;
      }
    } else {
      // No sender registered, mark as pending (for in_app, this is expected)
      if (channel === "in_app") {
        notification.status = "delivered";
        notification.deliveredAt = new Date();
      }
    }
  }
}

/**
 * Console notification sender (for development/testing)
 */
export class ConsoleNotificationSender implements INotificationSender {
  channel: NotificationChannel = "email";

  async send(
    notification: NotificationRecord,
    recipient: NotificationRecipient
  ): Promise<{ success: boolean; error?: string }> {
    console.log("=== Notification ===");
    console.log(`To: ${recipient.email || recipient.userId}`);
    console.log(`Subject: ${notification.subject}`);
    console.log(`Body: ${notification.body}`);
    console.log("==================");

    return { success: true };
  }
}

/**
 * Factory function to create notification service
 */
export function createNotificationService(
  senders?: INotificationSender[]
): INotificationService {
  return new NotificationService(senders);
}
