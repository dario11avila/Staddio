"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, Check, Loader2, AlertTriangle, Radio, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";
import { isLoggedIn, getUser, addReport } from "@/lib/storage";
import { INCIDENT_TYPES, STADIUM_SECTORS } from "@/lib/data";
import type { IncidentType, IncidentReport } from "@/lib/types";
import { toast } from "sonner";

type ReportStep = "select_type" | "select_location" | "details" | "sent";

const SECURITY_UNITS = ["Alpha-1", "Bravo-2", "Charlie-3", "Delta-4"];

export default function ReportPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<ReportStep>("select_type");
  
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sentReport, setSentReport] = useState<IncidentReport | null>(null);
  
  // Animation states
  const [responseStep, setResponseStep] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn()) {
      router.replace("/");
    }
  }, [router]);

  if (!mounted) return null;

  const handleSubmit = async () => {
    if (!selectedType || !selectedSector) return;
    
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    
    const user = getUser();
    const report: IncidentReport = {
      id: crypto.randomUUID(),
      userId: user?.fanId || "anonymous",
      userName: anonymous ? "Anónimo" : (user?.name || "Usuario"),
      type: selectedType,
      sector: selectedSector,
      description,
      anonymous,
      status: "sent",
      timestamp: new Date().toISOString(),
      securityUnit: SECURITY_UNITS[Math.floor(Math.random() * SECURITY_UNITS.length)],
    };
    
    addReport(report);
    setSentReport(report);
    setStep("sent");
    setSubmitting(false);
    toast.success("Reporte enviado a seguridad");
    
    // Animate response timeline
    setTimeout(() => setResponseStep(1), 1000);
    setTimeout(() => setResponseStep(2), 2500);
    setTimeout(() => setResponseStep(3), 4000);
  };

  const handleNewReport = () => {
    setStep("select_type");
    setSelectedType(null);
    setSelectedSector(null);
    setDescription("");
    setAnonymous(false);
    setSentReport(null);
    setResponseStep(0);
  };

  const selectedTypeInfo = INCIDENT_TYPES.find(t => t.id === selectedType);

  return (
    <AppShell>
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            {step !== "sent" && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  if (step === "select_type") router.push("/dashboard");
                  else if (step === "select_location") setStep("select_type");
                  else if (step === "details") setStep("select_location");
                }}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                <Shield className="h-4 w-4 text-red-600" />
              </div>
              <h1 className="text-xl font-bold">Reportar Incidente</h1>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-2xl p-4">
          {/* Step 1: Select Type */}
          {step === "select_type" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <p className="text-muted-foreground">
                {"¿Qué tipo de incidente quieres reportar?"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {INCIDENT_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      setStep("select_location");
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all",
                      "hover:border-primary hover:bg-primary/5",
                      type.priority === "high" && "border-red-200",
                      type.priority === "medium" && "border-yellow-200",
                      type.priority === "low" && "border-gray-200"
                    )}
                  >
                    <span className="text-3xl">{type.emoji}</span>
                    <span className="font-medium">{type.label}</span>
                    <Badge
                      className={cn(
                        type.priority === "high" && "bg-red-500 text-white",
                        type.priority === "medium" && "bg-yellow-500 text-white",
                        type.priority === "low" && "bg-gray-500 text-white"
                      )}
                    >
                      {type.priority === "high" ? "Alta" : type.priority === "medium" ? "Media" : "Baja"}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Location */}
          {step === "select_location" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedTypeInfo?.emoji}</span>
                <span className="font-medium">{selectedTypeInfo?.label}</span>
              </div>
              <p className="text-muted-foreground">
                {"¿En qué zona del estadio ocurrió?"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {STADIUM_SECTORS.map(sector => (
                  <button
                    key={sector}
                    onClick={() => {
                      setSelectedSector(sector);
                      setStep("details");
                    }}
                    className={cn(
                      "rounded-lg border p-3 text-left text-sm transition-all",
                      "hover:border-primary hover:bg-primary/5"
                    )}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === "details" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedTypeInfo?.emoji}</span>
                    <div>
                      <p className="font-medium">{selectedTypeInfo?.label}</p>
                      <p className="text-sm text-muted-foreground">{selectedSector}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-2">
                <Label>Descripción (opcional)</Label>
                <Textarea
                  placeholder="Describe brevemente lo que está pasando..."
                  value={description}
                  onChange={e => setDescription(e.target.value.slice(0, 200))}
                  rows={4}
                />
                <p className="text-right text-xs text-muted-foreground">
                  {description.length}/200
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="anonymous"
                  checked={anonymous}
                  onCheckedChange={(checked) => setAnonymous(checked as boolean)}
                />
                <Label htmlFor="anonymous" className="cursor-pointer">
                  Enviar de forma anónima
                </Label>
              </div>
              
              <Button 
                className="w-full bg-red-600 hover:bg-red-700" 
                size="lg"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    {"🚨"} Enviar a Seguridad
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 4: Sent */}
          {step === "sent" && sentReport && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold">Reporte enviado</h2>
                <p className="mt-1 text-muted-foreground">
                  Seguridad ha sido notificada
                </p>
              </div>
              
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tipo</span>
                    <div className="flex items-center gap-2">
                      <span>{selectedTypeInfo?.emoji}</span>
                      <span className="font-medium">{selectedTypeInfo?.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ubicación</span>
                    <span className="font-medium">{sentReport.sector}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Unidad asignada</span>
                    <Badge className="bg-primary">{sentReport.securityUnit}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Folio</span>
                    <span className="font-mono text-xs">{sentReport.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Response Timeline */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-4 font-semibold">Respuesta de seguridad</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                        responseStep >= 1 ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        <Check className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={cn("font-medium", responseStep >= 1 ? "text-foreground" : "text-muted-foreground")}>
                          Reporte recibido
                        </p>
                        {responseStep >= 1 && (
                          <p className="text-xs text-green-600">Completado</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                        responseStep >= 2 ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        <Radio className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={cn("font-medium", responseStep >= 2 ? "text-foreground" : "text-muted-foreground")}>
                          Unidad notificada por radio
                        </p>
                        {responseStep >= 2 && (
                          <p className="text-xs text-green-600">{sentReport.securityUnit} en camino</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                        responseStep >= 3 ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        <Navigation className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={cn("font-medium", responseStep >= 3 ? "text-foreground" : "text-muted-foreground")}>
                          En camino al sector
                        </p>
                        {responseStep >= 3 && (
                          <p className="text-xs text-green-600">~2 min estimado</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Badge className="w-full justify-center py-2 bg-primary/10 text-primary">
                +25 puntos acreditados
              </Badge>
              
              <Card className="border-yellow-300 bg-yellow-50">
                <CardContent className="flex items-start gap-3 p-4">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Si estás en peligro inmediato, aléjate del área y busca a personal de seguridad.
                  </p>
                </CardContent>
              </Card>
              
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleNewReport}>
                  Nuevo reporte
                </Button>
                <Button className="flex-1" onClick={() => router.push("/dashboard")}>
                  Ir al inicio
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
