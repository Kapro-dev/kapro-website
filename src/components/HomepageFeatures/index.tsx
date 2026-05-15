import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Start with a version',
    description: (
      <>
        CI publishes an immutable image or OCI bundle. Kapro treats that version
        as the contract and promotes the same version through the fleet.
      </>
    ),
  },
  {
    title: 'Move through waves',
    description: (
      <>
        Select canary, regional, and production clusters with labels. Stages,
        dependencies, and concurrency decide what can start next.
      </>
    ),
  },
  {
    title: 'Keep the audit trail',
    description: (
      <>
        Each target records phase, gate evidence, approvals, backend convergence,
        events, and final outcome in Kubernetes status.
      </>
    ),
  },
];

function Feature({title, description, index}: FeatureItem & {index: number}) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <span className={styles.featureIndex}>{index + 1}</span>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">
            <span>Learn Kapro in three ideas</span>
          </Heading>
          <p>
            Kapro is easiest to understand as version, waves, and evidence.
            Existing delivery tools still handle the local rollout.
          </p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} index={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
