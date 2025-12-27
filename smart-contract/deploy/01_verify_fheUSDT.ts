import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments } = hre;
  const fheUSDTDeployment = await deployments.get("fheUSDT");

  console.log("Verifying fheUSDT contract...");
  console.log(`Contract address: ${fheUSDTDeployment.address}`);

  // Skip verification on local networks
  const skipVerification = ["hardhat", "anvil", "localhost"].includes(hre.network.name);

  if (skipVerification) {
    console.log(`Skipping verification on ${hre.network.name} network`);
    return;
  }

  // Wait longer before attempting verification to ensure indexing
  console.log("Waiting for block confirmations before verification...");
  await new Promise((resolve) => setTimeout(resolve, 60000)); // 60 seconds

  // Retry logic for verification
  const maxRetries = 3;
  let retries = 0;
  let verified = false;

  while (retries < maxRetries && !verified) {
    try {
      console.log(`Attempting to verify contract on block explorer (attempt ${retries + 1}/${maxRetries})...`);
      
      // Get deployer address from deployment
      const deployer = fheUSDTDeployment.args?.[0] || (await hre.getNamedAccounts()).deployer;
      
      await hre.run("verify:verify", {
        address: fheUSDTDeployment.address,
        constructorArguments: [deployer],
      });
      console.log("✅ fheUSDT contract verified successfully!");
      verified = true;
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract is already verified");
        verified = true;
      } else if (
        error.message.includes("timeout") ||
        error.message.includes("Connect Timeout") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("ETIMEDOUT")
      ) {
        retries++;
        if (retries < maxRetries) {
          const waitTime = 10000 * retries; // Exponential backoff: 10s, 20s, 30s
          console.warn(`⚠️  Network timeout. Waiting ${waitTime / 1000}s before retry...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        } else {
          console.warn("⚠️  Verification timed out after multiple attempts - you can verify manually later");
          console.warn("   Run: npx hardhat verify --network sepolia <contract_address> <deployer_address>");
        }
      } else {
        console.error("Verification failed:", error.message);
        console.warn("⚠️  Contract verification skipped - you can verify manually later");
      }
    }
  }
};

export default func;

func.id = "verify_fheusdt";
func.tags = ["fheUSDT", "verify"];
func.runAtTheEnd = true;
