import React, { useState, useMemo } from 'react';
import { Exhibition } from '../App';
import { 
  Check, 
  Plus, 
  X, 
  ArrowRightLeft, 
  TrendingUp, 
  Users, 
  Award, 
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  BarChart3,
  Target,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Match the interface from App.tsx
interface BudgetEntry {
  booth9: number;
  booth18: number;
  booth36: number;
  construction: number;
  shipping: number;
  travel: number;
  marketing: number;
  other: number;
}

interface ExhibitionComparisonProps {
  exhibitions: Exhibition[];
  budgets: Record<string, BudgetEntry>;
  boothSize: number;
}

const ExhibitionComparison: React.FC<ExhibitionComparisonProps> = ({ exhibitions, budgets, boothSize }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(exhibitions.slice(0, 2).map(e => e.id));

  const toggleExhibition = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter(i => i !== id));
      }
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const selectedExhibitions = exhibitions.filter(e => selectedIds.includes(e.id));

  // Predictive Model Logic
  const calculatePrediction = useMemo(() => (ex: Exhibition) => {
    // 1. Success Likelihood (0-100)
    // Factors: Relevance (40%), Historical Success (30%), Market Growth (20%), Scale (10%)
    const growthRate = parseFloat(ex.marketGrowth) || 5;
    const scaleScore = Math.min(ex.scale.professionalVisitors / 50000 * 100, 100);
    
    const likelihood = (
      (ex.relevance * 10 * 0.4) + 
      (ex.historicalSuccessRate * 0.3) + 
      (Math.min(growthRate * 5, 100) * 0.2) + 
      (scaleScore * 0.1)
    );

    // 2. Estimated ROI
    // Estimated Revenue = Visitors * Lead Rate * Conversion Rate * Avg Order Value
    // We assume:
    // - Lead Rate: 0.5% of total visitors (very conservative)
    // - Conversion Rate: 10% of leads
    // - Avg Order Value: $15,000
    const estimatedLeads = ex.scale.professionalVisitors * 0.005;
    const estimatedConversions = estimatedLeads * 0.1;
    const avgOrderValue = 15000;
    const estimatedRevenue = estimatedConversions * avgOrderValue;

    // Total Cost for this specific exhibition
    const b = budgets[ex.id] || { booth9: 0, booth18: 0, booth36: 0, construction: 0, shipping: 0, travel: 0, marketing: 0, other: 0 };
    const boothCost = boothSize === 9 ? b.booth9 : boothSize === 18 ? b.booth18 : b.booth36;
    const totalCost = boothCost + b.construction + b.shipping + b.travel + b.marketing + b.other;
    
    // Cost is in "Wan" (10,000 CNY), Revenue is in USD. 
    // Let's convert Cost to USD (approx 1:7)
    const costInUsd = (totalCost * 10000) / 7;
    
    const roi = costInUsd > 0 ? ((estimatedRevenue - costInUsd) / costInUsd) * 100 : 0;

    return {
      likelihood: Math.round(likelihood),
      roi: Math.round(roi),
      revenue: Math.round(estimatedRevenue),
      cost: Math.round(costInUsd)
    };
  }, [budgets, boothSize]);

  const ComparisonRow = ({ label, icon: Icon, getValue, type = 'text', highlight = false }: { 
    label: string, 
    icon: any, 
    getValue: (ex: Exhibition) => React.ReactNode,
    type?: 'text' | 'score' | 'list',
    highlight?: boolean
  }) => (
    <div className={`grid grid-cols-1 md:grid-cols-[200px_1fr] border-b border-zinc-100 last:border-0 ${highlight ? 'bg-blue-50/30' : ''}`}>
      <div className={`bg-zinc-50/50 p-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${highlight ? 'text-blue-600' : 'text-zinc-500'}`}>
        <Icon className={`w-4 h-4 ${highlight ? 'text-blue-500' : 'text-zinc-400'}`} />
        {label}
      </div>
      <div 
        className="grid grid-cols-1 md:grid-flow-col divide-x divide-zinc-100"
        style={{ gridTemplateColumns: `repeat(${selectedExhibitions.length}, minmax(0, 1fr))` }}
      >
        {selectedExhibitions.map(ex => (
          <div key={ex.id} className="p-4 text-sm">
            {getValue(ex)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Selection Header */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ArrowRightLeft className="w-6 h-6 text-blue-500" />
              Exhibition Comparison
            </h3>
            <p className="text-sm text-zinc-500 mt-1">Select 2-4 exhibitions for horizontal comparison. Currently selected: {selectedIds.length}.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {exhibitions.map(ex => (
              <button
                key={ex.id}
                onClick={() => toggleExhibition(ex.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  selectedIds.includes(ex.id)
                    ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20'
                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                }`}
              >
                {selectedIds.includes(ex.id) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {ex.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Header Row */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] border-b border-zinc-200 bg-zinc-900 text-white">
          <div className="p-6 flex items-center font-bold text-sm uppercase tracking-widest text-zinc-400">
            Comparison Metrics
          </div>
          <div 
            className="grid grid-cols-1 md:grid-flow-col divide-x divide-zinc-800"
            style={{ gridTemplateColumns: `repeat(${selectedExhibitions.length}, minmax(0, 1fr))` }}
          >
            {selectedExhibitions.map(ex => (
              <div key={ex.id} className="p-6">
                <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">{ex.region}</div>
                <h4 className="font-bold text-lg leading-tight">{ex.name}</h4>
                <div className="mt-2 text-xs text-zinc-400">{ex.location}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive Model Section */}
        <div className="bg-blue-600 text-white p-2 text-[10px] font-black uppercase tracking-[0.2em] text-center">
          AI Predictive Model Analysis (Based on Historical Data & Budget)
        </div>

        <ComparisonRow 
          label="Success Likelihood" 
          icon={Target} 
          highlight
          getValue={(ex) => {
            const { likelihood } = calculatePrediction(ex);
            return (
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-blue-600">{likelihood}%</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Likelihood</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${likelihood}%` }}
                    className={`h-full rounded-full ${
                      likelihood > 80 ? 'bg-emerald-500' : likelihood > 60 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                  * Considers market relevance, historical conversion, and industry trends.
                </p>
              </div>
            );
          }}
        />

        <ComparisonRow 
          label="Estimated ROI" 
          icon={BarChart3} 
          highlight
          getValue={(ex) => {
            const { roi, revenue, cost } = calculatePrediction(ex);
            return (
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <span className={`text-2xl font-black ${roi > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {roi > 0 ? '+' : ''}{roi}%
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Estimated ROI</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                    <div className="text-[8px] font-bold text-zinc-400 uppercase">Est. Revenue</div>
                    <div className="text-xs font-bold text-zinc-900">${revenue.toLocaleString()}</div>
                  </div>
                  <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                    <div className="text-[8px] font-bold text-zinc-400 uppercase">Est. Cost</div>
                    <div className="text-xs font-bold text-zinc-900">${cost.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            );
          }}
        />

        {/* Basic Info */}
        <ComparisonRow 
          label="Recommendation" 
          icon={Award} 
          getValue={(ex) => (
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-black ${ex.relevance >= 9 ? 'text-emerald-500' : 'text-blue-500'}`}>
                {ex.relevance}
              </div>
              <div className="flex flex-col">
                <div className="text-[10px] font-bold text-zinc-400 uppercase">Score</div>
                <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${ex.relevance >= 9 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    style={{ width: `${ex.relevance * 10}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        />

        <ComparisonRow 
          label="Date" 
          icon={TrendingUp} 
          getValue={(ex) => <span className="font-bold text-zinc-900">{ex.date}</span>}
        />

        <ComparisonRow 
          label="Market Size/Growth" 
          icon={TrendingUp} 
          getValue={(ex) => (
            <div className="space-y-1">
              <div className="font-bold text-zinc-900">{ex.marketSize}</div>
              <div className="text-xs text-emerald-600 font-bold">↑ {ex.marketGrowth} Growth</div>
            </div>
          )}
        />

        <ComparisonRow 
          label="Scale" 
          icon={Users} 
          getValue={(ex) => (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[9px] font-bold text-zinc-400 uppercase">Exhibitors</div>
                <div className="font-bold">{ex.scale.totalExhibitors}</div>
              </div>
              <div>
                <div className="text-[9px] font-bold text-zinc-400 uppercase">Visitors</div>
                <div className="font-bold">{ex.scale.professionalVisitors}</div>
              </div>
            </div>
          )}
        />

        <ComparisonRow 
          label="Pros" 
          icon={CheckCircle2} 
          getValue={(ex) => (
            <ul className="space-y-2">
              {ex.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-600">
                  <Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                  {pro}
                </li>
              ))}
            </ul>
          )}
        />

        <ComparisonRow 
          label="Cons" 
          icon={MinusCircle} 
          getValue={(ex) => (
            <ul className="space-y-2">
              {ex.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-600">
                  <X className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                  {con}
                </li>
              ))}
            </ul>
          )}
        />

        <ComparisonRow 
          label="SWOT Core" 
          icon={Award} 
          getValue={(ex) => (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                <div className="text-[8px] font-black text-emerald-600 uppercase">S</div>
                <div className="text-[10px] text-emerald-800 truncate">{ex.swot?.s?.[0]}</div>
              </div>
              <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                <div className="text-[8px] font-black text-amber-600 uppercase">W</div>
                <div className="text-[10px] text-amber-800 truncate">{ex.swot?.w?.[0]}</div>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                <div className="text-[8px] font-black text-blue-600 uppercase">O</div>
                <div className="text-[10px] text-blue-800 truncate">{ex.swot?.o?.[0]}</div>
              </div>
              <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                <div className="text-[8px] font-black text-red-600 uppercase">T</div>
                <div className="text-[10px] text-red-800 truncate">{ex.swot?.t?.[0]}</div>
              </div>
            </div>
          )}
        />

        <ComparisonRow 
          label="Access/Cert" 
          icon={Award} 
          getValue={(ex) => (
            <div className="flex flex-wrap gap-1">
              {ex.certifications.map((cert, i) => (
                <span key={i} className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded text-[10px] font-medium text-zinc-600">
                  {cert}
                </span>
              ))}
            </div>
          )}
        />

        {/* Action Row */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] bg-zinc-50">
          <div className="p-4" />
          <div 
            className="grid grid-cols-1 md:grid-flow-col divide-x divide-zinc-200"
            style={{ gridTemplateColumns: `repeat(${selectedExhibitions.length}, minmax(0, 1fr))` }}
          >
            {selectedExhibitions.map(ex => (
              <div key={ex.id} className="p-4">
                <button className="w-full py-3 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10">
                  View Full Report
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionComparison;
