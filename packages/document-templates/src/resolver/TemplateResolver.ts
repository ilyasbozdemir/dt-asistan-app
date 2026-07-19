import { resolveTemplateData } from './mappingResolver';
import { ProcessMapping } from './types';

/**
 * Service class to handle template mapping resolution.
 */
export class TemplateResolver {
  private queryExecutor: (sql: string, params: any[]) => Promise<any[]>;

  constructor(queryExecutor: (sql: string, params: any[]) => Promise<any[]>) {
    this.queryExecutor = queryExecutor;
  }

  /**
   * Resolves the template variables using the provided mapping and document ID.
   */
  async resolve(mapping: ProcessMapping, activeDosyaId: number): Promise<Record<string, any>> {
    return resolveTemplateData(mapping, activeDosyaId, this.queryExecutor);
  }
}
