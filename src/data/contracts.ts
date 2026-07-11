import { SmartContract } from '../types';

export const CONTRACT_TEMPLATES: SmartContract[] = [
  {
    id: 'amm_swap',
    name: 'Constant Product AMM & Swap',
    icon: 'RefreshCw',
    description: 'A liquidity pool implementing x * y = k, interacting with standard Stellar Asset Contracts (SAC) for inter-contract token transfers.',
    code: `// Soroban Constant Product AMM Contract
use soroban_sdk::{contract, contractimpl, Address, Env, token};

#[contract]
pub struct LiquidityPoolContract;

#[contractimpl]
impl LiquidityPoolContract {
    // Initialize the liquidity pool with two token contract addresses
    pub fn initialize(env: Env, token_a: Address, token_b: Address) {
        if env.storage().instance().has(&Symbol::new(&env, "token_a")) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&Symbol::new(&env, "token_a"), &token_a);
        env.storage().instance().set(&Symbol::new(&env, "token_b"), &token_b);
        env.storage().instance().set(&Symbol::new(&env, "reserve_a"), &0u128);
        env.storage().instance().set(&Symbol::new(&env, "reserve_b"), &0u128);
    }

    // Add liquidity by depositing Token A and Token B
    pub fn deposit(env: Env, sender: Address, amount_a: u128, amount_b: u128) -> u128 {
        sender.require_auth();

        let token_a_addr: Address = env.storage().instance().get(&Symbol::new(&env, "token_a")).unwrap();
        let token_b_addr: Address = env.storage().instance().get(&Symbol::new(&env, "token_b")).unwrap();

        let client_a = token::Client::new(&env, &token_a_addr);
        let client_b = token::Client::new(&env, &token_b_addr);

        // Perform inter-contract transfer of tokens from sender to pool
        client_a.transfer(&sender, &env.current_contract_address(), &(amount_a as i128));
        client_b.transfer(&sender, &env.current_contract_address(), &(amount_b as i128));

        // Update local reserves in instance storage
        let mut reserve_a: u128 = env.storage().instance().get(&Symbol::new(&env, "reserve_a")).unwrap_or(0);
        let mut reserve_b: u128 = env.storage().instance().get(&Symbol::new(&env, "reserve_b")).unwrap_or(0);

        reserve_a += amount_a;
        reserve_b += amount_b;

        env.storage().instance().set(&Symbol::new(&env, "reserve_a"), &reserve_a);
        env.storage().instance().set(&Symbol::new(&env, "reserve_b"), &reserve_b);

        // Mint LP shares (simulated return value)
        let shares = (amount_a * amount_b).integer_sqrt();
        
        // Emit Soroban Event for real-time monitoring
        env.events().publish(
            (Symbol::new(&env, "deposit"), sender),
            (amount_a, amount_b, shares)
        );

        shares
    }

    // Perform a token swap based on x * y = k formula
    pub fn swap(env: Env, sender: Address, from_token: Address, amount_in: u128) -> u128 {
        sender.require_auth();

        let token_a_addr: Address = env.storage().instance().get(&Symbol::new(&env, "token_a")).unwrap();
        let token_b_addr: Address = env.storage().instance().get(&Symbol::new(&env, "token_b")).unwrap();

        let reserve_a: u128 = env.storage().instance().get(&Symbol::new(&env, "reserve_a")).unwrap();
        let reserve_b: u128 = env.storage().instance().get(&Symbol::new(&env, "reserve_b")).unwrap();

        let is_a_to_b = from_token == token_a_addr;
        
        let (res_in, res_out, client_in, client_out, out_addr) = if is_a_to_b {
            (reserve_a, reserve_b, token::Client::new(&env, &token_a_addr), token::Client::new(&env, &token_b_addr), token_b_addr)
        } else {
            (reserve_b, reserve_a, token::Client::new(&env, &token_b_addr), token::Client::new(&env, &token_a_addr), token_a_addr)
        };

        // Standard constant product formula (with a 0.3% fee)
        let amount_in_with_fee = amount_in * 997;
        let numerator = amount_in_with_fee * res_out;
        let denominator = (res_in * 1000) + amount_in_with_fee;
        let amount_out = numerator / denominator;

        // Perform the swap transfers
        client_in.transfer(&sender, &env.current_contract_address(), &(amount_in as i128));
        client_out.transfer(&env.current_contract_address(), &sender, &(amount_out as i128));

        // Update reserves
        if is_a_to_b {
            env.storage().instance().set(&Symbol::new(&env, "reserve_a"), &(reserve_a + amount_in));
            env.storage().instance().set(&Symbol::new(&env, "reserve_b"), &(reserve_b - amount_out));
        } else {
            env.storage().instance().set(&Symbol::new(&env, "reserve_b"), &(reserve_b + amount_in));
            env.storage().instance().set(&Symbol::new(&env, "reserve_a"), &(reserve_a - amount_out));
        }

        // Emit real-time swap event
        env.events().publish(
            (Symbol::new(&env, "swap"), sender),
            (from_token, amount_in, amount_out)
        );

        amount_out
    }
}`,
    language: 'rust',
    storageTypes: {
      instance: ['token_a', 'token_b', 'reserve_a', 'reserve_b'],
      temporary: [],
      persistent: []
    },
    functions: [
      {
        name: 'initialize',
        description: 'Binds Token A and Token B assets to this constant product AMM contract instance.',
        parameters: [
          { name: 'token_a', type: 'Address', description: 'Address of first Stellar Token Asset (SAC)', placeholder: 'C...TOKEN_A' },
          { name: 'token_b', type: 'Address', description: 'Address of second Stellar Token Asset (SAC)', placeholder: 'C...TOKEN_B' }
        ],
        returns: 'void',
        defaultArgs: { token_a: 'CAS3X7KY..._TOKEN_A', token_b: 'CBK8X9YY..._TOKEN_B' }
      },
      {
        name: 'deposit',
        description: 'Deposits token ratios to pool, receiving LP tokens tracking share allocation.',
        parameters: [
          { name: 'sender', type: 'Address', description: 'User account supplying assets', placeholder: 'G...SENDER' },
          { name: 'amount_a', type: 'u128', description: 'Amount of Token A to deposit', placeholder: '1000' },
          { name: 'amount_b', type: 'u128', description: 'Amount of Token B to deposit', placeholder: '1000' }
        ],
        returns: 'u128 (LP Share Tokens)',
        defaultArgs: { sender: 'GD7Y2O3C..._SENDER', amount_a: '2000', amount_b: '4000' }
      },
      {
        name: 'swap',
        description: 'Performs non-custodial exchange using x * y = k pricing curve calculations.',
        parameters: [
          { name: 'sender', type: 'Address', description: 'Trader triggering execution', placeholder: 'G...TRADER' },
          { name: 'from_token', type: 'Address', description: 'Token address being sold', placeholder: 'C...TOKEN_A' },
          { name: 'amount_in', type: 'u128', description: 'Amount being swapped', placeholder: '100' }
        ],
        returns: 'u128 (Output Tokens received)',
        defaultArgs: { sender: 'GD7Y2O3C..._TRADER', from_token: 'CAS3X7KY..._TOKEN_A', amount_in: '500' }
      }
    ]
  },
  {
    id: 'multisig_escrow',
    name: 'Multi-Sig Escrow with Time-lock',
    icon: 'ShieldAlert',
    description: 'Secures funds until authorized signers agree. Includes a protective ledger timestamp check acting as an automated return mechanism on expiration.',
    code: `// Multi-Signature Escrow with Time-lock Protection
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, token};

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    // Setup trust escrow parameters with dual-signers and an expiry window
    pub fn create_escrow(
        env: Env,
        depositor: Address,
        recipient: Address,
        token: Address,
        amount: i128,
        signer_a: Address,
        signer_b: Address,
        unlock_time: u64,
    ) {
        if env.storage().instance().has(&Symbol::new(&env, "depositor")) {
            panic!("Escrow already active");
        }

        env.storage().instance().set(&Symbol::new(&env, "depositor"), &depositor);
        env.storage().instance().set(&Symbol::new(&env, "recipient"), &recipient);
        env.storage().instance().set(&Symbol::new(&env, "token"), &token);
        env.storage().instance().set(&Symbol::new(&env, "amount"), &amount);
        env.storage().instance().set(&Symbol::new(&env, "signer_a"), &signer_a);
        env.storage().instance().set(&Symbol::new(&env, "signer_b"), &signer_b);
        env.storage().instance().set(&Symbol::new(&env, "unlock_time"), &unlock_time);
        
        env.storage().instance().set(&Symbol::new(&env, "approved_a"), &false);
        env.storage().instance().set(&Symbol::new(&env, "approved_b"), &false);

        // Lock funds into this escrow contract from depositor
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&depositor, &env.current_contract_address(), &amount);

        env.events().publish(
            (Symbol::new(&env, "escrow_created"), depositor),
            (recipient, amount, unlock_time)
        );
    }

    // Signer A provides authorized release approval
    pub fn approve_signer_a(env: Env, signer: Address) {
        signer.require_auth();
        let expected_signer: Address = env.storage().instance().get(&Symbol::new(&env, "signer_a")).unwrap();
        assert_eq!(signer, expected_signer, "Unauthorized signer");

        env.storage().instance().set(&Symbol::new(&env, "approved_a"), &true);
        env.events().publish((Symbol::new(&env, "approved"), signer), ());
    }

    // Signer B provides authorized release approval
    pub fn approve_signer_b(env: Env, signer: Address) {
        signer.require_auth();
        let expected_signer: Address = env.storage().instance().get(&Symbol::new(&env, "signer_b")).unwrap();
        assert_eq!(signer, expected_signer, "Unauthorized signer");

        env.storage().instance().set(&Symbol::new(&env, "approved_b"), &true);
        env.events().publish((Symbol::new(&env, "approved"), signer), ());
    }

    // Release escrowed tokens once BOTH approvals are verified
    pub fn release(env: Env) {
        let approved_a: bool = env.storage().instance().get(&Symbol::new(&env, "approved_a")).unwrap_or(false);
        let approved_b: bool = env.storage().instance().get(&Symbol::new(&env, "approved_b")).unwrap_or(false);
        
        assert!(approved_a && approved_b, "Requires dual-signatures for release");

        let recipient: Address = env.storage().instance().get(&Symbol::new(&env, "recipient")).unwrap();
        let token: Address = env.storage().instance().get(&Symbol::new(&env, "token")).unwrap();
        let amount: i128 = env.storage().instance().get(&Symbol::new(&env, "amount")).unwrap();

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &recipient, &amount);

        // Reset state so escrow is completed (Persistent storage cleanup)
        env.storage().instance().remove(&Symbol::new(&env, "depositor"));
        
        env.events().publish((Symbol::new(&env, "escrow_released"), recipient), amount);
    }

    // Refund depositor if the unlock time-lock is breached without approvals
    pub fn refund(env: Env) {
        let unlock_time: u64 = env.storage().instance().get(&Symbol::new(&env, "unlock_time")).unwrap();
        
        // Retrieve current Stellar ledger Unix timestamp
        let current_time = env.ledger().timestamp();
        assert!(current_time >= unlock_time, "Timelock active: escrow is locked");

        let depositor: Address = env.storage().instance().get(&Symbol::new(&env, "depositor")).unwrap();
        let token: Address = env.storage().instance().get(&Symbol::new(&env, "token")).unwrap();
        let amount: i128 = env.storage().instance().get(&Symbol::new(&env, "amount")).unwrap();

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &depositor, &amount);

        env.storage().instance().remove(&Symbol::new(&env, "depositor"));

        env.events().publish((Symbol::new(&env, "escrow_refunded"), depositor), amount);
    }
}`,
    language: 'rust',
    storageTypes: {
      instance: ['depositor', 'recipient', 'token', 'amount', 'signer_a', 'signer_b', 'unlock_time', 'approved_a', 'approved_b'],
      temporary: [],
      persistent: []
    },
    functions: [
      {
        name: 'create_escrow',
        description: 'Launches escrow lock, transferring the amount from the depositor into smart contract storage.',
        parameters: [
          { name: 'depositor', type: 'Address', description: 'User funding the escrow', placeholder: 'G...DEPOSITOR' },
          { name: 'recipient', type: 'Address', description: 'Beneficiary destined to receive funds', placeholder: 'G...RECIPIENT' },
          { name: 'token', type: 'Address', description: 'Token asset being locked', placeholder: 'C...TOKEN' },
          { name: 'amount', type: 'i128', description: 'Total value locked', placeholder: '5000' },
          { name: 'signer_a', type: 'Address', description: 'Arbitrator / Approver A address', placeholder: 'G...SIGNER_A' },
          { name: 'signer_b', type: 'Address', description: 'Arbitrator / Approver B address', placeholder: 'G...SIGNER_B' },
          { name: 'unlock_time', type: 'u64', description: 'Epoch Timestamp for timelock refund', placeholder: '1785000000' }
        ],
        returns: 'void',
        defaultArgs: {
          depositor: 'GD7Y2O3C..._DEPOSITOR',
          recipient: 'GBS3X67Y..._RECIPIENT',
          token: 'CAS3X7KY..._TOKEN_A',
          amount: '1000',
          signer_a: 'GA9X86KK..._SIGNER_A',
          signer_b: 'GBX5Y44K..._SIGNER_B',
          unlock_time: '1789000000'
        }
      },
      {
        name: 'approve_signer_a',
        description: 'Signs approval from Arbitrator A. Authorizes final release.',
        parameters: [
          { name: 'signer', type: 'Address', description: 'Must match Signer A address', placeholder: 'G...SIGNER_A' }
        ],
        returns: 'void',
        defaultArgs: { signer: 'GA9X86KK..._SIGNER_A' }
      },
      {
        name: 'approve_signer_b',
        description: 'Signs approval from Arbitrator B. Authorizes final release.',
        parameters: [
          { name: 'signer', type: 'Address', description: 'Must match Signer B address', placeholder: 'G...SIGNER_B' }
        ],
        returns: 'void',
        defaultArgs: { signer: 'GBX5Y44K..._SIGNER_B' }
      },
      {
        name: 'release',
        description: 'Triggers distribution of assets to beneficiary once multi-signatures are checked.',
        parameters: [],
        returns: 'void',
        defaultArgs: {}
      },
      {
        name: 'refund',
        description: 'Returns escrow deposit to depositor, bypassing approvals if current epoch timestamp exceeds timelock threshold.',
        parameters: [],
        returns: 'void',
        defaultArgs: {}
      }
    ]
  },
  {
    id: 'oracle_caller',
    name: 'Inter-Contract Price Oracle Router',
    icon: 'Radio',
    description: 'Demonstrates cross-contract call dynamics. Queries an external Soroban Price Oracle contract to route exchange decisions.',
    code: `// price-oracle-client interface
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, contractclient};

// Define an interface for the Oracle smart contract we wish to call
#[contractclient(name = "PriceOracleClient")]
pub trait PriceOracleInterface {
    fn get_price(env: Env, asset_code: Symbol) -> (u128, u32); // Returns (Price, Decimals)
}

#[contract]
pub struct OracleRouterContract;

#[contractimpl]
impl OracleRouterContract {
    // Queries price of a specific asset by invoking the target oracle contract
    pub fn get_asset_valuation(env: Env, oracle_address: Address, asset: Symbol) -> u128 {
        // Build price oracle Client dynamically mapping the target address
        let oracle_client = PriceOracleClient::new(&env, &oracle_address);
        
        // Execute Cross-Contract Call (Inter-contract Communication)
        let (price, decimals) = oracle_client.get_price(&asset);
        
        // Emit events tracking cross-contract invocation success
        env.events().publish(
            (Symbol::new(&env, "cross_contract_query"), oracle_address),
            (asset, price)
        );

        // Normalize price calculation to standard base
        price / (10u128.pow(decimals))
    }

    // Routes trade decisions based on verified oracle pricing boundaries
    pub fn verify_trade_rate(
        env: Env, 
        oracle: Address, 
        asset_sell: Symbol, 
        asset_buy: Symbol, 
        min_ratio: u128
    ) -> bool {
        let price_sell = Self::get_asset_valuation(env.clone(), oracle.clone(), asset_sell);
        let price_buy = Self::get_asset_valuation(env, oracle, asset_buy);
        
        let dynamic_ratio = (price_sell * 1000) / price_buy;
        dynamic_ratio >= min_ratio
    }
}`,
    language: 'rust',
    storageTypes: {
      instance: [],
      temporary: [],
      persistent: ['price_cache_ttl']
    },
    functions: [
      {
        name: 'get_asset_valuation',
        description: 'Performs a cross-contract query to retrieve normalized price from the target oracle contract.',
        parameters: [
          { name: 'oracle_address', type: 'Address', description: 'Price Oracle smart contract address', placeholder: 'C...ORACLE' },
          { name: 'asset', type: 'Symbol', description: 'Stellar Asset Identifier (e.g. XLM, USDC)', placeholder: 'XLM' }
        ],
        returns: 'u128 (Normalized Asset Price)',
        defaultArgs: { oracle_address: 'CC6X78RR..._ORACLE_CONTRACT', asset: 'XLM' }
      },
      {
        name: 'verify_trade_rate',
        description: 'Validates cross-contract token valuations to ensure exchange rates meet min_ratio limits.',
        parameters: [
          { name: 'oracle', type: 'Address', description: 'Price Oracle smart contract address', placeholder: 'C...ORACLE' },
          { name: 'asset_sell', type: 'Symbol', description: 'Asset to Sell', placeholder: 'XLM' },
          { name: 'asset_buy', type: 'Symbol', description: 'Asset to Buy', placeholder: 'USDC' },
          { name: 'min_ratio', type: 'u128', description: 'Minimum execution exchange ratio * 1000', placeholder: '120' }
        ],
        returns: 'bool (True if rate is secure, False if rate fails bounds)',
        defaultArgs: { oracle: 'CC6X78RR..._ORACLE_CONTRACT', asset_sell: 'XLM', asset_buy: 'USDC', min_ratio: '120' }
      }
    ]
  }
];
