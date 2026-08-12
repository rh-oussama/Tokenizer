const CONFIG_PATH = "config.json";
const MULTISIGN_ARTIFACT_PATH = "artifacts/MultiSignWallet.json";
const TOKEN_ARTIFACT_PATH = "artifacts/OUSS42.json";

const MINT_TO = "0x5C9B0c99609495199ebF6051873F975622f171f8";
const MINT_AMOUNT = "1000";

// sepoliaeth: 11155111
(async () => {
  try {
    // 1. Read config
    const config = JSON.parse(await remix.call('fileManager', 'getFile', CONFIG_PATH));
    const { tokenAddress, multisignAddress } = config;

    if (!tokenAddress || !multisignAddress) {
      throw new Error("tokenAddress or multisignAddress missing in config.json");
    }

    console.log("Token:", tokenAddress);
    console.log("Multisig:", multisignAddress);

    // 2. Connect
    const provider = new ethers.providers.Web3Provider(web3Provider);
    const signer = provider.getSigner();
    console.log("From:", await signer.getAddress());

    // 3. Encode mint(address,uint256)
    const tokenArtifact = JSON.parse(await remix.call('fileManager', 'getFile', TOKEN_ARTIFACT_PATH));
    const tokenInterface = new ethers.utils.Interface(tokenArtifact.abi);
    const amount = ethers.utils.parseUnits(MINT_AMOUNT, 18);
    const data = tokenInterface.encodeFunctionData("mint", [MINT_TO, amount]);

    console.log("Mint to:", MINT_TO);
    console.log("Amount:", MINT_AMOUNT, "tokens");

    // 4. Submit on multisig
    const multiArtifact = JSON.parse(await remix.call('fileManager', 'getFile', MULTISIGN_ARTIFACT_PATH));
    const multisig = new ethers.Contract(multisignAddress, multiArtifact.abi, signer);

    console.log("Submitting mint transaction to multisig...");
    const tx = await multisig.submitTransaction(tokenAddress, data);
    const txHash = tx.hash;
    console.log("Tx hash:", txHash);
    console.log("Waiting until mined...");

    // 5. Wait for receipt
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
    
  } catch (e) {
    console.error("Failed:", e.message || e);
  }
})();