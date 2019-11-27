import { styled } from 'rt-theme';
import { rules } from 'rt-styleguide';

export const Suggestion = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px 5px;
  line-height: 1rem;
  cursor: pointer;
  background-color: ${({ theme }) => theme.core.lightBackground};
  &:hover {
    background-color: ${({ theme }) => theme.core.backgroundHoverColor};
  }
`

export const Response = styled.div`
  margin-left: 5px;
  margin-right: 5px;
  font-size: 1rem;
  font-style: italic;
  opacity: 0.59;
  text-align: center;
  ${rules.appRegionNoDrag};
`

export const Intent = styled.div`
  padding-right: 15px;
`

export const InlineIntent = styled.div`
  padding-left: 15px;
  border-left: solid;
`

export const Contacting = styled.span`
  margin-left: 0.5rem;
`
