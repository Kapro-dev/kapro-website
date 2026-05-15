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
      {/* Animated cluster wave background */}
      <div className={styles.clusterGrid}>
        {Array.from({length: 24}).map((_, i) => (
          <div key={i} className={styles.clusterNode} style={{
            animationDelay: `${(i % 6) * 0.4 + Math.floor(i / 6) * 1.2}s`,
          }}>
            <div className={styles.clusterIcon}>&#9678;</div>
          </div>
        ))}
      </div>
      {/* Wave lines connecting clusters */}
      <svg className={styles.waveLines} viewBox="0 0 1200 400" preserveAspectRatio="none">
        <path d="M0,200 Q150,100 300,200 T600,200 T900,200 T1200,200" className={styles.wavePath} style={{animationDelay: '0s'}} />
        <path d="M0,240 Q150,140 300,240 T600,240 T900,240 T1200,240" className={styles.wavePath} style={{animationDelay: '0.5s'}} />
        <path d="M0,160 Q150,60 300,160 T600,160 T900,160 T1200,160" className={styles.wavePath} style={{animationDelay: '1s'}} />
      </svg>
      <div className="container" style={{position: 'relative', zIndex: 2}}>
        <img
          src="img/logo.png"
          alt="Kapro"
          className={styles.heroLogo}
        />
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.badges}>
          <span className={styles.badge}>Open Source</span>
          <span className={styles.badge}>Apache 2.0</span>
          <span className={styles.badge}>CNCF Ecosystem</span>
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
