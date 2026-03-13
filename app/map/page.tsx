"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";
import { isLoggedIn } from "@/lib/storage";
import { FOOD_STANDS } from "@/lib/data";

type CongestionLevel = "free" | "moderate" | "full";
type MapTab = "general" | "bathrooms" | "food" | "exits";

interface SectorData {
  id: string;
  name: string;
  congestion: CongestionLevel;
  bathroomStatus?: CongestionLevel;
}

const INITIAL_SECTORS: SectorData[] = [
  { id: "norte-a", name: "Norte A", congestion: "free", bathroomStatus: "free" },
  { id: "norte-b", name: "Norte B", congestion: "moderate", bathroomStatus: "moderate" },
  { id: "sur-a", name: "Sur A", congestion: "free", bathroomStatus: "free" },
  { id: "sur-b", name: "Sur B", congestion: "moderate", bathroomStatus: "full" },
  { id: "este-a", name: "Este A", congestion: "moderate", bathroomStatus: "free" },
  { id: "este-b", name: "Este B", congestion: "free", bathroomStatus: "moderate" },
  { id: "oeste-a", name: "Oeste A", congestion: "full", bathroomStatus: "moderate" },
  { id: "oeste-b", name: "Oeste B", congestion: "moderate", bathroomStatus: "free" },
  { id: "vip-norte", name: "VIP Norte", congestion: "free", bathroomStatus: "free" },
  { id: "vip-sur", name: "VIP Sur", congestion: "free", bathroomStatus: "free" },
  { id: "palco", name: "Palco de Prensa", congestion: "free" },
];

const EXITS = [
  { id: "north", label: "N", name: "Puerta Norte", status: "free" as CongestionLevel },
  { id: "south", label: "S", name: "Puerta Sur", status: "moderate" as CongestionLevel },
  { id: "east", label: "E", name: "Puerta Este", status: "free" as CongestionLevel },
  { id: "west", label: "O", name: "Puerta Oeste", status: "full" as CongestionLevel },
];

const CONGESTION_COLORS = {
  free: "#22c55e",
  moderate: "#f59e0b",
  full: "#ef4444",
};

const CONGESTION_LABELS = {
  free: "Libre",
  moderate: "Moderado",
  full: "Lleno",
};

export default function MapPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<MapTab>("general");
  const [sectors, setSectors] = useState<SectorData[]>(INITIAL_SECTORS);
  const [selectedSector, setSelectedSector] = useState<SectorData | null>(null);
  const [exits, setExits] = useState(EXITS);

  // Simulate real-time congestion updates
  const updateCongestion = useCallback(() => {
    setSectors(prev => prev.map(sector => {
      if (Math.random() < 0.15) {
        const levels: CongestionLevel[] = ["free", "moderate", "full"];
        return {
          ...sector,
          congestion: levels[Math.floor(Math.random() * levels.length)],
          bathroomStatus: sector.bathroomStatus 
            ? levels[Math.floor(Math.random() * levels.length)]
            : undefined,
        };
      }
      return sector;
    }));
    
    setExits(prev => prev.map(exit => {
      if (Math.random() < 0.15) {
        const levels: CongestionLevel[] = ["free", "moderate", "full"];
        return {
          ...exit,
          status: levels[Math.floor(Math.random() * levels.length)],
        };
      }
      return exit;
    }));
  }, []);

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn()) {
      router.replace("/");
      return;
    }

    const interval = setInterval(updateCongestion, 4000);
    return () => clearInterval(interval);
  }, [router, updateCongestion]);

  if (!mounted) return null;

  const getSectorColor = (sectorId: string) => {
    const sector = sectors.find(s => s.id === sectorId);
    return sector ? CONGESTION_COLORS[sector.congestion] : "#4a5568";
  };

  const freeBathrooms = sectors
    .filter(s => s.bathroomStatus === "free")
    .slice(0, 3);

  const recommendedExit = exits.find(e => e.status === "free") || exits[0];

  return (
    <AppShell>
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <div>
              <h1 className="text-xl font-bold">Mapa del Estadio</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Actualizando en tiempo real
              </div>
            </div>
            <Badge variant="outline">Akron</Badge>
          </div>
        </div>

        <div className="mx-auto max-w-2xl p-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MapTab)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">{"🗺️"} General</TabsTrigger>
              <TabsTrigger value="bathrooms">{"🚻"} Baños</TabsTrigger>
              <TabsTrigger value="food">{"🍔"} Comida</TabsTrigger>
              <TabsTrigger value="exits">{"🚪"} Salidas</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4 space-y-4">
              {/* Stadium SVG Map */}
              <Card className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="relative">
                    <svg viewBox="0 0 500 400" className="w-full">
                      {/* Stadium Outline */}
                      <ellipse cx="250" cy="200" rx="230" ry="180" fill="#1a2e1f" stroke="#2d4a36" strokeWidth="2" />
                      
                      {/* Sectors */}
                      {/* Norte A */}
                      <path
                        d="M 120 60 Q 250 20 380 60 L 350 100 Q 250 70 150 100 Z"
                        fill={getSectorColor("norte-a")}
                        opacity="0.7"
                        className="cursor-pointer transition-opacity hover:opacity-100"
                        onClick={() => setSelectedSector(sectors.find(s => s.id === "norte-a") || null)}
                      />
                      {/* Norte B */}
                      <path
                        d="M 150 100 Q 250 70 350 100 L 320 140 Q 250 115 180 140 Z"
                        fill={getSectorColor("norte-b")}
                        opacity="0.7"
                        className="cursor-pointer transition-opacity hover:opacity-100"
                        onClick={() => setSelectedSector(sectors.find(s => s.id === "norte-b") || null)}
                      />
                      
                      {/* Sur A */}
                      <path
                        d="M 120 340 Q 250 380 380 340 L 350 300 Q 250 330 150 300 Z"
                        fill={getSectorColor("sur-a")}
                        opacity="0.7"
                        className="cursor-pointer transition-opacity hover:opacity-100"
                        onClick={() => setSelectedSector(sectors.find(s => s.id === "sur-a") || null)}
                      />
                      {/* Sur B */}
                      <path
                        d="M 150 300 Q 250 330 350 300 L 320 260 Q 250 285 180 260 Z"
                        fill={getSectorColor("sur-b")}
                        opacity="0.7"
                        className="cursor-pointer transition-opacity hover:opacity-100"
                        onClick={() => setSelectedSector(sectors.find(s => s.id === "sur-b") || null)}
                      />
                      
                      {/* Este A */}
                      <path
                        d="M 420 80 Q 470 200 420 320 L 380 290 Q 420 200 380 110 Z"
                        fill={getSectorColor("este-a")}
                        opacity="0.7"
                        className="cursor-pointer transition-opacity hover:opacity-100"
                        onClick={() => setSelectedSector(sectors.find(s => s.id === "este-a") || null)}
                      />
                      {/* Este B */}
                      <path
                        d="M 380 110 Q 420 200 380 290 L 340 260 Q 380 200 340 140 Z"
                        fill={getSectorColor("este-b")}
                        opacity="0.7"
                        className="cursor-pointer transition-opacity hover:opacity-100"
                        onClick={() => setSelectedSector(sectors.find(s => s.id === "este-b") || null)}
                      />
                      
                      {/* Oeste A */}
                      <path
                        d="M 80 80 Q 30 200 80 320 L 120 290 Q 80 200 120 110 Z"
                        fill={getSectorColor("oeste-a")}
                        opacity="0.7"
                        className="cursor-pointer transition-opacity hover:opacity-100"
                        onClick={() => setSelectedSector(sectors.find(s => s.id === "oeste-a") || null)}
                      />
                      {/* Oeste B */}
                      <path
                        d="M 120 110 Q 80 200 120 290 L 160 260 Q 120 200 160 140 Z"
                        fill={getSectorColor("oeste-b")}
                        opacity="0.7"
                        className="cursor-pointer transition-opacity hover:opacity-100"
                        onClick={() => setSelectedSector(sectors.find(s => s.id === "oeste-b") || null)}
                      />
                      
                      {/* VIP Norte */}
                      <path
                        d="M 180 140 Q 250 115 320 140 L 300 165 Q 250 145 200 165 Z"
                        fill={getSectorColor("vip-norte")}
                        opacity="0.8"
                        stroke="#FFD700"
                        strokeWidth="2"
                        className="cursor-pointer transition-opacity hover:opacity-100"
                        onClick={() => setSelectedSector(sectors.find(s => s.id === "vip-norte") || null)}
                      />
                      {/* VIP Sur */}
                      <path
                        d="M 180 260 Q 250 285 320 260 L 300 235 Q 250 255 200 235 Z"
                        fill={getSectorColor("vip-sur")}
                        opacity="0.8"
                        stroke="#FFD700"
                        strokeWidth="2"
                        className="cursor-pointer transition-opacity hover:opacity-100"
                        onClick={() => setSelectedSector(sectors.find(s => s.id === "vip-sur") || null)}
                      />
                      
                      {/* Palco de Prensa */}
                      <rect
                        x="200" y="45" width="100" height="15"
                        fill={getSectorColor("palco")}
                        opacity="0.8"
                        rx="4"
                        className="cursor-pointer transition-opacity hover:opacity-100"
                        onClick={() => setSelectedSector(sectors.find(s => s.id === "palco") || null)}
                      />
                      
                      {/* Campo de fútbol */}
                      <rect x="165" y="165" width="170" height="70" fill="#22c55e" rx="4" />
                      <line x1="250" y1="165" x2="250" y2="235" stroke="white" strokeWidth="2" />
                      <circle cx="250" cy="200" r="20" fill="none" stroke="white" strokeWidth="2" />
                      <rect x="165" y="185" width="25" height="30" fill="none" stroke="white" strokeWidth="2" />
                      <rect x="310" y="185" width="25" height="30" fill="none" stroke="white" strokeWidth="2" />
                      
                      {/* Bathroom Markers */}
                      <circle cx="130" cy="80" r="8" fill="#3b82f6" />
                      <circle cx="370" cy="80" r="8" fill="#3b82f6" />
                      <circle cx="130" cy="320" r="8" fill="#3b82f6" />
                      <circle cx="370" cy="320" r="8" fill="#3b82f6" />
                      
                      {/* Food Markers */}
                      <circle cx="100" cy="200" r="8" fill="#f97316" />
                      <circle cx="400" cy="200" r="8" fill="#f97316" />
                      <circle cx="250" cy="50" r="8" fill="#f97316" />
                      
                      {/* Exit Markers */}
                      <rect x="235" y="15" width="30" height="18" fill="#3b82f6" rx="4" />
                      <text x="250" y="29" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">N</text>
                      
                      <rect x="235" y="367" width="30" height="18" fill="#3b82f6" rx="4" />
                      <text x="250" y="381" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">S</text>
                      
                      <rect x="460" y="191" width="30" height="18" fill="#3b82f6" rx="4" />
                      <text x="475" y="205" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">E</text>
                      
                      <rect x="10" y="191" width="30" height="18" fill="#3b82f6" rx="4" />
                      <text x="25" y="205" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">O</text>
                    </svg>
                    
                    {/* Legend */}
                    <div className="absolute bottom-2 left-2 rounded-xl bg-black/60 p-2 text-xs text-white">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-green-500" />
                        <span>Libre</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-yellow-500" />
                        <span>Moderado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-red-500" />
                        <span>Lleno</span>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-2 right-2 rounded-xl bg-black/60 p-2 text-xs text-white">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-blue-500" />
                        <span>{"🚻"} Baños</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-orange-500" />
                        <span>{"🍔"} Comida</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Sector Info Slide-in */}
              {selectedSector && (
                <Card className="animate-in slide-in-from-bottom-4">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold">{selectedSector.name}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          <span 
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: CONGESTION_COLORS[selectedSector.congestion] }}
                          />
                          <span className="text-sm">
                            {CONGESTION_LABELS[selectedSector.congestion]}
                          </span>
                        </div>
                        {selectedSector.bathroomStatus && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {"🚻"} Baños: {CONGESTION_LABELS[selectedSector.bathroomStatus]}
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setSelectedSector(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="bathrooms" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-4 font-semibold">{"🚻"} Baños menos concurridos ahora</h3>
                  <div className="space-y-3">
                    {freeBathrooms.map(sector => (
                      <div key={sector.id} className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{"🚻"}</span>
                          <div>
                            <p className="font-medium">{sector.name}</p>
                            <p className="text-xs text-muted-foreground">~2 min de espera</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500 text-white">Libre</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="food" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-4 font-semibold">{"🍔"} Puestos de comida</h3>
                  <div className="space-y-3">
                    {FOOD_STANDS.map(stand => (
                      <div key={stand.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{stand.emoji}</span>
                          <div>
                            <p className="font-medium">{stand.name}</p>
                            <p className="text-xs text-muted-foreground">{stand.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="border-green-500 text-green-600">
                            Abierto
                          </Badge>
                          <p className="mt-1 text-xs text-muted-foreground">~5 min</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exits" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-4 font-semibold">{"🚪"} Estado de salidas</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {exits.map(exit => (
                      <div 
                        key={exit.id}
                        className={cn(
                          "rounded-lg border p-4 text-center",
                          exit.status === "free" && "border-green-500 bg-green-50",
                          exit.status === "moderate" && "border-yellow-500 bg-yellow-50",
                          exit.status === "full" && "border-red-500 bg-red-50"
                        )}
                      >
                        <p className="text-2xl font-black">{exit.label}</p>
                        <p className="text-sm font-medium">{exit.name}</p>
                        <Badge 
                          className={cn(
                            "mt-2",
                            exit.status === "free" && "bg-green-500",
                            exit.status === "moderate" && "bg-yellow-500",
                            exit.status === "full" && "bg-red-500",
                            "text-white"
                          )}
                        >
                          {CONGESTION_LABELS[exit.status]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <Card className="mt-4 border-primary bg-primary/5">
                    <CardContent className="p-3">
                      <p className="text-sm">
                        {"💡"} <strong>Recomendación:</strong> Sal por la {recommendedExit.name} ({recommendedExit.label})
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}
