
import 'dotenv/config'

import cors from 'cors'
import express from 'express'
import OpenAI from 'openai'
import { SmartLessonSchema } from './schema.js'

const app = express()

const PORT = Number(process.env.PORT ?? 3001)
const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173'

app.use(cors({ origin: FRONTEND_ORIGIN }))
app.use(express.json({ limit: '20kb' }))

const topicRequest = (
  value: unknown,
): { topic: string } | null => {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('topic' in value) ||
    typeof value.topic !== 'string'
  ) {
    return null
  }

  const topic = value.topic.trim()

  if (topic.length < 2 || topic.length > 180) {
    return null
  }

  return { topic }
}

app.get('/api/health', (_req, res) => {
  const configured = Boolean(
    process.env.NEBIUS_API_KEY?.trim() &&
    process.env.NEBIUS_MODEL?.trim(),
  )

  res.json({
    status: 'ok',
    provider: 'nebius',
    configured,
  })
})

app.post('/api/lessons', async (req, res) => {
  const input = topicRequest(req.body)

  if (!input) {
    res.status(400).json({
      error: 'Provide a topic between 2 and 180 characters.',
    })
    return
  }

  const apiKey = process.env.NEBIUS_API_KEY?.trim()
  const model = process.env.NEBIUS_MODEL?.trim()

  if (!apiKey || !model) {
    res.status(503).json({
      error:
        'Nebius is not configured. Set NEBIUS_API_KEY and NEBIUS_MODEL in backend/.env.',
    })
    return
  }

  const client = new OpenAI({
    baseURL: 'https://api.tokenfactory.nebius.com/v1/',
    apiKey,
    timeout: 60_000,
    maxRetries: 1,
  })

  const systemPrompt = `
You generate educational lessons for Smart Slide.

Return one JSON object only, with this exact top-level structure:
{
  "id": "lesson-id",
  "title": "Lesson title",
  "subject": "SUBJECT · TOPIC",
  "estimatedMinutes": 3,
  "steps": [
    {
      "id": "step-id",
      "label": "SHORT LABEL",
      "title": "Plain-language explanation",
      "paragraphs": ["Explanation paragraph"],
      "takeaway": "One-sentence key idea",
      "scene": {
        "id": "scene-id",
        "title": "Visual title",
        "width": 540,
        "height": 340,
        "elements": []
      },
      "actions": []
    }
  ]
}

Create 3 or 4 useful steps. Use simple English suitable for a learner
who is not a native English speaker.

Every scene must be drawable using only these element types:
- circle: id, type, x, y, r, optional fill, stroke, strokeWidth
- rect: id, type, x, y, width, height, optional rx, fill, stroke, strokeWidth
- line or arrow: id, type, x1, y1, x2, y2, optional stroke, strokeWidth, dashed, animated
- polyline: id, type, points (at least 2 objects with x and y), optional stroke, strokeWidth, fill, dashed, animated
- text: id, type, x, y, content, optional fill, fontSize, weight, anchor, letterSpacing

Use only hexadecimal colors such as #3B82F6.
Keep all visual coordinates within the scene's width and height.
Give every element a unique id within its scene.

Allowed actions:
- {"type":"highlight","target":"existing-element-id","color":"#F59E0B"}
- {"type":"focus","target":"existing-element-id","label":"Short label","color":"#F59E0B"}
- {"type":"animate_signal","from":"existing-element-id","to":"existing-element-id","color":"#F59E0B","durationMs":1200}

Every action must reference IDs present in that step's scene.
Do not include markdown fences, explanatory prose outside JSON, HTML,
SVG markup, scripts, or unsupported element/action types.
Use compact scenes that are easy to understand. Visuals should illustrate
the concept rather than merely decorate the slide.
`

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Create a visual lesson about: ${input.topic}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 6000,
    })

    const message = completion.choices[0]?.message

    if (message?.refusal) {
      res.status(422).json({
        error: 'The selected model declined to generate this lesson.',
      })
      return
    }

    if (!message?.content) {
      res.status(502).json({
        error: 'The model returned an empty response.',
      })
      return
    }

    let generated: unknown

    try {
      generated = JSON.parse(message.content)
    } catch {
      res.status(502).json({
        error: 'The model response was not valid JSON. Please retry.',
      })
      return
    }

    const validation = SmartLessonSchema.safeParse(generated)

    if (!validation.success) {
      console.error(
        'Generated lesson failed validation:',
        validation.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      )

      res.status(502).json({
        error:
          'The generated lesson did not match the Smart Slide format. Please retry.',
      })
      return
    }

    res.json({ lesson: validation.data })
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error('Nebius API error:', {
        status: error.status,
        message: error.message,
      })
    } else {
      console.error('Lesson generation failed:', error)
    }

    res.status(502).json({
      error:
        'Lesson generation failed. Check the model ID, API access, and available credits.',
    })
  }
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Smart Slide backend running at http://localhost:${PORT}`)
})
