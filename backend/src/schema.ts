
import { z } from 'zod'

const id = z.string().trim().min(1).max(80)
const label = z.string().trim().min(1).max(300)
const coordinate = z.number().finite().min(-1000).max(3000)
const color = z.string().regex(/^#[0-9a-fA-F]{3,8}$/)

const circle = z.object({
  id,
  type: z.literal('circle'),
  x: coordinate,
  y: coordinate,
  r: z.number().positive().max(500),
  fill: color.optional(),
  stroke: color.optional(),
  strokeWidth: z.number().positive().max(20).optional(),
  highlighted: z.boolean().optional(),
}).strict()

const rect = z.object({
  id,
  type: z.literal('rect'),
  x: coordinate,
  y: coordinate,
  width: z.number().positive().max(2000),
  height: z.number().positive().max(2000),
  rx: z.number().min(0).max(500).optional(),
  fill: color.optional(),
  stroke: color.optional(),
  strokeWidth: z.number().positive().max(20).optional(),
  highlighted: z.boolean().optional(),
}).strict()

const line = z.object({
  id,
  type: z.literal('line'),
  x1: coordinate,
  y1: coordinate,
  x2: coordinate,
  y2: coordinate,
  stroke: color.optional(),
  strokeWidth: z.number().positive().max(20).optional(),
  dashed: z.boolean().optional(),
  animated: z.boolean().optional(),
}).strict()

const arrow = z.object({
  id,
  type: z.literal('arrow'),
  x1: coordinate,
  y1: coordinate,
  x2: coordinate,
  y2: coordinate,
  stroke: color.optional(),
  strokeWidth: z.number().positive().max(20).optional(),
  dashed: z.boolean().optional(),
  animated: z.boolean().optional(),
}).strict()

const polyline = z.object({
  id,
  type: z.literal('polyline'),
  points: z.array(
    z.object({
      x: coordinate,
      y: coordinate,
    }).strict(),
  ).min(2).max(100),
  stroke: color.optional(),
  strokeWidth: z.number().positive().max(20).optional(),
  fill: color.optional(),
  dashed: z.boolean().optional(),
  animated: z.boolean().optional(),
}).strict()

const text = z.object({
  id,
  type: z.literal('text'),
  x: coordinate,
  y: coordinate,
  content: label,
  fill: color.optional(),
  fontSize: z.number().positive().max(100).optional(),
  weight: z.number().min(100).max(900).optional(),
  anchor: z.enum(['start', 'middle', 'end']).optional(),
  letterSpacing: z.number().min(0).max(20).optional(),
}).strict()

const visualElement = z.discriminatedUnion('type', [
  circle,
  rect,
  line,
  arrow,
  polyline,
  text,
])

const scene = z.object({
  id,
  title: label,
  width: z.number().positive().max(2000),
  height: z.number().positive().max(2000),
  elements: z.array(visualElement).min(1).max(250),
}).strict()

const highlightAction = z.object({
  type: z.literal('highlight'),
  target: id,
  color: color.optional(),
}).strict()

const focusAction = z.object({
  type: z.literal('focus'),
  target: id,
  label: z.string().max(100).optional(),
  color: color.optional(),
}).strict()

const signalAction = z.object({
  type: z.literal('animate_signal'),
  from: id,
  to: id,
  color: color.optional(),
  durationMs: z.number().positive().max(10000).optional(),
}).strict()

const visualAction = z.discriminatedUnion('type', [
  highlightAction,
  focusAction,
  signalAction,
])

const lessonStep = z.object({
  id,
  label,
  title: label,
  paragraphs: z.array(label).min(1).max(5),
  takeaway: label,
  scene,
  actions: z.array(visualAction).max(30),
}).strict()

const lessonBase = z.object({
  id,
  title: label,
  subject: label,
  estimatedMinutes: z.number().int().positive().max(120),
  steps: z.array(lessonStep).min(2).max(8),
}).strict()

export const SmartLessonSchema = lessonBase.superRefine(
  (lesson, ctx) => {
    const stepIds = new Set<string>()

    lesson.steps.forEach((step, stepIndex) => {
      if (stepIds.has(step.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['steps', stepIndex, 'id'],
          message: `Duplicate step ID: ${step.id}`,
        })
      }

      stepIds.add(step.id)

      const elementIds = new Set<string>()

      step.scene.elements.forEach((element, elementIndex) => {
        if (elementIds.has(element.id)) {
          ctx.addIssue({
            code: 'custom',
            path: [
              'steps',
              stepIndex,
              'scene',
              'elements',
              elementIndex,
              'id',
            ],
            message: `Duplicate element ID: ${element.id}`,
          })
        }

        elementIds.add(element.id)
      })

      step.actions.forEach((action, actionIndex) => {
        const references =
          action.type === 'animate_signal'
            ? [action.from, action.to]
            : [action.target]

        for (const target of references) {
          if (!elementIds.has(target)) {
            ctx.addIssue({
              code: 'custom',
              path: ['steps', stepIndex, 'actions', actionIndex],
              message: `Action references missing element: ${target}`,
            })
          }
        }
      })
    })
  },
)

export type ValidSmartLesson = z.infer<typeof SmartLessonSchema>
