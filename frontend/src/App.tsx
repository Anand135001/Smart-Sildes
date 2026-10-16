
import { useEffect, useRef, useState } from 'react'
import './App.css'
import { SmartSlideRenderer } from './components/SmartSlideRenderer'
import { neuralNetworkLesson } from './lessons/neuralNetworkLesson'
import { validateSmartLesson } from './lessons/validateLesson'

const lessonSteps = neuralNetworkLesson.steps

const lessonErrors = validateSmartLesson(neuralNetworkLesson)

if (import.meta.env.DEV && lessonErrors.length > 0) {
  console.error('Invalid Smart Slide lesson:', lessonErrors)
}

function SmartVisual({ activeStep }: { activeStep: number }) {
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
  const [activeStep, setActiveStep] = useState(0)
  const readingPanelRef = useRef<HTMLDivElement>(null)

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
  }, [])

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

        <div className="topbar-center">
          VISUAL LEARNING WORKSPACE
        </div>

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
            <div className="topic-tag">
              {neuralNetworkLesson.subject}
            </div>

            <h1>{neuralNetworkLesson.title}</h1>

            <p>
              Follow the explanation. Watch the visual change as
              each idea comes into focus.
            </p>

            <div className="lesson-meta">
              <span>{lessonSteps.length} learning steps</span>
              <span className="meta-divider" />
              <span>
                About {neuralNetworkLesson.estimatedMinutes} minutes
              </span>
            </div>
          </div>

          {lessonSteps.map((step, index) => (
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

              {index < lessonSteps.length - 1 && (
                <button
                  className="next-step"
                  onClick={() => jumpToStep(index + 1)}
                >
                  Continue to{' '}
                  {lessonSteps[index + 1].label.toLowerCase()}
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

        <SmartVisual activeStep={activeStep} />
      </main>
    </div>
  )
}

export default App
