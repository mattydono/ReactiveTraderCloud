import { AdaptiveLoader } from 'rt-components';
import React from 'react';
import { Contacting } from './styles';

export const ResponseLoader: React.FC = () => (
  <>
    <AdaptiveLoader size={14} speed={0.8} seperation={1.5} type="secondary"/>
    <Contacting>Contacting…</Contacting>
  </>
)
