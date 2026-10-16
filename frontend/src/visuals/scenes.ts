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