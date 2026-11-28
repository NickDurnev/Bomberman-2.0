import { ShadButton } from "@/components/ui/button";
import { useProtocolStatus } from "@/utils/socket";

const MESSAGES = {
  "client-old": "A new version of the game is available.",
  "server-old": "The server is being updated. Try again in a few minutes.",
} as const;

// Full-screen overlay that blocks the app when the client and the server
// speak different protocol versions.
export const ProtocolGate = () => {
  const status = useProtocolStatus();
  if (status === "ok") {
    return null;
  }
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="bg-background/95 fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-6 p-6 text-center"
    >
      <p className="text-foreground text-lg">{MESSAGES[status]}</p>
      <ShadButton onClick={() => location.reload()}>Reload</ShadButton>
    </div>
  );
};
