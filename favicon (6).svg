import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Activity, Calendar, FileText, FolderSearch, FolderPlus, Users, Car, Fence as EvidenceIcon, Network, TrendingUp, Clock, CircleCheck as CheckCircle2, Archive } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  evidence,
  events,
  investigations as invStore,
  people,
  vehicles,
  reports,
  diligences,
} from "@/lib/storage";
import {
  INVESTIGATION_STATUSES,
  INVESTIGATION_TYPES,
  type Investigation,
  type InvestigationStatus,
  type InvestigationType,
} from "@/lib/types";

function statusVariant(
  status: InvestigationStatus
): "default" | "secondary" | "success" | "warning" {
  switch (status) {
    case "Ativa":
      return "default";
    case "Concluída":
      return "success";
    case "Pausada":
      return "warning";
    default:
      return "secondary";
  }
}

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

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<InvestigationType>("Criminal");
  const [status, setStatus] = useState<InvestigationStatus>("Ativa");
  const [description, setDescription] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [bulletinNumber, setBulletinNumber] = useState("");

  const stats = useMemo(() => {
    if (!user) return null;
    const uid = user.id;
    const invs = invStore.list(uid);
    const active = invs.filter((i) => i.status === "Ativa").length;
    const concluded = invs.filter((i) => i.status === "Concluída").length;
    const archived = invs.filter((i) => i.status === "Arquivada").length;
    const ppl = people.list(uid).length;
    const veh = vehicles.list(uid).length;
    const ev = events.list(uid).length;
    const evi = evidence.list(uid).length;
    const reportCount = reports.list(uid).length;
    const diligenceCount = diligences.list(uid).length;
    return { invs, active, concluded, archived, ppl, veh, ev, evi, reportCount, diligenceCount };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refresh]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) {
      toast.error("Informe um título para a investigação.");
      return;
    }
    invStore.create(user.id, {
      title: title.trim(),
      type,
      status,
      description: description.trim(),
      caseNumber: caseNumber.trim(),
      bulletinNumber: bulletinNumber.trim(),
    });
    toast.success("Investigação criada!");
    setTitle("");
    setDescription("");
    setCaseNumber("");
    setBulletinNumber("");
    setType("Criminal");
    setStatus("Ativa");
    setOpen(false);
    setRefresh((r) => r + 1);
  };

  const handleDelete = (id: string) => {
    if (!user) return;
    invStore.remove(user.id, id);
    toast.success("Investigação excluída.");
    setRefresh((r) => r + 1);
  };

  if (!stats) return null;

  const cards = [
    {
      label: "Investigações",
      value: stats.invs.length,
      icon: FolderSearch,
      color: "text-blue-400",
    },
    {
      label: "Ativas",
      value: stats.active,
      icon: Activity,
      color: "text-emerald-400",
    },
    {
      label: "Concluídas",
      value: stats.concluded,
      icon: CheckCircle2,
      color: "text-sky-400",
    },
    {
      label: "Arquivadas",
      value: stats.archived,
      icon: Archive,
      color: "text-muted-foreground",
    },
    {
      label: "Pessoas",
      value: stats.ppl,
      icon: Users,
      color: "text-amber-400",
    },
    {
      label: "Veículos",
      value: stats.veh,
      icon: Car,
      color: "text-cyan-400",
    },
    {
      label: "Eventos",
      value: stats.ev,
      icon: Clock,
      color: "text-purple-400",
    },
    {
      label: "Evidências",
      value: stats.evi,
      icon: EvidenceIcon,
      color: "text-rose-400",
    },
    {
      label: "Laudos",
      value: stats.reportCount,
      icon: FileText,
      color: "text-indigo-400",
    },
    {
      label: "Diligências",
      value: stats.diligenceCount,
      icon: CheckCircle2,
      color: "text-lime-400",
    },
  ];

  return (
    <AppShell>
      <div className="container py-6 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {cards.map((c) => (
            <Card key={c.label} className="overflow-hidden">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <c.icon className={`h-5 w-5 ${c.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold leading-tight">{c.value}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Investigations list */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Investigações</h2>
            <p className="text-sm text-muted-foreground">
              {stats.invs.length === 0
                ? "Você ainda não possui investigações."
                : `${stats.invs.length} investigação(ões) cadastrada(s).`}
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <FolderPlus className="h-4 w-4" />
                Nova investigação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Nova investigação</DialogTitle>
                <DialogDescription>
                  Crie um novo caso para organizar pessoas, evidências e
                  eventos.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inv-title">Título *</Label>
                  <Input
                    id="inv-title"
                    placeholder="Ex.: Caso 007/2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={type}
                      onValueChange={(v) =>
                        setType(v as InvestigationType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INVESTIGATION_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={status}
                      onValueChange={(v) =>
                        setStatus(v as InvestigationStatus)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INVESTIGATION_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inv-case">Número do processo</Label>
                    <Input
                      id="inv-case"
                      placeholder="opcional"
                      value={caseNumber}
                      onChange={(e) => setCaseNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inv-bulletin">Número do boletim</Label>
                    <Input
                      id="inv-bulletin"
                      placeholder="opcional"
                      value={bulletinNumber}
                      onChange={(e) => setBulletinNumber(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv-desc">Descrição</Label>
                  <Textarea
                    id="inv-desc"
                    placeholder="Resumo do caso..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Criar investigação</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {stats.invs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <FolderSearch className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Nenhuma investigação ainda</p>
                <p className="text-sm text-muted-foreground">
                  Crie sua primeira investigação para começar a organizar
                  dados.
                </p>
              </div>
              <Button onClick={() => setOpen(true)}>
                <FolderPlus className="h-4 w-4" />
                Nova investigação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.invs.map((inv: Investigation) => (
              <Card
                key={inv.id}
                className="group cursor-pointer transition-all hover:ring-1 hover:ring-primary/40"
                onClick={() => navigate(`/investigation/${inv.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="truncate">{inv.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span>{inv.type}</span>
                      </CardDescription>
                    </div>
                    <Badge variant={statusVariant(inv.status)}>
                      {inv.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {inv.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {inv.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {inv.caseNumber && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {inv.caseNumber}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(inv.createdAt)}
                    </span>
                  </div>
                  <div
                    className="flex justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Excluir investigação?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Todos os dados vinculados (pessoas, veículos,
                            eventos, evidências, fontes) serão removidos
                            permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(inv.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick info row */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Pulso de análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Pessoas: </span>
                  <span className="font-semibold">{stats.ppl}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Veículos: </span>
                  <span className="font-semibold">{stats.veh}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Eventos: </span>
                  <span className="font-semibold">{stats.ev}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Evidências: </span>
                  <span className="font-semibold">{stats.evi}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Network className="h-4 w-4 text-primary" />
                Mapa de relações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Abra uma investigação para visualizar as conexões entre
                pessoas, veículos, eventos e evidências do caso.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
