// CourtListener Bulk Data Service
// Integrates CourtListener bulk data storage as a knowledge base for the agent

export interface BulkDataSource {
  name: string;
  url: string;
  description: string;
  type: 'opinions' | 'dockets' | 'audio' | 'financial' | 'judges' | 'recap';
  lastUpdated?: string;
}

// CourtListener bulk data sources
// Source: https://com-courtlistener-storage.s3-us-west-2.amazonaws.com/list.html?prefix=bulk-data/
export const BULK_DATA_SOURCES: BulkDataSource[] = [
  {
    name: 'Opinions',
    url: 'https://com-courtlistener-storage.s3-us-west-2.amazonaws.com/list.html?prefix=bulk-data/opinions/',
    description: 'Court opinions and decisions from all federal and state courts',
    type: 'opinions'
  },
  {
    name: 'Dockets',
    url: 'https://com-courtlistener-storage.s3-us-west-2.amazonaws.com/list.html?prefix=bulk-data/dockets/',
    description: 'Docket entries and case information',
    type: 'dockets'
  },
  {
    name: 'Oral Arguments',
    url: 'https://com-courtlistener-storage.s3-us-west-2.amazonaws.com/list.html?prefix=bulk-data/audio/',
    description: 'Oral argument recordings and transcripts',
    type: 'audio'
  },
  {
    name: 'Financial Disclosures',
    url: 'https://com-courtlistener-storage.s3-us-west-2.amazonaws.com/list.html?prefix=bulk-data/financial-disclosures/',
    description: 'Federal judge financial disclosure reports',
    type: 'financial'
  },
  {
    name: 'Judge Database',
    url: 'https://com-courtlistener-storage.s3-us-west-2.amazonaws.com/list.html?prefix=bulk-data/judges/',
    description: 'Comprehensive judge biographical data',
    type: 'judges'
  },
  {
    name: 'RECAP Archive',
    url: 'https://com-courtlistener-storage.s3-us-west-2.amazonaws.com/list.html?prefix=bulk-data/recap/',
    description: 'PACER documents from RECAP project',
    type: 'recap'
  }
];

export interface SearchContext {
  query: string;
  caseType?: string;
  jurisdiction?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  citationNeeded?: boolean;
}

/**
 * Service to integrate CourtListener bulk data with the agent
 */
export class CourtListenerBulkDataService {
  private baseUrl = 'https://www.courtlistener.com/api/rest/v4';

  /**
   * Generate context prompt about available bulk data sources
   * This informs the agent about the data it can reference
   */
  getBulkDataContext(): string {
    return `
KNOWLEDGE BASE ACCESS:
You have access to CourtListener's comprehensive legal database containing:
${BULK_DATA_SOURCES.map(source => `- ${source.name}: ${source.description}`).join('\n')}

When formulating answers about legal matters, motions, or case law:
1. Reference that you can search through millions of court opinions and dockets
2. Mention specific case types or jurisdictions when relevant
3. Suggest specific searches the user can perform to find supporting precedents
4. Recommend citation patterns based on the jurisdiction
5. Provide strategic guidance based on similar successful motions

You should think like a legal research brain that knows where to find supporting documentation.
`;
  }

  /**
   * Generate search suggestions based on user query
   */
  async generateSearchSuggestions(context: SearchContext): Promise<string[]> {
    const suggestions: string[] = [];

    // Generate targeted search queries for different data sources
    if (context.caseType) {
      suggestions.push(`${context.query} in ${context.caseType} cases`);
    }

    if (context.jurisdiction) {
      suggestions.push(`${context.query} ${context.jurisdiction} jurisdiction`);
    }

    if (context.citationNeeded) {
      suggestions.push(`${context.query} with citations and precedents`);
    }

    // Add general search
    suggestions.push(context.query);

    return suggestions;
  }

  /**
   * Format bulk data guidance for the agent's system prompt
   */
  formatForAgentPrompt(userContext?: SearchContext): string {
    let prompt = this.getBulkDataContext();

    if (userContext) {
      prompt += `\nCURRENT CONTEXT:\n`;
      if (userContext.caseType) {
        prompt += `- Case Type: ${userContext.caseType}\n`;
      }
      if (userContext.jurisdiction) {
        prompt += `- Jurisdiction: ${userContext.jurisdiction}\n`;
      }
      if (userContext.citationNeeded) {
        prompt += `- User needs: Legal citations and precedents\n`;
      }
    }

    prompt += `\nWhen recommending motions or legal strategies:
1. Suggest specific case law searches the user can perform
2. Reference the type of supporting documents available (opinions, dockets, etc.)
3. Provide guidance on citation formats for the jurisdiction
4. Recommend strategic approaches based on successful precedents
5. Always indicate when a comprehensive database search would strengthen the argument
`;

    return prompt;
  }

  /**
   * Get recommended data sources for a specific legal task
   */
  getRecommendedSources(taskType: 'motion' | 'research' | 'citation' | 'strategy'): BulkDataSource[] {
    switch (taskType) {
      case 'motion':
        return BULK_DATA_SOURCES.filter(s => 
          s.type === 'opinions' || s.type === 'dockets' || s.type === 'recap'
        );
      case 'research':
        return BULK_DATA_SOURCES.filter(s => 
          s.type === 'opinions' || s.type === 'judges'
        );
      case 'citation':
        return BULK_DATA_SOURCES.filter(s => s.type === 'opinions');
      case 'strategy':
        return BULK_DATA_SOURCES.filter(s => 
          s.type === 'opinions' || s.type === 'dockets' || s.type === 'recap'
        );
      default:
        return BULK_DATA_SOURCES;
    }
  }

  /**
   * Generate motion recommendations based on case context
   */
  generateMotionGuidance(motionType: string, jurisdiction?: string): string {
    return `
For your ${motionType}${jurisdiction ? ` in ${jurisdiction}` : ''}:

RECOMMENDED RESEARCH:
1. Search opinions database for successful ${motionType} precedents
2. Review docket entries to see how similar motions were received
3. Check RECAP archive for supporting documentation patterns

STRATEGY SUGGESTIONS:
- Identify 3-5 strong precedent cases
- Note citation patterns in successful motions
- Review judicial preferences (if judge data available)
- Structure arguments based on winning patterns

DATA SOURCES TO CONSULT:
${this.getRecommendedSources('motion').map(s => `- ${s.name}: ${s.description}`).join('\n')}

Use CourtListener search to find specific cases matching your criteria.
`;
  }
}

// Singleton instance
export const bulkDataService = new CourtListenerBulkDataService();
