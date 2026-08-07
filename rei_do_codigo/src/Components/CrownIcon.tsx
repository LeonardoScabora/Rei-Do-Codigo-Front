type Props = {
  className?: string;
  width?: number;
  height?: number;
};

export default function CrownIcon({ className = "rk-crown", width = 72, height = 52 }: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 72 52"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M6 44 L2 16 L16 28 L24 8 L36 24 L48 8 L56 28 L70 16 L66 44 Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="miter"
        fill="rgba(80,255,140,0.08)"
      />
      <rect
        x="6"
        y="44"
        width="60"
        height="5"
        stroke="currentColor"
        strokeWidth="3"
        fill="rgba(80,255,140,0.08)"
      />
      <circle cx="36" cy="18" r="2.4" fill="currentColor" />
      <circle cx="20" cy="26" r="1.8" fill="currentColor" />
      <circle cx="52" cy="26" r="1.8" fill="currentColor" />
    </svg>
  );
}
