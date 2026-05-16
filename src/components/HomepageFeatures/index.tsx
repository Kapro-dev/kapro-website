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
    title: 'Keep fleet intent in Git',
    description: (
      <>
        Review FleetClusters, BackendProfiles, PromotionSources, PromotionPlans,
        policies, and PromotionRuns in a hub config repository, then apply them to
        the Kapro hub in dependency order.
      </>
    ),
  },
  {
    title: 'Promote units across backends',
    description: (
      <>
        PromotionUnits map each deployable unit to an Argo CD, Flux, Helm, or
        Git-native version field so Kapro can move the right value at the right
        time.
      </>
    ),
  },
  {
    title: 'Extend at narrow boundaries',
    description: (
      <>
        Backend adapter, gate, and planner plugins use KAI, KGI, and KPI
        contracts while Kapro keeps PromotionRun state, ordering, retries, and audit
        status.
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
            <span>The current Kapro architecture</span>
          </Heading>
          <p>
            Kapro separates reviewed fleet configuration from immutable runtime
            artifacts, then coordinates the promotion state machine across clusters.
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
