import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { useRoute, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

export default function VaultEntry() {
  const { user } = useAuth();
  const [, params] = useRoute('/vault/:id');
  const [, navigate] = useLocation();
  const entryId = params?.id ? parseInt(params.id) : null;

  const [formData, setFormData] = useState({
    title: '',
    website: '',
    username: '',
    email: '',
    password: '',
    notes: '',
    category: 'Personal',
    tags: [] as string[],
    favorite: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const { data: entry } = trpc.vault.get.useQuery(
    { id: entryId! },
    { enabled: !!entryId }
  );

  const createEntry = trpc.vault.create.useMutation({
    onSuccess: () => {
      toast.success('Password saved successfully');
      navigate('/vault');
    },
    onError: () => {
      toast.error('Failed to save password');
      setIsLoading(false);
    },
  });

  const updateEntry = trpc.vault.update.useMutation({
    onSuccess: () => {
      toast.success('Password updated successfully');
      navigate('/vault');
    },
    onError: () => {
      toast.error('Failed to update password');
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title || '',
        website: entry.website || '',
        username: entry.username || '',
        email: entry.email || '',
        password: entry.password || '',
        notes: entry.notes || '',
        category: entry.category || 'Personal',
        tags: entry.tags || [],
        favorite: entry.favorite || false,
      });
    }
  }, [entry]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.title.trim()) {
      toast.error('Title is required');
      setIsLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      toast.error('Password is required');
      setIsLoading(false);
      return;
    }

    if (entryId) {
      updateEntry.mutate({ id: entryId, ...formData });
    } else {
      createEntry.mutate(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 } as any}
          className="flex items-center gap-4"
        >
          <button
            onClick={() => navigate('/vault')}
            className="p-2 hover:bg-card rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">
              {entryId ? 'Edit Password' : 'Add Password'}
            </h1>
            <p className="text-muted-foreground">
              {entryId ? 'Update your password entry' : 'Create a new password entry'}
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 } as any}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <Card className="bg-card border-border/50 p-6 space-y-4">
            <div>
              <Label htmlFor="title" className="text-foreground">
                Title *
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Gmail, GitHub, Amazon"
                className="mt-2 bg-background border-border/50 focus:border-accent/50"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website" className="text-foreground">
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="mt-2 bg-background border-border/50 focus:border-accent/50"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-foreground">
                  Category
                </Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category || 'Personal'}
                  onChange={handleChange}
                  className="mt-2 w-full px-3 py-2 bg-background border border-border/50 rounded-md text-foreground focus:border-accent/50 focus:outline-none"
                >
                  <option value="Personal">Personal</option>
                  <option value="Work">Work</option>
                  <option value="Finance">Finance</option>
                  <option value="Social">Social</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username" className="text-foreground">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="username"
                  className="mt-2 bg-background border-border/50 focus:border-accent/50"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="mt-2 bg-background border-border/50 focus:border-accent/50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground">
                Password *
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="mt-2 bg-background border-border/50 focus:border-accent/50"
                required
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-foreground">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional notes..."
                className="mt-2 bg-background border-border/50 focus:border-accent/50 min-h-24"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="favorite"
                name="favorite"
                checked={formData.favorite}
                onChange={handleChange}
                className="w-4 h-4 rounded border-border/50 bg-background text-accent"
              />
              <Label htmlFor="favorite" className="text-foreground cursor-pointer">
                Mark as favorite
              </Label>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            >
              <Save className="w-4 h-4" />
              {entryId ? 'Update' : 'Save'} Password
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/vault')}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </motion.form>
      </div>
    </DashboardLayout>
  );
}
