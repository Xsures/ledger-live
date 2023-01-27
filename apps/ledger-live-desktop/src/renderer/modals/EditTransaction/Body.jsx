// @flow

import React, { useCallback, useState } from "react";
import { BigNumber } from "bignumber.js";
import { connect } from "react-redux";
import { compose } from "redux";
import type { TFunction } from "react-i18next";
import { createStructuredSelector } from "reselect";
import { Trans, withTranslation } from "react-i18next";
import { UserRefusedOnDevice } from "@ledgerhq/errors";
import { addPendingOperation, getMainAccount } from "@ledgerhq/live-common/account/index";
import { getAccountCurrency } from "@ledgerhq/live-common/account/helpers";
import useBridgeTransaction from "@ledgerhq/live-common/bridge/useBridgeTransaction";
import type { Account, AccountLike, Operation, TransactionCommonRaw } from "@ledgerhq/types-live";
import type { Transaction } from "@ledgerhq/live-common/generated/types";
import logger from "~/logger";
import Stepper from "~/renderer/components/Stepper";
import { SyncSkipUnderPriority } from "@ledgerhq/live-common/bridge/react/index";
import { closeModal, openModal } from "~/renderer/actions/modals";
import { accountsSelector } from "~/renderer/reducers/accounts";
import { updateAccountWithUpdater } from "~/renderer/actions/accounts";
import { getCurrentDevice } from "~/renderer/reducers/devices";
import type { Device } from "@ledgerhq/live-common/hw/actions/types";
import StepMethod, { StepMethodFooter } from "./steps/StepMethod";
import StepFees, { StepFeesFooter } from "./steps/StepFees";
import StepConnectDevice from "./steps/StepConnectDevice";
import StepSummary, { StepSummaryFooter } from "./steps/StepSummary";
import StepConfirmation, { StepConfirmationFooter } from "./steps/StepConfirmation";
import type { St, StepId } from "./types";

type OwnProps = {|
  stepId: StepId,
  onChangeStepId: StepId => void,
  onClose: () => void,
  params: {
    account: ?AccountLike,
    parentAccount: ?Account,
    recipient?: string,
    amount?: BigNumber,
    disableBacks?: string[],
    transaction?: Transaction,
    onConfirmationHandler: Function,
    onFailHandler: Function,
    transactionRaw?: TransactionCommonRaw,
    transactionSequenceNumber?: number,
  },
|};

type StateProps = {|
  t: TFunction,
  device: ?Device,
  accounts: Account[],
  closeModal: string => void,
  openModal: (string, any) => void,
  updateAccountWithUpdater: (string, (Account) => Account) => void,
|};

type Props = {|
  ...OwnProps,
  ...StateProps,
|};

const createSteps = (): St[] => [
  {
    id: "method",
    label: <Trans i18nKey="operation.edit.steps.method.title" />,
    component: StepMethod,
    footer: StepMethodFooter,
  },
  {
    id: "fees",
    label: <Trans i18nKey="operation.edit.steps.fees.title" />,
    component: StepFees,
    footer: StepFeesFooter,
    onBack: ({ transitionTo }) => transitionTo("method"),
  },
  {
    id: "summary",
    label: <Trans i18nKey="operation.edit.steps.summary.title" />,
    component: StepSummary,
    footer: StepSummaryFooter,
    onBack: ({ transitionTo, transaction, transactionRaw }) => {
      // transit to "fees" page for speedup flow and skip the "fees" page for cancel flow
      transitionTo(BigNumber(transaction.amount).isGreaterThan(0) ? "fees" : "method");
    },
  },
  {
    id: "device",
    label: <Trans i18nKey="operation.edit.steps.device.title" />,
    component: StepConnectDevice,
    onBack: ({ transitionTo }) => transitionTo("summary"),
  },
  {
    id: "confirmation",
    label: <Trans i18nKey="operation.edit.steps.confirmation.title" />,
    excludeFromBreadcrumb: true,
    component: StepConfirmation,
    footer: StepConfirmationFooter,
    onBack: null,
  },
];

const mapStateToProps = createStructuredSelector({
  device: getCurrentDevice,
  accounts: accountsSelector,
});

const mapDispatchToProps = {
  closeModal,
  openModal,
  updateAccountWithUpdater,
};

const Body = ({
  t,
  device,
  openModal,
  closeModal,
  onChangeStepId,
  onClose,
  stepId,
  params,
  accounts,
  updateAccountWithUpdater,
}: Props) => {
  const [steps] = useState(() => createSteps());

  const {
    transaction,
    setTransaction,
    updateTransaction,
    account,
    parentAccount,
    status,
    bridgeError,
    bridgePending,
  } = useBridgeTransaction(() => {
    const parentAccount = params && params.parentAccount;
    const account = (params && params.account) || accounts[0];
    return { account, parentAccount, transaction: params.transaction };
  });

  const [optimisticOperation, setOptimisticOperation] = useState(null);
  const [transactionError, setTransactionError] = useState(null);
  const [signed, setSigned] = useState(false);

  const currency = account ? getAccountCurrency(account) : undefined;

  const currencyName = currency ? currency.name : undefined;

  const handleCloseModal = useCallback(() => {
    closeModal("MODAL_EDIT_TRANSACTION");
  }, [closeModal]);

  const handleRetry = useCallback(() => {
    setTransactionError(null);
    setOptimisticOperation(null);
    setSigned(false);
  }, []);

  const handleTransactionError = useCallback((error: Error) => {
    if (!(error instanceof UserRefusedOnDevice)) {
      logger.critical(error);
    }
    setTransactionError(error);
  }, []);

  const handleOperationBroadcasted = useCallback(
    (optimisticOperation: Operation) => {
      if (!account) return;
      const mainAccount = getMainAccount(account, parentAccount);
      updateAccountWithUpdater(mainAccount.id, account =>
        addPendingOperation(account, optimisticOperation),
      );
      setOptimisticOperation(optimisticOperation);
      setTransactionError(null);
    },
    [account, parentAccount, updateAccountWithUpdater],
  );

  const handleStepChange = useCallback(e => onChangeStepId(e.id), [onChangeStepId]);

  const error = transactionError || bridgeError;

  const stepperProps = {
    title: t("operation.edit.title"),
    stepId,
    steps,
    device,
    account,
    parentAccount,
    transaction,
    signed,
    currencyName,
    hideBreadcrumb: false,
    error,
    status,
    bridgePending,
    optimisticOperation,
    openModal,
    onClose,
    setSigned,
    closeModal: handleCloseModal,
    onChangeTransaction: setTransaction,
    onRetry: handleRetry,
    onStepChange: handleStepChange,
    onOperationBroadcasted: handleOperationBroadcasted,
    onTransactionError: handleTransactionError,
    updateTransaction,
    onConfirmationHandler: params.onConfirmationHandler,
    onFailHandler: params.onFailHandler,
    transactionRaw: params.transactionRaw,
    transactionSequenceNumber: params.transactionSequenceNumber,
  };

  return (
    <Stepper {...stepperProps}>
      {stepId === "confirmation" ? null : <SyncSkipUnderPriority priority={100} />}
    </Stepper>
  );
};

const m: React$ComponentType<OwnProps> = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation(),
)(Body);

export default m;
