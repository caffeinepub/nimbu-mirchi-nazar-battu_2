import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Shield } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../../hooks/useActor";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useRegisterOrLogin } from "../../hooks/useQueries";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const registerOrLogin = useRegisterOrLogin();

  const [step, setStep] = useState<"login" | "profile">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // After identity is available, check if profile exists
  useEffect(() => {
    if (!identity || actorFetching || !actor) return;

    const checkProfile = async () => {
      try {
        const profile = await actor.getMyProfile();
        if (profile?.name) {
          // Sync accessControlState by calling registerOrLogin (idempotent)
          // This ensures volatile accessControlState is populated after canister upgrades
          try {
            await actor.registerOrLogin(profile.name, profile.phone);
          } catch {
            // ignore -- user already registered, just syncing volatile state
          }
          // Profile exists — check admin status directly
          try {
            const adminCheck = await actor.isCallerAdmin();
            if (adminCheck) {
              navigate({ to: "/admin/dashboard" });
            } else {
              navigate({ to: "/products" });
            }
          } catch {
            navigate({ to: "/products" });
          }
        } else {
          setStep("profile");
        }
      } catch {
        // No profile yet
        setStep("profile");
      }
    };

    void checkProfile();
  }, [identity, actor, actorFetching, navigate]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await registerOrLogin.mutateAsync({ name, phone });
      toast.success("Welcome to Nimbu Mirchi Nazar Battu! 🙏");
      navigate({ to: "/products" });
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen sacred-pattern flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍋</span>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground leading-tight">
              Nimbu Mirchi
            </h1>
            <p className="text-xs text-muted-foreground">Nazar Battu</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Decorative element */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full gold-gradient flex items-center justify-center shadow-gold-lg text-5xl animate-float">
                🍋
              </div>
              <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-sacred-600 flex items-center justify-center text-xl shadow-md">
                🌿
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-card rounded-2xl p-6 shadow-card border border-border"
              >
                <div className="text-center mb-6">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Swagat Hai! 🙏
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Sign in with Internet Identity to continue
                  </p>
                </div>

                <Button
                  onClick={login}
                  disabled={isLoggingIn || isInitializing || actorFetching}
                  className="w-full h-12 gold-gradient text-foreground font-semibold text-base border-0 shadow-gold hover:shadow-gold-lg transition-all"
                >
                  {isLoggingIn || actorFetching ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Shield className="h-5 w-5 mr-2" />
                  )}
                  {isLoggingIn
                    ? "Connecting..."
                    : "Login with Internet Identity"}
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  Secure, passwordless login via ICP
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card rounded-2xl p-6 shadow-card border border-border"
              >
                <div className="text-center mb-6">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Aapka Swagat! 🎉
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Please complete your profile to continue
                  </p>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ramesh Kumar"
                      className="mt-1"
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="mt-1"
                      required
                      autoComplete="tel"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={registerOrLogin.isPending}
                    className="w-full h-11 gold-gradient text-foreground font-semibold border-0 shadow-gold"
                  >
                    {registerOrLogin.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Continue
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} Nimbu Mirchi Nazar Battu
          </p>
        </motion.div>
      </div>
    </div>
  );
}
