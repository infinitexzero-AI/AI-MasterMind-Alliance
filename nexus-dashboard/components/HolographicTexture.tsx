import React from 'react';
import styles from '../styles/HolographicTexture.module.css';

interface HolographicTextureProps {
  opacity?: number;
  type?: 'scanlines' | 'grid' | 'dots';
}

export const HolographicTexture: React.FC<HolographicTextureProps> = ({ 
  type = 'scanlines' 
}) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none z-[1] mix-blend-overlay ${styles[type]} ${styles.container}`}
    />
  );
};
