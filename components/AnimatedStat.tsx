'use client';

import { useEffect, useState } from 'react';

interface AnimatedStatProps {
  value: string | number;
  label: string;
  delayMs?: number;
}

export default function AnimatedStat({ value, label, delayMs = 0 }: AnimatedStatProps) {
  const isNumber = typeof value === 'number';
  const [displayValue, setDisplayValue] = useState(isNumber ? 0 : value);

  useEffect(() => {
    if (isNumber) {
      const duration = 1200; // 1.2 seconds
      const fps = 60;
      const steps = (duration / 1000) * fps;
      const stepTime = 1000 / fps;
      let currentStep = 0;
      let timer: NodeJS.Timeout | null = null;

      const startAnimation = () => {
        timer = setInterval(() => {
          currentStep++;
          const progress = currentStep / steps;
          // Easing function (easeOutQuart) for smoother deceleration
          const easeOut = 1 - Math.pow(1 - progress, 4);
          const currentVal = Math.round((value as number) * easeOut);
          
          if (currentStep >= steps) {
            setDisplayValue(value);
            if (timer) clearInterval(timer);
          } else {
            setDisplayValue(currentVal);
          }
        }, stepTime);
      };

      const delayTimer = setTimeout(startAnimation, delayMs);

      return () => {
        clearTimeout(delayTimer);
        if (timer) clearInterval(timer);
      };
    }
  }, [value, isNumber, delayMs]);

  return (
    <div
      className="flex flex-col gap-1"
      style={{
        animationDelay: `${delayMs}ms`,
        animationFillMode: 'backwards',
      }}
    >
      <span className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
        {displayValue}
      </span>
      <span className="text-xs font-medium text-muted">{label}</span>
    </div>
  );
}
