import React from 'react'
import { ServiceStubWithLoadBalancer } from 'rt-system'
import BlotterService, { TradesUpdate } from '../MainRoute/widgets/blotter/blotterService';
import { Observable } from 'rxjs';

export const ServiceStubContext = React.createContext<ServiceStubWithLoadBalancer | undefined>(undefined)
export const { Provider: ServiceStubProvider } = ServiceStubContext

export const BlotterServiceContext = React.createContext<BlotterService | undefined>(undefined)
export const { Provider: BlotterServiceProvider } = BlotterServiceContext

export const BlotterUpdatesStreamContext = React.createContext<Observable<TradesUpdate> | undefined>(undefined)
export const { Provider: BlotterUpdatesStreamProvider } = BlotterUpdatesStreamContext
