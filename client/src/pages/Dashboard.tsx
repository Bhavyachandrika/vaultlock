import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc';
import { Lock, Shield, AlertTriangle, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = trpc.vault.stats.useQuery();

  if (!user) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 } as any}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-foreground">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground">Manage and secure your passwords with VaultLock</p>
        </motion.div>

        {/* Security Score Card */}
        {isLoading ? (
          <Skeleton className="h-40 rounded-lg" />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-card to-card/80 border-accent/20 p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-accent" />
                    <h2 className="text-2xl font-bold text-foreground">Security Score</h2>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-accent">{stats?.securityScore || 0}</span>
                      <span className="text-lg text-muted-foreground">/100</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Status: <span className="font-semibold text-accent">{stats?.securityLevel}</span>
                    </p>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-muted"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${(stats?.securityScore || 0) * 2.83} 283`}
                        className="text-accent transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-accent">{stats?.securityScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Total Passwords */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border/50 hover:border-accent/50 transition-colors p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Passwords</p>
                  <div className="text-3xl font-bold text-foreground">
                    {isLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalPasswords || 0}
                  </div>
                </div>
                <Lock className="w-8 h-8 text-accent/60" />
              </div>
            </Card>
          </motion.div>

          {/* Weak Passwords */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border/50 hover:border-destructive/50 transition-colors p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Weak Passwords</p>
                  <div className="text-3xl font-bold text-destructive">
                    {isLoading ? <Skeleton className="h-8 w-12" /> : stats?.weakPasswords || 0}
                  </div>
                </div>
                <AlertTriangle className="w-8 h-8 text-destructive/60" />
              </div>
            </Card>
          </motion.div>

          {/* Reused Passwords */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border/50 hover:border-accent/50 transition-colors p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Reused Passwords</p>
                  <div className="text-3xl font-bold text-accent">
                    {isLoading ? <Skeleton className="h-8 w-12" /> : stats?.reusedPasswords || 0}
                  </div>
                </div>
                <Shield className="w-8 h-8 text-accent/60" />
              </div>
            </Card>
          </motion.div>

          {/* Old Passwords */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border/50 hover:border-accent/50 transition-colors p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Old Passwords (90+ days)</p>
                  <div className="text-3xl font-bold text-accent">
                    {isLoading ? <Skeleton className="h-8 w-12" /> : stats?.oldPasswords || 0}
                  </div>
                </div>
                <Shield className="w-8 h-8 text-accent/60" />
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/vault/new">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                <Plus className="w-4 h-4" />
                Add Password
              </Button>
            </Link>
            <Link href="/vault">
              <Button variant="outline" className="w-full gap-2">
                <Lock className="w-4 h-4" />
                View Vault
              </Button>
            </Link>
            <Link href="/generator">
              <Button variant="outline" className="w-full gap-2">
                <ArrowRight className="w-4 h-4" />
                Generate Password
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Recent Entries */}
        {stats?.recentEntries && stats.recentEntries.length > 0 && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Recently Added</h2>
              <Link href="/vault">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {stats.recentEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  <Card className="bg-card border-border/50 hover:border-accent/50 transition-colors p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{entry.title}</p>
                        <p className="text-sm text-muted-foreground">{entry.website}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
