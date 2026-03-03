import React from "react";
import { datasetInfo } from "./DatasetCard";
import { modelInfo } from "./ModelCard";
import { Database, Cpu, Server, Cloud, Settings2 } from "lucide-react";

export default function JobSummary({ config }) {
  const ds = datasetInfo[config.dataset];
  const model = modelInfo[config.model];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-5">
      <h3 className="text-sm font-semibold text-white">Training Configuration Summary</h3>

      <div className="space-y-4">
        {/* Dataset */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <Database className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Dataset</p>
            <p className="text-sm font-medium text-white">{ds?.name || config.dataset}</p>
            {config.dataset === "custom" && config.dataset_custom_url && (
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[300px]">{config.dataset_custom_url}</p>
            )}
          </div>
        </div>

        {/* Model */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <Cpu className="w-5 h-5 text-violet-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Model</p>
            <p className="text-sm font-medium text-white">{model?.name || config.model}</p>
            <p className="text-xs text-slate-400 mt-0.5">{model?.params} parameters</p>
          </div>
        </div>

        {/* Server */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
          {config.server_type === "own_server" ? (
            <Server className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          ) : (
            <Cloud className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
          )}
          <div>
            <p className="text-xs text-slate-500">Server</p>
            {config.server_type === "own_server" ? (
              <>
                <p className="text-sm font-medium text-white">{config.server_host || "Not configured"}</p>
                {config.server_gpu && (
                  <p className="text-xs text-slate-400 mt-0.5">GPU: {config.server_gpu.replace(/_/g, " ").toUpperCase()}</p>
                )}
                {config.checkpoint_path && (
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{config.checkpoint_path}</p>
                )}
              </>
            ) : (
              <p className="text-sm font-medium text-white">Cloud provider (to be selected)</p>
            )}
          </div>
        </div>

        {/* Hyperparams */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <Settings2 className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Hyperparameters</p>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-white">
                <span className="text-slate-400">Epochs:</span> {config.epochs || 100}
              </span>
              <span className="text-xs text-white">
                <span className="text-slate-400">Batch:</span> {config.batch_size || 32}
              </span>
              <span className="text-xs text-white">
                <span className="text-slate-400">LR:</span> {config.learning_rate || 0.001}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}