import type { PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { PackImage } from "@/components/index";
import { setBomb } from "@/game/touchInput";

const BombButton = () => {
  const pointerId = useRef<number | null>(null);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const clear = () => {
      pointerId.current = null;
      setPressed(false);
      setBomb(false);
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
      setBomb(false);
    };
  }, []);

  const release = (e: PointerEvent<HTMLButtonElement>) => {
    if (pointerId.current !== null && e.pointerId !== pointerId.current) {
      return;
    }
    pointerId.current = null;
    setPressed(false);
    setBomb(false);
  };

  const handleDown = (e: PointerEvent<HTMLButtonElement>) => {
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
    setPressed(true);
    setBomb(true);
  };

  return (
    <button
      type="button"
      aria-label="Place bomb"
      className="flex touch-none items-center justify-center rounded-full select-none"
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
      onContextMenu={e => e.preventDefault()}
    >
      <PackImage
        file="bombs.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none object-cover object-top"
        style={{ width: 52, height: 52, imageRendering: "pixelated" }}
      />
    </button>
  );
};

export default BombButton;
