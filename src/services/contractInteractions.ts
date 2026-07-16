import { xdr } from '@stellar/stellar-sdk';
import { getContractId, readContract, writeContract, toScVal } from './sorobanClient';

export type SignTransactionFn = (xdr: string) => Promise<string>;

export const AMM_FUNCTIONS = {
  async getReserves(publicKey?: string) {
    const contractId = getContractId('amm_swap');
    if (!contractId) throw new Error('AMM contract not deployed');
    return readContract(contractId, 'get_reserves', []);
  },

  async deposit(
    to: string,
    amountA: number,
    amountB: number,
    minA: number,
    minB: number,
    publicKey: string,
    signTx: SignTransactionFn,
  ) {
    const contractId = getContractId('amm_swap');
    if (!contractId) throw new Error('AMM contract not deployed');
    return writeContract(contractId, 'deposit', [
      toScVal(to, 'Address'),
      toScVal(amountA),
      toScVal(amountB),
      toScVal(minA),
      toScVal(minB),
    ], publicKey, signTx);
  },

  async swapAtoB(
    to: string,
    amountA: number,
    minB: number,
    publicKey: string,
    signTx: SignTransactionFn,
  ) {
    const contractId = getContractId('amm_swap');
    if (!contractId) throw new Error('AMM contract not deployed');
    return writeContract(contractId, 'swap_a_to_b', [
      toScVal(to, 'Address'),
      toScVal(amountA),
      toScVal(minB),
    ], publicKey, signTx);
  },

  async swapBtoA(
    to: string,
    amountB: number,
    minA: number,
    publicKey: string,
    signTx: SignTransactionFn,
  ) {
    const contractId = getContractId('amm_swap');
    if (!contractId) throw new Error('AMM contract not deployed');
    return writeContract(contractId, 'swap_b_to_a', [
      toScVal(to, 'Address'),
      toScVal(amountB),
      toScVal(minA),
    ], publicKey, signTx);
  },
};

export const ESCROW_FUNCTIONS = {
  async createEscrow(
    token: string,
    amount: number,
    recipient: string,
    signerA: string,
    signerB: string,
    unlockTime: number,
    publicKey: string,
    signTx: SignTransactionFn,
  ) {
    const contractId = getContractId('multisig_escrow');
    if (!contractId) throw new Error('Escrow contract not deployed');
    return writeContract(contractId, 'create_escrow', [
      toScVal(token, 'Address'),
      toScVal(amount),
      toScVal(recipient, 'Address'),
      toScVal(signerA, 'Address'),
      toScVal(signerB, 'Address'),
      toScVal(unlockTime),
    ], publicKey, signTx);
  },

  async approveA(escrowId: number, publicKey: string, signTx: SignTransactionFn) {
    const contractId = getContractId('multisig_escrow');
    if (!contractId) throw new Error('Escrow contract not deployed');
    return writeContract(contractId, 'approve_a', [toScVal(escrowId)], publicKey, signTx);
  },

  async approveB(escrowId: number, publicKey: string, signTx: SignTransactionFn) {
    const contractId = getContractId('multisig_escrow');
    if (!contractId) throw new Error('Escrow contract not deployed');
    return writeContract(contractId, 'approve_b', [toScVal(escrowId)], publicKey, signTx);
  },

  async release(escrowId: number, publicKey: string, signTx: SignTransactionFn) {
    const contractId = getContractId('multisig_escrow');
    if (!contractId) throw new Error('Escrow contract not deployed');
    return writeContract(contractId, 'release', [toScVal(escrowId)], publicKey, signTx);
  },

  async refund(escrowId: number, publicKey: string, signTx: SignTransactionFn) {
    const contractId = getContractId('multisig_escrow');
    if (!contractId) throw new Error('Escrow contract not deployed');
    return writeContract(contractId, 'refund', [toScVal(escrowId)], publicKey, signTx);
  },

  async getEscrow(escrowId: number) {
    const contractId = getContractId('multisig_escrow');
    if (!contractId) throw new Error('Escrow contract not deployed');
    return readContract(contractId, 'get_escrow', [toScVal(escrowId)]);
  },
};

export const ORACLE_FUNCTIONS = {
  async getPrice(asset: string, publicKey?: string) {
    const contractId = getContractId('oracle_caller');
    if (!contractId) throw new Error('Oracle contract not deployed');
    return readContract(contractId, 'get_price', [toScVal(asset, 'string')]);
  },

  async getAssetValuation(asset: string, amount: number, publicKey?: string) {
    const contractId = getContractId('oracle_caller');
    if (!contractId) throw new Error('Oracle contract not deployed');
    return readContract(contractId, 'get_asset_valuation', [
      toScVal(asset, 'string'),
      toScVal(amount),
    ]);
  },

  async verifyTradeRate(
    assetA: string,
    assetB: string,
    amountA: number,
    expectedAmountB: number,
    toleranceBps: number,
    publicKey?: string,
  ) {
    const contractId = getContractId('oracle_caller');
    if (!contractId) throw new Error('Oracle contract not deployed');
    return readContract(contractId, 'verify_trade_rate', [
      toScVal(assetA, 'string'),
      toScVal(assetB, 'string'),
      toScVal(amountA),
      toScVal(expectedAmountB),
      toScVal(toleranceBps),
    ]);
  },
};
