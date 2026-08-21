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

export function usesMeleeChargeAttack(inimigo: Inimigo | null): boolean {
  return isGoblinInimigo(inimigo) || isEsqueletoInimigo(inimigo) || isCavaleiroInimigo(inimigo);
}

export function usesSheetEnemyDeath(inimigo: Inimigo | null): boolean {
  return usesMeleeChargeAttack(inimigo) || isMagoInimigo(inimigo);
}

export function enemyStackClass(inimigo: Inimigo): string {
  const n = inimigo.nome.toLowerCase();
  if (!inimigo.ehRei && n.includes("goblin")) return " rk-enemy-stack--goblin";
  if (!inimigo.ehRei && n.includes("esqueleto")) return " rk-enemy-stack--skeleton";
  if (!inimigo.ehRei && n.includes("cavaleiro")) return " rk-enemy-stack--enemy-knight";
  if (!inimigo.ehRei && n.includes("mago")) return " rk-enemy-stack--mage";
  return "";
}
