"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";

export const MAX_CONCURRENT_POLLS = 6;

interface DashboardRefreshContextValue {
    refreshKey: number;
    refreshAll: () => void;
    registerPoll: () => boolean;
    unregisterPoll: () => void;
    activePollCount: number;
}

const DashboardRefreshContext = createContext<DashboardRefreshContextValue>({
    refreshKey: 0,
    refreshAll: () => {},
    registerPoll: () => true,
    unregisterPoll: () => {},
    activePollCount: 0,
});

export function DashboardRefreshProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [refreshKey, setRefreshKey] = useState(0);
    const pollCountRef = useRef(0);
    const [activePollCount, setActivePollCount] = useState(0);

    const refreshAll = useCallback(() => setRefreshKey((k) => k + 1), []);

    const registerPoll = useCallback((): boolean => {
        if (pollCountRef.current >= MAX_CONCURRENT_POLLS) return false;
        pollCountRef.current++;
        setActivePollCount(pollCountRef.current);
        return true;
    }, []);

    const unregisterPoll = useCallback(() => {
        pollCountRef.current = Math.max(0, pollCountRef.current - 1);
        setActivePollCount(pollCountRef.current);
    }, []);

    return (
        <DashboardRefreshContext.Provider
            value={{ refreshKey, refreshAll, registerPoll, unregisterPoll, activePollCount }}
        >
            {children}
        </DashboardRefreshContext.Provider>
    );
}

export function useDashboardRefresh() {
    return useContext(DashboardRefreshContext);
}
