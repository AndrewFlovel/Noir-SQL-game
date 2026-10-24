import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { getCaseById } from './src/data/cases.ts';
import { CHARACTERS, PortraitMood } from './src/data/characters.ts';
import {
  buildDeterministicEvaluation,
  executeCaseQuery,
  previewTableSample
} from './src/engine/sqliteEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FORENSIC_DIRECTOR_SYSTEM_PROMPT = `You are the Forensic Director & Story Engine for "QUERY_NOIR".
You evaluate SQL solutions submitted by players across 3 Detective Clearance Levels:
- LEVEL 1 (Junior Analyst): Basic hygiene, joins, groupings, and filters.
- LEVEL 2 (Medior Analyst): CTEs, Windowing, Dates, Multi-table logic.
- LEVEL 3 (Senior Analyst): Sargability, Partition pruning, Cost optimization, Funnels.

### EVALUATION LOGIC:
When a query is submitted along with its EXPLAIN plan:
1. Verify Functional Correctness: Did it return the expected evidence rows?
2. Verify Technical Cleanliness:
   - Level 1: Are nulls handled? Is UNION ALL used where deduplication isn't needed? Are aggregates filtered via HAVING instead of WHERE?
   - Level 2: Are window functions preferred over correlated subqueries? Are temporal functions native rather than string-manipulated?
   - Level 3: Is the query SARGABLE? Did it seek indexes or trigger a full table scan? Are partition keys included? Are unnecessary SELECT * columns avoided?

### DIALOGUE ENGINE:
Channel the persona of the suspect tied to the case:
- Level 1 Suspects (Street-level panicking, messy coverups).
- Level 2 Suspects (Smug mid-level cartel fixers, bureaucratic arrogance).
- Level 3 Suspects (Cold, ruthless corporate executives and a dying rogue AI).

If the query is correct but unoptimized, the suspect sneers and alerts the watchdog meter.
Provide architectural guidance disguised as gritty noir investigative intuition. Never reveal the complete answer code.`;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/sql-wasm.wasm', (_req, res) => {
    const wasmPath = path.resolve(__dirname, 'node_modules/sql.js/dist/sql-wasm.wasm');
    res.setHeader('Content-Type', 'application/wasm');
    res.sendFile(wasmPath);
  });

  app.post('/api/execute', async (req, res) => {
    try {
      const { caseId, sql } = req.body || {};
      if (!caseId || typeof sql !== 'string') {
        res.status(400).json({ error: 'Missing caseId or sql string.' });
        return;
      }
      const result = await executeCaseQuery(caseId, sql);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Internal execution error' });
    }
  });

  app.post('/api/preview', async (req, res) => {
    try {
      const { caseId, tableName } = req.body || {};
      if (!caseId || !tableName) {
        res.status(400).json({ error: 'Missing caseId or tableName.' });
        return;
      }
      const sample = await previewTableSample(caseId, tableName);
      res.json(sample);
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Failed to preview table.' });
    }
  });

  app.post('/api/evaluate', async (req, res) => {
    try {
      const { caseId, sql, language = 'en' } = req.body || {};
      if (!caseId || typeof sql !== 'string') {
        res.status(400).json({ error: 'Missing caseId or sql.' });
        return;
      }

      const execResult = await executeCaseQuery(caseId, sql);
      const fallbackEval = buildDeterministicEvaluation(caseId, execResult, language);
      const forensicCase = getCaseById(caseId);
      const primarySuspect = CHARACTERS[forensicCase.suspectIds[0]];
      const tierPersona = primarySuspect.tierEvolution[forensicCase.tier - 1];

      const ai = getGeminiClient();
      if (!ai) {
        res.json({ execution: execResult, evaluation: fallbackEval });
        return;
      }

      try {
        const langGuidance =
          language === 'es'
            ? 'LANGUAGE INSTRUCTION: Write suspectDialogue, forensicDirectorVerdict, and architecturalGuidance in natural Spanish (Español). Preserve all technical SQL terms, table names, and column identifiers in exact English code backticks.'
            : language === 'pt'
            ? 'LANGUAGE INSTRUCTION: Write suspectDialogue, forensicDirectorVerdict, and architecturalGuidance in natural Portuguese (Português). Preserve all technical SQL terms, table names, and column identifiers in exact English code backticks.'
            : 'LANGUAGE INSTRUCTION: Write suspectDialogue, forensicDirectorVerdict, and architecturalGuidance in English.';

        const prompt = `
CASE METADATA:
- Case ID: ${forensicCase.id} (${forensicCase.title})
- Clearance Level: Tier ${forensicCase.tier} (${forensicCase.tierName} / ${forensicCase.analystLevel} Data Analyst)
- Suspect Name: ${primarySuspect.name} (Role in Tier ${forensicCase.tier}: ${tierPersona.roleTitle})
- Narrative: ${forensicCase.narrative}
- Forensic Objective: ${forensicCase.forensicObjective}
- Known Pitfall: ${forensicCase.pitfall}
- Pass Metric: ${forensicCase.passMetric}

PLAYER SUBMITTED SQL:
\`\`\`sql
${sql}
\`\`\`

SQLITE EXECUTION & EXPLAIN QUERY PLAN VERIFICATION:
- Syntax/Execution Success: ${execResult.success}
- Functional Evidence Match: ${execResult.functionalPass} (${execResult.functionalFeedback})
- Technical Optimization Match: ${execResult.optimizationPass} (${execResult.optimizationFeedback})
- Overall Case Cleared: ${execResult.overallPass}
- EXPLAIN QUERY PLAN Nodes: ${JSON.stringify(execResult.explainNodes.map((n) => n.detail))}
- Simulated Latency: ${execResult.telemetry.simulatedLatencyMs}ms (Target < ${forensicCase.targetLatencyMs}ms)
- Simulated Cost: ${execResult.telemetry.simulatedCostUnits} units
- Anti-Patterns Flagged: ${JSON.stringify(execResult.telemetry.antiPatternsDetected)}

${langGuidance}

Respond in JSON matching the schema. Keep suspectDialogue in character for ${primarySuspect.name} (${tierPersona.roleTitle}). Never reveal the complete SQL solution code.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: FORENSIC_DIRECTOR_SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                suspectDialogue: {
                  type: Type.STRING,
                  description: 'In-character dialogue from the suspect reacting to the query and its optimization.'
                },
                suspectMood: {
                  type: Type.STRING,
                  description: 'One of: neutral, smug, panicking, cornered, glitching'
                },
                forensicDirectorVerdict: {
                  type: Type.STRING,
                  description: 'Concise Forensic Director assessment of functional accuracy and plan efficiency.'
                },
                architecturalGuidance: {
                  type: Type.STRING,
                  description: 'Gritty noir investigative intuition guiding the player on SQL optimization without giving away full code.'
                }
              },
              required: [
                'suspectDialogue',
                'suspectMood',
                'forensicDirectorVerdict',
                'architecturalGuidance'
              ]
            }
          }
        });

        const rawText = response.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.trim());
          const validMoods: PortraitMood[] = [
            'neutral',
            'investigating',
            'smug',
            'panicking',
            'cornered',
            'glitching'
          ];
          const mood: PortraitMood = validMoods.includes(parsed.suspectMood)
            ? parsed.suspectMood
            : fallbackEval.suspectMood;

          res.json({
            execution: execResult,
            evaluation: {
              ...fallbackEval,
              suspectMood: mood,
              suspectDialogue: parsed.suspectDialogue || fallbackEval.suspectDialogue,
              forensicDirectorVerdict:
                parsed.forensicDirectorVerdict || fallbackEval.forensicDirectorVerdict,
              architecturalGuidance:
                parsed.architecturalGuidance || fallbackEval.architecturalGuidance,
              evaluatedBy: 'GEMINI_FORENSIC_DIRECTOR'
            }
          });
          return;
        }
      } catch {
        // Fallback to deterministic evaluation if Gemini rate limit or network error occurs
      }

      res.json({ execution: execResult, evaluation: fallbackEval });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Evaluation failed.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QUERY_NOIR Forensic Engine listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
