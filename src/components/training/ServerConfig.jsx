import React from "react";
import { cn } from "@/lib/utils";
import { Server, Cloud, ExternalLink, Monitor, Wifi, HardDrive, Code2, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const cloudProviders = [
  { name: "Lambda Cloud", url: "https://lambdalabs.com/service/gpu-cloud", gpu: "A100 / H100", price: "From $1.10/hr", description: "Best GPU cloud for ML training", color: "from-purple-500 to-indigo-500" },
  { name: "RunPod", url: "https://www.runpod.io/", gpu: "A100 / RTX 4090", price: "From $0.44/hr", description: "Affordable GPU rentals with flexible billing", color: "from-blue-500 to-cyan-500" },
  { name: "Vast.ai", url: "https://vast.ai/", gpu: "Various", price: "From $0.20/hr", description: "GPU marketplace with cheapest options", color: "from-emerald-500 to-green-500" },
  { name: "AWS (EC2 P4d)", url: "https://aws.amazon.com/ec2/instance-types/p4/", gpu: "A100 × 8", price: "From $32.77/hr", description: "Enterprise-grade with full AWS ecosystem", color: "from-orange-500 to-amber-500" },
  { name: "Google Cloud (A3)", url: "https://cloud.google.com/compute/docs/gpus", gpu: "H100 × 8", price: "On demand", description: "Integrated with TPUs and Vertex AI", color: "from-red-500 to-rose-500" },
  { name: "Paperspace", url: "https://www.paperspace.com/", gpu: "A100 / RTX", price: "From $2.30/hr", description: "Simple ML infrastructure with Gradient", color: "from-teal-500 to-cyan-500" },
];

const notebookOptions = [
  { key: "colab", name: "Google Colab", description: "Free GPU/TPU in browser — easy to share", url: "https://colab.research.google.com/", badge: "Free tier", color: "from-orange-500 to-yellow-400" },
  { key: "kaggle", name: "Kaggle Notebooks", description: "30 GPU hours/week free, fast setup", url: "https://www.kaggle.com/code", badge: "Free", color: "from-cyan-500 to-blue-400" },
  { key: "vscode", name: "VS Code + Jupyter", description: "Local Jupyter environment with VS Code", url: "https://code.visualstudio.com/docs/datascience/jupyter-notebooks", badge: "Local", color: "from-blue-600 to-indigo-500" },
  { key: "jupyterlab", name: "JupyterLab", description: "Self-hosted Jupyter Lab environment", url: "https://jupyterlab.readthedocs.io/", badge: "Local", color: "from-emerald-500 to-teal-400" },
  { key: "sagemaker", name: "AWS SageMaker", description: "Managed Jupyter on AWS with autoscaling", url: "https://aws.amazon.com/sagemaker/", badge: "Paid", color: "from-amber-500 to-orange-400" },
  { key: "vertex_ai", name: "Vertex AI Workbench", description: "Google-managed notebooks with GPU", url: "https://cloud.google.com/vertex-ai/docs/workbench", badge: "Paid", color: "from-red-500 to-rose-400" },
];

export default function ServerConfig({ config, onChange }) {
  const serverType = config.server_type || "";

  return (
    <div className="space-y-6">
      {/* Server Type Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: "own_server", Icon: Server, gradient: "from-emerald-500 to-green-400", title: "I have a server", sub: "Configure your own GPU server" },
          { key: "cloud_recommendation", Icon: Cloud, gradient: "from-blue-500 to-cyan-400", title: "Rent a cloud GPU", sub: "Get cloud provider recommendations" },
          { key: "get_code", Icon: Code2, gradient: "from-violet-500 to-fuchsia-400", title: "Get the code", sub: "Export ready-to-run training scripts" },
          { key: "notebook", Icon: BookOpen, gradient: "from-amber-500 to-orange-400", title: "Run in notebook", sub: "Colab, Kaggle, JupyterLab, VS Code…" },
        ].map(({ key, Icon, gradient, title, sub }) => (
          <button
            key={key}
            onClick={() => onChange({ server_type: key })}
            className={cn(
              "relative text-left rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.01]",
              serverType === key
                ? "border-white/30 bg-white/[0.06] shadow-lg"
                : "border-white/10 bg-white/[0.02] hover:border-white/20"
            )}
          >
            <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4", gradient)}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-white text-sm">{title}</h3>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          </button>
        ))}
      </div>

      {/* Own Server */}
      {serverType === "own_server" && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Monitor className="w-4 h-4 text-emerald-400" />
            Server Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Host / IP Address</Label>
              <Input placeholder="e.g. 192.168.1.100" value={config.server_host || ""} onChange={(e) => onChange({ server_host: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-slate-600" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">SSH Port</Label>
              <Input placeholder="22" value={config.server_port || ""} onChange={(e) => onChange({ server_port: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-slate-600" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">GPU Type</Label>
              <Select value={config.server_gpu || ""} onValueChange={(v) => onChange({ server_gpu: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select GPU" /></SelectTrigger>
                <SelectContent>
                  {["rtx_3090", "rtx_4090", "a100_40gb", "a100_80gb", "h100", "v100", "other"].map(v => (
                    <SelectItem key={v} value={v}>{v.replace(/_/g, " ").toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Checkpoint Save Path</Label>
              <Input placeholder="/home/user/checkpoints/" value={config.checkpoint_path || ""} onChange={(e) => onChange({ checkpoint_path: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-slate-600" />
            </div>
          </div>
        </div>
      )}

      {/* Cloud Recommendations */}
      {serverType === "cloud_recommendation" && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Wifi className="w-4 h-4 text-blue-400" />Recommended GPU Cloud Providers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cloudProviders.map((p) => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:border-white/20 hover:bg-white/[0.04] hover:scale-[1.02]">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", p.color)}>
                    <HardDrive className="w-4 h-4 text-white" />
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
                <h4 className="font-semibold text-white text-sm">{p.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{p.gpu}</span>
                  <span className="text-[10px] font-semibold text-emerald-400">{p.price}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Get the Code */}
      {serverType === "get_code" && (
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-violet-400" />
            Export Training Code
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            After reviewing your configuration, we'll generate a complete, self-contained Python training script using PyTorch. You can download it and run it on any machine with a GPU — no cloud account required.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
            {[
              { label: "PyTorch Script", desc: "train.py ready to run", tag: "Python" },
              { label: "Requirements File", desc: "requirements.txt included", tag: "pip" },
              { label: "Config YAML", desc: "All params in config.yaml", tag: "YAML" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">{item.tag}</span>
                <p className="text-sm font-semibold text-white mt-2">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notebook options */}
      {serverType === "notebook" && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            Choose your Notebook Environment
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {notebookOptions.map((nb) => (
              <a key={nb.key} href={nb.url} target="_blank" rel="noopener noreferrer"
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:border-white/20 hover:bg-white/[0.04] hover:scale-[1.02]">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", nb.color)}>
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">{nb.badge}</span>
                    <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </div>
                <h4 className="font-semibold text-white text-sm">{nb.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{nb.description}</p>
              </a>
            ))}
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-300">
            A ready-to-run <span className="font-mono font-semibold">.ipynb</span> notebook will be generated with all your config baked in. Just open it in your chosen environment.
          </div>
        </div>
      )}
    </div>
  );
}