'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

gsap.registerPlugin(useGSAP);

export function RaceIntelligenceMotion() {
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.to('.ri-marquee-track', {
      duration: 32,
      ease: 'none',
      repeat: -1,
      xPercent: -50,
    });
  }, []);

  return null;
}
