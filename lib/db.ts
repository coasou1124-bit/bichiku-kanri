import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { StockItem } from "@/types";

// `neon()` doesn't eagerly open a connection, it just builds an HTTP-based
// query function from the connection string. When DATABASE_URL is missing
// (e.g. running `next build` locally without env vars), fall back to a
// placeholder so module evaluation doesn't crash the build; real queries
// against a missing/placeholder DB will simply fail at request time instead.
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  "postgresql://user:pass@localhost/db";

export const sql = neon(connectionString);

const UID_COOKIE = "bichiku_uid";

export interface DbUser {
  id: string;
  email: string | null;
  verified: boolean;
}

interface DbItemRow {
  id: string;
  user_id: string;
  name: string;
  category: string;
  location: string;
  quantity: string;
  unit: string;
  expiry_type: string | null;
  expiry_date: string | null;
  alert_lead: number | null;
  last_notified_at: string | null;
}

export type NewItemInput = Omit<StockItem, "id">;

export async function initSchema() {
  await sql`create extension if not exists pgcrypto`;
  await sql`
    create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      email text,
      verified boolean not null default false,
      verify_token text,
      created_at timestamptz not null default now()
    )
  `;
  await sql`
    create table if not exists items (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      name text not null,
      category text,
      location text,
      quantity numeric not null default 1,
      unit text,
      expiry_type text not null,
      expiry_date date not null,
      alert_lead integer not null,
      last_notified_at timestamptz,
      created_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists items_user_id_idx on items(user_id)`;
  // 懐中電灯など「期限のない」品目を許可するため、既存のNOT NULL制約を解除する
  await sql`alter table items alter column expiry_date drop not null`;
  await sql`alter table items alter column expiry_type drop not null`;
  await sql`alter table items alter column alert_lead drop not null`;
  await sql`
    create table if not exists rate_limits (
      key text primary key,
      count integer not null default 1,
      window_start timestamptz not null default now()
    )
  `;
}

// Sliding-window rate limiter backed by the same Postgres instance (no extra
// infra needed at this scale). Returns true if the request is allowed.
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMinutes: number
): Promise<boolean> {
  const rows = await sql`
    insert into rate_limits (key, count, window_start)
    values (${key}, 1, now())
    on conflict (key) do update set
      count = case
        when rate_limits.window_start < now() - (${windowMinutes} || ' minutes')::interval
        then 1
        else rate_limits.count + 1
      end,
      window_start = case
        when rate_limits.window_start < now() - (${windowMinutes} || ' minutes')::interval
        then now()
        else rate_limits.window_start
      end
    returning count
  `;
  const count = (rows[0] as { count: number }).count;
  return count <= limit;
}

export async function getOrCreateUid(): Promise<string> {
  const store = await cookies();
  const existing = store.get(UID_COOKIE)?.value;
  if (existing) return existing;

  const uid = randomUUID();
  await sql`insert into users (id) values (${uid}) on conflict (id) do nothing`;
  store.set(UID_COOKIE, uid, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 400,
    path: "/",
  });
  return uid;
}

export async function getUser(userId: string): Promise<DbUser | undefined> {
  const rows = await sql`
    select id, email, verified from users where id = ${userId}
  `;
  return rows[0] as DbUser | undefined;
}

export async function setUserEmail(userId: string, email: string, token: string) {
  await sql`
    update users set email = ${email}, verified = false, verify_token = ${token}
    where id = ${userId}
  `;
}

export async function verifyUserByToken(
  token: string
): Promise<{ id: string; email: string } | undefined> {
  const rows = await sql`
    update users set verified = true, verify_token = null
    where verify_token = ${token}
    returning id, email
  `;
  return rows[0] as { id: string; email: string } | undefined;
}

function rowToStockItem(row: DbItemRow): StockItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    location: row.location,
    quantity: Number(row.quantity),
    unit: row.unit,
    expiryType: row.expiry_type as StockItem["expiryType"],
    expiryDate: row.expiry_date,
    alertLead: row.alert_lead === null ? null : Number(row.alert_lead),
  };
}

export async function listItems(userId: string): Promise<StockItem[]> {
  const rows = await sql`
    select * from items where user_id = ${userId} order by expiry_date asc
  `;
  return (rows as DbItemRow[]).map(rowToStockItem);
}

export async function createItem(
  userId: string,
  item: NewItemInput
): Promise<StockItem> {
  const rows = await sql`
    insert into items
      (user_id, name, category, location, quantity, unit, expiry_type, expiry_date, alert_lead)
    values
      (${userId}, ${item.name}, ${item.category}, ${item.location}, ${item.quantity},
       ${item.unit}, ${item.expiryType}, ${item.expiryDate}, ${item.alertLead})
    returning *
  `;
  return rowToStockItem(rows[0] as DbItemRow);
}

export async function updateItem(
  userId: string,
  id: string,
  item: NewItemInput
): Promise<StockItem | undefined> {
  const rows = await sql`
    update items set
      name = ${item.name}, category = ${item.category}, location = ${item.location},
      quantity = ${item.quantity}, unit = ${item.unit}, expiry_type = ${item.expiryType},
      expiry_date = ${item.expiryDate}, alert_lead = ${item.alertLead}, last_notified_at = null
    where id = ${id} and user_id = ${userId}
    returning *
  `;
  const row = rows[0] as DbItemRow | undefined;
  return row ? rowToStockItem(row) : undefined;
}

export async function deleteItem(userId: string, id: string): Promise<void> {
  await sql`delete from items where id = ${id} and user_id = ${userId}`;
}

export interface NotifiableUser {
  userId: string;
  email: string;
  items: (StockItem & { lastNotifiedAt: string | null })[];
}

export async function listVerifiedUsersWithItems(): Promise<NotifiableUser[]> {
  const rows = (await sql`
    select u.id as user_id, u.email, i.*
    from users u
    join items i on i.user_id = u.id
    where u.verified = true and u.email is not null
  `) as (DbItemRow & { user_id: string; email: string })[];

  const byUser = new Map<string, NotifiableUser>();
  for (const row of rows) {
    if (!byUser.has(row.user_id)) {
      byUser.set(row.user_id, { userId: row.user_id, email: row.email, items: [] });
    }
    byUser.get(row.user_id)!.items.push({
      ...rowToStockItem(row),
      lastNotifiedAt: row.last_notified_at,
    });
  }
  return [...byUser.values()];
}

export async function markNotified(itemIds: string[]): Promise<void> {
  if (itemIds.length === 0) return;
  await sql`update items set last_notified_at = now() where id = any(${itemIds})`;
}
