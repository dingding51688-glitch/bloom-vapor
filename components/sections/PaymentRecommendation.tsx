import { Button, Card } from "@/components/ui";
import { paymentRecommendations, PaymentPlan } from "@/data/fixtures/marketing";

export type PaymentRecommendationProps = {
  recommendation?: PaymentPlan;
  secondary?: PaymentPlan[];
  footnote?: string;
};

const PlanCard = ({ plan, featured }: { plan: PaymentPlan; featured?: boolean }) => (
  <Card
    padding="lg"
    tone={featured ? "green" : "neutral"}
    className={featured ? "shadow-card" : "border-white/15 bg-[linear-gradient(150deg,#080808,#050505)]"}
  >
    {plan.badge && (
      <span className="inline-flex items-center rounded-pill border border-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-[rgba(255,255,255,0.7)]">
        {plan.badge}
      </span>
    )}
    <div className="mt-4 flex items-baseline gap-2 text-white">
      <span className="text-3xl font-semibold">{plan.price}</span>
      <span className="text-sm text-[rgba(255,255,255,0.6)]">{plan.frequency}</span>
    </div>
    <h3 className="mt-2 text-xl font-semibold text-white">{plan.title}</h3>
    <p className="mt-2 text-sm text-[rgba(255,255,255,0.75)]">{plan.description}</p>
    <ul className="mt-4 space-y-2 text-sm text-[rgba(255,255,255,0.75)]">
      {plan.features.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/60" aria-hidden="true" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <Button asChild fullWidth size="md" variant={featured ? "primary" : "secondary"} className="mt-6">
      <a href={plan.cta.href}>{plan.cta.label}</a>
    </Button>
  </Card>
);

export function PaymentRecommendation(props: Partial<PaymentRecommendationProps>) {
  const content = { ...paymentRecommendations, ...props } as PaymentRecommendationProps;

  return (
    <section className="space-y-6 rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,#080808,#050505)] px-6 py-10 shadow-card sm:px-12">
      <header className="flex flex-col gap-2 text-left">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[rgba(255,255,255,0.6)]">
          Payment
        </p>
        <h2 className="text-[28px] font-semibold text-white sm:text-[32px]">
          Recommended way to pay
        </h2>
        <p className="text-sm text-[rgba(255,255,255,0.75)]">
          Choose the plan that matches how often you visit the lockers. Switch or cancel anytime.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {content.recommendation && (
          <div className="lg:col-span-2">
            <PlanCard plan={content.recommendation} featured />
          </div>
        )}
        <div className="space-y-4">
          {content.secondary?.map((plan) => (
            <PlanCard key={plan.title} plan={plan} />
          ))}
        </div>
      </div>
      {content.footnote && (
        <p className="text-xs text-[rgba(255,255,255,0.6)]">{content.footnote}</p>
      )}
    </section>
  );
}

export default PaymentRecommendation;
