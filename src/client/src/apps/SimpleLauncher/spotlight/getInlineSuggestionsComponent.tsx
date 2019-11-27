import React from 'react'
import { DetectIntentResponse } from 'dialogflow';
import { Platform } from '../../../rt-platforms';
import { getCurrency, getCurrencyPair, getNumber } from '../../SpotlightRoute/intentUtils';
import { BlotterFilters, DEALT_CURRENCY, SYMBOL } from '../../MainRoute/widgets/blotter';
import { isSpotQuoteIntent, isTradeIntent, mapIntent } from '../../SpotlightRoute/responseMapper';
import { handleIntent } from '../../SpotlightRoute/handleIntent';
import { InlineQuote } from '../../SpotlightRoute/InlineQuote';
import { InlineBlotter } from '../../SpotlightRoute/InlineBlotter';
import { Intent, Suggestion } from './styles';

export function getInlineSuggestionsComponent(response: DetectIntentResponse, platform: Platform) {
  const currencyPair = getCurrencyPair(response.queryResult)
  const currency = getCurrency(response.queryResult)
  const intent = mapIntent(response)

  const quoteSuggestion = isSpotQuoteIntent(response) && currencyPair ? (
    <Suggestion onClick={() => handleIntent(response, platform)}>
      <Intent>
        {intent}
      </Intent>
      <InlineQuote currencyPair={currencyPair}/>
    </Suggestion>
  ) : null;

  const blotterFilter: BlotterFilters = {
    [DEALT_CURRENCY]: [currency],
    [SYMBOL]: [currencyPair],
    count: getNumber(response.queryResult),
  }
  const blotterSuggestion = isTradeIntent(response) ? (
    <Suggestion onClick={() => handleIntent(response, platform)}>
      <Intent>
        {intent}
      </Intent>
      <InlineBlotter filters={blotterFilter}/>
    </Suggestion>
  ) : null;

  return (
    <>
      {quoteSuggestion}
      {blotterSuggestion}
    </>
  )
}
