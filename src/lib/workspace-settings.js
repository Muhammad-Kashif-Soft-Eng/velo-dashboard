export const WORKSPACE_SETTINGS_KEY = "velo-workspace-settings";
export const WORKSPACE_SETTINGS_UPDATED = "velo-workspace-settings-updated";

export const defaultWorkspaceSettings = {
    displayName: "Admin",
    email: "admin@velo.app",
    orderUpdates: true,
    inventoryAlerts: true,
    weeklySummary: false,
};

export function readWorkspaceSettings() {
    const storedSettings = window.localStorage.getItem(WORKSPACE_SETTINGS_KEY);
    if (!storedSettings) return { ...defaultWorkspaceSettings };

    const parsedSettings = JSON.parse(storedSettings);
    if (!parsedSettings || typeof parsedSettings !== "object" || Array.isArray(parsedSettings)) {
        throw new Error("Saved workspace settings are invalid. Reset them to continue.");
    }

    const settings = { ...defaultWorkspaceSettings };
    for (const key of ["displayName", "email"]) {
        if (key in parsedSettings && typeof parsedSettings[key] !== "string") {
            throw new Error("Saved profile settings are invalid. Update the profile and save again.");
        }
        if (key in parsedSettings) settings[key] = parsedSettings[key];
    }

    for (const key of ["orderUpdates", "inventoryAlerts", "weeklySummary"]) {
        if (key in parsedSettings && typeof parsedSettings[key] !== "boolean") {
            throw new Error("Saved notification settings are invalid. Update the preferences and save again.");
        }
        if (key in parsedSettings) settings[key] = parsedSettings[key];
    }

    return settings;
}

export function saveWorkspaceSettings(settings) {
    const normalizedSettings = {
        displayName: settings.displayName.trim(),
        email: settings.email.trim(),
        orderUpdates: settings.orderUpdates,
        inventoryAlerts: settings.inventoryAlerts,
        weeklySummary: settings.weeklySummary,
    };

    if (!normalizedSettings.displayName || !normalizedSettings.email) {
        throw new Error("Enter a display name and email address before saving.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedSettings.email)) {
        throw new Error("Enter a valid email address before saving.");
    }

    window.localStorage.setItem(WORKSPACE_SETTINGS_KEY, JSON.stringify(normalizedSettings));
    window.dispatchEvent(new Event(WORKSPACE_SETTINGS_UPDATED));
    return normalizedSettings;
}
