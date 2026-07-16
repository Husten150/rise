#![cfg(test)]

use crate::OracleContract;
use crate::OracleContractClient;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{symbol_short, Address, Env, String};

fn setup_test() -> (Env, OracleContractClient, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let contract_id = env.register_contract(None, OracleContract);
    let client = OracleContractClient::new(&env, &contract_id);

    client.initialize(&admin);

    (env, client, admin)
}

#[test]
fn test_initialize() {
    let (env, client, admin) = setup_test();
    let assets = client.get_all_assets();
    assert_eq!(assets.len(), 0);
}

#[test]
fn test_set_and_get_price() {
    let (env, client, admin) = setup_test();

    let asset = String::from_str(&env, "XLM");
    client.set_price(&admin, &asset, &100_000_000i128, &7);

    let entry = client.get_price(&asset);
    assert_eq!(entry.price, 100_000_000);
    assert_eq!(entry.decimals, 7);
    assert_eq!(entry.asset, asset);
}

#[test]
fn test_get_all_assets() {
    let (env, client, admin) = setup_test();

    let xlm = String::from_str(&env, "XLM");
    let usdc = String::from_str(&env, "USDC");

    client.set_price(&admin, &xlm, &100_000_000i128, &7);
    client.set_price(&admin, &usdc, &1_000_000i128, &6);

    let assets = client.get_all_assets();
    assert_eq!(assets.len(), 2);
    assert!(assets.contains(&xlm));
    assert!(assets.contains(&usdc));
}

#[test]
fn test_get_asset_valuation() {
    let (env, client, admin) = setup_test();

    let asset = String::from_str(&env, "XLM");
    // Price: 1 XLM = 100_000_000 (1.0 in 7 decimals)
    client.set_price(&admin, &asset, &100_000_000i128, &7);

    // 10 XLM at price 1.0 = 10.0
    let valuation = client.get_asset_valuation(&asset, &10_000_000_000i128);
    assert!(valuation > 0);
}

#[test]
fn test_verify_trade_rate() {
    let (env, client, admin) = setup_test();

    let xlm = String::from_str(&env, "XLM");
    let usdc = String::from_str(&env, "USDC");

    client.set_price(&admin, &xlm, &300_000_000i128, &7); // 30.0 XLM
    client.set_price(&admin, &usdc, &1_000_000i128, &6); // 1.0 USDC

    // 1 XLM should be worth ~30 USDC
    let valid = client.verify_trade_rate(&xlm, &usdc, &1_000_000_000i128, &30_000_000i128, &500);
    assert!(valid);
}

#[test]
fn test_cannot_set_negative_price() {
    let (env, client, admin) = setup_test();

    let asset = String::from_str(&env, "XLM");
    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        client.set_price(&admin, &asset, &(-100i128), &7);
    }));
    assert!(result.is_err());
}
