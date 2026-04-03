"use client";

import { forwardRef, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { toJpeg, toPng } from "html-to-image";
import QRCode from "qrcode.react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { StateMessage } from "@/components/StateMessage";
import { useAuth } from "@/components/providers/AuthProvider";
import { getReferralSummary, type ReferralSummary } from "@/lib/referral-api";
import { deriveTransferId } from "@/lib/wallet-utils";

const fallbackSummary: ReferralSummary = {
  code: "LOCKER25",
  link: "https://greenhub420.co.uk/invite?ref=LOCKER25",
  totalInvites: 0,
  activeLockers: 0,
  bonusEarned: 0,
  clicks: 0,
  clickPayoutTotal: 0,
  registrations: 0,
  topups: 0,
  conversionRate: 0,
  ctr: 0,
  impressions: 0,
  monthCommission: 0
};

const templates = {
  locker: {
    id: "locker",
    name: "Locker green (portrait)",
    badge: "Locker referral",
    background: "linear-gradient(180deg,#07130c 0%,#041009 100%)",
    accent: "#13a86b",
    text: "#ffffff"
  },
  night: {
    id: "night",
    name: "Night neon (landscape)",
    badge: "Night drop",
    background: "linear-gradient(135deg,#050505 0%,#0d0f1f 100%)",
    accent: "#7c5dff",
    text: "#f5f5ff"
  }
} as const;

const portrait = { width: 640, height: 910 };
const landscape = { width: 910, height: 640 };

export default function ReferralPosterPage() {
  const { token, profile } = useAuth();
  const transferId = deriveTransferId(profile);
  const { data, error } = useSWR(token ? "referral-summary" : null, getReferralSummary);
  const summary = error ? fallbackSummary : data || fallbackSummary;

  const code = summary.code || "LOCKER25";
  const inviteUrl = summary.link || `https://greenhub420.co.uk/invite?ref=${code}`;

  const [templateId, setTemplateId] = useState<keyof typeof templates>("locker");
  const [layout, setLayout] = useState<"portrait" | "landscape">("portrait");
  const [headline, setHeadline] = useState("Order lockers. Earn cash.");
  const [subline, setSubline] = useState("£0.30 per click + 10% lifetime share");
  const [footerNote, setFooterNote] = useState("Scan to claim locker priority. Use code for extra perks.");
  const [accent, setAccent] = useState(templates["locker"].accent);
  const [showAvatar, setShowAvatar] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const posterRef = useRef<HTMLDivElement>(null);

  if (!token) {
    return (
      <section className="px-4 py-10">
        <StateMessage
          title="Please log in"
          body="Poster generator customises with your invite link and Transfer ID."
          actionLabel="Go to login"
          onAction={() => (window.location.href = "/login")}
        />
      </section>
    );
  }

  const template = templates[templateId];
  const dimensions = layout === "portrait" ? portrait : landscape;

  const handleDownload = async (format: "png" | "jpeg") => {
    if (!posterRef.current) return;
    try {
      const node = posterRef.current;
      const options = { cacheBust: true, pixelRatio: 2, backgroundColor: template.background.includes("linear-gradient") ? undefined : template.background };
      const dataUrl =
        format === "png"
          ? await toPng(node, options)
          : await toJpeg(node, { ...options, quality: 0.95 });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `greenhub-invite-${code}.${format}`;
      link.click();
      setDownloadToast(`Poster saved (${format.toUpperCase()})`);
      setTimeout(() => setDownloadToast(null), 2500);
    } catch (err) {
      console.error(err);
      setDownloadToast("Export failed — try again");
      setTimeout(() => setDownloadToast(null), 2500);
    }
  };

  const shareText = encodeURIComponent(`Join lockers with code ${code}`);
  const shareHref = `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${shareText}`;

  return (
    <section className="space-y-8 px-4 py-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">Referral toolkit</p>
        <h1 className="text-3xl font-semibold text-white">Generate a shareable poster</h1>
        <p className="text-sm text-white/70">Drop your invite link + Transfer ID into eye-catching artwork ready for Telegram, Discord, or Instagram stories.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-5 rounded-[32px] border border-white/10 bg-card p-6 shadow-card">
          <TemplateControls
            templateId={templateId}
            layout={layout}
            accent={accent}
            setTemplateId={(id) => {
              setTemplateId(id);
              setAccent(templates[id].accent);
              setLayout(id === "locker" ? "portrait" : "landscape");
            }}
            setLayout={setLayout}
            setAccent={setAccent}
            showAvatar={showAvatar}
            setShowAvatar={setShowAvatar}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-white">
              <span className="font-medium">Headline</span>
              <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Order lockers. Earn cash." />
            </label>
            <label className="space-y-1 text-sm text-white">
              <span className="font-medium">Subheading</span>
              <Input value={subline} onChange={(e) => setSubline(e.target.value)} placeholder="£0.30 per click + 10% lifetime share" />
            </label>
            <label className="space-y-1 text-sm text-white sm:col-span-2">
              <span className="font-medium">Footer note</span>
              <Textarea value={footerNote} onChange={(e) => setFooterNote(e.target.value)} placeholder="Scan to claim locker priority..." />
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => handleDownload("png")}>Download PNG</Button>
            <Button variant="secondary" onClick={() => handleDownload("jpeg")}>
              Download JPEG
            </Button>
            <Button variant="ghost" asChild>
              <a href={shareHref} target="_blank" rel="noreferrer">
                Share to Telegram
              </a>
            </Button>
            {downloadToast && <span className="text-xs text-emerald-300">{downloadToast}</span>}
          </div>
        </div>

        <div className="space-y-5 rounded-[32px] border border-white/10 bg-card p-6 text-sm text-white/70">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">Card preview</p>
          <p>Invite link: <span className="font-mono text-white">{inviteUrl}</span></p>
          <p>Transfer ID: <span className="font-mono text-white">{transferId || "—"}</span></p>
          <p>Tip: export PNG for Instagram Stories, JPEG for chat apps.</p>
          <Link href="/referral" className="text-sm text-emerald-300 underline">
            Back to referral dashboard
          </Link>
        </div>
      </div>

      <div className="overflow-auto">
        <div className="flex justify-center">
          <PosterPreview
            ref={posterRef}
            template={template}
            layout={layout}
            dimensions={dimensions}
            accent={accent}
            headline={headline}
            subline={subline}
            footerNote={footerNote}
            inviteUrl={inviteUrl}
            transferId={transferId}
            code={code}
            showAvatar={showAvatar}
          />
        </div>
      </div>
    </section>
  );
}

type TemplateControlsProps = {
  templateId: keyof typeof templates;
  layout: "portrait" | "landscape";
  accent: string;
  showAvatar: boolean;
  setTemplateId: (id: keyof typeof templates) => void;
  setLayout: (layout: "portrait" | "landscape") => void;
  setAccent: (value: string) => void;
  setShowAvatar: (value: boolean) => void;
};

function TemplateControls({ templateId, layout, accent, setTemplateId, setLayout, setAccent, showAvatar, setShowAvatar }: TemplateControlsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">Templates</p>
        <div className="grid gap-3">
          {(Object.values(templates) as typeof templates["locker"][]).map((tpl) => (
            <button
              key={tpl.id}
              className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${templateId === tpl.id ? "border-white bg-white/10 text-white" : "border-white/10 text-white/70 hover:border-white/30"}`}
              onClick={() => setTemplateId(tpl.id)}
            >
              <p className="font-semibold">{tpl.name}</p>
              <p className="text-xs text-white/50">{tpl.badge}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <label className="flex flex-col gap-1 text-sm text-white">
          <span className="font-medium">Layout</span>
          <select
            value={layout}
            onChange={(e) => setLayout(e.target.value as "portrait" | "landscape")}
            className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-white"
          >
            <option value="portrait" className="bg-black">Portrait</option>
            <option value="landscape" className="bg-black">Landscape</option>
          </select>
        </label>
        <label className="flex items-center justify-between text-sm text-white/80">
          <span>Accent colour</span>
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-8 w-14 rounded" />
        </label>
        <label className="flex items-center gap-2 text-sm text-white/80">
          <input type="checkbox" checked={showAvatar} onChange={(e) => setShowAvatar(e.target.checked)} />
          Show avatar placeholder
        </label>
      </div>
    </div>
  );
}

type PosterPreviewProps = {
  template: typeof templates["locker"];
  layout: "portrait" | "landscape";
  dimensions: { width: number; height: number };
  accent: string;
  headline: string;
  subline: string;
  footerNote: string;
  inviteUrl: string;
  transferId?: string | null;
  code: string;
  showAvatar: boolean;
};

const PosterPreview = forwardRef<HTMLDivElement, PosterPreviewProps>(
  ({ template, layout, dimensions, accent, headline, subline, footerNote, inviteUrl, transferId, code, showAvatar }, ref) => {
    return (
      <div
        ref={ref}
        style={{ width: dimensions.width, height: dimensions.height, background: template.background, color: template.text }}
        className="relative rounded-[48px] border border-white/10 p-10 font-[600] text-white"
      >
        <div className="flex flex-col gap-4">
        <span className="text-xs uppercase tracking-[0.5em]" style={{ color: accent }}>
          {template.badge}
        </span>
        <h2 className="text-4xl font-semibold leading-tight" style={{ lineHeight: 1.2 }}>
          {headline || "Share lockers. Earn cash."}
        </h2>
        <p className="text-lg font-normal text-white/80">{subline || "£0.30 per click + 10% lifetime."}</p>
        <div className="flex flex-wrap gap-3 text-sm text-white/80">
          <span className="rounded-full border border-white/20 px-3 py-1">Use code {code}</span>
          {transferId && <span className="rounded-full border border-white/20 px-3 py-1">Transfer ID {transferId}</span>}
        </div>
        {showAvatar && (
          <div className="mt-4 flex items-center gap-3">
            <div className="h-14 w-14 rounded-full border border-white/20 bg-white/10" />
            <div>
              <p className="text-sm text-white/70">Locker concierge</p>
              <p className="text-xs text-white/50">Scan QR to start</p>
            </div>
          </div>
        )}
        <div className={`mt-8 flex ${layout === "portrait" ? "flex-col gap-6" : "flex-row gap-6"}`}>
          <div className="space-y-2 text-sm text-white/70">
            <p>Scan or visit:</p>
            <p className="break-all font-mono text-white">{inviteUrl}</p>
            <p className="text-xs text-white/50">{footerNote}</p>
          </div>
          <div className="ml-auto rounded-3xl border border-white/20 bg-white/5 p-4">
            <QRCode value={inviteUrl} size={layout === "portrait" ? 150 : 130} bgColor="transparent" fgColor={template.text} includeMargin={false} level="H" />
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-6 bottom-6 flex justify-between text-xs uppercase tracking-[0.4em] text-white/40">
        <span>GreenHub lockers</span>
        <span>#Invite-{code}</span>
      </div>
    </div>
  );
});

PosterPreview.displayName = "PosterPreview";
