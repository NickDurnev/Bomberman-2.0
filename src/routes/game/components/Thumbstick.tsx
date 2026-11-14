import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import {
    NO_DIRECTION,
    resetTouchInput,
    setDirections,
    stickToDirections,
} from "@game/touchInput";

const BASE_SIZE = 132;
const KNOB_SIZE = 56;
const BASE_RADIUS = BASE_SIZE / 2;
const MAX_OFFSET = BASE_RADIUS - KNOB_SIZE / 2;

const CHEVRON = "absolute text-[10px] leading-none text-white/35";

const Thumbstick = () => {
    const baseRef = useRef<HTMLDivElement>(null);
    const pointerId = useRef<number | null>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [active, setActive] = useState(false);

    useEffect(() => {
        const clear = () => {
            pointerId.current = null;
            setOffset({ x: 0, y: 0 });
            setActive(false);
            resetTouchInput();
        };
        const onHidden = () => {
            if (document.hidden) {
                clear();
            }
        };
        window.addEventListener("blur", clear);
        document.addEventListener("visibilitychange", onHidden);
        return () => {
            window.removeEventListener("blur", clear);
            document.removeEventListener("visibilitychange", onHidden);
            resetTouchInput();
        };
    }, []);

    const update = (e: PointerEvent<HTMLDivElement>) => {
        const base = baseRef.current;
        if (!base) {
            return;
        }
        const rect = base.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const distance = Math.hypot(dx, dy);
        const scale = distance > MAX_OFFSET ? MAX_OFFSET / distance : 1;
        setOffset({ x: dx * scale, y: dy * scale });
        const flags = stickToDirections(dx, dy, BASE_RADIUS);
        setActive(flags.up || flags.down || flags.left || flags.right);
        setDirections(flags);
    };

    const release = (e: PointerEvent<HTMLDivElement>) => {
        if (pointerId.current !== null && e.pointerId !== pointerId.current) {
            return;
        }
        pointerId.current = null;
        setOffset({ x: 0, y: 0 });
        setActive(false);
        setDirections(NO_DIRECTION);
    };

    const handleDown = (e: PointerEvent<HTMLDivElement>) => {
        if (
            pointerId.current !== null ||
            (e.pointerType === "mouse" && e.button !== 0)
        ) {
            return;
        }
        pointerId.current = e.pointerId;
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
            // No active pointer to capture. Still handle the press.
        }
        update(e);
    };

    const handleMove = (e: PointerEvent<HTMLDivElement>) => {
        if (e.pointerId !== pointerId.current) {
            return;
        }
        update(e);
    };

    return (
        <div
            ref={baseRef}
            role="group"
            aria-label="Movement stick"
            className="relative touch-none select-none rounded-full"
            style={{
                width: BASE_SIZE,
                height: BASE_SIZE,
                background: "rgba(31,41,55,0.6)",
                border: "1px solid rgba(255,255,255,0.18)",
            }}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={release}
            onPointerCancel={release}
            onLostPointerCapture={release}
            onContextMenu={(e) => e.preventDefault()}
        >
            <span
                aria-hidden="true"
                className={`${CHEVRON} -translate-x-1/2 top-1.5 left-1/2`}
            >
                ▲
            </span>
            <span
                aria-hidden="true"
                className={`${CHEVRON} -translate-x-1/2 bottom-1.5 left-1/2`}
            >
                ▼
            </span>
            <span
                aria-hidden="true"
                className={`${CHEVRON} -translate-y-1/2 top-1/2 left-1.5`}
            >
                ◀
            </span>
            <span
                aria-hidden="true"
                className={`${CHEVRON} -translate-y-1/2 top-1/2 right-1.5`}
            >
                ▶
            </span>
            <div
                className="pointer-events-none absolute rounded-full"
                style={{
                    width: KNOB_SIZE,
                    height: KNOB_SIZE,
                    left: BASE_RADIUS - KNOB_SIZE / 2,
                    top: BASE_RADIUS - KNOB_SIZE / 2,
                    transform: `translate(${offset.x}px, ${offset.y}px)`,
                    background: active
                        ? "rgba(124,120,214,0.85)"
                        : "rgba(255,255,255,0.25)",
                    border: "2px solid rgba(255,255,255,0.5)",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
                }}
            />
        </div>
    );
};

export default Thumbstick;
