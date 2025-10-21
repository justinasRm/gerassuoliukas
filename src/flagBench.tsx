export interface flaggedBench {
    benchId: number;
    reason: string;
    flagged_by: number; // user id
    flaggedAt: string;
    is_resolved: boolean;
}

export type flagReason = "damaged" | "dirty" | "broken" | "other";

let flagged_benches: flaggedBench[] = [];

const FLAG_REASONS: flagReason[] = ["damaged", "dirty", "broken", "other"];

export const flagBench = (benchId: number, userId: number, reason: flagReason, additionalNote: string = ""): string => {

    if (!FLAG_REASONS.includes(reason)) {
        return "Invalid flag reason!";
    }

    const newFlag: flaggedBench = {
        benchId,
        reason,
        flagged_by: userId,
        flaggedAt: new Date().toISOString(),
        is_resolved: false,
    };

    flagged_benches.push(newFlag);

    if (additionalNote) {
        console.log(`Additional note: ${additionalNote}`);
    }

    return `Bench ${benchId} flagged for ${reason} by user ${userId}`;
};

export const resolveFlag = (benchId: number, userId: number): string => {
    const flag = flagged_benches.find((f) => f.benchId === benchId && !f.is_resolved);

    if (!flag) {
        return `No active flag found for bench ${benchId}.`;
    }

    flag.is_resolved = true;
    return `Flag for bench ${benchId} resolved by user ${userId}.`;
};

export const getFlaggedBenches = (): flaggedBench[] => {
    return flagged_benches.filter((flag) => !flag.is_resolved);
};

export const getFlaggedCountForBench = (benchId: number): number => {
    return flagged_benches.filter((flag) => flag.benchId === benchId && !flag.is_resolved).length;
};

export const displayFlaggedBenchesReport = (): string => {
    const unresolvedFlags = getFlaggedBenches();
    const report = unresolvedFlags.map((flag) => {
        return `Bench ID: ${flag.benchId}, Reason: ${flag.reason}, Flagged By: User ${flag.flagged_by}, Date: ${flag.flaggedAt}`;
    }).join("\n");

    return unresolvedFlags.length === 0
        ? "No benches are currently flagged."
        : `Currently flagged benches:\n${report}`;
};
