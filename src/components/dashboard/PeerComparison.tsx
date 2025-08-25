/**
 * Peer Comparison Component
 * Benchmarking with similar organizations
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Users, TrendingUp, TrendingDown, Award, Info, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './PeerComparison.module.css';
import { formatCurrency, formatCompactCurrency } from '@/utils/formatCurrency';
import { withPerformanceTracking } from '@/utils/withPerformanceTracking';

export interface PeerOrganization {
  id: string;
  name: string;
  industry: string;
  size: number; // employee count
  fundingType: string;
  carrier: string;
  planType: string;
  network: string;
  pepmActual: number;
  pepmTarget: number;
  savings: number;
  similarityScore: number; // 0-100
  sparklineData?: number[]; // Last 12 months
}

export interface PeerComparisonProps {
  currentOrg: Partial<PeerOrganization>;
  peers: PeerOrganization[];
  onApplyFilter?: (peers: PeerOrganization[]) => void;
  onPeerClick?: (peer: PeerOrganization) => void;
  maxPeers?: number;
  className?: string;
  testId?: string;
}

const PeerComparisonComponent: React.FC<PeerComparisonProps> = ({
  currentOrg,
  peers,
  onApplyFilter,
  onPeerClick,
  maxPeers = 5,
  className = '',
  testId = 'peer-comparison'
}) => {
  const [expandedView, setExpandedView] = useState(false);
  const [selectedDimensions, setSelectedDimensions] = useState<Set<string>>(
    new Set(['size', 'industry', 'planType'])
  );
  const [hoveredPeer, setHoveredPeer] = useState<string | null>(null);

  // Calculate similarity and select top peers
  const rankedPeers = useMemo(() => {
    const dimensions = Array.from(selectedDimensions);
    
    const scored = peers.map(peer => {
      let score = 0;
      const factors: string[] = [];
      
      // Size similarity (within 20%)
      if (dimensions.includes('size') && currentOrg.size) {
        const sizeDiff = Math.abs(peer.size - currentOrg.size) / currentOrg.size;
        if (sizeDiff <= 0.2) {
          score += 25;
          factors.push('Similar size');
        }
      }
      
      // Industry match
      if (dimensions.includes('industry') && peer.industry === currentOrg.industry) {
        score += 25;
        factors.push('Same industry');
      }
      
      // Plan type match
      if (dimensions.includes('planType') && peer.planType === currentOrg.planType) {
        score += 20;
        factors.push('Same plan type');
      }
      
      // Carrier match
      if (dimensions.includes('carrier') && peer.carrier === currentOrg.carrier) {
        score += 15;
        factors.push('Same carrier');
      }
      
      // Network match
      if (dimensions.includes('network') && peer.network === currentOrg.network) {
        score += 15;
        factors.push('Same network');
      }
      
      return {
        ...peer,
        similarityScore: score,
        matchFactors: factors
      };
    });
    
    return scored
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, expandedView ? peers.length : maxPeers);
  }, [peers, selectedDimensions, currentOrg, expandedView, maxPeers]);

  // Calculate cohort averages
  const cohortStats = useMemo(() => {
    if (rankedPeers.length === 0) return null;
    
    const avgPEPM = rankedPeers.reduce((sum, p) => sum + p.pepmActual, 0) / rankedPeers.length;
    const avgSavings = rankedPeers.reduce((sum, p) => sum + p.savings, 0) / rankedPeers.length;
    const currentRank = currentOrg.pepmActual 
      ? rankedPeers.filter(p => p.pepmActual < currentOrg.pepmActual!).length + 1
      : 0;
    
    return {
      avgPEPM,
      avgSavings,
      currentRank,
      totalPeers: rankedPeers.length,
      percentile: currentRank > 0 ? Math.round((1 - currentRank / rankedPeers.length) * 100) : 0
    };
  }, [rankedPeers, currentOrg]);

  // Dimension toggle
  const toggleDimension = useCallback((dimension: string) => {
    setSelectedDimensions(prev => {
      const next = new Set(prev);
      if (next.has(dimension)) {
        next.delete(dimension);
      } else {
        next.add(dimension);
      }
      return next;
    });
  }, []);

  // Sparkline rendering
  const renderSparkline = (data?: number[]) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg className={styles.sparkline} viewBox="0 0 100 40">
        <polyline
          points={points}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
        />
      </svg>
    );
  };

  // Get ranking badge
  const getRankingBadge = () => {
    if (!cohortStats || cohortStats.currentRank === 0) return null;
    
    if (cohortStats.percentile >= 75) {
      return { icon: Award, label: 'Top Performer', color: 'gold' };
    } else if (cohortStats.percentile >= 50) {
      return { icon: TrendingUp, label: 'Above Average', color: 'green' };
    } else if (cohortStats.percentile >= 25) {
      return { icon: Users, label: 'Average', color: 'blue' };
    } else {
      return { icon: TrendingDown, label: 'Below Average', color: 'orange' };
    }
  };

  const rankingBadge = getRankingBadge();

  return (
    <div 
      className={`${styles.container} ${className}`}
      data-testid={testId}
      role="region"
      aria-label="Peer Comparison"
    >
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Users className={styles.icon} />
          Organizations Like Yours
        </h3>
        
        {rankingBadge && (
          <div className={`${styles.badge} ${styles[rankingBadge.color]}`}>
            <rankingBadge.icon className={styles.badgeIcon} />
            <span>{rankingBadge.label}</span>
          </div>
        )}
      </div>

      {/* Dimension selector */}
      <div className={styles.dimensions}>
        <span className={styles.dimensionLabel}>Compare by:</span>
        {['size', 'industry', 'planType', 'carrier', 'network'].map(dim => (
          <button
            key={dim}
            className={`${styles.dimension} ${selectedDimensions.has(dim) ? styles.active : ''}`}
            onClick={() => toggleDimension(dim)}
            aria-pressed={selectedDimensions.has(dim)}
          >
            {dim.charAt(0).toUpperCase() + dim.slice(1).replace(/([A-Z])/g, ' $1')}
          </button>
        ))}
      </div>

      {/* Cohort stats */}
      {cohortStats && (
        <div className={styles.cohortStats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Cohort Avg PEPM</span>
            <span className={styles.statValue}>
              {formatCurrency(cohortStats.avgPEPM)}
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Your Ranking</span>
            <span className={styles.statValue}>
              #{cohortStats.currentRank} of {cohortStats.totalPeers}
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Avg Savings</span>
            <span className={styles.statValue}>
              {formatCompactCurrency(cohortStats.avgSavings)}
            </span>
          </div>
        </div>
      )}

      {/* Peer list */}
      <div className={styles.peerList}>
        {rankedPeers.map((peer, index) => (
          <div
            key={peer.id}
            className={`${styles.peerCard} ${hoveredPeer === peer.id ? styles.hovered : ''}`}
            onClick={() => onPeerClick?.(peer)}
            onMouseEnter={() => setHoveredPeer(peer.id)}
            onMouseLeave={() => setHoveredPeer(null)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.peerRank}>#{index + 1}</div>
            
            <div className={styles.peerInfo}>
              <div className={styles.peerName}>{peer.name}</div>
              <div className={styles.peerDetails}>
                {peer.industry} • {peer.size.toLocaleString()} employees
              </div>
            </div>
            
            <div className={styles.peerMetrics}>
              <div className={styles.metric}>
                <span className={styles.metricValue}>
                  {formatCurrency(peer.pepmActual)}
                </span>
                <span className={styles.metricLabel}>PEPM</span>
              </div>
              
              {peer.sparklineData && (
                <div className={styles.sparklineContainer}>
                  {renderSparkline(peer.sparklineData)}
                </div>
              )}
            </div>
            
            <div className={styles.similarityBadge}>
              <span className={styles.similarityScore}>{peer.similarityScore}%</span>
              <div className={styles.similarityTooltip}>
                <Info className={styles.infoIcon} />
                {hoveredPeer === peer.id && (
                  <div className={styles.tooltip}>
                    <strong>Similarity factors:</strong>
                    <ul>
                      {(peer as any).matchFactors?.map((factor: string, i: number) => (
                        <li key={i}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={styles.expandButton}
          onClick={() => setExpandedView(!expandedView)}
          aria-expanded={expandedView}
        >
          {expandedView ? (
            <>Show Less <ChevronUp /></>
          ) : (
            <>Show More <ChevronDown /></>
          )}
        </button>
        
        {onApplyFilter && (
          <button
            className={styles.applyFilterButton}
            onClick={() => onApplyFilter(rankedPeers)}
            aria-label="Apply peer comparison as filter"
          >
            <Filter className={styles.buttonIcon} />
            Apply as Filter
          </button>
        )}
      </div>
    </div>
  );
};

export const PeerComparison = withPerformanceTracking(PeerComparisonComponent, 'PeerComparison');