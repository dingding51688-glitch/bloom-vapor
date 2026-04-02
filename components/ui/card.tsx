import clsx from "clsx";
import { HTMLAttributes, ReactNode } from "react";

export type CardVariant = "elevated" | "outlined";
export type CardTone = "neutral" | "green" | "orange";

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: CardVariant;
  tone?: CardTone;
  padding?: "sm" | "md" | "lg";
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
}

const paddingMap = {
  sm: "p-5",
  md: "p-8",
  lg: "p-10"
};

const toneMap: Record<CardTone, string> = {
  neutral: "bg-[linear-gradient(180deg,#0a0a0a,#050505)]",
  green: "bg-card-green",
  orange: "bg-card-orange"
};

const variantMap: Record<CardVariant, string> = {
  elevated: "border border-white/10 shadow-card",
  outlined: "border border-white/15"
};

export function Card({
  className,
  variant = "elevated",
  tone = "neutral",
  padding = "md",
  title,
  description,
  children,
  footer,
  ...rest
}: CardProps) {
  return (
    <section
      className={clsx(
        "rounded-[32px] text-[rgba(255,255,255,0.85)] backdrop-blur-sm",
        toneMap[tone],
        variantMap[variant],
        paddingMap[padding],
        className
      )}
      {...rest}
    >
      {(title || description) && (
        <header className="mb-4 flex flex-col gap-1">
          {title && <h3 className="text-white font-semibold text-lg md:text-xl">{title}</h3>}
          {description && <p className="text-sm text-[rgba(255,255,255,0.7)]">{description}</p>}
        </header>
      )}
      {children && <div className="space-y-3 text-sm text-[rgba(255,255,255,0.75)]">{children}</div>}
      {footer && <footer className="mt-6 border-t border-white/10 pt-4 text-xs text-[rgba(255,255,255,0.6)]">{footer}</footer>}
    </section>
  );
}

export default Card;
