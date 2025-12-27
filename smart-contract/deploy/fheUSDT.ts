import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const deploymentName = "fheUSDT";

  const fheUSDT = await deploy(deploymentName, {
    from: deployer,
    args: [deployer],
    log: true,
  });

  console.log(`${deploymentName} deployed at ${fheUSDT.address}`);
};

export default func;
func.tags = ["fheUSDT"];
