import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Award, CheckCircle2, XCircle, AlertTriangle, Clock, 
  ArrowLeft, ChevronRight, HelpCircle, Flag, RefreshCw, Sparkles, 
  Check, Lock, RotateCcw, AlertCircle
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { CertificationAssessment, QuizQuestion, AssessmentAttemptResult } from '../types';
import { Card, Button } from './Common';

interface QuizCertificationTestScreenProps {
  assessmentId?: string;
  partnerId?: string;
  currentLanguage?: 'en' | 'hi' | 'mr';
  onNavigateToBadges?: () => void;
  onBack?: () => void;
}

export const QuizCertificationTestScreen: React.FC<QuizCertificationTestScreenProps> = ({
  assessmentId = 'assess_001',
  partnerId = 'p_001',
  currentLanguage = 'en',
  onNavigateToBadges,
  onBack
}) => {
  const [assessment, setAssessment] = useState<CertificationAssessment | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [disputeReasonModal, setDisputeReasonModal] = useState<string | null>(null);
  const [disputeText, setDisputeText] = useState('');
  
  // Test Lifecycle State
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attemptResult, setAttemptResult] = useState<AssessmentAttemptResult | null>(null);
  const [previousAttempts, setPreviousAttempts] = useState<AssessmentAttemptResult[]>([]);
  const [cooldownRemainingMinutes, setCooldownRemainingMinutes] = useState<number | null>(null);

  useEffect(() => {
    loadAssessmentData();
  }, [assessmentId, partnerId]);

  const loadAssessmentData = () => {
    const asm = DbManager.getAssessmentById(assessmentId);
    if (asm) {
      setAssessment(asm);
    }
    const attempts = DbManager.getAssessmentAttempts(partnerId, assessmentId);
    setPreviousAttempts(attempts);

    // Check if under retake cooldown
    if (attempts.length > 0) {
      const lastAttempt = attempts[attempts.length - 1];
      if (!lastAttempt.passed && lastAttempt.completedAt) {
        const completedTime = new Date(lastAttempt.completedAt).getTime();
        const now = new Date().getTime();
        const cooldownMs = (asm?.retakeCooldownHours || 4) * 60 * 60 * 1000;
        const diffMs = cooldownMs - (now - completedTime);
        if (diffMs > 0) {
          setCooldownRemainingMinutes(Math.ceil(diffMs / (60 * 1000)));
        } else {
          setCooldownRemainingMinutes(null);
        }
      }
    }
  };

  if (!assessment) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <Card className="p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-[var(--color-accent-primary)] mx-auto animate-bounce" />
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Loading Assessment Engine...
          </p>
        </Card>
      </div>
    );
  }

  const questions = assessment.questions;
  const isReviewStep = currentStepIndex === questions.length;
  const currentQuestion = questions[currentStepIndex];

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleToggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleNextStep = () => {
    if (currentStepIndex < questions.length) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSubmitAssessment = () => {
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercent >= assessment.passThresholdPercent;

    const newAttempt: AssessmentAttemptResult = {
      id: `att_${Date.now()}`,
      assessmentId: assessment.id,
      partnerId,
      attemptNumber: previousAttempts.length + 1,
      scoreAchievedPercent: scorePercent,
      passed,
      answers,
      completedAt: new Date().toISOString()
    };

    DbManager.saveAssessmentAttempt(newAttempt);
    setAttemptResult(newAttempt);
    setIsSubmitted(true);
    loadAssessmentData();
  };

  const getLocalizedQuestionText = (q: QuizQuestion) => {
    if (currentLanguage === 'hi' && q.questionTextHi) return q.questionTextHi;
    if (currentLanguage === 'mr' && q.questionTextMr) return q.questionTextMr;
    return q.questionText;
  };

  const getLocalizedOptions = (q: QuizQuestion) => {
    if (currentLanguage === 'hi' && q.optionsHi) return q.optionsHi;
    if (currentLanguage === 'mr' && q.optionsMr) return q.optionsMr;
    return q.options;
  };

  const getLocalizedTitle = () => {
    if (currentLanguage === 'hi' && assessment.titleHi) return assessment.titleHi;
    if (currentLanguage === 'mr' && assessment.titleMr) return assessment.titleMr;
    return assessment.title;
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24">
      {/* Header Bar */}
      <div className="sticky top-0 z-20 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <h1 className="font-serif text-base font-bold">
                  {currentLanguage === 'hi' ? 'प्रमाणन मूल्यांकन' : currentLanguage === 'mr' ? 'प्रमाणपत्र मूल्यमापन' : 'Certification Test'}
                </h1>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] font-mono">
                {assessment.passThresholdPercent}% Pass Threshold • {questions.length} Questions
              </p>
            </div>
          </div>

          {onNavigateToBadges && (
            <Button
              variant="outline"
              onClick={onNavigateToBadges}
              className="text-xs px-2.5 py-1.5 h-auto flex items-center gap-1"
            >
              <Award className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
              <span className="hidden sm:inline">My Badges</span>
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        {/* Retake Cooldown Alert if blocked */}
        {cooldownRemainingMinutes !== null && !isSubmitted && (
          <Card className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500 shrink-0" />
              <h3 className="font-semibold text-sm">Retake Cooldown Period Active</h3>
            </div>
            <p className="text-xs leading-relaxed">
              To ensure genuine learning and prevent guess-spamming, a {assessment.retakeCooldownHours}-hour cooldown applies after a failed attempt.
              Please review the SOP documentation before re-attempting in approximately <strong>{cooldownRemainingMinutes} minutes</strong>.
            </p>
          </Card>
        )}

        {/* Top Ascension Line Progress Wizard Rail */}
        <Card className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-serif font-bold text-[var(--color-text-primary)]">
              {getLocalizedTitle()}
            </span>
            <span className="font-mono text-[11px] text-[var(--color-accent-primary)] font-semibold">
              {isReviewStep ? 'Final Review' : `Question ${currentStepIndex + 1} of ${questions.length}`}
            </span>
          </div>

          {/* Ascension Line Step Nodes */}
          <div className="flex items-center gap-1.5 pt-1">
            {questions.map((q, idx) => {
              const isDone = answers[q.id] !== undefined;
              const isCurrent = currentStepIndex === idx && !isReviewStep;
              const isFlagged = flaggedQuestions[q.id];

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`flex-1 h-2 rounded-full transition-all relative ${
                    isCurrent 
                      ? 'bg-[var(--color-accent-primary)] ring-2 ring-[var(--color-accent-primary)]/40 shadow-xs' 
                      : isDone 
                        ? 'bg-[var(--color-accent-secondary)]' 
                        : 'bg-[var(--color-border)]'
                  }`}
                  title={`Question ${idx + 1}`}
                >
                  {isFlagged && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentStepIndex(questions.length)}
              className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded border transition-all ${
                isReviewStep 
                  ? 'bg-[var(--color-accent-primary)] text-white border-transparent' 
                  : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
              }`}
            >
              Review
            </button>
          </div>
        </Card>

        {/* RESULTS SCREEN AFTER SUBMISSION */}
        {isSubmitted && attemptResult ? (
          <Card className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md space-y-6 animate-in fade-in duration-300">
            {/* Outcome Header */}
            <div className="text-center space-y-2">
              {attemptResult.passed ? (
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
                  <Award className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
                  <RotateCcw className="w-8 h-8" />
                </div>
              )}

              <h2 className="font-serif font-bold text-xl text-[var(--color-text-primary)]">
                {attemptResult.passed ? 'Certification Assessment Passed!' : 'Assessment Attempt Complete'}
              </h2>

              <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto">
                {attemptResult.passed 
                  ? 'Congratulations! You achieved the required passing threshold. Your official certification badge and job eligibility skill tags have been issued.'
                  : `You achieved ${attemptResult.scoreAchievedPercent}%. The passing threshold is ${assessment.passThresholdPercent}%. Review the explanations below and re-study the SOP standard before retaking.`}
              </p>

              <div className="inline-flex items-center gap-4 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs font-mono">
                <div>
                  <span className="text-[var(--color-text-secondary)] block text-[10px]">SCORE</span>
                  <span className="font-bold text-base text-[var(--color-accent-primary)]">{attemptResult.scoreAchievedPercent}%</span>
                </div>
                <div className="w-px h-6 bg-[var(--color-border)]" />
                <div>
                  <span className="text-[var(--color-text-secondary)] block text-[10px]">THRESHOLD</span>
                  <span className="font-bold text-base">{assessment.passThresholdPercent}%</span>
                </div>
                <div className="w-px h-6 bg-[var(--color-border)]" />
                <div>
                  <span className="text-[var(--color-text-secondary)] block text-[10px]">ATTEMPT</span>
                  <span className="font-bold text-base">#{attemptResult.attemptNumber}</span>
                </div>
              </div>
            </div>

            {/* Answer Explanations Review */}
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-sm text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
                Detailed Question Review & Explanations
              </h3>

              {questions.map((q, qIdx) => {
                const selectedOpt = answers[q.id];
                const isCorrect = selectedOpt === q.correctOptionIndex;
                const opts = getLocalizedOptions(q);

                return (
                  <div key={q.id} className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--color-accent-primary)]">
                        Q{qIdx + 1}.
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                        isCorrect ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      }`}>
                        {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                      {getLocalizedQuestionText(q)}
                    </p>

                    <div className="space-y-1.5 pt-1">
                      {opts.map((opt, oIdx) => {
                        const isSelectedOption = selectedOpt === oIdx;
                        const isRightOption = q.correctOptionIndex === oIdx;

                        return (
                          <div 
                            key={oIdx}
                            className={`p-2.5 rounded-lg text-xs flex items-center justify-between border ${
                              isRightOption 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200 font-medium'
                                : isSelectedOption 
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200' 
                                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] opacity-70'
                            }`}
                          >
                            <span>{opt}</span>
                            {isRightOption && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                            {!isRightOption && isSelectedOption && <XCircle className="w-4 h-4 text-amber-600 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Callout */}
                    <div className="mt-2 p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs space-y-1">
                      <span className="font-semibold text-[var(--color-accent-primary)] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> SOP Standard Rationale:
                      </span>
                      <p className="text-[var(--color-text-secondary)]">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false);
                  setCurrentStepIndex(0);
                  setAnswers({});
                }}
                className="text-xs px-4 py-2"
                disabled={cooldownRemainingMinutes !== null && !attemptResult.passed}
              >
                Re-take Assessment
              </Button>

              {onNavigateToBadges && (
                <Button
                  onClick={onNavigateToBadges}
                  className="bg-[var(--color-accent-primary)] text-white text-xs px-4 py-2 font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Award className="w-4 h-4" />
                  <span>View Earned Badges</span>
                </Button>
              )}
            </div>
          </Card>
        ) : (
          /* ACTIVE WIZARD STEPS */
          <div className="space-y-4">
            {isReviewStep ? (
              /* REVIEW STEP */
              <Card className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-4">
                <div className="border-b border-[var(--color-border)] pb-3">
                  <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)]">
                    Review Your Answers Before Final Submission
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    You have answered {answeredCount} of {questions.length} questions. You can tap any question to modify your answer before submitting.
                  </p>
                </div>

                <div className="space-y-3">
                  {questions.map((q, idx) => {
                    const ansIndex = answers[q.id];
                    const isAnswered = ansIndex !== undefined;
                    const opts = getLocalizedOptions(q);

                    return (
                      <div 
                        key={q.id}
                        onClick={() => setCurrentStepIndex(idx)}
                        className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/50 transition-colors cursor-pointer space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-[var(--color-accent-primary)]">
                            Q{idx + 1}. {q.id}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            isAnswered ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-700'
                          }`}>
                            {isAnswered ? 'Answered' : 'Unanswered'}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-[var(--color-text-primary)] line-clamp-1">
                          {getLocalizedQuestionText(q)}
                        </p>

                        <p className="text-[11px] text-[var(--color-text-secondary)] font-mono pt-0.5">
                          Selected: {isAnswered ? opts[ansIndex] : '— None selected —'}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleSubmitAssessment}
                    disabled={answeredCount < questions.length || cooldownRemainingMinutes !== null}
                    className="w-full bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/90 text-white font-semibold py-3 text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Submit & Calculate Grade</span>
                  </Button>
                </div>
              </Card>
            ) : (
              /* INDIVIDUAL QUESTION STEP */
              <Card className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-[var(--color-accent-primary)] block mb-1">
                      QUESTION {currentStepIndex + 1} OF {questions.length}
                    </span>
                    <h2 className="font-serif font-bold text-base text-[var(--color-text-primary)] leading-snug">
                      {getLocalizedQuestionText(currentQuestion)}
                    </h2>
                  </div>

                  <button
                    onClick={() => handleToggleFlagQuestion(currentQuestion.id)}
                    className={`p-2 rounded-lg border text-xs flex items-center gap-1 shrink-0 transition-colors ${
                      flaggedQuestions[currentQuestion.id] 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 font-semibold' 
                        : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-amber-500'
                    }`}
                    title="Flag for Admin Content Dispute"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span className="text-[10px] hidden sm:inline">Flag</span>
                  </button>
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-2.5">
                  {getLocalizedOptions(currentQuestion).map((optionText, optIdx) => {
                    const isSelected = answers[currentQuestion.id] === optIdx;

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                        className={`w-full p-3.5 rounded-xl text-left border text-xs transition-all flex items-start gap-3 ${
                          isSelected 
                            ? 'bg-[var(--color-accent-primary)]/10 border-[var(--color-accent-primary)] text-[var(--color-text-primary)] font-semibold shadow-xs' 
                            : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)]/40'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 font-mono text-[10px] ${
                          isSelected 
                            ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] text-white font-bold' 
                            : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-relaxed pt-0.5">{optionText}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Question Footer Navigation */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={currentStepIndex === 0}
                    className="text-xs px-3 py-1.5"
                  >
                    Previous
                  </Button>

                  <Button
                    onClick={handleNextStep}
                    className="bg-[var(--color-accent-primary)] text-white text-xs px-4 py-1.5 font-semibold flex items-center gap-1 shadow-xs"
                  >
                    <span>{currentStepIndex === questions.length - 1 ? 'Go to Review' : 'Next Question'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
