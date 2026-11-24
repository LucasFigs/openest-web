// Se o WebGL falhar (navegador antigo, GPU bloqueada), mostra o fallback
// estático no lugar da cena 3D — a página continua inteira e clicável.
import React from 'react';

export default class SceneBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { falhou: false };
  }

  static getDerivedStateFromError() {
    return { falhou: true };
  }

  componentDidCatch(error) {
    console.warn('Cena 3D indisponível, usando a versão estática:', error?.message || error);
  }

  render() {
    return this.state.falhou ? this.props.fallback : this.props.children;
  }
}
