import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { LogOut, User, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success('Logged out successfully');
      navigate('/');
    },
    onError: () => {
      toast.error('Failed to logout');
    },
  });

  if (!user) return null;

  const handleLogout = () => {
    logout.mutate();
  };

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const lastSignIn = new Date(user.lastSignedIn).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 } as any}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 } as any}
        >
          <Card className="bg-gradient-to-br from-card to-card/80 border-accent/20 p-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <User className="w-10 h-10 text-accent" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="text-2xl font-bold text-foreground">{user.name || 'Not set'}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {user.email || 'No email'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Account Details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 } as any}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-foreground">Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border/50 p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </div>
                <p className="text-lg font-semibold text-foreground">{joinDate}</p>
              </div>
            </Card>

            <Card className="bg-card border-border/50 p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Last Sign In
                </div>
                <p className="text-lg font-semibold text-foreground">{lastSignIn}</p>
              </div>
            </Card>

            <Card className="bg-card border-border/50 p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Login Method</p>
                <p className="text-lg font-semibold text-accent capitalize">
                  {user.loginMethod || 'Manus OAuth'}
                </p>
              </div>
            </Card>

            <Card className="bg-card border-border/50 p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Account Role</p>
                <p className="text-lg font-semibold text-accent capitalize">
                  {user.role}
                </p>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 } as any}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-foreground">Security</h2>
          <Card className="bg-card border-border/50 p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Session Management</h3>
              <p className="text-sm text-muted-foreground">
                Your session is secure and encrypted. Sign out from all devices to end your session.
              </p>
            </div>
            <Button
              onClick={handleLogout}
              disabled={logout.isPending}
              variant="destructive"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              {logout.isPending ? 'Signing out...' : 'Sign Out'}
            </Button>
          </Card>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 } as any}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-foreground">About VaultLock</h2>
          <Card className="bg-card border-border/50 p-6 space-y-3">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Security Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ AES-256 encryption for all passwords</li>
                <li>✓ Secure password generation</li>
                <li>✓ Real-time security analysis</li>
                <li>✓ Manus OAuth authentication</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Version</h3>
              <p className="text-sm text-muted-foreground">VaultLock v1.0.0</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
