import { nanoid } from "nanoid";
import type { Attachment, AttachmentKind, UUID } from "./types";

const META_KEY = "nexus:attachments";
const DB_NAME = "nexus-forense-files";
const STORE_NAME = "files";

type FileRecord = { id: string; blob: Blob };

function readMeta(): Attachment[] {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as Attachment[]) : [];
  } catch {
    return [];
  }
}

function writeMeta(items: Attachment[]) {
  localStorage.setItem(META_KEY, JSON.stringify(items));
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("Este navegador não oferece armazenamento de arquivos."));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Falha ao abrir armazenamento de arquivos."));
  });
}

async function putFile(id: string, blob: Blob) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ id, blob } satisfies FileRecord);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Falha ao salvar arquivo."));
  });
  db.close();
}

async function deleteFile(id: string) {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Metadata can still be removed if the browser has already discarded the file store.
  }
}

async function getFile(id: string): Promise<Blob | undefined> {
  const db = await openDb();
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve((request.result as FileRecord | undefined)?.blob);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return blob;
}

export const attachments = {
  list(ownerId: UUID, investigationId: UUID): Attachment[] {
    return readMeta()
      .filter((a) => a.ownerId === ownerId && a.investigationId === investigationId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },

  async create(
    ownerId: UUID,
    investigationId: UUID,
    file: File,
    kind: AttachmentKind,
    description: string
  ): Promise<Attachment> {
    const id = nanoid();
    await putFile(id, file);
    const record: Attachment = {
      id,
      ownerId,
      investigationId,
      name: file.name,
      kind,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      description,
      createdAt: new Date().toISOString(),
    };
    const all = readMeta();
    all.push(record);
    writeMeta(all);
    return record;
  },

  async getBlob(id: UUID): Promise<Blob | undefined> {
    return getFile(id);
  },

  async remove(ownerId: UUID, id: UUID) {
    const next = readMeta().filter((a) => !(a.ownerId === ownerId && a.id === id));
    writeMeta(next);
    await deleteFile(id);
  },

  async removeAllByInvestigation(ownerId: UUID, investigationId: UUID) {
    const all = readMeta();
    const removed = all.filter((a) => a.ownerId === ownerId && a.investigationId === investigationId);
    writeMeta(all.filter((a) => !(a.ownerId === ownerId && a.investigationId === investigationId)));
    await Promise.all(removed.map((a) => deleteFile(a.id)));
  },
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
