import { prisma } from "@/lib/db";
import {
  LANDING_FIELD_DEFS,
  defaultsMap,
  type LandingFieldDef,
} from "@/lib/cms/landing-defaults";

export type CmsFieldRecord = {
  key: string;
  type: string;
  label: string;
  section: string;
  sectionLabel: string;
  value: string;
  sortOrder: number;
};

export async function ensureSiteCmsSeeded() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      webAdminPassword: "webadmin2026",
    },
  });

  const existing = await prisma.siteCmsField.findMany({
    where: { page: "landing" },
    select: { key: true },
  });
  const have = new Set(existing.map((e) => e.key));

  const missing = LANDING_FIELD_DEFS.filter((f) => !have.has(f.key));
  if (missing.length === 0) return;

  await prisma.siteCmsField.createMany({
    data: missing.map((f) => ({
      page: "landing",
      key: f.key,
      type: f.type,
      label: f.label,
      section: f.section,
      sectionLabel: f.sectionLabel,
      value: f.value,
      sortOrder: f.sortOrder,
    })),
  });
}

export async function getLandingContentMap(): Promise<Record<string, string>> {
  const base = defaultsMap();
  try {
    await ensureSiteCmsSeeded();
    const rows = await prisma.siteCmsField.findMany({
      where: { page: "landing" },
    });
    for (const row of rows) {
      base[row.key] = row.value;
    }
  } catch {
    // DB may not be migrated yet — serve defaults
  }
  return base;
}

export async function listLandingFields(): Promise<CmsFieldRecord[]> {
  await ensureSiteCmsSeeded();
  const rows = await prisma.siteCmsField.findMany({
    where: { page: "landing" },
    orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
  });

  const byKey = new Map(rows.map((r) => [r.key, r]));
  // Prefer schema order from defs; include any extras last
  const ordered: CmsFieldRecord[] = [];
  for (const def of LANDING_FIELD_DEFS) {
    const row = byKey.get(def.key);
    ordered.push({
      key: def.key,
      type: row?.type ?? def.type,
      label: row?.label ?? def.label,
      section: row?.section ?? def.section,
      sectionLabel: row?.sectionLabel ?? def.sectionLabel,
      value: row?.value ?? def.value,
      sortOrder: row?.sortOrder ?? def.sortOrder,
    });
    byKey.delete(def.key);
  }
  for (const row of byKey.values()) {
    ordered.push({
      key: row.key,
      type: row.type,
      label: row.label,
      section: row.section,
      sectionLabel: row.sectionLabel,
      value: row.value,
      sortOrder: row.sortOrder,
    });
  }
  return ordered;
}

export async function updateLandingFields(
  updates: Array<{ key: string; value: string }>
): Promise<void> {
  await ensureSiteCmsSeeded();
  for (const u of updates) {
    const def = LANDING_FIELD_DEFS.find((d) => d.key === u.key);
    await prisma.siteCmsField.upsert({
      where: { page_key: { page: "landing", key: u.key } },
      update: { value: u.value },
      create: {
        page: "landing",
        key: u.key,
        type: def?.type ?? "text",
        label: def?.label ?? u.key,
        section: def?.section ?? "misc",
        sectionLabel: def?.sectionLabel ?? "Otros",
        value: u.value,
        sortOrder: def?.sortOrder ?? 9999,
      },
    });
  }
}

export function groupFieldsBySection(fields: CmsFieldRecord[]) {
  const map = new Map<
    string,
    { section: string; sectionLabel: string; fields: CmsFieldRecord[] }
  >();
  for (const f of fields) {
    const g = map.get(f.section) ?? {
      section: f.section,
      sectionLabel: f.sectionLabel,
      fields: [],
    };
    g.fields.push(f);
    map.set(f.section, g);
  }
  return Array.from(map.values());
}

export type { LandingFieldDef };
