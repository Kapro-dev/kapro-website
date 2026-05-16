import clsx from 'clsx';

type DiagramId =
  | 'intro'
  | 'installation'
  | 'kind-demo'
  | 'operations'
  | 'hub-config'
  | 'fleet-discovery'
  | 'e2e-validation'
  | 'argo'
  | 'approval-gates'
  | 'retail-fleet'
  | 'flux'
  | 'progressive-rollout'
  | 'hub-config-repository'
  | 'core-objects'
  | 'artifact-contract'
  | 'notifications'
  | 'backend-profiles'
  | 'promotion-targets'
  | 'promotionplans-and-waves'
  | 'architecture'
  | 'promotion-units'
  | 'promotionruns'
  | 'fleet-clusters'
  | 'greenfield-and-brownfield'
  | 'backend-ownership'
  | 'approvals'
  | 'automation-and-triggers'
  | 'plugin-registrations'
  | 'promotion-sources'
  | 'sources-of-truth'
  | 'promotionrun-fsm'
  | 'actuators'
  | 'gates'
  | 'plugins-and-conformance'
  | 'agent-policies'
  | 'api-stability'
  | 'events';

type ConceptDiagramData = {
  title: string;
  subtitle: string;
  idea: string;
  student: string;
  example: string;
  impact: string;
  nodes: string[];
  notes: string[];
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
};

const diagrams: Record<DiagramId, ConceptDiagramData> = {
  intro: {
    title: 'Kapro in one promotion story',
    subtitle: 'CI builds once. Kapro decides where that version may go next.',
    idea: 'Kapro is the fleet promotion layer between an immutable artifact and many clusters.',
    student: 'Imagine a student carrying one sealed lunch box through several classrooms. The lunch box is the artifact version. The route card is the PromotionPlan. The teacher at each classroom checks whether the student may enter. Kapro is that route card plus the teacher checks. It does not cook the food and it does not rearrange the classroom; CI builds the artifact and Argo or Flux performs local delivery. Kapro chooses the next safe classroom, writes down the reason, waits for health evidence, and only then continues.',
    example: 'Example: CI publishes checkout-api:v1.8.2. Kapro promotes it to canary, then Europe production, then the rest of the fleet after gates and approvals pass.',
    impact: 'The important impact is shared language: pipeline builds, artifact identifies the version, PromotionPlan defines the route, PromotionRun executes the attempt, and PromotionTarget records each cluster.',
    nodes: ['CI pipeline', 'Artifact version', 'PromotionPlan', 'PromotionRun', 'PromotionTargets'],
    notes: ['Build/test/sign', 'Digest or tag', 'Route and gates', 'One execution', 'Per cluster proof'],
    color: 'blue',
  },
  installation: {
    title: 'Install Kapro on the hub',
    subtitle: 'CRDs, RBAC, controller, and webhooks land before teams create promotions.',
    idea: 'Installation creates the Kubernetes API surface that the rest of Kapro uses.',
    student: 'Think of installation like setting up a classroom before students arrive. First you add the desks, rules, and teacher. In Kapro, the desks are CRDs such as FleetCluster and PromotionRun. The rules are RBAC and admission checks. The teacher is the controller manager. After those pieces exist, platform teams can apply YAML safely because Kubernetes understands the objects and Kapro can reconcile them.',
    example: 'Example: install the chart, confirm the controller is ready, then apply a FleetCluster, PromotionSource, PromotionPlan, and PromotionRun to test the first path.',
    impact: 'A clean install matters because every later guide assumes the hub can store Kapro objects, reject invalid specs, and emit status. Without this layer, examples become plain YAML files with no controller behind them.',
    nodes: ['Install chart', 'CRDs', 'RBAC/webhooks', 'Controller', 'Ready hub'],
    notes: ['Helm or Kustomize', 'New API kinds', 'Guard writes', 'Reconcile loops', 'Accept promotions'],
    color: 'green',
  },
  'kind-demo': {
    title: 'Local Kind demo loop',
    subtitle: 'A small lab that shows the full PromotionRun path on one machine.',
    idea: 'The Kind demo compresses the fleet story into a repeatable local environment.',
    student: 'Use the demo like a science experiment. The Kind cluster is the lab bench. The sample app is the test material. Kapro is the instrument that records each step. Instead of asking a new user to understand cloud fleets, RBAC, external controllers, and production gates all at once, the demo gives one controlled path where they can see a PromotionTrigger create a PromotionRun and watch targets change phase.',
    example: 'Example: run the Kind demo script, inspect the generated PromotionRun, approve a gate, and watch the target converge through the fake backend.',
    impact: 'The demo teaches the mental model before real infrastructure is involved. Once the student understands the local loop, Argo, Flux, greenfield, and brownfield examples are easier because they reuse the same PromotionRun and PromotionTarget language.',
    nodes: ['Kind cluster', 'Demo config', 'PromotionTrigger', 'PromotionRun', 'Target status'],
    notes: ['Local lab', 'Seed YAML', 'Creates intent', 'Runs plan', 'Shows result'],
    color: 'orange',
  },
  operations: {
    title: 'Operate Kapro safely',
    subtitle: 'Status, metrics, events, and runbooks make promotions supportable.',
    idea: 'Operations docs explain how teams observe and repair the promotion control plane.',
    student: 'After a system works once, the next question is how to run it every day. Operations is the map for that daily work. It tells the student where Kapro stores status, which metrics should be watched, how events reach chat or audit systems, and what to check when a promotion is stuck. The goal is not mystery debugging. The goal is to follow the evidence from PromotionRun to PromotionTarget to backend.',
    example: 'Example: a production rollout stops in WaitingApproval. The operator checks the PromotionRun condition, finds the blocked PromotionTarget, confirms the approval policy, and creates or rejects the Approval object.',
    impact: 'This page matters because Kapro coordinates many clusters. A small stuck target can look scary unless operators have a predictable path for reading status and deciding whether to continue, pause, or roll back.',
    nodes: ['PromotionRun', 'Metrics', 'Events', 'Runbook', 'Decision'],
    notes: ['Overall status', 'Dashboards', 'Audit/chat', 'Step by step', 'Continue or stop'],
    color: 'purple',
  },
  'hub-config': {
    title: 'Hub config as source of truth',
    subtitle: 'Git defines the fleet and Kubernetes stores the live applied state.',
    idea: 'The hub config repository is the reviewable place for Kapro platform intent.',
    student: 'Picture a school notice board where every route, classroom, and permission rule is posted before the day starts. That notice board is the hub config repository. People review changes there, CI validates them, and then the hub cluster receives the accepted YAML. Kapro reads the applied objects and turns them into promotion behavior.',
    example: 'Example: a pull request adds prod-eu-1 as a FleetCluster, updates checkout-progressive, and applies a suspended PromotionRun for checkout:v1.8.2.',
    impact: 'The impact is auditability. A student can answer who changed the plan, which clusters are eligible, which backend is used, and which PromotionRun requested movement. Runtime status lives in Kubernetes, but the desired fleet model remains reviewable in Git.',
    nodes: ['Git PR', 'CI validation', 'kubectl/Flux apply', 'Hub CRDs', 'Kapro status'],
    notes: ['Review intent', 'Schema checks', 'Apply YAML', 'Live objects', 'Evidence'],
    color: 'blue',
  },
  'fleet-discovery': {
    title: 'Fleet discovery onboarding',
    subtitle: 'Existing cloud fleet membership becomes Kapro FleetCluster inventory.',
    idea: 'Fleet discovery helps convert known clusters into promotion targets.',
    student: 'A new student should not type every classroom by hand if the school office already has a list. Fleet discovery uses that existing list. The command reads memberships from the fleet provider and writes FleetCluster resources with labels. After that, PromotionPlans can select clusters by facts such as region, tier, cloud, and environment.',
    example: 'Example: kapro fleet sync reads GKE Fleet memberships, creates FleetCluster objects, and labels production clusters so checkout-progressive can select europe-west3 first.',
    impact: 'This makes onboarding less error-prone. Platform teams can start from real inventory, review the generated YAML, add business labels, and then use the same PromotionRun lifecycle as hand-written clusters.',
    nodes: ['Cloud fleet', 'kapro fleet sync', 'FleetCluster YAML', 'Labels', 'PromotionPlan match'],
    notes: ['Existing inventory', 'Import helper', 'Reviewable objects', 'Region/tier', 'Target selection'],
    color: 'green',
  },
  'e2e-validation': {
    title: 'End-to-end validation path',
    subtitle: 'Tests prove the promotion loop works across controllers and backends.',
    idea: 'E2E validation verifies behavior from intent creation through target convergence.',
    student: 'Unit tests are like checking each bicycle part on a table. End-to-end tests are riding the bicycle down the street. For Kapro, the street includes CRDs, reconcilers, gates, backend adapters, status updates, and cleanup. This page teaches how the whole path is exercised so users can trust the system before changing production.',
    example: 'Example: an E2E script installs Kapro, creates FleetClusters, creates a PromotionRun, waits for PromotionTargets, verifies convergence, and then removes the test resources.',
    impact: 'The impact is confidence. When a refactor changes API names or backend behavior, E2E tests catch broken wiring that compile-time checks cannot see.',
    nodes: ['Install test hub', 'Create fixtures', 'Run promotion', 'Assert status', 'Cleanup'],
    notes: ['Fresh environment', 'YAML inputs', 'Controller loop', 'Expected phases', 'Repeatable'],
    color: 'purple',
  },
  argo: {
    title: 'Argo CD backend example',
    subtitle: 'Kapro decides the promotion; Argo CD syncs the application.',
    idea: 'The Argo example shows Kapro controlling promotion intent without replacing Argo.',
    student: 'Think of Argo CD as the classroom assistant who already knows how to arrange one classroom. Kapro is the teacher deciding which classroom gets the new lesson next. Kapro does not need to become Argo. It only needs a BackendProfile and PromotionSource that identify the Argo objects and version fields it may use.',
    example: 'Example: a PromotionRun allows prod-eu-1 to receive checkout:v1.8.2. Kapro updates or drives the Argo Application source, then waits for Argo health and sync evidence before marking the PromotionTarget converged.',
    impact: 'This makes brownfield adoption realistic. Teams keep Argo workflows while adding fleet-wide ordering, gates, approvals, and per-cluster evidence above them.',
    nodes: ['PromotionRun', 'BackendProfile argo', 'Argo Application', 'Argo sync/health', 'PromotionTarget status'],
    notes: ['Intent', 'Adapter config', 'Native object', 'Local delivery', 'Fleet evidence'],
    color: 'orange',
  },
  'approval-gates': {
    title: 'Approval gate example',
    subtitle: 'A human decision becomes an auditable Kubernetes object.',
    idea: 'Approval gates pause risky stages until an authorized person says yes or no.',
    student: 'Some doors should not open automatically. Production is often one of those doors. Approval gates teach Kapro to stop at that door, show the evidence, and wait. The approval is not a chat message hidden in history; it is an Approval object connected to a PromotionTarget and stage.',
    example: 'Example: canary converges, production-eu reaches WaitingApproval, an SRE reviews metrics, creates an Approval, and Kapro continues applying one production target at a time.',
    impact: 'The impact is controlled risk. Automation still handles planning and status, but the final human decision is explicit, reviewable, and connected to the exact target it unblocked.',
    nodes: ['Stage reaches gate', 'Evidence shown', 'Approval object', 'Kapro resumes', 'Audit trail'],
    notes: ['WaitingApproval', 'Health/metrics', 'Human yes/no', 'Next phase', 'Who and why'],
    color: 'red',
  },
  'retail-fleet': {
    title: 'Retail fleet rollout',
    subtitle: 'Stores move in waves so one bad version does not hit every location.',
    idea: 'The retail example maps Kapro concepts to store or edge clusters.',
    student: 'A retail fleet is easy to understand because every store feels like a small cluster. You do not want a checkout change to reach every store at once. Kapro lets you try pilot stores, then one region, then the larger fleet. Each store cluster becomes a PromotionTarget with its own evidence.',
    example: 'Example: checkout POS version 5.28.0 goes to two pilot stores, then Germany stores, then all remaining stores after a one-hour soak and error-rate gate.',
    impact: 'This example shows why fleet-native promotion matters. The same artifact can be safe in one location and blocked in another, and Kapro records that difference per target.',
    nodes: ['Pilot stores', 'Regional stores', 'Global stores', 'Health gates', 'Store evidence'],
    notes: ['Small blast radius', 'Country wave', 'Fleet wave', 'Metrics/soak', 'Per location'],
    color: 'green',
  },
  flux: {
    title: 'Flux backend example',
    subtitle: 'Kapro coordinates movement while Flux reconciles GitOps resources.',
    idea: 'The Flux example shows how Kapro works with GitRepository, OCIRepository, HelmRelease, and Kustomization objects.',
    student: 'Flux is already good at keeping a cluster matched to a declared source. Kapro adds the fleet decision above that. A student should picture Kapro saying, "this target may now use version v1.8.2," and Flux doing the local reconciliation work until the workload is ready.',
    example: 'Example: Kapro updates the allowed version field for a HelmRelease or source revision, waits for Flux Ready conditions, then records the PromotionTarget as converged.',
    impact: 'The impact is separation of responsibility. Flux keeps doing GitOps reconciliation. Kapro handles stage order, target selection, policy checks, and evidence across clusters.',
    nodes: ['PromotionRun', 'Flux source', 'HelmRelease/Kustomization', 'Ready condition', 'Target converged'],
    notes: ['Fleet intent', 'Version input', 'Local apply', 'Flux evidence', 'Kapro status'],
    color: 'blue',
  },
  'progressive-rollout': {
    title: 'Progressive rollout example',
    subtitle: 'A version advances only after earlier waves prove it is healthy.',
    idea: 'Progressive rollout reduces blast radius by moving through ordered stages.',
    student: 'Progressive rollout is like testing a bridge with one cart before sending the whole parade. Kapro starts with a low-risk wave, watches evidence, waits for soak time or approval, and only then opens the next wave. The PromotionPlan defines that route; the PromotionRun is one trip through it.',
    example: 'Example: checkout:v1.8.2 runs in canary, then production-eu with maxParallel 1, then global production with maxParallel 10.',
    impact: 'The impact is safer production movement. Instead of one CI script pushing everywhere, Kapro records each stage, each gate, and each cluster outcome.',
    nodes: ['Canary', 'Soak/gates', 'Region wave', 'Approval', 'Global wave'],
    notes: ['First proof', 'Wait and check', 'Bigger scope', 'Human gate', 'Remaining fleet'],
    color: 'purple',
  },
  'hub-config-repository': {
    title: 'Hub config repository layout',
    subtitle: 'Folders mirror the order a learner should understand Kapro.',
    idea: 'The repository example shows where fleet objects, sources, plans, and runs live.',
    student: 'A good repository is like a tidy school binder. Clusters go in one section, sources in another, plans in another, and run intent in another. A student should be able to open the binder and know where to place a new cluster or how to find the plan that production uses.',
    example: 'Example: clusters/prod-eu-1.yaml defines a FleetCluster, sources/checkout.yaml defines PromotionUnits, promotionplans/checkout.yaml defines waves, and promotionruns/checkout-v1.8.2.yaml starts a rollout.',
    impact: 'The impact is onboarding speed. When folder names match Kapro concepts, platform teams can review pull requests and debug promotions without guessing where intent is stored.',
    nodes: ['clusters/', 'sources/', 'promotionplans/', 'promotionruns/', 'ci/apply'],
    notes: ['Fleet inventory', 'Units/fields', 'Routes', 'Execution intent', 'Hub sync'],
    color: 'orange',
  },
  'core-objects': {
    title: 'Core object dependency map',
    subtitle: 'Configuration objects create the path; runtime objects record the journey.',
    idea: 'Core objects explain the nouns Kapro uses for promotion orchestration.',
    student: 'Start with the objects that exist before movement: FleetCluster says where a version can land, BackendProfile says which tool can apply it, PromotionSource says what application units exist, and PromotionPlan says the route. Then a PromotionRun starts movement. Kapro creates PromotionTargets to record what happens per selected cluster.',
    example: 'Example: checkout has api and worker PromotionUnits, a checkout-progressive PromotionPlan, and a PromotionRun that moves api=1.8.2 through canary and production targets.',
    impact: 'The impact is vocabulary. Once a student can separate plan from run and run from target, most Kapro status output becomes easy to read.',
    nodes: ['FleetCluster', 'PromotionSource', 'PromotionPlan', 'PromotionRun', 'PromotionTarget'],
    notes: ['Where', 'What units', 'Route', 'Attempt', 'Per cluster state'],
    color: 'blue',
  },
  'artifact-contract': {
    title: 'Version contract',
    subtitle: 'Kapro promotes immutable versions, not vague deployment wishes.',
    idea: 'The artifact contract defines what "this version" means.',
    student: 'A promotion needs a clear package label. If someone says "deploy latest," no one can prove what actually moved. Kapro prefers version data that is immutable and inspectable: image digests, tags with policy, chart versions, Git revisions, or unit versions. The PromotionRun points to that version information so every target can be checked against the same desired state.',
    example: 'Example: the api unit receives image digest sha256:abc, while the worker unit receives chart version 3.9.1 in the same PromotionRun.',
    impact: 'The impact is traceability. When a cluster is healthy or broken, Kapro can show exactly which artifact version was selected and which target received it.',
    nodes: ['Build output', 'Immutable version', 'PromotionRun versions', 'Backend field', 'Observed version'],
    notes: ['CI result', 'Digest/revision', 'Desired value', 'Where to write', 'Proof'],
    color: 'green',
  },
  notifications: {
    title: 'Events and notifications',
    subtitle: 'Kapro turns promotion lifecycle changes into external signals.',
    idea: 'Notifications let people and systems react to promotion events.',
    student: 'A promotion should not be silent. When a target waits for approval, fails a gate, or converges, the right people need to know. Kapro emits lifecycle events and notification policy decides where those events go. The event is the fact; the provider is the destination.',
    example: 'Example: production-eu enters WaitingApproval, Kapro emits an approval-needed event, and a NotificationPolicy sends it to Slack and an audit webhook.',
    impact: 'The impact is operational clarity. Teams do not need to poll every object manually, but the source of truth remains Kapro status and Kubernetes events.',
    nodes: ['Promotion event', 'NotificationPolicy', 'Provider', 'Chat/audit/SIEM', 'Human action'],
    notes: ['Lifecycle fact', 'Filter rules', 'Destination config', 'External signal', 'Respond'],
    color: 'purple',
  },
  'backend-profiles': {
    title: 'BackendProfile selection',
    subtitle: 'A profile tells Kapro which delivery system is responsible for a target.',
    idea: 'BackendProfile separates fleet orchestration from backend-specific apply mechanics.',
    student: 'Kapro can coordinate many rooms, but each room may use a different local helper. BackendProfile names that helper. It might be Argo CD, Flux, or an external plugin. The profile also says whether Kapro is only observing a brownfield backend or adopting enough control to drive promotions.',
    example: 'Example: backend profile argo discovers existing Applications in Observe mode; after review, the team moves selected units to Adopt mode.',
    impact: 'The impact is gradual adoption. Teams can document real backend topology first, then decide how much authority Kapro should have.',
    nodes: ['BackendProfile', 'Driver', 'Observe/Adopt', 'Discovered objects', 'PromotionSource'],
    notes: ['Config object', 'Argo/Flux/plugin', 'Control level', 'Brownfield view', 'Promotable units'],
    color: 'orange',
  },
  'promotion-targets': {
    title: 'PromotionTarget per-cluster proof',
    subtitle: 'One target explains one cluster inside one PromotionRun.',
    idea: 'PromotionTarget is the easiest object to debug because it is scoped to one selected cluster.',
    student: 'When a rollout spans many clusters, a single overall status is not enough. A PromotionTarget is the small receipt for one cluster. It says which run selected the cluster, which stage it belongs to, which phase it is in, which gates passed, and whether the backend converged.',
    example: 'Example: checkout-v1.8.2/prod-eu-1 is WaitingApproval while checkout-v1.8.2/canary-eu is Converged.',
    impact: 'The impact is practical debugging. Instead of asking "why is production stuck?", operators can ask "which target is stuck and which phase explains it?"',
    nodes: ['Selected cluster', 'Gate phases', 'Backend apply', 'Health evidence', 'Target result'],
    notes: ['One cluster', 'Checks', 'Argo/Flux/plugin', 'Ready/probes', 'Converged/failed'],
    color: 'green',
  },
  'promotionplans-and-waves': {
    title: 'PromotionPlan waves',
    subtitle: 'Stages choose clusters and control order, soak, gates, and parallelism.',
    idea: 'PromotionPlan is the reusable route map for PromotionRuns.',
    student: 'A plan is not a rollout by itself. It is the map. It says canary first, then production in Europe, then the rest of production. Each stage selects clusters using labels, waits for dependencies, and limits how many targets run at once. A PromotionRun later uses this map for a specific version.',
    example: 'Example: canary selects tier=canary, production-eu selects region=europe-west3, and production-global waits for production-eu plus one hour of soak.',
    impact: 'The impact is repeatability. Every team can use the same route and safety rules without copying CI scripts.',
    nodes: ['Cluster labels', 'Stage selector', 'Dependency/soak', 'Gate policy', 'PromotionTargets'],
    notes: ['Facts', 'Wave membership', 'Order', 'Safety', 'Runtime work'],
    color: 'blue',
  },
  architecture: {
    title: 'Layered Kapro architecture',
    subtitle: 'Intent flows down through planning, control, safety, delivery, and evidence.',
    idea: 'The architecture page explains how the hub, backends, and status surfaces communicate.',
    student: 'Read Kapro top to bottom. The intent layer receives Git config, triggers, and PromotionRuns. The planning layer chooses FleetClusters through PromotionPlans and policies. The control layer reconciles runs and targets. The safety layer checks health, metrics, signatures, and approvals. The delivery layer hands work to Argo, Flux, or plugins. The evidence layer records what happened.',
    example: 'Example: a PromotionRun for checkout:v1.8.2 becomes targets, each target passes gates, the Flux backend applies the version, and Kapro records convergence.',
    impact: 'The impact is clean responsibility boundaries. Kapro coordinates promotions; delivery backends keep doing local reconciliation.',
    nodes: ['Intent', 'Planning', 'Control', 'Safety', 'Delivery', 'Evidence'],
    notes: ['What moves', 'Where/order', 'Reconcilers', 'Gates', 'Argo/Flux/plugin', 'Status'],
    color: 'purple',
  },
  'promotion-units': {
    title: 'PromotionUnit mapping',
    subtitle: 'One app can have several independently promoted deployable units.',
    idea: 'PromotionUnit names the backend object and version field Kapro may change.',
    student: 'An application is often more than one thing. Checkout might have api, worker, and POS server units. Kapro needs to know how each unit maps to backend-native configuration. PromotionSource groups the application, and PromotionUnit describes each deployable piece and its version field.',
    example: 'Example: api maps to an Argo Application targetRevision, while pos-server maps to a JSON field used by an ApplicationSet generator.',
    impact: 'The impact is precision. Kapro can promote one unit or several units without pretending the whole application has only one version field.',
    nodes: ['PromotionSource', 'Unit api', 'Unit worker', 'Backend field', 'Version applied'],
    notes: ['App group', 'Service', 'Job/worker', 'Writable path', 'Observed result'],
    color: 'orange',
  },
  promotionruns: {
    title: 'PromotionRun execution',
    subtitle: 'One concrete attempt to move one version through one or more plans.',
    idea: 'PromotionRun is the object operators watch for rollout progress.',
    student: 'If PromotionPlan is a route map, PromotionRun is one trip. It names the version, references the plan, and starts the controller work. Kapro reads the run, resolves the plan and source, selects clusters, creates targets, evaluates gates, and aggregates status back onto the run.',
    example: 'Example: checkout-v1.8.2 references checkout-progressive and creates targets for canary-eu, prod-eu-1, and prod-us as stages become eligible.',
    impact: 'The impact is ownership. The PromotionRun is the parent object for one promotion attempt, so it is the first place to check for overall success, failure, or suspension.',
    nodes: ['Run intent', 'Resolve plan', 'Select clusters', 'Create targets', 'Aggregate status'],
    notes: ['Version now', 'Load route', 'Match labels', 'Per cluster', 'Overall view'],
    color: 'green',
  },
  'fleet-clusters': {
    title: 'FleetCluster inventory',
    subtitle: 'Clusters become selectable promotion destinations through labels and health.',
    idea: 'FleetCluster is Kapro record for one workload cluster.',
    student: 'Kapro cannot promote safely to an unnamed place. FleetCluster gives each cluster a name, labels, backend configuration, and observed health. PromotionPlans do not hard-code every cluster; they select clusters by labels. That keeps plans reusable when the fleet grows.',
    example: 'Example: prod-eu-1 has labels tier=production and region=europe-west3, so the production-eu stage selects it.',
    impact: 'The impact is fleet-native targeting. Platform teams can add, remove, or relabel clusters without rewriting every PromotionPlan.',
    nodes: ['Cluster record', 'Labels', 'Backend ref', 'Health', 'Stage selection'],
    notes: ['Name', 'Region/tier', 'Argo/Flux', 'Heartbeat', 'Target match'],
    color: 'blue',
  },
  'greenfield-and-brownfield': {
    title: 'Greenfield and brownfield adoption',
    subtitle: 'Kapro supports new setups and existing Argo or Flux estates.',
    idea: 'Greenfield starts clean; brownfield observes and adopts what already exists.',
    student: 'A new school can design hallways from scratch. An old school already has hallways, signs, and routines. Greenfield Kapro is the new school: define clean backend profiles, sources, and plans. Brownfield Kapro is the old school: discover existing Argo or Flux objects, observe them, and adopt only after review.',
    example: 'Example: a team starts BackendProfile managementPolicy=Observe for existing Argo Applications, reviews generated PromotionUnits, then changes selected units to Adopt.',
    impact: 'The impact is lower migration risk. Kapro does not force teams to throw away existing GitOps structure before they can get fleet promotion visibility.',
    nodes: ['Existing backend', 'Observe', 'Review discovery', 'Adopt selected', 'Promote safely'],
    notes: ['Argo/Flux today', 'Read only', 'Human check', 'Controlled write', 'Normal lifecycle'],
    color: 'purple',
  },
  'backend-ownership': {
    title: 'Backend ownership boundary',
    subtitle: 'Kapro decides permission to move; backends perform local reconciliation.',
    idea: 'Backend ownership explains who is responsible for which part of delivery.',
    student: 'Confusion happens when two systems both think they own the same action. Kapro avoids that by owning promotion state, gates, ordering, and target evidence. Argo, Flux, Helm, or a plugin owns local apply and convergence mechanics. Kapro asks the backend to move only after a target is allowed.',
    example: 'Example: Kapro marks prod-eu-1 Applying and asks Flux to reconcile a HelmRelease revision. Flux handles the local apply; Kapro watches Ready evidence.',
    impact: 'The impact is safer integration. Teams can add Kapro without making it a second GitOps controller that fights the existing backend.',
    nodes: ['Kapro decision', 'Backend request', 'Local reconcile', 'Health evidence', 'Kapro status'],
    notes: ['Allow/deny', 'Adapter call', 'Argo/Flux', 'Ready', 'Record result'],
    color: 'orange',
  },
  approvals: {
    title: 'Approval object lifecycle',
    subtitle: 'Manual decisions are explicit resources, not hidden comments.',
    idea: 'Approvals unblock targets that are waiting at a manual gate.',
    student: 'A manual approval should be as visible as the automation it controls. Kapro creates a waiting state on the target, shows why it stopped, and waits for an Approval object. That object records the decision and connects it to the run, stage, and target.',
    example: 'Example: production-global waits for sre-team approval. An SRE checks metrics, creates Approval approved=true, and Kapro continues.',
    impact: 'The impact is audit quality. Later, someone can see who approved, what was approved, and which PromotionTarget moved because of it.',
    nodes: ['Waiting target', 'Evidence review', 'Approval', 'Resume target', 'Audit status'],
    notes: ['Manual gate', 'Context', 'Yes/no', 'Continue', 'Traceability'],
    color: 'red',
  },
  'automation-and-triggers': {
    title: 'PromotionTrigger automation',
    subtitle: 'Artifact observations create guarded PromotionRuns, not direct deployments.',
    idea: 'PromotionTrigger turns trusted new artifacts into promotion intent.',
    student: 'Automation should notice new packages, but it should not blindly change production. PromotionTrigger watches an artifact source, filters tags, checks policy like signature requirements and cooldown, then creates a PromotionRun. After that, the normal plan, gates, approvals, and backend evidence still apply.',
    example: 'Example: an OCI tag v1.8.2 appears, matches the semantic-version pattern, passes signature policy, and creates a suspended PromotionRun for checkout-progressive.',
    impact: 'The impact is controlled automation. Teams get less manual YAML writing while preserving all Kapro safety checks.',
    nodes: ['Artifact source', 'Trigger policy', 'Digest pin', 'PromotionRun', 'Normal gates'],
    notes: ['OCI watch', 'Filters/cooldown', 'Immutable ref', 'Intent', 'No bypass'],
    color: 'green',
  },
  'plugin-registrations': {
    title: 'PluginRegistration contract',
    subtitle: 'External adapters, gates, and planners must declare compatibility.',
    idea: 'PluginRegistration is the platform-owned entry point for external plugin endpoints.',
    student: 'Plugins are like guest teachers. Before they help students, the school checks who they are, what subject they teach, and which rules they follow. PluginRegistration records the endpoint, type, TLS configuration, timeout behavior, and supported contract versions for KAI, KGI, or KPI.',
    example: 'Example: a backend adapter plugin registers KAI v1alpha1 support and becomes available for BackendProfile driver=external after readiness checks pass.',
    impact: 'The impact is controlled extensibility. Kapro can call external systems without losing ownership of the PromotionRun state machine.',
    nodes: ['PluginRegistration', 'Compatibility check', 'Ready plugin', 'Kapro call', 'Normalized result'],
    notes: ['Declare', 'Version/TLS', 'Available', 'Adapter/gate', 'Controller-owned status'],
    color: 'purple',
  },
  'promotion-sources': {
    title: 'PromotionSource application map',
    subtitle: 'Sources group deployable units and connect them to backend fields.',
    idea: 'PromotionSource tells Kapro what can be promoted for an application.',
    student: 'Before Kapro can move checkout, it needs to know what checkout means. PromotionSource provides that map. It names the backend profile and lists PromotionUnits. Each unit tells Kapro which backend object or file path contains the version field.',
    example: 'Example: checkout source has api, worker, and pos-server units, each with a different backend kind and version field.',
    impact: 'The impact is safe write scope. Kapro only changes declared fields instead of guessing which manifest should be modified.',
    nodes: ['Application', 'BackendProfile', 'PromotionUnits', 'Version fields', 'PromotionRun versions'],
    notes: ['Checkout', 'Argo/Flux', 'api/worker', 'Writable paths', 'Desired values'],
    color: 'blue',
  },
  'sources-of-truth': {
    title: 'Sources of truth split',
    subtitle: 'Git owns desired config, OCI owns immutable artifacts, Kubernetes owns live status.',
    idea: 'Kapro separates long-term intent, runtime state, and artifact identity.',
    student: 'A student should not keep homework, lunch, and attendance in the same drawer. Kapro separates them. Hub config Git stores desired fleet configuration. OCI or another registry stores immutable artifacts. Kubernetes stores applied objects and live status. Kapro reads across those sources but does not blur their responsibilities.',
    example: 'Example: Git says prod-eu-1 exists and checkout-progressive is the plan; OCI stores checkout:v1.8.2; the hub status says prod-eu-1 converged.',
    impact: 'The impact is clearer debugging. When something is wrong, teams know whether to inspect Git intent, artifact identity, or live Kubernetes status.',
    nodes: ['Hub Git', 'Artifact registry', 'Hub cluster', 'Backend cluster', 'Evidence'],
    notes: ['Desired config', 'Immutable version', 'CRDs/status', 'Local reconcile', 'What happened'],
    color: 'green',
  },
  'promotionrun-fsm': {
    title: 'Target state machine',
    subtitle: 'Every target moves through visible phases before success or rollback.',
    idea: 'The lifecycle makes a promotion explainable and restartable.',
    student: 'A safe promotion is not one jump. It is a checklist. Pending means the target is selected but not active. Verification checks identity and policy. Health and metrics checks prove the cluster is safe. WaitingApproval pauses for people when required. Applying hands work to the backend. Converged means the desired version is healthy. Failed and RolledBack are visible terminal outcomes.',
    example: 'Example: prod-eu-1 moves Pending -> Verification -> WaitingApproval -> Applying -> Converged, while prod-us stays Pending because maxParallel is full.',
    impact: 'The impact is explainability. Operators can see the exact phase and reason instead of reading a long CI log.',
    nodes: ['Pending', 'Verification', 'Health/metrics', 'Approval', 'Applying', 'Converged'],
    notes: ['Selected', 'Policy', 'Evidence', 'Human gate', 'Backend', 'Success'],
    color: 'purple',
  },
  actuators: {
    title: 'Backend adapter actuation',
    subtitle: 'Adapters translate Kapro target permission into backend-native work.',
    idea: 'Actuators are the apply boundary between Kapro and delivery systems.',
    student: 'Kapro speaks promotion language. Backends speak their own language. The adapter is the translator. When a PromotionTarget is allowed to apply, the adapter turns that into an Argo source update, Flux source revision, Helm action, or plugin call. Kapro then waits for normalized evidence.',
    example: 'Example: the Flux adapter updates a HelmRelease version field and returns Ready evidence when Flux converges.',
    impact: 'The impact is backend independence. Kapro can coordinate many delivery styles while keeping the same PromotionRun phases.',
    nodes: ['Allowed target', 'Adapter', 'Backend object', 'Backend health', 'Normalized evidence'],
    notes: ['Kapro phase', 'Translate', 'Argo/Flux/Helm', 'Ready', 'Target status'],
    color: 'orange',
  },
  gates: {
    title: 'Gate evaluation',
    subtitle: 'Gates answer whether a target may advance right now.',
    idea: 'Gates turn safety checks into promotion decisions.',
    student: 'A gate is like a checkpoint on a field trip. The group can continue only if the condition is true. Kapro gates can check signatures, cluster health, Prometheus metrics, soak time, manual approval, or plugin evidence. The result is stored so people can see why a target moved or stopped.',
    example: 'Example: canary passes health but fails the error-rate query, so production targets remain Pending and the PromotionRun reports the failed gate evidence.',
    impact: 'The impact is consistent safety. Instead of every team writing its own bash checks, PromotionPlans reuse declared gates.',
    nodes: ['Target ready', 'Gate policy', 'Evidence query', 'Pass/fail', 'Advance or stop'],
    notes: ['Candidate', 'Rules', 'Metrics/health', 'Decision', 'State change'],
    color: 'red',
  },
  'plugins-and-conformance': {
    title: 'Plugin conformance',
    subtitle: 'External integrations prove they follow Kapro contracts.',
    idea: 'Conformance tests make plugin behavior predictable before production use.',
    student: 'If plugins can influence promotions, they must be tested like any other safety-critical part. Conformance checks ask whether an adapter, gate, or planner handles expected requests, errors, timeouts, and response shapes. This lets teams trust plugin output without reading every implementation.',
    example: 'Example: a KGI gate plugin must return a normalized pass, fail, or error result with evidence that Kapro can store on the PromotionTarget.',
    impact: 'The impact is ecosystem safety. Teams can extend Kapro while preserving deterministic controller behavior.',
    nodes: ['Plugin author', 'KAI/KGI/KPI contract', 'Conformance tests', 'Ready registration', 'Kapro runtime'],
    notes: ['Build plugin', 'API shape', 'Verify behavior', 'Declare support', 'Safe calls'],
    color: 'blue',
  },
  'agent-policies': {
    title: 'AgentPolicy guardrails',
    subtitle: 'Agents can explain and recommend, but controllers enforce.',
    idea: 'AgentPolicy defines boundaries for future agent-assisted workflows.',
    student: 'An agent can be a helpful tutor, but it should not secretly change grades. In Kapro, agents may summarize a failed promotion, suggest rollback, or draft an explanation. They must not bypass RBAC, gates, approvals, admission checks, or the PromotionRun state machine.',
    example: 'Example: an agent reviews a failed metrics gate and recommends holding production, while the controller keeps the target Failed until an authorized workflow changes state.',
    impact: 'The impact is safe assistance. Teams get explanation and planning help without giving the agent unchecked production control.',
    nodes: ['Agent request', 'AgentPolicy', 'Recommendation', 'Human/controller', 'Enforced state'],
    notes: ['Explain/plan', 'Boundaries', 'No bypass', 'Approve/enforce', 'Kapro FSM'],
    color: 'purple',
  },
  'api-stability': {
    title: 'API stability levels',
    subtitle: 'Alpha, preview, and stable surfaces have different change expectations.',
    idea: 'API stability tells users how much migration risk to expect.',
    student: 'Not every school rule is equally permanent. Some are drafts, some are trial rules, and some are official policy. Kapro labels API surfaces so users know what can change. Alpha APIs can move quickly. Preview APIs are usable but still collecting feedback. Stable APIs should change carefully with migration paths.',
    example: 'Example: PromotionRun core lifecycle may be treated as a stronger contract than a preview AgentPolicy surface.',
    impact: 'The impact is trust. Users can decide what to build on today and what to test carefully before relying on in production.',
    nodes: ['Alpha', 'Preview', 'Stable', 'Migration', 'User decision'],
    notes: ['Fast change', 'Feedback phase', 'Careful change', 'Upgrade path', 'Adoption risk'],
    color: 'green',
  },
  events: {
    title: 'Lifecycle event stream',
    subtitle: 'Events describe important promotion changes for humans and systems.',
    idea: 'Event reference docs define the payloads external consumers can rely on.',
    student: 'Events are the announcements Kapro makes as promotions move. A student can think of them as timestamps on the classroom board: run started, gate failed, approval needed, target converged. Notification systems and audit tools can consume those announcements without scraping controller logs.',
    example: 'Example: kapro.promotiontarget.phase_changed tells a webhook that prod-eu-1 moved from Applying to Converged.',
    impact: 'The impact is integration. Chat bots, SIEM tools, dashboards, and incident workflows can react to the same lifecycle facts that Kapro records in status.',
    nodes: ['Controller change', 'CloudEvent', 'NotificationPolicy', 'Webhook/SIEM', 'Audit view'],
    notes: ['State update', 'Payload', 'Filter', 'External consumer', 'History'],
    color: 'orange',
  },
};

const colorMap = {
  blue: {fill: '#dbeafe', stroke: '#2563eb', note: '#eff6ff'},
  green: {fill: '#d1fae5', stroke: '#059669', note: '#ecfdf5'},
  orange: {fill: '#ffedd5', stroke: '#ea580c', note: '#fff7ed'},
  purple: {fill: '#ede9fe', stroke: '#7c3aed', note: '#f5f3ff'},
  red: {fill: '#fee2e2', stroke: '#dc2626', note: '#fff1f2'},
} as const;

type LayoutKind = 'pipeline' | 'stack' | 'state' | 'swimlane' | 'hub' | 'repo' | 'waves' | 'fanout' | 'matrix' | 'loop' | 'split';
type Palette = (typeof colorMap)[keyof typeof colorMap];

const layoutById: Record<DiagramId, LayoutKind> = {
  intro: 'pipeline',
  installation: 'stack',
  'kind-demo': 'loop',
  operations: 'matrix',
  'hub-config': 'pipeline',
  'fleet-discovery': 'fanout',
  'e2e-validation': 'pipeline',
  argo: 'swimlane',
  'approval-gates': 'state',
  'retail-fleet': 'waves',
  flux: 'swimlane',
  'progressive-rollout': 'waves',
  'hub-config-repository': 'repo',
  'core-objects': 'hub',
  'artifact-contract': 'pipeline',
  notifications: 'fanout',
  'backend-profiles': 'pipeline',
  'promotion-targets': 'state',
  'promotionplans-and-waves': 'waves',
  architecture: 'stack',
  'promotion-units': 'hub',
  promotionruns: 'pipeline',
  'fleet-clusters': 'hub',
  'greenfield-and-brownfield': 'pipeline',
  'backend-ownership': 'swimlane',
  approvals: 'state',
  'automation-and-triggers': 'pipeline',
  'plugin-registrations': 'hub',
  'promotion-sources': 'pipeline',
  'sources-of-truth': 'pipeline',
  'promotionrun-fsm': 'state',
  actuators: 'swimlane',
  gates: 'state',
  'plugins-and-conformance': 'pipeline',
  'agent-policies': 'pipeline',
  'api-stability': 'matrix',
  events: 'fanout',
};

function wrapText(text: string, max = 18) {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function wrapLongText(text: string, max = 86) {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 4);
}

function SvgText({
  text,
  x,
  y,
  max = 18,
  className = 'concept-diagram__node-title',
  lineHeight = 16,
  lines = 3,
}: {
  text: string;
  x: number;
  y: number;
  max?: number;
  className?: string;
  lineHeight?: number;
  lines?: number;
}) {
  return (
    <text className={className} x={x} y={y}>
      {wrapText(text, max).slice(0, lines).map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function NodeBox({
  x,
  y,
  width,
  height,
  label,
  note,
  fill,
  stroke,
  rx = 8,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  note: string;
  fill: string;
  stroke: string;
  rx?: number;
}) {
  const compact = height < 82;
  const titleMax = Math.max(10, Math.floor((width - 28) / 7.4));
  const noteMax = Math.max(12, Math.floor((width - 28) / 6.6));
  const titleLines = compact && label.length <= titleMax ? 1 : 2;
  const noteLines = compact && titleLines > 1 ? 0 : height < 90 ? 1 : 2;
  const noteY = compact ? y + height - 14 : y + height - 30;

  return (
    <g>
      <rect
        fill={fill}
        height={height}
        rx={rx}
        stroke={stroke}
        strokeWidth="2"
        width={width}
        x={x}
        y={y}
      />
      <SvgText lines={titleLines} max={titleMax} text={label} x={x + 14} y={y + 27} />
      <SvgText className="concept-diagram__node-note" lineHeight={14} lines={noteLines} max={noteMax} text={note} x={x + 14} y={noteY} />
    </g>
  );
}

function ArrowLine({
  x1,
  y1,
  x2,
  y2,
  stroke,
  arrowId,
  dashed = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  arrowId: string;
  dashed?: boolean;
}) {
  return (
    <line
      className="concept-diagram__arrow"
      markerEnd={`url(#${arrowId})`}
      stroke={stroke}
      strokeDasharray={dashed ? '8 7' : undefined}
      strokeLinecap="round"
      strokeWidth="2.4"
      x1={x1}
      x2={x2}
      y1={y1}
      y2={y2}
    />
  );
}

function ArrowPath({
  d,
  stroke,
  arrowId,
  dashed = false,
}: {
  d: string;
  stroke: string;
  arrowId: string;
  dashed?: boolean;
}) {
  return (
    <path
      className="concept-diagram__arrow"
      d={d}
      fill="none"
      markerEnd={`url(#${arrowId})`}
      stroke={stroke}
      strokeDasharray={dashed ? '8 7' : undefined}
      strokeLinejoin="round"
      strokeLinecap="round"
      strokeWidth="2.4"
    />
  );
}

function DiagramDefs({arrowId, colors}: {arrowId: string; colors: Palette}) {
  return (
    <defs>
      <marker id={arrowId} markerHeight="10" markerWidth="10" orient="auto" refX="8" refY="5">
        <path d="M 0 0 L 10 5 L 0 10 L 2.4 5 z" fill={colors.stroke} />
      </marker>
      <filter id={`${arrowId}-shadow`} x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="5" floodColor="#172033" floodOpacity="0.12" stdDeviation="4" />
      </filter>
    </defs>
  );
}

function ElbowArrow({
  from,
  to,
  stroke,
  arrowId,
  dashed = false,
  midX,
  midY,
}: {
  from: {x: number; y: number};
  to: {x: number; y: number};
  stroke: string;
  arrowId: string;
  dashed?: boolean;
  midX?: number;
  midY?: number;
}) {
  const d =
    midY !== undefined
      ? `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${midY} L ${to.x} ${to.y}`
      : `M ${from.x} ${from.y} L ${midX ?? (from.x + to.x) / 2} ${from.y} L ${midX ?? (from.x + to.x) / 2} ${to.y} L ${to.x} ${to.y}`;
  return <ArrowPath arrowId={arrowId} d={d} dashed={dashed} stroke={stroke} />;
}

function ExampleNote({diagram, colors, x = 36, y = 308, width = 888}: {diagram: ConceptDiagramData; colors: Palette; x?: number; y?: number; width?: number}) {
  const exampleText = diagram.example.replace(/^Example:\s*/, '');
  return (
    <g>
      <rect fill={colors.note} height="76" rx="14" stroke={colors.stroke} strokeWidth="2" width={width} x={x} y={y} />
      <text className="concept-diagram__sticky" x={x + 18} y={y + 26}>
        <tspan x={x + 18} dy="0">
          Example:
        </tspan>
        {wrapLongText(exampleText, 104).slice(0, 2).map((line, index) => (
          <tspan key={`${line}-${index}`} x={x + 18} dy={index === 0 ? 18 : 16}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function renderPipeline(diagram: ConceptDiagramData, colors: Palette, arrowId: string) {
  const width = 1040;
  const nodes = diagram.nodes.slice(0, 6);
  const w = nodes.length > 5 ? 142 : 158;
  const gap = (width - 72 - nodes.length * w) / Math.max(1, nodes.length - 1);
  return (
    <svg viewBox={`0 0 ${width} 410`} preserveAspectRatio="xMinYMin meet">
      <DiagramDefs arrowId={arrowId} colors={colors} />
      <rect className="concept-diagram__paper" height="390" rx="18" width="1024" x="8" y="8" />
      <SvgText className="concept-diagram__sketch-title" max={106} text={diagram.idea} x={36} y={44} />
      {nodes.map((node, index) => {
        const x = 36 + index * (w + gap);
        const active = index === Math.floor(nodes.length / 2);
        return (
          <g key={node} filter={active ? `url(#${arrowId}-shadow)` : undefined}>
            {index > 0 ? <ArrowLine arrowId={arrowId} stroke={colors.stroke} x1={x - gap + 6} x2={x - 8} y1={136} y2={136} /> : null}
            <NodeBox fill={active ? colors.fill : '#ffffff'} height={116} label={node} note={diagram.notes[index] ?? ''} stroke={active ? colors.stroke : '#334155'} width={w} x={x} y={78} />
          </g>
        );
      })}
      <ExampleNote colors={colors} diagram={diagram} width={968} />
    </svg>
  );
}

function renderStack(diagram: ConceptDiagramData, colors: Palette, arrowId: string) {
  const width = 960;
  const nodes = diagram.nodes.slice(0, 6);
  return (
    <svg viewBox={`0 0 ${width} 560`} preserveAspectRatio="xMinYMin meet">
      <DiagramDefs arrowId={arrowId} colors={colors} />
      <rect className="concept-diagram__paper" height="540" rx="18" width="944" x="8" y="8" />
      <SvgText className="concept-diagram__sketch-title" max={90} text={diagram.idea} x={36} y={42} />
      {nodes.map((node, index) => {
        const y = 72 + index * 60;
        const active = index === Math.floor(nodes.length / 2);
        return (
          <g key={node}>
            <circle cx="122" cy={y + 25} fill={active ? colors.stroke : '#64748b'} r="11" />
            <text className="concept-diagram__step-number" x="118" y={y + 30}>{index + 1}</text>
            <rect fill={active ? colors.fill : '#ffffff'} height="50" rx="8" stroke={active ? colors.stroke : '#334155'} strokeWidth="2" width="720" x="156" y={y} />
            <SvgText className="concept-diagram__node-title" lines={1} max={28} text={node} x={178} y={y + 24} />
            <SvgText className="concept-diagram__node-note" lines={2} max={46} text={diagram.notes[index] ?? ''} x={468} y={y + 22} />
            {index < nodes.length - 1 ? <ArrowLine arrowId={arrowId} stroke={colors.stroke} x1={122} x2={122} y1={y + 42} y2={y + 72} /> : null}
          </g>
        );
      })}
      <ExampleNote colors={colors} diagram={diagram} y={448} />
    </svg>
  );
}

function renderState(diagram: ConceptDiagramData, colors: Palette, arrowId: string) {
  const width = 1040;
  const nodes = diagram.nodes.slice(0, 6);
  const w = nodes.length > 5 ? 132 : 150;
  const startX = 36;
  const gap = (width - 64 - nodes.length * w) / Math.max(1, nodes.length - 1);
  const positions = nodes.map((node, index) => ({node, x: startX + index * (w + gap), y: 82}));
  const activeIndex = Math.floor(nodes.length / 2);
  const active = positions[activeIndex] ?? positions[0];
  const last = positions[positions.length - 1] ?? positions[0];
  return (
    <svg viewBox={`0 0 ${width} 430`} preserveAspectRatio="xMinYMin meet">
      <DiagramDefs arrowId={arrowId} colors={colors} />
      <rect className="concept-diagram__paper" height="410" rx="18" width="1024" x="8" y="8" />
      <SvgText className="concept-diagram__sketch-title" max={104} text={diagram.idea} x={36} y={42} />
      {positions.map(({node, x, y}, index) => {
        const isActive = index === activeIndex;
        return (
          <g key={node}>
            {index > 0 ? <ArrowLine arrowId={arrowId} stroke={colors.stroke} x1={x - gap + 12} x2={x - 16} y1={y + 44} y2={y + 44} /> : null}
            <NodeBox fill={isActive ? colors.fill : '#ffffff'} height={88} label={node} note={diagram.notes[index] ?? ''} rx={44} stroke={isActive ? colors.stroke : '#334155'} width={w} x={x} y={y} />
          </g>
        );
      })}
      {active ? <ElbowArrow arrowId={arrowId} dashed from={{x: active.x + w / 2, y: 174}} midY={204} stroke="#dc2626" to={{x: 520, y: 220}} /> : null}
      <NodeBox fill="#fff1f2" height={76} label="Failed / rollback" note="Stop, revert, notify" stroke="#dc2626" width={194} x={423} y={220} />
      {last ? <ElbowArrow arrowId={arrowId} dashed from={{x: 617, y: 258}} midY={200} stroke="#dc2626" to={{x: last.x + w / 2, y: 174}} /> : null}
      <ExampleNote colors={colors} diagram={diagram} width={968} y={326} />
    </svg>
  );
}

function renderSwimlane(diagram: ConceptDiagramData, colors: Palette, arrowId: string) {
  const width = 960;
  const lanes = ['Kapro hub', 'Backend', 'Evidence'];
  const nodes = diagram.nodes.slice(0, 5);
  const laneY = [78, 158, 238];
  const laneFor = [0, 0, 1, 1, 2];
  const nodeW = 138;
  const nodeH = 58;
  return (
    <svg viewBox={`0 0 ${width} 430`} preserveAspectRatio="xMinYMin meet">
      <DiagramDefs arrowId={arrowId} colors={colors} />
      <rect className="concept-diagram__paper" height="410" rx="18" width="944" x="8" y="8" />
      <SvgText className="concept-diagram__sketch-title" max={90} text={diagram.idea} x={36} y={42} />
      {lanes.map((lane, index) => (
        <g key={lane}>
          <rect fill={index === 1 ? colors.note : '#f8fafc'} height="64" rx="8" stroke="#cbd5e1" width="884" x="60" y={laneY[index]} />
          <text className="concept-diagram__lane-label" x="80" y={laneY[index] + 39}>{lane}</text>
        </g>
      ))}
      {nodes.map((node, index) => {
        const lane = laneFor[index] ?? 1;
        const x = 174 + index * 158;
        const y = laneY[lane] + 3;
        const previousLane = laneFor[index - 1] ?? 0;
        const previousX = 174 + (index - 1) * 158;
        const previousY = laneY[previousLane] + 3;
        return (
          <g key={node}>
            {index > 0 ? (
              previousLane === lane ? (
                <ArrowLine arrowId={arrowId} stroke={colors.stroke} x1={previousX + nodeW + 6} x2={x - 8} y1={y + nodeH / 2} y2={y + nodeH / 2} />
              ) : (
                <ElbowArrow arrowId={arrowId} from={{x: previousX + nodeW + 6, y: previousY + nodeH / 2}} stroke={colors.stroke} to={{x: x - 8, y: y + nodeH / 2}} />
              )
            ) : null}
            <NodeBox fill={index === 2 ? colors.fill : '#ffffff'} height={nodeH} label={node} note={diagram.notes[index] ?? ''} stroke={index === 2 ? colors.stroke : '#334155'} width={nodeW} x={x} y={y} />
          </g>
        );
      })}
      <ExampleNote colors={colors} diagram={diagram} y={326} />
    </svg>
  );
}

function renderHub(diagram: ConceptDiagramData, colors: Palette, arrowId: string) {
  const width = 960;
  const nodes = diagram.nodes.slice(0, 6);
  const center = nodes[Math.floor(nodes.length / 2)] ?? nodes[0];
  const around = nodes.filter((node) => node !== center);
  const points = [
    [78, 92],
    [704, 92],
    [78, 232],
    [704, 232],
    [386, 300],
  ];
  const centerBox = {x: 370, y: 132, w: 220, h: 112};
  return (
    <svg viewBox={`0 0 ${width} 520`} preserveAspectRatio="xMinYMin meet">
      <DiagramDefs arrowId={arrowId} colors={colors} />
      <rect className="concept-diagram__paper" height="500" rx="18" width="944" x="8" y="8" />
      <SvgText className="concept-diagram__sketch-title" max={90} text={diagram.idea} x={36} y={42} />
      <NodeBox fill={colors.fill} height={centerBox.h} label={center} note={diagram.notes[nodes.indexOf(center)] ?? ''} stroke={colors.stroke} width={centerBox.w} x={centerBox.x} y={centerBox.y} />
      {around.map((node, index) => {
        const [x, y] = points[index] ?? points[0];
        const nodeBox = {x, y, w: 178, h: 82};
        const nodeCenterY = nodeBox.y + nodeBox.h / 2;
        const isLeft = nodeBox.x < centerBox.x;
        const isTopOrSide = index < 4;
        const from = isTopOrSide
          ? {x: isLeft ? nodeBox.x + nodeBox.w + 12 : nodeBox.x - 12, y: nodeCenterY}
          : {x: centerBox.x + centerBox.w / 2, y: centerBox.y + centerBox.h + 12};
        const to = isTopOrSide
          ? {x: isLeft ? centerBox.x - 12 : centerBox.x + centerBox.w + 12, y: centerBox.y + centerBox.h / 2}
          : {x: nodeBox.x + nodeBox.w / 2, y: nodeBox.y - 12};
        return (
          <g key={node}>
            <ElbowArrow arrowId={arrowId} dashed={index % 2 === 1} from={from} stroke={colors.stroke} to={to} />
            <NodeBox fill="#ffffff" height={nodeBox.h} label={node} note={diagram.notes[nodes.indexOf(node)] ?? ''} stroke="#334155" width={nodeBox.w} x={nodeBox.x} y={nodeBox.y} />
          </g>
        );
      })}
      <ExampleNote colors={colors} diagram={diagram} y={408} />
    </svg>
  );
}

function renderRepo(diagram: ConceptDiagramData, colors: Palette, arrowId: string) {
  const width = 1040;
  const nodes = diagram.nodes.slice(0, 5);
  const folders = nodes.slice(0, 4);
  const action = nodes[4] ?? 'apply';
  return (
    <svg viewBox={`0 0 ${width} 500`} preserveAspectRatio="xMinYMin meet">
      <DiagramDefs arrowId={arrowId} colors={colors} />
      <rect className="concept-diagram__paper" height="480" rx="18" width="1024" x="8" y="8" />
      <SvgText className="concept-diagram__sketch-title" max={104} text={diagram.idea} x={36} y={42} />

      <NodeBox fill={colors.fill} height={118} label="hub-config repository" note="reviewed platform intent" stroke={colors.stroke} width={210} x={46} y={132} />
      <ArrowLine arrowId={arrowId} stroke={colors.stroke} x1={270} x2={330} y1={191} y2={191} />

      <rect fill="#f8fafc" height="242" rx="14" stroke="#cbd5e1" strokeWidth="2" width="388" x="344" y="86" />
      <SvgText className="concept-diagram__lane-label" max={36} text="Repository folders" x={366} y={118} />
      {folders.map((node, index) => {
        const x = 366 + (index % 2) * 178;
        const y = 140 + Math.floor(index / 2) * 86;
        return (
          <g key={node}>
            <NodeBox fill={index === 2 ? colors.fill : '#ffffff'} height={66} label={node} note={diagram.notes[index] ?? ''} stroke={index === 2 ? colors.stroke : '#334155'} width={156} x={x} y={y} />
          </g>
        );
      })}

      <ArrowLine arrowId={arrowId} stroke={colors.stroke} x1={744} x2={804} y1={191} y2={191} />
      <NodeBox fill="#ffffff" height={92} label={action} note={diagram.notes[4] ?? 'Hub sync'} stroke="#334155" width={176} x={818} y={145} />
      <ElbowArrow arrowId={arrowId} dashed from={{x: 906, y: 250}} midY={284} stroke={colors.stroke} to={{x: 536, y: 332}} />
      <NodeBox fill={colors.note} height={68} label="Kapro hub" note="CRDs reconcile" stroke={colors.stroke} width={210} x={430} y={334} />

      <ExampleNote colors={colors} diagram={diagram} width={968} y={414} />
    </svg>
  );
}

function renderWaves(diagram: ConceptDiagramData, colors: Palette, arrowId: string) {
  const width = 1040;
  const nodes = diagram.nodes.slice(0, 5);
  const cardW = 150;
  const step = 190;
  return (
    <svg viewBox={`0 0 ${width} 430`} preserveAspectRatio="xMinYMin meet">
      <DiagramDefs arrowId={arrowId} colors={colors} />
      <rect className="concept-diagram__paper" height="410" rx="18" width="1024" x="8" y="8" />
      <SvgText className="concept-diagram__sketch-title" max={104} text={diagram.idea} x={36} y={42} />
      {nodes.map((node, index) => {
        const x = 48 + index * step;
        const active = index === Math.floor(nodes.length / 2);
        return (
          <g key={node}>
            {index > 0 ? <ArrowLine arrowId={arrowId} stroke={colors.stroke} x1={x - step + cardW + 18} x2={x - 18} y1={132} y2={132} /> : null}
            <rect fill={active ? colors.fill : '#ffffff'} height="178" rx="8" stroke={active ? colors.stroke : '#334155'} strokeWidth="2" width={cardW} x={x} y="78" />
            <SvgText text={node} x={x + 14} y={108} max={13} />
            <SvgText className="concept-diagram__node-note" lineHeight={14} max={13} text={diagram.notes[index] ?? ''} x={x + 14} y={142} />
            <circle cx={x + 34} cy="218" fill={colors.stroke} r="7" />
            <circle cx={x + 62} cy="218" fill={active ? colors.stroke : '#94a3b8'} r="7" />
            <circle cx={x + 90} cy="218" fill={active ? colors.stroke : '#cbd5e1'} r="7" />
          </g>
        );
      })}
      <ExampleNote colors={colors} diagram={diagram} width={968} y={326} />
    </svg>
  );
}

function renderFanout(diagram: ConceptDiagramData, colors: Palette, arrowId: string) {
  const width = 1040;
  const nodes = diagram.nodes.slice(0, 5);
  const source = nodes[0];
  const center = nodes[1] ?? nodes[0];
  const outputs = nodes.slice(2);
  return (
    <svg viewBox={`0 0 ${width} 430`} preserveAspectRatio="xMinYMin meet">
      <DiagramDefs arrowId={arrowId} colors={colors} />
      <rect className="concept-diagram__paper" height="410" rx="18" width="1024" x="8" y="8" />
      <SvgText className="concept-diagram__sketch-title" max={104} text={diagram.idea} x={36} y={42} />
      <NodeBox fill="#ffffff" height={96} label={source} note={diagram.notes[0] ?? ''} stroke="#334155" width={184} x={62} y={150} />
      <ArrowLine arrowId={arrowId} stroke={colors.stroke} x1={260} x2={354} y1={198} y2={198} />
      <NodeBox fill={colors.fill} height={110} label={center} note={diagram.notes[1] ?? ''} stroke={colors.stroke} width={196} x={368} y={143} />
      {outputs.map((node, index) => {
        const y = 86 + index * 82;
        return (
          <g key={node}>
            <ElbowArrow arrowId={arrowId} from={{x: 578, y: 198}} stroke={colors.stroke} to={{x: 724, y: y + 34}} />
            <NodeBox fill="#ffffff" height={68} label={node} note={diagram.notes[index + 2] ?? ''} stroke="#334155" width={230} x={740} y={y} />
          </g>
        );
      })}
      <ExampleNote colors={colors} diagram={diagram} width={968} y={326} />
    </svg>
  );
}

function renderMatrix(diagram: ConceptDiagramData, colors: Palette, arrowId: string) {
  const width = 960;
  const nodes = diagram.nodes.slice(0, 6);
  return (
    <svg viewBox={`0 0 ${width} 430`} preserveAspectRatio="xMinYMin meet">
      <DiagramDefs arrowId={arrowId} colors={colors} />
      <rect className="concept-diagram__paper" height="410" rx="18" width="944" x="8" y="8" />
      <SvgText className="concept-diagram__sketch-title" max={90} text={diagram.idea} x={36} y={42} />
      {nodes.map((node, index) => {
        const x = 70 + (index % 3) * 276;
        const y = 86 + Math.floor(index / 3) * 112;
        const active = index === Math.floor(nodes.length / 2);
        return <NodeBox key={node} fill={active ? colors.fill : '#ffffff'} height={86} label={node} note={diagram.notes[index] ?? ''} stroke={active ? colors.stroke : '#334155'} width={220} x={x} y={y} />;
      })}
      <ArrowLine arrowId={arrowId} stroke={colors.stroke} x1={284} x2={340} y1={129} y2={129} />
      <ArrowLine arrowId={arrowId} stroke={colors.stroke} x1={560} x2={616} y1={129} y2={129} />
      <ArrowLine arrowId={arrowId} stroke={colors.stroke} x1={284} x2={340} y1={241} y2={241} />
      <ArrowLine arrowId={arrowId} stroke={colors.stroke} x1={560} x2={616} y1={241} y2={241} />
      <ExampleNote colors={colors} diagram={diagram} y={326} />
    </svg>
  );
}

function renderLoop(diagram: ConceptDiagramData, colors: Palette, arrowId: string) {
  const width = 960;
  const nodes = diagram.nodes.slice(0, 5);
  const points = [
    [390, 66],
    [654, 128],
    [554, 242],
    [224, 242],
    [126, 128],
  ];
  return (
    <svg viewBox={`0 0 ${width} 430`} preserveAspectRatio="xMinYMin meet">
      <DiagramDefs arrowId={arrowId} colors={colors} />
      <rect className="concept-diagram__paper" height="410" rx="18" width="944" x="8" y="8" />
      <SvgText className="concept-diagram__sketch-title" max={90} text={diagram.idea} x={36} y={42} />
      <path d="M 470 130 C 660 124, 706 300, 480 306 C 248 306, 228 126, 392 124" fill="none" stroke={colors.stroke} strokeDasharray="10 8" strokeLinecap="round" strokeWidth="3" />
      {nodes.map((node, index) => {
        const [x, y] = points[index] ?? points[0];
        return (
          <g key={node}>
            <NodeBox fill={index === 2 ? colors.fill : '#ffffff'} height={76} label={node} note={diagram.notes[index] ?? ''} stroke={index === 2 ? colors.stroke : '#334155'} width={180} x={x} y={y} />
          </g>
        );
      })}
      <ArrowPath arrowId={arrowId} d="M 560 104 C 636 104, 664 122, 674 150" stroke={colors.stroke} />
      <ArrowPath arrowId={arrowId} d="M 686 204 C 674 252, 642 278, 590 282" stroke={colors.stroke} />
      <ArrowPath arrowId={arrowId} d="M 514 280 C 430 308, 326 300, 310 280" stroke={colors.stroke} />
      <ArrowPath arrowId={arrowId} d="M 222 220 C 160 198, 146 174, 172 148" stroke={colors.stroke} />
      <ExampleNote colors={colors} diagram={diagram} y={326} />
    </svg>
  );
}

function renderSplit(diagram: ConceptDiagramData, colors: Palette, arrowId: string) {
  const width = 960;
  const nodes = diagram.nodes.slice(0, 5);
  return (
    <svg viewBox={`0 0 ${width} 430`} preserveAspectRatio="xMinYMin meet">
      <DiagramDefs arrowId={arrowId} colors={colors} />
      <rect className="concept-diagram__paper" height="410" rx="18" width="944" x="8" y="8" />
      <SvgText className="concept-diagram__sketch-title" max={90} text={diagram.idea} x={36} y={42} />
      <rect fill="#f8fafc" height="210" rx="12" stroke="#cbd5e1" strokeWidth="2" width="390" x="50" y="78" />
      <rect fill={colors.note} height="210" rx="12" stroke="#cbd5e1" strokeWidth="2" width="390" x="520" y="78" />
      <NodeBox fill="#ffffff" height={86} label={nodes[0] ?? 'Input'} note={diagram.notes[0] ?? ''} stroke="#334155" width={220} x={76} y={116} />
      <NodeBox fill={colors.fill} height={92} label={nodes[2] ?? 'Kapro decision'} note={diagram.notes[2] ?? ''} stroke={colors.stroke} width={190} x={385} y={113} />
      <NodeBox fill="#ffffff" height={86} label={nodes[1] ?? 'Output'} note={diagram.notes[1] ?? ''} stroke="#334155" width={220} x={666} y={116} />
      <ArrowLine arrowId={arrowId} stroke={colors.stroke} x1={310} x2={371} y1={159} y2={159} />
      <ArrowLine arrowId={arrowId} stroke={colors.stroke} x1={589} x2={652} y1={159} y2={159} />
      <NodeBox fill="#ffffff" height={70} label={nodes[3] ?? 'Result'} note={diagram.notes[3] ?? ''} stroke="#334155" width={176} x={214} y={242} />
      <NodeBox fill="#ffffff" height={70} label={nodes[4] ?? 'Evidence'} note={diagram.notes[4] ?? ''} stroke="#334155" width={176} x={618} y={242} />
      <ElbowArrow arrowId={arrowId} from={{x: 480, y: 211}} midY={228} stroke={colors.stroke} to={{x: 302, y: 240}} />
      <ElbowArrow arrowId={arrowId} from={{x: 480, y: 211}} midY={228} stroke={colors.stroke} to={{x: 706, y: 240}} />
      <ExampleNote colors={colors} diagram={diagram} y={326} />
    </svg>
  );
}

function renderDiagramSvg(id: DiagramId, diagram: ConceptDiagramData, colors: Palette) {
  const arrowId = `concept-arrow-${id}`;
  const layout = layoutById[id];
  switch (layout) {
    case 'stack':
      return renderStack(diagram, colors, arrowId);
    case 'state':
      return renderState(diagram, colors, arrowId);
    case 'swimlane':
      return renderSwimlane(diagram, colors, arrowId);
    case 'hub':
      return renderHub(diagram, colors, arrowId);
    case 'repo':
      return renderRepo(diagram, colors, arrowId);
    case 'waves':
      return renderWaves(diagram, colors, arrowId);
    case 'fanout':
      return renderFanout(diagram, colors, arrowId);
    case 'matrix':
      return renderMatrix(diagram, colors, arrowId);
    case 'loop':
      return renderLoop(diagram, colors, arrowId);
    case 'split':
      return renderSplit(diagram, colors, arrowId);
    case 'pipeline':
    default:
      return renderPipeline(diagram, colors, arrowId);
  }
}

export default function ConceptDiagram({id}: {id: DiagramId}) {
  const diagram = diagrams[id];
  if (!diagram) {
    return null;
  }
  const colors = colorMap[diagram.color];

  return (
    <section className={clsx('concept-diagram', `concept-diagram--${diagram.color}`)}>
      <div className="concept-diagram__intro">
        <span className="concept-diagram__eyebrow">Topic diagram</span>
        <h2>{diagram.title}</h2>
        <p>{diagram.subtitle}</p>
      </div>
      <div className="concept-diagram__canvas" role="img" aria-label={`${diagram.title}: ${diagram.subtitle}`}>
        {renderDiagramSvg(id, diagram, colors)}
      </div>
      <div className="concept-diagram__lesson">
        <h3>Student Walkthrough</h3>
        <p>
          {diagram.student} {diagram.example} {diagram.impact}
        </p>
        <p>
          Read the drawing by following the arrows, lanes, layers, or grouped
          areas. The highlighted shape is the main Kapro decision or control
          point, while the surrounding shapes show the inputs, backend work, and
          evidence someone can inspect later. When you try the concept yourself,
          create or inspect the object named in the most central node, follow the
          next arrow or connected group, and ask what information changed. That
          habit makes the docs practical: you are not memorizing names, you are
          learning how intent becomes a controlled promotion and how Kapro proves
          the result.
        </p>
        <p>
          A useful exercise is to change one label, version, gate, or backend
          field from the example and predict which node in the sketch changes
          first. Then compare that prediction with `kubectl get` and `kubectl
          describe` output. If the prediction matches the status, the concept is
          understood well enough to use in a real onboarding conversation.
        </p>
      </div>
    </section>
  );
}
