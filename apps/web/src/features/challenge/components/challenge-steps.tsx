import styles from './challenge-steps.module.css';

interface ChallengeStepsProps {
  prizeLabel: string;
}

export function ChallengeSteps({ prizeLabel }: ChallengeStepsProps) {
  const steps = [
    {
      title: 'Connecte ton compte Strava',
      text: 'Relie ton Strava pour que tes efforts sur le segment soient pris en compte.',
    },
    {
      title: 'Roule le segment',
      text: 'Lance-toi sur le segment officiel du challenge et donne tout pour signer le meilleur temps.',
    },
    {
      title: 'Le plus rapide gagne',
      text: `À la clôture, le ou la cycliste en tête du classement remporte ${prizeLabel}.`,
    },
  ];

  return (
    <ol className={styles.steps}>
      {steps.map((step, index) => (
        <li key={step.title} className={styles.step}>
          <span className={styles.number} aria-hidden="true">
            {index + 1}
          </span>
          <h3 className={styles.stepTitle}>{step.title}</h3>
          <p className={styles.stepText}>{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
