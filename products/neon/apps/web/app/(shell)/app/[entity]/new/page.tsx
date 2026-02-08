import { StubPage } from "@/components/stubs/StubPage";

export default function CreateRecordPage() {
    return <StubPage epic={5} title="Create Record" description="Create a new entity record." route="/app/:entity/new" />;
}
