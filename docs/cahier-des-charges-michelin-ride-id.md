# Cahier des charges - MICHELIN Ride ID

## 1. Présentation du projet

### 1.1 Nom de travail

**MICHELIN Ride ID**

Nom de la promesse de service associée : **MICHELIN RideProof**.

### 1.2 Concept directeur

> **Votre terrain a déjà choisi vos pneus.**

Un pneu ne devrait pas être choisi uniquement selon sa réputation ou dans un
catalogue. Il devrait être prescrit à partir du vélo, des parcours, du terrain,
de la météo et des priorités réelles du cycliste.

MICHELIN Ride ID transforme les données de pratique du cycliste en une
configuration de pneus personnalisée, compréhensible, achetable immédiatement
et accompagnée dans le temps.

### 1.3 Vision

Faire de MICHELIN la marque qui comprend le mieux la relation entre un cycliste
et son terrain.

Les concurrents peuvent vendre un excellent pneu. MICHELIN doit proposer un
système complet qui :

- analyse la pratique réelle ;
- prescrit une configuration adaptée ;
- explique et prouve cette recommandation ;
- réduit le risque lié au changement de marque ;
- accompagne le pneu après son achat ;
- simplifie son renouvellement et sa fin de vie.

### 1.4 Problématique client

MICHELIN est une marque reconnue dans la mobilité, mais elle n'est pas encore un
choix naturel sur le marché du pneu vélo.

Le marché présente actuellement un cercle défavorable :

1. faible demande spontanée pour MICHELIN ;
2. faible intérêt des revendeurs ;
3. disponibilité et visibilité limitées ;
4. nouvelle baisse de la demande.

La solution doit donc créer de la préférence, convertir cette préférence en
ventes dans les 6 à 12 mois et produire des signaux de demande utiles aux
revendeurs.

## 2. Objectifs

### 2.1 Objectif principal

Augmenter le nombre de paires de pneus MICHELIN effectivement vendues grâce à
une expérience digitale personnalisée reliée à l'e-retail et au retail
physique.

### 2.2 Objectifs secondaires

- Donner une raison claire de choisir MICHELIN plutôt qu'une marque concurrente.
- Simplifier le choix parmi les nombreuses références du catalogue.
- Faire connaître les preuves techniques MICHELIN sans jargon inutile.
- Réduire la peur de quitter une marque déjà connue.
- Développer les ventes chez les e-retailers partenaires.
- Générer des demandes de montage et de stock chez les vélocistes.
- Créer une relation utile après l'achat.
- Collecter des données anonymisées sur les pratiques et la demande.
- Préparer un programme traçable de collecte des pneus usagés.

### 2.3 Indicateur principal

**Nombre incrémental de paires de pneus MICHELIN vendues.**

Les autres indicateurs servent à expliquer ou améliorer cette performance.

## 3. Proposition de valeur

### 3.1 Promesse consommateur

> MICHELIN analyse votre pratique, prescrit la configuration adaptée à vos
> parcours et vous accompagne de la première sortie au remplacement du pneu.

### 3.2 Réponse à la question « Pourquoi MICHELIN ? »

MICHELIN ne doit pas affirmer être systématiquement meilleur que Continental,
Schwalbe ou Vittoria sur tous les critères.

La différence proposée est la suivante :

> **Un concurrent vend un pneu reconnu. MICHELIN prescrit, explique et
> accompagne la configuration qui correspond à vos terrains.**

Cette différence s'appuie sur :

- une gamme couvrant route, gravel, VTT, ville, cargo et vélo électrique ;
- des choix précis selon le terrain et le niveau de pratique ;
- les technologies MICHELIN Gum-X, Magi-X et Shield ;
- l'expérience de la compétition et des UCI Mountain Bike World Series ;
- l'héritage MICHELIN dans la compréhension des routes et des déplacements ;
- un engagement de service qui réduit le risque du changement de marque.

### 3.3 Piliers de l'offre

1. **Connaître** : comprendre les parcours et la pratique.
2. **Prescrire** : recommander une configuration et non une liste de produits.
3. **Prouver** : expliquer la recommandation par des faits.
4. **Équiper** : rendre l'achat et le montage immédiats.
5. **Accompagner** : conseiller pendant la durée de vie du pneu.
6. **Renouveler** : anticiper le remplacement et organiser la reprise.

## 4. Cibles

### 4.1 Cibles prioritaires du lancement

#### Passionate Cyclists

- Pratique régulière et forte implication.
- VTT, route et gravel.
- Sensibles aux performances, aux tests et aux recommandations.
- Recherche d'information principalement digitale.
- Participation fréquente à des clubs ou événements, surtout en VTT.

#### Cyclist Lovers

- Segment important parmi les consommateurs à forte valeur.
- Recherche de durabilité, robustesse, confort et protection.
- Sensibilité au rapport qualité-prix et aux avis.

### 4.2 Cibles d'extension

#### Lifestyle Touring Explorers

- Longues distances et exploration.
- Besoin de robustesse, longévité et résistance à la crevaison.
- Recherche fortement digitale mais achat encore majoritairement physique.

#### Lifestyle Urban Ambassadors

- Usage urbain régulier et vélo électrique possible.
- Besoin de sécurité, durabilité et fiabilité.
- Sensibilité aux produits plus responsables et aux services pratiques.

### 4.3 Principe de ciblage

Le catalogue et le moteur peuvent couvrir toutes les pratiques. La campagne
d'acquisition ne doit pas parler à tout le monde avec le même message.

Le lancement recommandé cible d'abord le **VTT et le gravel**, où :

- la recommandation par terrain apporte une forte valeur ;
- les montages avant et arrière peuvent être différenciés ;
- MICHELIN dispose d'une crédibilité liée à la compétition ;
- les clubs, événements et créateurs spécialisés sont structurants.

## 5. Écosystème de la solution

### 5.1 Site web

Le site est le point d'entrée principal et obligatoire.

Il doit être :

- responsive et conçu mobile-first ;
- accessible au minimum au niveau WCAG AA ;
- multilingue par conception ;
- conforme à la charte digitale MICHELIN ;
- éco-conçu ;
- hébergé sous une URL appartenant à MICHELIN dans le cadre d'une mise en
  production réelle ;
- utilisable sans création de compte pour obtenir une première recommandation.

### 5.2 Expérience mobile

Le service doit fonctionner intégralement dans un navigateur mobile.

Une PWA peut apporter :

- ajout à l'écran d'accueil ;
- accès rapide au passeport ;
- notifications d'entretien ;
- consultation des recommandations avant une sortie.

Une application native peut être envisagée après validation de l'usage. Elle
n'est pas nécessaire pour démontrer le MVP.

### 5.3 API et données

L'API doit centraliser :

- le catalogue MICHELIN ;
- les règles de recommandation ;
- les profils Ride ID ;
- les parcours importés ;
- les preuves et contenus associés aux produits ;
- les liens marchands ;
- les événements et partenaires ;
- les données de suivi du passeport.

Les payloads partagés appartiennent à `packages/contracts`. Le comportement HTTP
partagé appartient à `packages/api-client`.

## 6. Parcours utilisateur principal

### 6.1 Découverte

L'utilisateur arrive depuis :

- une campagne sociale ;
- un influenceur ou un athlète ;
- un événement RideProof ;
- un QR code en magasin ;
- une page e-retailer ;
- un résultat de recherche ;
- une recommandation d'un autre cycliste.

L'accroche doit poser une question concrète :

> **Vos pneus sont-ils vraiment faits pour vos parcours ?**

CTA principal : **Créer mon Ride ID**.

### 6.2 Création du Ride ID

Deux modes doivent être proposés.

#### Mode rapide

Questions courtes :

- type de vélo ;
- dimensions actuelles ;
- terrain dominant ;
- fréquence ;
- conditions habituelles ;
- priorité principale ;
- montage actuel ;
- vélo électrique ou non.

#### Mode connecté

L'utilisateur peut :

- importer un fichier GPX ;
- connecter un service compatible, sous réserve d'accord et de faisabilité ;
- sélectionner plusieurs parcours représentatifs.

Les intégrations Strava, Garmin ou Komoot constituent des pistes de partenariat,
pas des dépendances obligatoires du MVP.

### 6.3 Analyse

Le moteur produit un profil synthétique :

- répartition des surfaces ;
- dénivelé ;
- distances habituelles ;
- fréquence ;
- conditions météo estimées ou déclarées ;
- niveau de sollicitation ;
- priorité dominante ;
- contraintes de compatibilité.

Exemple :

```text
47 % terrain compact
31 % terrain mixte
22 % route

Priorité : contrôle et résistance
```

### 6.4 Prescription

Le résultat ne doit pas afficher une longue liste.

Il présente :

- une recommandation principale ;
- une alternative plus accessible ou orientée vers une autre priorité ;
- une configuration avant/arrière lorsque cela est pertinent ;
- les dimensions compatibles ;
- le type de montage ;
- trois bénéfices maximum ;
- les technologies qui soutiennent ces bénéfices ;
- les limites ou conditions d'utilisation ;
- un niveau de confiance de la recommandation.

### 6.5 Comparaison avec le pneu actuel

La fonctionnalité **Challenge mon pneu** permet de renseigner la marque et le
modèle actuels.

La comparaison doit :

- porter sur le besoin déclaré du cycliste ;
- éviter toute affirmation générale non prouvée ;
- distinguer données techniques, tests indépendants et appréciations ;
- citer les sources et dates des résultats ;
- expliquer dans quels cas le concurrent peut rester pertinent.

Cette transparence renforce la crédibilité de la prescription.

### 6.6 Conversion

Chaque recommandation doit proposer :

- **Acheter en ligne** ;
- **Réserver chez un vélociste** ;
- **Faire monter près de chez moi**.

Le lien doit cibler la référence et la dimension exactes.

Le stock ne doit jamais être annoncé sans donnée fournie par le partenaire.

### 6.7 Après l'achat

L'utilisateur active son **RideProof Passport** :

- produit et dimension ;
- date de montage ;
- vélo associé ;
- pression de référence ;
- kilométrage estimé ;
- rappels d'entretien ;
- historique des conseils ;
- date ou niveau d'usure estimé ;
- preuve de reprise en fin de vie.

## 7. Fonctionnalités

### 7.1 Fonctionnalités indispensables au MVP

- Catalogue structuré à partir du fichier produit 2026.
- Recherche par dimensions et compatibilité.
- Questionnaire Ride ID.
- Import manuel d'un fichier GPX.
- Moteur de recommandation explicable.
- Résultat avec une recommandation principale et une alternative.
- Configuration avant/arrière pour les pratiques concernées.
- Comparaison simple avec le pneu actuel.
- Liens vers des références e-retail exactes.
- Carte ou liste de vélocistes pilotes.
- Création d'un passeport après achat simulé ou déclaré.
- Tableau de bord des KPI du funnel.
- Back-office minimal pour gérer produits, règles, preuves et liens partenaires.

### 7.2 Fonctionnalités de phase 2

- Connexion Strava, Garmin ou Komoot.
- Analyse de plusieurs parcours.
- Recommandation dynamique selon la météo.
- Pression conseillée avant une sortie.
- Reconnaissance de la dimension par photographie du flanc.
- Données de stock transmises par les e-retailers.
- Réservation de montage.
- Notifications PWA ou mobiles.
- Avis après 100, 300 et 500 km.
- Programme de garantie ou d'échange RideProof.

### 7.3 Fonctionnalités de phase 3

- Modèle amélioré par les retours de pratique.
- Estimation de l'usure.
- Carte communautaire des terrains.
- Parcours labellisés RideProof.
- Gestion complète de la reprise et de sa traçabilité.
- Expérience dédiée aux flottes et vélos de fonction.
- API ou widgets de recommandation intégrables chez les retailers.

## 8. Moteur de recommandation

### 8.1 Entrées

- discipline ;
- vélo ;
- dimensions ETRTO ;
- type de jante ;
- tubeless ou chambre à air ;
- compatibilité E-25 ou E-50 ;
- terrain ;
- météo ;
- fréquence ;
- distance ;
- niveau de pratique ;
- priorité ;
- montage avant ou arrière.

### 8.2 Données catalogue disponibles

Le catalogue 2026 fournit notamment :

- type de produit ;
- cycle et segment ;
- gamme ;
- dimensions ;
- poids ;
- type de jante ;
- montage ;
- TPI ;
- pression minimale et maximale ;
- étanchéité ;
- terrains ;
- usages ;
- technologies de gomme ;
- technologies de carcasse et de renfort ;
- compatibilité e-bike.

### 8.3 Sorties

- produit et référence recommandés ;
- dimension ;
- montage avant/arrière ;
- justification ;
- bénéfice prioritaire ;
- précautions de compatibilité ;
- alternative ;
- lien d'achat.

### 8.4 Exigence d'explicabilité

Chaque recommandation doit pouvoir répondre à :

> Pourquoi ce pneu est-il recommandé pour moi ?

Le système ne doit pas fonctionner comme une boîte noire. Les règles de
compatibilité et les principaux facteurs du score doivent être visibles.

### 8.5 Sécurité

Les conseils de pression doivent respecter :

- les limites du pneu ;
- les limites de la jante ;
- les spécificités hooked et hookless ;
- les recommandations du fabricant du vélo et des roues.

Les résultats doivent être présentés comme des recommandations et non comme une
substitution aux consignes de sécurité des fabricants.

## 9. Programme RideProof

### 9.1 Objectif

Réduire le risque perçu lors du passage d'une marque concurrente à MICHELIN.

### 9.2 Garantie envisagée

> Roulez pendant une période définie. Si la prescription ne correspond pas à
> votre pratique, échangez-la selon les conditions du programme.

Les modalités doivent être validées par MICHELIN :

- durée ;
- kilométrage ;
- produits éligibles ;
- preuve d'achat ;
- état accepté ;
- prise en charge logistique ;
- responsabilité du retailer.

La garantie est un élément stratégique du concept, mais ne doit pas être
annoncée publiquement avant validation juridique et commerciale.

### 9.3 Reprise

Le programme peut accepter les pneus vélo usagés de toutes marques afin de
faciliter la conquête de nouveaux clients.

Toute promesse environnementale exige :

- un partenaire de collecte ;
- une filière de traitement identifiée ;
- une traçabilité ;
- une terminologie exacte entre réemploi, recyclage, valorisation et destruction ;
- des résultats publiables.

Sans ces éléments, la communication doit parler de **collecte expérimentale** et
non de recyclage circulaire.

## 10. Campagne de lancement

### 10.1 Concept

**Bring Your Tires**

> Apportez vos pneus préférés. Donnez-nous votre parcours. À MICHELIN de vous
> convaincre de changer.

### 10.2 Principe

Des cyclistes, créateurs et athlètes utilisent leur équipement habituel, puis
testent la prescription MICHELIN sur leurs vrais parcours.

Le protocole :

1. création du Ride ID ;
2. description du problème ou de la priorité ;
3. mesure de la configuration actuelle ;
4. prescription MICHELIN ;
5. test pendant une durée ou une distance définie ;
6. publication du résultat, y compris des limites ;
7. CTA vers la même prescription.

### 10.3 Preuve collective

**One Million Proof Kilometers**

Objectif : cumuler un million de kilomètres documentés avec les configurations
Ride ID.

Le site peut afficher :

- kilomètres parcourus ;
- nombre de cyclistes ;
- terrains rencontrés ;
- configurations testées ;
- avis recueillis ;
- pneus concurrents remplacés ;
- incidents déclarés ;
- pneus collectés.

Les chiffres doivent provenir de données vérifiables et expliquer leur méthode
de calcul.

## 11. Événement signature

### 11.1 MICHELIN Unknown Ride

Les participants connaissent la discipline et la distance, mais découvrent le
parcours complet tardivement.

MICHELIN analyse le tracé et prescrit une configuration adaptée à chaque
participant.

Le concept démontre la promesse :

> **Lire le terrain avant de choisir le pneu.**

### 11.2 Déclinaisons

- Unknown Gravel ;
- Unknown MTB ;
- Unknown Road ;
- Unknown Night Ride en ville ;
- Unknown Commute pour les entreprises.

### 11.3 Conversion sur place

L'événement doit permettre :

- diagnostic du vélo ;
- contrôle des dimensions ;
- création du Ride ID ;
- montage pilote ;
- test ;
- achat par QR code ;
- réservation chez un partenaire ;
- collecte expérimentale des anciens pneus.

Chaque événement doit être mesuré comme un canal de vente.

## 12. Influence et contenus

### 12.1 Profils recherchés

- mécaniciens et experts techniques ;
- testeurs indépendants ;
- créateurs VTT, gravel, route et vélotaf ;
- micro-influenceurs locaux ;
- athlètes et équipes partenaires ;
- responsables de clubs.

### 12.2 Ligne éditoriale

Les contenus doivent partir d'un usage :

> Mon terrain, mon problème, mon ancienne configuration, la prescription
> MICHELIN et mon verdict.

Le discours doit :

- utiliser des faits et des preuves ;
- rester simple et conversationnel ;
- exprimer la passion sans arrogance ;
- éviter les affirmations absolues comme « meilleur pneu » ;
- conduire vers un produit et un CTA précis.

### 12.3 Attribution

Chaque partenaire de contenu doit disposer :

- d'un lien identifié ;
- d'une campagne attribuable ;
- d'un Ride ID préconfiguré si pertinent ;
- d'un code ou avantage mesurable ;
- d'un suivi des ventes générées.

## 13. Partenariats envisagés

### 13.1 Données et parcours

- Strava ;
- Garmin ;
- Komoot ;
- fournisseurs de données météo et cartographiques.

### 13.2 Preuve sportive

- UCI Mountain Bike World Series ;
- équipes déjà partenaires de MICHELIN ;
- clubs et organisateurs de courses gravel ou VTT.

### 13.3 Conversion

- un ou deux e-retailers pilotes ;
- un réseau limité de vélocistes ;
- des ateliers mobiles.

### 13.4 Fin de vie

- acteur industriel capable de traiter les pneus vélo ;
- opérateur logistique ;
- partenaire de traçabilité.

### 13.5 Principe de sélection

Un partenariat doit apporter au moins un des éléments suivants :

- données ;
- preuve ;
- audience qualifiée ;
- disponibilité produit ;
- montage ;
- collecte ;
- mesure des ventes.

Un partenariat de visibilité sans parcours de conversion n'est pas prioritaire.

## 14. Architecture des contenus

Le site doit comporter au minimum :

1. Accueil et promesse.
2. Création du Ride ID.
3. Résultat et prescription.
4. Challenge mon pneu.
5. Fiches produits simplifiées.
6. Acheter ou faire monter.
7. RideProof Passport.
8. Proof Kilometers.
9. Événements.
10. Méthodologie et sources.
11. Partenaires.
12. Aide, sécurité et mentions légales.

## 15. Exigences UX et marque

### 15.1 Principes

- Partir du problème du cycliste.
- Présenter une décision simple.
- Limiter le jargon.
- Afficher une action principale par écran.
- Montrer les bénéfices avant les noms de technologies.
- Utiliser les preuves au moment où elles rassurent.
- Ne pas obliger à créer un compte avant la recommandation.

### 15.2 Identité MICHELIN

- Respect des couleurs et typographies officielles.
- Logo commercial pour l'offre.
- Noto Sans recommandée pour les corps de texte web.
- Utilisation des composants du Motion Design System lorsque disponibles.
- Utilisation de Bibendum et du style In Motion uniquement selon les règles et
  validations prévues.
- CTA clairement identifiables.

### 15.3 Accessibilité

- Niveau WCAG AA minimum.
- Navigation clavier.
- Contrastes conformes.
- Alternatives textuelles.
- Libellés explicites.
- États de focus visibles.
- Contenu utilisable sans animation.

### 15.4 Éco-conception

- Pages légères.
- Images optimisées.
- Vidéos non chargées automatiquement.
- Collecte minimale de données.
- Architecture proportionnée au besoin.
- Mesure de l'impact et des performances.

## 16. Exigences de données et conformité

### 16.1 Données personnelles

Le service peut traiter :

- compte utilisateur ;
- vélo ;
- parcours et localisation ;
- historique de sorties ;
- achats et produits ;
- préférences ;
- données de passeport.

Il doit prévoir :

- consentement explicite pour les connexions externes ;
- finalités clairement présentées ;
- suppression et export des données ;
- durée de conservation ;
- politique de confidentialité ;
- limitation de la précision des données lorsque possible.

Les données de localisation et d'activité ne doivent pas être utilisées à des
fins publicitaires sans consentement dédié.

### 16.2 Sources et preuves

Chaque affirmation comparative doit enregistrer :

- la source ;
- la date ;
- le protocole ;
- le produit et la dimension testés ;
- les conditions ;
- les limites de la comparaison.

### 16.3 Données partenaires

Les prix, stocks et délais restent la responsabilité de leur fournisseur.

Le site doit :

- afficher la date de mise à jour ;
- gérer les données absentes ou expirées ;
- ne pas inventer une disponibilité ;
- permettre de désactiver rapidement un lien obsolète.

## 17. Mesure de performance

### 17.1 Acquisition

- visiteurs qualifiés ;
- coût par visite ;
- origine des visiteurs ;
- performance par partenaire et contenu.

### 17.2 Engagement

- taux de démarrage du Ride ID ;
- taux de complétion ;
- import GPX ;
- utilisation de Challenge mon pneu ;
- consultation des preuves.

### 17.3 Conversion

- clics vers les produits ;
- ajout au panier transmis par les partenaires si disponible ;
- ventes par SKU ;
- paires vendues ;
- chiffre d'affaires attribué ;
- réservations de montage ;
- coupons utilisés ;
- taux de conversion par recommandation.

### 17.4 Conquête et fidélisation

- marque de pneu remplacée ;
- part de nouveaux clients MICHELIN ;
- activation du passeport ;
- avis après usage ;
- deuxième achat ;
- délai entre recommandation et achat.

### 17.5 Retail

- demandes par zone ;
- références les plus prescrites ;
- ventes par magasin ;
- évolution du stock ;
- nouveaux vélocistes partenaires.

## 18. Roadmap indicative

### Phase 0 - Validation

- Valider la promesse et le nom.
- Sélectionner les produits pilotes.
- Définir les règles de recommandation avec les experts MICHELIN.
- Sécuriser un e-retailer et plusieurs vélocistes.
- Valider juridiquement les comparaisons et la garantie.
- Identifier une filière de collecte réaliste.

### Phase 1 - MVP hackathon

- Site web responsive.
- Catalogue normalisé.
- Ride ID rapide.
- Import GPX.
- Prescription explicable.
- Comparaison illustrative.
- Parcours d'achat simulé ou liens partenaires.
- Passeport simplifié.
- Démonstration du compteur Proof Kilometers.

### Phase 2 - Pilote commercial

- Produits VTT et gravel prioritaires.
- Données e-retail réelles.
- Campagne Bring Your Tires.
- Premiers influenceurs.
- Événement Unknown Ride.
- Mesure des ventes.
- Expérimentation de la garantie et de la collecte.

### Phase 3 - Déploiement

- Extension route.
- Extension ville et VAE.
- Connexions aux plateformes partenaires.
- Personnalisation météo.
- Widgets pour les retailers.
- Déploiement international.

## 19. Risques et points de vigilance

### 19.1 Absence de supériorité universelle

La solution ne doit pas reposer sur une affirmation impossible à démontrer.
Elle doit défendre la pertinence de la prescription.

### 19.2 Qualité de la recommandation

Une prescription incorrecte peut dégrader la confiance et présenter un risque
de sécurité. Les règles doivent être validées par des experts.

### 19.3 Dépendance aux partenaires

Les fonctions de connexion, stock, vente, montage et collecte dépendent de tiers.
Le MVP doit rester démontrable sans intégration complète.

### 19.4 Promesse environnementale

Schwalbe dispose déjà d'un programme structuré de recyclage. MICHELIN ne doit pas
revendiquer une circularité sans filière et résultats vérifiables.

### 19.5 Effet gadget

Le Ride ID ne doit pas être un quiz marketing. Il doit modifier la recommandation
et expliquer précisément pourquoi.

### 19.6 Complexité

Le catalogue contient de nombreuses variantes. L'utilisateur ne doit jamais
supporter cette complexité.

## 20. Critères d'acceptation du MVP

Le MVP est considéré comme réussi si :

1. un utilisateur peut obtenir une prescription sans compte ;
2. le résultat correspond à une référence réelle du catalogue 2026 ;
3. les dimensions incompatibles sont exclues ;
4. la recommandation affiche une justification compréhensible ;
5. une alternative pertinente est présentée ;
6. un parcours GPX peut influencer le résultat ;
7. le CTA pointe vers la bonne référence ou simule clairement cette étape ;
8. l'expérience est utilisable sur mobile et ordinateur ;
9. les principales pages respectent WCAG AA ;
10. les événements clés du funnel sont mesurables ;
11. aucune promesse comparative ou environnementale non prouvée n'est affichée ;
12. la démonstration relie acquisition, prescription, achat et suivi.

## 21. Synthèse

MICHELIN Ride ID ne doit pas être présenté comme un configurateur de pneus.

Il s'agit d'une nouvelle manière de choisir, d'acheter et de vivre avec ses
pneus :

```text
Le terrain crée le Ride ID
        ↓
MICHELIN prescrit la configuration
        ↓
Les preuves rassurent
        ↓
L'e-retail et le vélociste convertissent
        ↓
Le RideProof Passport accompagne
        ↓
La reprise prépare le prochain achat
```

Le fil conducteur de l'ensemble du dispositif est :

> **Un pneu ne devrait pas être choisi dans un catalogue. Il devrait être
> prescrit par la route.**

## 22. Documents de référence

- `docs/documents_clients/problematique_michelin_velo_hackathon.md`
- `docs/documents_clients/michelin_hvc_bike_segmentation.md`
- `docs/documents_clients/michelin_bicycle_tire_guide_2026.md`
- `docs/documents_clients/2W Bicycle Product Catalog v4 - 2026.xlsx`
- `docs/documents_clients/nouvelle_ere_pour_le_velo.md`
- `docs/documents_clients/language_book_michelin_fr.md`
- `docs/documents_clients/chartes_michelin_digital_communication.md`
