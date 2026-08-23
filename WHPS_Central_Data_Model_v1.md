# WHPS Central Data Model — v1

**Status:** Draft  
**Date:** 2026-08-22  
**Scope:** All 16 entity domains across the WHPS Digital Enterprise Platform  
**Rule:** Every module reads and writes to this shared model. There are no separate per-module databases.

---

## How to Read This Document

Each entity definition contains:
- **Fields** — name, type, nullable, description
- **PK / FK** — primary and foreign key declarations
- **Enums** — allowed values for status/type columns
- **Scope** — whether the entity is `GLOBAL`, `BRANCH`, or `CUSTOMER` scoped
- **Audit** — whether changes are written to `audit_events`
- **RBAC** — which roles can read / write

### Universal Base Fields (on every entity)

Every table inherits these columns unless stated otherwise:

| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID` PK | Generated server-side (UUIDv7 recommended for time-ordering) |
| `created_at` | `TIMESTAMPTZ` | Set on insert, never updated |
| `updated_at` | `TIMESTAMPTZ` | Set on insert, updated on every write |
| `created_by` | `UUID` FK → `users.id` | The user who created the record |
| `updated_by` | `UUID` FK → `users.id` | The user who last modified the record |
| `is_deleted` | `BOOLEAN` DEFAULT `false` | Soft delete — never hard-delete in production |
| `deleted_at` | `TIMESTAMPTZ` NULL | Set when `is_deleted = true` |
| `deleted_by` | `UUID` FK → `users.id` NULL | Set when `is_deleted = true` |

### Naming Conventions

- Table names: `snake_case`, plural
- Column names: `snake_case`
- Foreign keys: `referenced_table_singular_id` (e.g. `customer_id`, `branch_id`)
- Enum types: `UPPER_SNAKE_CASE`
- Timestamps: always `TIMESTAMPTZ` (timezone-aware)
- Money: `NUMERIC(14,2)` — never `FLOAT`
- Weight: `NUMERIC(10,3)` — grams, 3 decimal places
- Percentages: `NUMERIC(5,2)` — e.g. `18.50` for 18.5%

---

## Domain 1 — Identity

> **Scope:** GLOBAL  
> **Audit:** All writes  
> **Note:** This domain is the root dependency. Every other entity that involves a human actor references `users`.

---

### `users`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `name` | VARCHAR(120) | No | Full display name |
| `email` | VARCHAR(200) | Yes | Unique when set |
| `phone` | VARCHAR(20) | Yes | Unique when set; E.164 format |
| `password_hash` | VARCHAR(255) | Yes | Null for OAuth-only accounts |
| `avatar_url` | TEXT | Yes | — |
| `type` | ENUM | No | `INTERNAL` · `CUSTOMER` · `VENDOR` · `KARIGAR` · `FRANCHISE_PARTNER` |
| `status` | ENUM | No | `ACTIVE` · `INACTIVE` · `SUSPENDED` · `PENDING_VERIFICATION` |
| `email_verified_at` | TIMESTAMPTZ | Yes | — |
| `phone_verified_at` | TIMESTAMPTZ | Yes | — |
| `mfa_enabled` | BOOLEAN | No | Default `false` |
| `mfa_secret` | VARCHAR(64) | Yes | TOTP secret, encrypted at rest |
| `last_login_at` | TIMESTAMPTZ | Yes | — |
| `password_changed_at` | TIMESTAMPTZ | Yes | — |
| `force_password_reset` | BOOLEAN | No | Default `false` |
| *(base fields)* | | | |

**Indexes:** `UNIQUE (email)`, `UNIQUE (phone)`, `INDEX (type, status)`

---

### `roles`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `name` | VARCHAR(80) | No | e.g. `Branch Manager` |
| `slug` | VARCHAR(80) | No | e.g. `branch_manager` — unique |
| `description` | TEXT | Yes | — |
| `scope` | ENUM | No | `GLOBAL` · `COMPANY` · `BRANCH` · `FRANCHISE` · `SELF` |
| `is_system` | BOOLEAN | No | System roles cannot be deleted |
| *(base fields)* | | | |

**Predefined system roles:**

| Slug | Scope | Description |
|------|-------|-------------|
| `super_admin` | GLOBAL | Full platform access |
| `company_admin` | COMPANY | Company-wide, all branches |
| `regional_manager` | BRANCH | Assigned branch group |
| `branch_manager` | BRANCH | Own branch only |
| `store_staff` | BRANCH | Own branch, limited actions |
| `hr_manager` | COMPANY | HR data across company |
| `finance_manager` | COMPANY | Finance data across company |
| `inventory_manager` | BRANCH | Inventory for own branch |
| `sales_executive` | BRANCH | CRM and sales for own branch |
| `recruiter` | COMPANY | Recruitment module |
| `franchise_admin` | FRANCHISE | Own franchise branch |
| `franchise_partner` | FRANCHISE | Applicant/partner view |
| `vendor` | SELF | Own work orders |
| `karigar` | SELF | Own assignments |
| `customer` | SELF | Own account data |

---

### `permissions`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `module` | VARCHAR(60) | No | e.g. `inventory`, `crm`, `hr` |
| `resource` | VARCHAR(60) | No | e.g. `jewellery_items`, `leads` |
| `action` | ENUM | No | `CREATE` · `READ` · `UPDATE` · `DELETE` · `APPROVE` · `EXPORT` · `ASSIGN` |
| `description` | TEXT | Yes | — |
| *(base fields)* | | | |

**Indexes:** `UNIQUE (module, resource, action)`

---

### `role_permissions`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `role_id` | UUID FK → `roles` | No | — |
| `permission_id` | UUID FK → `permissions` | No | — |
| `conditions_json` | JSONB | Yes | Optional row-level conditions |
| *(base fields)* | | | |

---

### `user_roles`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `user_id` | UUID FK → `users` | No | — |
| `role_id` | UUID FK → `roles` | No | — |
| `branch_id` | UUID FK → `branches` | Yes | NULL = company-wide scope |
| `franchise_id` | UUID FK → `franchise_agreements` | Yes | NULL if not franchise-scoped |
| `granted_by` | UUID FK → `users` | No | — |
| `granted_at` | TIMESTAMPTZ | No | — |
| `expires_at` | TIMESTAMPTZ | Yes | NULL = permanent |
| `revoked_at` | TIMESTAMPTZ | Yes | — |
| `revoked_by` | UUID FK → `users` | Yes | — |
| *(base fields)* | | | |

---

### `sessions`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `user_id` | UUID FK → `users` | No | — |
| `token_hash` | VARCHAR(255) | No | SHA-256 of the JWT / session token |
| `device_name` | VARCHAR(120) | Yes | e.g. `Chrome / Windows` |
| `ip_address` | INET | Yes | — |
| `user_agent` | TEXT | Yes | — |
| `expires_at` | TIMESTAMPTZ | No | — |
| `revoked_at` | TIMESTAMPTZ | Yes | — |
| `last_active_at` | TIMESTAMPTZ | No | — |
| *(base fields)* | | | |

---

## Domain 2 — Organization

> **Scope:** GLOBAL / COMPANY  
> **Audit:** All structural writes (branch creation, manager changes)

---

### `company`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | Single row for WHPS corporate entity |
| `legal_name` | VARCHAR(200) | No | — |
| `trade_name` | VARCHAR(200) | No | — |
| `gst_number` | VARCHAR(20) | Yes | — |
| `pan_number` | VARCHAR(20) | Yes | — |
| `cin_number` | VARCHAR(25) | Yes | — |
| `logo_url` | TEXT | Yes | — |
| `registered_address` | JSONB | No | `{line1, line2, city, state, pincode, country}` |
| `corporate_phone` | VARCHAR(20) | Yes | — |
| `corporate_email` | VARCHAR(200) | Yes | — |
| `fiscal_year_start_month` | SMALLINT | No | Default `4` (April) |
| *(base fields)* | | | |

---

### `branches`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `company_id` | UUID FK → `company` | No | — |
| `name` | VARCHAR(150) | No | e.g. `WHPS Andheri West` |
| `code` | VARCHAR(20) | No | Short identifier e.g. `AWB` |
| `type` | ENUM | No | `CORPORATE` · `FRANCHISE` · `POPUP` |
| `status` | ENUM | No | `ACTIVE` · `INACTIVE` · `UNDER_SETUP` · `CLOSED` |
| `address` | JSONB | No | `{line1, line2, city, state, pincode}` |
| `latitude` | NUMERIC(10,7) | Yes | — |
| `longitude` | NUMERIC(10,7) | Yes | — |
| `phone` | VARCHAR(20) | Yes | — |
| `email` | VARCHAR(200) | Yes | — |
| `manager_id` | UUID FK → `users` | Yes | Branch Manager user |
| `opened_on` | DATE | Yes | — |
| `gst_number` | VARCHAR(20) | Yes | Branch-level GST if applicable |
| `operational_hours` | JSONB | Yes | `{mon: {open, close}, ...}` |
| `target_monthly_revenue` | NUMERIC(14,2) | Yes | — |
| *(base fields)* | | | |

**Indexes:** `UNIQUE (code)`, `INDEX (type, status)`, `INDEX (manager_id)`

---

### `departments`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `name` | VARCHAR(100) | No | e.g. `Sales`, `Accounts`, `Repairs` |
| `parent_id` | UUID FK → `departments` | Yes | For sub-departments |
| *(base fields)* | | | |

---

### `designations`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `name` | VARCHAR(100) | No | e.g. `Store Manager`, `Sales Executive` |
| `department_id` | UUID FK → `departments` | No | — |
| `grade` | VARCHAR(20) | Yes | e.g. `L3`, `M2` |
| `min_salary` | NUMERIC(14,2) | Yes | — |
| `max_salary` | NUMERIC(14,2) | Yes | — |
| *(base fields)* | | | |

---

### `shifts`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `name` | VARCHAR(80) | No | e.g. `Morning`, `Evening` |
| `start_time` | TIME | No | — |
| `end_time` | TIME | No | — |
| `grace_minutes` | SMALLINT | No | Default `10` |
| *(base fields)* | | | |

---

## Domain 3 — Customers

> **Scope:** COMPANY (customers are shared; visits may be at specific branches)  
> **Audit:** Profile changes, consent changes  
> **RBAC:** `sales_executive`, `branch_manager`, `company_admin`, `customer` (own data)

---

### `customers`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `user_id` | UUID FK → `users` | Yes | Set when customer has a portal account |
| `name` | VARCHAR(150) | No | — |
| `phone` | VARCHAR(20) | No | Primary contact |
| `alternate_phone` | VARCHAR(20) | Yes | — |
| `email` | VARCHAR(200) | Yes | — |
| `dob` | DATE | Yes | For birthday campaigns |
| `anniversary` | DATE | Yes | For anniversary campaigns |
| `gender` | ENUM | Yes | `MALE` · `FEMALE` · `OTHER` · `PREFER_NOT_TO_SAY` |
| `kyc_status` | ENUM | No | `PENDING` · `SUBMITTED` · `VERIFIED` · `REJECTED` |
| `kyc_verified_at` | TIMESTAMPTZ | Yes | — |
| `kyc_verified_by` | UUID FK → `users` | Yes | — |
| `segment` | ENUM | Yes | `WALK_IN` · `LOYALTY` · `VIP` · `DORMANT` · `BRIDAL` · `WHOLESALE` |
| `loyalty_tier` | ENUM | Yes | `BRONZE` · `SILVER` · `GOLD` · `PLATINUM` |
| `loyalty_points` | INTEGER | No | Default `0` |
| `customer_since` | DATE | Yes | Date of first purchase |
| `primary_branch_id` | UUID FK → `branches` | Yes | Branch most associated with |
| `referred_by` | UUID FK → `customers` | Yes | — |
| `acquisition_source` | ENUM | Yes | `WEBSITE` · `WALK_IN` · `WHATSAPP` · `REFERRAL` · `SOCIAL` · `EVENT` · `FRANCHISE` |
| `notes` | TEXT | Yes | Internal CRM notes |
| `is_blocked` | BOOLEAN | No | Default `false` |
| *(base fields)* | | | |

**Indexes:** `INDEX (phone)`, `INDEX (email)`, `INDEX (loyalty_tier)`, `INDEX (primary_branch_id)`

---

### `customer_addresses`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `customer_id` | UUID FK → `customers` | No | — |
| `label` | VARCHAR(50) | Yes | `Home`, `Office`, etc. |
| `type` | ENUM | No | `HOME` · `WORK` · `OTHER` |
| `line1` | VARCHAR(200) | No | — |
| `line2` | VARCHAR(200) | Yes | — |
| `city` | VARCHAR(100) | No | — |
| `state` | VARCHAR(100) | No | — |
| `pincode` | VARCHAR(10) | No | — |
| `country` | VARCHAR(60) | No | Default `India` |
| `is_default` | BOOLEAN | No | Default `false` |
| *(base fields)* | | | |

---

### `customer_preferences`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `customer_id` | UUID FK → `customers` | No | UNIQUE |
| `preferred_metals` | TEXT[] | Yes | e.g. `['gold', 'platinum']` |
| `preferred_categories` | UUID[] | Yes | FK → `categories.id` |
| `preferred_purity` | TEXT[] | Yes | e.g. `['22KT', '18KT']` |
| `budget_min` | NUMERIC(14,2) | Yes | — |
| `budget_max` | NUMERIC(14,2) | Yes | — |
| `occasions` | TEXT[] | Yes | e.g. `['bridal', 'gifting']` |
| `communication_channels` | TEXT[] | No | `['whatsapp', 'email', 'sms']` |
| `contact_time_preference` | ENUM | Yes | `MORNING` · `AFTERNOON` · `EVENING` · `ANYTIME` |
| `language_preference` | VARCHAR(20) | Yes | Default `en` |
| *(base fields)* | | | |

---

### `customer_consents`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `customer_id` | UUID FK → `customers` | No | — |
| `channel` | ENUM | No | `EMAIL` · `SMS` · `WHATSAPP` · `PUSH` · `CALL` |
| `purpose` | ENUM | No | `MARKETING` · `TRANSACTIONAL` · `UPDATES` |
| `consented` | BOOLEAN | No | — |
| `consented_at` | TIMESTAMPTZ | Yes | — |
| `withdrawn_at` | TIMESTAMPTZ | Yes | — |
| `source` | VARCHAR(100) | Yes | e.g. `website_signup`, `in_store` |
| *(base fields)* | | | |

---

## Domain 4 — Products & Jewellery Items

> **Scope:** COMPANY (products); BRANCH (inventory stock and items)  
> **Audit:** All item-level changes, price changes, status changes  
> **Key distinction:** `products` is the template/catalogue; `jewellery_items` is the physical item with a unique tag.

---

### `categories`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `name` | VARCHAR(100) | No | e.g. `Necklaces`, `Rings`, `Earrings` |
| `slug` | VARCHAR(100) | No | URL-safe, unique |
| `parent_id` | UUID FK → `categories` | Yes | For subcategories |
| `icon_url` | TEXT | Yes | — |
| `display_order` | SMALLINT | No | Default `0` |
| `is_active` | BOOLEAN | No | Default `true` |
| *(base fields)* | | | |

---

### `collections`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `name` | VARCHAR(150) | No | e.g. `Bridal 2025`, `Diwali Collection` |
| `theme` | TEXT | Yes | — |
| `cover_image_url` | TEXT | Yes | — |
| `launch_date` | DATE | Yes | — |
| `end_date` | DATE | Yes | — |
| `is_active` | BOOLEAN | No | Default `true` |
| *(base fields)* | | | |

---

### `products`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `sku` | VARCHAR(60) | No | Company-wide SKU, unique |
| `name` | VARCHAR(200) | No | — |
| `category_id` | UUID FK → `categories` | No | — |
| `collection_id` | UUID FK → `collections` | Yes | — |
| `metal_type` | ENUM | No | `GOLD` · `SILVER` · `PLATINUM` · `MIXED` |
| `purity` | VARCHAR(20) | No | e.g. `22KT`, `18KT`, `925` |
| `making_charge_type` | ENUM | No | `PERCENT_ON_WEIGHT` · `FLAT` · `PER_GRAM` |
| `making_charge_value` | NUMERIC(10,2) | No | — |
| `wastage_percent` | NUMERIC(5,2) | Yes | — |
| `has_stones` | BOOLEAN | No | Default `false` |
| `stone_description` | TEXT | Yes | — |
| `gender` | ENUM | Yes | `MALE` · `FEMALE` · `UNISEX` · `KIDS` |
| `occasion_tags` | TEXT[] | Yes | e.g. `['bridal', 'daily_wear']` |
| `description` | TEXT | Yes | — |
| `status` | ENUM | No | `ACTIVE` · `DISCONTINUED` · `DRAFT` |
| `is_customizable` | BOOLEAN | No | Default `false` |
| `min_weight_gm` | NUMERIC(10,3) | Yes | For custom/made-to-order |
| `max_weight_gm` | NUMERIC(10,3) | Yes | — |
| *(base fields)* | | | |

**Indexes:** `UNIQUE (sku)`, `INDEX (category_id, status)`, `INDEX (metal_type, purity)`

---

### `jewellery_items`

> The **physical item** — one row per piece with a unique tag/HUID.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `product_id` | UUID FK → `products` | No | Catalogue template |
| `item_code` | VARCHAR(60) | No | Internal tag number, unique per company |
| `huid` | VARCHAR(20) | Yes | BIS Hallmark Unique ID |
| `batch_no` | VARCHAR(60) | Yes | Manufacturing batch |
| `metal_type` | ENUM | No | Overrides product if set |
| `purity` | VARCHAR(20) | No | e.g. `22KT` |
| `gross_weight_gm` | NUMERIC(10,3) | No | Total weight including stones/components |
| `net_weight_gm` | NUMERIC(10,3) | No | Metal weight only |
| `stone_weight_gm` | NUMERIC(10,3) | Yes | — |
| `stone_description` | TEXT | Yes | e.g. `Emerald 2 ct, Diamond 0.5 ct` |
| `making_charge` | NUMERIC(14,2) | No | At time of entry |
| `wastage_percent` | NUMERIC(5,2) | Yes | — |
| `tag_price` | NUMERIC(14,2) | No | Price at time of entry / last valuation |
| `cost_price` | NUMERIC(14,2) | Yes | Procurement / manufacturing cost |
| `status` | ENUM | No | `IN_STOCK` · `RESERVED` · `SOLD` · `IN_REPAIR` · `IN_TRANSIT` · `RETURNED` · `LOST` · `SCRAPPED` |
| `branch_id` | UUID FK → `branches` | No | Current owner branch |
| `location_id` | UUID FK → `inventory_locations` | Yes | Current physical location |
| `vendor_id` | UUID FK → `vendors` | Yes | Source vendor / karigar |
| `received_at` | DATE | No | Date item entered inventory |
| `po_id` | UUID FK → `purchase_orders` | Yes | If procured via PO |
| `is_hallmarked` | BOOLEAN | No | Default `false` |
| `hallmarked_at` | DATE | Yes | — |
| `is_certified` | BOOLEAN | No | Default `false` |
| `age_days` | INTEGER | Yes | Computed: `NOW() - received_at` (populated by job) |
| *(base fields)* | | | |

**Indexes:** `UNIQUE (item_code)`, `UNIQUE (huid)` where not null, `INDEX (status, branch_id)`, `INDEX (product_id)`, `INDEX (location_id)`

---

### `product_media`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `product_id` | UUID FK → `products` | Yes | Catalogue-level image |
| `item_id` | UUID FK → `jewellery_items` | Yes | Item-specific image |
| `url` | TEXT | No | Storage URL |
| `type` | ENUM | No | `IMAGE` · `VIDEO` · `THREE_D` |
| `is_primary` | BOOLEAN | No | Default `false` |
| `display_order` | SMALLINT | No | — |
| `uploaded_by` | UUID FK → `users` | No | — |
| *(base fields)* | | | |

---

### `certificates`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `item_id` | UUID FK → `jewellery_items` | No | — |
| `type` | ENUM | No | `HALLMARK` · `BIS` · `LAB` · `INVOICE` · `VALUATION` |
| `cert_number` | VARCHAR(100) | No | — |
| `issued_by` | VARCHAR(150) | No | e.g. `BIS`, `IGI`, `GIA` |
| `issued_at` | DATE | No | — |
| `valid_until` | DATE | Yes | — |
| `document_url` | TEXT | No | — |
| *(base fields)* | | | |

---

### `hallmark_records`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `item_id` | UUID FK → `jewellery_items` | No | — |
| `huid` | VARCHAR(20) | No | — |
| `purity_verified` | VARCHAR(20) | No | — |
| `center_code` | VARCHAR(30) | Yes | BIS Assaying Centre code |
| `hallmarked_at` | DATE | No | — |
| `certificate_url` | TEXT | Yes | — |
| *(base fields)* | | | |

---

## Domain 5 — Inventory

> **Scope:** BRANCH  
> **Audit:** Every movement, every status change  
> **Key rule:** `inventory_movements` is the ledger. Current state is derived from it (or cached in `inventory_stock`).

---

### `inventory_locations`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `name` | VARCHAR(100) | No | e.g. `Vault A`, `Front Showcase 3` |
| `code` | VARCHAR(30) | No | — |
| `type` | ENUM | No | `VAULT` · `SHOWCASE` · `LOCKER` · `TRAY` · `TRANSIT` · `REPAIR_BENCH` · `CUSTOM_ORDER_HOLD` |
| `capacity` | SMALLINT | Yes | Max item count |
| `current_count` | INTEGER | No | Denormalized, kept in sync |
| `status` | ENUM | No | `ACTIVE` · `INACTIVE` · `MAINTENANCE` |
| `notes` | TEXT | Yes | — |
| *(base fields)* | | | |

**Indexes:** `UNIQUE (branch_id, code)`

---

### `inventory_stock`

> Current position — one row per item. Kept in sync with movements.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `item_id` | UUID FK → `jewellery_items` | No | UNIQUE |
| `branch_id` | UUID FK → `branches` | No | — |
| `location_id` | UUID FK → `inventory_locations` | Yes | Current location |
| `status` | ENUM | No | Mirror of `jewellery_items.status` |
| `as_of` | TIMESTAMPTZ | No | Last sync time |
| *(base fields)* | | | |

---

### `inventory_movements`

> The append-only ledger. Never updated or deleted.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `item_id` | UUID FK → `jewellery_items` | No | — |
| `movement_type` | ENUM | No | `INTAKE` · `VAULT_TO_SHOWCASE` · `SHOWCASE_TO_VAULT` · `TRANSFER_OUT` · `TRANSFER_IN` · `SALE` · `RETURN` · `SENT_FOR_REPAIR` · `RETURNED_FROM_REPAIR` · `CUSTOM_ORDER_HOLD` · `SCRAP` · `LOSS_WRITE_OFF` · `ADJUSTMENT` |
| `from_branch_id` | UUID FK → `branches` | Yes | — |
| `to_branch_id` | UUID FK → `branches` | Yes | — |
| `from_location_id` | UUID FK → `inventory_locations` | Yes | — |
| `to_location_id` | UUID FK → `inventory_locations` | Yes | — |
| `reference_type` | VARCHAR(60) | Yes | `sale` · `transfer` · `repair_ticket` · `purchase_order` |
| `reference_id` | UUID | Yes | FK to the referenced entity |
| `moved_by` | UUID FK → `users` | No | — |
| `moved_at` | TIMESTAMPTZ | No | — |
| `notes` | TEXT | Yes | — |
| `item_value_at_move` | NUMERIC(14,2) | Yes | Snapshot of tag price at time of move |
| *(created_at, created_by only — no updates)* | | | |

**Indexes:** `INDEX (item_id)`, `INDEX (moved_at)`, `INDEX (movement_type)`, `INDEX (reference_type, reference_id)`

---

### `reservations`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `item_id` | UUID FK → `jewellery_items` | No | — |
| `customer_id` | UUID FK → `customers` | No | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `lead_id` | UUID FK → `leads` | Yes | — |
| `appointment_id` | UUID FK → `appointments` | Yes | — |
| `reserved_by` | UUID FK → `users` | No | Staff member |
| `reserved_at` | TIMESTAMPTZ | No | — |
| `expires_at` | TIMESTAMPTZ | No | — |
| `status` | ENUM | No | `ACTIVE` · `CONVERTED_TO_SALE` · `EXPIRED` · `CANCELLED` |
| `notes` | TEXT | Yes | — |
| *(base fields)* | | | |

---

### `stock_transfers`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `transfer_no` | VARCHAR(40) | No | Human-readable reference |
| `from_branch_id` | UUID FK → `branches` | No | — |
| `to_branch_id` | UUID FK → `branches` | No | — |
| `initiated_by` | UUID FK → `users` | No | — |
| `approved_by` | UUID FK → `users` | Yes | — |
| `dispatched_by` | UUID FK → `users` | Yes | — |
| `received_by` | UUID FK → `users` | Yes | — |
| `status` | ENUM | No | `DRAFT` · `PENDING_APPROVAL` · `APPROVED` · `DISPATCHED` · `RECEIVED` · `DISPUTED` · `CANCELLED` |
| `dispatched_at` | TIMESTAMPTZ | Yes | — |
| `received_at` | TIMESTAMPTZ | Yes | — |
| `notes` | TEXT | Yes | — |
| `total_items` | INTEGER | No | — |
| `total_value` | NUMERIC(14,2) | Yes | — |
| *(base fields)* | | | |

---

### `stock_transfer_items`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `transfer_id` | UUID FK → `stock_transfers` | No | — |
| `item_id` | UUID FK → `jewellery_items` | No | — |
| `dispatch_status` | ENUM | No | `PENDING` · `DISPATCHED` · `RECEIVED` · `MISSING` · `DAMAGED` |
| `notes` | TEXT | Yes | — |
| *(base fields)* | | | |

---

### `stock_reconciliations`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `location_id` | UUID FK → `inventory_locations` | Yes | Null = full branch |
| `initiated_by` | UUID FK → `users` | No | — |
| `approved_by` | UUID FK → `users` | Yes | — |
| `status` | ENUM | No | `IN_PROGRESS` · `COMPLETED` · `DISPUTED` · `APPROVED` |
| `started_at` | TIMESTAMPTZ | No | — |
| `completed_at` | TIMESTAMPTZ | Yes | — |
| `system_count` | INTEGER | Yes | — |
| `physical_count` | INTEGER | Yes | — |
| `variance_count` | INTEGER | Yes | — |
| `variance_value` | NUMERIC(14,2) | Yes | — |
| `notes` | TEXT | Yes | — |
| *(base fields)* | | | |

---

## Domain 6 — CRM

> **Scope:** BRANCH (leads are owned by branch; customers are shared)  
> **Audit:** Lead status changes, follow-up outcomes, appointment changes

---

### `leads`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `customer_id` | UUID FK → `customers` | Yes | NULL until customer record created |
| `branch_id` | UUID FK → `branches` | No | Originating branch |
| `name` | VARCHAR(150) | No | Denormalized if customer not yet created |
| `phone` | VARCHAR(20) | No | — |
| `email` | VARCHAR(200) | Yes | — |
| `source` | ENUM | No | `WEBSITE` · `WHATSAPP` · `WALK_IN` · `REFERRAL` · `SOCIAL` · `CALL` · `EVENT` · `FRANCHISE` |
| `source_detail` | VARCHAR(200) | Yes | e.g. UTM campaign, referrer name |
| `interest` | TEXT[] | Yes | Category IDs or free-text interest notes |
| `budget_min` | NUMERIC(14,2) | Yes | — |
| `budget_max` | NUMERIC(14,2) | Yes | — |
| `status` | ENUM | No | `NEW` · `CONTACTED` · `INTERESTED` · `APPOINTMENT_SCHEDULED` · `VISITED` · `QUOTATION_SENT` · `NEGOTIATION` · `CONVERTED` · `LOST` · `DORMANT` |
| `assigned_to` | UUID FK → `users` | Yes | Sales executive |
| `lost_reason` | TEXT | Yes | Populated on LOST |
| `priority` | ENUM | No | `LOW` · `MEDIUM` · `HIGH` · `VIP` |
| `next_action_at` | TIMESTAMPTZ | Yes | — |
| `converted_at` | TIMESTAMPTZ | Yes | — |
| `converted_sale_id` | UUID FK → `sales` | Yes | — |
| *(base fields)* | | | |

**Indexes:** `INDEX (status, branch_id)`, `INDEX (assigned_to)`, `INDEX (customer_id)`

---

### `lead_interactions`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `lead_id` | UUID FK → `leads` | No | — |
| `type` | ENUM | No | `CALL` · `WHATSAPP` · `EMAIL` · `VISIT` · `QUOTATION` · `NOTE` |
| `direction` | ENUM | No | `INBOUND` · `OUTBOUND` |
| `notes` | TEXT | Yes | — |
| `duration_seconds` | INTEGER | Yes | For calls |
| `done_by` | UUID FK → `users` | No | — |
| `done_at` | TIMESTAMPTZ | No | — |
| `next_action_at` | TIMESTAMPTZ | Yes | — |
| `outcome` | VARCHAR(200) | Yes | Brief outcome |
| *(base fields)* | | | |

---

### `appointments`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `customer_id` | UUID FK → `customers` | Yes | — |
| `lead_id` | UUID FK → `leads` | Yes | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `scheduled_at` | TIMESTAMPTZ | No | — |
| `duration_minutes` | SMALLINT | No | Default `60` |
| `purpose` | ENUM | No | `BROWSE` · `QUOTATION` · `TRIAL` · `CUSTOM_ORDER` · `REPAIR_DROPOFF` · `REPAIR_PICKUP` · `SCHEME_ENROLL` |
| `status` | ENUM | No | `SCHEDULED` · `CONFIRMED` · `RESCHEDULED` · `COMPLETED` · `NO_SHOW` · `CANCELLED` |
| `assigned_to` | UUID FK → `users` | Yes | Staff member |
| `walk_in` | BOOLEAN | No | Default `false` — true for same-day unscheduled visits |
| `notes` | TEXT | Yes | — |
| `outcome_notes` | TEXT | Yes | Filled after completion |
| `reminder_sent` | BOOLEAN | No | Default `false` |
| *(base fields)* | | | |

---

### `segments`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `name` | VARCHAR(100) | No | — |
| `description` | TEXT | Yes | — |
| `type` | ENUM | No | `STATIC` · `DYNAMIC` |
| `criteria_json` | JSONB | Yes | Rules for dynamic segments |
| `customer_count` | INTEGER | Yes | Denormalized, refreshed periodically |
| `last_computed_at` | TIMESTAMPTZ | Yes | — |
| *(base fields)* | | | |

---

### `customer_segments`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `customer_id` | UUID FK → `customers` | No | — |
| `segment_id` | UUID FK → `segments` | No | — |
| `added_at` | TIMESTAMPTZ | No | — |
| `added_by` | VARCHAR(50) | Yes | `manual` or `system_job` |
| *(base fields)* | | | |

---

## Domain 7 — Sales

> **Scope:** BRANCH  
> **Audit:** All quote/sale/payment/discount events  
> **Money rule:** All amounts in INR, `NUMERIC(14,2)`

---

### `quotations`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `quotation_no` | VARCHAR(40) | No | Unique, human-readable |
| `customer_id` | UUID FK → `customers` | No | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `lead_id` | UUID FK → `leads` | Yes | — |
| `appointment_id` | UUID FK → `appointments` | Yes | — |
| `created_by` | UUID FK → `users` | No | Sales executive |
| `status` | ENUM | No | `DRAFT` · `SENT` · `ACCEPTED` · `REJECTED` · `EXPIRED` · `CONVERTED` |
| `valid_until` | DATE | No | — |
| `metal_rate_date` | DATE | No | Gold rate used for pricing |
| `metal_rate_22kt` | NUMERIC(10,2) | Yes | Per gram at time of quote |
| `subtotal` | NUMERIC(14,2) | No | Before discounts |
| `discount_amount` | NUMERIC(14,2) | No | Default `0` |
| `gst_amount` | NUMERIC(14,2) | No | — |
| `total_amount` | NUMERIC(14,2) | No | Final quoted amount |
| `notes` | TEXT | Yes | — |
| `customer_remarks` | TEXT | Yes | Customer feedback/response |
| `converted_sale_id` | UUID FK → `sales` | Yes | — |
| *(base fields)* | | | |

---

### `quotation_items`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `quotation_id` | UUID FK → `quotations` | No | — |
| `item_id` | UUID FK → `jewellery_items` | No | — |
| `listed_price` | NUMERIC(14,2) | No | Tag price at time of quote |
| `discount_type` | ENUM | Yes | `PERCENTAGE` · `FLAT` |
| `discount_value` | NUMERIC(10,2) | Yes | — |
| `discounted_price` | NUMERIC(14,2) | No | — |
| `notes` | TEXT | Yes | — |
| *(base fields)* | | | |

---

### `sales`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `sale_no` | VARCHAR(40) | No | Unique invoice-like reference |
| `quotation_id` | UUID FK → `quotations` | Yes | — |
| `customer_id` | UUID FK → `customers` | No | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `sale_type` | ENUM | No | `PURCHASE` · `EXCHANGE` · `SCHEME_REDEMPTION` · `CUSTOM_ORDER_DELIVERY` |
| `sale_date` | DATE | No | — |
| `metal_rate_date` | DATE | No | — |
| `metal_rate_22kt` | NUMERIC(10,2) | Yes | — |
| `subtotal` | NUMERIC(14,2) | No | — |
| `discount_amount` | NUMERIC(14,2) | No | Default `0` |
| `gst_amount` | NUMERIC(14,2) | No | — |
| `total_amount` | NUMERIC(14,2) | No | Final payable |
| `amount_paid` | NUMERIC(14,2) | No | Total received |
| `balance_due` | NUMERIC(14,2) | No | `total_amount - amount_paid` |
| `payment_status` | ENUM | No | `PENDING` · `PARTIAL` · `PAID` · `OVERPAID` · `REFUNDED` |
| `pos_reference` | VARCHAR(100) | Yes | External POS transaction ID |
| `salesperson_id` | UUID FK → `users` | No | — |
| `notes` | TEXT | Yes | — |
| *(base fields)* | | | |

**Indexes:** `UNIQUE (sale_no)`, `INDEX (customer_id)`, `INDEX (branch_id, sale_date)`, `INDEX (payment_status)`

---

### `sale_items`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `sale_id` | UUID FK → `sales` | No | — |
| `item_id` | UUID FK → `jewellery_items` | No | — |
| `unit_price` | NUMERIC(14,2) | No | At time of sale |
| `discount_amount` | NUMERIC(14,2) | No | Default `0` |
| `gst_rate` | NUMERIC(5,2) | No | e.g. `3.00` for 3% |
| `gst_amount` | NUMERIC(14,2) | No | — |
| `final_price` | NUMERIC(14,2) | No | — |
| *(base fields)* | | | |

---

### `invoices`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `sale_id` | UUID FK → `sales` | No | UNIQUE |
| `invoice_no` | VARCHAR(40) | No | — |
| `invoice_date` | DATE | No | — |
| `gst_type` | ENUM | No | `CGST_SGST` · `IGST` |
| `pdf_url` | TEXT | Yes | Generated PDF |
| `sent_at` | TIMESTAMPTZ | Yes | When sent to customer |
| *(base fields)* | | | |

---

### `payments`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `sale_id` | UUID FK → `sales` | No | — |
| `amount` | NUMERIC(14,2) | No | — |
| `method` | ENUM | No | `CASH` · `CARD` · `UPI` · `BANK_TRANSFER` · `SCHEME_BALANCE` · `LOYALTY_POINTS` · `CHEQUE` |
| `reference_no` | VARCHAR(150) | Yes | Transaction / UTR / cheque no. |
| `gateway` | VARCHAR(60) | Yes | e.g. `razorpay`, `payu` |
| `gateway_order_id` | VARCHAR(150) | Yes | — |
| `gateway_payment_id` | VARCHAR(150) | Yes | — |
| `status` | ENUM | No | `PENDING` · `CAPTURED` · `FAILED` · `REFUNDED` |
| `paid_at` | TIMESTAMPTZ | No | — |
| `captured_by` | UUID FK → `users` | Yes | Staff who recorded cash payment |
| `notes` | TEXT | Yes | — |
| *(base fields)* | | | |

---

### `discounts`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `sale_id` | UUID FK → `sales` | Yes | — |
| `quotation_id` | UUID FK → `quotations` | Yes | — |
| `type` | ENUM | No | `PERCENTAGE` · `FLAT` · `MAKING_WAIVER` · `LOYALTY_REDEMPTION` |
| `value` | NUMERIC(10,2) | No | — |
| `amount` | NUMERIC(14,2) | No | Computed value in INR |
| `reason` | TEXT | No | — |
| `requested_by` | UUID FK → `users` | No | — |
| `approved_by` | UUID FK → `users` | Yes | NULL if within auto-approve threshold |
| `status` | ENUM | No | `PENDING` · `APPROVED` · `REJECTED` · `AUTO_APPROVED` |
| `approved_at` | TIMESTAMPTZ | Yes | — |
| *(base fields)* | | | |

---

### `exchanges`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `customer_id` | UUID FK → `customers` | No | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `sale_id` | UUID FK → `sales` | Yes | The new purchase |
| `old_item_description` | TEXT | No | Describe the item given in |
| `old_item_metal` | ENUM | No | `GOLD` · `SILVER` · `PLATINUM` · `MIXED` |
| `old_item_purity` | VARCHAR(20) | No | — |
| `old_item_gross_weight_gm` | NUMERIC(10,3) | No | — |
| `old_item_net_weight_gm` | NUMERIC(10,3) | No | — |
| `assessed_value` | NUMERIC(14,2) | No | Value given for exchange |
| `assessed_by` | UUID FK → `users` | No | — |
| `balance_to_pay` | NUMERIC(14,2) | No | `new_sale_total - assessed_value` |
| `old_item_received_at` | TIMESTAMPTZ | No | — |
| `old_item_disposition` | ENUM | Yes | `MELTED` · `RESOLD` · `RETURNED_TO_VENDOR` |
| *(base fields)* | | | |

---

### `refunds`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `sale_id` | UUID FK → `sales` | No | — |
| `payment_id` | UUID FK → `payments` | Yes | — |
| `amount` | NUMERIC(14,2) | No | — |
| `reason` | TEXT | No | — |
| `method` | ENUM | No | `ORIGINAL_METHOD` · `BANK_TRANSFER` · `STORE_CREDIT` |
| `status` | ENUM | No | `PENDING` · `APPROVED` · `PROCESSED` · `REJECTED` |
| `initiated_by` | UUID FK → `users` | No | — |
| `approved_by` | UUID FK → `users` | Yes | — |
| `processed_at` | TIMESTAMPTZ | Yes | — |
| `gateway_refund_id` | VARCHAR(150) | Yes | — |
| *(base fields)* | | | |

---

### `loyalty_schemes`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `name` | VARCHAR(150) | No | e.g. `Monthly Gold Scheme` |
| `type` | ENUM | No | `MONTHLY_DEPOSIT` · `WEIGHT_BASED` · `POINTS` |
| `duration_months` | SMALLINT | No | — |
| `installment_amount` | NUMERIC(14,2) | Yes | — |
| `bonus_month` | SMALLINT | Yes | Month number company contributes |
| `terms` | TEXT | Yes | — |
| `status` | ENUM | No | `ACTIVE` · `CLOSED` · `DISCONTINUED` |
| *(base fields)* | | | |

---

### `customer_scheme_enrollments`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `customer_id` | UUID FK → `customers` | No | — |
| `scheme_id` | UUID FK → `loyalty_schemes` | No | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `enrolled_at` | DATE | No | — |
| `maturity_date` | DATE | No | — |
| `monthly_amount` | NUMERIC(14,2) | No | — |
| `total_paid` | NUMERIC(14,2) | No | Running total |
| `status` | ENUM | No | `ACTIVE` · `MATURED` · `REDEEMED` · `CANCELLED` |
| `redeemed_sale_id` | UUID FK → `sales` | Yes | — |
| *(base fields)* | | | |

---

## Domain 8 — HR

> **Scope:** BRANCH (employee is assigned to a branch); HR data visible to HR Manager and above  
> **Audit:** Salary changes, status changes, leave approvals

---

### `employees`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `user_id` | UUID FK → `users` | No | UNIQUE — employee must have login |
| `application_id` | UUID FK → `job_applications` | Yes | Linked from recruitment |
| `employee_code` | VARCHAR(30) | No | Unique company-wide |
| `branch_id` | UUID FK → `branches` | No | Primary branch |
| `department_id` | UUID FK → `departments` | No | — |
| `designation_id` | UUID FK → `designations` | No | — |
| `employment_type` | ENUM | No | `PERMANENT` · `PROBATION` · `CONTRACT` · `INTERN` · `PART_TIME` |
| `status` | ENUM | No | `ACTIVE` · `INACTIVE` · `RESIGNED` · `TERMINATED` · `ON_LEAVE` |
| `joined_at` | DATE | No | — |
| `probation_end_date` | DATE | Yes | — |
| `confirmed_at` | DATE | Yes | — |
| `reports_to` | UUID FK → `employees` | Yes | Manager |
| `salary_structure_id` | UUID FK → `salary_structures` | No | — |
| `current_ctc` | NUMERIC(14,2) | No | Annual CTC |
| `bank_account_no` | VARCHAR(30) | Yes | Encrypted |
| `bank_ifsc` | VARCHAR(15) | Yes | — |
| `pan_number` | VARCHAR(15) | Yes | Encrypted |
| `pf_number` | VARCHAR(30) | Yes | — |
| `esi_number` | VARCHAR(30) | Yes | — |
| `exit_date` | DATE | Yes | — |
| `exit_reason` | TEXT | Yes | — |
| *(base fields)* | | | |

**Indexes:** `UNIQUE (employee_code)`, `UNIQUE (user_id)`, `INDEX (branch_id, status)`, `INDEX (department_id)`

---

### `attendance`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `employee_id` | UUID FK → `employees` | No | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `date` | DATE | No | — |
| `shift_id` | UUID FK → `shifts` | Yes | — |
| `check_in` | TIMESTAMPTZ | Yes | — |
| `check_out` | TIMESTAMPTZ | Yes | — |
| `source` | ENUM | No | `BIOMETRIC` · `MANUAL` · `MOBILE` · `WFH` |
| `status` | ENUM | No | `PRESENT` · `ABSENT` · `LATE` · `HALF_DAY` · `ON_LEAVE` · `HOLIDAY` · `WEEK_OFF` |
| `late_minutes` | SMALLINT | Yes | — |
| `overtime_minutes` | SMALLINT | Yes | — |
| `approved_by` | UUID FK → `users` | Yes | For manual entries |
| `notes` | TEXT | Yes | — |
| *(base fields)* | | | |

**Indexes:** `UNIQUE (employee_id, date)`, `INDEX (date, branch_id)`

---

### `leave_types`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `name` | VARCHAR(80) | No | e.g. `Casual Leave`, `Sick Leave` |
| `code` | VARCHAR(10) | No | e.g. `CL`, `SL`, `EL` |
| `is_paid` | BOOLEAN | No | — |
| `max_days_per_year` | NUMERIC(5,1) | No | — |
| `carry_forward` | BOOLEAN | No | Default `false` |
| `max_carry_forward_days` | NUMERIC(5,1) | Yes | — |
| `requires_approval` | BOOLEAN | No | Default `true` |
| `advance_notice_days` | SMALLINT | Yes | — |
| `applicable_to` | ENUM | No | `ALL` · `PERMANENT` · `PROBATION` · `INTERN` |
| *(base fields)* | | | |

---

### `leave_requests`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `employee_id` | UUID FK → `employees` | No | — |
| `leave_type_id` | UUID FK → `leave_types` | No | — |
| `from_date` | DATE | No | — |
| `to_date` | DATE | No | — |
| `days` | NUMERIC(5,1) | No | — |
| `reason` | TEXT | Yes | — |
| `status` | ENUM | No | `PENDING` · `APPROVED` · `REJECTED` · `CANCELLED` |
| `approver_id` | UUID FK → `employees` | No | — |
| `approved_at` | TIMESTAMPTZ | Yes | — |
| `rejection_reason` | TEXT | Yes | — |
| `applied_at` | TIMESTAMPTZ | No | — |
| *(base fields)* | | | |

---

### `leave_balances`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `employee_id` | UUID FK → `employees` | No | — |
| `leave_type_id` | UUID FK → `leave_types` | No | — |
| `year` | SMALLINT | No | — |
| `allocated` | NUMERIC(5,1) | No | — |
| `used` | NUMERIC(5,1) | No | — |
| `carried_forward` | NUMERIC(5,1) | No | Default `0` |
| `remaining` | NUMERIC(5,1) | No | Computed |
| *(base fields)* | | | |

**Indexes:** `UNIQUE (employee_id, leave_type_id, year)`

---

### `salary_structures`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `name` | VARCHAR(100) | No | e.g. `L3 Executive Structure` |
| `basic_percent` | NUMERIC(5,2) | No | % of CTC |
| `hra_percent` | NUMERIC(5,2) | No | % of Basic |
| `allowances_json` | JSONB | Yes | `{name: amount_or_percent}` |
| `deductions_json` | JSONB | Yes | `{pf: percent, pt: amount}` |
| `effective_from` | DATE | No | — |
| *(base fields)* | | | |

---

### `payroll`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `employee_id` | UUID FK → `employees` | No | — |
| `month` | SMALLINT | No | 1–12 |
| `year` | SMALLINT | No | — |
| `working_days` | NUMERIC(5,1) | No | — |
| `present_days` | NUMERIC(5,1) | No | — |
| `leave_days` | NUMERIC(5,1) | No | — |
| `lop_days` | NUMERIC(5,1) | No | Loss of pay days |
| `basic` | NUMERIC(14,2) | No | — |
| `hra` | NUMERIC(14,2) | No | — |
| `allowances` | NUMERIC(14,2) | No | — |
| `gross` | NUMERIC(14,2) | No | — |
| `pf_employee` | NUMERIC(14,2) | No | — |
| `pf_employer` | NUMERIC(14,2) | No | — |
| `professional_tax` | NUMERIC(14,2) | No | — |
| `tds` | NUMERIC(14,2) | No | — |
| `other_deductions` | NUMERIC(14,2) | No | Default `0` |
| `total_deductions` | NUMERIC(14,2) | No | — |
| `net_pay` | NUMERIC(14,2) | No | — |
| `status` | ENUM | No | `DRAFT` · `FINALIZED` · `PAID` |
| `paid_at` | TIMESTAMPTZ | Yes | — |
| `slip_url` | TEXT | Yes | — |
| `processed_by` | UUID FK → `users` | Yes | — |
| *(base fields)* | | | |

**Indexes:** `UNIQUE (employee_id, month, year)`

---

### `performance_reviews`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `employee_id` | UUID FK → `employees` | No | — |
| `reviewer_id` | UUID FK → `employees` | No | — |
| `period_type` | ENUM | No | `MONTHLY` · `QUARTERLY` · `ANNUAL` · `PROBATION` |
| `period_start` | DATE | No | — |
| `period_end` | DATE | No | — |
| `ratings_json` | JSONB | No | `{criteria: score, ...}` |
| `self_assessment` | TEXT | Yes | — |
| `reviewer_comments` | TEXT | Yes | — |
| `overall_rating` | NUMERIC(3,1) | Yes | e.g. `4.2` out of `5.0` |
| `status` | ENUM | No | `SELF_ASSESSMENT` · `MANAGER_REVIEW` · `HR_REVIEW` · `COMPLETED` |
| `completed_at` | TIMESTAMPTZ | Yes | — |
| *(base fields)* | | | |

---

### `employee_targets`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `employee_id` | UUID FK → `employees` | No | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `month` | SMALLINT | No | — |
| `year` | SMALLINT | No | — |
| `target_type` | ENUM | No | `REVENUE` · `UNITS_SOLD` · `LEADS_CONVERTED` · `APPOINTMENTS_BOOKED` |
| `target_value` | NUMERIC(14,2) | No | — |
| `achieved_value` | NUMERIC(14,2) | Yes | Updated by system |
| `set_by` | UUID FK → `users` | No | — |
| *(base fields)* | | | |

---

### `training_records`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `employee_id` | UUID FK → `employees` | No | — |
| `training_name` | VARCHAR(200) | No | — |
| `type` | ENUM | No | `INTERNAL` · `EXTERNAL` · `ONLINE` · `CERTIFICATION` |
| `provider` | VARCHAR(150) | Yes | — |
| `started_at` | DATE | No | — |
| `completed_at` | DATE | Yes | — |
| `score` | NUMERIC(5,2) | Yes | — |
| `passed` | BOOLEAN | Yes | — |
| `certificate_url` | TEXT | Yes | — |
| *(base fields)* | | | |

---

## Domain 9 — Recruitment

> **Scope:** COMPANY (jobs); APPLICATION scoped to job  
> **Audit:** Status changes at every stage  
> **Flow:** `jobs` → `job_applications` → `assessments` → `interviews` → `offers` → `onboarding_tasks` → `employees`

---

### `jobs`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `branch_id` | UUID FK → `branches` | Yes | NULL = company-wide |
| `department_id` | UUID FK → `departments` | No | — |
| `designation_id` | UUID FK → `designations` | No | — |
| `title` | VARCHAR(200) | No | — |
| `type` | ENUM | No | `FULL_TIME` · `PART_TIME` · `INTERNSHIP` · `CONTRACT` |
| `description` | TEXT | No | — |
| `requirements` | TEXT | Yes | — |
| `min_experience_years` | SMALLINT | Yes | — |
| `max_experience_years` | SMALLINT | Yes | — |
| `min_education` | VARCHAR(100) | Yes | — |
| `vacancies` | SMALLINT | No | Default `1` |
| `salary_min` | NUMERIC(14,2) | Yes | — |
| `salary_max` | NUMERIC(14,2) | Yes | — |
| `location_city` | VARCHAR(100) | Yes | — |
| `status` | ENUM | No | `DRAFT` · `PUBLISHED` · `PAUSED` · `CLOSED` · `FILLED` |
| `published_at` | TIMESTAMPTZ | Yes | — |
| `closes_at` | DATE | Yes | — |
| `is_public` | BOOLEAN | No | Shown on website if `true` |
| *(base fields)* | | | |

---

### `job_applications`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `job_id` | UUID FK → `jobs` | No | — |
| `applicant_name` | VARCHAR(150) | No | — |
| `email` | VARCHAR(200) | No | — |
| `phone` | VARCHAR(20) | No | — |
| `resume_url` | TEXT | Yes | — |
| `cover_letter` | TEXT | Yes | — |
| `experience_years` | NUMERIC(4,1) | Yes | — |
| `current_ctc` | NUMERIC(14,2) | Yes | — |
| `expected_ctc` | NUMERIC(14,2) | Yes | — |
| `notice_period_days` | SMALLINT | Yes | — |
| `status` | ENUM | No | `APPLIED` · `SCREENING` · `ASSESSMENT` · `INTERVIEW` · `OFFER` · `JOINED` · `REJECTED` · `WITHDRAWN` |
| `screening_passed` | BOOLEAN | Yes | — |
| `screened_by` | UUID FK → `users` | Yes | — |
| `assigned_recruiter` | UUID FK → `users` | Yes | — |
| `applied_via` | ENUM | No | `WEBSITE` · `REFERRAL` · `LINKEDIN` · `NAUKRI` · `WALK_IN` · `INTERNAL` |
| `referred_by` | UUID FK → `employees` | Yes | — |
| *(base fields)* | | | |

---

### `assessments`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `job_id` | UUID FK → `jobs` | No | — |
| `name` | VARCHAR(150) | No | — |
| `type` | ENUM | No | `MCQ` · `SUBJECTIVE` · `PRACTICAL` · `APTITUDE` |
| `duration_minutes` | SMALLINT | No | — |
| `total_marks` | SMALLINT | No | — |
| `passing_score` | SMALLINT | No | — |
| `instructions` | TEXT | Yes | — |
| `is_active` | BOOLEAN | No | Default `true` |
| *(base fields)* | | | |

---

### `assessment_attempts`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `application_id` | UUID FK → `job_applications` | No | — |
| `assessment_id` | UUID FK → `assessments` | No | — |
| `started_at` | TIMESTAMPTZ | No | — |
| `submitted_at` | TIMESTAMPTZ | Yes | — |
| `score` | SMALLINT | Yes | — |
| `passed` | BOOLEAN | Yes | — |
| `answers_json` | JSONB | Yes | Responses stored for review |
| *(base fields)* | | | |

---

### `interviews`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `application_id` | UUID FK → `job_applications` | No | — |
| `round_number` | SMALLINT | No | — |
| `interviewer_id` | UUID FK → `employees` | No | — |
| `scheduled_at` | TIMESTAMPTZ | No | — |
| `duration_minutes` | SMALLINT | Yes | — |
| `mode` | ENUM | No | `IN_PERSON` · `VIDEO` · `PHONE` |
| `location` | VARCHAR(200) | Yes | Address or video link |
| `status` | ENUM | No | `SCHEDULED` · `COMPLETED` · `NO_SHOW` · `RESCHEDULED` · `CANCELLED` |
| `overall_score` | NUMERIC(4,2) | Yes | e.g. `3.8` out of `5` |
| `recommendation` | ENUM | Yes | `PROCEED` · `HOLD` · `REJECT` |
| `feedback` | TEXT | Yes | — |
| *(base fields)* | | | |

---

### `offers`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `application_id` | UUID FK → `job_applications` | No | UNIQUE |
| `designation_id` | UUID FK → `designations` | No | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `offered_ctc` | NUMERIC(14,2) | No | — |
| `joining_date` | DATE | No | — |
| `probation_months` | SMALLINT | Yes | — |
| `offer_letter_url` | TEXT | Yes | — |
| `status` | ENUM | No | `DRAFT` · `SENT` · `ACCEPTED` · `DECLINED` · `WITHDRAWN` · `LAPSED` |
| `sent_at` | TIMESTAMPTZ | Yes | — |
| `accepted_at` | TIMESTAMPTZ | Yes | — |
| `declined_reason` | TEXT | Yes | — |
| `expires_at` | DATE | Yes | — |
| *(base fields)* | | | |

---

### `onboarding_tasks`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `application_id` | UUID FK → `job_applications` | Yes | — |
| `employee_id` | UUID FK → `employees` | Yes | Set once employee record created |
| `task_name` | VARCHAR(200) | No | e.g. `Submit PAN Card`, `IT Setup`, `ID Card Issue` |
| `category` | ENUM | No | `DOCUMENT` · `IT` · `BANKING` · `POLICY` · `TRAINING` · `EQUIPMENT` |
| `due_date` | DATE | No | — |
| `assigned_to` | UUID FK → `users` | No | Responsible person |
| `status` | ENUM | No | `PENDING` · `IN_PROGRESS` · `COMPLETED` · `SKIPPED` |
| `completed_at` | TIMESTAMPTZ | Yes | — |
| `notes` | TEXT | Yes | — |
| *(base fields)* | | | |

---

## Domain 10 — Repairs

> **Scope:** BRANCH  
> **Audit:** Every status change, every estimate change  
> **Key rule:** A repair item is linked to `customers`, `employees` (who received it), and optionally `jewellery_items` (if the item exists in inventory).

---

### `repair_tickets`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `ticket_no` | VARCHAR(40) | No | Unique, human-readable |
| `customer_id` | UUID FK → `customers` | No | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `item_id` | UUID FK → `jewellery_items` | Yes | If the item exists in WHPS inventory |
| `received_at` | TIMESTAMPTZ | No | — |
| `received_by` | UUID FK → `users` | No | — |
| `description` | TEXT | No | Customer's description of the issue |
| `estimated_cost` | NUMERIC(14,2) | Yes | Before diagnosis |
| `final_cost` | NUMERIC(14,2) | Yes | Settled cost |
| `estimated_completion` | DATE | Yes | — |
| `actual_completion` | DATE | Yes | — |
| `status` | ENUM | No | `RECEIVED` · `ASSESSED` · `ESTIMATE_SENT` · `CUSTOMER_APPROVED` · `IN_WORK` · `QC` · `READY` · `DELIVERED` · `CANCELLED` |
| `priority` | ENUM | No | `NORMAL` · `URGENT` · `VIP` |
| `delivery_notes` | TEXT | Yes | — |
| *(base fields)* | | | |

---

### `repair_items`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `ticket_id` | UUID FK → `repair_tickets` | No | — |
| `description` | TEXT | No | Detailed item description |
| `metal_type` | ENUM | Yes | — |
| `purity` | VARCHAR(20) | Yes | — |
| `gross_weight_gm` | NUMERIC(10,3) | Yes | — |
| `issue_description` | TEXT | No | What is broken/damaged |
| `condition_before` | TEXT | Yes | Notes at intake |
| `condition_after` | TEXT | Yes | Notes at delivery |
| `media_before` | TEXT[] | Yes | Image URLs at intake |
| `media_after` | TEXT[] | Yes | Image URLs at delivery |
| *(base fields)* | | | |

---

### `repair_estimates`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `ticket_id` | UUID FK → `repair_tickets` | No | — |
| `labour_cost` | NUMERIC(14,2) | No | — |
| `material_cost` | NUMERIC(14,2) | No | Default `0` |
| `total` | NUMERIC(14,2) | No | — |
| `estimate_notes` | TEXT | Yes | — |
| `sent_at` | TIMESTAMPTZ | Yes | — |
| `customer_decision` | ENUM | Yes | `APPROVED` · `REJECTED` · `MODIFIED` |
| `customer_decided_at` | TIMESTAMPTZ | Yes | — |
| `prepared_by` | UUID FK → `users` | No | — |
| *(base fields)* | | | |

---

### `repair_assignments`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `ticket_id` | UUID FK → `repair_tickets` | No | — |
| `karigar_id` | UUID FK → `karigars` | No | — |
| `work_order_id` | UUID FK → `work_orders` | Yes | — |
| `assigned_at` | TIMESTAMPTZ | No | — |
| `due_at` | TIMESTAMPTZ | Yes | — |
| `completed_at` | TIMESTAMPTZ | Yes | — |
| `work_notes` | TEXT | Yes | — |
| `quality_passed` | BOOLEAN | Yes | — |
| *(base fields)* | | | |

---

## Domain 11 — Custom Jewellery

> **Scope:** BRANCH  
> **Audit:** Every design version, every approval decision

---

### `custom_orders`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `order_no` | VARCHAR(40) | No | Unique |
| `customer_id` | UUID FK → `customers` | No | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `assigned_to` | UUID FK → `users` | No | Account manager |
| `status` | ENUM | No | `BRIEF_RECEIVED` · `DESIGN_IN_PROGRESS` · `DESIGN_APPROVAL` · `PRODUCTION` · `QC` · `READY` · `DELIVERED` · `CANCELLED` |
| `occasion` | VARCHAR(100) | Yes | e.g. `Wedding`, `Anniversary` |
| `budget` | NUMERIC(14,2) | Yes | Customer's indicated budget |
| `advance_paid` | NUMERIC(14,2) | Yes | — |
| `advance_payment_id` | UUID FK → `payments` | Yes | — |
| `estimated_delivery` | DATE | Yes | — |
| `final_price` | NUMERIC(14,2) | Yes | Settled on approval |
| `sale_id` | UUID FK → `sales` | Yes | Created at delivery |
| `notes` | TEXT | Yes | — |
| *(base fields)* | | | |

---

### `design_briefs`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `order_id` | UUID FK → `custom_orders` | No | UNIQUE |
| `metal_type` | ENUM | No | — |
| `purity` | VARCHAR(20) | No | — |
| `approximate_weight_gm` | NUMERIC(10,3) | Yes | Customer's expectation |
| `stone_requirements` | TEXT | Yes | — |
| `occasion` | VARCHAR(100) | Yes | — |
| `reference_images` | TEXT[] | Yes | URLs |
| `style_notes` | TEXT | Yes | — |
| `size_specifications` | JSONB | Yes | e.g. `{ring_size: 16, necklace_length_cm: 45}` |
| *(base fields)* | | | |

---

### `design_versions`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `order_id` | UUID FK → `custom_orders` | No | — |
| `version_number` | SMALLINT | No | 1, 2, 3… |
| `designer_id` | UUID FK → `users` | No | — |
| `design_images` | TEXT[] | No | — |
| `design_notes` | TEXT | Yes | — |
| `estimated_cost` | NUMERIC(14,2) | Yes | — |
| `submitted_at` | TIMESTAMPTZ | No | — |
| *(base fields)* | | | |

---

### `design_approvals`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `version_id` | UUID FK → `design_versions` | No | — |
| `decision` | ENUM | No | `APPROVED` · `REJECTED` · `MODIFICATION_REQUESTED` |
| `customer_feedback` | TEXT | Yes | — |
| `decided_by` | UUID FK → `users` | No | Staff recording decision |
| `customer_consent_at` | TIMESTAMPTZ | Yes | Digital or in-person confirmation |
| `decision_at` | TIMESTAMPTZ | No | — |
| *(base fields)* | | | |

---

### `production_milestones`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `order_id` | UUID FK → `custom_orders` | No | — |
| `milestone_name` | VARCHAR(150) | No | e.g. `Wax Model`, `Casting`, `Stone Setting`, `Polishing` |
| `sequence` | SMALLINT | No | Display order |
| `planned_at` | DATE | No | — |
| `completed_at` | DATE | Yes | — |
| `notes` | TEXT | Yes | — |
| `media_urls` | TEXT[] | Yes | Progress photos |
| *(base fields)* | | | |

---

## Domain 12 — Vendors & Karigars

> **Scope:** COMPANY  
> **Audit:** Rating changes, payment records

---

### `vendors`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `user_id` | UUID FK → `users` | Yes | If vendor has portal login |
| `name` | VARCHAR(150) | No | — |
| `type` | ENUM | No | `MANUFACTURER` · `WHOLESALER` · `INDIVIDUAL_KARIGAR` · `WORKSHOP` · `HALLMARKING_CENTRE` |
| `gst_number` | VARCHAR(20) | Yes | — |
| `pan_number` | VARCHAR(15) | Yes | — |
| `phone` | VARCHAR(20) | No | — |
| `email` | VARCHAR(200) | Yes | — |
| `address` | JSONB | Yes | — |
| `city` | VARCHAR(100) | Yes | — |
| `specialty` | TEXT[] | Yes | e.g. `['diamond_setting', 'gold_casting']` |
| `rating` | NUMERIC(3,1) | Yes | 1.0–5.0, average of quality checks |
| `payment_terms_days` | SMALLINT | Yes | — |
| `status` | ENUM | No | `ACTIVE` · `INACTIVE` · `BLACKLISTED` |
| `bank_account_no` | VARCHAR(30) | Yes | Encrypted |
| `bank_ifsc` | VARCHAR(15) | Yes | — |
| *(base fields)* | | | |

---

### `karigars`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `vendor_id` | UUID FK → `vendors` | Yes | If associated with a workshop |
| `user_id` | UUID FK → `users` | Yes | — |
| `name` | VARCHAR(150) | No | — |
| `phone` | VARCHAR(20) | No | — |
| `specialization` | TEXT[] | Yes | e.g. `['filigree', 'stone_setting']` |
| `experience_years` | SMALLINT | Yes | — |
| `rating` | NUMERIC(3,1) | Yes | — |
| `status` | ENUM | No | `ACTIVE` · `INACTIVE` |
| *(base fields)* | | | |

---

### `work_orders`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `work_order_no` | VARCHAR(40) | No | — |
| `vendor_id` | UUID FK → `vendors` | Yes | — |
| `karigar_id` | UUID FK → `karigars` | Yes | — |
| `type` | ENUM | No | `REPAIR` · `CUSTOM_ORDER` · `MANUFACTURING` |
| `repair_ticket_id` | UUID FK → `repair_tickets` | Yes | — |
| `custom_order_id` | UUID FK → `custom_orders` | Yes | — |
| `description` | TEXT | No | — |
| `due_date` | DATE | No | — |
| `status` | ENUM | No | `ISSUED` · `IN_PROGRESS` · `QC_PENDING` · `QC_PASSED` · `QC_FAILED` · `COMPLETED` · `CANCELLED` |
| `agreed_amount` | NUMERIC(14,2) | Yes | — |
| `created_by` | UUID FK → `users` | No | — |
| *(base fields)* | | | |

---

### `material_issues`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `work_order_id` | UUID FK → `work_orders` | No | — |
| `issued_by` | UUID FK → `users` | No | — |
| `issued_at` | TIMESTAMPTZ | No | — |
| `metal_type` | ENUM | No | — |
| `purity` | VARCHAR(20) | No | — |
| `weight_gm` | NUMERIC(10,3) | No | — |
| `stones_json` | JSONB | Yes | `[{type, carat, count}]` |
| `notes` | TEXT | Yes | — |
| *(base fields)* | | | |

---

### `material_returns`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `work_order_id` | UUID FK → `work_orders` | No | — |
| `received_by` | UUID FK → `users` | No | — |
| `received_at` | TIMESTAMPTZ | No | — |
| `metal_returned_gm` | NUMERIC(10,3) | No | — |
| `wastage_gm` | NUMERIC(10,3) | No | — |
| `wastage_percent` | NUMERIC(5,2) | Yes | Computed |
| `stones_returned_json` | JSONB | Yes | — |
| `notes` | TEXT | Yes | — |
| *(base fields)* | | | |

---

### `quality_checks`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `work_order_id` | UUID FK → `work_orders` | No | — |
| `checked_by` | UUID FK → `users` | No | — |
| `checked_at` | TIMESTAMPTZ | No | — |
| `passed` | BOOLEAN | No | — |
| `criteria_json` | JSONB | Yes | `{weight_ok: true, finish_ok: true}` |
| `notes` | TEXT | Yes | — |
| `images` | TEXT[] | Yes | — |
| *(base fields)* | | | |

---

### `vendor_payments`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `vendor_id` | UUID FK → `vendors` | No | — |
| `work_order_id` | UUID FK → `work_orders` | Yes | — |
| `po_id` | UUID FK → `purchase_orders` | Yes | — |
| `amount` | NUMERIC(14,2) | No | — |
| `method` | ENUM | No | `BANK_TRANSFER` · `CHEQUE` · `CASH` · `UPI` |
| `reference_no` | VARCHAR(150) | Yes | — |
| `status` | ENUM | No | `PENDING` · `PROCESSING` · `PAID` · `FAILED` |
| `paid_by` | UUID FK → `users` | No | — |
| `paid_at` | TIMESTAMPTZ | Yes | — |
| `notes` | TEXT | Yes | — |
| *(base fields)* | | | |

---

## Domain 13 — Procurement

> **Scope:** BRANCH (requisitions); COMPANY (purchase orders may be consolidated)  
> **Audit:** PO creation, approval, receipt

---

### `purchase_requisitions`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `category_id` | UUID FK → `categories` | No | — |
| `description` | TEXT | No | — |
| `quantity` | SMALLINT | No | Approximate number of items needed |
| `urgency` | ENUM | No | `LOW` · `NORMAL` · `HIGH` · `CRITICAL` |
| `justification` | TEXT | Yes | AI signal or human note |
| `requested_by` | UUID FK → `users` | No | — |
| `status` | ENUM | No | `DRAFT` · `SUBMITTED` · `APPROVED` · `PO_RAISED` · `FULFILLED` · `REJECTED` |
| `approved_by` | UUID FK → `users` | Yes | — |
| `po_id` | UUID FK → `purchase_orders` | Yes | — |
| *(base fields)* | | | |

---

### `purchase_orders`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `po_number` | VARCHAR(40) | No | Unique |
| `vendor_id` | UUID FK → `vendors` | No | — |
| `requisition_id` | UUID FK → `purchase_requisitions` | Yes | — |
| `branch_id` | UUID FK → `branches` | No | Receiving branch |
| `type` | ENUM | No | `STANDARD` · `CONSIGNMENT` · `MEMO` |
| `total_amount` | NUMERIC(14,2) | No | — |
| `currency` | VARCHAR(5) | No | Default `INR` |
| `status` | ENUM | No | `DRAFT` · `PENDING_APPROVAL` · `APPROVED` · `SENT_TO_VENDOR` · `ACKNOWLEDGED` · `PARTIALLY_RECEIVED` · `RECEIVED` · `CANCELLED` |
| `payment_terms_days` | SMALLINT | Yes | — |
| `expected_delivery` | DATE | Yes | — |
| `approved_by` | UUID FK → `users` | Yes | — |
| `approved_at` | TIMESTAMPTZ | Yes | — |
| `ordered_at` | TIMESTAMPTZ | Yes | — |
| *(base fields)* | | | |

---

### `purchase_order_items`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `po_id` | UUID FK → `purchase_orders` | No | — |
| `category_id` | UUID FK → `categories` | No | — |
| `description` | TEXT | No | — |
| `quantity` | SMALLINT | No | — |
| `unit_price` | NUMERIC(14,2) | No | — |
| `total_price` | NUMERIC(14,2) | No | — |
| `received_quantity` | SMALLINT | Yes | — |
| *(base fields)* | | | |

---

### `goods_receipts`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `grn_number` | VARCHAR(40) | No | — |
| `po_id` | UUID FK → `purchase_orders` | No | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `received_at` | TIMESTAMPTZ | No | — |
| `received_by` | UUID FK → `users` | No | — |
| `status` | ENUM | No | `RECEIVED` · `QC_PENDING` · `QC_PASSED` · `QC_FAILED` · `ACCEPTED` · `RETURNED` |
| `notes` | TEXT | Yes | — |
| *(base fields)* | | | |

---

### `goods_receipt_items`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `grn_id` | UUID FK → `goods_receipts` | No | — |
| `po_item_id` | UUID FK → `purchase_order_items` | No | — |
| `item_id` | UUID FK → `jewellery_items` | Yes | Created upon acceptance |
| `quantity_received` | SMALLINT | No | — |
| `condition` | ENUM | No | `GOOD` · `DAMAGED` · `PARTIAL` |
| `notes` | TEXT | Yes | — |
| *(base fields)* | | | |

---

## Domain 14 — Franchise

> **Scope:** Applicant → Company; Franchise operations → Branch  
> **Audit:** Every stage transition, every agreement event

---

### `franchise_applicants`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `user_id` | UUID FK → `users` | Yes | Portal account |
| `name` | VARCHAR(150) | No | — |
| `email` | VARCHAR(200) | No | — |
| `phone` | VARCHAR(20) | No | — |
| `city_of_interest` | VARCHAR(100) | No | — |
| `background` | TEXT | Yes | Business background |
| `investment_capacity` | NUMERIC(14,2) | Yes | Self-declared |
| `net_worth` | NUMERIC(14,2) | Yes | — |
| `has_property` | BOOLEAN | Yes | — |
| `referral_source` | VARCHAR(150) | Yes | How they found WHPS |
| `status` | ENUM | No | `APPLIED` · `SCREENING` · `SHORTLISTED` · `EVALUATION` · `LOCATION_REVIEW` · `DUE_DILIGENCE` · `AGREEMENT` · `ONBOARDING` · `ACTIVE` · `REJECTED` · `WITHDRAWN` |
| `assigned_to` | UUID FK → `users` | Yes | Franchise development manager |
| *(base fields)* | | | |

---

### `franchise_locations`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `applicant_id` | UUID FK → `franchise_applicants` | No | — |
| `address` | JSONB | No | — |
| `city` | VARCHAR(100) | No | — |
| `area_sqft` | SMALLINT | Yes | — |
| `ownership_type` | ENUM | No | `OWNED` · `LEASED` |
| `rent_per_month` | NUMERIC(14,2) | Yes | If leased |
| `latitude` | NUMERIC(10,7) | Yes | — |
| `longitude` | NUMERIC(10,7) | Yes | — |
| `nearby_competition` | TEXT | Yes | — |
| `footfall_estimate` | VARCHAR(100) | Yes | — |
| `status` | ENUM | No | `SUBMITTED` · `UNDER_REVIEW` · `APPROVED` · `REJECTED` · `ALTERNATIVE_REQUESTED` |
| `reviewed_by` | UUID FK → `users` | Yes | — |
| `review_notes` | TEXT | Yes | — |
| *(base fields)* | | | |

---

### `due_diligence_reports`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `applicant_id` | UUID FK → `franchise_applicants` | No | — |
| `financial_check` | ENUM | Yes | `PASS` · `FAIL` · `PENDING` · `WAIVED` |
| `legal_check` | ENUM | Yes | Same |
| `background_check` | ENUM | Yes | Same |
| `site_check` | ENUM | Yes | Same |
| `overall_status` | ENUM | No | `IN_PROGRESS` · `PASSED` · `FAILED` · `CONDITIONAL` |
| `conducted_by` | UUID FK → `users` | No | — |
| `conducted_at` | DATE | No | — |
| `report_url` | TEXT | Yes | — |
| `notes` | TEXT | Yes | — |
| *(base fields)* | | | |

---

### `franchise_agreements`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `applicant_id` | UUID FK → `franchise_applicants` | No | — |
| `branch_id` | UUID FK → `branches` | Yes | Linked when branch is created |
| `agreement_number` | VARCHAR(60) | No | — |
| `start_date` | DATE | No | — |
| `term_years` | SMALLINT | No | — |
| `end_date` | DATE | No | — |
| `royalty_percent` | NUMERIC(5,2) | No | Of monthly revenue |
| `initial_fee` | NUMERIC(14,2) | Yes | One-time franchise fee |
| `renewal_fee` | NUMERIC(14,2) | Yes | — |
| `document_url` | TEXT | Yes | Signed agreement PDF |
| `status` | ENUM | No | `DRAFT` · `SIGNED` · `ACTIVE` · `RENEWED` · `EXPIRED` · `TERMINATED` |
| `signed_at` | DATE | Yes | — |
| *(base fields)* | | | |

---

### `franchise_onboarding_tasks`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `applicant_id` | UUID FK → `franchise_applicants` | No | — |
| `branch_id` | UUID FK → `branches` | Yes | — |
| `task_name` | VARCHAR(200) | No | e.g. `Staff Recruitment`, `Inventory Handover`, `POS Setup` |
| `category` | ENUM | No | `LEGAL` · `STAFFING` · `INFRASTRUCTURE` · `SYSTEM` · `BRANDING` · `TRAINING` |
| `due_date` | DATE | No | — |
| `assigned_to` | UUID FK → `users` | No | — |
| `status` | ENUM | No | `PENDING` · `IN_PROGRESS` · `COMPLETED` · `BLOCKED` |
| `completed_at` | TIMESTAMPTZ | Yes | — |
| `notes` | TEXT | Yes | — |
| *(base fields)* | | | |

---

### `franchise_monthly_reports`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `reporting_month` | SMALLINT | No | 1–12 |
| `reporting_year` | SMALLINT | No | — |
| `revenue` | NUMERIC(14,2) | Yes | — |
| `royalty_amount` | NUMERIC(14,2) | Yes | — |
| `royalty_paid` | BOOLEAN | No | Default `false` |
| `compliance_status` | ENUM | No | `COMPLIANT` · `NON_COMPLIANT` · `UNDER_REVIEW` |
| `complaints_count` | SMALLINT | Yes | — |
| `stock_audit_status` | ENUM | Yes | `PENDING` · `COMPLETED` · `DISPUTED` |
| `submitted_by` | UUID FK → `users` | Yes | — |
| `submitted_at` | TIMESTAMPTZ | Yes | — |
| *(base fields)* | | | |

---

## Domain 15 — Finance

> **Scope:** BRANCH (transactions); COMPANY (consolidated financials)  
> **Audit:** All financial events  
> **Note:** This module integrates with external ERP/accounting. It does not replace it. Its primary purpose is real-time branch visibility and reconciliation.

---

### `financial_transactions`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `type` | ENUM | No | `SALE` · `REFUND` · `EXPENSE` · `PROCUREMENT` · `PAYROLL` · `VENDOR_PAYMENT` · `ROYALTY` · `ADJUSTMENT` |
| `direction` | ENUM | No | `CREDIT` · `DEBIT` |
| `amount` | NUMERIC(14,2) | No | — |
| `reference_type` | VARCHAR(60) | Yes | `sale` · `refund` · `payroll` etc. |
| `reference_id` | UUID | Yes | — |
| `category` | VARCHAR(100) | Yes | Sub-category for P&L mapping |
| `description` | TEXT | Yes | — |
| `transaction_date` | DATE | No | — |
| `recorded_by` | UUID FK → `users` | No | — |
| `erp_sync_status` | ENUM | Yes | `PENDING` · `SYNCED` · `FAILED` · `SKIPPED` |
| `erp_reference` | VARCHAR(150) | Yes | ERP voucher/journal ID |
| *(base fields)* | | | |

**Indexes:** `INDEX (branch_id, transaction_date)`, `INDEX (type, direction)`, `INDEX (reference_type, reference_id)`

---

### `branch_financials`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `month` | SMALLINT | No | — |
| `year` | SMALLINT | No | — |
| `revenue` | NUMERIC(14,2) | No | — |
| `cogs` | NUMERIC(14,2) | No | Cost of goods sold |
| `gross_profit` | NUMERIC(14,2) | No | — |
| `operating_expenses` | NUMERIC(14,2) | No | — |
| `net_profit` | NUMERIC(14,2) | No | — |
| `royalty_paid` | NUMERIC(14,2) | Yes | For franchise branches |
| `status` | ENUM | No | `DRAFT` · `FINALIZED` · `ERP_SYNCED` |
| `finalized_by` | UUID FK → `users` | Yes | — |
| `finalized_at` | TIMESTAMPTZ | Yes | — |
| *(base fields)* | | | |

**Indexes:** `UNIQUE (branch_id, month, year)`

---

### `receivables`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `customer_id` | UUID FK → `customers` | No | — |
| `branch_id` | UUID FK → `branches` | No | — |
| `sale_id` | UUID FK → `sales` | No | — |
| `amount` | NUMERIC(14,2) | No | — |
| `due_date` | DATE | No | — |
| `status` | ENUM | No | `OPEN` · `PARTIAL` · `PAID` · `OVERDUE` · `WRITTEN_OFF` |
| `reminder_count` | SMALLINT | No | Default `0` |
| `last_reminder_at` | TIMESTAMPTZ | Yes | — |
| *(base fields)* | | | |

---

### `payables`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `vendor_id` | UUID FK → `vendors` | No | — |
| `po_id` | UUID FK → `purchase_orders` | Yes | — |
| `work_order_id` | UUID FK → `work_orders` | Yes | — |
| `amount` | NUMERIC(14,2) | No | — |
| `due_date` | DATE | No | — |
| `status` | ENUM | No | `OPEN` · `PARTIAL` · `PAID` · `DISPUTED` |
| *(base fields)* | | | |

---

## Domain 16 — Platform (Cross-Cutting)

> **Scope:** ALL  
> **Note:** These tables serve every module. They are the backbone of observability, approvals, notifications and AI.

---

### `notifications`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `user_id` | UUID FK → `users` | No | Recipient |
| `type` | VARCHAR(80) | No | e.g. `repair_ready`, `appointment_reminder`, `low_stock` |
| `title` | VARCHAR(200) | No | — |
| `body` | TEXT | No | — |
| `reference_type` | VARCHAR(60) | Yes | Entity type this notification is about |
| `reference_id` | UUID | Yes | — |
| `channel` | ENUM | No | `EMAIL` · `SMS` · `PUSH` · `WHATSAPP` · `IN_APP` |
| `status` | ENUM | No | `PENDING` · `SENT` · `DELIVERED` · `FAILED` · `READ` |
| `scheduled_at` | TIMESTAMPTZ | Yes | NULL = send immediately |
| `sent_at` | TIMESTAMPTZ | Yes | — |
| `read_at` | TIMESTAMPTZ | Yes | — |
| `error_message` | TEXT | Yes | — |
| `gateway_message_id` | VARCHAR(150) | Yes | — |
| *(base fields)* | | | |

---

### `documents`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `entity_type` | VARCHAR(60) | No | e.g. `employee`, `vendor`, `customer` |
| `entity_id` | UUID | No | — |
| `name` | VARCHAR(200) | No | — |
| `type` | ENUM | No | `IDENTITY` · `CONTRACT` · `INVOICE` · `CERTIFICATE` · `PHOTO` · `OTHER` |
| `url` | TEXT | No | Storage URL |
| `size_bytes` | INTEGER | Yes | — |
| `mime_type` | VARCHAR(80) | Yes | — |
| `access_level` | ENUM | No | `PRIVATE` · `BRANCH` · `COMPANY` · `PUBLIC` |
| `uploaded_by` | UUID FK → `users` | No | — |
| `expires_at` | DATE | Yes | For temporary links |
| *(base fields)* | | | |

---

### `approval_requests`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `module` | VARCHAR(60) | No | e.g. `sales`, `inventory`, `hr` |
| `action` | VARCHAR(100) | No | e.g. `discount_above_threshold`, `stock_transfer`, `offer_letter` |
| `entity_type` | VARCHAR(60) | No | — |
| `entity_id` | UUID | No | — |
| `requested_by` | UUID FK → `users` | No | — |
| `assigned_to` | UUID FK → `users` | No | Approver |
| `priority` | ENUM | No | `LOW` · `MEDIUM` · `HIGH` · `URGENT` |
| `status` | ENUM | No | `PENDING` · `APPROVED` · `REJECTED` · `ESCALATED` · `EXPIRED` · `AUTO_APPROVED` |
| `context_json` | JSONB | Yes | Additional data for the approver |
| `decision_notes` | TEXT | Yes | — |
| `requested_at` | TIMESTAMPTZ | No | — |
| `decided_at` | TIMESTAMPTZ | Yes | — |
| `expires_at` | TIMESTAMPTZ | Yes | Auto-expires and escalates |
| *(base fields)* | | | |

---

### `audit_events`

> Append-only. Never updated or deleted.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `user_id` | UUID FK → `users` | Yes | NULL for system events |
| `user_role_at_time` | VARCHAR(80) | Yes | Snapshot of role at event time |
| `action` | VARCHAR(100) | No | e.g. `CREATE`, `UPDATE`, `DELETE`, `APPROVE`, `LOGIN` |
| `module` | VARCHAR(60) | No | — |
| `entity_type` | VARCHAR(60) | No | — |
| `entity_id` | UUID | Yes | — |
| `old_value_json` | JSONB | Yes | Before state (sensitive fields masked) |
| `new_value_json` | JSONB | Yes | After state |
| `ip_address` | INET | Yes | — |
| `user_agent` | TEXT | Yes | — |
| `branch_id` | UUID | Yes | Branch context at time of event |
| `session_id` | UUID | Yes | — |
| `created_at` | TIMESTAMPTZ | No | Partition key |

**Partitioned by range on `created_at` (monthly)**  
**Indexes:** `INDEX (user_id, created_at)`, `INDEX (entity_type, entity_id)`, `INDEX (module, action)`

---

### `integration_events`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `source` | ENUM | No | `ERP` · `POS` · `WHATSAPP` · `PAYMENT_GATEWAY` · `BIOMETRIC` · `WEBSITE` |
| `event_type` | VARCHAR(100) | No | e.g. `payment.captured`, `attendance.punched` |
| `direction` | ENUM | No | `INBOUND` · `OUTBOUND` |
| `payload_json` | JSONB | No | Raw event payload |
| `status` | ENUM | No | `RECEIVED` · `PROCESSING` · `PROCESSED` · `FAILED` · `SKIPPED` |
| `processed_at` | TIMESTAMPTZ | Yes | — |
| `retry_count` | SMALLINT | No | Default `0` |
| `error_message` | TEXT | Yes | — |
| `reference_type` | VARCHAR(60) | Yes | Platform entity created/updated |
| `reference_id` | UUID | Yes | — |
| *(base fields)* | | | |

---

### `ai_signals`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `signal_type` | VARCHAR(100) | No | e.g. `demand_increase`, `ageing_stock`, `low_inventory`, `lead_drop_off` |
| `module` | VARCHAR(60) | No | Source module |
| `branch_id` | UUID FK → `branches` | Yes | — |
| `entity_type` | VARCHAR(60) | Yes | e.g. `jewellery_items`, `leads` |
| `entity_id` | UUID | Yes | — |
| `value` | NUMERIC(14,4) | Yes | Signal magnitude |
| `confidence` | NUMERIC(5,4) | Yes | 0.0000–1.0000 |
| `supporting_data_json` | JSONB | Yes | Raw evidence |
| `generated_at` | TIMESTAMPTZ | No | — |
| `expires_at` | TIMESTAMPTZ | Yes | — |
| *(base fields)* | | | |

---

### `ai_recommendations`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID PK | — | — |
| `signal_id` | UUID FK → `ai_signals` | Yes | — |
| `type` | VARCHAR(100) | No | e.g. `stock_transfer`, `reorder`, `follow_up`, `campaign` |
| `title` | VARCHAR(200) | No | Human-readable action title |
| `description` | TEXT | No | Full rationale |
| `supporting_data_json` | JSONB | Yes | Charts/tables data for display |
| `priority` | ENUM | No | `LOW` · `MEDIUM` · `HIGH` · `CRITICAL` |
| `status` | ENUM | No | `PENDING` · `APPROVED` · `REJECTED` · `ACTIONED` · `EXPIRED` |
| `assigned_to` | UUID FK → `users` | Yes | Who should act |
| `approval_request_id` | UUID FK → `approval_requests` | Yes | If action requires formal approval |
| `created_at` | TIMESTAMPTZ | No | — |
| `decided_at` | TIMESTAMPTZ | Yes | — |
| `decided_by` | UUID FK → `users` | Yes | — |
| `decision_notes` | TEXT | Yes | — |
| *(base fields)* | | | |

---

## Relationship Trees (Key Traversals)

### Customer 360
```
customers
  ├── customer_addresses
  ├── customer_preferences
  ├── customer_consents
  ├── leads → lead_interactions → followups
  ├── appointments
  ├── quotations → quotation_items → jewellery_items
  ├── sales → sale_items → jewellery_items
  │         → payments
  │         → discounts
  ├── exchanges
  ├── refunds
  ├── repair_tickets → repair_items
  ├── custom_orders  → design_versions
  ├── customer_scheme_enrollments → loyalty_schemes
  └── notifications
```

### Jewellery Item Lifecycle
```
jewellery_items
  ├── products → categories → collections
  ├── hallmark_records
  ├── certificates
  ├── product_media
  ├── inventory_stock → inventory_locations → branches
  ├── inventory_movements (full history)
  ├── reservations → customers
  ├── stock_transfer_items → stock_transfers
  ├── sale_items → sales → customers
  ├── repair_tickets
  ├── goods_receipt_items → purchase_orders → vendors
  └── ai_signals
```

### Employee Lifecycle
```
job_applications
  ├── jobs → branches / departments / designations
  ├── assessment_attempts → assessments
  ├── interviews → employees (interviewers)
  └── offers
        └── employees (created on acceptance)
              ├── user_roles → roles
              ├── attendance
              ├── leave_requests → leave_balances
              ├── payroll
              ├── performance_reviews
              ├── employee_targets
              ├── training_records
              ├── repair_assignments
              └── notifications
```

---

## RBAC Scoping Summary

| Role | Identity | Inventory | CRM | Sales | HR | Finance | Franchise | AI |
|------|----------|-----------|-----|-------|----|---------|-----------|---|
| super_admin | R/W | R/W | R/W | R/W | R/W | R/W | R/W | R/W |
| company_admin | R/W | R | R/W | R/W | R | R/W | R/W | R |
| regional_manager | — | R (branches) | R | R | R | R | — | R |
| branch_manager | — | R/W (own) | R/W (own) | R/W (own) | R (own) | R (own) | — | R (own) |
| store_staff | — | R (own) | R/W (leads) | R/W (sales) | — | — | — | — |
| hr_manager | — | — | — | — | R/W | — | — | — |
| finance_manager | — | R | — | R | R (payroll) | R/W | R (royalty) | R |
| inventory_manager | — | R/W (own) | — | R | — | — | — | R (own) |
| franchise_admin | — | R/W (own) | R/W (own) | R/W (own) | R/W (own) | R (own) | R (own) | R (own) |
| customer | — | — | R (own) | R (own) | — | — | — | — |
| vendor / karigar | — | — | — | — | — | — | — | — |

---

## Audit Requirements by Module

| Module | Audited Events |
|--------|---------------|
| Identity | Login, logout, password change, role grant/revoke |
| Inventory | Item creation, status change, movement, transfer, reconciliation |
| CRM | Lead assignment, status change, interaction logged |
| Sales | Sale creation, discount approved/rejected, refund approved |
| HR | Employee joined/exited, salary change, leave approved |
| Recruitment | Application status change, offer sent/accepted |
| Finance | Transaction created, P&L finalized, ERP sync |
| Franchise | Agreement signed, stage transition, compliance flag |
| Approval | Request created, approved, rejected, escalated |
| Central Admin | Any master data change, any permission change |

---

## Open Questions for WHPS Validation

| # | Question | Impact |
|---|----------|--------|
| Q1 | Which accounting / ERP is in use? (Tally, SAP, Zoho Books, custom?) | Defines `erp_sync` interface and `financial_transactions.erp_reference` format |
| Q2 | Which POS system is deployed at branches? | Defines `sales.pos_reference` and `integration_events` mapping |
| Q3 | Biometric device brand/software? | Defines `attendance.source` integration |
| Q4 | Payment gateway(s) in use? (Razorpay, PayU, Stripe?) | Defines `payments.gateway` enum and webhook handling |
| Q5 | Is WhatsApp Business API already set up, or is it manual currently? | Defines notification channel availability |
| Q6 | How many active branches today, and target within 3 years? | Informs indexing strategy and partition sizing |
| Q7 | Is HUID registered on existing inventory? | Determines migration complexity for `jewellery_items.huid` |
| Q8 | Preferred cloud / hosting? (AWS, GCP, Azure, on-prem, hybrid?) | Determines storage URLs, managed DB, and backup strategy |
| Q9 | Are there existing loyalty schemes and their rules? | Determines `loyalty_schemes` seed data and `customer_scheme_enrollments` migration |
| Q10 | Does WHPS have an existing customer database? (POS / Excel?) | Determines customer import strategy and deduplication on `phone` |

---

*Next: Derive the PostgreSQL DDL schema from this model, then define the API contract per module.*
