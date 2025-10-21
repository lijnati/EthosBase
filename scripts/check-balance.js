const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Base Sepolia Balance...\n");

  try {
    // Get the signer
    const [signer] = await ethers.getSigners();
    const address = await signer.getAddress();
    
    console.log("Address:", address);
    
    // Get balance
    const balance = await signer.provider.getBalance(address);
    const balanceEth = ethers.formatEther(balance);
    
    console.log("Balance:", balanceEth, "ETH");
    
    // Estimate deployment cost
    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    const deploymentData = ReputationSystem.getDeployTransaction();
    const gasEstimate = await signer.estimateGas(deploymentData);
    const gasPrice = await signer.provider.getFeeData();
    
    const estimatedCost = gasEstimate * gasPrice.gasPrice;
    const estimatedCostEth = ethers.formatEther(estimatedCost);
    
    console.log("Estimated deployment cost:", estimatedCostEth, "ETH");
    
    if (balance >= estimatedCost) {
      console.log("✅ Sufficient balance for deployment!");
    } else {
      const needed = estimatedCost - balance;
      const neededEth = ethers.formatEther(needed);
      console.log("❌ Insufficient balance!");
      console.log("Need additional:", neededEth, "ETH");
      
      console.log("\n🚰 Get testnet ETH from these faucets:");
      console.log("=====================================");
      console.log("1. Alchemy Base Sepolia Faucet:");
      console.log("   https://www.alchemy.com/faucets/base-sepolia");
      console.log("\n2. Coinbase Faucet:");
      console.log("   https://coinbase.com/faucets/base-ethereum-sepolia-faucet");
      console.log("\n3. QuickNode Faucet:");
      console.log("   https://faucet.quicknode.com/base/sepolia");
      console.log("\nYour address:", address);
      console.log("\n⏰ Faucets typically provide 0.1-0.5 ETH per request");
      console.log("💡 You can also bridge Sepolia ETH to Base Sepolia via the Base bridge");
    }
    
  } catch (error) {
    console.error("Error checking balance:", error.message);
    
    if (error.message.includes("network")) {
      console.log("\n🔧 Network Configuration Issue:");
      console.log("Make sure you're connected to Base Sepolia testnet");
      console.log("Chain ID: 84532");
      console.log("RPC URL: https://sepolia.base.org");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });