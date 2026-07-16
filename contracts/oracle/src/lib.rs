#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, log, Address, BytesN, Env, String,
};

#[contracttype]
#[derive(Clone, Debug)]
pub struct PriceEntry {
    pub asset: String,
    pub price: i128,
    pub timestamp: u64,
    pub decimals: u32,
}

#[contracttype]
pub enum DataKey {
    Admin,
    PriceEntry(String),
    AssetList,
}

#[contract]
pub struct OracleContract;

#[contractimpl]
impl OracleContract {
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();

        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::AssetList, &Vec::<String>::new(&env));

        log!(&env, "Oracle initialized: admin={}", admin);
    }

    pub fn set_price(
        env: Env,
        admin: Address,
        asset: String,
        price: i128,
        decimals: u32,
    ) {
        admin.require_auth();

        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("not initialized"));
        if admin != stored_admin {
            panic!("unauthorized");
        }

        if price <= 0 {
            panic!("price must be positive");
        }

        let entry = PriceEntry {
            asset: asset.clone(),
            price,
            timestamp: env.ledger().timestamp(),
            decimals,
        };

        env.storage()
            .instance()
            .set(&DataKey::PriceEntry(asset.clone()), &entry);

        // Track asset in list
        let mut asset_list: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::AssetList)
            .unwrap_or(Vec::new(&env));
        if !asset_list.contains(&asset) {
            asset_list.push_back(asset.clone());
            env.storage()
                .instance()
                .set(&DataKey::AssetList, &asset_list);
        }

        log!(
            &env,
            "Price set: asset={}, price={}, decimals={}",
            asset,
            price,
            decimals
        );
    }

    pub fn get_price(env: Env, asset: String) -> PriceEntry {
        env.storage()
            .instance()
            .get(&DataKey::PriceEntry(asset.clone()))
            .unwrap_or_else(|| panic!("asset not found: {}", asset))
    }

    pub fn get_asset_valuation(env: Env, asset: String, amount: i128) -> i128 {
        let entry: PriceEntry = env
            .storage()
            .instance()
            .get(&DataKey::PriceEntry(asset.clone()))
            .unwrap_or_else(|| panic!("asset not found: {}", asset));

        (amount * entry.price) / (10_i128.pow(entry.decimals))
    }

    pub fn verify_trade_rate(
        env: Env,
        asset_a: String,
        asset_b: String,
        amount_a: i128,
        expected_amount_b: i128,
        tolerance_bps: u64,
    ) -> bool {
        let valuation_a = Self::get_asset_valuation(env.clone(), asset_a, amount_a);
        let ref_amount_b = valuation_a; // valuation in same reference unit

        let lower = ref_amount_b - (ref_amount_b * tolerance_bps as i128) / 10000;
        let upper = ref_amount_b + (ref_amount_b * tolerance_bps as i128) / 10000;

        expected_amount_b >= lower && expected_amount_b <= upper
    }

    pub fn get_all_assets(env: Env) -> Vec<String> {
        env.storage()
            .instance()
            .get(&DataKey::AssetList)
            .unwrap_or(Vec::new(&env))
    }
}

#[cfg(test)]
mod test;
