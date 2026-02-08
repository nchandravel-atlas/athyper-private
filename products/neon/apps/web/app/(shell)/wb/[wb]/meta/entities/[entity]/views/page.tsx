import { StubPage } from "@/components/stubs/StubPage";

export default function EntityViewsPage() {
    return <StubPage epic={7} title="Entity Views" description="Configure list, report, and dashboard views for this entity." route="/wb/admin/meta/entities/:entity/views" />;
}
