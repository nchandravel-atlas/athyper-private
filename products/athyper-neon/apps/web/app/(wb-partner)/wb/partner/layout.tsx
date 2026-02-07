import { cookies } from "next/headers";
import { getIntl } from "@athyper/i18n";
import { AppSidebar } from "../../../../components/sidebar/AppSidebar";
import { MessagesProvider } from "../../../../lib/i18n/messages-context";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const locale = cookieStore.get("neon_locale")?.value ?? "en";
    const intl = await getIntl(locale as any);
    const messages = intl.messages as Record<string, string>;

    return (
        <div className="flex h-screen">
            <AppSidebar workbench="partner" locale={locale} messages={messages} />
            <MessagesProvider messages={messages} locale={locale}>
                <main className="flex-1 overflow-auto">{children}</main>
            </MessagesProvider>
        </div>
    );
}
