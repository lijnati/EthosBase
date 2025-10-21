import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from '@coinbase/onchainkit/transaction'
import { useState } from 'react'

export function LoanTransaction({ 
  contracts, 
  onSuccess, 
  onError, 
  disabled = false,
  children 
}) {
  const [transactionId, setTransactionId] = useState(null)

  const handleSuccess = (response) => {
    setTransactionId(response.transactionReceipts?.[0]?.transactionHash)
    onSuccess?.(response)
  }

  return (
    <div className="transaction-wrapper">
      <Transaction
        contracts={contracts}
        onSuccess={handleSuccess}
        onError={onError}
      >
        <TransactionButton
          disabled={disabled}
          className="btn-primary transaction-btn"
        >
          {children}
        </TransactionButton>
        <TransactionSponsor />
        <TransactionStatus>
          <TransactionStatusLabel />
          <TransactionStatusAction />
        </TransactionStatus>
      </Transaction>
      
      {transactionId && (
        <div className="transaction-success">
          <p>✅ Transaction successful!</p>
          <a 
            href={`https://sepolia.basescan.org/tx/${transactionId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transaction-link"
          >
            View on BaseScan
          </a>
        </div>
      )}
    </div>
  )
}

export function RepayLoanTransaction({ 
  contracts, 
  onSuccess, 
  onError, 
  disabled = false 
}) {
  return (
    <LoanTransaction
      contracts={contracts}
      onSuccess={onSuccess}
      onError={onError}
      disabled={disabled}
    >
      Repay Loan
    </LoanTransaction>
  )
}