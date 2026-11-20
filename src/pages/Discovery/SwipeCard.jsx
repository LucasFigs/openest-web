// Card arrastável da Descoberta (estilo Tinder), com mouse e toque.
//
// - Arrastar: o card segue o cursor/dedo e gira proporcional ao
//   deslocamento; os selos CURTI / PASSAR aparecem conforme a distância.
// - Soltar depois do limiar (ou com um peteleco): o card voa para fora e
//   `onSwipe(direção)` é chamado quando ele já saiu da tela.
// - Soltar antes: volta ao centro com efeito de mola.
// - Os botões X / ♥ chamam `ref.swipe('pass' | 'like')`: mesma saída animada.
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { animate, motion as Motion, useMotionValue, useTransform } from 'framer-motion';
import { SWIPE_EXIT_MS, SWIPE_MAX_ROTATION, SWIPE_RATIO, decidirSwipe } from './swipe';

const MOLA = { type: 'spring', stiffness: 420, damping: 30 };

const SwipeCard = forwardRef(function SwipeCard({ children, onSwipe, className = '', label }, ref) {
  const cardRef = useRef(null);
  const saindo = useRef(false);
  const [largura, setLargura] = useState(400);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const limiar = Math.max(80, largura * SWIPE_RATIO);
  const rotate = useTransform(x, [-largura, 0, largura], [-SWIPE_MAX_ROTATION, 0, SWIPE_MAX_ROTATION]);
  const curtiOpacity = useTransform(x, [0, limiar], [0, 1]);
  const passarOpacity = useTransform(x, [-limiar, 0], [1, 0]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return undefined;
    const medir = () => setLargura(el.offsetWidth || 400);
    medir();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const voar = (direcao) => {
    if (saindo.current) return;
    saindo.current = true;
    const lado = direcao === 'like' ? 1 : -1;
    const destino = lado * (window.innerWidth / 2 + largura * 1.2);
    animate(x, destino, { duration: SWIPE_EXIT_MS / 1000, ease: 'easeIn' });
    animate(y, y.get() + 30, { duration: SWIPE_EXIT_MS / 1000, ease: 'easeIn' });
    window.setTimeout(() => onSwipe?.(direcao), SWIPE_EXIT_MS);
  };

  useImperativeHandle(ref, () => ({ swipe: voar }));

  const handleDragEnd = (_event, info) => {
    if (saindo.current) return;
    const direcao = decidirSwipe(info.offset.x, info.velocity.x, limiar);
    if (direcao) {
      voar(direcao);
    } else {
      animate(x, 0, MOLA);
      animate(y, 0, MOLA);
    }
  };

  return (
    <Motion.div
      ref={cardRef}
      className={`${className} swipe-card`}
      style={{ x, y, rotate }}
      drag
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      role="group"
      aria-roledescription="card arrastável"
      aria-label={label}
      data-testid="swipe-card"
    >
      {children}
      <Motion.span className="swipe-stamp swipe-stamp--like" style={{ opacity: curtiOpacity }} aria-hidden="true">
        CURTI
      </Motion.span>
      <Motion.span className="swipe-stamp swipe-stamp--pass" style={{ opacity: passarOpacity }} aria-hidden="true">
        PASSAR
      </Motion.span>
    </Motion.div>
  );
});

export default SwipeCard;
