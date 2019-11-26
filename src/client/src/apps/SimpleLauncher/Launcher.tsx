import React, {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { appConfigs } from './applicationConfigurations'
import { LaunchButton } from './LaunchButton'
import { LogoIcon } from 'rt-components'
import { ThemeStorageSwitch } from 'rt-theme'
import { open } from './tools'
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
  SEARCH_RESULT_HEIGHT,
  ThemeSwitchContainer
} from './launcherStyles'
import { animateCurrentWindowSize, closeCurrentWindow, getCurrentWindowBounds } from './windowUtils';
import { DetectIntentResponse } from 'dialogflow';
import { take, tap, timeout } from 'rxjs/operators';
import { useServiceStub } from '../SpotlightRoute/context';
import { getInlineSuggestionsComponent, Response, ResponseLoader } from './spotlight';
import { initialState, spotlightSearchInputReducer } from '../SpotlightRoute/spotlightSearchInputReducer';
import { usePlatform } from 'rt-platforms';

library.add(faSignOutAlt)

const LauncherExit = () => (
  <ButtonContainer key="exit">
    <LaunchButton onClick={closeCurrentWindow}>
      <FontAwesomeIcon icon="sign-out-alt"/>
      <IconTitle>Exit</IconTitle>
    </LaunchButton>
  </ButtonContainer>
)

export const Launcher: React.FC = () => {
  const [{ request, response, contacting }, dispatch] = useReducer(spotlightSearchInputReducer, initialState)
  const [initialBounds, setInitialBounds] = useState<Bounds>()
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const searchInput = useRef<HTMLInputElement>(null)
  const platform = usePlatform()

  const serviceStub = useServiceStub()

  useEffect(() => {
    getCurrentWindowBounds().then(setInitialBounds)
  }, [])

  useEffect(() => {
    if (!contacting) {
      return
    }
    if (!serviceStub) {
      console.error(`Error creating subscription - serviceStub was not defined`)
      return
    }
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
  }, [contacting, serviceStub])

  const handleOnKeyDown: KeyboardEventHandler<HTMLInputElement> = e => {
    switch (e.key) {
      case 'Enter':
        if (!isSearchVisible || !initialBounds) {
          console.warn(`Search is not visible, ignoring search request`);
          return
        }

        const value = e.currentTarget.value
        dispatch({ type: 'SEND_REQUEST', request: value })

        animateCurrentWindowSize(
          {
            ...initialBounds,
            height: initialBounds.height + INPUT_HEIGHT + 10 * SEARCH_RESULT_HEIGHT,
          },
          75,
        )

        break
    }
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!isSearchVisible || !initialBounds) {
          return
        }
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

  const handleFocus: FocusEventHandler<HTMLInputElement> = e => {
    e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
  }

  const Spotlight = () => (
    <ButtonContainer>
      <LaunchButton onClick={showSearch}>{SearchIcon}</LaunchButton>
    </ButtonContainer>
  )

  const handleChange: ChangeEventHandler<HTMLInputElement> = e => {
    dispatch({ type: 'SET_REQUEST', request: e.target.value })
  }

  const inlineSuggestions = response && getInlineSuggestionsComponent(response, platform)

  return (
    <RootContainer>
      <LauncherGlobalStyle/>
      <HorizontalContainer>
        <LogoContainer>
          <LogoIcon width={1.3} height={1.3}/>
        </LogoContainer>
        <Spotlight/>
        {appConfigs.map(app => (
          <ButtonContainer key={app.name}>
            <LaunchButton onClick={() => open(app)}>
              {app.icon}
              <IconTitle>{app.name}</IconTitle>
            </LaunchButton>
          </ButtonContainer>
        ))}
        <LauncherExit/>
        <ThemeSwitchContainer>
          <ThemeStorageSwitch/>
        </ThemeSwitchContainer>
      </HorizontalContainer>

      <Input
        onChange={handleChange}
        ref={searchInput}
        onFocus={handleFocus}
        onKeyDown={handleOnKeyDown}/>

      <Response>
        {
          contacting ?
            <ResponseLoader/> :
            response === null ?
              ('Oops. Something went wrong')
              :
              (
                <>
                  {inlineSuggestions}
                </>
              )
        }
      </Response>

    </RootContainer>
  )
}
