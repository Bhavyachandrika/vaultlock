import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc';
import { Lock, Trash2, Edit2, Copy, Plus, Search, Eye, EyeOff } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import MasterPasswordDialog from '@/components/MasterPasswordDialog';

type ActionType = 'copy' | 'view';

export default function Vault() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingAction, setPendingAction] = useState<{ id: number; type: ActionType } | null>(null);
  const [dialogError, setDialogError] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<number, string>>({});

  const { data: entries, isLoading, refetch } = trpc.vault.list.useQuery();
  const { data: searchResults } = trpc.vault.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );
  const deleteEntry = trpc.vault.delete.useMutation({
    onSuccess: () => {
      toast.success('Password entry deleted');
      refetch();
    },
    onError: () => {
      toast.error('Failed to delete entry');
    },
  });

  if (!user) return null;

  const displayEntries = (searchQuery.length > 0 ? searchResults : entries) || [];

 const fetchPassword = async (id: number) => {
    const response = await fetch(`/api/trpc/vault.get?input=${encodeURIComponent(JSON.stringify({ json: { id } }))}`, {
      credentials: "include",
    });
    const data = await response.json();
    return data.result?.data?.json?.password || data.result?.data?.password || null;
  };

  const handleMasterPasswordConfirm = async (password: string) => {
    setDialogError('');
    try {
      const verifyRes = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.valid) {
        setDialogError('Incorrect password. Please try again.');
        return;
      }

      const id = pendingAction!.id;
      const type = pendingAction!.type;
      const pwd = await fetchPassword(id);

      if (!pwd) {
        setDialogError('Failed to retrieve password.');
        return;
      }

      if (type === 'copy') {
        await navigator.clipboard.writeText(pwd);
        toast.success('Password copied to clipboard');
        setPendingAction(null);
      } else if (type === 'view') {
        setRevealedPasswords(prev => ({ ...prev, [id]: pwd }));
        setPendingAction(null);
      }
    } catch (error) {
      setDialogError('Something went wrong. Try again.');
    }
  };

  const handleHidePassword = (id: number) => {
    setRevealedPasswords(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteEntry.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      {pendingAction !== null && (
        <MasterPasswordDialog
          onConfirm={handleMasterPasswordConfirm}
          onCancel={() => setPendingAction(null)}
          error={dialogError}
        />
      )}

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 } as any}
          className="flex items-center justify-between"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Password Vault</h1>
            <p className="text-muted-foreground">Manage all your stored passwords</p>
          </div>
          <Link href="/vault/new">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
              <Plus className="w-4 h-4" />
              Add Password
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 } as any}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by site, username, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border/50 focus:border-accent/50"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 } as any}
          className="space-y-3"
        >
          {isLoading ? (
            <>
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </>
          ) : displayEntries && displayEntries.length > 0 ? (
            displayEntries.map((entry: any, index: number) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Card className="bg-card border-border/50 hover:border-accent/50 transition-all hover:shadow-lg p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{entry.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {entry.username || entry.email || entry.website}
                        </p>
                        {revealedPasswords[entry.id] && (
                          <div className="mt-2 flex items-center gap-2">
                            <code className="text-sm bg-accent/10 text-accent px-3 py-1 rounded-lg font-mono">
                              {revealedPasswords[entry.id]}
                            </code>
                            <button
                              onClick={() => handleHidePassword(entry.id)}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              Hide
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => { setPendingAction({ id: entry.id, type: 'view' }); setDialogError(''); }}
                        className="p-2 hover:bg-card-foreground/10 rounded-lg transition-colors"
                        title="View password"
                      >
                        {revealedPasswords[entry.id]
                          ? <EyeOff className="w-4 h-4 text-accent" onClick={(e) => { e.stopPropagation(); handleHidePassword(entry.id); }} />
                          : <Eye className="w-4 h-4 text-muted-foreground hover:text-accent" />
                        }
                      </button>
                      <button
                        onClick={() => { setPendingAction({ id: entry.id, type: 'copy' }); setDialogError(''); }}
                        className="p-2 hover:bg-card-foreground/10 rounded-lg transition-colors"
                        title="Copy password"
                      >
                        <Copy className="w-4 h-4 text-muted-foreground hover:text-accent" />
                      </button>
                      <Link href={`/vault/${entry.id}`}>
                        <button className="p-2 hover:bg-card-foreground/10 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4 text-muted-foreground hover:text-accent" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                        disabled={deleteEntry.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="bg-card border-border/50 p-12 text-center">
              <Lock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No passwords yet</p>
              <Link href="/vault/new">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Add your first password
                </Button>
              </Link>
            </Card>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}