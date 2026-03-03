import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Settings2 } from "lucide-react";

export default function TrainingParams({ config, onChange }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Settings2 className="w-4 h-4 text-amber-400" />
        Hyperparameters
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-slate-400">Epochs</Label>
            <span className="text-xs font-mono text-white">{config.epochs || 100}</span>
          </div>
          <Slider
            value={[config.epochs || 100]}
            onValueChange={([v]) => onChange({ epochs: v })}
            min={1}
            max={500}
            step={1}
            className="[&_[role=slider]]:bg-amber-400"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-slate-400">Batch Size</Label>
            <span className="text-xs font-mono text-white">{config.batch_size || 32}</span>
          </div>
          <Slider
            value={[config.batch_size || 32]}
            onValueChange={([v]) => onChange({ batch_size: v })}
            min={1}
            max={256}
            step={1}
            className="[&_[role=slider]]:bg-blue-400"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-slate-400">Learning Rate</Label>
          <Input
            type="number"
            step="0.0001"
            min="0.00001"
            max="1"
            value={config.learning_rate || 0.001}
            onChange={(e) => onChange({ learning_rate: parseFloat(e.target.value) })}
            className="bg-white/5 border-white/10 text-white font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}