import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Play, Square, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { datasetInfo } from "@/components/training/DatasetCard";
import { modelInfo } from "@/components/training/ModelCard";

const EPOCH_INTERVAL_MS = 600; // ms per simulated epoch

function simulateEpoch(epochNum, totalEpochs, prev) {
  const progress = epochNum / totalEpochs;
  const noise = () => (Math.random() - 0.5) * 0.04;
  const trainLoss = Math.max(0.05, 2.3 * Math.exp(-0.045 * epochNum) + 0.05 + noise());
  const valLoss   = Math.max(0.08, 2.4 * Math.exp(-0.04  * epochNum) + 0.08 + noise() * 1.5);
  const trainAcc  = Math.min(99.5, 10 + 88 * (1 - Math.exp(-0.05  * epochNum)) + noise() * 25);
  const valAcc    = Math.min(97,   9  + 85 * (1 - Math.exp(-0.045 * epochNum)) + noise() * 30);
  return {
    epoch: epochNum,
    trainLoss: +trainLoss.toFixed(4),
    valLoss:   +valLoss.toFixed(4),
    trainAcc:  +Math.max(0, trainAcc).toFixed(2),
    valAcc:    +Math.max(0, valAcc).toFixed(2),
  };
}

const CHART_TOOLTIP_STYLE = {
  contentStyle: { background: "#0f0f17", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11 },
  labelStyle: { color: "#94a3b8" },
};

export default function InBrowserTraining({ job, open, onClose, onFinished }) {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [curves, setCurves] = useState([]);
  const intervalRef = useRef(null);
  const epochRef = useRef(0);
  const totalEpochs = job?.epochs || 100;

  const ds = datasetInfo[job?.dataset];
  const model = modelInfo[job?.model];

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setCurves([]);
      setRunning(false);
      setDone(false);
      epochRef.current = 0;
    }
    return () => clearInterval(intervalRef.current);
  }, [open]);

  const start = () => {
    if (running || done) return;
    setRunning(true);

    intervalRef.current = setInterval(() => {
      epochRef.current += 1;
      const epoch = epochRef.current;
      setCurves(prev => {
        const point = simulateEpoch(epoch, totalEpochs, prev[prev.length - 1]);
        return [...prev, point];
      });
      if (epoch >= totalEpochs) {
        clearInterval(intervalRef.current);
        setRunning(false);
        setDone(true);
        base44.entities.TrainingJob.update(job.id, { status: "completed" }).then(onFinished);
      }
    }, EPOCH_INTERVAL_MS);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    base44.entities.TrainingJob.update(job.id, { status: "configured" });
  };

  const currentEpoch = curves.length;
  const progressPct = (currentEpoch / totalEpochs) * 100;
  const latest = curves[curves.length - 1];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && running) { stop(); } onClose(); }}>
      <DialogContent className="max-w-2xl bg-[#0d0d16] border border-white/10 text-white p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/5">
          <DialogTitle className="text-base font-bold">{job?.name || "Training Job"}</DialogTitle>
          <p className="text-xs text-slate-500 mt-1">
            {ds?.name || job?.dataset} · {model?.name || job?.model} · {totalEpochs} epochs
          </p>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {done ? "Training complete" : running ? "Training in progress…" : "Ready to start"}
              </span>
              <span className="font-mono text-white">
                Epoch {currentEpoch} / {totalEpochs}
              </span>
            </div>
            <Progress value={progressPct} className="h-2 bg-white/5" />
          </div>

          {/* Live stats */}
          {latest && (
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Train Loss", value: latest.trainLoss.toFixed(4), color: "text-pink-400" },
                { label: "Val Loss",   value: latest.valLoss.toFixed(4),   color: "text-orange-400" },
                { label: "Train Acc",  value: `${latest.trainAcc.toFixed(1)}%`, color: "text-violet-400" },
                { label: "Val Acc",    value: `${latest.valAcc.toFixed(1)}%`,   color: "text-emerald-400" },
              ].map(m => (
                <div key={m.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[10px] text-slate-500">{m.label}</p>
                  <p className={cn("text-lg font-bold mt-0.5", m.color)}>{m.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Charts */}
          {curves.length > 0 && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-white mb-2">Accuracy</p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={curves} margin={{ top: 2, right: 2, bottom: 2, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="epoch" tick={{ fontSize: 9, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 9, fill: "#64748b" }} domain={[0, 100]} unit="%" />
                    <Tooltip {...CHART_TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="trainAcc" name="Train" stroke="#818cf8" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                    <Line type="monotone" dataKey="valAcc"   name="Val"   stroke="#34d399" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-xs font-semibold text-white mb-2">Loss</p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={curves} margin={{ top: 2, right: 2, bottom: 2, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="epoch" tick={{ fontSize: 9, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 9, fill: "#64748b" }} />
                    <Tooltip {...CHART_TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="trainLoss" name="Train" stroke="#f472b6" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                    <Line type="monotone" dataKey="valLoss"   name="Val"   stroke="#fb923c" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-end gap-3">
            {done ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Training Complete!
              </div>
            ) : running ? (
              <Button onClick={stop} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                <Square className="w-3.5 h-3.5 mr-2" />
                Stop
              </Button>
            ) : (
              <Button onClick={start} className="bg-blue-500 hover:bg-blue-600 text-white">
                <Play className="w-3.5 h-3.5 mr-2" />
                Start Training
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
