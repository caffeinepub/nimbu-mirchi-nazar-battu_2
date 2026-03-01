import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, IndianRupee, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus, PaymentMethod } from "../../backend.d";
import type { Order } from "../../backend.d";
import { useAllOrders, useMarkPaymentPaid } from "../../hooks/useQueries";
import {
  formatDate,
  formatRupees,
  getOrderStatusColor,
  getOrderStatusLabel,
} from "../../utils/format";

function exportToCSV(orders: Order[]) {
  const headers = [
    "Order ID",
    "Date",
    "Amount",
    "Payment Method",
    "Status",
    "Address",
  ];
  const rows = orders.map((o) => [
    o.id.toString(),
    formatDate(o.createdAt),
    formatRupees(
      (o.items ?? []).reduce((s, i) => s + Number(i.price) * Number(i.qty), 0),
    ),
    o.paymentMethod,
    o.status,
    `${o.addressLine} ${o.pincode}`,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("CSV exported!");
}

export function PaymentsPage() {
  const { data: orders, isLoading } = useAllOrders();
  const markPaymentPaid = useMarkPaymentPaid();
  const [tab, setTab] = useState<"all" | "cod" | "paymentLink">("all");

  const filtered = (orders ?? []).filter((o) => {
    if (tab === "cod") return o.paymentMethod === PaymentMethod.cod;
    if (tab === "paymentLink")
      return o.paymentMethod === PaymentMethod.paymentLink;
    return true;
  });

  const sorted = [...filtered].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  const totalRevenue = sorted
    .filter((o) => o.status !== OrderStatus.cancelled)
    .reduce(
      (sum, o) =>
        sum +
        (o.items ?? []).reduce(
          (s, i) => s + Number(i.price) * Number(i.qty),
          0,
        ),
      0,
    );

  const pendingPayments = sorted.filter(
    (o) =>
      o.paymentMethod === PaymentMethod.paymentLink &&
      o.status === OrderStatus.awaitingPayment,
  ).length;

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
            Payments
          </h1>
          <p className="text-muted-foreground text-sm">
            {pendingPayments > 0 && (
              <span className="text-orange-600 font-medium">
                {pendingPayments} awaiting payment •{" "}
              </span>
            )}
            Total: {formatRupees(totalRevenue)}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => exportToCSV(sorted)}
          className="border-sacred-300 text-sacred-700 hover:bg-sacred-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            label: "Total Revenue",
            value: formatRupees(totalRevenue),
            color: "text-gold-700",
          },
          {
            label: "COD Orders",
            value: (orders ?? [])
              .filter((o) => o.paymentMethod === "cod")
              .length.toString(),
            color: "text-green-600",
          },
          {
            label: "Payment Link Orders",
            value: (orders ?? [])
              .filter((o) => o.paymentMethod === "paymentLink")
              .length.toString(),
            color: "text-blue-600",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-card rounded-2xl border border-border p-3 text-center shadow-card"
          >
            <p className={`text-lg font-bold font-display ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="cod">Cash on Delivery</TabsTrigger>
          <TabsTrigger value="paymentLink">Payment Link</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="space-y-3">
          {isLoading ? (
            ["sk1", "sk2", "sk3", "sk4", "sk5"].map((k) => (
              <div
                key={k}
                className="bg-card rounded-xl border border-border p-4"
              >
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))
          ) : sorted.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No orders found
            </div>
          ) : (
            sorted.map((order, i) => (
              <PaymentRow
                key={order.id.toString()}
                order={order}
                index={i}
                onMarkPaid={() =>
                  markPaymentPaid
                    .mutateAsync(order.id)
                    .then(() => toast.success("Marked as paid!"))
                    .catch(() => toast.error("Failed"))
                }
                isUpdating={markPaymentPaid.isPending}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PaymentRow({
  order,
  index,
  onMarkPaid,
  isUpdating,
}: {
  order: Order;
  index: number;
  onMarkPaid: () => void;
  isUpdating: boolean;
}) {
  const total = (order.items ?? []).reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty),
    0,
  );
  const canMarkPaid =
    order.paymentMethod === PaymentMethod.paymentLink &&
    order.status === OrderStatus.awaitingPayment;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-card rounded-2xl border border-border p-4 shadow-card flex items-center justify-between gap-4"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-mono text-xs text-muted-foreground">
            #{order.id.toString()}
          </p>
          <Badge
            className={`text-xs border ${getOrderStatusColor(order.status)}`}
          >
            {getOrderStatusLabel(order.status)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDate(order.createdAt)}
        </p>
        <p className="text-xs text-muted-foreground">
          {order.paymentMethod === "cod"
            ? "💵 Cash on Delivery"
            : "🔗 Payment Link"}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-gold-700">{formatRupees(total)}</p>
        {canMarkPaid && (
          <Button
            size="sm"
            onClick={onMarkPaid}
            disabled={isUpdating}
            className="mt-1 h-7 text-xs bg-green-500 hover:bg-green-600 text-white border-0"
          >
            {isUpdating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <IndianRupee className="h-3 w-3 mr-1" />
            )}
            Mark Paid
          </Button>
        )}
      </div>
    </motion.div>
  );
}
