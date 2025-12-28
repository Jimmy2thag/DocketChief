/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface TemplateRecord {
  id: string;
  title: string;
  category: string;
  description: string;
  jurisdiction: string;
  tags: string[];
  content: string;
  isCustom: boolean;
  isFavorite: boolean;
  lastModified: string;
}

interface TemplateContextValue {
  templates: TemplateRecord[];
  upsertTemplate: (template: TemplateRecord) => void;
  toggleFavorite: (id: string) => void;
  resetTemplates: () => void;
}

const STORAGE_KEY = 'docket-chief.templates';

const DEFAULT_TEMPLATES: TemplateRecord[] = [
  {
    id: 'employment-agreement',
    title: 'Employment Agreement',
    category: 'contracts',
    description: 'Comprehensive employment contract with standard terms',
    jurisdiction: 'Federal',
    tags: ['employment', 'contract', 'standard'],
    content:
      'EMPLOYMENT AGREEMENT\n\nThis Employment Agreement ("Agreement") is entered into as of [DATE] between [EMPLOYER_NAME] and [EMPLOYEE_NAME].\n\n1. POSITION AND DUTIES\n   Employee shall serve as [POSITION] and perform the duties customary to such role.\n\n2. COMPENSATION\n   Base salary of [SALARY] payable pursuant to the Employer\'s standard payroll practices.\n\n3. BENEFITS\n   Employee shall be eligible for Employer benefit plans pursuant to plan terms.\n\n4. CONFIDENTIALITY\n   Employee agrees to maintain confidentiality of Employer proprietary information.',
    isCustom: false,
    isFavorite: true,
    lastModified: '2024-01-15',
  },
  {
    id: 'motion-to-dismiss',
    title: 'Motion to Dismiss',
    category: 'motions',
    description: 'Standard motion to dismiss with supporting arguments',
    jurisdiction: 'California',
    tags: ['motion', 'dismiss', 'civil'],
    content:
      'MOTION TO DISMISS\n\nTO THE HONORABLE COURT:\n\nDefendant hereby moves to dismiss the complaint pursuant to California Code of Civil Procedure § 430.10 on the grounds set forth below...\n\nI. INTRODUCTION\nII. LEGAL STANDARD\nIII. ARGUMENT\nIV. CONCLUSION',
    isCustom: false,
    isFavorite: false,
    lastModified: '2024-01-10',
  },
  {
    id: 'nda-template',
    title: 'NDA Template',
    category: 'agreements',
    description: 'Non-disclosure agreement for business transactions',
    jurisdiction: 'New York',
    tags: ['nda', 'confidentiality', 'business'],
    content:
      'NON-DISCLOSURE AGREEMENT\n\nThis Agreement is entered into on [DATE] by and between [DISCLOSING_PARTY] and [RECEIVING_PARTY].\n\n1. CONFIDENTIAL INFORMATION\n2. OBLIGATIONS\n3. TERM\n4. GOVERNING LAW',
    isCustom: false,
    isFavorite: true,
    lastModified: '2024-01-12',
  },
  {
    id: 'custom-brief',
    title: 'Custom Brief Template',
    category: 'briefs',
    description: 'Appellate brief structure with issue, argument, and conclusion sections',
    jurisdiction: 'Texas',
    tags: ['brief', 'appellate', 'custom'],
    content:
      'IN THE [COURT]\n\n[CASE_CAPTION]\n\nBRIEF FOR [PARTY]\n\nSTATEMENT OF THE CASE\nSTATEMENT OF ISSUES\nSTATEMENT OF FACTS\nSUMMARY OF THE ARGUMENT\nARGUMENT\n   Issue One\n   Issue Two\nPRAYER',
    isCustom: true,
    isFavorite: false,
    lastModified: '2024-01-20',
  },
];

const TemplateContext = createContext<TemplateContextValue | undefined>(undefined);

const loadFromStorage = (): TemplateRecord[] | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TemplateRecord[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch (error) {
    console.warn('[TemplateContext] Failed to parse stored templates', error);
    return null;
  }
};

export const TemplateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<TemplateRecord[]>(() => loadFromStorage() ?? DEFAULT_TEMPLATES);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  const upsertTemplate = (template: TemplateRecord) => {
    setTemplates((prev) => {
      const exists = prev.some((item) => item.id === template.id);
      const next = exists
        ? prev.map((item) => (item.id === template.id ? { ...template, lastModified: template.lastModified ?? item.lastModified } : item))
        : [...prev, template];
      return next;
    });
  };

  const toggleFavorite = (id: string) => {
    setTemplates((prev) => prev.map((template) => (template.id === id ? { ...template, isFavorite: !template.isFavorite } : template)));
  };

  const resetTemplates = () => {
    setTemplates(DEFAULT_TEMPLATES);
  };

  const value = useMemo(
    () => ({
      templates,
      upsertTemplate,
      toggleFavorite,
      resetTemplates,
    }),
    [templates],
  );

  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>;
};

export const useTemplateLibrary = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplateLibrary must be used within a TemplateProvider');
  }
  return context;
};

export const getTemplateCategories = (templates: TemplateRecord[]) => {
  const counts = templates.reduce<Record<string, number>>((acc, template) => {
    acc[template.category] = (acc[template.category] || 0) + 1;
    return acc;
  }, {});

  return [
    { id: 'all', label: 'All Templates', count: templates.length },
    ...Object.entries(counts).map(([id, count]) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1), count })),
  ];
};

export const createEmptyTemplate = (): TemplateRecord => ({
  id: `template-${Date.now()}`,
  title: '',
  category: 'contracts',
  description: '',
  jurisdiction: 'Federal',
  tags: [],
  content: '',
  isCustom: true,
  isFavorite: false,
  lastModified: new Date().toISOString().split('T')[0],
});
