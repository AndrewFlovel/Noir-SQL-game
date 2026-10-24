import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  ChevronRight,
  SkipForward,
  RotateCcw,
  Terminal,
  FileCheck2,
  X
} from 'lucide-react';
import {
  CHARACTERS,
  CharacterId,
  CutsceneBeat,
  STAGE_CUTSCENES
} from '../data/characters';
import { ForensicCase } from '../data/cases';
import { NoirPortrait } from './NoirPortrait';
import { QueryTelemetry } from '../engine/sqliteEngine';
import { useLanguage } from '../i18n/LanguageContext';

export type CutsceneType =
  | 'stage_intro'
  | 'stage_outro'
  | 'case_intro'
  | 'case_outro';

interface CutsceneModalProps {
  isOpen: boolean;
  type: CutsceneType;
  tier: 1 | 2 | 3;
  forensicCase: ForensicCase;
  telemetry?: QueryTelemetry | null;
  customSuspectDialogue?: string | null;
  onCompleteChain: () => void;
  onDismissAll: () => void;
  onAdvanceNextCase?: () => void;
}

export const CutsceneModal: React.FC<CutsceneModalProps> = ({
  isOpen,
  type,
  tier,
  forensicCase,
  telemetry,
  customSuspectDialogue,
  onCompleteChain,
  onDismissAll,
  onAdvanceNextCase
}) => {
  const [beatIndex, setBeatIndex] = useState(0);
  const { stageCutscenes, t } = useLanguage();
  const stageScript = stageCutscenes[tier] || STAGE_CUTSCENES[tier];

  const beats: CutsceneBeat[] = React.useMemo(() => {
    if (type === 'stage_intro') return stageScript.introBeats;
    if (type === 'stage_outro') return stageScript.outroBeats;
    if (type === 'case_intro') return forensicCase.introCutscene;

    if (customSuspectDialogue && forensicCase.outroCutscene.length > 0) {
      return forensicCase.outroCutscene.map((beat, idx) =>
        idx === 0 && beat.speakerId !== 'detective_silas'
          ? { ...beat, dialogue: customSuspectDialogue }
          : beat
      );
    }
    return forensicCase.outroCutscene;
  }, [type, stageScript, forensicCase, customSuspectDialogue]);

  useEffect(() => {
    if (isOpen) {
      setBeatIndex(0);
    }
  }, [isOpen, type, tier, forensicCase.id]);

  // Allow Escape key to immediately dismiss the modal
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismissAll();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onDismissAll]);

  if (!isOpen || beats.length === 0) return null;

  const currentBeat = beats[Math.min(beatIndex, beats.length - 1)];
  const isLastBeat = beatIndex >= beats.length - 1;

  const participatingSuspectIds: CharacterId[] =
    type === 'stage_intro' || type === 'stage_outro'
      ? stageScript.participatingSuspects
      : forensicCase.suspectIds;

  const isOutro = type === 'case_outro' || type === 'stage_outro';

  const headerKicker = {
    stage_intro: `STAGE ${tier} BRIEFING · ${stageScript.tierName.toUpperCase()} (${stageScript.analystRank.toUpperCase()})`,
    stage_outro: `STAGE ${tier} CLEARED · CLEARANCE PROMOTION VERIFIED`,
    case_intro: `CASE ${forensicCase.id} OPENING CONFRONTATION · ${forensicCase.tierName.toUpperCase()}`,
    case_outro: `CASE ${forensicCase.id} RESOLVED · FORENSIC INTERROGATION SHOWDOWN`
  }[type];

  const headerTitle = {
    stage_intro: stageScript.tierName,
    stage_outro: `${stageScript.tierName} Dossier Complete`,
    case_intro: `Case ${forensicCase.id}: ${forensicCase.title}`,
    case_outro: `Case ${forensicCase.id} Cleared: ${forensicCase.title}`
  }[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        onClick={onDismissAll}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#05080F]/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl max-h-[88vh] flex flex-col bg-[#0D1322] border border-slate-800 rounded-xl overflow-hidden shadow-2xl my-auto"
        >
          {/* Sticky Top Header (Never scrolls out of view) */}
          <div className="px-5 py-3.5 bg-[#0A0E17] border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-amber-400 tracking-wider truncate">
                {headerKicker}
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-slate-100 truncate mt-0.5">
                {headerTitle}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setBeatIndex(0)}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Restart</span>
              </button>
              <button
                type="button"
                onClick={onDismissAll}
                className="px-3 py-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <SkipForward className="w-3.5 h-3.5" />
                {isOutro ? 'Back to Workbench' : 'Skip to Workbench'}
              </button>
              <button
                type="button"
                onClick={onDismissAll}
                aria-label="Close cutscene modal"
                className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Middle Stage Body (flex-1 min-h-0 overflow-y-auto) */}
          <div className="p-5 md:p-6 bg-gradient-to-b from-[#0F172A] to-[#0A0E17] flex-1 min-h-0 overflow-y-auto space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Left Stage: Lead Investigator Detective Silas */}
              <motion.div
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22 }}
                className={`lg:col-span-5 flex items-center gap-3.5 p-3.5 rounded-lg border transition-colors ${
                  currentBeat.speakerId === 'detective_silas'
                    ? 'bg-amber-950/15 border-amber-500/70'
                    : 'bg-[#0A0E17]/70 border-slate-800/80 opacity-85'
                }`}
              >
                <NoirPortrait
                  characterId="detective_silas"
                  mood={
                    currentBeat.speakerId === 'detective_silas'
                      ? currentBeat.mood
                      : 'investigating'
                  }
                  tier={tier}
                  isSpeaking={currentBeat.speakerId === 'detective_silas'}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="text-[11px] font-mono text-amber-400">
                    LEAD INVESTIGATOR
                  </div>
                  <div className="text-base font-semibold text-white truncate mt-0.5">
                    Detective Silas Vance
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {CHARACTERS.detective_silas.tierEvolution[tier - 1].roleTitle}
                  </div>
                  <div className="mt-1.5 text-[11px] font-mono text-slate-400">
                    Clearance: Tier {tier} ({forensicCase.analystLevel})
                  </div>
                </div>
              </motion.div>

              {/* Center Stage: Versus / Evidence Lock Seal */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center text-center">
                {isOutro ? (
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-emerald-950/30 border border-emerald-500/50"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-[10px] font-mono font-semibold text-emerald-300 tracking-wider">
                      EVIDENCE VERIFIED
                    </span>
                    {telemetry && (
                      <span className="text-[10px] font-mono text-slate-300 tabular-nums">
                        {telemetry.simulatedLatencyMs}ms · Cost {telemetry.simulatedCostUnits}
                      </span>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800">
                    <Terminal className="w-5 h-5 text-amber-400" />
                    <span className="text-[10px] font-mono text-slate-300 tracking-wider">
                      CONFRONTATION
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 tabular-nums">
                      BEAT {beatIndex + 1} / {beats.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Stage: Participating Suspect(s) */}
              <motion.div
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22 }}
                className="lg:col-span-5"
              >
                {participatingSuspectIds.length === 1 ? (
                  (() => {
                    const suspectId = participatingSuspectIds[0];
                    const suspect = CHARACTERS[suspectId];
                    const persona = suspect.tierEvolution[tier - 1];
                    const isActiveSpeaker = currentBeat.speakerId === suspectId;
                    return (
                      <div
                        className={`p-3.5 rounded-lg border transition-colors flex items-center gap-3.5 ${
                          isActiveSpeaker
                            ? 'bg-slate-900/95 border-amber-500/70'
                            : 'bg-[#0A0E17]/70 border-slate-800/80 opacity-85'
                        }`}
                      >
                        <NoirPortrait
                          characterId={suspectId}
                          mood={
                            isActiveSpeaker
                              ? currentBeat.mood
                              : isOutro
                                ? 'cornered'
                                : 'smug'
                          }
                          tier={tier}
                          isSpeaking={isActiveSpeaker}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] font-mono text-rose-400 truncate">
                            SUSPECT · {suspect.codename}
                          </div>
                          <div className="text-base font-semibold text-white truncate mt-0.5">
                            {suspect.name}
                          </div>
                          <div className="text-xs text-slate-300 mt-0.5">
                            {persona.roleTitle}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 truncate">
                            {persona.allegiance}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  /* Multi-Suspect or Full 5-Suspect Stage Lineup */
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                      <span>PARTICIPATING SUBJECTS</span>
                      <span className="text-amber-400">
                        {participatingSuspectIds.length} SUBJECTS
                      </span>
                    </div>
                    <div
                      className={`grid gap-2 ${
                        participatingSuspectIds.length === 2
                          ? 'grid-cols-2'
                          : 'grid-cols-3 sm:grid-cols-5'
                      }`}
                    >
                      {participatingSuspectIds.map((suspectId) => {
                        const suspect = CHARACTERS[suspectId];
                        const persona = suspect.tierEvolution[tier - 1];
                        const isActiveSpeaker = currentBeat.speakerId === suspectId;
                        return (
                          <div
                            key={suspectId}
                            className={`p-2 rounded-lg border flex flex-col items-center text-center transition-colors ${
                              isActiveSpeaker
                                ? 'bg-slate-900 border-amber-500/80'
                                : 'bg-[#0A0E17]/80 border-slate-800/80 opacity-80'
                            }`}
                          >
                            <NoirPortrait
                              characterId={suspectId}
                              mood={
                                isActiveSpeaker
                                  ? currentBeat.mood
                                  : isOutro
                                    ? 'cornered'
                                    : 'neutral'
                              }
                              tier={tier}
                              isSpeaking={isActiveSpeaker}
                              size="sm"
                            />
                            <div className="text-[11px] font-semibold text-slate-100 mt-1.5 truncate w-full">
                              {suspect.name.split('"')[0].trim()}
                            </div>
                            <div className="text-[10px] text-amber-400 truncate w-full">
                              {persona.roleTitle}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Active Dialogue & Forensic Beat Box */}
            <motion.div
              key={`${type}-${beatIndex}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="p-4 md:p-5 rounded-lg bg-[#0A0E17] border border-slate-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-amber-400 font-semibold">
                    {currentBeat.speakerName}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">
                    ·
                  </span>
                  <span className="text-slate-400">{currentBeat.speakerRole}</span>
                </div>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  Dialogue {beatIndex + 1} of {beats.length}
                </span>
              </div>

              <p className="text-sm md:text-base text-slate-100 leading-relaxed">
                “{currentBeat.dialogue}”
              </p>

              {currentBeat.forensicNote && (
                <div className="mt-3.5 pt-3 border-t border-slate-800/90 flex items-start gap-2 text-xs font-mono text-amber-300/90">
                  <FileCheck2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{currentBeat.forensicNote}</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sticky Bottom Controls Bar (Always Visible) */}
          <div className="px-5 py-3.5 bg-[#0A0E17] border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2">
              {beats.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setBeatIndex(idx)}
                  aria-label={`Go to beat ${idx + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    idx === beatIndex
                      ? 'w-7 bg-amber-400'
                      : 'w-2 bg-slate-700 hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              {!isLastBeat ? (
                <>
                  <button
                    type="button"
                    onClick={onDismissAll}
                    className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    Close Cutscene
                  </button>
                  <button
                    type="button"
                    onClick={() => setBeatIndex((prev) => prev + 1)}
                    className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    Next Beat
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  {type === 'case_outro' && onAdvanceNextCase && (
                    <button
                      type="button"
                      onClick={onAdvanceNextCase}
                      className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      Advance to Next Case File
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onCompleteChain}
                    className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    {isOutro ? 'Close Cutscene' : 'Continue to SQL Workbench'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
