import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Megaphone, Save, Search } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { CMSSEO, CMSTagline, CMSTerms } from "../../backend.d";
import { useCMSContent, useUpdateCMSContent } from "../../hooks/useQueries";

type CMSFormState = {
  tagline: CMSTagline;
  terms: CMSTerms;
  seo: CMSSEO;
};

const defaultForm: CMSFormState = {
  tagline: {
    tagline: "",
    popupText: "",
    popupActive: false,
    festivalOffer: "",
  },
  terms: {
    termsAndConditions: "",
    privacyPolicy: "",
    refundPolicy: "",
    shippingPolicy: "",
  },
  seo: {
    seoTitle: "",
    seoMeta: "",
  },
};

export function CMSPage() {
  const { data: cms, isLoading } = useCMSContent();
  const updateCMS = useUpdateCMSContent();

  const [form, setForm] = useState<CMSFormState>(defaultForm);

  useEffect(() => {
    if (cms) {
      setForm({
        tagline: cms.tagline,
        terms: cms.terms,
        seo: cms.seo,
      });
    }
  }, [cms]);

  const handleSave = async () => {
    try {
      await updateCMS.mutateAsync({
        tagline: form.tagline,
        terms: form.terms,
        seo: form.seo,
      });
      toast.success("CMS content updated! 🙏");
    } catch {
      toast.error("Failed to update CMS content");
    }
  };

  const updateTagline = (field: keyof CMSTagline, value: string | boolean) => {
    setForm((f) => ({ ...f, tagline: { ...f.tagline, [field]: value } }));
  };

  const updateTerms = (field: keyof CMSTerms, value: string) => {
    setForm((f) => ({ ...f, terms: { ...f.terms, [field]: value } }));
  };

  const updateSEO = (field: keyof CMSSEO, value: string) => {
    setForm((f) => ({ ...f, seo: { ...f.seo, [field]: value } }));
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 p-4">
        {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
          <Skeleton key={k} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            CMS Content
          </h1>
          <p className="text-muted-foreground text-sm">
            Edit website content and legal pages
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateCMS.isPending}
          className="gold-gradient text-foreground border-0 font-semibold"
        >
          {updateCMS.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save All
        </Button>
      </motion.div>

      <Tabs defaultValue="content">
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="content" className="flex-1">
            <Megaphone className="h-3.5 w-3.5 mr-1.5" />
            Content
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex-1">
            <Search className="h-3.5 w-3.5 mr-1.5" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex-1">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Legal
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-5">
          <div className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-4">
            <h2 className="font-semibold text-foreground">Homepage</h2>

            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={form.tagline.tagline}
                onChange={(e) => updateTagline("tagline", e.target.value)}
                placeholder="Har Saturday, Nazar Hatao! 🍋🌿"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-0.5">
                Displayed as the hero heading
              </p>
            </div>

            <div>
              <Label htmlFor="festival-offer">Festival Offer Banner</Label>
              <Input
                id="festival-offer"
                value={form.tagline.festivalOffer}
                onChange={(e) => updateTagline("festivalOffer", e.target.value)}
                placeholder="Diwali Special: 20% off on all products!"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-0.5">
                Leave empty to hide the banner
              </p>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-4">
            <h2 className="font-semibold text-foreground">
              Popup Announcement
            </h2>

            <div className="flex items-center gap-3">
              <Switch
                id="popup-active"
                checked={form.tagline.popupActive}
                onCheckedChange={(v) => updateTagline("popupActive", v)}
              />
              <Label htmlFor="popup-active">Show popup on homepage</Label>
            </div>

            <div>
              <Label htmlFor="popup-text">Popup Text</Label>
              <Textarea
                id="popup-text"
                value={form.tagline.popupText}
                onChange={(e) => updateTagline("popupText", e.target.value)}
                placeholder="Special announcement for your customers..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-4">
            <h2 className="font-semibold text-foreground">SEO Settings</h2>

            <div>
              <Label htmlFor="seo-title">Page Title</Label>
              <Input
                id="seo-title"
                value={form.seo.seoTitle}
                onChange={(e) => updateSEO("seoTitle", e.target.value)}
                placeholder="Nimbu Mirchi Nazar Battu — Traditional Protection"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="seo-meta">Meta Description</Label>
              <Textarea
                id="seo-meta"
                value={form.seo.seoMeta}
                onChange={(e) => updateSEO("seoMeta", e.target.value)}
                placeholder="Handcrafted Nazar Battu delivered every Saturday..."
                className="mt-1"
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground mt-0.5">
                {form.seo.seoMeta.length}/160 characters
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Legal Tab */}
        <TabsContent value="legal" className="space-y-4">
          {(
            [
              { key: "termsAndConditions", label: "Terms & Conditions" },
              { key: "privacyPolicy", label: "Privacy Policy" },
              { key: "refundPolicy", label: "Refund Policy" },
              { key: "shippingPolicy", label: "Shipping Policy" },
            ] as { key: keyof CMSTerms; label: string }[]
          ).map(({ key, label }) => (
            <div
              key={key}
              className="bg-card rounded-2xl border border-border p-5 shadow-card"
            >
              <Label htmlFor={key}>{label}</Label>
              <Textarea
                id={key}
                value={form.terms[key]}
                onChange={(e) => updateTerms(key, e.target.value)}
                placeholder={`Enter ${label.toLowerCase()}...`}
                className="mt-1"
                rows={8}
              />
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Save button at bottom */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateCMS.isPending}
          className="gold-gradient text-foreground border-0 font-semibold"
        >
          {updateCMS.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save All Changes
        </Button>
      </div>
    </div>
  );
}
