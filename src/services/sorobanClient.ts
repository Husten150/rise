import {
  SorobanRpc,
  Contract,
  TransactionBuilder,
  Networks,
  nativeToScVal,
  scValToNative,
  xdr,
  Account,
} from '@stellar/stellar-sdk';

const CONTRACT_IDS: Record<string, string> = {
  amm_swap: import.meta.env.VITE_AMM_CONTRACT_ID || '',
  multisig_escrow: import.meta.env.VITE_ESCROW_CONTRACT_ID || '',
  oracle_caller: import.meta.env.VITE_ORACLE_CONTRACT_ID || '',
};

const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;

let server: SorobanRpc.Server | null = null;

function getServer(): SorobanRpc.Server {
  if (!server) {
    server = new SorobanRpc.Server(RPC_URL);
  }
  return server;
}

export function getContractId(name: string): string {
  return CONTRACT_IDS[name] || '';
}

export function setContractId(name: string, id: string) {
  CONTRACT_IDS[name] = id;
}

export async function getAccount(publicKey: string): Promise<Account> {
  const srv = getServer();
  const account = await srv.getAccount(publicKey);
  return account;
}

export async function readContract(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
): Promise<any> {
  const srv = getServer();
  const contract = new Contract(contractId);

  const result = await srv.simulateContract(
    contract.txn(method, ...args),
  );

  if (!result.result) {
    throw new Error('Simulation returned no result');
  }

  return scValToNative(result.result.retval);
}

export async function writeContract(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
  publicKey: string,
  signTransaction: (xdr: string) => Promise<string>,
): Promise<string> {
  const srv = getServer();
  const contract = new Contract(contractId);
  const account = await srv.getAccount(publicKey);

  const tx = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const preparedTx = await srv.prepareTransaction(tx);
  const signedXdr = await signTransaction(preparedTx.toXDR());
  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

  const response = await srv.sendTransaction(signedTx);

  if (response.status === 'PENDING') {
    let result = await srv.getTransaction(response.hash);
    while (result.status === 'NOT_FOUND') {
      await new Promise((r) => setTimeout(r, 1000));
      result = await srv.getTransaction(response.hash);
    }

    if (result.status === 'SUCCESS') {
      return response.hash;
    }

    throw new Error(`Transaction failed: ${result.resultXdr}`);
  }

  throw new Error(`Transaction submission failed: ${response.errorLog || 'Unknown error'}`);
}

export function toScVal(value: any, type?: string): xdr.ScVal {
  if (type === 'Address' || typeof value === 'string' && value.startsWith('G')) {
    return nativeToScVal(value, { type: 'address' });
  }
  if (typeof value === 'number' || typeof value === 'bigint') {
    return nativeToScVal(value, { type: 'i128' });
  }
  if (typeof value === 'string') {
    return nativeToScVal(value, { type: 'string' });
  }
  if (typeof value === 'boolean') {
    return nativeToScVal(value, { type: 'bool' });
  }
  return nativeToScVal(value);
}
