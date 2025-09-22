// hooks/useDebounce.ts

import { useState, useEffect } from 'react';

// Хук, который принимает значение и задержку,
// а возвращает новое значение только после того, как ввод прекратился на указанное время.
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Устанавливаем таймер, который обновит значение после задержки
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Сбрасываем таймер, если значение изменилось (например, пользователь продолжает печатать)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Перезапускаем эффект, только если изменилось значение или задержка

  return debouncedValue;
}