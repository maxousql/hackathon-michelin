const marqueeItems = [
  'Race Intelligence',
  'Power Cup',
  'Power Gravel',
  'Wild Enduro',
  'Tubeless Ready',
  'Grip',
  'Rendement',
  'Pression',
  'Race Intelligence',
  'Power Cup',
  'Power Gravel',
  'Wild Enduro',
  'Tubeless Ready',
  'Grip',
  'Rendement',
  'Pression',
];

export function RaceIntelligenceMarquee() {
  return (
    <div className="ri-marquee" aria-label="Univers Michelin Race">
      <div className="ri-marquee-track">
        {marqueeItems.map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}
