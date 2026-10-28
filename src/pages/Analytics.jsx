import axios from "axios";
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    Boxes,
    CalendarDays,
    Download,
    LoaderCircle,
    PackageCheck,
    RefreshCw,
    ShoppingBag,
    UsersRound,
    WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const API_URL = "https://fakestoreapi.com";

const periods = [
    { value: "7", label: "Last 7 days", days: 7 },
    { value: "30", label: "Last 30 days", days: 30 },
    { value: "90", label: "Last 90 days", days: 90 },
    { value: "all", label: "All time", days: null },
];

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

const compactCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
});

const numberFormat = new Intl.NumberFormat("en-US");
const chartColors = ["#6366f1", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981"];

function getDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getBucket(date, period) {
    const bucket = new Date(date);
    if (period === "all") {
        bucket.setDate(1);
        return {
            key: `${bucket.getFullYear()}-${String(bucket.getMonth() + 1).padStart(2, "0")}`,
            label: new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(bucket),
        };
    }

    if (period === "90") {
        const dayOfWeek = (bucket.getDay() + 6) % 7;
        bucket.setDate(bucket.getDate() - dayOfWeek);
        return {
            key: getDateKey(bucket),
            label: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(bucket),
        };
    }

    return {
        key: getDateKey(bucket),
        label: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(bucket),
    };
}

function getOrderMetrics(orders) {
    return orders.reduce(
        (metrics, order) => ({
            revenue: metrics.revenue + order.total,
            orders: metrics.orders + 1,
            items: metrics.items + order.itemCount,
        }),
        { revenue: 0, orders: 0, items: 0 },
    );
}

function SummaryCard({ icon: Icon, label, value, detail, change, tone }) {
    const positive = change?.value > 0;
    const negative = change?.value < 0;

    return (
        <article className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.3)] sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}>
                    <Icon size={19} aria-hidden="true" />
                </div>
                {change && (
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
                            positive
                                ? "bg-emerald-50 text-emerald-700"
                                : negative
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-slate-100 text-slate-500"
                        }`}
                    >
                        {positive ? (
                            <ArrowUpRight size={13} aria-hidden="true" />
                        ) : negative ? (
                            <ArrowDownRight size={13} aria-hidden="true" />
                        ) : null}
                        {change.label}
                    </span>
                )}
            </div>
            <p className="mt-4 truncate text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-900">{value}</p>
            <p className="mt-1 truncate text-[11px] text-slate-400">{detail}</p>
        </article>
    );
}

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-lg">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
                {currency.format(payload[0].value)}
            </p>
        </div>
    );
}

function getChange(current, previous) {
    if (previous === 0) {
        return current > 0 ? { label: "New", value: 1 } : { label: "0%", value: 0 };
    }

    const value = ((current - previous) / previous) * 100;
    return {
        label: `${value > 0 ? "+" : ""}${Math.round(value)}%`,
        value,
    };
}

function downloadCsv(orders) {
    const rows = [
        ["Order ID", "Date", "Customer ID", "Items", "Revenue (USD)"],
        ...orders.map((order) => [
            order.id,
            new Date(order.date).toISOString().slice(0, 10),
            order.userId,
            order.itemCount,
            order.total.toFixed(2),
        ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "velo-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
}

export default function Analytics() {
    const [orders, setOrders] = useState([]);
    const [period, setPeriod] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function fetchAnalyticsData() {
            setLoading(true);
            setError("");

            try {
                const [ordersResponse, productsResponse] = await Promise.all([
                    axios.get(`${API_URL}/carts`),
                    axios.get(`${API_URL}/products`),
                ]);

                if (!Array.isArray(ordersResponse.data) || !Array.isArray(productsResponse.data)) {
                    throw new Error("The analytics API returned an unexpected response.");
                }

                const productsById = new Map(
                    productsResponse.data.map((product) => [Number(product.id), product]),
                );
                const mappedOrders = ordersResponse.data.map((order) => {
                    const items = (Array.isArray(order.products) ? order.products : [])
                        .filter((item) => item && Number.isFinite(Number(item.productId)))
                        .map((item) => {
                            const product = productsById.get(Number(item.productId));
                            const quantity = Math.max(0, Number(item.quantity) || 0);
                            const price = Math.max(0, Number(product?.price) || 0);

                            return {
                                quantity,
                                price,
                                title: product?.title || `Product ${item.productId}`,
                                category: product?.category || "Uncategorized",
                            };
                        });
                    const date = new Date(order.date);

                    return {
                        id: order.id,
                        userId: order.userId,
                        date,
                        items,
                        itemCount: items.reduce((count, item) => count + item.quantity, 0),
                        total: items.reduce((total, item) => total + item.price * item.quantity, 0),
                    };
                }).filter((order) => Number.isFinite(order.date.getTime()));

                if (!cancelled) setOrders(mappedOrders);
            } catch (fetchError) {
                console.error("Failed to load analytics:", fetchError);
                if (!cancelled) {
                    setError(
                        fetchError.response?.data?.message
                        || fetchError.message
                        || "Unable to load analytics. Please try again.",
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchAnalyticsData();
        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const analytics = useMemo(() => {
        if (orders.length === 0) {
            return {
                filteredOrders: [],
                chartData: [],
                categories: [],
                topProducts: [],
                metrics: getOrderMetrics([]),
                previousMetrics: null,
                customers: 0,
            };
        }

        const latestDate = new Date(Math.max(...orders.map((order) => order.date.getTime())));
        const selectedPeriod = periods.find((item) => item.value === period);
        const startDate = selectedPeriod.days === null
            ? null
            : new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate() - selectedPeriod.days + 1);
        const endDate = new Date(latestDate);
        endDate.setHours(23, 59, 59, 999);
        const filteredOrders = orders.filter((order) => (
            (!startDate || order.date >= startDate) && order.date <= endDate
        ));

        let previousOrders = [];
        if (startDate) {
            const previousStart = new Date(startDate);
            previousStart.setDate(previousStart.getDate() - selectedPeriod.days);
            const previousEnd = new Date(startDate.getTime() - 1);
            previousOrders = orders.filter((order) => (
                order.date >= previousStart && order.date <= previousEnd
            ));
        }

        const chartBuckets = new Map();
        const categoryTotals = new Map();
        const productTotals = new Map();

        filteredOrders.forEach((order) => {
            const bucket = getBucket(order.date, period);
            const currentBucket = chartBuckets.get(bucket.key) || {
                key: bucket.key,
                label: bucket.label,
                revenue: 0,
            };
            currentBucket.revenue += order.total;
            chartBuckets.set(bucket.key, currentBucket);

            order.items.forEach((item) => {
                const revenue = item.price * item.quantity;
                const category = categoryTotals.get(item.category) || { name: item.category, revenue: 0 };
                category.revenue += revenue;
                categoryTotals.set(item.category, category);

                const product = productTotals.get(item.title) || {
                    name: item.title,
                    category: item.category,
                    quantity: 0,
                    revenue: 0,
                };
                product.quantity += item.quantity;
                product.revenue += revenue;
                productTotals.set(item.title, product);
            });
        });

        return {
            filteredOrders,
            chartData: [...chartBuckets.values()].sort((first, second) => first.key.localeCompare(second.key)),
            categories: [...categoryTotals.values()].sort((first, second) => second.revenue - first.revenue),
            topProducts: [...productTotals.values()].sort((first, second) => second.revenue - first.revenue).slice(0, 5),
            metrics: getOrderMetrics(filteredOrders),
            previousMetrics: startDate ? getOrderMetrics(previousOrders) : null,
            customers: new Set(filteredOrders.map((order) => order.userId).filter(Boolean)).size,
        };
    }, [orders, period]);

    const averageOrder = analytics.metrics.orders
        ? analytics.metrics.revenue / analytics.metrics.orders
        : 0;
    const previousAverage = analytics.previousMetrics?.orders
        ? analytics.previousMetrics.revenue / analytics.previousMetrics.orders
        : 0;
    const periodLabel = periods.find((item) => item.value === period)?.label;
    const latestOrderDate = orders.length
        ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })
            .format(new Date(Math.max(...orders.map((order) => order.date.getTime()))))
        : "";

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
            <header className="relative isolate overflow-hidden rounded-[1.75rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-indigo-950/10 sm:px-9 sm:py-8">
                <div className="pointer-events-none absolute -right-10 -top-28 -z-10 size-80 rounded-full border-[42px] border-indigo-400/10" />
                <div className="pointer-events-none absolute -bottom-28 right-40 -z-10 size-56 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                    <div className="max-w-2xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium tracking-wide text-indigo-100">
                            <Activity size={14} aria-hidden="true" />
                            Store performance
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Analytics</h2>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                            Track revenue, orders, and product performance across your store.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <label className="relative">
                            <CalendarDays
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                size={16}
                                aria-hidden="true"
                            />
                            <span className="sr-only">Analytics date range</span>
                            <select
                                className="h-10 w-full appearance-none rounded-xl border border-white/15 bg-white/10 pl-9 pr-9 text-sm font-medium text-white outline-none transition hover:bg-white/15 focus:ring-4 focus:ring-indigo-400/20 sm:w-44 [&>option]:text-slate-900"
                                onChange={(event) => setPeriod(event.target.value)}
                                value={period}
                            >
                                {periods.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </label>
                        <button
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 text-sm font-medium text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={loading || analytics.filteredOrders.length === 0}
                            onClick={() => downloadCsv(analytics.filteredOrders)}
                            type="button"
                        >
                            <Download size={16} aria-hidden="true" />
                            Export CSV
                        </button>
                        <button
                            aria-label="Refresh analytics"
                            className="grid size-10 place-items-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={loading}
                            onClick={() => setReloadKey((key) => key + 1)}
                            type="button"
                        >
                            <RefreshCw className={loading ? "animate-spin" : ""} size={16} aria-hidden="true" />
                        </button>
                    </div>
                </div>
                {!loading && !error && (
                    <p className="mt-5 text-xs text-slate-400">
                        {period === "all"
                            ? `${analytics.filteredOrders.length} orders in sample dataset`
                            : `${periodLabel} ending ${latestOrderDate} · relative to latest order in sample data`}
                    </p>
                )}
            </header>

            {error ? (
                <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5" role="alert">
                    <p className="text-sm font-semibold text-rose-800">Analytics could not be loaded</p>
                    <p className="mt-1 text-sm text-rose-700">{error}</p>
                    <button
                        className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-rose-700 px-3 text-sm font-medium text-white transition hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
                        onClick={() => setReloadKey((key) => key + 1)}
                        type="button"
                    >
                        <RefreshCw size={15} aria-hidden="true" />
                        Try again
                    </button>
                </section>
            ) : (
                <>
                    <section aria-label="Analytics summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard
                            icon={WalletCards}
                            label="Gross revenue"
                            value={loading ? "—" : currency.format(analytics.metrics.revenue)}
                            detail={period === "all" ? "Across all sample orders" : "In selected period"}
                            change={analytics.previousMetrics && getChange(
                                analytics.metrics.revenue,
                                analytics.previousMetrics.revenue,
                            )}
                            tone="bg-indigo-50 text-indigo-600"
                        />
                        <SummaryCard
                            icon={PackageCheck}
                            label="Orders"
                            value={loading ? "—" : numberFormat.format(analytics.metrics.orders)}
                            detail={period === "all" ? "Orders in sample dataset" : "In selected period"}
                            change={analytics.previousMetrics && getChange(
                                analytics.metrics.orders,
                                analytics.previousMetrics.orders,
                            )}
                            tone="bg-emerald-50 text-emerald-600"
                        />
                        <SummaryCard
                            icon={ShoppingBag}
                            label="Average order value"
                            value={loading ? "—" : currency.format(averageOrder)}
                            detail="Revenue per order"
                            change={analytics.previousMetrics && getChange(averageOrder, previousAverage)}
                            tone="bg-amber-50 text-amber-600"
                        />
                        <SummaryCard
                            icon={UsersRound}
                            label="Unique customers"
                            value={loading ? "—" : numberFormat.format(analytics.customers)}
                            detail={`${numberFormat.format(analytics.metrics.items)} items sold`}
                            tone="bg-violet-50 text-violet-600"
                        />
                    </section>

                    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.85fr)]">
                        <article className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.3)] sm:p-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-base font-semibold tracking-tight text-slate-900">Revenue over time</h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {period === "all" ? "Monthly revenue" : period === "90" ? "Weekly revenue" : "Daily revenue"}
                                    </p>
                                </div>
                                <span className="rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700">
                                    {loading ? "—" : currency.format(analytics.metrics.revenue)}
                                </span>
                            </div>
                            <div className="mt-5 h-64 min-w-0 sm:h-72">
                                {loading ? (
                                    <div className="grid h-full place-items-center text-sm text-slate-400">
                                        <LoaderCircle className="animate-spin" size={22} aria-label="Loading chart" />
                                    </div>
                                ) : analytics.chartData.length ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={analytics.chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.24} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid stroke="#eef2f7" strokeDasharray="3 5" vertical={false} />
                                            <XAxis
                                                axisLine={false}
                                                dataKey="label"
                                                tick={{ fill: "#94a3b8", fontSize: 11 }}
                                                tickLine={false}
                                                tickMargin={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tick={{ fill: "#94a3b8", fontSize: 11 }}
                                                tickFormatter={(value) => compactCurrency.format(value)}
                                                tickLine={false}
                                                tickMargin={8}
                                                width={58}
                                            />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Area
                                                activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
                                                dataKey="revenue"
                                                fill="url(#revenueFill)"
                                                name="Revenue"
                                                stroke="#6366f1"
                                                strokeWidth={2.5}
                                                type="monotone"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="grid h-full place-items-center rounded-xl bg-slate-50 text-sm text-slate-500">
                                        No revenue data for this period.
                                    </div>
                                )}
                            </div>
                        </article>

                        <article className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.3)] sm:p-6">
                            <div>
                                <h3 className="text-base font-semibold tracking-tight text-slate-900">Revenue by category</h3>
                                <p className="mt-1 text-xs text-slate-500">Sales mix in the selected period</p>
                            </div>
                            <div className="mt-5 h-64 min-w-0">
                                {loading ? (
                                    <div className="grid h-full place-items-center text-sm text-slate-400">
                                        <LoaderCircle className="animate-spin" size={22} aria-label="Loading chart" />
                                    </div>
                                ) : analytics.categories.length ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={analytics.categories.slice(0, 5)}
                                            layout="vertical"
                                            margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
                                        >
                                            <CartesianGrid stroke="#eef2f7" strokeDasharray="3 5" horizontal={false} />
                                            <XAxis
                                                axisLine={false}
                                                tick={{ fill: "#94a3b8", fontSize: 10 }}
                                                tickFormatter={(value) => compactCurrency.format(value)}
                                                tickLine={false}
                                                type="number"
                                            />
                                            <YAxis
                                                axisLine={false}
                                                dataKey="name"
                                                tick={{ fill: "#64748b", fontSize: 11 }}
                                                tickLine={false}
                                                type="category"
                                                width={96}
                                            />
                                            <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
                                            <Bar dataKey="revenue" name="Revenue" radius={[0, 6, 6, 0]} barSize={22}>
                                                {analytics.categories.slice(0, 5).map((category, index) => (
                                                    <Cell key={category.name} fill={chartColors[index % chartColors.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="grid h-full place-items-center rounded-xl bg-slate-50 text-sm text-slate-500">
                                        No category data for this period.
                                    </div>
                                )}
                            </div>
                        </article>
                    </section>

                    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
                        <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.3)]">
                            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                                <div>
                                    <h3 className="text-base font-semibold tracking-tight text-slate-900">Top products</h3>
                                    <p className="mt-1 text-xs text-slate-500">Ranked by revenue</p>
                                </div>
                                <Boxes className="text-slate-400" size={18} aria-hidden="true" />
                            </div>
                            {loading ? (
                                <div className="flex h-40 items-center justify-center text-slate-400">
                                    <LoaderCircle className="animate-spin" size={22} aria-label="Loading products" />
                                </div>
                            ) : analytics.topProducts.length ? (
                                <div className="divide-y divide-slate-100">
                                    {analytics.topProducts.map((product, index) => (
                                        <div className="flex items-center gap-3 px-5 py-3.5 sm:px-6" key={product.name}>
                                            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-50 text-xs font-semibold text-slate-500">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-slate-800">{product.name}</p>
                                                <p className="mt-0.5 truncate text-xs text-slate-400">
                                                    {product.category} · {numberFormat.format(product.quantity)} sold
                                                </p>
                                            </div>
                                            <p className="shrink-0 text-sm font-semibold text-slate-900">
                                                {currency.format(product.revenue)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="px-6 py-10 text-center text-sm text-slate-500">No product sales for this period.</p>
                            )}
                        </article>

                        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.3)] sm:p-6">
                            <div className="flex items-start gap-3">
                                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <Activity size={19} aria-hidden="true" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold tracking-tight text-slate-900">Performance snapshot</h3>
                                    <p className="mt-1 text-xs text-slate-500">{periodLabel}</p>
                                </div>
                            </div>
                            <dl className="mt-5 divide-y divide-slate-100">
                                <div className="flex items-center justify-between gap-3 py-3">
                                    <dt className="text-sm text-slate-500">Items per order</dt>
                                    <dd className="text-sm font-semibold text-slate-900">
                                        {analytics.metrics.orders
                                            ? (analytics.metrics.items / analytics.metrics.orders).toFixed(1)
                                            : "0.0"}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-3 py-3">
                                    <dt className="text-sm text-slate-500">Active categories</dt>
                                    <dd className="text-sm font-semibold text-slate-900">
                                        {numberFormat.format(analytics.categories.length)}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-3 py-3">
                                    <dt className="text-sm text-slate-500">Top category</dt>
                                    <dd className="max-w-[55%] truncate text-right text-sm font-semibold text-slate-900">
                                        {analytics.categories[0]?.name || "—"}
                                    </dd>
                                </div>
                            </dl>
                            <p className="mt-4 rounded-xl bg-slate-50 px-3.5 py-3 text-xs leading-5 text-slate-500">
                                Revenue uses current catalog prices and sample order quantities. Date ranges are anchored to the latest sample order ({latestOrderDate || "—"}).
                            </p>
                        </article>
                    </section>
                </>
            )}
        </div>
    );
}
