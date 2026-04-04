"use client";

import Link from "next/link";
import { ArrowRight, BadgeAlert, ShieldCheck, Sparkles, Upload, WalletCards } from "lucide-react";

import { ProgressChecklist, type ChecklistItem } from "@/components/ProgressChecklist";
import { ReadAloud } from "@/components/ReadAloud";
import { useAutoRead } from "@/hooks/useAutoRead";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getProfileHeadline } from "@/lib/content";

function getChecklistItems(profile: {
  visaStatus: string;
  drives: boolean;
  rents: boolean;
}): ChecklistItem[] {
  const items: ChecklistItem[] = [
    {
      id: "bank-account",
      label: "Open a bank account",
      detail: "Use passport + visa paperwork even if you do not have an SSN yet.",
    },
    {
      id: "state-id",
      label: "Start your state ID process",
      detail: "Match your address documents with your first lease or school letter.",
    },
  ];

  if (profile.drives) {
    items.push({
      id: "auto-insurance",
      label: "Get auto insurance",
      detail: "Most states do not require an SSN to buy a policy.",
    });
  }

  if (profile.rents) {
    items.push({
      id: "renters-insurance",
      label: "Get renter's insurance",
      detail: "Protect your laptop, documents, and first apartment essentials.",
    });
  }

  items.push({
    id: "visa-checklist",
    label: `Follow your ${profile.visaStatus} visa checklist`,
    detail: "Keep your first 30 days structured so paperwork does not pile up.",
  });

  return items;
}

const cards = [
  {
    href: "/simulate",
    title: "Shock simulator",
    description: "See the dollar gap between being covered and being exposed.",
    icon: Sparkles,
  },
  {
    href: "/coverage",
    title: "Coverage finder",
    description: "Match your ZIP code to renter's pricing, state rules, and disaster risk.",
    icon: ShieldCheck,
  },
  {
    href: "/decode",
    title: "Policy decoder",
    description: "Upload a policy photo or PDF and translate it into plain English or Spanish.",
    icon: Upload,
  },
  {
    href: "/afford",
    title: "Budget check",
    description: "Pressure-test the monthly cost of staying protected.",
    icon: WalletCards,
  },
  {
    href: "/guide",
    title: "Visa guide",
    description: "See the steps most people miss in the first 30 days.",
    icon: ArrowRight,
  },
  {
    href: "/scam",
    title: "Scam checker",
    description: "Paste any suspicious offer and get a fast read on the red flags.",
    icon: BadgeAlert,
  },
];

export default function DashboardPage() {
  const [profile, setProfile, isReady] = useUserProfile();
  const headline = getProfileHeadline(profile, "en");
  useAutoRead(headline);

  if (!isReady) {
    return <div className="py-10 text-sm text-[var(--color-muted)]">Loading dashboard...</div>;
  }

  const checklistItems = getChecklistItems(profile);
  const ssnMessage = `In ${profile.state}, you can usually buy auto insurance without an SSN.`;

  return (
    <div className="py-6">
      <section className="panel-card hero-ambient overflow-hidden">
        <p className="eyebrow">Personal dashboard</p>
        <h1 className="font-display text-4xl text-[var(--color-ink)]">{headline}</h1>
        <p className="mt-4 max-w-[34ch] text-base text-[var(--color-muted)]">
          Built for your first 24 months in the US. Start with the highest-risk gap first, then
          move through the checklist.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/simulate"
            className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-[var(--color-paper)]"
          >
            Run the simulator
          </Link>
          <ReadAloud text={`${headline} ${ssnMessage}`} />
        </div>
      </section>

      <section className="panel-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Fast fact</p>
            <h2 className="font-display text-2xl text-[var(--color-ink)]">
              You do not need an SSN to start protecting yourself.
            </h2>
          </div>
          <BadgeAlert className="mt-1 size-6 text-[var(--color-accent)]" />
        </div>
        <p className="mt-4 text-base text-[var(--color-muted)]">{ssnMessage}</p>
      </section>

      <ProgressChecklist items={checklistItems} profile={profile} onProfileChange={setProfile} />

      <section className="panel-card">
        <p className="eyebrow">Explore the toolkit</p>
        <div className="mt-5 grid gap-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4 transition hover:border-[var(--color-accent)] hover:bg-[var(--color-paper)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[var(--color-ink)]">{card.title}</h3>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">{card.description}</p>
                  </div>
                  <Icon className="size-5 text-[var(--color-accent)]" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
