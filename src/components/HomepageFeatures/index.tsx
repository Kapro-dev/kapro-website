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
    title: 'Wave-based Promotion',
    description: (
      <>
        Roll out across clusters in ordered waves. Canary first, then regional
        production, then global. Each wave gates on the previous before
        proceeding.
      </>
    ),
  },
  {
    title: 'Composable Gates',
    description: (
      <>
        Combine soak timers, Prometheus metric checks, OCI signature
        verification, manual approvals, and custom CEL expressions into
        per-stage gate policies.
      </>
    ),
  },
  {
    title: 'Backend-Agnostic',
    description: (
      <>
        Kapro orchestrates Flux, ArgoCD, Helm, and other delivery backends
        through a pluggable actuator interface. It decides <em>when</em> to
        deliver; your GitOps tool decides <em>how</em>.
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
            <span>Promotion decisions</span>
            <span>for every cluster</span>
          </Heading>
          <p>
            Kapro handles the fleet-level decision loop while existing delivery
            systems keep applying changes inside each cluster.
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
