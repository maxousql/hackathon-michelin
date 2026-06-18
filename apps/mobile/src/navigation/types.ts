export type RootStackParamList = {
  Tabs: undefined;
  Auth: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type CatalogStackParamList = {
  CatalogMain: undefined;
  ProductDetail: { id: number };
};

export type AppTabParamList = {
  Home: undefined;
  Catalog: undefined;
  Race: undefined;
  Challenge: undefined;
  Comparateur: undefined;
  Reprise: undefined;
  Admin: undefined;
  Profile: undefined;
};
