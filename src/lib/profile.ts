// lib/profile.ts
// Handles profile data storage and helpers.
// No UI. Pure logic. Safe for use everywhere.

interface UserProfile {
  name: string;
  birthDate: string;
  nationality: string;

  address: {
    street: string;
    city: string;
    country: string;
  };

  passport: {
    number: string;
    expiration: string;
  };

  contact: {
    phone: string;
    email: string;
  };
}

const STORAGE_KEY = "user_profile_v1";

// ------------------------------------------
// 1. Default profile
// ------------------------------------------

function getDefaultProfile(): UserProfile {
  return {
    name: "",
    birthDate: "",
    nationality: "",

    address: {
      street: "",
      city: "",
      country: "",
    },

    passport: {
      number: "",
      expiration: "",
    },

    contact: {
      phone: "",
      email: "",
    },
  };
}

// ------------------------------------------
// 2. Load profile from localStorage
// ------------------------------------------

function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProfile();

    const parsed = JSON.parse(raw);
    return { ...getDefaultProfile(), ...parsed }; // ensure missing fields exist
  } catch (e) {
    console.warn("Failed to load profile:", e);
    return getDefaultProfile();
  }
}

// ------------------------------------------
// 3. Save profile
// ------------------------------------------

function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile:", e);
  }
}

// ------------------------------------------
// 4. Optional helper: autofill mapping
//    (Used by AI or components to guess which
//    PDF fields to fill from profile.)
// ------------------------------------------

function mapProfileToFields(profile: UserProfile) {
  return {
    name: profile.name,
    birthDate: profile.birthDate,
    nationality: profile.nationality,

    street: profile.address.street,
    city: profile.address.city,
    country: profile.address.country,

    passportNumber: profile.passport.number,
    passportExpiration: profile.passport.expiration,

    phone: profile.contact.phone,
    email: profile.contact.email,
  };
}


export {
  getDefaultProfile,
  loadProfile,
  saveProfile,
  mapProfileToFields,
};

export type { UserProfile };
