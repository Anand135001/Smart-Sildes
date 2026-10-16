
import { useId } from 'react'
import type { VisualAction, VisualElement, VisualScene } from '../visuals/types'

type SmartSlideRendererProps = {
  scene: VisualScene
  actions?: VisualAction[]
}

type Point = {
  x: number
  y: number
}

function getElementAnchor(element: VisualElement): Point | null {
  switch (element.type) {
    case 'circle':
      return { x: element.x, y: element.y }

    case 'rect':
      return {
        x: element.x + element.width / 2,
        y: element.y + element.height / 2,
      }

    case 'text':
      return { x: element.x, y: element.y }

    case 'line':
    case 'arrow':
      return {
        x: (element.x1 + element.x2) / 2,
        y: (element.y1 + element.y2) / 2,
      }

    case 'polyline': {
      const point = element.points[
        Math.floor(element.points.length / 2)
      ]

      return point ? { x: point.x, y: point.y } : null
    }
  }
}

export function SmartSlideRenderer({
  scene,
  actions = [],
}: SmartSlideRendererProps) {
  const uniqueId = useId().replace(/:/g, '')
  const arrowMarkerId = `smart-slide-arrow-${uniqueId}`

  const elementsById = new Map(
    scene.elements.map((element) => [element.id, element]),
  )

  const highlightColors = new Map<string, string>()

  for (const action of actions) {
    if (action.type === 'highlight') {
      highlightColors.set(action.target, action.color ?? '#f59e0b')
    }
  }

  const focusActions = actions.filter(
    (action): action is Extract<VisualAction, { type: 'focus' }> =>
      action.type === 'focus',
  )

  const signalActions = actions.filter(
    (
      action,
    ): action is Extract<VisualAction, { type: 'animate_signal' }> =>
      action.type === 'animate_signal',
  )

  return (
    <svg
      className="diagram visual-engine"
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      role="img"
      aria-label={scene.title}
    >
      <defs>
        <marker
          id={arrowMarkerId}
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L6,3 z" fill="#7f8da3" />
        </marker>
      </defs>

      {scene.elements.map((element) => {
        const highlightColor = highlightColors.get(element.id)
        const isHighlighted = highlightColors.has(element.id)

        switch (element.type) {
          case 'circle':
            return (
              <circle
                key={element.id}
                id={element.id}
                className={
                  isHighlighted || element.highlighted
                    ? 'visual-node is-highlighted'
                    : 'visual-node'
                }
                cx={element.x}
                cy={element.y}
                r={element.r}
                fill={element.fill ?? '#4d91ee'}
                stroke={highlightColor ?? element.stroke ?? '#2a70d1'}
                strokeWidth={
                  isHighlighted ? 3 : element.strokeWidth ?? 1.5
                }
              />
            )

          case 'rect':
            return (
              <rect
                key={element.id}
                id={element.id}
                className={
                  isHighlighted || element.highlighted
                    ? 'visual-node is-highlighted'
                    : 'visual-node'
                }
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                rx={element.rx ?? 8}
                fill={element.fill ?? '#e8efff'}
                stroke={highlightColor ?? element.stroke ?? '#8ca9e7'}
                strokeWidth={
                  isHighlighted ? 3 : element.strokeWidth ?? 1.5
                }
              />
            )

          case 'line':
          case 'arrow':
            return (
              <line
                key={element.id}
                id={element.id}
                className={[
                  'visual-line',
                  element.type === 'arrow' ? 'visual-arrow' : '',
                  element.animated ? 'is-animated' : '',
                  isHighlighted ? 'is-highlighted' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                x1={element.x1}
                y1={element.y1}
                x2={element.x2}
                y2={element.y2}
                stroke={
                  highlightColor ?? element.stroke ?? '#c7cfdb'
                }
                strokeWidth={
                  isHighlighted ? 3.5 : element.strokeWidth ?? 1.6
                }
                strokeDasharray={
                  element.dashed ? '5 5' : undefined
                }
                markerEnd={
                  element.type === 'arrow'
                    ? `url(#${arrowMarkerId})`
                    : undefined
                }
              />
            )

          case 'polyline':
            return (
              <polyline
                key={element.id}
                id={element.id}
                className={[
                  'visual-polyline',
                  element.animated ? 'is-animated' : '',
                  isHighlighted ? 'is-highlighted' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                points={element.points
                  .map((point) => `${point.x},${point.y}`)
                  .join(' ')}
                fill={element.fill ?? 'none'}
                stroke={
                  highlightColor ?? element.stroke ?? '#4b86e5'
                }
                strokeWidth={
                  isHighlighted ? 5 : element.strokeWidth ?? 3
                }
                strokeDasharray={
                  element.dashed ? '5 5' : undefined
                }
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )

          case 'text':
            return (
              <text
                key={element.id}
                id={element.id}
                className="visual-label"
                x={element.x}
                y={element.y}
                fill={element.fill ?? '#334155'}
                fontSize={element.fontSize ?? 12}
                fontWeight={element.weight ?? 500}
                textAnchor={element.anchor ?? 'start'}
                letterSpacing={element.letterSpacing}
              >
                {element.content}
              </text>
            )
        }
      })}

      {signalActions.map((action, index) => {
        const fromElement = elementsById.get(action.from)
        const toElement = elementsById.get(action.to)

        const from = fromElement ? getElementAnchor(fromElement) : null
        const to = toElement ? getElementAnchor(toElement) : null

        if (!from || !to) return null

        return (
          <line
            key={`signal-${index}-${action.from}-${action.to}`}
            className="visual-action-signal"
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={action.color ?? '#f59e0b'}
            style={{
              animationDuration: `${action.durationMs ?? 1400}ms`,
            }}
          />
        )
      })}

      {focusActions.map((action, index) => {
        const element = elementsById.get(action.target)
        const point = element ? getElementAnchor(element) : null

        if (!point) return null

        const color = action.color ?? '#f59e0b'

        return (
          <g key={`focus-${index}-${action.target}`}>
            <circle
              className="visual-focus-ring"
              cx={point.x}
              cy={point.y}
              r={23}
              stroke={color}
            />

            <path
              className="visual-cursor"
              d={`M ${point.x + 10} ${point.y - 18}
                  L ${point.x + 10} ${point.y + 1}
                  L ${point.x + 15} ${point.y - 4}
                  L ${point.x + 20} ${point.y + 7}
                  L ${point.x + 24} ${point.y + 5}
                  L ${point.x + 19} ${point.y - 6}
                  L ${point.x + 26} ${point.y - 6} Z`}
              stroke={color}
            />

            {action.label && (
              <text
                className="visual-focus-label"
                x={point.x + 28}
                y={point.y - 24}
                fill={color}
              >
                {action.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
