import React from 'react'
import { ServiceStubWithLoadBalancer } from 'rt-system'
import BlotterService from '../MainRoute/widgets/blotter/blotterService';

export const ServiceStubContext = React.createContext<ServiceStubWithLoadBalancer | undefined>(undefined)
export const { Provider: ServiceStubProvider } = ServiceStubContext

export const BlotterServiceContext = React.createContext<BlotterService | undefined>(undefined)
export const { Provider: BlotterServiceProvider } = BlotterServiceContext
