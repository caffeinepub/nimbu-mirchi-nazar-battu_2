import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Car,
  Clock,
  Home,
  Shield,
  ShoppingBag,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useCMSContent } from "../../hooks/useQueries";

const categories = [
  {
    id: "home",
    label: "Home Protection",
    emoji: "🏠",
    Icon: Home,
    image: "/assets/generated/product-home-nazar.dim_600x600.jpg",
    desc: "Protect your home from nazar with our handcrafted lemon-chilli talisman",
  },
  {
    id: "shop",
    label: "Shop Protection",
    emoji: "🏪",
    Icon: ShoppingBag,
    image: "/assets/generated/product-shop-nazar.dim_600x600.jpg",
    desc: "Keep evil eye away from your business with our sacred nazar battu",
  },
  {
    id: "car",
    label: "Car Protection",
    emoji: "🚗",
    Icon: Car,
    image: "/assets/generated/product-car-nazar.dim_600x600.jpg",
    desc: "Travel safely with our traditional nimbu-mirchi car protection charm",
  },
];

export function LandingPage() {
  const { identity } = useInternetIdentity();
  const { data: cms } = useCMSContent();
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    if (cms?.tagline.popupActive && cms.tagline.popupText) {
      const timer = setTimeout(() => setPopupOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [cms]);

  const tagline = cms?.tagline.tagline || "Har Saturday, Nazar Hatao! 🍋🌿";
  const festivalOffer = cms?.tagline.festivalOffer;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="relative h-[420px] md:h-[520px] bg-cover bg-center"
          style={{
            backgroundImage: `url('/assets/generated/hero-nazar-battu.dim_1200x600.jpg')`,
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/20 to-background" />

          {/* Header */}
          <header className="relative z-10 flex items-center justify-between p-4 md:px-8">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🍋</span>
              <div>
                <h1 className="font-display font-bold text-white text-base leading-tight drop-shadow">
                  Nimbu Mirchi
                </h1>
                <p className="text-white/80 text-xs">Nazar Battu</p>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              className="gold-gradient text-foreground font-semibold border-0 shadow-gold"
            >
              <Link to={identity ? "/products" : "/login"}>
                {identity ? "Shop Now" : "Login"}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </header>

          {/* Hero Text */}
          <div className="relative z-10 px-6 md:px-8 pt-8 md:pt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-3 bg-primary/90 text-primary-foreground border-0 font-medium">
                🌿 Every Saturday Delivery
              </Badge>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white drop-shadow-lg leading-tight max-w-md">
                {tagline}
              </h2>
              <p className="text-white/90 mt-2 text-base md:text-lg">
                Fresh handcrafted Nazar Battu delivered to your door
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Festival Offer Banner */}
      {festivalOffer && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary text-primary-foreground text-center py-2.5 px-4 text-sm font-medium"
        >
          🎉 {festivalOffer}
        </motion.div>
      )}

      {/* How it works */}
      <section className="px-4 md:px-8 py-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-2">
            Kaisa Kaam Karta Hai?
          </h2>
          <p className="text-muted-foreground text-center text-sm mb-8">
            3 simple steps to protect your family
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                step: "1",
                label: "Choose",
                desc: "Pick Home, Shop or Car protection",
                emoji: "🛒",
              },
              {
                step: "2",
                label: "Order",
                desc: "Select one-time or monthly subscription",
                emoji: "📦",
              },
              {
                step: "3",
                label: "Receive",
                desc: "Fresh delivery every Saturday",
                emoji: "🚚",
              },
            ].map(({ step, label, desc, emoji }) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Number(step) * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl gold-gradient mx-auto flex items-center justify-center text-2xl shadow-gold mb-3">
                  {emoji}
                </div>
                <div className="text-xs text-muted-foreground font-medium mb-0.5">
                  Step {step}
                </div>
                <div className="font-display font-bold text-foreground text-sm">
                  {label}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 md:px-8 pb-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-2">
            Humari Products
          </h2>
          <p className="text-muted-foreground text-center text-sm mb-6">
            Handcrafted with fresh nimbu, hari mirchi & sacred thread
          </p>
          <div className="space-y-4">
            {categories.map(({ id, label, emoji, image, desc }, i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card rounded-2xl overflow-hidden shadow-card border border-border flex gap-0 group hover:shadow-card-hover transition-shadow"
              >
                <div className="w-28 h-28 shrink-0 overflow-hidden">
                  <img
                    src={image}
                    alt={label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-lg">{emoji}</span>
                    <h3 className="font-display font-bold text-foreground text-sm">
                      {label}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                  <Link
                    to={identity ? "/products" : "/login"}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:text-gold-600"
                  >
                    Shop Now <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="px-4 md:px-8 py-10 spiritual-gradient">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">
            Kyun Choose Karein?
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: <Shield className="h-5 w-5" />,
                label: "100% Authentic",
                desc: "Hand-crafted with genuine materials",
              },
              {
                icon: <Clock className="h-5 w-5" />,
                label: "Every Saturday",
                desc: "Fresh delivery, never stored",
              },
              {
                icon: <Star className="h-5 w-5" />,
                label: "Traditional Method",
                desc: "Crafted by experienced artisans",
              },
              {
                icon: <span className="text-lg">🌿</span>,
                label: "Fresh Ingredients",
                desc: "Real nimbu & hari mirchi",
              },
            ].map(({ icon, label, desc }) => (
              <div
                key={label}
                className="bg-card rounded-xl p-4 border border-border shadow-xs"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                  {icon}
                </div>
                <h3 className="font-semibold text-foreground text-sm">
                  {label}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-8 py-10">
        <div className="max-w-sm mx-auto text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Shuru Karein Aaj! 🎉
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Protect your home, shop & car from nazar. Order now for next
            Saturday.
          </p>
          <Button
            asChild
            size="lg"
            className="w-full h-12 gold-gradient text-foreground font-semibold text-base border-0 shadow-gold hover:shadow-gold-lg"
          >
            <Link to={identity ? "/products" : "/login"}>
              Order Karo Ab
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 md:px-8 py-8 border-t border-border">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xl">🍋</span>
            <span className="font-display font-bold text-foreground">
              Nimbu Mirchi Nazar Battu
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mb-4">
            <Link to="/legal/terms" className="hover:text-foreground">
              Terms & Conditions
            </Link>
            <Link to="/legal/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/legal/refund" className="hover:text-foreground">
              Refund Policy
            </Link>
            <Link to="/legal/shipping" className="hover:text-foreground">
              Shipping Policy
            </Link>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-700 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Popup Announcement */}
      {cms?.tagline.popupActive && cms.tagline.popupText && (
        <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
          <DialogContent className="max-w-sm mx-4">
            <div className="text-center py-2">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Special Announcement!
              </h3>
              <p className="text-muted-foreground text-sm">
                {cms.tagline.popupText}
              </p>
              <Button
                onClick={() => setPopupOpen(false)}
                className="mt-4 w-full gold-gradient text-foreground border-0"
              >
                Got it! 🙏
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
