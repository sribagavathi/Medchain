"""
MedChain - Hyperledger Fabric style Blockchain Simulator
--------------------------------------------------------

This lightweight simulator mimics two core Fabric concepts:

1)  The **Blockchain** – an immutable, append-only chain of blocks.
2)  The **World State** – a current key–value store (latest view).

It supports basic drug-batch commands:
    • createDrugBatch   (CREATE_BATCH)
    • updateBatchStatus (UPDATE_STATUS)

Both commands are written to the blockchain and reflected in
`world_state`.

Author: MedChain Mavericks - Infosys Global Hackathon 2025
"""

from __future__ import annotations

import hashlib
import json
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, TypedDict


def utc_iso() -> str:
    """Return current UTC timestamp in ISO-8601 format."""
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


# ---------------------------------------------------------------------------#
# Block & Transaction typing
# ---------------------------------------------------------------------------#
class Transaction(TypedDict):
    tx_id: str
    type: str
    payload: Dict
    timestamp: str


class Block:
    """Represents an immutable block in the blockchain."""

    def __init__(self, index: int, transactions: List[Transaction], previous_hash: str):
        self.index = index
        self.timestamp: str = utc_iso()
        self.transactions: List[Transaction] = transactions
        self.previous_hash = previous_hash
        self.nonce = 0
        self.hash: str = self._calculate_hash()

    # --------------------------------------------------------------------- #
    # Proof-of-Work (extremely low difficulty – for demo only)
    # --------------------------------------------------------------------- #
    DIFFICULTY = 2  # leading ‘00’

    def _calculate_hash(self) -> str:
        block_string = json.dumps(
            {
                "index": self.index,
                "timestamp": self.timestamp,
                "transactions": self.transactions,
                "previous_hash": self.previous_hash,
                "nonce": self.nonce,
            },
            sort_keys=True,
            separators=(",", ":"),
        )
        return hashlib.sha256(block_string.encode()).hexdigest()

    def mine(self) -> None:
        target = "0" * Block.DIFFICULTY
        while not self.hash.startswith(target):
            self.nonce += 1
            self.hash = self._calculate_hash()

    # Helpful representation when printing / debugging
    def summary(self) -> Dict:
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "hash": self.hash,
            "previous_hash": self.previous_hash,
            "transactions": self.transactions,
        }


# ---------------------------------------------------------------------------#
# Blockchain Simulator
# ---------------------------------------------------------------------------#
class MedChainBlockchain:
    """
    A minimal Fabric-like blockchain with:

        • chain         -> list of Block
        • pending_txs   -> list awaiting mining
        • world_state   -> dict keyed by batch_id
    """

    # --------------------------------------------------------------------- #
    # Constructor / Genesis
    # --------------------------------------------------------------------- #
    def __init__(self) -> None:
        self.chain: List[Block] = []
        self.pending_transactions: List[Transaction] = []
        self.world_state: Dict[str, Dict] = {}  # latest KV store
        self._create_genesis_block()

    def _create_genesis_block(self) -> None:
        genesis = Block(index=0, transactions=[], previous_hash="0" * 64)
        # Genesis block is pre-mined so viewers show hash beginning with '00'
        genesis.mine()
        self.chain.append(genesis)

    # --------------------------------------------------------------------- #
    # Internal helpers
    # --------------------------------------------------------------------- #
    def _new_tx(self, tx_type: str, payload: Dict) -> Transaction:
        tx_id = f"TX-{int(time.time() * 1000)}-{hashlib.md5(json.dumps(payload, sort_keys=True).encode()).hexdigest()[:8]}"
        return {
            "tx_id": tx_id,
            "type": tx_type,
            "payload": payload,
            "timestamp": utc_iso(),
        }

    def _mine_pending(self) -> str:
        """Mine all current pending transactions into a new block."""
        if not self.pending_transactions:
            return self.chain[-1].hash  # nothing to mine

        new_block = Block(
            index=len(self.chain),
            transactions=self.pending_transactions.copy(),
            previous_hash=self.chain[-1].hash,
        )
        new_block.mine()
        self.chain.append(new_block)
        self.pending_transactions.clear()
        return new_block.hash

    # --------------------------------------------------------------------- #
    # Public API – domain commands
    # --------------------------------------------------------------------- #
    def create_drug_batch(
        self,
        batch_id: str,
        drug_name: str,
        manufacturer: str,
        quantity: int,
        status: str = "pending",
    ) -> str:
        payload = {
            "batch_id": batch_id,
            "drug_name": drug_name,
            "manufacturer": manufacturer,
            "quantity": quantity,
            "status": status,
        }
        tx = self._new_tx("CREATE_BATCH", payload)
        self.pending_transactions.append(tx)

        # Update world state immediately (Fabric endorsing peers do similar)
        self.world_state[batch_id] = {**payload, "timestamp": tx["timestamp"]}

        return tx["tx_id"]

    def update_batch_status(self, batch_id: str, status: str) -> Optional[str]:
        if batch_id not in self.world_state:
            raise ValueError(f"Batch {batch_id} does not exist in world state")

        payload = {"batch_id": batch_id, "status": status}
        tx = self._new_tx("UPDATE_STATUS", payload)
        self.pending_transactions.append(tx)

        # Mutate world state
        self.world_state[batch_id]["status"] = status
        self.world_state[batch_id]["timestamp"] = tx["timestamp"]
        return tx["tx_id"]

    # --------------------------------------------------------------------- #
    # Convenience methods for UI / visualisation
    # --------------------------------------------------------------------- #
    def mine(self) -> str:
        """Public wrapper to mine pending txs."""
        return self._mine_pending()

    def blockchain_view(self) -> List[Dict]:
        """Return a list of block summaries (for front-end rendering)."""
        return [blk.summary() for blk in self.chain]

    def world_state_view(self) -> Dict:
        """Return a deep-copied world state (safe for JSON)."""
        return json.loads(json.dumps(self.world_state))

    # --------------------------------------------------------------------- #
    # Simple demo run when executed directly
    # --------------------------------------------------------------------- #
    def _demo(self) -> None:
        print("== MedChain Blockchain Demo ==")
        self.create_drug_batch("batch001", "Paracetamol", "Acme Pharma", 1000)
        self.create_drug_batch("batch002", "Ibuprofen", "Beta Pharma", 500, status="waiting")
        self.mine()

        self.update_batch_status("batch001", "waiting")
        self.mine()
        self.update_batch_status("batch001", "success")
        self.mine()

        print("\n-- Blockchain View --")
        for blk in self.blockchain_view():
            print(json.dumps(blk, indent=2))

        print("\n-- World State View --")
        print(json.dumps(self.world_state_view(), indent=2))


if __name__ == "__main__":
    # Running `python scripts/blockchain_simulator.py` shows a small demo
    bc = MedChainBlockchain()
    bc._demo()
