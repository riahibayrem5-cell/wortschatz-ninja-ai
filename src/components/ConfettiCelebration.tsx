import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
}

interface ConfettiCelebrationProps {
  trigger: boolean;
  duration?: number;
}

const COLORS = [
  "hsl(45 90% 55%)",    // Gold
  "hsl(0 70% 50%)",     // Red
  "hsl(45 95% 65%)",    // Light Gold
  "hsl(35 85% 60%)",    // Orange Gold
  "hsl(0 75% 60%)",     // Light Red
];

const ConfettiCelebration = ({ trigger, duration = 3000 }: ConfettiCelebrationProps) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (trigger) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 500,
        size: 6 + Math.random() * 8,
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 rounded-sm animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}ms`,
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiCelebration;
