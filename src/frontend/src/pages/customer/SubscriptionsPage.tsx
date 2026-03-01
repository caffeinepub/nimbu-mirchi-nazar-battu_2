import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  Loader2,
  Pause,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Subscription } from "../../backend.d";
import {
  useCancelSubscription,
  useMySubscriptions,
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

export function SubscriptionsPage() {
  const navigate = useNavigate();
  const { data: subscriptions, isLoading } = useMySubscriptions();
  const { data: products } = useProducts();
  const pauseSubscription = usePauseSubscription();
  const cancelSubscription = useCancelSubscription();

  const handlePause = async (id: bigint) => {
    try {
      await pauseSubscription.mutateAsync(id);
      toast.success("Subscription paused");
    } catch {
      toast.error("Failed to pause subscription");
    }
  };

  const handleCancel = async (id: bigint) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) return;
    try {
      await cancelSubscription.mutateAsync(id);
      toast.success("Subscription cancelled");
    } catch {
      toast.error("Failed to cancel subscription");
    }
  };

  const sorted = [...(subscriptions ?? [])].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center gap-2">
          <RefreshCcw className="h-5 w-5 text-primary" />
          <h1 className="font-display text-xl font-bold text-foreground">
            My Subscriptions
          </h1>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        {/* Info Banner */}
        <div className="bg-primary/10 rounded-2xl p-3 mb-4 flex items-start gap-2 border border-primary/20">
          <CalendarDays className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-foreground">
              Monthly Subscription
            </p>
            <p className="text-xs text-muted-foreground">
              4 Saturday deliveries per month — fresh nazar battu every week
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {["sk1", "sk2", "sk3"].map((k) => (
              <div
                key={k}
                className="bg-card rounded-2xl border border-border p-4 space-y-2"
              >
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔄</div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">
              Koi subscription nahi hai
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Subscribe for monthly Saturday deliveries
            </p>
            <Button
              onClick={() => navigate({ to: "/products" })}
              className="gold-gradient text-foreground border-0 font-semibold"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((sub, i) => {
              const product = products?.find((p) => p.id === sub.productId);
              const status = getSubStatus(sub);
              const isActive = status === "active";

              return (
                <motion.div
                  key={sub.id.toString()}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-2xl border border-border p-4 shadow-card"
                >
                  {/* Header */}
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

                  {/* Delivery schedule */}
                  {sub.orderIds.length > 0 && (
                    <div className="bg-muted rounded-xl p-3 mb-3">
                      <p className="text-xs font-medium text-foreground mb-1.5">
                        📅 Scheduled Deliveries ({sub.orderIds.length}/4)
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {sub.orderIds.map((orderId, idx) => (
                          <span
                            key={orderId.toString()}
                            className="text-xs bg-card px-2 py-0.5 rounded-full border border-border text-muted-foreground"
                          >
                            Week {idx + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mb-3">
                    Created: {formatDate(sub.createdAt)}
                  </p>

                  {/* Actions */}
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

                  {status === "paused" && (
                    <p className="text-xs text-yellow-700 bg-yellow-50 rounded-lg p-2">
                      ⏸️ This subscription is paused. Contact admin to resume.
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
