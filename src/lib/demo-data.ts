/**
 * Demo Data Configuration
 * Production-like data for testing and demonstrations
 */

import { GridRow } from '@/components/dashboard/ReportingGrid';
import { WhatIfScenario } from '@/components/dashboard/WhatIfPanel';
import { PeerOrganization } from '@/components/dashboard/PeerComparison';

/**
 * Generate realistic monthly data
 */
export function generateMonthlyData(months: number = 12): GridRow[] {
  const currentDate = new Date();
  const data: GridRow[] = [];
  
  for (let i = 0; i < months; i++) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Base values with seasonal variation
    const seasonalFactor = 1 + (Math.sin(i * Math.PI / 6) * 0.1);
    const actualPEPM = (45000 + Math.random() * 10000) * seasonalFactor;
    const targetPEPM = 50000;
    const variance = actualPEPM - targetPEPM;
    
    // Generate line items
    const lineItems: GridRow[] = [
      {
        id: `${i}-medical`,
        month: 'Medical',
        actualPEPM: actualPEPM * 0.7,
        targetPEPM: targetPEPM * 0.7,
        variance: variance * 0.7
      },
      {
        id: `${i}-dental`,
        month: 'Dental',
        actualPEPM: actualPEPM * 0.15,
        targetPEPM: targetPEPM * 0.15,
        variance: variance * 0.15
      },
      {
        id: `${i}-vision`,
        month: 'Vision',
        actualPEPM: actualPEPM * 0.05,
        targetPEPM: targetPEPM * 0.05,
        variance: variance * 0.05
      },
      {
        id: `${i}-pharmacy`,
        month: 'Pharmacy',
        actualPEPM: actualPEPM * 0.1,
        targetPEPM: targetPEPM * 0.1,
        variance: variance * 0.1
      }
    ];
    
    data.push({
      id: `month-${i}`,
      month: monthName,
      actualPEPM,
      targetPEPM,
      variance,
      lineItems
    });
  }
  
  return data.reverse(); // Chronological order
}

/**
 * Generate realistic What-If scenario
 */
export function generateWhatIfScenario(): WhatIfScenario {
  return {
    employeeCount: 1250,
    employeeAdjustment: 0,
    pepmActual: 48500, // $485.00 PEPM
    pepmTarget: 45000, // $450.00 PEPM
    totalSavings: 525000 // $525K annual savings opportunity
  };
}

/**
 * Generate peer organizations
 */
export function generatePeerOrganizations(count: number = 10): PeerOrganization[] {
  const industries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail'];
  const carriers = ['Anthem', 'UnitedHealth', 'Aetna', 'Cigna', 'Humana'];
  const planTypes = ['PPO', 'HMO', 'HDHP', 'EPO', 'POS'];
  const networks = ['National', 'Regional', 'Local', 'Narrow', 'Broad'];
  const fundingTypes = ['Fully Insured', 'Self-Funded', 'Level-Funded', 'Hybrid'];
  
  const orgs: PeerOrganization[] = [];
  
  for (let i = 0; i < count; i++) {
    const size = Math.floor(500 + Math.random() * 4500); // 500-5000 employees
    const pepmActual = 40000 + Math.random() * 20000; // $400-600 PEPM
    const pepmTarget = pepmActual * (0.85 + Math.random() * 0.1); // 85-95% of actual
    
    // Generate sparkline data (last 12 months)
    const sparklineData: number[] = [];
    let currentValue = pepmActual;
    for (let j = 0; j < 12; j++) {
      currentValue = currentValue * (0.97 + Math.random() * 0.06); // ±3% variation
      sparklineData.push(currentValue);
    }
    
    orgs.push({
      id: `org-${i}`,
      name: `${industries[i % industries.length]} Corp ${i + 1}`,
      industry: industries[Math.floor(Math.random() * industries.length)],
      size,
      fundingType: fundingTypes[Math.floor(Math.random() * fundingTypes.length)],
      carrier: carriers[Math.floor(Math.random() * carriers.length)],
      planType: planTypes[Math.floor(Math.random() * planTypes.length)],
      network: networks[Math.floor(Math.random() * networks.length)],
      pepmActual,
      pepmTarget,
      savings: (pepmTarget - pepmActual) * size * 12,
      similarityScore: 0, // Will be calculated by component
      sparklineData
    });
  }
  
  return orgs;
}

/**
 * Generate current organization profile
 */
export function generateCurrentOrg(): Partial<PeerOrganization> {
  return {
    name: 'Your Organization',
    industry: 'Technology',
    size: 1250,
    fundingType: 'Self-Funded',
    carrier: 'Anthem',
    planType: 'PPO',
    network: 'National',
    pepmActual: 48500,
    pepmTarget: 45000,
    savings: 525000
  };
}

/**
 * Generate complete dashboard data
 */
export interface DashboardData {
  moneyMeterValue: number;
  previousMoneyMeterValue: number;
  gridData: GridRow[];
  whatIfScenario: WhatIfScenario;
  currentOrg: Partial<PeerOrganization>;
  peerOrgs: PeerOrganization[];
}

export function generateDashboardData(): DashboardData {
  const gridData = generateMonthlyData(24); // 2 years
  const totalVariance = gridData.reduce((sum, row) => sum + row.variance, 0);
  
  return {
    moneyMeterValue: Math.abs(totalVariance * 12), // Annual savings
    previousMoneyMeterValue: Math.abs(totalVariance * 12 * 0.9), // 10% improvement
    gridData,
    whatIfScenario: generateWhatIfScenario(),
    currentOrg: generateCurrentOrg(),
    peerOrgs: generatePeerOrganizations(20)
  };
}

/**
 * Demo filters configuration
 */
export const demoFilters = {
  industries: [
    'Technology',
    'Healthcare',
    'Finance',
    'Manufacturing',
    'Retail',
    'Education',
    'Government'
  ],
  sizes: [
    '1-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1001-5000 employees',
    '5000+ employees'
  ],
  carriers: [
    'Anthem',
    'UnitedHealth',
    'Aetna',
    'Cigna',
    'Humana',
    'Kaiser',
    'BCBS'
  ],
  planTypes: [
    'PPO',
    'HMO',
    'HDHP',
    'EPO',
    'POS'
  ],
  regions: [
    'Northeast',
    'Southeast',
    'Midwest',
    'Southwest',
    'West',
    'Northwest'
  ]
};

/**
 * Performance metrics for demo
 */
export function generatePerformanceMetrics() {
  return {
    moneyMeterRenderTime: 38 + Math.random() * 8, // 38-46ms
    gridRenderTime: 42 + Math.random() * 10, // 42-52ms
    whatIfCalculationTime: 35 + Math.random() * 10, // 35-45ms
    peerComparisonTime: 40 + Math.random() * 8, // 40-48ms
    totalLoadTime: 850 + Math.random() * 150 // 850-1000ms
  };
}