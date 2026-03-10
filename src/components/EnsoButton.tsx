import { motion } from 'framer-motion';

interface EnsoButtonProps {
  onClick: () => void;
  label?: string;
  progress?: number; // 0-1 for active session mode
}

const EnsoButton = ({ onClick, label = 'Sit now', progress }: EnsoButtonProps) => {
  const isActive = progress !== undefined;
  
  // Hand-drawn dry brush enso — irregular, expressive, with thick/thin variation
  // Simulates a single calligraphic stroke with pressure changes
  const totalLength = 440;
  const dashOffset = isActive ? totalLength * (1 - progress!) : 0;

  return (
    <motion.button
      onClick={onClick}
      className="relative flex h-44 w-44 items-center justify-center focus:outline-none"
      whileTap={{ scale: 0.95, filter: 'brightness(1.1)' }}
      whileHover={{ filter: 'brightness(1.08)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Soft glow behind the ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--accent) / 0.05) 0%, transparent 70%)',
        }}
        animate={!isActive ? {
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.8, 0.4],
        } : undefined}
        transition={{
          duration: 7,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />

      {/* Enso SVG */}
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full"
        animate={!isActive ? {
          scale: [1, 1.025, 1],
        } : undefined}
        transition={{
          duration: 7,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      >
        {isActive ? (
          <>
            <circle
              cx="100" cy="100" r="80"
              fill="none"
              stroke="hsl(var(--muted) / 0.15)"
              strokeWidth="3"
            />
            <circle
              cx="100" cy="100" r="80"
              fill="none"
              stroke="hsl(var(--foreground) / 0.85)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={totalLength}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </>
        ) : (
          <>
            {/* Dry brush texture — outer diffuse edge */}
            <path
              d="M 92 18 C 72 16, 48 26, 34 46 C 18 70, 14 98, 22 122 C 30 148, 52 168, 80 176 C 108 184, 138 176, 158 156 C 176 138, 186 110, 182 84 C 178 58, 162 36, 140 24 C 124 16, 108 14, 98 18"
              fill="none"
              stroke="hsl(var(--foreground) / 0.06)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Mid-weight stroke — main body of the brush */}
            <path
              d="M 92 18 C 72 16, 48 26, 34 46 C 18 70, 14 98, 22 122 C 30 148, 52 168, 80 176 C 108 184, 138 176, 158 156 C 176 138, 186 110, 182 84 C 178 58, 162 36, 140 24 C 124 16, 108 14, 98 18"
              fill="none"
              stroke="hsl(var(--foreground) / 0.55)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Core ink line — darkest, thinnest, varies pressure feel */}
            <path
              d="M 92 18 C 72 16, 48 26, 34 46 C 18 70, 14 98, 22 122 C 30 148, 52 168, 80 176 C 108 184, 138 176, 158 156 C 176 138, 186 110, 182 84 C 178 58, 162 36, 140 24 C 124 16, 108 14, 98 18"
              fill="none"
              stroke="hsl(var(--foreground) / 0.9)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Splatter / dry brush flecks near the heavy press zone */}
            <circle cx="30" cy="58" r="1.2" fill="hsl(var(--foreground) / 0.3)" />
            <circle cx="22" cy="78" r="0.8" fill="hsl(var(--foreground) / 0.2)" />
            <circle cx="18" cy="108" r="1" fill="hsl(var(--foreground) / 0.25)" />
            <circle cx="26" cy="136" r="0.7" fill="hsl(var(--foreground) / 0.15)" />
            {/* Brush entry — heavy loaded point */}
            <circle cx="92" cy="18" r="5" fill="hsl(var(--foreground) / 0.6)" />
            <circle cx="92" cy="18" r="2.5" fill="hsl(var(--foreground) / 0.85)" />
            {/* Brush exit — fading dry tail */}
            <circle cx="98" cy="18" r="2" fill="hsl(var(--foreground) / 0.25)" />
            <circle cx="102" cy="19" r="1" fill="hsl(var(--foreground) / 0.12)" />
            <circle cx="105" cy="20" r="0.5" fill="hsl(var(--foreground) / 0.06)" />
          </>
        )}
      </motion.svg>

      {/* Label */}
      <span className="relative z-10 text-lg font-light tracking-wide text-foreground/80">
        {label}
      </span>
    </motion.button>
  );
};

export default EnsoButton;
