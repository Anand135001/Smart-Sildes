
import { useEffect, useRef, useState } from 'react'
import './App.css'

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

type Point = {
  id: string
  x: number
  y: number
}

function NetworkDiagram() {
  const input: Point[] = [
    { id: 'i1', x: 76, y: 126 },
    { id: 'i2', x: 76, y: 218 },
  ]

  const hiddenA: Point[] = [
    { id: 'a1', x: 216, y: 96 },
    { id: 'a2', x: 216, y: 172 },
    { id: 'a3', x: 216, y: 248 },
  ]

  const hiddenB: Point[] = [
    { id: 'b1', x: 342, y: 96 },
    { id: 'b2', x: 342, y: 172 },
    { id: 'b3', x: 342, y: 248 },
  ]

  const output: Point[] = [{ id: 'o1', x: 478, y: 172 }]
  const layers = [input, hiddenA, hiddenB, output]

  const connections = layers
    .slice(0, -1)
    .flatMap((layer, index) =>
      layer.flatMap((from) =>
        layers[index + 1].map((to) => ({ from, to })),
      ),
    )

  return (
    <svg
      className="diagram"
      viewBox="0 0 540 320"
      role="img"
      aria-label="Neural network with input, hidden, and output layers"
    >
      {connections.map(({ from, to }) => (
        <line
          key={`${from.id}-${to.id}`}
          className="network-connection"
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
        />
      ))}

      {layers.map((layer, layerIndex) =>
        layer.map((point) => (
          <g key={point.id}>
            <circle
              cx={point.x}
              cy={point.y}
              r={layerIndex === 3 ? 17 : 13}
              className={
                layerIndex === 3
                  ? 'neuron neuron-output'
                  : 'neuron'
              }
            />
          </g>
        )),
      )}

      <g className="diagram-label">
        <text x="76" y="293" textAnchor="middle">
          INPUT
        </text>
        <text x="279" y="293" textAnchor="middle">
          HIDDEN LAYERS
        </text>
        <text x="478" y="293" textAnchor="middle">
          OUTPUT
        </text>
      </g>
    </svg>
  )
}

function WeightsDiagram() {
  const inputYs = [83, 143, 203, 263]

  return (
    <svg
      className="diagram"
      viewBox="0 0 540 340"
      role="img"
      aria-label="Weighted inputs and bias combine inside a neuron"
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L6,3 z" fill="#93A3B8" />
        </marker>
      </defs>

      {inputYs.map((y, index) => (
        <g key={y}>
          <line
            x1="95"
            y1={y}
            x2="260"
            y2="174"
            className="signal-line"
            style={{ animationDelay: `${index * 0.2}s` }}
            markerEnd="url(#arrowhead)"
          />
          <circle cx="75" cy={y} r="17" className="neuron" />
          <text x="42" y={y + 4} className="small-label">
            x{index + 1}
          </text>
          <text
            x="166"
            y={y - 7}
            className="weight-label"
            transform={`rotate(${(174 - y) * 0.1}, 166, ${y - 7})`}
          >
            w{index + 1}
          </text>
        </g>
      ))}

      <line
        x1="276"
        y1="91"
        x2="276"
        y2="147"
        className="bias-line"
        markerEnd="url(#arrowhead)"
      />
      <circle cx="276" cy="70" r="19" className="bias-node" />
      <text
        x="276"
        y="74"
        textAnchor="middle"
        className="node-letter"
      >
        b
      </text>
      <text x="306" y="73" className="small-label">
        Bias
      </text>

      <circle cx="276" cy="177" r="32" className="sum-node" />
      <text
        x="276"
        y="187"
        textAnchor="middle"
        className="sum-symbol"
      >
        Σ
      </text>

      <line
        x1="310"
        y1="177"
        x2="366"
        y2="177"
        className="network-connection"
        markerEnd="url(#arrowhead)"
      />

      <rect
        x="370"
        y="148"
        width="78"
        height="58"
        rx="12"
        className="activation-node"
      />
      <text
        x="409"
        y="183"
        textAnchor="middle"
        className="node-letter"
      >
        f(x)
      </text>
      <text x="409" y="228" textAnchor="middle" className="small-label">
        Activation
      </text>

      <line
        x1="448"
        y1="177"
        x2="491"
        y2="177"
        className="network-connection"
        markerEnd="url(#arrowhead)"
      />
      <text x="493" y="160" className="small-label">
        Output
      </text>
    </svg>
  )
}

function ActivationDiagram() {
  return (
    <svg
      className="diagram"
      viewBox="0 0 540 340"
      role="img"
      aria-label="Sigmoid activation curve"
    >
      <line x1="75" y1="270" x2="480" y2="270" className="chart-axis" />
      <line x1="270" y1="295" x2="270" y2="38" className="chart-axis" />

      <line x1="75" y1="90" x2="480" y2="90" className="chart-grid" />
      <line x1="75" y1="180" x2="480" y2="180" className="chart-grid" />

      <path
        d="M 88 252 C 160 252, 195 247, 224 217 S 258 152, 270 135 S 310 70, 360 65 S 435 65, 470 65"
        className="activation-curve"
      />

      <circle cx="270" cy="135" r="8" className="chart-point" />
      <line
        x1="270"
        y1="135"
        x2="270"
        y2="270"
        className="chart-guide"
      />

      <g className="chart-label">
        <text x="476" y="291" textAnchor="end">
          Input value
        </text>
        <text x="282" y="31">
          Output
        </text>
        <text x="58" y="94" textAnchor="end">
          1
        </text>
        <text x="58" y="184" textAnchor="end">
          0.5
        </text>
        <text x="58" y="274" textAnchor="end">
          0
        </text>
        <text x="282" y="126">
          Example
        </text>
      </g>
    </svg>
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

        {activeStep === 0 && <NetworkDiagram />}
        {activeStep === 1 && <WeightsDiagram />}
        {activeStep === 2 && <ActivationDiagram />}

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
