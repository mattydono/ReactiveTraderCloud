import React, { ChangeEvent, FocusEventHandler, KeyboardEventHandler, useCallback, useEffect, useState } from 'react'
import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce'
import { Input, SearchContainer } from './styles'
import { DetectIntentResponse } from 'dialogflow';
import { take, timeout } from 'rxjs/operators';
import { useServiceStub } from '../SpotlightRoute/useServiceStab';
import { getInlineSuggestionsComponent, Response } from './spotlight';
import { usePlatform } from 'rt-platforms';
import { handleIntent } from '../SpotlightRoute/handleIntent';

export type SearchState = {
  loading: boolean,
  typing: boolean
}

export interface SearchControlsProps {
  onStateChange: (state: SearchState) => void
}

export const SearchControls = React.forwardRef<HTMLInputElement, SearchControlsProps>(
  ({ onStateChange }, ref) => {
    const [isTyping, setIsTyping] = useState(false)
    const [response, setResponse] = useState<DetectIntentResponse>()
    const [contacting, setContacting] = useState(false)

    const platform = usePlatform()
    const serviceStub = useServiceStub()

    useEffect(
      () => {
        onStateChange({
          loading: contacting,
          typing: isTyping
        })
      },
      [contacting, isTyping, onStateChange]
    )

    const sendRequest = useCallback((requestString: string) => {
      if (!requestString) {
        console.warn(`Skipping sending the request - request string is empty`)
        return
      }
      if (!serviceStub) {
        console.error(`Error creating subscription - serviceStub was not defined`)
        return
      }
      console.info('Sending NLP request:', requestString)

      setContacting(true)

      const subscription = serviceStub
        .createRequestResponseOperation<DetectIntentResponse[], string>(
          'nlp-vlad',
          'getNlpIntent',
          requestString,
        )
        .pipe(
          timeout(10000),
          take(1),
        )
        .subscribe(
          result => {
            setContacting(false)
            setResponse(result[0])
          },
          (err: any) => {
            console.error(`Error in NLP request: ${err}`)
            setContacting(false)
          },
        )

      return () => subscription && subscription.unsubscribe()
    }, [serviceStub])

    const handleOnKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(e => {
      if (e.key === 'Enter' && response) {
        handleIntent(response, platform)
      }
    }, [response, platform])

    const handleFocus: FocusEventHandler<HTMLInputElement> = useCallback(e => {
      e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
    }, [])

    const throttledSendRequest = useCallback(
      throttle(
        (requestString: string) => sendRequest(requestString),
        250,
        {
          leading: false,
          trailing: true
        }
      ),
      []
    )

    const debouncedStopTyping = useCallback(
      debounce(
        () => setIsTyping(false),
        350,
        {
          leading: false,
          trailing: true
        }
      ),
      []
    )

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        setIsTyping(true)
        debouncedStopTyping()
        throttledSendRequest(e.target.value)
      },
      [throttledSendRequest, debouncedStopTyping]
    )

    return (
      <SearchContainer>
        <Input
          onChange={handleChange}
          ref={ref}
          onFocus={handleFocus}
          onKeyDown={handleOnKeyDown}/>

        {response && (
          <Response>
            {response && getInlineSuggestionsComponent(response, platform)}
          </Response>
        )}
      </SearchContainer>
    )
  })
