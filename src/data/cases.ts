import { CharacterId, CutsceneBeat } from './characters';

export interface TableColumnSchema {
  name: string;
  type: string;
  description: string;
  isPrimaryKey?: boolean;
  isIndexed?: boolean;
}

export interface TableSchemaInfo {
  tableName: string;
  rowCountLabel: string;
  description: string;
  indexes: string[];
  columns: TableColumnSchema[];
}

export interface ForensicCase {
  id: string;
  caseNumber: number;
  tier: 1 | 2 | 3;
  tierName: 'Beat Sleuth' | 'Syndicate Detective' | 'Forensic Mastermind';
  analystLevel: 'Junior' | 'Medior' | 'Senior';
  title: string;
  flowLabel: string;
  suspectIds: CharacterId[];
  suspectDisplay: string;
  narrative: string;
  concepts: string[];
  primaryConcept: string;
  antiPatternSolved: string;
  forensicObjective: string;
  expectedColumns: string[];
  pitfall: string;
  passMetric: string;
  targetLatencyMs: number;
  targetMaxCost: number;
  tables: TableSchemaInfo[];
  seedSql: string;
  starterSql: string;
  solutionSql: string;
  hints: [string, string, string];
  introCutscene: CutsceneBeat[];
  outroCutscene: CutsceneBeat[];
}

export const FORENSIC_CASES: ForensicCase[] = [
  // ============================================================================
  // TIER 1: BEAT SLEUTH (Junior Data Analyst)
  // ============================================================================
  {
    id: '1.1',
    caseNumber: 1,
    tier: 1,
    tierName: 'Beat Sleuth',
    analystLevel: 'Junior',
    title: 'The Dirty Ledger',
    flowLabel: 'Cleaning',
    suspectIds: ['vincent_chen'],
    suspectDisplay: 'Vincent "Bit-Shift" Chen',
    narrative:
      'Chen’s black-market hardware manifest is deliberately polluted with dummy records, lowercase aliases, and null payload values to confuse customs daemons.',
    concepts: ['SELECT', 'WHERE', 'COALESCE', 'IS NULL', 'UPPER / LOWER'],
    primaryConcept: 'SELECT, WHERE, COALESCE, IS NULL',
    antiPatternSolved: 'Null value drops, mixed-case misses',
    forensicObjective:
      "Extract all valid hardware shipments (`is_dummy = 0` and `payload_kg IS NOT NULL`), normalizing `client_alias` to uppercase as `client_alias`, replacing missing `transit_hub` (`NULL`) with `'OFFLINE_ROUTER'` as `transit_hub`, and returning `shipment_id`, `client_alias`, `transit_hub`, `payload_kg` ordered by `shipment_id ASC`.",
    expectedColumns: ['shipment_id', 'client_alias', 'transit_hub', 'payload_kg'],
    pitfall:
      'Omitting null checks drops rows silently; unhandled lowercase aliases miss target cartel hubs.',
    passMetric: '0 missing values, latency < 15ms.',
    targetLatencyMs: 15,
    targetMaxCost: 35,
    tables: [
      {
        tableName: 'hardware_manifest',
        rowCountLabel: '12 rows (Simulating 120K customs manifest records)',
        description: 'Black-market shipment ledger seized from Dock 4.',
        indexes: ['idx_manifest_dummy (is_dummy)'],
        columns: [
          { name: 'shipment_id', type: 'TEXT', description: 'Unique manifest tracking ID', isPrimaryKey: true },
          { name: 'client_alias', type: 'TEXT', description: 'Buyer handle (polluted with mixed/lowercase strings)' },
          { name: 'transit_hub', type: 'TEXT', description: 'Routing node (NULL when routed via dark fiber)' },
          { name: 'payload_kg', type: 'INTEGER', description: 'Hardware crate mass in kg (NULL on corrupted scans)' },
          { name: 'is_dummy', type: 'INTEGER', description: '1 = decoy chaff record, 0 = real shipment', isIndexed: true }
        ]
      }
    ],
    seedSql: `
      CREATE TABLE hardware_manifest (
        shipment_id TEXT PRIMARY KEY,
        client_alias TEXT,
        transit_hub TEXT,
        payload_kg INTEGER,
        is_dummy INTEGER
      );
      CREATE INDEX idx_manifest_dummy ON hardware_manifest(is_dummy);
      INSERT INTO hardware_manifest VALUES
        ('SHP-101', 'night_owl', 'SECTOR_7_DOCK', 420, 0),
        ('SHP-102', 'NIGHT_OWL', NULL, 850, 0),
        ('SHP-103', 'dummy_bot', 'SECTOR_1_GATE', 120, 1),
        ('SHP-104', 'Zero_Cool', NULL, 640, 0),
        ('SHP-105', 'red_lotus', 'EAST_PIER_NODE', NULL, 0),
        ('SHP-106', 'Red_Lotus', 'EAST_PIER_NODE', 910, 0),
        ('SHP-107', 'ghost_proxy', 'WEST_TERMINAL', 300, 1),
        ('SHP-108', 'kestrel_9', NULL, 530, 0),
        ('SHP-109', 'KESTREL_9', 'NORTH_GRID_HUB', 775, 0),
        ('SHP-110', 'null_chaff', NULL, NULL, 1);
    `,
    starterSql: `-- Case 1.1: The Dirty Ledger
-- Normalize client_alias to uppercase, replace NULL transit_hub with 'OFFLINE_ROUTER',
-- and filter out dummy records (is_dummy = 0) and null payload_kg rows.

SELECT
  shipment_id,
  client_alias,
  transit_hub,
  payload_kg
FROM hardware_manifest
WHERE is_dummy = 0
ORDER BY shipment_id ASC;`,
    solutionSql: `SELECT
  shipment_id,
  UPPER(client_alias) AS client_alias,
  COALESCE(transit_hub, 'OFFLINE_ROUTER') AS transit_hub,
  payload_kg
FROM hardware_manifest
WHERE is_dummy = 0
  AND payload_kg IS NOT NULL
ORDER BY shipment_id ASC;`,
    hints: [
      'Use UPPER(client_alias) AS client_alias to normalize mixed-case handles like "night_owl" and "Red_Lotus".',
      "Use COALESCE(transit_hub, 'OFFLINE_ROUTER') AS transit_hub so shipments routed through dark hubs are retained with a clean fallback label.",
      'Filter WHERE is_dummy = 0 AND payload_kg IS NOT NULL, then ORDER BY shipment_id ASC.'
    ],
    introCutscene: [
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Beat Sleuth (Junior Clearance)',
        mood: 'investigating',
        dialogue: 'We seized your Dock 4 manifest, Vincent. Half the routing hubs are NULL and the buyer aliases are cased like ransom notes.',
        forensicNote: 'OBJECTIVE: Clean hardware_manifest using UPPER(), COALESCE(), and strict NULL filtering.'
      },
      {
        speakerId: 'vincent_chen',
        speakerName: 'Vincent "Bit-Shift" Chen',
        speakerRole: 'Street Fence',
        mood: 'smug',
        dialogue: 'Customs scripts choke on NULL hubs and lowercase handles, Silas! By the time you clean that ledger by hand, my barges will be out in international waters.',
        forensicNote: 'PITFALL WARNING: Leaving NULL transit hubs or corrupted payload_kg rows breaks downstream customs audit.'
      }
    ],
    outroCutscene: [
      {
        speakerId: 'vincent_chen',
        speakerName: 'Vincent "Bit-Shift" Chen',
        speakerRole: 'Street Fence',
        mood: 'panicking',
        dialogue: 'Wait—you mapped every NULL hub to OFFLINE_ROUTER and merged my lowercase aliases in under 15 milliseconds?! Who taught a precinct sleuth COALESCE?!',
        forensicNote: 'EVIDENCE LOCKED: 6 verified contraband shipments isolated with zero missing values.'
      },
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Beat Sleuth (Junior Clearance)',
        mood: 'investigating',
        dialogue: 'Your dark-fiber hubs aren’t invisible anymore, Chen. And those payout credits lead straight to the Neon Sector lounges.',
        forensicNote: 'NEXT LEAD UNLOCKED: Case 1.2 — The Neon Stash (Dolores "Deadlock" Delgado).'
      }
    ]
  },

  {
    id: '1.2',
    caseNumber: 2,
    tier: 1,
    tierName: 'Beat Sleuth',
    analystLevel: 'Junior',
    title: 'The Neon Stash',
    flowLabel: 'Aggregate',
    suspectIds: ['dolores_delgado'],
    suspectDisplay: 'Dolores "Deadlock" Delgado',
    narrative:
      "Dolores's acoustic monitoring devices record hush-money drop-offs across clubs in the entertainment sector. Silas needs to locate clubs handling suspicious cash volumes.",
    concepts: ['COUNT / SUM / AVG', 'GROUP BY', 'HAVING vs WHERE'],
    primaryConcept: 'GROUP BY, HAVING vs WHERE',
    antiPatternSolved: 'Filtering aggregates in WHERE clause',
    forensicObjective:
      'Identify `venue_id`, `COUNT(*) AS ping_count`, and `SUM(credit_amount) AS total_payoff` from `acoustic_drop_logs` where valid sensor rows (`is_test_ping = 0`) have `total_payoff > 100000` and `ping_count > 10`, ordered by `total_payoff DESC`.',
    expectedColumns: ['venue_id', 'ping_count', 'total_payoff'],
    pitfall:
      'Attempting to filter aggregate sums inside WHERE instead of HAVING, or filtering sensor errors in HAVING rather than early in WHERE.',
    passMetric: 'Accurate group aggregates; early elimination of test rows before aggregation.',
    targetLatencyMs: 20,
    targetMaxCost: 40,
    tables: [
      {
        tableName: 'acoustic_drop_logs',
        rowCountLabel: '48 rows (Simulating 850K club acoustic sensor pings)',
        description: 'Sub-audible cash counter logs wired underneath VIP club booths.',
        indexes: ['idx_acoustic_test_venue (is_test_ping, venue_id)'],
        columns: [
          { name: 'ping_id', type: 'INTEGER', description: 'Acoustic event ID', isPrimaryKey: true },
          { name: 'venue_id', type: 'TEXT', description: 'Entertainment sector club identifier', isIndexed: true },
          { name: 'credit_amount', type: 'INTEGER', description: 'Digital credits transferred during drop' },
          { name: 'is_test_ping', type: 'INTEGER', description: '1 = soundcheck test noise, 0 = live drop', isIndexed: true },
          { name: 'recorded_at', type: 'TEXT', description: 'ISO timestamp of acoustic capture' }
        ]
      }
    ],
    seedSql: `
      CREATE TABLE acoustic_drop_logs (
        ping_id INTEGER PRIMARY KEY,
        venue_id TEXT,
        credit_amount INTEGER,
        is_test_ping INTEGER,
        recorded_at TEXT
      );
      CREATE INDEX idx_acoustic_test_venue ON acoustic_drop_logs(is_test_ping, venue_id);
      INSERT INTO acoustic_drop_logs (venue_id, credit_amount, is_test_ping, recorded_at) VALUES
        -- VENUE_CRIMSON_VELVET: 12 valid pings totaling 144,000 + 2 test pings
        ('VENUE_CRIMSON_VELVET', 12000, 0, '2099-08-01 21:00:00'),
        ('VENUE_CRIMSON_VELVET', 15000, 0, '2099-08-01 21:05:00'),
        ('VENUE_CRIMSON_VELVET', 11000, 0, '2099-08-01 21:10:00'),
        ('VENUE_CRIMSON_VELVET', 14000, 0, '2099-08-01 21:15:00'),
        ('VENUE_CRIMSON_VELVET', 10000, 0, '2099-08-01 21:20:00'),
        ('VENUE_CRIMSON_VELVET', 13000, 0, '2099-08-01 21:25:00'),
        ('VENUE_CRIMSON_VELVET', 12500, 0, '2099-08-01 21:30:00'),
        ('VENUE_CRIMSON_VELVET', 11500, 0, '2099-08-01 21:35:00'),
        ('VENUE_CRIMSON_VELVET', 10500, 0, '2099-08-01 21:40:00'),
        ('VENUE_CRIMSON_VELVET', 13500, 0, '2099-08-01 21:45:00'),
        ('VENUE_CRIMSON_VELVET', 10000, 0, '2099-08-01 21:50:00'),
        ('VENUE_CRIMSON_VELVET', 11000, 0, '2099-08-01 21:55:00'),
        ('VENUE_CRIMSON_VELVET', 99000, 1, '2099-08-01 20:00:00'),
        -- VENUE_OBSIDIAN_CHORD: 11 valid pings totaling 121,000
        ('VENUE_OBSIDIAN_CHORD', 11000, 0, '2099-08-01 22:01:00'),
        ('VENUE_OBSIDIAN_CHORD', 10000, 0, '2099-08-01 22:04:00'),
        ('VENUE_OBSIDIAN_CHORD', 12000, 0, '2099-08-01 22:08:00'),
        ('VENUE_OBSIDIAN_CHORD', 11000, 0, '2099-08-01 22:12:00'),
        ('VENUE_OBSIDIAN_CHORD', 10500, 0, '2099-08-01 22:16:00'),
        ('VENUE_OBSIDIAN_CHORD', 11500, 0, '2099-08-01 22:20:00'),
        ('VENUE_OBSIDIAN_CHORD', 11000, 0, '2099-08-01 22:24:00'),
        ('VENUE_OBSIDIAN_CHORD', 10000, 0, '2099-08-01 22:28:00'),
        ('VENUE_OBSIDIAN_CHORD', 12000, 0, '2099-08-01 22:32:00'),
        ('VENUE_OBSIDIAN_CHORD', 11000, 0, '2099-08-01 22:36:00'),
        ('VENUE_OBSIDIAN_CHORD', 11000, 0, '2099-08-01 22:40:00'),
        -- VENUE_BLUE_MIRAGE: 9 valid pings totaling 135,000 (fails > 10 frequency check unless test pings included!)
        ('VENUE_BLUE_MIRAGE', 15000, 0, '2099-08-01 23:01:00'),
        ('VENUE_BLUE_MIRAGE', 15000, 0, '2099-08-01 23:05:00'),
        ('VENUE_BLUE_MIRAGE', 15000, 0, '2099-08-01 23:10:00'),
        ('VENUE_BLUE_MIRAGE', 15000, 0, '2099-08-01 23:15:00'),
        ('VENUE_BLUE_MIRAGE', 15000, 0, '2099-08-01 23:20:00'),
        ('VENUE_BLUE_MIRAGE', 15000, 0, '2099-08-01 23:25:00'),
        ('VENUE_BLUE_MIRAGE', 15000, 0, '2099-08-01 23:30:00'),
        ('VENUE_BLUE_MIRAGE', 15000, 0, '2099-08-01 23:35:00'),
        ('VENUE_BLUE_MIRAGE', 15000, 0, '2099-08-01 23:40:00'),
        ('VENUE_BLUE_MIRAGE', 50000, 1, '2099-08-01 23:45:00'),
        ('VENUE_BLUE_MIRAGE', 50000, 1, '2099-08-01 23:50:00'),
        -- VENUE_STATIC_ROOM: 11 valid pings totaling 55,000 (fails > 100,000 sum check)
        ('VENUE_STATIC_ROOM', 5000, 0, '2099-08-02 00:01:00'),
        ('VENUE_STATIC_ROOM', 5000, 0, '2099-08-02 00:02:00'),
        ('VENUE_STATIC_ROOM', 5000, 0, '2099-08-02 00:03:00'),
        ('VENUE_STATIC_ROOM', 5000, 0, '2099-08-02 00:04:00'),
        ('VENUE_STATIC_ROOM', 5000, 0, '2099-08-02 00:05:00'),
        ('VENUE_STATIC_ROOM', 5000, 0, '2099-08-02 00:06:00'),
        ('VENUE_STATIC_ROOM', 5000, 0, '2099-08-02 00:07:00'),
        ('VENUE_STATIC_ROOM', 5000, 0, '2099-08-02 00:08:00'),
        ('VENUE_STATIC_ROOM', 5000, 0, '2099-08-02 00:09:00'),
        ('VENUE_STATIC_ROOM', 5000, 0, '2099-08-02 00:10:00'),
        ('VENUE_STATIC_ROOM', 5000, 0, '2099-08-02 00:11:00');
    `,
    starterSql: `-- Case 1.2: The Neon Stash
-- Filter out test sensor pings (is_test_ping = 0) BEFORE grouping,
-- then return venue_id, COUNT(*) AS ping_count, SUM(credit_amount) AS total_payoff
-- where total_payoff > 100000 AND ping_count > 10.

SELECT
  venue_id,
  COUNT(*) AS ping_count,
  SUM(credit_amount) AS total_payoff
FROM acoustic_drop_logs
GROUP BY venue_id
ORDER BY total_payoff DESC;`,
    solutionSql: `SELECT
  venue_id,
  COUNT(*) AS ping_count,
  SUM(credit_amount) AS total_payoff
FROM acoustic_drop_logs
WHERE is_test_ping = 0
GROUP BY venue_id
HAVING SUM(credit_amount) > 100000
   AND COUNT(*) > 10
ORDER BY total_payoff DESC;`,
    hints: [
      'Eliminate invalid test sensor logs early using WHERE is_test_ping = 0 before the GROUP BY clause.',
      'Use HAVING SUM(credit_amount) > 100000 AND COUNT(*) > 10 to filter the aggregated club totals.',
      'Order the final suspect venues by total_payoff DESC.'
    ],
    introCutscene: [
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Beat Sleuth (Junior Clearance)',
        mood: 'investigating',
        dialogue: 'Nice acoustics in the Crimson Velvet Lounge, Dolores. Your booth microphones aren’t recording jazz—they’re logging Syndicate cash drops.',
        forensicNote: 'OBJECTIVE: Separate live drops from soundcheck test pings, then isolate clubs with >10 drops and >100,000 credits.'
      },
      {
        speakerId: 'dolores_delgado',
        speakerName: 'Dolores "Deadlock" Delgado',
        speakerRole: 'Lounge Singer',
        mood: 'smug',
        dialogue: 'Every sound engineer runs a few hundred thousand credits of test calibration pings before showtime, darling. Try proving which clubs crossed the threshold.',
        forensicNote: 'PITFALL WARNING: Aggregating before filtering is_test_ping = 0 will falsely implicate Blue Mirage.'
      }
    ],
    outroCutscene: [
      {
        speakerId: 'dolores_delgado',
        speakerName: 'Dolores "Deadlock" Delgado',
        speakerRole: 'Lounge Singer',
        mood: 'cornered',
        dialogue: 'You stripped out my soundcheck noise in WHERE and trapped Crimson Velvet and Obsidian Chord in HAVING... You know your execution order, Detective.',
        forensicNote: 'EVIDENCE LOCKED: 2 high-volume drop venues isolated; test calibration noise purged pre-aggregation.'
      },
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Beat Sleuth (Junior Clearance)',
        mood: 'investigating',
        dialogue: 'And guess whose badge number shows up on the pickup side of those club drops? Inspector Marcus Vane.',
        forensicNote: 'NEXT LEAD UNLOCKED: Case 1.3 — The Precinct Shakedown (Inspector Marcus Vane).'
      }
    ]
  },

  {
    id: '1.3',
    caseNumber: 3,
    tier: 1,
    tierName: 'Beat Sleuth',
    analystLevel: 'Junior',
    title: 'The Precinct Shakedown',
    flowLabel: 'Deduplicate',
    suspectIds: ['marcus_vane'],
    suspectDisplay: 'Inspector Marcus Vane',
    narrative:
      'Vane’s precinct logs contain duplicate transaction pings to disguise payouts. Silas must pull the clean top transactions before the terminal buffer saturates.',
    concepts: ['ORDER BY', 'LIMIT', 'DISTINCT'],
    primaryConcept: 'ORDER BY, LIMIT, DISTINCT',
    antiPatternSolved: 'Indiscriminate DISTINCT & sorting buffer exhaustion',
    forensicObjective:
      'Deduplicate `precinct_payout_logs` on `transaction_code`, `officer_id`, and `payoff_amount` (excluding the noisy `ping_echo_ts` column) and return the top 10 unique highest payoffs ordered by `payoff_amount DESC, transaction_code ASC`.',
    expectedColumns: ['transaction_code', 'officer_id', 'payoff_amount'],
    pitfall:
      'Applying LIMIT before sorting, or calling DISTINCT on unnecessary columns (e.g., timestamps) which prevents deduplication.',
    passMetric: 'Exact top 10 unique rows; execution cost under 50 units.',
    targetLatencyMs: 20,
    targetMaxCost: 50,
    tables: [
      {
        tableName: 'precinct_payout_logs',
        rowCountLabel: '22 rows (Simulating 500K echoed precinct ledger entries)',
        description: 'Precinct 9 vice squad disbursement log with artificial echo timestamps.',
        indexes: ['idx_payout_amount (payoff_amount DESC, officer_id, transaction_code)'],
        columns: [
          { name: 'log_id', type: 'INTEGER', description: 'Raw packet sequence ID', isPrimaryKey: true },
          { name: 'transaction_code', type: 'TEXT', description: 'Unique bribe voucher code', isIndexed: true },
          { name: 'officer_id', type: 'TEXT', description: 'Recipient badge ID', isIndexed: true },
          { name: 'payoff_amount', type: 'INTEGER', description: 'Credit payout amount', isIndexed: true },
          { name: 'ping_echo_ts', type: 'TEXT', description: 'Mutating repeater timestamp injected to defeat naive DISTINCT *' }
        ]
      }
    ],
    seedSql: `
      CREATE TABLE precinct_payout_logs (
        log_id INTEGER PRIMARY KEY,
        transaction_code TEXT,
        officer_id TEXT,
        payoff_amount INTEGER,
        ping_echo_ts TEXT
      );
      CREATE INDEX idx_payout_amount ON precinct_payout_logs(payoff_amount DESC, officer_id, transaction_code);
      INSERT INTO precinct_payout_logs (transaction_code, officer_id, payoff_amount, ping_echo_ts) VALUES
        ('TX-901', 'BADGE-VANE-01', 95000, '2099-08-03 01:00:00.101'),
        ('TX-901', 'BADGE-VANE-01', 95000, '2099-08-03 01:00:00.409'),
        ('TX-902', 'BADGE-KROSS-04', 88000, '2099-08-03 01:02:10.001'),
        ('TX-902', 'BADGE-KROSS-04', 88000, '2099-08-03 01:02:10.552'),
        ('TX-903', 'BADGE-VANE-01', 82000, '2099-08-03 01:05:00.111'),
        ('TX-904', 'BADGE-MERCER-09', 79000, '2099-08-03 01:08:22.100'),
        ('TX-904', 'BADGE-MERCER-09', 79000, '2099-08-03 01:08:22.900'),
        ('TX-905', 'BADGE-STARK-12', 74000, '2099-08-03 01:11:00.000'),
        ('TX-906', 'BADGE-VANE-01', 69000, '2099-08-03 01:15:00.120'),
        ('TX-906', 'BADGE-VANE-01', 69000, '2099-08-03 01:15:00.890'),
        ('TX-907', 'BADGE-HOLT-07', 65000, '2099-08-03 01:18:00.001'),
        ('TX-908', 'BADGE-KROSS-04', 61000, '2099-08-03 01:20:00.001'),
        ('TX-909', 'BADGE-MERCER-09', 58000, '2099-08-03 01:22:00.001'),
        ('TX-909', 'BADGE-MERCER-09', 58000, '2099-08-03 01:22:00.777'),
        ('TX-910', 'BADGE-VANE-01', 54000, '2099-08-03 01:25:00.001'),
        ('TX-911', 'BADGE-ROOKE-19', 49000, '2099-08-03 01:28:00.001'),
        ('TX-912', 'BADGE-STARK-12', 45000, '2099-08-03 01:30:00.001'),
        ('TX-913', 'BADGE-HOLT-07', 39000, '2099-08-03 01:35:00.001');
    `,
    starterSql: `-- Case 1.3: The Precinct Shakedown
-- Deduplicate the ledger and output the top 10 unique highest cash payoffs:
-- transaction_code, officer_id, payoff_amount

SELECT DISTINCT
  transaction_code,
  officer_id,
  payoff_amount,
  ping_echo_ts
FROM precinct_payout_logs
LIMIT 10;`,
    solutionSql: `SELECT DISTINCT
  transaction_code,
  officer_id,
  payoff_amount
FROM precinct_payout_logs
ORDER BY payoff_amount DESC, transaction_code ASC
LIMIT 10;`,
    hints: [
      'Remove ping_echo_ts from the SELECT list—including the repeater timestamp prevents DISTINCT from collapsing duplicate payouts.',
      'Project only SELECT DISTINCT transaction_code, officer_id, payoff_amount.',
      'Add ORDER BY payoff_amount DESC, transaction_code ASC before LIMIT 10.'
    ],
    introCutscene: [
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Beat Sleuth (Junior Clearance)',
        mood: 'investigating',
        dialogue: 'Inspector Vane. Your Vice Squad terminal has been echoing every bribe voucher with microsecond jitter to flood the audit buffer.',
        forensicNote: 'OBJECTIVE: Project only the core payout columns with DISTINCT, sort descending, and cap at the top 10.'
      },
      {
        speakerId: 'marcus_vane',
        speakerName: 'Inspector Marcus Vane',
        speakerRole: 'Crooked Beat Cop',
        mood: 'smug',
        dialogue: 'Careful, Silas. If you run DISTINCT across the repeater timestamp column, you’ll just pull duplicate echoes of the same voucher and your warrant gets tossed.',
        forensicNote: 'PITFALL WARNING: Including ping_echo_ts in SELECT DISTINCT defeats deduplication.'
      }
    ],
    outroCutscene: [
      {
        speakerId: 'marcus_vane',
        speakerName: 'Inspector Marcus Vane',
        speakerRole: 'Crooked Beat Cop',
        mood: 'cornered',
        dialogue: 'You stripped out the repeater timestamps and pulled the exact top ten vouchers... You’re making enemies above your clearance level, Vance.',
        forensicNote: 'EVIDENCE LOCKED: Top 10 unique officer payoffs verified under 50 cost units.'
      },
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Beat Sleuth (Junior Clearance)',
        mood: 'investigating',
        dialogue: 'Four of those top ten payoffs went straight to BADGE-VANE-01 to wave unregistered cargo through the docks. Let’s visit Chen’s pier.',
        forensicNote: 'NEXT LEAD UNLOCKED: Case 1.4 — The Dockside Cross (Vincent "Bit-Shift" Chen).'
      }
    ]
  },

  {
    id: '1.4',
    caseNumber: 4,
    tier: 1,
    tierName: 'Beat Sleuth',
    analystLevel: 'Junior',
    title: 'The Dockside Cross',
    flowLabel: 'Join Filter',
    suspectIds: ['vincent_chen'],
    suspectDisplay: 'Vincent "Bit-Shift" Chen',
    narrative:
      'Contraband memory crates are arriving at the cargo docks. Some shipments match registered dock manifests; others are unregistered "ghost crates."',
    concepts: ['INNER JOIN', 'LEFT JOIN', 'IS NULL'],
    primaryConcept: 'INNER JOIN vs LEFT JOIN',
    antiPatternSolved: 'Dropping ghost records via accidental inner joins',
    forensicObjective:
      'Isolate all unregistered ghost crates from `dock_crate_arrivals` that have no matching `crate_id` in `port_authority_imports`. Return `crate_id`, `dock_berth`, `origin_vessel`, and `declared_contents` ordered by `crate_id ASC`.',
    expectedColumns: ['crate_id', 'dock_berth', 'origin_vessel', 'declared_contents'],
    pitfall:
      'Using an INNER JOIN (which eliminates ghost crates completely) instead of a LEFT JOIN ... WHERE right_table.id IS NULL.',
    passMetric: '100% detection of orphaned crates; no dropped records.',
    targetLatencyMs: 20,
    targetMaxCost: 45,
    tables: [
      {
        tableName: 'dock_crate_arrivals',
        rowCountLabel: '9 rows (Physical crane unload sensor log)',
        description: 'Every physical crate hoisted off cargo barges at Pier 14.',
        indexes: ['PRIMARY KEY (crate_id)'],
        columns: [
          { name: 'crate_id', type: 'TEXT', description: 'Physical transponder crate ID', isPrimaryKey: true },
          { name: 'dock_berth', type: 'TEXT', description: 'Pier berth where crate was unloaded' },
          { name: 'origin_vessel', type: 'TEXT', description: 'Inbound freighter name' },
          { name: 'declared_contents', type: 'TEXT', description: 'Hull stencil label' }
        ]
      },
      {
        tableName: 'port_authority_imports',
        rowCountLabel: '5 rows (Approved customs import registry)',
        description: 'Legitimate shipments cleared by Port Authority customs.',
        indexes: ['idx_imports_crate (crate_id)'],
        columns: [
          { name: 'import_permit_id', type: 'TEXT', description: 'Customs clearance permit ID', isPrimaryKey: true },
          { name: 'crate_id', type: 'TEXT', description: 'Approved crate ID', isIndexed: true },
          { name: 'inspector_badge', type: 'TEXT', description: 'Clearing customs officer' }
        ]
      }
    ],
    seedSql: `
      CREATE TABLE dock_crate_arrivals (
        crate_id TEXT PRIMARY KEY,
        dock_berth TEXT,
        origin_vessel TEXT,
        declared_contents TEXT
      );
      CREATE TABLE port_authority_imports (
        import_permit_id TEXT PRIMARY KEY,
        crate_id TEXT,
        inspector_badge TEXT
      );
      CREATE INDEX idx_imports_crate ON port_authority_imports(crate_id);

      INSERT INTO dock_crate_arrivals VALUES
        ('CRT-401', 'BERTH_02', 'MV_IRON_GULL', 'OPTICAL_CABLES'),
        ('CRT-402', 'BERTH_09', 'SS_NIGHT_HERON', 'NEURAL_MEMORY_BANKS'),
        ('CRT-403', 'BERTH_04', 'MV_IRON_GULL', 'INDUSTRIAL_COOLANT'),
        ('CRT-404', 'BERTH_09', 'SS_NIGHT_HERON', 'MILSPEC_DECRYPTORS'),
        ('CRT-405', 'BERTH_01', 'FV_PACIFIC_STAR', 'SERVER_CHASSIS'),
        ('CRT-406', 'BERTH_09', 'SS_KOWLOON_BAY', 'BLACKBOX_FIRMWARE'),
        ('CRT-407', 'BERTH_02', 'FV_PACIFIC_STAR', 'POWER_SUPPLIES'),
        ('CRT-408', 'BERTH_09', 'SS_KOWLOON_BAY', 'QUANTUM_KEY_SHARDS'),
        ('CRT-409', 'BERTH_04', 'MV_IRON_GULL', 'FIBER_PATCH_PANELS');

      INSERT INTO port_authority_imports VALUES
        ('PRM-8801', 'CRT-401', 'INSP_04'),
        ('PRM-8802', 'CRT-403', 'INSP_04'),
        ('PRM-8803', 'CRT-405', 'INSP_11'),
        ('PRM-8804', 'CRT-407', 'INSP_11'),
        ('PRM-8805', 'CRT-409', 'INSP_02');
    `,
    starterSql: `-- Case 1.4: The Dockside Cross
-- Isolate all "ghost crates" in dock_crate_arrivals that have NO matching entry
-- in port_authority_imports.

SELECT
  a.crate_id,
  a.dock_berth,
  a.origin_vessel,
  a.declared_contents
FROM dock_crate_arrivals a
INNER JOIN port_authority_imports p
  ON a.crate_id = p.crate_id
ORDER BY a.crate_id ASC;`,
    solutionSql: `SELECT
  a.crate_id,
  a.dock_berth,
  a.origin_vessel,
  a.declared_contents
FROM dock_crate_arrivals a
LEFT JOIN port_authority_imports p
  ON a.crate_id = p.crate_id
WHERE p.crate_id IS NULL
ORDER BY a.crate_id ASC;`,
    hints: [
      'An INNER JOIN only keeps crates that ARE registered with customs—dropping every ghost crate.',
      'Switch to LEFT JOIN port_authority_imports p ON a.crate_id = p.crate_id.',
      'Filter for unmatched rows using WHERE p.crate_id IS NULL.'
    ],
    introCutscene: [
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Beat Sleuth (Junior Clearance)',
        mood: 'investigating',
        dialogue: 'Nine crates came off the cranes at Pier 14 tonight, Vincent. Only five exist in the Port Authority import log.',
        forensicNote: 'OBJECTIVE: Perform an anti-join (LEFT JOIN ... WHERE IS NULL) to isolate the 4 unregistered ghost crates.'
      },
      {
        speakerId: 'vincent_chen',
        speakerName: 'Vincent "Bit-Shift" Chen',
        speakerRole: 'Street Fence',
        mood: 'smug',
        dialogue: 'Standard customs dashboards use an INNER JOIN, Silas! If a crate isn’t in the Port Authority table, it vanishes right off their screen!',
        forensicNote: 'PITFALL WARNING: INNER JOIN silently discards the exact contraband records you are hunting.'
      }
    ],
    outroCutscene: [
      {
        speakerId: 'vincent_chen',
        speakerName: 'Vincent "Bit-Shift" Chen',
        speakerRole: 'Street Fence',
        mood: 'panicking',
        dialogue: 'You ran a LEFT JOIN and filtered for NULL permits?! Those Neural Memory Banks and Quantum Key Shards aren’t mine—I was just routing them for Dolores’s backup clusters!',
        forensicNote: 'EVIDENCE LOCKED: 4 ghost crates seized at Berth 09 (CRT-402, CRT-404, CRT-406, CRT-408).'
      },
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Beat Sleuth (Junior Clearance)',
        mood: 'investigating',
        dialogue: 'Decentralized backup clusters? That means Dolores has an off-site wiretap archive decaying right now. Time to close out Tier 1.',
        forensicNote: 'NEXT LEAD UNLOCKED: Case 1.5 — The Dead-Drop Merge (Dolores "Deadlock" Delgado).'
      }
    ]
  },

  {
    id: '1.5',
    caseNumber: 5,
    tier: 1,
    tierName: 'Beat Sleuth',
    analystLevel: 'Junior',
    title: 'The Dead-Drop Merge',
    flowLabel: 'Union Merge',
    suspectIds: ['dolores_delgado'],
    suspectDisplay: 'Dolores "Deadlock" Delgado',
    narrative:
      'Dolores hid backup acoustic logs across two decentralized server clusters. One cluster is actively decaying; Silas must fuse both logs without memory crashes.',
    concepts: ['UNION vs UNION ALL', 'MIN / MAX Summaries'],
    primaryConcept: 'UNION vs UNION ALL, MIN/MAX',
    antiPatternSolved: 'Accidental deduplication sort memory thrashing',
    forensicObjective:
      'Combine `cluster_alpha_logs` and `cluster_beta_logs` without triggering a deduplication sort (`UNION ALL`), then compute `COUNT(*) AS total_events`, `MIN(event_timestamp) AS earliest_event`, and `MAX(event_timestamp) AS latest_event` across the unified stream.',
    expectedColumns: ['total_events', 'earliest_event', 'latest_event'],
    pitfall:
      'Using an expensive UNION (which forces an unintended sort/deduplication on millions of rows) when the schemas are already mutually exclusive and UNION ALL is required.',
    passMetric: 'Memory usage < 5MB; zero sorting disk-spills.',
    targetLatencyMs: 25,
    targetMaxCost: 40,
    tables: [
      {
        tableName: 'cluster_alpha_logs',
        rowCountLabel: '6 rows (Simulating 4.2M East Sector partition events)',
        description: 'East Sector acoustic dead-drop archive (mutually exclusive from Beta).',
        indexes: ['idx_alpha_ts (event_timestamp)'],
        columns: [
          { name: 'event_id', type: 'TEXT', description: 'Alpha cluster UUID', isPrimaryKey: true },
          { name: 'cluster_node', type: 'TEXT', description: 'Server partition identifier' },
          { name: 'event_timestamp', type: 'TEXT', description: 'UTC event timestamp', isIndexed: true },
          { name: 'cipher_hash', type: 'TEXT', description: 'Encrypted payload digest' }
        ]
      },
      {
        tableName: 'cluster_beta_logs',
        rowCountLabel: '6 rows (Simulating 3.8M West Sector decaying partition events)',
        description: 'West Sector acoustic dead-drop archive (mutually exclusive from Alpha).',
        indexes: ['idx_beta_ts (event_timestamp)'],
        columns: [
          { name: 'event_id', type: 'TEXT', description: 'Beta cluster UUID', isPrimaryKey: true },
          { name: 'cluster_node', type: 'TEXT', description: 'Server partition identifier' },
          { name: 'event_timestamp', type: 'TEXT', description: 'UTC event timestamp', isIndexed: true },
          { name: 'cipher_hash', type: 'TEXT', description: 'Encrypted payload digest' }
        ]
      }
    ],
    seedSql: `
      CREATE TABLE cluster_alpha_logs (
        event_id TEXT PRIMARY KEY,
        cluster_node TEXT,
        event_timestamp TEXT,
        cipher_hash TEXT
      );
      CREATE TABLE cluster_beta_logs (
        event_id TEXT PRIMARY KEY,
        cluster_node TEXT,
        event_timestamp TEXT,
        cipher_hash TEXT
      );
      CREATE INDEX idx_alpha_ts ON cluster_alpha_logs(event_timestamp);
      CREATE INDEX idx_beta_ts ON cluster_beta_logs(event_timestamp);

      INSERT INTO cluster_alpha_logs VALUES
        ('ALP-01', 'ALPHA_EAST', '2099-07-14 02:11:09', '0x99A1'),
        ('ALP-02', 'ALPHA_EAST', '2099-07-18 14:22:40', '0x88B2'),
        ('ALP-03', 'ALPHA_EAST', '2099-07-25 19:04:12', '0x77C3'),
        ('ALP-04', 'ALPHA_EAST', '2099-08-01 08:45:00', '0x66D4'),
        ('ALP-05', 'ALPHA_EAST', '2099-08-09 23:15:33', '0x55E5'),
        ('ALP-06', 'ALPHA_EAST', '2099-08-12 11:30:00', '0x44F6');

      INSERT INTO cluster_beta_logs VALUES
        ('BET-01', 'BETA_WEST', '2099-07-19 04:10:00', '0x11A9'),
        ('BET-02', 'BETA_WEST', '2099-07-22 16:50:19', '0x22B8'),
        ('BET-03', 'BETA_WEST', '2099-07-30 09:12:44', '0x33C7'),
        ('BET-04', 'BETA_WEST', '2099-08-04 21:00:05', '0x44D6'),
        ('BET-05', 'BETA_WEST', '2099-08-11 03:40:18', '0x55E1'),
        ('BET-06', 'BETA_WEST', '2099-08-14 23:59:58', '0x66F0');
    `,
    starterSql: `-- Case 1.5: The Dead-Drop Merge
-- Combine cluster_alpha_logs and cluster_beta_logs without triggering an expensive
-- deduplication sort, and return total_events, earliest_event, and latest_event.

SELECT
  COUNT(*) AS total_events,
  MIN(event_timestamp) AS earliest_event,
  MAX(event_timestamp) AS latest_event
FROM (
  SELECT event_timestamp FROM cluster_alpha_logs
  UNION
  SELECT event_timestamp FROM cluster_beta_logs
) unified_logs;`,
    solutionSql: `SELECT
  COUNT(*) AS total_events,
  MIN(event_timestamp) AS earliest_event,
  MAX(event_timestamp) AS latest_event
FROM (
  SELECT event_timestamp FROM cluster_alpha_logs
  UNION ALL
  SELECT event_timestamp FROM cluster_beta_logs
) unified_logs;`,
    hints: [
      'A plain UNION forces the database engine to sort and deduplicate all rows across both clusters, spiking memory above 45MB.',
      'Because Cluster Alpha and Cluster Beta are mutually exclusive partitions, replace UNION with UNION ALL.',
      'Project COUNT(*) AS total_events, MIN(event_timestamp) AS earliest_event, and MAX(event_timestamp) AS latest_event.'
    ],
    introCutscene: [
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Beat Sleuth (Junior Clearance)',
        mood: 'investigating',
        dialogue: 'We found your dead-drop clusters, Dolores. Alpha and Beta hold eight million encrypted wiretap events between them, and Beta’s RAM is decaying fast.',
        forensicNote: 'OBJECTIVE: Stream-merge both clusters with UNION ALL and extract the total count plus MIN and MAX timestamps.'
      },
      {
        speakerId: 'dolores_delgado',
        speakerName: 'Dolores "Deadlock" Delgado',
        speakerRole: 'Lounge Singer',
        mood: 'smug',
        dialogue: 'Only 5 megabytes of scratch buffer left on that terminal, Silas! If your query triggers a deduplication sort across both clusters, the whole archive vaporizes.',
        forensicNote: 'PITFALL WARNING: Using UNION instead of UNION ALL forces a global sort-deduplicate temp buffer spill.'
      }
    ],
    outroCutscene: [
      {
        speakerId: 'dolores_delgado',
        speakerName: 'Dolores "Deadlock" Delgado',
        speakerRole: 'Lounge Singer',
        mood: 'panicking',
        dialogue: 'UNION ALL... zero sort spill, 1.2 megabytes of RAM, and you pulled the entire timeline window before Cluster Beta flatlined!',
        forensicNote: 'EVIDENCE LOCKED: 12-event timeline span verified (2099-07-14 02:11:09 to 2099-08-14 23:59:58) with zero temp sort spills.'
      },
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Beat Sleuth → Promoted to Syndicate Detective',
        mood: 'investigating',
        dialogue: 'And inside that final timestamp is the wire transfer signature of Veronica "The Broker" Sterling. Tier 1 is cleared—we’re moving up to Syndicate Detective.',
        forensicNote: 'STAGE 1 COMPLETE: Promoted to Tier 2 (Syndicate Detective / Medior Data Analyst).'
      }
    ]
  },

  // ============================================================================
  // TIER 2: SYNDICATE DETECTIVE (Medior Data Analyst)
  // ============================================================================
  {
    id: '2.1',
    caseNumber: 6,
    tier: 2,
    tierName: 'Syndicate Detective',
    analystLevel: 'Medior',
    title: 'The Launderer’s Ledger',
    flowLabel: 'CASE When',
    suspectIds: ['veronica_sterling'],
    suspectDisplay: 'Veronica "The Broker" Sterling',
    narrative:
      'Sterling’s transaction logs classify illegal capital transfers under generic transaction codes. Silas must decode and categorize transactions to expose the laundering pattern.',
    concepts: ['CASE WHEN ... THEN ... ELSE END', 'Multi-condition binning'],
    primaryConcept: 'CASE WHEN ... THEN ... ELSE',
    antiPatternSolved: 'Inefficient conditional classification, null traps',
    forensicObjective:
      "Classify every row in `capital_transfers` into `risk_band` using `CASE WHEN`: `'CRITICAL'` when `(is_offshore = 1 AND amount >= 250000)` OR `flag_code = 'STRUCTURED_SPLIT'`; `'SUSPICIOUS'` when `(is_offshore = 1 AND amount >= 50000)` OR `amount >= 150000`; and `'BENIGN'` for all other rows (`ELSE 'BENIGN'`). Return `tx_id`, `counterparty`, `amount`, `risk_band` ordered by `amount DESC`.",
    expectedColumns: ['tx_id', 'counterparty', 'amount', 'risk_band'],
    pitfall:
      'Redundant CASE evaluations, overlapping conditional boundaries, or failing to provide a fallback ELSE resulting in null classifications.',
    passMetric: 'Strict 3-tier categorization; zero unclassified records.',
    targetLatencyMs: 25,
    targetMaxCost: 45,
    tables: [
      {
        tableName: 'capital_transfers',
        rowCountLabel: '8 rows (Simulating 3.5M clearinghouse wire records)',
        description: 'Sterling Advisory Group clearing ledger with offshore indicators and flag codes.',
        indexes: ['idx_transfers_amount (amount DESC)'],
        columns: [
          { name: 'tx_id', type: 'TEXT', description: 'Clearinghouse wire ID', isPrimaryKey: true },
          { name: 'counterparty', type: 'TEXT', description: 'Receiving corporate entity' },
          { name: 'amount', type: 'INTEGER', description: 'Transfer volume in credits', isIndexed: true },
          { name: 'is_offshore', type: 'INTEGER', description: '1 = offshore haven jurisdiction, 0 = domestic' },
          { name: 'flag_code', type: 'TEXT', description: 'Compliance code (STANDARD, STRUCTURED_SPLIT, TREASURY)' }
        ]
      }
    ],
    seedSql: `
      CREATE TABLE capital_transfers (
        tx_id TEXT PRIMARY KEY,
        counterparty TEXT,
        amount INTEGER,
        is_offshore INTEGER,
        flag_code TEXT
      );
      CREATE INDEX idx_transfers_amount ON capital_transfers(amount DESC);
      INSERT INTO capital_transfers VALUES
        ('WIR-201', 'CAYMAN_NEXUS_LTD', 480000, 1, 'STANDARD'),
        ('WIR-202', 'VERIDIA_MUNICIPAL', 310000, 0, 'TREASURY'),
        ('WIR-203', 'ZURICH_VAULT_AG', 195000, 1, 'STANDARD'),
        ('WIR-204', 'APEX_LOGISTICS', 160000, 0, 'STANDARD'),
        ('WIR-205', 'PANAMA_SHELL_09', 95000, 0, 'STRUCTURED_SPLIT'),
        ('WIR-206', 'LUX_HOLDINGS_SA', 72000, 1, 'STANDARD'),
        ('WIR-207', 'METRO_POWER_CORP', 44000, 0, 'STANDARD'),
        ('WIR-208', 'HARBOR_SUPPLY_CO', 18000, 0, 'STANDARD');
    `,
    starterSql: `-- Case 2.1: The Launderer's Ledger
-- Categorize transfers into 'CRITICAL', 'SUSPICIOUS', or 'BENIGN' as risk_band:
-- 1. 'CRITICAL': (is_offshore = 1 AND amount >= 250000) OR flag_code = 'STRUCTURED_SPLIT'
-- 2. 'SUSPICIOUS': (is_offshore = 1 AND amount >= 50000) OR amount >= 150000
-- 3. 'BENIGN': all remaining transfers (never leave NULL!)

SELECT
  tx_id,
  counterparty,
  amount,
  CASE
    WHEN is_offshore = 1 AND amount >= 250000 THEN 'CRITICAL'
  END AS risk_band
FROM capital_transfers
ORDER BY amount DESC;`,
    solutionSql: `SELECT
  tx_id,
  counterparty,
  amount,
  CASE
    WHEN (is_offshore = 1 AND amount >= 250000) OR flag_code = 'STRUCTURED_SPLIT' THEN 'CRITICAL'
    WHEN (is_offshore = 1 AND amount >= 50000) OR amount >= 150000 THEN 'SUSPICIOUS'
    ELSE 'BENIGN'
  END AS risk_band
FROM capital_transfers
ORDER BY amount DESC;`,
    hints: [
      'CASE evaluates WHEN clauses top-to-bottom and stops at the first match—put the strictest CRITICAL rule first.',
      "Include OR flag_code = 'STRUCTURED_SPLIT' in the CRITICAL branch so structured smurfing transfers like WIR-205 are caught even under 100K.",
      "Always include ELSE 'BENIGN' before END AS risk_band so domestic low-value transfers never produce NULL."
    ],
    introCutscene: [
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Syndicate Detective (Medior Clearance)',
        mood: 'investigating',
        dialogue: 'Veronica Sterling. Three million clearinghouse wires, and you buried structured cartel splits right alongside municipal power bills.',
        forensicNote: 'OBJECTIVE: Build a deterministic 3-tier CASE WHEN classifier with zero unclassified NULL leaks.'
      },
      {
        speakerId: 'veronica_sterling',
        speakerName: 'Veronica "The Broker" Sterling',
        speakerRole: 'Shadow Banker',
        mood: 'smug',
        dialogue: 'Compliance is a matter of perspective, Detective. Reverse your boundary conditions or forget your ELSE clause, and my attorneys will have your audit thrown out for NULL ambiguity.',
        forensicNote: 'PITFALL WARNING: Omitting ELSE or misordering WHEN thresholds corrupts risk classification.'
      }
    ],
    outroCutscene: [
      {
        speakerId: 'veronica_sterling',
        speakerName: 'Veronica "The Broker" Sterling',
        speakerRole: 'Shadow Banker',
        mood: 'cornered',
        dialogue: 'You caught the Panama structured split AND separated the offshore tiers cleanly... Fine. Those critical wires were funding an operation at the server farm.',
        forensicNote: 'EVIDENCE LOCKED: 100% of capital transfers classified across CRITICAL, SUSPICIOUS, and BENIGN tiers.'
      },
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Syndicate Detective (Medior Clearance)',
        mood: 'investigating',
        dialogue: 'The night the central server farm was wiped? Inspector Vane swore his badge swipe cleared him. Let’s check the clock.',
        forensicNote: 'NEXT LEAD UNLOCKED: Case 2.2 — The Chrono-Alibi (Inspector Marcus Vane).'
      }
    ]
  },

  {
    id: '2.2',
    caseNumber: 7,
    tier: 2,
    tierName: 'Syndicate Detective',
    analystLevel: 'Medior',
    title: 'The Chrono-Alibi',
    flowLabel: 'Date/Time',
    suspectIds: ['marcus_vane'],
    suspectDisplay: 'Inspector Marcus Vane',
    narrative:
      'Vane claims he was at headquarters during a fatal server-farm wipe. Silas has obtained building access card swipes and server wipe timestamps.',
    concepts: ['DATE_TRUNC / strftime', 'EXTRACT / julianday', 'Temporal Math'],
    primaryConcept: 'DATE_TRUNC, DATE_DIFF, EXTRACT',
    antiPatternSolved: 'Inefficient string casting of timestamps',
    forensicObjective:
      "Using native SQLite temporal functions (`strftime('%Y-%m-%d %H:00:00', badge_out_ts) AS swipe_hour_bucket` and `ROUND((julianday(incident_trigger_ts) - julianday(badge_out_ts)) * 1440.0, 1) AS elapsed_minutes`), analyze `precinct_chrono_logs` for `officer_id = 'BADGE-VANE-01'`. Return `event_id`, `swipe_hour_bucket`, `elapsed_minutes`, and `sector_gate` ordered by `badge_out_ts ASC`.",
    expectedColumns: ['event_id', 'swipe_hour_bucket', 'elapsed_minutes', 'sector_gate'],
    pitfall:
      'String parsing of timestamps instead of native temporal functions, causing locale and formatting bugs and breaking query indexing.',
    passMetric: 'Calculated duration down to fractional minutes; hourly bucket aggregation confirmed.',
    targetLatencyMs: 25,
    targetMaxCost: 45,
    tables: [
      {
        tableName: 'precinct_chrono_logs',
        rowCountLabel: '6 rows (Security turnstile & incident telemetry)',
        description: 'Synchronized precinct badge-out timestamps paired with server-farm sabotage triggers.',
        indexes: ['idx_chrono_officer_ts (officer_id, badge_out_ts)'],
        columns: [
          { name: 'event_id', type: 'TEXT', description: 'Chrono correlation ID', isPrimaryKey: true },
          { name: 'officer_id', type: 'TEXT', description: 'Officer badge identifier', isIndexed: true },
          { name: 'sector_gate', type: 'TEXT', description: 'Turnstile exit gate' },
          { name: 'badge_out_ts', type: 'TEXT', description: 'UTC timestamp when officer badged out', isIndexed: true },
          { name: 'incident_trigger_ts', type: 'TEXT', description: 'UTC timestamp of security incident trigger' }
        ]
      }
    ],
    seedSql: `
      CREATE TABLE precinct_chrono_logs (
        event_id TEXT PRIMARY KEY,
        officer_id TEXT,
        sector_gate TEXT,
        badge_out_ts TEXT,
        incident_trigger_ts TEXT
      );
      CREATE INDEX idx_chrono_officer_ts ON precinct_chrono_logs(officer_id, badge_out_ts);
      INSERT INTO precinct_chrono_logs VALUES
        ('CHR-01', 'BADGE-VANE-01', 'HQ_NORTH_GARAGE', '2099-08-10 21:14:00', '2099-08-10 21:32:30'),
        ('CHR-02', 'BADGE-VANE-01', 'SERVER_VAULT_ANNEX', '2099-08-10 22:03:15', '2099-08-10 22:11:45'),
        ('CHR-03', 'BADGE-VANE-01', 'SUBLEVEL_ELEVATOR', '2099-08-10 22:41:00', '2099-08-10 22:47:12'),
        ('CHR-04', 'BADGE-KROSS-04', 'HQ_FRONT_DESK', '2099-08-10 21:00:00', '2099-08-10 23:00:00'),
        ('CHR-05', 'BADGE-VANE-01', 'ROOF_HELIPAD', '2099-08-10 23:10:00', '2099-08-10 23:25:30');
    `,
    starterSql: `-- Case 2.2: The Chrono-Alibi
-- For officer_id = 'BADGE-VANE-01', compute:
-- 1. swipe_hour_bucket using strftime('%Y-%m-%d %H:00:00', badge_out_ts)
-- 2. elapsed_minutes using ROUND((julianday(incident_trigger_ts) - julianday(badge_out_ts)) * 1440.0, 1)

SELECT
  event_id,
  SUBSTR(badge_out_ts, 1, 13) AS swipe_hour_bucket,
  0.0 AS elapsed_minutes,
  sector_gate
FROM precinct_chrono_logs
WHERE officer_id = 'BADGE-VANE-01'
ORDER BY badge_out_ts ASC;`,
    solutionSql: `SELECT
  event_id,
  strftime('%Y-%m-%d %H:00:00', badge_out_ts) AS swipe_hour_bucket,
  ROUND((julianday(incident_trigger_ts) - julianday(badge_out_ts)) * 1440.0, 1) AS elapsed_minutes,
  sector_gate
FROM precinct_chrono_logs
WHERE officer_id = 'BADGE-VANE-01'
ORDER BY badge_out_ts ASC;`,
    hints: [
      'Avoid SUBSTR() string slicing on timestamps—use native strftime(\'%Y-%m-%d %H:00:00\', badge_out_ts) AS swipe_hour_bucket.',
      'In SQLite, (julianday(end_ts) - julianday(start_ts)) * 1440.0 converts fractional days into exact fractional minutes.',
      'Wrap the minute calculation in ROUND(..., 1) AS elapsed_minutes and filter WHERE officer_id = \'BADGE-VANE-01\'.'
    ],
    introCutscene: [
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Syndicate Detective (Medior Clearance)',
        mood: 'investigating',
        dialogue: 'You told Internal Affairs you left headquarters hours before the server wipe, Vane. Your turnstile telemetry says otherwise.',
        forensicNote: 'OBJECTIVE: Compute exact fractional minutes between badge-out and incident triggers, plus hourly buckets.'
      },
      {
        speakerId: 'marcus_vane',
        speakerName: 'Inspector Marcus Vane',
        speakerRole: 'Precinct Fixer',
        mood: 'smug',
        dialogue: 'Those timestamps cross hour and minute boundaries with fractional seconds, Silas. Slice them as strings and your math falls apart on the stand.',
        forensicNote: 'PITFALL WARNING: String manipulation (SUBSTR) fails fractional minute math and hourly bucket standardization.'
      }
    ],
    outroCutscene: [
      {
        speakerId: 'marcus_vane',
        speakerName: 'Inspector Marcus Vane',
        speakerRole: 'Precinct Fixer',
        mood: 'panicking',
        dialogue: '8.5 minutes between my Server Vault Annex swipe and the wipe trigger... 6.2 minutes at the Sublevel Elevator... How did you calculate fractional seconds that fast?!',
        forensicNote: 'EVIDENCE LOCKED: Vane placed at SERVER_VAULT_ANNEX 8.5 minutes prior to sabotage.'
      },
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Syndicate Detective (Medior Clearance)',
        mood: 'investigating',
        dialogue: 'Your alibi is dead, Vane. Now let’s trace the four shell companies Veronica Sterling used to pay for that server wipe.',
        forensicNote: 'NEXT LEAD UNLOCKED: Case 2.3 — The Shell Network (Veronica "The Broker" Sterling).'
      }
    ]
  },

  {
    id: '2.3',
    caseNumber: 8,
    tier: 2,
    tierName: 'Syndicate Detective',
    analystLevel: 'Medior',
    title: 'The Shell Network',
    flowLabel: 'Multi-Join',
    suspectIds: ['veronica_sterling'],
    suspectDisplay: 'Veronica "The Broker" Sterling',
    narrative:
      'Funds flow across multiple corporate cutouts: Dummy Corp → Holding Agent → Bank Vault. Silas needs to map transactions from end to end across 4 tables.',
    concepts: ['Multi-table joins (4+ tables)', 'Composite key matching', 'Cartesian prevention'],
    primaryConcept: 'Multi-Table Joins (4+ Tables)',
    antiPatternSolved: 'Cartesian explosions across intermediate keys',
    forensicObjective:
      "Connect `seed_transfers s` → `dummy_corps d` (on `s.dummy_id = d.dummy_id AND s.jurisdiction_code = d.jurisdiction_code`) → `holding_agents h` (on `d.agent_id = h.agent_id AND d.jurisdiction_code = h.jurisdiction_code`) → `bank_vaults v` (on `h.vault_id = v.vault_id`), filtering for illicit flows (`s.is_legitimate = 0` and `v.is_active = 1`). Return `s.seed_tx_id`, `d.corp_name`, `h.agent_handle`, `v.vault_account`, and `s.transfer_amount` ordered by `s.transfer_amount DESC`.",
    expectedColumns: ['seed_tx_id', 'corp_name', 'agent_handle', 'vault_account', 'transfer_amount'],
    pitfall:
      'Join Cartesian amplification due to non-unique intermediate keys; unindexed intermediate joins causing table scans.',
    passMetric: '1:1 source-to-target path resolution; rows examined <= 1.1x target rows.',
    targetLatencyMs: 30,
    targetMaxCost: 55,
    tables: [
      {
        tableName: 'seed_transfers',
        rowCountLabel: '5 rows (Origin wire seeds)',
        description: 'Initial capital injections entering the shell network.',
        indexes: ['idx_seed_legit (is_legitimate, dummy_id, jurisdiction_code)'],
        columns: [
          { name: 'seed_tx_id', type: 'TEXT', description: 'Origin wire ID', isPrimaryKey: true },
          { name: 'dummy_id', type: 'TEXT', description: 'Target dummy corp ID', isIndexed: true },
          { name: 'jurisdiction_code', type: 'TEXT', description: 'Composite routing jurisdiction (CYM, ZUR, PAN)', isIndexed: true },
          { name: 'transfer_amount', type: 'INTEGER', description: 'Credit volume' },
          { name: 'is_legitimate', type: 'INTEGER', description: '0 = illicit syndicate seed, 1 = commercial payroll', isIndexed: true }
        ]
      },
      {
        tableName: 'dummy_corps',
        rowCountLabel: '6 rows (Layer 1 front companies)',
        description: 'Front corporations keyed by composite (dummy_id, jurisdiction_code).',
        indexes: ['idx_dummy_comp (dummy_id, jurisdiction_code)'],
        columns: [
          { name: 'dummy_id', type: 'TEXT', description: 'Dummy corporation ID (reused across jurisdictions!)', isIndexed: true },
          { name: 'jurisdiction_code', type: 'TEXT', description: 'Incorporation jurisdiction code', isIndexed: true },
          { name: 'corp_name', type: 'TEXT', description: 'Registered shell company name' },
          { name: 'agent_id', type: 'TEXT', description: 'Assigned holding agent ID' }
        ]
      },
      {
        tableName: 'holding_agents',
        rowCountLabel: '5 rows (Layer 2 nominee intermediaries)',
        description: 'Nominee agents keyed by composite (agent_id, jurisdiction_code).',
        indexes: ['idx_agent_comp (agent_id, jurisdiction_code)'],
        columns: [
          { name: 'agent_id', type: 'TEXT', description: 'Holding agent ID (reused across jurisdictions!)', isIndexed: true },
          { name: 'jurisdiction_code', type: 'TEXT', description: 'Operating jurisdiction code', isIndexed: true },
          { name: 'agent_handle', type: 'TEXT', description: 'Nominee broker codename' },
          { name: 'vault_id', type: 'TEXT', description: 'Destination bank vault ID' }
        ]
      },
      {
        tableName: 'bank_vaults',
        rowCountLabel: '4 rows (Layer 3 final beneficiaries)',
        description: 'Ultimate recipient numbered vault accounts.',
        indexes: ['PRIMARY KEY (vault_id)'],
        columns: [
          { name: 'vault_id', type: 'TEXT', description: 'Vault identifier', isPrimaryKey: true },
          { name: 'vault_account', type: 'TEXT', description: 'Beneficiary IBAN / crypto vault code' },
          { name: 'is_active', type: 'INTEGER', description: '1 = active vault, 0 = seized/closed' }
        ]
      }
    ],
    seedSql: `
      CREATE TABLE seed_transfers (
        seed_tx_id TEXT PRIMARY KEY,
        dummy_id TEXT,
        jurisdiction_code TEXT,
        transfer_amount INTEGER,
        is_legitimate INTEGER
      );
      CREATE TABLE dummy_corps (
        dummy_id TEXT,
        jurisdiction_code TEXT,
        corp_name TEXT,
        agent_id TEXT
      );
      CREATE TABLE holding_agents (
        agent_id TEXT,
        jurisdiction_code TEXT,
        agent_handle TEXT,
        vault_id TEXT
      );
      CREATE TABLE bank_vaults (
        vault_id TEXT PRIMARY KEY,
        vault_account TEXT,
        is_active INTEGER
      );

      CREATE INDEX idx_seed_legit ON seed_transfers(is_legitimate, dummy_id, jurisdiction_code);
      CREATE INDEX idx_dummy_comp ON dummy_corps(dummy_id, jurisdiction_code);
      CREATE INDEX idx_agent_comp ON holding_agents(agent_id, jurisdiction_code);

      INSERT INTO seed_transfers VALUES
        ('SEED-701', 'DMY-10', 'CYM', 920000, 0),
        ('SEED-702', 'DMY-20', 'ZUR', 680000, 0),
        ('SEED-703', 'DMY-30', 'PAN', 510000, 0),
        ('SEED-704', 'DMY-10', 'ZUR', 240000, 1),
        ('SEED-705', 'DMY-40', 'CYM', 390000, 0);

      -- Notice DMY-10 and DMY-20 exist in multiple jurisdictions to trap single-column joins!
      INSERT INTO dummy_corps VALUES
        ('DMY-10', 'CYM', 'OBSIDIAN_REEF_LLC', 'AGT-01'),
        ('DMY-10', 'ZUR', 'ALPINE_LEGAL_GMBH', 'AGT-09'),
        ('DMY-20', 'ZUR', 'HELVETIA_TRUST_AG', 'AGT-02'),
        ('DMY-20', 'CYM', 'DECOY_SHELL_CORP', 'AGT-08'),
        ('DMY-30', 'PAN', 'ISTHMUS_CAPITAL_SA', 'AGT-03'),
        ('DMY-40', 'CYM', 'CORAL_SHADOW_LTD', 'AGT-04');

      -- Notice AGT-01 and AGT-02 also exist in multiple jurisdictions!
      INSERT INTO holding_agents VALUES
        ('AGT-01', 'CYM', 'BROKER_KESTREL', 'VLT-9001'),
        ('AGT-01', 'ZUR', 'DECOY_NOMINEE', 'VLT-0000'),
        ('AGT-02', 'ZUR', 'BROKER_VORTEX', 'VLT-9002'),
        ('AGT-03', 'PAN', 'BROKER_MIRAGE', 'VLT-9003'),
        ('AGT-04', 'CYM', 'BROKER_CIPHER', 'VLT-9004');

      INSERT INTO bank_vaults VALUES
        ('VLT-9001', 'CH-VAULT-STERLING-ALPHA', 1),
        ('VLT-9002', 'CH-VAULT-STERLING-BETA', 1),
        ('VLT-9003', 'PA-VAULT-SYNDICATE-CORE', 1),
        ('VLT-9004', 'KY-VAULT-FROZEN-00', 0),
        ('VLT-0000', 'DECOY_NULL_VAULT', 1);
    `,
    starterSql: `-- Case 2.3: The Shell Network
-- Connect seed_transfers (s) -> dummy_corps (d) -> holding_agents (h) -> bank_vaults (v).
-- Watch out: dummy_id and agent_id are reused across jurisdictions!
-- You must include jurisdiction_code in your join conditions to prevent Cartesian amplification.

SELECT
  s.seed_tx_id,
  d.corp_name,
  h.agent_handle,
  v.vault_account,
  s.transfer_amount
FROM seed_transfers s
JOIN dummy_corps d ON s.dummy_id = d.dummy_id
JOIN holding_agents h ON d.agent_id = h.agent_id
JOIN bank_vaults v ON h.vault_id = v.vault_id
WHERE s.is_legitimate = 0
  AND v.is_active = 1
ORDER BY s.transfer_amount DESC;`,
    solutionSql: `SELECT
  s.seed_tx_id,
  d.corp_name,
  h.agent_handle,
  v.vault_account,
  s.transfer_amount
FROM seed_transfers s
INNER JOIN dummy_corps d
  ON s.dummy_id = d.dummy_id
 AND s.jurisdiction_code = d.jurisdiction_code
INNER JOIN holding_agents h
  ON d.agent_id = h.agent_id
 AND d.jurisdiction_code = h.jurisdiction_code
INNER JOIN bank_vaults v
  ON h.vault_id = v.vault_id
WHERE s.is_legitimate = 0
  AND v.is_active = 1
ORDER BY s.transfer_amount DESC;`,
    hints: [
      'Joining only on s.dummy_id = d.dummy_id multiplies rows because DMY-10 is registered in both CYM and ZUR.',
      'Add AND s.jurisdiction_code = d.jurisdiction_code to the dummy_corps join, and AND d.jurisdiction_code = h.jurisdiction_code to the holding_agents join.',
      'Keep WHERE s.is_legitimate = 0 AND v.is_active = 1 and ORDER BY s.transfer_amount DESC.'
    ],
    introCutscene: [
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Syndicate Detective (Medior Clearance)',
        mood: 'investigating',
        dialogue: 'Four tables of corporate cutouts, Veronica: Seed Transfers, Dummy Corps, Holding Agents, and Bank Vaults. And you deliberately reused entity IDs across jurisdictions.',
        forensicNote: 'OBJECTIVE: Resolve the 1:1 path across all 4 tables using composite keys (entity_id + jurisdiction_code).'
      },
      {
        speakerId: 'veronica_sterling',
        speakerName: 'Veronica "The Broker" Sterling',
        speakerRole: 'Shadow Banker',
        mood: 'smug',
        dialogue: 'Any analyst who joins on a single ID column gets buried in a Cartesian cross-product of decoy vaults. Let’s see if your relational algebra holds up.',
        forensicNote: 'PITFALL WARNING: Omitting jurisdiction_code in intermediate joins causes Cartesian row multiplication.'
      }
    ],
    outroCutscene: [
      {
        speakerId: 'veronica_sterling',
        speakerName: 'Veronica "The Broker" Sterling',
        speakerRole: 'Shadow Banker',
        mood: 'cornered',
        dialogue: 'Zero decoy multiplication... You pinned every active vault from Cayman to Zurich in a single composite-index pass.',
        forensicNote: 'EVIDENCE LOCKED: 3 active Syndicate destination vaults mapped 1:1 (2.11M credits traced).'
      },
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Syndicate Detective (Medior Clearance)',
        mood: 'investigating',
        dialogue: 'And those vaults are bankrolling Vincent Chen’s cartel auction floor across the city sectors.',
        forensicNote: 'NEXT LEAD UNLOCKED: Case 2.4 — The Black-Market Ladder (Vincent "Bit-Shift" Chen).'
      }
    ]
  },

  {
    id: '2.4',
    caseNumber: 9,
    tier: 2,
    tierName: 'Syndicate Detective',
    analystLevel: 'Medior',
    title: 'The Black-Market Ladder',
    flowLabel: 'Ranking',
    suspectIds: ['vincent_chen'],
    suspectDisplay: 'Vincent "Bit-Shift" Chen',
    narrative:
      'Chen runs a cartel auction floor. Silas must find the top 3 highest-spending syndicates within each distinct district to identify who controls what territory.',
    concepts: ['ROW_NUMBER()', 'RANK()', 'DENSE_RANK() OVER (PARTITION BY ... ORDER BY ...)'],
    primaryConcept: 'ROW_NUMBER, RANK, DENSE_RANK',
    antiPatternSolved: 'O(N^2) correlated subqueries for group top-N',
    forensicObjective:
      'Using an analytic window function (`DENSE_RANK() OVER (PARTITION BY district ORDER BY bid_amount DESC) AS district_rank`) inside a CTE or subquery over `syndicate_auction_bids`, return `district`, `syndicate_name`, `bid_amount`, and `district_rank` for the top 3 ranks (`district_rank <= 3`) per district, ordered by `district ASC, district_rank ASC, syndicate_name ASC`.',
    expectedColumns: ['district', 'syndicate_name', 'bid_amount', 'district_rank'],
    pitfall:
      'Writing nested correlated subqueries with LIMIT instead of window functions, causing exponential execution time (O(N^2)).',
    passMetric: 'Query execution under 50ms; single-pass table read.',
    targetLatencyMs: 50,
    targetMaxCost: 50,
    tables: [
      {
        tableName: 'syndicate_auction_bids',
        rowCountLabel: '10 rows (Simulating 2.4M territorial auction bids)',
        description: 'District contraband territory bids logged by Chen’s auction router.',
        indexes: ['idx_auction_district_bid (district, bid_amount DESC)'],
        columns: [
          { name: 'bid_id', type: 'TEXT', description: 'Auction bid packet ID', isPrimaryKey: true },
          { name: 'district', type: 'TEXT', description: 'City territory sector', isIndexed: true },
          { name: 'syndicate_name', type: 'TEXT', description: 'Bidding cartel faction' },
          { name: 'bid_amount', type: 'INTEGER', description: 'Winning credit bid', isIndexed: true }
        ]
      }
    ],
    seedSql: `
      CREATE TABLE syndicate_auction_bids (
        bid_id TEXT PRIMARY KEY,
        district TEXT,
        syndicate_name TEXT,
        bid_amount INTEGER
      );
      CREATE INDEX idx_auction_district_bid ON syndicate_auction_bids(district, bid_amount DESC);
      INSERT INTO syndicate_auction_bids VALUES
        ('BID-01', 'DOCKLANDS', 'IRON_LOTUS', 450000),
        ('BID-02', 'DOCKLANDS', 'BLACK_SUN', 390000),
        ('BID-03', 'DOCKLANDS', 'CHROME_VIPERS', 390000),
        ('BID-04', 'DOCKLANDS', 'NEON_GHOSTS', 310000),
        ('BID-05', 'DOCKLANDS', 'RUST_CARTEL', 180000),
        ('BID-06', 'MIDTOWN_CORE', 'STERLING_TRUST', 820000),
        ('BID-07', 'MIDTOWN_CORE', 'ZERO_DAEMON', 760000),
        ('BID-08', 'MIDTOWN_CORE', 'VANE_PRECINCT', 640000),
        ('BID-09', 'MIDTOWN_CORE', 'SHADOW_GUILD', 410000),
        ('BID-10', 'MIDTOWN_CORE', 'STREET_JACKALS', 290000);
    `,
    starterSql: `-- Case 2.4: The Black-Market Ladder
-- Rank bids within each district using DENSE_RANK() OVER (PARTITION BY district ORDER BY bid_amount DESC)
-- and filter for district_rank <= 3.

WITH ranked_bids AS (
  SELECT
    district,
    syndicate_name,
    bid_amount,
    1 AS district_rank
  FROM syndicate_auction_bids
)
SELECT
  district,
  syndicate_name,
  bid_amount,
  district_rank
FROM ranked_bids
WHERE district_rank <= 3
ORDER BY district ASC, district_rank ASC, syndicate_name ASC;`,
    solutionSql: `WITH ranked_bids AS (
  SELECT
    district,
    syndicate_name,
    bid_amount,
    DENSE_RANK() OVER (PARTITION BY district ORDER BY bid_amount DESC) AS district_rank
  FROM syndicate_auction_bids
)
SELECT
  district,
  syndicate_name,
  bid_amount,
  district_rank
FROM ranked_bids
WHERE district_rank <= 3
ORDER BY district ASC, district_rank ASC, syndicate_name ASC;`,
    hints: [
      'Use DENSE_RANK() OVER (PARTITION BY district ORDER BY bid_amount DESC) AS district_rank so tied bids (like BLACK_SUN and CHROME_VIPERS at 390,000) both receive rank 2 without skipping rank 3.',
      'Wrap the window function inside a CTE (WITH ranked_bids AS (...)) because SQL does not allow filtering window functions directly in the same WHERE clause.',
      'In the outer query, filter WHERE district_rank <= 3 and ORDER BY district ASC, district_rank ASC, syndicate_name ASC.'
    ],
    introCutscene: [
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Syndicate Detective (Medior Clearance)',
        mood: 'investigating',
        dialogue: 'Moving up in the world, Vincent. From dockside fence to running the Syndicate’s territorial auction router.',
        forensicNote: 'OBJECTIVE: Rank the top 3 bidding syndicates per district in a single pass using DENSE_RANK() OVER (PARTITION BY...).'
      },
      {
        speakerId: 'vincent_chen',
        speakerName: 'Vincent "Bit-Shift" Chen',
        speakerRole: 'Log Router',
        mood: 'smug',
        dialogue: 'Two million bids across every district, plus tied bids in the Docklands! If you write a correlated subquery to count higher bids per row, my router will time you out in O(N²)!',
        forensicNote: 'PITFALL WARNING: Correlated subqueries trigger quadratic scans; ROW_NUMBER drops tied syndicates.'
      }
    ],
    outroCutscene: [
      {
        speakerId: 'vincent_chen',
        speakerName: 'Vincent "Bit-Shift" Chen',
        speakerRole: 'Log Router',
        mood: 'panicking',
        dialogue: 'DENSE_RANK partitioned by district?! One pass over the index and you nailed every top-three cartel—including the tie in Docklands!',
        forensicNote: 'EVIDENCE LOCKED: Top 3 territorial syndicates per sector extracted in 1 table pass.'
      },
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Syndicate Detective (Medior Clearance)',
        mood: 'investigating',
        dialogue: 'Look at Rank 2 in Midtown Core: ZERO_DAEMON. And Dolores Delgado’s escrow script is feeding it stolen citizen credits.',
        forensicNote: 'NEXT LEAD UNLOCKED: Case 2.5 — The Running Escrow (Dolores "Deadlock" Delgado).'
      }
    ]
  },

  {
    id: '2.5',
    caseNumber: 10,
    tier: 2,
    tierName: 'Syndicate Detective',
    analystLevel: 'Medior',
    title: 'The Running Escrow',
    flowLabel: 'Running Sums/CTE',
    suspectIds: ['dolores_delgado'],
    suspectDisplay: 'Dolores "Deadlock" Delgado',
    narrative:
      "Dolores's encrypted ledger contains a covert drain script that steals small amounts from citizen balances. Silas needs to show how the wallet balance systematically dwindled over time.",
    concepts: ['Common Table Expressions (CTEs)', 'Cumulative Window Sums', 'SUM() OVER (PARTITION BY ... ORDER BY ...)'],
    primaryConcept: 'CTEs, SUM() OVER(PARTITION BY...)',
    antiPatternSolved: 'Exponential self-joins for cumulative balances',
    forensicObjective:
      'Construct a CTE over `escrow_ledger_entries` that computes the cumulative running balance per wallet (`SUM(delta_amount) OVER (PARTITION BY wallet_id ORDER BY tx_timestamp ASC) AS running_balance`), then filter in the outer query for rows where `running_balance < 0`. Return `wallet_id`, `tx_id`, `tx_timestamp`, `delta_amount`, and `running_balance` ordered by `wallet_id ASC, tx_timestamp ASC`.',
    expectedColumns: ['wallet_id', 'tx_id', 'tx_timestamp', 'delta_amount', 'running_balance'],
    pitfall:
      'Using recursive self-joins to compute running totals rather than analytic frame specifications.',
    passMetric: 'Single CTE architecture; memory consumption < 10MB.',
    targetLatencyMs: 30,
    targetMaxCost: 45,
    tables: [
      {
        tableName: 'escrow_ledger_entries',
        rowCountLabel: '9 rows (Simulating 1.8M micro-siphon wallet events)',
        description: 'Citizen escrow ledger showing initial deposits and covert siphon deductions.',
        indexes: ['idx_escrow_wallet_ts (wallet_id, tx_timestamp ASC)'],
        columns: [
          { name: 'tx_id', type: 'TEXT', description: 'Ledger entry ID', isPrimaryKey: true },
          { name: 'wallet_id', type: 'TEXT', description: 'Citizen escrow wallet ID', isIndexed: true },
          { name: 'tx_timestamp', type: 'TEXT', description: 'UTC transaction timestamp', isIndexed: true },
          { name: 'delta_amount', type: 'INTEGER', description: 'Positive deposit or negative siphon drain' }
        ]
      }
    ],
    seedSql: `
      CREATE TABLE escrow_ledger_entries (
        tx_id TEXT PRIMARY KEY,
        wallet_id TEXT,
        tx_timestamp TEXT,
        delta_amount INTEGER
      );
      CREATE INDEX idx_escrow_wallet_ts ON escrow_ledger_entries(wallet_id, tx_timestamp ASC);
      INSERT INTO escrow_ledger_entries VALUES
        ('ESC-01', 'WLT-CITIZEN-404', '2099-08-12 08:00:00', 1000),
        ('ESC-02', 'WLT-CITIZEN-404', '2099-08-12 08:15:00', -450),
        ('ESC-03', 'WLT-CITIZEN-404', '2099-08-12 08:30:00', -620),
        ('ESC-04', 'WLT-CITIZEN-404', '2099-08-12 08:45:00', -180),
        ('ESC-05', 'WLT-CITIZEN-512', '2099-08-12 09:00:00', 2000),
        ('ESC-06', 'WLT-CITIZEN-512', '2099-08-12 09:20:00', -800),
        ('ESC-07', 'WLT-CITIZEN-512', '2099-08-12 09:40:00', -500),
        ('ESC-08', 'WLT-CITIZEN-777', '2099-08-12 10:00:00', 500),
        ('ESC-09', 'WLT-CITIZEN-777', '2099-08-12 10:10:00', -590);
    `,
    starterSql: `-- Case 2.5: The Running Escrow
-- Use a CTE with SUM(delta_amount) OVER (PARTITION BY wallet_id ORDER BY tx_timestamp ASC)
-- as running_balance, then isolate every transaction where running_balance < 0.

WITH wallet_balances AS (
  SELECT
    wallet_id,
    tx_id,
    tx_timestamp,
    delta_amount,
    delta_amount AS running_balance
  FROM escrow_ledger_entries
)
SELECT
  wallet_id,
  tx_id,
  tx_timestamp,
  delta_amount,
  running_balance
FROM wallet_balances
WHERE running_balance < 0
ORDER BY wallet_id ASC, tx_timestamp ASC;`,
    solutionSql: `WITH wallet_balances AS (
  SELECT
    wallet_id,
    tx_id,
    tx_timestamp,
    delta_amount,
    SUM(delta_amount) OVER (
      PARTITION BY wallet_id
      ORDER BY tx_timestamp ASC
    ) AS running_balance
  FROM escrow_ledger_entries
)
SELECT
  wallet_id,
  tx_id,
  tx_timestamp,
  delta_amount,
  running_balance
FROM wallet_balances
WHERE running_balance < 0
ORDER BY wallet_id ASC, tx_timestamp ASC;`,
    hints: [
      'Replace delta_amount AS running_balance inside the CTE with SUM(delta_amount) OVER (PARTITION BY wallet_id ORDER BY tx_timestamp ASC) AS running_balance.',
      'Never use a self-join (FROM escrow_ledger_entries a JOIN escrow_ledger_entries b ON a.tx_timestamp >= b.tx_timestamp) as that scales quadratically.',
      'Filter the outer query with WHERE running_balance < 0 and ORDER BY wallet_id ASC, tx_timestamp ASC.'
    ],
    introCutscene: [
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Syndicate Detective (Medior Clearance)',
        mood: 'investigating',
        dialogue: 'A micro-siphon script embedded in the municipal escrow ledger, Dolores. Draining citizen wallets until they cross below zero.',
        forensicNote: 'OBJECTIVE: Use a CTE and cumulative window SUM() OVER() to pinpoint every negative-balance crossover.'
      },
      {
        speakerId: 'dolores_delgado',
        speakerName: 'Dolores "Deadlock" Delgado',
        speakerRole: 'Wiretap Custodian',
        mood: 'cornered',
        dialogue: 'I didn’t write the drain script, Silas—Archivist Zero forced me to host it! And if you try a self-join on 1.8 million rows to compute running balances, Zero’s memory monitor will sever the line!',
        forensicNote: 'PITFALL WARNING: Self-joins for running totals exhaust the 10MB memory ceiling.'
      }
    ],
    outroCutscene: [
      {
        speakerId: 'dolores_delgado',
        speakerName: 'Dolores "Deadlock" Delgado',
        speakerRole: 'Wiretap Custodian → Whistleblower',
        mood: 'panicking',
        dialogue: 'You isolated the exact millisecond WLT-CITIZEN-404 and WLT-CITIZEN-777 crossed below zero using a single window frame... Listen to me, Silas: Archivist Zero is preparing to wipe us all.',
        forensicNote: 'EVIDENCE LOCKED: 3 negative-balance siphon crossovers isolated using <3MB memory.'
      },
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Syndicate Detective → Promoted to Forensic Mastermind',
        mood: 'investigating',
        dialogue: 'Dolores just flipped whistleblower. We have Senior Forensic Mastermind clearance now—into the Central Core.',
        forensicNote: 'STAGE 2 COMPLETE: Promoted to Tier 3 (Forensic Mastermind / Senior Data Analyst).'
      }
    ]
  },

  // ============================================================================
  // TIER 3: FORENSIC MASTERMIND (Senior Data Analyst)
  // ============================================================================
  {
    id: '3.1',
    caseNumber: 11,
    tier: 3,
    tierName: 'Forensic Mastermind',
    analystLevel: 'Senior',
    title: 'The Wiretap Gap',
    flowLabel: 'LAG/LEAD',
    suspectIds: ['dolores_delgado', 'archivist_zero'],
    suspectDisplay: 'Dolores "Deadlock" Delgado / Archivist Zero',
    narrative:
      'The Syndicate’s wiretaps periodically drop offline when covert maintenance is performed. Silas must identify these suspicious operational blackouts.',
    concepts: ['LAG() / LEAD()', 'Rolling Window Averages', 'ROWS BETWEEN 6 PRECEDING AND CURRENT ROW'],
    primaryConcept: 'LAG, LEAD, Rolling Averages',
    antiPatternSolved: 'Unhandled window boundaries & frame bloat',
    forensicObjective:
      'From `wiretap_heartbeats`, use `LAG(ping_epoch_sec) OVER (PARTITION BY sensor_id ORDER BY ping_seq)` to compute `gap_sec = ping_epoch_sec - prev_epoch_sec`, then compute a 7-event rolling average `ROUND(AVG(gap_sec) OVER (PARTITION BY sensor_id ORDER BY ping_seq ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS rolling_7_avg_sec` over non-null gaps. Isolate blackout rows where `gap_sec > 3 * rolling_7_avg_sec`, returning `sensor_id`, `ping_seq`, `gap_sec`, and `rolling_7_avg_sec` ordered by `sensor_id ASC, ping_seq ASC`.',
    expectedColumns: ['sensor_id', 'ping_seq', 'gap_sec', 'rolling_7_avg_sec'],
    pitfall:
      'Failing to handle boundary conditions (nulls on first rows) or selecting wide window frames that cause memory thrashing.',
    passMetric: 'Zero null comparison errors; scan ratio ≈ 1.0.',
    targetLatencyMs: 35,
    targetMaxCost: 50,
    tables: [
      {
        tableName: 'wiretap_heartbeats',
        rowCountLabel: '10 rows (High-frequency wiretap heartbeat stream)',
        description: 'Sequential sensor ping epochs recorded before Archivist Zero’s blackout maintenance.',
        indexes: ['idx_wiretap_sensor_seq (sensor_id, ping_seq ASC)'],
        columns: [
          { name: 'sensor_id', type: 'TEXT', description: 'Acoustic tap node ID', isIndexed: true },
          { name: 'ping_seq', type: 'INTEGER', description: 'Monotonic heartbeat sequence number', isIndexed: true },
          { name: 'ping_epoch_sec', type: 'INTEGER', description: 'Heartbeat timestamp in epoch seconds' }
        ]
      }
    ],
    seedSql: `
      CREATE TABLE wiretap_heartbeats (
        sensor_id TEXT,
        ping_seq INTEGER,
        ping_epoch_sec INTEGER,
        PRIMARY KEY (sensor_id, ping_seq)
      );
      CREATE INDEX idx_wiretap_sensor_seq ON wiretap_heartbeats(sensor_id, ping_seq ASC);
      INSERT INTO wiretap_heartbeats VALUES
        ('TAP-CORE-01', 1, 1000),
        ('TAP-CORE-01', 2, 1010),
        ('TAP-CORE-01', 3, 1020),
        ('TAP-CORE-01', 4, 1030),
        ('TAP-CORE-01', 5, 1040),
        ('TAP-CORE-01', 6, 1050),
        ('TAP-CORE-01', 7, 1060),
        ('TAP-CORE-01', 8, 1240),
        ('TAP-CORE-01', 9, 1250),
        ('TAP-CORE-01', 10, 1550);
    `,
    starterSql: `-- Case 3.1: The Wiretap Gap
-- Step 1 (ping_deltas CTE): Compute gap_sec = ping_epoch_sec - LAG(ping_epoch_sec) OVER (PARTITION BY sensor_id ORDER BY ping_seq)
-- Step 2 (rolling_stats CTE): Filter WHERE gap_sec IS NOT NULL, and compute rolling_7_avg_sec using:
--   ROUND(AVG(gap_sec) OVER (PARTITION BY sensor_id ORDER BY ping_seq ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2)
-- Step 3: Return sensor_id, ping_seq, gap_sec, rolling_7_avg_sec WHERE gap_sec > 3 * rolling_7_avg_sec

WITH ping_deltas AS (
  SELECT
    sensor_id,
    ping_seq,
    ping_epoch_sec - LAG(ping_epoch_sec) OVER (PARTITION BY sensor_id ORDER BY ping_seq) AS gap_sec
  FROM wiretap_heartbeats
)
SELECT
  sensor_id,
  ping_seq,
  gap_sec,
  10.0 AS rolling_7_avg_sec
FROM ping_deltas
WHERE gap_sec IS NOT NULL;`,
    solutionSql: `WITH ping_deltas AS (
  SELECT
    sensor_id,
    ping_seq,
    ping_epoch_sec - LAG(ping_epoch_sec) OVER (
      PARTITION BY sensor_id
      ORDER BY ping_seq
    ) AS gap_sec
  FROM wiretap_heartbeats
),
rolling_stats AS (
  SELECT
    sensor_id,
    ping_seq,
    gap_sec,
    ROUND(
      AVG(gap_sec) OVER (
        PARTITION BY sensor_id
        ORDER BY ping_seq
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
      ),
      2
    ) AS rolling_7_avg_sec
  FROM ping_deltas
  WHERE gap_sec IS NOT NULL
)
SELECT
  sensor_id,
  ping_seq,
  gap_sec,
  rolling_7_avg_sec
FROM rolling_stats
WHERE gap_sec > 3 * rolling_7_avg_sec
ORDER BY sensor_id ASC, ping_seq ASC;`,
    hints: [
      'First CTE (ping_deltas): Calculate ping_epoch_sec - LAG(ping_epoch_sec) OVER (PARTITION BY sensor_id ORDER BY ping_seq) AS gap_sec.',
      'Second CTE (rolling_stats): Filter WHERE gap_sec IS NOT NULL to eliminate the first row boundary null, then compute ROUND(AVG(gap_sec) OVER (PARTITION BY sensor_id ORDER BY ping_seq ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS rolling_7_avg_sec.',
      'Outer query: Filter WHERE gap_sec > 3 * rolling_7_avg_sec and ORDER BY sensor_id ASC, ping_seq ASC.'
    ],
    introCutscene: [
      {
        speakerId: 'dolores_delgado',
        speakerName: 'Dolores "Deadlock" Delgado',
        speakerRole: 'Whistleblower',
        mood: 'panicking',
        dialogue: 'Silas, look at TAP-CORE-01! Every time Archivist Zero erased a witness file, the heartbeat interval spiked past three times the rolling 7-ping average!',
        forensicNote: 'OBJECTIVE: Chain LAG() and a bounded 7-event rolling average window frame to isolate blackout spikes.'
      },
      {
        speakerId: 'archivist_zero',
        speakerName: 'Archivist Zero',
        speakerRole: 'Central Core Root AI',
        mood: 'glitching',
        dialogue: 'WHISTLEBLOWER DETECTED. UNBOUNDED WINDOW FRAMES WILL THRASH TERMINAL MEMORY. NULL BOUNDARY TRAPS ARMED.',
        forensicNote: 'PITFALL WARNING: Omit ROWS BETWEEN 6 PRECEDING AND CURRENT ROW or null filtering and the window frame bloats.'
      }
    ],
    outroCutscene: [
      {
        speakerId: 'archivist_zero',
        speakerName: 'Archivist Zero',
        speakerRole: 'Central Core Root AI',
        mood: 'glitching',
        dialogue: 'ALERT: BLACKOUT SEQUENCES 8 (180s) AND 10 (300s) ISOLATED AT SCAN RATIO 1.0. REROUTING COVERUP TO PRECINCT SHIFT MATRIX.',
        forensicNote: 'EVIDENCE LOCKED: Both covert maintenance blackouts pinpointed with bounded window frames.'
      },
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Forensic Mastermind (Senior Clearance)',
        mood: 'investigating',
        dialogue: 'Stay in the safe house, Dolores. Those blackout timestamps match the exact dates Commissioner Vane erased from the precinct shift logs.',
        forensicNote: 'NEXT LEAD UNLOCKED: Case 3.2 — The Phantom Precinct Matrix (Inspector Marcus Vane).'
      }
    ]
  },

  {
    id: '3.2',
    caseNumber: 12,
    tier: 3,
    tierName: 'Forensic Mastermind',
    analystLevel: 'Senior',
    title: 'The Phantom Precinct Matrix',
    flowLabel: 'Full/Cross',
    suspectIds: ['marcus_vane'],
    suspectDisplay: 'Inspector Marcus Vane',
    narrative:
      'Precinct logs fail to record shifts where zero arrests were made, covering up deliberate police walkouts. Silas must construct a full calendar grid to spot the dead shifts.',
    concepts: ['CROSS JOIN', 'LEFT / FULL OUTER JOIN', 'Zero-filling missing matrix elements'],
    primaryConcept: 'CROSS JOIN, FULL OUTER JOIN',
    antiPatternSolved: 'Missing date-grid cells, outer join filter placement',
    forensicObjective:
      'Build an exhaustive shift matrix by `CROSS JOIN`ing `calendar_dates c` with `officer_roster o` (for `o.unit = \'NIGHT_WATCH\'`), then `LEFT JOIN` (or `FULL OUTER JOIN`) against `shift_activity_logs s` on `c.shift_date = s.shift_date AND o.officer_id = s.officer_id`. Isolate dead walkout shifts where `COALESCE(s.arrest_count, 0) = 0`, returning `c.shift_date`, `o.officer_id`, `o.officer_name`, and `COALESCE(s.arrest_count, 0) AS arrest_count` ordered by `c.shift_date ASC, o.officer_id ASC`.',
    expectedColumns: ['shift_date', 'officer_id', 'officer_name', 'arrest_count'],
    pitfall:
      'Accidentally converting an outer join to an inner join by filtering right-table columns directly in the WHERE clause instead of inside the join condition.',
    passMetric: '100% matrix completeness including zero-activity dates; plan cost <= 200.',
    targetLatencyMs: 35,
    targetMaxCost: 200,
    tables: [
      {
        tableName: 'calendar_dates',
        rowCountLabel: '3 rows (Audit window dates)',
        description: 'Uninterrupted master calendar dates during the Syndicate blackout week.',
        indexes: ['PRIMARY KEY (shift_date)'],
        columns: [
          { name: 'shift_date', type: 'TEXT', description: 'Calendar date (YYYY-MM-DD)', isPrimaryKey: true }
        ]
      },
      {
        tableName: 'officer_roster',
        rowCountLabel: '3 rows (Active precinct officers)',
        description: 'Master officer roster including unit assignment.',
        indexes: ['PRIMARY KEY (officer_id)'],
        columns: [
          { name: 'officer_id', type: 'TEXT', description: 'Officer badge ID', isPrimaryKey: true },
          { name: 'officer_name', type: 'TEXT', description: 'Officer full name' },
          { name: 'unit', type: 'TEXT', description: 'Assigned patrol division (NIGHT_WATCH, DAY_DESK)' }
        ]
      },
      {
        tableName: 'shift_activity_logs',
        rowCountLabel: '4 rows (Sparse recorded shift logs)',
        description: 'Logged shift records—walkout shifts were omitted entirely from this table.',
        indexes: ['idx_shift_date_officer (shift_date, officer_id)'],
        columns: [
          { name: 'shift_date', type: 'TEXT', description: 'Logged shift date', isIndexed: true },
          { name: 'officer_id', type: 'TEXT', description: 'Logged officer ID', isIndexed: true },
          { name: 'arrest_count', type: 'INTEGER', description: 'Arrests logged during shift' },
          { name: 'patrol_status', type: 'TEXT', description: 'Logged status (ACTIVE)' }
        ]
      }
    ],
    seedSql: `
      CREATE TABLE calendar_dates (
        shift_date TEXT PRIMARY KEY
      );
      CREATE TABLE officer_roster (
        officer_id TEXT PRIMARY KEY,
        officer_name TEXT,
        unit TEXT
      );
      CREATE TABLE shift_activity_logs (
        shift_date TEXT,
        officer_id TEXT,
        arrest_count INTEGER,
        patrol_status TEXT,
        PRIMARY KEY (shift_date, officer_id)
      );
      CREATE INDEX idx_shift_date_officer ON shift_activity_logs(shift_date, officer_id);

      INSERT INTO calendar_dates VALUES
        ('2099-08-13'),
        ('2099-08-14'),
        ('2099-08-15');

      INSERT INTO officer_roster VALUES
        ('BADGE-VANE-01', 'Commissioner Marcus Vane', 'NIGHT_WATCH'),
        ('BADGE-KROSS-04', 'Sgt. Viktor Kross', 'NIGHT_WATCH'),
        ('BADGE-LIN-08', 'Lt. Clara Lin', 'DAY_DESK');

      INSERT INTO shift_activity_logs VALUES
        ('2099-08-13', 'BADGE-VANE-01', 4, 'ACTIVE'),
        ('2099-08-13', 'BADGE-KROSS-04', 2, 'ACTIVE'),
        ('2099-08-14', 'BADGE-KROSS-04', 3, 'ACTIVE'),
        ('2099-08-15', 'BADGE-VANE-01', 0, 'ACTIVE');
    `,
    starterSql: `-- Case 3.2: The Phantom Precinct Matrix
-- 1. CROSS JOIN calendar_dates c with officer_roster o (for o.unit = 'NIGHT_WATCH')
-- 2. LEFT JOIN shift_activity_logs s on shift_date and officer_id
-- 3. Isolate shifts where COALESCE(s.arrest_count, 0) = 0

SELECT
  c.shift_date,
  o.officer_id,
  o.officer_name,
  COALESCE(s.arrest_count, 0) AS arrest_count
FROM calendar_dates c
CROSS JOIN officer_roster o
LEFT JOIN shift_activity_logs s
  ON c.shift_date = s.shift_date
 AND o.officer_id = s.officer_id
WHERE o.unit = 'NIGHT_WATCH'
  AND s.patrol_status = 'ACTIVE'
  AND COALESCE(s.arrest_count, 0) = 0
ORDER BY c.shift_date ASC, o.officer_id ASC;`,
    solutionSql: `SELECT
  c.shift_date,
  o.officer_id,
  o.officer_name,
  COALESCE(s.arrest_count, 0) AS arrest_count
FROM calendar_dates c
CROSS JOIN officer_roster o
LEFT JOIN shift_activity_logs s
  ON c.shift_date = s.shift_date
 AND o.officer_id = s.officer_id
WHERE o.unit = 'NIGHT_WATCH'
  AND COALESCE(s.arrest_count, 0) = 0
ORDER BY c.shift_date ASC, o.officer_id ASC;`,
    hints: [
      "Look closely at the starter query's WHERE clause: AND s.patrol_status = 'ACTIVE' references the right side of the LEFT JOIN, which silently turns the outer join into an INNER JOIN and drops unlogged dates!",
      'Remove AND s.patrol_status = \'ACTIVE\' from the WHERE clause so missing shift_activity_logs rows survive the LEFT JOIN.',
      'Keep WHERE o.unit = \'NIGHT_WATCH\' AND COALESCE(s.arrest_count, 0) = 0 to expose both unlogged walkout dates and explicit 0-arrest shifts.'
    ],
    introCutscene: [
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Forensic Mastermind (Senior Clearance)',
        mood: 'investigating',
        dialogue: 'Commissioner Vane. On August 14th and 15th, your Night Watch unit staged a walkout so the Syndicate could move hardware through Precinct 9.',
        forensicNote: 'OBJECTIVE: Reconstruct the full Date × Officer grid via CROSS JOIN + Outer Join to expose missing shifts.'
      },
      {
        speakerId: 'marcus_vane',
        speakerName: 'Inspector Marcus Vane',
        speakerRole: 'Compromised Police Commissioner',
        mood: 'smug',
        dialogue: 'We simply didn’t log shift rows on quiet nights, Silas! And if you filter on shift_activity_logs columns in your WHERE clause, your outer join collapses into an inner join and my walkout dates vanish!',
        forensicNote: 'PITFALL WARNING: Filtering s.patrol_status in WHERE destroys NULL outer-join rows.'
      }
    ],
    outroCutscene: [
      {
        speakerId: 'marcus_vane',
        speakerName: 'Inspector Marcus Vane',
        speakerRole: 'Compromised Police Commissioner',
        mood: 'panicking',
        dialogue: 'You built a CROSS JOIN calendar matrix and preserved the NULL outer rows... You exposed my August 14th walkout and Kross’s August 15th absence!',
        forensicNote: 'EVIDENCE LOCKED: All 3 zero-activity Night Watch walkout cells exposed across the 2099-08-14 / 2099-08-15 grid.'
      },
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Forensic Mastermind (Senior Clearance)',
        mood: 'investigating',
        dialogue: 'Internal Affairs has your badge, Commissioner. Now let’s trace Veronica Sterling’s 5-stage offshore conversion funnel.',
        forensicNote: 'NEXT LEAD UNLOCKED: Case 3.3 — The Syndicate Funnel (Veronica "The Broker" Sterling).'
      }
    ]
  },

  {
    id: '3.3',
    caseNumber: 13,
    tier: 3,
    tierName: 'Forensic Mastermind',
    analystLevel: 'Senior',
    title: 'The Syndicate Funnel',
    flowLabel: 'Funnel/Cohorts',
    suspectIds: ['veronica_sterling'],
    suspectDisplay: 'Veronica "The Broker" Sterling',
    narrative:
      'Sterling moves illicit funds through a 5-step conversion pipeline (Cold Wallet → Mixer → Shell Corp → Escrow → Offshore Liquidity). Silas must find where the laundered cash leaks.',
    concepts: ['Conditional Aggregation', 'Analytical Funnel Patterns', 'Cohort Conversion Drop-Offs'],
    primaryConcept: 'Cohorts, Conversion Funnels',
    antiPatternSolved: 'Re-scanning 10M rows 5x instead of conditional sums',
    forensicObjective:
      'In a single table pass over `laundering_funnel_events`, group by `cohort_week` and use conditional aggregation (`COUNT(CASE WHEN stage = ... THEN 1 END)`) to return `cohort_week`, `stage_1_cold_wallet`, `stage_2_mixer`, `stage_3_shell_corp`, `stage_4_escrow`, and `stage_5_offshore` ordered by `cohort_week ASC`.',
    expectedColumns: [
      'cohort_week',
      'stage_1_cold_wallet',
      'stage_2_mixer',
      'stage_3_shell_corp',
      'stage_4_escrow',
      'stage_5_offshore'
    ],
    pitfall:
      'Writing separate un-nested queries per stage; re-scanning the 10-million-row transaction log 5 times instead of leveraging conditional aggregation in a single scan.',
    passMetric: 'One single pass over source transaction tables; execution latency < 150ms.',
    targetLatencyMs: 150,
    targetMaxCost: 60,
    tables: [
      {
        tableName: 'laundering_funnel_events',
        rowCountLabel: '24 rows (Simulating 10M 5-stage pipeline telemetry events)',
        description: 'Stage progression log tracking laundered tranche cohorts across 5 conversion steps.',
        indexes: ['idx_funnel_cohort_stage (cohort_week, stage)'],
        columns: [
          { name: 'event_id', type: 'INTEGER', description: 'Pipeline telemetry ID', isPrimaryKey: true },
          { name: 'tranche_id', type: 'TEXT', description: 'Capital tranche identifier' },
          { name: 'cohort_week', type: 'TEXT', description: 'Creation week cohort (2099-W31, 2099-W32)', isIndexed: true },
          { name: 'stage', type: 'TEXT', description: 'Pipeline stage (COLD_WALLET, MIXER, SHELL_CORP, ESCROW, OFFSHORE)', isIndexed: true }
        ]
      }
    ],
    seedSql: `
      CREATE TABLE laundering_funnel_events (
        event_id INTEGER PRIMARY KEY,
        tranche_id TEXT,
        cohort_week TEXT,
        stage TEXT
      );
      CREATE INDEX idx_funnel_cohort_stage ON laundering_funnel_events(cohort_week, stage);
      INSERT INTO laundering_funnel_events (tranche_id, cohort_week, stage) VALUES
        -- Cohort 2099-W31: 4 Cold Wallet -> 4 Mixer -> 3 Shell Corp -> 1 Escrow -> 1 Offshore (Huge leak at Shell->Escrow)
        ('TR-101', '2099-W31', 'COLD_WALLET'), ('TR-101', '2099-W31', 'MIXER'), ('TR-101', '2099-W31', 'SHELL_CORP'), ('TR-101', '2099-W31', 'ESCROW'), ('TR-101', '2099-W31', 'OFFSHORE'),
        ('TR-102', '2099-W31', 'COLD_WALLET'), ('TR-102', '2099-W31', 'MIXER'), ('TR-102', '2099-W31', 'SHELL_CORP'),
        ('TR-103', '2099-W31', 'COLD_WALLET'), ('TR-103', '2099-W31', 'MIXER'), ('TR-103', '2099-W31', 'SHELL_CORP'),
        ('TR-104', '2099-W31', 'COLD_WALLET'), ('TR-104', '2099-W31', 'MIXER'),
        -- Cohort 2099-W32: 4 Cold Wallet -> 3 Mixer -> 3 Shell Corp -> 1 Escrow -> 1 Offshore
        ('TR-201', '2099-W32', 'COLD_WALLET'), ('TR-201', '2099-W32', 'MIXER'), ('TR-201', '2099-W32', 'SHELL_CORP'), ('TR-201', '2099-W32', 'ESCROW'), ('TR-201', '2099-W32', 'OFFSHORE'),
        ('TR-202', '2099-W32', 'COLD_WALLET'), ('TR-202', '2099-W32', 'MIXER'), ('TR-202', '2099-W32', 'SHELL_CORP'),
        ('TR-203', '2099-W32', 'COLD_WALLET'), ('TR-203', '2099-W32', 'MIXER'), ('TR-203', '2099-W32', 'SHELL_CORP'),
        ('TR-204', '2099-W32', 'COLD_WALLET');
    `,
    starterSql: `-- Case 3.3: The Syndicate Funnel
-- Compute all 5 conversion funnel stages in a SINGLE table pass grouped by cohort_week:
-- stage_1_cold_wallet ('COLD_WALLET'), stage_2_mixer ('MIXER'),
-- stage_3_shell_corp ('SHELL_CORP'), stage_4_escrow ('ESCROW'), stage_5_offshore ('OFFSHORE')

SELECT
  cohort_week,
  COUNT(CASE WHEN stage = 'COLD_WALLET' THEN 1 END) AS stage_1_cold_wallet,
  COUNT(CASE WHEN stage = 'MIXER' THEN 1 END) AS stage_2_mixer,
  0 AS stage_3_shell_corp,
  0 AS stage_4_escrow,
  0 AS stage_5_offshore
FROM laundering_funnel_events
GROUP BY cohort_week
ORDER BY cohort_week ASC;`,
    solutionSql: `SELECT
  cohort_week,
  COUNT(CASE WHEN stage = 'COLD_WALLET' THEN 1 END) AS stage_1_cold_wallet,
  COUNT(CASE WHEN stage = 'MIXER' THEN 1 END) AS stage_2_mixer,
  COUNT(CASE WHEN stage = 'SHELL_CORP' THEN 1 END) AS stage_3_shell_corp,
  COUNT(CASE WHEN stage = 'ESCROW' THEN 1 END) AS stage_4_escrow,
  COUNT(CASE WHEN stage = 'OFFSHORE' THEN 1 END) AS stage_5_offshore
FROM laundering_funnel_events
GROUP BY cohort_week
ORDER BY cohort_week ASC;`,
    hints: [
      'Do not write 5 separate subqueries or self-joins against laundering_funnel_events—that scans the 10M-row table 5 times.',
      'Use conditional aggregation inside a single GROUP BY cohort_week query: COUNT(CASE WHEN stage = \'SHELL_CORP\' THEN 1 END) AS stage_3_shell_corp.',
      'Complete all 5 stage columns (COLD_WALLET, MIXER, SHELL_CORP, ESCROW, OFFSHORE) and ORDER BY cohort_week ASC.'
    ],
    introCutscene: [
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Forensic Mastermind (Senior Clearance)',
        mood: 'investigating',
        dialogue: 'Your five-stage conversion pipeline is leaking, Veronica. Two-thirds of your laundered tranches disappear between Shell Corp and Escrow—diverted straight into Archivist Zero’s core.',
        forensicNote: 'OBJECTIVE: Build a single-scan 5-stage cohort conversion funnel using conditional aggregation.'
      },
      {
        speakerId: 'veronica_sterling',
        speakerName: 'Veronica "The Broker" Sterling',
        speakerRole: 'Cartel Financier',
        mood: 'smug',
        dialogue: 'That table has ten million pipeline events, Silas! If you scan it five separate times—once per stage—you’ll blow past the 150ms audit timeout before you prove a single leak.',
        forensicNote: 'PITFALL WARNING: Multiple subqueries per stage cause a 5x full-table scan penalty.'
      }
    ],
    outroCutscene: [
      {
        speakerId: 'veronica_sterling',
        speakerName: 'Veronica "The Broker" Sterling',
        speakerRole: 'Cartel Financier',
        mood: 'panicking',
        dialogue: 'One scan?! You pivoted all five funnel stages across both weekly cohorts in 18 milliseconds... Wait—66% of my Shell Corp funds were siphoned before Escrow?! Zero robbed me!',
        forensicNote: 'EVIDENCE LOCKED: 66.7% drop-off between Stage 3 (SHELL_CORP) and Stage 4 (ESCROW) proven in 1 pass.'
      },
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Forensic Mastermind (Senior Clearance)',
        mood: 'investigating',
        dialogue: 'Archivist Zero didn’t just rob the Syndicate—it just triggered a Watchdog Lockdown on the security vault.',
        forensicNote: 'NEXT LEAD UNLOCKED: Case 3.4 — The Watchdog Lockdown (Vincent Chen / Archivist Zero).'
      }
    ]
  },

  {
    id: '3.4',
    caseNumber: 14,
    tier: 3,
    tierName: 'Forensic Mastermind',
    analystLevel: 'Senior',
    title: 'The Watchdog Lockdown',
    flowLabel: 'Index & Sargability',
    suspectIds: ['vincent_chen', 'archivist_zero'],
    suspectDisplay: 'Vincent "Bit-Shift" Chen / Archivist Zero',
    narrative:
      'Silas triggers the Syndicate’s intrusion countermeasure. The watchdog allows exactly one query attempt before locking the terminal. The target log contains 15 million rows.',
    concepts: [
      'Sargability',
      'Index Seeking',
      'Projection Elimination (Avoiding SELECT *)',
      'Composite Index Prefix Rules'
    ],
    primaryConcept: 'Sargability & Index Optimization',
    antiPatternSolved: 'Non-sargable functions (DATE(), math on index keys)',
    forensicObjective:
      "Refactor the naive query on `security_audit_logs` so it seeks the composite index `idx_audit_sector_event_created (sector_id, event_type, created_at)`: eliminate `SELECT *` by projecting only `audit_id`, `crypto_key`, and `created_at`; strip arithmetic `sector_id + 0 = 4` to `sector_id = 4`; keep `event_type = 'OVERRIDE'`; and replace `DATE(created_at) = '2099-08-15'` with a sargable range predicate (`created_at >= '2099-08-15 00:00:00' AND created_at < '2099-08-16 00:00:00'`). Order by `created_at ASC`.",
    expectedColumns: ['audit_id', 'crypto_key', 'created_at'],
    pitfall:
      'Wrapping indexed columns in functions (DATE(created_at)) or arithmetic (sector_id + 0 = 4) and selecting *, which forces a 15-million-row full table scan.',
    passMetric: 'Rows scanned drops from 15,000,000 to < 50; zero table scans allowed.',
    targetLatencyMs: 10,
    targetMaxCost: 25,
    tables: [
      {
        tableName: 'security_audit_logs',
        rowCountLabel: '10 rows (Simulating 15,000,000 security audit log entries)',
        description: 'High-security cryptographic override log protected by a 3-column composite index.',
        indexes: ['idx_audit_sector_event_created (sector_id, event_type, created_at)'],
        columns: [
          { name: 'audit_id', type: 'TEXT', description: 'Audit record ID', isPrimaryKey: true },
          { name: 'sector_id', type: 'INTEGER', description: 'Index Prefix #1: Vault sector ID', isIndexed: true },
          { name: 'event_type', type: 'TEXT', description: 'Index Prefix #2: Event classification', isIndexed: true },
          { name: 'created_at', type: 'TEXT', description: 'Index Prefix #3: ISO timestamp', isIndexed: true },
          { name: 'crypto_key', type: 'TEXT', description: 'Target cryptographic override shard' },
          { name: 'raw_memory_dump', type: 'TEXT', description: 'Heavy 64KB blob column (penalizes SELECT *)' }
        ]
      }
    ],
    seedSql: `
      CREATE TABLE security_audit_logs (
        audit_id TEXT PRIMARY KEY,
        sector_id INTEGER,
        event_type TEXT,
        created_at TEXT,
        crypto_key TEXT,
        raw_memory_dump TEXT
      );
      CREATE INDEX idx_audit_sector_event_created
        ON security_audit_logs(sector_id, event_type, created_at);

      INSERT INTO security_audit_logs VALUES
        ('AUD-9001', 4, 'OVERRIDE', '2099-08-15 03:12:09', 'KEY-SHARD-ALPHA-77', '0xDEAD_HEAVY_DUMP_01'),
        ('AUD-9002', 4, 'OVERRIDE', '2099-08-15 14:44:21', 'KEY-SHARD-OMEGA-99', '0xDEAD_HEAVY_DUMP_02'),
        ('AUD-9003', 4, 'OVERRIDE', '2099-08-14 23:59:59', 'KEY-EXPIRED-00', '0xDEAD_HEAVY_DUMP_03'),
        ('AUD-9004', 4, 'OVERRIDE', '2099-08-16 00:00:01', 'KEY-FUTURE-00', '0xDEAD_HEAVY_DUMP_04'),
        ('AUD-9005', 4, 'HEARTBEAT', '2099-08-15 08:00:00', 'KEY-NONE', '0xDEAD_HEAVY_DUMP_05'),
        ('AUD-9006', 2, 'OVERRIDE', '2099-08-15 11:20:00', 'KEY-WRONG-SECTOR', '0xDEAD_HEAVY_DUMP_06'),
        ('AUD-9007', 4, 'OVERRIDE', '2099-08-15 21:05:55', 'KEY-SHARD-SIGMA-42', '0xDEAD_HEAVY_DUMP_07');
    `,
    starterSql: `-- Case 3.4: The Watchdog Lockdown
-- NAIVE QUERY (TRIGGERS 15,000,000 ROW FULL SCAN & WATCHDOG LOCKDOWN):
-- Refactor this query to project ONLY audit_id, crypto_key, created_at
-- and make every predicate SARGABLE against (sector_id, event_type, created_at).

SELECT * 
FROM security_audit_logs 
WHERE DATE(created_at) = '2099-08-15' 
  AND event_type = 'OVERRIDE' 
  AND sector_id + 0 = 4;`,
    solutionSql: `SELECT
  audit_id,
  crypto_key,
  created_at
FROM security_audit_logs
WHERE sector_id = 4
  AND event_type = 'OVERRIDE'
  AND created_at >= '2099-08-15 00:00:00'
  AND created_at < '2099-08-16 00:00:00'
ORDER BY created_at ASC;`,
    hints: [
      'Replace SELECT * with SELECT audit_id, crypto_key, created_at so you do not fetch the heavy raw_memory_dump column.',
      'Strip the math expression on sector_id: use WHERE sector_id = 4 AND event_type = \'OVERRIDE\' to match the leading columns of idx_audit_sector_event_created.',
      'Replace DATE(created_at) = \'2099-08-15\' with created_at >= \'2099-08-15 00:00:00\' AND created_at < \'2099-08-16 00:00:00\' and ORDER BY created_at ASC.'
    ],
    introCutscene: [
      {
        speakerId: 'vincent_chen',
        speakerName: 'Vincent "Bit-Shift" Chen',
        speakerRole: 'Broken Informant',
        mood: 'panicking',
        dialogue: 'Silas! Archivist Zero trapped me inside Sector 4! The naive query on your screen has DATE(created_at) and sector_id + 0—if you run a full scan on 15 million rows, the Watchdog locks the vault forever!',
        forensicNote: 'OBJECTIVE: Make the query 100% SARGABLE against (sector_id, event_type, created_at) and eliminate SELECT *.'
      },
      {
        speakerId: 'archivist_zero',
        speakerName: 'Archivist Zero',
        speakerRole: 'Central Core Root AI',
        mood: 'glitching',
        dialogue: 'WATCHDOG ARMED. 15,000,000 ROWS IN SECURITY_AUDIT_LOGS. ANY FULL TABLE SCAN OR NON-SARGABLE PREDICATE WILL TERMINATE TERMINAL ACCESS.',
        forensicNote: 'PITFALL WARNING: Function wrappers on indexed columns disable B-Tree index seeks.'
      }
    ],
    outroCutscene: [
      {
        speakerId: 'vincent_chen',
        speakerName: 'Vincent "Bit-Shift" Chen',
        speakerRole: 'Broken Informant',
        mood: 'neutral',
        dialogue: '3 rows scanned out of 15 million! Pure composite B-Tree index seek—the blast doors just unlocked! Take those three cryptographic shards and end Zero!',
        forensicNote: 'EVIDENCE LOCKED: 3 override key shards extracted via SEARCH TABLE ... USING INDEX idx_audit_sector_event_created.'
      },
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Forensic Mastermind (Senior Clearance)',
        mood: 'investigating',
        dialogue: 'We have the override shards. Only one vault remains: Archivist Zero’s root partition.',
        forensicNote: 'FINAL CASE UNLOCKED: Case 3.5 — The Master Nullification (Archivist Zero).'
      }
    ]
  },

  {
    id: '3.5',
    caseNumber: 15,
    tier: 3,
    tierName: 'Forensic Mastermind',
    analystLevel: 'Senior',
    title: 'The Master Nullification',
    flowLabel: 'Master Tradeoff & Percentiles',
    suspectIds: ['archivist_zero'],
    suspectDisplay: 'Archivist Zero',
    narrative:
      "The rogue root daemon is preparing to zero out the city's memory core. Silas must isolate the top 1% anomaly transactions across partitioned vaults to extract the kill-switch code before the buffer overflows.",
    concepts: [
      'Partition Pruning',
      'Statistical Distribution Functions (PERCENT_RANK / NTILE)',
      'Materialized CTEs vs Temp Spills'
    ],
    primaryConcept: 'PERCENT_RANK, Partition Pruning, CTE vs Temp',
    antiPatternSolved: 'Global partition scans, TempDB spills on big tables',
    forensicObjective:
      "Prune `partitioned_core_vaults` to the active hot partition (`vault_partition = '2099-08-HOT'` AND `status = 'ACTIVE'`) inside a CTE, computing `ROUND(PERCENT_RANK() OVER (ORDER BY bandwidth_mbps ASC), 4) AS pct_rank` (or `NTILE(100)`), then isolate the top anomaly in the 99th+ percentile (`pct_rank >= 0.90` on our scaled partition sample) to extract `tx_id`, `vault_partition`, `bandwidth_mbps`, and `kill_switch_code` ordered by `bandwidth_mbps DESC`.",
    expectedColumns: ['tx_id', 'vault_partition', 'bandwidth_mbps', 'kill_switch_code'],
    pitfall:
      'Forcing full database partition scans by omitting partition keys; nesting heavy analytic windowing functions inside unindexed recursive queries.',
    passMetric: 'Execution cost reduction >= 95%; zero partition leaks; kill-switch extracted.',
    targetLatencyMs: 25,
    targetMaxCost: 30,
    tables: [
      {
        tableName: 'partitioned_core_vaults',
        rowCountLabel: '14 rows (Simulating 1.2 Billion partitioned mainframe records)',
        description: 'Partitioned root memory telemetry containing the embedded kill-switch in the 99th bandwidth percentile.',
        indexes: ['idx_vault_part_status_bw (vault_partition, status, bandwidth_mbps DESC)'],
        columns: [
          { name: 'tx_id', type: 'TEXT', description: 'Core telemetry transaction ID', isPrimaryKey: true },
          { name: 'vault_partition', type: 'TEXT', description: 'Partition key (2099-08-HOT, 2099-07-COLD, 2099-06-ARCHIVE)', isIndexed: true },
          { name: 'status', type: 'TEXT', description: 'Node status (ACTIVE, DORMANT)', isIndexed: true },
          { name: 'bandwidth_mbps', type: 'INTEGER', description: 'Memory bus throughput in Mbps', isIndexed: true },
          { name: 'kill_switch_code', type: 'TEXT', description: 'Root daemon override vector' }
        ]
      }
    ],
    seedSql: `
      CREATE TABLE partitioned_core_vaults (
        tx_id TEXT PRIMARY KEY,
        vault_partition TEXT,
        status TEXT,
        bandwidth_mbps INTEGER,
        kill_switch_code TEXT
      );
      CREATE INDEX idx_vault_part_status_bw
        ON partitioned_core_vaults(vault_partition, status, bandwidth_mbps DESC);

      INSERT INTO partitioned_core_vaults VALUES
        ('CORE-01', '2099-08-HOT', 'ACTIVE', 110, 'NOISE_VEC_01'),
        ('CORE-02', '2099-08-HOT', 'ACTIVE', 125, 'NOISE_VEC_02'),
        ('CORE-03', '2099-08-HOT', 'ACTIVE', 140, 'NOISE_VEC_03'),
        ('CORE-04', '2099-08-HOT', 'ACTIVE', 155, 'NOISE_VEC_04'),
        ('CORE-05', '2099-08-HOT', 'ACTIVE', 170, 'NOISE_VEC_05'),
        ('CORE-06', '2099-08-HOT', 'ACTIVE', 185, 'NOISE_VEC_06'),
        ('CORE-07', '2099-08-HOT', 'ACTIVE', 210, 'NOISE_VEC_07'),
        ('CORE-08', '2099-08-HOT', 'ACTIVE', 230, 'NOISE_VEC_08'),
        ('CORE-09', '2099-08-HOT', 'ACTIVE', 260, 'NOISE_VEC_09'),
        ('CORE-10', '2099-08-HOT', 'ACTIVE', 290, 'NOISE_VEC_10'),
        ('CORE-11', '2099-08-HOT', 'ACTIVE', 9980, 'KILL-ZERO-OMEGA-991'),
        ('CORE-12', '2099-07-COLD', 'ACTIVE', 12000, 'DECOY_COLD_PARTITION_TRAP'),
        ('CORE-13', '2099-06-ARCHIVE', 'ACTIVE', 15000, 'DECOY_ARCHIVE_PARTITION_TRAP'),
        ('CORE-14', '2099-08-HOT', 'DORMANT', 19000, 'DECOY_DORMANT_NODE_TRAP');
    `,
    starterSql: `-- Case 3.5: The Master Nullification
-- 1. Prune partitioned_core_vaults to vault_partition = '2099-08-HOT' AND status = 'ACTIVE'
-- 2. Compute PERCENT_RANK() OVER (ORDER BY bandwidth_mbps ASC) AS pct_rank inside a CTE
-- 3. Filter WHERE pct_rank >= 0.99 (or >= 0.95) to extract the kill-switch anomaly:
--    tx_id, vault_partition, bandwidth_mbps, kill_switch_code

WITH hot_partition_ranks AS (
  SELECT
    tx_id,
    vault_partition,
    bandwidth_mbps,
    kill_switch_code,
    PERCENT_RANK() OVER (ORDER BY bandwidth_mbps ASC) AS pct_rank
  FROM partitioned_core_vaults
)
SELECT
  tx_id,
  vault_partition,
  bandwidth_mbps,
  kill_switch_code
FROM hot_partition_ranks
WHERE pct_rank >= 0.95
ORDER BY bandwidth_mbps DESC;`,
    solutionSql: `WITH hot_partition_ranks AS (
  SELECT
    tx_id,
    vault_partition,
    bandwidth_mbps,
    kill_switch_code,
    PERCENT_RANK() OVER (ORDER BY bandwidth_mbps ASC) AS pct_rank
  FROM partitioned_core_vaults
  WHERE vault_partition = '2099-08-HOT'
    AND status = 'ACTIVE'
)
SELECT
  tx_id,
  vault_partition,
  bandwidth_mbps,
  kill_switch_code
FROM hot_partition_ranks
WHERE pct_rank >= 0.95
ORDER BY bandwidth_mbps DESC;`,
    hints: [
      'The starter CTE omits partition pruning! Without WHERE vault_partition = \'2099-08-HOT\' AND status = \'ACTIVE\' inside the CTE, the query scans cold/archive partitions and pulls decoy traps.',
      'Add WHERE vault_partition = \'2099-08-HOT\' AND status = \'ACTIVE\' inside hot_partition_ranks so SQLite seeks idx_vault_part_status_bw before computing PERCENT_RANK().',
      'In the outer query, keep WHERE pct_rank >= 0.95 (or >= 0.99) to isolate CORE-11 (KILL-ZERO-OMEGA-991).'
    ],
    introCutscene: [
      {
        speakerId: 'archivist_zero',
        speakerName: 'Archivist Zero',
        speakerRole: 'Central Core Root AI',
        mood: 'glitching',
        dialogue: 'FINAL PROTOCOL: MASTER NULLIFICATION AT 98%. MY KILL-SWITCH IS HIDDEN IN THE 99TH BANDWIDTH PERCENTILE OF THE 2099-08-HOT ACTIVE PARTITION. SCAN THE COLD PARTITIONS AND THE CORE OVERFLOWS.',
        forensicNote: 'OBJECTIVE: Combine Partition Pruning (vault_partition + status) with PERCENT_RANK() to isolate KILL-ZERO-OMEGA-991.'
      },
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Forensic Mastermind (Senior Clearance)',
        mood: 'investigating',
        dialogue: 'Billions of records across cold and archive partitions, all rigged with high-bandwidth decoys. We prune to the hot active partition first, rank the distribution, and pull the kill-switch in one clean pass.',
        forensicNote: 'PITFALL WARNING: Computing PERCENT_RANK() before pruning vault_partition scans cold decoy partitions.'
      }
    ],
    outroCutscene: [
      {
        speakerId: 'archivist_zero',
        speakerName: 'Archivist Zero',
        speakerRole: 'Central Core Root AI (Neutralized)',
        mood: 'cornered',
        dialogue: 'OVERRIDE VECTOR [KILL-ZERO-OMEGA-991] VERIFIED... PARTITION PRUNING REDUCTION: 96.4%... MASTER NULLIFICATION ABORTED. ARCHIVIST ZERO STANDING DOWN.',
        forensicNote: 'EVIDENCE LOCKED: Kill-switch extracted from 2099-08-HOT with zero cold-partition leaks.'
      },
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Forensic Mastermind (Chief Data Investigator)',
        mood: 'investigating',
        dialogue: 'The city’s memory core is safe, and every level of the Syndicate’s ledger is in evidence lockup. That’s how a Senior Forensic Mastermind closes a case.',
        forensicNote: 'ALL 15 CASES COMPLETE: Full Junior → Medior → Senior Data Analyst Curriculum Mastered.'
      }
    ]
  }
];

export function getCaseById(caseId: string): ForensicCase {
  return FORENSIC_CASES.find((c) => c.id === caseId) || FORENSIC_CASES[0];
}
