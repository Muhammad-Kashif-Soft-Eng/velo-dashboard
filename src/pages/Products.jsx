import axios from "axios";
import { Select } from "@base-ui/react/select";
import {
    ArrowDownAZ,
    ArrowDownWideNarrow,
    ArrowUpAZ,
    ArrowUpWideNarrow,
    Boxes,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Check,
    CircleAlert,
    LoaderCircle,
    Pencil,
    Plus,
    PackageSearch,
    Search,
    SlidersHorizontal,
    ShoppingBag,
    Star,
    Tag,
    Trash2,
    X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const API_URL = "https://fakestoreapi.com/products";
const PAGE_SIZE = 6;

const sortOptions = [
    { value: "featured", label: "Featured", icon: Boxes },
    { value: "name-asc", label: "Name A–Z", icon: ArrowUpAZ },
    { value: "name-desc", label: "Name Z–A", icon: ArrowDownAZ },
    { value: "price-asc", label: "Price: low to high", icon: ArrowUpWideNarrow },
    { value: "price-desc", label: "Price: high to low", icon: ArrowDownWideNarrow },
    { value: "rating-desc", label: "Top rated", icon: Star },
];

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

function formatCategory(category = "") {
    return category
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function ProductDialog({
    product,
    mode,
    busy,
    error,
    onClose,
    onSave,
    onDelete,
}) {
    const dialogRef = useRef(null);
    const [form, setForm] = useState({
        title: product?.title || "",
        price: product?.price ?? "",
        category: product?.category || "",
        image: product?.image || "",
        description: product?.description || "",
    });

    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog && !dialog.open) dialog.showModal();
    }, []);

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const closeDialog = () => {
        if (dialogRef.current?.open) {
            dialogRef.current.close();
        } else {
            onClose();
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSave({
            ...form,
            price: Number(form.price),
        });
    };

    const deleting = mode === "delete";

    return (
        <dialog
            aria-labelledby="product-dialog-title"
            className="m-auto max-h-[min(90dvh,48rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm"
            onClose={onClose}
            onCancel={(event) => {
                if (busy) event.preventDefault();
            }}
            ref={dialogRef}
        >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
                        {deleting ? "Remove from catalog" : product ? "Product details" : "New listing"}
                    </p>
                    <h2 id="product-dialog-title" className="mt-1 text-xl font-semibold tracking-tight">
                        {deleting ? "Delete this product?" : product ? "Edit product" : "Add a product"}
                    </h2>
                </div>
                <button
                    aria-label="Close dialog"
                    className="grid size-9 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 disabled:opacity-50"
                    disabled={busy}
                    onClick={closeDialog}
                    type="button"
                >
                    <X size={18} aria-hidden="true" />
                </button>
            </div>

            {deleting ? (
                <div className="space-y-5 px-5 py-6 sm:px-7">
                    <p className="text-sm leading-6 text-slate-600">
                        This will remove <span className="font-semibold text-slate-900">{product.title}</span> from the current view. Fake Store API does not persist deletions.
                    </p>
                    {error && (
                        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800" role="alert">
                            {error}
                        </p>
                    )}
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 disabled:opacity-50"
                            disabled={busy}
                            onClick={closeDialog}
                            type="button"
                        >
                            Cancel
                        </button>
                        <button
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100 disabled:cursor-wait disabled:opacity-70"
                            disabled={busy}
                            onClick={onDelete}
                            type="button"
                        >
                            {busy ? <LoaderCircle className="animate-spin" size={16} aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
                            {busy ? "Deleting..." : "Delete product"}
                        </button>
                    </div>
                </div>
            ) : (
                <form className="space-y-4 px-5 py-6 sm:px-7" onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium text-slate-700">
                        Product name
                        <input
                            autoFocus
                            className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                            maxLength={120}
                            name="title"
                            onChange={updateField}
                            placeholder="e.g. Everyday carry backpack"
                            required
                            value={form.title}
                        />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Price (USD)
                            <input
                                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                min="0.01"
                                name="price"
                                onChange={updateField}
                                required
                                step="0.01"
                                type="number"
                                value={form.price}
                            />
                        </label>
                        <label className="block text-sm font-medium text-slate-700">
                            Product category
                            <input
                                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                maxLength={80}
                                name="category"
                                onChange={updateField}
                                placeholder="e.g. electronics"
                                required
                                value={form.category}
                            />
                        </label>
                    </div>
                    <label className="block text-sm font-medium text-slate-700">
                        Image URL <span className="font-normal text-slate-400">(optional)</span>
                        <input
                            className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                            name="image"
                            onChange={updateField}
                            placeholder="https://example.com/product.jpg"
                            type="url"
                            value={form.image}
                        />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                        Description
                        <textarea
                            className="mt-1.5 min-h-28 w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm leading-5 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                            maxLength={1000}
                            name="description"
                            onChange={updateField}
                            placeholder="Describe the product..."
                            required
                            value={form.description}
                        />
                    </label>
                    {error && (
                        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800" role="alert">
                            {error}
                        </p>
                    )}
                    <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                        <button
                            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 disabled:opacity-50"
                            disabled={busy}
                            onClick={closeDialog}
                            type="button"
                        >
                            Cancel
                        </button>
                        <button
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 disabled:cursor-wait disabled:opacity-70"
                            disabled={busy}
                            type="submit"
                        >
                            {busy ? <LoaderCircle className="animate-spin" size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                            {busy ? "Saving..." : product ? "Save changes" : "Create product"}
                        </button>
                    </div>
                </form>
            )}
        </dialog>
    );
}

function ProductCard({ product, index, onEdit, onDelete }) {
    const [imageFailed, setImageFailed] = useState(false);

    return (
        <article className="group flex min-w-0 flex-col overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-white shadow-[0_8px_30px_-20px_rgba(15,23,42,0.28)] transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_20px_40px_-24px_rgba(79,70,229,0.3)]">
            <div className={`relative grid h-52 place-items-center overflow-hidden bg-gradient-to-br ${index % 2 === 0 ? "from-slate-50 via-white to-indigo-50/80" : "from-slate-50 via-white to-cyan-50/70"} p-6`}>
                <div className="pointer-events-none absolute -right-7 -top-12 size-32 rounded-full border-[18px] border-white/60 transition-transform duration-500 group-hover:scale-125" />
                <span className="absolute left-4 top-4 z-10 inline-flex max-w-[calc(100%-2rem)] items-center gap-1.5 truncate rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600 shadow-sm backdrop-blur">
                    <Tag size={12} aria-hidden="true" />
                    <span className="truncate">{formatCategory(product.category)}</span>
                </span>
                {!imageFailed && product.image ? (
                    <img
                        alt={product.title}
                        className="relative z-[1] h-full max-h-40 w-full object-contain drop-shadow-[0_12px_12px_rgba(15,23,42,0.12)] transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                        src={product.image}
                    />
                ) : (
                    <div className="grid size-20 place-items-center rounded-3xl bg-white text-indigo-300 shadow-sm ring-1 ring-slate-100">
                        <ShoppingBag size={34} aria-hidden="true" />
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                    <h2 className="line-clamp-2 min-h-12 flex-1 text-[15px] font-semibold leading-6 tracking-tight text-slate-900">
                        {product.title}
                    </h2>
                </div>
                <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
                    {product.description || "No description available."}
                </p>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                            Price
                        </p>
                        <p className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">
                            {currency.format(Number(product.price) || 0)}
                        </p>
                    </div>
                    {product.rating && (
                        <div
                            className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-2.5 py-2 text-amber-700"
                            aria-label={`${product.rating.rate} out of 5 stars, ${product.rating.count} ratings`}
                        >
                            <Star size={15} fill="currentColor" aria-hidden="true" />
                            <span className="text-sm font-semibold">{product.rating.rate}</span>
                            <span className="text-[11px] text-amber-700/70">
                                ({product.rating.count})
                            </span>
                        </div>
                    )}
                </div>
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                        aria-label={`Edit ${product.title}`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
                        onClick={() => onEdit(product)}
                        type="button"
                    >
                        <Pencil size={14} aria-hidden="true" />
                        Edit
                    </button>
                    <button
                        aria-label={`Delete ${product.title}`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100"
                        onClick={() => onDelete(product)}
                        type="button"
                    >
                        <Trash2 size={14} aria-hidden="true" />
                        Delete
                    </button>
                </div>
            </div>
        </article>
    );
}

function ProductSkeleton() {
    return (
        <div className="animate-pulse overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white">
            <div className="h-52 bg-slate-100" />
            <div className="space-y-4 p-5">
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-10 rounded bg-slate-100" />
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between">
                    <div className="h-8 w-20 rounded bg-slate-100" />
                    <div className="h-8 w-24 rounded bg-slate-100" />
                </div>
            </div>
        </div>
    );
}

export default function Products() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [sortOrder, setSortOrder] = useState("featured");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [dialog, setDialog] = useState(null);
    const [mutationBusy, setMutationBusy] = useState(false);
    const [mutationError, setMutationError] = useState("");
    const [notice, setNotice] = useState("");

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            setError("");

            try {
                const response = await axios.get(API_URL);
                if (!Array.isArray(response.data)) {
                    throw new Error("The products API returned an unexpected response.");
                }
                setProducts(response.data);
            } catch (fetchError) {
                console.error("Failed to fetch products:", fetchError);
                setError(fetchError.message || "Unable to load products. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [reloadKey]);

    const categories = useMemo(
        () => [...new Set(products.map((product) => product.category).filter(Boolean))].sort(),
        [products],
    );

    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase();
        const matchingProducts = products.filter((product) => {
            const matchesCategory = category === "all" || product.category === category;
            const searchableText = [
                product.title,
                product.description,
                product.category,
            ].filter(Boolean).join(" ").toLowerCase();

            return matchesCategory && searchableText.includes(query);
        });

        return matchingProducts.sort((first, second) => {
            if (sortOrder === "name-asc") return first.title.localeCompare(second.title);
            if (sortOrder === "name-desc") return second.title.localeCompare(first.title);
            if (sortOrder === "price-asc") return first.price - second.price;
            if (sortOrder === "price-desc") return second.price - first.price;
            if (sortOrder === "rating-desc") {
                return (second.rating?.rate || 0) - (first.rating?.rate || 0);
            }
            return Number(first.id) - Number(second.id);
        });
    }, [products, search, category, sortOrder]);

    const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleProducts = filteredProducts.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    const openDialog = (nextDialog) => {
        setMutationError("");
        setNotice("");
        setDialog(nextDialog);
    };

    const handleSave = async (form) => {
        setMutationBusy(true);
        setMutationError("");
        try {
            if (dialog.type === "create") {
                const response = await axios.post(API_URL, form);
                const id = response.data?.id;
                if (id === undefined || id === null) {
                    throw new Error("The API did not return an ID for the new product.");
                }

                setProducts((current) => [...current, { ...form, id }]);
                setSearch("");
                setCategory("all");
                setSortOrder("featured");
                setPage(Math.ceil((products.length + 1) / PAGE_SIZE));
                setNotice("Product created in this session. Fake Store API does not save changes permanently.");
            } else {
                const product = dialog.product;
                const response = await axios.patch(`${API_URL}/${product.id}`, form);
                const updatedProduct = {
                    ...product,
                    ...form,
                    ...response.data,
                    rating: product.rating,
                };
                setProducts((current) =>
                    current.map((item) => item.id === product.id ? updatedProduct : item),
                );
                setNotice("Product updated in this session. Fake Store API does not save changes permanently.");
            }
            setDialog(null);
        } catch (saveError) {
            console.error("Failed to save product:", saveError);
            setMutationError(
                saveError.response?.data?.message
                || saveError.message
                || "Unable to save this product. Please try again.",
            );
        } finally {
            setMutationBusy(false);
        }
    };

    const handleDelete = async () => {
        const product = dialog.product;
        setMutationBusy(true);
        setMutationError("");
        try {
            await axios.delete(`${API_URL}/${product.id}`);
            setProducts((current) => current.filter((item) => item.id !== product.id));
            setNotice("Product removed from this session. Fake Store API does not save changes permanently.");
            setDialog(null);
        } catch (deleteError) {
            console.error("Failed to delete product:", deleteError);
            setMutationError(
                deleteError.response?.data?.message
                || deleteError.message
                || "Unable to delete this product. Please try again.",
            );
        } finally {
            setMutationBusy(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 pb-10">
            <header className="relative isolate overflow-hidden rounded-[1.75rem] bg-slate-950 px-6 py-8 text-white shadow-xl shadow-indigo-950/10 sm:px-9 sm:py-10">
                <div className="pointer-events-none absolute -right-10 -top-28 -z-10 size-80 rounded-full border-[42px] border-indigo-400/10" />
                <div className="pointer-events-none absolute -bottom-28 right-40 -z-10 size-56 rounded-full bg-indigo-500/20 blur-3xl" />

                <div className="flex flex-col justify-between gap-7 xl:flex-row xl:items-end">
                    <div className="min-w-0 max-w-xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium tracking-wide text-indigo-100">
                            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                            PRODUCT CATALOG
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            Find your next favorite<span className="text-cyan-300">.</span>
                        </h1>
                        <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
                            Explore the catalog, discover a category, and find exactly what you’re looking for.
                        </p>
                    </div>

                    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3 pr-5 backdrop-blur-sm">
                            <div className="grid size-11 place-items-center rounded-xl bg-indigo-400/15 text-indigo-200">
                                <ShoppingBag size={20} aria-hidden="true" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold leading-none">{products.length}</p>
                                <p className="mt-1.5 text-xs text-slate-300">catalog products</p>
                            </div>
                        </div>
                        <button
                            className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-white to-indigo-50 px-5 text-sm font-semibold text-indigo-950 shadow-lg shadow-indigo-950/20 transition duration-200 hover:-translate-y-0.5 hover:from-indigo-50 hover:to-white hover:shadow-xl hover:shadow-indigo-950/30 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            disabled={loading || Boolean(error)}
                            onClick={() => openDialog({ type: "create" })}
                            type="button"
                        >
                            <Plus size={17} aria-hidden="true" />
                            Add product
                        </button>
                    </div>
                </div>
            </header>

            {notice && (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-900" role="status">
                    <CircleAlert className="mt-0.5 shrink-0 text-emerald-700" size={17} aria-hidden="true" />
                    <p className="leading-5">{notice}</p>
                    <button
                        aria-label="Dismiss notification"
                        className="ml-auto grid size-7 shrink-0 place-items-center rounded-lg text-emerald-700 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
                        onClick={() => setNotice("")}
                        type="button"
                    >
                        <X size={15} aria-hidden="true" />
                    </button>
                </div>
            )}

            <section aria-labelledby="products-heading" className="min-w-0">
                <div className="mb-5 flex min-w-0 flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
                    <div>
                        <h2 id="products-heading" className="text-xl font-semibold tracking-tight text-slate-900">
                            Browse products
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Search the catalog or narrow down by category.
                        </p>
                    </div>
                    <div className="grid min-w-0 w-full grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_13rem] 2xl:w-auto 2xl:min-w-[32rem]">
                        <label className="relative block min-w-0">
                            <Search
                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                size={17}
                                aria-hidden="true"
                            />
                            <span className="sr-only">Search products</span>
                            <input
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search products..."
                                type="search"
                                value={search}
                            />
                        </label>
                        <Select.Root
                            items={sortOptions}
                            onValueChange={(value) => {
                                setSortOrder(value);
                                setPage(1);
                            }}
                            value={sortOrder}
                        >
                            <Select.Trigger
                                aria-label="Sort products"
                                className="group flex h-11 w-full min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 text-left text-sm text-slate-700 shadow-sm outline-none transition hover:border-indigo-200 hover:bg-indigo-50/40 focus-visible:border-indigo-400 focus-visible:ring-4 focus-visible:ring-indigo-100 data-[popup-open]:border-indigo-300 data-[popup-open]:bg-indigo-50/60"
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
                                            <p className="text-xs font-semibold tracking-wide text-slate-800">Sort products</p>
                                            <p className="mt-0.5 text-[11px] text-slate-400">Choose how products are ordered</p>
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

                {!loading && !error && categories.length > 0 && (
                    <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-2" aria-label="Filter products by category">
                        <button
                            aria-pressed={category === "all"}
                            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 ${category === "all" ? "bg-slate-900 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"}`}
                            onClick={() => {
                                setCategory("all");
                                setPage(1);
                            }}
                            type="button"
                        >
                            All products <span className="ml-1 opacity-70">{products.length}</span>
                        </button>
                        {categories.map((item) => {
                            const count = products.filter((product) => product.category === item).length;
                            const isActive = category === item;

                            return (
                                <button
                                    key={item}
                                    aria-pressed={isActive}
                                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 ${isActive ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200" : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"}`}
                                    onClick={() => {
                                        setCategory(item);
                                        setPage(1);
                                    }}
                                    type="button"
                                >
                                    {formatCategory(item)} <span className="ml-1 opacity-70">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }, (_, index) => <ProductSkeleton key={index} />)}
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
                        <p className="font-medium text-rose-900">We couldn’t load the product catalog.</p>
                        <p className="mt-2 text-sm text-rose-700">{error}</p>
                        <button
                            className="mt-5 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
                            onClick={() => setReloadKey((key) => key + 1)}
                            type="button"
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                            <PackageSearch size={20} aria-hidden="true" />
                        </div>
                        <p className="mt-4 font-medium text-slate-800">
                            {products.length ? "No products match these filters" : "No products found"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            {products.length ? "Try another search or choose a different category." : "The catalog is empty right now."}
                        </p>
                        {products.length > 0 && (
                            <button
                                className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
                                onClick={() => {
                                    setSearch("");
                                    setCategory("all");
                                    setPage(1);
                                }}
                                type="button"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {visibleProducts.map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                index={(currentPage - 1) * PAGE_SIZE + index}
                                onEdit={(item) => openDialog({ type: "edit", product: item })}
                                onDelete={(item) => openDialog({ type: "delete", product: item })}
                            />
                        ))}
                    </div>
                )}

                {!loading && !error && filteredProducts.length > 0 && (
                    <nav aria-label="Product pages" className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-center text-xs text-slate-500 sm:text-left" aria-live="polite">
                            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} of {filteredProducts.length} matching products
                        </p>
                        <div className="flex items-center justify-center gap-2">
                            <button
                                aria-label="Previous page"
                                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
                                disabled={currentPage === 1}
                                onClick={() => setPage(currentPage - 1)}
                                type="button"
                            >
                                <ChevronLeft size={16} aria-hidden="true" />
                                <span className="hidden sm:inline">Previous</span>
                            </button>
                            <span className="min-w-20 text-center text-xs font-medium text-slate-600" aria-current="page">
                                Page {currentPage} of {pageCount}
                            </span>
                            <button
                                aria-label="Next page"
                                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
                                disabled={currentPage === pageCount}
                                onClick={() => setPage(currentPage + 1)}
                                type="button"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight size={16} aria-hidden="true" />
                            </button>
                        </div>
                    </nav>
                )}
            </section>

            {dialog && (
                <ProductDialog
                    key={`${dialog.type}-${dialog.product?.id ?? "new"}`}
                    busy={mutationBusy}
                    error={mutationError}
                    mode={dialog.type}
                    onClose={() => setDialog(null)}
                    onDelete={handleDelete}
                    onSave={handleSave}
                    product={dialog.product}
                />
            )}
        </div>
    );
}
