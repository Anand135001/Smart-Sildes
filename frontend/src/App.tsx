
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
}: {
  lesson: SmartLesson
  activeStep: number
}) {
  const lessonSteps = lesson.steps
  const step = lessonSteps[activeStep] ?? lessonSteps[0]

  return (
    <aside className="visual-panel">
      <div className="visual-topbar">
        <div>
          <span className="eyebrow">SMART SLIDE</span>
          <h2>Visual explanation</h2>
        </div>

        <span className="live-indicator">
          <span />
          LIVE
        </span>
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
    <div className="app-shell">
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

      <main className="workspace">
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

        <SmartVisual lesson={lesson} activeStep={activeStep} />
      </main>
    </div>
  )
}

export default App
