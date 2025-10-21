const { ethers } = require("hardhat");

async function main() {
  console.log("🪙 Simple Token Minting...");

  try {
    const [deployer] = await ethers.getSigners();
    console.log("Minting to:", deployer.address);

    // Contract addresses
    const USDC_ADDRESS = "0x71C7b5ba984A5f1011c1196a56a8130A8DB40e5E";
    const WETH_ADDRESS = "0x30C13770b937F38F77371Bef884Af08a721880636";

    // Check network
    const network = await deployer.provider.getNetwork();
    console.log("Network:", network.chainId.toString());

    if (network.chainId !== 84532n) {
      throw new Error("Wrong network! Please use Base Sepolia (84532)");
    }

    // Check balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("ETH Balance:", ethers.formatEther(balance));

    if (balance === 0n) {
      throw new Error("No ETH for gas! Get testnet ETH from: https://www.alchemy.com/faucets/base-sepolia");
    }

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdcToken = MockERC20.attach(USDC_ADDRESS);
    const wethToken = MockERC20.attach(WETH_ADDRESS);

    // Get gas price
    const feeData = await deployer.provider.getFeeData();
    console.log("Gas Price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");

    // Mint USDC
    console.log("\nMinting 100,000 USDC...");
    const usdcTx = await usdcToken.mint(
      deployer.address,
      ethers.parseUnits("100000", 6), // 100K USDC (smaller amount)
      {
        gasLimit: 200000,
        gasPrice: feeData.gasPrice
      }
    );
    
    console.log("USDC TX:", usdcTx.hash);
    await usdcTx.wait(1);
    console.log("✅ USDC minted!");

    // Mint WETH
    console.log("\nMinting 100 WETH...");
    const wethTx = await wethToken.mint(
      deployer.address,
      ethers.parseEther("100"), // 100 WETH (smaller amount)
      {
        gasLimit: 200000,
        gasPrice: feeData.gasPrice
      }
    );
    
    console.log("WETH TX:", wethTx.hash);
    await wethTx.wait(1);
    console.log("✅ WETH minted!");

    // Check final balances
    const usdcBalance = await usdcToken.balanceOf(deployer.address);
    const wethBalance = await wethToken.balanceOf(deployer.address);

    console.log("\n💰 Final Balances:");
    console.log("USDC:", ethers.formatUnits(usdcBalance, 6));
    console.log("WETH:", ethers.formatEther(wethBalance));
    console.log("\n🎉 Minting completed!");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    
    if (error.message.includes("timeout") || error.code === 'NETWORK_ERROR') {
      console.log("\n🔧 Network issue detected. Try:");
      console.log("1. npm run simple-mint -- --network baseSepoliaBackup");
      console.log("2. npm run simple-mint -- --network baseSepoliaAlchemy");
      console.log("3. Wait 5 minutes and try again");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });