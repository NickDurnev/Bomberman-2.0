import clsx from "clsx";
import { ReactNode } from "react";

type Props = {
    text?: string;
    onClick: () => void;
    icon?: ReactNode;
    imageUrl?: string;
    imageAlt?: string;
    disabled?: boolean;
    className?: string;
};

export const Button = ({
    text,
    onClick,
    icon,
    imageUrl,
    imageAlt = "button icon",
    disabled = false,
    className,
}: Props) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={clsx(
                "inline-flex items-center gap-2 bg-accent text-white hover:bg-secondary transition motion-preset-pop motion-loop-once",
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
            {text && <span className="font-medium text-lg letter">{text}</span>}
        </button>
    );
};

