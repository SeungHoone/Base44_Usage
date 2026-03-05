import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Clock, CheckCircle2, Loader2, XCircle, FileText, Play, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { datasetInfo } from "@/components/training/DatasetCard";
import { modelInfo } from "@/components/training/ModelCard";

const statusConfig = {
  draft: { label: "Draft", color: "bg-slate-500/20 text-slate-400 border-slate-500/30", icon: FileText },
  configured: { label: "Configured", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Clock },
  running: { label: "Running", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Loader2 },
  completed: { label: "Completed", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
  failed: { label: "Failed", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
};

export default function JobCard({ job, onDelete, onClick, onStatusChange }) {
  const ds = datasetInfo[job.dataset];
  const model = modelInfo[job.model];
  const status = statusConfig[job.status] || statusConfig.draft;
  const StatusIcon = status.icon;

  const handleTrain = (e) => {
    e.stopPropagation();
    onStatusChange(job.id, "running");
  };

  const handleRetrain = (e) => {
    e.stopPropagation();
    onStatusChange(job.id, "running");
  };

  return (
    <div
      onClick={onClick}
      className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04] cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white text-sm">{job.name || "Untitled Job"}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {job.created_date ? format(new Date(job.created_date), "MMM d, yyyy 'at' h:mm a") : ""}
          </p>
        </div>
        <Badge variant="outline" className={cn("text-[10px] flex items-center gap-1", status.color)}>
          <StatusIcon className={cn("w-3 h-3", job.status === "running" && "animate-spin")} />
          {status.label}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded-lg">
          {ds?.name || job.dataset}
        </span>
        <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded-lg">
          {model?.name || job.model}
        </span>
        <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded-lg">
          {job.epochs || 100} epochs
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {job.status === "configured" && (
            <Button
              size="sm"
              onClick={handleTrain}
              className="h-7 text-[11px] px-3 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/30"
              variant="ghost"
            >
              <Play className="w-3 h-3 mr-1" />
              Start Training
            </Button>
          )}
          {(job.status === "completed" || job.status === "failed") && (
            <Button
              size="sm"
              onClick={handleRetrain}
              className="h-7 text-[11px] px-3 bg-violet-500/20 hover:bg-violet-500/40 text-violet-300 border border-violet-500/30"
              variant="ghost"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Retrain
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(job.id);
          }}
          className="h-7 w-7 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
