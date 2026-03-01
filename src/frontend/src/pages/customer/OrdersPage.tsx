import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { CalendarDays, Package, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Order, Product } from "../../backend.d";
import { useMyOrders } from "../../hooks/useQueries";
import { cartStore } from "../../hooks/useQueries";
import { useProducts } from "../../hooks/useQueries";
import {
  formatDate,
  formatDayDate,
  formatRupees,
  getOrderStatusColor,
  getOrderStatusLabel,
} from "../../utils/format";

export function OrdersPage() {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useMyOrders();
  const { data: products } = useProducts();

  const sortedOrders = [...(orders ?? [])].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  const handleReorder = (order: Order) => {
    if (!products) return;
    let added = 0;
    for (const item of order.items ?? []) {
      const product = products.find((p) => p.id === item.productId);
      if (product?.isActive && Number(product.stock) > 0) {
        cartStore.addItem({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image.getDirectURL(),
          category: product.category,
          qty: Number(item.qty),
        });
        added++;
      }
    }
    if (added > 0) {
      toast.success(`${added} item(s) added to cart! 🛒`);
      navigate({ to: "/cart" });
    } else {
      toast.error("Products from this order are no longer available");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h1 className="font-display text-xl font-bold text-foreground">
            My Orders
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-3 max-w-lg mx-auto">
        {isLoading ? (
          ["sk1", "sk2", "sk3", "sk4"].map((k) => (
            <div
              key={k}
              className="bg-card rounded-2xl border border-border p-4 space-y-2"
            >
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))
        ) : sortedOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">
              Koi order nahi mila
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              You haven't placed any orders yet
            </p>
            <Button
              onClick={() => navigate({ to: "/products" })}
              className="gold-gradient text-foreground border-0 font-semibold"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          sortedOrders.map((order, i) => (
            <OrderCard
              key={order.id.toString()}
              order={order}
              index={i}
              onReorder={() => handleReorder(order)}
              products={products}
            />
          ))
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  index,
  onReorder,
  products,
}: {
  order: Order;
  index: number;
  onReorder: () => void;
  products: Product[] | undefined;
}) {
  const total = (order.items ?? []).reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty),
    0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-2xl border border-border p-4 shadow-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-muted-foreground font-mono">
            Order #{order.id.toString()}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge
          className={`text-xs border ${getOrderStatusColor(order.status)}`}
        >
          {getOrderStatusLabel(order.status)}
        </Badge>
      </div>

      {/* Items */}
      <div className="space-y-1 mb-3">
        {(order.items ?? []).map((item) => {
          const productName =
            products?.find((p) => p.id === item.productId)?.name ??
            `Item #${item.productId.toString()}`;
          return (
            <div
              key={item.productId.toString()}
              className="flex justify-between text-xs text-muted-foreground"
            >
              <span>
                {productName} × {Number(item.qty)}
              </span>
              <span>{formatRupees(item.price * item.qty)}</span>
            </div>
          );
        })}
      </div>

      {/* Details */}
      <div className="border-t border-border pt-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-green-800 bg-green-500/10 border border-green-400/30 rounded-lg px-2 py-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-green-700 shrink-0" />
          <span>
            🚚{" "}
            <strong className="font-bold">
              {formatDayDate(order.deliveryDate)}
            </strong>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {order.paymentMethod === "cod"
              ? "💵 Cash on Delivery"
              : "🔗 Payment Link"}
          </span>
          <span className="font-bold text-gold-700 text-sm">
            {formatRupees(total)}
          </span>
        </div>
      </div>

      {/* Reorder */}
      {(order.status === "delivered" || order.status === "cancelled") && (
        <Button
          size="sm"
          variant="outline"
          onClick={onReorder}
          className="mt-3 w-full h-8 text-xs border-primary/30 text-primary hover:bg-primary/5"
        >
          <RefreshCw className="h-3 w-3 mr-1.5" />
          Reorder
        </Button>
      )}
    </motion.div>
  );
}
