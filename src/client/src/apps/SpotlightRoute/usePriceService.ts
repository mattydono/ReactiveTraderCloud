import { ServiceClient } from 'rt-system'
import PricingService from '../MainRoute/widgets/spotTile/epics/pricingService'
import { useServiceFactory } from './useServiceFactory';

export const usePriceService = (serviceStub?: ServiceClient): PricingService | undefined => {
  return useServiceFactory(PricingService, serviceStub)
}
