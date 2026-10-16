export type VisualElement =
  | {
      id: string
      type: 'circle'
      x: number
      y: number
      r: number
      fill?: string
      stroke?: string
      strokeWidth?: number
      highlighted?: boolean
    }
  | {
      id: string
      type: 'rect'
      x: number
      y: number
      width: number
      height: number
      rx?: number
      fill?: string
      stroke?: string
      strokeWidth?: number
      highlighted?: boolean
    }
  | {
      id: string
      type: 'line' | 'arrow'
      x1: number
      y1: number
      x2: number
      y2: number
      stroke?: string
      strokeWidth?: number
      dashed?: boolean
      animated?: boolean
    }
  | {
      id: string
      type: 'text'
      x: number
      y: number
      content: string
      fill?: string
      fontSize?: number
      weight?: number
      anchor?: 'start' | 'middle' | 'end'
      letterSpacing?: number
    }
  | {
      id: string
      type: 'polyline'
      points: Array<{ x: number; y: number }>
      stroke?: string
      strokeWidth?: number
      fill?: string
      dashed?: boolean
      animated?: boolean
    }

export type VisualScene = {
  id: string
  title: string
  width: number
  height: number
  elements: VisualElement[]
}