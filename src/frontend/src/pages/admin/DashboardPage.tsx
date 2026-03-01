import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  CalendarDays,
  IndianRupee,
  RefreshCcw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAllOrders, useDashboardStats } from "../../hooks/useQueries";
import { formatDate, formatRupees } from "../../utils/format";

/** Convert Motoko timestamp (ns/s/ms) to milliseconds safely */
function tsToMs(ts: bigint | number): number {
  const n = typeof ts === "bigint" ? Number(ts) : ts;
  if (n > 1e15) return n / 1_000_000; // nanoseconds
  if (n > 1e10) return n; // milliseconds
  return n * 1000; // seconds
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: orders } = useAllOrders();

  // Build weekly chart from real orders
  const weekData = WEEKDAYS.map((day) => ({
    day,
    orders: 0,
    revenue: 0,
  }));

  if (orders) {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    for (const order of orders) {
      const orderTime = tsToMs(order.createdAt);
      if (Number.isFinite(orderTime) && orderTime >= oneWeekAgo) {
        const dow = new Date(orderTime).getDay();
        if (dow >= 0 && dow <= 6 && weekData[dow]) {
          weekData[dow].orders++;
          weekData[dow].revenue += (order.items ?? []).reduce(
            (sum, item) => sum + Number(item.price) * Number(item.qty),
            0,
          );
        }
      }
    }
  }

  const statCards = [
    {
      label: "Total Orders",
      value: statsLoading ? null : Number(stats?.totalOrders ?? 0),
      Icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
      format: (v: number) => v.toString(),
    },
    {
      label: "Daily Revenue",
      value: statsLoading ? null : Number(stats?.dailyRevenue ?? 0),
      Icon: IndianRupee,
      color: "text-gold-700",
      bg: "bg-gold-50",
      format: formatRupees,
    },
    {
      label: "Weekly Revenue",
      value: statsLoading ? null : Number(stats?.weeklyRevenue ?? 0),
      Icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      format: formatRupees,
    },
    {
      label: "Monthly Revenue",
      value: statsLoading ? null : Number(stats?.monthlyRevenue ?? 0),
      Icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-50",
      format: formatRupees,
    },
    {
      label: "Subscription Revenue",
      value: statsLoading ? null : Number(stats?.subscriptionRevenue ?? 0),
      Icon: RefreshCcw,
      color: "text-orange-600",
      bg: "bg-orange-50",
      format: formatRupees,
    },
    {
      label: "This Saturday",
      value: null,
      Icon: CalendarDays,
      color: "text-sacred-700",
      bg: "bg-sacred-50",
      format: () => {
        const d = new Date();
        const daysUntilSaturday = (6 - d.getDay() + 7) % 7 || 7;
        const saturday = new Date(
          d.getTime() + daysUntilSaturday * 24 * 60 * 60 * 1000,
        );
        return saturday.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        });
      },
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Dashboard 🙏
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back! Here's your business at a glance.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {statCards.map(({ label, value, Icon, color, bg, format }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl border border-border p-4 shadow-card"
          >
            <div
              className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}
            >
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            {statsLoading && value === null && label !== "This Saturday" ? (
              <Skeleton className="h-7 w-16 mb-1" />
            ) : (
              <p className="text-xl font-bold text-foreground font-display">
                {value !== null ? format(value) : format(0)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl border border-border p-5 shadow-card mb-6"
      >
        <h2 className="font-display text-lg font-bold text-foreground mb-4">
          This Week's Orders
        </h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weekData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.87 0.03 78)"
              />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid oklch(0.87 0.03 78)",
                  fontSize: 11,
                }}
              />
              <Bar
                dataKey="orders"
                fill="oklch(0.72 0.18 75)"
                radius={[4, 4, 0, 0]}
                name="Orders"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recent Orders */}
      {orders && orders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card rounded-2xl border border-border p-5 shadow-card"
        >
          <h2 className="font-display text-lg font-bold text-foreground mb-4">
            Recent Orders
          </h2>
          <div className="space-y-2">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id.toString()}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-xs font-mono text-muted-foreground">
                    #{order.id.toString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {order.status.replace(/([A-Z])/g, " $1")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gold-700">
                    {formatRupees(
                      (order.items ?? []).reduce(
                        (s, i) => s + Number(i.price) * Number(i.qty),
                        0,
                      ),
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {order.paymentMethod === "cod" ? "COD" : "Link"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
