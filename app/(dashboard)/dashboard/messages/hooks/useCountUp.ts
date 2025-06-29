// hooks/useCountUp.ts
import { useState, useEffect, useRef } from 'react';

/**
 * Hook customizado para animar a contagem de um número de destino.
 *
 * @param targetNumber O número final que a contagem deve atingir.
 * @param duration A duração da animação em milissegundos (padrão: 250ms).
 * @returns O valor atual da contagem animada.
 */
export function useCountUp(targetNumber: number, duration = 250): number {
  const [count, setCount] = useState(0);
  const rafId = useRef<number | null>(null);
  const startTimestamp = useRef<number | null>(null);
  const previousTarget = useRef<number>(targetNumber); // Para evitar reanimação desnecessária

  useEffect(() => {
    // Se o número alvo não mudou, não precisamos reanimar
    if (targetNumber === previousTarget.current) {
      setCount(targetNumber);
      return;
    }

    // Reinicia o timestamp de início para a nova animação
    startTimestamp.current = null;

    function step(timestamp: number) {
      if (!startTimestamp.current) {
        startTimestamp.current = timestamp;
      }

      const progress = timestamp - startTimestamp.current;
      // Garante que o progresso não exceda 1 (100% da duração)
      const progressRatio = Math.min(progress / duration, 1);
      // Calcula o próximo valor da contagem (arredondado para baixo para inteiros)
      const nextCount = Math.floor(progressRatio * targetNumber);
      setCount(nextCount);

      // Continua a animação se o progresso ainda não terminou
      if (progress < duration) {
        rafId.current = requestAnimationFrame(step);
      } else {
        // Garante que o número final seja o alvo exato quando a animação termina
        setCount(targetNumber);
        previousTarget.current = targetNumber; // Atualiza o alvo anterior
      }
    }

    // Inicia a animação
    rafId.current = requestAnimationFrame(step);

    // Função de limpeza para cancelar a animação se o componente for desmontado ou as dependências mudarem
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [targetNumber, duration]); // Dependências: reanima quando targetNumber ou duration mudam

  return count;
}