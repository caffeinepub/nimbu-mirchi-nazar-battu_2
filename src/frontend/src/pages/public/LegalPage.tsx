import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { CMSTerms } from "../../backend.d";
import { useCMSContent } from "../../hooks/useQueries";

type LegalType = "terms" | "privacy" | "refund" | "shipping";

const LEGAL_TITLES: Record<LegalType, string> = {
  terms: "Terms & Conditions",
  privacy: "Privacy Policy",
  refund: "Refund Policy",
  shipping: "Shipping Policy",
};

const LEGAL_KEYS: Record<LegalType, keyof CMSTerms> = {
  terms: "termsAndConditions",
  privacy: "privacyPolicy",
  refund: "refundPolicy",
  shipping: "shippingPolicy",
};

export function LegalPage({ type }: { type: LegalType }) {
  const { data: cms, isLoading } = useCMSContent();

  const key = LEGAL_KEYS[type];
  const content = cms ? (cms.terms[key] as string | undefined) : undefined;
  const title = LEGAL_TITLES[type];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm border-b border-border p-4 flex items-center gap-3">
        <Link to="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-lg font-bold text-foreground">
          {title}
        </h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-3">
            {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((k) => (
              <Skeleton key={k} className="h-4 w-full" />
            ))}
          </div>
        ) : content ? (
          <div className="prose prose-sm max-w-none text-foreground">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
              {content}
            </p>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              {title} content will be added soon.
            </p>
          </div>
        )}
      </div>

      <footer className="px-4 py-6 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Nimbu Mirchi Nazar Battu
        </p>
      </footer>
    </div>
  );
}
