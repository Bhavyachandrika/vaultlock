import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { Copy, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Generator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true,
  });

  const { data: generated, refetch, isLoading } = trpc.generator.generate.useQuery({
    length,
    ...options,
  });

  const handleCopy = async () => {
    if (generated?.password) {
      await navigator.clipboard.writeText(generated.password);
      toast.success('Password copied to clipboard');
    }
  };

  const handleOptionChange = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRegenerate = () => {
    refetch();
  };

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
          <h1 className="text-3xl font-bold text-foreground">Password Generator</h1>
          <p className="text-muted-foreground">Create strong, unique passwords for your accounts</p>
        </motion.div>

        {/* Generated Password Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 } as any}
        >
          <Card className="bg-gradient-to-br from-card to-card/80 border-accent/20 p-8">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Generated Password</p>
              <div className="flex items-center gap-3">
                <Input
                  value={generated?.password || ''}
                  readOnly
                  className="text-lg font-mono bg-background border-border/50 text-accent"
                />
                <Button
                  onClick={handleCopy}
                  size="icon"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {generated && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Strength</p>
                    <p className="text-sm font-semibold text-accent">{generated.strength}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Entropy</p>
                    <p className="text-sm font-semibold text-accent">{generated.entropy.toFixed(1)} bits</p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleRegenerate}
                disabled={isLoading}
                className="w-full bg-accent/20 hover:bg-accent/30 text-accent border border-accent/50 gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Generate Another
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Configuration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 } as any}
          className="space-y-6"
        >
          <div>
            <Label className="text-base font-semibold text-foreground mb-4 block">
              Password Length: {length}
            </Label>
            <Slider
              value={[length]}
              onValueChange={(value) => setLength(value[0])}
              min={8}
              max={64}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">Recommended: 16+ characters</p>
          </div>

          <Card className="bg-card border-border/50 p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Character Types</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="uppercase"
                  checked={options.includeUppercase}
                  onCheckedChange={() => handleOptionChange('includeUppercase')}
                />
                <Label htmlFor="uppercase" className="cursor-pointer text-foreground">
                  Uppercase letters (A-Z)
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="lowercase"
                  checked={options.includeLowercase}
                  onCheckedChange={() => handleOptionChange('includeLowercase')}
                />
                <Label htmlFor="lowercase" className="cursor-pointer text-foreground">
                  Lowercase letters (a-z)
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="numbers"
                  checked={options.includeNumbers}
                  onCheckedChange={() => handleOptionChange('includeNumbers')}
                />
                <Label htmlFor="numbers" className="cursor-pointer text-foreground">
                  Numbers (0-9)
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="symbols"
                  checked={options.includeSymbols}
                  onCheckedChange={() => handleOptionChange('includeSymbols')}
                />
                <Label htmlFor="symbols" className="cursor-pointer text-foreground">
                  Special symbols (!@#$%^&*)
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="similar"
                  checked={options.excludeSimilar}
                  onCheckedChange={() => handleOptionChange('excludeSimilar')}
                />
                <Label htmlFor="similar" className="cursor-pointer text-foreground">
                  Exclude similar characters (i, l, 1, L, o, 0, O)
                </Label>
              </div>
            </div>
          </Card>

          {/* Tips */}
          <Card className="bg-accent/10 border-accent/30 p-6">
            <h3 className="font-semibold text-accent mb-3">Security Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use a unique password for each account</li>
              <li>• Aim for at least 16 characters</li>
              <li>• Include uppercase, lowercase, numbers, and symbols</li>
              <li>• Avoid dictionary words and personal information</li>
              <li>• Store generated passwords securely in your vault</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
