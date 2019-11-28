import React, {
  ChangeEvent,
  FocusEventHandler,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react'
import { library } from '@fortawesome/fontawesome-svg-core'
import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { LaunchButton } from './LaunchButton'
import { Bounds } from 'openfin/_v2/shapes'
import { ButtonContainer, IconTitle, Input, INPUT_HEIGHT } from './styles'
import { animateCurrentWindowSize, closeCurrentWindow, getCurrentWindowBounds } from './windowUtils';
import { DetectIntentResponse } from 'dialogflow';
import { take, tap, timeout } from 'rxjs/operators';
import { useServiceStub } from '../SpotlightRoute/context';
import { getInlineSuggestionsComponent, Response } from './spotlight';
import { initialState, launcherReducer } from './launcherReducer';
import { usePlatform } from 'rt-platforms';
import Measure, { ContentRect } from 'react-measure'
import { handleIntent } from '../SpotlightRoute/handleIntent';

export const Launcher: React.FC = () => {
  const [{ request, response, contacting, isTyping, isSearchVisible }, dispatch] = useReducer(launcherReducer, initialState)
  const [initialBounds, setInitialBounds] = useState<Bounds>()
  const searchInput = useRef<HTMLInputElement>(null)
  const platform = usePlatform()

  const serviceStub = useServiceStub()

  useEffect(() => {
    getCurrentWindowBounds().then(setInitialBounds)
  }, [])

  useEffect(() => {
    if (!request) {
      return
    }
    if (!serviceStub) {
      console.error(`Error creating subscription - serviceStub was not defined`)
      return
    }
    console.log('sending request', request)
    dispatch({ type: 'SEND_REQUEST' })

    const subscription = serviceStub
      .createRequestResponseOperation<DetectIntentResponse[], string>(
        'nlp-vlad',
        'getNlpIntent',
        request,
      )
      .pipe(
        tap(() => console.info(JSON.stringify(request))),
        timeout(10000),
        take(1),
      )
      .subscribe(
        response => {
          dispatch({ type: 'RECEIVE_RESPONSE', response: response[0] })
        },
        (err: any) => {
          console.error(err)
          dispatch({ type: 'RECEIVE_RESPONSE' })
        },
      )

    return () => {
      subscription.unsubscribe()
    }
  }, [serviceStub, request])

  const handleOnKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(e => {
    if (e.key === 'Enter' && response) {
      handleIntent(response, platform)
    }
  }, [response, platform])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dispatch({ type: 'RECEIVE_RESPONSE' })
        if (!isSearchVisible || !initialBounds) {
          return
        }
        dispatch({ type: 'UPDATE_SEARCH_VISIBILITY', visible: false })
        animateCurrentWindowSize(initialBounds)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [initialBounds, isSearchVisible])

  const showSearch = useCallback(
    // need async, but useCallback does not allow async, so using IIFE
    () => (async () => {
      if (!initialBounds) {
        return
      }
      if (!isSearchVisible) {
        await animateCurrentWindowSize({ ...initialBounds, height: initialBounds.height + INPUT_HEIGHT })
        dispatch({ type: 'UPDATE_SEARCH_VISIBILITY', visible: true })
      }
      searchInput.current && searchInput.current.focus()
    })(),
    [initialBounds, isSearchVisible]
  );

  const handleResponseSizeChange = (contentRect: ContentRect) => {
    if (!initialBounds) {
      return
    }
    animateCurrentWindowSize({
      ...initialBounds,
      height: initialBounds.height + INPUT_HEIGHT + 17 + (contentRect.bounds ? contentRect.bounds.height : 0)
    })
  }

  const handleFocus: FocusEventHandler<HTMLInputElement> = useCallback(e => {
    e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
  }, [])

  const throttledSendRequest = useCallback(
    throttle(
      (requestString: string) => dispatch({ type: 'SET_REQUEST', request: requestString }),
      250,
      {
        leading: false,
        trailing: true
      }
    ),
    []
  )

  const debouncedStopTyping = useCallback(
    debounce(
      () => dispatch({ type: 'STOP_TYPING' }),
      350,
      {
        leading: false,
        trailing: true
      }
    ),
    []
  )

  /**
   * Sets start typing immediately and sets stop typing in timeout -
   * this is to make sure that isTyping state is staying true for a bit after
   * finishing typing (controls animation)
   **/
  const startTyping = useCallback(
    () => {
      dispatch({ type: 'START_TYPING' });
      debouncedStopTyping()
    },
    []
  )

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      startTyping()
      const requestString = e.target.value
      throttledSendRequest(requestString)
    },
    [throttledSendRequest, startTyping]
  )

  const inlineSuggestions = response && getInlineSuggestionsComponent(response, platform)

  return (
    <>
      <Input
        onChange={handleChange}
        ref={searchInput}
        onFocus={handleFocus}
        onKeyDown={handleOnKeyDown}/>

      {response && (
        <Measure
          bounds
          onResize={handleResponseSizeChange}>
          {
            ({ measureRef }) => (
              <Response ref={measureRef}>
                {inlineSuggestions}
              </Response>
            )
          }
        </Measure>
      )}
    </>
  )
}
