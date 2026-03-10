import { motion } from 'framer-motion';

interface EnsoButtonProps {
  onClick: () => void;
  label?: string;
  progress?: number; // 0-1 for active session mode
}

const EnsoButton = ({ onClick, label = 'Sit now', progress }: EnsoButtonProps) => {
  const isActive = progress !== undefined;
  
  // Enso brushstroke path - slightly imperfect circle with a gap
  const ensoPath = "M 75 8 C 110 6, 142 28, 148 65 C 154 102, 132 140, 95 148 C 58 156, 20 134, 10 97 C 0 60, 18 22, 55 12";
  
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
          <path
            d={ensoPath}
            fill="none"
            stroke="hsl(40 10% 90% / 0.8)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
