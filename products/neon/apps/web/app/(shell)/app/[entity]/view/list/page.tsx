import { StubPage } from "@/components/stubs/StubPage";

export default function ListViewPage() {
    return <StubPage epic={5} title="List View" description="Browse entity records in a tabular list format." route="/app/:entity/view/list" />;
}
