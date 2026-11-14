import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { setBomb } from "@game/touchInput";

const BombButton = () => {
    const pointerId = useRef<number | null>(null);
    const [pressed, setPressed] = useState(false);

    const release = (e: PointerEvent<HTMLButtonElement>) => {
        if (pointerId.current !== null && e.pointerId !== pointerId.current) {
            return;
        }
        pointerId.current = null;
        setPressed(false);
        setBomb(false);
    };

    const handleDown = (e: PointerEvent<HTMLButtonElement>) => {
        if (pointerId.current !== null) {
            return;
        }
        pointerId.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        setPressed(true);
        setBomb(true);
    };

    return (
        <button
            type="button"
            aria-label="Place bomb"
            className="flex touch-none select-none items-center justify-center rounded-full"
            style={{
                width: 80,
                height: 80,
                background: pressed
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(255,255,255,0.12)",
                border: "2px solid rgba(255,255,255,0.45)",
            }}
            onPointerDown={handleDown}
            onPointerUp={release}
            onPointerCancel={release}
            onLostPointerCapture={release}
            onContextMenu={(e) => e.preventDefault()}
        >
            <span
                aria-hidden="true"
                className="pointer-events-none block"
                style={{
                    width: 52,
                    height: 52,
                    backgroundImage: "url(/assets/images/game/bombs.png)",
                    backgroundSize: "100% auto",
                    backgroundPosition: "0 0",
                    backgroundRepeat: "no-repeat",
                    imageRendering: "pixelated",
                }}
            />
        </button>
    );
};

export default BombButton;
