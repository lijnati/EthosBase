const { ethers } = require("hardhat");

async function main() {
  console.log("💰 Checking Token Balances...");

  try {
    const [deployer] = await ethers.getSigners();
    console.log("Account:", deployer.address);

    // Contract addresses
    const USDC_ADDRESS = "0x71C7b5ba984A5f1011c1196a56a8130A8DB40e5E";
    const WETH_ADDRESS = "0x30C13770b937F38F77371Bef884Af08a721880636";

    // Check ETH balance
    const ethBalance = await deployer.provider.getBalance(deployer.address);
    console.log("ETH Balance:", ethers.formatEther(ethBalance));

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    
    // Check USDC balance
    const usdcToken = MockERC20.attach(USDC_ADDRESS);
    const usdcBalance = await usdcToken.balanceOf(deployer.address);
    console.log("USDC Balance:", ethers.formatUnits(usdcBalance, 6));

    // Check WETH balance
    const wethToken = MockERC20.attach(WETH_ADDRESS);
    const wethBalance = await wethToken.balanceOf(deployer.address);
    console.log("WETH Balance:", ethers.formatEther(wethBalance));

    console.log("\n📊 Summary:");
    console.log("============");
    console.log(`ETH:  ${ethers.formatEther(ethBalance)} (for gas)`);
    console.log(`USDC: ${ethers.formatUnits(usdcBalance, 6)} (for lending)`);
    console.log(`WETH: ${ethers.formatEther(wethBalance)} (for collateral)`);

    // Check if ready for testing
    const hasUsdc = usdcBalance > 0n;
    const hasWeth = wethBalance > 0n;
    const hasEth = ethBalance > ethers.parseEther("0.001");

    console.log("\n🎯 Ready for Testing:");
    console.log("=====================");
    console.log(`✅ Has ETH for gas: ${hasEth ? 'Yes' : 'No'}`);
    console.log(`✅ Has USDC for lending: ${hasUsdc ? 'Yes' : 'No'}`);
    console.log(`✅ Has WETH for collateral: ${hasWeth ? 'Yes' : 'No'}`);

    if (hasEth && hasUsdc) {
      console.log("\n🚀 You can test the lending functionality!");
      console.log("Run: npm run frontend");
      if (!hasWeth) {
        console.log("\nNote: You can still test without WETH, or run:");
        console.log("npm run mint-weth-only");
      }
    } else {
      console.log("\n⚠️  Need more tokens for testing:");
      if (!hasEth) console.log("- Get ETH: https://www.alchemy.com/faucets/base-sepolia");
      if (!hasUsdc) console.log("- Run: npm run simple-mint");
    }

  } catch (error) {
    console.error("❌ Error checking balances:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });