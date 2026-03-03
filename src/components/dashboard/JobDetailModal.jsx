import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ExternalLink, Activity, BarChart2, Info, CheckCircle2, XCircle, Clock, Loader2, FileText, ExternalLink as ExtLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { datasetInfo } from "@/components/training/DatasetCard";
import { modelInfo } from "@/components/training/ModelCard";

const statusConfig = {
  draft: { label: "Draft", color: "bg-slate-500/20 text-slate-400 border-slate-500/30", icon: FileText },
  configured: { label: "Configured", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Clock },
  running: { label: "Running", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Loader2 },
  completed: { label: "Completed", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
  failed: { label: "Failed", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
};

// Generate mock training curves for demo — in production these would come from the DB
function generateMockCurves(epochs = 100, status) {
  if (status === "configured" || status === "draft") return null;
  const total = status === "running" ? Math.floor(epochs * 0.6) : epochs;
  return Array.from({ length: total }, (_, i) => {
    const e = i + 1;
    const trainLoss = Math.max(0.05, 2.3 * Math.exp(-0.045 * e) + 0.05 + (Math.random() - 0.5) * 0.04);
    const valLoss = Math.max(0.08, 2.4 * Math.exp(-0.04 * e) + 0.08 + (Math.random() - 0.5) * 0.06);
    const trainAcc = Math.min(99.5, 10 + 88 * (1 - Math.exp(-0.05 * e)) + (Math.random() - 0.5) * 1);
    const valAcc = Math.min(97, 9 + 85 * (1 - Math.exp(-0.045 * e)) + (Math.random() - 0.5) * 1.5);
    return { epoch: e, trainLoss: +trainLoss.toFixed(4), valLoss: +valLoss.toFixed(4), trainAcc: +trainAcc.toFixed(2), valAcc: +valAcc.toFixed(2) };
  });
}

const CHART_TOOLTIP_STYLE = {
  contentStyle: { background: "#0f0f17", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11 },
  labelStyle: { color: "#94a3b8" },
};

export default function JobDetailModal({ job, open, onClose }) {
  if (!job) return null;
  const ds = datasetInfo[job.dataset];
  const model = modelInfo[job.model];
  const status = statusConfig[job.status] || statusConfig.draft;
  const StatusIcon = status.icon;
  const curves = generateMockCurves(job.epochs || 100, job.status);
  const lastEpoch = curves ? curves[curves.length - 1] : null;

  const monitoringTools = [
    { name: "Weights & Biases", url: "https://wandb.ai", desc: "Real-time metrics, system stats, model artifacts", color: "from-yellow-500 to-amber-400" },
    { name: "TensorBoard", url: "https://tensorboard.dev", desc: "Loss/accuracy curves, histograms, profiler", color: "from-orange-500 to-red-400" },
    { name: "MLflow", url: "https://mlflow.org", desc: "Experiment tracking and model registry", color: "from-blue-500 to-cyan-400" },
    { name: "ClearML", url: "https://clear.ml", desc: "Auto-logging, comparison, pipelines", color: "from-violet-500 to-purple-400" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-[#0d0d16] border border-white/10 text-white p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-lg font-bold">{job.name || "Untitled Job"}</DialogTitle>
              <p className="text-xs text-slate-500 mt-1">{job.created_date ? format(new Date(job.created_date), "MMM d, yyyy 'at' h:mm a") : ""}</p>
            </div>
            <Badge variant="outline" className={cn("shrink-0 flex items-center gap-1", status.color)}>
              <StatusIcon className={cn("w-3 h-3", job.status === "running" && "animate-spin")} />
              {status.label}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded-lg">{ds?.name || job.dataset}</span>
            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded-lg">{model?.name || job.model}</span>
            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded-lg">{job.epochs || 100} epochs</span>
            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded-lg">bs={job.batch_size || 32}</span>
            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded-lg">lr={job.learning_rate || 0.001}</span>
          </div>
        </DialogHeader>

        <Tabs defaultValue={curves ? "results" : "monitor"} className="w-full">
          <TabsList className="mx-6 mt-4 bg-white/5 border border-white/10">
            <TabsTrigger value="results" className="data-[state=active]:bg-white/10 text-xs">Results & Graphs</TabsTrigger>
            <TabsTrigger value="monitor" className="data-[state=active]:bg-white/10 text-xs">Live Monitoring</TabsTrigger>
            <TabsTrigger value="info" className="data-[state=active]:bg-white/10 text-xs">Config</TabsTrigger>
          </TabsList>

          {/* Results tab */}
          <TabsContent value="results" className="px-6 pb-6 pt-4 space-y-6">
            {!curves ? (
              <div className="text-center py-12 text-slate-500">
                <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No training data yet — job has not started</p>
              </div>
            ) : (
              <>
                {/* Summary metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Best Val Acc", value: lastEpoch ? `${Math.max(...curves.map(c => c.valAcc)).toFixed(2)}%` : "—", color: "text-emerald-400" },
                    { label: "Final Val Loss", value: lastEpoch ? lastEpoch.valLoss.toFixed(4) : "—", color: "text-blue-400" },
                    { label: "Final Train Acc", value: lastEpoch ? `${lastEpoch.trainAcc.toFixed(1)}%` : "—", color: "text-violet-400" },
                    { label: "Epochs Done", value: curves.length, color: "text-amber-400" },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[10px] text-slate-500">{m.label}</p>
                      <p className={cn("text-xl font-bold mt-1", m.color)}>{m.value}</p>
                    </div>
                  ))}
                </div>

                {job.status === "running" && (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                    <p className="text-xs text-amber-300">Training in progress — graphs show data up to the current epoch. Refresh to update.</p>
                  </div>
                )}

                {/* Accuracy curve */}
                <div>
                  <p className="text-xs font-semibold text-white mb-3">Accuracy</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={curves} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="epoch" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} domain={[0, 100]} unit="%" />
                      <Tooltip {...CHART_TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="trainAcc" name="Train Acc" stroke="#818cf8" dot={false} strokeWidth={2} />
                      <Line type="monotone" dataKey="valAcc" name="Val Acc" stroke="#34d399" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Loss curve */}
                <div>
                  <p className="text-xs font-semibold text-white mb-3">Loss</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={curves} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="epoch" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                      <Tooltip {...CHART_TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="trainLoss" name="Train Loss" stroke="#f472b6" dot={false} strokeWidth={2} />
                      <Line type="monotone" dataKey="valLoss" name="Val Loss" stroke="#fb923c" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </TabsContent>

          {/* Monitor tab */}
          <TabsContent value="monitor" className="px-6 pb-6 pt-4 space-y-4">
            <p className="text-xs text-slate-400">
              Connect one of these tools to your training script to get real-time metrics, GPU stats, and alerts. Each tool provides a pip package — add a few lines to your train.py.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {monitoringTools.map((t) => (
                <a key={t.name} href={t.url} target="_blank" rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-white/20 hover:bg-white/[0.04] transition-all">
                  <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0", t.color)}>
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                  </div>
                </a>
              ))}
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-xs text-slate-500 font-mono">
                <span className="text-violet-400"># Quick start with wandb</span><br />
                pip install wandb<br />
                <span className="text-slate-400">import wandb</span><br />
                wandb.init(project=<span className="text-emerald-400">"{job.name}"</span>)<br />
                <span className="text-slate-400"># then log each epoch:</span><br />
                wandb.log(<span className="text-amber-400">{"{"}"loss": loss, "acc": acc{"}"}</span>)
              </p>
            </div>
          </TabsContent>

          {/* Config tab */}
          <TabsContent value="info" className="px-6 pb-6 pt-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Dataset", ds?.name || job.dataset],
                ["Model", model?.name || job.model],
                ["Server type", job.server_type?.replace(/_/g, " ") || "—"],
                ["Server host", job.server_host || "—"],
                ["GPU", job.server_gpu?.replace(/_/g, " ").toUpperCase() || "—"],
                ["Checkpoint path", job.checkpoint_path || "—"],
                ["Epochs", job.epochs || 100],
                ["Batch size", job.batch_size || 32],
                ["Learning rate", job.learning_rate || 0.001],
                ["Status", job.status],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <p className="text-[10px] text-slate-500">{k}</p>
                  <p className="text-xs font-medium text-white mt-0.5 truncate">{String(v)}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}