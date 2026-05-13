import { useState } from 'react';
import { lessonsAPI } from '../services/api';

export default function TranscriptAnalysisDemo() {
  const [transcriptText, setTranscriptText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('notes');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Sample transcript for testing
  const sampleTranscript = `In this lesson, we'll learn about React Hooks. React Hooks are functions that let you use state and other React features in functional components without writing a class.

The most common hooks are useState and useEffect. The useState hook allows you to add state to functional components. It returns an array with two elements: the current state value and a function to update it.

The useEffect hook lets you perform side effects in functional components. Side effects include data fetching, subscriptions, or manually changing the DOM. useEffect runs after every render by default, but you can control when it runs using the dependency array.

Hooks follow two important rules: First, only call hooks at the top level of your function. Don't call hooks inside loops, conditions, or nested functions. Second, only call hooks from React function components or custom hooks.

Custom hooks are a powerful feature that lets you extract component logic into reusable functions. A custom hook is a JavaScript function whose name starts with "use" and that may call other hooks.`;

  const handleAnalyze = async () => {
    if (!transcriptText || transcriptText.trim().length === 0) {
      setError('Please enter a transcript to analyze');
      return;
    }

    setAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      // Use the demo endpoint that doesn't require a lesson ID
      const result = await lessonsAPI.analyzeTranscriptDemo(transcriptText);
      setAnalysis(result);
      setActiveTab('notes');
    } catch (err) {
      console.error('Transcript analysis error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to analyze transcript');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  const calculateScore = () => {
    if (!analysis?.mcqs) return 0;
    let correct = 0;
    analysis.mcqs.forEach((mcq, index) => {
      if (selectedAnswers[index] === mcq.answer) {
        correct++;
      }
    });
    return Math.round((correct / analysis.mcqs.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            🤖 AI Transcript Analysis Demo
          </h1>
          <p className="text-gray-300">
            Paste any lesson transcript to generate structured notes, key concepts, highlights, and practice questions
          </p>
        </div>

        {/* Input Section */}
        {!analysis && (
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl mb-6 animate-fade-in">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-white font-semibold">Lesson Transcript</label>
                <button
                  onClick={() => setTranscriptText(sampleTranscript)}
                  className="px-4 py-2 bg-purple-600/30 text-purple-300 rounded-lg hover:bg-purple-600/50 transition-all text-sm"
                >
                  Load Sample
                </button>
              </div>
              <textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder="Paste your lesson transcript here..."
                className="w-full h-64 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <p className="text-gray-400 text-sm mt-2">
                {transcriptText.length} characters
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={analyzing || !transcriptText}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {analyzing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing with AI... (this may take up to 2 minutes)
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Analyze Transcript with AI
                </>
              )}
            </button>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
              <button
                onClick={() => {
                  setAnalysis(null);
                  setSelectedAnswers({});
                  setShowResults(false);
                }}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                New Analysis
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/20 pb-2 mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'notes'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                📝 Notes
              </button>
              <button
                onClick={() => setActiveTab('concepts')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'concepts'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                💡 Key Concepts
              </button>
              <button
                onClick={() => setActiveTab('highlights')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'highlights'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                ⭐ Highlights
              </button>
              <button
                onClick={() => setActiveTab('mcqs')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'mcqs'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                ❓ Practice Quiz
              </button>
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
              {/* Notes Tab */}
              {activeTab === 'notes' && analysis.notes && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-4">{analysis.notes.title}</h2>
                  {analysis.notes.sections?.map((section, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-5 border border-white/10">
                      <h3 className="text-lg font-bold text-purple-300 mb-3">{section.heading}</h3>
                      <ul className="space-y-2">
                        {section.points?.map((point, pointIndex) => (
                          <li key={pointIndex} className="text-gray-300 flex items-start">
                            <span className="text-purple-400 mr-2">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Key Concepts Tab */}
              {activeTab === 'concepts' && analysis.keyConcepts && (
                <div className="grid md:grid-cols-2 gap-4">
                  {analysis.keyConcepts.map((concept, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-5 border border-purple-500/30 hover:border-purple-500/50 transition-all"
                    >
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-purple-500/30 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-purple-300 font-bold">{index + 1}</span>
                        </div>
                        <p className="text-white font-medium">{concept}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Highlights Tab */}
              {activeTab === 'highlights' && analysis.highlights && (
                <div className="space-y-4">
                  {analysis.highlights.map((highlight, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-5 border-l-4 border-yellow-500"
                    >
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">⭐</span>
                        <p className="text-white font-medium">{highlight}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* MCQs Tab */}
              {activeTab === 'mcqs' && analysis.mcqs && (
                <div className="space-y-6">
                  {/* Quiz Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">
                      Practice Questions ({analysis.mcqs.length})
                    </h3>
                    {showResults && (
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{calculateScore()}%</div>
                          <div className="text-sm text-gray-400">
                            {Object.values(selectedAnswers).filter((ans, idx) => ans === analysis.mcqs[idx]?.answer).length} / {analysis.mcqs.length} correct
                          </div>
                        </div>
                        <button
                          onClick={handleResetQuiz}
                          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Questions */}
                  {analysis.mcqs.map((mcq, qIndex) => {
                    const isAnswered = selectedAnswers[qIndex] !== undefined;
                    const isCorrect = selectedAnswers[qIndex] === mcq.answer;

                    return (
                      <div
                        key={qIndex}
                        className="bg-white/5 rounded-xl p-6 border border-white/10"
                      >
                        <div className="flex items-start mb-4">
                          <div className="w-8 h-8 bg-purple-500/30 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-purple-300 font-bold">{qIndex + 1}</span>
                          </div>
                          <p className="text-white font-semibold text-lg">{mcq.question}</p>
                        </div>

                        <div className="space-y-3 ml-11">
                          {mcq.options?.map((option, oIndex) => {
                            const isSelected = selectedAnswers[qIndex] === option;
                            const isCorrectAnswer = option === mcq.answer;
                            
                            let buttonClass = 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10';
                            
                            if (showResults) {
                              if (isCorrectAnswer) {
                                buttonClass = 'bg-green-500/20 border-green-500 text-green-300';
                              } else if (isSelected && !isCorrect) {
                                buttonClass = 'bg-red-500/20 border-red-500 text-red-300';
                              }
                            } else if (isSelected) {
                              buttonClass = 'bg-purple-500/30 border-purple-500 text-white';
                            }

                            return (
                              <button
                                key={oIndex}
                                onClick={() => !showResults && handleAnswerSelect(qIndex, option)}
                                disabled={showResults}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${buttonClass} ${
                                  showResults ? 'cursor-default' : 'cursor-pointer'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{option}</span>
                                  {showResults && isCorrectAnswer && (
                                    <span className="text-green-400">✓</span>
                                  )}
                                  {showResults && isSelected && !isCorrect && (
                                    <span className="text-red-400">✗</span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Submit Button */}
                  {!showResults && (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(selectedAnswers).length !== analysis.mcqs.length}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {Object.keys(selectedAnswers).length === analysis.mcqs.length
                        ? 'Submit Quiz'
                        : `Answer All Questions (${Object.keys(selectedAnswers).length}/${analysis.mcqs.length})`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
