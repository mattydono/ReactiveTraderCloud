import { DetectIntentResponse } from 'dialogflow'

type State = {
  request: string
  contacting: boolean
  isTyping: boolean
  response?: DetectIntentResponse
}

type Action =
  {
    type: 'SET_REQUEST'
    request: string
  }
  |
  {
    type: 'CLEAR_RESPONSE'
  }
  |
  {
    type: 'SEND_REQUEST'
  }
  |
  {
    type: 'RECEIVE_RESPONSE'
    response?: DetectIntentResponse
  }
  |
  {
    type: 'STARTED_TYPING'
  }
  |
  {
    type: 'STOPPED_TYPING'
  }

export const initialState: State = {
  request: '',
  response: undefined,
  contacting: false,
  isTyping: false
}

export function launcherReducer(currentState: State, action: Action): State {
  switch (action.type) {
    case 'SET_REQUEST':
      return {
        ...currentState,
        request: action.request,
      }

    case 'SEND_REQUEST':
      return {
        ...currentState,
        contacting: true
      }

    case 'CLEAR_RESPONSE':
      return {
        ...currentState,
        response: undefined
      }

    case 'RECEIVE_RESPONSE':
      return {
        ...currentState,
        contacting: false,
        response: action.response,
      }

    case 'STARTED_TYPING':
      return {
        ...currentState,
        isTyping: true
      }

    case 'STOPPED_TYPING':
      return {
        ...currentState,
        isTyping: false
      }

    default:
      return currentState
  }
}
