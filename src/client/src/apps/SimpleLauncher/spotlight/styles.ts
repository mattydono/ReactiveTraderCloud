import { styled } from 'rt-theme';

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
  font-size: 1rem;
  font-style: italic;
  opacity: 0.59;
  margin: 0.5rem 0 0;
`

export const Contacting = styled.span`
  margin-left: 0.5rem;
`
