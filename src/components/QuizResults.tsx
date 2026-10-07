import { useEffect, useState } from 'react';
import { Quiz, UserStats, ACHIEVEMENTS } from '../types';
import { ArrowLeft, RotateCcw, Printer, Trophy, CheckCircle, XCircle, Share2, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizResultsProps {
  quiz: Quiz;
  stats: UserStats;
  onBack: () => void;
  onRetake: () => void;
  onPrint: () => void;
}

export default function QuizResults({ quiz, stats, onBack, onRetake, onPrint }: QuizResultsProps) {
  const score = quiz.score || 0;
  const total = quiz.questions.length;
  const percentage = Math.round((score / total) * 100);
  const answers = quiz.answers || {};
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  // Animate score reveal
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors: ['#7c3aed', '#a855f7', '#10b981', '#f59e0b'] });
    }, 500);

    let current = 0;
    const interval = setInterval(() => {
      current += Math.ceil(percentage / 30);
      if (current >= percentage) { current = percentage; clearInterval(interval); }
      setAnimatedPercentage(current);
    }, 30);

    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [percentage]);

  const getGrade = () => {
    if (percentage >= 90) return { label: 'A+', color: 'var(--emerald)', message: 'Outstanding!' };
    if (percentage >= 80) return { label: 'A', color: 'var(--emerald)', message: 'Excellent work!' };
    if (percentage >= 70) return { label: 'B', color: 'var(--sky)', message: 'Great job!' };
    if (percentage >= 60) return { label: 'C', color: 'var(--amber)', message: 'Good effort!' };
    return { label: 'D', color: 'var(--rose)', message: 'Keep studying!' };
  };

  const grade = getGrade();

  const shareText = `🎓 QuizForge Results\n📚 ${quiz.chapterTitle}\n📊 Score: ${score}/${total} (${percentage}%)\n🏆 Grade: ${grade.label}\n🔥 Streak: ${stats.streak} days`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="btn-ghost p-2" aria-label="Go back"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--text-primary)' }}>Quiz Results</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{quiz.chapterTitle} • {quiz.subject}</p>
        </div>
      </div>

      {/* Score Card */}
      <div className="glass-card-static p-8 text-center">
        <div className="animate-score-reveal">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full mb-4" style={{ background: grade.color + '15' }}>
            <span className="text-5xl font-black" style={{ color: grade.color, fontFamily: 'Nunito, sans-serif' }}>{grade.label}</span>
          </div>
        </div>
        <h2 className="text-xl font-bold mb-1" style={{ color: grade.color }}>{grade.message}</h2>

        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="text-center">
            <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{animatedPercentage}%</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Score</p>
          </div>
          <div className="w-px h-12" style={{ background: 'var(--border-primary)' }} />
          <div className="text-center">
            <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{score}/{total}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Correct</p>
          </div>
          <div className="w-px h-12" style={{ background: 'var(--border-primary)' }} />
          <div className="text-center">
            <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{quiz.timeTaken ? `${Math.floor(quiz.timeTaken / 60)}:${(quiz.timeTaken % 60).toString().padStart(2, '0')}` : '—'}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Time</p>
          </div>
        </div>

        {/* Score Bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="progress-bar h-3">
            <div className="progress-bar-fill h-full" style={{ width: `${percentage}%`, background: grade.color }} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          <button onClick={onRetake} className="btn-secondary"><RotateCcw className="w-4 h-4" /> Retake</button>
          <button onClick={onPrint} className="btn-secondary"><Printer className="w-4 h-4" /> Print</button>
          <button onClick={() => setShowShare(!showShare)} className="btn-secondary"><Share2 className="w-4 h-4" /> Share</button>
        </div>

        {/* Share Panel */}
        {showShare && (
          <div className="mt-4 p-4 rounded-xl animate-scale-in text-left" style={{ background: 'var(--bg-secondary)' }}>
            <pre className="text-xs whitespace-pre-wrap mb-3" style={{ color: 'var(--text-secondary)' }}>{shareText}</pre>
            <button onClick={handleCopy} className="btn-primary text-sm py-2 px-4">
              {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy to Clipboard</>}
            </button>
          </div>
        )}
      </div>

      {/* New Achievements */}
      {stats.achievements.length > 0 && (
        <div className="glass-card-static p-4">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Trophy className="w-4 h-4" style={{ color: 'var(--amber)' }} /> Your Achievements
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.achievements.map(id => {
              const a = ACHIEVEMENTS[id];
              if (!a) return null;
              return (
                <span key={id} className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  {a.icon} {a.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Question Review */}
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Nunito, sans-serif' }}>Review</h2>
        <div className="space-y-3">
          {quiz.questions.map((question, qIndex) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <div key={question.id} className="glass-card-static p-4 animate-fade-in-up" style={{ animationDelay: `${qIndex * 0.03}s`, borderColor: isCorrect ? 'var(--emerald)' + '40' : 'var(--rose)' + '40' }}>
                <div className="flex items-start gap-3 mb-3">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${isCorrect ? 'animate-pulse-correct' : 'animate-shake'}`}
                    style={{ background: isCorrect ? 'var(--emerald)' + '20' : 'var(--rose)' + '20' }}>
                    {isCorrect ? <CheckCircle className="w-4 h-4" style={{ color: 'var(--emerald)' }} /> : <XCircle className="w-4 h-4" style={{ color: 'var(--rose)' }} />}
                  </span>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Q{qIndex + 1}.</span> {question.question}
                  </p>
                </div>
                <div className="space-y-1 ml-10">
                  {question.options.map((option, oIndex) => {
                    const isUserChoice = userAnswer === oIndex;
                    const isCorrectAnswer = question.correctAnswer === oIndex;
                    let style = { background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid transparent' };
                    if (isCorrectAnswer) style = { background: 'var(--emerald)' + '15', color: 'var(--emerald)', border: '1px solid var(--emerald)' + '30' };
                    else if (isUserChoice) style = { background: 'var(--rose)' + '15', color: 'var(--rose)', border: '1px solid var(--rose)' + '30' };

                    return (
                      <div key={oIndex} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={style}>
                        <span className="font-bold">{String.fromCharCode(65 + oIndex)}.</span>
                        <span className="flex-1">{option}</span>
                        {isCorrectAnswer && <CheckCircle className="w-3 h-3" />}
                        {isUserChoice && !isCorrect && <XCircle className="w-3 h-3" />}
                      </div>
                    );
                  })}
                </div>
                {question.explanation && !isCorrect && (
                  <p className="mt-2 ml-10 text-xs" style={{ color: 'var(--text-muted)' }}>{question.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
