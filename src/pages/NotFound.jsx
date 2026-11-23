import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/use-auth";

export default function NotFound() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const home = user ? "/" : "/login";

    return (
        <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-12">
            <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5 sm:p-12">
                <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <SearchX size={30} aria-hidden="true" />
                </div>
                <p className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Error 404</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Page not found</h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                    This page may have moved, or the address may be incorrect.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        onClick={() => navigate(-1)}
                        type="button"
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                        Go back
                    </button>
                    <Link
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        to={home}
                    >
                        <Home size={16} aria-hidden="true" />
                        {user ? "Dashboard home" : "Sign in"}
                    </Link>
                </div>
            </section>
        </main>
    );
}
