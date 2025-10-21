const { ethers } = require("hardhat");

async function main() {
    console.log("🪙 Minting WETH only...");

    try {
        const [deployer] = await ethers.getSigners();
        console.log("Minting to:", deployer.address);

        const WETH_ADDRESS = "0x30C13770b937F38F77371Bef884Af08a721880636";

        // Check network
        const network = await deployer.provider.getNetwork();
        console.log("Network:", network.chainId.toString());

        // Check balance
        const balance = await deployer.provider.getBalance(deployer.address);
        console.log("ETH Balance:", ethers.formatEther(balance));

        const MockERC20 = await ethers.getContractFactory("MockERC20");
        const wethToken = MockERC20.attach(WETH_ADDRESS);

        // Check current WETH balance
        const currentWeth = await wethToken.balanceOf(deployer.address);
        console.log("Current WETH:", ethers.formatEther(currentWeth));

        // Get gas price
        const feeData = await deployer.provider.getFeeData();
        console.log("Gas Price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");

        // Mint WETH with retry
        console.log("\nMinting 100 WETH...");

        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                attempts++;
                console.log(`Attempt ${attempts}/${maxAttempts}...`);

                const wethTx = await wethToken.mint(
                    deployer.address,
                    ethers.parseEther("100"),
                    {
                        gasLimit: 200000,
                        gasPrice: feeData.gasPrice
                    }
                );

                console.log("WETH TX:", wethTx.hash);
                console.log("Waiting for confirmation...");

                await wethTx.wait(1);
                console.log("✅ WETH minted successfully!");
                break;

            } catch (error) {
                console.log(`❌ Attempt ${attempts} failed:`, error.message);

                if (attempts < maxAttempts) {
                    console.log("Retrying in 3 seconds...");
                    await new Promise(resolve => setTimeout(resolve, 3000));
                } else {
                    throw error;
                }
            }
        }

        // Check final balance
        const finalWeth = await wethToken.balanceOf(deployer.address);
        console.log("\n💰 Final WETH Balance:", ethers.formatEther(finalWeth));
        console.log("🎉 WETH minting completed!");

    } catch (error) {
        console.error("\n❌ Final Error:", error.message);
        console.log("\n🔧 If this keeps failing, try:");
        console.log("1. npm run mint-weth-only -- --network baseSepoliaBackup");
        console.log("2. npm run mint-weth-only -- --network baseSepoliaAlchemy");
        console.log("3. Wait 10 minutes and try again");
        console.log("\nNote: Your USDC minting was successful, so you can still test the app!");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });