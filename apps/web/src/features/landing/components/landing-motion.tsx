'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function LandingMotion() {
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const imageSections = gsap.utils.toArray<HTMLElement>('.gsap-fade-scale');
    imageSections.forEach((element) => {
      gsap.fromTo(
        element,
        { opacity: 0.42, scale: 0.92, y: 42 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top 88%',
            end: 'top 35%',
            scrub: true,
          },
        },
      );
    });

    const words = gsap.utils.toArray<HTMLElement>('.scrub-word');
    gsap.fromTo(
      words,
      { opacity: 0.62, y: 6 },
      {
        opacity: 1,
        y: 0,
        ease: 'none',
        stagger: 0.012,
        scrollTrigger: {
          trigger: '.scrub-copy',
          start: 'top 88%',
          end: 'bottom 56%',
          scrub: true,
        },
      },
    );

    const cards = gsap.utils.toArray<HTMLElement>('.stack-card');
    cards.forEach((card, index) => {
      gsap.fromTo(
        card,
        {
          opacity: index === 0 ? 1 : 0.68,
          scale: 0.94,
          y: 68 + index * 20,
        },
        {
          opacity: 1,
          scale: 1,
          y: index * -12,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            end: 'top 34%',
            scrub: true,
          },
        },
      );
    });

    gsap.to('.marquee-track', {
      duration: 28,
      ease: 'none',
      repeat: -1,
      xPercent: -50,
    });
  }, []);

  return null;
}
