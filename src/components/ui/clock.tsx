import { useState, useEffect } from "react";

export function SteampunkClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showColon, setShowColon] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const colonTimer = setInterval(() => {
      setShowColon(prev => !prev);
    }, 1000); // Blink every second
    
    return () => clearInterval(colonTimer);
  }, []);

  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const day = currentTime.getDate().toString().padStart(2, '0');
  const month = (currentTime.getMonth() + 1).toString().padStart(2, '0');
  const year = currentTime.getFullYear().toString().slice(-2);

  return (
    <div className="relative px-3 py-1.5 rounded-lg border-2 border-emerald-600/60 bg-gradient-to-br from-emerald-950/90 to-emerald-900/80 shadow-[0_0_15px_rgba(16,185,129,0.3),inset_0_1px_2px_rgba(255,255,255,0.1)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.15),transparent_70%)] rounded-lg pointer-events-none" />
      <div className="relative flex flex-col items-center">
        <div className="flex items-center gap-0.5">
          <span className="text-sm font-medhurst font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
            {hours}
          </span>
          <span 
            className={`text-sm font-medhurst font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] transition-opacity duration-100 ${
              showColon ? 'opacity-100' : 'opacity-0'
            }`}
          >
            :
          </span>
          <span className="text-sm font-medhurst font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
            {minutes}
          </span>
        </div>
        <div className="text-[9px] font-medhurst text-emerald-400/70 mt-0.5 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]">
          {day}/{month}/{year}
        </div>
      </div>
    </div>
  );
}
