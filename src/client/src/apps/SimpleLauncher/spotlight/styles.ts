import { styled } from 'rt-theme';
import { rules } from 'rt-styleguide';

export const Suggestion = styled.div`
  display: flex;
  flex-direction: row;
  padding: 5px 2px;
  line-height: 1rem;
  cursor: pointer;
  background-color: ${({ theme }) => theme.core.lightBackground};
  &:hover {
    background-color: ${({ theme }) => theme.core.backgroundHoverColor};
  }
`

export const Response = styled.div`
  padding-top: 5px;
  padding-left: 15px;
  font-size: 1rem;
  font-style: italic;
  opacity: 0.59;
  ${rules.appRegionNoDrag};
`

export const Intent = styled.div`
  padding-right: 15px;
`

export const InlineIntent = styled.div`
  font-size: 0.6875rem;
  padding-left: 15px;
  border-left: solid;
`
