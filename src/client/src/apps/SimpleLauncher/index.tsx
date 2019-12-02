import React, { useEffect, useState } from 'react'
import { ThemeProvider } from 'rt-theme'

import { Launcher } from './Launcher'
import { createServiceStub } from '../SpotlightRoute/transport';
import { getPlatformAsync, PlatformProvider } from 'rt-platforms';
import { getFdc3 } from '../SpotlightRoute/fdc3/fdc3';
import { AutobahnConnectionProxy } from '../../rt-system';
import { Fdc3Provider } from '../SpotlightRoute/fdc3/context';
import { BlotterServiceProvider, BlotterUpdatesStreamProvider, ServiceStubProvider } from '../SpotlightRoute/context';
import BlotterService, { TradesUpdate } from '../MainRoute/widgets/blotter/blotterService';
import { Observable, ReplaySubject } from 'rxjs';

const autobahn = new AutobahnConnectionProxy(
  process.env.REACT_APP_BROKER_HOST || location.hostname,
  'com.weareadaptive.reactivetrader',
  +(process.env.REACT_APP_BROKER_PORT || location.port),
)

export const SimpleLauncher: React.FC = () => {

  const [platform, setPlatform] = useState()
  const [fdc3, setFdc3] = useState()
  const [serviceStub, setServiceStub] = useState()
  const [blotterService, setBlotterService] = useState<BlotterService>()
  const [blotterUpdatesStream, setBlotterUpdatesStream] = useState<Observable<TradesUpdate>>()

  useEffect(() => {
    const bootstrap = async () => {
      const serviceStubResult = createServiceStub(autobahn)
      const platformResult = await getPlatformAsync()
      const fdc3Result = await getFdc3()
      const blotterService = new BlotterService(serviceStubResult)
      const blotterUpdates$ = blotterService.getTradesStream()
      const blotterUpdatesSubject$ = new ReplaySubject<TradesUpdate>();
      blotterUpdates$.subscribe(blotterUpdatesSubject$)
      setBlotterUpdatesStream(blotterUpdatesSubject$)

      setBlotterService(blotterService)
      setServiceStub(serviceStubResult)
      setPlatform(platformResult)
      setFdc3(fdc3Result)
    }

    bootstrap()
  }, [])

  if (!platform || !serviceStub || !fdc3) {
    return <></>
  }

  return (
    <ThemeProvider>
      <ServiceStubProvider value={serviceStub}>
        <BlotterServiceProvider value={blotterService}>
          <BlotterUpdatesStreamProvider value={blotterUpdatesStream}>
            <Fdc3Provider value={fdc3}>
              <PlatformProvider value={platform}>
                <Launcher/>
              </PlatformProvider>
            </Fdc3Provider>
          </BlotterUpdatesStreamProvider>
        </BlotterServiceProvider>
      </ServiceStubProvider>
    </ThemeProvider>
  )
}

export default SimpleLauncher
