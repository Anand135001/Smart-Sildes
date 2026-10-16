import type {
  VisualElement,
  VisualScene,
} from './types'

type Point = {
  id: string
  x: number
  y: number
}

const input: Point[] = [
  { id: 'input-1', x: 76, y: 126 },
  { id: 'input-2', x: 76, y: 218 },
]

const hiddenA: Point[] = [
  { id: 'hidden-a1', x: 216, y: 96 },
  { id: 'hidden-a2', x: 216, y: 172 },
  { id: 'hidden-a3', x: 216, y: 248 },
]

const hiddenB: Point[] = [
  { id: 'hidden-b1', x: 342, y: 96 },
  { id: 'hidden-b2', x: 342, y: 172 },
  { id: 'hidden-b3', x: 342, y: 248 },
]

const output: Point[] = [
  { id: 'output-1', x: 478, y: 172 },
]

const layers = [input, hiddenA, hiddenB, output]

const connections = layers
  .slice(0, -1)
  .flatMap((layer, index) =>
    layer.flatMap((from) =>
      layers[index + 1].map((to) => ({ from, to })),
    ),
  )

const connectionElements: VisualElement[] = connections.map(
  ({ from, to }) => ({
    id: `${from.id}-to-${to.id}`,
    type: 'line' as const,
    x1: from.x,
    y1: from.y,
    x2: to.x,
    y2: to.y,
    stroke: '#c7cfdb',
    strokeWidth: 1.6,
  }),
)

const neuronElements: VisualElement[] = layers.flatMap(
  (layer, layerIndex) =>
    layer.map((point) => {
      const isOutput = layerIndex === layers.length - 1

      return {
        id: point.id,
        type: 'circle' as const,
        x: point.x,
        y: point.y,
        r: isOutput ? 17 : 13,
        fill: isOutput ? '#dca45a' : '#4d91ee',
        stroke: isOutput ? '#b77b2e' : '#2a70d1',
        strokeWidth: 1.5,
      }
    }),
)

const labelElements: VisualElement[] = [
  {
    id: 'label-input',
    type: 'text',
    x: 76,
    y: 293,
    content: 'INPUT',
    anchor: 'middle',
    fill: '#8490a2',
    fontSize: 10,
    weight: 650,
    letterSpacing: 1,
  },
  {
    id: 'label-hidden',
    type: 'text',
    x: 279,
    y: 293,
    content: 'HIDDEN LAYERS',
    anchor: 'middle',
    fill: '#8490a2',
    fontSize: 10,
    weight: 650,
    letterSpacing: 1,
  },
  {
    id: 'label-output',
    type: 'text',
    x: 478,
    y: 293,
    content: 'OUTPUT',
    anchor: 'middle',
    fill: '#8490a2',
    fontSize: 10,
    weight: 650,
    letterSpacing: 1,
  },
]

export const networkScene: VisualScene = {
  id: 'neural-network-architecture',
  title: 'Neural network architecture',
  width: 540,
  height: 320,
  elements: [
    ...connectionElements,
    ...neuronElements,
    ...labelElements,
  ],
}


const inputYs = [83, 143, 203, 263]

const weightElements: VisualElement[] = inputYs.flatMap(
  (y, index): VisualElement[] => [
    {
      id: `input-${index + 1}-connection`,
      type: 'arrow',
      x1: 95,
      y1: y,
      x2: 248,
      y2: 177,
      stroke: '#a8bfe4',
      strokeWidth: 1.6,
      animated: true,
    },
    {
      id: `input-${index + 1}`,
      type: 'circle',
      x: 75,
      y,
      r: 17,
      fill: '#4d91ee',
      stroke: '#2a70d1',
    },
    {
      id: `input-${index + 1}-label`,
      type: 'text',
      x: 43,
      y: y + 4,
      content: `x${index + 1}`,
      fontSize: 11,
      fill: '#7b8799',
    },
    {
      id: `weight-${index + 1}-label`,
      type: 'text',
      x: 158,
      y: y - 5,
      content: `w${index + 1}`,
      fontSize: 11,
      fill: '#476ca7',
      weight: 650,
    },
  ],
)

export const weightsScene: VisualScene = {
  id: 'neuron-weights-and-bias',
  title: 'Weighted inputs and bias',
  width: 540,
  height: 340,
  elements: [
    ...weightElements,
    {
      id: 'bias-connection',
      type: 'arrow',
      x1: 276,
      y1: 91,
      x2: 276,
      y2: 143,
      stroke: '#cb726a',
    },
    {
      id: 'bias-node',
      type: 'circle',
      x: 276,
      y: 70,
      r: 19,
      fill: '#de756e',
      stroke: '#c15c55',
    },
    {
      id: 'bias-symbol',
      type: 'text',
      x: 276,
      y: 75,
      content: 'b',
      anchor: 'middle',
      fill: '#ffffff',
      fontSize: 14,
      weight: 650,
    },
    {
      id: 'bias-label',
      type: 'text',
      x: 306,
      y: 73,
      content: 'Bias',
      fontSize: 11,
    },
    {
      id: 'sum-node',
      type: 'circle',
      x: 276,
      y: 177,
      r: 32,
      fill: '#e7f4e9',
      stroke: '#76aa82',
      strokeWidth: 2,
    },
    {
      id: 'sum-symbol',
      type: 'text',
      x: 276,
      y: 188,
      content: 'Σ',
      anchor: 'middle',
      fill: '#3d8851',
      fontSize: 34,
    },
    {
      id: 'sum-to-activation',
      type: 'arrow',
      x1: 310,
      y1: 177,
      x2: 366,
      y2: 177,
    },
    {
      id: 'activation-box',
      type: 'rect',
      x: 370,
      y: 148,
      width: 78,
      height: 58,
      rx: 12,
      fill: '#e8efff',
      stroke: '#8ca9e7',
    },
    {
      id: 'activation-symbol',
      type: 'text',
      x: 409,
      y: 183,
      content: 'f(x)',
      anchor: 'middle',
      fontSize: 16,
      weight: 650,
    },
    {
      id: 'activation-label',
      type: 'text',
      x: 409,
      y: 228,
      content: 'Activation',
      anchor: 'middle',
      fontSize: 11,
    },
    {
      id: 'output-connection',
      type: 'arrow',
      x1: 448,
      y1: 177,
      x2: 491,
      y2: 177,
    },
    {
      id: 'output-label',
      type: 'text',
      x: 493,
      y: 160,
      content: 'Output',
      fontSize: 11,
    },
  ],
}

export const activationScene: VisualScene = {
  id: 'sigmoid-activation-function',
  title: 'Sigmoid activation function',
  width: 540,
  height: 340,
  elements: [
    {
      id: 'horizontal-axis',
      type: 'line',
      x1: 75,
      y1: 270,
      x2: 480,
      y2: 270,
      stroke: '#aab5c5',
      strokeWidth: 1.5,
    },
    {
      id: 'vertical-axis',
      type: 'line',
      x1: 270,
      y1: 295,
      x2: 270,
      y2: 38,
      stroke: '#aab5c5',
      strokeWidth: 1.5,
    },
    {
      id: 'grid-upper',
      type: 'line',
      x1: 75,
      y1: 90,
      x2: 480,
      y2: 90,
      stroke: '#e3e8f0',
      dashed: true,
    },
    {
      id: 'grid-middle',
      type: 'line',
      x1: 75,
      y1: 180,
      x2: 480,
      y2: 180,
      stroke: '#e3e8f0',
      dashed: true,
    },
    {
      id: 'sigmoid-curve',
      type: 'polyline',
      points: [
        { x: 88, y: 252 },
        { x: 110, y: 251 },
        { x: 140, y: 249 },
        { x: 170, y: 244 },
        { x: 200, y: 230 },
        { x: 225, y: 205 },
        { x: 245, y: 170 },
        { x: 260, y: 145 },
        { x: 270, y: 135 },
        { x: 280, y: 125 },
        { x: 300, y: 100 },
        { x: 325, y: 78 },
        { x: 355, y: 68 },
        { x: 390, y: 65 },
        { x: 430, y: 65 },
        { x: 470, y: 65 },
      ],
      stroke: '#4b86e5',
      strokeWidth: 4,
    },
    {
      id: 'example-guide',
      type: 'line',
      x1: 270,
      y1: 135,
      x2: 270,
      y2: 270,
      stroke: '#cbd5e1',
      dashed: true,
    },
    {
      id: 'example-point',
      type: 'circle',
      x: 270,
      y: 135,
      r: 7,
      fill: '#ffffff',
      stroke: '#4b86e5',
      strokeWidth: 3,
    },
    {
      id: 'axis-input-label',
      type: 'text',
      x: 476,
      y: 291,
      content: 'Input value',
      anchor: 'end',
      fontSize: 11,
    },
    {
      id: 'axis-output-label',
      type: 'text',
      x: 282,
      y: 31,
      content: 'Output',
      fontSize: 11,
    },
    {
      id: 'tick-one',
      type: 'text',
      x: 58,
      y: 94,
      content: '1',
      anchor: 'end',
      fontSize: 11,
    },
    {
      id: 'tick-half',
      type: 'text',
      x: 58,
      y: 184,
      content: '0.5',
      anchor: 'end',
      fontSize: 11,
    },
    {
      id: 'tick-zero',
      type: 'text',
      x: 58,
      y: 274,
      content: '0',
      anchor: 'end',
      fontSize: 11,
    },
    {
      id: 'example-label',
      type: 'text',
      x: 282,
      y: 126,
      content: 'Example',
      fontSize: 11,
    },
  ],
}
