#![cfg(test)]

use crate::AmmContract;
use crate::AmmContractClient;
use soroban_sdk::testutils::{Address as _, AuthorizedFunction, Events};
use soroban_sdk::{token, Address, Env};

fn create_token(env: &Env, admin: &Address) -> (Address, token::Client) {
    let token_addr = env.register_stellar_asset_contract(admin.clone());
    let token_client = token::Client::new(env, &token_addr);
    (token_addr, token_client)
}

fn setup_test() -> (Env, AmmContractClient, Address, Address, Address) {
    let env = Env::default();
    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    let (token_a, token_a_client) = create_token(&env, &admin);
    let (token_b, token_b_client) = create_token(&env, &admin);

    // Mint tokens to user
    token_a_client.mint(&user, &1_000_000_000);
    token_b_client.mint(&user, &1_000_000_000);
    // Mint tokens to contract too for swap back
    let contract_id = env.register_contract(None, AmmContract);
    let client = AmmContractClient::new(&env, &contract_id);

    client.initialize(&admin, &token_a, &token_b);

    (env, client, user, token_a, token_b)
}

#[test]
fn test_pool_initialization() {
    let (env, client, _user, token_a, token_b) = setup_test();

    let reserves = client.get_reserves();
    assert_eq!(reserves.reserve_a, 0);
    assert_eq!(reserves.reserve_b, 0);
    assert_eq!(reserves.lp_token_supply, 0);

    // Check init event
    let events = env.events().all();
    let init_events: Vec<_> = events
        .iter()
        .filter(|e| matches!(e.0 .function, AuthorizedFunction::Contract(_)))
        .collect();
    assert!(init_events.len() >= 1);
}

#[test]
fn test_deposit() {
    let (_env, client, user, _token_a, _token_b) = setup_test();

    let lp_tokens = client.deposit(&user, &1_000, &2_000, &1_000, &2_000);
    assert!(lp_tokens > 0);

    let balance = client.get_lp_balance(&user);
    assert_eq!(balance, lp_tokens);

    let reserves = client.get_reserves();
    assert_eq!(reserves.reserve_a, 1_000);
    assert_eq!(reserves.reserve_b, 2_000);
    assert_eq!(reserves.lp_token_supply, lp_tokens);
}

#[test]
fn test_swap_a_to_b() {
    let (_env, client, user, _token_a, _token_b) = setup_test();

    // First deposit to create liquidity
    client.deposit(&user, &100_000, &200_000, &100_000, &200_000);

    // Swap 1_000 token A for token B
    let amount_out = client.swap_a_to_b(&user, &1_000, &0);
    assert!(amount_out > 0);

    let reserves = client.get_reserves();
    assert_eq!(reserves.reserve_a, 100_000 + 1_000);
    assert!(reserves.reserve_b < 200_000);
}

#[test]
fn test_swap_b_to_a() {
    let (_env, client, user, _token_a, _token_b) = setup_test();

    client.deposit(&user, &100_000, &200_000, &100_000, &200_000);

    let amount_out = client.swap_b_to_a(&user, &1_000, &0);
    assert!(amount_out > 0);

    let reserves = client.get_reserves();
    assert_eq!(reserves.reserve_b, 200_000 + 1_000);
    assert!(reserves.reserve_a < 100_000);
}

#[test]
fn test_constant_product_invariant() {
    let (_env, client, user, _token_a, _token_b) = setup_test();

    client.deposit(&user, &100_000, &200_000, &100_000, &200_000);

    let reserves_before = client.get_reserves();
    let k_before = reserves_before.reserve_a * reserves_before.reserve_b;

    client.swap_a_to_b(&user, &5_000, &0);

    let reserves_after = client.get_reserves();
    let k_after = reserves_after.reserve_a * reserves_after.reserve_b;

    // k should increase slightly due to fees
    assert!(k_after >= k_before);
}
