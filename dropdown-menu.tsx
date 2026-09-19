import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import {
  Fingerprint,
  LogOut,
  Moon,
  Search,
  Sun,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { searchAll } from "@/lib/storage";
import type { SearchResult } from "@/lib/types";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

export function AppShell({ children, title, showBack }: AppShellProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    if (!user) return;
    const r = searchAll(user.id, query);
    setResults(r);
    setShowResults(true);
  }, [query, user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const typeColor: Record<SearchResult["type"], string> = {
    investigação: "text-blue-400",
    pessoa: "text-amber-400",
    veículo: "text-emerald-400",
    evento: "text-purple-400",
    evidência: "text-rose-400",
    fonte: "text-cyan-400",
    informação: "text-orange-400",
    laudo: "text-indigo-400",
    diligência: "text-lime-400",
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              aria-label="Voltar"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
              <Fingerprint className="h-5 w-5 text-primary" />
            </div>
            <span className="hidden text-lg font-bold tracking-tight sm:inline">
              NEXUS Forense
            </span>
          </button>

          {title && (
            <span className="hidden text-sm text-muted-foreground md:inline">
              / {title}
            </span>
          )}

          <div ref={searchRef} className="relative ml-auto flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar em todos os casos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query && setShowResults(true)}
              className="pl-9"
            />
            {showResults && results.length > 0 && (
              <div className="absolute mt-2 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg">
                <div className="max-h-80 overflow-y-auto">
                  {results.map((r) => (
                    <button
                      key={`${r.type}-${r.id}`}
                      className="flex w-full items-start gap-3 border-b border-border/50 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent last:border-0"
                      onClick={() => {
                        if (r.investigationId) {
                          navigate(`/investigation/${r.investigationId}`);
                        } else if (r.type === "investigação") {
                          navigate(`/investigation/${r.id}`);
                        }
                        setQuery("");
                        setShowResults(false);
                      }}
                    >
                      <span
                        className={`mt-0.5 shrink-0 text-xs font-semibold uppercase ${typeColor[r.type]}`}
                      >
                        {r.type}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {r.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {r.subtitle}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {showResults && query.trim() && results.length === 0 && (
              <div className="absolute mt-2 w-full rounded-md border border-border bg-popover p-4 text-center text-sm text-muted-foreground shadow-lg">
                Nenhum resultado encontrado.
              </div>
            )}
          </div>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {user?.name.charAt(0).toUpperCase() ?? "?"}
                </div>
                <span className="hidden text-sm font-medium sm:inline">
                  {user?.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
