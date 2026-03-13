"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Check, Loader2, User, Phone, Mail, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { isLoggedIn, createUser, createDemoUser, getUser } from "@/lib/storage";
import { toast } from "sonner";

type RegisterStep = "fanid" | "personal";

export default function AuthPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Registration state
  const [registerStep, setRegisterStep] = useState<RegisterStep>("fanid");
  const [fanId, setFanId] = useState("");
  const [fanIdVerified, setFanIdVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Login state
  const [loginFanId, setLoginFanId] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isLoggedIn()) {
      router.replace("/dashboard");
    }
  }, [router]);

  if (!mounted) return null;

  const handleVerifyFanId = async () => {
    if (fanId.length < 6) {
      toast.error("El FanID debe tener al menos 6 caracteres");
      return;
    }
    
    setVerifying(true);
    // Simulate verification
    await new Promise((r) => setTimeout(r, 1600));
    setFanIdVerified(true);
    setVerifying(false);
    setRegisterStep("personal");
    toast.success("FanID verificado correctamente");
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      toast.error("Ingresa tu nombre completo");
      return;
    }
    if (phone.length !== 10) {
      toast.error("El teléfono debe tener 10 dígitos");
      return;
    }
    
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    
    createUser(fanId.toUpperCase(), name, phone, email);
    toast.success("Cuenta creada. +25 puntos de bienvenida!");
    router.push("/dashboard");
  };

  const handleLogin = async () => {
    if (loginFanId.length < 6) {
      toast.error("Ingresa un FanID válido");
      return;
    }
    
    setLoggingIn(true);
    await new Promise((r) => setTimeout(r, 1000));
    
    const existingUser = getUser();
    if (existingUser && existingUser.fanId === loginFanId.toUpperCase()) {
      toast.success(`Bienvenido de nuevo, ${existingUser.name}!`);
      router.push("/dashboard");
    } else {
      // Create new user with this FanID
      createUser(loginFanId.toUpperCase(), "Usuario", "0000000000", "");
      toast.success("Sesión iniciada");
      router.push("/dashboard");
    }
  };

  const handleDemoLogin = async () => {
    setLoggingIn(true);
    await new Promise((r) => setTimeout(r, 500));
    createDemoUser();
    toast.success("Bienvenido al modo demo!");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/90 to-[#7f1d1d]">
      {/* Hero Section */}
      <div className="flex flex-col items-center px-6 pt-12 pb-8 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-5xl backdrop-blur-sm">
          <span>{"⚽"}</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white">Staddio</h1>
        <p className="mt-2 text-sm font-medium text-white/70">
          Estadio Akron • FIFA World Cup 2026
        </p>
        <p className="mt-1 text-xs text-white/60">
          Tu super app del estadio
        </p>
      </div>

      {/* Auth Card */}
      <Card className="mx-auto max-w-md rounded-t-3xl border-0 bg-background shadow-2xl">
        <CardContent className="p-6 pt-8">
          <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="register">Registrarme</TabsTrigger>
              <TabsTrigger value="login">Ya tengo cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="register" className="mt-6 space-y-6">
              {registerStep === "fanid" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-2">
                    <Label htmlFor="fanid">Tu FIFA FanID</Label>
                    <Input
                      id="fanid"
                      placeholder="ABC123456"
                      value={fanId}
                      onChange={(e) => setFanId(e.target.value.toUpperCase())}
                      className="font-mono text-lg uppercase tracking-wider"
                      maxLength={12}
                    />
                  </div>
                  
                  <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                    <p className="font-medium">{"¿Qué es FanID?"}</p>
                    <p className="mt-1 text-xs text-blue-600">
                      Es tu identificación oficial de FIFA para acceder al Mundial 2026. 
                      Lo obtuviste al comprar tu boleto.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleVerifyFanId} 
                    className="w-full" 
                    size="lg"
                    disabled={verifying || fanId.length < 6}
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        Verificar FanID
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}

              {registerStep === "personal" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        FanID verificado: {fanId}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setRegisterStep("fanid");
                        setFanIdVerified(false);
                      }}
                    >
                      Cambiar
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Tu nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono (10 dígitos)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="5512345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="pl-10"
                        maxLength={10}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (opcional)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleRegister} 
                    className="w-full" 
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        Crear cuenta y entrar
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="login" className="mt-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-fanid">Tu FIFA FanID</Label>
                  <Input
                    id="login-fanid"
                    placeholder="ABC123456"
                    value={loginFanId}
                    onChange={(e) => setLoginFanId(e.target.value.toUpperCase())}
                    className="font-mono text-lg uppercase tracking-wider"
                    maxLength={12}
                  />
                </div>
                
                <Button 
                  onClick={handleLogin} 
                  className="w-full" 
                  size="lg"
                  disabled={loggingIn || loginFanId.length < 6}
                >
                  {loggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    <>
                      Ingresar
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-dashed" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">o</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={handleDemoLogin}
                  className="w-full"
                  disabled={loggingIn}
                >
                  Entrar como usuario demo
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Vinculado a FIFA FanID • Tus datos son privados</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
