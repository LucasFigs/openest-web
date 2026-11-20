// Regras do swipe da Descoberta — os MESMOS números do app mobile
// (DiscoveryCard.js), para os dois terem a mesma sensação.

// Fração da largura do card que o arraste precisa passar para completar.
export const SWIPE_RATIO = 0.3;
// Velocidade (px/s) de um "peteleco" que completa mesmo com arraste curto.
export const SWIPE_VELOCITY = 700;
// Duração da saída do card (ms) antes de trocar de perfil.
export const SWIPE_EXIT_MS = 260;
// Rotação máxima (graus) quando o card chega à largura dele.
export const SWIPE_MAX_ROTATION = 12;

// 'like' (direita), 'pass' (esquerda) ou null (volta ao centro com mola).
// A velocidade só vale se o arraste aponta para o mesmo lado: evita gatilho
// invertido em gestos de ida e volta.
export function decidirSwipe(offsetX, velocityX, limiar) {
  const petelecoDireita = velocityX >= SWIPE_VELOCITY && offsetX >= 0;
  const petelecoEsquerda = velocityX <= -SWIPE_VELOCITY && offsetX <= 0;
  if (offsetX >= limiar || petelecoDireita) return 'like';
  if (-offsetX >= limiar || petelecoEsquerda) return 'pass';
  return null;
}
