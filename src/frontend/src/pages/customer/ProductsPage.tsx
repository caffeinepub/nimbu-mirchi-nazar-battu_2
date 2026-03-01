import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { CalendarDays, Loader2, Plus, RefreshCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../../backend.d";
import {
  cartStore,
  useCreateSubscription,
  useNextSaturday,
  useProducts,
} from "../../hooks/useQueries";
import { formatDayDate, formatRupees } from "../../utils/format";

type CategoryFilter = "all" | "home" | "shop" | "car";

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  home: "🏠 Home",
  shop: "🏪 Shop",
  car: "🚗 Car",
};

export function ProductsPage() {
  const navigate = useNavigate();
  const { data: products, isLoading } = useProducts();
  const { data: nextSaturday } = useNextSaturday();
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [subscribeProduct, setSubscribeProduct] = useState<Product | null>(
    null,
  );
  const [subQty, setSubQty] = useState(1);
  const [subAddress, setSubAddress] = useState("");
  const [subPincode, setSubPincode] = useState("");
  const [subPhone, setSubPhone] = useState("");
  const createSubscription = useCreateSubscription();

  const filtered = (products ?? []).filter((p) => {
    if (!p.isActive) return false;
    if (filter === "all") return true;
    return p.category === filter;
  });

  const handleAddToCart = (product: Product) => {
    if (Number(product.stock) <= 0) {
      toast.error("This product is out of stock");
      return;
    }
    cartStore.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image.getDirectURL(),
      category: product.category,
    });
    toast.success(`${product.name} added to cart! 🛒`);
  };

  const handleSubscribe = async () => {
    if (!subscribeProduct) return;
    if (!subAddress.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }
    if (!subPincode.trim() || subPincode.length < 6) {
      toast.error("Please enter a valid 6-digit PIN code");
      return;
    }
    if (!subPhone.trim() || subPhone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    try {
      await createSubscription.mutateAsync({
        productId: subscribeProduct.id,
        qty: BigInt(subQty),
        addressLine: subAddress.trim(),
        pincode: subPincode.trim(),
        phone: subPhone.trim(),
      });
      toast.success(
        "Subscription created! 4 Saturday deliveries scheduled. 🎉",
      );
      setSubscribeProduct(null);
      navigate({ to: "/subscriptions" });
    } catch {
      toast.error("Failed to create subscription. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🍋</span>
            <h1 className="font-display text-xl font-bold text-foreground">
              Our Products
            </h1>
          </div>
          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {(["all", "home", "shop", "car"] as CategoryFilter[]).map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setFilter(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                  ${
                    filter === cat
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50"
                  }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Saturday Delivery Banner */}
      {nextSaturday && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-4 mt-3"
        >
          <div className="flex items-center gap-2.5 bg-gradient-to-r from-green-500/15 to-yellow-400/15 border border-green-400/40 rounded-2xl px-4 py-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 shrink-0">
              <CalendarDays className="h-4 w-4 text-green-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-green-800 leading-none">
                🚚 Saturday Delivery
              </p>
              <p className="text-xs text-green-700 mt-0.5 font-medium">
                Next delivery:{" "}
                <span className="font-bold text-green-900">
                  {formatDayDate(nextSaturday)}
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Product Grid */}
      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
              <div
                key={k}
                className="bg-card rounded-2xl overflow-hidden border border-border"
              >
                <Skeleton className="h-40 w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🍋</div>
            <h3 className="font-display text-lg font-bold text-foreground">
              No products found
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              {filter !== "all"
                ? "Try a different category"
                : "Check back soon!"}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((product, i) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  index={i}
                  onAddToCart={() => handleAddToCart(product)}
                  onSubscribe={() => {
                    setSubscribeProduct(product);
                    setSubQty(1);
                    setSubAddress("");
                    setSubPincode("");
                    setSubPhone("");
                  }}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Subscribe Modal */}
      <Dialog
        open={!!subscribeProduct}
        onOpenChange={(o) => !o && setSubscribeProduct(null)}
      >
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="font-display">
              Monthly Subscription
            </DialogTitle>
          </DialogHeader>
          {subscribeProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <img
                  src={subscribeProduct.image.getDirectURL()}
                  alt={subscribeProduct.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {subscribeProduct.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRupees(subscribeProduct.price)} per piece
                  </p>
                </div>
              </div>
              <div className="bg-primary/10 rounded-xl p-3">
                <p className="text-xs text-foreground font-medium">
                  📅 4 Saturday deliveries per month
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Fresh nazar battu delivered every Saturday
                </p>
              </div>
              <div>
                <Label htmlFor="sub-qty" className="text-sm">
                  Quantity per delivery
                </Label>
                <Input
                  id="sub-qty"
                  type="number"
                  min={1}
                  max={Number(subscribeProduct.stock)}
                  value={subQty}
                  onChange={(e) =>
                    setSubQty(Math.max(1, Number(e.target.value)))
                  }
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Total: {formatRupees(subscribeProduct.price * BigInt(subQty))}{" "}
                  × 4 ={" "}
                  {formatRupees(subscribeProduct.price * BigInt(subQty * 4))}
                </p>
              </div>

              {/* Delivery Details */}
              <div className="border-t border-border pt-3 space-y-3">
                <p className="text-xs font-semibold text-foreground">
                  🏠 Delivery Details
                </p>
                <div>
                  <Label htmlFor="sub-address" className="text-sm">
                    Full Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sub-address"
                    type="text"
                    placeholder="House/Flat no., Street, Area, City"
                    value={subAddress}
                    onChange={(e) => setSubAddress(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sub-pincode" className="text-sm">
                    PIN Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sub-pincode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit PIN code"
                    value={subPincode}
                    onChange={(e) =>
                      setSubPincode(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sub-phone" className="text-sm">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sub-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={subPhone}
                    onChange={(e) =>
                      setSubPhone(
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                onClick={handleSubscribe}
                disabled={createSubscription.isPending}
                className="w-full gold-gradient text-foreground border-0 font-semibold"
              >
                {createSubscription.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCcw className="h-4 w-4 mr-2" />
                )}
                Subscribe Monthly
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductCard({
  product,
  index,
  onAddToCart,
  onSubscribe,
}: {
  product: Product;
  index: number;
  onAddToCart: () => void;
  onSubscribe: () => void;
}) {
  const isOutOfStock = Number(product.stock) <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-card rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-card-hover transition-shadow group"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden bg-muted">
        <img
          src={product.image.getDirectURL()}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <Badge variant="secondary" className="font-bold">
              Out of Stock
            </Badge>
          </div>
        )}
        <Badge className="absolute top-2 left-2 text-[10px] py-0.5 px-1.5 bg-card/90 text-foreground border-0">
          {product.category === "home"
            ? "🏠"
            : product.category === "shop"
              ? "🏪"
              : "🚗"}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-display font-bold text-foreground text-sm leading-tight line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-2 mb-2">
          <span className="font-bold text-gold-700 text-base">
            {formatRupees(product.price)}
          </span>
          <span className="text-xs text-muted-foreground">
            {isOutOfStock ? "Out of stock" : `${Number(product.stock)} left`}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <Button
            size="sm"
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className="w-full h-8 text-xs gold-gradient text-foreground border-0 font-semibold"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add to Cart
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onSubscribe}
            disabled={isOutOfStock}
            className="w-full h-7 text-xs border-sacred-300 text-sacred-700 hover:bg-sacred-50"
          >
            <RefreshCcw className="h-3 w-3 mr-1" />
            Subscribe
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
