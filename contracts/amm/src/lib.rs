#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, log, Address, BytesN, Env, String,
};

const FEE_BPS: u64 = 30; // 0.3% fee

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReserveData {
    pub reserve_a: i128,
    pub reserve_b: i128,
    pub lp_token_supply: i128,
}

#[contracttype]
#[derive(Clone)]
pub struct TokenPair {
    pub token_a: Address,
    pub token_b: Address,
}

#[contracttype]
#[derive(Clone)]
pub struct LpBalance {
    pub amount: i128,
}

#[contracttype]
pub enum DataKey {
    Admin,
    TokenA,
    TokenB,
    ReserveA,
    ReserveB,
    LpTokenSupply,
    LpBalance(Address),
}

#[contract]
pub struct AmmContract;

#[contractimpl]
impl AmmContract {
    pub fn initialize(env: Env, admin: Address, token_a: Address, token_b: Address) {
        admin.require_auth();

        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenA, &token_a);
        env.storage().instance().set(&DataKey::TokenB, &token_b);
        env.storage().instance().set(&DataKey::ReserveA, &0_i128);
        env.storage().instance().set(&DataKey::ReserveB, &0_i128);
        env.storage().instance().set(&DataKey::LpTokenSupply, &0_i128);

        log!(
            &env,
            "AMM initialized: admin={}, token_a={}, token_b={}",
            admin,
            token_a,
            token_b
        );
    }

    pub fn deposit(
        env: Env,
        to: Address,
        amount_a: i128,
        amount_b: i128,
        min_a: i128,
        min_b: i128,
    ) -> i128 {
        to.require_auth();

        if amount_a <= 0 || amount_b <= 0 {
            panic!("deposit amounts must be positive");
        }
        if amount_a < min_a || amount_b < min_b {
            panic!("slippage: deposit amounts below minimum");
        }

        let reserve_a: i128 = env.storage().instance().get(&DataKey::ReserveA).unwrap_or(0);
        let reserve_b: i128 = env.storage().instance().get(&DataKey::ReserveB).unwrap_or(0);
        let lp_supply: i128 = env
            .storage()
            .instance()
            .get(&DataKey::LpTokenSupply)
            .unwrap_or(0);

        let token_a: Address = env.storage().instance().get(&DataKey::TokenA).unwrap();
        let token_b: Address = env.storage().instance().get(&DataKey::TokenB).unwrap();

        let lp_amount;
        if lp_supply == 0 {
            lp_amount = amount_a * amount_b; // geometric mean
        } else {
            let share_a = (amount_a * lp_supply) / reserve_a;
            let share_b = (amount_b * lp_supply) / reserve_b;
            lp_amount = if share_a < share_b { share_a } else { share_b };
        }

        // Transfer tokens from user to contract
        let token_a_client = soroban_sdk::token::Client::new(&env, &token_a);
        let token_b_client = soroban_sdk::token::Client::new(&env, &token_b);
        token_a_client.transfer(&to, &env.current_contract_address(), &amount_a);
        token_b_client.transfer(&to, &env.current_contract_address(), &amount_b);

        let new_reserve_a = reserve_a + amount_a;
        let new_reserve_b = reserve_b + amount_b;
        env.storage()
            .instance()
            .set(&DataKey::ReserveA, &new_reserve_a);
        env.storage()
            .instance()
            .set(&DataKey::ReserveB, &new_reserve_b);
        env.storage()
            .instance()
            .set(&DataKey::LpTokenSupply, &(lp_supply + lp_amount));

        let mut balance: LpBalance = env
            .storage()
            .instance()
            .get(&DataKey::LpBalance(to.clone()))
            .unwrap_or(LpBalance { amount: 0 });
        balance.amount += lp_amount;
        env.storage()
            .instance()
            .set(&DataKey::LpBalance(to.clone()), &balance);

        log!(
            &env,
            "Deposit: to={}, amount_a={}, amount_b={}, lp_tokens={}",
            to,
            amount_a,
            amount_b,
            lp_amount
        );

        lp_amount
    }

    pub fn swap_a_to_b(env: Env, to: Address, amount_a: i128, min_b: i128) -> i128 {
        to.require_auth();

        if amount_a <= 0 {
            panic!("swap amount must be positive");
        }

        let reserve_a: i128 = env.storage().instance().get(&DataKey::ReserveA).unwrap_or(0);
        let reserve_b: i128 = env.storage().instance().get(&DataKey::ReserveB).unwrap_or(1);
        let token_a: Address = env.storage().instance().get(&DataKey::TokenA).unwrap();
        let token_b: Address = env.storage().instance().get(&DataKey::TokenB).unwrap();

        let fee = (amount_a * FEE_BPS as i128) / 10000;
        let net_amount = amount_a - fee;

        // x * y = k
        let k = reserve_a * reserve_b;
        let new_reserve_a = reserve_a + net_amount;
        let new_reserve_b = k / new_reserve_a;
        let amount_out = reserve_b - new_reserve_b;

        if amount_out < min_b {
            panic!("slippage: output below minimum");
        }

        // Transfer token_a from user to contract
        let token_a_client = soroban_sdk::token::Client::new(&env, &token_a);
        token_a_client.transfer(&to, &env.current_contract_address(), &amount_a);

        // Transfer token_b from contract to user
        let token_b_client = soroban_sdk::token::Client::new(&env, &token_b);
        token_b_client.transfer(&env.current_contract_address(), &to, &amount_out);

        env.storage()
            .instance()
            .set(&DataKey::ReserveA, &new_reserve_a);
        env.storage()
            .instance()
            .set(&DataKey::ReserveB, &new_reserve_b);

        log!(
            &env,
            "Swap A->B: to={}, amount_in={}, amount_out={}",
            to,
            amount_a,
            amount_out
        );

        amount_out
    }

    pub fn swap_b_to_a(env: Env, to: Address, amount_b: i128, min_a: i128) -> i128 {
        to.require_auth();

        if amount_b <= 0 {
            panic!("swap amount must be positive");
        }

        let reserve_a: i128 = env.storage().instance().get(&DataKey::ReserveA).unwrap_or(1);
        let reserve_b: i128 = env.storage().instance().get(&DataKey::ReserveB).unwrap_or(0);
        let token_a: Address = env.storage().instance().get(&DataKey::TokenA).unwrap();
        let token_b: Address = env.storage().instance().get(&DataKey::TokenB).unwrap();

        let fee = (amount_b * FEE_BPS as i128) / 10000;
        let net_amount = amount_b - fee;

        let k = reserve_a * reserve_b;
        let new_reserve_b = reserve_b + net_amount;
        let new_reserve_a = k / new_reserve_b;
        let amount_out = reserve_a - new_reserve_a;

        if amount_out < min_a {
            panic!("slippage: output below minimum");
        }

        let token_b_client = soroban_sdk::token::Client::new(&env, &token_b);
        token_b_client.transfer(&to, &env.current_contract_address(), &amount_b);

        let token_a_client = soroban_sdk::token::Client::new(&env, &token_a);
        token_a_client.transfer(&env.current_contract_address(), &to, &amount_out);

        env.storage()
            .instance()
            .set(&DataKey::ReserveA, &new_reserve_a);
        env.storage()
            .instance()
            .set(&DataKey::ReserveB, &new_reserve_b);

        log!(
            &env,
            "Swap B->A: to={}, amount_out={}",
            to,
            amount_out
        );

        amount_out
    }

    pub fn get_reserves(env: Env) -> ReserveData {
        let reserve_a: i128 = env.storage().instance().get(&DataKey::ReserveA).unwrap_or(0);
        let reserve_b: i128 = env.storage().instance().get(&DataKey::ReserveB).unwrap_or(0);
        let lp_supply: i128 = env
            .storage()
            .instance()
            .get(&DataKey::LpTokenSupply)
            .unwrap_or(0);

        ReserveData {
            reserve_a,
            reserve_b,
            lp_token_supply: lp_supply,
        }
    }

    pub fn get_lp_balance(env: Env, address: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::LpBalance(address))
            .unwrap_or(LpBalance { amount: 0 })
            .amount
    }
}

#[cfg(test)]
mod test;
