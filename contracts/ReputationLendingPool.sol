// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ReputationSystem.sol";
import "./ReputationGatedAccess.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ReputationLendingPool is Ownable, ReentrancyGuard {
    ReputationSystem public reputationSystem;
    ReputationGatedAccess public accessControl;
    IERC20 public lendingToken;
    IERC20 public collateralToken;
    
    struct Loan {
        uint256 amount;
        uint256 collateral;
        uint256 interestRate;
        uint256 startTime;
        uint256 dueDate;
        bool isActive;
        bool isRepaid;
    }
    
    mapping(address => Loan) public loans;
    mapping(address => uint256) public deposits;
    
    uint256 public totalDeposits;
    uint256 public totalLoans;
    uint256 public constant LOAN_DURATION = 30 days;
    
    event LoanIssued(address indexed borrower, uint256 amount, uint256 collateral);
    event LoanRepaid(address indexed borrower, uint256 amount, uint256 interest);
    event LoanDefaulted(address indexed borrower, uint256 amount);
    event Deposited(address indexed lender, uint256 amount);
    event Withdrawn(address indexed lender, uint256 amount);
    
    constructor(
        address _reputationSystem,
        address _accessControl,
        address _lendingToken,
        address _collateralToken
    ) Ownable(msg.sender) {
        reputationSystem = ReputationSystem(_reputationSystem);
        accessControl = ReputationGatedAccess(_accessControl);
        lendingToken = IERC20(_lendingToken);
        collateralToken = IERC20(_collateralToken);
    }
    
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be positive");
        
        lendingToken.transferFrom(msg.sender, address(this), amount);
        deposits[msg.sender] += amount;
        totalDeposits += amount;
        
        emit Deposited(msg.sender, amount);
    }
    
    function withdraw(uint256 amount) external nonReentrant {
        require(deposits[msg.sender] >= amount, "Insufficient balance");
        require(totalDeposits - totalLoans >= amount, "Insufficient liquidity");
        
        deposits[msg.sender] -= amount;
        totalDeposits -= amount;
        lendingToken.transfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
    }
    
    function requestLoan(uint256 amount) external nonReentrant {
        require(!loans[msg.sender].isActive, "Existing loan active");
        require(amount > 0, "Amount must be positive");
        
        // Check reputation-based access
        (
            bool approved,
            uint256 maxAmount,
            uint256 requiredCollateral,
            uint256 interestRate
        ) = accessControl.calculateLoanTerms(msg.sender, amount);
        
        require(approved, "Loan not approved");
        require(amount <= maxAmount, "Amount exceeds limit");
        require(totalDeposits - totalLoans >= amount, "Insufficient liquidity");
        
        // Transfer collateral
        collateralToken.transferFrom(msg.sender, address(this), requiredCollateral);
        
        // Issue loan
        loans[msg.sender] = Loan({
            amount: amount,
            collateral: requiredCollateral,
            interestRate: interestRate,
            startTime: block.timestamp,
            dueDate: block.timestamp + LOAN_DURATION,
            isActive: true,
            isRepaid: false
        });
        
        totalLoans += amount;
        lendingToken.transfer(msg.sender, amount);
        
        emit LoanIssued(msg.sender, amount, requiredCollateral);
    }
    
    function repayLoan() external nonReentrant {
        Loan storage loan = loans[msg.sender];
        require(loan.isActive, "No active loan");
        
        uint256 interest = calculateInterest(msg.sender);
        uint256 totalRepayment = loan.amount + interest;
        
        // Transfer repayment
        lendingToken.transferFrom(msg.sender, address(this), totalRepayment);
        
        // Return collateral
        collateralToken.transfer(msg.sender, loan.collateral);
        
        // Update loan status
        loan.isActive = false;
        loan.isRepaid = true;
        totalLoans -= loan.amount;
        
        // Update reputation - positive for on-time repayment
        bool onTime = block.timestamp <= loan.dueDate;
        int256 scoreChange = onTime ? int256(50) : int256(20);
        
        reputationSystem.updateReputation(
            msg.sender,
            ReputationSystem.ActionType.LOAN_REPAYMENT,
            scoreChange,
            onTime ? "On-time loan repayment" : "Late loan repayment"
        );
        
        emit LoanRepaid(msg.sender, loan.amount, interest);
    }
    
    function liquidateLoan(address borrower) external nonReentrant {
        Loan storage loan = loans[borrower];
        require(loan.isActive, "No active loan");
        require(block.timestamp > loan.dueDate + 7 days, "Grace period not over");
        
        // Mark as defaulted
        loan.isActive = false;
        totalLoans -= loan.amount;
        
        // Liquidate collateral (simplified - would normally use DEX)
        // For demo, we just keep the collateral
        
        // Update reputation - negative for default
        reputationSystem.updateReputation(
            borrower,
            ReputationSystem.ActionType.LOAN_DEFAULT,
            -100,
            "Loan default and liquidation"
        );
        
        emit LoanDefaulted(borrower, loan.amount);
    }
    
    function calculateInterest(address borrower) public view returns (uint256) {
        Loan storage loan = loans[borrower];
        if (!loan.isActive) return 0;
        
        uint256 timeElapsed = block.timestamp - loan.startTime;
        uint256 annualInterest = (loan.amount * loan.interestRate) / 10000;
        return (annualInterest * timeElapsed) / 365 days;
    }
    
    function getLoanDetails(address borrower) external view returns (
        uint256 amount,
        uint256 collateral,
        uint256 interestRate,
        uint256 dueDate,
        bool isActive,
        uint256 currentInterest
    ) {
        Loan storage loan = loans[borrower];
        return (
            loan.amount,
            loan.collateral,
            loan.interestRate,
            loan.dueDate,
            loan.isActive,
            calculateInterest(borrower)
        );
    }
}