import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Info, ArrowRight, Star, Globe2, Users, AlertCircle, Search } from 'lucide-react';

interface Exhibition {
  id: string;
  name: string;
  location: string;
  region: string;
  date: string;
  relevance: number;
  countryCode: string;
  strategy: string;
  marketSize?: string;
  marketGrowth?: string;
  risks: {
    access: string;
    tariffs: string;
    logistics: string;
    operational: string;
  };
  audienceAnalysis: {
    description: string;
    industryDistribution: { label: string; value: number }[];
    functionDistribution: { label: string; value: number }[];
    keyBuyers: string[];
    regionalCoverage: string;
  };
}

interface MarketMapProps {
  exhibitions: Exhibition[];
  onSelectExhibition: (id: string) => void;
}

const MarketMap: React.FC<MarketMapProps> = ({ exhibitions, onSelectExhibition }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedCountry, setSelectedCountry] = useState<Exhibition | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [showReference, setShowReference] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 450;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Use Natural Earth projection for a more modern, professional look
    const projection = d3.geoNaturalEarth1()
      .scale(160)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const g = svg.append('g');

    // Add a subtle ocean background
    g.append('path')
      .datum({ type: 'Sphere' })
      .attr('class', 'sphere')
      .attr('d', path as any)
      .attr('fill', '#f8fafc');

    // Add graticules (grid lines) for a professional "map" feel
    const graticule = d3.geoGraticule();
    g.append('path')
      .datum(graticule())
      .attr('class', 'graticule')
      .attr('d', path as any)
      .attr('fill', 'none')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '2,2');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Load world map data
    fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.json')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((data: any) => {
        if (!data || !data.features) {
          console.error('Invalid map data received');
          return;
        }
      
      const countries = g.append('g')
        .selectAll('path')
        .data(data.features)
        .enter()
        .append('path')
        .attr('d', path as any)
        .attr('fill', (d: any) => {
          const exhibition = exhibitions.find(ex => ex.countryCode === d.id);
          if (exhibition) {
            return exhibition.relevance >= 9 ? '#10b981' : '#3b82f6';
          }
          return '#ffffff';
        })
        .attr('stroke', '#cbd5e1')
        .attr('stroke-width', 0.5)
        .style('cursor', (d: any) => exhibitions.find(ex => ex.countryCode === d.id) ? 'pointer' : 'default')
        .on('mouseover', function (event, d: any) {
          const exhibition = exhibitions.find(ex => ex.countryCode === d.id);
          if (exhibition) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', exhibition.relevance >= 9 ? '#059669' : '#2563eb')
              .attr('stroke', '#94a3b8')
              .attr('stroke-width', 1);
            setHoveredCountry(exhibition.name);
          } else {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', '#f1f5f9');
          }
        })
        .on('mouseout', function (event, d: any) {
          const exhibition = exhibitions.find(ex => ex.countryCode === d.id);
          if (exhibition) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', exhibition.relevance >= 9 ? '#10b981' : '#3b82f6')
              .attr('stroke', '#cbd5e1')
              .attr('stroke-width', 0.5);
            setHoveredCountry(null);
          } else {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', '#ffffff');
          }
        })
        .on('click', (event, d: any) => {
          const exhibition = exhibitions.find(ex => ex.countryCode === d.id);
          if (exhibition) {
            setSelectedCountry(exhibition);
            
            const bounds = path.bounds(d);
            const dx = bounds[1][0] - bounds[0][0];
            const dy = bounds[1][1] - bounds[0][1];
            const x = (bounds[0][0] + bounds[1][0]) / 2;
            const y = (bounds[0][1] + bounds[1][1]) / 2;
            const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
            const translate = [width / 2 - scale * x, height / 2 - scale * y];

            svg.transition()
              .duration(750)
              .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
          }
        });

      // Add markers for exhibitions
      g.append('g')
        .selectAll('circle')
        .data(exhibitions)
        .enter()
        .append('circle')
        .attr('cx', (d: any) => {
          const feature = data.features.find((f: any) => f.id === d.countryCode);
          if (feature) {
            const center = d3.geoCentroid(feature);
            return projection(center)![0];
          }
          return 0;
        })
        .attr('cy', (d: any) => {
          const feature = data.features.find((f: any) => f.id === d.countryCode);
          if (feature) {
            const center = d3.geoCentroid(feature);
            return projection(center)![1];
          }
          return 0;
        })
        .attr('r', 4)
        .attr('fill', '#ffffff')
        .attr('stroke', (d: any) => d.relevance >= 9 ? '#10b981' : '#3b82f6')
        .attr('stroke-width', 2)
        .style('pointer-events', 'none')
        .append('title')
        .text((d: any) => d.name);
        
    }).catch(err => {
      console.error('Error loading map data:', err);
    });
  }, [exhibitions]);

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 relative">
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Globe2 className="w-6 h-6 text-blue-500" />
                全球市场布局图
              </h3>
              <p className="text-sm text-zinc-500 mt-1">点击高亮国家查看对应展会详情。绿色代表极力推荐 (推荐指数 ≥ 9)。</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowReference(!showReference)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  showReference ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                {showReference ? '切换至交互地图' : '查看参考地图'}
              </button>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="搜索展会或国家..."
                  className="pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-48 transition-all"
                  onChange={(e) => {
                    const term = e.target.value.toLowerCase();
                    const found = exhibitions.find(ex => 
                      ex.name.toLowerCase().includes(term) || 
                      ex.location.toLowerCase().includes(term) ||
                      ex.region.toLowerCase().includes(term)
                    );
                    if (found) {
                      setSelectedCountry(found);
                    }
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden relative min-h-[450px]">
            <AnimatePresence mode="wait">
              {showReference ? (
                <motion.div 
                  key="reference"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-white p-4"
                >
                  <img 
                    src="https://ais-dev-qndigyqfvi23a5jwlam2ih-281223640747.asia-southeast1.run.app/world-map.png" 
                    alt="World Map Reference"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      // Fallback if the image isn't at that specific path
                      (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/worldmap/1200/800';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold text-zinc-500 border border-zinc-200">
                    参考地图 (静态)
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="interactive"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <svg 
                    ref={svgRef} 
                    viewBox="0 0 800 450" 
                    className="w-full h-auto"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            {!showReference && hoveredCountry && (
              <div className="absolute top-4 left-4 bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg pointer-events-none">
                {hoveredCountry}
              </div>
            )}

            {!showReference && (
              <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] font-bold text-zinc-600 uppercase">极力推荐 (9-10)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-[10px] font-bold text-zinc-600 uppercase">值得考虑 (7-8)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-96">
          <AnimatePresence mode="wait">
            {selectedCountry ? (
              <motion.div
                key={selectedCountry.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <div className="bg-zinc-900 text-white p-6 rounded-3xl shadow-xl flex-1 border border-zinc-800">
                  <div className="flex items-center justify-between mb-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      selectedCountry.relevance >= 9 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {selectedCountry.region}
                    </span>
                    <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs font-bold">{selectedCountry.relevance}/10</span>
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-bold mb-2 leading-tight">{selectedCountry.name}</h4>
                  <div className="flex items-center gap-2 text-zinc-400 text-xs mb-8">
                    <MapPin className="w-3 h-3" />
                    {selectedCountry.location}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-zinc-800/50 p-3 rounded-2xl border border-zinc-700/50">
                      <div className="text-[9px] font-bold text-zinc-500 uppercase mb-1">市场规模</div>
                      <div className="text-sm font-bold text-zinc-100">{selectedCountry.marketSize}</div>
                    </div>
                    <div className="bg-zinc-800/50 p-3 rounded-2xl border border-zinc-700/50">
                      <div className="text-[9px] font-bold text-zinc-500 uppercase mb-1">年增长率</div>
                      <div className="text-sm font-bold text-emerald-400">↑ {selectedCountry.marketGrowth}</div>
                    </div>
                  </div>

                  <div className="space-y-6 mb-8">
                    <div>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Users className="w-3 h-3" /> 观众概况
                      </div>
                      <div className="text-xs text-zinc-400 leading-relaxed bg-zinc-800/30 p-3 rounded-xl border border-zinc-700/30">
                        {selectedCountry.audienceAnalysis.description}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" /> 核心风险提示
                      </div>
                      <div className="text-xs text-zinc-400 leading-relaxed bg-red-500/5 border border-red-500/20 p-3 rounded-xl">
                        {selectedCountry.risks.access}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">参展策略</div>
                      <p className="text-xs text-zinc-300 leading-relaxed italic border-l-2 border-emerald-500 pl-3 py-1">
                        "{selectedCountry.strategy}"
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => onSelectExhibition(selectedCountry.id)}
                    className="w-full py-4 bg-emerald-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    查看完整调研报告
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl p-8 text-center">
                <div>
                  <Info className="w-8 h-8 text-zinc-300 mx-auto mb-4" />
                  <p className="text-sm text-zinc-400 font-medium">点击地图上的高亮国家<br />查看详细市场洞察</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MarketMap;
