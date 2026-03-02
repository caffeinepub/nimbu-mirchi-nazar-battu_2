import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, IndianRupee, Loader2, Phone, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { OrderStatus, PaymentMethod } from "../../backend.d";
import type { Order, Product, User } from "../../backend.d";
import {
  useAllCustomers,
  useAllOrders,
  useCancelOrder,
  useMarkPaymentPaid,
  useProducts,
  useUpdateOrderStatus,
} from "../../hooks/useQueries";
import {
  formatDate,
  formatDayDate,
  formatRupees,
  getOrderStatusColor,
  getOrderStatusLabel,
} from "../../utils/format";

const STATUS_FILTERS = [
  { value: "all", label: "All Orders" },
  { value: OrderStatus.pending, label: "Pending" },
  { value: OrderStatus.awaitingPayment, label: "Awaiting Payment" },
  { value: OrderStatus.paid, label: "Paid" },
  { value: OrderStatus.confirmed, label: "Confirmed" },
  { value: OrderStatus.delivered, label: "Delivered" },
  { value: OrderStatus.cancelled, label: "Cancelled" },
];

export function OrdersAdminPage() {
  const { data: orders, isLoading } = useAllOrders();
  const { data: products } = useProducts();
  const { data: customers } = useAllCustomers();
  const updateOrderStatus = useUpdateOrderStatus();
  const markPaymentPaid = useMarkPaymentPaid();
  const cancelOrder = useCancelOrder();

  const [statusFilter, setStatusFilter] = useState("all");

  // Mark all current orders as seen when this page is visited
  useEffect(() => {
    if (orders) {
      localStorage.setItem("nimbu_last_seen_orders", String(orders.length));
    }
  }, [orders]);

  const filtered = (orders ?? []).filter((o) =>
    statusFilter === "all" ? true : o.status === statusFilter,
  );

  const sorted = [...filtered].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  const handleStatusChange = async (order: Order, status: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId: order.id, status });
      toast.success(`Order status updated to ${getOrderStatusLabel(status)}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleMarkPaid = async (orderId: bigint) => {
    try {
      await markPaymentPaid.mutateAsync(orderId);
      toast.success("Payment marked as paid! ✅");
    } catch {
      toast.error("Failed to mark payment");
    }
  };

  const handleCancel = async (orderId: bigint) => {
    if (!confirm("Cancel this order?")) return;
    try {
      await cancelOrder.mutateAsync(orderId);
      toast.success("Order cancelled");
    } catch {
      toast.error("Failed to cancel");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Orders
          </h1>
          <p className="text-muted-foreground text-sm">
            {filtered.length} orders
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              type="button"
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all
                ${
                  statusFilter === value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
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
          No orders found for this filter
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((order, i) => {
            const customer = customers?.find(
              (c) => c.principal.toString() === order.userId.toString(),
            );
            return (
              <OrderAdminCard
                key={order.id.toString()}
                order={order}
                index={i}
                products={products}
                customer={customer}
                onStatusChange={(status) => handleStatusChange(order, status)}
                onMarkPaid={() => handleMarkPaid(order.id)}
                onCancel={() => handleCancel(order.id)}
                isUpdating={
                  updateOrderStatus.isPending ||
                  markPaymentPaid.isPending ||
                  cancelOrder.isPending
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function OrderAdminCard({
  order,
  index,
  products,
  customer,
  onStatusChange,
  onMarkPaid,
  onCancel,
  isUpdating,
}: {
  order: Order;
  index: number;
  products: Product[] | undefined;
  customer: User | undefined;
  onStatusChange: (s: OrderStatus) => void;
  onMarkPaid: () => void;
  onCancel: () => void;
  isUpdating: boolean;
}) {
  const total = (order.items ?? []).reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty),
    0,
  );
  const isPaymentLink = order.paymentMethod === PaymentMethod.paymentLink;
  const canMarkPaid =
    isPaymentLink && order.status === OrderStatus.awaitingPayment;
  const canCancel =
    order.status !== OrderStatus.cancelled &&
    order.status !== OrderStatus.delivered;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-card rounded-2xl border border-border p-4 shadow-card"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-mono text-xs text-muted-foreground">
            #{order.id.toString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(order.createdAt)}
          </p>
          {/* Customer Name */}
          {customer?.name && (
            <p className="text-sm font-semibold text-foreground mt-1">
              👤 {customer.name}
            </p>
          )}
          {/* Phone */}
          {customer?.phone && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Phone className="h-3 w-3 shrink-0" />
              {customer.phone}
            </p>
          )}
          {/* Address */}
          <p className="text-xs text-muted-foreground mt-0.5">
            📍 {order.addressLine}, {order.pincode}
          </p>
        </div>
        <div className="text-right">
          <Badge
            className={`text-xs border ${getOrderStatusColor(order.status)} mb-1`}
          >
            {getOrderStatusLabel(order.status)}
          </Badge>
          <p className="text-sm font-bold text-gold-700">
            {formatRupees(total)}
          </p>
          <p className="text-xs text-muted-foreground">
            {isPaymentLink ? "🔗 Link" : "💵 COD"}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-muted rounded-xl p-2.5 mb-3">
        {(order.items ?? []).map((item) => {
          const productName =
            products?.find((p) => p.id === item.productId)?.name ??
            `Item #${item.productId.toString()}`;
          return (
            <div
              key={item.productId.toString()}
              className="flex justify-between text-xs text-muted-foreground py-0.5"
            >
              <span>
                {productName} × {Number(item.qty)}
              </span>
              <span>{formatRupees(item.price * item.qty)}</span>
            </div>
          );
        })}
        <div className="text-xs text-muted-foreground pt-1 border-t border-border mt-1">
          📅 Delivery: {formatDayDate(order.deliveryDate)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[140px]">
          <Select
            value={order.status}
            onValueChange={(v) => onStatusChange(v as OrderStatus)}
            disabled={isUpdating}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={OrderStatus.pending}>Pending</SelectItem>
              <SelectItem value={OrderStatus.awaitingPayment}>
                Awaiting Payment
              </SelectItem>
              <SelectItem value={OrderStatus.paid}>Paid</SelectItem>
              <SelectItem value={OrderStatus.confirmed}>Confirmed</SelectItem>
              <SelectItem value={OrderStatus.delivered}>Delivered</SelectItem>
              <SelectItem value={OrderStatus.cancelled}>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {canMarkPaid && (
          <Button
            size="sm"
            onClick={onMarkPaid}
            disabled={isUpdating}
            className="h-8 text-xs bg-green-500 hover:bg-green-600 text-white border-0"
          >
            {isUpdating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <IndianRupee className="h-3 w-3 mr-1" />
            )}
            Mark Paid
          </Button>
        )}

        {canCancel && (
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={isUpdating}
            className="h-8 text-xs border-red-200 text-red-700 hover:bg-red-50"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
}
