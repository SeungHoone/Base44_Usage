import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { modelInfo } from "./ModelCard";
import { Plus, Trash2, ChevronDown, ChevronUp, Wand2, Layers, Cpu } from "lucide-react";
import OptimizationSettings from "./OptimizationSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// OptimizationSettings imported above
import BaseModelViewer from "./BaseModelViewer";

const BASE_MODELS = ["resnet50", "resnet101", "efficientnet_b0", "efficientnet_b4", "vit_base", "swin_transformer", "convnext", "mobilenet_v3"];
const LAYER_TYPES = ["Conv2D", "BatchNorm2D", "ReLU", "MaxPool2D", "AvgPool2D", "Linear", "Dropout", "GELU", "Sigmoid", "Softmax", "MultiHeadAttention", "LayerNorm"];


function LayerRow({ layer, index, onUpdate, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-[10px] font-mono text-slate-500 w-5 text-center">{index + 1}</span>
        <Select value={layer.type} onValueChange={(v) => onUpdate(index, { ...layer, type: v })}>
          <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10 text-white w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LAYER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input
          placeholder="params (e.g. 256, 3x3)"
          value={layer.params || ""}
          onChange={(e) => onUpdate(index, { ...layer, params: e.target.value })}
          className="h-7 text-xs bg-white/5 border-white/10 text-white placeholder:text-slate-600 flex-1"
        />
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => onMoveUp(index)} disabled={isFirst} className="p-1 text-slate-600 hover:text-white disabled:opacity-20 transition-colors"><ChevronUp className="w-3.5 h-3.5" /></button>
          <button onClick={() => onMoveDown(index)} disabled={isLast} className="p-1 text-slate-600 hover:text-white disabled:opacity-20 transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
          <button onClick={() => onRemove(index)} className="p-1 text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  );
}

export default function CustomModelBuilder({ customModel, onChange }) {
  const mode = customModel.mode || "scratch"; // "scratch" | "extend"

  const setMode = (m) => onChange({ ...customModel, mode: m });

  const layers = customModel.layers || [
    { type: "Conv2D", params: "64, 3x3, padding=1" },
    { type: "BatchNorm2D", params: "64" },
    { type: "ReLU", params: "" },
    { type: "MaxPool2D", params: "2x2" },
    { type: "Linear", params: "512" },
    { type: "Dropout", params: "0.5" },
    { type: "Linear", params: "num_classes" },
  ];

  const updateLayers = (newLayers) => onChange({ ...customModel, layers: newLayers });

  const addLayer = () => updateLayers([...layers, { type: "Linear", params: "256" }]);
  const removeLayer = (i) => updateLayers(layers.filter((_, idx) => idx !== i));
  const updateLayer = (i, layer) => updateLayers(layers.map((l, idx) => idx === i ? layer : l));
  const moveUp = (i) => { if (i === 0) return; const l = [...layers]; [l[i - 1], l[i]] = [l[i], l[i - 1]]; updateLayers(l); };
  const moveDown = (i) => { if (i === layers.length - 1) return; const l = [...layers]; [l[i], l[i + 1]] = [l[i + 1], l[i]]; updateLayers(l); };

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setMode("scratch")}
          className={cn(
            "text-left rounded-2xl border p-5 transition-all duration-300",
            mode === "scratch"
              ? "border-violet-500/60 bg-violet-500/5 shadow-lg shadow-violet-500/10"
              : "border-white/10 bg-white/[0.02] hover:border-white/20"
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-3">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-white text-sm">Build from Scratch</h3>
          <p className="text-xs text-slate-400 mt-1">Design every layer yourself with full control over the architecture</p>
        </button>
        <button
          onClick={() => setMode("extend")}
          className={cn(
            "text-left rounded-2xl border p-5 transition-all duration-300",
            mode === "extend"
              ? "border-blue-500/60 bg-blue-500/5 shadow-lg shadow-blue-500/10"
              : "border-white/10 bg-white/[0.02] hover:border-white/20"
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-3">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-white text-sm">Modify a Base Model</h3>
          <p className="text-xs text-slate-400 mt-1">Start from a pretrained backbone and customize its head or fine-tune layers</p>
        </button>
      </div>

      {/* Extend mode: base model picker */}
      {mode === "extend" && (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <Label className="text-xs text-slate-400">Select Base Model</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BASE_MODELS.map((key) => {
              const m = modelInfo[key];
              const selected = customModel.base_model === key;
              return (
                <button
                  key={key}
                  onClick={() => onChange({ ...customModel, base_model: key })}
                  className={cn(
                    "text-left rounded-xl border px-3 py-2.5 text-xs transition-all",
                    selected
                      ? "border-blue-500/60 bg-blue-500/10 text-white"
                      : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white"
                  )}
                >
                  <p className="font-semibold">{m?.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{m?.params}</p>
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Freeze Backbone</Label>
              <Select value={customModel.freeze || "full"} onValueChange={(v) => onChange({ ...customModel, freeze: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No freeze — train all layers</SelectItem>
                  <SelectItem value="partial">Partial — freeze early layers</SelectItem>
                  <SelectItem value="full">Full — freeze backbone, train head only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Pretrained Weights</Label>
              <Select value={customModel.weights || "imagenet"} onValueChange={(v) => onChange({ ...customModel, weights: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="imagenet">ImageNet pretrained</SelectItem>
                  <SelectItem value="imagenet21k">ImageNet-21K pretrained</SelectItem>
                  <SelectItem value="none">Random initialization</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Base model architecture viewer */}
          {customModel.base_model && (
            <BaseModelViewer baseModelKey={customModel.base_model} freeze={customModel.freeze || "full"} />
          )}
        </div>
      )}

      {/* Layer editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-violet-400" />
            {mode === "extend" ? "Custom Head Layers" : "Architecture Layers"}
          </h4>
          <Button
            size="sm"
            variant="outline"
            onClick={addLayer}
            className="h-7 text-xs border-white/10 text-slate-300 hover:bg-white/5"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Layer
          </Button>
        </div>
        <div className="space-y-2">
          {layers.map((layer, i) => (
            <LayerRow
              key={i}
              layer={layer}
              index={i}
              onUpdate={updateLayer}
              onRemove={removeLayer}
              onMoveUp={moveUp}
              onMoveDown={moveDown}
              isFirst={i === 0}
              isLast={i === layers.length - 1}
            />
          ))}
        </div>
      </div>


    </div>
  );
}
