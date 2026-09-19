import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Activity, Car, ChevronRight, Clock, Fence as EvidenceIcon, FileText, Info, Link2, Network, Pencil, Plus, Trash2, Users, Calendar, Database } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  evidence as evidenceStore,
  events as eventsStore,
  investigations as invStore,
  people as peopleStore,
  relevantInfo as infoStore,
  sources as sourcesStore,
  vehicles as vehiclesStore,
} from "@/lib/storage";
import {
  CONFIDENCE_LEVELS,
  EVIDENCE_CATEGORIES,
  EVENT_CATEGORIES,
  INVESTIGATION_STATUSES,
  INVESTIGATION_TYPES,
  PERSON_ROLES,
  SOURCE_CATEGORIES,
  type ConfidenceLevel,
  type Evidence,
  type EvidenceCategory,
  type EventCategory,
  type Investigation,
  type InvestigationStatus,
  type InvestigationType,
  type Person,
  type PersonRole,
  type RelevantInfo,
  type Source,
  type SourceCategory,
  type TimelineEvent,
  type Vehicle,
} from "@/lib/types";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function confidenceVariant(c: ConfidenceLevel): "success" | "warning" | "destructive" {
  if (c === "Alta") return "success";
  if (c === "Média") return "warning";
  return "destructive";
}

interface Props {
  params: { id: string };
}

export default function InvestigationDetail({ params }: Props) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [refresh, setRefresh] = useState(0);
  const bump = () => setRefresh((r) => r + 1);

  const data = useMemo(() => {
    if (!user) return null;
    const inv = invStore.get(user.id, params.id);
    if (!inv) return null;
    const uid = user.id;
    return {
      inv,
      people: peopleStore.listByInvestigation(uid, params.id),
      vehicles: vehiclesStore.listByInvestigation(uid, params.id),
      events: eventsStore
        .listByInvestigation(uid, params.id)
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
      evidence: evidenceStore.listByInvestigation(uid, params.id),
      sources: sourcesStore.listByInvestigation(uid, params.id),
      info: infoStore.listByInvestigation(uid, params.id),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, params.id, refresh]);

  if (!data) {
    return (
      <AppShell showBack>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Investigação não encontrada.</p>
          <Button onClick={() => navigate("/")}>Voltar</Button>
        </div>
      </AppShell>
    );
  }

  const { inv } = data;

  return (
    <AppShell showBack title={inv.title}>
      <div className="container py-6 space-y-4">
        {/* Header card */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-2xl">{inv.title}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge>{inv.type}</Badge>
                  <Badge variant="secondary">{inv.status}</Badge>
                  {inv.caseNumber && (
                    <span className="flex items-center gap-1 text-xs">
                      <FileText className="h-3 w-3" /> {inv.caseNumber}
                    </span>
                  )}
                  {inv.bulletinNumber && (
                    <span className="text-xs">BO: {inv.bulletinNumber}</span>
                  )}
                </CardDescription>
              </div>
              <EditInvestigationButton inv={inv} onDone={bump} />
            </div>
            {inv.description && (
              <p className="pt-2 text-sm text-muted-foreground">
                {inv.description}
              </p>
            )}
          </CardHeader>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList className="flex h-auto flex-wrap">
            <TabsTrigger value="overview" className="gap-1.5">
              <Info className="h-4 w-4" /> Visão geral
            </TabsTrigger>
            <TabsTrigger value="people" className="gap-1.5">
              <Users className="h-4 w-4" /> Pessoas
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="gap-1.5">
              <Car className="h-4 w-4" /> Veículos
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1.5">
              <Clock className="h-4 w-4" /> Linha do tempo
            </TabsTrigger>
            <TabsTrigger value="evidence" className="gap-1.5">
              <EvidenceIcon className="h-4 w-4" /> Evidências
            </TabsTrigger>
            <TabsTrigger value="sources" className="gap-1.5">
              <Database className="h-4 w-4" /> Fontes
            </TabsTrigger>
            <TabsTrigger value="board" className="gap-1.5">
              <Network className="h-4 w-4" /> Mural
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab inv={inv} data={data} onRefresh={bump} />
          </TabsContent>
          <TabsContent value="people">
            <PeopleTab inv={inv} onRefresh={bump} />
          </TabsContent>
          <TabsContent value="vehicles">
            <VehiclesTab inv={inv} onRefresh={bump} />
          </TabsContent>
          <TabsContent value="timeline">
            <TimelineTab inv={inv} onRefresh={bump} />
          </TabsContent>
          <TabsContent value="evidence">
            <EvidenceTab inv={inv} onRefresh={bump} />
          </TabsContent>
          <TabsContent value="sources">
            <SourcesTab inv={inv} onRefresh={bump} />
          </TabsContent>
          <TabsContent value="board">
            <BoardTab data={data} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

// ---------------------------------------------------------------------------
// Edit investigation
// ---------------------------------------------------------------------------

function EditInvestigationButton({
  inv,
  onDone,
}: {
  inv: Investigation;
  onDone: () => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(inv.title);
  const [type, setType] = useState<InvestigationType>(inv.type);
  const [status, setStatus] = useState<InvestigationStatus>(inv.status);
  const [description, setDescription] = useState(inv.description);
  const [caseNumber, setCaseNumber] = useState(inv.caseNumber);
  const [bulletinNumber, setBulletinNumber] = useState(inv.bulletinNumber);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    invStore.update(user.id, inv.id, {
      title,
      type,
      status,
      description,
      caseNumber,
      bulletinNumber,
    });
    toast.success("Investigação atualizada.");
    setOpen(false);
    onDone();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar investigação</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as InvestigationType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INVESTIGATION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as InvestigationStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INVESTIGATION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nº do processo</Label>
              <Input value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nº do boletim</Label>
              <Input value={bulletinNumber} onChange={(e) => setBulletinNumber(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Overview tab
// ---------------------------------------------------------------------------

function OverviewTab({
  inv,
  data,
  onRefresh,
}: {
  inv: Investigation;
  data: {
    people: Person[];
    vehicles: Vehicle[];
    events: TimelineEvent[];
    evidence: Evidence[];
    sources: Source[];
    info: RelevantInfo[];
  };
  onRefresh: () => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-primary" /> Informações relevantes
          </CardTitle>
          <CardDescription>
            Dados flexíveis específicos deste caso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RelevantInfoSection inv={inv} onRefresh={onRefresh} info={data.info} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" /> Resumo do caso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Pessoas" value={data.people.length} />
            <Stat label="Veículos" value={data.vehicles.length} />
            <Stat label="Eventos" value={data.events.length} />
            <Stat label="Evidências" value={data.evidence.length} />
            <Stat label="Fontes" value={data.sources.length} />
            <Stat label="Informações" value={data.info.length} />
          </div>
          <Separator />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" /> Criada em {formatDate(inv.createdAt)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Relevant info
// ---------------------------------------------------------------------------

function RelevantInfoSection({
  inv,
  onRefresh,
  info,
}: {
  inv: Investigation;
  onRefresh: () => void;
  info: RelevantInfo[];
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !label.trim()) return;
    infoStore.create(user.id, {
      investigationId: inv.id,
      label: label.trim(),
      value: value.trim(),
      category: category.trim(),
      notes: notes.trim(),
    });
    setLabel(""); setValue(""); setCategory(""); setNotes("");
    setOpen(false);
    onRefresh();
    toast.success("Informação adicionada.");
  };

  const remove = (id: string) => {
    if (!user) return;
    infoStore.remove(user.id, id);
    onRefresh();
  };

  return (
    <div className="space-y-3">
      {info.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma informação relevante cadastrada.
        </p>
      ) : (
        <div className="space-y-2">
          {info.map((r) => (
            <div
              key={r.id}
              className="flex items-start justify-between gap-2 rounded-md border border-border p-3"
            >
              <div className="min-w-0">
                <p className="font-medium">{r.label}</p>
                <p className="text-sm text-muted-foreground">{r.value}</p>
                {r.category && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {r.category}
                  </Badge>
                )}
                {r.notes && (
                  <p className="mt-1 text-xs text-muted-foreground">{r.notes}</p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(r.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" /> Adicionar informação
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Informação relevante</DialogTitle>
            <DialogDescription>
              Placa, RENAVAM, CPF, CNPJ, número de processo, endereço, etc.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={create} className="space-y-4">
            <div className="space-y-2">
              <Label>Rótulo *</Label>
              <Input
                placeholder="Ex.: Placa, CNPJ, Nº do processo"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                placeholder="Ex.: ABC-1234"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input
                placeholder="Ex.: Veículo, Empresa, Processo"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Adicionar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// People tab
// ---------------------------------------------------------------------------

function PeopleTab({
  inv,
  onRefresh,
}: {
  inv: Investigation;
  onRefresh: () => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Person | null>(null);
  const [form, setForm] = useState({
    name: "",
    role: "Suspeito" as PersonRole,
    cpf: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const people = peopleStore.listByInvestigation(user!.id, inv.id);

  const startCreate = () => {
    setEditing(null);
    setForm({ name: "", role: "Suspeito", cpf: "", phone: "", email: "", address: "", notes: "" });
    setOpen(true);
  };

  const startEdit = (p: Person) => {
    setEditing(p);
    setForm({ name: p.name, role: p.role, cpf: p.cpf, phone: p.phone, email: p.email, address: p.address, notes: p.notes });
    setOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.name.trim()) return;
    if (editing) {
      peopleStore.update(user.id, editing.id, form);
      toast.success("Pessoa atualizada.");
    } else {
      peopleStore.create(user.id, { investigationId: inv.id, ...form });
      toast.success("Pessoa cadastrada.");
    }
    setOpen(false);
    onRefresh();
  };

  const remove = (id: string) => {
    if (!user) return;
    peopleStore.remove(user.id, id);
    onRefresh();
    toast.success("Pessoa removida.");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" /> Pessoas
            </CardTitle>
            <CardDescription>
              {people.length === 0
                ? "Nenhuma pessoa cadastrada."
                : `${people.length} pessoa(s) vinculada(s).`}
            </CardDescription>
          </div>
          <Button size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {people.length === 0 ? (
          <EmptyState icon={Users} label="Nenhuma pessoa cadastrada" />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {people.map((p) => (
              <div
                key={p.id}
                className="group flex items-start justify-between gap-2 rounded-md border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">{p.name}</p>
                  <Badge variant="secondary" className="my-1 text-xs">{p.role}</Badge>
                  <div className="space-y-0.5 text-xs text-muted-foreground">
                    {p.cpf && <p>CPF: {p.cpf}</p>}
                    {p.phone && <p>Tel: {p.phone}</p>}
                    {p.email && <p>{p.email}</p>}
                    {p.address && <p>{p.address}</p>}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar pessoa" : "Nova pessoa"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
              </div>
              <div className="space-y-2">
                <Label>Papel</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as PersonRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PERSON_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            <DialogFooter>
              <Button type="submit">{editing ? "Salvar" : "Cadastrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Vehicles tab
// ---------------------------------------------------------------------------

function VehiclesTab({
  inv,
  onRefresh,
}: {
  inv: Investigation;
  onRefresh: () => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({
    plate: "", brand: "", model: "", color: "", renavam: "", owner: "", notes: "",
  });

  const vehicles = vehiclesStore.listByInvestigation(user!.id, inv.id);

  const startCreate = () => {
    setEditing(null);
    setForm({ plate: "", brand: "", model: "", color: "", renavam: "", owner: "", notes: "" });
    setOpen(true);
  };

  const startEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({ plate: v.plate, brand: v.brand, model: v.model, color: v.color, renavam: v.renavam, owner: v.owner, notes: v.notes });
    setOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.plate.trim() && !form.brand.trim() && !form.model.trim()) {
      toast.error("Informe ao menos placa ou marca/modelo.");
      return;
    }
    if (editing) {
      vehiclesStore.update(user.id, editing.id, form);
      toast.success("Veículo atualizado.");
    } else {
      vehiclesStore.create(user.id, { investigationId: inv.id, ...form });
      toast.success("Veículo cadastrado.");
    }
    setOpen(false);
    onRefresh();
  };

  const remove = (id: string) => {
    if (!user) return;
    vehiclesStore.remove(user.id, id);
    onRefresh();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="h-4 w-4 text-primary" /> Veículos
            </CardTitle>
            <CardDescription>
              {vehicles.length === 0 ? "Nenhum veículo cadastrado." : `${vehicles.length} veículo(s).`}
            </CardDescription>
          </div>
          <Button size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {vehicles.length === 0 ? (
          <EmptyState icon={Car} label="Nenhum veículo cadastrado" />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {vehicles.map((v) => (
              <div key={v.id} className="group flex items-start justify-between gap-2 rounded-md border border-border p-3">
                <div className="min-w-0">
                  <p className="font-medium">{v.brand} {v.model}</p>
                  <div className="space-y-0.5 text-xs text-muted-foreground">
                    {v.plate && <p>Placa: <span className="font-semibold text-foreground">{v.plate}</span></p>}
                    {v.color && <p>Cor: {v.color}</p>}
                    {v.renavam && <p>RENAVAM: {v.renavam}</p>}
                    {v.owner && <p>Proprietário: {v.owner}</p>}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(v)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(v.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar veículo" : "Novo veículo"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Placa</Label>
                <Input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} autoFocus />
              </div>
              <div className="space-y-2">
                <Label>RENAVAM</Label>
                <Input value={form.renavam} onChange={(e) => setForm({ ...form, renavam: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cor</Label>
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Proprietário</Label>
                <Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            <DialogFooter>
              <Button type="submit">{editing ? "Salvar" : "Cadastrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Timeline tab
// ---------------------------------------------------------------------------

function TimelineTab({
  inv,
  onRefresh,
}: {
  inv: Investigation;
  onRefresh: () => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TimelineEvent | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    title: "",
    description: "",
    category: "Ocorrência" as EventCategory,
    notes: "",
  });

  const events = eventsStore
    .listByInvestigation(user!.id, inv.id)
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const startCreate = () => {
    setEditing(null);
    setForm({ date: new Date().toISOString().slice(0, 10), title: "", description: "", category: "Ocorrência", notes: "" });
    setOpen(true);
  };

  const startEdit = (ev: TimelineEvent) => {
    setEditing(ev);
    setForm({ date: ev.date, title: ev.title, description: ev.description, category: ev.category, notes: ev.notes });
    setOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title.trim()) return;
    if (editing) {
      eventsStore.update(user.id, editing.id, form);
      toast.success("Evento atualizado.");
    } else {
      eventsStore.create(user.id, { investigationId: inv.id, ...form });
      toast.success("Evento adicionado.");
    }
    setOpen(false);
    onRefresh();
  };

  const remove = (id: string) => {
    if (!user) return;
    eventsStore.remove(user.id, id);
    onRefresh();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" /> Linha do tempo
            </CardTitle>
            <CardDescription>
              {events.length === 0 ? "Nenhum evento cadastrado." : `${events.length} evento(s).`}
            </CardDescription>
          </div>
          <Button size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4" /> Adicionar evento
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <EmptyState icon={Clock} label="Nenhum evento na linha do tempo" />
        ) : (
          <div className="relative space-y-4 pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
            {events.map((ev) => (
              <div key={ev.id} className="group relative">
                <div className="absolute -left-[18px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                <div className="flex items-start justify-between gap-2 rounded-md border border-border p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary">{formatDate(ev.date)}</span>
                      <Badge variant="secondary" className="text-xs">{ev.category}</Badge>
                    </div>
                    <p className="mt-1 font-medium">{ev.title}</p>
                    {ev.description && <p className="text-sm text-muted-foreground">{ev.description}</p>}
                    {ev.notes && <p className="mt-1 text-xs text-muted-foreground">{ev.notes}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(ev)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(ev.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar evento" : "Novo evento"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as EventCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            <DialogFooter>
              <Button type="submit">{editing ? "Salvar" : "Adicionar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Evidence tab
// ---------------------------------------------------------------------------

function EvidenceTab({
  inv,
  onRefresh,
}: {
  inv: Investigation;
  onRefresh: () => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Evidence | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "Documento" as EvidenceCategory,
    description: "",
    origin: "",
    confidence: "Média" as ConfidenceLevel,
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const items = evidenceStore.listByInvestigation(user!.id, inv.id);

  const startCreate = () => {
    setEditing(null);
    setForm({ name: "", category: "Documento", description: "", origin: "", confidence: "Média", date: new Date().toISOString().slice(0, 10), notes: "" });
    setOpen(true);
  };

  const startEdit = (ev: Evidence) => {
    setEditing(ev);
    setForm({ name: ev.name, category: ev.category, description: ev.description, origin: ev.origin, confidence: ev.confidence, date: ev.date, notes: ev.notes });
    setOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.name.trim()) return;
    if (editing) {
      evidenceStore.update(user.id, editing.id, form);
      toast.success("Evidência atualizada.");
    } else {
      evidenceStore.create(user.id, { investigationId: inv.id, ...form });
      toast.success("Evidência registrada.");
    }
    setOpen(false);
    onRefresh();
  };

  const remove = (id: string) => {
    if (!user) return;
    evidenceStore.remove(user.id, id);
    onRefresh();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <EvidenceIcon className="h-4 w-4 text-primary" /> Evidências
            </CardTitle>
            <CardDescription>
              {items.length === 0 ? "Nenhuma evidência registrada." : `${items.length} evidência(s).`}
            </CardDescription>
          </div>
          <Button size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState icon={EvidenceIcon} label="Nenhuma evidência registrada" />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((ev) => (
              <div key={ev.id} className="group flex items-start justify-between gap-2 rounded-md border border-border p-3">
                <div className="min-w-0">
                  <p className="font-medium">{ev.name}</p>
                  <div className="flex flex-wrap items-center gap-1.5 py-1">
                    <Badge variant="secondary" className="text-xs">{ev.category}</Badge>
                    <Badge variant={confidenceVariant(ev.confidence)} className="text-xs">
                      Confiança: {ev.confidence}
                    </Badge>
                  </div>
                  <div className="space-y-0.5 text-xs text-muted-foreground">
                    {ev.date && <p>{formatDate(ev.date)}</p>}
                    {ev.origin && <p>Origem: {ev.origin}</p>}
                    {ev.description && <p>{ev.description}</p>}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(ev)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(ev.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar evidência" : "Nova evidência"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as EvidenceCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVIDENCE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Nível de confiança</Label>
                <Select value={form.confidence} onValueChange={(v) => setForm({ ...form, confidence: v as ConfidenceLevel })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONFIDENCE_LEVELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Origem</Label>
              <Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            <DialogFooter>
              <Button type="submit">{editing ? "Salvar" : "Registrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Sources tab
// ---------------------------------------------------------------------------

function SourcesTab({
  inv,
  onRefresh,
}: {
  inv: Investigation;
  onRefresh: () => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Source | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "Pública" as SourceCategory,
    description: "",
    url: "",
    confidence: "Média" as ConfidenceLevel,
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const items = sourcesStore.listByInvestigation(user!.id, inv.id);

  const startCreate = () => {
    setEditing(null);
    setForm({ name: "", category: "Pública", description: "", url: "", confidence: "Média", date: new Date().toISOString().slice(0, 10), notes: "" });
    setOpen(true);
  };

  const startEdit = (s: Source) => {
    setEditing(s);
    setForm({ name: s.name, category: s.category, description: s.description, url: s.url, confidence: s.confidence, date: s.date, notes: s.notes });
    setOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.name.trim()) return;
    if (editing) {
      sourcesStore.update(user.id, editing.id, form);
      toast.success("Fonte atualizada.");
    } else {
      sourcesStore.create(user.id, { investigationId: inv.id, ...form });
      toast.success("Fonte registrada.");
    }
    setOpen(false);
    onRefresh();
  };

  const remove = (id: string) => {
    if (!user) return;
    sourcesStore.remove(user.id, id);
    onRefresh();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4 text-primary" /> Fontes
            </CardTitle>
            <CardDescription>
              {items.length === 0 ? "Nenhuma fonte registrada." : `${items.length} fonte(s).`}
            </CardDescription>
          </div>
          <Button size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState icon={Database} label="Nenhuma fonte registrada" />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((s) => (
              <div key={s.id} className="group flex items-start justify-between gap-2 rounded-md border border-border p-3">
                <div className="min-w-0">
                  <p className="font-medium">{s.name}</p>
                  <div className="flex flex-wrap items-center gap-1.5 py-1">
                    <Badge variant="secondary" className="text-xs">{s.category}</Badge>
                    <Badge variant={confidenceVariant(s.confidence)} className="text-xs">
                      Confiança: {s.confidence}
                    </Badge>
                  </div>
                  <div className="space-y-0.5 text-xs text-muted-foreground">
                    {s.date && <p>{formatDate(s.date)}</p>}
                    {s.url && <p className="truncate">{s.url}</p>}
                    {s.description && <p>{s.description}</p>}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(s.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar fonte" : "Nova fonte"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as SourceCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SOURCE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Nível de confiança</Label>
                <Select value={form.confidence} onValueChange={(v) => setForm({ ...form, confidence: v as ConfidenceLevel })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONFIDENCE_LEVELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="opcional" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            <DialogFooter>
              <Button type="submit">{editing ? "Salvar" : "Registrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Board tab — relationship map using real data
// ---------------------------------------------------------------------------

function BoardTab({
  data,
}: {
  data: {
    inv: Investigation;
    people: Person[];
    vehicles: Vehicle[];
    events: TimelineEvent[];
    evidence: Evidence[];
    sources: Source[];
    info: RelevantInfo[];
  };
}) {
  const { inv, people, vehicles, events, evidence, sources } = data;
  const totalElements =
    people.length + vehicles.length + events.length + evidence.length + sources.length;

  if (totalElements === 0) {
    return (
      <Card>
        <CardContent className="py-16">
          <EmptyState icon={Network} label="Nenhum elemento cadastrado ainda. Adicione pessoas, veículos, eventos ou evidências para visualizar as conexões." />
        </CardContent>
      </Card>
    );
  }

  const sections = [
    { label: "Pessoas", icon: Users, color: "text-amber-400", items: people.map((p) => p.name) },
    { label: "Veículos", icon: Car, color: "text-cyan-400", items: vehicles.map((v) => `${v.brand} ${v.model}`.trim() || v.plate) },
    { label: "Eventos", icon: Clock, color: "text-purple-400", items: events.map((e) => `${formatDate(e.date)} — ${e.title}`) },
    { label: "Evidências", icon: EvidenceIcon, color: "text-rose-400", items: evidence.map((e) => e.name) },
    { label: "Fontes", icon: Database, color: "text-sky-400", items: sources.map((s) => s.name) },
  ].filter((s) => s.items.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Network className="h-4 w-4 text-primary" /> Mural de relações
        </CardTitle>
        <CardDescription>
          Visão geral dos elementos vinculados à investigação "{inv.title}".
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-2">
            {sections.map((s, i) => (
              <div key={s.label}>
                {i > 0 && (
                  <div className="flex items-center justify-center py-1">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <span className="text-sm font-semibold">{s.label}</span>
                    <Badge variant="secondary" className="text-xs">{s.items.length}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs"
                      >
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Empty state helper
// ---------------------------------------------------------------------------

function EmptyState({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
