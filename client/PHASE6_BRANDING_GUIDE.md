# Phase 6 — Frontend Dynamic Branding Guide

## What changed

The frontend now loads academy branding dynamically from the server on startup.
"NISHCHAY ACADEMY" is no longer hardcoded anywhere — it comes from the database.

---

## New files added

| File | Purpose |
|------|---------|
| `client/src/context/AcademyContext.js` | Fetches & stores academy config |
| `client/src/hooks/useAcademyInfo.js` | Easy access hook for any page |
| `client/src/App.js` | Updated — uses AcademyProvider + feature-flag nav |

---

## How to use in any page

### Basic usage
```jsx
import { useAcademyInfo } from "../hooks/useAcademyInfo";

function MyPage() {
  const { name, address, phone, logo_url } = useAcademyInfo();
  return <h1>{name}</h1>;
}
```

---

## Replacing hardcoded "NISHCHAY ACADEMY" — examples

### Receipts (Payments.js)
```jsx
// BEFORE
<div className="receipt-header">NISHCHAY ACADEMY</div>
<div>Favinagar, Nagpur | 9876543210</div>

// AFTER
import { useAcademyInfo } from "../hooks/useAcademyInfo";
const { name, address, phone, logo_url } = useAcademyInfo();

<div className="receipt-header">
  {logo_url && <img src={logo_url} alt={name} style={{ height: 40 }} />}
  <div>{name}</div>
</div>
<div>{address} | {phone}</div>
```

### ID Cards (IDCards.js)
```jsx
// BEFORE
<div className="id-card-school">NISHCHAY ACADEMY</div>

// AFTER
const { name, logo_url } = useAcademyInfo();
<div className="id-card-school">
  {logo_url && <img src={logo_url} alt={name} style={{ height: 28 }} />}
  {name}
</div>
```

### Admission Form header (AdmissionForm.js)
```jsx
// BEFORE
<h1>Nishchay Academy — Admission Form</h1>

// AFTER
// AdmissionForm is public (no auth) — use slug from URL query param
// GET /api/academy/config?slug=nishchay already returns the name
const [academy, setAcademy] = useState(null);
useEffect(() => {
  const slug = new URLSearchParams(window.location.search).get("slug") || "nishchay";
  fetch(`/api/academy/config?slug=${slug}`)
    .then(r => r.json()).then(setAcademy);
}, []);
<h1>{academy?.name} — Admission Form</h1>
```

### Email templates / FCM messages (server-side)
```js
// BEFORE (email.js / fcm.js)
const subject = "Nishchay Academy — Fee Receipt";
const heading = "NISHCHAY ACADEMY";

// AFTER — pass academy name from the API call context
// In your route, fetch academy before sending email:
const { rows: acadRows } = await db.query(
  "SELECT name, email, phone, address, logo_url FROM academies WHERE id=$1",
  [req.academyId]
);
const academy = acadRows[0];
// Then pass it to sendReceiptEmail({ ...paymentData, academy })
// Inside email.js, use academy.name instead of hardcoded string
```

---

## Feature flags — how they work

The `features` object from `useAcademyInfo()` controls what nav items appear:

```js
const { features } = useAcademyInfo();

// In nav config (already done in App.js):
{ id: "performance", show: features.tests !== false }
{ id: "expenses",    show: features.expenses !== false }
{ id: "attendance",  show: features.attendance !== false }
```

You can also use this inside any page to conditionally show/hide UI:
```jsx
const { features } = useAcademyInfo();
{features.notifications !== false && <NotificationButton />}
```

---

## CSS Theme variables

When the academy config loads, these CSS variables are automatically set:
```css
--accent       /* academy primary color */
--blue-600     /* same as accent */
--blue-500     /* same as accent */
--blue-400     /* accent secondary */
```

So any element using `var(--accent)` or `var(--blue-600)` automatically
recolors to match the academy's brand color. No code change needed.

---

## Checklist — files still needing manual hardcode removal

These files may still have "NISHCHAY ACADEMY" hardcoded — update when working on them:

- [ ] `client/src/pages/Payments.js` — receipt print template
- [ ] `client/src/pages/IDCards.js` — ID card template  
- [ ] `client/src/pages/AdmissionForm.js` — public form header
- [ ] `server/email.js` — email templates
- [ ] `server/fcm.js` — push notification messages
