/** Zoom visual aplicado no `body` (`transform: scale`). Layout CSS continua em 1:1. */
export function readUiZoom(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--ui-zoom").trim();
  const zoom = Number.parseFloat(raw);
  return Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
}

type LayoutBox = {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
};

/** Converte um `getBoundingClientRect` (pixels da tela) para o sistema de layout do palco. */
export function layoutBoxRelativeTo(parent: DOMRect, child: DOMRect, zoom = readUiZoom()): LayoutBox {
  return {
    left: (child.left - parent.left) / zoom,
    top: (child.top - parent.top) / zoom,
    width: child.width / zoom,
    height: child.height / zoom,
    right: (child.right - parent.left) / zoom,
    bottom: (child.bottom - parent.top) / zoom,
  };
}

/**
 * Sobreposição da caixa do inimigo sobre a do cavaleiro.
 * Os sprites de golpe vazam para a esquerda do visual; isso faz o corte encostar.
 * Independente da largura da tela / `--ui-zoom`.
 */
const MELEE_BODY_OVERLAP_PX = 12;

/**
 * Distância CSS `right` para o slot do inimigo ficar no alcance do golpe.
 */
export function measureMeleeStandRight(
  actors: HTMLElement,
  knight: HTMLElement,
  enemy: HTMLElement,
): string {
  const zoom = readUiZoom();
  const actorsRect = actors.getBoundingClientRect();
  const knightBox = layoutBoxRelativeTo(actorsRect, knight.getBoundingClientRect(), zoom);
  const enemyBox = layoutBoxRelativeTo(actorsRect, enemy.getBoundingClientRect(), zoom);

  const visual = enemy.querySelector(".rk-enemy-visual");
  const visualBox =
    visual instanceof HTMLElement
      ? layoutBoxRelativeTo(actorsRect, visual.getBoundingClientRect(), zoom)
      : enemyBox;
  const inset = visualBox.left - enemyBox.left;

  const enemyLeft = knightBox.right - MELEE_BODY_OVERLAP_PX - inset;
  const rightPx = actorsRect.width / zoom - (enemyLeft + enemyBox.width);
  return `${Math.round(rightPx)}px`;
}
