import React from 'react';

/**
 * State Emblem of India (Lion Capital of Ashoka with Satyameva Jayate)
 * Official National Emblem representation for Indian Government digital portals.
 */
export function AshokaLionCapital({ size = 48, color = '#0c4e7e', showMotto = true }) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        width={size}
        height={size * 1.15}
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Academic Simulation Insignia (SIH 2026 Prototype - Non-Official)"
        role="img"
      >
        {/* Ashoka Lions Header Silhouette & Detail */}
        <path
          d="M32 18 C30 8, 42 4, 50 4 C58 4, 70 8, 68 18 C65 24, 74 30, 72 38 C70 44, 64 48, 60 52 C56 50, 52 50, 50 50 C48 50, 44 50, 40 52 C36 48, 30 44, 28 38 C26 30, 35 24, 32 18 Z"
          fill={color}
        />
        {/* Left & Right Lion Profiles */}
        <path
          d="M26 26 C20 28, 14 36, 18 46 C22 52, 28 54, 34 54 C31 46, 30 38, 32 30 Z"
          fill={color}
          opacity="0.9"
        />
        <path
          d="M74 26 C80 28, 86 36, 82 46 C78 52, 72 54, 66 54 C69 46, 70 38, 68 30 Z"
          fill={color}
          opacity="0.9"
        />
        {/* Central Lion Chest & Mane */}
        <path
          d="M40 32 C43 30, 57 30, 60 32 C62 38, 62 46, 60 52 C55 54, 45 54, 40 52 C38 46, 38 38, 40 32 Z"
          fill="#FFFFFF"
          opacity="0.25"
        />
        {/* Abacus Base Plate */}
        <rect x="18" y="58" width="64" height="6" rx="2" fill={color} />
        {/* Central Ashoka Chakra */}
        <circle cx="50" cy="72" r="9" stroke={color} strokeWidth="2.5" fill="#FFFFFF" />
        <circle cx="50" cy="72" r="2.5" fill={color} />
        {/* 24 Spokes representation */}
        <line x1="50" y1="63" x2="50" y2="81" stroke={color} strokeWidth="1.2" />
        <line x1="41" y1="72" x2="59" y2="72" stroke={color} strokeWidth="1.2" />
        <line x1="43.6" y1="65.6" x2="56.4" y2="78.4" stroke={color} strokeWidth="1.2" />
        <line x1="43.6" y1="78.4" x2="56.4" y2="65.6" stroke={color} strokeWidth="1.2" />
        {/* Galloping Horse (Left) & Bull (Right) on Abacus */}
        <path d="M25 72 C27 68, 31 69, 33 72 C31 74, 27 75, 25 72 Z" fill={color} />
        <path d="M67 72 C69 69, 73 68, 75 72 C73 75, 69 74, 67 72 Z" fill={color} />
        {/* Lower Inverted Lotus Base */}
        <path
          d="M24 82 C32 88, 42 90, 50 90 C58 90, 68 88, 76 82 L78 86 C68 93, 58 95, 50 95 C42 95, 32 93, 22 86 Z"
          fill={color}
        />
        {/* Base Pedestal Line */}
        <rect x="15" y="96" width="70" height="3" rx="1.5" fill={color} />
      </svg>
      {showMotto && (
        <div style={{
          fontSize: '0.62rem',
          fontWeight: '700',
          letterSpacing: '0.04em',
          color: color,
          marginTop: '-2px',
          fontFamily: "'Noto Sans Devanagari', 'Noto Sans', serif",
          textAlign: 'center'
        }}>
          सत्यमेव जयते
        </div>
      )}
    </div>
  );
}

/**
 * Government of Jharkhand Official Circular Seal / Emblem representation
 */
export function JharkhandGovSeal({ size = 46 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Academic Simulation Project Seal (SIH 2026 Prototype - Non-Official)"
      role="img"
    >
      {/* Outer Circle with Saffron/Green Gov Ring */}
      <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#0c4e7e" strokeWidth="3" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="#138808" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#FF9933" strokeWidth="1.5" />
      
      {/* Inner Ring */}
      <circle cx="50" cy="50" r="28" fill="#F5F7FA" stroke="#0c4e7e" strokeWidth="1.5" />
      
      {/* Jharkhand Palas Bloom & Wildlife Motifs representation */}
      <circle cx="50" cy="18" r="3" fill="#B8860B" />
      <circle cx="50" cy="82" r="3" fill="#B8860B" />
      <circle cx="18" cy="50" r="3" fill="#B8860B" />
      <circle cx="82" cy="50" r="3" fill="#B8860B" />
      <circle cx="27" cy="27" r="2.5" fill="#138808" />
      <circle cx="73" cy="27" r="2.5" fill="#138808" />
      <circle cx="27" cy="73" r="2.5" fill="#138808" />
      <circle cx="73" cy="73" r="2.5" fill="#138808" />

      {/* Central Emblem Core */}
      <path
        d="M44 38 C44 34, 56 34, 56 38 C55 45, 53 48, 50 51 C47 48, 45 45, 44 38 Z"
        fill="#0c4e7e"
      />
      <circle cx="50" cy="58" r="5" stroke="#0c4e7e" strokeWidth="1.5" fill="#FFFFFF" />
      <rect x="42" y="66" width="16" height="2.5" fill="#0c4e7e" />
    </svg>
  );
}
