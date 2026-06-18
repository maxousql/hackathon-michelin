// Déclarations des modules d'images statiques (*.webp, *.png, *.jpg, …).
//
// Next.js fournit ces déclarations via `next-env.d.ts`, mais ce fichier est
// gitignoré et n'est régénéré que par `next dev`/`next build`. Or `pnpm
// typecheck` lance `tsc` seul : en CI (checkout propre, sans build préalable)
// `next-env.d.ts` est absent et les `import … from './image.webp'` échouent
// (« Cannot find module »). On committe donc la référence pour que les imports
// d'images soient toujours typés, build ou non.
/// <reference types="next/image-types/global" />
