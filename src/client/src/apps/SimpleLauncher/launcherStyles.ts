import { styled } from 'rt-theme';
import { rules } from 'rt-styleguide';
import { createGlobalStyle } from 'styled-components';

export const INPUT_HEIGHT = 40
export const SEARCH_RESULT_HEIGHT = 30

export const LauncherGlobalStyle = createGlobalStyle`
:root, body {
  @media all {
    font-size: 16px;
    -webkit-app-region: drag;
  }
}
`

export const RootContainer = styled.div`
  height: 100%;
  width: 100%;
  background-color: ${({ theme }) => theme.core.lightBackground};
  overflow: hidden;
  color: ${({ theme }) => theme.core.textColor};
`

export const HorizontalContainer = styled.div`
  height: 52px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const IconTitle = styled.span`
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

export const IconContainer = styled.div`
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

export const ButtonContainer = styled(IconContainer)`
  ${rules.appRegionNoDrag};
`
export const ThemeSwitchContainer = styled(ButtonContainer)`
  width: 35%;
`

export const LogoContainer = styled(IconContainer)`
  width: 50%;
  background-color: ${({ theme }) => theme.core.lightBackground};
  .svg-icon {
    fill: ${({ theme }) => theme.core.textColor};
  }
  ${rules.appRegionDrag};
`

export const Input = styled.input`
  padding: 8px;
  width: 100%;
  height: ${INPUT_HEIGHT}px;
  background: none;
  outline: none;
  border: none;
  font-size: 1.25rem;
  ${rules.appRegionNoDrag};
`

// export const SearchResult = styled.div`
//   padding-left: 20px;
//   padding-right: 20px;
//   height: ${SEARCH_RESULT_HEIGHT}px;
//   background: none;
//   outline: none;
//   border: none;
//   font-size: 1rem;
//   font-style: italic;
//   opacity: 0.75;
//   ${rules.appRegionNoDrag};
// `
