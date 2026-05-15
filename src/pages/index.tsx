import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

const gates = ['Signature', 'Metrics', 'Soak', 'Approval'];

const waves = [
  {name: 'Wave 1', scope: 'canary', status: 'verified', active: 4},
  {name: 'Wave 2', scope: 'regional', status: 'soaking', active: 3},
  {name: 'Wave 3', scope: 'global', status: 'queued', active: 1},
];

function KubernetesMark() {
  return (
    <svg className={styles.kubeMark} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 4 56.25 18v28L32 60 7.75 46V18L32 4Z" />
      <circle cx="32" cy="32" r="9" />
      <path d="M32 12v11M32 41v11M14.7 22l9.5 5.5M39.8 36.5l9.5 5.5M14.7 42l9.5-5.5M39.8 27.5l9.5-5.5" />
    </svg>
  );
}

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

        <div className={styles.heroVisual} aria-label="Animated Kapro promotion pipeline">
          <div className={styles.visualHeader}>
            <img src="img/logo.png" alt="Kapro" className={styles.heroLogo} />
            <div>
              <span className={styles.visualKicker}>Release</span>
              <strong>catalog-api:v1.8.2</strong>
            </div>
          </div>

          <div className={styles.flowCanvas}>
            <svg className={styles.signalSvg} viewBox="0 0 440 360" preserveAspectRatio="none" aria-hidden="true">
              <path className={styles.signalPath} d="M56 70 C120 70 126 130 190 130 S280 130 330 86" />
              <path className={styles.signalPath} d="M210 170 C260 170 284 152 340 152" />
              <path className={styles.signalPath} d="M210 212 C260 212 284 220 340 220" />
              <path className={styles.signalPath} d="M210 254 C260 254 284 286 340 286" />
              <circle className={styles.signalPacket} cx="0" cy="0" r="5" />
              <circle className={styles.signalPacketTwo} cx="0" cy="0" r="5" />
            </svg>

            <div className={styles.artifactCard}>
              <span className={styles.cardLabel}>Artifact</span>
              <strong>OCI image</strong>
              <code>sha256:9f4a</code>
            </div>

            <div className={styles.gatesCard}>
              <span className={styles.cardLabel}>Gate policy</span>
              <div className={styles.gateList}>
                {gates.map((gate, index) => (
                  <span className={styles.gate} key={gate} style={{animationDelay: `${index * 0.45}s`}}>
                    <span className={styles.check}>✓</span>
                    {gate}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.hubNode}>
              <KubernetesMark />
              <span>Kapro Hub</span>
            </div>

            <div className={styles.waveStack}>
              {waves.map((wave, waveIndex) => (
                <div className={styles.wave} key={wave.name}>
                  <div>
                    <span className={styles.waveLabel}>{wave.name}</span>
                    <span className={styles.waveScope}>{wave.scope}</span>
                  </div>
                  <div className={styles.clusterGrid} aria-label={`${wave.name} ${wave.scope} clusters`}>
                    {Array.from({length: 5}).map((_, clusterIndex) => (
                      <span
                        className={clsx(styles.clusterNode, clusterIndex < wave.active && styles.clusterNodeActive)}
                        key={clusterIndex}
                        style={{animationDelay: `${waveIndex * 0.7 + clusterIndex * 0.16}s`}}>
                        <KubernetesMark />
                      </span>
                    ))}
                  </div>
                  <span className={clsx(styles.waveStatus, wave.status === 'queued' && styles.waveStatusQueued)}>
                    {wave.status}
                  </span>
                </div>
              ))}
            </div>
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
