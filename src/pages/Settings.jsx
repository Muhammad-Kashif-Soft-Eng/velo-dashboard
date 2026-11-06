import {
    BellRing,
    Check,
    CircleAlert,
    Mail,
    RotateCcw,
    Save,
    ShieldCheck,
    UserRound,
} from "lucide-react";
import { useState } from "react";
import {
    defaultWorkspaceSettings,
    readWorkspaceSettings,
    saveWorkspaceSettings,
} from "@/lib/workspace-settings";

const notificationOptions = [
    {
        key: "orderUpdates",
        title: "Order updates",
        description: "Receive updates when new orders are placed.",
    },
    {
        key: "inventoryAlerts",
        title: "Inventory alerts",
        description: "Get notified when products need your attention.",
    },
    {
        key: "weeklySummary",
        title: "Weekly summary",
        description: "Get a weekly overview of your store performance.",
    },
];

function getInitialSettings() {
    try {
        return { settings: readWorkspaceSettings(), error: "" };
    } catch (loadError) {
        console.error("Failed to load workspace settings:", loadError);
        return {
            settings: { ...defaultWorkspaceSettings },
            error: loadError.message || "Unable to load saved settings.",
        };
    }
}

function SettingsCard({ icon: Icon, title, description, children }) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.3)]">
            <div className="flex items-start gap-3.5 border-b border-slate-100 px-5 py-5 sm:px-6">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon size={19} aria-hidden="true" />
                </span>
                <div>
                    <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                </div>
            </div>
            <div className="px-5 py-5 sm:px-6">{children}</div>
        </section>
    );
}

function NotificationToggle({ option, checked, onChange }) {
    return (
        <label className="flex cursor-pointer items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-800">{option.title}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{option.description}</span>
            </span>
            <input
                checked={checked}
                className="peer sr-only"
                onChange={onChange}
                type="checkbox"
            />
            <span
                aria-hidden="true"
                className="relative h-6 w-11 shrink-0 rounded-full bg-slate-200 transition peer-checked:bg-indigo-600 peer-focus-visible:outline-none peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-100 after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:content-[''] peer-checked:after:translate-x-5"
            />
        </label>
    );
}

export default function Settings() {
    const [initialState] = useState(getInitialSettings);
    const [settings, setSettings] = useState(initialState.settings);
    const [dirty, setDirty] = useState(false);
    const [error, setError] = useState(initialState.error);
    const [saved, setSaved] = useState(false);

    function updateSetting(key, value) {
        setSettings((current) => ({ ...current, [key]: value }));
        setDirty(true);
        setSaved(false);
        setError("");
    }

    function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSaved(false);

        try {
            const updatedSettings = saveWorkspaceSettings(settings);
            setSettings(updatedSettings);
            setDirty(false);
            setSaved(true);
        } catch (saveError) {
            console.error("Failed to save workspace settings:", saveError);
            setError(saveError.message || "Unable to save settings. Please try again.");
        }
    }

    function resetSettings() {
        setSettings({ ...defaultWorkspaceSettings });
        setDirty(true);
        setSaved(false);
        setError("");
    }

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
            <header className="relative isolate overflow-hidden rounded-[1.75rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-indigo-950/10 sm:px-9 sm:py-8">
                <div className="pointer-events-none absolute -right-10 -top-28 -z-10 size-80 rounded-full border-[42px] border-indigo-400/10" />
                <div className="pointer-events-none absolute -bottom-28 right-40 -z-10 size-56 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                    <div className="max-w-2xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium tracking-wide text-indigo-100">
                            <ShieldCheck size={14} aria-hidden="true" />
                            Workspace preferences
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h2>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                            Manage your admin profile and choose which workspace updates matter to you.
                        </p>
                    </div>
                    <button
                        className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-white/15 bg-white/10 px-3.5 text-sm font-medium text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/20 sm:self-auto"
                        onClick={resetSettings}
                        type="button"
                    >
                        <RotateCcw size={15} aria-hidden="true" />
                        Restore defaults
                    </button>
                </div>
            </header>

            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5" role="alert">
                    <CircleAlert className="mt-0.5 shrink-0 text-rose-600" size={17} aria-hidden="true" />
                    <p className="text-sm leading-5 text-rose-800">{error}</p>
                </div>
            )}

            {saved && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
                    <Check size={17} aria-hidden="true" />
                    Settings saved in this browser.
                </div>
            )}

            <form className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]" onSubmit={handleSubmit}>
                <div className="space-y-5">
                    <SettingsCard
                        description="Your name and contact details for this workspace."
                        icon={UserRound}
                        title="Admin profile"
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-medium text-slate-700">Display name</span>
                                <input
                                    autoComplete="name"
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-wait disabled:bg-slate-50"
                                    maxLength={60}
                                    onChange={(event) => updateSetting("displayName", event.target.value)}
                                    required
                                    value={settings.displayName}
                                />
                            </label>
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-medium text-slate-700">Email address</span>
                                <span className="relative block">
                                    <Mail
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                        size={16}
                                        aria-hidden="true"
                                    />
                                    <input
                                        autoComplete="email"
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-wait disabled:bg-slate-50"
                                        maxLength={254}
                                        onChange={(event) => updateSetting("email", event.target.value)}
                                        required
                                        type="email"
                                        value={settings.email}
                                    />
                                </span>
                            </label>
                        </div>
                        <p className="mt-4 rounded-xl bg-slate-50 px-3.5 py-3 text-xs leading-5 text-slate-500">
                            Profile changes are stored locally in this browser. Authentication and account updates are not connected to a server.
                        </p>
                    </SettingsCard>
                </div>

                <div className="space-y-5">
                    <SettingsCard
                        description="Choose the updates you want to keep track of."
                        icon={BellRing}
                        title="Notifications"
                    >
                        <div className="divide-y divide-slate-100">
                            {notificationOptions.map((option) => (
                                <NotificationToggle
                                    checked={settings[option.key]}
                                    key={option.key}
                                    onChange={(event) => updateSetting(option.key, event.target.checked)}
                                    option={option}
                                />
                            ))}
                        </div>
                    </SettingsCard>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-400">
                            {dirty ? "You have unsaved changes." : "Your settings are up to date."}
                        </p>
                        <button
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!dirty}
                            type="submit"
                        >
                            <Save size={16} aria-hidden="true" />
                            Save changes
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
