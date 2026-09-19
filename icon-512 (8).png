import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fingerprint, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const { login, register } = useAuth();
  const [, navigate] = useLocation();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPw, setRegPw] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      login(loginEmail, loginPw);
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao entrar");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPw.length < 4) {
      toast.error("A senha deve ter ao menos 4 caracteres.");
      return;
    }
    try {
      register(regName, regEmail, regPw);
      toast.success("Conta criada com sucesso!");
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar conta");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/30">
          <Fingerprint className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NEXUS Forense</h1>
          <p className="text-sm text-muted-foreground">
            Workspace investigativo pessoal
          </p>
        </div>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Acesso
          </CardTitle>
          <CardDescription>
            Entre com sua conta local ou crie uma nova.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-pw">Senha</Label>
                  <Input
                    id="login-pw"
                    type="password"
                    placeholder="••••••"
                    value={loginPw}
                    onChange={(e) => setLoginPw(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Nome</Label>
                  <Input
                    id="reg-name"
                    placeholder="Seu nome"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">E-mail</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-pw">Senha</Label>
                  <Input
                    id="reg-pw"
                    type="password"
                    placeholder="mínimo 4 caracteres"
                    value={regPw}
                    onChange={(e) => setRegPw(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Criar conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <p className="mt-6 max-w-md text-center text-xs text-muted-foreground">
        Versão local — seus dados ficam armazenados apenas neste navegador.
        Não insira dados pessoais reais em ambientes compartilhados.
      </p>
    </div>
  );
}
