import React from 'react';
import { X, CheckCircle2, Lock, Play, Award } from 'lucide-react';
import { FORENSIC_CASES, ForensicCase } from '../data/cases';
import { CutsceneType } from './CutsceneModal';

interface CurriculumMatrixModalProps {
  isOpen: boolean;
  activeCaseId: string;
  solvedCases: Record<string, boolean>;
  unlockedAllCases: boolean;
  onToggleUnlockAll: () => void;
  onSelectCase: (caseId: string) => void;
  onTriggerCutscene: (type: CutsceneType, tier: 1 | 2 | 3, targetCase?: ForensicCase) => void;
  onClose: () => void;
}

export const CurriculumMatrixModal: React.FC<CurriculumMatrixModalProps> = ({
  isOpen,
  activeCaseId,
  solvedCases,
  unlockedAllCases,
  onToggleUnlockAll,
  onSelectCase,
  onTriggerCutscene,
  onClose
}) => {
  if (!isOpen) return null;

  const isCaseUnlocked = (c: ForensicCase, idx: number) => {
    if (unlockedAllCases || idx === 0) return true;
    const prevCase = FORENSIC_CASES[idx - 1];
    return Boolean(solvedCases[c.id] || (prevCase && solvedCases[prevCase.id]));
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#05080F]/85 backdrop-blur-sm p-4 md:p-8">
      <div className="w-full max-w-6xl max-h-[88vh] flex flex-col bg-[#0D1322] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0A0E17] border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-amber-400">
              CONSOLIDATED MASTER CURRICULUM MAP · JUNIOR → MEDIOR → SENIOR
            </div>
            <h2 className="text-xl font-semibold text-white mt-0.5">
              Case Progression Index & Competency Matrix (15 Cases)
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleUnlockAll}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                unlockedAllCases
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {unlockedAllCases ? 'All 15 Cases Unlocked' : 'Unlock All Cases (Instructor Mode)'}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Curriculum Matrix"
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stage Animation Quick Triggers */}
        <div className="px-6 py-3 bg-[#0F172A] border-b border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
          {([1, 2, 3] as const).map((tierNum) => {
            const tierCases = FORENSIC_CASES.filter((c) => c.tier === tierNum);
            const solvedCount = tierCases.filter((c) => solvedCases[c.id]).length;
            const tierTitle =
              tierNum === 1
                ? 'Tier 1: Beat Sleuth (Junior)'
                : tierNum === 2
                  ? 'Tier 2: Syndicate Detective (Medior)'
                  : 'Tier 3: Forensic Mastermind (Senior)';
            return (
              <div
                key={tierNum}
                className="p-3 rounded-lg bg-[#0A0E17] border border-slate-800 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-100">{tierTitle}</div>
                  <div className="text-xs text-slate-400 font-mono tabular-nums mt-0.5">
                    {solvedCount} / 5 Cases Cleared
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onTriggerCutscene('stage_intro', tierNum)}
                    className="px-2.5 py-1 text-xs font-medium text-amber-300 hover:text-amber-200 bg-slate-900 border border-slate-800 rounded transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <Play className="w-3 h-3" />
                    Stage Intro
                  </button>
                  <button
                    type="button"
                    onClick={() => onTriggerCutscene('stage_outro', tierNum)}
                    className="px-2.5 py-1 text-xs font-medium text-emerald-300 hover:text-emerald-200 bg-slate-900 border border-slate-800 rounded transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <Award className="w-3 h-3" />
                    Stage Finale
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table Body */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0A0E17] text-[11px] font-mono text-slate-400">
                <th className="py-3 px-4">LEVEL</th>
                <th className="py-3 px-4">CASE</th>
                <th className="py-3 px-4">TITLE</th>
                <th className="py-3 px-4">SUSPECT</th>
                <th className="py-3 px-4">PRIMARY SQL CONCEPT</th>
                <th className="py-3 px-4">ANTI-PATTERN SOLVED</th>
                <th className="py-3 px-4 text-right">STATUS & ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {FORENSIC_CASES.map((c, idx) => {
                const isSolved = Boolean(solvedCases[c.id]);
                const unlocked = isCaseUnlocked(c, idx);
                const isActive = c.id === activeCaseId;
                return (
                  <tr
                    key={c.id}
                    className={`transition-colors ${
                      isActive
                        ? 'bg-amber-950/20'
                        : unlocked
                          ? 'hover:bg-slate-900/60'
                          : 'opacity-55 bg-[#090D16]'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      T{c.tier} · {c.analystLevel}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-amber-400 tabular-nums whitespace-nowrap">
                      {c.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-100 whitespace-nowrap">
                      {c.title}
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {c.suspectDisplay}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {c.primaryConcept}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {c.antiPatternSolved}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-2">
                        {isSolved ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            CLEARED
                          </span>
                        ) : unlocked ? (
                          <span className="text-amber-400 font-mono text-[11px]">
                            OPEN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                            <Lock className="w-3.5 h-3.5" />
                            LOCKED
                          </span>
                        )}

                        <button
                          type="button"
                          disabled={!unlocked}
                          onClick={() => {
                            onSelectCase(c.id);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                            unlocked
                              ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {isActive ? 'Active Case' : 'Investigate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
