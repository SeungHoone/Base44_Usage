import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Brain, Database, Cpu, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import JobCard from "@/components/dashboard/JobCard";
import JobDetailModal from "@/components/dashboard/JobDetailModal";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    base44.auth.me().then((user) => {
      if (!user) base44.auth.redirectToLogin();
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["training-jobs"],
    queryFn: () => base44.entities.TrainingJob.list("-created_date"),
    initialData: []
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TrainingJob.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["training-jobs"] })
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.TrainingJob.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["training-jobs"] })
  });

  const stats = {
    total: jobs.length,
    configured: jobs.filter((j) => j.status === "configured").length,
    running: jobs.filter((j) => j.status === "running").length,
    completed: jobs.filter((j) => j.status === "completed").length
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Vision Lab</h1>
            </div>
            <p className="text-slate-400 max-w-lg">
              Build, configure, and deploy computer vision models. Select datasets, choose architectures, and train on your own servers or cloud GPUs.
            </p>
            <Button
              onClick={() => window.location.href = createPageUrl("NewTraining")}
              className="mt-6 bg-white text-slate-900 hover:bg-white/90 font-semibold px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Training Job
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 -mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Jobs", value: stats.total, icon: Database, color: "text-slate-400" },
            { label: "Configured", value: stats.configured, icon: Cpu, color: "text-blue-400" },
            { label: "Running", value: stats.running, icon: Loader2, color: "text-amber-400" },
            { label: "Completed", value: stats.completed, icon: Brain, color: "text-emerald-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-4"
            >
              <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-lg font-semibold text-white mb-6">Training Jobs</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-400">No training jobs yet</h3>
            <p className="text-xs text-slate-600 mt-1 mb-4">Create your first vision model training job</p>
            <Button
              variant="outline"
              onClick={() => window.location.href = createPageUrl("NewTraining")}
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <JobCard
                  job={job}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onClick={() => setSelectedJob(job)}
                  onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <JobDetailModal job={selectedJob} open={!!selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
