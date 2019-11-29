import BlotterService from '../MainRoute/widgets/blotter/blotterService';
import { useContext } from 'react';
import { BlotterServiceContext } from './context';

export const useBlotterService = (): BlotterService | undefined => {
  return useContext(BlotterServiceContext)
}
