
/**
 * Gera um delay aleatório entre min e max segundos
 * @param min Segundos mínimos (ex: 20)
 * @param max Segundos máximos (ex: 60)
 */
export function sleepRandom(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1) + min) * 1000;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
