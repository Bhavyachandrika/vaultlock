import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc';
import { AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HealthCheck() {
  const { user } = useAuth();
  const { data: analysis, isLoading } = trpc.healthCheck.analyze.useQuery();

  if (!user) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
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
          <h1 className="text-3xl font-bold text-foreground">Password Health Check</h1>
          <p className="text-muted-foreground">Analyze your vault for security issues</p>
        </motion.div>

        {/* Summary Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <motion.div variants={itemVariants}>
              <Card className="bg-card border-border/50 p-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Passwords</p>
                  <p className="text-2xl font-bold text-foreground">{analysis?.summary.total || 0}</p>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-card border-destructive/30 p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <p className="text-sm text-muted-foreground">Weak</p>
                  </div>
                  <p className="text-2xl font-bold text-destructive">{analysis?.summary.weak || 0}</p>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-card border-accent/30 p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-accent" />
                    <p className="text-sm text-muted-foreground">Reused</p>
                  </div>
                  <p className="text-2xl font-bold text-accent">{analysis?.summary.reused || 0}</p>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-card border-accent/30 p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <p className="text-sm text-muted-foreground">Old (90+ days)</p>
                  </div>
                  <p className="text-2xl font-bold text-accent">{analysis?.summary.old || 0}</p>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Recommendations */}
        {analysis?.recommendations && analysis.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 } as any}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-foreground">Recommendations</h2>
            <div className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <Card className="bg-accent/10 border-accent/30 p-4">
                    <p className="text-sm text-accent">{rec}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Detailed Analysis */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : analysis?.entries && analysis.entries.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 } as any}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-foreground">Password Analysis</h2>
            <div className="space-y-3">
              {analysis.entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <Card className="bg-card border-border/50 p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{entry.title}</h3>
                          <p className="text-sm text-muted-foreground">{entry.website}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant={
                              entry.strengthLevel === 'very-strong'
                                ? 'default'
                                : entry.strengthLevel === 'strong'
                                  ? 'secondary'
                                  : entry.strengthLevel === 'good'
                                    ? 'outline'
                                    : 'destructive'
                            }
                          >
                            {entry.strengthLevel}
                          </Badge>
                          <span className="text-sm font-semibold text-foreground">
                            {entry.strengthScore}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {entry.isWeak && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Weak
                          </Badge>
                        )}
                        {entry.isReused && (
                          <Badge variant="outline" className="gap-1 border-accent text-accent">
                            <Shield className="w-3 h-3" />
                            Reused
                          </Badge>
                        )}
                        {entry.isOld && (
                          <Badge variant="outline" className="gap-1 border-accent text-accent">
                            <Clock className="w-3 h-3" />
                            Old
                          </Badge>
                        )}
                        {entry.isCommon && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Common
                          </Badge>
                        )}
                        {!entry.isWeak && !entry.isReused && !entry.isOld && !entry.isCommon && (
                          <Badge variant="default" className="gap-1 bg-green-600">
                            <CheckCircle className="w-3 h-3" />
                            Secure
                          </Badge>
                        )}
                      </div>

                      {entry.feedback && entry.feedback.length > 0 && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          {entry.feedback.map((fb: string, i: number) => (
                            <p key={i}>• {fb}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <Card className="bg-card border-border/50 p-12 text-center">
            <CheckCircle className="w-12 h-12 text-accent/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No passwords to analyze yet</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
