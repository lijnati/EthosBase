const { ethers } = require("hardhat");

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryOperation(operation, maxRetries = 3, delay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error.message);
      if (i === maxRetries - 1) throw error;
      console.log(`Retrying in ${delay/1000} seconds...`);
      await sleep(delay);
      delay *= 1.5; // Exponential backoff
    }
  }
}

async function main() {
  console.log("🪙 Minting test tokens...");

  const [deployer] = await ethers.getSigners();
  console.log("Minting to:", deployer.address);

  // Check network connection first
  try {
    const network = await deployer.provider.getNetwork();
    console.log("Connected to network:", network.name, "Chain ID:", network.chainId.toString());
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
      throw new Error("Account has no ETH for gas fees");
    }
  } catch (error) {
    console.error("Network connection failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Check your internet connection");
    console.log("2. Try using backup RPC: npm run mint-tokens -- --network baseSepoliaBackup");
    console.log("3. Wait a few minutes and try again");
    return;
  }

  // Contract addresses from deployment
  const USDC_ADDRESS = "0x71C7b5ba984A5f1011c1196a56a8130A8DB40e5E";
  const WETH_ADDRESS = "0x30C13770b937F38F77371Bef884Af08a721880636";

  const MockERC20 = await ethers.getContractFactory("MockERC20");
  
  try {
    // Connect to deployed tokens
    const usdcToken = MockERC20.attach(USDC_ADDRESS);
    const wethToken = MockERC20.attach(WETH_ADDRESS);

    // Get current gas price
    const feeData = await deployer.provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    console.log("Current gas price:", ethers.formatUnits(gasPrice, "gwei"), "gwei");

    console.log("\nMinting USDC...");
    const usdcTx = await retryOperation(async () => {
      return await usdcToken.mint(
        deployer.address, 
        ethers.parseUnits("1000000", 6), // 1M USDC
        { 
          gasLimit: 150000,
          gasPrice: gasPrice
        }
      );
    });
    
    console.log("Waiting for USDC transaction...");
    await usdcTx.wait();
    console.log("✅ USDC minted:", usdcTx.hash);

    console.log("\nMinting WETH...");
    const wethTx = await retryOperation(async () => {
      return await wethToken.mint(
        deployer.address, 
        ethers.parseEther("1000"), // 1000 WETH
        { 
          gasLimit: 150000,
          gasPrice: gasPrice
        }
      );
    });
    
    console.log("Waiting for WETH transaction...");
    await wethTx.wait();
    console.log("✅ WETH minted:", wethTx.hash);

    // Check balances
    console.log("\nChecking balances...");
    const usdcBalance = await retryOperation(() => usdcToken.balanceOf(deployer.address));
    const wethBalance = await retryOperation(() => wethToken.balanceOf(deployer.address));

    console.log("\n💰 Token Balances:");
    console.log("USDC:", ethers.formatUnits(usdcBalance, 6));
    console.log("WETH:", ethers.formatEther(wethBalance));

    console.log("\n🎉 Token minting completed successfully!");

  } catch (error) {
    console.error("\n❌ Minting failed:", error.message);
    
    if (error.message.includes("timeout") || error.message.includes("TIMEOUT")) {
      console.log("\n🔧 Network timeout detected. Try:");
      console.log("1. npm run mint-tokens -- --network baseSepoliaBackup");
      console.log("2. Wait a few minutes and retry");
    } else if (error.message.includes("underpriced")) {
      console.log("\n💡 Gas price too low. The script will retry with current network gas price.");
    } else if (error.message.includes("insufficient funds")) {
      console.log("\n💰 Need more ETH for gas fees. Get testnet ETH from:");
      console.log("https://www.alchemy.com/faucets/base-sepolia");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });