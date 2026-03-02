"use client";

import { createContext, useContext, useState } from "react";

export type Period = 7 | 14 | 30;

interface PeriodContextValue {
    period: Period;
    setPeriod: (p: Period) => void;
}

const PeriodContext = createContext<PeriodContextValue>({
    period: 30,
    setPeriod: () => { },
});

export function PeriodProvider({ children }: { children: React.ReactNode }) {
    const [period, setPeriod] = useState<Period>(30);
    return (
        <PeriodContext.Provider value={{ period, setPeriod }}>
            {children}
        </PeriodContext.Provider>
    );
}

export function usePeriod() {
    return useContext(PeriodContext);
}
