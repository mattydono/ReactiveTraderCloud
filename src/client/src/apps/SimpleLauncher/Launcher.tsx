import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { appConfigs } from './applicationConfigurations'
import { LaunchButton } from './LaunchButton'
import { LogoIcon } from 'rt-components'
import { ThemeStorageSwitch } from 'rt-theme'
import { open } from './tools'
import { getOpenFinPlatform } from 'rt-platforms'
import { Bounds } from 'openfin/_v2/shapes'
import SearchIcon from './icons/searchIcon'
import {
  LauncherGlobalStyle,
  ButtonContainer,
  IconTitle,
  RootContainer,
  ThemeSwitchContainer,
  HorizontalContainer,
  Input,
  LogoContainer,
  SearchResult, INPUT_HEIGHT, SEARCH_RESULT_HEIGHT
} from './launcherStyles'
import { animateCurrentWindowSize, getCurrentWindowBounds } from './windowUtils';

library.add(faSignOutAlt)

const exitHandler = async () => {
  const { OpenFin } = await getOpenFinPlatform()
  const platform = new OpenFin()
  return platform.window.close()
}

const LauncherExit = () => (
  <ButtonContainer key="exit">
    <LaunchButton onClick={exitHandler}>
      <FontAwesomeIcon icon="sign-out-alt"/>
      <IconTitle>Exit</IconTitle>
    </LaunchButton>
  </ButtonContainer>
)

const SEARCH_RESULTS = [
  'Random Phrase and Idiom Generator',
  'There will be times when',
  'you may need',
  'more than a random',
  'word for what you want',
  'to accomplish, and this',
  'free online tool can help',
  'The use of this tool',
  'is quite simple. All',
  'you need to do is indicate',
  'the number of random phrases you',
  'like to be displayed, and',
  'then hit the "Generate Random',
]

function getRandomSearchResults(count: number) {
  const result = []
  for (let i = 0; i < count; i++) {
    const index = Math.round(Math.random() * (SEARCH_RESULTS.length - 1))
    result.push(SEARCH_RESULTS[index])
  }
  return result
}

export const Launcher: React.FC = () => {
  const [initialBounds, setInitialBounds] = useState<Bounds>()
  const [dummySearchResults, setDummySearchResults] = useState<ReadonlyArray<string>>([])
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const searchInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getCurrentWindowBounds().then(setInitialBounds)
  }, [])

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

  const onInputChange = (event: ChangeEvent) => {
    const symbolsCount = (event.target as HTMLInputElement).value
    if (!isSearchVisible || !initialBounds) {
      return
    }
    const searchResultCount = symbolsCount.length === 0 ? 0 : Math.round(Math.random() * 10)
    setDummySearchResults(getRandomSearchResults(searchResultCount))
    animateCurrentWindowSize(
      {
        ...initialBounds,
        height: initialBounds.height + INPUT_HEIGHT + searchResultCount * SEARCH_RESULT_HEIGHT,
      },
      75,
    )
  }

  const Spotlight = () => (
    <ButtonContainer>
      <LaunchButton onClick={showSearch}>{SearchIcon}</LaunchButton>
    </ButtonContainer>
  )

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

      <Input ref={searchInput} onChange={onInputChange}/>

      {dummySearchResults.map(searchResult => (
        <SearchResult>{searchResult}</SearchResult>
      ))}
    </RootContainer>
  )
}
