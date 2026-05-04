import { OrderStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http-error";

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */

const PAID_STATUSES = [OrderStatus.PAID, OrderStatus.COMPLETED] as const;

type PeriodPreset = "7d" | "30d" | "90d" | "365d" | "custom";

type RevenueQuery = {
  period?: unknown;
  startDate?: unknown;
  endDate?: unknown;
};

type CustomerQuery = {
  segment?: unknown;
  page?: unknown;
  limit?: unknown;
};

const toDate = (value: unknown, fallback: Date): Date => {
  if (!value || typeof value !== "string") return fallback;
  const d = new Date(value);
  return isNaN(d.getTime()) ? fallback : d;
};

const getDateRange = (query: RevenueQuery) => {
  const now = new Date();
  const period = (query.period as PeriodPreset) ?? "30d";

  if (period === "custom") {
    const end = toDate(query.endDate, now);
    const start = toDate(
      query.startDate,
      new Date(end.getTime() - 30 * 86_400_000)
    );
    return { start, end, daysCount: Math.ceil((end.getTime() - start.getTime()) / 86_400_000) };
  }

  const daysMap: Record<string, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "365d": 365
  };
  const days = daysMap[period] ?? 30;
  return {
    start: new Date(now.getTime() - days * 86_400_000),
    end: now,
    daysCount: days
  };
};

const toDec = (v: Prisma.Decimal | null) =>
  (v ?? new Prisma.Decimal(0)).toFixed(2);

/* ──────────────────────────────────────────────
   RFM helpers
   ────────────────────────────────────────────── */

type RFMRaw = {
  userId: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  lastOrderDate: Date;
  frequency: number;
  monetary: Prisma.Decimal;
};

const RFM_SEGMENTS: Record<
  string,
  { label: string; rRange: number[]; fRange: number[]; mRange: number[] }
> = {
  Champions: { label: "Champions", rRange: [5], fRange: [4, 5], mRange: [4, 5] },
  Loyal: { label: "Loyal Customers", rRange: [3, 4], fRange: [4, 5], mRange: [4, 5] },
  PotentialLoyalist: { label: "Potential Loyalists", rRange: [4, 5], fRange: [2, 3], mRange: [2, 3] },
  NewCustomers: { label: "New Customers", rRange: [5], fRange: [1], mRange: [1] },
  AtRisk: { label: "At Risk", rRange: [2, 3], fRange: [2, 3], mRange: [2, 3] },
  Hibernating: { label: "Hibernating", rRange: [1, 2], fRange: [1, 2], mRange: [1, 2] },
  Lost: { label: "Lost", rRange: [1], fRange: [1], mRange: [1] }
};

function getQuintile(values: number[], value: number): number {
  if (values.length === 0) return 3;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = sorted.findIndex((v) => v >= value);
  if (idx === -1) return 5;
  return Math.min(5, Math.max(1, Math.ceil(((idx + 1) / sorted.length) * 5)));
}

function getRecencyQuintile(values: number[], value: number): number {
  // Lower recency (more recent) = higher score
  if (values.length === 0) return 3;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = sorted.findIndex((v) => v >= value);
  if (idx === -1) return 1;
  return Math.min(5, Math.max(1, 6 - Math.ceil(((idx + 1) / sorted.length) * 5)));
}

function assignSegment(r: number, f: number, m: number): string {
  for (const [key, def] of Object.entries(RFM_SEGMENTS)) {
    if (def.rRange.includes(r) && def.fRange.includes(f) && def.mRange.includes(m)) {
      return key;
    }
  }

  // Fallback logic based on composite score
  const total = r + f + m;
  if (total >= 13) return "Champions";
  if (total >= 10) return "Loyal";
  if (total >= 8) return "PotentialLoyalist";
  if (r >= 4) return "NewCustomers";
  if (total >= 6) return "AtRisk";
  if (total >= 4) return "Hibernating";
  return "Lost";
}

/* ──────────────────────────────────────────────
   Service
   ────────────────────────────────────────────── */

export const analyticsService = {
  // ─── Revenue & Growth ──────────────────────
  async getRevenueAnalytics(query: RevenueQuery) {
    const { start, end, daysCount } = getDateRange(query);

    // Previous period for comparison
    const prevStart = new Date(start.getTime() - daysCount * 86_400_000);
    const prevEnd = start;

    const paidWhere = {
      status: { in: PAID_STATUSES as unknown as OrderStatus[] },
      createdAt: { gte: start, lte: end }
    };

    const prevPaidWhere = {
      status: { in: PAID_STATUSES as unknown as OrderStatus[] },
      createdAt: { gte: prevStart, lte: prevEnd }
    };

    const [
      currentAgg,
      previousAgg,
      currentCount,
      previousCount,
      allOrdersInRange,
      categoryBreakdown,
      statusDist
    ] = await Promise.all([
      // Current period revenue
      prisma.order.aggregate({
        where: paidWhere,
        _sum: { totalAmount: true }
      }),

      // Previous period revenue
      prisma.order.aggregate({
        where: prevPaidWhere,
        _sum: { totalAmount: true }
      }),

      // Current order count
      prisma.order.count({ where: paidWhere }),

      // Previous order count
      prisma.order.count({ where: prevPaidWhere }),

      // All paid orders in range for trend
      prisma.order.findMany({
        where: paidWhere,
        select: { totalAmount: true, createdAt: true }
      }),

      // Revenue by category
      prisma.orderItem.findMany({
        where: {
          order: paidWhere
        },
        select: {
          quantity: true,
          unitPrice: true,
          product: {
            select: {
              categoryId: true,
              category: { select: { name: true } },
              brand: true
            }
          }
        }
      }),

      // Order status distribution (all statuses in date range)
      prisma.order.groupBy({
        by: ["status"],
        where: { createdAt: { gte: start, lte: end } },
        _count: { id: true }
      })
    ]);

    // Summary
    const currentRevenue = currentAgg._sum.totalAmount ?? new Prisma.Decimal(0);
    const previousRevenue = previousAgg._sum.totalAmount ?? new Prisma.Decimal(0);
    const growthRate = previousRevenue.isZero()
      ? 100
      : currentRevenue
          .sub(previousRevenue)
          .div(previousRevenue)
          .mul(100)
          .toNumber();
    const orderGrowthRate = previousCount === 0
      ? 100
      : ((currentCount - previousCount) / previousCount) * 100;
    const aov = currentCount > 0
      ? currentRevenue.div(currentCount).toFixed(2)
      : "0.00";

    // Revenue trend (group by day)
    const trendMap = new Map<string, { revenue: Prisma.Decimal; orders: number }>();
    for (const order of allOrdersInRange) {
      const day = order.createdAt.toISOString().slice(0, 10);
      const existing = trendMap.get(day) ?? {
        revenue: new Prisma.Decimal(0),
        orders: 0
      };
      existing.revenue = existing.revenue.plus(order.totalAmount);
      existing.orders += 1;
      trendMap.set(day, existing);
    }

    // Fill missing days
    const revenueTrend: Array<{ date: string; revenue: string; orders: number }> = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const day = cursor.toISOString().slice(0, 10);
      const entry = trendMap.get(day);
      revenueTrend.push({
        date: day,
        revenue: entry ? entry.revenue.toFixed(2) : "0.00",
        orders: entry?.orders ?? 0
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    // Revenue by category
    const catMap = new Map<string, { name: string; revenue: Prisma.Decimal }>();
    const brandMap = new Map<string, { revenue: Prisma.Decimal; count: number }>();

    for (const item of categoryBreakdown) {
      const lineTotal = new Prisma.Decimal(item.unitPrice).mul(item.quantity);

      const catId = item.product.categoryId;
      const catEntry = catMap.get(catId) ?? {
        name: item.product.category.name,
        revenue: new Prisma.Decimal(0)
      };
      catEntry.revenue = catEntry.revenue.plus(lineTotal);
      catMap.set(catId, catEntry);

      const brand = item.product.brand ?? "Không rõ";
      const brandEntry = brandMap.get(brand) ?? {
        revenue: new Prisma.Decimal(0),
        count: 0
      };
      brandEntry.revenue = brandEntry.revenue.plus(lineTotal);
      brandEntry.count += 1;
      brandMap.set(brand, brandEntry);
    }

    const totalCatRevenue = [...catMap.values()].reduce(
      (sum, c) => sum.plus(c.revenue),
      new Prisma.Decimal(0)
    );

    const revenueByCategory = [...catMap.entries()]
      .map(([categoryId, entry]) => ({
        categoryId,
        categoryName: entry.name,
        revenue: entry.revenue.toFixed(2),
        percentage: totalCatRevenue.isZero()
          ? 0
          : entry.revenue.div(totalCatRevenue).mul(100).toNumber()
      }))
      .sort((a, b) => Number(b.revenue) - Number(a.revenue));

    const revenueByBrand = [...brandMap.entries()]
      .map(([brand, entry]) => ({
        brand,
        revenue: entry.revenue.toFixed(2),
        orderCount: entry.count
      }))
      .sort((a, b) => Number(b.revenue) - Number(a.revenue))
      .slice(0, 10);

    const orderStatusDistribution = statusDist.map((s) => ({
      status: s.status,
      count: s._count.id
    }));

    return {
      summary: {
        currentRevenue: toDec(currentRevenue),
        previousRevenue: toDec(previousRevenue),
        growthRate: Math.round(growthRate * 100) / 100,
        totalOrders: currentCount,
        previousOrders: previousCount,
        orderGrowthRate: Math.round(orderGrowthRate * 100) / 100,
        averageOrderValue: aov
      },
      revenueTrend,
      revenueByCategory,
      revenueByBrand,
      orderStatusDistribution
    };
  },

  // ─── Customer Segmentation (RFM) ──────────
  async getCustomerSegmentation(query: CustomerQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const segmentFilter = typeof query.segment === "string" && query.segment ? query.segment : undefined;

    // Get all customers with their order stats
    const customers = await prisma.user.findMany({
      where: { role: Role.CUSTOMER },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        orders: {
          where: {
            status: { in: PAID_STATUSES as unknown as OrderStatus[] }
          },
          select: {
            totalAmount: true,
            createdAt: true
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    const now = new Date();

    // Calculate raw RFM values
    const rfmRaws = customers
      .filter((c) => c.orders.length > 0)
      .map((c) => {
        const lastOrder = c.orders[0];
        const recencyDays = Math.ceil(
          (now.getTime() - lastOrder.createdAt.getTime()) / 86_400_000
        );
        const frequency = c.orders.length;
        const monetary = c.orders.reduce(
          (sum, o) => sum.plus(o.totalAmount),
          new Prisma.Decimal(0)
        );

        return {
          userId: c.id,
          email: c.email,
          fullName: c.fullName,
          phone: c.phone,
          recencyDays,
          frequency,
          monetary,
          lastOrderDate: lastOrder.createdAt
        };
      });

    // Customers with no orders
    const noOrderCustomers = customers
      .filter((c) => c.orders.length === 0)
      .map((c) => ({
        userId: c.id,
        email: c.email,
        fullName: c.fullName,
        phone: c.phone,
        recencyDays: 9999,
        frequency: 0,
        monetary: new Prisma.Decimal(0),
        lastOrderDate: null as Date | null,
        rScore: 1,
        fScore: 1,
        mScore: 1,
        segment: "Lost" as string
      }));

    // Calculate quintiles
    const allRecency = rfmRaws.map((r) => r.recencyDays);
    const allFrequency = rfmRaws.map((r) => r.frequency);
    const allMonetary = rfmRaws.map((r) => r.monetary.toNumber());

    const scoredCustomers = rfmRaws.map((raw) => {
      const rScore = getRecencyQuintile(allRecency, raw.recencyDays);
      const fScore = getQuintile(allFrequency, raw.frequency);
      const mScore = getQuintile(allMonetary, raw.monetary.toNumber());
      const segment = assignSegment(rScore, fScore, mScore);

      return {
        ...raw,
        monetary: raw.monetary,
        rScore,
        fScore,
        mScore,
        segment
      };
    });

    // Merge with no-order customers
    const allCustomerScored = [...scoredCustomers, ...noOrderCustomers];

    // Segment summary
    const segmentCounts = new Map<string, { count: number; revenue: Prisma.Decimal }>();
    for (const c of allCustomerScored) {
      const entry = segmentCounts.get(c.segment) ?? {
        count: 0,
        revenue: new Prisma.Decimal(0)
      };
      entry.count += 1;
      entry.revenue = entry.revenue.plus(c.monetary);
      segmentCounts.set(c.segment, entry);
    }

    const totalCustomers = allCustomerScored.length;
    const segmentSummary = Object.keys(RFM_SEGMENTS).map((key) => {
      const entry = segmentCounts.get(key) ?? {
        count: 0,
        revenue: new Prisma.Decimal(0)
      };
      return {
        segment: key,
        label: RFM_SEGMENTS[key].label,
        count: entry.count,
        percentage:
          totalCustomers > 0
            ? Math.round((entry.count / totalCustomers) * 10000) / 100
            : 0,
        totalRevenue: entry.revenue.toFixed(2),
        avgOrderValue:
          entry.count > 0
            ? entry.revenue.div(entry.count).toFixed(2)
            : "0.00"
      };
    });

    // Filter + paginate customers
    let filtered = allCustomerScored;
    if (segmentFilter) {
      filtered = filtered.filter((c) => c.segment === segmentFilter);
    }

    // Sort by monetary desc
    filtered.sort((a, b) => b.monetary.toNumber() - a.monetary.toNumber());

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const pageData = filtered.slice(skip, skip + limit).map((c) => ({
      id: c.userId,
      email: c.email,
      fullName: c.fullName,
      phone: c.phone,
      recencyDays: c.recencyDays,
      frequency: c.frequency,
      monetary: c.monetary.toFixed(2),
      rScore: c.rScore,
      fScore: c.fScore,
      mScore: c.mScore,
      segment: c.segment,
      lastOrderDate: c.lastOrderDate?.toISOString() ?? null
    }));

    return {
      segmentSummary,
      customers: {
        data: pageData,
        meta: { page, limit, total, totalPages }
      }
    };
  },

  // ─── Marketing Performance ─────────────────
  async getMarketingAnalytics() {
    // Because we don't have a Marketing table, we simulate based on real sales
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);

    const totalRevenue = await prisma.order.aggregate({
      where: {
        status: { in: PAID_STATUSES as unknown as OrderStatus[] },
        createdAt: { gte: thirtyDaysAgo }
      },
      _sum: { totalAmount: true }
    });

    const revenue = Number(totalRevenue._sum.totalAmount || 0);
    
    // Simulations
    const spend = revenue * 0.15; // Assume 15% spend
    const clicks = Math.floor(spend / 1500); // 1500 VND per click
    const conversions = Math.floor(clicks * 0.025); // 2.5% CR
    const cac = spend / Math.max(conversions, 1);
    const roas = revenue / Math.max(spend, 1);

    const channels = [
      { channel: "Facebook Ads", spend: spend * 0.5, revenue: revenue * 0.48, conversions: Math.floor(conversions * 0.5) },
      { channel: "Google Search", spend: spend * 0.3, revenue: revenue * 0.32, conversions: Math.floor(conversions * 0.3) },
      { channel: "TikTok Ads", spend: spend * 0.2, revenue: revenue * 0.2, conversions: Math.floor(conversions * 0.2) },
    ];

    return {
      summary: {
        spend: spend.toFixed(0),
        clicks,
        conversions,
        conversionRate: 2.5,
        cac: cac.toFixed(0),
        roas: roas.toFixed(2),
        revenue: revenue.toFixed(0)
      },
      channels
    };
  },

  // ─── Inventory Analytics ───────────────────
  async getInventoryAnalytics() {
    const [lowStock, allProducts, topSelling] = await Promise.all([
      // Products with low stock (< 10)
      prisma.product.findMany({
        where: { stock: { lt: 10 }, isActive: true },
        include: { category: true },
        orderBy: { stock: "asc" },
        take: 10
      }),
      // Stock distribution summary
      prisma.product.findMany({
        select: { stock: true }
      }),
      // Top selling products (last 30 days) for velocity
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: {
            status: { in: PAID_STATUSES as unknown as OrderStatus[] },
            createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) }
          }
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10
      })
    ]);

    const outOfStockCount = allProducts.filter(p => p.stock === 0).length;
    const lowStockCount = allProducts.filter(p => p.stock > 0 && p.stock < 10).length;
    const healthyStockCount = allProducts.filter(p => p.stock >= 10).length;

    // Get product details for top selling
    const topSellingIds = topSelling.map(s => s.productId);
    const topSellingDetails = await prisma.product.findMany({
      where: { id: { in: topSellingIds } },
      select: { id: true, name: true, stock: true }
    });

    const restockSuggestions = topSelling.map(s => {
      const details = topSellingDetails.find(d => d.id === s.productId);
      const soldLast30d = s._sum.quantity || 0;
      // Simple suggestion: if stock < 1.5 * last month sales, suggest restocking
      const suggestedAmount = Math.max(0, Math.ceil(soldLast30d * 1.5 - (details?.stock || 0)));
      
      return {
        id: s.productId,
        name: details?.name || "Unknown",
        currentStock: details?.stock || 0,
        soldLast30d,
        suggestedAmount,
        urgency: suggestedAmount > (details?.stock || 0) * 2 ? "HIGH" : "MEDIUM"
      };
    }).filter(s => s.suggestedAmount > 0);

    return {
      summary: {
        totalProducts: allProducts.length,
        outOfStockCount,
        lowStockCount,
        healthyStockCount
      },
      lowStockItems: lowStock.map(p => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        category: p.category.name,
        status: p.stock === 0 ? "OUT_OF_STOCK" : "LOW_STOCK"
      })),
      restockSuggestions: restockSuggestions.slice(0, 5)
    };
  }
};
