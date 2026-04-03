import { lockerFlow, LockerStep } from "@/data/fixtures/marketing";

export type LockerTip = {
  label: string;
  content: string;
};

export type HowItWorksLockerProps = {
  title?: string;
  steps?: LockerStep[];
  tip?: LockerTip;
};

export function HowItWorksLocker(props: Partial<HowItWorksLockerProps>) {
  const content = { ...lockerFlow, ...props } as Required<HowItWorksLockerProps>;

  return (
    <section className="rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,#070707,#050505)] px-6 py-10 shadow-card sm:px-10">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[rgba(255,255,255,0.6)]">
            Lockers
          </p>
          <h2 className="mt-2 text-[28px] font-semibold leading-[1.3] text-white sm:text-[32px]">
            {content.title}
          </h2>
        </div>
        {content.tip && (
          <div className="hidden rounded-[28px] border border-white/15 bg-white/5 px-5 py-4 text-left text-sm text-[rgba(255,255,255,0.8)] sm:block">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[rgba(255,255,255,0.6)]">
              {content.tip.label}
            </p>
            <p>{content.tip.content}</p>
          </div>
        )}
      </div>
      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {content.steps.map((step, index) => (
          <li
            key={step.title}
            className="rounded-[32px] border border-white/10 bg-[linear-gradient(150deg,rgba(13,91,63,0.25),rgba(5,5,5,0.9))] p-6"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(19,168,107,0.2)] text-base font-semibold text-white">
              {index + 1}
            </div>
            <h3 className="text-lg font-semibold text-white">{step.title}</h3>
            <p className="mt-2 text-sm text-[rgba(255,255,255,0.75)]">{step.description}</p>
          </li>
        ))}
      </ol>
      {content.tip && (
        <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 px-5 py-4 text-sm text-[rgba(255,255,255,0.8)] sm:hidden">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[rgba(255,255,255,0.6)]">
            {content.tip.label}
          </p>
          <p>{content.tip.content}</p>
        </div>
      )}
    </section>
  );
}

export default HowItWorksLocker;
