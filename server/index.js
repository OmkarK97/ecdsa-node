const express = require("express");
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0471ec1c7412e2c997f90a040b58617486e802e7051d2eed7983f6e2042e30e0ab66ac32f7ac63aaa5f2fd63105bf6e1d334fd57f361743773673b7ead32e8abdb": 100,
  //66678dad5c375ef46478284ebd9a2c914352efc55433a14acf00ce49a33bda8d
  "04e154207b7be100e054eb590a5abdb7c9e399f0f7605805db334423938121f726f5b093b08cdb1d66941a4c2fde9a06cdf20d0c8373b1b2a61d2a106b949c2348": 50,
  //74a284beea09df0b8c40d62fb2bf065966c92edc482586e1f46e932f35ffe166
  "04de402477423e5828691c62582648cbf233a1b2a4a597d19f880303a5f0a2b696515ed0474665c3078ceb0a14fbba5f0e98c6b19b2796112c831b3fdca9629869": 75,
  //3aaebf5430268380d1f1409573c4bf93e955188854e90d1e0f8ee99641351f03
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { sender, recipient, amount, signature, recovery } = req.body;

  if(!signature) res.status(404).send({ message: "Signature was not provided" });
  if(!recovery) res.status(400).send({ message: "recovery was not provided" });

  try {
    const bytes = utf8ToBytes(JSON.stringify({sender, recipient, amount}));
    const hash = keccak256(bytes);

    const sign = new Uint8Array(signature);
    const publicKey = await secp.recoverPublicKey(hash, sign, recovery);

    if(toHex(publicKey) !== sender){
      res.status(400).send({ message: "Signature Invalid" });
    }
   
    setInitialBalance(sender);
    setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
    
  } 
  catch (error) {
    console.log(error.message);
  }
});

  

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
