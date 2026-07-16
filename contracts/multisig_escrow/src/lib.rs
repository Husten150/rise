#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, log, Address, BytesN, Env, Vec,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Escrow {
    pub token: Address,
    pub amount: i128,
    pub sender: Address,
    pub recipient: Address,
    pub signer_a: Address,
    pub signer_b: Address,
    pub approved_a: bool,
    pub approved_b: bool,
    pub unlock_time: u64,
    pub released: bool,
    pub refunded: bool,
}

#[contracttype]
pub enum DataKey {
    Escrow(u64),
    NextId,
}

#[contract]
pub struct MultisigEscrow;

#[contractimpl]
impl MultisigEscrow {
    pub fn create_escrow(
        env: Env,
        token: Address,
        amount: i128,
        recipient: Address,
        signer_a: Address,
        signer_b: Address,
        unlock_time: u64,
    ) -> u64 {
        let sender: Address = env.invoker();
        sender.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextId)
            .unwrap_or(1);

        let escrow = Escrow {
            token,
            amount,
            sender: sender.clone(),
            recipient,
            signer_a,
            signer_b,
            approved_a: false,
            approved_b: false,
            unlock_time,
            released: false,
            refunded: false,
        };

        env.storage().instance().set(&DataKey::Escrow(id), &escrow);
        env.storage().instance().set(&DataKey::NextId, &(id + 1));

        // Transfer tokens from sender to this contract
        let token_client = soroban_sdk::token::Client::new(&env, &escrow.token);
        token_client.transfer(&sender, &env.current_contract_address(), &amount);

        log!(
            &env,
            "Escrow created: id={}, sender={}, recipient={}, amount={}",
            id,
            sender,
            escrow.recipient,
            amount
        );

        id
    }

    pub fn approve_a(env: Env, escrow_id: u64) {
        let mut escrow: Escrow = env
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id))
            .unwrap_or_else(|| panic!("escrow not found"));

        if escrow.released || escrow.refunded {
            panic!("escrow already finalized");
        }

        escrow.signer_a.require_auth();

        if escrow.approved_a {
            panic!("signer_a already approved");
        }

        escrow.approved_a = true;
        env.storage()
            .instance()
            .set(&DataKey::Escrow(escrow_id), &escrow);

        log!(&env, "Escrow {} approved by signer_a", escrow_id);
    }

    pub fn approve_b(env: Env, escrow_id: u64) {
        let mut escrow: Escrow = env
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id))
            .unwrap_or_else(|| panic!("escrow not found"));

        if escrow.released || escrow.refunded {
            panic!("escrow already finalized");
        }

        escrow.signer_b.require_auth();

        if escrow.approved_b {
            panic!("signer_b already approved");
        }

        escrow.approved_b = true;
        env.storage()
            .instance()
            .set(&DataKey::Escrow(escrow_id), &escrow);

        log!(&env, "Escrow {} approved by signer_b", escrow_id);
    }

    pub fn release(env: Env, escrow_id: u64) {
        let mut escrow: Escrow = env
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id))
            .unwrap_or_else(|| panic!("escrow not found"));

        if escrow.released || escrow.refunded {
            panic!("escrow already finalized");
        }

        if !escrow.approved_a || !escrow.approved_b {
            panic!("both signatures required before release");
        }

        escrow.released = true;
        env.storage()
            .instance()
            .set(&DataKey::Escrow(escrow_id), &escrow);

        let token_client = soroban_sdk::token::Client::new(&env, &escrow.token);
        token_client.transfer(
            &env.current_contract_address(),
            &escrow.recipient,
            &escrow.amount,
        );

        log!(
            &env,
            "Escrow {} released: {} tokens sent to {}",
            escrow_id,
            escrow.amount,
            escrow.recipient
        );
    }

    pub fn refund(env: Env, escrow_id: u64) {
        let escrow: Escrow = env
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id))
            .unwrap_or_else(|| panic!("escrow not found"));

        if escrow.released || escrow.refunded {
            panic!("escrow already finalized");
        }

        if escrow.approved_a && escrow.approved_b {
            panic!("cannot refund after both approvals, use release instead");
        }

        let ledger_time = env.ledger().timestamp();
        if ledger_time < escrow.unlock_time {
            panic!("timelock not yet expired");
        }

        let mut updated = escrow.clone();
        updated.refunded = true;
        env.storage()
            .instance()
            .set(&DataKey::Escrow(escrow_id), &updated);

        let token_client = soroban_sdk::token::Client::new(&env, &escrow.token);
        token_client.transfer(
            &env.current_contract_address(),
            &escrow.sender,
            &escrow.amount,
        );

        log!(
            &env,
            "Escrow {} refunded: {} tokens returned to {}",
            escrow_id,
            escrow.amount,
            escrow.sender
        );
    }

    pub fn get_escrow(env: Env, escrow_id: u64) -> Escrow {
        env.storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id))
            .unwrap_or_else(|| panic!("escrow not found"))
    }
}

#[cfg(test)]
mod test;
