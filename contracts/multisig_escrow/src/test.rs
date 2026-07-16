#![cfg(test)]

use crate::MultisigEscrow;
use crate::MultisigEscrowClient;
use soroban_sdk::testutils::{Address as _, Events};
use soroban_sdk::{token, Address, Env};

fn setup_test() -> (Env, MultisigEscrowClient, Address, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let signer_a = Address::generate(&env);
    let signer_b = Address::generate(&env);

    let (token_addr, token_client) = {
        let addr = env.register_stellar_asset_contract(admin.clone());
        let client = token::Client::new(&env, &addr);
        (addr, client)
    };

    token_client.mint(&sender, &10_000);

    let contract_id = env.register_contract(None, MultisigEscrow);
    let client = MultisigEscrowClient::new(&env, &contract_id);

    (env, client, sender, recipient, signer_a, signer_b, token_addr)
}

#[test]
fn test_create_escrow() {
    let (_env, client, sender, recipient, signer_a, signer_b, token) = setup_test();

    let escrow_id = client.create_escrow(&token, &1_000, &recipient, &signer_a, &signer_b, &100);
    assert_eq!(escrow_id, 1);

    let escrow = client.get_escrow(&escrow_id);
    assert_eq!(escrow.amount, 1_000);
    assert_eq!(escrow.sender, sender);
    assert_eq!(escrow.recipient, recipient);
    assert!(!escrow.approved_a);
    assert!(!escrow.approved_b);
    assert!(!escrow.released);
    assert!(!escrow.refunded);
}

#[test]
fn test_dual_signature_release() {
    let (_env, client, _sender, recipient, signer_a, signer_b, token) = setup_test();

    let escrow_id = client.create_escrow(&token, &1_000, &recipient, &signer_a, &signer_b, &100);

    client.approve_a(&escrow_id);
    let escrow = client.get_escrow(&escrow_id);
    assert!(escrow.approved_a);
    assert!(!escrow.approved_b);

    client.approve_b(&escrow_id);
    let escrow = client.get_escrow(&escrow_id);
    assert!(escrow.approved_a);
    assert!(escrow.approved_b);

    client.release(&escrow_id);
    let escrow = client.get_escrow(&escrow_id);
    assert!(escrow.released);
}

#[test]
fn test_timelock_refund() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let signer_a = Address::generate(&env);
    let signer_b = Address::generate(&env);

    let token_addr = env.register_stellar_asset_contract(admin.clone());
    let token_client = token::Client::new(&env, &token_addr);
    token_client.mint(&sender, &10_000);

    let contract_id = env.register_contract(None, MultisigEscrow);
    let client = MultisigEscrowClient::new(&env, &contract_id);

    let unlock_time = 500;
    let escrow_id = client.create_escrow(&token_addr, &1_000, &recipient, &signer_a, &signer_b, &unlock_time);

    // Jump ledger time past unlock
    env.ledger().set_timestamp(unlock_time + 1);

    client.refund(&escrow_id);
    let escrow = client.get_escrow(&escrow_id);
    assert!(escrow.refunded);
}

#[test]
fn test_cannot_release_without_approval() {
    let (_env, client, _sender, recipient, signer_a, signer_b, token) = setup_test();

    let escrow_id = client.create_escrow(&token, &1_000, &recipient, &signer_a, &signer_b, &100);

    // Only one approval
    client.approve_a(&escrow_id);

    // Release should fail
    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        client.release(&escrow_id);
    }));
    assert!(result.is_err());
}

#[test]
fn test_cannot_approve_twice() {
    let (_env, client, _sender, recipient, signer_a, signer_b, token) = setup_test();

    let escrow_id = client.create_escrow(&token, &1_000, &recipient, &signer_a, &signer_b, &100);

    client.approve_a(&escrow_id);

    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        client.approve_a(&escrow_id);
    }));
    assert!(result.is_err());
}
