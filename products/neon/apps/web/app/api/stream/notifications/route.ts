/**
 * GET /api/stream/notifications
 *
 * Server-Sent Events (SSE) endpoint for real-time notification updates.
 * Streams events: notification.new, notification.read, notification.dismissed
 */

import { getApiContext } from "@/lib/api-context";
import { notificationEvents, type NotificationEvent } from "@/lib/realtime/notification-events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
    const { context, redis } = await getApiContext();

    try {
        // Require authentication
        if (!context) {
            await redis.quit();
            return new Response("Unauthorized", { status: 401 });
        }

        const { tenantId, userId } = context;

        // Create SSE stream
        const stream = new ReadableStream({
            start(controller) {
                // Send initial connection message
                const encoder = new TextEncoder();
                const send = (data: string) => {
                    controller.enqueue(encoder.encode(data));
                };

                // Send comment to establish connection
                send(`: connected\n\n`);

                // Send initial heartbeat
                send(`event: heartbeat\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);

                // Subscribe to notification events
                const unsubscribe = notificationEvents.subscribeUser(
                    tenantId,
                    userId,
                    (event: NotificationEvent) => {
                        // Send event to client
                        send(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
                    }
                );

                // Send heartbeat every 30 seconds to keep connection alive
                const heartbeatInterval = setInterval(() => {
                    try {
                        send(`event: heartbeat\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
                    } catch (err) {
                        // Connection closed, clean up
                        clearInterval(heartbeatInterval);
                        unsubscribe();
                    }
                }, 30000);

                // Clean up on close
                const cleanup = () => {
                    clearInterval(heartbeatInterval);
                    unsubscribe();
                    redis.quit().catch(() => {
                        // Ignore errors during cleanup
                    });
                };

                // Handle client disconnect
                controller.enqueue = new Proxy(controller.enqueue, {
                    apply(target, thisArg, args) {
                        try {
                            return Reflect.apply(target, thisArg, args);
                        } catch (err) {
                            cleanup();
                            throw err;
                        }
                    },
                });
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no", // Disable nginx buffering
            },
        });
    } catch (err) {
        console.error("[SSE /api/stream/notifications] Error:", err);
        await redis.quit();
        return new Response("Internal Server Error", { status: 500 });
    }
}
