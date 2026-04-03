import clsx from "clsx";
import { forwardRef, TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  isInvalid?: boolean;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, isInvalid = false, ...props }, ref) => (
    <textarea
      ref={ref}
      className={clsx(
        "w-full rounded-xl bg-night-800/70 border text-white placeholder:text-ink-600",
        "px-md py-3 text-base focus-visible:outline-none focus-visible:ring-2",
        isInvalid
          ? "border-amber-500 focus-visible:ring-amber-500"
          : "border-night-700 focus-visible:ring-plum-600",
        "min-h-[140px] resize-vertical",
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";

export default Textarea;
