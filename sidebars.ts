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
        'concepts/sources-of-truth',
        'concepts/artifact-contract',
        'concepts/core-objects',
        'concepts/fleet-clusters',
        'concepts/backend-profiles',
        'concepts/promotion-sources',
        'concepts/promotion-units',
        'concepts/promotionplans-and-waves',
        'concepts/promotionruns',
        'concepts/promotion-targets',
        'concepts/promotionrun-fsm',
        'concepts/approvals',
        'concepts/actuators',
        'concepts/gates',
        'concepts/automation-and-triggers',
        'concepts/plugins-and-conformance',
        'concepts/plugin-registrations',
        'concepts/greenfield-and-brownfield',
        'concepts/backend-ownership',
        'concepts/notifications',
        'concepts/agent-policies',
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
        'examples/hub-config-repository',
        'examples/retail-fleet',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/hub-config',
        'guides/operations',
        'guides/fleet-discovery',
        'guides/e2e-validation',
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
