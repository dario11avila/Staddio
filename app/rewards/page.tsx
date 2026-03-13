"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";
import { isLoggedIn, getUser, getUserLevel, getRedeemedRewards, redeemReward } from "@/lib/storage";
import { REWARDS, BADGES } from "@/lib/data";
import type { User } from "@/lib/types";
import { toast } from "sonner";

const POINTS_GUIDE = [
  { emoji: "🍔", action: "Por cada pedido de comida", points: 10 },
  { emoji: "🛡️", action: "Por reportar incidentes", points: 25 },
  { emoji: "💬", action: "Por cada 10 mensajes en chat", points: 2 },
  { emoji: "🎯", action: "Primer reporte de seguridad", points: 50 },
  { emoji: "🎉", action: "Bono de registro", points: 25 },
];

export default function RewardsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [redeemedRewards, setRedeemedRewards] = useState<string[]>([]);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn()) {
      router.replace("/");
      return;
    }
    setUser(getUser());
    setRedeemedRewards(getRedeemedRewards());

    const handleUserUpdate = () => {
      setUser(getUser());
      setRedeemedRewards(getRedeemedRewards());
    };
    
    window.addEventListener("user-updated", handleUserUpdate);
    return () => window.removeEventListener("user-updated", handleUserUpdate);
  }, [router]);

  if (!mounted || !user) return null;

  const levelInfo = getUserLevel(user.points);
  const userBadges = BADGES.filter(b => user.badges.includes(b.id));

  const handleRedeem = async (rewardId: string, cost: number, name: string) => {
    if (user.points < cost) {
      toast.error("No tienes suficientes puntos");
      return;
    }
    
    setRedeeming(rewardId);
    await new Promise(r => setTimeout(r, 1000));
    
    const success = redeemReward(rewardId, cost);
    if (success) {
      setUser(getUser());
      setRedeemedRewards(getRedeemedRewards());
      toast.success(`${name} canjeado exitosamente!`);
    } else {
      toast.error("Error al canjear");
    }
    
    setRedeeming(null);
  };

  return (
    <AppShell>
      <div className="min-h-screen pb-8">
        <div className="mx-auto max-w-2xl p-4 space-y-6">
          {/* Main Points Card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
              <div className="text-center">
                <p className="text-4xl font-black">{user.points}</p>
                <p className="text-sm opacity-80">puntos acumulados</p>
                
                <Badge className="mt-3 bg-white/20 text-white">
                  {levelInfo.name}
                </Badge>
                
                {levelInfo.nextLevel && (
                  <div className="mt-4">
                    <Progress 
                      value={levelInfo.progress} 
                      className="h-2.5 bg-white/20 [&>div]:bg-white"
                    />
                    <p className="mt-2 text-xs opacity-70">
                      Faltan {levelInfo.nextLevel.minPoints - user.points} pts para {levelInfo.nextLevel.name}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-white/10 p-2">
                  <p className="text-lg font-bold">{user.ordersCount}</p>
                  <p className="text-xs opacity-70">Pedidos</p>
                </div>
                <div className="rounded-lg bg-white/10 p-2">
                  <p className="text-lg font-bold">{user.reportsCount}</p>
                  <p className="text-xs opacity-70">Reportes</p>
                </div>
                <div className="rounded-lg bg-white/10 p-2">
                  <p className="text-lg font-bold">{user.messagesCount}</p>
                  <p className="text-xs opacity-70">Mensajes</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Badges */}
          {userBadges.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-4 font-semibold">Tus insignias</h3>
                <div className="space-y-3">
                  {userBadges.map(badge => (
                    <div key={badge.id} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                      <span className="text-2xl">{badge.emoji}</span>
                      <div>
                        <p className="font-medium">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rewards Catalog */}
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-4 font-semibold">Canjear recompensas</h3>
              <div className="space-y-3">
                {REWARDS.map(reward => {
                  const isRedeemed = redeemedRewards.includes(reward.id);
                  const canAfford = user.points >= reward.cost;
                  const isRedeeming = redeeming === reward.id;
                  
                  return (
                    <Card key={reward.id} className="overflow-hidden">
                      <CardContent className="flex items-center gap-4 p-4">
                        <span className="text-3xl">{reward.emoji}</span>
                        <div className="flex-1">
                          <p className="font-medium">{reward.name}</p>
                          <p className="text-xs text-muted-foreground">{reward.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline" className="bg-accent/10 text-accent-foreground">
                            {reward.cost} pts
                          </Badge>
                          {isRedeemed ? (
                            <Button size="sm" disabled className="gap-1 bg-green-500 text-white hover:bg-green-500">
                              <Check className="h-4 w-4" />
                              Canjeado
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              disabled={!canAfford || isRedeeming}
                              onClick={() => handleRedeem(reward.id, reward.cost, reward.name)}
                            >
                              {isRedeeming ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Canjear"
                              )}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Points Guide */}
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-4 font-semibold">{"¿Cómo ganar puntos?"}</h3>
              <div className="space-y-3">
                {POINTS_GUIDE.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.emoji}</span>
                      <span className="text-sm">{item.action}</span>
                    </div>
                    <Badge className="bg-primary/10 text-primary">+{item.points}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
