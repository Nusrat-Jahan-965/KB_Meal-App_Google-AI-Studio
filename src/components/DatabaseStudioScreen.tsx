import React, { useState, useEffect } from 'react';
import {
  Database,
  Table as TableIcon,
  Play,
  RefreshCw,
  Search,
  Code2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  FileText,
  ChevronRight,
  Server,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default?: string | null;
}

interface TableMeta {
  name: string;
  rowCount: number;
  columns: ColumnInfo[];
}

interface DbOverview {
  database: string;
  host: string;
  engine: string;
  region: string;
  instance: string;
  tables: TableMeta[];
}

interface DatabaseStudioScreenProps {
  onBack: () => void;
  lang: 'bn' | 'en';
}

export const DatabaseStudioScreen: React.FC<DatabaseStudioScreenProps> = ({ onBack, lang }) => {
  const [overview, setOverview] = useState<DbOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [activeTab, setActiveTab] = useState<'browse' | 'structure' | 'sql'>('browse');

  // Table rows
  const [tableData, setTableData] = useState<{ columns: ColumnInfo[]; rows: any[]; rowCount: number } | null>(null);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // SQL Console
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM users LIMIT 10;');
  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<{
    command?: string;
    rowCount?: number;
    fields?: string[];
    rows?: any[];
    executionTimeMs?: number;
    error?: string;
  } | null>(null);

  // Fetch overview
  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/db/overview');
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
        if (data.tables && data.tables.length > 0 && !data.tables.some((t: any) => t.name === selectedTable)) {
          setSelectedTable(data.tables[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to load DB overview:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch table rows
  const fetchTableData = async (tableName: string) => {
    setTableLoading(true);
    try {
      const res = await fetch(`/api/db/table/${encodeURIComponent(tableName)}`);
      if (res.ok) {
        const data = await res.json();
        setTableData(data);
      }
    } catch (err) {
      console.error('Failed to load table rows:', err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
      setSqlQuery(`SELECT * FROM ${selectedTable} LIMIT 25;`);
    }
  }, [selectedTable]);

  // Execute SQL
  const handleExecuteSql = async () => {
    if (!sqlQuery.trim()) return;
    setQueryLoading(true);
    setQueryResult(null);
    try {
      const res = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sqlQuery }),
      });
      const data = await res.json();
      if (!res.ok) {
        setQueryResult({ error: data.error || 'Query failed' });
      } else {
        setQueryResult(data);
      }
    } catch (err: any) {
      setQueryResult({ error: err.message || 'Network error' });
    } finally {
      setQueryLoading(false);
    }
  };

  // Filtered rows for browse tab
  const filteredRows = React.useMemo(() => {
    if (!tableData || !tableData.rows) return [];
    if (!searchTerm.trim()) return tableData.rows;
    const term = searchTerm.toLowerCase();
    return tableData.rows.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(term))
    );
  }, [tableData, searchTerm]);

  const currentTableMeta = overview?.tables.find((t) => t.name === selectedTable);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'মেইন অ্যাপে ফিরে যান' : 'Back to App'}
          </button>
          <div className="h-5 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-sm tracking-wide text-white flex items-center gap-1.5">
                  Cloud SQL Studio
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                    phpMyAdmin Style
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {overview?.database || 'cloud_sql_development_database'} • {overview?.region || 'asia-southeast1'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PostgreSQL 18.6 (Connected)</span>
          </div>
          <button
            onClick={() => {
              fetchOverview();
              if (selectedTable) fetchTableData(selectedTable);
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Tables Explorer */}
        <aside className="w-64 sm:w-72 bg-slate-950/80 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                {lang === 'bn' ? 'ডাটাবেজ টেবিলসমূহ' : 'Database Tables'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                {overview?.tables.length || 0}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono truncate">
              INSTANCE: {overview?.instance || 'ai-studio-9cabea6f'}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-500">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-emerald-400" />
                টেবিল লোড হচ্ছে...
              </div>
            ) : overview?.tables.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">কোনো টেবিল পাওয়া যায়নি</div>
            ) : (
              overview?.tables.map((table) => {
                const isSelected = selectedTable === table.name;
                return (
                  <button
                    key={table.name}
                    onClick={() => {
                      setSelectedTable(table.name);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all text-left ${
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <TableIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className="truncate">{table.name}</span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isSelected
                          ? 'bg-emerald-500/30 text-emerald-200'
                          : 'bg-slate-800/80 text-slate-400'
                      }`}
                    >
                      {table.rowCount}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Info Box at bottom */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-500">Host Socket:</span>
              <span className="text-emerald-400 font-mono text-[10px]">Cloud SQL Proxy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Database Engine:</span>
              <span className="text-slate-300 font-mono text-[10px]">PostgreSQL 18</span>
            </div>
          </div>
        </aside>

        {/* Center / Right Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-y-auto">
          {/* Table Header Bar */}
          <div className="bg-slate-950/60 border-b border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold font-mono">
                  {overview?.database} /
                </span>
                <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
                  {selectedTable}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  {currentTableMeta?.rowCount || 0} {lang === 'bn' ? 'টি রেকর্ড (Rows)' : 'Rows'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedTable === 'users' && 'সকল কর্মকর্তা ও কর্মচারীদের প্রোফাইল, জিপিএফ ও অগ্রিম ব্যালেন্স টেবিল'}
                {selectedTable === 'payments' && 'কর্মকর্তাদের অগ্রিম জমার রসিদ ও ভাউচার লেনদেন হিসাব'}
                {selectedTable === 'meal_bookings' && 'দৈনিক সাধারণ মিল ও মেহমানদের মিল বুকিং ডাটা'}
                {selectedTable === 'bazaar_expenses' && 'মেসের দৈনিক বাজার খরচ ও ক্রয়ের বিবরণ'}
                {selectedTable === 'meal_calls' && 'এডমিন কর্তৃক মিল খোলার শিডিউল ও অনুমোদন রেকর্ড'}
                {selectedTable === 'notices' && 'মেস ও ক্যান্টিনের সাধারণ ও জরুরি নোটিশ'}
              </p>
            </div>

            {/* Action Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveTab('browse')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'browse'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'ডাটা ব্রাউজ (Browse Data)' : 'Browse Data'}
              </button>
              <button
                onClick={() => setActiveTab('structure')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'structure'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'টেবিল স্ট্রাকচার (Structure)' : 'Structure'}
              </button>
              <button
                onClick={() => setActiveTab('sql')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'sql'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'SQL কনসোল (Query)' : 'SQL Query'}
              </button>
            </div>
          </div>

          {/* TAB 1: BROWSE DATA (phpMyAdmin Table View) */}
          {activeTab === 'browse' && (
            <div className="p-4 space-y-4 flex-1 flex flex-col">
              {/* Filter / Search Bar */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder={lang === 'bn' ? 'ডাটার মধ্যে খুঁজুন (Filter rows)...' : 'Filter rows...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {lang === 'bn' ? 'মোট দেখানো হচ্ছে: ' : 'Showing: '}
                  <span className="text-emerald-400 font-bold">{filteredRows.length}</span> rows
                </div>
              </div>

              {/* Data Table */}
              <div className="flex-1 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 shadow-inner flex flex-col">
                <div className="overflow-x-auto flex-1 max-h-[600px]">
                  {tableLoading ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                      <span className="text-xs">PostgreSQL ডাটাবেজ থেকে লোড হচ্ছে...</span>
                    </div>
                  ) : filteredRows.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                      <TableIcon className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                      <p className="text-sm">এই টেবিলে কোনো রেকর্ড নেই অথবা সার্চের সাথে মেলেনি</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="px-3 py-2.5 w-12 text-center text-[10px] text-slate-600 border-r border-slate-800/80">#</th>
                          {tableData?.columns.map((col) => (
                            <th key={col.column_name} className="px-3 py-2.5 font-semibold text-slate-300 border-r border-slate-800/80 last:border-none whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span>{col.column_name}</span>
                                <span className="text-[9px] text-emerald-500/80 font-normal">
                                  ({col.data_type})
                                </span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/80 transition-colors group">
                            <td className="px-3 py-2 text-center text-slate-600 bg-slate-950/40 border-r border-slate-800/60 text-[10px]">
                              {idx + 1}
                            </td>
                            {tableData?.columns.map((col) => {
                              const val = row[col.column_name];
                              const isNull = val === null || val === undefined;
                              return (
                                <td
                                  key={col.column_name}
                                  className="px-3 py-2 text-slate-300 border-r border-slate-800/60 last:border-none whitespace-nowrap max-w-xs truncate"
                                  title={String(val)}
                                >
                                  {isNull ? (
                                    <span className="text-slate-600 italic">null</span>
                                  ) : typeof val === 'boolean' ? (
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                                        val ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                      }`}
                                    >
                                      {val ? 'TRUE' : 'FALSE'}
                                    </span>
                                  ) : (
                                    String(val)
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TABLE STRUCTURE */}
          {activeTab === 'structure' && (
            <div className="p-4 space-y-4">
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 shadow">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Column Name</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Nullable</th>
                      <th className="px-4 py-3">Default Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {currentTableMeta?.columns.map((col) => (
                      <tr key={col.column_name} className="hover:bg-slate-900/50">
                        <td className="px-4 py-2.5 font-bold text-emerald-300">
                          {col.column_name}
                        </td>
                        <td className="px-4 py-2.5 text-slate-300">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] text-amber-300 border border-slate-700">
                            {col.data_type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-400">
                          {col.is_nullable === 'YES' ? (
                            <span className="text-slate-500">YES</span>
                          ) : (
                            <span className="text-red-400 font-semibold">NO (Required)</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-slate-400">
                          {col.column_default || <span className="text-slate-600 italic">None</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SQL QUERY CONSOLE */}
          {activeTab === 'sql' && (
            <div className="p-4 space-y-4 flex-1 flex flex-col">
              {/* Quick Preset Queries */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-mono mr-1">Quick Queries:</span>
                {[
                  `SELECT * FROM users;`,
                  `SELECT * FROM payments;`,
                  `SELECT * FROM meal_bookings;`,
                  `SELECT * FROM bazaar_expenses;`,
                  `SELECT * FROM meal_calls;`,
                ].map((sample) => (
                  <button
                    key={sample}
                    onClick={() => setSqlQuery(sample)}
                    className="text-[11px] font-mono bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              {/* Query Input Box */}
              <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-inner">
                <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-mono text-emerald-400">
                    <Code2 className="w-4 h-4" /> SQL Editor
                  </span>
                  <button
                    onClick={handleExecuteSql}
                    disabled={queryLoading}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition-colors shadow"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{queryLoading ? 'রান হচ্ছে...' : 'Run Query (Execute)'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="এখানে আপনার SQL কোড লিখুন (যেমন: SELECT * FROM users WHERE advance_balance > 2000;)"
                  className="w-full bg-slate-950 p-4 font-mono text-sm text-emerald-300 placeholder:text-slate-700 focus:outline-none resize-y"
                />
              </div>

              {/* Query Result Section */}
              {queryResult && (
                <div className="space-y-2 flex-1 flex flex-col">
                  {queryResult.error ? (
                    <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-lg text-xs text-red-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                      <div>
                        <strong>SQL Execution Error:</strong> {queryResult.error}
                      </div>
                    </div>
                  ) : (
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 shadow flex-1 flex flex-col">
                      <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Rows returned: <strong className="text-emerald-300">{queryResult.rowCount}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{queryResult.executionTimeMs} ms</span>
                        </div>
                      </div>

                      <div className="overflow-x-auto max-h-[450px]">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0">
                            <tr>
                              {queryResult.fields?.map((f) => (
                                <th key={f} className="px-3 py-2 font-semibold text-slate-300 whitespace-nowrap border-r border-slate-800">
                                  {f}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {queryResult.rows?.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/60">
                                {queryResult.fields?.map((f) => (
                                  <td key={f} className="px-3 py-2 text-slate-300 border-r border-slate-800 whitespace-nowrap">
                                    {row[f] === null || row[f] === undefined ? (
                                      <span className="text-slate-600 italic">null</span>
                                    ) : (
                                      String(row[f])
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
