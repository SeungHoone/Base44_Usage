import React from "react";
import { cn } from "@/lib/utils";
import { Check, Database, Image, Box, Grid3X3, Eye, Car, Dna, Globe, BookOpen, Microscope } from "lucide-react";

export const datasetInfo = {
  cifar10: { name: "CIFAR-10", description: "60K 32×32 color images in 10 classes", size: "170 MB", classes: 10, icon: Grid3X3, color: "from-blue-500 to-cyan-400", task: "Classification" },
  cifar100: { name: "CIFAR-100", description: "60K 32×32 color images in 100 classes", size: "170 MB", classes: 100, icon: Grid3X3, color: "from-indigo-500 to-blue-400", task: "Classification" },
  imagenet: { name: "ImageNet (ILSVRC)", description: "1.2M training images, 1000 classes — the benchmark", size: "~150 GB", classes: 1000, icon: Image, color: "from-violet-500 to-purple-400", task: "Classification" },
  imagenet21k: { name: "ImageNet-21K", description: "14M+ images across 21K+ categories", size: "~1.3 TB", classes: 21841, icon: Image, color: "from-violet-600 to-indigo-400", task: "Classification" },
  coco: { name: "MS COCO 2017", description: "118K training images with detection & segmentation", size: "~25 GB", classes: 80, icon: Box, color: "from-fuchsia-500 to-pink-400", task: "Detection" },
  coco_panoptic: { name: "COCO Panoptic", description: "COCO with panoptic segmentation labels", size: "~26 GB", classes: 133, icon: Box, color: "from-rose-500 to-pink-400", task: "Segmentation" },
  voc: { name: "Pascal VOC 2012", description: "Image segmentation and detection dataset", size: "~2 GB", classes: 20, icon: Database, color: "from-orange-500 to-amber-400", task: "Detection" },
  mnist: { name: "MNIST", description: "70K handwritten digit images 28×28", size: "11 MB", classes: 10, icon: Grid3X3, color: "from-emerald-500 to-green-400", task: "Classification" },
  fashion_mnist: { name: "Fashion MNIST", description: "70K fashion product images 28×28", size: "30 MB", classes: 10, icon: Grid3X3, color: "from-rose-500 to-red-400", task: "Classification" },
  stl10: { name: "STL-10", description: "13K labeled images + 100K unlabeled, 96×96", size: "2.5 GB", classes: 10, icon: Grid3X3, color: "from-sky-500 to-blue-400", task: "Classification" },
  flowers102: { name: "Oxford Flowers-102", description: "8K images across 102 flower categories", size: "330 MB", classes: 102, icon: Image, color: "from-pink-500 to-rose-400", task: "Fine-grained" },
  stanford_cars: { name: "Stanford Cars", description: "16K images of 196 car categories", size: "2.1 GB", classes: 196, icon: Car, color: "from-slate-500 to-slate-400", task: "Fine-grained" },
  food101: { name: "Food-101", description: "101K images of 101 food categories", size: "5 GB", classes: 101, icon: Image, color: "from-amber-500 to-orange-400", task: "Fine-grained" },
  celeba: { name: "CelebA", description: "200K celebrity face images with 40 attributes", size: "1.4 GB", classes: 40, icon: Eye, color: "from-cyan-500 to-blue-400", task: "Attributes" },
  open_images: { name: "Open Images V7", description: "9M images with 600 object classes from Google", size: "~500 GB", classes: 600, icon: Globe, color: "from-green-500 to-emerald-400", task: "Detection" },
  ade20k: { name: "ADE20K", description: "20K images with 150 semantic categories", size: "3.8 GB", classes: 150, icon: Microscope, color: "from-teal-500 to-cyan-400", task: "Segmentation" },
  cityscapes: { name: "Cityscapes", description: "5K fine-annotated urban street scenes", size: "11 GB", classes: 30, icon: Car, color: "from-yellow-500 to-amber-400", task: "Segmentation" },
  kitti: { name: "KITTI", description: "Autonomous driving: 15K stereo scenes, lidar", size: "12 GB", classes: 8, icon: Car, color: "from-orange-600 to-red-400", task: "Detection" },
  medmnist: { name: "MedMNIST v2", description: "Standardized biomedical images 18 sub-datasets", size: "~600 MB", classes: "Varies", icon: Dna, color: "from-emerald-600 to-teal-400", task: "Medical" },
  places365: { name: "Places365", description: "1.8M scene images across 365 place categories", size: "~100 GB", classes: 365, icon: BookOpen, color: "from-purple-500 to-violet-400", task: "Scene" },
  custom: { name: "Custom Dataset", description: "Upload or link your own dataset", size: "Variable", classes: "Custom", icon: Database, color: "from-slate-500 to-slate-400", task: "Custom" },
};

const TASK_COLORS = {
  Classification: "text-blue-400",
  Detection: "text-fuchsia-400",
  Segmentation: "text-teal-400",
  "Fine-grained": "text-amber-400",
  Medical: "text-emerald-400",
  Scene: "text-purple-400",
  Attributes: "text-cyan-400",
  Custom: "text-slate-400",
};

export default function DatasetCard({ datasetKey, selected, onSelect }) {
  const ds = datasetInfo[datasetKey];
  if (!ds) return null;
  const Icon = ds.icon;

  return (
    <button
      onClick={() => onSelect(datasetKey)}
      className={cn(
        "relative group text-left rounded-2xl border p-5 transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-lg",
        selected
          ? "border-blue-500/60 bg-blue-500/5 shadow-lg shadow-blue-500/10"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      )}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3", ds.color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="font-semibold text-white text-sm pr-6">{ds.name}</h3>
      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ds.description}</p>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{ds.size}</span>
        <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{ds.classes} cls</span>
        <span className={cn("text-[10px] font-semibold", TASK_COLORS[ds.task] || "text-slate-400")}>{ds.task}</span>
      </div>
    </button>
  );
}