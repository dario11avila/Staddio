"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChefHat, Bell, Check, Clock, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getOrders, setOrders, addOrder, generateOrderNumber, generateValidationCode } from "@/lib/storage";
import { FOOD_ITEMS, MATCHES, PICKUP_WINDOWS } from "@/lib/data";
import type { Order, OrderStatus } from "@/lib/types";
import { toast } from "sonner";

const STATUS_WORKFLOW: { current: OrderStatus; next: OrderStatus; action: string }[] = [
  { current: "queued", next: "confirmed", action: "Confirmar" },
  { current: "confirmed", next: "preparing", action: "Empezar a preparar" },
  { current: "preparing", next: "ready", action: "Marcar como listo" },
  { current: "ready", next: "delivered", action: "Marcar como entregado" },
];

const TABS = [
  { id: "queued", label: "Nuevos", emoji: "⏳" },
  { id: "confirmed", label: "Confirmados", emoji: "✅" },
  { id: "preparing", label: "Preparando", emoji: "👨‍🍳" },
  { id: "ready", label: "Listos", emoji: "🎉" },
] as const;

export default function OperatorPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrdersState] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>("queued");
  const [processing, setProcessing] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    let allOrders = getOrders();
    
    // Generate demo orders if none exist
    if (allOrders.length === 0) {
      const demoOrders: Order[] = [
        {
          id: crypto.randomUUID(),
          orderNumber: generateOrderNumber(),
          matchId: MATCHES[0].id,
          matchLabel: `${MATCHES[0].team1.flag} ${MATCHES[0].team1.code} vs ${MATCHES[0].team2.code} ${MATCHES[0].team2.flag}`,
          fanName: "Carlos Rodríguez",
          seat: "Norte A-15",
          pickupWindow: "halftime",
          items: [
            { item: FOOD_ITEMS[0], quantity: 2 },
            { item: FOOD_ITEMS[12], quantity: 2 },
          ],
          total: 500,
          status: "queued",
          syncStatus: "synced",
          createdAt: new Date(Date.now() - 120000).toISOString(),
          standName: "Burger Zone",
          paymentMethod: "card",
          validationCode: generateValidationCode(),
        },
        {
          id: crypto.randomUUID(),
          orderNumber: generateOrderNumber(),
          matchId: MATCHES[0].id,
          matchLabel: `${MATCHES[0].team1.flag} ${MATCHES[0].team1.code} vs ${MATCHES[0].team2.code} ${MATCHES[0].team2.flag}`,
          fanName: "María López",
          seat: "Sur B-22",
          pickupWindow: "before_game",
          items: [
            { item: FOOD_ITEMS[9], quantity: 3 },
            { item: FOOD_ITEMS[14], quantity: 1 },
          ],
          total: 595,
          status: "queued",
          syncStatus: "synced",
          createdAt: new Date(Date.now() - 60000).toISOString(),
          standName: "Taquería del Estadio",
          paymentMethod: "cash",
          validationCode: generateValidationCode(),
        },
      ];
      
      demoOrders.forEach(order => addOrder(order));
      allOrders = getOrders();
    }
    
    setOrdersState(allOrders);
  }, []);

  useEffect(() => {
    setMounted(true);
    loadOrders();

    // Polling for updates
    const interval = setInterval(loadOrders, 3000);
    
    const handleOrdersUpdate = () => loadOrders();
    window.addEventListener("orders-updated", handleOrdersUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("orders-updated", handleOrdersUpdate);
    };
  }, [loadOrders]);

  if (!mounted) return null;

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setProcessing(orderId);
    await new Promise(r => setTimeout(r, 800));
    
    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updatedOrders);
    setOrdersState(updatedOrders);
    setProcessing(null);
    
    const statusLabels = {
      confirmed: "confirmado",
      preparing: "en preparación",
      ready: "listo para entrega",
      delivered: "entregado",
    };
    toast.success(`Pedido ${statusLabels[newStatus]}`);
  };

  const getOrdersByStatus = (status: OrderStatus) => 
    orders.filter(o => o.status === status);
  
  const newOrdersCount = getOrdersByStatus("queued").length;
  const todayTotal = orders.reduce((sum, o) => sum + o.total, 0);

  const getPickupLabel = (id: string) => {
    const window = PICKUP_WINDOWS.find(w => w.id === id);
    return window ? `${window.emoji} ${window.label}` : id;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <ChefHat className="h-6 w-6" />
            <span className="font-bold">Panel del Operador</span>
          </div>
          {newOrdersCount > 0 && (
            <Badge className="animate-pulse bg-red-500 text-white">
              <Bell className="mr-1 h-3 w-3" />
              {newOrdersCount} nuevos
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b bg-muted/50 px-4 py-3">
        <div className="mx-auto flex max-w-4xl gap-4 overflow-x-auto text-sm">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600">{"⏳"}</span>
            <span>{getOrdersByStatus("queued").length} nuevos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600">{"✅"}</span>
            <span>{getOrdersByStatus("confirmed").length} confirmados</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-600">{"👨‍🍳"}</span>
            <span>{getOrdersByStatus("preparing").length} preparando</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">{"🎉"}</span>
            <span>{getOrdersByStatus("ready").length} listos</span>
          </div>
          <div className="ml-auto font-bold text-primary">
            Hoy: ${todayTotal.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Orders Tabs */}
      <div className="mx-auto max-w-4xl p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            {TABS.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-1">
                <span>{tab.emoji}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {getOrdersByStatus(tab.id as OrderStatus).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="mt-4 space-y-4">
              {getOrdersByStatus(tab.id as OrderStatus).length === 0 ? (
                <Card className="bg-muted/50">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="text-4xl">{tab.emoji}</span>
                    <p className="mt-2 text-muted-foreground">
                      No hay pedidos {tab.label.toLowerCase()}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getOrdersByStatus(tab.id as OrderStatus).map(order => {
                  const workflow = STATUS_WORKFLOW.find(w => w.current === order.status);
                  const isNew = order.status === "queued";
                  const isProcessing = processing === order.id;
                  
                  return (
                    <Card 
                      key={order.id}
                      className={cn(
                        "transition-all",
                        isNew && "border-yellow-400 shadow-md shadow-yellow-100"
                      )}
                    >
                      <CardContent className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black text-primary">
                                {order.orderNumber}
                              </span>
                              {isNew && (
                                <Badge className="animate-pulse bg-yellow-500 text-white">
                                  <Bell className="mr-1 h-3 w-3" />
                                  NUEVO
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm">{order.fanName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(order.createdAt), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </p>
                          </div>
                          <span className="text-xl font-bold">${order.total}</span>
                        </div>
                        
                        {/* Delivery Info */}
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-muted p-2 text-sm">
                            <p className="text-xs text-muted-foreground">Asiento</p>
                            <p className="font-medium">{order.seat}</p>
                          </div>
                          <div className="rounded-lg bg-muted p-2 text-sm">
                            <p className="text-xs text-muted-foreground">Retiro</p>
                            <p className="font-medium">{getPickupLabel(order.pickupWindow)}</p>
                          </div>
                        </div>
                        
                        {/* Items */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {order.items.map((item, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                            >
                              <span>{item.item.emoji}</span>
                              <span>{item.item.name}</span>
                              <Badge variant="outline" className="ml-1 h-5 px-1.5 text-xs">
                                x{item.quantity}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        
                        {/* Action Button */}
                        {workflow && (
                          <Button 
                            className={cn(
                              "mt-4 w-full",
                              isNew ? "bg-yellow-500 hover:bg-yellow-600" : ""
                            )}
                            onClick={() => handleUpdateStatus(order.id, workflow.next)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Procesando...
                              </>
                            ) : (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                {workflow.action}
                              </>
                            )}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
