// Type declarations for dkg.js

declare module 'dkg.js' {
  interface DKGConfig {
    endpoint: string;
    port: string | number;
    blockchain: {
      name: string;
      privateKey: string;
    };
    maxNumberOfRetries?: number;
    frequency?: number;
    contentType?: string;
    nodeApiVersion?: string;
  }

  interface CreateOptions {
    epochsNum?: number;
    minimumNumberOfFinalizationConfirmations?: number;
    minimumNumberOfNodeReplications?: number;
  }

  interface CreateResult {
    UAL?: string;
    ual?: string;
    publicAssertionId?: string;
    datasetRoot?: string;
    operation?: any;
  }

  interface AssetOperations {
    create(content: { public: any; private?: any }, options?: CreateOptions): Promise<CreateResult>;
    get(ual: string): Promise<any>;
  }

  class DKG {
    constructor(config: DKGConfig);
    asset: AssetOperations;
  }

  export default DKG;
}

