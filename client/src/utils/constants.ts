import { INavLink, IPlan, ISystemModule } from '../types';

export const APP_NAME = 'BizNexus';
export const APP_TAGLINE = 'Smart Business Management System';

export const NAV_LINKS: INavLink[] = [
  { label: 'Home', path: '/' },
  { label: 'Features', path: '/features' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Register Business', path: '/register-business' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export const PLANS: IPlan[] = [
  {
    id: 'starter',
    name: 'Starter Tier',
    description: 'Designed for single-location businesses and agile startups establishing their foundation.',
    priceMonthly: 29,
    priceAnnual: 24, // per month billed annually
    badge: 'Core Essentials',
    highlight: false,
    features: [
      'Single business entity configuration',
      'Up to 3 team seats with role permissions',
      'Smart invoicing & quotation generator',
      'Basic inventory & stock alerts',
      'Standard financial ledgers (Cash/Accrual)',
      'Community & email support',
      'Daily automated data snapshots'
    ],
    ctaText: 'Start 14-Day Free Trial',
    ctaLink: '/register?plan=starter'
  },
  {
    id: 'growth',
    name: 'Growth & Multi-Branch',
    description: 'Optimal for expanding companies managing multi-unit operations and cross-department workflows.',
    priceMonthly: 79,
    priceAnnual: 65,
    badge: 'Most Popular',
    highlight: true,
    features: [
      'Up to 3 distinct business entities / branches',
      'Up to 15 team seats with customized RBAC',
      'Advanced multi-currency & tax matrix',
      'Automated recurring billing & client portal',
      'Multi-warehouse inventory synchronization',
      'Audit trails & activity logging',
      'Priority ticket & chat support (4h SLA)',
      'REST API access for ERP integrations'
    ],
    ctaText: 'Start 14-Day Free Trial',
    ctaLink: '/register?plan=growth'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Scale',
    description: 'Tailored for conglomerate operations, franchisors, and businesses needing dedicated compliance.',
    priceMonthly: 199,
    priceAnnual: 169,
    badge: 'Maximum Power',
    highlight: false,
    features: [
      'Unlimited business entities & subsidiaries',
      'Unlimited users with granular permissions',
      'Consolidated multi-business analytics & reporting',
      'Dedicated compliance & audit logging',
      'Custom webhook triggers & bi-directional sync',
      'Custom invoice branding & white-label domain',
      '24/7 dedicated account manager & 1h SLA',
      'Custom onboarding & historical data migration'
    ],
    ctaText: 'Contact Enterprise Sales',
    ctaLink: '/contact?subject=Enterprise%20Inquiry'
  }
];

export const SYSTEM_MODULES: ISystemModule[] = [
  {
    id: 'multi-tenant',
    title: 'Multi-Tenant Entity Architecture',
    subtitle: 'Unified Oversight Across Multiple Business Units',
    description: 'Effortlessly switch between different registered legal entities, branch offices, or client ventures from a single secure login while strictly maintaining partitioned data isolation.',
    iconName: 'Building2',
    color: 'blue'
  },
  {
    id: 'financial-ledger',
    title: 'Automated Financial Operations',
    subtitle: 'Real-Time Double-Entry Ledgers & Invoicing',
    description: 'Generate multi-currency invoices, track receivables, automate recurring subscription collections, and maintain clean audit trails for fiscal compliance.',
    iconName: 'Receipt',
    color: 'emerald'
  },
  {
    id: 'inventory-ops',
    title: 'Intelligent Inventory & Stock Management',
    subtitle: 'Predictive Stock Levels & Vendor Synchronization',
    description: 'Monitor stock across multiple warehouses or retail points with automated reorder triggers, batch tracking, and real-time inventory valuation.',
    iconName: 'Boxes',
    color: 'indigo'
  },
  {
    id: 'workforce-rbac',
    title: 'Granular Role-Based Access Control',
    subtitle: 'Empower Teams Without Compromising Data Governance',
    description: 'Assign tailored permissions (Owner, Admin, Accountant, Inventory Specialist, Read-only Auditor) with activity logging and IP tracking.',
    iconName: 'ShieldCheck',
    color: 'amber'
  },
  {
    id: 'analytics-engine',
    title: 'Real-Time Executive Analytics',
    subtitle: 'Actionable Intelligence from Raw Operational Data',
    description: 'Visualize gross margins, burn rate, cash flow forecasts, inventory turnaround, and team throughput through interactive charting components.',
    iconName: 'BarChart3',
    color: 'cyan'
  },
  {
    id: 'security-compliance',
    title: 'Enterprise-Grade Reliability & Security',
    subtitle: 'Encrypted Data at Rest & in Flight with 99.9% Uptime Target',
    description: 'Built with industry-standard TLS encryption, strict CORS, structured request validation, and resilient MongoDB Atlas multi-region backups.',
    iconName: 'Lock',
    color: 'violet'
  }
];

