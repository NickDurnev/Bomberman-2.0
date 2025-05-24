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
}: Props) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={clsx(
                "motion-preset-pop motion-loop-once group/modal-btn inline-flex items-center gap-2 overflow-hidden bg-accent text-white transition hover:bg-secondary",
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
                        "letter font-medium text-lg",
                        animated &&
                            !disabled &&
                            "text-center transition duration-500 group-hover/modal-btn:translate-x-40",
                    )}
                >
                    {text}
                </span>
            )}
            {animatedIcon && animated && !disabled && (
                <div className="-translate-x-40 absolute inset-0 z-20 flex items-center justify-center text-white transition duration-500 group-hover/modal-btn:translate-x-0">
                    {animatedIcon}
                </div>
            )}
        </button>
    );
};

