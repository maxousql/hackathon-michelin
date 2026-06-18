-- Demo data for the /profil page.
-- Run this from the Supabase SQL editor after the profile/bikes/races/tire passport migrations.
-- It is re-runnable: only rows with the fixed demo UUIDs below are deleted and recreated.

begin;

do $$
declare
  demo_user_id constant uuid := 'dd9e389b-0d7a-4eb0-badf-687e1f875368';
begin
  if not exists (select 1 from auth.users where id = demo_user_id) then
    raise exception 'Demo user % does not exist in auth.users', demo_user_id;
  end if;
end $$;

delete from public.saved_races
where id in (
  'a1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000002',
  'a1000000-0000-4000-8000-000000000003',
  'a1000000-0000-4000-8000-000000000004',
  'a1000000-0000-4000-8000-000000000005',
  'a1000000-0000-4000-8000-000000000006',
  'a1000000-0000-4000-8000-000000000007',
  'a1000000-0000-4000-8000-000000000008'
);

delete from public.tire_passports
where id in (
  'c1000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000002',
  'c1000000-0000-4000-8000-000000000003',
  'c1000000-0000-4000-8000-000000000004'
);

delete from public.bikes
where id in (
  'b1000000-0000-4000-8000-000000000001',
  'b1000000-0000-4000-8000-000000000002',
  'b1000000-0000-4000-8000-000000000003',
  'b1000000-0000-4000-8000-000000000004'
);

insert into public.bikes (
  id,
  user_id,
  name,
  type,
  distance_km,
  is_primary,
  tire_diameter,
  tire_width,
  tire_sealing,
  riding_surface,
  riding_priority,
  is_ebike,
  created_at
) values
  (
    'b1000000-0000-4000-8000-000000000001',
    'dd9e389b-0d7a-4eb0-badf-687e1f875368',
    'Canyon Ultimate CFR',
    'road',
    8420,
    true,
    '700',
    '28',
    'TUBELESS READY',
    'smooth',
    'performance',
    false,
    now() - interval '180 days'
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    'dd9e389b-0d7a-4eb0-badf-687e1f875368',
    'Canyon Grail Race',
    'gravel',
    6230,
    false,
    '700',
    '40',
    'TUBELESS READY',
    'mixed',
    'versatility',
    false,
    now() - interval '150 days'
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    'dd9e389b-0d7a-4eb0-badf-687e1f875368',
    'Specialized Turbo Levo',
    'mtb',
    9700,
    false,
    '29',
    '2.4',
    'TUBELESS READY',
    'mud',
    'grip',
    true,
    now() - interval '95 days'
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    'dd9e389b-0d7a-4eb0-badf-687e1f875368',
    'Velo mulet a completer',
    'road',
    3150,
    false,
    null,
    null,
    null,
    'urban',
    'endurance',
    false,
    now() - interval '40 days'
  );

insert into public.tire_passports (
  id,
  user_id,
  bike_id,
  product_id,
  tire_brand,
  tire_model,
  tire_name,
  tire_dimension,
  mounted_at,
  mounted_distance_km,
  reference_front_bar,
  reference_rear_bar,
  status,
  created_at
) values
  (
    'c1000000-0000-4000-8000-000000000001',
    'dd9e389b-0d7a-4eb0-badf-687e1f875368',
    'b1000000-0000-4000-8000-000000000001',
    1001,
    'Michelin',
    'Power Cup',
    'Michelin Power Cup',
    '700 x 28',
    date '2026-06-05',
    1300,
    6.8,
    7.0,
    'active',
    now() - interval '13 days'
  ),
  (
    'c1000000-0000-4000-8000-000000000002',
    'dd9e389b-0d7a-4eb0-badf-687e1f875368',
    'b1000000-0000-4000-8000-000000000001',
    1002,
    'Michelin',
    'Power Endurance',
    'Michelin Power Endurance',
    '700 x 28',
    date '2026-01-15',
    4100,
    6.6,
    6.9,
    'retired',
    now() - interval '154 days'
  ),
  (
    'c1000000-0000-4000-8000-000000000003',
    'dd9e389b-0d7a-4eb0-badf-687e1f875368',
    'b1000000-0000-4000-8000-000000000002',
    2001,
    'Michelin',
    'Power Gravel',
    'Michelin Power Gravel',
    '700 x 40',
    date '2026-02-20',
    5600,
    2.1,
    2.3,
    'active',
    now() - interval '118 days'
  ),
  (
    'c1000000-0000-4000-8000-000000000004',
    'dd9e389b-0d7a-4eb0-badf-687e1f875368',
    'b1000000-0000-4000-8000-000000000002',
    2002,
    'Michelin',
    'Power Adventure',
    'Michelin Power Adventure',
    '700 x 40',
    date '2025-10-01',
    3500,
    2.0,
    2.2,
    'retired',
    now() - interval '260 days'
  );

insert into public.saved_races (
  id,
  user_id,
  bike_id,
  race_name,
  race_date,
  location_name,
  surface,
  discipline,
  distance_km,
  elevation_gain_m,
  rider_weight_kg,
  result_json,
  created_at
) values
  (
    'a1000000-0000-4000-8000-000000000001',
    'dd9e389b-0d7a-4eb0-badf-687e1f875368',
    null,
    'Criterium urbain de Paris',
    date '2026-06-27',
    'Paris',
    'road',
    'competition',
    72.4,
    650,
    72.5,
    $json$
    {
      "tire": {
        "id": "michelin-power-cup",
        "name": "Michelin Power Cup",
        "line": "Road Competition",
        "description": "Pneu route rapide pour criteriums et efforts intenses.",
        "imageSlug": "michelin-power-cup",
        "disciplines": ["road", "competition"],
        "highlights": ["Rendement eleve", "Grip en virage", "Tubeless ready"],
        "priceEur": 69.99,
        "productUrl": "https://www.michelin.fr/bicycle/tyres/michelin-power-cup"
      },
      "pressure": {
        "frontBar": 6.9,
        "rearBar": 7.2,
        "note": "Base route seche pour 72.5 kg, a ajuster selon largeur reelle et temperature."
      },
      "weatherSummary": "Temps sec et vent leger attendus.",
      "justification": "Le profil urbain favorise un pneu rapide, stable en relances et fiable en courbe.",
      "confidenceScore": 87,
      "bikeCompatibility": {
        "bikeName": "A associer",
        "summary": "Aucun velo n'est encore lie a cette course.",
        "details": [
          "Associer un velo permettra de confirmer le montage actif.",
          "La pression conseillee ne doit pas etre appliquee sans verifier le pneu monte."
        ],
        "warning": "Velo manquant."
      }
    }
    $json$::jsonb,
    now() - interval '5 days'
  ),
  (
    'a1000000-0000-4000-8000-000000000005',
    'dd9e389b-0d7a-4eb0-badf-687e1f875368',
    'b1000000-0000-4000-8000-000000000002',
    'Triathlon relais Annecy',
    date '2026-07-03',
    'Annecy',
    'road',
    'training',
    40.0,
    420,
    72.5,
    $json$
    {
      "tire": {
        "id": "michelin-power-cup",
        "name": "Michelin Power Cup",
        "line": "Road Performance",
        "description": "Pneu route performant pour section rapide et asphalte propre.",
        "imageSlug": "michelin-power-cup",
        "disciplines": ["road", "training"],
        "highlights": ["Rendement", "Grip sec", "Precision"],
        "priceEur": 69.99,
        "productUrl": "https://www.michelin.fr/bicycle/tyres/michelin-power-cup"
      },
      "pressure": {
        "frontBar": 7.1,
        "rearBar": 7.4,
        "note": "Pression route calculee pour un velo route, a ne pas reprendre telle quelle sur un montage gravel."
      },
      "weatherSummary": "Route seche autour du lac, risque de rafales.",
      "justification": "L'epreuve privilegie le rendement et la regularite sur asphalte.",
      "confidenceScore": 78,
      "bikeCompatibility": {
        "bikeId": "b1000000-0000-4000-8000-000000000002",
        "bikeName": "Canyon Grail Race",
        "summary": "Velo gravel associe a une course route.",
        "details": [
          "Le pneu actif Michelin Power Gravel ne correspond pas a la recommandation course.",
          "Les pressions route sont incoherentes avec une section 700 x 40."
        ],
        "warning": "Verifie le choix du velo avant la course."
      }
    }
    $json$::jsonb,
    now() - interval '4 days'
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'dd9e389b-0d7a-4eb0-badf-687e1f875368',
    'b1000000-0000-4000-8000-000000000001',
    'Etape Mont Ventoux',
    date '2026-07-19',
    'Bedoin',
    'road',
    'sportive',
    138.0,
    3600,
    72.5,
    $json$
    {
      "tire": {
        "id": "michelin-power-endurance",
        "name": "Michelin Power Endurance",
        "line": "Road Endurance",
        "description": "Pneu route robuste pour longues distances et descentes exigeantes.",
        "imageSlug": "michelin-power-endurance",
        "disciplines": ["road", "sportive"],
        "highlights": ["Durabilite", "Protection", "Constance en descente"],
        "priceEur": 59.99,
        "productUrl": "https://www.michelin.fr/bicycle/tyres/michelin-power-endurance"
      },
      "pressure": {
        "frontBar": 7.0,
        "rearBar": 7.3,
        "note": "Pression de depart pour route montagneuse, a reduire legerement en cas de chaleur forte."
      },
      "weatherSummary": "Chaud en plaine, vent possible au sommet.",
      "justification": "Le volume et la resistance a la perforation priment sur le pur rendement pour cette distance.",
      "confidenceScore": 81,
      "bikeCompatibility": {
        "bikeId": "b1000000-0000-4000-8000-000000000001",
        "bikeName": "Canyon Ultimate CFR",
        "summary": "Velo route coherent, mais le pneu actif est plus typé competition.",
        "details": [
          "Michelin Power Cup est monte actuellement.",
          "Michelin Power Endurance est plus pertinent pour la duree et les descentes."
        ],
        "warning": "Pneu recommande different du passeport actif."
      }
    }
    $json$::jsonb,
    now() - interval '3 days'
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    'dd9e389b-0d7a-4eb0-badf-687e1f875368',
    'b1000000-0000-4000-8000-000000000002',
    'Gravel Trophy Lyon',
    date '2026-08-23',
    'Lyon',
    'gravel',
    'sportive',
    118.5,
    1850,
    72.5,
    $json$
    {
      "tire": {
        "id": "michelin-power-gravel",
        "name": "Michelin Power Gravel",
        "line": "Gravel",
        "description": "Pneu gravel polyvalent pour chemins roulants et portions rapides.",
        "imageSlug": "michelin-power-gravel",
        "disciplines": ["gravel", "sportive"],
        "highlights": ["Polyvalence", "Grip lateral", "Bon rendement"],
        "priceEur": 54.99,
        "productUrl": "https://www.michelin.fr/bicycle/tyres/michelin-power-gravel"
      },
      "pressure": {
        "frontBar": 2.0,
        "rearBar": 2.2,
        "note": "Base tubeless gravel pour 700 x 40, a ajuster selon cailloux et humidite."
      },
      "weatherSummary": "Pistes seches avec passages poussiereux.",
      "justification": "Le pneu actif correspond a la recommandation et couvre bien les variations de terrain.",
      "confidenceScore": 90,
      "bikeCompatibility": {
        "bikeId": "b1000000-0000-4000-8000-000000000002",
        "bikeName": "Canyon Grail Race",
        "summary": "Configuration alignee avec la course.",
        "details": [
          "Type de velo et surface coherents.",
          "Pneu actif identique a la recommandation."
        ]
      }
    }
    $json$::jsonb,
    now() - interval '2 days'
  ),
  (
    'a1000000-0000-4000-8000-000000000004',
    'dd9e389b-0d7a-4eb0-badf-687e1f875368',
    'b1000000-0000-4000-8000-000000000003',
    'Enduro des Alpes',
    date '2026-09-12',
    'Morzine',
    'mtb',
    'enduro',
    42.0,
    2100,
    72.5,
    $json$
    {
      "tire": {
        "id": "michelin-wild-enduro-ms",
        "name": "Michelin Wild Enduro MS",
        "line": "MTB Enduro",
        "description": "Pneu VTT enduro pour terrain meuble et sections raides.",
        "imageSlug": "michelin-wild-enduro-ms",
        "disciplines": ["mtb", "enduro"],
        "highlights": ["Grip terrain meuble", "Freinage", "Carcasse renforcee"],
        "priceEur": 64.99,
        "productUrl": "https://www.michelin.fr/bicycle/tyres/michelin-wild-enduro-ms"
      },
      "pressure": {
        "frontBar": 2.1,
        "rearBar": 2.2,
        "note": "Base VTT electrique/enduro, a affiner selon insert, carcasse et style de pilotage."
      },
      "weatherSummary": "Terrain mixte, possibilite d'averses en altitude.",
      "justification": "Le terrain demande du grip et une carcasse securisante.",
      "confidenceScore": 84,
      "bikeCompatibility": {
        "bikeId": "b1000000-0000-4000-8000-000000000003",
        "bikeName": "Specialized Turbo Levo",
        "summary": "Velo coherent, passeport pneu actif manquant.",
        "details": [
          "Le velo est adapte a la surface.",
          "Aucun passeport actif ne confirme le pneu monte."
        ],
        "warning": "Cree un passeport pneu avant de valider la pression."
      }
    }
    $json$::jsonb,
    now() - interval '1 day'
  ),
  (
    'a1000000-0000-4000-8000-000000000006',
    'dd9e389b-0d7a-4eb0-badf-687e1f875368',
    'b1000000-0000-4000-8000-000000000001',
    'Gran Fondo Nice',
    date '2026-05-03',
    'Nice',
    'road',
    'sportive',
    154.0,
    2800,
    72.5,
    $json$
    {
      "tire": {
        "id": "michelin-power-cup",
        "name": "Michelin Power Cup",
        "line": "Road Performance",
        "description": "Pneu route rapide pour cyclosportives nerveuses.",
        "imageSlug": "michelin-power-cup",
        "disciplines": ["road", "sportive"],
        "highlights": ["Rendement", "Grip sec", "Relances"],
        "priceEur": 69.99,
        "productUrl": "https://www.michelin.fr/bicycle/tyres/michelin-power-cup"
      },
      "pressure": {
        "frontBar": 6.8,
        "rearBar": 7.1,
        "note": "Pression utilisee comme base sur asphalte sec."
      },
      "weatherSummary": "Conditions seches et chaudes.",
      "justification": "La course favorisait un pneu de rendement avec bonne tenue en descente.",
      "confidenceScore": 88,
      "bikeCompatibility": {
        "bikeId": "b1000000-0000-4000-8000-000000000001",
        "bikeName": "Canyon Ultimate CFR",
        "summary": "Course passee alignee avec le velo route.",
        "details": [
          "Le pneu recommande est monte actuellement.",
          "La pression etait coherente avec le montage."
        ]
      }
    }
    $json$::jsonb,
    now() - interval '47 days'
  ),
  (
    'a1000000-0000-4000-8000-000000000007',
    'dd9e389b-0d7a-4eb0-badf-687e1f875368',
    'b1000000-0000-4000-8000-000000000002',
    'Roc Gravel Herault',
    date '2026-04-14',
    'Lodeve',
    'gravel',
    'sportive',
    96.0,
    1450,
    72.5,
    $json$
    {
      "tire": {
        "id": "michelin-power-gravel",
        "name": "Michelin Power Gravel",
        "line": "Gravel",
        "description": "Pneu gravel adapte aux pistes seches et relances rapides.",
        "imageSlug": "michelin-power-gravel",
        "disciplines": ["gravel", "sportive"],
        "highlights": ["Grip lateral", "Rendement", "Tubeless ready"],
        "priceEur": 54.99,
        "productUrl": "https://www.michelin.fr/bicycle/tyres/michelin-power-gravel"
      },
      "pressure": {
        "frontBar": 2.1,
        "rearBar": 2.3,
        "note": "Reglage de reference pour chemins cassants et portions roulantes."
      },
      "weatherSummary": "Terrain sec avec cailloux exposes.",
      "justification": "Le compromis rendement/grip convenait au profil de la course.",
      "confidenceScore": 86,
      "bikeCompatibility": {
        "bikeId": "b1000000-0000-4000-8000-000000000002",
        "bikeName": "Canyon Grail Race",
        "summary": "Configuration gravel coherente.",
        "details": [
          "Pneu actif et recommandation alignes.",
          "Pressions coherentes avec la section 700 x 40."
        ]
      }
    }
    $json$::jsonb,
    now() - interval '66 days'
  ),
  (
    'a1000000-0000-4000-8000-000000000008',
    'dd9e389b-0d7a-4eb0-badf-687e1f875368',
    null,
    'Reco pluvieuse Fontainebleau',
    date '2026-03-21',
    'Fontainebleau',
    'road',
    'training',
    83.0,
    760,
    72.5,
    $json$
    {
      "tire": {
        "id": "michelin-power-all-season",
        "name": "Michelin Power All Season",
        "line": "Road All Season",
        "description": "Pneu route securisant pour sorties humides et revetements variables.",
        "imageSlug": "michelin-power-all-season",
        "disciplines": ["road", "training"],
        "highlights": ["Grip humide", "Protection", "Regularite"],
        "priceEur": 49.99,
        "productUrl": "https://www.michelin.fr/bicycle/tyres/michelin-power-all-season"
      },
      "pressure": {
        "frontBar": 6.4,
        "rearBar": 6.7,
        "note": "Pression volontairement abaissee pour ameliorer le grip sur route humide."
      },
      "weatherSummary": "Pluie fine et chaussee humide.",
      "justification": "La priorite etait la securite et le grip plutot que le rendement pur.",
      "confidenceScore": 79,
      "bikeCompatibility": {
        "bikeName": "Aucun velo associe",
        "summary": "Course passee sans velo lie.",
        "details": [
          "Utile pour visualiser les historiques incomplets.",
          "Associer un velo permettrait de comparer au passeport actif."
        ],
        "warning": "Historique incomplet."
      }
    }
    $json$::jsonb,
    now() - interval '90 days'
  );

commit;
