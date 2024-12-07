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
                "inline-flex items-center gap-2 bg-accent text-white hover:bg-secondary transition motion-preset-pop motion-loop-once group/modal-btn overflow-hidden",
                className ?? "rounded-lg px-4 py-2",
                disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            )}
        >
            {icon && icon}
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={imageAlt}
                    className="w-[30px] h-[30px] rounded-full object-contain"
                />
            )}
            {text && (
                <span
                    className={clsx(
                        "font-medium text-lg letter",
                        animated &&
                            "group-hover/modal-btn:translate-x-40 text-center transition duration-500"
                    )}
                >
                    {text}
                </span>
            )}
            {animatedIcon && animated && (
                <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
                    {animatedIcon}
                </div>
            )}
        </button>
    );
};

