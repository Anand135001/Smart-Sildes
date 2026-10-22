
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'

import './App.css'

import { SmartSlideRenderer } from './components/SmartSlideRenderer'
import { neuralNetworkLesson } from './lessons/neuralNetworkLesson'
import { validateSmartLesson } from './lessons/validateLesson'
import type { SmartLesson } from './visuals/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

const demoLessonErrors = validateSmartLesson(neuralNetworkLesson)

if (import.meta.env.DEV && demoLessonErrors.length > 0) {
  console.error('Invalid demo lesson:', demoLessonErrors)
}

function SmartVisual({
  lesson,
  activeStep,
  audioMode,
  isSpeaking,
  isPaused,
  audioError,
  onToggleAudioMode,
  onPlayAudio,
  onPauseAudio,
  onStopAudio,
}: {
  lesson: SmartLesson
  activeStep: number
  audioMode: boolean
  isSpeaking: boolean
  isPaused: boolean
  audioError: string | null
  onToggleAudioMode: () => void
  onPlayAudio: () => void
  onPauseAudio: () => void
  onStopAudio: () => void
}) {
  const lessonSteps = lesson.steps
  const step = lessonSteps[activeStep] ?? lessonSteps[0]

  return (
    <aside
      className={
        audioMode
          ? 'visual-panel audio-mode'
          : 'visual-panel'
      }
    >
      <div className="visual-topbar">
        <div>
          <span className="eyebrow">SMART SLIDE</span>
          <h2>
            {audioMode ? 'Listen and learn' : 'Visual explanation'}
          </h2>
        </div>
      
        <div className="visual-topbar-actions">
          {audioMode && (
            <>
              <button
                className="audio-control"
                onClick={onPlayAudio}
                disabled={isSpeaking && !isPaused}
                type="button"
              >
                {isPaused ? 'Resume' : isSpeaking ? 'Playing…' : 'Play audio'}
              </button>
      
              <button
                className="audio-control"
                onClick={onPauseAudio}
                disabled={!isSpeaking}
                type="button"
              >
                Pause
              </button>
      
              <button
                className="audio-control"
                onClick={onStopAudio}
                disabled={!isSpeaking && !isPaused}
                type="button"
              >
                Stop
              </button>
            </>
          )}
      
          <button
            className="audio-mode-toggle"
            onClick={onToggleAudioMode}
            type="button"
          >
            {audioMode ? 'Exit audio mode' : 'Audio mode'}
          </button>
      
          {!audioMode && (
            <span className="live-indicator">
              <span />
              LIVE
            </span>
          )}
        </div>
      </div>


      <div className="visual-stage">
        <div className="stage-caption">
          <span>
            STEP {String(activeStep + 1).padStart(2, '0')}
          </span>
          <span>{step.label}</span>
        </div>

        <SmartSlideRenderer
          scene={step.scene}
          actions={step.actions}
        />

        <div className="visual-hint">
          <span className="hint-dot" />
          Visual updates as you move through the lesson
        </div>

        {audioError && (
          <p className="audio-error" role="alert"> {audioError} </p>)}
      </div>

      <div className="visual-footer">
        <span>LESSON PROGRESS</span>

        <div className="progress-dots">
          {lessonSteps.map((item, index) => (
            <span
              key={item.id}
              className={
                index === activeStep
                  ? 'progress-dot active'
                  : 'progress-dot'
              }
            />
          ))}
        </div>

        <span>
          {String(activeStep + 1).padStart(2, '0')} /{' '}
          {String(lessonSteps.length).padStart(2, '0')}
        </span>
      </div>
    </aside>
  )
}

function App() {
  const [lesson, setLesson] = useState<SmartLesson>(neuralNetworkLesson)
  
  const [activeStep, setActiveStep] = useState(0)
  const [topicInput, setTopicInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const [audioMode, setAudioMode] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  
  const narrationRunRef = useRef(false)

  const readingPanelRef = useRef<HTMLDivElement>(null)
   
  const handleGenerateLesson = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
  
    const topic = topicInput.trim()
  
    if (topic.length < 2 || topic.length > 180) {
      setGenerationError('Enter a topic between 2 and 180 characters.',)
      return
    }
  
    setIsGenerating(true)
    setGenerationError(null)
  
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/lessons`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic }),
        },
      )
  
      const payload: unknown = await response.json()
  
      if (!response.ok) {
        let message = `Request failed with status ${response.status}.`
  
        if (
          typeof payload === 'object' &&
          payload !== null &&
          'error' in payload &&
          typeof payload.error === 'string'
        ) {
          message = payload.error
        }
  
        throw new Error(message)
      }
  
      if (
        typeof payload !== 'object' ||
        payload === null ||
        !('lesson' in payload)
      ) {
        throw new Error(
          'The backend response did not contain a lesson.',
        )
      }
  
      const candidate = payload.lesson
      const errors = validateSmartLesson(candidate)
  
      if (errors.length > 0) {
        throw new Error(
          `The generated lesson failed validation: ${errors
            .slice(0, 3)
            .join(' ')}`,
        )
      }
  
      // Replace the demo only after validation succeeds.
      setLesson(candidate as SmartLesson)
      setActiveStep(0)
  
      if (readingPanelRef.current) {
        readingPanelRef.current.scrollTop = 0
      }
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : 'Something went wrong while generating the lesson.',
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const speakLessonStep = (stepIndex: number) => {
    if (!narrationRunRef.current) return
  
    const step = lesson.steps[stepIndex]
  
    if (!step) {
      narrationRunRef.current = false
      setIsSpeaking(false)
      setIsPaused(false)
      return
    }
  
    setActiveStep(stepIndex)
  
    const narration = [
      step.title,
      ...step.paragraphs,
      `Key idea. ${step.takeaway}`,
    ].join('. ')
  
    const utterance = new SpeechSynthesisUtterance(narration)
  
    // Slightly slower speech can be easier to follow.
    utterance.rate = 0.9
  
    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsPaused(false)
    }
  
    utterance.onend = () => {
      if (!narrationRunRef.current) return
  
      if (stepIndex + 1 < lesson.steps.length) {
        speakLessonStep(stepIndex + 1)
      } else {
        narrationRunRef.current = false
        setIsSpeaking(false)
        setIsPaused(false)
      }
    }
  
    utterance.onerror = (event) => {
      if (
        event.error === 'canceled' ||
        event.error === 'interrupted'
      ) {
        return
      }
  
      narrationRunRef.current = false
      setIsSpeaking(false)
      setIsPaused(false)
      setAudioError('Speech playback failed. Try playing the lesson again.')
    }
  
    window.speechSynthesis.speak(utterance)
  }
  
  const handlePlayAudio = () => {
      if (
        typeof window === 'undefined' ||
        !('speechSynthesis' in window)
      ) {
        setAudioError(
          'Your browser does not support speech synthesis.',
        )
        return
      }
    
      setAudioError(null)
    
      // Resume the existing utterance if playback was paused.
      if (isPaused) {
        window.speechSynthesis.resume()
        setIsPaused(false)
        setIsSpeaking(true)
        return
      }
    
      // Start again from the currently active step.
      window.speechSynthesis.cancel()
      narrationRunRef.current = true
      setIsSpeaking(false)
      setIsPaused(false)
    
      speakLessonStep(activeStep)
    }
    
    const handlePauseAudio = () => {
      if (!window.speechSynthesis.speaking) return
    
      window.speechSynthesis.pause()
      setIsSpeaking(false)
      setIsPaused(true)
    }
    
    const handleStopAudio = () => {
      narrationRunRef.current = false
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setIsPaused(false)
    }
    
    const handleToggleAudioMode = () => {
      if (audioMode) {
        handleStopAudio()
      }
    
      setAudioError(null)
      setAudioMode(!audioMode)
    }

  useEffect(() => {
    narrationRunRef.current = false
    window.speechSynthesis?.cancel()
    
    setIsSpeaking(false)
    setIsPaused(false)
  }, [lesson])
  

  useEffect(() => {
    return () => {
      narrationRunRef.current = false
      window.speechSynthesis?.cancel()
    }
  }, [])
  

  useEffect(() => {
    const root = readingPanelRef.current
    if (!root) return

    const sections = Array.from(
      root.querySelectorAll<HTMLElement>('[data-step]'),
    )

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => b.intersectionRatio - a.intersectionRatio,
          )

        const step = visibleSections[0]?.target.getAttribute('data-step')

        if (step !== null && step !== undefined) {
          setActiveStep(Number(step))
        }
      },
      {
        root,
        rootMargin: '-12% 0px -55% 0px',
        threshold: [0.05, 0.2, 0.45],
      },
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [lesson])

  const jumpToStep = (index: number) => {
    const section = readingPanelRef.current?.querySelector<HTMLElement>(
      `[data-step="${index}"]`,
    )

    section?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })

    setActiveStep(index)
  }

  return (
    <div className={audioMode ? 'app-shell audio-mode' : 'app-shell'}>
      <header className="topbar">
        <a className="brand" href="/" aria-label="Smart Slide home">
          <span className="brand-mark">
            <span />
            <span />
            <span />
            <span />
          </span>

          <span>
            smart<span className="brand-light">slide</span>
          </span>
        </a>

        <div className="topbar-center">VISUAL LEARNING WORKSPACE</div>

        <div className="lesson-status">
          <span className="status-dot" />
          DEMO LESSON
        </div>
      </header>
  
      <main className={audioMode ? 'workspace audio-mode' : 'workspace'}>
        <section
          className="reading-panel"
          ref={readingPanelRef}
        >
          <div className="lesson-intro">
            <div className="topic-tag">{lesson.subject}</div>

            <h1>{lesson.title}</h1>

            <p>
              Follow the explanation. Watch the visual change as
              each idea comes into focus.
            </p>

            <div className="lesson-meta">
              <span>{lesson.steps.length} learning steps</span>
              <span className="meta-divider" />
              <span>About {lesson.estimatedMinutes} minutes</span>
            </div>


            <form
              className="generate-form"
              onSubmit={handleGenerateLesson}
            >
              <label htmlFor="lesson-topic">
                What do you want to understand?
              </label>
            
              <div className="generate-controls">
                <input
                  id="lesson-topic"
                  type="text"
                  value={topicInput}
                  onChange={(event) => setTopicInput(event.target.value)}
                  placeholder="e.g. How does backpropagation work?"
                  minLength={2}
                  maxLength={180}
                  required
                />
            
                <button type="submit" disabled={isGenerating}>
                  {isGenerating ? 'Generating…' : 'Generate lesson'}
                </button>
              </div>
            
              <p className="generate-hint">
                Your lesson will include an explanation and synchronized
                visuals.
              </p>
            
              {generationError && (
                <p className="generation-error" role="alert">
                  {generationError}
                </p>
              )}
            </form>
          </div>

          {lesson.steps.map((step, index) => (
            <article
              key={step.id}
              className={`lesson-step ${
                activeStep === index ? 'step-active' : ''
              }`}
              data-step={index}
            >
              <div className="step-heading">
                <span className="step-number">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span className="step-label">{step.label}</span>
              </div>

              <h2>{step.title}</h2>

              {step.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={`${step.id}-paragraph-${paragraphIndex}`}>
                  {paragraph}
                </p>
              ))}

              <div className="takeaway">
                <span className="takeaway-icon">✳</span>

                <div>
                  <span className="takeaway-label">KEY IDEA</span>
                  <p>{step.takeaway}</p>
                </div>
              </div>

              {index < lesson.steps.length - 1 && (
                <button
                  className="next-step"
                  onClick={() => jumpToStep(index + 1)}
                >
                  Continue to{' '}
                  {lesson.steps[index + 1].label.toLowerCase()}
                  <span aria-hidden="true">↓</span>
                </button>
              )}
            </article>
          ))}

          <div className="lesson-end">
            <span>END OF DEMO LESSON</span>
            <button onClick={() => jumpToStep(0)}>
              Back to the beginning ↑
            </button>
          </div>
        </section>

        <SmartVisual
          lesson={lesson}
          activeStep={activeStep}
          audioMode={audioMode}
          isSpeaking={isSpeaking}
          isPaused={isPaused}
          audioError={audioError}
          onToggleAudioMode={handleToggleAudioMode}
          onPlayAudio={handlePlayAudio}
          onPauseAudio={handlePauseAudio}
          onStopAudio={handleStopAudio}
        />
      </main>
    </div>
  )
}

export default App
