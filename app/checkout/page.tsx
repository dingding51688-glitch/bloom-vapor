"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/providers/AuthProvider";
import { StateMessage } from "@/components/StateMessage";
import { Skeleton } from "@/components/Skeleton";
import Button from "@/components/ui/button";
import { swrFetcher } from "@/lib/api";
import type { ProductsResponse } from "@/lib/types";
import { createOrder } from "@/lib/orders-api";
import { getStoredReferralCode } from "@/lib/referral-tracking";

const currency = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

const formSchema = z.object({
  lockerPostcode: z.string().min(4, "Enter locker postcode"),
  pickupWindow: z.string().min(3, "Provide pickup window").optional(),
  contactName: z.string().min(2, "Name required"),
  contactPhone: z.string().min(7, "Phone required"),
  telegramHandle: z.string().optional(),
  paymentOption: z.enum(["wallet", "nowpayments", "locker"])
});

type CheckoutFormValues = z.infer<typeof formSchema>;

export default function CheckoutPage() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("product");
  const presetWeight = searchParams.get("weight");
  const presetQty = Math.max(1, Number(searchParams.get("qty") || "1"));
  const [quantity, setQuantity] = useState(presetQty);
  const [step, setStep] = useState(1);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: productData, error: productError } = useSWR<ProductsResponse>(
    slug ? `/api/products?filters[slug][$eq]=${slug}&populate[weightOptions]=*` : null,
    swrFetcher
  );
  const product = productData?.data?.[0];

  const weightOptions = useMemo(() => product?.weightOptions || [], [product]);
  const [selectedWeight, setSelectedWeight] = useState<string | null>(presetWeight || null);

  useEffect(() => {
    if (!selectedWeight && weightOptions.length > 0) {
      setSelectedWeight(weightOptions[0].label);
    }
  }, [weightOptions, selectedWeight]);

  const selectedOption = useMemo(
    () => weightOptions.find((option) => option.label === selectedWeight) || weightOptions[0],
    [weightOptions, selectedWeight]
  );

  const unitPrice = selectedOption?.price ?? product?.priceFrom ?? 0;
  const cartTotal = unitPrice * quantity;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lockerPostcode: "",
      pickupWindow: "",
      contactName: "",
      contactPhone: "",
      telegramHandle: "",
      paymentOption: "wallet"
    }
  });

  const fieldsPerStep: Record<number, (keyof CheckoutFormValues)[]> = {
    1: ["lockerPostcode", "pickupWindow"],
    2: ["contactName", "contactPhone", "telegramHandle"],
    3: ["paymentOption"]
  };

  const goNext = async () => {
    const fields = fieldsPerStep[step];
    const valid = await form.trigger(fields);
    if (!valid) return;
    setStep((prev) => Math.min(3, prev + 1));
  };

  const goPrev = () => setStep((prev) => Math.max(1, prev - 1));

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!product || !selectedOption) {
      setAlert({ type: "error", message: "Missing product selection. Return to product page." });
      return;
    }
    setSubmitting(true);
    setAlert(null);
    try {
      const referralCode = getStoredReferralCode();
      const payload = {
        items: [
          {
            productId: product.id,
            quantity,
            unitPrice,
            weight: selectedOption.label
          }
        ],
        lockerPostcode: values.lockerPostcode,
        pickupWindow: values.pickupWindow,
        contactName: values.contactName,
        contactPhone: values.contactPhone,
        telegramHandle: values.telegramHandle,
        paymentOption: values.paymentOption,
        referralCode: referralCode || undefined
      };
      const response = await createOrder(payload);
      setAlert({ type: "success", message: `Order ${response.order.reference} created.` });
      router.push(`/orders/${response.order.reference}`);
    } catch (error: any) {
      setAlert({ type: "error", message: error?.message || "Unable to create order" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <StateMessage
        title="Please sign in"
        body="Log in to select lockers and place orders."
        actionLabel="Go to login"
        onAction={() => router.push("/login")}
      />
    );
  }

  if (!slug) {
    return (
      <StateMessage
        variant="empty"
        title="No product selected"
        body="Start from the product detail page to pick a weight before checkout."
        actionLabel="Browse menu"
        onAction={() => router.push("/products")}
      />
    );
  }

  const loadingProduct = !product && !productError;

  return (
    <section className="space-y-6">
      {alert && (
        <div
          className={`rounded-3xl border px-4 py-3 text-sm ${
            alert.type === "success"
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
              : "border-red-400/40 bg-red-400/10 text-red-100"
          }`}
        >
          {alert.message}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs uppercase tracking-[0.35em] text-white/50">
        {["Locker", "Contact", "Payment"].map((label, index) => {
          const idx = index + 1;
          const isActive = step === idx;
          const isCompleted = step > idx;
          return (
            <div key={label} className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                  isCompleted ? "border-emerald-400 text-emerald-200" : isActive ? "border-white text-white" : "border-white/30 text-white/50"
                }`}
              >
                {idx}
              </span>
              <span className={isActive ? "text-white" : "text-white/50"}>{label}</span>
              {idx < 3 && <div className="h-px w-10 bg-white/20" />}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4 rounded-[40px] border border-white/10 bg-night-950/70 p-6">
          {step === 1 && (
            <StepCard title="Locker selection" body="Tell concierge where you want to collect.">
              <FormField label="Locker postcode" error={form.formState.errors.lockerPostcode?.message}>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="BT1 1AA"
                  {...form.register("lockerPostcode")}
                />
              </FormField>
              <FormField label="Pickup window" error={form.formState.errors.pickupWindow?.message}>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Tonight 20:00-22:00"
                  {...form.register("pickupWindow")}
                />
              </FormField>
            </StepCard>
          )}

          {step === 2 && (
            <StepCard title="Contact & billing" body="Concierge needs one contact method for locker support.">
              <FormField label="Full name" error={form.formState.errors.contactName?.message}>
                <input type="text" className={inputClass} placeholder="Jane Doe" {...form.register("contactName")} />
              </FormField>
              <FormField label="Phone" error={form.formState.errors.contactPhone?.message}>
                <input type="tel" className={inputClass} placeholder="+44 7700 900000" {...form.register("contactPhone")} />
              </FormField>
              <FormField label="Telegram handle" error={form.formState.errors.telegramHandle?.message}>
                <input type="text" className={inputClass} placeholder="@greenhub_member" {...form.register("telegramHandle")} />
              </FormField>
            </StepCard>
          )}

          {step === 3 && (
            <StepCard title="Payment" body="Choose how you want to settle this drop.">
              <div className="space-y-3">
                {[
                  { value: "wallet", label: "Wallet balance" },
                  { value: "nowpayments", label: "NowPayments (USDT)" },
                  { value: "locker", label: "Locker COD" }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-3xl border px-4 py-3 ${
                      form.watch("paymentOption") === option.value ? "border-white text-white" : "border-white/10 text-white/70"
                    }`}
                  >
                    <input type="radio" value={option.value} {...form.register("paymentOption")} />
                    {option.label}
                  </label>
                ))}
              </div>
            </StepCard>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <Button type="button" variant="ghost" onClick={goPrev} className="flex-1">
                Back
              </Button>
            )}
            {step < 3 && (
              <Button type="button" onClick={goNext} className="flex-1">
                Continue
              </Button>
            )}
            {step === 3 && (
              <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={submitting} className="flex-1">
                {submitting ? "Submitting…" : "Place order"}
              </Button>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[32px] border border-white/10 bg-night-950/60 p-5">
            <h3 className="text-lg font-semibold text-white">Order summary</h3>
            {loadingProduct ? (
              <div className="mt-4 space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-32" />
              </div>
            ) : product ? (
              <div className="mt-4 space-y-3 text-sm text-white/70">
                <p className="text-white">{product.title}</p>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Weight</span>
                  <select
                    className="rounded-2xl border border-white/15 bg-transparent px-3 py-1 text-white"
                    value={selectedWeight ?? ""}
                    onChange={(event) => setSelectedWeight(event.target.value)}
                  >
                    {weightOptions.map((option) => (
                      <option key={option.id} value={option.label} className="bg-night-900 text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Quantity</span>
                  <input
                    type="number"
                    min={1}
                    className="w-20 rounded-2xl border border-white/15 bg-transparent px-2 py-1 text-center text-white"
                    value={quantity}
                    onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Unit price</span>
                  <span className="text-white">{currency.format(unitPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold text-white">
                  <span>Total</span>
                  <span>{currency.format(cartTotal)}</span>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-red-300">Unable to load product. Return to the menu.</p>
            )}
          </div>
          <div className="rounded-[32px] border border-white/10 bg-night-950/60 p-5 text-sm text-white/70">
            <p className="font-semibold text-white">Need help?</p>
            <p className="mt-1">Visit the support hub for locker swaps, payment escalations, or concierge chat links. First-time locker user? Read the onboarding guide.</p>
            <div className="mt-3 space-y-2">
              <Button asChild variant="ghost" className="w-full">
                <a href="/support">Open support hub</a>
              </Button>
              <Button asChild variant="secondary" className="w-full">
                <a href="/guide/locker">Locker onboarding guide</a>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function StepCard({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-night-900/60 p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">{title}</p>
      <p className="text-sm text-white/60">{body}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs uppercase tracking-[0.3em] text-white/40">
      {label}
      <div className="mt-1 space-y-1">
        {children}
        {error && <p className="text-xs text-red-300">{error}</p>}
      </div>
    </label>
  );
}

const inputClass = "w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40";
