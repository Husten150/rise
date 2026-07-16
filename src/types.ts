export type TabType =
  | 'contracts'
  | 'visualizer'
  | 'sandbox'
  | 'testing'
  | 'deployment'
  | 'cicd'
  | 'docs';

export interface SmartContract {
  id: string;
  name: string;
  icon: string;
  description: string;
  code: string;
  language: 'rust';
  storageTypes: {
    instance: string[];
    temporary: string[];
    persistent: string[];
  };
  functions: ContractFunction[];
}

export interface ContractFunction {
  name: string;
  description: string;
  parameters: { name: string; type: string; description: string; placeholder: string }[];
  returns: string;
  defaultArgs: Record<string, string>;
}

export interface LedgerBlock {
  sequence: number;
  hash: string;
  timestamp: string;
  transactionCount: number;
  totalFees: string;
  operationsCount: number;
}

export interface StellarEvent {
  id: string;
  contractId: string;
  topics: string[];
  value: string;
  ledgerSequence: number;
  timestamp: string;
}

export interface SimulatedTransaction {
  id: string;
  hash: string;
  sourceAccount: string;
  ledgerSequence: number;
  contractId?: string;
  functionName?: string;
  status: 'SUCCESS' | 'FAILED';
  fee: string;
  eventsCount: number;
  timestamp: string;
}

export interface ContractTest {
  id: string;
  name: string;
  description: string;
  code: string;
  assertions: { name: string; status: 'pending' | 'success' | 'failed'; message?: string }[];
}

export interface DeploymentStep {
  id: number;
  title: string;
  description: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  output: string[];
}

export interface PipelineStage {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  duration: number;
  logs: string[];
}

export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  network: string | null;
}

export interface ContractDeployment {
  network: string;
  contractId: string;
  wasmHash: string;
  deployer: string;
  timestamp: string;
  transactionFee: string;
  transactionHash: string;
}
