import { motion } from 'framer-motion';

interface EnsoButtonProps {
  onClick: () => void;
  label?: string;
  progress?: number; // 0-1 for active session mode
}

const EnsoButton = ({ onClick, label = 'Sit now', progress }: EnsoButtonProps) => {
  const isActive = progress !== undefined;
  
  // Enso brushstroke path - organic, calligraphic with varying thickness feel
  const ensoPath = "M 78 10 C 85 7, 98 5, 112 10 C 128 16, 141 30, 148 50 C 155 70, 155 90, 148 110 C 141 130, 126 144, 108 149 C 90 154, 70 152, 54 143 C 38 134, 24 118, 16 98 C 8 78, 8 56, 16 40 C 24 24, 38 14, 52 11";
  
  // Progress version - fuller circle
  const totalLength = 440;
  const dashOffset = isActive ? totalLength * (1 - progress!) : 0;

  return (
    <motion.button
      onClick={onClick}
      className="relative flex h-36 w-36 items-center justify-center focus:outline-none"
      whileTap={{ scale: 0.95, filter: 'brightness(1.1)' }}
      whileHover={{ filter: 'brightness(1.08)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Soft glow behind the ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(40 10% 90% / 0.06) 0%, transparent 70%)',
        }}
        animate={!isActive ? {
          scale: [1, 1.08, 1],
          opacity: [0.6, 1, 0.6],
        } : undefined}
        transition={{
          duration: 6,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />

      {/* Enso SVG ring */}
      <motion.svg
        viewBox="0 0 160 160"
        className="absolute inset-0 h-full w-full"
        animate={!isActive ? {
          scale: [1, 1.03, 1],
        } : undefined}
        transition={{
          duration: 6,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      >
        {isActive ? (
          <>
            {/* Background track */}
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke="hsl(40 10% 90% / 0.08)"
              strokeWidth="3"
            />
            {/* Progress arc */}
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke="hsl(40 10% 90% / 0.85)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={totalLength}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 80 80)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </>
        ) : (
          <>
            {/* Thick brushstroke base for texture */}
            <path
              d={ensoPath}
              fill="none"
              stroke="hsl(40 10% 90% / 0.12)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Main brushstroke - varying width via multiple overlapping strokes */}
            <path
              d={ensoPath}
              fill="none"
              stroke="hsl(40 10% 90% / 0.7)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Thinner inner edge for calligraphic feel */}
            <path
              d={ensoPath}
              fill="none"
              stroke="hsl(40 10% 90% / 0.9)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Tapered start - small dot at the brush entry */}
            <circle cx="78" cy="10" r="3.5" fill="hsl(40 10% 90% / 0.8)" />
            {/* Tapered end - fading tip */}
            <circle cx="52" cy="11" r="1.5" fill="hsl(40 10% 90% / 0.4)" />
          </>
        )}
      </motion.svg>

      {/* Label */}
      <span className="relative z-10 text-lg font-medium tracking-tight text-foreground/90">
        {label}
      </span>
    </motion.button>
  );
};

export default EnsoButton;
