import axios from "axios";
import {
    Activity,
    ArrowUpRight,
    CircleAlert,
    PackageCheck,
    Receipt,
    RefreshCw,
    UsersRound,
    WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const API_URL = "https://fakestoreapi.com";

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

const numberFormat = new Intl.NumberFormat("en-US");

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
});

function getCustomerName(user, userId) {
    const name = [user?.name?.firstname, user?.name?.lastname]
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

    return name || user?.username || `Customer #${userId}`;
}

function SummaryCard({ icon: Icon, label, value, detail, tone }) {
    return (
        <article className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.3)] sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}>
                    <Icon size={19} aria-hidden="true" />
                </div>
                <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                    All time
                </span>
            </div>
            <p className="mt-4 truncate text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-900">
                {value}
            </p>
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

function getRevenueTrend(orders) {
    if (orders.length === 0) return [];

    const latestOrderDate = new Date(
        Math.max(...orders.map((order) => order.date.getTime())),
    );
    const latestMonth = new Date(
        latestOrderDate.getFullYear(),
        latestOrderDate.getMonth(),
        1,
    );
    const monthlyRevenue = new Map();

    orders.forEach((order) => {
        const key = `${order.date.getFullYear()}-${order.date.getMonth()}`;
        monthlyRevenue.set(key, (monthlyRevenue.get(key) || 0) + order.total);
    });

    return Array.from({ length: 6 }, (_, index) => {
        const month = new Date(
            latestMonth.getFullYear(),
            latestMonth.getMonth() - (5 - index),
            1,
        );
        const key = `${month.getFullYear()}-${month.getMonth()}`;

        return {
            label: monthFormatter.format(month),
            revenue: monthlyRevenue.get(key) || 0,
        };
    });
}

function OrderSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            {Array.from({ length: 4 }, (_, index) => (
                <div className="flex items-center justify-between gap-4" key={index}>
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="size-9 shrink-0 rounded-xl bg-slate-100" />
                        <div className="space-y-2">
                            <div className="h-3 w-24 rounded bg-slate-100" />
                            <div className="h-3 w-32 rounded bg-slate-100" />
                        </div>
                    </div>
                    <div className="h-4 w-16 rounded bg-slate-100" />
                </div>
            ))}
        </div>
    );
}

export default function Home() {
    const [orders, setOrders] = useState([]);
    const [customerCount, setCustomerCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function fetchOverview() {
            setLoading(true);
            setError("");

            try {
                const [ordersResponse, usersResponse, productsResponse] = await Promise.all([
                    axios.get(`${API_URL}/carts`),
                    axios.get(`${API_URL}/users`),
                    axios.get(`${API_URL}/products`),
                ]);

                if (
                    !Array.isArray(ordersResponse.data)
                    || !Array.isArray(usersResponse.data)
                    || !Array.isArray(productsResponse.data)
                ) {
                    throw new Error("The overview API returned an unexpected response.");
                }

                const usersById = new Map(
                    usersResponse.data.map((user) => [Number(user.id), user]),
                );
                const productsById = new Map(
                    productsResponse.data.map((product) => [Number(product.id), product]),
                );
                const mappedOrders = ordersResponse.data
                    .map((order) => {
                        const items = (Array.isArray(order.products) ? order.products : [])
                            .filter((item) => item && Number.isFinite(Number(item.productId)))
                            .map((item) => {
                                const product = productsById.get(Number(item.productId));
                                const quantity = Math.max(0, Number(item.quantity) || 0);
                                const price = Math.max(0, Number(product?.price) || 0);

                                return { quantity, price };
                            });
                        const date = new Date(order.date);

                        return {
                            id: order.id,
                            userId: Number(order.userId),
                            customer: usersById.get(Number(order.userId)),
                            date,
                            items,
                            itemCount: items.reduce((count, item) => count + item.quantity, 0),
                            total: items.reduce(
                                (total, item) => total + item.price * item.quantity,
                                0,
                            ),
                        };
                    })
                    .filter((order) => Number.isFinite(order.date.getTime()))
                    .sort((first, second) => second.date.getTime() - first.date.getTime());

                if (!cancelled) {
                    setOrders(mappedOrders);
                    setCustomerCount(
                        new Set(mappedOrders.map((order) => order.userId).filter(Number.isFinite))
                            .size,
                    );
                }
            } catch (fetchError) {
                console.error("Failed to load overview:", fetchError);
                if (!cancelled) {
                    setOrders([]);
                    setCustomerCount(0);
                    setError(
                        fetchError.response?.data?.message
                        || fetchError.message
                        || "Unable to load overview. Please try again.",
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchOverview();
        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const metrics = useMemo(() => {
        const revenue = orders.reduce((total, order) => total + order.total, 0);

        return {
            revenue,
            orderCount: orders.length,
            averageOrder: orders.length ? revenue / orders.length : 0,
            trend: getRevenueTrend(orders),
        };
    }, [orders]);

    const recentOrders = orders.slice(0, 5);
    const today = dateFormatter.format(new Date());

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
            <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
                        <Activity size={14} aria-hidden="true" />
                        Store overview
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Welcome back
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-500">
                        A clear view of your store’s performance and latest orders.
                    </p>
                </div>
                <p className="text-sm font-medium text-slate-500">{today}</p>
            </header>

            {error && (
                <div
                    className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-rose-800 sm:flex-row sm:items-center sm:justify-between"
                    role="alert"
                >
                    <div className="flex items-start gap-2.5">
                        <CircleAlert className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                        <p className="text-sm">{error}</p>
                    </div>
                    <button
                        className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 text-sm font-semibold transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100"
                        onClick={() => setReloadKey((key) => key + 1)}
                        type="button"
                    >
                        <RefreshCw size={14} aria-hidden="true" />
                        Try again
                    </button>
                </div>
            )}

            <section aria-label="Store performance" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    icon={WalletCards}
                    label="Total revenue"
                    value={loading ? "—" : currency.format(metrics.revenue)}
                    detail="Calculated from current product prices"
                    tone="bg-emerald-50 text-emerald-600"
                />
                <SummaryCard
                    icon={PackageCheck}
                    label="Orders"
                    value={loading ? "—" : numberFormat.format(metrics.orderCount)}
                    detail="Across all available order history"
                    tone="bg-indigo-50 text-indigo-600"
                />
                <SummaryCard
                    icon={UsersRound}
                    label="Customers"
                    value={loading ? "—" : numberFormat.format(customerCount)}
                    detail="Customers with at least one order"
                    tone="bg-violet-50 text-violet-600"
                />
                <SummaryCard
                    icon={Receipt}
                    label="Average order value"
                    value={loading ? "—" : currency.format(metrics.averageOrder)}
                    detail="Based on all available orders"
                    tone="bg-amber-50 text-amber-600"
                />
            </section>

            <div className="grid min-w-0 gap-5 xl:grid-cols-5">
                <section
                    aria-labelledby="revenue-trend-heading"
                    className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.3)] sm:p-5 xl:col-span-3"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3
                                className="text-base font-semibold tracking-tight text-slate-900"
                                id="revenue-trend-heading"
                            >
                                Revenue trend
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Monthly order value · latest 6 months of available data
                            </p>
                        </div>
                        <Link
                            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            to="/analytics"
                        >
                            Analytics
                            <ArrowUpRight size={14} aria-hidden="true" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="mt-5 h-56 animate-pulse rounded-xl bg-slate-50" />
                    ) : metrics.trend.length > 0 ? (
                        <div
                            aria-label="Monthly revenue for the latest six months of available order history"
                            className="mt-5 h-56 w-full"
                            role="img"
                        >
                            <ResponsiveContainer height="100%" width="100%">
                                <AreaChart
                                    data={metrics.trend}
                                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="overviewRevenue" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        stroke="#e2e8f0"
                                        strokeDasharray="4 4"
                                        vertical={false}
                                    />
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
                                        tickFormatter={(value) => (
                                            value >= 1000
                                                ? `$${(value / 1000).toFixed(0)}k`
                                                : `$${value}`
                                        )}
                                        tickLine={false}
                                        tickMargin={8}
                                        width={48}
                                    />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Area
                                        activeDot={{ r: 5, strokeWidth: 0 }}
                                        dataKey="revenue"
                                        fill="url(#overviewRevenue)"
                                        fillOpacity={1}
                                        stroke="#6366f1"
                                        strokeWidth={2.5}
                                        type="monotone"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="mt-5 grid h-56 place-items-center rounded-xl bg-slate-50 px-6 text-center">
                            <p className="text-sm text-slate-500">
                                Revenue trends will appear when order history is available.
                            </p>
                        </div>
                    )}
                </section>

                <section
                    aria-labelledby="recent-orders-heading"
                    className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.3)] sm:p-5 xl:col-span-2"
                >
                    <div className="mb-5 flex items-start justify-between gap-3">
                        <div>
                            <h3
                                className="text-base font-semibold tracking-tight text-slate-900"
                                id="recent-orders-heading"
                            >
                                Recent orders
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                The latest activity in your store
                            </p>
                        </div>
                        <Link
                            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            to="/orders"
                        >
                            All orders
                            <ArrowUpRight size={14} aria-hidden="true" />
                        </Link>
                    </div>

                    {loading ? (
                        <OrderSkeleton />
                    ) : recentOrders.length > 0 ? (
                        <ul className="divide-y divide-slate-100">
                            {recentOrders.map((order) => (
                                <li
                                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                                    key={order.id}
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                                            <PackageCheck size={16} aria-hidden="true" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                {getCustomerName(order.customer, order.userId)}
                                            </p>
                                            <p className="mt-0.5 truncate text-xs text-slate-400">
                                                Order #{order.id} · {dateFormatter.format(order.date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-sm font-semibold text-slate-800">
                                            {currency.format(order.total)}
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-400">
                                            {numberFormat.format(order.itemCount)}{" "}
                                            {order.itemCount === 1 ? "item" : "items"}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="grid min-h-40 place-items-center rounded-xl bg-slate-50 px-6 text-center">
                            <p className="text-sm text-slate-500">
                                Your recent orders will appear here.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
