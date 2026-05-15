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

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
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
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
