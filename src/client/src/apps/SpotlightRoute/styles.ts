import styled from 'styled-components'

export const Table = styled.table`
  font-size: 0.6875rem;
  th,
  td {
    text-align: left;
    width: 100px;
    padding: 0 5px;
  }

  thead tr {
    text-transform: uppercase;
  }

  tbody {
    tr:nth-child(odd) {
      background-color: ${({ theme }) => theme.core.darkBackground};
    }

    tr:nth-child(even) {
      background-color: ${({ theme }) => theme.core.alternateBackground};
    }
  }
`
