import initSqlJs, { SqlJsStatic } from 'sql.js';
import { ForensicCase, getCaseById } from '../data/cases';
import { CHARACTERS, PortraitMood } from '../data/characters';
import { Language } from '../i18n/types';
import { getLocalizedCase } from '../i18n/casesI18n';
import { getLocalizedCharacters } from '../i18n/charactersI18n';

export interface ExplainNode {
  id: number;
  parent: number;
  notused: number;
  detail: string;
  isIndexSeek: boolean;
  isFullScan: boolean;
  isTempBTree: boolean;
}

export interface QueryTelemetry {
  simulatedLatencyMs: number;
  simulatedCostUnits: number;
  simulatedMemoryMb: number;
  rowsScannedLabel: string;
  scanRatio: number;
  usesIndexSeek: boolean;
  hasTempBTreeSort: boolean;
  watchdogAlertLevel: 'NOMINAL' | 'ELEVATED' | 'CRITICAL_LOCKDOWN';
  antiPatternsDetected: string[];
  optimizationsVerified: string[];
}

export interface QueryExecutionResponse {
  success: boolean;
  error?: string;
  columns: string[];
  rows: (string | number | null)[][];
  expectedColumns: string[];
  expectedRowCount: number;
  explainNodes: ExplainNode[];
  telemetry: QueryTelemetry;
  functionalPass: boolean;
  functionalFeedback: string;
  optimizationPass: boolean;
  optimizationFeedback: string;
  overallPass: boolean;
}

export interface ForensicEvaluationResponse {
  overallPass: boolean;
  functionalPass: boolean;
  optimizationPass: boolean;
  suspectId: string;
  suspectName: string;
  suspectRole: string;
  suspectMood: PortraitMood;
  suspectDialogue: string;
  forensicDirectorVerdict: string;
  architecturalGuidance: string;
  watchdogStatus: 'NOMINAL' | 'ELEVATED' | 'CRITICAL_LOCKDOWN';
  evaluatedBy: 'GEMINI_FORENSIC_DIRECTOR' | 'DETERMINISTIC_FORENSIC_CORE';
}

let sqlJsPromise: Promise<SqlJsStatic> | null = null;

async function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    const isBrowser = typeof window !== 'undefined';
    sqlJsPromise = initSqlJs(
      isBrowser
        ? {
            locateFile: () => '/api/sql-wasm.wasm'
          }
        : undefined
    );
  }
  return sqlJsPromise;
}

function normalizeCellValue(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') {
    return Number.isInteger(val) ? String(val) : val.toFixed(4).replace(/\.?0+$/, '');
  }
  return String(val).trim();
}

function compareResultSets(
  userCols: string[],
  userRows: (string | number | null)[][],
  expCols: string[],
  expRows: (string | number | null)[][]
): { match: boolean; reason: string } {
  if (userCols.length !== expCols.length) {
    return {
      match: false,
      reason: `Expected ${expCols.length} columns (${expCols.join(', ')}), but query returned ${userCols.length} columns (${userCols.join(', ') || 'none'}).`
    };
  }

  const colNamesMatch = expCols.every(
    (col, i) => (userCols[i] || '').toLowerCase() === col.toLowerCase()
  );

  if (!colNamesMatch) {
    return {
      match: false,
      reason: `Column header mismatch. Expected [${expCols.join(', ')}], got [${userCols.join(', ')}].`
    };
  }

  if (userRows.length !== expRows.length) {
    return {
      match: false,
      reason: `Row count mismatch. Expected ${expRows.length} evidence rows, but query returned ${userRows.length} rows.`
    };
  }

  for (let r = 0; r < expRows.length; r++) {
    for (let c = 0; c < expCols.length; c++) {
      const uVal = normalizeCellValue(userRows[r][c]);
      const eVal = normalizeCellValue(expRows[r][c]);
      if (uVal !== eVal) {
        return {
          match: false,
          reason: `Data mismatch at Row ${r + 1}, Column "${expCols[c]}": expected "${eVal}", got "${uVal}".`
        };
      }
    }
  }

  return {
    match: true,
    reason: `All ${expRows.length} expected forensic evidence rows and ${expCols.length} columns verified.`
  };
}

function analyzeCaseOptimization(
  forensicCase: ForensicCase,
  userSql: string,
  explainNodes: ExplainNode[],
  functionalPass: boolean
): {
  optimizationPass: boolean;
  optimizationFeedback: string;
  telemetry: QueryTelemetry;
} {
  const upperSql = userSql.toUpperCase().replace(/\s+/g, ' ').trim();
  const antiPatterns: string[] = [];
  const optimizations: string[] = [];

  const usesIndexSeek = explainNodes.some((n) => n.isIndexSeek);
  const hasTempBTreeSort = explainNodes.some((n) => n.isTempBTree);

  let simulatedLatencyMs = 8.4;
  let simulatedCostUnits = 18;
  let simulatedMemoryMb = 1.4;
  let rowsScannedLabel = '12 / 12 (Indexed)';
  let scanRatio = 1.0;

  switch (forensicCase.id) {
    case '1.1': {
      const hasUpper = /UPPER\s*\(\s*CLIENT_ALIAS\s*\)/i.test(userSql);
      const hasCoalesce = /COALESCE\s*\(\s*TRANSIT_HUB/i.test(userSql) || /IFNULL\s*\(\s*TRANSIT_HUB/i.test(userSql);
      const hasNullCheck = /PAYLOAD_KG\s+IS\s+NOT\s+NULL/i.test(userSql);
      if (hasUpper) optimizations.push('UPPER(client_alias) alias normalization');
      else antiPatterns.push('Missing UPPER(client_alias) case normalization');

      if (hasCoalesce) optimizations.push("COALESCE(transit_hub, 'OFFLINE_ROUTER') null replacement");
      else antiPatterns.push('Missing COALESCE on NULL transit_hub values');

      if (hasNullCheck) optimizations.push('Explicit IS NOT NULL payload hygiene filter');
      else antiPatterns.push('Missing payload_kg IS NOT NULL check');

      simulatedLatencyMs = antiPatterns.length === 0 ? 6.8 : 24.5;
      simulatedCostUnits = antiPatterns.length === 0 ? 14 : 62;
      rowsScannedLabel = antiPatterns.length === 0 ? '6 / 10 (Index idx_manifest_dummy)' : '120,000 / 120,000 (Unfiltered)';
      break;
    }

    case '1.2': {
      const hasWhereTestPing = /WHERE[\s\S]*IS_TEST_PING\s*=\s*0[\s\S]*GROUP\s+BY/i.test(userSql);
      const hasTestPingInHaving = /HAVING[\s\S]*IS_TEST_PING/i.test(userSql);
      const hasHavingAgg = /HAVING[\s\S]*SUM\s*\(\s*CREDIT_AMOUNT\s*\)\s*>\s*100000/i.test(userSql) &&
                           /HAVING[\s\S]*COUNT\s*\(/i.test(userSql);

      if (hasWhereTestPing && !hasTestPingInHaving) {
        optimizations.push('Early WHERE elimination of sensor test rows before GROUP BY');
      } else {
        antiPatterns.push('Failed to filter is_test_ping = 0 in WHERE prior to aggregation');
      }

      if (hasHavingAgg) {
        optimizations.push('Aggregate thresholds enforced in HAVING clause');
      } else {
        antiPatterns.push('Missing HAVING filter on SUM(credit_amount) > 100000 and COUNT(*) > 10');
      }

      simulatedLatencyMs = antiPatterns.length === 0 ? 11.2 : 68.0;
      simulatedCostUnits = antiPatterns.length === 0 ? 22 : 95;
      rowsScannedLabel = antiPatterns.length === 0 ? '45 / 48 (Index idx_acoustic_test_venue)' : '850,000 / 850,000 (Late Filter)';
      break;
    }

    case '1.3': {
      const hasDistinct = /SELECT\s+DISTINCT/i.test(userSql) || /GROUP\s+BY\s+TRANSACTION_CODE/i.test(userSql);
      const selectsEchoTs = /PING_ECHO_TS/i.test(userSql.split(/FROM/i)[0] || '');
      const hasOrderBeforeLimit = /ORDER\s+BY\s+PAYOFF_AMOUNT\s+DESC[\s\S]*LIMIT\s+10/i.test(userSql);

      if (hasDistinct && !selectsEchoTs) {
        optimizations.push('Targeted DISTINCT projection excluding noisy ping_echo_ts column');
      } else {
        antiPatterns.push('Included ping_echo_ts or omitted DISTINCT deduplication');
      }

      if (hasOrderBeforeLimit) {
        optimizations.push('Sorted by payoff_amount DESC prior to LIMIT 10 truncation');
      } else {
        antiPatterns.push('Missing ORDER BY payoff_amount DESC before LIMIT 10');
      }

      simulatedLatencyMs = antiPatterns.length === 0 ? 9.5 : 54.0;
      simulatedCostUnits = antiPatterns.length === 0 ? 28 : 88;
      rowsScannedLabel = antiPatterns.length === 0 ? '18 / 18 (Index idx_payout_amount)' : '500,000 (Buffer Overflow)';
      break;
    }

    case '1.4': {
      const hasLeftJoin = /LEFT\s+(OUTER\s+)?JOIN\s+PORT_AUTHORITY_IMPORTS/i.test(userSql);
      const hasIsNull = /WHERE[\s\S]*IS\s+NULL/i.test(userSql);
      const hasInnerJoin = /INNER\s+JOIN\s+PORT_AUTHORITY_IMPORTS/i.test(userSql);

      if (hasLeftJoin && hasIsNull && !hasInnerJoin) {
        optimizations.push('Anti-join pattern (LEFT JOIN ... WHERE right.crate_id IS NULL)');
      } else {
        antiPatterns.push('Used INNER JOIN or omitted WHERE right.crate_id IS NULL anti-join filter');
      }

      simulatedLatencyMs = antiPatterns.length === 0 ? 8.1 : 35.0;
      simulatedCostUnits = antiPatterns.length === 0 ? 19 : 70;
      rowsScannedLabel = antiPatterns.length === 0 ? '9 Arrivals -> 4 Orphaned Crates' : '0 Ghost Crates (Dropped by Inner Join)';
      break;
    }

    case '1.5': {
      const hasUnionAll = /UNION\s+ALL/i.test(userSql);
      const hasPlainUnion = /UNION(?!\s+ALL)/i.test(userSql);

      if (hasUnionAll && !hasPlainUnion) {
        optimizations.push('Zero-sort stream fusion via UNION ALL');
        simulatedMemoryMb = 1.2;
        simulatedLatencyMs = 7.4;
        simulatedCostUnits = 16;
        rowsScannedLabel = '12 / 12 (Streamed, 0 Sort Spills)';
      } else {
        antiPatterns.push('Expensive UNION deduplication sort triggered across mutually exclusive clusters (Memory > 48MB)');
        simulatedMemoryMb = 48.6;
        simulatedLatencyMs = 195.0;
        simulatedCostUnits = 140;
        rowsScannedLabel = '8,000,000 Rows Sorted in Temp B-Tree';
      }
      break;
    }

    case '2.1': {
      const hasCase = /CASE[\s\S]*WHEN[\s\S]*THEN[\s\S]*ELSE\s+'BENIGN'[\s\S]*END/i.test(userSql);
      const hasStructuredSplit = /STRUCTURED_SPLIT/i.test(userSql);

      if (hasCase && hasStructuredSplit) {
        optimizations.push('Exhaustive 3-tier CASE WHEN evaluation with non-null ELSE fallback');
      } else {
        antiPatterns.push('Incomplete CASE WHEN branches or missing ELSE \'BENIGN\' fallback');
      }

      simulatedLatencyMs = antiPatterns.length === 0 ? 11.8 : 44.0;
      simulatedCostUnits = antiPatterns.length === 0 ? 24 : 75;
      rowsScannedLabel = '8 / 8 (Single-Pass Case Classification)';
      break;
    }

    case '2.2': {
      const usesSubstr = /SUBSTR\s*\(/i.test(userSql);
      const usesNativeTime = /STRFTIME\s*\(/i.test(userSql) && /JULIANDAY\s*\(/i.test(userSql);

      if (usesNativeTime && !usesSubstr) {
        optimizations.push('Native temporal functions (strftime + julianday fractional minute math)');
      } else {
        antiPatterns.push('Used fragile string slicing (SUBSTR) or omitted native julianday/strftime functions');
      }

      simulatedLatencyMs = antiPatterns.length === 0 ? 9.2 : 62.0;
      simulatedCostUnits = antiPatterns.length === 0 ? 21 : 84;
      rowsScannedLabel = antiPatterns.length === 0 ? '4 / 5 (Index idx_chrono_officer_ts)' : 'Full Scan (Non-Native String Cast)';
      break;
    }

    case '2.3': {
      const matchesDummyJurisdiction = /S\.JURISDICTION_CODE\s*=\s*D\.JURISDICTION_CODE|D\.JURISDICTION_CODE\s*=\s*S\.JURISDICTION_CODE/i.test(userSql);
      const matchesAgentJurisdiction = /D\.JURISDICTION_CODE\s*=\s*H\.JURISDICTION_CODE|H\.JURISDICTION_CODE\s*=\s*D\.JURISDICTION_CODE/i.test(userSql);

      if (matchesDummyJurisdiction && matchesAgentJurisdiction) {
        optimizations.push('Composite-key relational joins preventing Cartesian amplification (scan ratio 1.0x)');
        scanRatio = 1.0;
        simulatedLatencyMs = 14.2;
        simulatedCostUnits = 29;
        rowsScannedLabel = '3 / 3 Target Paths (1.0x Scan Ratio)';
      } else {
        antiPatterns.push('Missing composite jurisdiction_code join condition caused Cartesian row amplification');
        scanRatio = 4.6;
        simulatedLatencyMs = 142.0;
        simulatedCostUnits = 165;
        rowsScannedLabel = 'Cartesian Fan-Out (4.6x Row Amplification)';
      }
      break;
    }

    case '2.4': {
      const usesWindowRank = /(DENSE_RANK|RANK|ROW_NUMBER)\s*\(\s*\)\s*OVER\s*\(\s*PARTITION\s+BY\s+DISTRICT/i.test(userSql);
      const usesCorrelatedSubquery = /SELECT\s+COUNT\s*\([\s\S]*FROM\s+SYNDICATE_AUCTION_BIDS[\s\S]*WHERE/i.test(
        userSql.slice(userSql.toUpperCase().indexOf('FROM') + 4)
      );

      if (usesWindowRank && !usesCorrelatedSubquery) {
        optimizations.push('Single-pass partitioned window ranking (DENSE_RANK OVER PARTITION BY district)');
        simulatedLatencyMs = 16.5;
        simulatedCostUnits = 26;
        rowsScannedLabel = '10 / 10 (1 Pass via idx_auction_district_bid)';
      } else {
        antiPatterns.push('Omitted partitioned window function or used O(N²) correlated subquery');
        simulatedLatencyMs = 340.0;
        simulatedCostUnits = 220;
        rowsScannedLabel = 'O(N²) Nested Loop Scan';
      }
      break;
    }

    case '2.5': {
      const hasWithCte = /WITH\s+\w+\s+AS/i.test(userSql);
      const hasWindowSum = /SUM\s*\(\s*DELTA_AMOUNT\s*\)\s*OVER\s*\(\s*PARTITION\s+BY\s+WALLET_ID\s+ORDER\s+BY\s+TX_TIMESTAMP/i.test(userSql);

      if (hasWithCte && hasWindowSum) {
        optimizations.push('Single CTE with cumulative SUM(delta_amount) OVER (PARTITION BY wallet_id ORDER BY tx_timestamp)');
        simulatedMemoryMb = 2.4;
        simulatedLatencyMs = 12.6;
        simulatedCostUnits = 24;
        rowsScannedLabel = '9 / 9 (Window Frame Stream, 2.4MB RAM)';
      } else {
        antiPatterns.push('Missing CTE or cumulative SUM() OVER (PARTITION BY wallet_id ORDER BY tx_timestamp) window specification');
        simulatedMemoryMb = 28.0;
        simulatedLatencyMs = 115.0;
        simulatedCostUnits = 130;
        rowsScannedLabel = 'Self-Join / Unwindowed Scan (28MB RAM)';
      }
      break;
    }

    case '3.1': {
      const hasLag = /LAG\s*\(\s*PING_EPOCH_SEC\s*\)\s*OVER/i.test(userSql);
      const hasBoundedRollingFrame = /ROWS\s+BETWEEN\s+6\s+PRECEDING\s+AND\s+CURRENT\s+ROW/i.test(userSql);
      const hasNullGuard = /IS\s+NOT\s+NULL/i.test(userSql);

      if (hasLag && hasBoundedRollingFrame && hasNullGuard) {
        optimizations.push('LAG() interval calculation paired with bounded 7-event rolling window frame and NULL boundary guard');
        scanRatio = 1.0;
        simulatedLatencyMs = 18.4;
        simulatedCostUnits = 32;
        rowsScannedLabel = '10 / 10 (Bounded 7-Row Window, Scan Ratio 1.0)';
      } else {
        if (!hasLag) antiPatterns.push('Missing LAG(ping_epoch_sec) window function');
        if (!hasBoundedRollingFrame) antiPatterns.push('Missing bounded ROWS BETWEEN 6 PRECEDING AND CURRENT ROW window frame');
        if (!hasNullGuard) antiPatterns.push('Unhandled NULL boundary row from LAG()');
        scanRatio = 3.8;
        simulatedLatencyMs = 125.0;
        simulatedCostUnits = 145;
      }
      break;
    }

    case '3.2': {
      const hasCrossJoin = /CROSS\s+JOIN\s+OFFICER_ROSTER/i.test(userSql) || /FROM\s+CALENDAR_DATES\s+\w+\s*,\s*OFFICER_ROSTER/i.test(userSql);
      const hasOuterJoin = /(LEFT|FULL)\s+(OUTER\s+)?JOIN\s+SHIFT_ACTIVITY_LOGS/i.test(userSql);
      const filtersRightTableInWhere = /WHERE[\s\S]*S\.PATROL_STATUS\s*=/i.test(userSql);

      if (hasCrossJoin && hasOuterJoin && !filtersRightTableInWhere) {
        optimizations.push('Complete CROSS JOIN date-officer grid with outer-join NULL preservation');
        simulatedLatencyMs = 15.2;
        simulatedCostUnits = 38;
        rowsScannedLabel = '9 Grid Cells -> 3 Zero-Activity Shifts Exposed';
      } else {
        if (filtersRightTableInWhere) {
          antiPatterns.push('Filtered s.patrol_status in WHERE clause, collapsing LEFT JOIN into an INNER JOIN and hiding walkout dates');
        } else {
          antiPatterns.push('Incomplete CROSS JOIN + LEFT/FULL OUTER JOIN calendar grid construction');
        }
        simulatedLatencyMs = 95.0;
        simulatedCostUnits = 240;
      }
      break;
    }

    case '3.3': {
      const tableMentions = (userSql.match(/LAUNDERING_FUNNEL_EVENTS/gi) || []).length;
      const conditionalCounts = (userSql.match(/CASE\s+WHEN\s+STAGE\s*=/gi) || []).length;

      if (tableMentions === 1 && conditionalCounts >= 5) {
        optimizations.push('Single-pass 5-stage cohort conversion funnel via conditional aggregation');
        simulatedLatencyMs = 19.8;
        simulatedCostUnits = 34;
        rowsScannedLabel = '24 / 24 (1 Pass over 10M Simulated Events)';
      } else {
        antiPatterns.push(`Scanned source funnel table ${tableMentions}x or omitted 5-stage conditional aggregation`);
        simulatedLatencyMs = 420.0;
        simulatedCostUnits = 280;
        rowsScannedLabel = `${tableMentions * 10}M Rows Scanned (Multi-Pass Penalty)`;
      }
      break;
    }

    case '3.4': {
      const hasSelectStar = /SELECT\s+\*/i.test(userSql);
      const hasDateWrapper = /DATE\s*\(\s*CREATED_AT\s*\)/i.test(userSql);
      const hasMathOnSector = /SECTOR_ID\s*\+\s*0/i.test(userSql);
      const hasSargableRange = /CREATED_AT\s*>=\s*'2099-08-15/i.test(userSql) && /CREATED_AT\s*<\s*'2099-08-16|CREATED_AT\s*<=\s*'2099-08-15/i.test(userSql);

      if (!hasSelectStar && !hasDateWrapper && !hasMathOnSector && hasSargableRange && usesIndexSeek) {
        optimizations.push('100% SARGABLE composite index seek on (sector_id, event_type, created_at) with narrow column projection');
        simulatedLatencyMs = 3.2;
        simulatedCostUnits = 8;
        simulatedMemoryMb = 0.4;
        rowsScannedLabel = '3 / 15,000,000 (Composite B-Tree Index Seek)';
      } else {
        if (hasSelectStar) antiPatterns.push('SELECT * projects heavy 64KB raw_memory_dump column');
        if (hasDateWrapper) antiPatterns.push('Non-sargable DATE(created_at) function wrapper disables index range seek');
        if (hasMathOnSector) antiPatterns.push('Non-sargable arithmetic (sector_id + 0 = 4) disables leading composite index column');
        if (!hasSargableRange) antiPatterns.push('Missing sargable created_at timestamp range predicate');
        simulatedLatencyMs = 2850.0;
        simulatedCostUnits = 950;
        simulatedMemoryMb = 64.0;
        rowsScannedLabel = '15,000,000 / 15,000,000 (FULL TABLE SCAN — WATCHDOG TRIGGERED)';
      }
      break;
    }

    case '3.5': {
      const hasPartitionPrune = /VAULT_PARTITION\s*=\s*'2099-08-HOT'/i.test(userSql) && /STATUS\s*=\s*'ACTIVE'/i.test(userSql);
      const hasPercentileFn = /(PERCENT_RANK|NTILE|CUME_DIST)\s*\(\s*\d*\s*\)\s*OVER/i.test(userSql);

      if (hasPartitionPrune && hasPercentileFn && usesIndexSeek) {
        optimizations.push('Partition pruning (2099-08-HOT + ACTIVE) combined with PERCENT_RANK() anomaly isolation (96.4% cost reduction)');
        simulatedLatencyMs = 11.4;
        simulatedCostUnits = 15;
        simulatedMemoryMb = 1.8;
        rowsScannedLabel = '11 / 1,200,000,000 (Hot Partition Pruned)';
      } else {
        if (!hasPartitionPrune) antiPatterns.push('Omitted partition pruning keys (vault_partition = \'2099-08-HOT\' AND status = \'ACTIVE\'), forcing global cold/archive partition scan');
        if (!hasPercentileFn) antiPatterns.push('Missing statistical distribution window function (PERCENT_RANK / NTILE)');
        simulatedLatencyMs = 3900.0;
        simulatedCostUnits = 990;
        simulatedMemoryMb = 128.0;
        rowsScannedLabel = '1,200,000,000 Rows (Global Partition Scan Spill)';
      }
      break;
    }
  }

  const optimizationPass = functionalPass && antiPatterns.length === 0;
  let watchdogAlertLevel: 'NOMINAL' | 'ELEVATED' | 'CRITICAL_LOCKDOWN' = 'NOMINAL';
  if (antiPatterns.length > 0) {
    watchdogAlertLevel = forensicCase.tier === 3 ? 'CRITICAL_LOCKDOWN' : 'ELEVATED';
  }

  const optimizationFeedback = optimizationPass
    ? `Forensic optimization verified: ${optimizations.join(' · ')}.`
    : antiPatterns.length > 0
      ? `Anti-pattern detected: ${antiPatterns.join(' · ')}.`
      : 'Complete functional accuracy first to validate execution plan efficiency.';

  return {
    optimizationPass,
    optimizationFeedback,
    telemetry: {
      simulatedLatencyMs,
      simulatedCostUnits,
      simulatedMemoryMb,
      rowsScannedLabel,
      scanRatio,
      usesIndexSeek,
      hasTempBTreeSort,
      watchdogAlertLevel,
      antiPatternsDetected: antiPatterns,
      optimizationsVerified: optimizations
    }
  };
}

export async function executeCaseQuery(
  caseId: string,
  userSql: string
): Promise<QueryExecutionResponse> {
  const forensicCase = getCaseById(caseId);
  const SQL = await getSqlJs();
  const db = new SQL.Database();

  try {
    db.run(forensicCase.seedSql);

    // Compute expected reference result first
    const expRes = db.exec(forensicCase.solutionSql);
    const expectedColumns = expRes[0]?.columns || forensicCase.expectedColumns;
    const expectedRows = (expRes[0]?.values || []) as (string | number | null)[][];

    // Check if user query is empty or destructive
    const trimmed = userSql.trim();
    if (!trimmed) {
      return {
        success: false,
        error: 'Query buffer is empty. Enter a SELECT or WITH query to analyze the evidence.',
        columns: [],
        rows: [],
        expectedColumns,
        expectedRowCount: expectedRows.length,
        explainNodes: [],
        telemetry: {
          simulatedLatencyMs: 0,
          simulatedCostUnits: 0,
          simulatedMemoryMb: 0,
          rowsScannedLabel: '0 rows',
          scanRatio: 0,
          usesIndexSeek: false,
          hasTempBTreeSort: false,
          watchdogAlertLevel: 'NOMINAL',
          antiPatternsDetected: [],
          optimizationsVerified: []
        },
        functionalPass: false,
        functionalFeedback: 'No SQL query executed.',
        optimizationPass: false,
        optimizationFeedback: 'No execution plan generated.',
        overallPass: false
      };
    }

    // Run EXPLAIN QUERY PLAN on user SQL
    const explainNodes: ExplainNode[] = [];
    try {
      const explainRes = db.exec(`EXPLAIN QUERY PLAN ${trimmed}`);
      if (explainRes[0]?.values) {
        for (const row of explainRes[0].values) {
          const detail = String(row[3] || '');
          explainNodes.push({
            id: Number(row[0] || 0),
            parent: Number(row[1] || 0),
            notused: Number(row[2] || 0),
            detail,
            isIndexSeek: /USING\s+(COVERING\s+)?INDEX/i.test(detail) || /SEARCH/i.test(detail),
            isFullScan: /SCAN\s+/i.test(detail) && !/USING\s+INDEX/i.test(detail),
            isTempBTree: /TEMP\s+B-TREE/i.test(detail)
          });
        }
      }
    } catch {
      // If syntax error, db.exec(trimmed) below will report the exact SQLite error
    }

    const userRes = db.exec(trimmed);
    const columns = userRes[0]?.columns || [];
    const rows = (userRes[0]?.values || []) as (string | number | null)[][];

    const comparison = compareResultSets(columns, rows, expectedColumns, expectedRows);
    const optAnalysis = analyzeCaseOptimization(
      forensicCase,
      trimmed,
      explainNodes,
      comparison.match
    );

    const overallPass = comparison.match && optAnalysis.optimizationPass;

    return {
      success: true,
      columns,
      rows,
      expectedColumns,
      expectedRowCount: expectedRows.length,
      explainNodes,
      telemetry: optAnalysis.telemetry,
      functionalPass: comparison.match,
      functionalFeedback: comparison.reason,
      optimizationPass: optAnalysis.optimizationPass,
      optimizationFeedback: optAnalysis.optimizationFeedback,
      overallPass
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'SQLite syntax or execution error.',
      columns: [],
      rows: [],
      expectedColumns: forensicCase.expectedColumns,
      expectedRowCount: 0,
      explainNodes: [],
      telemetry: {
        simulatedLatencyMs: 0,
        simulatedCostUnits: 0,
        simulatedMemoryMb: 0,
        rowsScannedLabel: 'Execution aborted',
        scanRatio: 0,
        usesIndexSeek: false,
        hasTempBTreeSort: false,
        watchdogAlertLevel: 'ELEVATED',
        antiPatternsDetected: ['SQL syntax error aborted execution plan'],
        optimizationsVerified: []
      },
      functionalPass: false,
      functionalFeedback: err?.message || 'SQL execution failed.',
      optimizationPass: false,
      optimizationFeedback: 'Fix SQL syntax error to inspect the EXPLAIN QUERY PLAN.',
      overallPass: false
    };
  } finally {
    db.close();
  }
}

export async function previewTableSample(
  caseId: string,
  tableName: string
): Promise<{ columns: string[]; rows: (string | number | null)[][] }> {
  const forensicCase = getCaseById(caseId);
  const validTable = forensicCase.tables.find((t) => t.tableName === tableName);
  if (!validTable) {
    throw new Error(`Unknown table: ${tableName}`);
  }

  const SQL = await getSqlJs();
  const db = new SQL.Database();
  try {
    db.run(forensicCase.seedSql);
    const res = db.exec(`SELECT * FROM ${validTable.tableName} LIMIT 8;`);
    return {
      columns: res[0]?.columns || [],
      rows: (res[0]?.values || []) as (string | number | null)[][]
    };
  } finally {
    db.close();
  }
}

export function buildDeterministicEvaluation(
  caseId: string,
  execResult: QueryExecutionResponse,
  lang: Language = 'en'
): ForensicEvaluationResponse {
  const forensicCase = getLocalizedCase(caseId, lang);
  const primarySuspectId = forensicCase.suspectIds[0];
  const characters = getLocalizedCharacters(lang);
  const suspect = characters[primarySuspectId] || CHARACTERS[primarySuspectId];
  const tierPersona = suspect.tierEvolution[forensicCase.tier - 1];

  if (execResult.overallPass) {
    const outroBeat =
      forensicCase.outroCutscene.find((b) => b.speakerId !== 'detective_silas') ||
      forensicCase.outroCutscene[0];

    const verdict =
      lang === 'es'
        ? `CASO ${forensicCase.id} RESUELTO — Se verificaron las filas de evidencia y las métricas de optimización nivel ${forensicCase.analystLevel} (${execResult.telemetry.simulatedLatencyMs}ms, Costo: ${execResult.telemetry.simulatedCostUnits}).`
        : lang === 'pt'
        ? `CASO ${forensicCase.id} RESOLVIDO — Verificadas as linhas de evidência e as métricas de otimização nível ${forensicCase.analystLevel} (${execResult.telemetry.simulatedLatencyMs}ms, Custo: ${execResult.telemetry.simulatedCostUnits}).`
        : `CASE ${forensicCase.id} CLEARED — Both functional evidence rows and ${forensicCase.analystLevel}-level optimization metrics verified (${execResult.telemetry.simulatedLatencyMs}ms, Cost: ${execResult.telemetry.simulatedCostUnits}).`;

    const guidance =
      execResult.telemetry.optimizationsVerified.join(' · ') ||
      (lang === 'es' ? 'Plan de ejecución limpio confirmado.' : lang === 'pt' ? 'Plano de execução exemplar confirmado.' : 'Clean execution plan confirmed.');

    return {
      overallPass: true,
      functionalPass: true,
      optimizationPass: true,
      suspectId: suspect.id,
      suspectName: suspect.name,
      suspectRole: tierPersona.roleTitle,
      suspectMood: outroBeat?.mood || 'cornered',
      suspectDialogue: outroBeat?.dialogue || tierPersona.signatureQuote,
      forensicDirectorVerdict: verdict,
      architecturalGuidance: guidance,
      watchdogStatus: 'NOMINAL',
      evaluatedBy: 'DETERMINISTIC_FORENSIC_CORE'
    };
  }

  if (execResult.functionalPass && !execResult.optimizationPass) {
    const suspectDialogue =
      lang === 'es'
        ? `"Encontraste las filas correctas, Silas, ¡pero mira tu telemetría de ejecución! ${execResult.telemetry.antiPatternsDetected[0] || 'Tu consulta es demasiado lenta'}—¡el medidor del guardián se disparó!"`
        : lang === 'pt'
        ? `"Você achou os dados certos, Silas, mas olhe a telemetria! ${execResult.telemetry.antiPatternsDetected[0] || 'Sua consulta está lenta demais'}—o alerta do sentinela acabou de disparar!"`
        : `"You found the right rows, Silas, but look at your execution telemetry! ${execResult.telemetry.antiPatternsDetected[0] || 'Your query is too slow'}—the Watchdog meter just spiked!"`;

    const verdict =
      lang === 'es'
        ? `EVIDENCIA INADMISIBLE (PLAN NO OPTIMIZADO) — La consulta devolvió las filas correctas, pero violó la higiene de rendimiento para nivel ${forensicCase.analystLevel}.`
        : lang === 'pt'
        ? `EVIDÊNCIA INADMISSÍVEL (PLANO NÃO OTIMIZADO) — A consulta retornou as linhas certas, mas violou o padrão de desempenho nível ${forensicCase.analystLevel}.`
        : `EVIDENCE INADMISSIBLE (UNOPTIMIZED PLAN) — Query returned the right rows, but violated ${forensicCase.analystLevel} performance hygiene.`;

    const guidance =
      lang === 'es'
        ? `${execResult.optimizationFeedback} Recordatorio de trampa: ${forensicCase.pitfall}`
        : lang === 'pt'
        ? `${execResult.optimizationFeedback} Lembrete de armadilha: ${forensicCase.pitfall}`
        : `${execResult.optimizationFeedback} Pitfall reminder: ${forensicCase.pitfall}`;

    return {
      overallPass: false,
      functionalPass: true,
      optimizationPass: false,
      suspectId: suspect.id,
      suspectName: suspect.name,
      suspectRole: tierPersona.roleTitle,
      suspectMood: suspect.id === 'archivist_zero' ? 'glitching' : 'smug',
      suspectDialogue,
      forensicDirectorVerdict: verdict,
      architecturalGuidance: guidance,
      watchdogStatus: execResult.telemetry.watchdogAlertLevel,
      evaluatedBy: 'DETERMINISTIC_FORENSIC_CORE'
    };
  }

  const verdict =
    lang === 'es'
      ? `EVIDENCIA NO COINCIDE — ${execResult.functionalFeedback}`
      : lang === 'pt'
      ? `EVIDÊNCIA INCOMPATÍVEL — ${execResult.functionalFeedback}`
      : `EVIDENCE MISMATCH — ${execResult.functionalFeedback}`;

  const guidance =
    lang === 'es'
      ? `Revisa el Objetivo Forense del Caso ${forensicCase.id}: ${forensicCase.forensicObjective}`
      : lang === 'pt'
      ? `Consulte o Objetivo Forense do Caso ${forensicCase.id}: ${forensicCase.forensicObjective}`
      : `Review the Forensic Objective for Case ${forensicCase.id}: ${forensicCase.forensicObjective}`;

  return {
    overallPass: false,
    functionalPass: false,
    optimizationPass: false,
    suspectId: suspect.id,
    suspectName: suspect.name,
    suspectRole: tierPersona.roleTitle,
    suspectMood: suspect.id === 'archivist_zero' ? 'glitching' : 'smug',
    suspectDialogue: `"${tierPersona.signatureQuote}"`,
    forensicDirectorVerdict: verdict,
    architecturalGuidance: guidance,
    watchdogStatus: execResult.telemetry.watchdogAlertLevel,
    evaluatedBy: 'DETERMINISTIC_FORENSIC_CORE'
  };
}
