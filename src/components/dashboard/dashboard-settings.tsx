'use client'

import { useAppStore } from '@/lib/store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShippingZonesManager } from './shipping-zones-manager'
import { SubscriptionSection } from './settings/subscription-section'
import { ShopInfoForm } from './settings/shop-info-form'
import { AppearanceTab } from './settings/appearance-tab'
import { SeoDomainTab } from './settings/seo-domain-tab'
import { NotificationTab } from './settings/notification-tab'

export function DashboardSettings() {
  const { shop } = useAppStore()

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Paramètres</h1>

      {/* ═══ Subscription / Plan Card ═══ */}
      <SubscriptionSection shop={shop} />

      <Tabs defaultValue="boutique" className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="boutique" className="text-xs sm:text-sm">Boutique</TabsTrigger>
          <TabsTrigger value="apparence" className="text-xs sm:text-sm">Apparence</TabsTrigger>
          <TabsTrigger value="seo" className="text-xs sm:text-sm">SEO &amp; Domaine</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="boutique" className="space-y-6">
          <ShopInfoForm shop={shop} />
          <ShippingZonesManager />
        </TabsContent>

        <TabsContent value="apparence" className="space-y-6">
          <AppearanceTab shop={shop} />
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <SeoDomainTab shop={shop} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationTab shop={shop} />
        </TabsContent>
      </Tabs>
    </div>
  )
}