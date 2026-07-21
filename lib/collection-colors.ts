// Cor determinística por coleção — mesma coleção sempre gera a mesma cor,
// e qualquer coleção nova (digitada na hora de criar uma tarefa) já recebe
// uma cor consistente automaticamente, sem precisar editar código nenhum.
function hashHue(nome: string): number {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = (hash * 31 + nome.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

export type ColecaoColor = { bg: string; text: string; bar: string };

export function getColecaoColor(nome: string): ColecaoColor {
  const hue = hashHue(nome || "—");
  return {
    bg: `hsl(${hue}, 70%, 92%)`,
    text: `hsl(${hue}, 70%, 28%)`,
    bar: `hsl(${hue}, 60%, 80%)`,
  };
}
