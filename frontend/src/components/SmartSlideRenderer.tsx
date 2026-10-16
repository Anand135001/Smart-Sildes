import { useId } from 'react'
import type { VisualScene } from '../visuals/types'

type SmartSlideRendererProps = {
  scene: VisualScene
}

export function SmartSlideRenderer({
  scene,
}: SmartSlideRendererProps) {
  const uniqueId = useId().replace(/:/g, '')
  const arrowMarkerId = `smart-slide-arrow-${uniqueId}`

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
          <path
            d="M0,0 L0,6 L6,3 z"
            fill="#7f8da3"
          />
        </marker>
      </defs>

      {scene.elements.map((element) => {
        switch (element.type) {
          
          case 'polyline':
            return (
              <polyline
                key={element.id}
                id={element.id}
                className={[
                  'visual-polyline',
                  element.animated ? 'is-animated' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                points={element.points
                  .map((point) => `${point.x},${point.y}`)
                  .join(' ')}
                fill={element.fill ?? 'none'}
                stroke={element.stroke ?? '#4b86e5'}
                strokeWidth={element.strokeWidth ?? 3}
                strokeDasharray={
                  element.dashed ? '5 5' : undefined
                }
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )
    
          case 'circle':
            return (
              <circle
                key={element.id}
                id={element.id}
                className={
                  element.highlighted
                    ? 'visual-node is-highlighted'
                    : 'visual-node'
                }
                cx={element.x}
                cy={element.y}
                r={element.r}
                fill={element.fill ?? '#4d91ee'}
                stroke={element.stroke ?? '#2a70d1'}
                strokeWidth={element.strokeWidth ?? 1.5}
              />
            )

          case 'rect':
            return (
              <rect
                key={element.id}
                id={element.id}
                className={
                  element.highlighted
                    ? 'visual-node is-highlighted'
                    : 'visual-node'
                }
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                rx={element.rx ?? 8}
                fill={element.fill ?? '#e8efff'}
                stroke={element.stroke ?? '#8ca9e7'}
                strokeWidth={element.strokeWidth ?? 1.5}
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
                ]
                  .filter(Boolean)
                  .join(' ')}
                x1={element.x1}
                y1={element.y1}
                x2={element.x2}
                y2={element.y2}
                stroke={element.stroke ?? '#c7cfdb'}
                strokeWidth={element.strokeWidth ?? 1.6}
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

          default:
            return null
        }
      })}
    </svg>
  )
}