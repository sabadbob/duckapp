// The five hand-drawn growth stages, ported verbatim (path data unchanged) from
// Duck App.dc.html's isS0..isS4 blocks — the "five separate ducks, not one scaled
// blob" redesign from the design chat.

export function DuckStageArt({ stage }: { stage: 0 | 1 | 2 | 3 | 4 }) {
  const common = { width: 360, height: 286, viewBox: '36 46 288 240', style: { display: 'block' } };

  if (stage === 0) {
    return (
      <svg {...common}>
        <line x1="0" y1="250" x2="360" y2="250" stroke="#232323" strokeWidth="2" />
        <ellipse cx="180" cy="250" rx="34" ry="5" fill="#232323" opacity="0.13" />
        <path d="M168 250 L182 250 L175 241 Z M186 250 L200 250 L193 241 Z" fill="#fa8317" />
        <path d="M170 194 l5 -13 l5 11 l5 -13 l5 15 z" fill="#eba76a" />
        <ellipse cx="180" cy="221" rx="45" ry="30" fill="#f2e2b0" stroke="#eba76a" strokeWidth="5" />
        <circle cx="152" cy="226" r="5.5" fill="#f0a878" opacity="0.5" />
        <circle cx="208" cy="226" r="5.5" fill="#f0a878" opacity="0.5" />
        <path d="M174 218 q6 -4 12 0 q-6 11 -12 0 z" fill="#fa8317" />
        <circle cx="165" cy="213" r="4.6" fill="#232323" />
        <circle cx="166.6" cy="211.4" r="1.5" fill="#f7f4ef" />
        <circle cx="195" cy="213" r="4.6" fill="#232323" />
        <circle cx="196.6" cy="211.4" r="1.5" fill="#f7f4ef" />
      </svg>
    );
  }
  if (stage === 1) {
    return (
      <svg {...common}>
        <line x1="0" y1="250" x2="360" y2="250" stroke="#232323" strokeWidth="2" />
        <ellipse cx="180" cy="250" rx="46" ry="5.5" fill="#232323" opacity="0.13" />
        <path d="M160 250 L182 250 L171 240 Z M178 250 L200 250 L189 240 Z" fill="#fa8317" />
        <ellipse cx="128" cy="204" rx="15" ry="23" fill="#f4e2a8" stroke="#eba76a" strokeWidth="6" />
        <ellipse cx="232" cy="204" rx="15" ry="23" fill="#f4e2a8" stroke="#eba76a" strokeWidth="6" />
        <circle cx="180" cy="194" r="54" fill="#f4e2a8" stroke="#eba76a" strokeWidth="6" />
        <circle cx="146" cy="196" r="7" fill="#f0a878" opacity="0.5" />
        <circle cx="214" cy="196" r="7" fill="#f0a878" opacity="0.5" />
        <path d="M168 189 q12 -6 24 0 q-12 14 -24 0 z" fill="#fa8317" />
        <circle cx="159" cy="180" r="6" fill="#232323" />
        <circle cx="161" cy="177.6" r="2" fill="#f7f4ef" />
        <circle cx="201" cy="180" r="6" fill="#232323" />
        <circle cx="203" cy="177.6" r="2" fill="#f7f4ef" />
      </svg>
    );
  }
  if (stage === 2) {
    return (
      <svg {...common}>
        <line x1="0" y1="250" x2="360" y2="250" stroke="#232323" strokeWidth="2" />
        <ellipse cx="180" cy="250" rx="54" ry="6" fill="#232323" opacity="0.13" />
        <path d="M158 250 L180 250 L169 239 Z M180 250 L202 250 L191 239 Z" fill="#fa8317" />
        <circle cx="180" cy="146" r="36" fill="#f7f4ef" stroke="#232323" strokeWidth="6" />
        <ellipse cx="180" cy="204" rx="58" ry="45" fill="#f7f4ef" stroke="#232323" strokeWidth="6" />
        <ellipse cx="180" cy="168" rx="30" ry="12" fill="#f7f4ef" />
        <path d="M170 172 l10 6 l10 -6 l-4 9 l4 9 l-10 -6 l-10 6 l4 -9 z" fill="#232323" />
        <circle cx="152" cy="152" r="7.5" fill="#f0a878" opacity="0.5" />
        <circle cx="208" cy="152" r="7.5" fill="#f0a878" opacity="0.5" />
        <path d="M166 148 q14 -5 28 0 q-14 16 -28 0 z" fill="#fa8317" stroke="#d97a12" strokeWidth="2" />
        <circle cx="162" cy="138" r="5.4" fill="#232323" />
        <circle cx="164" cy="135.8" r="1.9" fill="#f7f4ef" />
        <circle cx="198" cy="138" r="5.4" fill="#232323" />
        <circle cx="200" cy="135.8" r="1.9" fill="#f7f4ef" />
      </svg>
    );
  }
  if (stage === 3) {
    return (
      <svg {...common}>
        <line x1="0" y1="250" x2="360" y2="250" stroke="#232323" strokeWidth="2" />
        <ellipse cx="180" cy="250" rx="62" ry="6.5" fill="#232323" opacity="0.13" />
        <path d="M154 250 L178 250 L166 236 Z M190 250 L214 250 L202 236 Z" fill="#fa8317" />
        <ellipse cx="178" cy="196" rx="56" ry="46" fill="#f7f4ef" />
        <path d="M194 154 l10 6 l10 -6 l-4 9 l4 9 l-10 -6 l-10 6 l4 -9 z" fill="#232323" />
        <ellipse cx="152" cy="200" rx="26" ry="19" fill="#e9e4dc" />
        <circle cx="204" cy="136" r="33" fill="#f7f4ef" />
        <path d="M234 129 L270 141 L234 153 Z" fill="#fa8317" />
        <path d="M238 141 L264 141" stroke="#c96a10" strokeWidth="1.6" />
        <circle cx="216" cy="129" r="12.5" fill="none" stroke="#232323" strokeWidth="2" />
        <path d="M216 141.5 q-4 14 -14 20" stroke="#232323" strokeWidth="1.6" fill="none" />
        <circle cx="216" cy="129" r="5.6" fill="#232323" />
        <circle cx="218.4" cy="126.6" r="2.1" fill="#f7f4ef" />
        <circle cx="196" cy="146" r="7" fill="#f0a878" opacity="0.45" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <line x1="0" y1="250" x2="360" y2="250" stroke="#232323" strokeWidth="2" />
      <ellipse cx="180" cy="250" rx="74" ry="7" fill="#232323" opacity="0.13" />
      <path d="M148 250 L176 250 L162 235 Z M192 250 L220 250 L206 235 Z" fill="#fa8317" />
      <ellipse cx="176" cy="186" rx="68" ry="55" fill="#f7f4ef" />
      <path d="M196 148 l12 7 l12 -7 l-5 11 l5 11 l-12 -7 l-12 7 l5 -11 z" fill="#232323" />
      <ellipse cx="144" cy="190" rx="30" ry="22" fill="#e9e4dc" />
      <circle cx="208" cy="116" r="36" fill="#f7f4ef" />
      <path d="M180 84 h56 v-34 h-40 z" fill="#232323" />
      <path d="M176 84 h64 v7 h-64 z" fill="#232323" />
      <path d="M196 74 h36 v6 h-36 z" fill="#fa8317" />
      <path d="M240 108 L280 121 L240 134 Z" fill="#fa8317" />
      <path d="M244 121 L274 121" stroke="#c96a10" strokeWidth="1.8" />
      <circle cx="220" cy="109" r="14" fill="none" stroke="#232323" strokeWidth="2.2" />
      <path d="M220 123 q-5 17 -17 23" stroke="#232323" strokeWidth="1.8" fill="none" />
      <circle cx="220" cy="109" r="6" fill="#232323" />
      <circle cx="222.6" cy="106.4" r="2.3" fill="#f7f4ef" />
      <circle cx="199" cy="128" r="7.5" fill="#f0a878" opacity="0.45" />
    </svg>
  );
}

// Small duck mark used in TODAY's chat rows (the assistant's "avatar").
export function DuckMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: 'block', flex: 'none' }}>
      <ellipse cx="20" cy="31" rx="14" ry="12" fill="#232323" />
      <circle cx="31" cy="16" r="9" fill="#232323" />
      <path d="M38 12 L48 16.5 L38 21 Z" fill="#fa8317" />
      <circle cx="33" cy="14" r="1.9" fill="#f0ece6" />
    </svg>
  );
}

// Mini duck used in THE FLOCK rows, sized off the parametric growth curve.
export function FlockDuckMark({ geo, fill }: {
  geo: { bRx: number; bRy: number; bCy: number; hCx: number; hCy: number; hR: number; beak: string };
  fill: string;
}) {
  return (
    <svg width="44" height="38" viewBox="0 0 52 46" style={{ display: 'block' }}>
      <line x1="6" y1="44" x2="46" y2="44" stroke="#b8b4ae" strokeWidth="1.5" />
      <g transform="translate(24 44)">
        <ellipse cx="0" cy={geo.bCy} rx={geo.bRx} ry={geo.bRy} fill={fill} />
        <circle cx={geo.hCx} cy={geo.hCy} r={geo.hR} fill={fill} />
        <path d={geo.beak} fill="#fa8317" />
      </g>
    </svg>
  );
}
