"use client";

import { useState, useEffect } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

/**
 * Returns the current viewport breakpoint.
 * - mobile: < 768px
 * - tablet: 768px – 1024px
 * - desktop: > 1024px
 *
 * SSR-safe: defaults to "desktop" on the server.
 */
export function useBreakpoint(): Breakpoint {
    const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

    useEffect(() => {
        const mqMobile = window.matchMedia("(max-width: 767px)");
        const mqTablet = window.matchMedia("(min-width: 768px) and (max-width: 1024px)");

        function update() {
            if (mqMobile.matches) setBreakpoint("mobile");
            else if (mqTablet.matches) setBreakpoint("tablet");
            else setBreakpoint("desktop");
        }

        update();

        mqMobile.addEventListener("change", update);
        mqTablet.addEventListener("change", update);

        return () => {
            mqMobile.removeEventListener("change", update);
            mqTablet.removeEventListener("change", update);
        };
    }, []);

    return breakpoint;
}
