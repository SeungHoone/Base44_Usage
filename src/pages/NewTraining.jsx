import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Rocket, Loader2, X, Plus } from "lucide-react";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

import StepIndicator from "@/components/training/StepIndicator";
import DatasetCard, { datasetInfo } from "@/components/training/DatasetCard";
import ModelCard, { modelInfo } from "@/components/training/ModelCard";
import ServerConfig from "@/components/training/ServerConfig";
import TrainingParams from "@/components/training/TrainingParams";
import OptimizationSettings from "@/components/training/OptimizationSettings";
import JobSummary from "@/components/training/JobSummary";
import CustomModelBuilder from "@/components/training/CustomModelBuilder";

const STEPS = ["Datasets", "Models", "Server", "Configure", "Review"];

const ALL_DATASETS = Object.keys(datasetInfo);
const ALL_MODELS = Object.keys(modelInfo).filter((k) => k !== "custom");

const DEFAULT_PARAMS = { epochs: 100, batch_size: 32, learning_rate: 0.001 };

export default function NewTraining() {
  useEffect(() => {
    base44.auth.me().then((user) => {
      if (!user) base44.auth.redirectToLogin();
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Multi-select datasets & models
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [customDatasetUrl, setCustomDatasetUrl] = useState("");

  const [selectedModels, setSelectedModels] = useState([]);
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [customModel, setCustomModel] = useState({ mode: "scratch", layers: [], optimizer: "Adam", scheduler: "CosineAnnealing", loss_fn: "CrossEntropyLoss", weight_decay: 0.0001, warmup_epochs: 5, grad_clip: 1.0, label_smoothing: 0.1 });
  const [optimizationConfig, setOptimizationConfig] = useState({ optimizer: "Adam", scheduler: "CosineAnnealing", loss_fn: "CrossEntropyLoss", weight_decay: 0.0001, warmup_epochs: 5, grad_clip: 1.0, label_smoothing: 0.1 });
  const [useOptimization, setUseOptimization] = useState(false);

  // Per-combination params: key = "dataset|model", value = { epochs, batch_size, learning_rate }
  const [paramsMap, setParamsMap] = useState({});

  const [serverConfig, setServerConfig] = useState({ server_type: "", server_host: "", server_port: "22", server_gpu: "", checkpoint_path: "" });
  const [jobName, setJobName] = useState("");

  const updateServerConfig = (updates) => setServerConfig((p) => ({ ...p, ...updates }));

  // Build list of combinations for review/submit
  const combinations = (() => {
    const datasets = selectedDatasets.length ? selectedDatasets : [];
    const models = useCustomModel ? ["custom"] : (selectedModels.length ? selectedModels : []);
    if (!datasets.length || !models.length) return [];
    return datasets.flatMap((d) => models.map((m) => ({ dataset: d, model: m })));
  })();

  const getParams = (d, m) => paramsMap[`${d}|${m}`] || { ...DEFAULT_PARAMS };
  const setParams = (d, m, updates) => {
    const key = `${d}|${m}`;
    setParamsMap((p) => ({ ...p, [key]: { ...getParams(d, m), ...updates } }));
  };

  const createJob = useMutation({
    mutationFn: async () => {
      const jobs = combinations.map(({ dataset, model }) => ({
        name: combinations.length === 1 ? jobName : `${jobName} [${datasetInfo[dataset]?.name || dataset} × ${model === "custom" ? "Custom" : (modelInfo[model]?.name || model)}]`,
        dataset,
        dataset_custom_url: dataset === "custom" ? customDatasetUrl : "",
        model,
        custom_model_config: model === "custom" ? JSON.stringify(customModel) : undefined,
        ...serverConfig,
        ...getParams(dataset, model),
        status: "configured",
      }));
      return Promise.all(jobs.map((j) => base44.entities.TrainingJob.create(j)));
    },
    onSuccess: () => { window.location.href = createPageUrl("Dashboard"); }
  });

  const toggleDataset = (k) => setSelectedDatasets((p) => p.includes(k) ? p.filter((x) => x !== k) : [...p, k]);
  const toggleModel = (k) => { setUseCustomModel(false); setSelectedModels((p) => p.includes(k) ? p.filter((x) => x !== k) : [...p, k]); };

  const canNext = () => {
    if (step === 0) return selectedDatasets.length > 0;
    if (step === 1) return useCustomModel || selectedModels.length > 0;
    if (step === 2) return !!serverConfig.server_type;
    if (step === 3) return !!jobName.trim();
    return true;
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const goNext = () => { setDirection(1); setStep((s) => s + 1); };
  const goBack = () => { setDirection(-1); setStep((s) => s - 1); };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href={createPageUrl("Dashboard")} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </a>
          <StepIndicator steps={STEPS} currentStep={step} />
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >

            {/* ── STEP 0: Datasets ── */}
            {step === 0 && (
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Choose Datasets</h1>
                    <p className="text-sm text-slate-400 mt-1">Select one or more datasets — each model will be trained on every selected dataset</p>
                  </div>
                  {selectedDatasets.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 max-w-xs justify-end">
                      {selectedDatasets.map((d) => (
                        <Badge key={d} variant="outline" className="text-[10px] border-blue-500/30 text-blue-300 bg-blue-500/10 flex items-center gap-1 pr-1">
                          {datasetInfo[d]?.name}
                          <button onClick={() => toggleDataset(d)} className="hover:text-white"><X className="w-2.5 h-2.5" /></button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-6">{selectedDatasets.length} selected — you can pick multiple</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {ALL_DATASETS.map((d) => (
                    <DatasetCard key={d} datasetKey={d} selected={selectedDatasets.includes(d)} onSelect={toggleDataset} />
                  ))}
                </div>
                {selectedDatasets.includes("custom") && (
                  <div className="mt-6 max-w-lg space-y-2">
                    <Label className="text-xs text-slate-400">Custom Dataset URL</Label>
                    <Input placeholder="https://example.com/dataset.zip" value={customDatasetUrl} onChange={(e) => setCustomDatasetUrl(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-slate-600" />
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 1: Models ── */}
            {step === 1 && (
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Select Models</h1>
                    <p className="text-sm text-slate-400 mt-1">Pick one or more architectures to compare, or build your own</p>
                  </div>
                  {selectedModels.length > 0 && !useCustomModel && (
                    <div className="flex flex-wrap gap-1.5 max-w-xs justify-end">
                      {selectedModels.map((m) => (
                        <Badge key={m} variant="outline" className="text-[10px] border-violet-500/30 text-violet-300 bg-violet-500/10 flex items-center gap-1 pr-1">
                          {modelInfo[m]?.name}
                          <button onClick={() => toggleModel(m)} className="hover:text-white"><X className="w-2.5 h-2.5" /></button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-6">{useCustomModel ? "1 custom model selected" : `${selectedModels.length} selected`} — you can pick multiple</p>

                {/* Custom model card at top */}
                <div
                  onClick={() => { setUseCustomModel(!useCustomModel); if (!useCustomModel) setSelectedModels([]); }}
                  className={cn(
                    "cursor-pointer rounded-2xl border p-5 mb-5 transition-all duration-300",
                    useCustomModel
                      ? "border-fuchsia-500/60 bg-fuchsia-500/5 shadow-lg shadow-fuchsia-500/10"
                      : "border-dashed border-white/20 bg-white/[0.01] hover:border-white/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center shrink-0">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">Design Your Own Model</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Build from scratch or modify a pretrained backbone — customize every layer, optimizer and loss</p>
                    </div>
                    {useCustomModel && <Badge className="ml-auto bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30">Active</Badge>}
                  </div>
                </div>

                {useCustomModel ? (
                  <CustomModelBuilder customModel={customModel} onChange={setCustomModel} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ALL_MODELS.map((m) => (
                      <ModelCard key={m} modelKey={m} selected={selectedModels.includes(m)} onSelect={toggleModel} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 2: Server ── */}
            {step === 2 && (
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Execution Environment</h1>
                <p className="text-sm text-slate-400 mt-1 mb-8">Where and how will you run this training?</p>
                <ServerConfig config={serverConfig} onChange={updateServerConfig} />
              </div>
            )}

            {/* ── STEP 3: Configure ── */}
            {step === 3 && (
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Training Configuration</h1>
                <p className="text-sm text-slate-400 mt-1 mb-8">
                  {combinations.length > 1
                    ? `Configure hyperparameters for each of the ${combinations.length} dataset × model combinations`
                    : "Set hyperparameters and name your job"}
                </p>
                <div className="space-y-6">
                  <div className="max-w-md space-y-2">
                    <Label className="text-xs text-slate-400">Experiment Name</Label>
                    <Input
                      placeholder="e.g. Multi-dataset ResNet comparison"
                      value={jobName}
                      onChange={(e) => setJobName(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 text-lg"
                    />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                    <button
                      onClick={() => setUseOptimization((v) => !v)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">Optimization Settings</span>
                        <span className="text-[10px] text-slate-500">(optional)</span>
                      </div>
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full transition-colors", useOptimization ? "text-amber-400 bg-amber-400/10" : "text-slate-500 bg-white/5")}>
                        {useOptimization ? "Enabled" : "Default"}
                      </span>
                    </button>
                    {useOptimization && (
                      <div className="px-5 pb-5">
                        <OptimizationSettings
                          config={optimizationConfig}
                          onChange={(updates) => setOptimizationConfig((p) => ({ ...p, ...updates }))}
                        />
                      </div>
                    )}
                  </div>

                  {combinations.length <= 1 ? (
                    combinations.map(({ dataset, model }) => (
                      <TrainingParams
                        key={`${dataset}|${model}`}
                        config={getParams(dataset, model)}
                        onChange={(u) => setParams(dataset, model, u)}
                      />
                    ))
                  ) : (
                    <div className="space-y-4">
                      {combinations.map(({ dataset, model }) => (
                        <div key={`${dataset}|${model}`} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{datasetInfo[dataset]?.name || dataset}</span>
                            <span className="text-slate-600 text-xs">×</span>
                            <span className="text-xs font-semibold text-violet-300">{model === "custom" ? "Custom Model" : (modelInfo[model]?.name || model)}</span>
                          </div>
                          <TrainingParams config={getParams(dataset, model)} onChange={(u) => setParams(dataset, model, u)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 4: Review ── */}
            {step === 4 && (
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Review & Launch</h1>
                <p className="text-sm text-slate-400 mt-1 mb-8">
                  {combinations.length} training {combinations.length === 1 ? "job" : "jobs"} will be created
                </p>
                <div className="space-y-4">
                  {combinations.map(({ dataset, model }) => (
                    <JobSummary
                      key={`${dataset}|${model}`}
                      config={{
                        name: jobName,
                        dataset,
                        model,
                        ...serverConfig,
                        ...getParams(dataset, model),
                        customModel: model === "custom" ? customModel : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/5">
          <Button variant="ghost" onClick={goBack} disabled={step === 0} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={goNext} disabled={!canNext()} className="bg-white text-slate-900 hover:bg-white/90 font-semibold px-6">
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => createJob.mutate()}
              disabled={createJob.isPending}
              className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-white font-semibold px-8"
            >
              {createJob.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
              Launch {combinations.length > 1 ? `${combinations.length} Jobs` : "Training Job"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// helper used inside JSX above
function cn(...classes) { return classes.filter(Boolean).join(" "); }
