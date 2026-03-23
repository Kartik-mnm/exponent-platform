// ============================================================
// EXPONENT PLATFORM - useAcademyInfo hook
//
// Use this in any page/component that needs academy details.
// Common use cases:
//   - Receipts: show academy name, address, phone, logo
//   - ID Cards: show academy name + logo
//   - Email templates: use academy name + contact
//   - Admission form header
//
// Usage:
//   import { useAcademyInfo } from "../hooks/useAcademyInfo";
//   const { name, address, phone, logo_url, features } = useAcademyInfo();
// ============================================================

import { useAcademy } from "../context/AcademyContext";

export function useAcademyInfo() {
  const { academy } = useAcademy();

  return {
    // Identity
    id:            academy?.id            || 1,
    name:          academy?.name          || "Academy",
    slug:          academy?.slug          || "academy",
    tagline:       academy?.tagline       || "",

    // Branding
    logo_url:      academy?.logo_url      || null,
    primary_color: academy?.primary_color || "2563EB",
    accent_color:  academy?.accent_color  || "38BDF8",

    // Contact (used on receipts, ID cards, registration forms)
    address:       academy?.address       || "",
    phone:         academy?.phone         || "",
    phone2:        academy?.phone2        || "",
    email:         academy?.email         || "",
    website:       academy?.website       || "",
    city:          academy?.city          || "",
    state:         academy?.state         || "",

    // Feature flags
    features:      academy?.features      || {},
    plan:          academy?.plan          || "basic",
  };
}
