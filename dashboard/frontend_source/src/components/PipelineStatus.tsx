import { PipelineStep } from '../utils/types';
import { CheckCircle2, XCircle, ArrowRight, Database, Radio, HardDrive, Cpu } from 'lucide-react';

const STEP_ICONS: Record<string, React.ReactNode> = {
  api: <Radio className="w-5 h-5" />,
  kafka: <Database className="w-5 h-5" />,
  hdfs: <HardDrive className="w-5 h-5" />,
  spark: <Cpu className="w-5 h-5" />,
};

export default function PipelineStatus({ steps, loading }: { steps: PipelineStep[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6">
        <div className="h-6 w-48 bg-slate-800 rounded animate-pulse mb-4" />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 flex-1 bg-slate-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
        <div className="w-1.5 h-5 rounded-full bg-cyan-400" />
        Data Pipeline Status
      </h2>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((step, idx) => {
          const isActive = step.status === 'active';
          return (
            <div key={step.name} className="flex items-center gap-2">
              <div
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border min-w-[140px] transition-all ${
                  isActive
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg ${
                    isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {STEP_ICONS[step.name]}
                </div>
                <span className="text-sm font-semibold text-white">{step.label}</span>
                <span className="text-[10px] text-slate-500 text-center leading-tight">{step.description}</span>
                <div className="flex items-center gap-1.5 mt-1">
                  {isActive ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                  )}
                  <span className={`text-xs font-medium ${isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isActive ? 'Active' : 'Error'}
                  </span>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-slate-600 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
