import { useState } from "react";
import * as secp from "ethereum-cryptography/secp256k1";
import { utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import server from "./server";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [transactionDetails, setTransactionDetails] = useState(null);

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const data = { sender: address, recipient, amount: parseInt(sendAmount) };
    const bytes = utf8ToBytes(JSON.stringify(data));
    const hash = keccak256(bytes);

    const signature = await secp.sign(hash, privateKey, { recovered: true });
    console.log(signature[0]);

    var sign = Array.from(signature[0]);

    try {
      const {
        data: { balance, transaction },
      } = await server.post(`send`, {
        ...data,
        signature: sign,
        recovery: signature[1],
      });
      setBalance(balance);
      setTransactionDetails(transaction);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <div>
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <button type="submit" className="button" value="Transfer">
        Transfer
      </button>
    </form>
    {!transactionDetails ?? (
      <div>
        <h2>Transaction Details</h2>
        <p>Sender: {transactionDetails.sender}</p>
        <p>Recipient: {transactionDetails.recipient}</p>
        <p>Amount: {transactionDetails.amount}</p>
      </div>
    )}
    </div>
  );
}

export default Transfer;
