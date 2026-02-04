import React, { useEffect, useState } from 'react';
import './Confetti.css';

const Confetti = ({ active, duration = 3000, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    // Generate confetti particles
    const colors = ['#667eea', '#764ba2', '#4CAF50', '#FF9800', '#E91E63', '#00BCD4', '#FFEB3B', '#9C27B0'];
    const shapes = ['square', 'circle', 'triangle'];
    
    const newParticles = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      size: 8 + Math.random() * 8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 20,
      speedX: (Math.random() - 0.5) * 4,
      speedY: 2 + Math.random() * 4,
      delay: Math.random() * 500
    }));

    setParticles(newParticles);

    // Clear after duration
    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [active, duration, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="confetti-container" aria-hidden="true">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`confetti-particle ${particle.shape}`}
          style={{
            '--x': `${particle.x}vw`,
            '--y': `${particle.y}vh`,
            '--color': particle.color,
            '--size': `${particle.size}px`,
            '--rotation': `${particle.rotation}deg`,
            '--speed-x': particle.speedX,
            '--speed-y': particle.speedY,
            '--delay': `${particle.delay}ms`,
            '--rotation-speed': `${particle.rotationSpeed}deg`
          }}
        />
      ))}
    </div>
  );
};

// Hook for easy confetti triggering
export const useConfetti = () => {
  const [isActive, setIsActive] = useState(false);

  const triggerConfetti = () => {
    setIsActive(true);
  };

  const stopConfetti = () => {
    setIsActive(false);
  };

  return { isActive, triggerConfetti, stopConfetti };
};

export default Confetti;
