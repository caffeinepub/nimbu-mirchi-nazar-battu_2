import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Crown, Loader2, Shield, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../../hooks/useActor";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

type PageStep =
  | "login" // not yet logged in
  | "checking" // verifying admin status
  | "first-setup" // no admin exists — claim SuperAdmin
  | "done"; // navigating

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const [step, setStep] = useState<PageStep>("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guard against running the check more than once per identity
  const checkedRef = useRef(false);

  const runCheck = useCallback(async () => {
    if (!actor) return;
    setStep("checking");
    try {
      const noAdmin = await actor.hasNoAdmin();

      if (noAdmin) {
        // First ever setup — show claim form
        setStep("first-setup");
        return;
      }

      // Admin(s) exist — verify caller is admin
      const isAdmin = await actor.isCallerAdmin();
      if (!isAdmin) {
        toast.error("Access denied. Contact your admin.");
        setStep("login");
        checkedRef.current = false;
        return;
      }

      // Admin verified — go straight to dashboard
      toast.success("Welcome back, Admin! 🙏");
      setStep("done");
      void navigate({ to: "/admin/dashboard" });
    } catch {
      toast.error("Failed to verify admin access. Please try again.");
      setStep("login");
      checkedRef.current = false; // allow retry
    }
  }, [actor, navigate]);

  useEffect(() => {
    if (!identity || actorFetching || !actor || checkedRef.current) return;
    checkedRef.current = true;
    void runCheck();
  }, [identity, actor, actorFetching, runCheck]);

  // Safety timeout: if stuck in "checking" for too long, reset to login
  useEffect(() => {
    if (step !== "checking") return;
    const timer = setTimeout(() => {
      toast.error("Verification timed out. Please try again.");
      setStep("login");
      checkedRef.current = false;
    }, 8000);
    return () => clearTimeout(timer);
  }, [step]);

  // ── First-time setup ────────────────────────────────────────────────────────
  const handleClaimFirstAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!actor) return;
    setIsSubmitting(true);
    try {
      await actor.claimFirstAdmin(name, phone);
      toast.success("SuperAdmin access claimed! Welcome 🎉");
      setStep("done");
      void navigate({ to: "/admin/dashboard" });
    } catch {
      toast.error("Failed to claim admin. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── UI helpers ───────────────────────────────────────────────────────────────
  const isChecking = step === "checking" || (actorFetching && !!identity);

  return (
    <div className="min-h-screen bg-sidebar flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-white font-bold">
            ✦
          </div>
          <div>
            <h1 className="font-display font-bold text-sm text-sidebar-foreground leading-tight">
              Nimbu Mirchi
            </h1>
            <p className="text-xs text-sidebar-foreground/60">Admin Portal</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Icon badge */}
          <div className="flex justify-center mb-8">
            <AnimatePresence mode="wait">
              {step === "first-setup" ? (
                <motion.div
                  key="crown"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-20 h-20 rounded-2xl gold-gradient flex items-center justify-center shadow-gold"
                >
                  <Crown className="h-9 w-9 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="shield"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-20 h-20 rounded-2xl bg-sidebar-accent flex items-center justify-center shadow-lg"
                >
                  <Shield className="h-8 w-8 text-sidebar-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {/* ── Checking spinner ───────────────────────── */}
            {isChecking && step !== "first-setup" ? (
              <motion.div
                key="checking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-sidebar-accent rounded-2xl p-8 border border-sidebar-border flex flex-col items-center gap-4"
              >
                <Loader2 className="h-8 w-8 text-sidebar-primary animate-spin" />
                <p className="text-sidebar-foreground/70 text-sm text-center">
                  Verifying admin access…
                </p>
              </motion.div>
            ) : step === "login" ? (
              /* ── Login button ────────────────────────── */
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-sidebar-accent rounded-2xl p-6 border border-sidebar-border"
              >
                <div className="text-center mb-6">
                  <h2 className="font-display text-2xl font-bold text-sidebar-foreground">
                    Admin Login
                  </h2>
                  <p className="text-sidebar-foreground/60 mt-1 text-sm">
                    Authorized personnel only
                  </p>
                </div>

                <Button
                  onClick={login}
                  disabled={isLoggingIn || isInitializing}
                  className="w-full h-12 gold-gradient text-foreground font-semibold text-base border-0 shadow-gold"
                >
                  {isLoggingIn ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Shield className="h-5 w-5 mr-2" />
                  )}
                  {isLoggingIn ? "Connecting…" : "Login with Internet Identity"}
                </Button>

                <p className="text-center text-xs text-sidebar-foreground/40 mt-4">
                  Admin access is role-controlled
                </p>
              </motion.div>
            ) : step === "first-setup" ? (
              /* ── First-time SuperAdmin setup ─────────── */
              <motion.div
                key="first-setup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-sidebar-accent rounded-2xl p-6 border border-sidebar-border"
              >
                {/* Announcement banner */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-5">
                  <Star className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <p className="text-amber-300 text-xs leading-snug">
                    No admin found. You can claim{" "}
                    <span className="font-semibold">SuperAdmin</span> access.
                  </p>
                </div>

                <div className="text-center mb-5">
                  <h2 className="font-display text-2xl font-bold text-sidebar-foreground">
                    First Time Setup
                  </h2>
                  <p className="text-sidebar-foreground/60 mt-1 text-sm">
                    Create the initial SuperAdmin account
                  </p>
                </div>

                <form onSubmit={handleClaimFirstAdmin} className="space-y-4">
                  <div>
                    <Label
                      htmlFor="setup-name"
                      className="text-sm font-medium text-sidebar-foreground"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="setup-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="SuperAdmin Name"
                      className="mt-1 bg-sidebar border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/30"
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="setup-phone"
                      className="text-sm font-medium text-sidebar-foreground"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="setup-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="mt-1 bg-sidebar border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/30"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 gold-gradient text-foreground font-semibold border-0 shadow-gold"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Crown className="h-4 w-4 mr-2" />
                    )}
                    {isSubmitting ? "Setting up…" : "Claim SuperAdmin Access"}
                  </Button>
                </form>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
