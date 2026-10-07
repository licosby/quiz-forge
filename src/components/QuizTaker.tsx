import { useState, useEffect, useCallback, useRef } from 'react';
import { Quiz, AppSettings } from '../types';
import { gradeQuiz, shuffleQuizQuestions } from '../utils/quizGenerator';
import { playCorrectSound, playIncorrectSound, playCompleteSound, playTimerWarningSound } from '../utils/sounds';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Lightbulb, ChevronRight, Keyboard } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizTakerProps {
  quiz: Quiz;
  settings: AppSettings;
  onSubmit: (quizId: string, answers: Record<string, number>, score: number, timeTaken?: number) => void;
  onBack: () => void;
}

export default function QuizTaker({ quiz, settings, onSubmit, onBack }: QuizTakerProps) {
  const [questions] = useState(() =>
    settings.shuffleQuestions ? shuffleQuizQuestions(quiz.questions, settings.shuffleAnswers) : quiz.questions
  );
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.timerPerQuestion);
  const [totalTime, setTotalTime] = useState(0);
  const [shakeOption, setShakeOption] = useState<number | null>(null);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const isStudyMode = quiz.mode === 'study';
  const isChallengeMode = quiz.mode === 'challenge';
  const question = questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const progress = ((currentQ + 1) / questions.length) * 100;

  // Timer
  useEffect(() => {
    if (isStudyMode) return;
    timerRef.current = setInterval(() => {
      setTotalTime(t => t + 1);
      if (isChallengeMode || !answers[question.id]) {
        setTimeLeft(t => {
          if (t <= 1) {
            if (settings.soundEnabled) playTimerWarningSound();
            // Auto-advance on timeout in challenge mode
            if (isChallengeMode && currentQ < questions.length - 1) {
              setCurrentQ(c => c + 1);
              return settings.timerPerQuestion;
            }
            return 0;
          }
          if (t <= 6 && settings.soundEnabled) playTimerWarningSound();
          return t - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isStudyMode, isChallengeMode, currentQ, question.id, answers]);

  // Reset timer on new question
  useEffect(() => {
    setTimeLeft(settings.timerPerQuestion);
    setFeedback(null);
    setShowHint(false);
  }, [currentQ, settings.timerPerQuestion]);

  const handleSelectAnswer = useCallback((optionIndex: number) => {
    if (feedback) return; // Already answered this question with feedback

    setAnswers(prev => ({ ...prev, [question.id]: optionIndex }));

    if (isStudyMode) {
      // Instant feedback in study mode
      const isCorrect = optionIndex === question.correctAnswer;
      setFeedback(isCorrect ? 'correct' : 'incorrect');
      if (settings.soundEnabled) {
        if (isCorrect) playCorrectSound(); else playIncorrectSound();
      }
      if (!isCorrect) setShakeOption(optionIndex);
      if (isCorrect && settings.soundEnabled) {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 }, colors: ['#10b981', '#34d399'] });
      }
      setTimeout(() => setShakeOption(null), 500);
    } else {
      if (settings.soundEnabled) playCorrectSound(); // Click sound
    }
  }, [feedback, question, isStudyMode, settings.soundEnabled]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key) - 1;
        if (idx < question.options.length) handleSelectAnswer(idx);
      }
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentQ < questions.length - 1) setCurrentQ(c => c + 1);
      }
      if (e.key === 'ArrowLeft') {
        if (currentQ > 0) setCurrentQ(c => c - 1);
      }
      if (e.key === 'h' && isStudyMode) setShowHint(h => !h);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQ, questions.length, question.options.length, handleSelectAnswer, isStudyMode]);

  const handleSubmit = () => {
    const result = gradeQuiz(questions, answers);
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    if (settings.soundEnabled) playCompleteSound();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    onSubmit(quiz.id, answers, result.score, timeTaken);
  };

  const getHint = () => {
    // Remove one wrong option
    const wrongIndices = question.options.map((_, i) => i).filter(i => i !== question.correctAnswer);
    return `Hint: The answer is not "${question.options[wrongIndices[0]]}"`;
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn-ghost p-2" aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{quiz.chapterTitle}</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {quiz.subject} • Question {currentQ + 1} of {questions.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isStudyMode && (
            <div className={`px-3 py-1.5 rounded-xl font-mono font-bold text-sm ${timeLeft <= 5 ? 'animate-pulse' : ''}`}
              style={{ background: timeLeft <= 5 ? 'var(--rose)' + '20' : 'var(--bg-secondary)', color: timeLeft <= 5 ? 'var(--rose)' : 'var(--text-primary)' }}>
              {formatTime(timeLeft)}
            </div>
          )}
          <div className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
            {formatTime(totalTime)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Difficulty & Mode Indicators */}
      <div className="flex items-center gap-2 flex-wrap">
        {quiz.mode === 'study' && (
          <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'var(--emerald)' + '20', color: 'var(--emerald)' }}>
            📖 Study Mode
          </span>
        )}
        {quiz.mode === 'challenge' && (
          <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'var(--rose)' + '20', color: 'var(--rose)' }}>
            ⚡ Challenge Mode
          </span>
        )}
        <span className="text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
          <Keyboard className="w-3 h-3" /> Press 1-4 to answer
        </span>
      </div>

      {/* Question Card */}
      <div className="glass-card-static p-6 animate-fade-in" key={currentQ}>
        {/* Question */}
        <div className="flex items-start gap-3 mb-6">
          <span className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)' }}>
            {currentQ + 1}
          </span>
          <p className="text-base font-medium leading-relaxed pt-1" style={{ color: 'var(--text-primary)' }}>
            {question.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2 ml-0 md:ml-12">
          {question.options.map((option, oIndex) => {
            const isSelected = answers[question.id] === oIndex;
            const isCorrect = oIndex === question.correctAnswer;
            const letter = String.fromCharCode(65 + oIndex);
            const isShaking = shakeOption === oIndex;

            let bgStyle = 'var(--bg-secondary)';
            let borderStyle = '1px solid transparent';
            let textColor = 'var(--text-primary)';

            if (isStudyMode && feedback) {
              if (isCorrect) { bgStyle = 'var(--emerald)' + '20'; borderStyle = '2px solid var(--emerald)'; }
              else if (isSelected && !isCorrect) { bgStyle = 'var(--rose)' + '20'; borderStyle = '2px solid var(--rose)'; }
            } else if (isSelected && !feedback) {
              bgStyle = 'var(--accent-primary)' + '20'; borderStyle = '2px solid var(--accent-primary)';
            }

            return (
              <button
                key={oIndex}
                onClick={() => handleSelectAnswer(oIndex)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 ${isShaking ? 'animate-shake' : ''} ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}
                style={{ background: bgStyle, border: borderStyle, color: textColor }}
                disabled={!!feedback}
                aria-label={`Option ${letter}: ${option}`}
              >
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: isSelected ? 'var(--accent-primary)' : 'var(--bg-card-solid)', color: isSelected ? 'var(--text-on-accent)' : 'var(--text-muted)', border: '1px solid var(--border-input)' }}>
                  {isStudyMode && feedback && isCorrect ? <CheckCircle className="w-4 h-4" style={{ color: 'var(--emerald)' }} /> :
                   isStudyMode && feedback && isSelected && !isCorrect ? <XCircle className="w-4 h-4" style={{ color: 'var(--rose)' }} /> :
                   letter}
                </span>
                <span className="text-sm flex-1">{option}</span>
                <span className="text-xs font-mono opacity-40">{oIndex + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback & Hint (Study Mode) */}
        {isStudyMode && feedback && (
          <div className={`mt-4 p-4 rounded-xl animate-scale-in ${feedback === 'correct' ? 'animate-pulse-correct' : ''}`}
            style={{ background: feedback === 'correct' ? 'var(--emerald)' + '15' : 'var(--rose)' + '15', border: `1px solid ${feedback === 'correct' ? 'var(--emerald)' : 'var(--rose)'}30` }}>
            <p className="font-medium text-sm" style={{ color: feedback === 'correct' ? 'var(--emerald)' : 'var(--rose)' }}>
              {feedback === 'correct' ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            {question.explanation && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{question.explanation}</p>
            )}
          </div>
        )}

        {isStudyMode && !feedback && (
          <button onClick={() => setShowHint(!showHint)} className="mt-3 btn-ghost text-xs">
            <Lightbulb className="w-3.5 h-3.5" style={{ color: 'var(--amber)' }} /> {showHint ? 'Hide hint' : 'Show hint'}
          </button>
        )}
        {showHint && isStudyMode && (
          <p className="mt-2 text-xs p-2 rounded-lg animate-fade-in" style={{ background: 'var(--amber)' + '15', color: 'var(--amber)' }}>
            💡 {getHint()}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQ(c => Math.max(0, c - 1))}
          disabled={currentQ === 0}
          className="btn-secondary disabled:opacity-30"
        >
          ← Previous
        </button>

        <div className="flex gap-1">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className="w-2.5 h-2.5 rounded-full transition-all"
              style={{
                background: i === currentQ ? 'var(--accent-primary)' : answers[questions[i].id] !== undefined ? 'var(--emerald)' : 'var(--bg-secondary)',
                transform: i === currentQ ? 'scale(1.3)' : 'scale(1)',
              }}
              aria-label={`Go to question ${i + 1}`}
            />
          ))}
        </div>

        {currentQ < questions.length - 1 ? (
          <button onClick={() => setCurrentQ(c => c + 1)} className="btn-primary">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => setShowConfirm(true)} className="btn-primary" disabled={answeredCount === 0}>
            Submit Quiz
          </button>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div className="modal-backdrop" onClick={() => setShowConfirm(false)}>
          <div className="modal-content p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Submit Quiz?</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              {answeredCount < questions.length ? (
                <span className="flex items-center gap-1"><AlertTriangle className="w-4 h-4" style={{ color: 'var(--amber)' }} /> {questions.length - answeredCount} unanswered</span>
              ) : 'All questions answered!'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1">Go Back</button>
              <button onClick={handleSubmit} className="btn-primary flex-1">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
