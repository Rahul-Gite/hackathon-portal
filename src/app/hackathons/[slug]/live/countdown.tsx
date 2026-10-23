"use client";

import { useEffect, useState } from "react";

export function LiveCountdown({ targetDate }: { targetDate: Date | string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const end = new Date(targetDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, end - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center justify-center p-2 rounded-lg badge-pastel-blue min-w-[50px] shadow-2xs">
        <span className="text-lg font-black leading-none">{String(timeLeft.days).padStart(2, "0")}</span>
        <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 mt-1">Days</span>
      </div>

      <span className="font-bold text-primary">:</span>

      <div className="flex flex-col items-center justify-center p-2 rounded-lg badge-pastel-blue min-w-[50px] shadow-2xs">
        <span className="text-lg font-black leading-none">{String(timeLeft.hours).padStart(2, "0")}</span>
        <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 mt-1">Hours</span>
      </div>

      <span className="font-bold text-primary">:</span>

      <div className="flex flex-col items-center justify-center p-2 rounded-lg badge-pastel-blue min-w-[50px] shadow-2xs">
        <span className="text-lg font-black leading-none">{String(timeLeft.minutes).padStart(2, "0")}</span>
        <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 mt-1">Mins</span>
      </div>

      <span className="font-bold text-primary">:</span>

      <div className="flex flex-col items-center justify-center p-2 rounded-lg badge-pastel-amber min-w-[50px] shadow-2xs">
        <span className="text-lg font-black text-amber-700 dark:text-amber-300 leading-none">
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
        <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 mt-1">Secs</span>
      </div>
    </div>
  );
}
