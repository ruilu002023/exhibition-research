/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Globe2, 
  ShieldCheck, 
  Target, 
  TrendingUp, 
  Info, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Users, 
  Award,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Wallet,
  PieChart as PieChartIcon,
  Plus,
  Trash2,
  Save,
  ShoppingBag,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import MarketMap from './components/MarketMap';
import ExhibitionComparison from './components/ExhibitionComparison';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

// --- Data Definitions ---

export interface Exhibition {
  id: string;
  name: string;
  location: string;
  region: string;
  date: string;
  organizer: string;
  edition: string;
  website: string;
  background: string;
  targetMarket: string;
  historicalSuccessRate: number; // 0-100 based on previous years' lead conversion
  marketAnalysis: {
    gdp: string;
    manufacturingGrowth: string;
    regulations: string;
    importStats: {
      majorSources: string[];
      chinaShare: string;
    };
    localCompetitors: {
      brands: string[];
      pricingStrategy: string;
    };
  };
  marketSize: string;
  marketGrowth: string;
  scale: {
    totalExhibitors: number;
    professionalVisitors: number;
    chineseExhibitors: number;
    description: string;
  };
  audienceAnalysis: {
    description: string;
    industryDistribution: { label: string; value: number }[];
    functionDistribution: { label: string; value: number }[];
    keyBuyers: string[];
    regionalCoverage: string;
  };
  competitorAnalysis: {
    mainPeers: string[];
    performance: string;
    domesticCompetitors: {
      name: string;
      boothSize: string;
      productType: string;
      popularity: string;
    }[];
    ppeCategories?: string[];
    gloveTypeDistribution?: { type: string; value: number }[];
  };
  competitionAssessment: {
    pastExhibitors: string[];
    participationStyle: string;
    isMustGo: boolean;
  };
  swot: {
    s: string[];
    w: string[];
    o: string[];
    t: string[];
  };
  decisionAdvice: {
    conclusion: string;
    goals: string[];
    actionPlan: string[];
    decisionType: '参展' | '观展';
  };
  relevance: number;
  certifications: string[];
  marketInsight: string;
  pros: string[];
  cons: string[];
  strategy: string;
  countryCode: string;
  valueAssessment: {
    distributorNetwork: string;
    projectOpportunities: string;
    brandExposure: string;
  };
  risks: {
    access: string;
    tariffs: string;
    logistics: string;
    operational: string;
  };
  demandProducts?: string[];
}

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

const EXHIBITIONS: Exhibition[] = [
  {
    id: 'a-plus-a',
    name: '德国杜塞尔多夫国际安全劳保展 (A+A)',
    location: '德国, 杜塞尔多夫展览中心',
    region: '欧洲',
    date: '2025年10月27日-30日',
    organizer: 'Messe Düsseldorf',
    edition: '第39届',
    website: 'https://www.aplusa-online.com/',
    background: '全球规模最大、最专业的劳保展。每两年一届，是全球个人防护装备（PPE）行业的终极风向标。',
    targetMarket: '全球市场，重点是欧洲高端工业、建筑及可持续防护市场。',
    historicalSuccessRate: 95,
    marketAnalysis: {
      gdp: '欧盟GDP约17万亿美元，德国作为核心，对安全生产有极高的法律强制要求。',
      manufacturingGrowth: '工业4.0驱动下，对智能化、高性能PPE需求持续增长。',
      regulations: '严格执行欧盟CE认证（EN388:2016+A1:2018）及REACH环保法规。',
      importStats: {
        majorSources: ['中国', '德国本土', '美国', '斯里兰卡'],
        chinaShare: '中国是最大供应国，占通用劳保市场的55%，高端市场正稳步提升。'
      },
      localCompetitors: {
        brands: ['Uvex', 'Mappa', 'Ejendals'],
        pricingStrategy: '本土品牌主打“德国设计/欧洲制造”，溢价极高，强调极致舒适与耐用。'
      }
    },
    marketSize: '全球PPE市场约600亿美元',
    marketGrowth: '6.5%',
    scale: {
      totalExhibitors: 2100,
      professionalVisitors: 67000,
      chineseExhibitors: 600,
      description: '全球劳保界的“奥林匹克”，覆盖12个展馆。'
    },
    audienceAnalysis: {
      description: '全球顶级的采购商、分销商、安全工程师及政府决策者。',
      industryDistribution: [
        { label: '工业制造', value: 40 },
        { label: '建筑/基建', value: 25 },
        { label: '贸易/分销', value: 20 },
        { label: '政府/科研', value: 15 }
      ],
      functionDistribution: [
        { label: '采购决策者', value: 50 },
        { label: '安全经理', value: 30 },
        { label: '技术研发', value: 20 }
      ],
      keyBuyers: ['Würth', 'Hoffmann Group', 'Bunzl', 'Honeywell'],
      regionalCoverage: '全球范围，重点覆盖欧洲、中东及非洲'
    },
    competitorAnalysis: {
      mainPeers: ['Ansell', 'Honeywell', '3M', 'Uvex', 'Ejendals'],
      performance: 'Ansell展位通常超过300㎡，展示全场景防护方案，主打可持续发展与智能化。',
      domesticCompetitors: [
        { name: '赛立特 (Safety-M)', boothSize: '120㎡', productType: '高端防割/环保系列', popularity: '极高' },
        { name: '恒辉安防', boothSize: '90㎡', productType: '超高分子量聚乙烯', popularity: '高' },
        { name: '星宇手套', boothSize: '150㎡', productType: '全系列浸胶/丁腈', popularity: '极高' }
      ],
      ppeCategories: ['工业安全', '职业健康', '应急救援', '环保PPE'],
      gloveTypeDistribution: [
        { type: '高性能防割手套', value: 40 },
        { type: '化学防护手套', value: 25 },
        { type: '通用浸胶手套', value: 20 },
        { type: '可持续/降解手套', value: 15 }
      ]
    },
    competitionAssessment: {
      pastExhibitors: ['Ansell', '3M', 'Honeywell', 'Uvex', 'Ejendals'],
      participationStyle: '极具未来感的开放式展位，强调品牌文化与ESG（环境、社会和治理）。',
      isMustGo: true
    },
    swot: {
      s: ['全球最高展示平台', '接触顶级买家', '获取行业趋势'],
      w: ['参展成本极高', '竞争极其惨烈'],
      o: ['欧洲绿色协议带来的环保产品机遇', '高端品牌溢价'],
      t: ['认证门槛极高', '地缘政治影响供应链稳定']
    },
    decisionAdvice: {
      conclusion: '这是公司全球化战略的必选展会，必须参加。',
      goals: ['发布年度新品', '签约3-5家欧洲国家级代理商', '提升品牌国际公信力'],
      actionPlan: ['提前18个月预定展位', '准备完整的ESG报告', '展示最新的生物降解材料。'],
      decisionType: '参展'
    },
    relevance: 10,
    certifications: ['CE (最新标准)', 'REACH', 'OEKO-TEX', 'GRS (全球回收标准)'],
    marketInsight: '可持续性（Sustainability）已成为欧洲市场的核心准入条件。',
    pros: ['行业地位象征', '客单价最高', '技术交流中心'],
    cons: ['费用昂贵', '对展位设计要求极高', '签证及物流复杂'],
    strategy: '展示“绿色环保+极致防割”双核心系列，对标Uvex。',
    countryCode: 'DEU',
    valueAssessment: {
      distributorNetwork: '可进入欧洲最顶级的工业耗材供应体系',
      projectOpportunities: '对接跨国制造巨头的全球采购总部',
      brandExposure: '全球行业媒体头条报道'
    },
    risks: {
      access: '必须通过最严苛的欧盟新规检测',
      tariffs: '需关注欧盟碳关税（CBAM）的潜在影响',
      logistics: '德国海关对单证要求极高',
      operational: '需配备多语种专业技术团队'
    },
    demandProducts: ['生物降解手套', '18针超薄防割手套', '耐强酸碱手套', '智能感应PPE']
  },
  {
    id: 'nsc',
    name: '美国国家安全博览会 (NSC Safety Congress & Expo)',
    location: '美国, 轮换城市 (2025年丹佛)',
    region: '北美',
    date: '2025年9月',
    organizer: 'National Safety Council',
    edition: '第112届',
    website: 'https://congress.nsc.org/',
    background: '北美最具影响力的安全盛会，是进入美国、加拿大市场的核心通道。',
    targetMarket: '北美制造业、石油化工、建筑及公用事业。',
    historicalSuccessRate: 90,
    marketAnalysis: {
      gdp: '美国GDP约25万亿美元，是全球最大的PPE消费市场。',
      manufacturingGrowth: '制造业回流（Reshoring）带动了本地工厂对PPE的爆发式需求。',
      regulations: '执行 ANSI/ISEA 标准，对抗冲击（Impact）和防割有特殊要求。',
      importStats: {
        majorSources: ['中国', '墨西哥', '越南', '马来西亚'],
        chinaShare: '中国产品在北美占40%以上，但面临较高的关税压力。'
      },
      localCompetitors: {
        brands: ['Magid Glove', 'PIP (Protective Industrial Products)', 'Superior Glove'],
        pricingStrategy: '主打“本土服务+快速交付”，通过强大的分销网络锁定终端大客户。'
      }
    },
    marketSize: '北美劳保市场约180亿美元',
    marketGrowth: '5.2%',
    scale: {
      totalExhibitors: 1000,
      professionalVisitors: 15000,
      chineseExhibitors: 80,
      description: '美国历史最悠久的安全展，学术交流与商业展览并重。'
    },
    audienceAnalysis: {
      description: '主要是各企业的HSE经理、安全顾问及大型分销商采购。',
      industryDistribution: [
        { label: '石油/化工', value: 35 },
        { label: '建筑/基建', value: 30 },
        { label: '制造业', value: 25 },
        { label: '其他', value: 10 }
      ],
      functionDistribution: [
        { label: '安全经理/工程师', value: 60 },
        { label: '采购商', value: 30 },
        { label: '政府监管', value: 10 }
      ],
      keyBuyers: ['Grainger', 'Fastenal', 'Amazon Business', 'Chevron'],
      regionalCoverage: '覆盖全美及加拿大，辐射部分拉美地区'
    },
    competitorAnalysis: {
      mainPeers: ['Ansell', 'Showa', 'Magid', 'PIP'],
      performance: 'PIP和Magid展位规模巨大，强调“一站式采购”和针对美国工人体型的定制化。',
      domesticCompetitors: [
        { name: '康隆达', boothSize: '54㎡', productType: '高端防割/抗冲击', popularity: '高' },
        { name: '登升劳保', boothSize: '36㎡', productType: '中高端浸胶', popularity: '中' }
      ],
      ppeCategories: ['工业防护', '高可见度装备', '坠落防护', '手部安全'],
      gloveTypeDistribution: [
        { type: '抗冲击/机械手套', value: 35 },
        { type: '高性能防割手套', value: 35 },
        { type: '一次性丁腈手套', value: 20 },
        { type: '其他', value: 10 }
      ]
    },
    competitionAssessment: {
      pastExhibitors: ['Ansell', '3M', 'Honeywell', 'Magid', 'PIP'],
      participationStyle: '典型的美式商务风格，强调数据支撑和实际案例分析。',
      isMustGo: true
    },
    swot: {
      s: ['市场容量巨大', '客单价稳定', '客户忠诚度高'],
      w: ['关税成本高（301条款）', '对ANSI标准要求严'],
      o: ['制造业回流带来的增量', '高端抗冲击手套的利润空间'],
      t: ['贸易摩擦风险', '东南亚（越南/印尼）产品的价格挑战']
    },
    decisionAdvice: {
      conclusion: '进入北美市场的关键，推荐参加。',
      goals: ['对接2家全美排名前十的分销商', '获取3家大型油气公司的试用订单'],
      actionPlan: ['准备ANSI测试报告', '考虑在墨西哥或东南亚设立转口/组装点', '开发高可见度系列。'],
      decisionType: '参展'
    },
    relevance: 9,
    certifications: ['ANSI/ISEA 105', 'ANSI/ISEA 138 (抗冲击)', 'ASTM'],
    marketInsight: '美国市场对“抗冲击（Impact）”和“高可见度（Hi-Viz）”有极强的偏好。',
    pros: ['利润空间大', '订单量级大', '付款信誉好'],
    cons: ['关税压力大', '认证体系独立', '差旅成本高'],
    strategy: '展示“美式重工”系列，强调符合ANSI标准的抗冲击与防割性能。',
    countryCode: 'USA',
    valueAssessment: {
      distributorNetwork: '可进入Grainger、Fastenal等顶级分销渠道',
      projectOpportunities: '对接美国能源与基建领域的长期供应合同',
      brandExposure: '确立在北美市场的专业品牌地位'
    },
    risks: {
      access: '必须符合ANSI标准，且需注意专利侵权风险',
      tariffs: '301关税是核心成本因素',
      logistics: '海运周期长，需建立海外仓储备货',
      operational: '需应对复杂的美国产品责任险要求'
    },
    demandProducts: ['TPR抗冲击手套', '高可见度防割手套', '加厚丁腈检查手套', '机械师手套']
  },
  {
    id: 'idex',
    name: '阿布扎比国际防务展暨军警展 (IDEX & NAVDEX)',
    location: '阿联酋, 阿布扎比国家会展中心 (ADNEC)',
    region: '中东',
    date: '2027年2月21日-25日',
    organizer: 'ADNEC Group',
    edition: '第18届',
    website: 'https://idexuae.ae/',
    background: 'IDEX是全球领先的防务展，旨在展示陆、海、空防务领域的最新技术。对于劳保手套企业，这是切入高端特种防护（战术、阻燃、防割）市场的绝佳机会。',
    targetMarket: '海湾六国（GCC）及北非地区。重点关注政府招标、特种部队采购及高端工业安全。',
    historicalSuccessRate: 88,
    marketAnalysis: {
      gdp: '阿联酋GDP约5000亿美元，人均GDP位居世界前列，购买力极强。',
      manufacturingGrowth: '非石油部门增长率约为6.5%，工业现代化进程加快。',
      regulations: '强制性职业安全标准，特种装备需符合 MIL-SPEC 或国际特种防护标准。',
      importStats: {
        majorSources: ['美国', '德国', '英国', '中国'],
        chinaShare: '中国产品在通用劳保占30%，特种防护领域正快速提升至15%。'
      },
      localCompetitors: {
        brands: ['Al Hosani', 'Safeer'],
        pricingStrategy: '本地品牌主打基础防护，高端市场由欧美品牌垄断，定价极高。'
      }
    },
    marketSize: '中东劳保市场约12亿美元',
    marketGrowth: '8.5%',
    scale: {
      totalExhibitors: 1350,
      professionalVisitors: 130000,
      chineseExhibitors: 150,
      description: '全球最大防务展之一，展览面积超过165,000平方米。'
    },
    audienceAnalysis: {
      description: '主要为各国国防部长、高级军官、政府决策者及大型防务承包商。',
      industryDistribution: [
        { label: '军警/国防', value: 60 },
        { label: '政府采购', value: 25 },
        { label: '防务承包商', value: 15 }
      ],
      functionDistribution: [
        { label: '决策者/高级官员', value: 40 },
        { label: '技术专家', value: 35 },
        { label: '采购代理', value: 25 }
      ],
      keyBuyers: ['阿联酋国防部', '沙特内政部', 'Raytheon', 'Lockheed Martin'],
      regionalCoverage: '辐射整个中东、北非及南亚地区'
    },
    competitorAnalysis: {
      mainPeers: ['Mechanix Wear', 'Ansell (Tactical)'],
      performance: 'Mechanix展位通常超过100㎡，展示全系列战术手套，现场人气极旺，主打实战模拟。',
      domesticCompetitors: [
        { name: '赛立特 (Safety-M)', boothSize: '72㎡', productType: '高端特种/防割', popularity: '高' },
        { name: '登升劳保', boothSize: '36㎡', productType: '中高端浸胶', popularity: '中' }
      ],
      ppeCategories: ['战术防护', '防弹装备', '特种手套', '应急救援'],
      gloveTypeDistribution: [
        { type: '战术/射击手套', value: 45 },
        { type: '防割手套', value: 30 },
        { type: '耐高温手套', value: 15 },
        { type: '其他', value: 10 }
      ]
    },
    competitionAssessment: {
      pastExhibitors: ['Mechanix Wear', 'Ansell', 'Honeywell', '3M'],
      participationStyle: '国际大牌多采用沉浸式体验展位，强调实战应用场景。',
      isMustGo: true
    },
    swot: {
      s: ['产品性价比高', '符合特种防护需求', '柔性供应链优势'],
      w: ['品牌在军警领域知名度低', '缺乏本地政府招标资质'],
      o: ['中东地缘政治带动军费增长', '沙特2030愿景带来的本地化机会'],
      t: ['欧美一线品牌长期垄断', '地缘政治风险导致订单波动']
    },
    decisionAdvice: {
      conclusion: '强烈推荐参加。',
      goals: ['签约2家海湾地区政府授权代理商', '收集200张高质量军警装备名片'],
      actionPlan: ['提前6个月申请展位', '准备MIL-SPEC测试报告', '寻找本地担保人/代理。'],
      decisionType: '参展'
    },
    relevance: 9,
    certifications: ['CE (EN388, EN407)', 'ANSI/ISEA 105', 'MIL-SPEC (战术标准)'],
    marketInsight: '中东地区军费开支巨大，对高端特种保护装备需求极高。阿联酋是进入海湾国家市场的门户。',
    pros: ['品牌背书极强', '客单价高', '政府订单潜力大'],
    cons: ['参展成本极高', '竞争对手均为国际一线品牌', '准入门槛高'],
    strategy: '展示高端“战术/特种”系列，强调技术指标 and 实战性能。',
    countryCode: 'ARE',
    valueAssessment: {
      distributorNetwork: '可对接中东地区顶级的防务与安全器材分销商',
      projectOpportunities: '直接参与政府及军方的大型招标预研',
      brandExposure: '全球防务媒体聚焦，极大地提升品牌国际公信力'
    },
    risks: {
      access: '必须通过严格的军用/特种标准测试',
      tariffs: '阿联酋关税较低(约5%)，但认证成本高',
      logistics: '需处理敏感物资运输许可，清关时间较长',
      operational: '地缘政治局局势可能影响展会氛围或后续订单执行'
    },
    demandProducts: ['战术手套', '阻燃手套', '防割手套', '防弹背心', '战术靴']
  },
  {
    id: 'mexico',
    name: '墨西哥国际安全劳保展 (Expo Seguridad Mexico)',
    location: '墨西哥, 墨西哥城 Centro Citibanamex',
    region: '拉美',
    date: '2026年4月21日-23日',
    organizer: 'RX (Reed Exhibitions)',
    edition: '第23届',
    website: 'https://www.exposeguridadmexico.com/',
    background: '拉美地区规模最大的安全类展会，涵盖工业安全、劳保用品及安防监控。',
    targetMarket: '墨西哥本土制造业（汽车、电子、航空）、建筑业及矿业。',
    historicalSuccessRate: 72,
    marketAnalysis: {
      gdp: '墨西哥GDP约1.3万亿美元，是拉美第二大经济体。',
      manufacturingGrowth: '受近岸外包驱动，制造业年增速保持在8%以上。',
      regulations: '强制执行 NOM 劳保标准，企业安全合规性检查日益严格。',
      importStats: {
        majorSources: ['美国', '中国', '德国'],
        chinaShare: '中国产品占墨西哥劳保进口总额的40%，主要集中在中低端。'
      },
      localCompetitors: {
        brands: ['LICA', 'Derma Care'],
        pricingStrategy: '本土品牌主打性价比，定价策略灵活，分销网络深入。'
      }
    },
    marketSize: '拉美劳保市场约25亿美元',
    marketGrowth: '6.2%',
    scale: {
      totalExhibitors: 350,
      professionalVisitors: 15000,
      chineseExhibitors: 80,
      description: '拉美地区最具影响力的安全展，参展商覆盖全产业链。'
    },
    audienceAnalysis: {
      description: '企业安全经理、采购主管、分销商及政府安全部门人员。',
      industryDistribution: [
        { label: '制造业', value: 45 },
        { label: '安防/警用', value: 30 },
        { label: '建筑/矿业', value: 25 }
      ],
      functionDistribution: [
        { label: '分销商/代理商', value: 40 },
        { label: '终端用户(工厂)', value: 35 },
        { label: '政府/公共部门', value: 25 }
      ],
      keyBuyers: ['Pemex', 'CFE', 'Walmart Mexico', '大型汽车零部件供应商'],
      regionalCoverage: '覆盖墨西哥全境及中美洲地区'
    },
    competitorAnalysis: {
      mainPeers: ['3M', 'Honeywell'],
      performance: '3M展位规模大，强调全套解决方案，中端市场竞争激烈。',
      domesticCompetitors: [
        { name: '星宇手套', boothSize: '54㎡', productType: '全系列浸胶', popularity: '高' },
        { name: '恒辉安防', boothSize: '18㎡', productType: '中端防割', popularity: '中' }
      ],
      ppeCategories: ['工业安全', '汽车制造防护', '电子组装防护', '建筑安全'],
      gloveTypeDistribution: [
        { type: '丁腈手套', value: 50 },
        { type: '浸胶手套', value: 30 },
        { type: '防割手套', value: 15 },
        { type: '其他', value: 5 }
      ]
    },
    competitionAssessment: {
      pastExhibitors: ['3M', 'Honeywell', 'Ansell', 'MSA'],
      participationStyle: '北美巨头主导，强调合规性与全套头部到脚趾的防护。',
      isMustGo: true
    },
    swot: {
      s: ['制造业客户高度集中', '符合北美进口偏好', '价格优势明显'],
      w: ['品牌在当地知名度低', '清关手续繁琐且周期长'],
      o: ['近岸外包趋势带动工厂新建', '劳保标准向北美看齐'],
      t: ['当地货币汇率波动', '治安环境复杂影响商务活动']
    },
    decisionAdvice: {
      conclusion: '建议参加。',
      goals: ['签约3家覆盖不同工业区的分销商', '获取5家汽车零部件工厂的试用机会'],
      actionPlan: ['提前申请NOM认证', '准备西班牙语画册', '联系当地物流代理。'],
      decisionType: '参展'
    },
    relevance: 8,
    certifications: ['ANSI/ISEA 105 (北美标准)', 'NOM-113-STPS (墨西哥本土)', 'CE (EN388)'],
    marketInsight: '墨西哥作为北美制造中心，制造业发达，对基础及中端劳保用品需求稳定且庞大。',
    pros: ['市场容量大', '制造业客户集中', '辐射北美及中美洲'],
    cons: ['价格竞争激烈', '物流成本需考量', '清关流程较复杂'],
    strategy: '主打性价比高的“工业制造”系列，寻找当地大型分销商。',
    countryCode: 'MEX',
    valueAssessment: {
      distributorNetwork: '进入墨西哥前五大劳保用品分销体系的关键机会',
      projectOpportunities: '对接汽车、航空等大型制造企业的年度采购合同',
      brandExposure: '确立在拉美市场的专业品牌形象'
    },
    risks: {
      access: 'NOM认证流程较长，需提前准备',
      tariffs: '中国产品可能面临较高的反倾销税或关税，需核实具体税号',
      logistics: '海运周期约30-45天，清关需专业代理',
      operational: '墨西哥城治安需注意，汇率波动可能影响利润'
    },
    demandProducts: ['丁腈手套', 'PU涂层手套', '防割手套', '安全帽', '护目镜']
  },
  {
    id: 'indonesia',
    name: '印尼国际职业安全与健康展览会 (OS+H Asia Indonesia)',
    location: '印尼, 雅加达国际展览中心 (JIExpo)',
    region: '东南亚',
    date: '2026年9月',
    organizer: 'Messe Düsseldorf Asia',
    edition: '第15届',
    website: 'https://www.osha-indonesia.com/',
    background: '东南亚新兴市场的代表性劳保展，专注于职业安全与健康。',
    targetMarket: '印尼矿业、石油天然气、基建及制造业。',
    historicalSuccessRate: 65,
    marketAnalysis: {
      gdp: '印尼GDP约1.1万亿美元，是东南亚最大经济体。',
      manufacturingGrowth: '制造业增速约5%，基建投资年增10%以上。',
      regulations: '政府强化职业安全法规，SNI标准正逐步推广。',
      importStats: {
        majorSources: ['中国', '新加坡', '马来西亚'],
        chinaShare: '印尼劳保产品70%依赖进口，中国产品占45%份额。'
      },
      localCompetitors: {
        brands: ['King\'s (Honeywell)', 'Cheetah'],
        pricingStrategy: '本土品牌在基础鞋服有优势，手套领域中高端仍依赖进口。'
      }
    },
    marketSize: '东南亚劳保市场约15亿美元',
    marketGrowth: '9.1%',
    scale: {
      totalExhibitors: 200,
      professionalVisitors: 8000,
      chineseExhibitors: 60,
      description: '东南亚新兴市场代表，吸引了来自20个国家的参展商。'
    },
    audienceAnalysis: {
      description: '工厂负责人、安全工程师、工会代表及政府监管机构。',
      industryDistribution: [
        { label: '矿业/油气', value: 40 },
        { label: '制造业', value: 30 },
        { label: '基建', value: 20 },
        { label: '其他', value: 10 }
      ],
      functionDistribution: [
        { label: '终端用户(工厂/矿山)', value: 50 },
        { label: '分销商', value: 30 },
        { label: '技术顾问', value: 20 }
      ],
      keyBuyers: ['Pertamina', 'PT Timah', '大型建筑承包商'],
      regionalCoverage: '主要针对印尼本土，辐射东盟部分国家'
    },
    competitorAnalysis: {
      mainPeers: ['Ansell', '众多中国出口企业'],
      performance: '中国展商众多，价格战激烈，主打通用防护，现场人气一般。',
      domesticCompetitors: [
        { name: '康隆达', boothSize: '36㎡', productType: '中低端通用', popularity: '中' },
        { name: '东亚手套', boothSize: '18㎡', productType: '低端PVC/乳胶', popularity: '中' }
      ],
      ppeCategories: ['工业安全', '医疗防护', '建筑安全', '消防装备'],
      gloveTypeDistribution: [
        { type: '乳胶/丁腈手套', value: 60 },
        { type: '浸胶手套', value: 25 },
        { type: '防割手套', value: 10 },
        { type: '其他', value: 5 }
      ]
    },
    competitionAssessment: {
      pastExhibitors: ['Ansell', 'Honeywell', '3M', 'DuPont'],
      participationStyle: '价格竞争激烈，中国企业参展密度极高。',
      isMustGo: false
    },
    swot: {
      s: ['RCEP政策利好', '产品性价比极高', '符合当地基建需求'],
      w: ['品牌溢价能力弱', '售后服务缺失'],
      o: ['印尼新首都建设带动基建爆发', '矿业投资持续增长'],
      t: ['低价劣质产品充斥市场', '当地保护政策抬头']
    },
    decisionAdvice: {
      conclusion: '值得尝试。',
      goals: ['签约2家矿业专业分销商', '收集150张有效名片'],
      actionPlan: ['申请中小企业参展补贴', '准备SNI认证咨询', '开发耐油防滑系列。'],
      decisionType: '观展'
    },
    relevance: 7,
    certifications: ['SNI (印尼国家标准)', 'CE (EN388)', 'ISO 13485'],
    marketInsight: '印尼基建和矿业蓬勃发展，是东南亚最大的经济体，劳保标准正在逐步提升。',
    pros: ['新兴市场增速快', '对中国品牌接受度高', '人口红利大'],
    cons: ['品牌忠诚度尚在建立', '市场分散', '低价竞争明显'],
    strategy: '推广“矿业/重工”耐磨系列，利用RCEP政策优势。',
    countryCode: 'IDN',
    valueAssessment: {
      distributorNetwork: '建立覆盖印尼主要工业岛屿的分销渠道',
      projectOpportunities: '对接印尼国家石油及矿业公司的供应体系',
      brandExposure: '在东南亚最大市场建立品牌存在感'
    },
    risks: {
      access: 'SNI认证可能成为非关税壁垒',
      tariffs: '受益于RCEP，关税逐年降低，但需注意原产地证明',
      logistics: '印尼岛屿众多，物流配送成本较高',
      operational: '政策变动频繁，需寻找可靠的当地合作伙伴'
    },
    demandProducts: ['乳胶手套', '丁腈手套', '基础浸胶手套', '安全帽', '工作服']
  },
  {
    id: 'chile',
    name: '智利国际安全展览会 (Expo Seguridad Chile)',
    location: '智利, 圣地亚哥 Metropolitan Santiago',
    region: '南美',
    date: '2026年10月',
    organizer: 'FISA (GL events)',
    edition: '第8届',
    website: 'https://www.exposeguridad.cl/',
    background: '南美洲西海岸最重要的安全展，深度绑定智利支柱产业——矿业。',
    targetMarket: '智利及秘鲁的矿业公司、林业、渔业及极地作业。',
    historicalSuccessRate: 58,
    marketAnalysis: {
      gdp: '智利GDP约3000亿美元，是南美最稳定的经济体之一。',
      manufacturingGrowth: '矿业设备及安全投入年增5%，专业化程度极高。',
      regulations: '严格执行矿业安全法，需符合 CE 或 ANSI 标准。',
      importStats: {
        majorSources: ['美国', '中国', '欧洲'],
        chinaShare: '中国产品在智利矿业劳保占25%，高端手套市场份额在增长。'
      },
      localCompetitors: {
        brands: ['Segurycel', 'Vicsa'],
        pricingStrategy: '本土品牌与欧美品牌深度合作，主打专业服务与快速响应。'
      }
    },
    marketSize: '智利劳保市场约4亿美元',
    marketGrowth: '5.5%',
    scale: {
      totalExhibitors: 150,
      professionalVisitors: 6000,
      chineseExhibitors: 30,
      description: '南美矿业与安全核心展，专业观众比例高达85%。'
    },
    audienceAnalysis: {
      description: '矿山安全主管、重工业采购商、极地科考保障部门。',
      industryDistribution: [
        { label: '矿业', value: 60 },
        { label: '林业/渔业', value: 20 },
        { label: '政府/应急', value: 20 }
      ],
      functionDistribution: [
        { label: '工厂/矿山采购', value: 60 },
        { label: '分销商', value: 30 },
        { label: '安全顾问', value: 10 }
      ],
      keyBuyers: ['Codelco', 'BHP', 'Antofagasta Minerals'],
      regionalCoverage: '辐射智利、秘鲁及阿根廷西部矿区'
    },
    competitorAnalysis: {
      mainPeers: ['Ansell', 'Superior Glove'],
      performance: 'Superior Glove展位虽小但产品极具特色，主打耐低温和抗冲击，人气集中。',
      domesticCompetitors: [
        { name: '双枪手套', boothSize: '18㎡', productType: '高端矿业抗冲击', popularity: '中' },
        { name: '百安达', boothSize: '9㎡', productType: '中端防护', popularity: '低' }
      ],
      ppeCategories: ['矿业安全', '高空作业', '呼吸防护', '重工业PPE'],
      gloveTypeDistribution: [
        { type: '防撞手套', value: 40 },
        { type: '耐磨手套', value: 35 },
        { type: '防割手套', value: 15 },
        { type: '其他', value: 10 }
      ]
    },
    competitionAssessment: {
      pastExhibitors: ['Ansell', 'Superior Glove', '3M', 'Honeywell'],
      participationStyle: '针对极端环境（矿业）的重型防护展示为主。',
      isMustGo: false
    },
    swot: {
      s: ['耐低温技术成熟', '符合中智自贸协定零关税', '客户群体精准'],
      w: ['地理位置极远导致物流成本高', '品牌在南美缺乏售后'],
      o: ['铜矿开采技术升级带动装备更新', '极地作业特种需求'],
      t: ['南美政治局势波动', '欧美品牌长期建立的信任壁垒']
    },
    decisionAdvice: {
      conclusion: '建议参加。',
      goals: ['签约1家智利全国性矿业劳保代理', '进入1家大型矿业公司的供应商短名单'],
      actionPlan: ['准备耐低温测试报告', '利用零关税政策优化报价', '寻找当地售后合作伙伴。'],
      decisionType: '参展'
    },
    relevance: 8,
    certifications: ['CE (EN388, EN511)', 'ANSI/ISEA 105', 'NCh (智利本地矿业标准)'],
    marketInsight: '智利是世界矿业大国，对高品质、耐极端环境的劳保手套有刚性需求。',
    pros: ['矿业客户极其精准', '市场成熟度高', '购买力强'],
    cons: ['地理位置最远', '市场规模相对较小', '专业要求极高'],
    strategy: '针对“矿业/极端环境”开发定制化产品，强调耐用性和安全性。',
    countryCode: 'CHL',
    valueAssessment: {
      distributorNetwork: '对接南美最专业的矿业安全器材供应商',
      projectOpportunities: '进入世界顶级矿业公司的全球采购短名单',
      brandExposure: '确立在专业矿业防护领域的领先地位'
    },
    risks: {
      access: '矿业标准极严，需提供详尽的测试报告',
      tariffs: '中智自贸协定下大部分产品零关税',
      logistics: '运输距离极远，需预留充足的物流时间',
      operational: '南美社会局势偶有波动，需关注展会期间的稳定性'
    },
    demandProducts: ['防撞手套', '耐磨皮手套', '防割手套', '安全带', '矿工帽']
  },
  {
    id: 'milipol',
    name: '法国巴黎国际军警设备展 (Milipol Paris)',
    location: '法国, 巴黎北郊维勒班特展览中心',
    region: '欧洲',
    date: '2027年11月',
    organizer: 'Comexposium',
    edition: '第25届',
    website: 'https://www.milipol.com/',
    background: '全球国土安全与警用装备的标杆展会，由法国民政部赞助。',
    targetMarket: '欧盟各国警察、宪兵、海关、特种部队及私人安保公司。',
    historicalSuccessRate: 82,
    marketAnalysis: {
      gdp: '法国GDP约2.9万亿美元，是欧洲主要经济体。',
      manufacturingGrowth: '国土安全市场年增4%，特种防护需求稳健。',
      regulations: '必须符合严格的 CE 认证及 REACH 环保法规。',
      importStats: {
        majorSources: ['欧盟内部', '美国', '中国'],
        chinaShare: '中国产品在欧洲警用手套占20%，主要受限于认证门槛。'
      },
      localCompetitors: {
        brands: ['Mehler', 'Rostaing'],
        pricingStrategy: '欧洲品牌主打“欧洲制造”和极致合规，价格极高。'
      }
    },
    marketSize: '欧洲劳保市场约60亿美元',
    marketGrowth: '4.2%',
    scale: {
      totalExhibitors: 1000,
      professionalVisitors: 30000,
      chineseExhibitors: 120,
      description: '欧洲顶级国土安全展，参展商来自150个国家。'
    },
    audienceAnalysis: {
      description: '各国政府安全部门官员、反恐专家、警用装备采购决策者。',
      industryDistribution: [
        { label: '警用/宪兵', value: 50 },
        { label: '特种部队', value: 20 },
        { label: '私人安保', value: 20 },
        { label: '政府官员', value: 10 }
      ],
      functionDistribution: [
        { label: '政府/军警采购', value: 70 },
        { label: '技术专家', value: 20 },
        { label: '分销商', value: 10 }
      ],
      keyBuyers: ['法国民政部', '欧盟边境管理局 (Frontex)', '各国警察总部'],
      regionalCoverage: '全球辐射，重点覆盖全欧洲及非洲法语区'
    },
    competitorAnalysis: {
      mainPeers: ['HexArmor', '5.11 Tactical'],
      performance: 'HexArmor展位极具科技感，展示防刺、防割专利技术，是行业标杆。',
      domesticCompetitors: [
        { name: '赛立特 (Safety-M)', boothSize: '54㎡', productType: '高端防割/环保', popularity: '高' },
        { name: '纳清科技', boothSize: '18㎡', productType: '高端纳米材料', popularity: '中' }
      ],
      ppeCategories: ['警用装备', '防弹防护', '特种手套', '反恐器材'],
      gloveTypeDistribution: [
        { type: '防刺/防割手套', value: 50 },
        { type: '战术手套', value: 30 },
        { type: '防化手套', value: 10 },
        { type: '其他', value: 10 }
      ]
    },
    competitionAssessment: {
      pastExhibitors: ['HexArmor', '5.11 Tactical', 'Ansell', 'Honeywell'],
      participationStyle: '强调技术创新与专利保护，展位设计极具未来感。',
      isMustGo: true
    },
    swot: {
      s: ['研发实力强', '产品符合CE最新标准', '成本控制能力'],
      w: ['缺乏欧洲本土服务网点', '文化与语言障碍'],
      o: ['欧洲反恐需求持续增加', '环保材料手套的市场缺口'],
      t: ['严格的出口管制', '欧洲本土保护主义抬头']
    },
    decisionAdvice: {
      conclusion: '强烈建议参加。',
      goals: ['对接3家欧洲大型警用装备分销商', '获取欧盟边境管理局的咨询机会'],
      actionPlan: ['确保CE认证百分之百合规', '聘请专业法语翻译', '准备环保材料样品。'],
      decisionType: '参展'
    },
    relevance: 9,
    certifications: ['CE (EN ISO 21420, EN388:2016)', 'REACH (环保法规)', 'OEKO-TEX'],
    marketInsight: '欧洲市场对环保、合规（CE认证）和创新材料有极高要求，是品牌高端化的必经之路。',
    pros: ['全球行业风向标', '建立高端品牌形象', '接触欧洲高端买家'],
    cons: ['认证要求极严', '文化差异大', '运营成本高'],
    strategy: '展示符合最新欧盟标准的“创新/环保”系列，对标国际顶级品牌。',
    countryCode: 'FRA',
    valueAssessment: {
      distributorNetwork: '对接欧洲最顶级的军警与安全器材分销网络',
      projectOpportunities: '参与欧盟级别的安全装备采购咨询与预研',
      brandExposure: '全球安全行业最高级别的品牌背书'
    },
    risks: {
      access: 'CE认证及REACH合规是绝对前提，不容有失',
      tariffs: '需关注欧盟对中国纺织品/劳保用品的最新关税政策',
      logistics: '欧洲清关极其严格，需确保单证百分之百准确',
      operational: '高昂的参展与差旅成本，需确保投入产出比'
    },
    demandProducts: ['防刺手套', '防割手套', '战术手套', '防弹衣', '防暴头盔']
  },
  {
    id: 'thailand-tosh',
    name: '泰国国际职业安全健康展 (Thailand TOSH)',
    location: '泰国, 曼谷 BITEC',
    region: '东南亚',
    date: '2026年7月',
    organizer: 'TOSH (Thailand Institute of Occupational Safety and Health)',
    edition: '第36届',
    website: 'https://www.tosh.or.th/',
    background: '泰国最权威的职业安全展，由泰国劳工部下属机构主办，是进入泰国工业安全市场的核心窗口。',
    targetMarket: '泰国东部经济走廊 (EEC) 的工业区、建筑业及食品加工业。',
    historicalSuccessRate: 75,
    marketAnalysis: {
      gdp: '泰国GDP约5000亿美元，是东南亚第二大经济体。',
      manufacturingGrowth: 'EEC计划带动制造业年增6%，对高端PPE需求日益增长。',
      regulations: '泰国劳工部强制执行安全标准，TIS标准与国际接轨。',
      importStats: {
        majorSources: ['中国', '日本', '美国'],
        chinaShare: '中国产品占泰国劳保进口的50%以上，具有绝对价格优势。'
      },
      localCompetitors: {
        brands: ['Pangolin', 'Yamada'],
        pricingStrategy: '本土品牌在安全鞋领域极强，手套市场则以中国进口品牌为主。'
      }
    },
    marketSize: '泰国劳保市场约6亿美元',
    marketGrowth: '7.2%',
    scale: {
      totalExhibitors: 250,
      professionalVisitors: 12000,
      chineseExhibitors: 70,
      description: '泰国政府背景展会，专业观众质量极高。'
    },
    audienceAnalysis: {
      description: '政府安全官员、工厂HSE经理、大型建筑承包商及分销商。',
      industryDistribution: [
        { label: '制造业', value: 40 },
        { label: '建筑业', value: 30 },
        { label: '政府/公共部门', value: 20 },
        { label: '其他', value: 10 }
      ],
      functionDistribution: [
        { label: 'HSE经理/工程师', value: 45 },
        { label: '采购主管', value: 30 },
        { label: '分销商', value: 25 }
      ],
      keyBuyers: ['PTT Public Company', 'CP Group', 'SCG (Siam Cement Group)'],
      regionalCoverage: '主要针对泰国本土，辐射中南半岛国家'
    },
    competitorAnalysis: {
      mainPeers: ['3M Thailand', 'Ansell'],
      performance: '3M在当地品牌影响力极大，通过深度分销网络覆盖中小工厂。',
      domesticCompetitors: [
        { name: '星宇手套', boothSize: '36㎡', productType: '全系列浸胶', popularity: '高' },
        { name: '康隆达', boothSize: '18㎡', productType: '中端防割', popularity: '中' }
      ],
      ppeCategories: ['工业安全', '建筑安全', '食品加工防护', '汽车制造防护'],
      gloveTypeDistribution: [
        { type: '丁腈浸胶手套', value: 45 },
        { type: '乳胶手套', value: 30 },
        { type: '防割手套', value: 15 },
        { type: '其他', value: 10 }
      ]
    },
    competitionAssessment: {
      pastExhibitors: ['3M', 'Ansell', 'Honeywell', 'Pangolin'],
      participationStyle: '强调本地化服务与合规性培训。',
      isMustGo: true
    },
    swot: {
      s: ['中泰友谊及RCEP零关税', '地理位置近，物流便捷', '产品线覆盖广'],
      w: ['品牌溢价较低', '本地化营销投入不足'],
      o: ['EEC工业区扩建带来的增量市场', '泰国安全法规日益严格'],
      t: ['日系品牌在泰国的深厚根基', '低价竞争导致利润摊薄']
    },
    decisionAdvice: {
      conclusion: '强烈建议参加。',
      goals: ['签约3家EEC工业区核心分销商', '与2家大型建筑集团建立直供联系'],
      actionPlan: ['准备TIS标准对照表', '寻找泰语销售人员', '开发适合湿热环境的透气系列。'],
      decisionType: '参展'
    },
    relevance: 9,
    certifications: ['TIS (泰国标准)', 'CE (EN388)', 'ISO 9001'],
    marketInsight: '泰国作为“亚洲底特律”，汽车及相关制造业发达，对劳保用品有持续且高质量的需求。',
    pros: ['政府支持背景', '市场准入门槛适中', '辐射东南亚核心区'],
    cons: ['日系品牌竞争压力', '对本地化服务要求高', '价格敏感度依然存在'],
    strategy: '展示“透气/舒适/高性能”系列，强调针对东南亚气候的定制化设计。',
    countryCode: 'THA',
    valueAssessment: {
      distributorNetwork: '进入泰国主流工业分销体系的必经之路',
      projectOpportunities: '对接泰国国家石油及大型基建项目的采购窗口',
      brandExposure: '确立在东南亚核心市场的专业品牌地位'
    },
    risks: {
      access: '需关注TIS标准的更新及强制执行范围',
      tariffs: 'RCEP框架下基本零关税，需备好原产地证',
      logistics: '海运/陆运均非常成熟，成本较低',
      operational: '需注意泰国的商务礼仪及本地化运营细节'
    },
    demandProducts: ['丁腈手套', '乳胶手套', '透气浸胶手套', '安全鞋', '护目镜']
  },
  {
    id: 'brazil-fisp',
    name: '巴西国际劳保展 (FISP - International Trade Fair for Safety and Protection)',
    location: '巴西, 圣保罗 São Paulo Expo',
    region: '南美',
    date: '2026年10月',
    organizer: 'Fiera Milano Brasil',
    edition: '第25届',
    website: 'https://fispvirtual.com.br/',
    background: '南美洲规模最大、最专业的劳保展，是进入巴西及南共体市场的唯一选择。',
    targetMarket: '巴西采矿业、农业、石油天然气及庞大的制造业。',
    historicalSuccessRate: 68,
    marketAnalysis: {
      gdp: '巴西GDP约1.6万亿美元，是拉美第一大经济体。',
      manufacturingGrowth: '工业产值稳步回升，矿业与农业对PPE需求巨大。',
      regulations: '必须持有 CA (Certificado de Aprovação) 认证才能合法销售。',
      importStats: {
        majorSources: ['中国', '美国', '德国'],
        chinaShare: '中国产品占巴西劳保进口的35%，但在CA认证产品中占比仍有提升空间。'
      },
      localCompetitors: {
        brands: ['Danny', 'Marluvas'],
        pricingStrategy: '本土品牌拥有深厚的CA认证壁垒和分销网络，定价较高。'
      }
    },
    marketSize: '南美劳保市场约30亿美元',
    marketGrowth: '5.8%',
    scale: {
      totalExhibitors: 700,
      professionalVisitors: 50000,
      chineseExhibitors: 100,
      description: '南美劳保行业两年一度的盛会，覆盖全产业链。'
    },
    audienceAnalysis: {
      description: '安全工程师、职业医生、采购经理、分销商及工会代表。',
      industryDistribution: [
        { label: '矿业/农业', value: 35 },
        { label: '制造业', value: 30 },
        { label: '油气/电力', value: 20 },
        { label: '其他', value: 15 }
      ],
      functionDistribution: [
        { label: '分销商/批发商', value: 45 },
        { label: '终端用户采购', value: 35 },
        { label: '安全咨询/技术', value: 20 }
      ],
      keyBuyers: ['Vale (淡水河谷)', 'Petrobras (巴西石油)', 'JBS', '大型分销商如Danny'],
      regionalCoverage: '覆盖巴西全境，辐射南共体 (Mercosur) 国家'
    },
    competitorAnalysis: {
      mainPeers: ['Ansell Brazil', 'Honeywell'],
      performance: 'Ansell在巴西拥有本地工厂和强大的直销团队，主打高端定制化方案。',
      domesticCompetitors: [
        { name: '星宇手套', boothSize: '72㎡', productType: '全系列CA认证', popularity: '高' },
        { name: '恒辉安防', boothSize: '36㎡', productType: '高端防割', popularity: '中' }
      ],
      ppeCategories: ['矿业安全', '农业防护', '油气防护', '建筑安全'],
      gloveTypeDistribution: [
        { type: '防割手套', value: 40 },
        { type: '耐油手套', value: 30 },
        { type: '皮手套', value: 20 },
        { type: '其他', value: 10 }
      ]
    },
    competitionAssessment: {
      pastExhibitors: ['Ansell', 'Honeywell', '3M', 'Danny', 'Marluvas'],
      participationStyle: '展位规模宏大，强调品牌实力与本地化认证。',
      isMustGo: true
    },
    swot: {
      s: ['产品线丰富', '价格竞争力强', '对南美市场有长期投入'],
      w: ['CA认证周期长、成本高', '品牌知名度尚需提升'],
      o: ['巴西基建投资法案带来的机会', '农业现代化对PPE的新需求'],
      t: ['巴西高昂的进口关税及复杂的税制', '本土品牌的CA认证保护主义']
    },
    decisionAdvice: {
      conclusion: '强烈建议参加。',
      goals: ['签约2家具有CA认证操作能力的全国性分销商', '对接3家大型矿业/农业集团'],
      actionPlan: ['提前12个月启动CA认证申请', '寻找本地税务/法律顾问', '开发适合南美手型的系列。'],
      decisionType: '参展'
    },
    relevance: 9,
    certifications: ['CA (巴西强制认证)', 'CE (EN388)', 'ISO 14001'],
    marketInsight: '巴西市场潜力巨大但门槛极高，CA认证是生死线，复杂的税制需要本地合作伙伴。',
    pros: ['拉美最大市场', '客户忠诚度高', '客单价较东南亚高'],
    cons: ['CA认证门槛', '极高关税', '物流清关极其复杂'],
    strategy: '展示“已获CA认证”的高端系列，寻找有实力的本地合作伙伴共同分担认证成本。',
    countryCode: 'BRA',
    valueAssessment: {
      distributorNetwork: '建立进入巴西及南共体市场的核心分销矩阵',
      projectOpportunities: '直接参与淡水河谷、巴西石油等巨头的全球采购体系',
      brandExposure: '确立在南美市场的顶级供应商地位'
    },
    risks: {
      access: 'CA认证是进入巴西市场的唯一凭证，且需定期复审',
      tariffs: '巴西对中国产品有关税保护，需通过本地化或差异化竞争规避',
      logistics: '巴西清关被称为“世界最难”，必须使用专业代理',
      operational: '汇率波动剧烈，需做好风险对冲'
    },
    demandProducts: ['防割手套', '耐油手套', '皮手套', '安全靴', '防护服']
  }
];

// --- Components ---

const StatCard = ({ icon: Icon, title, value, sub }: { icon: any, title: string, value: string, sub: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-4 mb-3">
      <div className="p-2 bg-zinc-50 rounded-lg">
        <Icon className="w-5 h-5 text-zinc-600" />
      </div>
      <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{title}</span>
    </div>
    <div className="text-2xl font-bold text-zinc-900">{value}</div>
    <div className="text-xs text-zinc-400 mt-1">{sub}</div>
  </div>
);

const AIAdvisor = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const advisorContext = useMemo(() => {
    return EXHIBITIONS.map(ex => ({
      name: ex.name,
      market: ex.targetMarket,
      size: ex.marketSize,
      growth: ex.marketGrowth,
      pros: ex.pros,
      cons: ex.cons,
      risks: ex.risks,
      value: ex.valueAssessment,
      competitors: ex.competitorAnalysis,
      demand: ex.demandProducts,
      advice: ex.decisionAdvice
    }));
  }, []);

  const handleAskAIWithContext = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你是一位资深的国际展会咨询专家。用户是一家中国劳保手套公司，正在考虑参加以下展会：
        ${JSON.stringify(advisorContext, null, 2)}
        
        请针对以下问题提供专业的建议：${query}
        要求：语言专业、客观、有针对性。请结合上述展会的市场规模、竞争格局、价值评估和风险因素进行深度分析。`,
      });
      const result = await model;
      setResponse(result.text || '无法获取建议，请稍后再试。');
    } catch (error) {
      console.error('AI Error:', error);
      setResponse('咨询助手暂时离线，请检查网络连接。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-3xl p-8 text-white">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-emerald-400" />
        <h3 className="text-xl font-bold">AI 决策咨询顾问</h3>
      </div>
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例如：如果我的预算有限，首选哪两个展会？或者：针对智利矿业市场，我的手套需要哪些认证？"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] resize-none"
          />
          <button
            onClick={handleAskAIWithContext}
            disabled={loading}
            className="absolute bottom-4 right-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            {loading ? '思考中...' : '立即咨询'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <AnimatePresence>
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 text-sm leading-relaxed text-zinc-300"
            >
              <div className="flex items-center gap-2 mb-3 text-emerald-400 font-medium">
                <MessageSquare className="w-4 h-4" />
                顾问建议：
              </div>
              <div className="whitespace-pre-wrap">{response}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const BudgetPlanner = ({ budgets, setBudgets, onSave, onReset, boothSize, setBoothSize }: { 
  budgets: Record<string, BudgetEntry>, 
  setBudgets: React.Dispatch<React.SetStateAction<Record<string, BudgetEntry>>>,
  onSave: () => void,
  onReset: () => void,
  boothSize: '9' | '18' | '36',
  setBoothSize: (size: '9' | '18' | '36') => void
}) => {
  const handleInputChange = (id: string, field: keyof BudgetEntry, value: string) => {
    const numValue = parseFloat(value) || 0;
    setBudgets(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: numValue
      }
    }));
  };

  const chartData = useMemo(() => {
    return EXHIBITIONS.map(ex => {
      const b = budgets[ex.id] || { booth9: 0, booth18: 0, booth36: 0, construction: 0, shipping: 0, travel: 0, marketing: 0, other: 0 };
      const boothCost = boothSize === '9' ? b.booth9 : boothSize === '18' ? b.booth18 : b.booth36;
      const total = boothCost + b.construction + b.shipping + b.travel + b.marketing + b.other;
      return {
        name: ex.name.split(' ')[0],
        total,
        ...b
      };
    });
  }, [budgets, boothSize]);

  const totalOverall = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.total, 0);
  }, [chartData]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8">
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold">预算配置选项</h3>
          <p className="text-sm text-zinc-500">选择您的预估展位面积，系统将自动调整总预算对比。</p>
        </div>
        <div className="flex bg-zinc-100 p-1 rounded-xl">
          {(['9', '18', '36'] as const).map(size => (
            <button
              key={size}
              onClick={() => setBoothSize(size)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                boothSize === size ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {size}㎡
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Budget Inputs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              详细成本录入 (单位: 万元)
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-500 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                重置
              </button>
              <button 
                onClick={onSave}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
              >
                <Save className="w-4 h-4" />
                保存配置
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {EXHIBITIONS.map(ex => (
              <div key={ex.id} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-xs font-bold">
                      {ex.region.substring(0, 2)}
                    </div>
                    <h4 className="font-bold text-zinc-900">{ex.name}</h4>
                  </div>
                  <div className="text-sm font-bold text-emerald-600">
                    当前规模总计: {chartData.find(d => d.name === ex.name.split(' ')[0])?.total.toFixed(1)} 万
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 md:col-span-4 grid grid-cols-3 gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">9㎡ 展位费</label>
                      <input type="number" value={budgets[ex.id]?.booth9 || ''} onChange={(e) => handleInputChange(ex.id, 'booth9', e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs outline-none" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">18㎡ 展位费</label>
                      <input type="number" value={budgets[ex.id]?.booth18 || ''} onChange={(e) => handleInputChange(ex.id, 'booth18', e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs outline-none" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">36㎡ 展位费</label>
                      <input type="number" value={budgets[ex.id]?.booth36 || ''} onChange={(e) => handleInputChange(ex.id, 'booth36', e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs outline-none" />
                    </div>
                  </div>
                  {(['construction', 'shipping', 'travel', 'marketing', 'other'] as const).map(field => (
                    <div key={field}>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                        {field === 'construction' ? '装修搭建' : 
                         field === 'shipping' ? '展品运输' : 
                         field === 'travel' ? '人员差旅' : 
                         field === 'marketing' ? '营销宣传' : '其他(资料/礼品)'}
                      </label>
                      <input
                        type="number"
                        value={budgets[ex.id]?.[field] || ''}
                        onChange={(e) => handleInputChange(ex.id, field, e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary & Charts */}
        <div className="space-y-6">
          <div className="bg-zinc-900 text-white rounded-3xl p-8 shadow-xl">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">年度参展总预算 ({boothSize}㎡ 方案)</h3>
            <div className="text-5xl font-black text-emerald-400 mb-2">
              ¥{totalOverall.toFixed(1)} <span className="text-xl">万</span>
            </div>
            <p className="text-zinc-400 text-sm">基于当前输入的 5 个展会预估总和</p>
            
            <div className="mt-8 pt-8 border-t border-zinc-800 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">平均单展成本</span>
                <span className="font-bold">{(totalOverall / EXHIBITIONS.length).toFixed(1)} 万</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">最高预算展会</span>
                <span className="font-bold text-emerald-400">
                  {chartData.sort((a, b) => b.total - a.total)[0]?.name || '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> 预算分布对比
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8f9fa' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(EXHIBITIONS[0].id);
  const [view, setView] = useState<'report' | 'budget' | 'map' | 'compare'>('report');
  const [boothSize, setBoothSize] = useState<'9' | '18' | '36'>('18');
  
  // Budget State
  const initialBudgets = {
    'a-plus-a': { booth9: 10, booth18: 18, booth36: 32, construction: 15, shipping: 6, travel: 10, marketing: 8, other: 4 },
    nsc: { booth9: 8, booth18: 15, booth36: 28, construction: 12, shipping: 8, travel: 12, marketing: 6, other: 3 },
    idex: { booth9: 8, booth18: 15, booth36: 28, construction: 12, shipping: 4, travel: 6, marketing: 5, other: 2 },
    mexico: { booth9: 4, booth18: 8, booth36: 15, construction: 6, shipping: 5, travel: 7, marketing: 3, other: 2 },
    indonesia: { booth9: 2.5, booth18: 5, booth36: 9, construction: 4, shipping: 3, travel: 3, marketing: 2, other: 1 },
    chile: { booth9: 3, booth18: 6, booth36: 11, construction: 5, shipping: 6, travel: 9, marketing: 2, other: 2 },
    milipol: { booth9: 6, booth18: 12, booth36: 22, construction: 10, shipping: 4, travel: 7, marketing: 4, other: 3 },
    'thailand-tosh': { booth9: 3, booth18: 6, booth36: 11, construction: 5, shipping: 3, travel: 4, marketing: 3, other: 2 },
    'brazil-fisp': { booth9: 5, booth18: 10, booth36: 18, construction: 8, shipping: 7, travel: 10, marketing: 4, other: 3 }
  };

  const [budgets, setBudgets] = useState<Record<string, BudgetEntry>>(() => {
    const saved = localStorage.getItem('exhibition_budgets');
    return saved ? JSON.parse(saved) : initialBudgets;
  });

  const handleSaveBudgets = () => {
    localStorage.setItem('exhibition_budgets', JSON.stringify(budgets));
    alert('预算配置已保存到本地。');
  };

  const handleResetBudgets = () => {
    if (confirm('确定要重置所有预算数据吗？')) {
      setBudgets(initialBudgets);
      localStorage.removeItem('exhibition_budgets');
    }
  };
  
  const activeExhibition = useMemo(() => 
    EXHIBITIONS.find(e => e.id === activeTab) || EXHIBITIONS[0]
  , [activeTab]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">海外参展决策系统</h1>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Global Exhibition Intelligence</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setView('report')}
              className={`text-sm font-medium transition-all pb-1 ${view === 'report' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              调研报告
            </button>
            <button 
              onClick={() => setView('budget')}
              className={`text-sm font-medium transition-all pb-1 ${view === 'budget' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              预算规划
            </button>
            <button 
              onClick={() => setView('map')}
              className={`text-sm font-medium transition-all pb-1 ${view === 'map' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              市场地图
            </button>
            <button 
              onClick={() => setView('compare')}
              className={`text-sm font-medium transition-all pb-1 ${view === 'compare' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              横向对比
            </button>
          </nav>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-zinc-400">当前用户</div>
              <div className="text-sm font-medium">劳保行业决策者</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
              <Users className="w-5 h-5 text-zinc-600" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard icon={Globe2} title="覆盖区域" value="4 大洲" sub="中东、拉美、东南亚、欧洲" />
          <StatCard icon={Target} title="重点展会" value="5 个" sub="军警与劳保双重维度" />
          <StatCard icon={TrendingUp} title="平均相关度" value="8.2 / 10" sub="基于手套行业匹配度" />
          <StatCard icon={Award} title="核心机遇" value="特种防护" sub="战术、矿业、高科技材料" />
        </div>

        {view === 'report' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3 space-y-2">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 px-2">展会列表</h2>
              {EXHIBITIONS.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setActiveTab(ex.id)}
                  className={`w-full text-left px-4 py-4 rounded-2xl transition-all flex items-center justify-between group ${
                    activeTab === ex.id 
                      ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900' 
                      : 'text-zinc-500 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{ex.name.split(' ')[0]}</span>
                    <span className="text-[10px] opacity-60 uppercase tracking-tighter">{ex.region}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === ex.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
              ))}
              
              <div className="mt-10 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <Info className="w-5 h-5 text-emerald-600 mb-3" />
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  提示：建议根据您的产品线（如：战术系列 vs. 工业系列）优先选择相关度 8 分以上的展会。
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden"
                >
                  {/* Hero Section */}
                  <div className="p-8 border-b border-zinc-100 bg-gradient-to-br from-white to-zinc-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                            {activeExhibition.region}
                          </span>
                          <span className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {activeExhibition.location}
                          </span>
                          <span className="text-xs font-medium text-zinc-400 flex items-center gap-1 ml-2">
                            <Award className="w-3 h-3" /> 第 {activeExhibition.edition} 届
                          </span>
                        </div>
                        <h2 className="text-3xl font-bold text-zinc-900 mb-2">{activeExhibition.name}</h2>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {activeExhibition.date}</span>
                          <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> 主办：{activeExhibition.organizer}</span>
                          <span className="flex items-center gap-1.5"><Globe2 className="w-4 h-4" /> <a href={activeExhibition.website} target="_blank" rel="noreferrer" className="hover:text-emerald-500 underline decoration-zinc-200">官方网站</a></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs text-zinc-400 font-bold uppercase">行业相关度</div>
                          <div className="text-3xl font-black text-emerald-500">{activeExhibition.relevance}/10</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Report Content */}
                  <div className="p-8 space-y-12">
                    {/* 1. Background & Market */}
                    <div className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <section>
                          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4" /> 调研背景与目的
                          </h3>
                          <p className="text-zinc-700 leading-relaxed text-sm bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                            {activeExhibition.background}
                          </p>
                        </section>
                        <section>
                          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Target className="w-4 h-4" /> 目标市场分析
                          </h3>
                          <p className="text-zinc-700 leading-relaxed text-sm bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                            {activeExhibition.targetMarket}
                          </p>
                        </section>
                      </div>

                      <section className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100">
                        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" /> 市场深度背景 (Market Context)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-4">
                            <div>
                              <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">宏观经济</div>
                              <div className="text-sm font-bold text-zinc-900">GDP: {activeExhibition.marketAnalysis.gdp}</div>
                              <div className="text-xs text-emerald-600 font-medium mt-1">制造业增速: {activeExhibition.marketAnalysis.manufacturingGrowth}</div>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">市场规模与增速</div>
                              <div className="text-sm font-bold text-zinc-900">{activeExhibition.marketSize}</div>
                              <div className="text-xs text-emerald-600 font-medium mt-1">↑ {activeExhibition.marketGrowth}</div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">法规与准入要求</div>
                              <p className="text-xs text-zinc-600 leading-relaxed">{activeExhibition.marketAnalysis.regulations}</p>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">进口统计与来源</div>
                              <div className="text-xs text-zinc-600 leading-relaxed">
                                <div className="font-bold">主要来源: {activeExhibition.marketAnalysis.importStats.majorSources.join(', ')}</div>
                                <div>中国份额: {activeExhibition.marketAnalysis.importStats.chinaShare}</div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">本地竞争对手</div>
                            <div className="text-xs text-zinc-600 leading-relaxed">
                              <div className="font-bold">主要品牌: {activeExhibition.marketAnalysis.localCompetitors.brands.join(', ')}</div>
                              <div>定价策略: {activeExhibition.marketAnalysis.localCompetitors.pricingStrategy}</div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>

                    {/* 2. Scale & Audience */}
                    <div className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <section>
                          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" /> 展会规模与数据
                          </h3>
                          <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="text-center p-3 bg-white rounded-xl border border-zinc-100">
                                <div className="text-[10px] text-zinc-400 uppercase font-bold">总展商</div>
                                <div className="text-lg font-black text-zinc-900">{activeExhibition.scale.totalExhibitors}</div>
                              </div>
                              <div className="text-center p-3 bg-white rounded-xl border border-zinc-100">
                                <div className="text-[10px] text-zinc-400 uppercase font-bold">专业观众</div>
                                <div className="text-lg font-black text-zinc-900">{activeExhibition.scale.professionalVisitors}</div>
                              </div>
                              <div className="text-center p-3 bg-white rounded-xl border border-zinc-100">
                                <div className="text-[10px] text-zinc-400 uppercase font-bold">中国展商</div>
                                <div className="text-lg font-black text-zinc-900">{activeExhibition.scale.chineseExhibitors}</div>
                              </div>
                            </div>
                            <p className="text-zinc-600 text-sm leading-relaxed">{activeExhibition.scale.description}</p>
                          </div>
                        </section>
                        <section>
                          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4" /> 展商与观众分析
                          </h3>
                          <p className="text-zinc-700 leading-relaxed text-sm bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                            {activeExhibition.audienceAnalysis.description}
                          </p>
                        </section>
                      </div>

                      <section className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Users className="w-4 h-4" /> 观众分布与质量
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase mb-3">行业分布</div>
                            <div className="space-y-2">
                              {activeExhibition.audienceAnalysis.industryDistribution.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                  <span className="text-zinc-600">{item.label}</span>
                                  <span className="font-bold text-zinc-900">{item.value}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase mb-3">职能分布</div>
                            <div className="space-y-2">
                              {activeExhibition.audienceAnalysis.functionDistribution.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                  <span className="text-zinc-600">{item.label}</span>
                                  <span className="font-bold text-zinc-900">{item.value}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">重点买家/机构</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {activeExhibition.audienceAnalysis.keyBuyers.map((b, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-zinc-50 border border-zinc-200 rounded text-[10px] text-zinc-600">{b}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">区域辐射</div>
                              <p className="text-xs text-zinc-600">{activeExhibition.audienceAnalysis.regionalCoverage}</p>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>

                    {/* 3. Competitors, Products & SWOT */}
                    <div className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <section>
                          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> 竞品参展情况分析
                          </h3>
                          <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 space-y-4">
                            <div>
                              <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">主要同行</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {activeExhibition.competitorAnalysis?.mainPeers?.map((p, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-white border border-zinc-200 rounded text-[10px] text-zinc-600">{p}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">竞品品类分布 (Glove Focus)</div>
                              <div className="space-y-2 mt-2">
                                {activeExhibition.competitorAnalysis?.gloveTypeDistribution?.map((item, i) => (
                                  <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-zinc-500">{item.type}</span>
                                      <span className="font-bold">{item.value}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-zinc-200 rounded-full overflow-hidden">
                                      <div className="h-full bg-zinc-900" style={{ width: `${item.value}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-zinc-400 uppercase mb-2 mt-2">国内主要竞争对手</div>
                              <div className="space-y-2">
                                {activeExhibition.competitorAnalysis?.domesticCompetitors?.map((dc, i) => (
                                  <div key={i} className="bg-white p-3 rounded-xl border border-zinc-100">
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="text-xs font-bold text-zinc-900">{dc.name}</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        dc.popularity === '高' ? 'bg-emerald-100 text-emerald-700' : 
                                        dc.popularity === '中' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-700'
                                      }`}>
                                        人气: {dc.popularity}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                      <div className="text-zinc-500">展位: <span className="text-zinc-900 font-medium">{dc.boothSize}</span></div>
                                      <div className="text-zinc-500 text-right">产品: <span className="text-zinc-900 font-medium">{dc.productType}</span></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </section>
                        <section>
                          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" /> 展会需求产品 (Demand)
                          </h3>
                          <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                            <div className="grid grid-cols-1 gap-3">
                              {activeExhibition.demandProducts?.map((product, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-zinc-100">
                                  <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  </div>
                                  <span className="text-sm font-medium text-zinc-900">{product}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                              <div className="text-[10px] font-bold text-amber-600 uppercase mb-1">采购偏好</div>
                              <p className="text-xs text-amber-800 leading-relaxed">
                                该市场目前对 <span className="font-bold">{activeExhibition.demandProducts?.[0]}</span> 的询盘量最大，建议作为主推产品。
                              </p>
                            </div>
                          </div>
                        </section>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <section>
                          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Award className="w-4 h-4" /> SWOT 深度分析
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                              <div className="text-[10px] font-black text-emerald-600 uppercase mb-1">Strengths</div>
                              <ul className="text-[11px] text-emerald-800 space-y-1">
                                {activeExhibition.swot?.s?.map((s, i) => <li key={i}>• {s}</li>)}
                              </ul>
                            </div>
                            <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                              <div className="text-[10px] font-black text-amber-600 uppercase mb-1">Weaknesses</div>
                              <ul className="text-[11px] text-amber-800 space-y-1">
                                {activeExhibition.swot?.w?.map((w, i) => <li key={i}>• {w}</li>)}
                              </ul>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                              <div className="text-[10px] font-black text-blue-600 uppercase mb-1">Opportunities</div>
                              <ul className="text-[11px] text-blue-800 space-y-1">
                                {activeExhibition.swot?.o?.map((o, i) => <li key={i}>• {o}</li>)}
                              </ul>
                            </div>
                            <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                              <div className="text-[10px] font-black text-red-600 uppercase mb-1">Threats</div>
                              <ul className="text-[11px] text-red-800 space-y-1">
                                {activeExhibition.swot?.t?.map((t, i) => <li key={i}>• {t}</li>)}
                              </ul>
                            </div>
                          </div>
                        </section>

                        <section>
                          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" /> 市场价值评估
                          </h3>
                          <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 space-y-4">
                            <div>
                              <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">分销网络</div>
                              <p className="text-sm text-zinc-700">{activeExhibition.valueAssessment.distributorNetwork}</p>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">项目机会</div>
                              <p className="text-sm text-zinc-700">{activeExhibition.valueAssessment.projectOpportunities}</p>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">品牌曝光</div>
                              <p className="text-sm text-zinc-700">{activeExhibition.valueAssessment.brandExposure}</p>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>

                      <section className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100">
                        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> 同行与竞争评估
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">往届重点参展商</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {activeExhibition.competitionAssessment?.pastExhibitors?.map((e, i) => (
                                <span key={i} className="px-2 py-0.5 bg-white border border-zinc-200 rounded text-[10px] text-zinc-600">{e}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">同行参展风格</div>
                            <p className="text-xs text-zinc-600 leading-relaxed">{activeExhibition.competitionAssessment?.participationStyle}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl flex-1 text-center border ${activeExhibition.competitionAssessment?.isMustGo ? 'bg-emerald-50 border-emerald-100' : 'bg-zinc-100 border-zinc-200'}`}>
                              <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">行业“必选项”</div>
                              <div className={`text-sm font-bold ${activeExhibition.competitionAssessment?.isMustGo ? 'text-emerald-700' : 'text-zinc-500'}`}>
                                {activeExhibition.competitionAssessment?.isMustGo ? '是 (竞品高度集中)' : '否 (可选性参加)'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>

                    {/* 4. Potential & Goals */}
                    <div className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <section>
                          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Target className="w-4 h-4" /> 参展目标与策略
                          </h3>
                          <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 space-y-4">
                            <div>
                              <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">核心目标</div>
                              <ul className="text-sm text-zinc-700 space-y-1">
                                {activeExhibition.decisionAdvice.goals.map((g, i) => <li key={i}>• {g}</li>)}
                              </ul>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">重点展示</div>
                              <p className="text-sm text-zinc-700">{activeExhibition.strategy}</p>
                            </div>
                          </div>
                        </section>
                        <section>
                          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> 参展建议与行动
                          </h3>
                          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 space-y-4">
                            <div>
                              <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">最终结论</div>
                              <p className="text-sm font-bold text-emerald-900">{activeExhibition.decisionAdvice.conclusion}</p>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">行动计划</div>
                              <ul className="text-xs text-emerald-800 space-y-1">
                                {activeExhibition.decisionAdvice.actionPlan.map((a, i) => <li key={i}>- {a}</li>)}
                              </ul>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </motion.div>
              </AnimatePresence>

              {/* AI Advisor Section */}
              <AIAdvisor />

              {/* Final Summary Table */}
              <div className="bg-white rounded-3xl border border-zinc-200 p-8">
                <h3 className="text-xl font-bold mb-6">决策对比矩阵</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100">
                        <th className="pb-4 font-bold text-zinc-400 uppercase tracking-wider">展会</th>
                        <th className="pb-4 font-bold text-zinc-400 uppercase tracking-wider">市场定位</th>
                        <th className="pb-4 font-bold text-zinc-400 uppercase tracking-wider">核心价值</th>
                        <th className="pb-4 font-bold text-zinc-400 uppercase tracking-wider">风险等级</th>
                        <th className="pb-4 font-bold text-zinc-400 uppercase tracking-wider text-center">推荐指数</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {EXHIBITIONS.map((ex) => (
                        <tr key={ex.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-4">
                            <div className="font-bold text-zinc-900">{ex.name.split(' ')[0]}</div>
                            <div className="text-[10px] text-zinc-400">{ex.region}</div>
                          </td>
                          <td className="py-4 text-zinc-600 max-w-[200px] truncate" title={ex.marketInsight}>
                            {ex.marketInsight}
                          </td>
                          <td className="py-4 text-zinc-600 max-w-[200px] truncate" title={ex.valueAssessment.distributorNetwork}>
                            {ex.valueAssessment.distributorNetwork}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${ex.id === 'milipol' || ex.id === 'idex' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                              <span className="text-xs text-zinc-500">{ex.id === 'milipol' || ex.id === 'idex' ? '中高 (门槛高)' : '低 (常规准入)'}</span>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                              ex.relevance >= 9 ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-700'
                            }`}>
                              {ex.relevance >= 9 ? '极力推荐' : '值得考虑'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : view === 'budget' ? (
          <BudgetPlanner 
            budgets={budgets} 
            setBudgets={setBudgets} 
            onSave={handleSaveBudgets}
            onReset={handleResetBudgets}
            boothSize={boothSize}
            setBoothSize={setBoothSize}
          />
        ) : view === 'compare' ? (
          <ExhibitionComparison 
            exhibitions={EXHIBITIONS} 
            budgets={budgets}
            boothSize={parseInt(boothSize)}
          />
        ) : (
          <MarketMap 
            exhibitions={EXHIBITIONS} 
            onSelectExhibition={(id) => {
              setActiveTab(id);
              setView('report');
            }} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-zinc-400" />
            <span className="text-sm text-zinc-400 font-medium">© 2026 劳保行业海外拓展决策支持系统</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900">隐私政策</a>
            <a href="#" className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900">服务条款</a>
            <a href="#" className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900">联系顾问</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
