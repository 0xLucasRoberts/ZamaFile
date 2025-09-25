import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const zamaFile = await deploy("ZamaFile", {
    from: deployer,
    args: [],
    log: true,
  });

  console.log(`ZamaFile contract deployed to: ${zamaFile.address}`);
};

export default func;
func.id = "deploy_zamafile";
func.tags = ["ZamaFile"];