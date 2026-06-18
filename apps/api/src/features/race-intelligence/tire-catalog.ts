import type { TireRecommendation } from '@michelin/contracts';

export const TIRE_CATALOG: Record<string, TireRecommendation> = {
  'power-cup-2': {
    id: 'power-cup-2',
    name: 'Power Cup 2',
    line: 'Power',
    description:
      'Le pneu de compétition Michelin par excellence. Conçu pour les courses sur route sèche avec un grip et une légèreté incomparables.',
    imageSlug: 'power-cup-2',
    disciplines: ['Compétition route', 'Cyclosportive'],
    highlights: [
      'Grip exceptionnel sur sec',
      'Ultra léger 175g',
      'Protection 2x2 cross-weave',
    ],
    priceEur: 69.99,
    productUrl:
      'https://www.decathlon.fr/p/pneu-route-michelin-power-cup-2/_/R-p-347876',
  },
  'power-all-season': {
    id: 'power-all-season',
    name: 'Power All Season',
    line: 'Power',
    description:
      'La sécurité par tous les temps. Adhérence optimale sur sol mouillé et sec pour vos sorties entraînement et cyclosportives.',
    imageSlug: 'power-all-season',
    disciplines: ['Entraînement', 'Cyclosportive', 'Toutes saisons'],
    highlights: [
      'Grip mouillé +20%',
      'Résistance anti-crevaison ProTek',
      'Polyvalence maximale',
    ],
    priceEur: 49.99,
    productUrl:
      'https://www.decathlon.fr/p/pneu-route-michelin-power-all-season/_/R-p-328904',
  },
  'power-endurance': {
    id: 'power-endurance',
    name: 'Power Endurance',
    line: 'Power',
    description:
      'La longévité sans compromis. Idéal pour les longues distances avec une protection anti-crevaison renforcée et un maintien constant des performances.',
    imageSlug: 'power-endurance',
    disciplines: ['Longue distance', 'Gran fondo', 'Entraînement intensif'],
    highlights: [
      'Durabilité +60%',
      'ProTek Max 2 couches',
      'Endurance 10 000 km+',
    ],
    priceEur: 54.99,
    productUrl:
      'https://www.decathlon.fr/p/pneu-route-michelin-power-endurance/_/R-p-308394',
  },
  'power-gravel': {
    id: 'power-gravel',
    name: 'Power Gravel',
    line: 'Power',
    description:
      "Né pour l'aventure. Le pneu gravel qui maîtrise aussi bien la route pavée que les chemins techniques, pour repousser vos limites sans frontières.",
    imageSlug: 'power-gravel',
    disciplines: ['Gravel', 'Bikepacking', 'Cyclocross'],
    highlights: [
      'Polyvalence route/gravel',
      'Sculpture légère 700x35',
      'Tubeless compatible',
    ],
    priceEur: 52.99,
    productUrl:
      'https://www.decathlon.fr/p/pneu-gravel-michelin-power-gravel/_/R-p-347791',
  },
  'force-am': {
    id: 'force-am',
    name: 'Force AM',
    line: 'Force',
    description:
      "Taillé pour l'all-mountain. Ce pneu VTT offre un équilibre parfait entre grip latéral, vitesse de roulement et endurance sur tous types de single tracks.",
    imageSlug: 'force-am',
    disciplines: ['All Mountain', 'Trail', 'XC+'],
    highlights: [
      'Grip latéral 360°',
      'Centre de carcasse renforcé',
      'Tubeless Ready',
    ],
    priceEur: 44.99,
    productUrl:
      'https://www.decathlon.fr/p/pneu-vtt-michelin-force-am/_/R-p-347792',
  },
  'force-enduro': {
    id: 'force-enduro',
    name: 'Force Enduro',
    line: 'Force',
    description:
      'Le compagnon des descentes engagées. Grip maximal sur terrain humide et rocheux, protection renforcée contre les impacts pour les riders qui poussent les limites.',
    imageSlug: 'force-enduro',
    disciplines: ['Enduro', 'Descente technique', 'All Mountain+'],
    highlights: [
      'Grip extrême terrain mouillé',
      'Carcasse DH Shield',
      '2,35" protection maximale',
    ],
    priceEur: 56.99,
    productUrl:
      'https://www.decathlon.fr/p/pneu-vtt-michelin-force-enduro/_/R-p-347793',
  },
  'wild-enduro-mh': {
    id: 'wild-enduro-mh',
    name: 'Wild Enduro MH',
    line: 'Wild',
    description:
      'Le monstre de la descente. Sculpture agressive pour les terrains extrêmes, conçu avec les meilleurs riders EWS pour ne jamais perdre le contrôle.',
    imageSlug: 'wild-enduro-mh',
    disciplines: ['Gravity', 'Enduro WC', 'Descente'],
    highlights: [
      'Sculpture Wild EWS',
      'Grip latéral ultime',
      'Hard terrain specialist',
    ],
    priceEur: 62.99,
    productUrl:
      'https://www.decathlon.fr/p/pneu-vtt-michelin-wild-enduro-mh/_/R-p-347794',
  },
};
