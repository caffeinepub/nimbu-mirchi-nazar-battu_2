import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, MapPin, Pause, Phone, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Subscription } from "../../backend.d";
import {
  useAllCustomers,
  useAllSubscriptions,
  useCancelSubscription,
  usePauseSubscription,
  useProducts,
} from "../../hooks/useQueries";
import { formatDate } from "../../utils/format";

function getSubStatus(sub: Subscription) {
  if (sub.isCancelled) return "cancelled";
  if (sub.isPaused) return "paused";
  return "active";
}

function getSubStatusColor(status: string) {
  if (status === "active")
    return "bg-green-100 text-green-800 border-green-200";
  if (status === "paused")
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-red-100 text-red-800 border-red-200";
}

export function SubscriptionsAdminPage() {
  const { data: subscriptions, isLoading } = useAllSubscriptions();
  const { data: products } = useProducts();
  const { data: customers } = useAllCustomers();
  const pauseSubscription = usePauseSubscription();
  const cancelSubscription = useCancelSubscription();

  const sorted = [...(subscriptions ?? [])].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  const handlePause = async (id: bigint) => {
    try {
      await pauseSubscription.mutateAsync(id);
      toast.success("Subscription paused");
    } catch {
      toast.error("Failed to pause");
    }
  };

  const handleCancel = async (id: bigint) => {
    if (!confirm("Cancel this subscription?")) return;
    try {
      await cancelSubscription.mutateAsync(id);
      toast.success("Subscription cancelled");
    } catch {
      toast.error("Failed to cancel");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          Subscriptions
        </h1>
        <p className="text-muted-foreground text-sm">
          {sorted.filter((s) => !s.isCancelled && !s.isPaused).length} active
          subscriptions
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {["sk1", "sk2", "sk3", "sk4", "sk5"].map((k) => (
            <div
              key={k}
              className="bg-card rounded-2xl border border-border p-4 space-y-2"
            >
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No subscriptions yet
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((sub, i) => {
            const product = products?.find((p) => p.id === sub.productId);
            const customer = customers?.find(
              (c) => c.principal.toString() === sub.userId.toString(),
            );
            const status = getSubStatus(sub);
            const isActive = status === "active";

            return (
              <motion.div
                key={sub.id.toString()}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card rounded-2xl border border-border p-4 shadow-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {product && (
                      <img
                        src={product.image.getDirectURL()}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {product?.name ?? `Product #${sub.productId}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Customer: {customer?.name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {Number(sub.qty)} × 4 Saturdays
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`text-xs border ${getSubStatusColor(status)} capitalize`}
                  >
                    {status}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground mb-2">
                  ID: #{sub.id.toString()} • Created:{" "}
                  {formatDate(sub.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  Scheduled deliveries: {sub.orderIds.length}/4
                </p>

                {/* Delivery address & contact */}
                {(sub.addressLine || sub.pincode || sub.phone) && (
                  <div className="bg-muted/50 rounded-xl p-3 mb-3 space-y-1.5">
                    {sub.addressLine && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-xs text-foreground">
                          {sub.addressLine}
                          {sub.pincode && (
                            <span className="text-muted-foreground">
                              {" "}
                              — PIN: {sub.pincode}
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                    {sub.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <p className="text-xs text-foreground">{sub.phone}</p>
                      </div>
                    )}
                  </div>
                )}

                {isActive && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePause(sub.id)}
                      disabled={pauseSubscription.isPending}
                      className="flex-1 h-8 text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                    >
                      {pauseSubscription.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Pause className="h-3 w-3 mr-1" />
                      )}
                      Pause
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel(sub.id)}
                      disabled={cancelSubscription.isPending}
                      className="flex-1 h-8 text-xs border-red-300 text-red-700 hover:bg-red-50"
                    >
                      {cancelSubscription.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      Cancel
                    </Button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
