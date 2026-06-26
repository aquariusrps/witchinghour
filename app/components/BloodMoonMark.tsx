export default function BloodMoonMark({ size = 64 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
    >
      {/*
        Crescent: outer circle (cx=32, cy=32, r=28) minus inner offset circle (cx=42, cy=32, r=24).
        Intersection points: (47.4, 8.62) and (47.4, 55.38).
        Outer arc: CCW large-arc from upper to lower intersection → left body of crescent.
        Inner arc: CW minor arc from lower to upper intersection → concave inner edge.
      */}
      <path
        d="M47.4,8.62 A28,28,0,1,0,47.4,55.38 A24,24,0,0,1,47.4,8.62 Z"
        fill="var(--ember)"
      />
      {/* Cardinal tick marks in gold */}
      <line x1="32" y1="1"  x2="32" y2="5"  stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="59" x2="32" y2="63" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
      <line x1="1"  y1="32" x2="5"  y2="32" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
      <line x1="59" y1="32" x2="63" y2="32" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
