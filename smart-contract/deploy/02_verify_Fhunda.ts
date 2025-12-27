import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments } = hre;
  const fhundaDeployment = await deployments.get("Fhunda");

  console.log("Verifying Fhunda contract...");
  console.log(`Contract address: ${fhundaDeployment.address}`);

  // Skip verification on local networks
  const skipVerification = ["hardhat", "anvil", "localhost"].includes(hre.network.name);

  if (skipVerification) {
    console.log(`Skipping verification on ${hre.network.name} network`);
    return;
  }

  // Wait a few blocks before attempting verification to ensure indexing
  console.log("Waiting for block confirmations before verification...");
  await new Promise((resolve) => setTimeout(resolve, 30000)); // 30 seconds

  try {
    console.log("Attempting to verify contract on block explorer...");
    
    // Get constructor arguments from deployment
    const fheUSDTDeployment = await deployments.get("fheUSDT");
    const tokenAddress = fheUSDTDeployment.address;
    
    await hre.run("verify:verify", {
      address: fhundaDeployment.address,
      constructorArguments: [tokenAddress],
    });
    console.log("Fhunda contract verified successfully!");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("Contract is already verified");
    } else {
      console.error("Verification failed:", error.message);
      // Don't fail the deployment, just warn
      console.warn("⚠️  Contract verification skipped - you can verify manually later");
    }
  }
};

export default func;

func.id = "verify_fhunda";
func.tags = ["Fhunda", "verify"];
func.runAtTheEnd = true;
