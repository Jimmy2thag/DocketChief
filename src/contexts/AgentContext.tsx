import React, { createContext, useContext, useState, useCallback } from 'react';
import { docketChiefAgent } from '@/lib/agentService';
import { AgentMemory } from '@/lib/agentMemory';

interface AgentContextType {
  memory: AgentMemory;
  refreshMemory: () => void;
  resetMemory: () => void;
  updateConsents: (consents: { remember_preferences?: boolean; store_emails?: boolean }) => void;
  agentEnabled: boolean;
  setAgentEnabled: (enabled: boolean) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within AgentProvider');
  }
  return context;
};

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [memory, setMemory] = useState<AgentMemory>(docketChiefAgent.getMemory());
  const [agentEnabled, setAgentEnabled] = useState(true);

  const refreshMemory = useCallback(() => {
    setMemory(docketChiefAgent.getMemory());
  }, []);

  const resetMemory = useCallback(() => {
    docketChiefAgent.resetMemory();
    refreshMemory();
  }, [refreshMemory]);

  const updateConsents = useCallback((consents: { remember_preferences?: boolean; store_emails?: boolean }) => {
    docketChiefAgent.updateConsents(consents);
    refreshMemory();
  }, [refreshMemory]);

  return (
    <AgentContext.Provider
      value={{
        memory,
        refreshMemory,
        resetMemory,
        updateConsents,
        agentEnabled,
        setAgentEnabled,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};
