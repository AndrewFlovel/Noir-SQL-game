/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Send,
  RotateCcw,
  Database,
  FileText,
  Terminal,
  Cpu,
  MessageSquareWarning,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Lightbulb,
  Eye,
  Film,
  Award,
  Lock,
  Unlock,
  KeyRound,
  Globe
} from 'lucide-react';
import { FORENSIC_CASES, ForensicCase, getCaseById } from './data/cases';
import { CHARACTERS, STAGE_CUTSCENES } from './data/characters';
import {
  executeCaseQuery,
  previewTableSample,
  buildDeterministicEvaluation,
  QueryExecutionResponse,
  ForensicEvaluationResponse
} from './engine/sqliteEngine';
import { NoirPortrait } from './components/NoirPortrait';
import { CutsceneModal, CutsceneType } from './components/CutsceneModal';
import { CurriculumMatrixModal } from './components/CurriculumMatrixModal';
import { SuspectDossiersModal } from './components/SuspectDossiersModal';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { Language } from './i18n/types';

function QueryNoirApp() {
  const { language, setLanguage, t, getCase, characters, stageCutscenes } = useLanguage();
  // Active case & progression state
  const [activeCaseId, setActiveCaseId] = useState<string>('1.1');
  const [solvedCases, setSolvedCases] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('query_noir_solved_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [unlockedAllCases, setUnlockedAllCases] = useState<boolean>(true);
  const [seenStages, setSeenStages] = useState<Record<number, boolean>>({ 1: true });

  // SQL Editor buffer per case
  const [sqlBuffers, setSqlBuffers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const c of FORENSIC_CASES) {
      initial[c.id] = c.starterSql;
    }
    return initial;
  });

  // Left & Right Pane Tabs
  const [leftTab, setLeftTab] = useState<'dossier' | 'schema'>('dossier');
  const [rightTab, setRightTab] = useState<'results' | 'explain' | 'interrogation'>('results');

  // Execution & Evaluation State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [execResult, setExecResult] = useState<QueryExecutionResponse | null>(null);
  const [evalResult, setEvalResult] = useState<ForensicEvaluationResponse | null>(null);

  // Schema Sample Preview State
  const [previewTable, setPreviewTable] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    columns: string[];
    rows: (string | number | null)[][];
  } | null>(null);

  // Progressive Hints State (0 to 3 unlocked per case)
  const [unlockedHints, setUnlockedHints] = useState<Record<string, number>>({});

  // Modals & Cutscenes State
  const [isMatrixOpen, setIsMatrixOpen] = useState<boolean>(false);
  const [isDossiersOpen, setIsDossiersOpen] = useState<boolean>(false);
  const [showInlineStage, setShowInlineStage] = useState<boolean>(true);
  const [inlineBeatIndex, setInlineBeatIndex] = useState<number>(0);
  const [inlineMode, setInlineMode] = useState<CutsceneType>('stage_intro');
  const [cutsceneState, setCutsceneState] = useState<{
    isOpen: boolean;
    type: CutsceneType;
    tier: 1 | 2 | 3;
    queuedType?: CutsceneType;
  }>({
    isOpen: false,
    type: 'case_intro',
    tier: 1
  });

  const activeCase: ForensicCase = getCase(activeCaseId);
  const currentSql = sqlBuffers[activeCaseId] ?? activeCase.starterSql;

  useEffect(() => {
    try {
      localStorage.setItem('query_noir_solved_v1', JSON.stringify(solvedCases));
    } catch {
      // Ignore storage quota errors
    }
  }, [solvedCases]);

  // Execute SQL against server (with in-browser sql.js fallback)
  const handleRunQuery = useCallback(
    async (sqlToRun?: string) => {
      const query = sqlToRun ?? currentSql;
      setIsRunning(true);
      try {
        const res = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caseId: activeCaseId, sql: query })
        });
        if (res.ok) {
          const data: QueryExecutionResponse = await res.json();
          setExecResult(data);
        } else {
          const fallback = await executeCaseQuery(activeCaseId, query);
          setExecResult(fallback);
        }
      } catch {
        const fallback = await executeCaseQuery(activeCaseId, query);
        setExecResult(fallback);
      } finally {
        setIsRunning(false);
      }
    },
    [activeCaseId, currentSql]
  );

  // Load initial query execution and default sample preview whenever activeCaseId changes
  useEffect(() => {
    let cancelled = false;
    const initCase = async () => {
      const initialSql = sqlBuffers[activeCaseId] ?? getCase(activeCaseId).starterSql;
      try {
        const res = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caseId: activeCaseId, sql: initialSql })
        });
        if (res.ok) {
          const result: QueryExecutionResponse = await res.json();
          if (!cancelled) {
            setExecResult(result);
            setEvalResult(null);
          }
        } else {
          const fallback = await executeCaseQuery(activeCaseId, initialSql);
          if (!cancelled) {
            setExecResult(fallback);
            setEvalResult(null);
          }
        }
      } catch {
        const fallback = await executeCaseQuery(activeCaseId, initialSql);
        if (!cancelled) {
          setExecResult(fallback);
          setEvalResult(null);
        }
      }

      const firstTable = getCase(activeCaseId).tables[0]?.tableName;
      if (firstTable) {
        try {
          const pRes = await fetch('/api/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caseId: activeCaseId, tableName: firstTable })
          });
          if (pRes.ok) {
            const sample = await pRes.json();
            if (!cancelled) {
              setPreviewTable(firstTable);
              setPreviewData(sample);
            }
          } else {
            const sample = await previewTableSample(activeCaseId, firstTable);
            if (!cancelled) {
              setPreviewTable(firstTable);
              setPreviewData(sample);
            }
          }
        } catch {
          const sample = await previewTableSample(activeCaseId, firstTable);
          if (!cancelled) {
            setPreviewTable(firstTable);
            setPreviewData(sample);
          }
        }
      }
    };
    initCase();
    return () => {
      cancelled = true;
    };
  }, [activeCaseId]);

  // Select a case and trigger Stage Intro (if new tier) + Case Opening Confrontation
  const handleSelectCase = (targetCaseId: string, showOpeningCutscene = true) => {
    const targetCase = getCase(targetCaseId);
    const prevTier = activeCase.tier;
    setActiveCaseId(targetCaseId);
    setRightTab('results');
    setInlineBeatIndex(0);

    if (targetCase.tier !== prevTier && !seenStages[targetCase.tier]) {
      setSeenStages((prev) => ({ ...prev, [targetCase.tier]: true }));
      setInlineMode('stage_intro');
      setShowInlineStage(true);
    } else {
      setInlineMode('case_intro');
      if (showOpeningCutscene) {
        setShowInlineStage(true);
      }
    }
  };

  // Submit Evidence to Gemini Forensic Director & Suspect Interrogation Engine
  const handleSubmitEvidence = async () => {
    setIsEvaluating(true);
    try {
      let execution: QueryExecutionResponse;
      let evaluation: ForensicEvaluationResponse;

      try {
        const res = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caseId: activeCaseId, sql: currentSql, language })
        });
        if (res.ok) {
          const payload = await res.json();
          execution = payload.execution;
          evaluation = payload.evaluation;
        } else {
          execution = await executeCaseQuery(activeCaseId, currentSql);
          evaluation = buildDeterministicEvaluation(activeCaseId, execution, language);
        }
      } catch {
        execution = await executeCaseQuery(activeCaseId, currentSql);
        evaluation = buildDeterministicEvaluation(activeCaseId, execution, language);
      }

      setExecResult(execution);
      setEvalResult(evaluation);
      setRightTab('interrogation');

      if (execution.overallPass) {
        const updatedSolved = { ...solvedCases, [activeCaseId]: true };
        setSolvedCases(updatedSolved);

        const isLastCaseInTier =
          activeCaseId === '1.5' || activeCaseId === '2.5' || activeCaseId === '3.5';

        setInlineMode('case_outro');
        setInlineBeatIndex(0);
        setShowInlineStage(true);

        setCutsceneState({
          isOpen: true,
          type: 'case_outro',
          tier: activeCase.tier,
          queuedType: isLastCaseInTier ? 'stage_outro' : undefined
        });
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  // Handle completing the last beat of a cutscene (plays queued cutscene if chained)
  const handleCompleteCutsceneChain = () => {
    if (cutsceneState.queuedType) {
      const nextType = cutsceneState.queuedType;
      setCutsceneState({
        isOpen: true,
        type: nextType,
        tier: cutsceneState.tier,
        queuedType: undefined
      });
    } else {
      setCutsceneState((prev) => ({ ...prev, isOpen: false, queuedType: undefined }));
    }
  };

  // Immediately close the modal and clear any queued cutscene when user clicks Skip / Close / X / Backdrop
  const handleDismissAllCutscenes = useCallback(() => {
    setCutsceneState((prev) => ({ ...prev, isOpen: false, queuedType: undefined }));
  }, []);

  // Advance to the next sequential case after solving
  const handleAdvanceNextCase = () => {
    const idx = FORENSIC_CASES.findIndex((c) => c.id === activeCaseId);
    const nextCase = FORENSIC_CASES[idx + 1];
    if (nextCase) {
      const crossesTier = nextCase.tier !== activeCase.tier;
      setActiveCaseId(nextCase.id);
      setRightTab('results');
      setCutsceneState({
        isOpen: true,
        type: crossesTier ? 'stage_intro' : 'case_intro',
        tier: nextCase.tier,
        queuedType: crossesTier ? 'case_intro' : undefined
      });
    } else {
      // Completed Case 3.5 — trigger Stage 3 Finale!
      setCutsceneState({
        isOpen: true,
        type: 'stage_outro',
        tier: 3
      });
    }
  };

  const handlePreviewTable = async (tableName: string) => {
    setPreviewTable(tableName);
    try {
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: activeCaseId, tableName })
      });
      if (res.ok) {
        const sample = await res.json();
        setPreviewData(sample);
        return;
      }
    } catch {
      // Fallback to local preview if needed
    }
    const sample = await previewTableSample(activeCaseId, tableName);
    setPreviewData(sample);
  };

  const handleUnlockNextHint = () => {
    const currentCount = unlockedHints[activeCaseId] || 0;
    if (currentCount < 3) {
      setUnlockedHints((prev) => ({ ...prev, [activeCaseId]: currentCount + 1 }));
    }
  };

  const handleLoadReferenceSolution = async () => {
    setSqlBuffers((prev) => ({ ...prev, [activeCaseId]: activeCase.solutionSql }));
    await handleRunQuery(activeCase.solutionSql);
  };

  const handleResetStarterSql = async () => {
    setSqlBuffers((prev) => ({ ...prev, [activeCaseId]: activeCase.starterSql }));
    await handleRunQuery(activeCase.starterSql);
  };

  const isCaseUnlocked = (c: ForensicCase, idx: number) => {
    if (unlockedAllCases || idx === 0) return true;
    const prevCase = FORENSIC_CASES[idx - 1];
    return Boolean(solvedCases[c.id] || (prevCase && solvedCases[prevCase.id]));
  };

  const primarySuspectId = activeCase.suspectIds[0];
  const primarySuspect = characters[primarySuspectId] || CHARACTERS[primarySuspectId];
  const primarySuspectPersona = primarySuspect.tierEvolution[activeCase.tier - 1];
  const totalSolvedCount = Object.values(solvedCases).filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0E17] text-slate-100">
      {/* ====================================================================
          TOP BAR CONTRACT: Strict 3-Zone Header separated by gap-8
         ==================================================================== */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-[#0A0E17] border-b border-slate-800">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setIsMatrixOpen(false);
            setIsDossiersOpen(false);
          }}
          className="font-display text-lg font-bold tracking-tight text-amber-400 whitespace-nowrap shrink-0"
        >
          QUERY_NOIR
        </a>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={() => {
              setIsMatrixOpen(false);
              setIsDossiersOpen(false);
            }}
            className="hover:text-amber-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t('navActiveCase')}
          </button>
          <button
            type="button"
            onClick={() => setIsMatrixOpen(true)}
            className="hover:text-amber-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t('navCaseIndex')}
          </button>
          <button
            type="button"
            onClick={() => setIsDossiersOpen(true)}
            className="hover:text-amber-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t('navDossiers')}
          </button>
          <button
            type="button"
            onClick={() => setIsMatrixOpen(true)}
            className="hover:text-amber-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t('navCurriculum')}
          </button>
        </nav>

        {/* Zone 3: Language Selector & Submit Action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-[#0A0E17] border border-slate-800 rounded-lg p-1 text-xs shrink-0">
            <Globe className="w-3.5 h-3.5 text-amber-400 ml-1 mr-0.5" />
            {(['en', 'es', 'pt'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-2 py-0.5 rounded font-mono font-bold transition-all ${
                  language === lang
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={isEvaluating}
            onClick={handleSubmitEvidence}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {isEvaluating ? t('evaluatingEvidence') : t('submitEvidence')}
          </button>
        </div>
      </header>

      {/* ====================================================================
          STAGE & CASE PROGRESSION TOOLBAR (Below the Fold / Header)
         ==================================================================== */}
      <section className="px-6 py-3 bg-[#0D1322] border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Tier Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-[#0A0E17] border border-slate-800 rounded-lg">
            {([1, 2, 3] as const).map((tierNum) => {
              const tierLabel =
                tierNum === 1
                  ? t('tier1Name')
                  : tierNum === 2
                    ? t('tier2Name')
                    : t('tier3Name');
              const isCurrentTier = activeCase.tier === tierNum;
              return (
                <button
                  key={tierNum}
                  type="button"
                  onClick={() => {
                    const firstCaseInTier = FORENSIC_CASES.find((c) => c.tier === tierNum);
                    if (firstCaseInTier) {
                      handleSelectCase(firstCaseInTier.id, true);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isCurrentTier
                      ? 'bg-amber-400 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {tierLabel}
                </button>
              );
            })}
          </div>

          {/* 5 Cases within the Active Tier */}
          <div className="flex items-center gap-1 p-1 bg-[#0A0E17] border border-slate-800 rounded-lg">
            {FORENSIC_CASES.filter((c) => c.tier === activeCase.tier).map((c) => {
              const locC = getCase(c.id);
              const globalIdx = FORENSIC_CASES.findIndex((item) => item.id === c.id);
              const unlocked = isCaseUnlocked(c, globalIdx);
              const isSolved = Boolean(solvedCases[c.id]);
              const isSelected = c.id === activeCaseId;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => handleSelectCase(c.id, false)}
                  className={`px-2.5 py-1.5 text-xs font-mono rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 tabular-nums ${
                    isSelected
                      ? 'bg-slate-800 text-amber-300 border border-amber-500/50'
                      : unlocked
                        ? 'text-slate-300 hover:text-white hover:bg-slate-900'
                        : 'text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <span>{c.id}</span>
                  <span className="hidden xl:inline text-[11px] font-sans text-slate-400">
                    {locC.flowLabel}
                  </span>
                  {isSolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stage & Case Cutscene Animation Triggers + Clearance Telemetry */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono text-slate-400 tabular-nums mr-1">
            {t('casesCleared')}: {totalSolvedCount} / 15
          </span>

          <button
            type="button"
            onClick={() =>
              setCutsceneState({
                isOpen: true,
                type: 'stage_intro',
                tier: activeCase.tier
              })
            }
            className="px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-amber-300 bg-[#0A0E17] border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Film className="w-3.5 h-3.5 text-amber-400" />
            {t('stageIntroBtn').replace('{tier}', String(activeCase.tier))}
          </button>

          <button
            type="button"
            onClick={() =>
              setCutsceneState({
                isOpen: true,
                type: 'case_intro',
                tier: activeCase.tier
              })
            }
            className="px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-amber-300 bg-[#0A0E17] border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            {t('caseIntroBtn').replace('{id}', activeCase.id)}
          </button>

          <button
            type="button"
            onClick={() =>
              setCutsceneState({
                isOpen: true,
                type: 'case_outro',
                tier: activeCase.tier
              })
            }
            className="px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-emerald-300 bg-[#0A0E17] border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            {t('caseOutroBtn').replace('{id}', activeCase.id)}
          </button>

          <button
            type="button"
            onClick={() => {
              setInlineMode('stage_outro');
              setInlineBeatIndex(0);
              setShowInlineStage(true);
              setCutsceneState({
                isOpen: true,
                type: 'stage_outro',
                tier: activeCase.tier
              });
            }}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-emerald-300 bg-[#0A0E17] border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            {t('stageFinaleBtn').replace('{tier}', String(activeCase.tier))}
          </button>

          <button
            type="button"
            onClick={() => setShowInlineStage((prev) => !prev)}
            className="px-2.5 py-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 bg-slate-900 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {showInlineStage ? t('hideStageTheatre') : t('showStageTheatre')}
          </button>
        </div>
      </section>

      {/* ====================================================================
          INLINE ANIMATED STAGE & CASE CONFRONTATION THEATRE (Non-Blocking & Scrollable)
         ==================================================================== */}
      {showInlineStage && (() => {
        const stageScript = stageCutscenes[activeCase.tier] || STAGE_CUTSCENES[activeCase.tier];
        const activeBeats =
          inlineMode === 'stage_intro'
            ? stageScript.introBeats
            : inlineMode === 'stage_outro'
              ? stageScript.outroBeats
              : inlineMode === 'case_intro'
                ? activeCase.introCutscene
                : activeCase.outroCutscene;
        const safeIdx = Math.min(inlineBeatIndex, Math.max(0, activeBeats.length - 1));
        const currentBeat = activeBeats[safeIdx] || activeCase.introCutscene[0];
        const stageSuspects =
          inlineMode === 'stage_intro' || inlineMode === 'stage_outro'
            ? stageScript.participatingSuspects
            : activeCase.suspectIds;

        return (
          <section className="px-6 pt-5 max-w-[1600px] w-full mx-auto">
            <div className="p-5 rounded-xl bg-gradient-to-r from-[#0D1322] via-[#111A2E] to-[#0D1322] border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-amber-400">
                    {inlineMode === 'stage_intro'
                      ? t('stageOpeningBriefing').replace('{tier}', String(activeCase.tier))
                      : inlineMode === 'stage_outro'
                        ? t('stageFinaleShowdown').replace('{tier}', String(activeCase.tier))
                        : inlineMode === 'case_intro'
                          ? t('caseOpeningConfrontation').replace('{id}', activeCase.id)
                          : t('caseResolutionShowdown').replace('{id}', activeCase.id)}
                  </span>
                  <span className="text-slate-600">·</span>
                  <div className="flex items-center gap-1 bg-[#0A0E17] p-1 rounded-lg border border-slate-800">
                    {(
                      [
                        ['stage_intro', t('stageIntroBtn').replace('{tier}', String(activeCase.tier))],
                        ['case_intro', t('caseIntroBtn').replace('{id}', activeCase.id)],
                        ['case_outro', t('caseOutroBtn').replace('{id}', activeCase.id)],
                        ['stage_outro', t('stageFinaleBtn').replace('{tier}', String(activeCase.tier))]
                      ] as const
                    ).map(([modeKey, label]) => (
                      <button
                        key={modeKey}
                        type="button"
                        onClick={() => {
                          setInlineMode(modeKey);
                          setInlineBeatIndex(0);
                        }}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                          inlineMode === modeKey
                            ? 'bg-amber-400 text-slate-950 font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCutsceneState({
                        isOpen: true,
                        type: inlineMode,
                        tier: activeCase.tier
                      })
                    }
                    className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-[#0A0E17] border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    {t('fullscreenCutscene')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInlineStage(false)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-white bg-[#0A0E17] border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    {t('collapseBtn')}
                  </button>
                </div>
              </div>

              {/* Detective Silas + Dialogue + Participating Suspects */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                {/* Detective Silas */}
                <div
                  className={`lg:col-span-3 flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    currentBeat?.speakerId === 'detective_silas'
                      ? 'bg-amber-950/15 border-amber-500/70'
                      : 'bg-[#0A0E17]/80 border-slate-800'
                  }`}
                >
                  <NoirPortrait
                    characterId="detective_silas"
                    mood={
                      currentBeat?.speakerId === 'detective_silas'
                        ? currentBeat.mood
                        : 'investigating'
                    }
                    tier={activeCase.tier}
                    isSpeaking={currentBeat?.speakerId === 'detective_silas'}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono text-amber-400">{t('detectiveBadge')}</div>
                    <div className="text-sm font-semibold text-white truncate">
                      Silas Vance
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {characters.detective_silas.tierEvolution[activeCase.tier - 1].roleTitle}
                    </div>
                  </div>
                </div>

                {/* Center Animated Dialogue Beat */}
                <div className="lg:col-span-5 p-3.5 rounded-lg bg-[#0A0E17] border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 text-xs font-mono mb-1.5">
                    <span className="text-amber-400 font-semibold">
                      {(characters[currentBeat?.speakerId]?.name || currentBeat?.speakerName)} (
                      {characters[currentBeat?.speakerId]?.tierEvolution[activeCase.tier - 1]?.roleTitle || currentBeat?.speakerRole})
                    </span>
                    <span className="text-slate-500 tabular-nums">
                      {t('beatLabel')} {safeIdx + 1} / {activeBeats.length}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                    “{currentBeat?.dialogue}”
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-amber-300/90 truncate">
                      {currentBeat?.forensicNote}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setInlineBeatIndex((prev) =>
                          prev + 1 < activeBeats.length ? prev + 1 : 0
                        )
                      }
                      className="px-3 py-1 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap shrink-0"
                    >
                      {safeIdx + 1 < activeBeats.length ? t('nextBeatArrow') : t('replayBeat1')}
                    </button>
                  </div>
                </div>

                {/* Participating Suspects in Stage / Case */}
                <div className="lg:col-span-4 flex items-center gap-2 overflow-x-auto py-1">
                  {stageSuspects.map((sId) => {
                    const susp = characters[sId] || CHARACTERS[sId];
                    const persona = susp.tierEvolution[activeCase.tier - 1];
                    const isSpeaking = currentBeat?.speakerId === sId;
                    return (
                      <div
                        key={sId}
                        className={`p-2.5 rounded-lg border flex items-center gap-2.5 shrink-0 transition-colors ${
                          isSpeaking
                            ? 'bg-slate-900 border-amber-500/80'
                            : 'bg-[#0A0E17]/80 border-slate-800 opacity-85'
                        }`}
                      >
                        <NoirPortrait
                          characterId={sId}
                          mood={
                            isSpeaking
                              ? currentBeat.mood
                              : inlineMode === 'case_outro' || inlineMode === 'stage_outro'
                                ? 'cornered'
                                : 'smug'
                          }
                          tier={activeCase.tier}
                          isSpeaking={isSpeaking}
                          size="sm"
                        />
                        <div className="min-w-0 pr-1">
                          <div className="text-[10px] font-mono text-rose-400">
                            {susp.codename}
                          </div>
                          <div className="text-xs font-semibold text-slate-100 whitespace-nowrap">
                            {susp.name.split('"')[0].trim()}
                          </div>
                          <div className="text-[10px] text-amber-400 whitespace-nowrap">
                            {persona.roleTitle}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ====================================================================
          MAIN 1440px+ INVESTIGATION WORKSPACE (2-Column Split Layout)
         ==================================================================== */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-[1600px] w-full mx-auto items-stretch">
        {/* LEFT PANE: Case Dossier, Character Confrontation Header & Schema Explorer */}
        <section className="lg:col-span-5 flex flex-col bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden">
          {/* Detective & Suspect Visual Confrontation Strip */}
          <div className="p-5 bg-[#0A0E17] border-b border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span>
                Case {activeCase.id} · {activeCase.tierName} ({activeCase.analystLevel} Analyst)
              </span>
              <span>·</span>
              <span className="font-mono text-amber-400">{activeCase.primaryConcept}</span>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              Case {activeCase.id}: {activeCase.title}
            </h1>

            {/* Side-by-Side Portraits: Detective Silas vs Participating Suspect(s) */}
            <div className="mt-4 pt-4 border-t border-slate-800/90 grid grid-cols-2 gap-4">
              {/* Detective Silas */}
              <div className="flex items-center gap-3">
                <NoirPortrait
                  characterId="detective_silas"
                  mood="investigating"
                  tier={activeCase.tier}
                  size="sm"
                />
                <div className="min-w-0">
                  <div className="text-[11px] font-mono text-amber-400">INVESTIGATOR</div>
                  <div className="text-xs font-semibold text-slate-100 truncate">
                    Detective Silas Vance
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {characters.detective_silas.tierEvolution[activeCase.tier - 1].roleTitle}
                  </div>
                </div>
              </div>

              {/* Suspect(s) */}
              <div className="flex items-center gap-3">
                <NoirPortrait
                  characterId={primarySuspectId}
                  mood={
                    solvedCases[activeCase.id]
                      ? 'cornered'
                      : evalResult?.suspectMood || 'smug'
                  }
                  tier={activeCase.tier}
                  size="sm"
                />
                <div className="min-w-0">
                  <div className="text-[11px] font-mono text-rose-400">
                    TARGET SUSPECT
                  </div>
                  <div className="text-xs font-semibold text-slate-100 truncate">
                    {activeCase.suspectDisplay}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {primarySuspectPersona.roleTitle}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Pane Segmented Controls: Forensic Dossier vs Schema & Indexes */}
          <div className="px-5 py-2.5 bg-[#0D1322] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 bg-[#0A0E17] border border-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setLeftTab('dossier')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  leftTab === 'dossier'
                    ? 'bg-slate-800 text-amber-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                {t('tabCaseDossier')}
              </button>
              <button
                type="button"
                onClick={() => setLeftTab('schema')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  leftTab === 'schema'
                    ? 'bg-slate-800 text-amber-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                {t('tabDatabaseSchema')} ({activeCase.tables.length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => setUnlockedAllCases((prev) => !prev)}
              className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 whitespace-nowrap shrink-0"
              title="Toggle Instructor Override to unlock all 15 cases"
            >
              {unlockedAllCases ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-amber-400" />
                  <span>All Unlocked</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Strict Progression</span>
                </>
              )}
            </button>
          </div>

          {/* Left Pane Content Area */}
          <div className="p-5 overflow-y-auto flex-1 space-y-5 text-sm">
            {leftTab === 'dossier' ? (
              <>
                {/* Narrative Briefing */}
                <div>
                  <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    01. {t('forensicNarrative')}
                  </h3>
                  <p className="mt-1.5 text-slate-200 leading-relaxed">
                    {activeCase.narrative}
                  </p>
                </div>

                {/* Forensic Objective */}
                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                    02. {t('forensicObjective')}
                  </h3>
                  <p className="mt-1.5 text-slate-100 leading-relaxed">
                    {activeCase.forensicObjective}
                  </p>
                  <div className="mt-2.5 text-xs font-mono text-slate-400">
                    Expected Columns: {activeCase.expectedColumns.join(' · ')}
                  </div>
                </div>

                {/* Known Pitfall & Target Pass Metric */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div>
                    <h3 className="text-xs font-mono text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      03. {t('knownPitfall')}
                    </h3>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      {activeCase.pitfall}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      04. {t('passMetric')}
                    </h3>
                    <p className="mt-1 text-xs font-mono text-slate-200 tabular-nums">
                      {activeCase.passMetric} (Target Latency &lt; {activeCase.targetLatencyMs}ms · Max Cost &le; {activeCase.targetMaxCost})
                    </p>
                  </div>
                </div>

                {/* Progressive Hints Drawer */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      05. {t('investigativeIntuition')} ({unlockedHints[activeCaseId] || 0} / 3 Hints)
                    </h3>
                    <div className="flex items-center gap-2">
                      {(unlockedHints[activeCaseId] || 0) < 3 && (
                        <button
                          type="button"
                          onClick={handleUnlockNextHint}
                          className="px-2.5 py-1 text-xs font-medium text-amber-300 hover:text-amber-200 bg-[#0A0E17] border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                        >
                          Reveal Next Hint
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleLoadReferenceSolution}
                        className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-[#0A0E17] border border-slate-800 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                        title="Load optimal reference SQL into editor"
                      >
                        <KeyRound className="w-3 h-3 text-amber-400" />
                        Load Optimal SQL
                      </button>
                    </div>
                  </div>

                  {(unlockedHints[activeCaseId] || 0) > 0 ? (
                    <ol className="mt-3 space-y-2 text-xs text-slate-300 list-decimal list-inside">
                      {activeCase.hints
                        .slice(0, unlockedHints[activeCaseId] || 0)
                        .map((hint, i) => (
                          <li
                            key={i}
                            className="p-2.5 rounded-lg bg-[#0A0E17] border border-slate-800/90 leading-relaxed"
                          >
                            {hint}
                          </li>
                        ))}
                    </ol>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">
                      Need a lead on the schema or execution plan? Click “Reveal Next Hint” for progressive forensic guidance.
                    </p>
                  )}
                </div>
              </>
            ) : (
              /* Interactive Schema Explorer & Sample Data Previewer */
              <div className="space-y-5">
                {activeCase.tables.map((tbl) => (
                  <div
                    key={tbl.tableName}
                    className="p-4 rounded-lg bg-[#0A0E17] border border-slate-800"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-mono text-sm font-semibold text-amber-400">
                          {tbl.tableName}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {tbl.description} · <span className="font-mono">{tbl.rowCountLabel}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePreviewTable(tbl.tableName)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          previewTable === tbl.tableName
                            ? 'bg-amber-400/15 border-amber-500/60 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview Rows
                      </button>
                    </div>

                    {/* Indexes */}
                    <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 text-[11px] font-mono text-emerald-400">
                      Indexes: {tbl.indexes.join(' · ')}
                    </div>

                    {/* Columns Table */}
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                            <th className="py-1.5 pr-3">COLUMN</th>
                            <th className="py-1.5 pr-3">TYPE</th>
                            <th className="py-1.5">DESCRIPTION</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {tbl.columns.map((col) => (
                            <tr key={col.name}>
                              <td className="py-1.5 pr-3 font-mono text-slate-200 whitespace-nowrap">
                                {col.name}
                                {col.isPrimaryKey && (
                                  <span className="ml-1.5 text-[10px] text-amber-400">PK</span>
                                )}
                                {!col.isPrimaryKey && col.isIndexed && (
                                  <span className="ml-1.5 text-[10px] text-emerald-400">IDX</span>
                                )}
                              </td>
                              <td className="py-1.5 pr-3 font-mono text-slate-400 whitespace-nowrap">
                                {col.type}
                              </td>
                              <td className="py-1.5 text-slate-400">{col.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {/* Live Sample Data Preview Grid */}
                {previewData && previewTable && (
                  <div className="p-4 rounded-lg bg-[#0A0E17] border border-slate-800">
                    <div className="text-xs font-mono text-amber-400 mb-2">
                      SAMPLE ROWS PREVIEW · {previewTable} (First {previewData.rows.length} rows)
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            {previewData.columns.map((col) => (
                              <th key={col} className="py-2 px-2.5 whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {previewData.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-900/50">
                              {row.map((val, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`py-1.5 px-2.5 whitespace-nowrap ${
                                    val === null ? 'text-rose-400 italic' : 'text-slate-200'
                                  }`}
                                >
                                  {val === null ? 'NULL' : String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANE: Forensic SQL Workbench, Cost Telemetry & Output Deck */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* SQL Query Editor Card */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
            <div className="px-5 py-3 bg-[#0A0E17] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>{t('terminalTitle')} · CASE {activeCase.id}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetStarterSql}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t('resetStarterSqlBtn')}
                </button>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => handleRunQuery()}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  {isRunning ? t('runningQueryBtn') : t('runQueryBtn')}
                </button>
                <button
                  type="button"
                  disabled={isEvaluating}
                  onClick={handleSubmitEvidence}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isEvaluating ? t('evaluatingEvidence') : t('submitEvidence')}
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#080C14]">
              <textarea
                value={currentSql}
                onChange={(e) =>
                  setSqlBuffers((prev) => ({ ...prev, [activeCaseId]: e.target.value }))
                }
                spellCheck={false}
                rows={10}
                aria-label="SQL Query Editor"
                className="sql-editor w-full bg-transparent text-sm font-mono text-amber-100 placeholder-slate-600 focus:outline-none resize-y leading-relaxed"
              />
            </div>

            {/* Live Performance & Watchdog Telemetry Bar */}
            {execResult && (
              <div className="px-5 py-3 bg-[#0A0E17] border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono tabular-nums">
                <div>
                  <span className="text-slate-500 block text-[10px]">{t('simulatedLatency').toUpperCase()}</span>
                  <span
                    className={
                      execResult.telemetry.simulatedLatencyMs <= activeCase.targetLatencyMs
                        ? 'text-emerald-400 font-semibold'
                        : 'text-amber-400 font-semibold'
                    }
                  >
                    {execResult.telemetry.simulatedLatencyMs}ms (Target &lt;{' '}
                    {activeCase.targetLatencyMs}ms)
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">{t('engineCost').toUpperCase()}</span>
                  <span
                    className={
                      execResult.telemetry.simulatedCostUnits <= activeCase.targetMaxCost
                        ? 'text-emerald-400 font-semibold'
                        : 'text-rose-400 font-semibold'
                    }
                  >
                    {execResult.telemetry.simulatedCostUnits} units (Max {activeCase.targetMaxCost})
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">{t('rowsScanned').toUpperCase()}</span>
                  <span className="text-slate-200 truncate block" title={execResult.telemetry.rowsScannedLabel}>
                    {execResult.telemetry.rowsScannedLabel}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">{t('watchdogStatus').toUpperCase()}</span>
                  {execResult.telemetry.watchdogAlertLevel === 'NOMINAL' ? (
                    <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      NOMINAL
                    </span>
                  ) : execResult.telemetry.watchdogAlertLevel === 'ELEVATED' ? (
                    <span className="text-amber-400 font-semibold inline-flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      ELEVATED ALERT
                    </span>
                  ) : (
                    <span className="text-rose-400 font-semibold inline-flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      LOCKDOWN RISK
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Output & Forensic Telemetry Deck */}
          <div className="flex-1 bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
            {/* Output Tabs */}
            <div className="px-5 py-2.5 bg-[#0D1322] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 p-1 bg-[#0A0E17] border border-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setRightTab('results')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    rightTab === 'results'
                      ? 'bg-slate-800 text-amber-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  {t('tabEvidenceRows')} ({execResult?.rows.length || 0})
                </button>

                <button
                  type="button"
                  onClick={() => setRightTab('explain')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    rightTab === 'explain'
                      ? 'bg-slate-800 text-amber-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  {t('tabExplainPlan')}
                </button>

                <button
                  type="button"
                  onClick={() => setRightTab('interrogation')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    rightTab === 'interrogation'
                      ? 'bg-slate-800 text-amber-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquareWarning className="w-3.5 h-3.5" />
                  {t('tabInterrogation')}
                </button>
              </div>

              {/* Overall Pass Indicator */}
              {execResult && (
                <div className="text-xs font-mono">
                  {execResult.overallPass ? (
                    <span className="text-emerald-400 inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      VERIFIED · READY FOR SUBMISSION
                    </span>
                  ) : execResult.functionalPass ? (
                    <span className="text-amber-400 inline-flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      ROWS MATCH · OPTIMIZATION REQUIRED
                    </span>
                  ) : (
                    <span className="text-slate-400 inline-flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      EVIDENCE INCOMPLETE
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Output Tab Content */}
            <div className="p-5 flex-1 overflow-y-auto">
              {rightTab === 'results' && (
                <div className="space-y-4">
                  {/* Verification Banner */}
                  {execResult && (
                    <div
                      className={`p-3.5 rounded-lg border text-xs flex items-start justify-between gap-4 ${
                        execResult.overallPass
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                          : execResult.functionalPass
                            ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-semibold">
                          Functional Check: {execResult.functionalFeedback}
                        </div>
                        <div className="text-slate-300">
                          Optimization Check: {execResult.optimizationFeedback}
                        </div>
                      </div>
                      {execResult.overallPass && (
                        <button
                          type="button"
                          onClick={handleSubmitEvidence}
                          className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
                        >
                          Trigger Showdown Cutscene
                        </button>
                      )}
                    </div>
                  )}

                  {/* SQL Error Display */}
                  {execResult?.error ? (
                    <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-500/50 text-xs font-mono text-rose-200">
                      SQLITE EXECUTION ERROR: {execResult.error}
                    </div>
                  ) : execResult && execResult.columns.length > 0 ? (
                    <div className="overflow-x-auto border border-slate-800 rounded-lg bg-[#0A0E17]">
                      <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
                        <thead>
                          <tr className="border-b border-slate-800 bg-[#0D1322] text-slate-300">
                            <th className="py-2.5 px-3 text-slate-500 w-10">#</th>
                            {execResult.columns.map((col) => (
                              <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/70">
                          {execResult.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-900/60">
                              <td className="py-2 px-3 text-slate-500">{rIdx + 1}</td>
                              {row.map((val, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`py-2 px-3 whitespace-nowrap ${
                                    val === null ? 'text-rose-400 italic' : 'text-slate-100'
                                  }`}
                                >
                                  {val === null ? 'NULL' : String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-[#0A0E17] border border-slate-800 rounded-lg">
                      Query returned 0 rows. Adjust your WHERE or JOIN predicates and click “Run Query”.
                    </div>
                  )}
                </div>
              )}

              {rightTab === 'explain' && execResult && (
                <div className="space-y-5">
                  {/* Cost & Memory Efficiency Bars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-[#0A0E17] border border-slate-800">
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <span className="text-slate-400">QUERY PLAN COST UNITS</span>
                        <span className="text-amber-400 tabular-nums">
                          {execResult.telemetry.simulatedCostUnits} / {activeCase.targetMaxCost} max
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-transform duration-150 origin-left ${
                            execResult.telemetry.simulatedCostUnits <= activeCase.targetMaxCost
                              ? 'bg-emerald-400'
                              : 'bg-rose-500'
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                (execResult.telemetry.simulatedCostUnits /
                                  activeCase.targetMaxCost) *
                                  100
                              )
                            )}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[#0A0E17] border border-slate-800">
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <span className="text-slate-400">MEMORY & BUFFER FOOTPRINT</span>
                        <span className="text-slate-200 tabular-nums">
                          {execResult.telemetry.simulatedMemoryMb} MB · Scan Ratio{' '}
                          {execResult.telemetry.scanRatio}x
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {execResult.telemetry.hasTempBTreeSort
                          ? 'Warning: Temp B-Tree sort buffer active'
                          : 'Zero disk-spill sorting detected'}
                      </div>
                    </div>
                  </div>

                  {/* SQLite EXPLAIN QUERY PLAN Nodes */}
                  <div className="p-4 rounded-lg bg-[#0A0E17] border border-slate-800">
                    <div className="text-xs font-mono text-amber-400 mb-3">
                      SQLITE EXPLAIN QUERY PLAN TREE
                    </div>
                    {execResult.explainNodes.length > 0 ? (
                      <div className="space-y-2 font-mono text-xs">
                        {execResult.explainNodes.map((node, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded bg-[#0F172A] border border-slate-800 flex items-center justify-between gap-4"
                          >
                            <span className="text-slate-200">{node.detail}</span>
                            <span
                              className={`text-[11px] shrink-0 ${
                                node.isIndexSeek
                                  ? 'text-emerald-400'
                                  : node.isFullScan
                                    ? 'text-amber-400'
                                    : 'text-slate-400'
                              }`}
                            >
                              {node.isIndexSeek
                                ? 'INDEX SEEK'
                                : node.isFullScan
                                  ? 'TABLE SCAN'
                                  : 'PLAN STEP'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">
                        No EXPLAIN QUERY PLAN nodes generated.
                      </div>
                    )}
                  </div>

                  {/* Anti-Patterns vs Verified Optimizations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-lg bg-[#0A0E17] border border-slate-800">
                      <div className="font-mono text-emerald-400 mb-2">
                        VERIFIED OPTIMIZATIONS ({execResult.telemetry.optimizationsVerified.length})
                      </div>
                      {execResult.telemetry.optimizationsVerified.length > 0 ? (
                        <ul className="space-y-1.5 text-slate-300">
                          {execResult.telemetry.optimizationsVerified.map((item, idx) => (
                            <li key={idx}>· {item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-500">No optimizations verified yet.</p>
                      )}
                    </div>

                    <div className="p-4 rounded-lg bg-[#0A0E17] border border-slate-800">
                      <div className="font-mono text-rose-400 mb-2">
                        DETECTED ANTI-PATTERNS ({execResult.telemetry.antiPatternsDetected.length})
                      </div>
                      {execResult.telemetry.antiPatternsDetected.length > 0 ? (
                        <ul className="space-y-1.5 text-rose-200">
                          {execResult.telemetry.antiPatternsDetected.map((item, idx) => (
                            <li key={idx}>· {item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-emerald-400">
                          Zero SQL anti-patterns detected in current query.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {rightTab === 'interrogation' && (
                <div className="space-y-4">
                  {evalResult ? (
                    <div className="p-5 rounded-xl bg-[#0A0E17] border border-slate-800 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-3.5">
                          <NoirPortrait
                            characterId={primarySuspectId}
                            mood={evalResult.suspectMood}
                            tier={activeCase.tier}
                            isSpeaking
                            size="md"
                          />
                          <div>
                            <div className="text-xs font-mono text-amber-400">
                              INTERROGATION TRANSCRIPT · {evalResult.evaluatedBy}
                            </div>
                            <h3 className="text-base font-semibold text-white mt-0.5">
                              {evalResult.suspectName} ({evalResult.suspectRole})
                            </h3>
                            <p className="text-sm text-slate-100 mt-2 leading-relaxed">
                              {evalResult.suspectDialogue}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="font-mono text-emerald-400">
                          FORENSIC DIRECTOR VERDICT:
                        </div>
                        <p className="text-slate-200 leading-relaxed">
                          {evalResult.forensicDirectorVerdict}
                        </p>
                        <div className="font-mono text-amber-400 pt-2">
                          ARCHITECTURAL INTUITION:
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          {evalResult.architecturalGuidance}
                        </p>
                      </div>

                      {evalResult.overallPass && (
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setCutsceneState({
                                isOpen: true,
                                type: 'case_outro',
                                tier: activeCase.tier
                              })
                            }
                            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
                          >
                            Replay Resolution Cutscene
                          </button>
                          <button
                            type="button"
                            onClick={handleAdvanceNextCase}
                            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
                          >
                            Advance to Next Case
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl bg-[#0A0E17] border border-slate-800 text-center space-y-3">
                      <p className="text-sm text-slate-300">
                        Click <strong>Submit Evidence</strong> to present your SQL query and{' '}
                        <code className="text-amber-300">EXPLAIN QUERY PLAN</code> to the Forensic
                        Director and interrogate {activeCase.suspectDisplay}.
                      </p>
                      <button
                        type="button"
                        onClick={handleSubmitEvidence}
                        className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
                      >
                        Submit Evidence Now
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ====================================================================
          MODALS: Stage/Case Cutscene Director, Curriculum Matrix, Suspect Dossiers
         ==================================================================== */}
      <CutsceneModal
        isOpen={cutsceneState.isOpen}
        type={cutsceneState.type}
        tier={cutsceneState.tier}
        forensicCase={activeCase}
        telemetry={execResult?.telemetry}
        customSuspectDialogue={evalResult?.suspectDialogue}
        onCompleteChain={handleCompleteCutsceneChain}
        onDismissAll={handleDismissAllCutscenes}
        onAdvanceNextCase={handleAdvanceNextCase}
      />

      <CurriculumMatrixModal
        isOpen={isMatrixOpen}
        activeCaseId={activeCaseId}
        solvedCases={solvedCases}
        unlockedAllCases={unlockedAllCases}
        onToggleUnlockAll={() => setUnlockedAllCases((prev) => !prev)}
        onSelectCase={(cId) => handleSelectCase(cId, true)}
        onTriggerCutscene={(type, tier) => {
          setIsMatrixOpen(false);
          setCutsceneState({ isOpen: true, type, tier });
        }}
        onClose={() => setIsMatrixOpen(false)}
      />

      <SuspectDossiersModal
        isOpen={isDossiersOpen}
        currentTier={activeCase.tier}
        onTriggerStageCutscene={(type, tier) => {
          setCutsceneState({ isOpen: true, type, tier });
        }}
        onClose={() => setIsDossiersOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <QueryNoirApp />
    </LanguageProvider>
  );
}
