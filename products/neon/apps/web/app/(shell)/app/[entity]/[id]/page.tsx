import { StubPage } from "@/components/stubs/StubPage";

export default function RecordDetailPage() {
    return <StubPage epic={5} title="Record Detail" description="View entity record details." route="/app/:entity/:id" />;
}
