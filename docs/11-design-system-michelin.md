# 11. Design System MICHELIN Ride ID

## 11.1 Statut et portée

- Version : 1.0
- Date : 15 juin 2026
- Canaux : web Next.js et application Expo React Native
- Niveau : fondations et composants nécessaires au MVP Ride ID

Ce document rend les chartes MICHELIN directement utilisables par les équipes
design et développement. Il ne remplace pas le Motion Design System, le Brands
Center ou une validation de la Direction de la Communication MICHELIN.

## 11.2 Légende de gouvernance

Chaque règle est classée :

| Statut              | Signification                                                    |
| ------------------- | ---------------------------------------------------------------- |
| `OFFICIEL MICHELIN` | valeur ou règle explicitement présente dans les documents client |
| `DÉCISION RIDE ID`  | choix d'implémentation proposé pour rendre le système cohérent   |
| `À VALIDER`         | dépend d'un asset, d'une licence ou d'une approbation MICHELIN   |

Ordre de priorité :

1. asset ou composant officiel du Motion Design System ;
2. règle officielle de la charte ;
3. décision Ride ID de ce document ;
4. décision ponctuelle documentée dans un ticket.

Une équipe ne doit pas modifier une règle officielle pour résoudre un problème
local. Elle doit d'abord chercher une variante existante ou demander une
validation.

## 11.3 Principes d'expérience

### OFFICIEL MICHELIN

L'expérience doit être :

- centrée sur l'utilisateur ;
- inclusive ;
- fiable et stable ;
- claire et utile ;
- mobile et responsive ;
- accessible au niveau WCAG AA minimum ;
- sobre et éco-conçue ;
- tournée vers l'innovation et le mouvement.

### DÉCISION RIDE ID

L'interface doit faire ressentir :

- la précision technique, sans froideur ;
- le contrôle, sans surcharge ;
- l'énergie, sans agitation ;
- la preuve, sans ton de supériorité ;
- la progression vers une décision claire.

Une page doit répondre à une question principale. Une étape du questionnaire ne
doit pas mélanger plusieurs décisions complexes.

## 11.4 Assets de marque

### Logo

**OFFICIEL MICHELIN**

- utiliser le logo commercial pour Ride ID, qui accompagne une offre de produit
  ou service ;
- utiliser les fichiers officiels ;
- privilégier la version compacte ;
- utiliser la version horizontale seulement si la compacte n'est pas lisible ;
- ne jamais séparer Bibendum, le nom MICHELIN et la ligne de support ;
- ne jamais déformer, recolorer ou reconstruire le logo ;
- conserver sa zone de protection ;
- seul le logo MICHELIN est autorisé dans le header ;
- utiliser une version adaptée au contraste du fond.

**À VALIDER**

- fichiers SVG officiels ;
- taille minimale numérique ;
- valeur exacte de la zone de protection ;
- règles de co-branding pour Ride ID, partenaires et événements.

En attendant les assets, utiliser un emplacement textuel clairement marqué dans
les prototypes. Il est interdit de redessiner le logo.

### Bibendum

**OFFICIEL MICHELIN**

- Bibendum représente la marque, pas un élément décoratif ;
- utiliser uniquement les fichiers du Brands Center ;
- ne jamais le déguiser ou le modifier ;
- le footer utilise la pose « Hello » lorsqu'elle est disponible ;
- le favicon intègre Bibendum ;
- l'icône mobile associe Bibendum et un pictogramme de l'application.

**À VALIDER**

- pose adaptée à Ride ID ;
- favicon officiel ;
- icône d'application officielle au format source vectoriel.

### Style In Motion

**OFFICIEL MICHELIN**

- blanc à contour noir ;
- formes rondes inspirées des tores ;
- aucune ombre ajoutée ;
- usage uniquement pour révéler un bénéfice ou une innovation ;
- validation DCEM obligatoire ;
- « In Motion » ne doit pas être utilisé comme slogan.

**DÉCISION RIDE ID**

Le MVP n'invente aucun motif In Motion. Sans asset validé, l'interface utilise
les couleurs, la photographie et les composants standards.

## 11.5 Couleurs

### Palette officielle

| Token                   | Valeur    | Usage                           | Statut              |
| ----------------------- | --------- | ------------------------------- | ------------------- |
| `brand.blue`            | `#27509B` | marque, lien, action secondaire | `OFFICIEL MICHELIN` |
| `brand.yellow`          | `#FCE500` | accent et CTA selon contexte    | `OFFICIEL MICHELIN` |
| `brand.darkBlue`        | `#00205B` | fond immersif et contraste      | `OFFICIEL MICHELIN` |
| `brand.midnight`        | `#000C34` | fond très sombre                | `OFFICIEL MICHELIN` |
| `brand.responsibleGray` | `#53565A` | texte secondaire et interface   | `OFFICIEL MICHELIN` |
| `brand.committedPurple` | `#582C83` | accent secondaire limité        | `OFFICIEL MICHELIN` |
| `brand.generousGreen`   | `#84BD00` | accent secondaire limité        | `OFFICIEL MICHELIN` |
| `base.white`            | `#FFFFFF` | fond et texte inversé           | `OFFICIEL MICHELIN` |
| `base.black`            | `#000000` | usage contrôlé                  | `OFFICIEL MICHELIN` |

La palette secondaire représente au maximum environ 15 % de la composition.
Elle ne doit pas créer une seconde identité visuelle.

### Tokens sémantiques

| Token               | Valeur    | Usage                  | Statut              |
| ------------------- | --------- | ---------------------- | ------------------- |
| `surface.canvas`    | `#F7F8FA` | arrière-plan principal | `DÉCISION RIDE ID`  |
| `surface.default`   | `#FFFFFF` | carte et formulaire    | `DÉCISION RIDE ID`  |
| `surface.brand`     | `#00205B` | section de marque      | `DÉCISION RIDE ID`  |
| `surface.highlight` | `#FFF9CC` | accent jaune atténué   | `DÉCISION RIDE ID`  |
| `text.primary`      | `#202124` | texte principal        | `DÉCISION RIDE ID`  |
| `text.secondary`    | `#53565A` | texte secondaire       | `OFFICIEL MICHELIN` |
| `text.onBrand`      | `#FFFFFF` | texte sur bleu         | `DÉCISION RIDE ID`  |
| `text.onYellow`     | `#000C34` | texte sur jaune        | `DÉCISION RIDE ID`  |
| `border.default`    | `#D6D8DB` | bordure standard       | `DÉCISION RIDE ID`  |
| `border.strong`     | `#8A8D91` | bordure renforcée      | `DÉCISION RIDE ID`  |
| `state.success`     | `#2E7D32` | succès fonctionnel     | `DÉCISION RIDE ID`  |
| `state.warning`     | `#8A6500` | avertissement          | `DÉCISION RIDE ID`  |
| `state.error`       | `#B3261E` | erreur                 | `DÉCISION RIDE ID`  |
| `state.info`        | `#27509B` | information            | `DÉCISION RIDE ID`  |
| `focus.ring`        | `#27509B` | focus clavier          | `DÉCISION RIDE ID`  |

Les couleurs sémantiques ne sont pas de nouvelles couleurs de marque. Elles
servent uniquement à communiquer un état fonctionnel.

### Combinaisons validées

| Premier plan | Fond      | Ratio approximatif | Usage                      |
| ------------ | --------- | -----------------: | -------------------------- |
| `#000C34`    | `#FCE500` |            14,83:1 | CTA principal              |
| `#00205B`    | `#FCE500` |            12,04:1 | texte de marque sur accent |
| `#FFFFFF`    | `#27509B` |             7,76:1 | action secondaire          |
| `#27509B`    | `#FCE500` |             6,04:1 | lien ou pictogramme        |
| `#53565A`    | `#FFFFFF` |             7,38:1 | texte secondaire           |
| `#202124`    | `#FFFFFF` |            16,10:1 | texte principal            |

Interdictions :

- texte blanc sur jaune : contraste insuffisant ;
- utiliser uniquement une couleur pour indiquer une erreur ou un succès ;
- texte courant vert ou violet sans vérification de contraste ;
- jaune pour de longs paragraphes ;
- noir comme grande couleur de marque, hors besoin fonctionnel validé.

## 11.6 Typographie

### Familles

| Usage                  | Police                                            | Statut              |
| ---------------------- | ------------------------------------------------- | ------------------- |
| H1 et H2               | MICHELIN Unit Titling Black ou Bold               | `OFFICIEL MICHELIN` |
| H3 à H6                | MICHELIN Unit Titling Semi-Bold, Regular ou Light | `OFFICIEL MICHELIN` |
| Corps web et mobile    | Noto Sans                                         | `OFFICIEL MICHELIN` |
| Repli titre sans asset | Noto Sans, poids 800                              | `DÉCISION RIDE ID`  |
| Repli corps            | Arial puis sans-serif système                     | `DÉCISION RIDE ID`  |

**À VALIDER :** fichiers, licence, formats et conditions de diffusion de
MICHELIN Unit Titling.

Tant que ces éléments ne sont pas disponibles, l'application utilise Noto Sans
pour tous les textes. Elle ne télécharge pas une copie non officielle.

### Échelle typographique

| Token            | Mobile | Desktop | Graisse | Interligne | Usage               |
| ---------------- | -----: | ------: | ------: | ---------: | ------------------- |
| `type.display`   |  40 px |   64 px |     800 |       1,00 | accroche marketing  |
| `type.h1`        |  36 px |   52 px |     800 |       1,05 | titre de page       |
| `type.h2`        |  30 px |   40 px |     800 |       1,10 | section principale  |
| `type.h3`        |  24 px |   30 px |     700 |       1,20 | sous-section        |
| `type.h4`        |  20 px |   22 px |     700 |       1,25 | composant important |
| `type.bodyLarge` |  18 px |   20 px |     400 |       1,50 | introduction        |
| `type.body`      |  16 px |   16 px |     400 |       1,50 | texte courant       |
| `type.bodySmall` |  14 px |   14 px |     400 |       1,45 | aide                |
| `type.label`     |  14 px |   14 px |     700 |       1,20 | contrôle            |
| `type.caption`   |  12 px |   12 px |     600 |       1,35 | métadonnée          |

Cette échelle est une `DÉCISION RIDE ID`.

Règles :

- alignement à gauche par défaut ;
- pas de paragraphe entièrement en capitales ;
- capitales autorisées pour un label très court ;
- largeur recommandée d'un paragraphe : 45 à 75 caractères ;
- ne pas descendre sous 12 px ;
- respecter l'agrandissement de texte système ;
- ne pas tronquer une information nécessaire à la décision.

## 11.7 Espacements et dimensions

### Échelle d'espacement

`DÉCISION RIDE ID`, base 4 px :

| Token      | Valeur |
| ---------- | -----: |
| `space.0`  |      0 |
| `space.1`  |   4 px |
| `space.2`  |   8 px |
| `space.3`  |  12 px |
| `space.4`  |  16 px |
| `space.6`  |  24 px |
| `space.8`  |  32 px |
| `space.10` |  40 px |
| `space.12` |  48 px |
| `space.16` |  64 px |
| `space.20` |  80 px |
| `space.24` |  96 px |

Règles :

- espacement interne standard d'un composant : 16 ou 24 px ;
- espacement entre label et contrôle : 8 px ;
- espacement entre champs : 24 px ;
- espacement entre sections : 48 à 80 px ;
- aucune valeur arbitraire si un token répond au besoin.

### Cibles tactiles

- web : minimum 44 x 44 px ;
- iOS : minimum 44 x 44 points ;
- Android : minimum 48 x 48 dp ;
- espacement minimal entre actions voisines : 8 px.

## 11.8 Grille et responsive

### Breakpoints

**OFFICIEL MICHELIN**

| Token           | Largeur |
| --------------- | ------: |
| `breakpoint.xs` |  360 px |
| `breakpoint.sm` |  600 px |
| `breakpoint.md` |  960 px |
| `breakpoint.lg` | 1280 px |
| `breakpoint.xl` | 1920 px |

La grille de référence comporte 12 colonnes avec gouttières.

### Conteneur Ride ID

`DÉCISION RIDE ID`

| Plage          | Marge latérale | Gouttière | Largeur maximale |
| -------------- | -------------: | --------: | ---------------: |
| `< 600 px`     |          16 px |     16 px |           fluide |
| `600-959 px`   |          24 px |     20 px |           fluide |
| `960-1279 px`  |          32 px |     24 px |          1120 px |
| `1280-1919 px` |          48 px |     24 px |          1200 px |
| `>= 1920 px`   |           auto |     32 px |          1440 px |

Règles :

- mobile-first ;
- aucune fonctionnalité absente sur mobile ;
- les formulaires utilisent toute la largeur utile jusqu'à 640 px maximum ;
- un résultat peut passer de 12 colonnes à 7/5 colonnes sur desktop ;
- le contenu principal précède les informations secondaires dans le DOM ;
- une carte ou un graphique lourd n'est chargé qu'après action.

## 11.9 Forme, bordures et élévation

### Rayons

`DÉCISION RIDE ID`

| Token           | Valeur | Usage                   |
| --------------- | -----: | ----------------------- |
| `radius.none`   |      0 | séparation structurelle |
| `radius.small`  |   4 px | badge compact           |
| `radius.medium` |   8 px | champ et bouton         |
| `radius.large`  |  16 px | carte                   |
| `radius.xlarge` |  24 px | bloc éditorial          |
| `radius.full`   | 999 px | puce et indicateur      |

La rondeur sert la lisibilité. Elle ne doit pas imiter le style In Motion ou
Bibendum.

### Bordures

- standard : 1 px `border.default` ;
- focus : 2 px `focus.ring` avec décalage visible ;
- sélection : 2 px `brand.blue` ;
- erreur : 2 px `state.error`.

### Ombres

`DÉCISION RIDE ID`

| Token           | Valeur CSS                      | Usage             |
| --------------- | ------------------------------- | ----------------- |
| `shadow.none`   | `none`                          | défaut            |
| `shadow.low`    | `0 2px 8px rgb(0 12 52 / 8%)`   | carte interactive |
| `shadow.medium` | `0 8px 24px rgb(0 12 52 / 12%)` | menu ou dialogue  |

Les ombres restent rares. Le style In Motion ne reçoit jamais d'ombre.

## 11.10 Iconographie et photographie

### Icônes

**OFFICIEL MICHELIN**

- utiliser Material Design pour l'interface et la navigation ;
- conserver un style cohérent, rempli ou contour ;
- utiliser du vectoriel ;
- associer un tooltip aux icônes sans libellé ;
- faire valider toute nouvelle icône.

**DÉCISION RIDE ID**

- style contour par défaut ;
- tailles : 16, 20, 24 et 32 px ;
- épaisseur visuelle cohérente ;
- icône décorative masquée aux technologies d'assistance ;
- icône fonctionnelle accompagnée d'un nom accessible.

### Photographie

**OFFICIEL MICHELIN**

Les images doivent être réalistes, prises sur le vif, modernes, contrastées et
ancrées dans la vie des personnes. Elles évitent les scènes artificielles,
froides ou dramatiques.

**DÉCISION RIDE ID**

Priorités :

1. pneu en situation réelle sur le terrain ;
2. cycliste et environnement correspondant au segment ;
3. détail technique utile ;
4. équipe, expert ou essayeur lorsque la preuve le nécessite.

Toute image possède dimensions adaptées, texte alternatif pertinent et droit
d'utilisation vérifié.

## 11.11 Mouvement

`DÉCISION RIDE ID`

| Token             |                       Valeur |
| ----------------- | ---------------------------: |
| `motion.fast`     |                       120 ms |
| `motion.standard` |                       200 ms |
| `motion.slow`     |                       320 ms |
| `motion.easing`   | `cubic-bezier(0.2, 0, 0, 1)` |

Règles :

- le mouvement explique un changement d'état ;
- aucune animation obligatoire pour comprendre ;
- respecter `prefers-reduced-motion` ;
- ne pas lancer automatiquement de vidéo ;
- pas d'animation permanente de CTA ;
- chargement par squelette ou indicateur accessible ;
- Style In Motion animé uniquement avec asset validé.

## 11.12 Composants

### Bouton

**OFFICIEL MICHELIN**

- hauteur regular : 48 px ;
- hauteur small : 36 px ;
- couleurs possibles : jaune, bleu, gris, blanc bordé de bleu ;
- états : initial, hover, focus et disabled.

**Variantes Ride ID**

| Variante    | Fond        | Texte    | Bordure | Usage                        |
| ----------- | ----------- | -------- | ------- | ---------------------------- |
| `primary`   | jaune       | midnight | aucune  | action principale unique     |
| `secondary` | bleu        | blanc    | aucune  | action alternative forte     |
| `outline`   | blanc       | bleu     | bleu    | action secondaire            |
| `ghost`     | transparent | bleu     | aucune  | action légère                |
| `danger`    | erreur      | blanc    | aucune  | action destructive confirmée |

Règles :

- un seul bouton `primary` par zone décisionnelle ;
- libellé avec un verbe concret ;
- largeur complète sur petit mobile lorsque nécessaire ;
- indicateur de chargement sans changement brutal de largeur ;
- disabled réservé à une raison compréhensible ;
- ne pas remplacer une explication d'erreur par un bouton disabled.

### Lien

- bleu sur fond clair ;
- soulignement par défaut dans le corps de texte ;
- état hover distinct ;
- focus visible ;
- lien externe annoncé si cela aide l'utilisateur ;
- aucune URL de partenaire non validée.

### Champ de saisie et zone de texte

`DÉCISION RIDE ID`

- hauteur minimale : 48 px ;
- label visible au-dessus ;
- aide avant l'erreur ;
- bordure standard, renforcée au focus ;
- erreur avec icône, texte et couleur ;
- placeholder uniquement comme exemple ;
- compteur lorsque la longueur est limitée ;
- valeur et erreur conservées après échec serveur.

États : default, hover web, focus, filled, disabled, read-only, error, success
si ce dernier apporte une information.

### Select, radios et cases à cocher

- contrôle natif ou composant accessible ;
- zone tactile complète sur le label ;
- une question à choix unique utilise des radios ;
- un select est réservé aux listes longues ;
- une case à cocher exprime un choix indépendant ;
- l'état sélectionné ne dépend pas uniquement de la couleur.

### Slider de répartition terrain

- toujours accompagné d'une valeur numérique ;
- utilisable au clavier et lecteur d'écran ;
- boutons d'ajustement disponibles sur mobile ;
- total visible ;
- normalisation à 100 % soumise à confirmation ;
- une alternative par champs numériques reste disponible.

### Progression Ride ID

- affiche étape courante et nombre total ;
- titre d'étape visible ;
- étapes terminées, courante et à venir distinguées autrement que par couleur ;
- retour vers une étape précédente sans perte ;
- pas de faux pourcentage fondé sur la durée.

### Carte

Variantes :

- `content` : information non interactive ;
- `selectable` : option sélectionnable ;
- `product` : référence et variante ;
- `proof` : fait et source ;
- `action` : prochaine action.

Une carte interactive est entièrement activable au clavier. Elle ne contient
pas plusieurs zones cliquables concurrentes sans nécessité.

### Carte de recommandation

Contenu obligatoire :

- position avant, arrière ou monte unique ;
- gamme et modèle ;
- dimension précise ;
- type de montage ;
- trois raisons principales ;
- niveau de confiance ;
- compromis ;
- éléments à confirmer ;
- CTA retail.

Hiérarchie :

1. configuration ;
2. justification ;
3. vérifications ;
4. conversion.

Le score interne ne doit pas être présenté comme une note scientifique au
consommateur.

### Indicateur de confiance

Libellés : `Élevée`, `Moyenne`, `À confirmer`.

- icône et texte obligatoires ;
- pas de rouge pour une confiance faible ;
- expliquer les données manquantes ;
- proposer une action concrète pour améliorer la confiance.

### Preuve

Une preuve affiche :

- titre court ;
- source ;
- date ou version ;
- périmètre ;
- lien ou détail lorsqu'il est publiable.

Le badge « prouvé » est interdit si la source ne permet pas cette formulation.

### Import GPX

États :

- vide ;
- fichier sélectionné ;
- upload ;
- analyse ;
- succès ;
- erreur récupérable.

Le composant indique :

- caractère facultatif ;
- formats et taille ;
- usage des données ;
- suppression du fichier brut ;
- action alternative « Continuer sans GPX ».

Le glisser-déposer web possède toujours un bouton de sélection. Sur mobile, le
sélecteur de documents est l'action principale.

### Alerte

Variantes : information, succès, avertissement, erreur.

Structure :

- icône ;
- titre facultatif ;
- message ;
- action facultative ;
- fermeture uniquement si l'information n'est pas indispensable.

Une erreur critique reçoit le focus ou est annoncée au lecteur d'écran.

### Header

**OFFICIEL MICHELIN**

- logo MICHELIN ;
- navigation principale ;
- aucun autre logo ;
- actions, recherche ou langue facultatives.

**DÉCISION RIDE ID**

- mobile : logo, titre Ride ID textuel et menu ;
- desktop : logo, navigation, CTA « Créer mon Ride ID » ;
- hauteur cible : 64 px mobile, 80 px desktop ;
- comportement sticky seulement si testé utile ;
- aucune réduction qui rend le logo non conforme.

### Footer

**OFFICIEL MICHELIN**

- copyright avec année courante ;
- confidentialité ;
- mentions légales ;
- cookies ;
- déclaration d'accessibilité ;
- plan du site ;
- Bibendum « Hello » si l'asset officiel est disponible.

Le footer ne doit pas devenir une seconde navigation produit exhaustive.

### Dialogue

- réservé à une décision bloquante ou destructive ;
- titre explicite ;
- focus piégé et rendu au déclencheur ;
- fermeture Escape sur web si non critique ;
- action principale et annulation clairement distinguées ;
- pas de dialogue pour une simple information.

### Chargement et contenu vide

- squelette de dimensions proches du contenu final ;
- texte pour les attentes supérieures à une seconde ;
- pas de clignotement rapide ;
- contenu vide expliquant la cause et la prochaine action ;
- aucune fausse donnée pendant le chargement.

## 11.13 Langage d'interface

### OFFICIEL MICHELIN

Le langage est accessible, simple, conversationnel, direct et énergique. Il :

- part du besoin du client ;
- emploie « vous » ;
- convainc par les faits ;
- utilise des verbes d'action ;
- associe raison et émotion ;
- évite le jargon et le ton souverain ;
- privilégie des phrases souvent comprises entre 8 et 15 mots.

### DÉCISION RIDE ID

| À privilégier                                      | À éviter                                      |
| -------------------------------------------------- | --------------------------------------------- |
| « Trouvez les pneus adaptés à vos sorties. »       | « Découvrez notre solution révolutionnaire. » |
| « Ce pneu privilégie le grip sur terrain meuble. » | « C'est le meilleur pneu du marché. »         |
| « Confirmez votre largeur avant l'achat. »         | « Votre configuration est incorrecte. »       |
| « Ajoutez un parcours pour affiner le résultat. »  | « Uploadez vos data GPX. »                    |
| « Continuer sans GPX »                             | « Passer »                                    |
| « Voir où l'acheter »                              | « Conversion retail »                         |

Les termes techniques comme ETRTO, carcasse ou compound sont accompagnés d'une
explication courte.

## 11.14 Accessibilité

Exigences communes :

- WCAG 2.2 AA cible web ;
- VoiceOver et TalkBack sur mobile ;
- navigation complète au clavier ;
- focus visible ;
- structure de titres logique ;
- labels et instructions persistants ;
- erreurs décrites en texte ;
- contrastes vérifiés ;
- contenu utilisable à 200 % de zoom ;
- texte redimensionnable ;
- ordre de lecture cohérent ;
- alternative aux gestes complexes ;
- réduction du mouvement ;
- aucune information uniquement visuelle.

Les combinaisons de couleur de ce document sont une base, pas un remplacement
des tests sur le composant final.

## 11.15 Implémentation web

Organisation cible :

```text
apps/web/src/
  styles/
    tokens.css
    reset.css
  components/ui/
    button/
    field/
    card/
    alert/
    progress/
  features/
```

Règles :

- tokens CSS dans `tokens.css` ;
- composants génériques dans `components/ui` ;
- composants métier dans `features/<feature>/components` ;
- Noto Sans via `next/font` ;
- MICHELIN Unit Titling via police locale uniquement après réception et
  validation de licence ;
- pas de couleur ou spacing en valeur brute dans un composant si un token
  existe ;
- styles serveur par défaut, JavaScript uniquement pour l'interaction ;
- Storybook ou catalogue de composants à décider selon le temps du pilote.

Exemple de tokens :

```css
:root {
  --brand-blue: #27509b;
  --brand-yellow: #fce500;
  --brand-dark-blue: #00205b;
  --brand-midnight: #000c34;
  --color-canvas: #f7f8fa;
  --color-surface: #ffffff;
  --color-text: #202124;
  --color-text-secondary: #53565a;
  --color-border: #d6d8db;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --radius-medium: 0.5rem;
  --radius-large: 1rem;
}
```

Cet exemple ne doit pas être copié partiellement : la source de vérité finale
sera le fichier de tokens implémenté depuis ce document.

## 11.16 Implémentation mobile

Organisation cible :

```text
apps/mobile/src/
  theme/
    colors.ts
    typography.ts
    spacing.ts
    radius.ts
    index.ts
  components/ui/
  features/
```

Règles :

- valeurs partagées via objets TypeScript immuables ;
- aucun import CSS ;
- tailles adaptées en points/dp ;
- Safe Area respectée ;
- apparence dynamique testée, même si P0 ne propose qu'un thème clair ;
- Noto Sans chargée par le mécanisme Expo validé ;
- police MICHELIN uniquement après réception de l'asset et de sa licence ;
- mêmes noms sémantiques qu'en web ;
- composants visuellement cohérents mais natifs à la plateforme.

Le web et le mobile partagent la sémantique des tokens, pas nécessairement leur
code ni tous leurs composants.

## 11.17 Contrôle qualité d'un écran

Avant validation :

### Marque

- logo officiel et non modifié ;
- palette principale dominante ;
- palette secondaire limitée ;
- typographie officielle ou fallback autorisé ;
- aucun usage In Motion ou Bibendum non validé.

### UX

- objectif de page unique ;
- action principale identifiable ;
- états vide, chargement, erreur et succès ;
- responsive aux cinq breakpoints ;
- parcours utilisable en réseau dégradé si nécessaire.

### Accessibilité

- clavier et lecteur d'écran ;
- focus visible ;
- contraste ;
- zoom et grandes polices ;
- libellés et erreurs ;
- cibles tactiles.

### Contenu

- bénéfice utilisateur avant discours de marque ;
- affirmation sourcée ;
- aucun superlatif absolu ;
- langage direct ;
- termes techniques expliqués.

### Technique

- tokens utilisés ;
- pas de duplication d'un composant existant ;
- poids des médias contrôlé ;
- aucun script tiers inutile ;
- tests adaptés.

## 11.18 Inventaire P0

À implémenter avant les écrans métier :

1. tokens couleur, typographie, spacing, rayon et ombre ;
2. `Button` ;
3. `Link` ;
4. `TextField` et `TextArea` ;
5. `Select`, `RadioGroup`, `Checkbox` ;
6. `Alert` ;
7. `Card` ;
8. `ProgressSteps` ;
9. `LoadingState` et `EmptyState` ;
10. `Header` et `Footer` ;
11. `GpxUpload` ;
12. `RecommendationCard` ;
13. `ConfidenceIndicator` ;
14. `EvidenceReference`.

Un composant ne rejoint le Design System que s'il est réutilisable, documenté,
accessible et testé. Un composant propre à une seule feature reste dans cette
feature.

## 11.19 Éléments à obtenir de MICHELIN

- logo commercial SVG compact et horizontal ;
- versions pour fonds clairs et foncés ;
- favicon officiel ;
- pose Bibendum « Hello » ;
- source de l'icône mobile ;
- fichiers et licence MICHELIN Unit Titling ;
- accès ou export pertinent du Motion Design System ;
- taille minimale et zone de protection numérique du logo ;
- règles validées de co-branding ;
- assets In Motion autorisés ;
- bibliothèque d'images approuvées ;
- validation des tokens Ride ID marqués `DÉCISION RIDE ID`.

## 11.20 Sources

- [`chartes_michelin_digital_communication.md`](../documents_clients/chartes_michelin_digital_communication.md)
- [`language_book_michelin_fr.md`](../documents_clients/language_book_michelin_fr.md)
- [Spécifications web](05-specifications-web-nextjs.md)
- [Spécifications mobile](07-specifications-mobile-react-native.md)
- [Qualité et accessibilité](08-qualite-securite-exploitation.md)
