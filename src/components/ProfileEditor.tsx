// Shows a form for editing the user profile (name, address, passport info, contact, etc.).

// Loads existing profile data (from props or from profile lib) into the form.

// On save:

// Calls a function to persist the profile (e.g., via profile.ts).

// Notifies parent that the profile changed (so autofill can re-run).

// Optional: buttons like “Reset profile” or “Load sample profile”.

import React, { useState } from "react";
import type { UserProfile } from "../types/index";

interface ProfileFormProps {
    profile?: UserProfile;
    onSave: (profile: UserProfile) => void;
    loadProfileFromLib?: () => UserProfile;
    saveProfileToLib?: (p: UserProfile) => Promise<void>;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
    profile,
    onSave,
    loadProfileFromLib,
    saveProfileToLib,
}) => {
    const [form, setForm] = useState<UserProfile>({
        name: profile?.name || "",
        birthDate: profile?.birthDate || "",
        nationality: profile?.nationality || "",
        address: {
            street: profile?.address?.street || "",
            city: profile?.address?.city || "",
            country: profile?.address?.country || "",
        },
        passport: {
            number: profile?.passport?.number || "",
            expiration: profile?.passport?.expiration || "",
        },
        contact: {
            phone: profile?.contact?.phone || "",
            email: profile?.contact?.email || "",
        },
    });

    const updateField = (key: keyof UserProfile, value: any) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSave = async () => {
        if (saveProfileToLib) await saveProfileToLib(form);
        onSave(form);
    };

    const handleReset = () => {
        setForm({
            name: "",
            birthDate: "",
            nationality: "",
            address: { street: "", city: "", country: "" },
            passport: { number: "", expiration: "" },
            contact: { phone: "", email: "" },
        });
    };

    const handleLoadSample = () => {
        setForm({
            name: "John Doe",
            birthDate: "1990-01-15",
            nationality: "US",
            address: { street: "123 Example Street", city: "Paris", country: "France" },
            passport: { number: "AA1234567", expiration: "2030-12-31" },
            contact: { phone: "+33 612345678", email: "john.doe@example.com" },
        });
    };

    const handleLoadFromLib = () => {
        if (loadProfileFromLib) {
            const loaded = loadProfileFromLib();
            setForm(loaded);
        }
    };

    return (
        <div className="ProfileEdit-container">
            <h2>Edit Your Profile</h2>
            <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
            />
            <input
                placeholder="Birth Date"
                type="date"
                value={form.birthDate}
                onChange={(e) => updateField("birthDate", e.target.value)}
            />
            <input
                placeholder="Nationality"
                value={form.nationality}
                onChange={(e) => updateField("nationality", e.target.value)}
            />
            <input
                placeholder="Street"
                value={form.address.street}
                onChange={(e) =>
                    updateField("address", { ...form.address, street: e.target.value })
                }
            />
            <input
                placeholder="City"
                value={form.address.city}
                onChange={(e) =>
                    updateField("address", { ...form.address, city: e.target.value })
                }
            />
            <input
                placeholder="Country"
                value={form.address.country}
                onChange={(e) =>
                    updateField("address", { ...form.address, country: e.target.value })
                }
            />
            <input
                placeholder="Passport Number"
                value={form.passport.number}
                onChange={(e) =>
                    updateField("passport", { ...form.passport, number: e.target.value })
                }
            />
            <input
                placeholder="Passport Expiration"
                type="date"
                value={form.passport.expiration}
                onChange={(e) =>
                    updateField("passport", { ...form.passport, expiration: e.target.value })
                }
            />
            <input
                placeholder="Phone"
                value={form.contact.phone}
                onChange={(e) =>
                    updateField("contact", { ...form.contact, phone: e.target.value })
                }
            />
            <input
                placeholder="Email"
                type="email"
                value={form.contact.email}
                onChange={(e) =>
                    updateField("contact", { ...form.contact, email: e.target.value })
                }
            />
            <button onClick={handleSave}>Save Profile</button>
            <button onClick={handleReset}>Reset Profile</button>
            <button onClick={handleLoadSample}>Load Sample Profile</button>
            {loadProfileFromLib && (
                <button onClick={handleLoadFromLib}>Load from Library</button>
            )}
        </div>
    );
};

export default ProfileForm;