import axios from "axios";
import { Select } from "@base-ui/react/select";
import {
    ArrowDownAZ,
    ArrowUpAZ,
    Check,
    ChevronDown,
    Mail,
    MapPin,
    Phone,
    Search,
    SlidersHorizontal,
    UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const avatarColors = [
    "from-violet-500 to-indigo-500",
    "from-cyan-500 to-blue-500",
    "from-orange-400 to-rose-500",
    "from-emerald-500 to-teal-500",
    "from-fuchsia-500 to-purple-500",
];

const sortOptions = [
    { value: "name-asc", label: "Name A–Z", icon: ArrowUpAZ },
    { value: "name-desc", label: "Name Z–A",  icon: ArrowDownAZ }
];

function getFullName(user) {
    return [user.name?.firstname, user.name?.lastname]
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function getInitials(user) {
    const name = getFullName(user);
    return name
        ? name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("")
        : user.username?.slice(0, 2).toUpperCase() || "U";
}

function UserCard({ user, index }) {
    const fullName = getFullName(user);
    const city = user.address?.city;
    const addressLine = [user.address?.number, user.address?.street]
        .filter(Boolean)
        .join(" ");

    return (
        <article className="group relative overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-white shadow-[0_8px_30px_-20px_rgba(15,23,42,0.28)] transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_20px_40px_-24px_rgba(79,70,229,0.32)]">
            <div className="relative flex items-center justify-between overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/80 px-5 pb-5 pt-6">
                <div className="pointer-events-none absolute -right-7 -top-12 h-32 w-32 rounded-full border-[18px] border-indigo-100/45 transition-transform duration-500 group-hover:scale-125" />
                <div className="pointer-events-none absolute right-16 top-9 h-3 w-3 rounded-full bg-cyan-300/70" />
                <div className="relative flex min-w-0 items-center gap-3.5">
                    <div className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${avatarColors[index % avatarColors.length]} text-lg font-bold tracking-wide text-white shadow-lg shadow-indigo-200/60 ring-4 ring-white`}>
                        {getInitials(user)}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold tracking-tight text-slate-900">
                            {fullName || user.username || `User ${user.id}`}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                            @{user.username || "customer"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-3.5 px-5 pb-5 pt-4">
                <a
                    className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-1.5 text-sm text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    href={`mailto:${user.email}`}
                    title={user.email}
                >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600">
                        <Mail size={15} aria-hidden="true" />
                    </span>
                    <span className="truncate">{user.email || "No email provided"}</span>
                </a>
                <a
                    className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-1.5 text-sm text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    href={user.phone ? `tel:${user.phone}` : undefined}
                >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                        <Phone size={15} aria-hidden="true" />
                    </span>
                    <span className="truncate">{user.phone || "No phone provided"}</span>
                </a>
                <div className="flex min-w-0 items-center gap-3 border-t border-slate-100 pt-3.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-600">
                        <MapPin size={15} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-700">
                            {city || "Location not provided"}
                        </p>
                        {addressLine && (
                            <p className="mt-0.5 truncate text-xs text-slate-400">{addressLine}</p>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function Users() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("name-asc");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        async function fetchUsers() {
            setLoading(true);
            setError("");

            try {
                const response = await axios.get("https://fakestoreapi.com/users");
                if (!Array.isArray(response.data)) {
                    throw new Error("The users API returned an unexpected response.");
                }
                setUsers(response.data);
            } catch (fetchError) {
                console.error("Failed to fetch users:", fetchError);
                setError(fetchError.message || "Unable to load users. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, [reloadKey]);

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();
        const matchingUsers = users.filter((user) => {
            const searchableText = [
                getFullName(user),
                user.username,
                user.email,
                user.phone,
                user.address?.city,
                user.address?.street,
            ].filter(Boolean).join(" ").toLowerCase();

            return searchableText.includes(query);
        });

        return matchingUsers.sort((first, second) => {
            if (sortOrder === "id-asc") return first.id - second.id;
            if (sortOrder === "id-desc") return second.id - first.id;

            const nameOrder = (getFullName(first) || first.username || "")
                .localeCompare(getFullName(second) || second.username || "");
            return sortOrder === "name-desc" ? -nameOrder : nameOrder;
        });
    }, [users, search, sortOrder]);

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 pb-10">
            <header className="relative isolate overflow-hidden rounded-[1.75rem] bg-slate-950 px-6 py-8 text-white shadow-xl shadow-indigo-950/10 sm:px-9 sm:py-10">
                <div className="pointer-events-none absolute -right-10 -top-28 -z-10 size-80 rounded-full border-[42px] border-indigo-400/10" />
                <div className="pointer-events-none absolute -bottom-28 right-40 -z-10 size-56 rounded-full bg-indigo-500/20 blur-3xl" />

                <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
                    <div className="max-w-xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium tracking-wide text-indigo-100">
                            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                            CUSTOMER DIRECTORY
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            People, made personal<span className="text-cyan-300">.</span>
                        </h1>
                        <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
                            A clearer view of your customer community. Find a profile and reach out in just a click.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3 pr-5 backdrop-blur-sm">
                        <div className="grid size-11 place-items-center rounded-xl bg-indigo-400/15 text-indigo-200">
                            <UsersRound size={20} aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold leading-none">{users.length}</p>
                            <p className="mt-1.5 text-xs text-slate-300">customer profiles</p>
                        </div>
                    </div>
                </div>
            </header>

            <section aria-labelledby="directory-heading">
                <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <h2 id="directory-heading" className="text-xl font-semibold tracking-tight text-slate-900">
                            Your customers
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Search profiles by name, username, contact, or location.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <label className="relative block sm:w-72">
                            <Search
                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                size={17}
                                aria-hidden="true"
                            />
                            <span className="sr-only">Search users</span>
                            <input
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search customers..."
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
                                aria-label="Sort users"
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
                                        <div className="flex items-center justify-between px-3 pb-2.5 pt-2">
                                            <div>
                                                <p className="text-xs font-semibold tracking-wide text-slate-800">Sort customers</p>
                                                <p className="mt-0.5 text-[11px] text-slate-400">Choose how profiles are ordered</p>
                                            </div>
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
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }, (_, index) => (
                            <div key={index} className="animate-pulse overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white">
                                <div className="flex items-center gap-3.5 bg-slate-50 px-5 py-6">
                                    <div className="size-14 rounded-2xl bg-slate-200" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 rounded bg-slate-200" />
                                        <div className="h-3 w-20 rounded bg-slate-100" />
                                    </div>
                                </div>
                                <div className="space-y-4 px-5 py-5">
                                    <div className="h-10 rounded-xl bg-slate-100" />
                                    <div className="h-10 rounded-xl bg-slate-100" />
                                    <div className="h-10 rounded-xl bg-slate-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
                        <p className="font-medium text-rose-900">We couldn’t load the customer directory.</p>
                        <p className="mt-2 text-sm text-rose-700">{error}</p>
                        <button
                            className="mt-5 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
                            onClick={() => setReloadKey((key) => key + 1)}
                            type="button"
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                            <Search size={20} aria-hidden="true" />
                        </div>
                        <p className="mt-4 font-medium text-slate-800">
                            {users.length ? "No customers match that search" : "No customer profiles found"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            {users.length ? "Try another name, email, or city." : "There are no users to display right now."}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredUsers.map((user, index) => (
                            <UserCard key={user.id} user={user} index={index} />
                        ))}
                    </div>
                )}
            </section>

            {!loading && !error && filteredUsers.length > 0 && (
                <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-400">
                    {sortOrder.includes("desc") ? (
                        <ArrowDownAZ size={14} aria-hidden="true" />
                    ) : (
                        <ArrowUpAZ size={14} aria-hidden="true" />
                    )}
                    Showing {filteredUsers.length} of {users.length} customer profiles
                </div>
            )}
        </div>
    );
}
