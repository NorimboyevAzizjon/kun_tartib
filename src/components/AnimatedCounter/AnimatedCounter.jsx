import React, { useEffect, useRef, useState } from 'react';
import './AnimatedCounter.css';

// Animated counter component for statistics
const AnimatedCounter = ({ 
  value, 
  duration = 1000, 
  prefix = '', 
  suffix = '',
  decimals = 0,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);
  const animationRef = useRef(null);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out-cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        previousValue.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formattedValue = decimals > 0 
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue);

  return (
    <span className={`animated-counter ${className}`}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
};

// Progress bar with animation
export const AnimatedProgress = ({ 
  value, 
  max = 100, 
  color = '#667eea',
  height = 8,
  showLabel = false,
  className = ''
}) => {
  const [width, setWidth] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);

  useEffect(() => {
    // Delay for animation
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className={`animated-progress ${className}`}>
      <div 
        className="progress-track" 
        style={{ height: `${height}px` }}
      >
        <div 
          className="progress-fill"
          style={{ 
            width: `${width}%`,
            background: color
          }}
        />
      </div>
      {showLabel && (
        <span className="progress-label">
          <AnimatedCounter value={percentage} suffix="%" />
        </span>
      )}
    </div>
  );
};

// Circular progress with animation
export const AnimatedCircularProgress = ({
  value,
  max = 100,
  size = 100,
  strokeWidth = 8,
  color = '#667eea',
  bgColor = '#e5e7eb',
  showValue = true,
  className = ''
}) => {
  const [progress, setProgress] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className={`animated-circular-progress ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          className="progress-bg"
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className="progress-circle"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%'
          }}
        />
      </svg>
      {showValue && (
        <div className="circular-value">
          <AnimatedCounter value={percentage} suffix="%" />
        </div>
      )}
    </div>
  );
};

// Number with sparkle effect on change
export const SparkleNumber = ({ value, className = '' }) => {
  const [sparkle, setSparkle] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      setSparkle(true);
      const timer = setTimeout(() => setSparkle(false), 600);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <span className={`sparkle-number ${sparkle ? 'sparkle' : ''} ${className}`}>
      <AnimatedCounter value={value} />
    </span>
  );
};

export default AnimatedCounter;
