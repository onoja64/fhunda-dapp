import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying Fhunda contract...");

  // Get fheUSDT token address from previous deployment
  const fheUSDTDeployment = await deployments.get("fheUSDT");
  const tokenAddress = fheUSDTDeployment.address;

  const fhundaDeployment = await deploy("Fhunda", {
    from: deployer,
    log: true,
    args: [tokenAddress],
  });

  console.log(`Fhunda contract deployed at: ${fhundaDeployment.address}`);
  console.log(`Using fheUSDT token at: ${tokenAddress}`);

  return !fhundaDeployment.newlyDeployed;
};

export default func;

func.id = "deploy_fhunda";
func.tags = ["Fhunda"];
func.dependencies = ["fheUSDT"];
