/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  FileText, 
  Zap, 
  ShieldAlert, 
  BarChart3, 
  Loader2, 
  Copy, 
  Check, 
  RefreshCw,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  PieChart as PieChartIcon,
  LayoutDashboard,
  TrendingDown,
  Globe,
  Activity
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateMarketReport } from './services/gemini';
import { getBatchQuotes } from './services/marketData';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PortfolioItem {
  id: string;
  symbol: string;
  name: string;
  weight: number;
  change?: number;
  price?: number;
}

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', 
  '#10b981', '#06b6d4', '#3b82f6', '#2dd4bf', '#fb923c',
  '#a855f7', '#f472b6', '#4ade80', '#22d3ee', '#818cf8'
];

export default function App() {
  const [report, setReport] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [quotes, setQuotes] = useState<Record<string, any>>({});
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([
    // 25% - A股/港股/日股/韩股
    { id: '1', symbol: '005930.KS', name: '三星电子 (2x Long Proxy)', weight: 3.125 },
    { id: '2', symbol: '000660.KS', name: 'SK海力士 (2x Long Proxy)', weight: 3.125 },
    { id: '3', symbol: '2823.HK', name: '富时中国A50 ETF', weight: 6.25 },
    { id: '4', symbol: '8058.T', name: '三菱商事', weight: 2.08 },
    { id: '5', symbol: '8031.T', name: '三井物产', weight: 2.08 },
    { id: '6', symbol: '8001.T', name: '伊藤忠商事', weight: 2.08 },
    { id: '7', symbol: '8002.T', name: '丸红', weight: 2.08 },
    { id: '8', symbol: '8007.T', name: '住友商事', weight: 2.08 },
    { id: '9', symbol: '9984.T', name: '软银集团', weight: 2.1 },
    // 25% - 恐慌指数
    { id: '10', symbol: '^VIX', name: 'VIX恐慌指数', weight: 25 },
    // 25% - 商品
    { id: '11', symbol: 'BZ=F', name: '现货布伦特原油', weight: 12.5 },
    { id: '12', symbol: 'GC=F', name: '现货黄金', weight: 12.5 },
    // 25% - 国际指数
    { id: '13', symbol: '^WIG', name: '波兰WIG指数', weight: 8.33 },
    { id: '14', symbol: '^VNINDEX', name: '越南胡志明指数', weight: 8.33 },
    { id: '15', symbol: '^N225', name: '日经225指数', weight: 8.34 },
  ]);

  useEffect(() => {
    const fetchQuotes = async () => {
      const symbols = portfolio.map(p => p.symbol);
      const data = await getBatchQuotes(symbols);
      const quoteMap: Record<string, any> = {};
      data.forEach((q: any) => {
        if (q && !q.error) {
          quoteMap[q.symbol] = q;
        }
      });
      setQuotes(quoteMap);
    };
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60000); // 每分钟更新一次
    return () => clearInterval(interval);
  }, [portfolio]);
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newWeight, setNewWeight] = useState(10);
  const [activeTab, setActiveTab] = useState<'report' | 'portfolio'>('report');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setReport(null);
    setSources([]);
    try {
      const result = await generateMarketReport();
      setReport(result.text || null);
      setSources(result.sources || []);
    } catch (error) {
      alert('生成失败，请检查网络或API配置');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (report) {
      navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const addStock = () => {
    if (!newSymbol || !newName) return;
    const newItem: PortfolioItem = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: newSymbol,
      name: newName,
      weight: Number(newWeight)
    };
    setPortfolio([...portfolio, newItem]);
    setNewSymbol('');
    setNewName('');
    setNewWeight(10);
  };

  const removeStock = (id: string) => {
    setPortfolio(portfolio.filter(item => item.id !== id));
  };

  const chartData = useMemo(() => {
    return portfolio.map(item => ({
      name: `${item.name} (${item.symbol})`,
      value: item.weight
    }));
  }, [portfolio]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Fixer Studio：AI复盘大脑
            </h1>
          </div>
          
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('report')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'report' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              复盘报告
            </button>
            <button 
              onClick={() => setActiveTab('portfolio')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'portfolio' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <PieChartIcon className="w-4 h-4" />
              我的自选股
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={cn(
                "px-6 py-2 rounded-full font-semibold flex items-center gap-2 transition-all shadow-md",
                isGenerating 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                  : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-200"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  正在读取数据...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  生成今日复盘
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'report' ? (
            <motion.div
              key="report-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {!report && !isGenerating ? (
                <div className="text-center space-y-8 py-20">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                    <Sparkles className="w-4 h-4" />
                    基于 Yahoo Finance 实时数据与 Fixer AI 深度分析
                  </div>
                  <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight">
                    洞察全球情绪周期 <br />
                    <span className="text-indigo-600">Fixer Studio 宏观赋能</span>
                  </h2>
                  <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                    点击上方按钮，AI将自动调用 Yahoo Finance 数据获取全球盘面动态，为您生成一份包含全球宏观、A股总结、情绪周期判断及明日策略的专业复盘报告。
                  </p>
                </div>
              ) : isGenerating ? (
                <div className="flex flex-col items-center justify-center py-40 space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-indigo-600" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-800">Fixer AI 正在处理全球市场数据...</h3>
                    <p className="text-slate-500 mt-2">正在分析宏观联动、梳理主线逻辑、评估避险情绪</p>
                  </div>
                </div>
              ) : (
                <div className="report-card rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-xl">
                  <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-200">
                        <FileText className="text-indigo-600 w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Fixer Studio 专业复盘报告</h3>
                        <p className="text-xs text-slate-500">生成时间：{new Date().toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600 font-medium text-sm border border-transparent hover:border-slate-200"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        {copied ? '已复制' : '复制全文'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-10 markdown-body bg-white min-h-[800px]">
                    <ReactMarkdown>{report || ''}</ReactMarkdown>
                    
                    {sources.length > 0 && (
                      <div className="mt-12 pt-8 border-t border-slate-100">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          数据来源参考
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {sources.map((source, i) => (
                            source.web && (
                              <a 
                                key={i} 
                                href={source.web.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg text-xs transition-colors border border-slate-100 flex items-center gap-1.5"
                              >
                                <ArrowRight className="w-3 h-3" />
                                {source.web.title || '参考来源'}
                              </a>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="portfolio-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Portfolio Management */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-900">自选股管理</h2>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold animate-pulse uppercase tracking-wider border border-emerald-100">
                        <Activity className="w-3 h-3" />
                        Live Data
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">共 {portfolio.length} 只股票</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">股票代码</label>
                      <input 
                        type="text" 
                        value={newSymbol}
                        onChange={(e) => setNewSymbol(e.target.value)}
                        placeholder="如: 000001.SZ"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">股票名称</label>
                      <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="如: 平安银行"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">持仓比例 (%)</label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          value={newWeight}
                          onChange={(e) => setNewWeight(Number(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                        <button 
                          onClick={addStock}
                          className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                        >
                          <Plus className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {portfolio.map((item, index) => {
                      const quote = quotes[item.symbol];
                      const change = quote?.regularMarketChangePercent;
                      const isPositive = change >= 0;
                      
                      return (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                              {item.name[0]}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                {item.name}
                                {quote && (
                                  <span className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5",
                                    isPositive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                  )}>
                                    {isPositive ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
                                    {change?.toFixed(2)}%
                                  </span>
                                )}
                              </h4>
                              <p className="text-xs text-slate-500 font-mono">{item.symbol}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-900">{item.weight}%</p>
                              <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${item.weight}%` }} />
                              </div>
                            </div>
                            <button 
                              onClick={() => removeStock(item.id)}
                              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Visualization */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm h-full flex flex-col">
                  <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                    <PieChartIcon className="text-indigo-600 w-6 h-6" />
                    持仓比例分布
                  </h2>
                  
                  <div className="flex-1 min-h-[500px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="40%"
                          innerRadius={80}
                          outerRadius={130}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                          itemStyle={{ fontWeight: 'bold' }}
                        />
                        <Legend 
                          layout="vertical" 
                          verticalAlign="bottom" 
                          align="center"
                          wrapperStyle={{ 
                            paddingTop: '40px',
                            fontSize: '11px',
                            maxHeight: '180px',
                            overflowY: 'auto'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <p className="text-sm text-indigo-700 leading-relaxed">
                      <strong>Fixer 提示：</strong> 合理的仓位管理是短线生存的基石。建议根据情绪周期动态调整自选股比例，在退潮期严格控制总仓位。
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 text-center">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-slate-400 text-sm">© 2026 Fixer Studio · AI复盘大脑 · 全球数据联动分析</p>
          <div className="mt-4 flex justify-center gap-6">
            <span className="text-xs text-slate-300">免责声明：本报告由 AI 生成，数据来源于 Yahoo Finance，不构成任何投资建议。</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

