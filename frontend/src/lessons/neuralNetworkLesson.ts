
import type { SmartLesson } from '../visuals/types'
import {
  activationScene,
  networkScene,
  weightsScene,
} from '../visuals/scenes'

export const neuralNetworkLesson: SmartLesson = {
  id: 'neural-network-basics',
  title: 'Understand neural networks, visually.',
  subject: 'COMPUTER SCIENCE · NEURAL NETWORKS',
  estimatedMinutes: 3,

  steps: [
    {
      id: 'architecture',
      label: 'THE ARCHITECTURE',
      title: 'A neural network is a set of connected layers.',
      paragraphs: [
        'Think of a neural network as a group of simple units called neurons. Each neuron receives information and passes a result to another neuron.',
        'The input layer receives the information. Hidden layers process it. The output layer produces the final result.',
      ],
      takeaway:
        'A layer is a group of neurons at the same stage of processing.',
      scene: networkScene,
      actions: [
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
    },

    {
      id: 'weights-and-biases',
      label: 'WEIGHTS & BIASES',
      title: 'Connections control how information travels.',
      paragraphs: [
        'Each connection has a weight. A weight determines how strongly an input contributes to the next neuron.',
        'A neuron also has a bias. The neuron combines its weighted inputs with this bias before calculating its result.',
      ],
      takeaway:
        'Weights change the influence of inputs. Bias shifts the combined value.',
      scene: weightsScene,
      actions: [
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
    },

    {
      id: 'activation',
      label: 'ACTIVATION',
      title: 'An activation function transforms the result.',
      paragraphs: [
        'After combining its inputs and bias, a neuron applies a mathematical function called an activation function.',
        'This transformation helps a neural network learn complex patterns instead of behaving like one simple linear calculation.',
      ],
      takeaway:
        'The activation function transforms the neuron’s combined input into its output.',
      scene: activationScene,
      actions: [
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
    },
  ],
}
