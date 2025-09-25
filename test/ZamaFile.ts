import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("ZamaFile", function () {
  before(function () {
    if (!fhevm.isMock) {
      console.warn("This test suite runs only against the FHEVM mock environment");
      this.skip();
    }
  });

  it("should submit and retrieve an encrypted record", async function () {
    const [deployer, alice] = await ethers.getSigners();

    const factory = await ethers.getContractFactory("ZamaFile");
    const contract = await factory.deploy();
    const address = await contract.getAddress();

    // Prepare two clear addresses (any valid EVM addresses)
    const clearAddr1 = "0x1111111111111111111111111111111111111111";
    const clearAddr2 = "0x2222222222222222222222222222222222222222";

    // Encrypt with relayer SDK (mocked by the plugin)
    const enc = await fhevm
      .createEncryptedInput(address, alice.address)
      .addAddress(clearAddr1)
      .addAddress(clearAddr2)
      .encrypt();

    const tx = await contract
      .connect(alice)
      .submitRecord("myfile.pdf", enc.handles[0], enc.handles[1], enc.inputProof);
    await tx.wait();

    const count = await contract.getRecordCount(alice.address);
    expect(count).to.eq(1n);

    const rec = await contract.getRecord(alice.address, 0);
    expect(rec[0]).to.eq("myfile.pdf");
    expect(rec[1]).to.be.a("bigint"); // timestamp

    // Expect encrypted handles are set (non-zero)
    expect(rec[2]).to.not.eq(ethers.ZeroHash);
    expect(rec[3]).to.not.eq(ethers.ZeroHash);
  });
});
