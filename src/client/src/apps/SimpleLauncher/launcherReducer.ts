import { DetectIntentResponse } from 'dialogflow'

type State = {
  request: string
  contacting: boolean
  isTyping: boolean
  isSearchVisible: boolean
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
    type: 'START_TYPING'
  }
  |
  {
    type: 'STOP_TYPING'
  } |
  {
    type: 'UPDATE_SEARCH_VISIBILITY',
    visible: boolean
  }

export const initialState: State = {
  request: '',
  response: undefined,
  contacting: false,
  isTyping: false,
  isSearchVisible: false
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

    case 'START_TYPING':
      return {
        ...currentState,
        isTyping: true
      }

    case 'STOP_TYPING':
      return {
        ...currentState,
        isTyping: false
      }

    case 'UPDATE_SEARCH_VISIBILITY':
      return {
        ...currentState,
        isSearchVisible: action.visible
      }

    default:
      return currentState
  }
}
