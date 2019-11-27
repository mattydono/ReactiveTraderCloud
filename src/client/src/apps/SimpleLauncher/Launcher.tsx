import React, { ChangeEvent, FocusEventHandler, useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { library } from '@fortawesome/fontawesome-svg-core'
import throttle from 'lodash/throttle'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { LaunchButton } from './LaunchButton'
import { LauncherApps } from './LauncherApps'
import { AdaptiveLoader } from 'rt-components'
import { ThemeStorageSwitch } from 'rt-theme'
import { Bounds } from 'openfin/_v2/shapes'
import SearchIcon from './icons/searchIcon'
import {
  ButtonContainer,
  HorizontalContainer,
  IconTitle,
  Input,
  INPUT_HEIGHT,
  LauncherGlobalStyle,
  LogoContainer,
  RootContainer,
  ThemeSwitchContainer
} from './styles'
import { animateCurrentWindowSize, closeCurrentWindow, getCurrentWindowBounds } from './windowUtils';
import { DetectIntentResponse } from 'dialogflow';
import { take, tap, timeout } from 'rxjs/operators';
import { useServiceStub } from '../SpotlightRoute/context';
import { getInlineSuggestionsComponent, Response, Suggestion } from './spotlight';
import { initialState, launcherReducer } from './launcherReducer';
import { Platform, usePlatform } from 'rt-platforms';
import Measure, { ContentRect } from 'react-measure'
import { mapIntent } from '../SpotlightRoute/responseMapper';
import { handleIntent } from '../SpotlightRoute/handleIntent';

library.add(faSignOutAlt)

const LauncherExit = () => (
  <ButtonContainer key="exit">
    <LaunchButton onClick={closeCurrentWindow}>
      <FontAwesomeIcon icon="sign-out-alt"/>
      <IconTitle>Exit</IconTitle>
    </LaunchButton>
  </ButtonContainer>
)

function getNonDirectoryAppsComponent(response: DetectIntentResponse, platform: Platform) {
  const intent = mapIntent(response)
  return <Suggestion onClick={() => handleIntent(response, platform)}>{intent}</Suggestion>
}

export const Launcher: React.FC = () => {
  const [{ request, response, contacting }, dispatch] = useReducer(launcherReducer, initialState)
  const [initialBounds, setInitialBounds] = useState<Bounds>()
  const [isSearchVisible, setIsSearchVisible] = useState(false)
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
    console.log('seinding request', request)
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
    // Only trigger nlp call when contacting goes to 'true'.
    // The request variable is updated on every input change, hence why we remove it from the list of deps below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/*contacting, */serviceStub, request])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dispatch({ type: 'RECEIVE_RESPONSE' })
        if (!isSearchVisible || !initialBounds) {
          return
        }
        // TODO: move all state manipulation to reducer
        setIsSearchVisible(false)
        animateCurrentWindowSize(initialBounds)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [initialBounds, isSearchVisible])

  const showSearch = async () => {
    if (!initialBounds) {
      return
    }
    if (!isSearchVisible) {
      await animateCurrentWindowSize({ ...initialBounds, height: initialBounds.height + INPUT_HEIGHT })
      setIsSearchVisible(true)
    }
    searchInput.current && searchInput.current.focus()
  }

  const handleResponseSizeChange = (contentRect: ContentRect) => {
    if (!initialBounds) {
      return
    }
    animateCurrentWindowSize({
      ...initialBounds,
      height: initialBounds.height + INPUT_HEIGHT + (contentRect.bounds ? contentRect.bounds.height : 0)
    })
    // setIsSearchVisible(true)
  }

  const handleFocus: FocusEventHandler<HTMLInputElement> = e => {
    e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
  }

  const Spotlight = () => (
    <ButtonContainer>
      <LaunchButton onClick={showSearch}>{SearchIcon}</LaunchButton>
    </ButtonContainer>
  )

  // const handleChange: ChangeEventHandler<HTMLInputElement> = e => {
  //   const requestString = e.target.value;
  //   dispatch({ type: 'SET_REQUEST', request: requestString })
  // }

  const throttledSendRequest = useCallback(
    throttle(
      (requestString: string) => {
        dispatch({ type: 'SET_REQUEST', request: requestString })
      },
      250,
      {
        leading: false,
        trailing: true
      }
    ),
    []
  )

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const requestString = e.target.value
      return throttledSendRequest(requestString)
    },
    []
  )

  const inlineSuggestions = response && getInlineSuggestionsComponent(response, platform)
  const nonDirectoryAppSuggestions = response && getNonDirectoryAppsComponent(response, platform)

  const searchControls = <>
    <Input
      onChange={handleChange}
      ref={searchInput}
      onFocus={handleFocus}/>

    {!!response && (
      <Measure
        bounds
        onResize={handleResponseSizeChange}
      >
        {
          ({ measureRef }) => (
            <Response ref={measureRef}>
              {nonDirectoryAppSuggestions}
              {inlineSuggestions}
            </Response>
          )
        }
      </Measure>
    )}
  </>;

  return (
    <RootContainer>
      <LauncherGlobalStyle/>
      <HorizontalContainer>
        <LogoContainer>
          <AdaptiveLoader size={24} speed={contacting ? 0.8 : 0} seperation={1.5} type="secondary"/>
          {/*<LogoIcon width={1.3} height={1.3}/>*/}
        </LogoContainer>
        <Spotlight/>
        <LauncherApps/>
        <LauncherExit/>
        <ThemeSwitchContainer>
          <ThemeStorageSwitch/>
        </ThemeSwitchContainer>
      </HorizontalContainer>

      {isSearchVisible && searchControls}

    </RootContainer>
  )
}
