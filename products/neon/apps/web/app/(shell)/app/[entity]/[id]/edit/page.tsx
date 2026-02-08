import { StubPage } from "@/components/stubs/StubPage";

export default function EditRecordPage() {
    return <StubPage epic={5} title="Edit Record" description="Edit entity record fields and properties." route="/app/:entity/:id/edit" />;
}
