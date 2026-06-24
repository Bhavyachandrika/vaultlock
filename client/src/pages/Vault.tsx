import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc';
import { Lock, Trash2, Edit2, Copy, Plus, Search } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Vault() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleCopyPassword = async (id: number) => {
    try {
      const response = await fetch(`/api/trpc/vault.get?input=${JSON.stringify({ id })}`);
      const data = await response.json();
      if (data.result?.data?.password) {
        await navigator.clipboard.writeText(data.result.data.password);
        toast.success('Password copied to clipboard');
      }
    } catch (error) {
      toast.error('Failed to copy password');
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteEntry.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
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

        {/* Search */}
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

        {/* Entries List */}
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
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleCopyPassword(entry.id)}
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
