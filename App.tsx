
import React, { useState, useCallback } from 'react';
import { analyzeVehicle } from './services/geminiService';

const WrenchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.89 12.235 11.765 5.11a5.863 5.863 0 0 0-8.292 0 5.863 5.863 0 0 0 0 8.292l7.125 7.125a5.863 5.863 0 0 0 8.292 0c2.31-2.31 2.31-6.06.001-8.292ZM10.59 14.28a1.5 1.5 0 1 1-2.12-2.122 1.5 1.5 0 0 1 2.12 2.122Z" />
    <path d="m20.25 10.41-3.61-3.61a.75.75 0 0 0-1.06 1.06l3.61 3.61a.75.75 0 0 0 1.06-1.06Zm-1.06-2.122-2.25 2.25a.75.75 0 0 0 1.06 1.06l2.25-2.25a.75.75 0 0 0-1.06-1.06Zm-2.35 4.561 1.59-1.59a.75.75 0 1 0-1.06-1.06l-1.59 1.59a.75.75 0 1 0 1.06 1.06Z" />
  </svg>
);

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center h-full">
    <svg className="animate-spin h-10 w-10 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);

interface AnalysisDisplayProps {
  analysis: string;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis }) => {
  const getVerdictChipClass = (text: string) => {
    if (text.includes("Walk Away")) return "bg-red-500 text-red-50";
    if (text.includes("Go For It")) return "bg-green-500 text-green-50";
    if (text.includes("High Risk")) return "bg-amber-500 text-amber-50";
    return "bg-slate-600 text-slate-100";
  };
  
  const renderLine = (line: string, index: number) => {
    if (line.startsWith('**Summary:**')) {
      const verdict = line.substring('**Summary:**'.length).trim();
      return (
        <div key={index} className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-100">Summary:</h2>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getVerdictChipClass(verdict)}`}>
            {verdict}
          </span>
        </div>
      );
    }
    if (line.startsWith('**Recommendation:**')) {
       const recommendation = line.substring('**Recommendation:**'.length).trim();
       return (
        <div key={index} className="mt-4 pt-4 border-t border-slate-700">
           <h2 className="text-xl font-bold text-slate-100 inline">Recommendation: </h2>
           <span className={`font-semibold ${getVerdictChipClass(recommendation).replace('bg','text').replace('-500','-400')}`}>{recommendation}</span>
        </div>
       )
    }
    if (line.startsWith('**')) {
      return <h3 key={index} className="text-lg font-semibold text-slate-200 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
    }
    if (line.startsWith('---')) {
      return <hr key={index} className="border-slate-700 my-4" />;
    }
    if (line.trim().startsWith('- ') || line.trim().match(/^\d+\./)) {
      return <p key={index} className="ml-4 text-slate-300 my-1">{line}</p>;
    }
    return <p key={index} className="text-slate-300 my-2">{line}</p>;
  };

  return (
    <div className="font-sans whitespace-pre-wrap">
      {analysis.split('\n').map(renderLine)}
    </div>
  );
};


export default function App() {
  const [sellerDescription, setSellerDescription] = useState('');
  const [motHistory, setMotHistory] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!sellerDescription.trim() || !motHistory.trim()) {
      setError("Please provide both the seller's description and the MOT history.");
      return;
    }
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzeVehicle(sellerDescription, motHistory);
      if (result.startsWith("Error:")) {
        setError(result);
      } else {
        setAnalysis(result);
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [sellerDescription, motHistory]);
  
  const handleDemo = () => {
    setSellerDescription(`2010 Ford Transit Connect Campervan. Great little van, been all over with it. Very solid underneath, no rust issues at all. Had some welding done for the last MOT to make sure it's perfect. Engine is sweet, runs like a dream, no mechanical issues. Well maintained. Sad to see it go.`);
    setMotHistory(`
MOT history of this vehicle
Test date: 15 March 2024
FAIL
Repair immediately (major defects):
- Offside Front Suspension arm pin or bush excessively worn resulting in excessive movement Trailing arm (5.3.4 (a) (i))
- Nearside Rear INNER Sill/Body mounting prescribed area is excessively corroded significantly reducing structural strength (6.2.2 (d) (i))

Test date: 16 March 2024
PASS
Advisory notice item(s):
- Offside Front Tyre worn close to legal limit/worn on edge (5.2.3 (e))
- Vehicle has been undersealed

Test date: 10 March 2023
PASS
Advisory notice item(s):
- Nearside rear suspension has slight play in a pin/bush (5.3.4 (a) (i))
- Corrosion on front brake pipes

Test date: 5 March 2022
PASS
Advisory notice item(s):
- Slight oil leak from engine
    `);
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col">
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-4">
          <WrenchIcon className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Van-alyst</h1>
            <p className="text-sm text-slate-400">Your AI-Powered Vehicle Inspector</p>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-slate-200">Vehicle Data</h2>
             <button
                onClick={handleDemo}
                className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
              >
                Load Demo Data
             </button>
          </div>
          
          <div>
            <label htmlFor="seller-description" className="block text-sm font-medium text-slate-300 mb-2">Seller's Description</label>
            <textarea
              id="seller-description"
              rows={8}
              value={sellerDescription}
              onChange={(e) => setSellerDescription(e.target.value)}
              placeholder="Copy and paste the seller's full advertisement text here..."
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 placeholder-slate-500"
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="mot-history" className="block text-sm font-medium text-slate-300 mb-2">Full MOT History</label>
            <textarea
              id="mot-history"
              rows={15}
              value={motHistory}
              onChange={(e) => setMotHistory(e.target.value)}
              placeholder="Copy and paste the entire MOT history text from the government website here..."
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-200 placeholder-slate-500 font-mono text-sm"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !sellerDescription || !motHistory}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Spinner />
                Analyzing...
              </>
            ) : (
              'Get Expert Analysis'
            )}
          </button>
        </div>

        {/* Output Panel */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 lg:h-[calc(100vh-150px)] overflow-y-auto">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Van-alyst Report</h2>
          {loading && <Spinner />}
          {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-md">{error}</div>}
          {analysis && !loading && !error && <AnalysisDisplay analysis={analysis} />}
          {!loading && !error && !analysis && (
            <div className="text-slate-400 flex flex-col items-center justify-center h-full text-center">
                <WrenchIcon className="h-16 w-16 text-slate-600 mb-4"/>
                <p className="text-lg">Your expert analysis will appear here.</p>
                <p className="mt-2 text-sm text-slate-500">Enter the vehicle details on the left and click "Get Expert Analysis" to begin.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
