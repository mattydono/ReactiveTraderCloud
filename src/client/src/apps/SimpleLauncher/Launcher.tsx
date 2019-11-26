import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { rules } from 'rt-styleguide'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { appConfigs } from './applicationConfigurations'
import { LaunchButton } from './LaunchButton'
import { LogoIcon } from 'rt-components'
import { createGlobalStyle } from 'styled-components'
import { styled, ThemeStorageSwitch } from 'rt-theme'
import { open } from './tools'
import { getOpenFinPlatform } from 'rt-platforms'
import { Bounds } from 'openfin/_v2/shapes'
import SearchIcon from './icons/searchIcon'

library.add(faSignOutAlt)

const INPUT_HEIGHT = 40
const SEARCH_RESULT_HEIGHT = 30

const exitHandler = async () => {
  const { OpenFin } = await getOpenFinPlatform()
  const platform = new OpenFin()
  return platform.window.close()
}

const LauncherGlobalStyle = createGlobalStyle`
:root, body {
  @media all {
    font-size: 16px;
    -webkit-app-region: drag;
  }
}
`

const LauncherExit = () => (
  <ButtonContainer key="exit">
    <LaunchButton onClick={exitHandler}>
      <FontAwesomeIcon icon="sign-out-alt" />
      <IconTitle>Exit</IconTitle>
    </LaunchButton>
  </ButtonContainer>
)

async function animateWindowSize(bounds: Bounds, duration: number = 200) {
  const window = await fin.Window.getCurrent()
  return window.animate(
    {
      size: {
        duration,
        height: bounds.height,
        width: bounds.width,
      },
    },
    {
      tween: 'ease-in-out',
      interrupt: true,
    },
  )
}

// async function changeWindowHeight(bounds: Bounds) {
//   const window = await fin.Window.getCurrent()
//   return window.resizeTo(
//     bounds.width,
//     bounds.height,
//     'top-left'
//   )
// }

const getWindowBounds = async () => {
  const window = await fin.Window.getCurrent()
  return window.getBounds()
}

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
    getWindowBounds().then(setInitialBounds)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!isSearchVisible || !initialBounds) {
          return
        }
        setIsSearchVisible(false)
        animateWindowSize(initialBounds)
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
      await animateWindowSize({ ...initialBounds, height: initialBounds.height + INPUT_HEIGHT })
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
    animateWindowSize(
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
      <LauncherGlobalStyle />
      <HorizontalContainer>
        <LogoContainer>
          <LogoIcon width={1.3} height={1.3} />
        </LogoContainer>
        <Spotlight />
        {appConfigs.map(app => (
          <ButtonContainer key={app.name}>
            <LaunchButton onClick={() => open(app)}>
              {app.icon}
              <IconTitle>{app.name}</IconTitle>
            </LaunchButton>
          </ButtonContainer>
        ))}
        <LauncherExit />
        <ThemeSwitchContainer>
          <ThemeStorageSwitch />
        </ThemeSwitchContainer>
      </HorizontalContainer>

      <Input ref={searchInput} onChange={onInputChange} />

      {dummySearchResults.map(searchResult => (
        <SearchResult>{searchResult}</SearchResult>
      ))}
    </RootContainer>
  )
}

const RootContainer = styled.div`
  height: 100%;
  width: 100%;
  background-color: ${({ theme }) => theme.core.lightBackground};
  overflow: hidden;
  color: ${({ theme }) => theme.core.textColor};
`

const HorizontalContainer = styled.div`
  height: 52px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const IconTitle = styled.span`
  position: absolute;
  bottom: 2px;
  right: 0;
  left: 0;
  text-align: center;
  font-size: 9px;
  font-family: Lato;
  color: transparent;
  transition: color 0.3s ease;

  /* avoids text highlighting on icon titles */
  user-select: none;
`

const IconContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  &:hover {
    span {
      color: ${({ theme }) => theme.core.textColor};
    }
  }
`

const ButtonContainer = styled(IconContainer)`
  ${rules.appRegionNoDrag};
`
const ThemeSwitchContainer = styled(ButtonContainer)`
  width: 35%;
`

const LogoContainer = styled(IconContainer)`
  width: 50%;
  background-color: ${({ theme }) => theme.core.lightBackground};
  .svg-icon {
    fill: ${({ theme }) => theme.core.textColor};
  }
  ${rules.appRegionDrag};
`

const Input = styled.input`
  padding: 8px;
  width: 100%;
  height: ${INPUT_HEIGHT}px;
  background: none;
  outline: none;
  border: none;
  font-size: 1.25rem;
  ${rules.appRegionNoDrag};
`

const SearchResult = styled.div`
  padding-left: 20px;
  padding-right: 20px;
  height: ${SEARCH_RESULT_HEIGHT}px;
  background: none;
  outline: none;
  border: none;
  font-size: 1rem;
  font-style: italic;
  opacity: 0.75;
  ${rules.appRegionNoDrag};
`
