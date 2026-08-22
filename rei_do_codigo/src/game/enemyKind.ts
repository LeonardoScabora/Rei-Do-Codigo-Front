import type { Inimigo } from "../api";

export function isGoblinInimigo(inimigo: Inimigo | null): boolean {
  return Boolean(inimigo && !inimigo.ehRei && inimigo.nome.toLowerCase().includes("goblin"));
}

export function isEsqueletoInimigo(inimigo: Inimigo | null): boolean {
  return Boolean(inimigo && !inimigo.ehRei && inimigo.nome.toLowerCase().includes("esqueleto"));
}

export function isCavaleiroInimigo(inimigo: Inimigo | null): boolean {
  return Boolean(inimigo && !inimigo.ehRei && inimigo.nome.toLowerCase().includes("cavaleiro"));
}

export function isMagoInimigo(inimigo: Inimigo | null): boolean {
  return Boolean(inimigo && !inimigo.ehRei && inimigo.nome.toLowerCase().includes("mago"));
}

export function isReiInimigo(inimigo: Inimigo | null): boolean {
  return Boolean(inimigo?.ehRei);
}

/** Goblin e mago: corpo no chão, cavaleiro atravessa a tela e a coroa carrega o próximo cenário. */
export function usaSaidaComCoroa(inimigo: Inimigo | null): boolean {
  return inimigo?.ordemNoCorredor === 1 || isMagoInimigo(inimigo);
}

export function usesMeleeChargeAttack(inimigo: Inimigo | null): boolean {
  return (
    isGoblinInimigo(inimigo) ||
    isEsqueletoInimigo(inimigo) ||
    isCavaleiroInimigo(inimigo) ||
    isReiInimigo(inimigo)
  );
}

export function usesLongChargeMove(inimigo: Inimigo | null): boolean {
  return isCavaleiroInimigo(inimigo) || isReiInimigo(inimigo);
}

export function usesSheetEnemyDeath(inimigo: Inimigo | null): boolean {
  return usesMeleeChargeAttack(inimigo) || isMagoInimigo(inimigo);
}

export function enemyStackClass(inimigo: Inimigo): string {
  const n = inimigo.nome.toLowerCase();
  if (inimigo.ehRei) return " rk-enemy-stack--king";
  if (n.includes("goblin")) return " rk-enemy-stack--goblin";
  if (n.includes("esqueleto")) return " rk-enemy-stack--skeleton";
  if (n.includes("cavaleiro")) return " rk-enemy-stack--enemy-knight";
  if (n.includes("mago")) return " rk-enemy-stack--mage";
  return "";
}
