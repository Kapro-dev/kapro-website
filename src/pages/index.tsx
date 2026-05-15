import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className={clsx('container', styles.heroInner)}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Kubernetes fleet promotion control plane</p>
          <h1 className={styles.heroTitle}>Promote releases across clusters with policy and proof.</h1>
          <p className={styles.heroSubtitle}>{siteConfig.tagline}. Kapro coordinates delivery waves, gates, approvals, health checks, and backend actuators without replacing Flux, Argo CD, or your rollout stack.</p>
          <div className={styles.badges}>
            <span className={styles.badge}>Open source</span>
            <span className={styles.badge}>Apache 2.0</span>
            <span className={styles.badge}>Kubernetes native</span>
          </div>
          <div className={styles.buttons}>
            <Link
              className="button button--primary button--lg"
              to="/docs/intro">
              Get Started
            </Link>
            <Link
              className="button button--secondary button--lg"
              href="https://github.com/Kapro-dev/kapro">
              GitHub
            </Link>
          </div>
        </div>

        <div className={styles.heroVisual} aria-label="Kapro promotion waves">
          <div className={styles.logoPanel}>
            <img src="img/logo.png" alt="Kapro" className={styles.heroLogo} />
          </div>
          <div className={styles.promotionPanel}>
            {[
              ['Wave 1', 'canary', 'verified'],
              ['Wave 2', 'regional', 'soaking'],
              ['Wave 3', 'global', 'waiting'],
            ].map(([wave, label, status], index) => (
              <div className={styles.wave} key={wave}>
                <span className={styles.waveLabel}>{wave}</span>
                <span className={styles.clusterDots} aria-label={label}>
                  {Array.from({length: 5}).map((_, dotIndex) => (
                    <span
                      className={clsx(styles.dot, dotIndex <= index + 1 && styles.dotActive)}
                      key={dotIndex}
                      style={{animationDelay: `${dotIndex * 0.18}s`}}
                    />
                  ))}
                </span>
                <span className={styles.waveStatus}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Kubernetes fleet promotion control plane"
      description="Kapro coordinates safe version promotion across clusters, regions, and clouds while local delivery systems execute the change.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
