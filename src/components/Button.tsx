import clsx from "clsx";
import { ReactNode } from "react";

type Props = {
  onClick: () => void;
  text?: string;
  animatedIcon?: ReactNode;
  icon?: ReactNode;
  imageUrl?: string;
  imageAlt?: string;
  disabled?: boolean;
  animated?: boolean;
  className?: string;
  ariaLabel?: string;
};

export const Button = ({
  text,
  animatedIcon,
  onClick,
  icon,
  imageUrl,
  imageAlt = "button icon",
  disabled = false,
  animated = false,
  className,
  ariaLabel,
}: Props) => {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={clsx(
        "motion-preset-pop motion-loop-once group/modal-btn bg-accent hover:bg-secondary relative inline-flex items-center gap-2 overflow-hidden text-white transition",
        className ?? "rounded-lg px-4 py-2",
        disabled ? "cursor-not-allowed opacity-50" : "hover:scale-105",
      )}
    >
      {icon && icon}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={imageAlt}
          className="h-[30px] w-[30px] rounded-full object-contain"
        />
      )}
      {text && (
        <span
          className={clsx(
            "letter text-lg font-medium",
            animated &&
              !disabled &&
              "text-center transition duration-500 group-hover/modal-btn:translate-x-40",
          )}
        >
          {text}
        </span>
      )}
      {animatedIcon && animated && !disabled && (
        <div className="absolute inset-0 z-20 flex -translate-x-40 items-center justify-center text-white transition duration-500 group-hover/modal-btn:translate-x-0">
          {animatedIcon}
        </div>
      )}
    </button>
  );
};
