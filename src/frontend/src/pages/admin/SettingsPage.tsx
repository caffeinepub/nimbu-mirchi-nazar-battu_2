import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Loader2, Lock, MapPin, Save, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useDeliverySettings,
  useUpdateDeliverySettings,
} from "../../hooks/useQueries";

export function SettingsPage() {
  const { data: settings, isLoading } = useDeliverySettings();
  const updateSettings = useUpdateDeliverySettings();

  const [minOrderValue, setMinOrderValue] = useState("");
  const [allowedPincodes, setAllowedPincodes] = useState("");
  const [isOrderFreezeActive, setIsOrderFreezeActive] = useState(false);

  useEffect(() => {
    if (settings) {
      setMinOrderValue((Number(settings.minOrderValue) / 100).toString());
      setAllowedPincodes(settings.allowedPincodes.join(", "));
      setIsOrderFreezeActive(settings.isOrderFreezeActive);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const pincodes = allowedPincodes
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    try {
      await updateSettings.mutateAsync({
        minOrderValue: BigInt(
          Math.round(Number.parseFloat(minOrderValue || "0") * 100),
        ),
        allowedPincodes: pincodes,
        isOrderFreezeActive,
      });
      toast.success("Delivery settings saved! 🙏");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {["sk1", "sk2", "sk3", "sk4"].map((k) => (
          <Skeleton key={k} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          Delivery Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Configure delivery zones and order rules
        </p>
      </motion.div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Min order value */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Order Rules</h2>
          </div>
          <div>
            <Label htmlFor="min-order">Minimum Order Value (₹)</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                ₹
              </span>
              <Input
                id="min-order"
                type="number"
                min="0"
                step="1"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                placeholder="0"
                className="pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Set to 0 to disable minimum order requirement
            </p>
          </div>
        </div>

        {/* Allowed Pincodes */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Delivery Zones</h2>
          </div>
          <div>
            <Label htmlFor="pincodes">Allowed PIN Codes</Label>
            <textarea
              id="pincodes"
              value={allowedPincodes}
              onChange={(e) => setAllowedPincodes(e.target.value)}
              placeholder="400001, 400002, 400003, 411001..."
              className="mt-1 w-full min-h-[100px] px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Comma-separated PIN codes. Leave empty to allow all areas.
            </p>
          </div>

          {allowedPincodes.trim() && (
            <div className="mt-3">
              <p className="text-xs font-medium text-foreground mb-1.5">
                Active zones (
                {allowedPincodes.split(",").filter((p) => p.trim()).length}):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {allowedPincodes
                  .split(",")
                  .map((p) => p.trim())
                  .filter((p) => p)
                  .map((pin) => (
                    <span
                      key={pin}
                      className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20"
                    >
                      {pin}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Freeze */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Order Freeze</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">
                Friday 10 PM Freeze
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Stop accepting new orders after Friday 10 PM for Saturday
                delivery
              </p>
            </div>
            <Switch
              id="order-freeze"
              checked={isOrderFreezeActive}
              onCheckedChange={setIsOrderFreezeActive}
            />
          </div>
          {isOrderFreezeActive && (
            <div className="mt-3 bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-800">
              ⚠️ Orders are currently frozen. No new orders can be placed.
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={updateSettings.isPending}
          className="w-full h-12 gold-gradient text-foreground border-0 font-semibold"
        >
          {updateSettings.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </form>
    </div>
  );
}
