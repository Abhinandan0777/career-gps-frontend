import { useState } from 'react';
import { lessonsAPI } from '../services/api';

export default function TranscriptAnalysis({ lessonId, transcript }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('notes'); // notes, concepts, highlights, mcqs
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleAnalyze = async () => {
    if (!transcript || !transcript.text) {
      setError('No transcript available to analyze');
      return;
    }

    setAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      console.log('Analyzing transcript...');
      const result = await lessonsAPI.analyzeTranscript(lessonId, transcript.text);
      console.log('Analysis result:', result);
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

  if (!transcript || !transcript.text) {
    return (
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
        <div className="text-center text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No transcript available for this lesson</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center">
            <span className="mr-2">🤖</span>
            AI-Powered Learning Assistant
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Generate structured notes, key concepts, and practice questions
          </p>
        </div>
        
        {!analysis && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {analyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analyze Transcript
              </>
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 animate-slide-in">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/20 pb-2 overflow-x-auto">
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

          {/* Regenerate Button */}
          <div className="pt-4 border-t border-white/20">
            <button
              onClick={() => {
                setAnalysis(null);
                setSelectedAnswers({});
                setShowResults(false);
              }}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Generate New Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
