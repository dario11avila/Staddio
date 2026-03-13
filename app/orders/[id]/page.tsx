"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Clock, ChefHat, Package, Truck, CreditCard, Banknote } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { isLoggedIn, getOrders } from "@/lib/storage";
import { PICKUP_WINDOWS } from "@/lib/data";
import type { Order } from "@/lib/types";

const STATUS_STEPS = [
  { key: "queued", label: "En cola", icon: Clock },
  { key: "confirmed", label: "Confirmado", icon: Check },
  { key: "preparing", label: "Preparando", icon: ChefHat },
  { key: "ready", label: "Listo", icon: Package },
  { key: "delivered", label: "Entregado", icon: Truck },
];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn()) {
      router.replace("/");
      return;
    }
    
    const orders = getOrders();
    const found = orders.find(o => o.id === id);
    if (found) {
      setOrder(found);
    } else {
      router.replace("/orders");
    }

    const handleOrdersUpdate = () => {
      const orders = getOrders();
      const found = orders.find(o => o.id === id);
      if (found) setOrder(found);
    };
    
    window.addEventListener("orders-updated", handleOrdersUpdate);
    return () => window.removeEventListener("orders-updated", handleOrdersUpdate);
  }, [id, router]);

  if (!mounted || !order) return null;

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.status);
  const pickupWindow = PICKUP_WINDOWS.find(w => w.id === order.pickupWindow);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link href="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{order.orderNumber}</h1>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(order.createdAt), {
                addSuffix: true,
                locale: es,
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-6 p-4 pb-8">
        {/* QR Code */}
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center p-6">
            <p className="mb-4 text-sm font-medium">Código de validación</p>
            <div className="rounded-lg bg-primary p-6 text-center text-primary-foreground">
              <p className="font-mono text-5xl font-black tracking-widest">
                {order.validationCode}
              </p>
            </div>
            <div className="mt-6 rounded-lg bg-white p-4">
              <QRCode
                value={JSON.stringify({
                  code: order.validationCode,
                  seat: order.seat,
                  fan: order.fanName,
                  order: order.orderNumber,
                })}
                size={160}
                fgColor="#006B3C"
              />
            </div>
            <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              Este QR funciona sin internet {"📴"}
            </p>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-4 font-semibold">Estado del pedido</h3>
            <div className="space-y-4">
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const Icon = step.icon;
                
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "font-medium",
                        isCompleted ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-primary">Estado actual</p>
                      )}
                    </div>
                    {isCompleted && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-4 font-semibold">Detalles del pedido</h3>
            
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.item.emoji}</span>
                    <span>{item.item.name}</span>
                    <Badge variant="secondary">x{item.quantity}</Badge>
                  </div>
                  <span className="font-medium">${item.item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-primary">${order.total}</span>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Info */}
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-4 font-semibold">Información de entrega</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Asiento</p>
                <p className="font-medium">{order.seat}</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Ventana de retiro</p>
                <p className="font-medium">
                  {pickupWindow?.emoji} {pickupWindow?.label}
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 rounded-lg border p-3">
              {order.paymentMethod === "card" ? (
                <CreditCard className="h-5 w-5 text-primary" />
              ) : (
                <Banknote className="h-5 w-5 text-green-600" />
              )}
              <span className="text-sm">
                {order.paymentMethod === "card" ? "Pagado con tarjeta" : "Pago en efectivo"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
