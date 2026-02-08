import { StubPage } from "@/components/stubs/StubPage";

export default function EntityFieldsPage() {
    return <StubPage epic={7} title="Entity Fields" description="Manage field definitions, types, and validation rules." route="/wb/admin/meta/entities/:entity/fields" />;
}
