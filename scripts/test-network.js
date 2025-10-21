const { ethers } = require("hardhat");

async function testNetwork(networkName) {
  console.log(`\n🔍 Testing ${networkName}...`);
  
  try {
    const [signer] = await ethers.getSigners();
    const provider = signer.provider;
    
    // Test basic connection
    const network = await provider.getNetwork();
    console.log(`✅ Connected to ${network.name} (Chain ID: ${network.chainId})`);
    
    // Test account balance
    const balance = await provider.getBalance(signer.address);
    console.log(`✅ Account: ${signer.address}`);
    console.log(`✅ Balance: ${ethers.formatEther(balance)} ETH`);
    
    // Test gas price
    const feeData = await provider.getFeeData();
    console.log(`✅ Gas Price: ${ethers.formatUnits(feeData.gasPrice, "gwei")} gwei`);
    
    // Test block number
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Latest Block: ${blockNumber}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🌐 Testing Base Sepolia Network Connections...");
  
  const networks = [
    "baseSepolia",
    "baseSepoliaBackup", 
    "baseSepoliaAlchemy"
  ];
  
  let workingNetwork = null;
  
  for (const network of networks) {
    try {
      // Temporarily switch network for testing
      hre.changeNetwork(network);
      const success = await testNetwork(network);
      if (success && !workingNetwork) {
        workingNetwork = network;
        console.log(`🎉 ${network} is working!`);
      }
    } catch (error) {
      console.log(`❌ ${network}: ${error.message}`);
    }
  }
  
  if (workingNetwork) {
    console.log(`\n✅ Recommended: Use npm run mint-tokens${workingNetwork === 'baseSepolia' ? '' : ':' + workingNetwork.replace('baseSepolia', '').toLowerCase()}`);
  } else {
    console.log("\n❌ All networks failed. Check your internet connection and try again later.");
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Check your internet connection");
    console.log("2. Verify your .env file has PRIVATE_KEY set");
    console.log("3. Try again in a few minutes (network congestion)");
    console.log("4. Get testnet ETH: https://www.alchemy.com/faucets/base-sepolia");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });