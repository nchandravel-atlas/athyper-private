// app/api/messaging/analytics/route.ts
//
// Messaging analytics endpoint.
// Returns aggregated messaging statistics for the dashboard.
// Uses mock data for development; in production this would query
// the messaging repos (ConversationRepo, MessageRepo, MessageDeliveryRepo).

import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Generate realistic mock data based on date range
// ---------------------------------------------------------------------------

function generateDailyMessages(days: number): Array<{ date: string; sent: number; read: number }> {
    const result: Array<{ date: string; sent: number; read: number }> = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Realistic daily pattern: weekdays busier than weekends
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const baseSent = isWeekend ? 15 : 45;
        const variance = Math.floor(Math.random() * 20) - 10;
        const sent = Math.max(5, baseSent + variance);
        const read = Math.floor(sent * (0.7 + Math.random() * 0.25));

        result.push({
            date: date.toISOString().split("T")[0],
            sent,
            read,
        });
    }

    return result;
}

function generateRecentActivity(): Array<{
    id: string;
    conversationTitle: string;
    senderName: string;
    preview: string;
    timestamp: string;
    type: "message" | "conversation_created" | "participant_joined";
}> {
    const now = new Date();
    return [
        {
            id: "act-1",
            conversationTitle: "Q1 Budget Review",
            senderName: "Sarah Chen",
            preview: "Updated the forecast spreadsheet with latest numbers",
            timestamp: new Date(now.getTime() - 5 * 60_000).toISOString(),
            type: "message",
        },
        {
            id: "act-2",
            conversationTitle: "Invoice Processing",
            senderName: "Mike Rodriguez",
            preview: "PI-003 has been approved. Ready for payment.",
            timestamp: new Date(now.getTime() - 18 * 60_000).toISOString(),
            type: "message",
        },
        {
            id: "act-3",
            conversationTitle: "Vendor Onboarding",
            senderName: "System",
            preview: "New conversation created",
            timestamp: new Date(now.getTime() - 45 * 60_000).toISOString(),
            type: "conversation_created",
        },
        {
            id: "act-4",
            conversationTitle: "Account Reconciliation",
            senderName: "Lisa Park",
            preview: "Found a discrepancy in ACC-003, investigating",
            timestamp: new Date(now.getTime() - 2 * 3600_000).toISOString(),
            type: "message",
        },
        {
            id: "act-5",
            conversationTitle: "Q1 Budget Review",
            senderName: "James Wilson",
            preview: "James Wilson joined the conversation",
            timestamp: new Date(now.getTime() - 3 * 3600_000).toISOString(),
            type: "participant_joined",
        },
        {
            id: "act-6",
            conversationTitle: "Supplier Negotiations",
            senderName: "Anna Kowalski",
            preview: "NorthStar agreed to revised payment terms",
            timestamp: new Date(now.getTime() - 5 * 3600_000).toISOString(),
            type: "message",
        },
    ];
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
    const rangeParam = req.nextUrl.searchParams.get("range") ?? "30d";

    const days = rangeParam === "7d" ? 7 : rangeParam === "90d" ? 90 : 30;

    const messagesByDay = generateDailyMessages(days);
    const totalMessages = messagesByDay.reduce((sum, d) => sum + d.sent, 0);
    const totalRead = messagesByDay.reduce((sum, d) => sum + d.read, 0);

    const analytics = {
        totalConversations: 24,
        directConversations: 16,
        groupConversations: 8,
        totalMessages,
        activeUsers: 12,
        unreadMessages: 7,
        deliveryRate: 0.98,
        readRate: totalMessages > 0 ? Math.round((totalRead / totalMessages) * 100) / 100 : 0,
        messagesByDay,
        recentActivity: generateRecentActivity(),
    };

    return NextResponse.json({ data: analytics });
}
