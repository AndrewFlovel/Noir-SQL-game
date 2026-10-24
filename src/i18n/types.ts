export type Language = 'en' | 'es' | 'pt';

export interface TranslationsDictionary {
  // Brand & Navigation
  brandTitle: string;
  navActiveCase: string;
  navCaseIndex: string;
  navDossiers: string;
  navCurriculum: string;
  submitEvidence: string;
  evaluatingEvidence: string;

  // Progression Toolbar
  tier1Name: string;
  tier2Name: string;
  tier3Name: string;
  casesCleared: string;
  progressiveMode: string;
  unlockedMode: string;
  modeTooltip: string;

  // Left Pane: Tabs & Dossier
  tabCaseDossier: string;
  tabDatabaseSchema: string;
  forensicNarrative: string;
  forensicObjective: string;
  knownPitfall: string;
  passMetric: string;
  coreConcepts: string;
  antiPatternSolved: string;
  simulatingLabel: string;
  schemaSamplePreview: string;
  previewRowsCount: string;
  tableIndexes: string;
  primaryKeyBadge: string;
  indexedBadge: string;
  previewSampleBtn: string;
  closeSampleBtn: string;

  // Center Pane: SQL Terminal
  terminalTitle: string;
  targetLatencyLabel: string;
  runQueryBtn: string;
  runningQueryBtn: string;
  resetStarterSqlBtn: string;
  unlockHintBtn: string;
  allHintsUnlocked: string;
  hintsRemainingLabel: string;
  hintLevel: string;

  // Right Pane: Tabs & Results
  tabEvidenceRows: string;
  tabExplainPlan: string;
  tabInterrogation: string;
  evidenceRowCount: string;
  evidenceColumnsCount: string;
  noResultsYet: string;
  noResultsSubtext: string;
  queryErrorTitle: string;

  // Telemetry Dashboard
  simulatedLatency: string;
  engineCost: string;
  memoryFootprint: string;
  rowsScanned: string;
  watchdogStatus: string;
  statusNominal: string;
  statusElevated: string;
  statusCritical: string;
  scanRatioLabel: string;
  indexSeekBadge: string;
  fullScanBadge: string;
  tempBTreeSortBadge: string;

  // Interrogation Pane
  suspectConfrontation: string;
  forensicDirectorAssessment: string;
  investigativeIntuition: string;
  antiPatternsDetected: string;
  optimizationsVerified: string;
  evaluatedByGemini: string;
  evaluatedByDeterministic: string;

  // Modals & Cutscenes
  curriculumModalTitle: string;
  curriculumModalSubtitle: string;
  dossiersModalTitle: string;
  dossiersModalSubtitle: string;
  closeBtn: string;
  nextBeatBtn: string;
  fastForwardBtn: string;
  investigateBtn: string;
  caseClearedBanner: string;
  stageIntroBanner: string;
  reopenCutsceneBtn: string;

  // Stage Theatre
  showStageTheatre: string;
  hideStageTheatre: string;
  stageOpeningBriefing: string;
  stageFinaleShowdown: string;
  caseOpeningConfrontation: string;
  caseResolutionShowdown: string;
  stageIntroBtn: string;
  caseIntroBtn: string;
  caseOutroBtn: string;
  stageFinaleBtn: string;
  fullscreenCutscene: string;
  collapseBtn: string;
  detectiveBadge: string;
  targetSuspectBadge: string;
  beatLabel: string;
  nextBeatArrow: string;
  replayBeat1: string;
}

export interface CaseTranslation {
  title: string;
  flowLabel: string;
  narrative: string;
  forensicObjective: string;
  pitfall: string;
  passMetric: string;
  hints: [string, string, string];
  tableDescriptions?: Record<string, string>;
  columnDescriptions?: Record<string, Record<string, string>>;
}
