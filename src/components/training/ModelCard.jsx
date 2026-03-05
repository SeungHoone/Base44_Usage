import React from "react";
import { cn } from "@/lib/utils";
import { Check, Cpu, Layers, Zap, Sparkles, Eye, Box } from "lucide-react";

export const modelInfo = {
  // ResNet family
  resnet18: { name: "ResNet-18", family: "ResNet", params: "11.7M", description: "Lightweight residual network, great for smaller datasets", speed: "Fast", accuracy: "Good", icon: Layers, color: "from-blue-600 to-blue-400", task: "Classification" },
  resnet34: { name: "ResNet-34", family: "ResNet", params: "21.8M", description: "Deeper ResNet variant, balanced speed/accuracy", speed: "Fast", accuracy: "Good", icon: Layers, color: "from-blue-600 to-blue-400", task: "Classification" },
  resnet50: { name: "ResNet-50", family: "ResNet", params: "25.6M", description: "Balanced performance and speed, industry standard", speed: "Medium", accuracy: "Very Good", icon: Layers, color: "from-blue-600 to-cyan-400", task: "Classification" },
  resnet101: { name: "ResNet-101", family: "ResNet", params: "44.5M", description: "Deep residual network for high accuracy tasks", speed: "Slow", accuracy: "Excellent", icon: Layers, color: "from-blue-700 to-blue-500", task: "Classification" },
  resnet152: { name: "ResNet-152", family: "ResNet", params: "60.2M", description: "Deepest standard ResNet, maximum accuracy", speed: "Very Slow", accuracy: "Excellent", icon: Layers, color: "from-blue-800 to-blue-600", task: "Classification" },
  // VGG
  vgg16: { name: "VGG-16", family: "VGG", params: "138M", description: "Classic deep CNN, simple architecture", speed: "Slow", accuracy: "Good", icon: Cpu, color: "from-purple-600 to-purple-400", task: "Classification" },
  vgg19: { name: "VGG-19", family: "VGG", params: "144M", description: "Deeper VGG variant, strong feature extraction", speed: "Very Slow", accuracy: "Good", icon: Cpu, color: "from-purple-700 to-purple-500", task: "Classification" },
  // EfficientNet
  efficientnet_b0: { name: "EfficientNet-B0", family: "EfficientNet", params: "5.3M", description: "Compound scaling, best efficiency-accuracy trade-off", speed: "Fast", accuracy: "Very Good", icon: Zap, color: "from-emerald-600 to-emerald-400", task: "Classification" },
  efficientnet_b4: { name: "EfficientNet-B4", family: "EfficientNet", params: "19M", description: "Scaled up variant with excellent accuracy", speed: "Medium", accuracy: "Excellent", icon: Zap, color: "from-emerald-700 to-green-400", task: "Classification" },
  efficientnet_b7: { name: "EfficientNet-B7", family: "EfficientNet", params: "66M", description: "Largest EfficientNet, top accuracy at high cost", speed: "Slow", accuracy: "Top-tier", icon: Zap, color: "from-emerald-800 to-teal-400", task: "Classification" },
  efficientnetv2_s: { name: "EfficientNetV2-S", family: "EfficientNetV2", params: "21.5M", description: "Faster training with progressive learning", speed: "Fast", accuracy: "Excellent", icon: Zap, color: "from-teal-600 to-emerald-400", task: "Classification" },
  efficientnetv2_l: { name: "EfficientNetV2-L", family: "EfficientNetV2", params: "120M", description: "Large V2, state-of-the-art accuracy", speed: "Slow", accuracy: "Top-tier", icon: Zap, color: "from-teal-700 to-green-500", task: "Classification" },
  // MobileNet
  mobilenet_v3: { name: "MobileNet V3", family: "MobileNet", params: "5.4M", description: "Optimized for mobile & edge deployment", speed: "Very Fast", accuracy: "Good", icon: Zap, color: "from-amber-500 to-yellow-400", task: "Classification" },
  mobilenetv2: { name: "MobileNet V2", family: "MobileNet", params: "3.4M", description: "Inverted residuals, ideal for edge devices", speed: "Very Fast", accuracy: "Decent", icon: Zap, color: "from-yellow-500 to-amber-400", task: "Classification" },
  // Vision Transformers
  vit_base: { name: "ViT-Base/16", family: "Vision Transformer", params: "86M", description: "Transformer architecture for vision, state-of-the-art", speed: "Medium", accuracy: "Excellent", icon: Sparkles, color: "from-fuchsia-600 to-pink-400", task: "Classification" },
  vit_large: { name: "ViT-Large/16", family: "Vision Transformer", params: "304M", description: "Large-scale vision transformer for top accuracy", speed: "Slow", accuracy: "Top-tier", icon: Sparkles, color: "from-fuchsia-700 to-rose-400", task: "Classification" },
  deit_base: { name: "DeiT-Base", family: "DeiT", params: "86M", description: "Data-efficient ViT, trained without external data", speed: "Medium", accuracy: "Excellent", icon: Sparkles, color: "from-pink-600 to-fuchsia-400", task: "Classification" },
  deit_small: { name: "DeiT-Small", family: "DeiT", params: "22M", description: "Smaller DeiT, fast and data-efficient", speed: "Fast", accuracy: "Very Good", icon: Sparkles, color: "from-pink-500 to-rose-400", task: "Classification" },
  // Swin
  swin_tiny: { name: "Swin-Tiny", family: "Swin Transformer", params: "28M", description: "Smallest Swin, great speed-accuracy trade-off", speed: "Fast", accuracy: "Very Good", icon: Sparkles, color: "from-violet-500 to-indigo-400", task: "Classification" },
  swin_transformer: { name: "Swin-Base", family: "Swin Transformer", params: "88M", description: "Shifted window transformer, efficient attention", speed: "Medium", accuracy: "Excellent", icon: Sparkles, color: "from-violet-600 to-indigo-400", task: "Classification" },
  swin_large: { name: "Swin-Large", family: "Swin Transformer", params: "197M", description: "Large Swin Transformer for demanding tasks", speed: "Slow", accuracy: "Top-tier", icon: Sparkles, color: "from-violet-700 to-purple-500", task: "Classification" },
  // ConvNeXt
  convnext: { name: "ConvNeXt-Base", family: "ConvNeXt", params: "89M", description: "Modernized ConvNet competing with transformers", speed: "Medium", accuracy: "Excellent", icon: Layers, color: "from-teal-600 to-cyan-400", task: "Classification" },
  convnext_large: { name: "ConvNeXt-Large", family: "ConvNeXt", params: "198M", description: "Larger ConvNeXt for maximum accuracy", speed: "Slow", accuracy: "Top-tier", icon: Layers, color: "from-teal-700 to-cyan-500", task: "Classification" },
  // YOLO / Detection
  yolov8n: { name: "YOLOv8-Nano", family: "YOLOv8", params: "3.2M", description: "Fastest nano YOLO for real-time detection", speed: "Very Fast", accuracy: "Decent", icon: Eye, color: "from-lime-500 to-green-400", task: "Detection" },
  yolov8s: { name: "YOLOv8-Small", family: "YOLOv8", params: "11.2M", description: "Small YOLO balancing speed and accuracy", speed: "Fast", accuracy: "Good", icon: Eye, color: "from-lime-600 to-emerald-400", task: "Detection" },
  yolov8x: { name: "YOLOv8-XL", family: "YOLOv8", params: "68.2M", description: "Largest YOLO, best detection accuracy", speed: "Medium", accuracy: "Excellent", icon: Eye, color: "from-green-600 to-lime-500", task: "Detection" },
  // DETR
  detr_resnet50: { name: "DETR (ResNet-50)", family: "DETR", params: "41M", description: "End-to-end transformer-based object detection", speed: "Medium", accuracy: "Very Good", icon: Box, color: "from-orange-500 to-amber-400", task: "Detection" },
  // custom
  custom: { name: "Custom Model", family: "Custom", params: "Variable", description: "Design your own architecture from scratch or extend a base model", speed: "—", accuracy: "—", icon: Cpu, color: "from-slate-500 to-slate-400", task: "Any" },
};

const taskColors = {
  Classification: "text-blue-400",
  Detection: "text-fuchsia-400",
  Segmentation: "text-teal-400",
  "Fine-grained": "text-amber-400",
  Any: "text-slate-400",
};

const speedColors = {
  "Very Fast": "text-green-400",
  "Fast": "text-emerald-400",
  "Medium": "text-yellow-400",
  "Slow": "text-orange-400",
  "Very Slow": "text-red-400",
  "—": "text-slate-500",
};

export default function ModelCard({ modelKey, selected, onSelect }) {
  const model = modelInfo[modelKey];
  if (!model) return null;
  const Icon = model.icon;

  return (
    <button
      onClick={() => onSelect(modelKey)}
      className={cn(
        "relative group text-left rounded-2xl border p-5 transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-lg",
        selected
          ? "border-violet-500/60 bg-violet-500/5 shadow-lg shadow-violet-500/10"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      )}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0", model.color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-white text-sm pr-6">{model.name}</h3>
          <p className="text-[10px] text-slate-500 font-mono">{model.family} · {model.params}</p>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-3 leading-relaxed">{model.description}</p>
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        <span className={cn("text-[10px] font-semibold", speedColors[model.speed])}>{model.speed}</span>
        <span className="text-[10px] text-slate-600">·</span>
        <span className="text-[10px] text-slate-400">{model.accuracy}</span>
        {model.task && (
          <>
            <span className="text-[10px] text-slate-600">·</span>
            <span className={cn("text-[10px] font-semibold", taskColors[model.task] || "text-slate-400")}>{model.task}</span>
          </>
        )}
      </div>
    </button>
  );
}
