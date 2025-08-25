/**
 * Demo Dashboard Page
 * Full demonstration with production-like data
 */

'use client';

import React, { useState, useEffect } from 'react';
import { MoneyMeter } from '@/components/dashboard/MoneyMeter';
import { ReportingGrid } from '@/components/dashboard/ReportingGrid';
import { WhatIfPanel } from '@/components/dashboard/WhatIfPanel';
import { PeerComparison } from '@/components/dashboard/PeerComparison';
import { GuidedDemoMode } from '@/components/demo/GuidedDemoMode';
import { generateDashboardData, generatePerformanceMetrics } from '@/lib/demo-data';
import styles from './demo.module.css';

export default function DemoPage() {
  const [data, setData] = useState(() => generateDashboardData());
  const [showGuidedDemo, setShowGuidedDemo] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState(() => generatePerformanceMetrics());
  const [showPerformanceBadges, setShowPerformanceBadges] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceMetrics(generatePerformanceMetrics());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleMoneyMeterClick = () => {
    console.log('Money Meter clicked - showing breakdown');
    // In real app, would open modal with calculation details
  };

  const handleScenarioChange = (scenario: any) => {
    console.log('Scenario changed:', scenario);
    // Recalculate all dependent values
    const newData = generateDashboardData();
    setData({
      ...newData,
      whatIfScenario: scenario
    });
  };

  const handleScenarioApply = (scenario: any) => {
    console.log('Scenario applied:', scenario);
    // Update entire dashboard with new baseline
    setData(generateDashboardData());
  };

  const handlePeerFilter = (peers: any[]) => {
    console.log('Applying peer filter:', peers);
    // Filter all data to peer cohort
  };

  const handlePeerClick = (peer: any) => {
    console.log('Peer clicked:', peer);
    // Show peer details or comparison
  };

  const handleGridRowClick = (row: any) => {
    console.log('Grid row clicked:', row);
    // Show row details
  };

  const handleGridSort = (column: string, direction: string) => {
    console.log('Grid sorted:', column, direction);
    // Sort grid data
  };

  const handleDemoComplete = () => {
    setShowGuidedDemo(false);
    console.log('Demo tour completed');
  };

  const handleDemoSkip = () => {
    setShowGuidedDemo(false);
    console.log('Demo tour skipped');
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Assured Partners Benefits Dashboard</h1>
          <div className={styles.headerActions}>
            <button
              className={styles.demoButton}
              onClick={() => setShowGuidedDemo(true)}
            >
              Start Guided Tour
            </button>
            <button
              className={styles.toggleButton}
              onClick={() => setShowPerformanceBadges(!showPerformanceBadges)}
            >
              {showPerformanceBadges ? 'Hide' : 'Show'} Performance
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className={styles.main}>
        {/* Money Meter Section */}
        <section className={styles.section} data-testid="money-meter-section">
          <div className={styles.sectionHeader}>
            <h2>Total Savings Opportunity</h2>
            <span className={styles.sectionBadge}>Real-time</span>
          </div>
          <MoneyMeter
            value={data.moneyMeterValue}
            previousValue={data.previousMoneyMeterValue}
            onClick={handleMoneyMeterClick}
            showPerformanceBadge={showPerformanceBadges}
            testId="money-meter"
          />
        </section>

        {/* What-If Modeling Section */}
        <section className={styles.section} data-testid="what-if-section">
          <div className={styles.sectionHeader}>
            <h2>What-If Modeling</h2>
            <span className={styles.sectionBadge}>Interactive</span>
          </div>
          <WhatIfPanel
            initialScenario={data.whatIfScenario}
            onScenarioChange={handleScenarioChange}
            onApply={handleScenarioApply}
            onReset={() => setData(generateDashboardData())}
            showPerformanceBadge={showPerformanceBadges}
            testId="what-if-panel"
          />
        </section>

        {/* Peer Comparison Section */}
        <section className={styles.section} data-testid="peer-comparison-section">
          <div className={styles.sectionHeader}>
            <h2>Peer Benchmarking</h2>
            <span className={styles.sectionBadge}>Auto-selected</span>
          </div>
          <PeerComparison
            currentOrg={data.currentOrg}
            peers={data.peerOrgs}
            onApplyFilter={handlePeerFilter}
            onPeerClick={handlePeerClick}
            testId="peer-comparison"
          />
        </section>

        {/* Reporting Grid Section */}
        <section className={styles.section} data-testid="reporting-grid-section">
          <div className={styles.sectionHeader}>
            <h2>Detailed Analysis</h2>
            <span className={styles.sectionBadge}>{data.gridData.length} months</span>
          </div>
          <ReportingGrid
            data={data.gridData}
            viewMode="focus"
            onRowClick={handleGridRowClick}
            onSortChange={handleGridSort}
            showPerformanceBadge={showPerformanceBadges}
            testId="reporting-grid"
          />
        </section>

        {/* Performance Metrics */}
        {showPerformanceBadges && (
          <section className={styles.performanceSection}>
            <h3>Performance Metrics</h3>
            <div className={styles.performanceGrid}>
              <div className={styles.performanceMetric}>
                <span className={styles.metricLabel}>Money Meter</span>
                <span className={styles.metricValue}>
                  {performanceMetrics.moneyMeterRenderTime.toFixed(0)}ms
                </span>
              </div>
              <div className={styles.performanceMetric}>
                <span className={styles.metricLabel}>Grid Render</span>
                <span className={styles.metricValue}>
                  {performanceMetrics.gridRenderTime.toFixed(0)}ms
                </span>
              </div>
              <div className={styles.performanceMetric}>
                <span className={styles.metricLabel}>What-If Calc</span>
                <span className={styles.metricValue}>
                  {performanceMetrics.whatIfCalculationTime.toFixed(0)}ms
                </span>
              </div>
              <div className={styles.performanceMetric}>
                <span className={styles.metricLabel}>Peer Comparison</span>
                <span className={styles.metricValue}>
                  {performanceMetrics.peerComparisonTime.toFixed(0)}ms
                </span>
              </div>
              <div className={styles.performanceMetric}>
                <span className={styles.metricLabel}>Total Load</span>
                <span className={styles.metricValue}>
                  {performanceMetrics.totalLoadTime.toFixed(0)}ms
                </span>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Guided Demo Mode */}
      <GuidedDemoMode
        isActive={showGuidedDemo}
        onComplete={handleDemoComplete}
        onSkip={handleDemoSkip}
        autoAdvanceDelay={5000}
      />

      {/* Export Button (for demo) */}
      <div className={styles.exportButton} data-testid="export-button">
        <button className={styles.exportBtn}>
          Export Report
        </button>
      </div>
    </div>
  );
}