import db from "../db.server";

export const AnalyticsService = {
    /**
     * Insert a single analytics event row
     */
    async trackEvent(shop, type) {
        if (type !== "verified" && type !== "unverified") return null;
        return await db.analyticsEvent.create({
            data: { shop, type },
        });
    },

    /**
     * Get aggregated stats for a shop within a date range.
     * Returns { verified, unverified, total }.
     * Defaults to the last 7 days if no dates provided.
     */
    async getStats(shop, startDate, endDate) {
        const end = endDate ? new Date(endDate) : new Date();
        // When endDate is a plain date string (YYYY-MM-DD), push to end of that day
        if (endDate && !endDate.includes("T")) {
            end.setHours(23, 59, 59, 999);
        }

        const start = startDate
            ? new Date(startDate)
            : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Use raw SQL to avoid any Prisma client cache issues with groupBy
        const rows = await db.$queryRaw`
      SELECT type, COUNT(*) as count
      FROM AnalyticsEvent
      WHERE shop = ${shop}
        AND createdAt >= ${start}
        AND createdAt <= ${end}
      GROUP BY type
    `;

        const result = { verified: 0, unverified: 0, total: 0 };
        for (const row of rows) {
            // SQLite returns BigInt for COUNT — coerce to Number
            const count = Number(row.count);
            if (row.type === "verified") result.verified = count;
            if (row.type === "unverified") result.unverified = count;
            result.total += count;
        }
        return result;
    },
};
