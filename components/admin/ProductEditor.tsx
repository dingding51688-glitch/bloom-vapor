"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Button, Input, Textarea } from "@/components/ui";
import { createProduct, ProductInputPayload, updateProduct, uploadImage, UploadAsset, WeightOptionInput } from "@/lib/admin-api";
import type { AdminProductRecord } from "@/lib/types";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, "") || "";

export type CollectionOption = {
  id: number;
  title: string;
};

type MediaAsset = {
  id: number;
  url: string;
  name?: string;
};

type WeightRow = {
  key: string;
  id?: number;
  label: string;
  price: string;
  unitPrice: string;
  featured: boolean;
};

type FormState = {
  title: string;
  slug: string;
  heroBadge: string;
  description: string;
  priceFrom: string;
  strain: string;
  thc: string;
  potency: string;
  origin: string;
  originFlag: string;
  collectionId: string;
  featuredImage: MediaAsset | null;
  gallery: MediaAsset[];
  weightOptions: WeightRow[];
};

const blankWeightRow = (): WeightRow => ({
  key: crypto.randomUUID(),
  label: "",
  price: "",
  unitPrice: "",
  featured: false
});

const mapMedia = (media?: { id: number; url: string; name?: string } | null): MediaAsset | null => {
  if (!media) return null;
  return { id: media.id, url: media.url, name: media.name };
};

const normalizeUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export type ProductEditorProps = {
  mode: "create" | "edit";
  initialProduct?: AdminProductRecord | null;
  collections: CollectionOption[];
};

export function ProductEditor({ mode, initialProduct, collections }: ProductEditorProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [slugLocked, setSlugLocked] = useState(!!initialProduct?.slug);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);
  const [form, setForm] = useState<FormState>(() => ({
    title: initialProduct?.title ?? "",
    slug: initialProduct?.slug ?? "",
    heroBadge: initialProduct?.heroBadge ?? "",
    description: initialProduct?.description ?? "",
    priceFrom: initialProduct?.priceFrom?.toString() ?? "",
    strain: initialProduct?.strain ?? "",
    thc: initialProduct?.thc ?? "",
    potency: initialProduct?.potency ?? "",
    origin: initialProduct?.origin ?? "",
    originFlag: initialProduct?.originFlag ?? "",
    collectionId: initialProduct?.collection?.id ? String(initialProduct.collection.id) : "",
    featuredImage: mapMedia(initialProduct?.featuredImage ?? null),
    gallery: initialProduct?.gallery
      ? ((initialProduct.gallery.map(mapMedia).filter(Boolean) as MediaAsset[]) || [])
      : [],
    weightOptions:
      initialProduct?.weightOptions?.map((option) => ({
        key: crypto.randomUUID(),
        id: option.id,
        label: option.label,
        price: option.price?.toString() ?? "",
        unitPrice: option.unitPrice ?? "",
        featured: !!option.featured
      })) ?? [blankWeightRow()]
  }));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [galleryUploadQueue, setGalleryUploadQueue] = useState(false);

  const requiredFields = useMemo(
    () => [
      { name: "title", label: "Title", value: form.title.trim() },
      { name: "priceFrom", label: "Price", value: form.priceFrom.trim() },
      { name: "featuredImage", label: "Featured image", value: form.featuredImage }
    ],
    [form.featuredImage, form.priceFrom, form.title]
  );

  const handleInput = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "title" && !slugLocked && mode === "create") {
      setForm((prev) => ({ ...prev, slug: slugify(value) }));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugLocked(true);
    setForm((prev) => ({ ...prev, slug: value }));
  };

  const updateWeightRow = (key: string, field: keyof WeightRow, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      weightOptions: prev.weightOptions.map((row) => {
        if (row.key !== key) {
          return field === "featured" && value ? { ...row, featured: false } : row;
        }
        if (field === "featured" && value) {
          return { ...row, featured: true };
        }
        return { ...row, [field]: value } as WeightRow;
      })
    }));
  };

  const addWeightRow = () => {
    setForm((prev) => ({ ...prev, weightOptions: [...prev.weightOptions, blankWeightRow()] }));
  };

  const removeWeightRow = (key: string) => {
    setForm((prev) => ({
      ...prev,
      weightOptions: prev.weightOptions.length === 1 ? prev.weightOptions : prev.weightOptions.filter((row) => row.key !== key)
    }));
  };

  const showToast = (kind: "success" | "error", message: string) => {
    setToast({ kind, message });
    setTimeout(() => setToast(null), 4200);
  };

  const handleFeaturedUpload = async (input: FileList | File | null) => {
    const file = input instanceof File ? input : input && input.length ? input[0] : null;
    if (!file) return;
    try {
      setIsUploadingCover(true);
      const [asset] = await uploadImage(file);
      if (asset) {
        setForm((prev) => ({
          ...prev,
          featuredImage: { id: asset.id, url: asset.url, name: asset.name }
        }));
      }
    } catch (error) {
      showToast("error", (error as Error).message || "Failed to upload image");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (input: FileList | null) => {
    if (!input || input.length === 0) return;
    const list = Array.from(input);
    try {
      setGalleryUploadQueue(true);
      const uploads: UploadAsset[] = [];
      for (const file of list) {
        const [asset] = await uploadImage(file);
        if (asset) uploads.push(asset);
      }
      if (uploads.length) {
        setForm((prev) => ({
          ...prev,
          gallery: [...prev.gallery, ...uploads.map((asset) => ({ id: asset.id, url: asset.url, name: asset.name }))]
        }));
      }
    } catch (error) {
      showToast("error", (error as Error).message || "Failed to upload gallery images");
    } finally {
      setGalleryUploadQueue(false);
    }
  };

  const removeGalleryItem = (assetId: number) => {
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((asset) => asset.id !== assetId)
    }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    requiredFields.forEach((field) => {
      if (!field.value) {
        errors[field.name] = `${field.label} is required`;
      }
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = (): ProductInputPayload => {
    const weights: WeightOptionInput[] = form.weightOptions
      .filter((row) => row.label.trim() && row.price.trim())
      .map((row) => ({
        id: row.id,
        label: row.label.trim(),
        price: Number(row.price),
        unitPrice: row.unitPrice.trim() || undefined,
        featured: row.featured
      }));

    return {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      heroBadge: form.heroBadge.trim() || undefined,
      description: form.description,
      priceFrom: Number(form.priceFrom),
      strain: form.strain.trim() || undefined,
      thc: form.thc.trim() || undefined,
      potency: form.potency.trim() || undefined,
      origin: form.origin.trim() || undefined,
      originFlag: form.originFlag.trim() || undefined,
      collection: form.collectionId ? Number(form.collectionId) : undefined,
      featuredImage: form.featuredImage!.id,
      gallery: form.gallery.map((asset) => asset.id),
      weightOptions: weights
    };
  };

  const submit = async (intent: "draft" | "publish") => {
    if (!validate()) {
      showToast("error", "Please fill the required fields");
      return;
    }
    try {
      setSubmitting(intent);
      const payload = buildPayload();
      const response =
        mode === "edit" && initialProduct
          ? await updateProduct(initialProduct.id, payload)
          : await createProduct(payload);

      const slug = response.data?.attributes?.slug || payload.slug || payload.title;
      showToast("success", intent === "draft" ? "Draft saved (Strapi auto-publishes)" : "Product published");
      setTimeout(() => router.push(`/products/${slug}`), 600);
    } catch (error) {
      showToast("error", (error as Error).message || "Failed to save product");
    } finally {
      setSubmitting(null);
    }
  };

  if (!token) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-[#080808] p-8 text-white">
        <h2 className="text-2xl font-semibold">Admin access required</h2>
        <p className="mt-2 text-white/70">Please login to continue.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {toast && (
        <div
          className={clsx(
            "fixed right-4 top-20 z-40 rounded-2xl px-5 py-3 text-sm shadow-cta",
            toast.kind === "success" ? "bg-emerald-500/90" : "bg-amber-600/90"
          )}
        >
          {toast.message}
        </div>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit("publish");
        }}
        className="flex-1 space-y-6 rounded-[32px] border border-white/10 bg-[#070707] p-6"
      >
        <header className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/60">
            {mode === "create" ? "Create product" : "Edit product"}
          </p>
          <h1 className="text-2xl font-semibold">Product details</h1>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title" required error={fieldErrors.title}>
            <Input value={form.title} onChange={(e) => handleInput("title", e.target.value)} placeholder="OG Kush 3.5g" />
          </FormField>
          <FormField label="Slug" description="Auto-generated from title" error={fieldErrors.slug}>
            <Input value={form.slug} onChange={(e) => handleSlugChange(slugify(e.target.value))} />
          </FormField>
          <FormField label="Hero badge">
            <Input value={form.heroBadge} onChange={(e) => handleInput("heroBadge", e.target.value)} placeholder="Limited drop" />
          </FormField>
          <FormField label="Strain">
            <Input value={form.strain} onChange={(e) => handleInput("strain", e.target.value)} placeholder="Hybrid" />
          </FormField>
          <FormField label="THC %">
            <Input value={form.thc} onChange={(e) => handleInput("thc", e.target.value)} placeholder="21%" />
          </FormField>
          <FormField label="Potency">
            <Input value={form.potency} onChange={(e) => handleInput("potency", e.target.value)} placeholder="Strong" />
          </FormField>
          <FormField label="Origin">
            <Input value={form.origin} onChange={(e) => handleInput("origin", e.target.value)} placeholder="San Francisco" />
          </FormField>
          <FormField label="Origin flag">
            <Input value={form.originFlag} onChange={(e) => handleInput("originFlag", e.target.value)} placeholder="🇺🇸" />
          </FormField>
          <FormField label="Price from" required error={fieldErrors.priceFrom}>
            <Input value={form.priceFrom} onChange={(e) => handleInput("priceFrom", e.target.value)} placeholder="45" type="number" step="0.01" />
          </FormField>
          <FormField label="Collection">
            <select
              value={form.collectionId}
              onChange={(e) => handleInput("collectionId", e.target.value)}
              className="h-11 w-full rounded-lg border border-night-700 bg-night-800/70 px-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-600"
            >
              <option value="">Unassigned</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.title}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Description">
          <Textarea value={form.description} onChange={(e) => handleInput("description", e.target.value)} placeholder="Story, terp notes, locker availability..." />
        </FormField>

        <section className="space-y-3">
          <p className="font-semibold">Featured image *</p>
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handleFeaturedUpload(event.dataTransfer.files);
            }}
            onPaste={(event) => {
              const file = event.clipboardData?.files?.[0];
              if (file) {
                handleFeaturedUpload(file);
              }
            }}
            className={clsx(
              "flex h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed text-sm text-white/70",
              fieldErrors.featuredImage ? "border-amber-500" : "border-white/15"
            )}
          >
            {form.featuredImage ? (
              <div className="flex w-full flex-col items-center gap-3">
                <Image
                  src={normalizeUrl(form.featuredImage.url)}
                  alt={form.featuredImage.name || form.title}
                  width={256}
                  height={256}
                  unoptimized
                  className="h-32 w-auto rounded-xl object-contain"
                />
                <Button variant="ghost" size="sm" type="button" onClick={() => setForm((prev) => ({ ...prev, featuredImage: null }))}>
                  Remove
                </Button>
              </div>
            ) : (
              <>
                <p>Drag & drop or paste an image</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleFeaturedUpload(event.target.files)}
                  className="mt-3 text-center text-xs"
                />
              </>
            )}
            {isUploadingCover && <p className="mt-2 text-xs text-white/60">Uploading…</p>}
          </div>
          {fieldErrors.featuredImage && <p className="text-xs text-amber-400">{fieldErrors.featuredImage}</p>}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Gallery</p>
            <label className="text-xs uppercase tracking-[0.2em] text-white/70">
              + Add images
              <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => handleGalleryUpload(event.target.files)} />
            </label>
          </div>
          <div className="flex flex-wrap gap-4">
            {form.gallery.map((asset) => (
              <div key={asset.id} className="relative">
                <Image
                  src={normalizeUrl(asset.url)}
                  alt={asset.name || "Gallery asset"}
                  width={96}
                  height={96}
                  unoptimized
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryItem(asset.id)}
                  className="absolute -right-2 -top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            {galleryUploadQueue && <span className="text-xs text-white/60">Uploading…</span>}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Weight options</p>
            <Button type="button" variant="secondary" size="sm" onClick={addWeightRow}>
              Add weight
            </Button>
          </div>
          <div className="space-y-3">
            {form.weightOptions.map((row) => (
              <div key={row.key} className="grid gap-3 rounded-2xl border border-white/10 p-4 sm:grid-cols-5">
                <Input
                  value={row.label}
                  onChange={(e) => updateWeightRow(row.key, "label", e.target.value)}
                  placeholder="3.5g"
                  className="sm:col-span-2"
                />
                <Input
                  type="number"
                  step="0.01"
                  value={row.price}
                  onChange={(e) => updateWeightRow(row.key, "price", e.target.value)}
                  placeholder="45"
                />
                <Input
                  value={row.unitPrice}
                  onChange={(e) => updateWeightRow(row.key, "unitPrice", e.target.value)}
                  placeholder="£12.85/g"
                />
                <label className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/70">
                  <input
                    type="checkbox"
                    checked={row.featured}
                    onChange={(e) => updateWeightRow(row.key, "featured", e.target.checked)}
                  />
                  Featured
                </label>
                {form.weightOptions.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeWeightRow(row.key)}>
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" disabled={submitting === "draft"} onClick={() => submit("draft")}>Save draft</Button>
          <Button type="submit" disabled={submitting === "publish"}>
            {mode === "create" ? "Publish product" : "Update product"}
          </Button>
          {submitting && <span className="text-sm text-white/70">{submitting === "draft" ? "Saving draft…" : "Publishing…"}</span>}
        </div>
      </form>

      <aside className="w-full max-w-sm space-y-5 rounded-[32px] border border-white/10 bg-[#060606] p-5 text-sm text-white/80">
        <h2 className="text-lg font-semibold">Summary</h2>
        <dl className="space-y-2">
          <SummaryRow label="Title" value={form.title || "—"} />
          <SummaryRow label="Slug" value={form.slug || "Auto"} />
          <SummaryRow label="Price" value={form.priceFrom ? `£${form.priceFrom}` : "—"} />
          <SummaryRow label="Collection" value={collections.find((c) => String(c.id) === form.collectionId)?.title || "Unassigned"} />
          <SummaryRow label="Weights" value={`${form.weightOptions.filter((row) => row.label && row.price).length} configured`} />
        </dl>
        <p className="text-xs text-white/60">
          Drafts currently publish immediately because Strapi’s Product type does not support draft/publish. The Save Draft button
          stores the latest payload but the product is still visible to the storefront.
        </p>
      </aside>
    </div>
  );
}

function FormField({
  label,
  description,
  required,
  error,
  children
}: {
  label: string;
  description?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-white">
      <span className="font-medium">
        {label}
        {required && <span className="text-amber-400"> *</span>}
      </span>
      {description && <span className="text-xs text-white/60">{description}</span>}
      {children}
      {error && <span className="text-xs text-amber-400">{error}</span>}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs text-white/70">
      <span className="uppercase tracking-[0.3em] text-white/50">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

export default ProductEditor;
