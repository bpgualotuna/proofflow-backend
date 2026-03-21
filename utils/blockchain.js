const ethers = require('ethers');

async function registerHashOnChain(hash) {
  const provider = new ethers.providers.JsonRpcProvider(process.env.FUJI_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const tx = await wallet.sendTransaction({
    to: wallet.address,
    value: 0,
    data: ethers.utils.hexlify(ethers.utils.toUtf8Bytes(hash))
  });
  
  await tx.wait();
  return tx.hash;
}

module.exports = { registerHashOnChain };
