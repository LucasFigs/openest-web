// Tela do celular da cena 3D, desenhada num <canvas> 2D e usada como textura.
// Mostra a interface do Openest "viva": card de match, encontro marcado e uma
// conversa com checks que passam de enviado → entregue → lido.

export const SCREEN_W = 560;
export const SCREEN_H = 1196;

const C = {
  fundo: '#0f0d15',
  superficie: '#1b1824',
  borda: '#2a2636',
  texto: '#f4f3f8',
  texto2: '#a19db0',
  roxo: '#6d28d9',
  roxoClaro: '#a855f7',
  coral: '#fb7185',
  dourado: '#f5b544',
  verde: '#5dd39e',
  azulLido: '#53bdeb',
  bolhaEnviada: '#5b21b6',
  bolhaRecebida: '#221e2c',
};

const FONTE = '"Poppins", system-ui, -apple-system, "Segoe UI", sans-serif';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function coracao(ctx, cx, cy, s, cor) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, 0.35);
  ctx.bezierCurveTo(-0.95, -0.25, -0.45, -1.05, 0, -0.45);
  ctx.bezierCurveTo(0.45, -1.05, 0.95, -0.25, 0, 0.35);
  ctx.fillStyle = cor;
  ctx.fill();
  ctx.restore();
}

function checks(ctx, x, y, estado) {
  // estado: 0 = enviado (1 check), 1 = entregue (2 cinzas), 2 = lido (2 azuis)
  const cor = estado === 2 ? C.azulLido : 'rgba(244,243,248,0.7)';
  ctx.strokeStyle = cor;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const um = (dx) => {
    ctx.beginPath();
    ctx.moveTo(x + dx, y);
    ctx.lineTo(x + dx + 6, y + 6);
    ctx.lineTo(x + dx + 17, y - 7);
    ctx.stroke();
  };
  um(0);
  if (estado > 0) um(9);
}

function texto(ctx, str, x, y, { size = 22, weight = 500, cor = C.texto, align = 'left' } = {}) {
  ctx.font = `${weight} ${size}px ${FONTE}`;
  ctx.fillStyle = cor;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

// Desenha um quadro. `t` em segundos controla as animações.
export function drawPhoneScreen(ctx, t) {
  const W = SCREEN_W;
  const H = SCREEN_H;
  ctx.clearRect(0, 0, W, H);

  // Fundo com leve brilho roxo no topo
  ctx.fillStyle = C.fundo;
  ctx.fillRect(0, 0, W, H);
  const brilho = ctx.createRadialGradient(W * 0.5, -40, 10, W * 0.5, -40, 520);
  brilho.addColorStop(0, 'rgba(109,40,217,0.35)');
  brilho.addColorStop(1, 'rgba(109,40,217,0)');
  ctx.fillStyle = brilho;
  ctx.fillRect(0, 0, W, H);

  // Barra de status
  texto(ctx, '21:30', 44, 62, { size: 22, weight: 600 });
  ctx.fillStyle = C.texto;
  rr(ctx, W - 92, 46, 40, 20, 5);
  ctx.fill();
  ctx.fillStyle = C.fundo;
  rr(ctx, W - 89, 49, 26, 14, 3);
  ctx.fill();
  // Ilha da câmera
  ctx.fillStyle = '#000';
  rr(ctx, W / 2 - 70, 34, 140, 40, 20);
  ctx.fill();

  // Cabeçalho
  texto(ctx, 'Descobrir', 44, 138, { size: 34, weight: 700 });
  ctx.fillStyle = C.superficie;
  rr(ctx, W - 136, 104, 92, 44, 22);
  ctx.fill();
  texto(ctx, 'Filtros', W - 90, 134, { size: 20, weight: 600, align: 'center', cor: C.texto2 });

  // ── Card de match ──────────────────────────────────────────────────
  const cx = 40;
  const cy = 170;
  const cw = W - 80;
  const ch = 520;
  const flutua = Math.sin(t * 1.4) * 4;
  ctx.save();
  ctx.translate(0, flutua);
  rr(ctx, cx, cy, cw, ch, 34);
  ctx.save();
  ctx.clip();
  const foto = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch);
  foto.addColorStop(0, '#4c1d95');
  foto.addColorStop(0.55, '#7c3aed');
  foto.addColorStop(1, '#f472b6');
  ctx.fillStyle = foto;
  ctx.fillRect(cx, cy, cw, ch);
  // "Silhueta" abstrata (sem foto de pessoa real)
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.beginPath();
  ctx.arc(cx + cw / 2, cy + 200, 92, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + cw / 2, cy + 470, 190, 170, 0, Math.PI, 0);
  ctx.fill();
  const sombra = ctx.createLinearGradient(0, cy + ch - 220, 0, cy + ch);
  sombra.addColorStop(0, 'rgba(0,0,0,0)');
  sombra.addColorStop(1, 'rgba(0,0,0,0.78)');
  ctx.fillStyle = sombra;
  ctx.fillRect(cx, cy + ch - 220, cw, 220);
  ctx.restore();

  texto(ctx, 'Marina, 27', cx + 28, cy + ch - 70, { size: 36, weight: 700, cor: '#fff' });
  texto(ctx, 'Perto de você · 2 km', cx + 28, cy + ch - 32, { size: 21, weight: 500, cor: 'rgba(255,255,255,0.85)' });

  // Selo "Deu match" pulsando
  const pulso = 1 + Math.sin(t * 3) * 0.04;
  ctx.save();
  ctx.translate(cx + cw - 104, cy + 52);
  ctx.scale(pulso, pulso);
  ctx.fillStyle = 'rgba(255,255,255,0.94)';
  rr(ctx, -84, -28, 168, 56, 28);
  ctx.fill();
  coracao(ctx, -48, 2, 20, C.coral);
  texto(ctx, 'Deu match', 18, 9, { size: 21, weight: 700, cor: C.roxo, align: 'center' });
  ctx.restore();
  ctx.restore();

  // ── Encontro marcado ───────────────────────────────────────────────
  const ey = 716;
  ctx.fillStyle = C.superficie;
  rr(ctx, 40, ey, W - 80, 118, 24);
  ctx.fill();
  ctx.strokeStyle = C.borda;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(93,211,158,0.16)';
  rr(ctx, 62, ey + 24, 70, 70, 18);
  ctx.fill();
  // ícone calendário com check
  ctx.strokeStyle = C.verde;
  ctx.lineWidth = 4;
  rr(ctx, 78, ey + 40, 38, 38, 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(86, ey + 60);
  ctx.lineTo(94, ey + 68);
  ctx.lineTo(108, ey + 52);
  ctx.stroke();
  texto(ctx, 'Encontro marcado', 152, ey + 52, { size: 25, weight: 700 });
  texto(ctx, 'Sáb · 19:00 · Café no centro', 152, ey + 88, { size: 20, weight: 500, cor: C.texto2 });

  // ── Conversa em tempo real ─────────────────────────────────────────
  const by = 862;
  // recebida
  ctx.fillStyle = C.bolhaRecebida;
  rr(ctx, 40, by, 330, 64, 22);
  ctx.fill();
  texto(ctx, 'Bora no sábado?', 64, by + 41, { size: 23, weight: 500 });

  // enviada com checks animados
  const ciclo = (t % 4.5) / 4.5;
  const estado = ciclo < 0.3 ? 0 : ciclo < 0.6 ? 1 : 2;
  const sx = W - 40 - 300;
  ctx.fillStyle = C.bolhaEnviada;
  rr(ctx, sx, by + 84, 300, 64, 22);
  ctx.fill();
  texto(ctx, 'Sábado sim!', sx + 24, by + 125, { size: 23, weight: 500 });
  texto(ctx, '19:02', sx + 210, by + 125, { size: 16, weight: 500, cor: 'rgba(244,243,248,0.75)' });
  checks(ctx, sx + 258, by + 118, estado);

  // digitando…
  ctx.fillStyle = C.bolhaRecebida;
  rr(ctx, 40, by + 168, 110, 54, 22);
  ctx.fill();
  for (let i = 0; i < 3; i += 1) {
    const fase = Math.max(0, Math.sin(t * 5 - i * 0.7));
    ctx.fillStyle = `rgba(244,243,248,${0.35 + fase * 0.55})`;
    ctx.beginPath();
    ctx.arc(70 + i * 24, by + 195 - fase * 5, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Barra inferior
  ctx.fillStyle = C.superficie;
  rr(ctx, 40, H - 112, W - 80, 72, 36);
  ctx.fill();
  const icones = [C.roxoClaro, C.texto2, C.texto2, C.texto2];
  icones.forEach((cor, i) => {
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(108 + i * ((W - 216) / 3), H - 76, i === 0 ? 11 : 9, 0, Math.PI * 2);
    ctx.fill();
  });
}
