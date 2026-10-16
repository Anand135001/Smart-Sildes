
function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function validOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string'
}

function validOptionalNumber(value: unknown): boolean {
  return value === undefined || isNumber(value)
}

function validOptionalBoolean(value: unknown): boolean {
  return value === undefined || typeof value === 'boolean'
}

function validateElement(
  value: unknown,
  path: string,
  errors: string[],
): boolean {
  if (!isRecord(value)) {
    errors.push(`${path} must be an object.`)
    return false
  }

  let valid = true

  const fail = (message: string) => {
    errors.push(`${path} ${message}`)
    valid = false
  }

  if (!isText(value.id)) fail('needs a non-empty id.')

  const checkNumber = (key: string) => {
    if (!isNumber(value[key])) {
      fail(`needs a numeric ${key}.`)
    }
  }

  const checkOptionalAppearance = () => {
    for (const key of ['fill', 'stroke']) {
      if (!validOptionalString(value[key])) {
        fail(`${key} must be a string.`)
      }
    }

    if (!validOptionalNumber(value.strokeWidth)) {
      fail('strokeWidth must be a number.')
    }

    if (!validOptionalBoolean(value.highlighted)) {
      fail('highlighted must be a boolean.')
    }
  }

  switch (value.type) {
    case 'circle':
      checkNumber('x')
      checkNumber('y')
      checkNumber('r')
      checkOptionalAppearance()

      if (isNumber(value.r) && value.r <= 0) {
        fail('must have a positive radius.')
      }
      break

    case 'rect':
      checkNumber('x')
      checkNumber('y')
      checkNumber('width')
      checkNumber('height')
      checkOptionalAppearance()

      if (!validOptionalNumber(value.rx)) {
        fail('rx must be a number.')
      }

      if (
        (isNumber(value.width) && value.width <= 0) ||
        (isNumber(value.height) && value.height <= 0)
      ) {
        fail('must have positive dimensions.')
      }
      break

    case 'line':
    case 'arrow':
      for (const key of ['x1', 'y1', 'x2', 'y2']) {
        checkNumber(key)
      }

      if (!validOptionalString(value.stroke)) {
        fail('stroke must be a string.')
      }

      if (!validOptionalNumber(value.strokeWidth)) {
        fail('strokeWidth must be a number.')
      }

      if (
        !validOptionalBoolean(value.dashed) ||
        !validOptionalBoolean(value.animated)
      ) {
        fail('dashed and animated must be booleans.')
      }
      break

    case 'polyline':
      if (!Array.isArray(value.points) || value.points.length < 2) {
        fail('needs at least two points.')
      } else {
        value.points.forEach((point, index) => {
          if (
            !isRecord(point) ||
            !isNumber(point.x) ||
            !isNumber(point.y)
          ) {
            fail(`point ${index} needs numeric x and y coordinates.`)
          }
        })
      }

      if (!validOptionalString(value.stroke)) {
        fail('stroke must be a string.')
      }

      if (!validOptionalString(value.fill)) {
        fail('fill must be a string.')
      }

      if (!validOptionalNumber(value.strokeWidth)) {
        fail('strokeWidth must be a number.')
      }

      if (
        !validOptionalBoolean(value.dashed) ||
        !validOptionalBoolean(value.animated)
      ) {
        fail('dashed and animated must be booleans.')
      }
      break

    case 'text':
      checkNumber('x')
      checkNumber('y')

      if (!isText(value.content)) {
        fail('needs non-empty text content.')
      }

      if (
        value.anchor !== undefined &&
        !['start', 'middle', 'end'].includes(String(value.anchor))
      ) {
        fail('has an invalid text anchor.')
      }

      if (
        !validOptionalString(value.fill) ||
        !validOptionalNumber(value.fontSize) ||
        !validOptionalNumber(value.weight) ||
        !validOptionalNumber(value.letterSpacing)
      ) {
        fail('has invalid text styling.')
      }
      break

    default:
      fail('has an unsupported element type.')
  }

  return valid
}

function validateScene(
  value: unknown,
  path: string,
  errors: string[],
): Set<string> {
  const elementIds = new Set<string>()

  if (!isRecord(value)) {
    errors.push(`${path} must be a scene object.`)
    return elementIds
  }

  if (!isText(value.id)) errors.push(`${path}.id is required.`)
  if (!isText(value.title)) errors.push(`${path}.title is required.`)

  if (!isNumber(value.width) || value.width <= 0) {
    errors.push(`${path}.width must be positive.`)
  }

  if (!isNumber(value.height) || value.height <= 0) {
    errors.push(`${path}.height must be positive.`)
  }

  if (!Array.isArray(value.elements)) {
    errors.push(`${path}.elements must be an array.`)
    return elementIds
  }

  value.elements.forEach((element, index) => {
    const elementPath = `${path}.elements[${index}]`

    validateElement(element, elementPath, errors)

    if (!isRecord(element) || !isText(element.id)) return

    if (elementIds.has(element.id)) {
      errors.push(`${elementPath} duplicates id "${element.id}".`)
    }

    elementIds.add(element.id)
  })

  return elementIds
}

function validateActions(
  value: unknown,
  elementIds: Set<string>,
  path: string,
  errors: string[],
): void {
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array.`)
    return
  }

  const checkTarget = (target: unknown, field: string) => {
    if (!isText(target)) {
      errors.push(`${path}.${field} must be a non-empty id.`)
    } else if (!elementIds.has(target)) {
      errors.push(`${path}.${field} references missing element "${target}".`)
    }
  }

  value.forEach((action, index) => {
    const actionPath = `${path}[${index}]`

    if (!isRecord(action)) {
      errors.push(`${actionPath} must be an object.`)
      return
    }

    switch (action.type) {
      case 'highlight':
      case 'focus':
        checkTarget(action.target, 'target')

        if (!validOptionalString(action.color)) {
          errors.push(`${actionPath}.color must be a string.`)
        }

        if (
          action.type === 'focus' &&
          !validOptionalString(action.label)
        ) {
          errors.push(`${actionPath}.label must be a string.`)
        }
        break

      case 'animate_signal':
        checkTarget(action.from, 'from')
        checkTarget(action.to, 'to')

        if (!validOptionalString(action.color)) {
          errors.push(`${actionPath}.color must be a string.`)
        }

        if (
          action.durationMs !== undefined &&
          (!isNumber(action.durationMs) || action.durationMs <= 0)
        ) {
          errors.push(`${actionPath}.durationMs must be positive.`)
        }
        break

      default:
        errors.push(`${actionPath} has an unsupported action type.`)
    }
  })
}

export function validateSmartLesson(value: unknown): string[] {
  const errors: string[] = []

  if (!isRecord(value)) {
    return ['Lesson must be an object.']
  }

  if (!isText(value.id)) errors.push('Lesson id is required.')
  if (!isText(value.title)) errors.push('Lesson title is required.')
  if (!isText(value.subject)) errors.push('Lesson subject is required.')

  if (
    !isNumber(value.estimatedMinutes) ||
    value.estimatedMinutes <= 0
  ) {
    errors.push('estimatedMinutes must be positive.')
  }

  if (!Array.isArray(value.steps) || value.steps.length === 0) {
    errors.push('Lesson must contain at least one step.')
    return errors
  }

  const stepIds = new Set<string>()

  value.steps.forEach((step, index) => {
    const path = `steps[${index}]`

    if (!isRecord(step)) {
      errors.push(`${path} must be an object.`)
      return
    }

    for (const key of ['id', 'label', 'title', 'takeaway']) {
      if (!isText(step[key])) {
        errors.push(`${path}.${key} is required.`)
      }
    }

    if (isText(step.id)) {
      if (stepIds.has(step.id)) {
        errors.push(`${path}.id duplicates "${step.id}".`)
      }
      stepIds.add(step.id)
    }

    if (
      !Array.isArray(step.paragraphs) ||
      step.paragraphs.length === 0 ||
      !step.paragraphs.every(isText)
    ) {
      errors.push(`${path}.paragraphs must contain non-empty text.`)
    }

    const elementIds = validateScene(
      step.scene,
      `${path}.scene`,
      errors,
    )

    validateActions(
      step.actions,
      elementIds,
      `${path}.actions`,
      errors,
    )
  })

  return errors
}
