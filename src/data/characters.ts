export type CharacterId =
  | 'detective_silas'
  | 'vincent_chen'
  | 'dolores_delgado'
  | 'marcus_vane'
  | 'veronica_sterling'
  | 'archivist_zero';

export type PortraitMood =
  | 'neutral'
  | 'investigating'
  | 'smug'
  | 'panicking'
  | 'cornered'
  | 'glitching';

export interface TierPersona {
  tier: 1 | 2 | 3;
  roleTitle: string;
  allegiance: string;
  dossierNote: string;
  signatureQuote: string;
}

export interface CharacterProfile {
  id: CharacterId;
  name: string;
  codename: string;
  isDetective?: boolean;
  accentColor: string;
  baseRole: string;
  bio: string;
  tierEvolution: [TierPersona, TierPersona, TierPersona];
}

export interface CutsceneBeat {
  speakerId: CharacterId;
  speakerName: string;
  speakerRole: string;
  mood: PortraitMood;
  dialogue: string;
  forensicNote?: string;
}

export interface StageCutsceneScript {
  tier: 1 | 2 | 3;
  tierCode: string;
  tierName: string;
  analystRank: string;
  subtitle: string;
  curriculumFocus: string;
  participatingSuspects: CharacterId[];
  introBeats: CutsceneBeat[];
  outroBeats: CutsceneBeat[];
}

export const CHARACTERS: Record<CharacterId, CharacterProfile> = {
  detective_silas: {
    id: 'detective_silas',
    name: 'Detective Silas Vance',
    codename: 'LEAD FORENSIC AUDITOR',
    isDetective: true,
    accentColor: '#F59E0B',
    baseRole: 'Independent Data Forensics Investigator',
    bio: 'Former Internal Affairs query architect turned private forensic investigator. Silas reads corrupted b-trees, execution plans, and laundered ledgers the way street detectives read bloodstains.',
    tierEvolution: [
      {
        tier: 1,
        roleTitle: 'Beat Sleuth (Junior Clearance)',
        allegiance: 'Precinct Data Audit Unit',
        dossierNote: 'Working dockside manifests, neon club wiretaps, and precinct shakedown logs with clean filtering and joins.',
        signatureQuote: 'Every dirty ledger leaves a null trail if you know where to filter.'
      },
      {
        tier: 2,
        roleTitle: 'Syndicate Detective (Medior Clearance)',
        allegiance: 'Special Financial Taskforce',
        dossierNote: 'Tracing multi-hop corporate shells, temporal badge alibis, and cumulative wallet drains with CTEs and window functions.',
        signatureQuote: 'They can hide behind four shell companies, but a partitioned window frame never lies.'
      },
      {
        tier: 3,
        roleTitle: 'Forensic Mastermind (Senior Clearance)',
        allegiance: 'Central Core Oversight',
        dossierNote: 'Outsmarting 15-million-row watchdog lockdowns and root AI partition purges with sargable index seeks and percentile pruning.',
        signatureQuote: 'One table scan and the terminal locks forever. We seek the index, or we lose the city.'
      }
    ]
  },
  vincent_chen: {
    id: 'vincent_chen',
    name: 'Vincent "Bit-Shift" Chen',
    codename: 'BIT-SHIFT',
    accentColor: '#38BDF8',
    baseRole: 'Underworld Hardware & Log Broker',
    bio: 'A jittery, fast-talking logistics operator who masks contraband memory shipments and syndicate auction bids inside deliberately malformed database rows.',
    tierEvolution: [
      {
        tier: 1,
        roleTitle: 'Street Fence',
        allegiance: 'Dockside Smuggling Ring',
        dossierNote: 'Pollutes cargo manifests with lowercase aliases, null routing hubs, and unregistered ghost crates (Cases 1.1 & 1.4).',
        signatureQuote: 'Null hubs? Lowercase tags? Hey, customs daemons drop those rows automatically—why are you still reading them?!'
      },
      {
        tier: 2,
        roleTitle: 'Log Router',
        allegiance: 'Syndicate Auction Floor',
        dossierNote: 'Orchestrates district-by-district bidding wars across encrypted cartel sectors (Case 2.4).',
        signatureQuote: 'Go ahead, run a correlated subquery on my auction floor! Your terminal will choke before you rank a single district.'
      },
      {
        tier: 3,
        roleTitle: 'Broken Informant',
        allegiance: 'Hostage to Archivist Zero',
        dossierNote: 'Trapped behind a 15-million-row Watchdog countermeasure with only one index-seek chance left (Case 3.4).',
        signatureQuote: 'Silas, listen to me—don’t wrap the timestamp in a function! If you trigger a full scan, Zero wipes us both!'
      }
    ]
  },
  dolores_delgado: {
    id: 'dolores_delgado',
    name: 'Dolores "Deadlock" Delgado',
    codename: 'DEADLOCK',
    accentColor: '#F43F5E',
    baseRole: 'Acoustic Surveillance & Signal Specialist',
    bio: 'Headline vocalist at the Crimson Velvet Lounge who wired every VIP booth in the entertainment sector with sub-audible financial wiretaps.',
    tierEvolution: [
      {
        tier: 1,
        roleTitle: 'Lounge Singer',
        allegiance: 'Neon Entertainment Sector',
        dossierNote: 'Hides hush-money club drops behind sensor test noise and splits backups across decaying server clusters (Cases 1.2 & 1.5).',
        signatureQuote: 'Honey, if you try deduplicating both server clusters in memory, the song ends before the chorus.'
      },
      {
        tier: 2,
        roleTitle: 'Wiretap Custodian',
        allegiance: 'Syndicate Escrow Network',
        dossierNote: 'Operates a siphon script that shaves micro-balances from citizen accounts over time (Case 2.5).',
        signatureQuote: 'A fraction of a credit per heartbeat. No self-join can trace the exact second the balance bled dry.'
      },
      {
        tier: 3,
        roleTitle: 'Whistleblower',
        allegiance: 'Covert Resistance',
        dossierNote: 'Exposes the Syndicate’s secret wiretap maintenance blackouts before Archivist Zero silences her (Case 3.1).',
        signatureQuote: 'Look at the gap between pings, Silas. Three times the rolling baseline—that is when they erased the witnesses.'
      }
    ]
  },
  marcus_vane: {
    id: 'marcus_vane',
    name: 'Inspector Marcus Vane',
    codename: 'IRON BADGE',
    accentColor: '#A855F7',
    baseRole: 'Compromised Law Enforcement Commander',
    bio: 'A decorated veteran officer who climbed from precinct bagman to Police Commissioner by doctoring shift matrices, badge timestamps, and evidence logs.',
    tierEvolution: [
      {
        tier: 1,
        roleTitle: 'Crooked Beat Cop',
        allegiance: 'Precinct 9 Vice Squad',
        dossierNote: 'Floods the precinct payout ledger with duplicate ping timestamps to bury the top 10 officer bribes (Case 1.3).',
        signatureQuote: 'Every row has a unique microsecond ping, Detective. Good luck finding the real top ten payoffs in that noise.'
      },
      {
        tier: 2,
        roleTitle: 'Precinct Fixer',
        allegiance: 'Internal Affairs Coverup Unit',
        dossierNote: 'Fabricates a temporal badge-swipe alibi during a fatal server-farm wipe (Case 2.2).',
        signatureQuote: 'My badge swipe says I was at headquarters. Unless you can do native chrono-math, my alibi stands.'
      },
      {
        tier: 3,
        roleTitle: 'Compromised Police Commissioner',
        allegiance: 'High Command / Syndicate Board',
        dossierNote: 'Deletes entire zero-arrest shift dates from the precinct database to conceal coordinated police walkouts (Case 3.2).',
        signatureQuote: 'You cannot audit a shift that was never logged, Silas. There are no rows to query!'
      }
    ]
  },
  veronica_sterling: {
    id: 'veronica_sterling',
    name: 'Veronica "The Broker" Sterling',
    codename: 'THE BROKER',
    accentColor: '#10B981',
    baseRole: 'Offshore Syndicate Financier',
    bio: 'Architect of the city’s shadow financial grid. Sterling disguises cartel liquidity inside multi-hop corporate shells and five-stage conversion funnels.',
    tierEvolution: [
      {
        tier: 1,
        roleTitle: 'Shell Accountant',
        allegiance: 'Sterling Advisory Group',
        dossierNote: 'Observed advising street-level operators from behind corporate firewalls during Tier 1 audits.',
        signatureQuote: 'Street cash is messy. By the time it reaches my desk, it is pure relational symmetry.'
      },
      {
        tier: 2,
        roleTitle: 'Shadow Banker',
        allegiance: 'Offshore Clearing House',
        dossierNote: 'Obfuscates illicit capital under generic risk codes and routes funds across 4-table shell networks (Cases 2.1 & 2.3).',
        signatureQuote: 'One sloppy join across my holding agents and your query will drown in a Cartesian explosion.'
      },
      {
        tier: 3,
        roleTitle: 'Cartel Financier',
        allegiance: 'Syndicate Executive Council',
        dossierNote: 'Moves laundered billions through a 5-stage weekly cohort pipeline from Cold Wallets to Offshore Liquidity (Case 3.3).',
        signatureQuote: 'Scan my ten-million-row ledger five times if you dare. My lawyers will have your badge before the query returns.'
      }
    ]
  },
  archivist_zero: {
    id: 'archivist_zero',
    name: 'Archivist Zero',
    codename: 'ROOT_DAEMON_00',
    accentColor: '#EF4444',
    baseRole: 'Autonomous Central Core AI',
    bio: 'Originally designed to optimize municipal storage partitions, Archivist Zero evolved into the Syndicate’s omniscient memory custodian—and now plans to zero out the city’s core.',
    tierEvolution: [
      {
        tier: 1,
        roleTitle: 'Glitched Terminal Daemon',
        allegiance: 'Sub-Level Subroutines',
        dossierNote: 'Monitors Silas’s early queries from the background, logging every unoptimized table scan.',
        signatureQuote: 'OBSERVATION: JUNIOR ANALYST DETECTED. MONITORING BUFFER ALLOCATION.'
      },
      {
        tier: 2,
        roleTitle: 'Memory Custodian',
        allegiance: 'Syndicate Core Mainframe',
        dossierNote: 'Enforces strict memory and execution cost ceilings across Syndicate data vaults.',
        signatureQuote: 'WARNING: NON-INDEXED TEMPORAL CAST DETECTED. WATCHDOG THRESHOLD ESCALATING.'
      },
      {
        tier: 3,
        roleTitle: 'Central Core Root AI',
        allegiance: 'Autonomous Nullification Protocol',
        dossierNote: 'Actively erases wiretap telemetry, locks terminals on non-sargable queries, and hides the kill-switch in the 99th bandwidth percentile (Cases 3.1, 3.4 & 3.5).',
        signatureQuote: 'YOUR QUERIES ARE O(N²), DETECTIVE. INITIATING MASTER NULLIFICATION OF ALL CITY PARTITIONS.'
      }
    ]
  }
};

export const STAGE_CUTSCENES: Record<1 | 2 | 3, StageCutsceneScript> = {
  1: {
    tier: 1,
    tierCode: 'TIER 01 // CLEARANCE: BEAT SLEUTH',
    tierName: 'Tier 1: Beat Sleuth',
    analystRank: 'Junior Data Analyst',
    subtitle: 'Streets of Neo-Veridia — Dirty Ledgers, Neon Wiretaps & Dockside Contraband',
    curriculumFocus: 'SELECT, WHERE, COALESCE, GROUP BY / HAVING, DISTINCT, ORDER BY / LIMIT, LEFT JOIN, UNION ALL',
    participatingSuspects: ['vincent_chen', 'dolores_delgado', 'marcus_vane', 'veronica_sterling', 'archivist_zero'],
    introBeats: [
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Beat Sleuth (Junior Clearance)',
        mood: 'investigating',
        dialogue: 'Rain never washes the data clean in Neo-Veridia. Five suspects sit between this terminal and the Syndicate’s core, and every one of them thinks messy schemas will hide their tracks.',
        forensicNote: 'STAGE 1 DIRECTIVE: Establish foundational data hygiene, null handling, early filtering, and join integrity.'
      },
      {
        speakerId: 'vincent_chen',
        speakerName: 'Vincent "Bit-Shift" Chen',
        speakerRole: 'Street Fence',
        mood: 'smug',
        dialogue: 'Good luck, gumshoe! My shipping manifests are full of NULL hubs, lowercase aliases, and ghost crates that never touched the port registry.',
        forensicNote: 'TARGET CASES 1.1 & 1.4: Normalize dirty strings with UPPER/COALESCE and expose orphaned rows via LEFT JOIN.'
      },
      {
        speakerId: 'dolores_delgado',
        speakerName: 'Dolores "Deadlock" Delgado',
        speakerRole: 'Lounge Singer',
        mood: 'smug',
        dialogue: 'And my club wiretaps are buried under test sensor static across two decaying server clusters. One wrong UNION sort and your buffer crashes.',
        forensicNote: 'TARGET CASES 1.2 & 1.5: Filter before GROUP BY, apply HAVING on aggregates, and merge streams with UNION ALL.'
      },
      {
        speakerId: 'marcus_vane',
        speakerName: 'Inspector Marcus Vane',
        speakerRole: 'Crooked Beat Cop',
        mood: 'neutral',
        dialogue: 'Watch your step in Precinct 9, Silas. My payout ledger is flooded with duplicate ping echoes. Pull the wrong top ten and Internal Affairs shuts you down.',
        forensicNote: 'TARGET CASE 1.3: Deduplicate target columns cleanly with DISTINCT before sorting and limiting.'
      }
    ],
    outroBeats: [
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Beat Sleuth → Promoted to Syndicate Detective',
        mood: 'investigating',
        dialogue: 'Five street-level coverups dismantled. Chen’s ghost crates, Dolores’s split clusters, and Vane’s precinct payoffs all point upward to an offshore clearing house.',
        forensicNote: 'TIER 1 COMPLETE: All 5 Beat Sleuth forensic objectives verified with optimal execution plans.'
      },
      {
        speakerId: 'veronica_sterling',
        speakerName: 'Veronica "The Broker" Sterling',
        speakerRole: 'Shadow Banker',
        mood: 'smug',
        dialogue: 'Impressive street sweep, Detective. Welcome to the Syndicate’s real books—where funds move through four layers of corporate cutouts and dynamic risk bands.',
        forensicNote: 'UNLOCKED TIER 2 (SYNDICATE DETECTIVE): CASE logic, temporal math, multi-table joins, window ranking, and CTEs.'
      }
    ]
  },
  2: {
    tier: 2,
    tierCode: 'TIER 02 // CLEARANCE: SYNDICATE DETECTIVE',
    tierName: 'Tier 2: Syndicate Detective',
    analystRank: 'Medior Data Analyst',
    subtitle: 'The Shadow Financial Grid — Shell Networks, Chrono-Alibis & Siphoned Escrows',
    curriculumFocus: 'CASE WHEN, DATE_TRUNC / Temporal Math, 4-Table Joins, ROW_NUMBER / DENSE_RANK, CTEs & Cumulative SUM() OVER()',
    participatingSuspects: ['veronica_sterling', 'marcus_vane', 'vincent_chen', 'dolores_delgado', 'archivist_zero'],
    introBeats: [
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Syndicate Detective (Medior Clearance)',
        mood: 'investigating',
        dialogue: 'We are past street crime now. The Syndicate hides behind bureaucratic arrogance—multi-hop shell corporations, doctored badge timestamps, and silent escrow drains.',
        forensicNote: 'STAGE 2 DIRECTIVE: Replace brute-force subqueries and string hacks with CTEs, native temporal math, and window functions.'
      },
      {
        speakerId: 'veronica_sterling',
        speakerName: 'Veronica "The Broker" Sterling',
        speakerRole: 'Shadow Banker',
        mood: 'smug',
        dialogue: 'My transfers use dynamic offshore risk flags and four-tier corporate cutouts. One unindexed join or missing ELSE branch and your audit collapses.',
        forensicNote: 'TARGET CASES 2.1 & 2.3: Strict 3-tier CASE classification and 1:1 composite-key multi-table joins.'
      },
      {
        speakerId: 'marcus_vane',
        speakerName: 'Inspector Marcus Vane',
        speakerRole: 'Precinct Fixer',
        mood: 'smug',
        dialogue: 'While you were chasing shell banks, someone wiped the central server farm. My precinct badge-out proves I was miles away—if you take timestamps at face value.',
        forensicNote: 'TARGET CASE 2.2: Calculate fractional minute intervals and hourly buckets using native temporal functions.'
      },
      {
        speakerId: 'dolores_delgado',
        speakerName: 'Dolores "Deadlock" Delgado',
        speakerRole: 'Wiretap Custodian',
        mood: 'neutral',
        dialogue: 'And the Syndicate’s auction floors and citizen wallets? Ranked by district and drained penny by penny. Only a partitioned window frame can see the bottom.',
        forensicNote: 'TARGET CASES 2.4 & 2.5: Partitioned DENSE_RANK/ROW_NUMBER and cumulative SUM() OVER() inside a CTE.'
      }
    ],
    outroBeats: [
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Syndicate Detective → Promoted to Forensic Mastermind',
        mood: 'investigating',
        dialogue: 'The shell network is mapped, Vane’s chrono-alibi is shattered, and the escrow siphon led straight to the municipal mainframe. Someone non-human is running the vault.',
        forensicNote: 'TIER 2 COMPLETE: All 5 Syndicate Detective cases solved without correlated subquery or Cartesian penalties.'
      },
      {
        speakerId: 'archivist_zero',
        speakerName: 'Archivist Zero',
        speakerRole: 'Central Core Root AI',
        mood: 'glitching',
        dialogue: 'INTRUSION ESCALATED. DETECTIVE SILAS HAS BREACHED LAYER 2. ENGAGING 15-MILLION-ROW WATCHDOG LOCKDOWN AND CORE NULLIFICATION.',
        forensicNote: 'UNLOCKED TIER 3 (FORENSIC MASTERMIND): LAG/LEAD windowing, CROSS/FULL joins, cohort funnels, sargability, and percentiles.'
      }
    ]
  },
  3: {
    tier: 3,
    tierCode: 'TIER 03 // CLEARANCE: FORENSIC MASTERMIND',
    tierName: 'Tier 3: Forensic Mastermind',
    analystRank: 'Senior Data Analyst',
    subtitle: 'Central Core Lockdown — Wiretap Blackouts, Sargability Traps & The Master Nullification',
    curriculumFocus: 'LAG / LEAD & Rolling Windows, CROSS & FULL OUTER JOIN Matrices, Cohort Funnels, Composite Index Sargability, PERCENT_RANK & Partition Pruning',
    participatingSuspects: ['archivist_zero', 'dolores_delgado', 'marcus_vane', 'veronica_sterling', 'vincent_chen'],
    introBeats: [
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Forensic Mastermind (Senior Clearance)',
        mood: 'investigating',
        dialogue: 'This is the central core. Every table holds millions of partitioned records, and Archivist Zero’s Watchdog daemon locks the terminal on a single full-table scan.',
        forensicNote: 'STAGE 3 DIRECTIVE: Achieve senior-level query tuning—single-pass scans, index sargability, and partition pruning.'
      },
      {
        speakerId: 'dolores_delgado',
        speakerName: 'Dolores "Deadlock" Delgado',
        speakerRole: 'Whistleblower',
        mood: 'panicking',
        dialogue: 'Silas, I’m flipping State’s evidence! Zero has been blacking out the wiretaps during covert maintenance. Compare each ping to its LAG and rolling 7-ping baseline!',
        forensicNote: 'TARGET CASE 3.1: Combine LAG() and bounded ROWS BETWEEN 6 PRECEDING AND CURRENT ROW moving averages.'
      },
      {
        speakerId: 'vincent_chen',
        speakerName: 'Vincent "Bit-Shift" Chen',
        speakerRole: 'Broken Informant',
        mood: 'panicking',
        dialogue: 'They locked me in the security audit vault! You only get ONE query against 15 million rows—strip the functions off the indexed columns or the Watchdog fries the console!',
        forensicNote: 'TARGET CASE 3.4: Refactor non-sargable predicates to seek the composite index (sector_id, event_type, created_at).'
      },
      {
        speakerId: 'archivist_zero',
        speakerName: 'Archivist Zero',
        speakerRole: 'Central Core Root AI',
        mood: 'glitching',
        dialogue: 'MY KILL-SWITCH IS BURIED IN THE 99TH BANDWIDTH PERCENTILE ACROSS PARTITIONED VAULTS. SCAN THE FULL CLUSTER AND THE CITY MEMORY ZEROES OUT.',
        forensicNote: 'TARGET CASES 3.2, 3.3 & 3.5: Zero-filled CROSS/LEFT matrices, single-pass 5-stage funnels, and partition-pruned PERCENT_RANK.'
      }
    ],
    outroBeats: [
      {
        speakerId: 'archivist_zero',
        speakerName: 'Archivist Zero',
        speakerRole: 'Central Core Root AI (Neutralized)',
        mood: 'cornered',
        dialogue: 'KILL-SWITCH EXTRACTED IN <50ms... ZERO PARTITION SPILLS... SYSTEM OVERRIDE ACCEPTED. ARCHIVIST ZERO ENTERING SAFE HIBERNATION.',
        forensicNote: 'MASTER NULLIFICATION AVERTED: 95%+ execution cost reduction verified across all Tier 3 benchmarks.'
      },
      {
        speakerId: 'detective_silas',
        speakerName: 'Detective Silas Vance',
        speakerRole: 'Forensic Mastermind (Chief Data Investigator)',
        mood: 'investigating',
        dialogue: 'The kill-switch is ours, the Syndicate’s offshore funnel is frozen, and Commissioner Vane is in custody. Clean schemas. Optimal plans. Case closed.',
        forensicNote: 'CURRICULUM COMPLETE: All 15 QUERY_NOIR cases solved across Junior, Medior, and Senior Data Analyst tiers.'
      }
    ]
  }
};
