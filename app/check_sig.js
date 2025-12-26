const { keccak256, toUtf8Bytes } = require("ethers");

const sigs = [
  "contribute(bytes32,bytes32,bytes,bytes)",
  "contribute(uint256,uint256,bytes,bytes)",
  "contribute(uint32,uint64,bytes,bytes)",
  "contribute(bytes,bytes,bytes,bytes)",
];

sigs.forEach((sig) => {
  console.log(`${sig}: ${keccak256(toUtf8Bytes(sig)).slice(0, 10)}`);
});
