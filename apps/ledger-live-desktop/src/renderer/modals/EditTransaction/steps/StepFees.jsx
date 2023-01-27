// @flow

import React, { Fragment, PureComponent } from "react";
import { Trans } from "react-i18next";
import { getMainAccount } from "@ledgerhq/live-common/account/index";
import Box from "~/renderer/components/Box";
import Button from "~/renderer/components/Button";
import CurrencyDownStatusAlert from "~/renderer/components/CurrencyDownStatusAlert";
import ErrorBanner from "~/renderer/components/ErrorBanner";
import Alert from "~/renderer/components/Alert";
import SendAmountFields from "../SendAmountFields";
import type { StepProps } from "../types";
import { BigNumber } from "bignumber.js";
import { GasFeeLowerThanOldTx, PriorityFeeLowerThanOldTx } from "@ledgerhq/errors";
import TranslatedError from "~/renderer/components/TranslatedError";
import { EIP1559ShouldBeUsed } from "@ledgerhq/live-common/families/ethereum/transaction";

const StepFees = (props: StepProps) => {
  const {
    t,
    account,
    parentAccount,
    transaction,
    onChangeTransaction,
    error,
    status,
    bridgePending,
    updateTransaction,
    transactionRaw,
  } = props;
  const mainAccount = account ? getMainAccount(account, parentAccount) : null;
  const floatValue = BigNumber(transactionRaw.estimatedGasLimit)
    .times(transactionRaw.maxFeePerGas)
    .div(new BigNumber(10).pow(mainAccount.unit.magnitude));

  return (
    <Box flow={4}>
      {mainAccount ? <CurrencyDownStatusAlert currencies={[mainAccount.currency]} /> : null}
      {error ? <ErrorBanner error={error} /> : null}
      {account && transaction && mainAccount && (
        <Fragment key={account.id}>
          <SendAmountFields
            account={mainAccount}
            status={status}
            transaction={transaction}
            onChange={onChangeTransaction}
            bridgePending={bridgePending}
            updateTransaction={updateTransaction}
            transactionRaw={transactionRaw}
          />
        </Fragment>
      )}
      <Alert type="primary">
        <div>{`${t("operation.edit.previousFeesInfo")} ${floatValue} ${
          mainAccount.currency.ticker
        }`}</div>
      </Alert>
    </Box>
  );
};

export class StepFeesFooter extends PureComponent<StepProps> {
  onNext = async () => {
    const { transitionTo } = this.props;
    transitionTo("summary");
  };

  render() {
    const { transaction, bridgePending, transactionRaw, account } = this.props;
    let ifGasFeeValid = true;
    if (EIP1559ShouldBeUsed(account.currency)) {
      ifGasFeeValid = BigNumber(transaction.maxPriorityFeePerGas).isGreaterThan(
        transactionRaw.maxPriorityFeePerGas,
      );
    } else {
      ifGasFeeValid = BigNumber(transaction.gasPrice).isGreaterThan(transactionRaw.gasPrice);
    }
    return (
      <>
        {ifGasFeeValid ? null : (
          <Alert type={"error"}>
            <TranslatedError
              error={
                EIP1559ShouldBeUsed(account.currency)
                  ? new PriorityFeeLowerThanOldTx()
                  : new GasFeeLowerThanOldTx()
              }
            />
          </Alert>
        )}
        <Button
          id={"send-amount-continue-button"}
          isLoading={bridgePending}
          primary
          disabled={!ifGasFeeValid}
          onClick={this.onNext}
        >
          <Trans i18nKey="common.continue" />
        </Button>
      </>
    );
  }
}

export default StepFees;
