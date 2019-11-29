import React, { FC, useEffect, useState } from 'react'
import numeral from 'numeral'
import { DateTime } from 'luxon'
import { map, scan } from 'rxjs/operators'
import { useBlotterService } from './hooks'
import { useServiceStub } from './context'
import { Trade } from 'rt-types'
// TODO - lift out
import { TradesUpdate } from '../MainRoute/widgets/blotter/blotterService'
import { BlotterFilters, filterBlotterTrades } from '../MainRoute/widgets/blotter'
import { InlineIntent } from '../SimpleLauncher/spotlight';
import { Table } from './styles';

type TradeLookup = Map<number, Trade>

const MAX_TRADES = 20

interface BlotterProps {
  readonly filters?: BlotterFilters
}

export const InlineBlotter: FC<BlotterProps> = ({ filters }) => {
  const [trades, setTrades] = useState<Trade[]>([])
  const serviceStub = useServiceStub()
  const blotterService = useBlotterService(serviceStub)

  useEffect(() => {
    if (!blotterService) {
      return
    }
    const subscription = blotterService
      .getTradesStream()
      .pipe(
        map((tradeUpdate: TradesUpdate) =>
          filterBlotterTrades(tradeUpdate.trades, {
            ...filters,
            // get all trades and then limit in the end (so that we can show user how many filtered out)
            count: undefined,
          }),
        ),
        scan<ReadonlyArray<Trade>, Map<number, Trade>>((acc, trades) => {
          trades.forEach(trade => acc.set(trade.tradeId, trade))
          return acc
        }, new Map<number, Trade>()),
        map((trades: TradeLookup) => Array.from(trades.values()).reverse()),
      )
      .subscribe(result => {
        const newTradeCount = result.length;
        const newTrades = result.slice(0, filters && typeof filters.count !== 'undefined' ? filters.count : MAX_TRADES,);

        setTrades(newTrades)

        console.info(`Showing ${newTrades.length} of ${newTradeCount} trades.`)
      }, (error) => {
        console.error(`Error subscribing to inline blotter service: ${error}`)
      })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [blotterService, filters])

  if (!trades || (trades && trades.length === 0)) {
    return (
      <InlineIntent>
        No last trades
      </InlineIntent>
    )
  }

  return (
    <InlineIntent>
      <Table>
        <thead>
        <tr>
          <th>Trade ID</th>
          <th>Symbol</th>
          <th>Notional</th>
          <th>Trade Date</th>
          <th>Status</th>
        </tr>
        </thead>
        <tbody>
        {trades.map(trade => (
          <tr key={trade.tradeId}>
            <td>{trade.tradeId}</td>
            <td>{trade.symbol}</td>
            <td>{numeral(trade.notional).format()}</td>
            <td>{DateTime.fromJSDate(trade.tradeDate).toFormat('yyyy LLL dd')}</td>
            <td>{trade.status}</td>
          </tr>
        ))}
        </tbody>
      </Table>
    </InlineIntent>
  )
}
