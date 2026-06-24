import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Lock, Shield, Zap, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-accent" />
            <span className="text-xl font-bold text-foreground">VaultLock</span>
          </div>
          {isAuthenticated && user ? (
            <Link href="/dashboard">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Go to Dashboard</Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Sign In</Button>
            </a>
          )}
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section with Image */}
        <section className="w-full py-12 md:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="rounded-xl overflow-hidden border border-accent/20 shadow-2xl">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663790126120/7fw7qtFgciqJuwWNvYmZpG/vaultlock-hero-LTnVDbTuMAedQrZdswGAnN.webp"
                alt="VaultLock Cybersecurity Hero - Secure Password Manager"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center space-y-6 mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Secure Your Passwords with <span className="text-accent">VaultLock</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AES-256 encrypted password manager with advanced security features, password generation, and health checking.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              {isAuthenticated && user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              )}
              <Button size="lg" variant="outline" className="border-border/50 hover:bg-card/50">
                Learn More
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            {[
              {
                icon: Lock,
                title: "AES-256 Encryption",
                description: "Military-grade encryption for all your passwords",
              },
              {
                icon: Zap,
                title: "Password Generator",
                description: "Create strong, unique passwords instantly",
              },
              {
                icon: Shield,
                title: "Security Monitoring",
                description: "Real-time analysis of weak and reused passwords",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-card border border-border/50 rounded-lg p-8 hover:border-accent/50 transition-colors"
              >
                <feature.icon className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-b from-card/50 to-background border-t border-border/50 py-20">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Ready to secure your passwords?</h2>
            <p className="text-lg text-muted-foreground">Join thousands of users protecting their digital identity with VaultLock.</p>
            {isAuthenticated && user ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                  Sign Up Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
