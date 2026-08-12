const CONFIG_PATH = "config.json";
const TOKEN_ARTIFACT_PATH = "artifacts/OUSS42.json";

(async () => {
  try {
    // 1. Read config
    const config = JSON.parse(await remix.call('fileManager', 'getFile', CONFIG_PATH));
    const { tokenAddress, multisignAddress } = config;

    if (!tokenAddress || !multisignAddress) {
      throw new Error("tokenAddress or multisignAddress missing in config.json");
    }

    // 2. Load token + connect
    const artifact = JSON.parse(await remix.call('fileManager', 'getFile', TOKEN_ARTIFACT_PATH));
    const provider = new ethers.providers.Web3Provider(web3Provider);
    const signer = provider.getSigner();
    const token = new ethers.Contract(tokenAddress, artifact.abi, signer);

    // 3. Transfer ownership
    console.log("Transferring ownership...");
    const tx = await token.transferOwnership(multisignAddress);
    const txHash = tx.hash;
    console.log("Tx hash:", txHash);
    console.log("Waiting until the transaction is mined...");

    // 4. Wait for receipt (same safe way)
    let receipt = null;
    while (receipt === null) {
      try {
        receipt = await provider.send("eth_getTransactionReceipt", [txHash]);
      } catch (err) {}
      if (receipt === null) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (receipt.status !== "0x1" && receipt.status !== 1) {
      throw new Error("Transaction failed / reverted");
    }

    console.log("Ownership transferred to multisig");

  } catch (e) {
    console.error("Failed:", e.message || e);
  }
})();