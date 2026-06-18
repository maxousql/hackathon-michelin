'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import styles from './product-detail.module.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ProductDetailMotion() {
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const imageTargets = gsap.utils.toArray<HTMLElement>(
      `.${styles.motionImage}`,
    );
    imageTargets.forEach((element) => {
      gsap.fromTo(
        element,
        { opacity: 0.72, scale: 0.86, y: 42 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top 92%',
            end: 'top 34%',
            scrub: true,
          },
        },
      );
    });

    gsap.to(`.${styles.marqueeTrack}`, {
      duration: 26,
      ease: 'none',
      repeat: -1,
      xPercent: -50,
    });
  }, []);

  return null;
}
