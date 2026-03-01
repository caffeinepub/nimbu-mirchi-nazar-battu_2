import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Edit2, Loader2, LogOut, Phone, User, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useMyProfile, useUpdateMyProfile } from "../../hooks/useQueries";

export function AccountPage() {
  const { clear, identity } = useInternetIdentity();
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateMyProfile();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await updateProfile.mutateAsync({ name, phone });
      toast.success("Profile updated! 🙏");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const principal = identity?.getPrincipal().toString();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h1 className="font-display text-xl font-bold text-foreground">
            My Account
          </h1>
        </div>
      </div>

      <div className="p-4 max-w-sm mx-auto">
        {/* Profile Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="w-20 h-20 rounded-full gold-gradient mx-auto flex items-center justify-center text-3xl shadow-gold mb-4">
            🙏
          </div>
          {isLoading ? (
            <Skeleton className="h-5 w-32 mx-auto" />
          ) : (
            <h2 className="font-display text-xl font-bold text-foreground">
              {profile?.name ?? "User"}
            </h2>
          )}
          <p className="text-xs text-muted-foreground mt-1">Valued Customer</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-5 shadow-card mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Profile Details</h3>
            {!editing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditing(true)}
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                <Edit2 className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : editing ? (
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-xs text-muted-foreground">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <Label
                  htmlFor="phone"
                  className="text-xs text-muted-foreground"
                >
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                  required
                  autoComplete="tel"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(false);
                    setName(profile?.name ?? "");
                    setPhone(profile?.phone ?? "");
                  }}
                  className="flex-1"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateProfile.isPending}
                  className="flex-1 gold-gradient text-foreground border-0"
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : (
                    <Check className="h-3.5 w-3.5 mr-1" />
                  )}
                  Save
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium text-foreground">
                    {profile?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">
                    {profile?.phone}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Principal */}
        {principal && (
          <div className="bg-muted rounded-2xl p-4 mb-4">
            <p className="text-xs text-muted-foreground mb-1">
              Internet Identity Principal
            </p>
            <p className="text-xs font-mono text-foreground break-all">
              {principal}
            </p>
          </div>
        )}

        {/* Logout */}
        <Button
          variant="outline"
          onClick={clear}
          className="w-full h-12 border-destructive/30 text-destructive hover:bg-destructive/5 font-semibold"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-6">
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
    </div>
  );
}
