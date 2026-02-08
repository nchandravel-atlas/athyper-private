import { StubPage } from "@/components/stubs/StubPage";

export default function EventsPage() {
    return <StubPage epic={6} title="Events" description="View event history for this record." route="/app/:entity/:id/events" />;
}
