"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";
import { isLoggedIn, getOrders } from "@/lib/storage";
import type { Order } from "@/lib/types";

const STATUS_CONFIG = {
  queued: { label: "En cola", color: "bg-yellow-500" },
  confirmed: { label: "Confirmado", color: "bg-blue-500" },
  preparing: { label: "Preparando", color: "bg-orange-500" },
  ready: { label: "Listo", color: "bg-green-500" },
  delivered: { label: "Entregado", color: "bg-gray-500" },
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn()) {
      router.replace("/");
      return;
    }
    setOrders(getOrders());

    const handleOrdersUpdate = () => setOrders(getOrders());
    window.addEventListener("orders-updated", handleOrdersUpdate);
    return () => window.removeEventListener("orders-updated", handleOrdersUpdate);
  }, [router]);

  if (!mounted) return null;

  return (
    <AppShell>
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Mis Pedidos</h1>
          </div>
        </div>

        <div className="mx-auto max-w-2xl p-4">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold">No tienes pedidos</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Cuando hagas un pedido, aparecerá aquí
              </p>
              <Button className="mt-4" onClick={() => router.push("/food")}>
                Explorar menú
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const status = STATUS_CONFIG[order.status];
                return (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <Card className="cursor-pointer transition-all hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-black text-primary">
                              {order.orderNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(order.createdAt), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </p>
                          </div>
                          <Badge className={cn(status.color, "text-white")}>
                            {status.label}
                          </Badge>
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          {order.items.map(item => (
                            <div 
                              key={item.item.id}
                              className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs"
                            >
                              <span>{item.item.emoji}</span>
                              <span>{item.item.name}</span>
                              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                                x{item.quantity}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between border-t pt-3">
                          <span className="text-sm text-muted-foreground">Total</span>
                          <span className="font-bold">${order.total}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
