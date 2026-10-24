import React from 'react';
import { motion } from 'motion/react';
import { CHARACTERS, CharacterId, PortraitMood } from '../data/characters';

interface NoirPortraitProps {
  characterId: CharacterId;
  mood?: PortraitMood;
  tier?: 1 | 2 | 3;
  isSpeaking?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const NoirPortrait: React.FC<NoirPortraitProps> = ({
  characterId,
  mood = 'neutral',
  tier = 1,
  isSpeaking = false,
  size = 'md',
  className = ''
}) => {
  const character = CHARACTERS[characterId] || CHARACTERS.detective_silas;

  const dimensions = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-44 h-52'
  }[size];

  const moodLabel = {
    neutral: 'COMPOSED',
    investigating: 'ANALYZING',
    smug: 'DEFIANT',
    panicking: 'PANICKING',
    cornered: 'CORNERED',
    glitching: 'OVERLOAD'
  }[mood];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{
        opacity: 1,
        scale: isSpeaking ? 1.02 : 1,
        x: mood === 'panicking' || mood === 'glitching' ? [0, -1.5, 1.5, -1, 0] : 0
      }}
      transition={{
        duration: 0.2,
        x: {
          repeat: mood === 'panicking' || mood === 'glitching' ? Infinity : 0,
          repeatDelay: 1.8,
          duration: 0.25
        }
      }}
      className={`relative overflow-hidden rounded-lg bg-[#080C14] border ${
        isSpeaking
          ? 'border-amber-500/80 shadow-[0_0_24px_rgba(245,158,11,0.18)]'
          : 'border-slate-800'
      } ${dimensions} shrink-0 select-none ${className}`}
    >
      {/* Background atmospheric lighting & Venetian blind shadow bars */}
      <svg
        viewBox="0 0 200 240"
        className="w-full h-full object-cover"
        aria-label={character.name}
      >
        <defs>
          <radialGradient id={`glow-${characterId}`} cx="50%" cy="38%" r="65%">
            <stop offset="0%" stopColor={character.accentColor} stopOpacity="0.32" />
            <stop offset="65%" stopColor="#0F172A" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#05080F" stopOpacity="1" />
          </radialGradient>
          <linearGradient id={`rim-${characterId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={character.accentColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1E293B" stopOpacity="0.2" />
          </linearGradient>
          <pattern
            id={`blinds-${characterId}`}
            width="200"
            height="18"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-12)"
          >
            <rect width="200" height="7" fill="#020617" fillOpacity="0.48" />
          </pattern>
        </defs>

        {/* Base studio backdrop */}
        <rect width="200" height="240" fill={`url(#glow-${characterId})`} />

        {/* Subtle coordinate grid */}
        <g stroke="#1E293B" strokeWidth="0.6" opacity="0.45">
          <line x1="0" y1="60" x2="200" y2="60" />
          <line x1="0" y1="120" x2="200" y2="120" />
          <line x1="0" y1="180" x2="200" y2="180" />
          <line x1="50" y1="0" x2="50" y2="240" />
          <line x1="100" y1="0" x2="100" y2="240" />
          <line x1="150" y1="0" x2="150" y2="240" />
        </g>

        {/* Character-Specific Noir Illustration */}
        {characterId === 'detective_silas' && (
          <g>
            {/* Trench coat shoulders & upturned collar */}
            <path
              d="M20 240 L38 168 L72 142 L100 165 L128 142 L162 168 L180 240 Z"
              fill="#0F172A"
              stroke={`url(#rim-${characterId})`}
              strokeWidth="2"
            />
            <path
              d="M64 142 L84 195 L100 175 L116 195 L136 142 L124 128 L76 128 Z"
              fill="#1E293B"
              stroke="#F59E0B"
              strokeWidth="1.2"
            />
            {/* Amber tie & collar shadow */}
            <polygon points="96,162 104,162 107,215 100,226 93,215" fill="#D97706" opacity="0.85" />
            {/* Chiseled jaw & face */}
            <path
              d="M74 84 C74 62, 126 62, 126 84 L123 124 C123 138, 108 148, 100 148 C92 148, 77 138, 77 124 Z"
              fill="#1E293B"
              stroke="#F59E0B"
              strokeWidth="1.5"
            />
            {/* Dramatic half-shadow across face */}
            <path
              d="M100 66 L125 84 L123 124 C123 138, 108 148, 100 148 Z"
              fill="#090D16"
              opacity="0.65"
            />
            {/* Sharp amber-lit eyes */}
            <rect x="83" y="96" width="11" height="3.5" rx="1.5" fill="#FBBF24" />
            <rect x="106" y="96" width="11" height="3.5" rx="1.5" fill="#F59E0B" opacity="0.8" />
            {/* Classic noir fedora silhouette */}
            <path
              d="M42 84 Q100 68 158 84 Q128 73 72 73 Z"
              fill="#090D16"
              stroke="#F59E0B"
              strokeWidth="1.5"
            />
            <path
              d="M66 76 L74 44 Q100 38 126 44 L134 76 Z"
              fill="#0F172A"
              stroke="#D97706"
              strokeWidth="1.2"
            />
            <rect x="68" y="68" width="64" height="5" fill="#D97706" opacity="0.9" />
          </g>
        )}

        {characterId === 'vincent_chen' && (
          <g>
            {/* Background data cables */}
            <path d="M15 40 C55 90, 40 160, 20 240" stroke="#0284C7" strokeWidth="2" fill="none" opacity="0.4" />
            <path d="M185 30 C150 100, 160 150, 180 240" stroke="#38BDF8" strokeWidth="1.5" fill="none" opacity="0.4" />
            {/* High-collar street utility jacket */}
            <path
              d="M26 240 L42 162 L68 136 L132 136 L158 162 L174 240 Z"
              fill="#0F172A"
              stroke={`url(#rim-${characterId})`}
              strokeWidth="2"
            />
            {/* Head & spiky undercut hair */}
            <path
              d="M75 80 L70 56 L86 62 L98 48 L112 60 L128 52 L125 80 Z"
              fill="#090D16"
              stroke="#38BDF8"
              strokeWidth="1.2"
            />
            <path
              d="M75 78 L125 78 L121 124 C121 136, 108 145, 100 145 C92 145, 79 136, 79 124 Z"
              fill="#1E293B"
              stroke="#38BDF8"
              strokeWidth="1.4"
            />
            {/* Asymmetric cyber-optic visor */}
            <rect
              x="73"
              y="90"
              width="54"
              height="12"
              rx="3"
              fill="#0284C7"
              fillOpacity="0.35"
              stroke="#38BDF8"
              strokeWidth="1.6"
            />
            <circle cx="88" cy="96" r="3" fill="#7DD3FC" />
            <line x1="102" y1="96" x2="120" y2="96" stroke="#38BDF8" strokeWidth="2" />
            {/* Expression mouth */}
            {mood === 'panicking' ? (
              <rect x="92" y="122" width="16" height="6" rx="2" fill="#090D16" stroke="#38BDF8" strokeWidth="1" />
            ) : (
              <path d="M90 124 Q102 128 112 121" stroke="#38BDF8" strokeWidth="1.6" fill="none" />
            )}
          </g>
        )}

        {characterId === 'dolores_delgado' && (
          <g>
            {/* Acoustic waveform halo */}
            <circle cx="100" cy="95" r="58" stroke="#F43F5E" strokeWidth="0.8" fill="none" strokeDasharray="4 4" opacity="0.45" />
            {/* Velvet evening gown & fur-trimmed wrap */}
            <path
              d="M28 240 C34 176, 62 150, 100 150 C138 150, 166 176, 172 240 Z"
              fill="#181024"
              stroke={`url(#rim-${characterId})`}
              strokeWidth="2"
            />
            {/* Sculpted noir waves hair */}
            <path
              d="M64 98 C58 56, 84 42, 104 46 C128 48, 142 72, 134 114 C130 132, 122 144, 114 148 L80 144 C70 134, 66 116, 64 98 Z"
              fill="#090D16"
              stroke="#F43F5E"
              strokeWidth="1.4"
            />
            {/* Face contour */}
            <path
              d="M78 78 C78 62, 122 62, 122 78 L118 120 C116 134, 106 142, 100 142 C94 142, 84 134, 82 120 Z"
              fill="#1E293B"
              stroke="#FB7185"
              strokeWidth="1.3"
            />
            {/* Eyes & crimson lip detail */}
            <path d="M84 94 Q90 90 96 94" stroke="#FDA4AF" strokeWidth="2" fill="none" />
            <path d="M104 94 Q110 90 116 94" stroke="#FDA4AF" strokeWidth="2" fill="none" />
            <path d="M94 123 Q100 127 106 123" stroke="#F43F5E" strokeWidth="2.5" fill="none" />
            {/* Vintage studio ribbon microphone in foreground */}
            <rect x="91" y="164" width="18" height="30" rx="9" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
            <line x1="94" y1="173" x2="106" y2="173" stroke="#F59E0B" strokeWidth="1" />
            <line x1="94" y1="179" x2="106" y2="179" stroke="#F59E0B" strokeWidth="1" />
            <line x1="94" y1="185" x2="106" y2="185" stroke="#F59E0B" strokeWidth="1" />
            <line x1="100" y1="194" x2="100" y2="240" stroke="#94A3B8" strokeWidth="2.5" />
          </g>
        )}

        {characterId === 'marcus_vane' && (
          <g>
            {/* Heavy commissioner dress uniform overcoat & epaulettes */}
            <path
              d="M16 240 L30 160 L70 142 L100 158 L130 142 L170 160 L184 240 Z"
              fill="#0F172A"
              stroke={`url(#rim-${characterId})`}
              strokeWidth="2"
            />
            <rect x="34" y="152" width="24" height="6" rx="2" fill="#A855F7" opacity="0.8" />
            <rect x="142" y="152" width="24" height="6" rx="2" fill="#A855F7" opacity="0.8" />
            {/* Precinct shield badge on chest */}
            <polygon
              points="136,178 144,174 152,178 150,192 144,198 138,192"
              fill="#F59E0B"
              stroke="#FEF3C7"
              strokeWidth="0.8"
            />
            {/* Broad jaw & stern face */}
            <path
              d="M72 78 L128 78 L125 126 C125 140, 112 148, 100 148 C88 148, 75 140, 75 126 Z"
              fill="#1E293B"
              stroke="#C084FC"
              strokeWidth="1.5"
            />
            {/* Peaked Police Visor Cap */}
            <path
              d="M58 76 L68 46 Q100 36 132 46 L142 76 Z"
              fill="#090D16"
              stroke="#A855F7"
              strokeWidth="1.5"
            />
            <path d="M54 76 Q100 66 146 76 Q100 84 54 76 Z" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.4" />
            {/* Stern brow & eyes */}
            <line x1="80" y1="92" x2="96" y2="95" stroke="#E9D5FF" strokeWidth="2.4" />
            <line x1="120" y1="92" x2="104" y2="95" stroke="#E9D5FF" strokeWidth="2.4" />
            <rect x="83" y="97" width="9" height="3" fill="#C084FC" />
            <rect x="108" y="97" width="9" height="3" fill="#C084FC" />
            <line x1="90" y1="128" x2="110" y2="128" stroke="#94A3B8" strokeWidth="2" />
          </g>
        )}

        {characterId === 'veronica_sterling' && (
          <g>
            {/* High-rise vault architectural diamond behind */}
            <polygon
              points="100,22 162,92 100,162 38,92"
              fill="none"
              stroke="#10B981"
              strokeWidth="1"
              opacity="0.35"
            />
            {/* Sharp tailored executive blazer */}
            <path
              d="M28 240 L46 158 L78 140 L100 184 L122 140 L154 158 L172 240 Z"
              fill="#09151B"
              stroke={`url(#rim-${characterId})`}
              strokeWidth="2"
            />
            <polygon points="78,140 100,184 90,140" fill="#10B981" opacity="0.6" />
            <polygon points="122,140 100,184 110,140" fill="#10B981" opacity="0.6" />
            {/* Sleek geometric bob & sharp cheekbones */}
            <path
              d="M68 68 C68 44, 132 44, 132 68 L136 122 L122 126 L120 78 L80 78 L78 126 L64 122 Z"
              fill="#090D16"
              stroke="#34D399"
              strokeWidth="1.2"
            />
            <path
              d="M78 74 L122 74 L117 120 C115 133, 106 141, 100 141 C94 141, 85 133, 83 120 Z"
              fill="#1E293B"
              stroke="#10B981"
              strokeWidth="1.4"
            />
            {/* Rimless executive glasses */}
            <rect x="81" y="90" width="16" height="9" rx="1.5" fill="#064E3B" fillOpacity="0.5" stroke="#6EE7B7" strokeWidth="1.3" />
            <rect x="103" y="90" width="16" height="9" rx="1.5" fill="#064E3B" fillOpacity="0.5" stroke="#6EE7B7" strokeWidth="1.3" />
            <line x1="97" y1="94" x2="103" y2="94" stroke="#6EE7B7" strokeWidth="1.3" />
            <path d="M93 123 L107 122" stroke="#34D399" strokeWidth="1.8" />
          </g>
        )}

        {characterId === 'archivist_zero' && (
          <g>
            {/* Central Core Autonomous Mainframe Construct */}
            <circle cx="100" cy="110" r="68" stroke="#EF4444" strokeWidth="1" fill="none" strokeDasharray="6 3" opacity="0.5" />
            <circle cx="100" cy="110" r="52" stroke="#F59E0B" strokeWidth="0.8" fill="none" opacity="0.4" />
            {/* Monolithic armored core housing */}
            <polygon
              points="64,46 136,46 156,110 136,184 64,184 44,110"
              fill="#090D16"
              stroke="#EF4444"
              strokeWidth="2"
            />
            <polygon
              points="76,62 124,62 138,110 124,164 76,164 62,110"
              fill="#1E293B"
              stroke="#F87171"
              strokeWidth="1.2"
            />
            {/* Conduits */}
            <line x1="100" y1="184" x2="100" y2="240" stroke="#EF4444" strokeWidth="4" />
            <line x1="78" y1="184" x2="64" y2="240" stroke="#F59E0B" strokeWidth="2" />
            <line x1="122" y1="184" x2="136" y2="240" stroke="#F59E0B" strokeWidth="2" />
            {/* Central HAL/Noir Optic Iris */}
            <circle cx="100" cy="110" r="24" fill="#05080F" stroke="#EF4444" strokeWidth="2" />
            <circle cx="100" cy="110" r="12" fill="#DC2626" opacity="0.85" />
            <circle cx="100" cy="110" r="5" fill="#FEF2F2" />
            {/* Telemetry bars */}
            <line x1="74" y1="146" x2="126" y2="146" stroke="#EF4444" strokeWidth="2" strokeDasharray="5 3" />
          </g>
        )}

        {/* Venetian blind shadow overlay */}
        <rect width="200" height="240" fill={`url(#blinds-${characterId})`} />

        {/* Subtle bottom vignette */}
        <rect
          x="0"
          y="175"
          width="200"
          height="65"
          fill="#05080F"
          fillOpacity="0.72"
        />
      </svg>

      {/* Bottom Telemetry Caption */}
      {size !== 'sm' && (
        <div className="absolute inset-x-0 bottom-0 px-2.5 py-1.5 bg-gradient-to-t from-[#05080F] via-[#05080F]/90 to-transparent flex items-center justify-between text-[10px] font-mono tracking-wider">
          <span className="text-slate-300 truncate">{character.codename}</span>
          <span className="text-amber-400 tabular-nums shrink-0">
            {size === 'lg' ? `T${tier} · ${moodLabel}` : `T${tier}`}
          </span>
        </div>
      )}
    </motion.div>
  );
};
