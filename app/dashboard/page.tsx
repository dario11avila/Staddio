"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Map, UtensilsCrossed, Shield, MessageCircle, Gift, ClipboardList,
  ChefHat, LogOut, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";
import { isLoggedIn, getUser, logout, getUserLevel, getOrders } from "@/lib/storage";
import { MATCHES } from "@/lib/data";
import type { User } from "@/lib/types";

const QUICK_ACTIONS = [
  { 
    href: "/map", 
    icon: Map, 
    label: "Mapa del Estadio", 
    desc: "Baños, puestos, salidas",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600"
  },
  { 
    href: "/food", 
    icon: UtensilsCrossed, 
    label: "Pedir Comida", 
    desc: "Delivery a tu asiento",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    iconColor: "text-orange-600"
  },
  { 
    href: "/report", 
    icon: Shield, 
    label: "Reportar Incidente", 
    desc: "Seguridad en tiempo real",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-600"
  },
  { 
    href: "/chat", 
    icon: MessageCircle, 
    label: "Chat del Estadio", 
    desc: "Info en tiempo real",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    iconColor: "text-purple-600"
  },
  { 
    href: "/rewards", 
    icon: Gift, 
    label: "Mis Recompensas", 
    desc: "Puntos y beneficios",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    iconColor: "text-yellow-600"
  },
  { 
    href: "/orders", 
    icon: ClipboardList, 
    label: "Mis Pedidos", 
    desc: "Ver estado de delivery",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    iconColor: "text-green-600",
    showOrdersBadge: true
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeOrders, setActiveOrders] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn()) {
      router.replace("/");
      return;
    }
    setUser(getUser());
    
    const orders = getOrders();
    const active = orders.filter(o => o.status !== "delivered").length;
    setActiveOrders(active);

    const handleUserUpdate = () => setUser(getUser());
    const handleOrdersUpdate = () => {
      const orders = getOrders();
      setActiveOrders(orders.filter(o => o.status !== "delivered").length);
    };
    
    window.addEventListener("user-updated", handleUserUpdate);
    window.addEventListener("orders-updated", handleOrdersUpdate);
    
    return () => {
      window.removeEventListener("user-updated", handleUserUpdate);
      window.removeEventListener("orders-updated", handleOrdersUpdate);
    };
  }, [router]);

  if (!mounted || !user) return null;

  const levelInfo = getUserLevel(user.points);
  const currentMatch = MATCHES[0]; // Simulating first match is "live"

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <AppShell>
      <div className="min-h-screen">
        {/* Header Banner */}
        <div className="bg-gradient-brand-horizontal px-4 pb-6 pt-4 text-white">
          <div className="mx-auto max-w-2xl">
            {/* Top Bar */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/staddio-logo.png" alt="Staddio" width={36} height={36} className="h-9 w-9 shrink-0 object-cover rounded-md" />
                <span className="font-bold">Staddio</span>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/operator">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <ChefHat className="h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/20"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Live Match Card */}
            <Card className="border-0 bg-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{currentMatch.team1.flag}</span>
                    <span className="font-bold text-white">
                      {currentMatch.team1.code} vs {currentMatch.team2.code}
                    </span>
                    <span className="text-2xl">{currentMatch.team2.flag}</span>
                  </div>
                  <Badge className="animate-pulse bg-gradient-brand text-white">
                    EN VIVO
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-white/80">
                  <span className="text-2xl font-black text-white">2-1</span>
                  <span>Min. 67{"'"}</span>
                </div>
                <p className="mt-1 text-xs text-white/60">
                  {currentMatch.stadium}, {currentMatch.city}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mx-auto max-w-2xl space-y-6 p-4">
          {/* User Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold">{user.name}</h2>
                  <Badge className={cn(levelInfo.color, "text-white")}>
                    {levelInfo.name}
                  </Badge>
                </div>
                <p className="font-mono text-xs text-muted-foreground">{user.fanId}</p>
              </div>
              
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-primary">{user.points}</span>
                  <span className="text-sm text-muted-foreground">puntos</span>
                </div>
                
                {levelInfo.nextLevel && (
                  <div className="mt-2">
                    <Progress value={levelInfo.progress} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Faltan {levelInfo.nextLevel.minPoints - user.points} pts para {levelInfo.nextLevel.name}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="text-lg font-bold">{user.ordersCount}</p>
                  <p className="text-xs text-muted-foreground">Pedidos {"🍔"}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="text-lg font-bold">{user.reportsCount}</p>
                  <p className="text-xs text-muted-foreground">Reportes {"🛡️"}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="text-lg font-bold">{user.messagesCount}</p>
                  <p className="text-xs text-muted-foreground">Mensajes {"💬"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className={cn(
                  "relative h-full cursor-pointer border transition-all hover:shadow-md",
                  action.bgColor,
                  action.borderColor
                )}>
                  <CardContent className="p-4">
                    <action.icon className={cn("h-8 w-8", action.iconColor)} />
                    <h3 className="mt-2 font-semibold text-foreground">{action.label}</h3>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                    {action.showOrdersBadge && activeOrders > 0 && (
                      <Badge className="absolute right-2 top-2 bg-primary">
                        {activeOrders}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Tips Box */}
          <Card className="border-accent/30 bg-accent/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">{"💡"}</span>
                <div>
                  <p className="font-medium">Gana puntos participando</p>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>+10 puntos por cada pedido de comida</li>
                    <li>+25 puntos por reportar incidentes</li>
                    <li>+2 puntos por cada 10 mensajes en chat</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
