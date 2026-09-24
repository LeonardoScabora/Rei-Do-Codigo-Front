import type { ReactNode } from "react";

function FrameCorner({ className }: { className: string }) {
  return (
    <svg className={className} width="46" height="46" viewBox="0 0 46 46" aria-hidden>
      <path
        d="M2 36 V24 L24 2 H36"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  const d = direction === "left" ? "M10.5 1.5 2 9 10.5 16.5" : "M1.5 1.5 10 9 1.5 16.5";
  return (
    <svg className="rk-menu-entry__chevron" width="12" height="18" viewBox="0 0 12 18" aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function MenuFrame({
  children,
  label,
  nav = false,
}: {
  children: ReactNode;
  label: string;
  nav?: boolean;
}) {
  const inner = (
    <div className="rk-menu-frame">
      <div className="rk-panel rk-panel--menu">{children}</div>
    </div>
  );

  return (
    <div className="rk-menu-shell">
      <FrameCorner className="rk-corner rk-corner--tl" />
      <FrameCorner className="rk-corner rk-corner--tr" />
      <FrameCorner className="rk-corner rk-corner--bl" />
      <FrameCorner className="rk-corner rk-corner--br" />
      {nav ? (
        <nav aria-label={label}>{inner}</nav>
      ) : (
        <div role="region" aria-label={label}>
          {inner}
        </div>
      )}
      <span className="rk-panel__gem" aria-hidden />
    </div>
  );
}

export function MenuBanner({
  children,
  hint,
  icon,
  selected = false,
  hot = false,
  disabled = false,
  chevron = "right",
  tone = "default",
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  children: ReactNode;
  hint?: string;
  icon?: ReactNode;
  selected?: boolean;
  hot?: boolean;
  disabled?: boolean;
  chevron?: "left" | "right";
  tone?: "default" | "danger";
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const classes = [
    "rk-menu-entry",
    selected ? "rk-menu-entry--on" : "",
    hot ? "rk-menu-entry--hot" : "",
    tone === "danger" ? "rk-menu-entry--danger" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className={`rk-menu-entry__face${icon ? "" : " rk-menu-entry__face--plain"}`}>
        {icon && (
          <>
            <span className="rk-menu-entry__icon">{icon}</span>
            <span className="rk-menu-entry__rule" aria-hidden />
          </>
        )}
        <span className="rk-menu-entry__label">
          {children}
          {hint ? <small>{hint}</small> : null}
        </span>
        <Chevron direction={chevron} />
      </span>
    </button>
  );
}
