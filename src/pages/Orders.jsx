import axios from "axios";
import { Select } from "@base-ui/react/select";
import {
    CalendarDays,
    Check,
    ChevronDown,
    ChevronUp,
    CircleAlert,
    LoaderCircle,
    PackageCheck,
    Search,
    SlidersHorizontal,
    ShoppingBag,
    UsersRound,
    WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const API_URL = "https://fakestoreapi.com";

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

const sortOptions = [
    { value: "newest", label: "Newest first", icon: CalendarDays },
    { value: "oldest", label: "Oldest first", icon: CalendarDays },
    { value: "total-desc", label: "Highest total", icon: WalletCards },
    { value: "total-asc", label: "Lowest total", icon: WalletCards },
];

function getCustomerName(user) {
    const name = [user?.name?.firstname, user?.name?.lastname]
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

    return name || user?.username || `Customer ${user?.id ?? ""}`.trim();
}

function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date unavailable" : dateFormatter.format(date);
}

function getOrderDate(order) {
    const date = new Date(order.date);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function SummaryCard({ icon: Icon, label, value, detail, tone }) {
    return (
        <article className="flex min-w-0 items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.3)] sm:p-5">
            <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone}`}>
                <Icon size={20} aria-hidden="true" />
            </div>
            <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-1 truncate text-xl font-bold tracking-tight text-slate-900">{value}</p>
                <p className="mt-0.5 truncate text-[11px] text-slate-400">{detail}</p>
            </div>
        </article>
    );
}

function OrderItems({ items }) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
                <div
                    className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3"
                    key={`${item.productId}-${index}`}
                >
                    {item.image ? (
                        <img
                            alt=""
                            className="size-12 shrink-0 rounded-lg bg-white object-contain p-1 ring-1 ring-slate-100"
                            loading="lazy"
                            src={item.image}
                        />
                    ) : (
                        <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-400">
                            <ShoppingBag size={18} aria-hidden="true" />
                        </span>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium leading-5 text-slate-800">
                            {item.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Qty {item.quantity} <span aria-hidden="true">·</span>{" "}
                            {currency.format(item.price)} each
                        </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-800">
                        {currency.format(item.price * item.quantity)}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function fetchOrders() {
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
                    throw new Error("The orders API returned an unexpected response.");
                }

                const usersById = new Map(usersResponse.data.map((user) => [user.id, user]));
                const productsById = new Map(productsResponse.data.map((product) => [product.id, product]));
                const mappedOrders = ordersResponse.data.map((order) => {
                    const items = (Array.isArray(order.products) ? order.products : [])
                        .filter((item) => item && Number.isFinite(Number(item.productId)))
                        .map((item) => {
                            const product = productsById.get(Number(item.productId));
                            const quantity = Math.max(0, Number(item.quantity) || 0);
                            const price = Math.max(0, Number(product?.price) || 0);

                            return {
                                productId: Number(item.productId),
                                quantity,
                                price,
                                title: product?.title || `Product ${item.productId}`,
                                image: product?.image || "",
                            };
                        });

                    return {
                        ...order,
                        customer: usersById.get(order.userId),
                        items,
                        itemCount: items.reduce((count, item) => count + item.quantity, 0),
                        total: items.reduce((total, item) => total + item.price * item.quantity, 0),
                    };
                });

                if (!cancelled) setOrders(mappedOrders);
            } catch (fetchError) {
                console.error("Failed to fetch orders:", fetchError);
                if (!cancelled) {
                    setError(
                        fetchError.response?.data?.message
                        || fetchError.message
                        || "Unable to load orders. Please try again.",
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchOrders();
        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const visibleOrders = useMemo(() => {
        const query = search.trim().toLowerCase();
        const matchingOrders = orders.filter((order) => {
            const searchableText = [
                order.id,
                getCustomerName(order.customer),
                order.customer?.email,
                ...order.items.map((item) => item.title),
            ].join(" ").toLowerCase();
            return searchableText.includes(query);
        });

        return matchingOrders.sort((first, second) => {
            if (sortOrder === "oldest") return getOrderDate(first) - getOrderDate(second);
            if (sortOrder === "total-desc") return second.total - first.total;
            if (sortOrder === "total-asc") return first.total - second.total;
            return getOrderDate(second) - getOrderDate(first);
        });
    }, [orders, search, sortOrder]);

    const totalItems = orders.reduce((count, order) => count + order.itemCount, 0);
    const totalRevenue = orders.reduce((total, order) => total + order.total, 0);

    return (
        <div className="mx-auto w-full max-w-7xl space-y-7 pb-10">
            <header className="relative isolate overflow-hidden rounded-[1.75rem] bg-slate-950 px-6 py-8 text-white shadow-xl shadow-indigo-950/10 sm:px-9 sm:py-10">
                <div className="pointer-events-none absolute -right-10 -top-28 -z-10 size-80 rounded-full border-[42px] border-indigo-400/10" />
                <div className="pointer-events-none absolute -bottom-28 right-40 -z-10 size-56 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                    <div className="max-w-2xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium tracking-wide text-indigo-100">
                            <PackageCheck size={14} aria-hidden="true" />
                            Order management
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Orders</h2>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                            Review sample orders, customer details, and the items in each order.
                        </p>
                    </div>
                </div>
            </header>

            <section aria-label="Order summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <SummaryCard
                    icon={PackageCheck}
                    label="Total orders"
                    value={loading ? "—" : orders.length.toLocaleString("en-US")}
                    detail="Orders in the sample dataset"
                    tone="bg-indigo-50 text-indigo-600"
                />
                <SummaryCard
                    icon={WalletCards}
                    label="Order value"
                    value={loading ? "—" : currency.format(totalRevenue)}
                    detail="Calculated from current product prices"
                    tone="bg-emerald-50 text-emerald-600"
                />
                <SummaryCard
                    icon={ShoppingBag}
                    label="Items ordered"
                    value={loading ? "—" : totalItems.toLocaleString("en-US")}
                    detail="Total units across all orders"
                    tone="bg-amber-50 text-amber-600"
                />
            </section>

            <section aria-labelledby="orders-list-heading" className="min-w-0">
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h3 id="orders-list-heading" className="text-lg font-semibold tracking-tight text-slate-900">
                            All orders
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {loading ? "Loading orders..." : `${visibleOrders.length} of ${orders.length} orders`}
                        </p>
                    </div>
                    <div className="flex min-w-0 flex-col gap-2 sm:w-auto sm:flex-row">
                        <label className="relative block min-w-0 sm:w-64">
                            <Search
                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                size={17}
                                aria-hidden="true"
                            />
                            <span className="sr-only">Search orders</span>
                            <input
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search orders..."
                                type="search"
                                value={search}
                            />
                        </label>
                        <Select.Root
                            items={sortOptions}
                            onValueChange={setSortOrder}
                            value={sortOrder}
                        >
                            <Select.Trigger
                                aria-label="Sort orders"
                                className="group flex h-11 w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 text-left text-sm text-slate-700 shadow-sm outline-none transition hover:border-indigo-200 hover:bg-indigo-50/40 focus-visible:border-indigo-400 focus-visible:ring-4 focus-visible:ring-indigo-100 data-[popup-open]:border-indigo-300 data-[popup-open]:bg-indigo-50/60 sm:w-48"
                            >
                                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600 transition group-hover:bg-white">
                                    <SlidersHorizontal size={15} aria-hidden="true" />
                                </span>
                                <Select.Value className="min-w-0 flex-1 truncate font-medium" />
                                <ChevronDown
                                    className="shrink-0 text-slate-400 transition-transform duration-200 group-data-[popup-open]:rotate-180"
                                    size={16}
                                    aria-hidden="true"
                                />
                            </Select.Trigger>
                            <Select.Portal>
                                <Select.Positioner
                                    alignItemWithTrigger={false}
                                    className="z-50 outline-none"
                                    sideOffset={8}
                                >
                                    <Select.Popup className="max-h-[min(60dvh,var(--available-height))] w-[var(--anchor-width)] max-w-[calc(100vw-2rem)] min-w-0 origin-[var(--transform-origin)] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.28)] outline-none transition duration-150 data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0">
                                        <div className="px-3 pb-2.5 pt-2">
                                            <p className="text-xs font-semibold tracking-wide text-slate-800">Sort orders</p>
                                            <p className="mt-0.5 text-[11px] text-slate-400">Choose how orders are arranged</p>
                                        </div>
                                        <div className="h-px bg-slate-100" />
                                        <Select.List className="mt-1 space-y-0.5">
                                            {sortOptions.map((option) => {
                                                const OptionIcon = option.icon;
                                                return (
                                                    <Select.Item
                                                        key={option.value}
                                                        className="group/item flex cursor-default items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-slate-600 outline-none transition data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-900 data-[selected]:bg-indigo-50/70 data-[selected]:text-indigo-900"
                                                        label={option.label}
                                                        value={option.value}
                                                    >
                                                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500 transition group-data-[highlighted]/item:bg-white group-data-[highlighted]/item:text-indigo-600 group-data-[selected]/item:bg-white group-data-[selected]/item:text-indigo-600">
                                                            <OptionIcon size={17} aria-hidden="true" />
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <Select.ItemText className="block font-medium">
                                                                {option.label}
                                                            </Select.ItemText>
                                                            <span className="mt-0.5 block text-xs text-slate-400 group-data-[highlighted]/item:text-indigo-500/80">
                                                                {option.detail}
                                                            </span>
                                                        </span>
                                                        <Select.ItemIndicator className="grid size-5 shrink-0 place-items-center rounded-full bg-indigo-600 text-white">
                                                            <Check size={12} strokeWidth={3} aria-hidden="true" />
                                                        </Select.ItemIndicator>
                                                    </Select.Item>
                                                );
                                            })}
                                        </Select.List>
                                    </Select.Popup>
                                </Select.Positioner>
                            </Select.Portal>
                        </Select.Root>
                    </div>
                </div>

                {loading ? (
                    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500">
                        <LoaderCircle className="animate-spin text-indigo-600" size={28} aria-hidden="true" />
                        <p className="mt-3 text-sm font-medium">Loading orders</p>
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
                        <CircleAlert className="mx-auto text-rose-600" size={28} aria-hidden="true" />
                        <p className="mt-3 text-sm font-semibold text-rose-900">Could not load orders</p>
                        <p className="mt-1 text-sm text-rose-700">{error}</p>
                        <button
                            className="mt-5 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100"
                            onClick={() => setReloadKey((key) => key + 1)}
                            type="button"
                        >
                            Try again
                        </button>
                    </div>
                ) : visibleOrders.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                            <Search size={21} aria-hidden="true" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-slate-800">
                            {orders.length ? "No matching orders" : "No orders available"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            {orders.length ? "Try another order number, customer, or product." : "There are no orders in the sample dataset."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.3)]">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                        <th className="px-5 py-3.5" scope="col">Order</th>
                                        <th className="px-5 py-3.5" scope="col">Customer</th>
                                        <th className="px-5 py-3.5" scope="col">Date</th>
                                        <th className="px-5 py-3.5" scope="col">Items</th>
                                        <th className="px-5 py-3.5 text-right" scope="col">Total</th>
                                        <th className="px-5 py-3.5 text-right" scope="col">Details</th>
                                    </tr>
                                </thead>
                                {visibleOrders.map((order) => {
                                    const isExpanded = expandedOrder === order.id;
                                    const customerName = getCustomerName(order.customer);

                                    return (
                                        <tbody className="border-b border-slate-100 last:border-0" key={order.id}>
                                            <tr className="transition hover:bg-slate-50/70">
                                                <th className="px-5 py-4 text-sm font-semibold text-slate-800" scope="row">
                                                    <span className="inline-flex items-center gap-2">
                                                        <span className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                                                            <PackageCheck size={16} aria-hidden="true" />
                                                        </span>
                                                        <span>#{order.id}</span>
                                                    </span>
                                                </th>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600">
                                                            <UsersRound size={15} aria-hidden="true" />
                                                        </span>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-medium text-slate-800">{customerName}</p>
                                                            <p className="truncate text-xs text-slate-400">
                                                                {order.customer?.email || "No email provided"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    <span className="inline-flex items-center gap-2">
                                                        <CalendarDays size={15} className="text-slate-400" aria-hidden="true" />
                                                        {formatDate(order.date)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                                                </td>
                                                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                                                    {currency.format(order.total)}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        aria-expanded={isExpanded}
                                                        aria-label={`${isExpanded ? "Hide" : "View"} items for order ${order.id}`}
                                                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
                                                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                                        type="button"
                                                    >
                                                        {isExpanded ? "Hide" : "View"}
                                                        {isExpanded
                                                            ? <ChevronUp size={14} aria-hidden="true" />
                                                            : <ChevronDown size={14} aria-hidden="true" />}
                                                    </button>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr>
                                                    <td className="bg-slate-50/70 px-5 py-4" colSpan={6}>
                                                        {order.items.length ? (
                                                            <OrderItems items={order.items} />
                                                        ) : (
                                                            <p className="text-sm text-slate-500">This order has no item details.</p>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    );
                                })}
                            </table>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
