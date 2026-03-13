"use client";

import Link from "next/link";
import { WifiOff, QrCode, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/10 to-background p-6">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted mx-auto">
          <WifiOff className="h-12 w-12 text-muted-foreground" />
        </div>
        
        <h1 className="text-2xl font-bold">Estás sin conexión</h1>
        <p className="mt-2 text-muted-foreground">
          No te preocupes, algunas funciones siguen disponibles
        </p>
        
        <div className="mt-8 space-y-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">Códigos QR guardados</p>
                <p className="text-sm text-muted-foreground">
                  Tus códigos de pedidos funcionan sin internet
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">Pedidos pendientes</p>
                <p className="text-sm text-muted-foreground">
                  Se sincronizarán cuando vuelvas a conectarte
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Button 
          className="mt-8" 
          onClick={() => window.location.reload()}
        >
          Reintentar conexión
        </Button>
        
        <Link href="/orders" className="mt-4 block">
          <Button variant="outline" className="w-full">
            Ver mis pedidos guardados
          </Button>
        </Link>
      </div>
    </div>
  );
}
