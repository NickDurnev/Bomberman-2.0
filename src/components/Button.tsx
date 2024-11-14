import { ReactNode } from "react";

type Props = {
    text: string;
    onClick?: () => void;
    icon?: ReactNode;
    imageUrl?: string;
    imageAlt?: string;
};

export const Button = ({
    text,
    onClick,
    icon,
    imageUrl,
    imageAlt = "button icon",
}: Props) => {
    return (
        <button
            onClick={onClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-secondary transition motion-preset-pop motion-loop-once"
        >
            {icon && icon}
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={imageAlt}
                    className="w-[18px] h-[18px] object-contain"
                />
            )}
            <span className="font-medium text-lg letter">{text}</span>
        </button>
    );
};

