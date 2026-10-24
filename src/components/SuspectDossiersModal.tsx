import React from 'react';
import { X, Play, Award } from 'lucide-react';
import { CHARACTERS, CharacterId } from '../data/characters';
import { NoirPortrait } from './NoirPortrait';
import { CutsceneType } from './CutsceneModal';

interface SuspectDossiersModalProps {
  isOpen: boolean;
  currentTier: 1 | 2 | 3;
  onTriggerStageCutscene: (type: CutsceneType, tier: 1 | 2 | 3) => void;
  onClose: () => void;
}

const ORDERED_CAST: CharacterId[] = [
  'detective_silas',
  'vincent_chen',
  'dolores_delgado',
  'marcus_vane',
  'veronica_sterling',
  'archivist_zero'
];

export const SuspectDossiersModal: React.FC<SuspectDossiersModalProps> = ({
  isOpen,
  currentTier,
  onTriggerStageCutscene,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#05080F]/85 backdrop-blur-sm p-4 md:p-8">
      <div className="w-full max-w-6xl max-h-[88vh] flex flex-col bg-[#0D1322] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0A0E17] border-b border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-amber-400">
              PERSONNEL & SYNDICATE DOSSIERS · 3-TIER CHARACTER EVOLUTION
            </div>
            <h2 className="text-xl font-semibold text-white mt-0.5">
              Detective Silas Vance & The 5 Recurring Underworld Subjects
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Suspect Dossiers"
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Character Cards Grid */}
        <div className="p-6 overflow-y-auto space-y-6">
          {ORDERED_CAST.map((charId) => {
            const char = CHARACTERS[charId];
            return (
              <div
                key={charId}
                className="p-5 rounded-xl bg-[#0A0E17] border border-slate-800 flex flex-col lg:flex-row gap-6"
              >
                <div className="flex items-start gap-4 lg:w-72 shrink-0">
                  <NoirPortrait
                    characterId={charId}
                    mood={char.isDetective ? 'investigating' : 'neutral'}
                    tier={currentTier}
                    size="md"
                  />
                  <div>
                    <div className="text-xs font-mono text-amber-400">
                      {char.isDetective ? 'LEAD INVESTIGATOR' : `SUSPECT · ${char.codename}`}
                    </div>
                    <h3 className="text-base font-semibold text-white mt-0.5">
                      {char.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {char.bio}
                    </p>
                  </div>
                </div>

                {/* 3-Tier Progression Columns */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
                  {char.tierEvolution.map((persona) => (
                    <div
                      key={persona.tier}
                      className="flex flex-col justify-between p-3.5 rounded-lg bg-[#0F172A]/80 border border-slate-800/80"
                    >
                      <div>
                        <div className="text-[11px] font-mono text-amber-400">
                          TIER {persona.tier} · {persona.roleTitle.toUpperCase()}
                        </div>
                        <div className="text-xs text-slate-300 mt-1">
                          {persona.dossierNote}
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] italic text-slate-400">
                        “{persona.signatureQuote}”
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Bottom Stage Cutscene Replay Strip */}
          <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-300">
              Replay full-cast Stage Briefing and Stage Clearance animations featuring Detective Silas and all 5 suspects:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {([1, 2, 3] as const).map((tierNum) => (
                <React.Fragment key={tierNum}>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onTriggerStageCutscene('stage_intro', tierNum);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-amber-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Tier {tierNum} Intro
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onTriggerStageCutscene('stage_outro', tierNum);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-emerald-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Award className="w-3.5 h-3.5" />
                    Tier {tierNum} Finale
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
