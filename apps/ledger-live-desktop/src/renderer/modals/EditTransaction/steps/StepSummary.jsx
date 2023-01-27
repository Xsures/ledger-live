// @flow

import React, { PureComponent } from "react";
import { Trans } from "react-i18next";
import styled from "styled-components";
import {
  getAccountCurrency,
  getAccountName,
  getAccountUnit,
  getMainAccount,
} from "@ledgerhq/live-common/account/index";
import Box from "~/renderer/components/Box";
import Button from "~/renderer/components/Button";
import CryptoCurrencyIcon from "~/renderer/components/CryptoCurrencyIcon";
import Ellipsis from "~/renderer/components/Ellipsis";
import FormattedVal from "~/renderer/components/FormattedVal";
import Text from "~/renderer/components/Text";
import IconQrCode from "~/renderer/icons/QrCode";
import IconWallet from "~/renderer/icons/Wallet";
import { rgba } from "~/renderer/styles/helpers";
import CounterValue from "~/renderer/components/CounterValue";
import type { ThemedComponent } from "~/renderer/styles/StyleProvider";
import type { StepProps } from "../types";
import AccountTagDerivationMode from "~/renderer/components/AccountTagDerivationMode";
import { EIP1559ShouldBeUsed } from "@ledgerhq/live-common/families/ethereum/transaction";
import { BigNumber } from "bignumber.js";

const FromToWrapper: ThemedComponent<{}> = styled.div``;
const Circle: ThemedComponent<{}> = styled.div`
  height: 32px;
  width: 32px;
  border-radius: 32px;
  background-color: ${p => rgba(p.theme.colors.palette.primary.main, 0.1)};
  color: ${p => p.theme.colors.palette.primary.main};
  align-items: center;
  display: flex;
  justify-content: center;
  margin-right: 12px;
`;
const VerticalSeparator: ThemedComponent<{}> = styled.div`
  height: 18px;
  background: ${p => p.theme.colors.palette.text.shade20};
  width: 1px;
  margin: 1px 0px 0px 15px;
`;
const Separator: ThemedComponent<{}> = styled.div`
  height: 1px;
  background: ${p => p.theme.colors.palette.text.shade20};
  width: 100%;
  margin: 15px 0;
`;

export default class StepSummary extends PureComponent<StepProps> {
  render() {
    const { account, parentAccount, transaction, status, transactionRaw } = this.props;
    if (!account) return null;
    const mainAccount = getMainAccount(account, parentAccount);
    if (!mainAccount || !transaction) return null;
    const { estimatedFees, totalSpent } = status;
    const amount = transaction.amount;
    if (amount.isEqualTo(BigNumber(0))) {
      // increase gas fees in case of cancel flow as we don't have the fees input screen for cancel flow
      if (EIP1559ShouldBeUsed(account.currency)) {
        transaction.maxFeePerGas = BigNumber(
          BigNumber(transactionRaw.maxFeePerGas)
            .multipliedBy(1.3)
            .toFixed(),
        );
        transaction.maxPriorityFeePerGas = BigNumber(
          BigNumber(transactionRaw.maxPriorityFeePerGas)
            .multipliedBy(1.1)
            .toFixed(),
        );
      } else {
        transaction.gasPrice = BigNumber(
          BigNumber(transactionRaw.gasPrice)
            .multipliedBy(1.3)
            .toFixed(),
        );
      }
    }
    const currency = getAccountCurrency(account);
    const feesUnit = getAccountUnit(mainAccount);
    const feesCurrency = getAccountCurrency(mainAccount);
    const unit = getAccountUnit(account);
    const memo = transaction.memo;

    return (
      <Box flow={4} mx={40}>
        <FromToWrapper>
          <Box>
            <Box horizontal alignItems="center">
              <Circle>
                <IconWallet size={14} />
              </Circle>
              <Box flex="1">
                <Text ff="Inter|Medium" color="palette.text.shade40" fontSize={4}>
                  <Trans i18nKey="send.steps.details.from" />
                </Text>
                <Box horizontal alignItems="center">
                  <div style={{ marginRight: 7 }}>
                    <CryptoCurrencyIcon size={16} currency={currency} />
                  </div>
                  <Text ff="Inter" color="palette.text.shade100" fontSize={4} style={{ flex: 1 }}>
                    {getAccountName(account)}
                  </Text>
                  <AccountTagDerivationMode account={account} />
                </Box>
              </Box>
            </Box>
            <VerticalSeparator />
            <Box horizontal alignItems="center">
              <Circle>
                <IconQrCode size={14} />
              </Circle>
              <Box flex={1}>
                <Text ff="Inter|Medium" color="palette.text.shade40" fontSize={4}>
                  <Trans i18nKey="send.steps.details.to" />
                </Text>
                <Ellipsis>
                  <Text ff="Inter" color="palette.text.shade100" fontSize={4}>
                    {transaction.recipient}
                  </Text>
                </Ellipsis>
              </Box>
            </Box>
          </Box>
          <Separator />
          {memo && (
            <Box horizontal justifyContent="space-between" alignItems="center" mb={2}>
              <Text ff="Inter|Medium" color="palette.text.shade40" fontSize={4}>
                <Trans i18nKey="operationDetails.extra.memo" />
              </Text>
              <Ellipsis ml={2}>
                <Text ff="Inter|Medium" fontSize={4}>
                  {memo}
                </Text>
              </Ellipsis>
            </Box>
          )}
          <Box horizontal justifyContent="space-between" mb={2}>
            <Text ff="Inter|Medium" color="palette.text.shade40" fontSize={4}>
              <Trans i18nKey="send.steps.details.amount" />
            </Text>
            <Box>
              <FormattedVal
                color={"palette.text.shade80"}
                disableRounding
                unit={unit}
                val={amount}
                fontSize={4}
                inline
                showCode
              />
              <Box textAlign="right">
                <CounterValue
                  color="palette.text.shade60"
                  fontSize={3}
                  currency={currency}
                  value={amount}
                  alwaysShowSign={false}
                />
              </Box>
            </Box>
          </Box>
          <Box horizontal justifyContent="space-between">
            <Text ff="Inter|Medium" color="palette.text.shade40" fontSize={4}>
              <Trans i18nKey="send.steps.details.fees" />
            </Text>
            <Box>
              <FormattedVal
                color={"palette.text.shade80"}
                disableRounding
                unit={feesUnit}
                alwaysShowValue
                val={estimatedFees}
                fontSize={4}
                inline
                showCode
              />
              <Box textAlign="right">
                <CounterValue
                  color={"palette.text.shade60"}
                  fontSize={3}
                  currency={feesCurrency}
                  value={estimatedFees}
                  alwaysShowSign={false}
                  alwaysShowValue
                />
              </Box>
            </Box>
          </Box>
          {!totalSpent.eq(amount) ? (
            <>
              <Separator />
              <Box horizontal justifyContent="space-between">
                <Text ff="Inter|Medium" color="palette.text.shade40" fontSize={4}>
                  <Trans i18nKey="send.totalSpent" />
                </Text>

                <Box>
                  <FormattedVal
                    color={"palette.text.shade80"}
                    disableRounding
                    unit={unit}
                    val={totalSpent}
                    fontSize={4}
                    inline
                    showCode
                    alwaysShowValue
                  />
                  <Box textAlign="right">
                    <CounterValue
                      color="palette.text.shade60"
                      fontSize={3}
                      currency={currency}
                      value={totalSpent}
                      alwaysShowSign={false}
                      alwaysShowValue
                    />
                  </Box>
                </Box>
              </Box>
            </>
          ) : null}
        </FromToWrapper>
      </Box>
    );
  }
}

export class StepSummaryFooter extends PureComponent<StepProps> {
  onNext = async () => {
    const { transitionTo } = this.props;
    transitionTo("device");
  };

  render() {
    const { account, status, bridgePending } = this.props;
    if (!account) return null;
    const { errors } = status;
    const canNext = !bridgePending && !Object.keys(errors).length;
    return (
      <>
        <Button
          id={"send-summary-continue-button"}
          primary
          disabled={!canNext}
          onClick={this.onNext}
        >
          <Trans i18nKey="common.continue" />
        </Button>
      </>
    );
  }
}
