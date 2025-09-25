import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, log } = hre.deployments;

  const deployed = await deploy("ZamaFile", {
    from: deployer,
    log: true,
  });

  log(`ZamaFile contract: ${deployed.address}`);
};
export default func;
func.id = "deploy_zamafile";
func.tags = ["ZamaFile"];

