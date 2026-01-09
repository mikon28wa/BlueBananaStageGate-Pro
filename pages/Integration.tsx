
import React from 'react';
import IntegrationMatrix from '../components/IntegrationMatrix';
import { IntegrationStatus, InfrastructureConfig, CommandType } from '../types';

interface IntegrationProps {
  integrations: IntegrationStatus[];
  infra: InfrastructureConfig;
  dispatch: (type: CommandType, payload?: any) => void;
}

const Integration: React.FC<IntegrationProps> = ({ integrations, infra, dispatch }) => {
  return (
    <IntegrationMatrix 
      integrations={integrations}
      infra={infra}
      onSync={(id) => dispatch('SYNC_INTEGRATION', { systemId: id })}
      onInfraSwitch={(type) => dispatch('SWITCH_INFRASTRUCTURE', { type })}
    />
  );
};

export default Integration;
