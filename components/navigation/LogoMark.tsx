import clsx from "clsx";

export type LogoMarkProps = {
  size?: number;
  showText?: boolean;
  className?: string;
};

export function LogoMark({ size = 40, showText = true, className }: LogoMarkProps) {
  const circleSize = size;
  return (
    <div className={clsx("flex items-center gap-3 text-white", className)}>
      <div
        aria-hidden="true"
        className="flex items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-[0.3em]"
        style={{
          width: circleSize,
          height: circleSize,
          backgroundColor: "#1E2D22",
          color: "white"
        }}
      >
        GH
      </div>
      {showText && (
        <div className="leading-tight">
          <p className="text-[12px] font-semibold uppercase tracking-[0.4em]">GREEN HUB</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[rgba(255,255,255,0.7)]">
            DISTRIBUTOR
          </p>
        </div>
      )}
    </div>
  );
}

export default LogoMark;
