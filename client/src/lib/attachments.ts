import { nanoid } from "nanoid";
import type { Attachment, AttachmentKind, UUID } from "./types";

const META_KEY = "nexus:attachments";
const DB_NAME = "nexus-forense-files";
const STORE_NAME = "files";
const MAX_FILE_SIZE = 100 * 1024 * 1024;

type FileRecord = { id: string; blob: Blob };

function readMeta(): Attachment[] {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) as Attachment[] : [];
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
    request.onerror = () => reject(request.error ?? new Error("Falha ao abrir armazenamento."));
  });
}

async function putFile(id: string, blob: Blob) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ id, blob } satisfies FileRecord);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
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
    // Metadata is still removed when IndexedDB is unavailable.
  }
}

async function getFile(id: UUID): Promise<Blob | undefined> {
  const db = await openDb();
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve((request.result as FileRecord | undefined)?.blob);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return blob;
}

export async function sha256(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function imageInfo(file: File) {
  if (!file.type.startsWith("image/") || file.type === "image/heic" || file.type === "image/heif") return {};
  try {
    const bitmap = await createImageBitmap(file);
    const info = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return info;
  } catch {
    return {};
  }
}

async function makePreview(file: File, maxSide: number, quality: number): Promise<Blob | undefined> {
  if (!file.type.startsWith("image/") || file.type === "image/heic" || file.type === "image/heif") return undefined;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return await new Promise((resolve) => canvas.toBlob((blob) => resolve(blob ?? undefined), "image/jpeg", quality));
  } catch {
    return undefined;
  }
}

function logicalFiles(items: Attachment[]) {
  return items.filter((item) => item.role === "original" || !item.role);
}

export const attachments = {
  /** Returns one logical card per uploaded file; derived preview records stay internal. */
  list(ownerId: UUID, investigationId: UUID, evidenceId?: UUID): Attachment[] {
    return logicalFiles(readMeta().filter((a) => a.ownerId === ownerId && a.investigationId === investigationId && (evidenceId === undefined || a.evidenceId === evidenceId)))
      .sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
  },
  listByOwner(ownerId: UUID): Attachment[] {
    return logicalFiles(readMeta().filter((a) => a.ownerId === ownerId));
  },
  async create(ownerId: UUID, investigationId: UUID, file: File, kind: AttachmentKind, description: string, evidenceId?: UUID): Promise<Attachment> {
    if (file.size > MAX_FILE_SIZE) throw new Error("O arquivo excede o limite de 100 MB.");
    const id = nanoid();
    const hash = await sha256(file);
    const info = await imageInfo(file);
    await putFile(id, file);
    const now = new Date().toISOString();
    const record: Attachment = { id, ownerId, investigationId, evidenceId, name: file.name, kind, mimeType: file.type || "application/octet-stream", size: file.size, originalSize: file.size, description, sha256: hash, hashCalculatedAt: now, version: 1, role: "original", createdAt: now, ...info };
    const all = readMeta();
    all.push(record);
    const preview = await makePreview(file, 1600, 0.82);
    if (preview) {
      const previewId = nanoid();
      await putFile(previewId, preview);
      all.push({ ...record, id: previewId, name: `${file.name} — preview`, mimeType: "image/jpeg", size: preview.size, previewSize: preview.size, role: "preview", sha256: await sha256(preview), createdAt: now });
    }
    const thumbnail = await makePreview(file, 320, 0.72);
    if (thumbnail) {
      const thumbnailId = nanoid();
      await putFile(thumbnailId, thumbnail);
      all.push({ ...record, id: thumbnailId, name: `${file.name} — thumbnail`, mimeType: "image/jpeg", size: thumbnail.size, previewSize: thumbnail.size, role: "thumbnail", sha256: await sha256(thumbnail), createdAt: now });
    }
    writeMeta(all);
    return record;
  },
  async getBlob(id: UUID): Promise<Blob | undefined> {
    return getFile(id);
  },
  async getPreviewBlob(item: Attachment): Promise<Blob | undefined> {
    const all = readMeta();
    const preview = all.find((candidate) => candidate.ownerId === item.ownerId && candidate.investigationId === item.investigationId && candidate.evidenceId === item.evidenceId && candidate.role === "preview" && candidate.name.startsWith(item.name));
    return getFile(preview?.id ?? item.id);
  },
  async recalculateHash(id: UUID): Promise<string | undefined> {
    const blob = await getFile(id);
    if (!blob) return undefined;
    const hash = await sha256(blob);
    const all = readMeta();
    const item = all.find((a) => a.id === id);
    if (item) {
      item.sha256 = hash;
      item.hashCalculatedAt = new Date().toISOString();
      writeMeta(all);
    }
    return hash;
  },
  async remove(ownerId: UUID, id: UUID) {
    const all = readMeta();
    const item = all.find((a) => a.ownerId === ownerId && a.id === id);
    if (!item) return;
    const baseName = item.name.replace(/ — (preview|thumbnail)$/, "");
    const removed = all.filter((a) => a.ownerId === ownerId && (a.id === id || (a.investigationId === item.investigationId && a.name.startsWith(baseName))));
    writeMeta(all.filter((a) => !removed.some((r) => r.id === a.id)));
    await Promise.all(removed.map((a) => deleteFile(a.id)));
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
