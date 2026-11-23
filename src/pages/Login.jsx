import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail, Zap } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/use-auth";

export default function Login() {
    const [email, setEmail] = useState("admin@velo.app");
    const [password, setPassword] = useState("demo1234");
    const [error, setError] = useState("");
    const { user, login } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    if (user) return <Navigate to="/" replace />;

    function handleSubmit(event) {
        event.preventDefault();
        setError("");

        try {
            login(email, password);
            navigate(location.state?.from?.pathname || "/", { replace: true });
        } catch (loginError) {
            setError(loginError.message || "Unable to sign in.");
        }
    }

    return (
        <main className="grid min-h-screen bg-white lg:grid-cols-2">
            <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
                <div className="pointer-events-none absolute -right-36 -top-32 size-[34rem] rounded-full border-[64px] border-indigo-400/10" />
                <div className="pointer-events-none absolute -bottom-36 -left-20 size-[28rem] rounded-full bg-indigo-600/20 blur-3xl" />
                <LinkBrand />
                <div className="relative max-w-xl pb-16">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">Velo Admin Workspace</p>
                    <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
                        Your store, in clear view.
                    </h1>
                    <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                        Keep products, customers, orders, and performance insights together in one simple workspace.
                    </p>
                </div>
                <p className="relative text-xs text-slate-500">Frontend demo authentication · No real account or data protection</p>
            </section>

            <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
                <div className="w-full max-w-md">
                    <div className="mb-10 lg:hidden">
                        <LinkBrand />
                    </div>
                    <div className="mb-8">
                        <p className="text-sm font-semibold text-indigo-600">Welcome back</p>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Sign in to Velo</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Use the demo account to explore the admin dashboard.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <label className="block text-sm font-medium text-slate-700">
                            Email address
                            <span className="relative mt-2 block">
                                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} aria-hidden="true" />
                                <input
                                    autoComplete="username"
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                    type="email"
                                    value={email}
                                />
                            </span>
                        </label>
                        <label className="block text-sm font-medium text-slate-700">
                            Password
                            <span className="relative mt-2 block">
                                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} aria-hidden="true" />
                                <input
                                    autoComplete="current-password"
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                    type="password"
                                    value={password}
                                />
                            </span>
                        </label>
                        {error && (
                            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
                                {error}
                            </p>
                        )}
                        <button
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/15 transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
                            type="submit"
                        >
                            Sign in
                            <ArrowRight size={17} aria-hidden="true" />
                        </button>
                    </form>

                    <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-800">Demo credentials</p>
                        <p className="mt-2 text-sm text-slate-700">
                            Email: <span className="font-medium">admin@velo.app</span>
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                            Password: <span className="font-medium">demo1234</span>
                        </p>
                    </div>
                    <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                        Demo-only sign-in. This frontend flow does not provide production authentication or secure access control.
                    </p>
                </div>
            </section>
        </main>
    );
}

function LinkBrand() {
    return (
        <div className="relative flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
                <Zap size={19} fill="currentColor" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight">Velo</span>
        </div>
    );
}
