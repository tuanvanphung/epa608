import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  RotateCcw, 
  GraduationCap,
  Sparkles,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { questions } from './questions';
import { Category, QuizState } from './types';
import { explainHvacConcept } from './services/geminiService';
import Markdown from 'react-markdown';

// --- Components ---

const Dashboard = ({ onStart }: { onStart: (category: Category | 'All') => void }) => {
  const categories: (Category | 'All')[] = ['All', 'Core', 'Type II'];
  
  return (
    <div className="max-w-6xl mx-auto py-16 px-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white font-bold text-2xl rounded shadow-lg shadow-blue-500/20 mb-6">
          608
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-800 uppercase mb-2">EPA 608 Mastery</h1>
        <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-12">Certification Training Portal</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 border border-slate-200 shadow-xl overflow-hidden rounded-sm">
          {categories.map((cat) => {
            return (
              <button
                key={cat}
                onClick={() => onStart(cat)}
                className="bg-white p-10 text-left transition-colors hover:bg-slate-50 group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-blue-500">
                    {cat === 'All' ? 'Full Exam' : 'Available Module'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 uppercase tracking-tight">{cat}</h3>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

const QuizRunner = ({ category, onFinish }: { category: Category | 'All', onFinish: (state: QuizState) => void }) => {
  const [filteredQuestions] = useState(() => 
    category === 'All' ? [...questions].sort(() => Math.random() - 0.5) : questions.filter(q => q.category === category)
  );
  
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: new Array(filteredQuestions.length).fill(null),
    isFinished: false,
    score: 0,
    startTime: Date.now()
  });

  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingAI, setLoadingAI] = useState<Record<string, boolean>>({});

  const handleAnswer = (qIdx: number, aIdx: number) => {
    if (state.answers[qIdx] !== null) return;
    
    const newAnswers = [...state.answers];
    newAnswers[qIdx] = aIdx;
    
    const isCorrect = aIdx === filteredQuestions[qIdx].correctAnswerIndex;
    
    setState(s => ({
      ...s,
      answers: newAnswers,
      score: isCorrect ? s.score + 1 : s.score
    }));
  };

  const askAI = async (qIdx: number) => {
    const question = filteredQuestions[qIdx];
    setLoadingAI(prev => ({ ...prev, [question.id]: true }));
    const explanation = await explainHvacConcept(question.text, `Question: ${question.text}. Correct Answer Index: ${question.correctAnswerIndex}. Options: ${question.options.join(', ')}.`);
    setExplanations(prev => ({ ...prev, [question.id]: explanation }));
    setLoadingAI(prev => ({ ...prev, [question.id]: false }));
  };

  const answeredCount = state.answers.filter(a => a !== null).length;
  const progressPercent = Math.round((answeredCount / filteredQuestions.length) * 100);

  return (
    <div className="flex-1 grid grid-cols-12 bg-slate-200 h-full overflow-hidden">
      {/* Sidebar - Progress Track */}
      <aside className="col-span-12 lg:col-span-3 bg-white p-10 flex flex-col gap-10 border-r border-slate-200 overflow-y-auto">
        <div className="space-y-6">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Bulk Assessment</h2>
          <div className="sidebar-item bg-blue-50 border-blue-600">
            <span className="text-sm font-bold text-blue-900 uppercase">Section</span>
            <span className="text-xs font-mono font-bold text-blue-600">{category}</span>
          </div>
          
          <div className="p-4 bg-slate-50 border-l-4 border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Progress</span>
              <span className="text-[10px] font-mono font-bold text-slate-600">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-400 mt-2 uppercase font-bold tracking-widest">{answeredCount} of {filteredQuestions.length} Answered</p>
          </div>
        </div>

        <div className="mt-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 text-center">
              <div className="text-2xl font-mono font-bold text-green-600">{state.score}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Correct</div>
            </div>
            <div className="p-4 bg-slate-50 text-center">
              <div className="text-2xl font-mono font-bold text-red-500">
                {answeredCount - state.score}
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Errors</div>
            </div>
          </div>

          <button 
            onClick={() => onFinish({ ...state, isFinished: true, endTime: Date.now() })}
            disabled={answeredCount === 0}
            className="w-full geo-button-action disabled:opacity-50"
          >
            Finalize Exam
          </button>
        </div>
      </aside>

      {/* Questions Feed */}
      <section className="col-span-12 lg:col-span-9 bg-slate-100 p-8 lg:p-12 overflow-y-auto space-y-12">
        {filteredQuestions.map((question, qIdx) => {
          const selectedAnswer = state.answers[qIdx];
          const isCorrect = selectedAnswer === question.correctAnswerIndex;
          const aiExplanation = explanations[question.id];
          const isAiLoading = loadingAI[question.id];

          return (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-slate-200 p-8 lg:p-12 shadow-sm rounded-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Question {qIdx + 1}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{question.category}</span>
              </div>

              <h3 className="text-2xl font-medium leading-snug text-slate-800 mb-8">
                {question.text}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isOptionCorrect = question.correctAnswerIndex === idx;
                  const char = String.fromCharCode(65 + idx);
                  
                  let style = "option-button group text-left p-4 lg:p-5";
                  let indicatorStyle = "w-8 h-8 flex items-center justify-center border font-mono text-sm mr-4 shrink-0 transition-colors";
                  let labelStyle = "text-sm font-medium text-slate-600";

                  if (selectedAnswer !== null) {
                    if (isOptionCorrect) {
                      style += " border-green-500 bg-green-50";
                      indicatorStyle += " bg-green-500 border-green-600 text-white";
                      labelStyle = "text-green-900 font-bold";
                    } else if (isSelected) {
                      style += " border-red-500 bg-red-50";
                      indicatorStyle += " bg-red-500 border-red-600 text-white";
                      labelStyle = "text-red-900 font-bold";
                    } else {
                      style += " opacity-40 grayscale-[0.5]";
                      indicatorStyle += " border-slate-200 text-slate-300";
                    }
                  } else {
                    style += " hover:border-slate-800 hover:bg-slate-50";
                    indicatorStyle += " border-slate-300 text-slate-400 group-hover:bg-slate-900 group-hover:text-white";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(qIdx, idx)}
                      disabled={selectedAnswer !== null}
                      className={style}
                    >
                      <span className={indicatorStyle}>{char}</span>
                      <span className={labelStyle}>{option}</span>
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-8 pt-8 border-t border-slate-100"
                >
                  <div className={`p-6 rounded-none border-l-[4px] ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-slate-900 border-blue-500'}`}>
                    <div className="flex gap-4">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isCorrect ? 'text-green-800' : 'text-blue-400'}`}>
                          {isCorrect ? 'Accurate Answer' : 'Conceptual Correction'}
                        </h4>
                        <div className={`text-sm leading-relaxed prose prose-invert max-w-none ${isCorrect ? 'prose-green text-green-900' : 'prose-slate text-slate-300'}`}>
                          <Markdown>{question.explanation}</Markdown>
                        </div>
                        
                        {!isCorrect && (
                          <div className="mt-4">
                            {!aiExplanation ? (
                              <button 
                                onClick={() => askAI(qIdx)}
                                disabled={isAiLoading}
                                className="inline-flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors disabled:opacity-50"
                              >
                                <Sparkles className="w-3 h-3" />
                                {isAiLoading ? 'Synthesizing...' : 'Request AI Deep-Dive'}
                              </button>
                            ) : (
                              <div className="mt-4 pt-4 border-t border-white/10 markdown-body">
                                <Markdown>{aiExplanation}</Markdown>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </section>
    </div>
  );
};

const ResultsView = ({ quizState, onRestart }: { quizState: QuizState, onRestart: () => void }) => {
  const scorePercent = Math.round((quizState.score / quizState.answers.length) * 100);
  const timeSpent = quizState.endTime ? Math.round((quizState.endTime - quizState.startTime) / 1000) : 0;

  return (
    <div className="flex-1 bg-slate-200 overflow-y-auto">
      <div className="max-w-5xl mx-auto py-16 px-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-300 shadow-2xl flex flex-col rounded-sm overflow-hidden"
        >
          <div className="p-16 text-center border-b border-slate-100">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-slate-50 mb-8 overflow-hidden bg-slate-50 relative">
              <div 
                className="absolute inset-0 bg-blue-600 transition-all duration-1000"
                style={{ top: `${100 - scorePercent}%` }}
              />
              <span className={`text-4xl font-bold relative z-10 ${scorePercent > 50 ? 'text-white' : 'text-slate-800'}`}>{scorePercent}%</span>
            </div>

            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800 mb-2">Examination Summary</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-12">Technician Competency Result</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-slate-200 border border-slate-200 mb-8">
              <div className="bg-white p-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Net Score</p>
                <p className="text-3xl font-mono font-bold text-slate-800">{quizState.score}/{quizState.answers.length}</p>
              </div>
              <div className="bg-white p-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Duration</p>
                <p className="text-3xl font-mono font-bold text-slate-800">{Math.floor(timeSpent/60)}m {timeSpent%60}s</p>
              </div>
              <div className="bg-white p-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Accuracy</p>
                <p className="text-3xl font-mono font-bold text-slate-800">{scorePercent}%</p>
              </div>
              <div className="bg-white p-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</p>
                <p className={`text-xl font-black uppercase tracking-widest ${scorePercent >= 75 ? 'text-green-600' : 'text-red-500'}`}>
                  {scorePercent >= 75 ? 'PASSED' : 'RETAKE'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-10 bg-slate-50 flex justify-center gap-6">
            <button onClick={onRestart} className="geo-button-primary">Restart Evaluation</button>
            <button onClick={() => window.print()} className="px-8 py-3 border border-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors">Export Record</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'Dashboard' | 'Quiz' | 'Results'>('Dashboard');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [finalState, setFinalState] = useState<QuizState | null>(null);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-10 shadow-sm shrink-0">
        <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setView('Dashboard')}>
          <div className="w-10 h-10 bg-blue-600 flex items-center justify-center text-white font-bold rounded-sm">
            608
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 uppercase">EPA 608 Pro</h1>
            <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">Certification Training</p>
          </div>
        </div>
        
        {view === 'Quiz' && (
          <button 
            onClick={() => setView('Dashboard')}
            className="px-6 py-2 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white text-xs font-bold uppercase tracking-widest transition-all"
          >
            Abort Session
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0">
        {view === 'Dashboard' && <Dashboard onStart={(cat) => { setSelectedCategory(cat); setView('Quiz'); }} />}
        {view === 'Quiz' && <QuizRunner category={selectedCategory} onFinish={(s) => { setFinalState(s); setView('Results'); }} />}
        {view === 'Results' && finalState && <ResultsView quizState={finalState} onRestart={() => setView('Dashboard')} />}
      </main>

      {/* Footer */}
      <footer className="h-12 bg-white border-t border-slate-200 px-10 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
        <div>EPA-608 Standard v.2026.5</div>
        <div className="flex gap-8">
          <span className="cursor-help hover:text-blue-600 transition-colors uppercase tracking-widest">ARI-700 Ref</span>
          <span className="cursor-help hover:text-blue-600 transition-colors uppercase tracking-widest">Section 608 Law</span>
          <span className="cursor-help hover:text-blue-600 transition-colors uppercase tracking-widest">Glossary</span>
        </div>
        <div className="hidden sm:block">Status: Ready for Deployment</div>
      </footer>
    </div>
  );
}
