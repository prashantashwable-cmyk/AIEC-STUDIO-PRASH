import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  TrainingModule,
  TrainingLesson,
  TrainingKnowledgeCheck,
  PartnerModuleProgress,
  PartnerLessonProgress
} from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Languages,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  ArrowLeft,
  HelpCircle,
  Award,
  Sparkles,
  ShieldCheck,
  Clock,
  ChevronRight,
  BookOpen,
  WifiOff,
  Share2,
  Check,
  Lock
} from 'lucide-react';

interface VideoInteractiveLessonPlayerScreenProps {
  user: User;
  partnerId?: string;
  trainingModuleId: string;
  lessonId: string;
  onNavigateToLibrary?: () => void;
  onLessonCompleted?: (nextLessonId?: string) => void;
}

export const VideoInteractiveLessonPlayerScreen: React.FC<VideoInteractiveLessonPlayerScreenProps> = ({
  user,
  partnerId,
  trainingModuleId,
  lessonId,
  onNavigateToLibrary,
  onLessonCompleted
}) => {
  const [moduleItem, setModuleItem] = useState<TrainingModule | null>(null);
  const [lesson, setLesson] = useState<TrainingLesson | null>(null);
  const [progress, setProgress] = useState<PartnerModuleProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Video State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [offlineDownloaded, setOfflineDownloaded] = useState(false);

  // Knowledge Check Modal State
  const [activeCheck, setActiveCheck] = useState<TrainingKnowledgeCheck | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checkSubmitted, setCheckSubmitted] = useState(false);
  const [isCheckCorrect, setIsCheckCorrect] = useState(false);
  const [answeredChecksMap, setAnsweredChecksMap] = useState<Record<string, number>>({});

  // Reference Sheet Drawer / Tab State
  const [showReferenceSheet, setShowReferenceSheet] = useState(false);
  const [referenceSheetDownloaded, setReferenceSheetDownloaded] = useState(false);

  // Active Lesson Index for Next/Prev
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  useEffect(() => {
    loadLessonData();
  }, [trainingModuleId, lessonId, partnerId, user]);

  const loadLessonData = () => {
    setLoading(true);
    const modules = DbManager.getTrainingModules();
    const mod = modules.find(m => m.id === trainingModuleId) || modules[0];
    setModuleItem(mod);

    if (mod) {
      const lesIdx = mod.lessons.findIndex(l => l.id === lessonId);
      const les = mod.lessons[lesIdx >= 0 ? lesIdx : 0];
      setLesson(les);
      setCurrentLessonIndex(lesIdx >= 0 ? lesIdx : 0);

      // Load progress
      const targetPartnerId = partnerId || 'p_001';
      const prog = DbManager.getPartnerModuleProgress(targetPartnerId, mod.id) || {
        partnerId: targetPartnerId,
        moduleId: mod.id,
        status: 'in_progress',
        completionPercent: 0,
        lessonProgress: {},
        lastAccessedAt: new Date().toISOString().split('T')[0]
      };
      setProgress(prog);

      // Populate existing check responses
      const lesProg = prog.lessonProgress[les.id];
      if (lesProg) {
        setAnsweredChecksMap(lesProg.knowledgeCheckResponses || {});
        if (lesProg.playbackProgressSeconds) {
          setCurrentTime(lesProg.playbackProgressSeconds);
        }
      }
    }
    setLoading(false);
  };

  // Synchronize playback time & check for embedded knowledge checks
  const handleTimeUpdate = () => {
    if (!videoRef.current || !lesson) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Check if we hit an un-answered knowledge check timestamp
    if (lesson.knowledgeChecks && lesson.knowledgeChecks.length > 0) {
      lesson.knowledgeChecks.forEach(check => {
        // If current time passes the check timestamp within 1 second range and hasn't been answered yet
        if (time >= check.timestampSeconds && time <= check.timestampSeconds + 2 && answeredChecksMap[check.id] === undefined) {
          if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
          setActiveCheck(check);
          setSelectedOption(null);
          setCheckSubmitted(false);
        }
      });
    }

    // Save playback progress periodically
    saveProgressState(time, false);
  };

  // Save lesson progress into DbManager
  const saveProgressState = (timeSec: number, markCompleted: boolean) => {
    if (!moduleItem || !lesson || !progress) return;

    const targetPartnerId = partnerId || 'p_001';
    const updatedLessonProgress: Record<string, PartnerLessonProgress> = {
      ...(progress.lessonProgress || {}),
      [lesson.id]: {
        lessonId: lesson.id,
        playbackProgressSeconds: Math.floor(timeSec),
        completed: markCompleted || progress.lessonProgress?.[lesson.id]?.completed || false,
        knowledgeCheckResponses: answeredChecksMap,
        completedAt: markCompleted ? new Date().toISOString() : progress.lessonProgress?.[lesson.id]?.completedAt
      }
    };

    // Calculate module completion percentage
    const completedCount = Object.values(updatedLessonProgress).filter(lp => lp.completed).length;
    const totalLessons = moduleItem.lessons.length;
    const compPercent = Math.round((completedCount / totalLessons) * 100);
    const newStatus = compPercent >= 100 ? 'completed' : 'in_progress';

    const updatedProg: PartnerModuleProgress = {
      ...progress,
      partnerId: targetPartnerId,
      moduleId: moduleItem.id,
      status: newStatus,
      completionPercent: compPercent,
      lessonProgress: updatedLessonProgress,
      lastAccessedAt: new Date().toISOString().split('T')[0]
    };

    setProgress(updatedProg);
    DbManager.savePartnerModuleProgress(updatedProg);
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleSeek = (seconds: number) => {
    if (!videoRef.current || !lesson) return;

    // Check if user is attempting to skip past an un-answered check
    const targetTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    
    // Find if there is an unanswered check between currentTime and targetTime
    if (seconds > 0 && lesson.knowledgeChecks) {
      const blockedCheck = lesson.knowledgeChecks.find(c =>
        c.timestampSeconds > currentTime &&
        c.timestampSeconds <= targetTime &&
        answeredChecksMap[c.id] === undefined
      );

      if (blockedCheck) {
        // Stop at check timestamp and show question
        videoRef.current.currentTime = blockedCheck.timestampSeconds;
        videoRef.current.pause();
        setIsPlaying(false);
        setActiveCheck(blockedCheck);
        setSelectedOption(null);
        setCheckSubmitted(false);
        return;
      }
    }

    videoRef.current.currentTime = targetTime;
  };

  // Submit Knowledge Check
  const handleSubmitCheck = () => {
    if (!activeCheck || selectedOption === null) return;

    const correct = selectedOption === activeCheck.correctOptionIndex;
    setCheckSubmitted(true);
    setIsCheckCorrect(correct);

    if (correct) {
      const updatedAnswers = {
        ...answeredChecksMap,
        [activeCheck.id]: selectedOption
      };
      setAnsweredChecksMap(updatedAnswers);
    }
  };

  // Continue video after correct check
  const handleContinueAfterCheck = () => {
    setActiveCheck(null);
    setSelectedOption(null);
    setCheckSubmitted(false);
    if (videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Finish Lesson
  const handleCompleteLesson = () => {
    if (!videoRef.current) return;
    saveProgressState(duration || currentTime, true);

    // Determine next lesson
    if (moduleItem && currentLessonIndex < moduleItem.lessons.length - 1) {
      const nextLes = moduleItem.lessons[currentLessonIndex + 1];
      if (onLessonCompleted) {
        onLessonCompleted(nextLes.id);
      }
    } else {
      if (onNavigateToLibrary) {
        onNavigateToLibrary();
      }
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = Math.floor(secs % 60);
    return `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
  };

  if (loading || !lesson || !moduleItem) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <BookOpen className="w-10 h-10 text-[var(--color-accent-primary)] animate-bounce mx-auto" />
          <p className="text-xs text-[var(--color-text-secondary)]">Loading training lesson video & reference SOPs...</p>
        </div>
      </div>
    );
  }

  const isCurrentLessonCompleted = progress?.lessonProgress?.[lesson.id]?.completed;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24">
      
      {/* Top Header Navigation */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-4 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToLibrary}
              className="p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] font-bold text-[var(--color-accent-primary)] uppercase tracking-wider block">
                {moduleItem.moduleTitle}
              </span>
              <h1 className="text-base font-bold text-[var(--color-text-primary)] truncate">
                Lesson {currentLessonIndex + 1}: {lesson.lessonTitle}
              </h1>
            </div>
          </div>

          {/* Download Reference Sheet Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReferenceSheet(!showReferenceSheet)}
              className="px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[var(--color-accent-primary)]" />
              <span className="hidden sm:inline">Reference SOP Sheet</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-6 space-y-6">

        {/* Video Player Container */}
        <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] bg-black shadow-xl group">
          
          <video
            ref={videoRef}
            src={lesson.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
            poster={lesson.thumbnailUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration);
                if (currentTime > 0) {
                  videoRef.current.currentTime = currentTime;
                }
              }
            }}
            onEnded={() => {
              setIsPlaying(false);
              saveProgressState(duration, true);
            }}
            className="w-full aspect-video object-cover cursor-pointer"
            onClick={handlePlayPause}
          />

          {/* Embedded Knowledge Check Overlay Pause Modal */}
          {activeCheck && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 p-6 flex items-center justify-center animate-fadeIn">
              <Card className="max-w-md w-full p-6 bg-[var(--color-surface)] border-2 border-[var(--color-accent-primary)] shadow-2xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-accent-primary)] uppercase">
                  <HelpCircle className="w-4 h-4" />
                  <span>Embedded Knowledge Check (Required to proceed)</span>
                </div>

                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                  {selectedLanguage === 'hi' && activeCheck.questionHi ? activeCheck.questionHi : selectedLanguage === 'mr' && activeCheck.questionMr ? activeCheck.questionMr : activeCheck.question}
                </h3>

                {/* Options List */}
                <div className="space-y-2">
                  {((selectedLanguage === 'hi' && activeCheck.optionsHi) ? activeCheck.optionsHi : (selectedLanguage === 'mr' && activeCheck.optionsMr) ? activeCheck.optionsMr : activeCheck.options).map((opt, idx) => (
                    <button
                      key={idx}
                      disabled={checkSubmitted && isCheckCorrect}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full p-3 rounded-xl border text-xs text-left transition-all cursor-pointer flex items-center justify-between ${
                        selectedOption === idx
                          ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-[var(--color-text-primary)] font-bold'
                          : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedOption === idx && <CheckCircle2 className="w-4 h-4 text-[var(--color-accent-primary)] shrink-0" />}
                    </button>
                  ))}
                </div>

                {/* Explanation feedback */}
                {checkSubmitted && (
                  <div className={`p-3 rounded-xl border text-xs ${
                    isCheckCorrect
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200'
                  }`}>
                    <strong>{isCheckCorrect ? 'Correct!' : 'Incorrect, try again!'}</strong>
                    <p className="mt-1">{activeCheck.explanation}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  {!checkSubmitted || !isCheckCorrect ? (
                    <Button
                      disabled={selectedOption === null}
                      onClick={handleSubmitCheck}
                      className="px-4 py-2 text-xs font-bold bg-[var(--color-accent-primary)] text-white shadow-md hover:bg-[var(--color-accent-secondary)] cursor-pointer"
                    >
                      Verify Answer
                    </Button>
                  ) : (
                    <Button
                      onClick={handleContinueAfterCheck}
                      className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white shadow-md hover:bg-emerald-700 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Continue Video</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Custom Video Controls Bar */}
          <div className="p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white space-y-2">
            
            {/* Timeline Progress Rail with Ascension Glow */}
            <div className="relative flex items-center group/timeline cursor-pointer">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  handleSeek(val - currentTime);
                }}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-primary)]"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              {/* Left Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayPause}
                  className="p-1.5 hover:text-[var(--color-accent-primary)] transition-all cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                <button
                  onClick={() => handleSeek(-10)}
                  className="p-1 hover:text-[var(--color-accent-primary)] transition-all cursor-pointer"
                  title="Rewind 10s"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleSeek(10)}
                  className="p-1 hover:text-[var(--color-accent-primary)] transition-all cursor-pointer"
                  title="Forward 10s"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <span className="font-mono text-[11px] text-gray-300">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-3">
                
                {/* Speed Selector */}
                <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-lg text-[10px]">
                  {[0.75, 1.0, 1.25, 1.5, 2.0].map(sp => (
                    <button
                      key={sp}
                      onClick={() => handleSpeedChange(sp)}
                      className={`px-1.5 py-0.5 rounded font-mono cursor-pointer ${
                        playbackSpeed === sp ? 'bg-[var(--color-accent-primary)] text-white font-bold' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {sp}x
                    </button>
                  ))}
                </div>

                {/* Offline Download Simulation */}
                <button
                  onClick={() => setOfflineDownloaded(!offlineDownloaded)}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer ${
                    offlineDownloaded ? 'bg-emerald-500/20 text-emerald-400' : 'hover:text-[var(--color-accent-primary)] text-gray-300'
                  }`}
                  title="Download for offline field viewing"
                >
                  {offlineDownloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  <span className="text-[10px] hidden md:inline">{offlineDownloaded ? 'Offline Saved' : 'Download'}</span>
                </button>

              </div>
            </div>

          </div>

        </div>

        {/* Reference SOP Sheet Drawer / Modal */}
        {showReferenceSheet && (
          <Card className="p-5 border-2 border-[var(--color-accent-primary)] bg-[var(--color-surface)] shadow-xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                    {lesson.referenceSheetTitle}
                  </h3>
                  <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
                    Official AIEC Field SOP Version {lesson.version}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setReferenceSheetDownloaded(true)}
                  className="px-3 py-1.5 text-xs font-bold bg-[var(--color-accent-primary)] text-white shadow-sm hover:bg-[var(--color-accent-secondary)] flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{referenceSheetDownloaded ? 'SOP Downloaded' : 'Save PDF'}</span>
                </Button>
                <button
                  onClick={() => setShowReferenceSheet(false)}
                  className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] font-mono text-xs whitespace-pre-wrap leading-relaxed text-[var(--color-text-primary)]">
              {lesson.referenceSheetContent}
            </div>
          </Card>
        )}

        {/* Lesson Description & Completion Footer Card */}
        <Card className="p-6 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block">
                Lesson Overview & Objectives
              </span>
              <p className="text-xs text-[var(--color-text-primary)] leading-relaxed">
                {lesson.description}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              {isCurrentLessonCompleted ? (
                <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Lesson Certified
                </span>
              ) : (
                <Button
                  onClick={handleCompleteLesson}
                  className="px-5 py-2.5 text-xs font-bold bg-[var(--color-accent-primary)] text-white shadow-lg hover:bg-[var(--color-accent-secondary)] flex items-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Mark Lesson Complete & Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>

          </div>
        </Card>

      </div>
    </div>
  );
};
