import React, { useState } from 'react';
import { MotionCard } from './MotionCard';
import { DocumentEditor } from './DocumentEditor';
import { CaseAnalyzer } from './CaseAnalyzer';
import RulesDatabase from './RulesDatabase';
import RebuttalAssistant from './RebuttalAssistant';
import CaseLawDatabase from './CaseLawDatabase';
import { BriefGenerator } from './BriefGenerator';
import { ClientPortal } from './ClientPortal';
import { DocumentUpload } from './DocumentUpload';
import { DocumentManager } from './DocumentManager';
import { UserDashboard } from './UserDashboard';
import { AuthModal } from './AuthModal';
import { AIChat } from './AIChat';
import { ConversationImport } from './ConversationImport';
import { ConversationManager } from './ConversationManager';
import { AdvancedSearch } from './AdvancedSearch';
import { CollaborationTools } from './CollaborationTools';
import { CaseManagementDashboard } from './CaseManagementDashboard';
import { LegalResearchTool } from './LegalResearchTool';
import { CalendarDashboard } from './CalendarDashboard';
import { EmailDashboard } from './EmailDashboard';
import { LegalToolsGrid } from './LegalToolsGrid';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ContractDraftingTool } from './ContractDraftingTool';
import LegalDatabaseSearch from './LegalDatabaseSearch';
import CourtListenerAPI from './CourtListenerAPI';
import PaymentPlans from './PaymentPlans';
import { PaymentPortal } from './PaymentPortal';
import PaymentSuccess from './PaymentSuccess';
import PaymentCancel from './PaymentCancel';
import { SubscriptionDashboard } from './SubscriptionDashboard';
import { ServiceStatus } from './ServiceStatus';
import DocumentAnalyzer from './DocumentAnalyzer';
import { AlertDashboard } from './AlertDashboard';
import { AdminSubscriptionAnalytics } from './AdminSubscriptionAnalytics';


import { TemplateLibrary } from './TemplateLibrary';
import { TemplateEditor } from './TemplateEditor';
import { SystemMonitor } from './SystemMonitor';
import { ErrorBoundary } from './ErrorBoundary';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { User, LogOut, CreditCard, Settings, Bell } from 'lucide-react';
import { TemplateRecord, useTemplateLibrary } from '@/contexts/TemplateContext';

export const AppLayout = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedMotion, setSelectedMotion] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [editingTemplate, setEditingTemplate] = useState<TemplateRecord | null>(null);
  const [analyzerSeed, setAnalyzerSeed] = useState<string | null>(null);
  const { upsertTemplate } = useTemplateLibrary();
  
  const legalTools = [
    {
      id: 'document-analyzer',
      title: 'AI Document Analysis',
      description: 'Advanced AI-powered document analysis with key information extraction and legal insights',
      image: 'https://d64gsuwffb70l.cloudfront.net/68d655106ee34a31072787c7_1758953707069_493aacf9.webp',
      onClick: () => setActiveTab('document-analyzer')
    },
    {
      id: 'contract-drafting',
      title: 'Draft a Contract',
      description: 'AI-powered contract creation and template generation with clause suggestions',
      image: 'https://d64gsuwffb70l.cloudfront.net/68d655106ee34a31072787c7_1758953707069_493aacf9.webp',
      onClick: () => setActiveTab('contract-drafting')
    },
    {
      id: 'redlining',
      title: 'Document Redlining',
      description: 'Collaborative document review with markup, comments, and version control',
      image: 'https://d64gsuwffb70l.cloudfront.net/68d655106ee34a31072787c7_1758953713746_b52c3e90.webp',
      onClick: () => setActiveTab('collaborate')
    },
    {
      id: 'legal-database',
      title: 'CourtListener API',
      description: 'Real-time access to CourtListener legal database with advanced search and filtering',
      image: 'https://d64gsuwffb70l.cloudfront.net/68d655106ee34a31072787c7_1758953718595_a37c4962.webp',
      onClick: () => setActiveTab('courtlistener-api')
    },
    {
      id: 'legal-research',
      title: 'Legal Research',
      description: 'AI-powered legal research with case analysis and precedent discovery',
      image: 'https://d64gsuwffb70l.cloudfront.net/68d655106ee34a31072787c7_1758953718595_a37c4962.webp',
      onClick: () => setActiveTab('caselaw')
    },
    {
      id: 'discovery',
      title: 'Discovery Management',
      description: 'Organize evidence, manage discovery requests, and track deadlines',
      image: 'https://d64gsuwffb70l.cloudfront.net/68d655106ee34a31072787c7_1758953722372_a055110e.webp',
      onClick: () => setActiveTab('case-management')
    },
    {
      id: 'timelines',
      title: 'Case Timelines',
      description: 'Visual timeline creation for case chronology and deadline tracking',
      image: 'https://d64gsuwffb70l.cloudfront.net/68d655106ee34a31072787c7_1758953728378_bdaddd08.webp',
      onClick: () => setActiveTab('calendar')
    },
    {
      id: 'motion-arguing',
      title: 'Motion Arguments',
      description: 'Draft and argue motions with AI assistance and precedent analysis',
      image: 'https://d64gsuwffb70l.cloudfront.net/68d655106ee34a31072787c7_1758953733582_064f6ceb.webp',
      onClick: () => setActiveTab('brief')
    },
    {
      id: 'litigation-review',
      title: 'Litigation Review',
      description: 'Comprehensive case analysis and strategy development tools',
      image: 'https://d64gsuwffb70l.cloudfront.net/68d655106ee34a31072787c7_1758953737794_2c297216.webp',
      onClick: () => setActiveTab('cases')
    }
  ];


  const renderContent = () => {
    switch (activeTab) {
      case 'alert-dashboard':
        return <AlertDashboard />;
      case 'document-analyzer':
        return <DocumentAnalyzer initialDocument={analyzerSeed ?? undefined} onResetSeed={() => setAnalyzerSeed(null)} />;
      case 'template-library':
        return editingTemplate ? (
          <TemplateEditor
            template={editingTemplate}
            onSave={(template) => {
              upsertTemplate(template);
              setEditingTemplate(null);
            }}
            onClose={() => setEditingTemplate(null)}
            onAnalyze={(content) => {
              setAnalyzerSeed(content);
              setActiveTab('document-analyzer');
            }}
          />
        ) : (
          <TemplateLibrary
            onEditTemplate={setEditingTemplate}
            onAnalyzeTemplate={(content) => {
              setAnalyzerSeed(content);
              setActiveTab('document-analyzer');
            }}
          />
        );
      case 'contract-drafting':
        return user ? <ContractDraftingTool /> : <div className="p-8 text-center">Please sign in to draft contracts</div>;
      case 'upload':
        return user ? <DocumentManager /> : <div className="p-8 text-center">Please sign in to upload documents</div>;
      case 'collaborate':
        return user ? <CollaborationTools /> : <div className="p-8 text-center">Please sign in to collaborate</div>;
      case 'brief':
        return <BriefGenerator />;
      case 'cases':
        return <CaseAnalyzer />;
      case 'case-management':
        return user ? <CaseManagementDashboard /> : <div className="p-8 text-center">Please sign in to manage cases</div>;
      case 'caselaw':
        return <LegalResearchTool />;
      case 'courtlistener-api':
        return <CourtListenerAPI />;
      case 'search':
        return user ? <AdvancedSearch /> : <div className="p-8 text-center">Please sign in to search</div>;
      case 'rules':
        return <RulesDatabase />;
      case 'rebuttal':
        return <RebuttalAssistant />;
      case 'calendar':
        return user ? <CalendarDashboard /> : <div className="p-8 text-center">Please sign in to view calendar</div>;
      case 'chat':
        return <AIChat />;
      case 'conversations':
        return user ? <ConversationManager /> : <div className="p-8 text-center">Please sign in to view conversations</div>;
      case 'import':
        return user ? <ConversationImport onImportComplete={() => setActiveTab('conversations')} /> : <div className="p-8 text-center">Please sign in to import conversations</div>;
      case 'dashboard':
        return user ? <UserDashboard /> : <div className="p-8 text-center">Please sign in to view dashboard</div>;
      case 'clients':
        return user ? <ClientPortal /> : <div className="p-8 text-center">Please sign in to access client portal</div>;
      case 'email':
        return user ? <EmailDashboard /> : <div className="p-8 text-center">Please sign in to manage emails</div>;
      case 'analytics':
        return user ? <AnalyticsDashboard /> : <div className="p-8 text-center">Please sign in to view analytics</div>;
      case 'admin-analytics':
        return user ? <AdminSubscriptionAnalytics /> : <div className="p-8 text-center">Please sign in to view admin analytics</div>;
      case 'subscription':
        return user ? <SubscriptionDashboard /> : <div className="p-8 text-center">Please sign in to manage subscription</div>;

      case 'pricing':
        return <PaymentPortal />;
      case 'payment-success':
        return <PaymentSuccess />;
      case 'payment-cancel':
        return <PaymentCancel />;
      case 'service-status':
        return <ServiceStatus />;
      case 'system-monitor':
        return <SystemMonitor />;
      case 'legal-database':
        return <LegalDatabaseSearch />;

      default:
        return (
          <div>
            <div className="relative min-h-[600px] bg-cover bg-center bg-no-repeat" 
                 style={{backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://d64gsuwffb70l.cloudfront.net/68d655106ee34a31072787c7_1758952803300_7d0ba2f7.webp')"}}>
              <div className="relative px-6 py-20 max-w-7xl mx-auto text-white">
                <h1 className="text-6xl font-bold mb-6 drop-shadow-lg">Docket Chief</h1>
                <p className="text-3xl mb-8 font-medium text-blue-100 drop-shadow">From Draft to Docket - Done</p>
                <p className="text-xl mb-8 max-w-3xl leading-relaxed drop-shadow">Your comprehensive AI legal assistant with ChatGPT and Gemini integration. Advanced search, collaboration tools, and seamless workflow management for legal professionals.</p>
              </div>
            </div>

            
            <div className="bg-gray-50 py-16">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Legal Practice Tools</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">Choose from our comprehensive suite of AI-powered legal tools to streamline your practice</p>
              </div>
              <LegalToolsGrid tools={legalTools} />
            </div>
          </div>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center py-4">
              <span className="text-2xl font-bold text-gray-900 cursor-pointer" onClick={() => setActiveTab('home')}>Docket Chief</span>
              <div className="flex items-center space-x-8">
                {/* Document Creation & Management Menu */}
                <div className="relative group">
                  <button className="px-4 py-2 font-medium text-gray-700 hover:text-blue-600 flex items-center">
                    Document Management
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <button onClick={() => setActiveTab('document-analyzer')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">AI Document Analysis</button>
                      <button onClick={() => setActiveTab('upload')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Document Manager</button>
                      <button onClick={() => setActiveTab('contract-drafting')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Contract Drafting</button>
                      <button onClick={() => setActiveTab('template-library')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Template Library</button>
                      <button onClick={() => setActiveTab('collaborate')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Document Redlining</button>
                      <button onClick={() => setActiveTab('brief')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Brief Generator</button>
                    </div>
                  </div>
                </div>

                {/* Litigation Analysis & Strategy Menu */}
                <div className="relative group">
                  <button className="px-4 py-2 font-medium text-gray-700 hover:text-blue-600 flex items-center">
                    Litigation & Strategy
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <button onClick={() => setActiveTab('cases')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Case Analysis</button>
                      <button onClick={() => setActiveTab('case-management')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Case Management</button>
                      <button onClick={() => setActiveTab('caselaw')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Legal Research</button>
                      <button onClick={() => setActiveTab('courtlistener-api')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">CourtListener API</button>
                      <button onClick={() => setActiveTab('search')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Advanced Search</button>
                      <button onClick={() => setActiveTab('rules')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Rules Database</button>
                      <button onClick={() => setActiveTab('rebuttal')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Rebuttal Assistant</button>
                      <button onClick={() => setActiveTab('calendar')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Case Timeline</button>
                    </div>
                  </div>
                </div>

                {/* AI Tools & Analysis Menu */}
                <div className="relative group">
                  <button className="px-4 py-2 font-medium text-gray-700 hover:text-blue-600 flex items-center">
                    AI Tools
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <button onClick={() => setActiveTab('chat')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">AI Chat</button>
                      <button onClick={() => setActiveTab('conversations')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Conversation Manager</button>
                      <button onClick={() => setActiveTab('import')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Import Conversations</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('alert-dashboard')}
                  className={activeTab === 'alert-dashboard' ? 'bg-red-50 text-red-600' : ''}
                >
                  <Bell className="h-4 w-4 mr-1" />
                  Alerts
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('system-monitor')}
                  className={activeTab === 'system-monitor' ? 'bg-blue-50 text-blue-600' : ''}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  System Monitor
                </Button>

                {user ? (
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('admin-analytics')}
                      className={activeTab === 'admin-analytics' ? 'bg-purple-50 text-purple-600' : ''}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Admin Analytics
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('subscription')}
                      className={activeTab === 'subscription' ? 'bg-blue-50 text-blue-600' : ''}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Subscription
                    </Button>
                    <span className="text-sm text-gray-600">{user.email}</span>
                    <Button variant="outline" size="sm" onClick={signOut}>
                      <LogOut className="h-4 w-4 mr-1" />
                      Sign Out
                    </Button>
                  </div>

                ) : (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setAuthMode('signin');
                        setShowAuthModal(true);
                      }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setAuthMode('signup');
                        setShowAuthModal(true);
                      }}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
        
        <main>{renderContent()}</main>
        
        {selectedMotion && (
          <DocumentEditor
            motionType={selectedMotion}
            onClose={() => setSelectedMotion(null)}
          />
        )}
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onModeChange={setAuthMode}
        />
      </div>
    </ErrorBoundary>
  );
};

export default AppLayout;