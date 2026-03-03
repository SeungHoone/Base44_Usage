import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Lock, Unlock } from "lucide-react";

// Simplified layer-by-layer architecture for each base model
const BASE_MODEL_ARCHITECTURES = {
  resnet50: {
    name: "ResNet-50",
    input: "224×224×3",
    groups: [
      { name: "Stem", frozen_default: true, color: "from-slate-600 to-slate-500", layers: [
        { name: "Conv2D", shape: "112×112×64", detail: "7×7, stride 2" },
        { name: "BatchNorm + ReLU", shape: "112×112×64", detail: "" },
        { name: "MaxPool2D", shape: "56×56×64", detail: "3×3, stride 2" },
      ]},
      { name: "Layer 1", frozen_default: true, color: "from-blue-700 to-blue-600", layers: [
        { name: "Bottleneck ×3", shape: "56×56×256", detail: "1×1, 3×3, 1×1 convs" },
      ]},
      { name: "Layer 2", frozen_default: true, color: "from-blue-600 to-cyan-600", layers: [
        { name: "Bottleneck ×4", shape: "28×28×512", detail: "stride 2 in first block" },
      ]},
      { name: "Layer 3", frozen_default: false, color: "from-violet-600 to-indigo-500", layers: [
        { name: "Bottleneck ×6", shape: "14×14×1024", detail: "stride 2 in first block" },
      ]},
      { name: "Layer 4", frozen_default: false, color: "from-fuchsia-600 to-violet-500", layers: [
        { name: "Bottleneck ×3", shape: "7×7×2048", detail: "stride 2 in first block" },
      ]},
      { name: "Head", frozen_default: false, color: "from-amber-500 to-orange-400", layers: [
        { name: "AdaptiveAvgPool", shape: "1×1×2048", detail: "" },
        { name: "Flatten", shape: "2048", detail: "" },
        { name: "Linear (classifier)", shape: "num_classes", detail: "← replace this" },
      ]},
    ],
  },
  resnet101: {
    name: "ResNet-101",
    input: "224×224×3",
    groups: [
      { name: "Stem", frozen_default: true, color: "from-slate-600 to-slate-500", layers: [{ name: "Conv2D + BN + ReLU + MaxPool", shape: "56×56×64", detail: "7×7 stem" }] },
      { name: "Layer 1", frozen_default: true, color: "from-blue-700 to-blue-600", layers: [{ name: "Bottleneck ×3", shape: "56×56×256", detail: "" }] },
      { name: "Layer 2", frozen_default: true, color: "from-blue-600 to-cyan-600", layers: [{ name: "Bottleneck ×4", shape: "28×28×512", detail: "" }] },
      { name: "Layer 3", frozen_default: false, color: "from-violet-600 to-indigo-500", layers: [{ name: "Bottleneck ×23", shape: "14×14×1024", detail: "deep feature extractor" }] },
      { name: "Layer 4", frozen_default: false, color: "from-fuchsia-600 to-violet-500", layers: [{ name: "Bottleneck ×3", shape: "7×7×2048", detail: "" }] },
      { name: "Head", frozen_default: false, color: "from-amber-500 to-orange-400", layers: [{ name: "AvgPool → Linear", shape: "num_classes", detail: "← replace this" }] },
    ],
  },
  efficientnet_b0: {
    name: "EfficientNet-B0",
    input: "224×224×3",
    groups: [
      { name: "Stem", frozen_default: true, color: "from-slate-600 to-slate-500", layers: [{ name: "Conv2D + BN + Swish", shape: "112×112×32", detail: "3×3, stride 2" }] },
      { name: "MBConv1 (Stage 1)", frozen_default: true, color: "from-emerald-700 to-emerald-600", layers: [{ name: "MBConv1 ×1", shape: "112×112×16", detail: "k=3, no SE" }] },
      { name: "MBConv6 (Stage 2-3)", frozen_default: true, color: "from-emerald-600 to-teal-500", layers: [{ name: "MBConv6 ×2+2", shape: "28×28×40", detail: "k=3,5 with SE" }] },
      { name: "MBConv6 (Stage 4-5)", frozen_default: false, color: "from-teal-600 to-cyan-500", layers: [{ name: "MBConv6 ×3+3", shape: "14×14×112", detail: "k=3,5 with SE" }] },
      { name: "MBConv6 (Stage 6-7)", frozen_default: false, color: "from-violet-600 to-indigo-500", layers: [{ name: "MBConv6 ×4+1", shape: "7×7×320", detail: "k=5,3 with SE" }] },
      { name: "Head", frozen_default: false, color: "from-amber-500 to-orange-400", layers: [{ name: "Conv + Pool → Linear", shape: "num_classes", detail: "1280-d bottleneck" }] },
    ],
  },
  efficientnet_b4: {
    name: "EfficientNet-B4",
    input: "380×380×3",
    groups: [
      { name: "Stem", frozen_default: true, color: "from-slate-600 to-slate-500", layers: [{ name: "Conv2D + BN + Swish", shape: "190×190×48", detail: "" }] },
      { name: "MBConv Stages 1-3", frozen_default: true, color: "from-emerald-700 to-emerald-500", layers: [{ name: "MBConv ×2+4+4", shape: "48×48×56", detail: "" }] },
      { name: "MBConv Stages 4-5", frozen_default: false, color: "from-teal-600 to-cyan-500", layers: [{ name: "MBConv ×6+6", shape: "12×12×160", detail: "" }] },
      { name: "MBConv Stage 6-7", frozen_default: false, color: "from-violet-600 to-indigo-500", layers: [{ name: "MBConv ×8+2", shape: "6×6×448", detail: "" }] },
      { name: "Head", frozen_default: false, color: "from-amber-500 to-orange-400", layers: [{ name: "Conv + Pool → Linear", shape: "num_classes", detail: "1792-d bottleneck" }] },
    ],
  },
  vit_base: {
    name: "ViT-Base/16",
    input: "224×224×3",
    groups: [
      { name: "Patch Embedding", frozen_default: true, color: "from-slate-600 to-slate-500", layers: [{ name: "PatchEmbed (16×16 patches)", shape: "196 tokens × 768", detail: "14×14 grid" }] },
      { name: "Transformer Blocks 1-4", frozen_default: true, color: "from-fuchsia-700 to-pink-600", layers: [{ name: "TransformerBlock ×4", shape: "196×768", detail: "12 heads, MLP=3072" }] },
      { name: "Transformer Blocks 5-8", frozen_default: false, color: "from-fuchsia-600 to-violet-500", layers: [{ name: "TransformerBlock ×4", shape: "196×768", detail: "12 heads, MLP=3072" }] },
      { name: "Transformer Blocks 9-12", frozen_default: false, color: "from-violet-600 to-indigo-500", layers: [{ name: "TransformerBlock ×4", shape: "196×768", detail: "12 heads, MLP=3072" }] },
      { name: "Head", frozen_default: false, color: "from-amber-500 to-orange-400", layers: [{ name: "LayerNorm + Linear", shape: "num_classes", detail: "[CLS] token" }] },
    ],
  },
  swin_transformer: {
    name: "Swin-Base",
    input: "224×224×3",
    groups: [
      { name: "Patch Partition", frozen_default: true, color: "from-slate-600 to-slate-500", layers: [{ name: "PatchEmbed 4×4", shape: "56×56×128", detail: "" }] },
      { name: "Stage 1", frozen_default: true, color: "from-violet-700 to-violet-600", layers: [{ name: "SwinBlock ×2", shape: "56×56×128", detail: "W-MSA + SW-MSA" }] },
      { name: "Stage 2", frozen_default: true, color: "from-violet-600 to-indigo-500", layers: [{ name: "PatchMerge + SwinBlock ×2", shape: "28×28×256", detail: "" }] },
      { name: "Stage 3", frozen_default: false, color: "from-indigo-600 to-blue-500", layers: [{ name: "PatchMerge + SwinBlock ×18", shape: "14×14×512", detail: "" }] },
      { name: "Stage 4", frozen_default: false, color: "from-blue-600 to-cyan-500", layers: [{ name: "PatchMerge + SwinBlock ×2", shape: "7×7×1024", detail: "" }] },
      { name: "Head", frozen_default: false, color: "from-amber-500 to-orange-400", layers: [{ name: "AdaptiveAvgPool → Linear", shape: "num_classes", detail: "" }] },
    ],
  },
  convnext: {
    name: "ConvNeXt-Base",
    input: "224×224×3",
    groups: [
      { name: "Stem", frozen_default: true, color: "from-slate-600 to-slate-500", layers: [{ name: "Conv2D + LayerNorm", shape: "56×56×128", detail: "4×4, stride 4" }] },
      { name: "Stage 1", frozen_default: true, color: "from-teal-700 to-teal-600", layers: [{ name: "ConvNeXtBlock ×3", shape: "56×56×128", detail: "DW-Conv 7×7" }] },
      { name: "Stage 2", frozen_default: true, color: "from-teal-600 to-cyan-500", layers: [{ name: "Downsample + Block ×3", shape: "28×28×256", detail: "" }] },
      { name: "Stage 3", frozen_default: false, color: "from-cyan-600 to-blue-500", layers: [{ name: "Downsample + Block ×27", shape: "14×14×512", detail: "" }] },
      { name: "Stage 4", frozen_default: false, color: "from-blue-600 to-indigo-500", layers: [{ name: "Downsample + Block ×3", shape: "7×7×1024", detail: "" }] },
      { name: "Head", frozen_default: false, color: "from-amber-500 to-orange-400", layers: [{ name: "AvgPool → LayerNorm → Linear", shape: "num_classes", detail: "" }] },
    ],
  },
  mobilenet_v3: {
    name: "MobileNet V3",
    input: "224×224×3",
    groups: [
      { name: "Stem", frozen_default: true, color: "from-slate-600 to-slate-500", layers: [{ name: "Conv + HardSwish", shape: "112×112×16", detail: "" }] },
      { name: "InvertedResidual ×5", frozen_default: true, color: "from-amber-700 to-amber-600", layers: [{ name: "IRB blocks", shape: "14×14×96", detail: "with SE + HardSwish" }] },
      { name: "InvertedResidual ×6", frozen_default: false, color: "from-amber-600 to-yellow-500", layers: [{ name: "IRB blocks", shape: "7×7×576", detail: "with SE + HardSwish" }] },
      { name: "Head", frozen_default: false, color: "from-amber-500 to-orange-400", layers: [{ name: "Conv + Pool → Linear", shape: "num_classes", detail: "1280-d with HardSwish" }] },
    ],
  },
};

export default function BaseModelViewer({ baseModelKey, freeze }) {
  const arch = BASE_MODEL_ARCHITECTURES[baseModelKey];
  const [expandedGroups, setExpandedGroups] = useState(new Set(arch?.groups.map((_, i) => i) || []));

  if (!arch) return null;

  const toggleGroup = (i) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const isFrozen = (group) => {
    if (freeze === "none") return false;
    if (freeze === "full") return group.name !== "Head";
    if (freeze === "partial") return group.frozen_default;
    return group.frozen_default;
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">{arch.name} — Architecture</h4>
        <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">Input: {arch.input}</span>
      </div>

      {/* Vertical layer flow */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-5 top-4 bottom-4 w-px bg-white/10" />

        <div className="space-y-2">
          {arch.groups.map((group, gi) => {
            const frozen = isFrozen(group);
            const expanded = expandedGroups.has(gi);
            return (
              <div key={gi} className={cn(
                "relative rounded-xl border overflow-hidden transition-all",
                frozen ? "border-slate-700/60 bg-slate-900/50" : "border-white/10 bg-white/[0.03]"
              )}>
                <button
                  onClick={() => toggleGroup(gi)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left"
                >
                  {/* Dot on the line */}
                  <div className={cn(
                    "w-3 h-3 rounded-full border-2 shrink-0 z-10",
                    frozen ? "bg-slate-700 border-slate-500" : `bg-gradient-to-br ${group.color} border-white/20`
                  )} />
                  <div className={cn("w-2 h-5 rounded-sm bg-gradient-to-b shrink-0", group.color, frozen && "opacity-30")} />
                  <span className="text-xs font-semibold text-white flex-1">{group.name}</span>
                  {frozen ? (
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Lock className="w-3 h-3" /> Frozen
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <Unlock className="w-3 h-3" /> Trainable
                    </span>
                  )}
                  {expanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 ml-1" />}
                </button>

                {expanded && (
                  <div className="px-4 pb-3 space-y-1.5 border-t border-white/5">
                    {group.layers.map((layer, li) => (
                      <div key={li} className="flex items-center gap-3 ml-6 pl-3 border-l border-white/5">
                        <div>
                          <span className="text-xs text-white">{layer.name}</span>
                          {layer.detail && <span className="text-[10px] text-slate-500 ml-2">{layer.detail}</span>}
                        </div>
                        <span className="ml-auto text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full shrink-0">{layer.shape}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-slate-500">
        <Lock className="w-3 h-3 inline mr-1" />Frozen layers don't update during training.
        <Unlock className="w-3 h-3 inline mx-1" />Trainable layers are updated.
        Change with "Freeze Backbone" above.
      </p>
    </div>
  );
}