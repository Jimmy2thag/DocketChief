/**
 * Assistant Context
 * 
 * Provides assistant memory and state management throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AssistantMemory, LearningsCandidate, AssistantMessage } from '@/types/assistant';
import { assistantMemoryService } from '@/lib/assistantMemoryService';
import { useAuth } from './AuthContext';

interface AssistantContextType {
  memory: AssistantMemory;
  messages: AssistantMessage[];
  isAssistantOpen: boolean;
  
  // Memory operations
  updateMemory: (updates: Partial<AssistantMemory>) => void;
  applyLearnings: (learnings: LearningsCandidate) => void;
  clearMemory: () => void;
  exportMemory: () => string;
  
  // Message operations
  addMessage: (message: AssistantMessage) => void;
  clearMessages: () => void;
  
  // UI operations
  toggleAssistant: () => void;
  openAssistant: () => void;
  closeAssistant: () => void;
  
  // System prompt
  getSystemPrompt: () => string;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within AssistantProvider');
  }
  return context;
};

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || 'anonymous';
  
  const [memory, setMemory] = useState<AssistantMemory>(() => 
    assistantMemoryService.loadMemory(userId)
  );
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Load memory when user changes
  useEffect(() => {
    const loadedMemory = assistantMemoryService.loadMemory(userId);
    setMemory(loadedMemory);
  }, [userId]);

  // Save memory whenever it changes
  useEffect(() => {
    if (memory.preferences.storeInteractions) {
      assistantMemoryService.saveMemory(memory);
    }
  }, [memory]);

  const updateMemory = useCallback((updates: Partial<AssistantMemory>) => {
    setMemory(prev => ({
      ...prev,
      ...updates,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const applyLearnings = useCallback((learnings: LearningsCandidate) => {
    setMemory(prev => assistantMemoryService.applyLearnings(prev, learnings));
  }, []);

  const clearMemory = useCallback(() => {
    assistantMemoryService.clearMemory(userId);
    setMemory(assistantMemoryService.loadMemory(userId));
    setMessages([]);
  }, [userId]);

  const exportMemory = useCallback(() => {
    return assistantMemoryService.exportMemory(userId);
  }, [userId]);

  const addMessage = useCallback((message: AssistantMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const toggleAssistant = useCallback(() => {
    setIsAssistantOpen(prev => !prev);
  }, []);

  const openAssistant = useCallback(() => {
    setIsAssistantOpen(true);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsAssistantOpen(false);
  }, []);

  const getSystemPrompt = useCallback(() => {
    return assistantMemoryService.getSystemPromptWithMemory(memory);
  }, [memory]);

  const contextValue: AssistantContextType = {
    memory,
    messages,
    isAssistantOpen,
    updateMemory,
    applyLearnings,
    clearMemory,
    exportMemory,
    addMessage,
    clearMessages,
    toggleAssistant,
    openAssistant,
    closeAssistant,
    getSystemPrompt,
  };

  return (
    <AssistantContext.Provider value={contextValue}>
      {children}
    </AssistantContext.Provider>
  );
};
