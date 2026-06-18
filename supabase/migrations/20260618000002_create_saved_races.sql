CREATE TABLE public.saved_races (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  race_name        TEXT         NOT NULL,
  race_date        DATE         NOT NULL,
  location_name    TEXT         NOT NULL,
  surface          TEXT         NOT NULL,
  discipline       TEXT         NOT NULL,
  distance_km      NUMERIC(6,1) NOT NULL,
  elevation_gain_m NUMERIC(7,0) NOT NULL,
  rider_weight_kg  NUMERIC(5,1) NOT NULL,
  result_json      JSONB        NOT NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE public.saved_races ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can manage their own saved_races"
  ON public.saved_races
  FOR ALL
  USING (auth.uid() = user_id);
