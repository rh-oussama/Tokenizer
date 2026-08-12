const MULTISIGN_SOURCE_PATH = "contracts/MultiSignWallet.sol";
const MULTISIGN_ARTIFACT_PATH = "artifacts/MultiSignWallet.json";
const CONFIG_PATH = "config.json";

(async () => {
  try {
    // 1. Compile
    console.log("Compiling...");
    await remix.call('solidity', 'compile', MULTISIGN_SOURCE_PATH);
    console.log("Compilation finished");

    // 2. Load artifact
    const artifactContent = await remix.call('fileManager', 'getFile', MULTISIGN_ARTIFACT_PATH);
    const artifact = JSON.parse(artifactContent);

    // 3. Connect to MetaMask
    const provider = new ethers.providers.Web3Provider(web3Provider);
    const signer = provider.getSigner();
    const deployerAddress = await signer.getAddress();
    console.log("Deploying from:", deployerAddress);

    // 4. Deploy
    const factory = new ethers.ContractFactory(
      artifact.abi,
      artifact.data.bytecode.object,
      signer
    );

    const contract = await factory.deploy(); // add constructor args if needed
    const txHash = contract.deployTransaction.hash;

    console.log("Waiting until the transaction is mined...");

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

    const multisignAddress = receipt.contractAddress || contract.address;
    console.log("MULTISIGN ADDRESS:", multisignAddress);


    // 6. Create config.json
    let config = {};
    try {
      const existing = await remix.call('fileManager', 'getFile', CONFIG_PATH);
      config = JSON.parse(existing);
    } catch (e) {
      // file does not exist → will create it
    }

    config.multisignAddress = multisignAddress;
    config.multisigndeployer = deployerAddress;

    await remix.call('fileManager', 'writeFile', CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log("config.json saved/updated");

  } catch (e) {
    console.error("Deployment failed:", e.message || e);
  }
})();