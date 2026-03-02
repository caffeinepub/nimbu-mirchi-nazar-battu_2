import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { PaymentMethod } from "../../backend.d";
import type { OrderItem } from "../../backend.d";
import { useCart } from "../../hooks/useCart";
import {
  type CartItem,
  useMyProfile,
  useNextSaturday,
  usePlaceOrder,
  useUpdateMyProfile,
} from "../../hooks/useQueries";
import { formatDayDate, formatRupees } from "../../utils/format";

const STEPS = ["Cart", "Address", "Payment"];

export function CartPage() {
  const navigate = useNavigate();
  const { items, totalPrice, updateQty, removeItem, clear } = useCart();
  const { data: nextSaturday } = useNextSaturday();
  const { data: myProfile } = useMyProfile();
  const placeOrder = usePlaceOrder();
  const updateMyProfile = useUpdateMyProfile();

  const [step, setStep] = useState(0);
  const [addressLine, setAddressLine] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.cod,
  );
  const [confirmedOrder, setConfirmedOrder] = useState<null | {
    id: bigint;
    items: CartItem[];
    total: number;
    deliveryDate: bigint;
    paymentMethod: PaymentMethod;
  }>(null);

  const handlePlaceOrder = async () => {
    if (!addressLine.trim() || !pincode.trim() || !phone.trim()) {
      toast.error("Please fill in your delivery address and phone number");
      setStep(1);
      return;
    }
    if (!nextSaturday) {
      toast.error("Could not determine delivery date");
      return;
    }

    const orderItems: OrderItem[] = items.map((item) => ({
      productId: item.productId,
      qty: BigInt(item.qty),
      price: item.price,
    }));

    // Capture snapshot before mutating
    const itemsSnapshot = [...items];
    const totalSnapshot = totalPrice;
    const paymentMethodSnapshot = paymentMethod;

    try {
      // Save phone to user profile so admin can see it in customer details
      if (phone.trim()) {
        try {
          await updateMyProfile.mutateAsync({
            name: myProfile?.name ?? "",
            phone: phone.trim(),
          });
        } catch {
          // Non-blocking -- still place the order even if profile update fails
        }
      }
      const result = await placeOrder.mutateAsync({
        items: orderItems,
        deliveryDate: nextSaturday,
        paymentMethod,
        addressLine,
        pincode,
      });
      clear();
      setConfirmedOrder({
        id: result.id,
        items: itemsSnapshot,
        total: totalSnapshot,
        deliveryDate: nextSaturday,
        paymentMethod: paymentMethodSnapshot,
      });
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (confirmedOrder) {
    return (
      <div
        data-ocid="order_confirmation.success_state"
        className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center"
      >
        {/* Large green check */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Aapka order place ho gaya hai 🙏
        </p>

        {/* Order details card */}
        <div className="bg-card border border-border rounded-2xl p-4 w-full max-w-sm mb-4 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-mono font-bold text-foreground">
              #{confirmedOrder.id.toString()}
            </span>
          </div>
          <div className="border-t border-border pt-3 space-y-1">
            {confirmedOrder.items.map((item) => (
              <div
                key={item.productId.toString()}
                className="flex justify-between text-sm"
              >
                <span className="text-foreground">
                  {item.name} × {item.qty}
                </span>
                <span className="text-gold-700 font-semibold">
                  {formatRupees(item.price * BigInt(item.qty))}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground">
            <span>Total</span>
            <span className="text-gold-700">
              {formatRupees(confirmedOrder.total)}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
            <CalendarDays className="h-4 w-4 text-green-700 shrink-0" />
            <span className="text-sm text-green-800 font-medium">
              🚚 Delivery: {formatDayDate(confirmedOrder.deliveryDate)}
            </span>
          </div>
          <div
            className={`text-xs px-3 py-2 rounded-xl ${
              confirmedOrder.paymentMethod === PaymentMethod.cod
                ? "bg-blue-50 text-blue-800"
                : "bg-orange-50 text-orange-800"
            }`}
          >
            {confirmedOrder.paymentMethod === PaymentMethod.cod
              ? "💵 Cash on Delivery — delivery ke waqt payment karein"
              : "🔗 Admin aapko payment link bhejenge jaldi"}
          </div>
        </div>

        <div className="flex gap-3 w-full max-w-sm">
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/products" })}
            className="flex-1"
          >
            Continue Shopping
          </Button>
          <Button
            onClick={() => navigate({ to: "/orders" })}
            className="flex-1 gold-gradient text-foreground border-0 font-semibold"
          >
            View Orders
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && step === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="font-display text-xl font-bold text-foreground">
            My Cart
          </h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Aapka cart khali hai!
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Add some nazar battu products to your cart
          </p>
          <Button
            onClick={() => navigate({ to: "/products" })}
            className="gold-gradient text-foreground border-0 font-semibold"
          >
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with stepper */}
      <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm border-b border-border p-4">
        <h1 className="font-display text-xl font-bold text-foreground mb-3">
          Checkout
        </h1>
        {/* Step indicators */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border-2 transition-all shrink-0
                  ${
                    i <= step
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground"
                  }`}
              >
                {i < step ? "✓" : i + 1}
              </button>
              <span
                className={`ml-1.5 text-xs font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-primary" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        {/* Step 0: Cart Items */}
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            {items.map((item) => (
              <div
                key={item.productId.toString()}
                className="bg-card rounded-2xl border border-border p-3 flex items-center gap-3"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {item.category === "home"
                      ? "🏠"
                      : item.category === "shop"
                        ? "🏪"
                        : "🚗"}
                  </p>
                  <p className="text-gold-700 font-bold text-sm mt-0.5">
                    {formatRupees(item.price * BigInt(item.qty))}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                      className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-muted"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                      className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-muted"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-foreground font-medium">Total</span>
                <span className="font-display text-xl font-bold text-gold-700">
                  {formatRupees(totalPrice)}
                </span>
              </div>
              {nextSaturday && (
                <div className="flex items-center gap-1.5 mt-2.5 bg-green-500/10 border border-green-400/30 rounded-xl px-3 py-2">
                  <CalendarDays className="h-3.5 w-3.5 text-green-700 shrink-0" />
                  <span className="text-xs text-green-800">
                    🚚 Delivery:{" "}
                    <strong className="font-bold text-green-900">
                      {formatDayDate(nextSaturday)}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <Button
              onClick={() => setStep(1)}
              className="w-full h-12 gold-gradient text-foreground border-0 font-semibold text-base"
            >
              Proceed to Address
            </Button>
          </motion.div>
        )}

        {/* Step 1: Address */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground">
                Delivery Address
              </h2>
            </div>
            <div>
              <Label htmlFor="address">Full Address</Label>
              <Input
                id="address"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="House no., Street, Area, City"
                className="mt-1"
                required
                autoComplete="street-address"
              />
            </div>
            <div>
              <Label htmlFor="pincode">PIN Code</Label>
              <Input
                id="pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="400001"
                className="mt-1"
                required
                maxLength={6}
                autoComplete="postal-code"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                Contact Number{" "}
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="10-digit mobile number"
                className="mt-1"
                required
                maxLength={10}
                autoComplete="tel"
              />
            </div>
            {nextSaturday && (
              <div className="bg-primary/10 rounded-xl p-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">
                    Delivery Date
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDayDate(nextSaturday)}
                  </p>
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep(0)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  if (!addressLine.trim() || !pincode.trim()) {
                    toast.error("Please fill in your address");
                    return;
                  }
                  if (!phone.trim() || phone.length < 10) {
                    toast.error("Please enter a valid 10-digit phone number");
                    return;
                  }
                  setStep(2);
                }}
                className="flex-1 gold-gradient text-foreground border-0 font-semibold"
              >
                Proceed to Payment
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground">
                Payment Method
              </h2>
            </div>

            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              className="space-y-3"
            >
              <label
                htmlFor="cod"
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all
                  ${paymentMethod === PaymentMethod.cod ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <RadioGroupItem value={PaymentMethod.cod} id="cod" />
                <span className="flex-1">
                  <span className="font-semibold text-foreground block">
                    Cash on Delivery
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5 block">
                    Pay when delivered on Saturday
                  </span>
                </span>
                <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                  Recommended
                </Badge>
              </label>

              <label
                htmlFor="payment-link"
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all
                  ${paymentMethod === PaymentMethod.paymentLink ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <RadioGroupItem
                  value={PaymentMethod.paymentLink}
                  id="payment-link"
                />
                <span className="flex-1">
                  <span className="font-semibold text-foreground block">
                    Payment Link
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5 block">
                    Admin will share a payment link
                  </span>
                </span>
              </label>
            </RadioGroup>

            {paymentMethod === PaymentMethod.paymentLink && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-800">
                ℹ️ After placing the order, our admin will contact you with a
                payment link. Your order will be confirmed once payment is
                received.
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-card rounded-2xl border border-border p-4 space-y-2">
              <h3 className="font-semibold text-foreground text-sm">
                Order Summary
              </h3>
              {items.map((item) => (
                <div
                  key={item.productId.toString()}
                  className="flex justify-between text-xs text-muted-foreground"
                >
                  <span>
                    {item.name} × {item.qty}
                  </span>
                  <span>{formatRupees(item.price * BigInt(item.qty))}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
                <span>Total</span>
                <span className="text-gold-700">
                  {formatRupees(totalPrice)}
                </span>
              </div>
              {nextSaturday && (
                <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-400/30 rounded-xl px-3 py-2 mt-1">
                  <CalendarDays className="h-3.5 w-3.5 text-green-700 shrink-0" />
                  <span className="text-xs text-green-800">
                    🚚 Delivery:{" "}
                    <strong className="font-bold text-green-900">
                      {formatDayDate(nextSaturday)}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handlePlaceOrder}
                disabled={placeOrder.isPending}
                className="flex-1 gold-gradient text-foreground border-0 font-semibold"
              >
                {placeOrder.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="h-4 w-4 mr-2" />
                )}
                Place Order
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
