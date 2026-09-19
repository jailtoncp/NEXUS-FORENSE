// Storage service — the single access point for all persisted data.
// Today it wraps localStorage; tomorrow it can be swapped for Firebase
// without touching any component, because every screen imports from here.

import { nanoid } from "nanoid";
import { attachments } from "./attachments";
import type {
  Evidence,
  Investigation,
  Person,
  RelevantInfo,
  Session,
  Source,
  TimelineEvent,
  User,
  UUID,
  Vehicle,
  Report,
  Diligence,
} from "./types";

const KEYS = {
  users: "nexus:users",
  session: "nexus:session",
  investigations: "nexus:investigations",
  people: "nexus:people",
  vehicles: "nexus:vehicles",
  events: "nexus:events",
  evidence: "nexus:evidence",
  sources: "nexus:sources",
  relevantInfo: "nexus:relevant_info",
  reports: "nexus:reports",
  diligences: "nexus:diligences",
} as const;

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function uid(): UUID {
  return nanoid();
}

// ---------------------------------------------------------------------------
// Auth (local-only; structured so Firebase Auth can replace it later)
// ---------------------------------------------------------------------------

function hashPassword(pw: string): string {
  // Lightweight local hash — NOT secure, only for personal local use.
  // Will be replaced by Firebase Authentication in a future version.
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = (h << 5) - h + pw.charCodeAt(i);
    h |= 0;
  }
  return `h${h}`;
}

export const auth = {
  register(name: string, email: string, password: string): User {
    const users = read<User>(KEYS.users);
    const exists = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) throw new Error("Já existe uma conta com este e-mail.");
    const user: User = {
      id: uid(),
      name,
      email,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    write(KEYS.users, users);
    this.setSession(user.id);
    return user;
  },

  login(email: string, password: string): User {
    const users = read<User>(KEYS.users);
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user || user.passwordHash !== hashPassword(password)) {
      throw new Error("E-mail ou senha incorretos.");
    }
    this.setSession(user.id);
    return user;
  },

  logout(): void {
    this.setSession(null);
  },

  getSession(): Session {
    try {
      const raw = localStorage.getItem(KEYS.session);
      return raw ? (JSON.parse(raw) as Session) : { userId: null };
    } catch {
      return { userId: null };
    }
  },

  setSession(userId: UUID | null): void {
    localStorage.setItem(KEYS.session, JSON.stringify({ userId }));
  },

  getCurrentUser(): User | null {
    const { userId } = this.getSession();
    if (!userId) return null;
    return read<User>(KEYS.users).find((u) => u.id === userId) ?? null;
  },
};

// ---------------------------------------------------------------------------
// Generic CRUD factory scoped to owner + optional investigation
// ---------------------------------------------------------------------------

interface Owned {
  ownerId: UUID;
}

function crud<T extends Owned & { id: UUID; createdAt: string }>(
  key: string
) {
  return {
    list(ownerId: UUID): T[] {
      return read<T>(key)
        .filter((r) => r.ownerId === ownerId)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },
    listByInvestigation(ownerId: UUID, investigationId: UUID): T[] {
      return read<T>(key)
        .filter(
          (r) =>
            r.ownerId === ownerId &&
            (r as unknown as { investigationId: UUID }).investigationId ===
              investigationId
        )
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },
    get(ownerId: UUID, id: UUID): T | undefined {
      return read<T>(key).find((r) => r.ownerId === ownerId && r.id === id);
    },
    create(ownerId: UUID, data: Omit<T, "id" | "ownerId" | "createdAt">): T {
      const all = read<T>(key);
      const record = {
        ...data,
        id: uid(),
        ownerId,
        createdAt: new Date().toISOString(),
      } as T;
      all.push(record);
      write(key, all);
      return record;
    },
    update(ownerId: UUID, id: UUID, patch: Partial<T>): T | undefined {
      const all = read<T>(key);
      const idx = all.findIndex((r) => r.ownerId === ownerId && r.id === id);
      if (idx === -1) return undefined;
      all[idx] = { ...all[idx], ...patch, id, ownerId };
      write(key, all);
      return all[idx];
    },
    remove(ownerId: UUID, id: UUID): void {
      const all = read<T>(key).filter(
        (r) => !(r.ownerId === ownerId && r.id === id)
      );
      write(key, all);
    },
    removeAllByInvestigation(ownerId: UUID, investigationId: UUID): void {
      const all = read<T>(key).filter(
        (r) =>
          !(
            r.ownerId === ownerId &&
            (r as unknown as { investigationId: UUID }).investigationId ===
              investigationId
          )
      );
      write(key, all);
    },
  };
}

// ---------------------------------------------------------------------------
// Investigations (special: updatedAt + delete cascade)
// ---------------------------------------------------------------------------

export const investigations = {
  ...crud<Investigation>(KEYS.investigations),
  create(
    ownerId: UUID,
    data: Omit<Investigation, "id" | "ownerId" | "createdAt" | "updatedAt">
  ): Investigation {
    const all = read<Investigation>(KEYS.investigations);
    const now = new Date().toISOString();
    const record: Investigation = {
      ...data,
      id: uid(),
      ownerId,
      createdAt: now,
      updatedAt: now,
    };
    all.push(record);
    write(KEYS.investigations, all);
    return record;
  },
  update(
    ownerId: UUID,
    id: UUID,
    patch: Partial<Investigation>
  ): Investigation | undefined {
    const all = read<Investigation>(KEYS.investigations);
    const idx = all.findIndex((r) => r.ownerId === ownerId && r.id === id);
    if (idx === -1) return undefined;
    all[idx] = {
      ...all[idx],
      ...patch,
      id,
      ownerId,
      updatedAt: new Date().toISOString(),
    };
    write(KEYS.investigations, all);
    return all[idx];
  },
  remove(ownerId: UUID, id: UUID): void {
    crud<Investigation>(KEYS.investigations).remove(ownerId, id);
    // cascade
    people.removeAllByInvestigation(ownerId, id);
    vehicles.removeAllByInvestigation(ownerId, id);
    events.removeAllByInvestigation(ownerId, id);
    evidence.removeAllByInvestigation(ownerId, id);
    sources.removeAllByInvestigation(ownerId, id);
    relevantInfo.removeAllByInvestigation(ownerId, id);
    reports.removeAllByInvestigation(ownerId, id);
    diligences.removeAllByInvestigation(ownerId, id);
    void attachments.removeAllByInvestigation(ownerId, id);
  },
};

// ---------------------------------------------------------------------------
// Per-investigation collections
// ---------------------------------------------------------------------------

export const people = crud<Person>(KEYS.people);
export const vehicles = crud<Vehicle>(KEYS.vehicles);
export const events = crud<TimelineEvent>(KEYS.events);
export const evidence = crud<Evidence>(KEYS.evidence);
export const sources = crud<Source>(KEYS.sources);
export const relevantInfo = crud<RelevantInfo>(KEYS.relevantInfo);
export const reports = crud<Report>(KEYS.reports);
export const diligences = crud<Diligence>(KEYS.diligences);

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

import type { SearchResult } from "./types";

export function searchAll(ownerId: UUID, query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: SearchResult[] = [];
  const invs = investigations.list(ownerId);
  const invMap = new Map(invs.map((i) => [i.id, i]));

  const match = (text: string) => text.toLowerCase().includes(q);

  for (const i of invs) {
    if (
      match(i.title) ||
      match(i.description) ||
      match(i.caseNumber) ||
      match(i.bulletinNumber) ||
      match(i.type) ||
      match(i.status)
    ) {
      results.push({
        type: "investigação",
        id: i.id,
        title: i.title,
        subtitle: `${i.type} • ${i.status}`,
      });
    }
  }
  for (const p of people.list(ownerId)) {
    if (
      match(p.name) ||
      match(p.cpf) ||
      match(p.email) ||
      match(p.phone) ||
      match(p.address) ||
      match(p.notes) ||
      match(p.role)
    ) {
      const inv = invMap.get(p.investigationId);
      results.push({
        type: "pessoa",
        id: p.id,
        investigationId: p.investigationId,
        title: p.name,
        subtitle: `${p.role}${inv ? " • " + inv.title : ""}`,
      });
    }
  }
  for (const v of vehicles.list(ownerId)) {
    if (
      match(v.plate) ||
      match(v.renavam) ||
      match(v.brand) ||
      match(v.model) ||
      match(v.color) ||
      match(v.owner) ||
      match(v.notes)
    ) {
      const inv = invMap.get(v.investigationId);
      results.push({
        type: "veículo",
        id: v.id,
        investigationId: v.investigationId,
        title: `${v.brand} ${v.model}`.trim() || v.plate,
        subtitle: `${v.plate}${inv ? " • " + inv.title : ""}`,
      });
    }
  }
  for (const e of events.list(ownerId)) {
    if (
      match(e.title) ||
      match(e.description) ||
      match(e.date) ||
      match(e.category) ||
      match(e.notes)
    ) {
      const inv = invMap.get(e.investigationId);
      results.push({
        type: "evento",
        id: e.id,
        investigationId: e.investigationId,
        title: e.title,
        subtitle: `${e.date}${inv ? " • " + inv.title : ""}`,
      });
    }
  }
  for (const ev of evidence.list(ownerId)) {
    if (
      match(ev.name) ||
      match(ev.description) ||
      match(ev.origin) ||
      match(ev.date) ||
      match(ev.category) ||
      match(ev.notes)
    ) {
      const inv = invMap.get(ev.investigationId);
      results.push({
        type: "evidência",
        id: ev.id,
        investigationId: ev.investigationId,
        title: ev.name,
        subtitle: `${ev.category}${inv ? " • " + inv.title : ""}`,
      });
    }
  }
  for (const s of sources.list(ownerId)) {
    if (
      match(s.name) ||
      match(s.description) ||
      match(s.url) ||
      match(s.date) ||
      match(s.category) ||
      match(s.notes)
    ) {
      const inv = invMap.get(s.investigationId);
      results.push({
        type: "fonte",
        id: s.id,
        investigationId: s.investigationId,
        title: s.name,
        subtitle: `${s.category}${inv ? " • " + inv.title : ""}`,
      });
    }
  }
  for (const r of relevantInfo.list(ownerId)) {
    if (match(r.label) || match(r.value) || match(r.category) || match(r.notes)) {
      const inv = invMap.get(r.investigationId);
      results.push({
        type: "informação",
        id: r.id,
        investigationId: r.investigationId,
        title: r.label,
        subtitle: `${r.value}${inv ? " • " + inv.title : ""}`,
      });
    }
  }
  for (const r of reports.list(ownerId)) {
    if (
      match(r.title) || match(r.kind) || match(r.status) || match(r.responsible) ||
      match(r.objective) || match(r.findings) || match(r.conclusion) || match(r.notes)
    ) {
      const inv = invMap.get(r.investigationId);
      results.push({
        type: "laudo",
        id: r.id,
        investigationId: r.investigationId,
        title: r.title,
        subtitle: `${r.kind} • ${r.status}${inv ? " • " + inv.title : ""}`,
      });
    }
  }
  for (const d of diligences.list(ownerId)) {
    if (
      match(d.title) || match(d.category) || match(d.status) || match(d.priority) ||
      match(d.responsible) || match(d.notes)
    ) {
      const inv = invMap.get(d.investigationId);
      results.push({
        type: "diligência",
        id: d.id,
        investigationId: d.investigationId,
        title: d.title,
        subtitle: `${d.priority} • ${d.status}${inv ? " • " + inv.title : ""}`,
      });
    }
  }
  return results;
}
