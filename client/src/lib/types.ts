// Core data models for NEXUS Forense.
// All entities are scoped to a single user (ownerId) and an investigation (investigationId),
// so the same shape can map 1:1 to a future Firestore migration.

export type UUID = string;

export type InvestigationType =
  | "Criminal"
  | "Homicídio"
  | "Desaparecimento"
  | "Fraude"
  | "Cível"
  | "Trabalhista"
  | "Administrativa"
  | "Empresarial"
  | "Acidente"
  | "Outro";

export type InvestigationStatus =
  | "Ativa"
  | "Concluída"
  | "Arquivada"
  | "Pausada";

export const INVESTIGATION_TYPES: InvestigationType[] = [
  "Criminal",
  "Homicídio",
  "Desaparecimento",
  "Fraude",
  "Cível",
  "Trabalhista",
  "Administrativa",
  "Empresarial",
  "Acidente",
  "Outro",
];

export const INVESTIGATION_STATUSES: InvestigationStatus[] = [
  "Ativa",
  "Concluída",
  "Arquivada",
  "Pausada",
];

export type PersonRole =
  | "Suspeito"
  | "Investigado"
  | "Vítima"
  | "Testemunha"
  | "Comunicante"
  | "Perito"
  | "Advogado"
  | "Autoridade"
  | "Outro";

export const PERSON_ROLES: PersonRole[] = [
  "Suspeito",
  "Investigado",
  "Vítima",
  "Testemunha",
  "Comunicante",
  "Perito",
  "Advogado",
  "Autoridade",
  "Outro",
];

export type EventCategory =
  | "Ocorrência"
  | "Depoimento"
  | "Perícia"
  | "Movimentação judicial"
  | "Diligência"
  | "Reunião"
  | "Outro";

export const EVENT_CATEGORIES: EventCategory[] = [
  "Ocorrência",
  "Depoimento",
  "Perícia",
  "Movimentação judicial",
  "Diligência",
  "Reunião",
  "Outro",
];

export type ConfidenceLevel = "Alta" | "Média" | "Baixa";

export const CONFIDENCE_LEVELS: ConfidenceLevel[] = ["Alta", "Média", "Baixa"];

export type EvidenceCategory =
  | "Documento"
  | "Foto"
  | "Vídeo"
  | "Áudio"
  | "Material"
  | "Digital"
  | "Material biológico"
  | "Vestígio"
  | "Dispositivo eletrônico"
  | "Impressão digital"
  | "Arma/objeto"
  | "Documento financeiro"
  | "Documento digital"
  | "Testemunhal"
  | "Outro";

export const EVIDENCE_CATEGORIES: EvidenceCategory[] = [
  "Documento",
  "Foto",
  "Vídeo",
  "Áudio",
  "Material",
  "Digital",
  "Material biológico",
  "Vestígio",
  "Dispositivo eletrônico",
  "Impressão digital",
  "Arma/objeto",
  "Documento financeiro",
  "Documento digital",
  "Testemunhal",
  "Outro",
];

export type EvidenceStatus = "Registrada" | "Em análise" | "Preservada" | "Arquivada";
export const EVIDENCE_STATUSES: EvidenceStatus[] = ["Registrada", "Em análise", "Preservada", "Arquivada"];
export const EVIDENCE_SUBCATEGORIES = ["Cena do fato", "Laboratório", "Digital", "Documental", "Biológica", "Financeira", "Outra"] as const;

export type SourceCategory =
  | "Oficial"
  | "Pública"
  | "Privada"
  | "Denúncia"
  | "Outro";

export const SOURCE_CATEGORIES: SourceCategory[] = [
  "Oficial",
  "Pública",
  "Privada",
  "Denúncia",
  "Outro",
];

export type ReportKind = "Laudo técnico" | "Parecer técnico" | "Relatório investigativo";
export type ReportStatus = "Rascunho" | "Em revisão" | "Concluído";

export const REPORT_KINDS: ReportKind[] = [
  "Laudo técnico",
  "Parecer técnico",
  "Relatório investigativo",
];

export const REPORT_STATUSES: ReportStatus[] = [
  "Rascunho",
  "Em revisão",
  "Concluído",
];

export type DiligenceStatus = "Planejada" | "Em andamento" | "Concluída" | "Cancelada";
export type DiligencePriority = "Baixa" | "Média" | "Alta" | "Urgente";

export const DILIGENCE_STATUSES: DiligenceStatus[] = [
  "Planejada",
  "Em andamento",
  "Concluída",
  "Cancelada",
];

export const DILIGENCE_PRIORITIES: DiligencePriority[] = [
  "Baixa",
  "Média",
  "Alta",
  "Urgente",
];

export type AttachmentKind =
  | "Foto"
  | "Impressão digital"
  | "Laudo toxicológico"
  | "Laudo pericial"
  | "Documento"
  | "Áudio"
  | "Vídeo"
  | "Outro";

export const ATTACHMENT_KINDS: AttachmentKind[] = [
  "Foto",
  "Impressão digital",
  "Laudo toxicológico",
  "Laudo pericial",
  "Documento",
  "Áudio",
  "Vídeo",
  "Outro",
];

export interface User {
  id: UUID;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Investigation {
  id: UUID;
  ownerId: UUID;
  title: string;
  type: InvestigationType;
  status: InvestigationStatus;
  description: string;
  caseNumber: string;
  bulletinNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id: UUID;
  investigationId: UUID;
  ownerId: UUID;
  name: string;
  role: PersonRole;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
}

export interface Vehicle {
  id: UUID;
  investigationId: UUID;
  ownerId: UUID;
  plate: string;
  brand: string;
  model: string;
  color: string;
  renavam: string;
  owner: string;
  notes: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: UUID;
  investigationId: UUID;
  ownerId: UUID;
  date: string;
  title: string;
  description: string;
  category: EventCategory;
  notes: string;
  createdAt: string;
}

export interface Evidence {
  id: UUID;
  investigationId: UUID;
  ownerId: UUID;
  name: string;
  category: EvidenceCategory;
  description: string;
  origin: string;
  confidence: ConfidenceLevel;
  date: string;
  notes: string;
  createdAt: string;
  code?: string;
  subcategory?: string;
  collectionLocation?: string;
  collectionTime?: string;
  collector?: string;
  registrar?: string;
  status?: EvidenceStatus;
  eventId?: UUID;
  personId?: UUID;
  vehicleId?: UUID;
  locationId?: UUID;
}

export interface Source {
  id: UUID;
  investigationId: UUID;
  ownerId: UUID;
  name: string;
  category: SourceCategory;
  description: string;
  url: string;
  confidence: ConfidenceLevel;
  date: string;
  notes: string;
  createdAt: string;
}

export interface RelevantInfo {
  id: UUID;
  investigationId: UUID;
  ownerId: UUID;
  label: string;
  value: string;
  category: string;
  notes: string;
  createdAt: string;
}

export interface Report {
  id: UUID;
  investigationId: UUID;
  ownerId: UUID;
  title: string;
  kind: ReportKind;
  status: ReportStatus;
  responsible: string;
  date: string;
  objective: string;
  methodology: string;
  findings: string;
  conclusion: string;
  recommendations: string;
  notes: string;
  createdAt: string;
}

export interface Diligence {
  id: UUID;
  investigationId: UUID;
  ownerId: UUID;
  title: string;
  category: string;
  status: DiligenceStatus;
  priority: DiligencePriority;
  dueDate: string;
  responsible: string;
  notes: string;
  createdAt: string;
}

export interface Attachment {
  id: UUID;
  investigationId: UUID;
  ownerId: UUID;
  name: string;
  kind: AttachmentKind;
  mimeType: string;
  size: number;
  description: string;
  createdAt: string;
  evidenceId?: UUID;
  sha256?: string;
  hashCalculatedAt?: string;
  originalSize?: number;
  previewSize?: number;
  width?: number;
  height?: number;
  duration?: number;
  version?: number;
  role?: "original" | "preview" | "thumbnail";
}

export type CustodyAction = "Coleta" | "Recebimento" | "Identificação" | "Acondicionamento" | "Transporte" | "Armazenamento" | "Entrega" | "Análise" | "Devolução" | "Descarte" | "Outro";
export const CUSTODY_ACTIONS: CustodyAction[] = ["Coleta", "Recebimento", "Identificação", "Acondicionamento", "Transporte", "Armazenamento", "Entrega", "Análise", "Devolução", "Descarte", "Outro"];
export interface CustodyEvent { id: UUID; investigationId: UUID; ownerId: UUID; evidenceId: UUID; date: string; time: string; responsible: string; origin: string; destination: string; action: CustodyAction; description: string; condition: string; notes: string; createdAt: string; }
export interface FingerprintRecord { id: UUID; investigationId: UUID; ownerId: UUID; personId?: UUID; finger: string; hand: "Direita" | "Esquerda"; classification: string; quality: ConfidenceLevel; location: string; date: string; responsible: string; method: string; notes: string; createdAt: string; }
export interface DocumentRecord { id: UUID; investigationId: UUID; ownerId: UUID; name: string; type: string; description: string; origin: string; date: string; number: string; responsible: string; notes: string; createdAt: string; }
export interface Location { id: UUID; investigationId: UUID; ownerId: UUID; name: string; address: string; reference: string; latitude: string; longitude: string; description: string; notes: string; createdAt: string; }
export interface AuditEntry { id: UUID; investigationId: UUID; ownerId: UUID; action: string; entity: string; description: string; createdAt: string; }

export interface Session {
  userId: UUID | null;
}

export interface SearchResult {
  type:
    | "investigação"
    | "pessoa"
    | "veículo"
    | "evento"
    | "evidência"
    | "fonte"
    | "informação"
    | "laudo"
    | "diligência";
  id: UUID;
  investigationId?: UUID;
  title: string;
  subtitle: string;
}
