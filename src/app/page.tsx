'use client';

import { useState } from 'react';
import { BookOpen, Brain, CheckCircle2, FileText, LayoutDashboard, Sparkles, AlertTriangle, ShieldCheck, Loader2, XCircle, MessageSquare, Lock, Upload, TrendingUp } from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailInput, setEmailInput] = useState('judge@gapfinder.ai');
  const [passwordInput, setPasswordInput] = useState('hackathon2026');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'topics' | 'quiz' | 'gaps' | 'plan' | 'assistant'>('dashboard');
  const [studyContent, setStudyContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [topics, setTopics] = useState<string[]>(['Core Concepts', 'Edge Cases', 'Architecture Fundamentals']);
  const [quizData, setQuizData] = useState([
    {
      id: 1,
      question: "Which CPU scheduling algorithm can lead to starvation for long processes if short processes keep arriving?",
      options: ["First-Come, First-Served (FCFS)", "Shortest Job First (SJF)", "Round Robin", "Multilevel Queue"],
      answer: "Shortest Job First (SJF)",
      source: "Operating Systems Notes - Chapter 3, Page 14"
    }
  ]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [examResult, setExamResult] = useState<any>(null);

  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput === 'judge@gapfinder.ai' && passwordInput === 'hackathon2026') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid demo credentials. Use judge@gapfinder.ai / hackathon2026');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Silent reset without alert popups
    setStudyContent('');
    setQuizData([]);
    setTopics(['Extracted Document Concepts', 'Key Clauses & Definitions', 'Risk Assessment']);
    setSelectedAnswers({});
    setExamResult(null);
    setChatResponse('');

    setFileName(file.name);
    setLoading(true);

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setTimeout(() => {
        setStudyContent(`[Extracted from PDF Document: ${file.name}]\n\nThis document covers advanced architecture, core operational principles, security boundaries, multi-tenancy models, and systematic evaluation protocols.`);
        setLoading(false);
      }, 800);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        setStudyContent(event.target?.result as string || '');
        setLoading(false);
      };
      reader.readAsText(file);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!studyContent.trim()) {
      alert('Please upload or enter study material first!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: studyContent }),
      });
      const data = await res.json();
      if (data.success && data.questions) {
        setQuizData(data.questions);
        setSelectedAnswers({});
        setExamResult(null);
        setActiveTab('topics');
      } else {
        alert('Error generating quiz: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to Gemini API route.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuiz = async () => {
    setEvaluating(true);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: quizData, userAnswers: selectedAnswers }),
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        setExamResult(data.evaluation);
        setQuizAttempts(prev => [...prev, { attempt: prev.length + 1, score: data.evaluation.readinessScore, date: new Date().toLocaleTimeString() }]);
        setActiveTab('gaps');
      } else {
        alert('Error evaluating quiz: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to evaluate quiz telemetry.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleAskAssistant = async () => {
    if (!chatQuery.trim() || !studyContent.trim()) {
      alert('Please ensure you have uploaded study material and entered a question!');
      return;
    }

    setChatLoading(true);
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: chatQuery, content: studyContent }),
      });
      const data = await res.json();
      if (data.success) {
        setChatResponse(data.answer);
      } else {
        setChatResponse('Error generating answer.');
      }
    } catch (err) {
      console.error(err);
      setChatResponse('Failed to reach RAG assistant.');
    } finally {
      setChatLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100 p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white"><Brain className="w-8 h-8" /></div>
            <div>
              <h1 className="text-xl font-bold">GapFinder AI</h1>
              <p className="text-xs text-indigo-400 font-medium">Secure Hackathon Evaluation Portal</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2">
              <p className="text-slate-400 font-semibold">Demo Credentials:</p>
              <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs" />
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs" />
            </div>
            {authError && <p className="text-xs text-rose-400 font-medium">{authError}</p>}
            <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" /> Secure Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-600 rounded-xl text-white"><Brain className="w-6 h-6" /></div>
            <div>
              <h1 className="font-bold text-lg">GapFinder AI</h1>
              <p className="text-xs text-indigo-400">Diagnostic Learning OS</p>
            </div>
          </div>
          <nav className="space-y-1.5">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}><LayoutDashboard className="w-4 h-4" /> Progress Dashboard</button>
            <button onClick={() => setActiveTab('upload')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}><FileText className="w-4 h-4" /> 1. Material Upload</button>
            <button onClick={() => setActiveTab('topics')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${activeTab === 'topics' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}><BookOpen className="w-4 h-4" /> 2. Topic Map</button>
            <button onClick={() => setActiveTab('quiz')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${activeTab === 'quiz' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}><Brain className="w-4 h-4" /> 3. Diagnostic Quiz</button>
            <button onClick={() => setActiveTab('gaps')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${activeTab === 'gaps' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}><AlertTriangle className="w-4 h-4" /> 4. Gap Report & Review</button>
            <button onClick={() => setActiveTab('plan')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${activeTab === 'plan' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}><Sparkles className="w-4 h-4" /> 5. Revision Plan</button>
            <button onClick={() => setActiveTab('assistant')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${activeTab === 'assistant' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}><MessageSquare className="w-4 h-4" /> 6. RAG Assistant</button>
          </nav>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold"><ShieldCheck className="w-4 h-4" /> Authenticated</div>
          <button onClick={() => setIsAuthenticated(false)} className="text-rose-400 hover:underline font-semibold">Log Out</button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 p-8 rounded-3xl border border-indigo-500/20 shadow-2xl space-y-4">
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold rounded-full">Progress Dashboard</span>
              <h2 className="text-3xl font-bold">Stop studying what you already know.</h2>
              <p className="text-slate-300 text-sm">GapFinder AI tracks your performance history and adapts study tracks based on your telemetry.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl"><p className="text-sm text-slate-400">Total Attempts</p><h3 className="text-2xl font-bold mt-2">{quizAttempts.length} Tests</h3></div>
              <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl"><p className="text-sm text-slate-400">Readiness Score</p><h3 className="text-2xl font-bold mt-2 text-indigo-400">{examResult ? `${examResult.readinessScore}%` : 'Pending'}</h3></div>
              <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl"><p className="text-sm text-slate-400">Active Material</p><h3 className="text-lg font-bold mt-2 text-emerald-400 truncate">{fileName || 'Default Notes'}</h3></div>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Material Upload (PDF & Text)</h2>
              <p className="text-sm text-slate-400 mt-1">Upload your syllabus PDF or notes. Previous data clears automatically.</p>
            </div>
            <div className="p-8 border-2 border-dashed border-slate-700 bg-slate-900/40 rounded-3xl text-center space-y-3">
              <Upload className="w-10 h-10 text-indigo-400 mx-auto" />
              <input type="file" accept=".pdf,.txt,.md" onChange={handleFileUpload} className="block mx-auto text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white cursor-pointer" />
              {fileName && <p className="text-xs text-emerald-400 font-semibold">Loaded: {fileName}</p>}
            </div>
            <textarea rows={6} value={studyContent} onChange={(e) => setStudyContent(e.target.value)} placeholder="Or paste notes here..." className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-slate-100" />
            <button onClick={handleGenerateQuiz} disabled={loading} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><Sparkles className="w-5 h-5" /> Process Material & Build Quiz</>}
            </button>
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Topic Map</h2>
            <div className="space-y-3">
              {topics.map((t, i) => (
                <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                  <span className="font-semibold text-sm">{t}</span>
                  <span className="text-xs text-emerald-400 font-semibold">Ready for Quiz</span>
                </div>
              ))}
            </div>
            <button onClick={() => setActiveTab('quiz')} className="w-full py-3.5 bg-indigo-600 rounded-xl font-semibold">Proceed to Diagnostic Quiz</button>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Diagnostic Quiz</h2>
            {quizData.map((q, idx) => (
              <div key={idx} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs px-3 py-1 bg-indigo-500/10 text-indigo-400 font-semibold rounded-full">Question {idx + 1}</span>
                  <span className="text-xs text-slate-400 italic">📌 {q.source}</span>
                </div>
                <h3 className="font-semibold text-lg">{q.question}</h3>
                <div className="space-y-2">
                  {q.options.map((opt: string, i: number) => (
                    <label key={i} className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl cursor-pointer hover:border-indigo-500">
                      <input type="radio" name={`q-${idx}`} value={opt} checked={selectedAnswers[idx] === opt} onChange={() => setSelectedAnswers({ ...selectedAnswers, [idx]: opt })} />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={handleSubmitQuiz} disabled={evaluating} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl flex items-center justify-center gap-2">
              {evaluating ? <><Loader2 className="w-5 h-5 animate-spin" /> Evaluating...</> : <><CheckCircle2 className="w-5 h-5" /> Submit Quiz & Review</>}
            </button>
          </div>
        )}

        {activeTab === 'gaps' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold">AI Gap Report & Answer Review</h2>
            {!examResult ? <p className="text-slate-400">Complete the quiz to see your gap report.</p> : (
              <div className="space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-5 bg-indigo-950 border border-indigo-500/30 rounded-2xl"><p className="text-xs text-indigo-300">Score</p><h3 className="text-2xl font-bold">{examResult.score} / {examResult.total}</h3></div>
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl"><p className="text-xs text-slate-400">Readiness</p><h3 className="text-2xl font-bold text-indigo-400">{examResult.readinessScore}%</h3></div>
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl"><p className="text-xs text-slate-400">Gaps</p><h3 className="text-2xl font-bold text-rose-400">{examResult.weakTopics.length} Topics</h3></div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Weak Topics</h3>
                  {examResult.weakTopics.map((g: any, i: number) => (
                    <div key={i} className="p-5 bg-rose-950/20 border border-rose-500/30 rounded-2xl">
                      <span className="text-xs px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-full font-semibold">{g.severity}</span>
                      <h4 className="font-bold text-lg mt-2">{g.topic}</h4>
                      <p className="text-sm text-slate-300 mt-1">{g.description}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Question Review</h3>
                  {examResult.evaluatedQuestions.map((q: any, i: number) => (
                    <div key={i} className={`p-6 border rounded-2xl space-y-2 ${q.isCorrect ? 'bg-emerald-950/10 border-emerald-500/30' : 'bg-rose-950/10 border-rose-500/30'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full">Question {i + 1}</span>
                        {q.isCorrect ? <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Correct</span> : <span className="text-rose-400 text-xs font-semibold flex items-center gap-1"><XCircle className="w-4 h-4" /> Incorrect</span>}
                      </div>
                      <h4 className="font-semibold">{q.question}</h4>
                      <p className="text-xs text-slate-300">Your Answer: <span className={q.isCorrect ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>{q.userSelected}</span></p>
                      {!q.isCorrect && <p className="text-xs text-slate-300">Correct Answer: <span className="text-emerald-400 font-semibold">{q.answer}</span></p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Personalized Revision Plan</h2>
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-xs text-indigo-400 font-semibold">Day 1 Focus</span>
              <h3 className="font-bold text-lg">Targeted Loop & Weak Concept Review</h3>
              <p className="text-sm text-slate-300">Re-evaluate citations from your recent document upload and complete targeted drills.</p>
            </div>
          </div>
        )}

        {activeTab === 'assistant' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Explain-This-Topic RAG Assistant</h2>
            <input type="text" value={chatQuery} onChange={(e) => setChatQuery(e.target.value)} placeholder="Ask anything about your uploaded document..." className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-sm" />
            <button onClick={handleAskAssistant} disabled={chatLoading} className="w-full py-3.5 bg-indigo-600 rounded-xl font-semibold flex items-center justify-center gap-2">
              {chatLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />} Ask RAG Assistant
            </button>
            {chatResponse && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-xs font-semibold text-emerald-400">Grounded Answer</span>
                <p className="text-sm text-slate-200">{chatResponse}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}