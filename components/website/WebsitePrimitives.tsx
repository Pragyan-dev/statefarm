"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function WebsiteSectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`web-card ${className}`}>
      {eyebrow ? <p className="web-kicker">{eyebrow}</p> : null}
      <h1 className="mt-3 max-w-[14ch] font-display text-4xl leading-none text-[var(--color-ink)] lg:text-6xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 max-w-[60ch] text-base leading-7 text-[var(--color-muted)] lg:text-lg">
          {description}
        </p>
      ) : null}
      {actions ? <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}

export function WebsiteRailCard({
  eyebrow,
  title,
  description,
  children,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`web-rail-card ${className}`}>
      {eyebrow ? <p className="web-kicker">{eyebrow}</p> : null}
      <h2 className="mt-2 text-[1.75rem] leading-tight font-display text-[var(--color-ink)]">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{description}</p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

export function WebsiteSectionPanel({
  eyebrow,
  title,
  description,
  children,
  className = "",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`web-section-panel ${className}`}>
      {eyebrow ? <p className="web-kicker">{eyebrow}</p> : null}
      {title ? (
        <h2 className="mt-2 text-3xl leading-tight font-display text-[var(--color-ink)]">{title}</h2>
      ) : null}
      {description ? (
        <p className="mt-3 max-w-[60ch] text-base leading-7 text-[var(--color-muted)]">{description}</p>
      ) : null}
      <div className={title || description || eyebrow ? "mt-6" : ""}>{children}</div>
    </section>
  );
}

export function WebsiteStatRow({
  label,
  value,
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`web-stat-row ${className}`}>
      <span>{label}</span>
      <span className="text-right font-semibold text-[var(--color-ink)]">{value}</span>
    </div>
  );
}

export function WebsiteActionLink({
  href,
  onClick,
  title,
  description,
  className = "",
}: {
  href?: string;
  onClick?: () => void;
  title: string;
  description: string;
  className?: string;
}) {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`web-action-row w-full text-left ${className}`}>
        <div>
          <p className="font-semibold text-[var(--color-ink)]">{title}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">{description}</p>
        </div>
        <ArrowRight className="size-4 shrink-0 text-[var(--color-accent)]" />
      </button>
    );
  }

  return (
    <Link href={href ?? "#"} className={`web-action-row ${className}`}>
      <div>
        <p className="font-semibold text-[var(--color-ink)]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">{description}</p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-[var(--color-accent)]" />
    </Link>
  );
}
