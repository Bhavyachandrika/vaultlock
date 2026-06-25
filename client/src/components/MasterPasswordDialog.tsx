import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface Props {
  onConfirm: (password: string) => void;
  onCancel: () => void;
  error?: string;
}

export default function MasterPasswordDialog({ onConfirm, onCancel, error }: Props) {
  const [password, setPassword] = useState("");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-card border border-border/50 rounded-xl p-8 w-full max-w-sm space-y-5 shadow-2xl">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">Confirm Your Password</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter your account password to view this saved password.
        </p>
        <input
          type="password"
          placeholder="Your account password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onConfirm(password)}
          autoFocus
          className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-3">
          <Button
            onClick={() => onConfirm(password)}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Confirm
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}