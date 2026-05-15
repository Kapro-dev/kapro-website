import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/kind-demo',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/architecture',
        'concepts/core-objects',
        'concepts/pipelines-and-waves',
        'concepts/release-fsm',
        'concepts/actuators',
        'concepts/gates',
        'concepts/notifications',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/flux',
        'examples/argo',
        'examples/progressive-rollout',
        'examples/approval-gates',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/hub-config',
        'guides/operations',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/api-stability',
        'reference/events',
      ],
    },
  ],
};

export default sidebars;
