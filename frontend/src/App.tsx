
import { useEffect, useRef, useState } from 'react'
import './App.css'
import { SmartSlideRenderer }  from './components/SmartSlideRenderer'
import { networkScene, activationScene, weightsScene } from './visuals/scenes'
import type { VisualAction } from './visuals/types'

type LessonStep = {
  id: number
  label: string
  title: string
  paragraphs: string[]
  takeaway: string
}

const lessonSteps: LessonStep[] = [
  {
    id: 0,
    label: 'THE ARCHITECTURE',
    title: 'A neural network is a set of connected layers.',
    paragraphs: [
      'Think of a neural network as a group of simple units called neurons. Each neuron receives information and passes a result to another neuron.',
      'The input layer receives the information. Hidden layers process it. The output layer produces the final result.',
    ],
    takeaway:
      'A layer is a group of neurons at the same stage of processing.',
  },
  {
    id: 1,
    label: 'WEIGHTS & BIASES',
    title: 'Connections control how information travels.',
    paragraphs: [
      'Each connection has a weight. A weight determines how strongly an input contributes to the next neuron.',
      'A neuron also has a bias. The neuron combines its weighted inputs with this bias before calculating its result.',
    ],
    takeaway:
      'Weights change the influence of inputs. Bias shifts the combined value.',
  },
  {
    id: 2,
    label: 'ACTIVATION',
    title: 'An activation function transforms the result.',
    paragraphs: [
      'After combining its inputs and bias, a neuron applies a mathematical function called an activation function.',
      'This transformation helps a neural network learn complex patterns instead of behaving like one simple linear calculation.',
    ],
    takeaway:
      "The activation function transforms the neuron's combined input into its output.",
  },
]

const visualActionsByStep: VisualAction[][] = [
  [
    {
      type: 'focus',
      target: 'input-1',
      label: 'Input neuron',
    },
    {
      type: 'animate_signal',
      from: 'input-1',
      to: 'hidden-a1',
      durationMs: 1400,
    },
  ],
  [
    {
      type: 'highlight',
      target: 'sum-node',
      color: '#f59e0b',
    },
    {
      type: 'animate_signal',
      from: 'input-1',
      to: 'sum-node',
      durationMs: 1400,
    },
    {
      type: 'focus',
      target: 'sum-node',
      label: 'Combine inputs',
    },
  ],
  [
    {
      type: 'highlight',
      target: 'sigmoid-curve',
      color: '#f59e0b',
    },
    {
      type: 'focus',
      target: 'example-point',
      label: 'Example output',
    },
  ],
]

function NetworkDiagram({actions}: {actions: VisualAction[]}){
  return (
    <SmartSlideRenderer
      scene={networkScene}
      actions={actions}
    />
  )
}

function WeightsDiagram({actions}: {actions: VisualAction[]}){
  return(
    <SmartSlideRenderer 
      scene={weightsScene}
      actions={actions}
    />
  ) 
}

function ActivationDiagram({actions}: {actions: VisualAction[]}){
  return(
    <SmartSlideRenderer 
      scene={activationScene}
      actions={actions} 
    />
  )
}

function SmartVisual({ activeStep }: { activeStep: number }) {
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
          <span>STEP 0{activeStep + 1}</span>
          <span>{lessonSteps[activeStep].label}</span>
        </div>

        {activeStep === 0 && <NetworkDiagram actions={visualActionsByStep[0]} />}
        {activeStep === 1 && <WeightsDiagram actions={visualActionsByStep[1]}/>}
        {activeStep === 2 && <ActivationDiagram actions={visualActionsByStep[2]}/>}

        <div className="visual-hint">
          <span className="hint-dot" />
          Visual updates as you move through the lesson
        </div>
      </div>

      <div className="visual-footer">
        <span>LESSON PROGRESS</span>
        <div className="progress-dots">
          {lessonSteps.map((step, index) => (
            <span
              key={step.id}
              className={index === activeStep ? 'progress-dot active' : 'progress-dot'}
            />
          ))}
        </div>
        <span>0{activeStep + 1} / 0{lessonSteps.length}</span>
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
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

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

    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
          <span>smart<span className="brand-light">slide</span></span>
        </a>

        <div className="topbar-center">VISUAL LEARNING WORKSPACE</div>

        <div className="lesson-status">
          <span className="status-dot" />
          DEMO LESSON
        </div>
      </header>

      <main className="workspace">
        <section className="reading-panel" ref={readingPanelRef}>
          <div className="lesson-intro">
            <div className="topic-tag">COMPUTER SCIENCE · NEURAL NETWORKS</div>
            <h1>Understand neural networks, visually.</h1>
            <p>
              Follow the explanation. Watch the visual change as each idea
              comes into focus.
            </p>
            <div className="lesson-meta">
              <span>3 learning steps</span>
              <span className="meta-divider" />
              <span>About 3 minutes</span>
            </div>
          </div>

          {lessonSteps.map((step, index) => (
            <article
              key={step.id}
              className={`lesson-step ${activeStep === index ? 'step-active' : ''}`}
              data-step={index}
            >
              <div className="step-heading">
                <span className="step-number">0{index + 1}</span>
                <span className="step-label">{step.label}</span>
              </div>

              <h2>{step.title}</h2>

              {step.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
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
                  Continue to {lessonSteps[index + 1].label.toLowerCase()}
                  <span aria-hidden="true">↓</span>
                </button>
              )}
            </article>
          ))}

          <div className="lesson-end">
            <span>END OF DEMO LESSON</span>
            <button onClick={() => jumpToStep(0)}>Back to the beginning ↑</button>
          </div>
        </section>

        <SmartVisual activeStep={activeStep} />
      </main>
    </div>
  )
}

export default App
