import { 
  ShieldCheck, 
  BarChart3, 
  Database, 
  Network, 
  TrendingUp, 
  Clock, 
  PackageCheck,
  Zap
} from 'lucide-react';

export const NAVIGATION = [
  { name: 'Modules', href: '#modules' },
  { name: 'Roadmap', href: '#roadmap' },
  { name: 'Impact', href: '#impact' },
  { name: 'Tech Stack', href: '#tech' },
];

export const FEATURES = [
  {
    title: 'Portal Core Modules',
    description: 'Comprehensive management including PE certification, DO/Return logging, and compliance repositories. Zero disputes through automated tracking.',
    icon: ShieldCheck,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Demand Generation Engine',
    description: 'Automated landing pages, email sequences, and prospecting database automation to drive growth and liquidity.',
    icon: Zap,
    color: 'bg-red-100 text-red-600'
  },
  {
    title: 'Market Intelligence',
    description: 'Advanced analytics transforming GA drawings to rental value. DealMap360 and Deal Architecture for precise targeting.',
    icon: BarChart3,
    color: 'bg-green-100 text-green-600'
  },
  {
    title: 'Secure IT Infrastructure',
    description: 'Scalable, secure hosting with unified access rights and compliance-ready audit trails backed by Azure.',
    icon: Database,
    color: 'bg-purple-100 text-purple-600'
  },
];

export const PHASES = [
  {
    phase: 'Phase 1',
    title: 'MVP',
    duration: '3–4 Months',
    items: ['Portal Core Modules', 'Demand Gen Engine', 'Market Intelligence', 'Base IT Infra'],
    status: 'current'
  },
  {
    phase: 'Phase 2',
    title: 'Product Bundling',
    duration: 'Expansion',
    items: ['Certified Products Integration', 'Bundled Pricing', 'Cross-sell Enablement'],
    status: 'upcoming'
  },
  {
    phase: 'Phase 3',
    title: 'VMI Rollout',
    duration: 'Optimization',
    items: ['Real-time Buyer Stock Visibility', 'Auto-replenishment', 'Certification-tied Logic'],
    status: 'upcoming'
  },
  {
    phase: 'Phase 4',
    title: 'Peer Residency',
    duration: 'Ecosystem',
    items: ['Peer Player Invitation', 'Platform Liquidity Boost', 'Network Disintermediation'],
    status: 'upcoming'
  }
];

export const METRICS_DATA = [
  { name: 'Month 1', disputes: 12, collections: 75, idleStock: 100 },
  { name: 'Month 2', disputes: 8, collections: 80, idleStock: 90 },
  { name: 'Month 3', disputes: 5, collections: 85, idleStock: 80 },
  { name: 'Month 4', disputes: 2, collections: 88, idleStock: 70 },
  { name: 'Month 5', disputes: 1, collections: 92, idleStock: 60 },
  { name: 'Month 6', disputes: 0, collections: 95, idleStock: 50 },
];

export const SUCCESS_METRICS = [
  {
    label: 'Disputes in 6 Months',
    value: 'Zero',
    subtext: 'Automated compliance & logging',
    icon: ShieldCheck
  },
  {
    label: 'On-time Collections',
    value: '>90%',
    subtext: 'Improved cash flow velocity',
    icon: Clock
  },
  {
    label: 'Idle Stock Reduction',
    value: '50%',
    subtext: 'Optimized inventory utilization',
    icon: PackageCheck
  },
  {
    label: 'GTM Pipeline',
    value: 'Live',
    subtext: 'Day 1 readiness',
    icon: TrendingUp
  }
];
