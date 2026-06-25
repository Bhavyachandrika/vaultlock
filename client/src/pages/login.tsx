import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const url = isLogin ? "http://localhost:3000/api/auth/login" : "http://localhost:3000/api/auth/register";
      const body: any = { email, password };
      if (!isLogin) body.name = name;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      window.location.href = "/dashboard";
    } catch (e) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-border/50 rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-2 justify-center">
          <Lock className="w-6 h-6 text-accent" />
          <span className="text-2xl font-bold text-foreground">VaultLock</span>
        </div>

        <h2 className="text-center text-xl font-semibold text-foreground">
          {isLogin ? "Sign in to your vault" : "Create your vault"}
        </h2>

        <div className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-accent hover:underline"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}