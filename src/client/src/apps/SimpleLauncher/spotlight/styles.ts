import { styled } from 'rt-theme';
import { rules } from 'rt-styleguide';

export const Suggestion = styled.div`
  padding: 10px 5px;
  line-height: 1rem;
  cursor: pointer;
  background-color: ${({ theme }) => theme.core.lightBackground};
  &:hover {
    background-color: ${({ theme }) => theme.core.backgroundHoverColor};
  }
`

export const Response = styled.div`
  margin: 10px;
  font-size: 1rem;
  font-style: italic;
  opacity: 0.59;
  text-align: center;
  ${rules.appRegionNoDrag};
`

export const Contacting = styled.span`
  margin-left: 0.5rem;
`
