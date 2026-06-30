import db from "../db.server";
import dayjs from "dayjs";

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
        const end = endDate ? dayjs(endDate).endOf("day").toDate() : new Date();
        const start = startDate
            ? dayjs(startDate).startOf("day").toDate()
            : dayjs(end).subtract(7, "day").startOf("day").toDate();

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
