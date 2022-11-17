"use strict";
exports.__esModule = true;
function getDeviceTransactionConfig(_a) {
    var transaction = _a.transaction, _b = _a.status, estimatedFees = _b.estimatedFees, totalSpent = _b.totalSpent;
    var mode = transaction.mode, memo = transaction.memo, validators = transaction.validators;
    var fields = [];
    switch (mode) {
        case "send":
            fields.push({
                type: "osmosis.extendedAmount",
                label: "Amount"
            });
            break;
        case "delegate":
            fields.push({
                type: "text",
                label: "Type",
                value: "Delegate"
            });
            fields.push({
                type: "cosmos.delegateValidators",
                label: "Validators"
            });
            break;
        case "undelegate":
            fields.push({
                type: "text",
                label: "Type",
                value: "Undelegate"
            });
            fields.push({
                type: "osmosis.extendedAmount",
                label: "Amount",
                value: validators[0].amount.toString()
            });
            fields.push({
                type: "cosmos.validatorName",
                label: "Validator"
            });
            break;
        case "redelegate":
            fields.push({
                type: "text",
                label: "Type",
                value: "Redelegate"
            });
            fields.push({
                type: "osmosis.extendedAmount",
                label: "Amount",
                value: validators[0].amount.toString()
            });
            fields.push({
                type: "cosmos.validatorName",
                label: "Validator Dest"
            });
            fields.push({
                type: "cosmos.sourceValidatorName",
                label: "Validator Source"
            });
            break;
        case "claimReward":
            fields.push({
                type: "text",
                label: "Type",
                value: "Withdraw Reward"
            });
            fields.push({
                type: "cosmos.validatorName",
                label: "Validator"
            });
            break;
        case "claimRewardCompound":
            fields.push({
                type: "text",
                label: "Type",
                value: "Withdraw Reward"
            });
            fields.push({
                type: "cosmos.validatorName",
                label: "Validator"
            });
            fields.push({
                type: "text",
                label: "Type",
                value: "Delegate"
            });
            fields.push({
                type: "cosmos.delegateValidators",
                label: "Validators"
            });
            break;
        default:
            break;
    }
    if (!estimatedFees.isNaN() && !estimatedFees.isZero()) {
        fields.push({
            type: "osmosis.extendedAmount",
            label: "Fee",
            value: estimatedFees.toString()
        });
    }
    if (memo) {
        fields.push({
            type: "text",
            label: "Memo",
            value: memo
        });
    }
    if (mode === "claimReward" || mode === "claimRewardCompound") {
        var label = "Amount to be received";
        label += mode === "claimRewardCompound" ? " and delegated" : "";
        fields.push({
            type: "osmosis.extendedAmount",
            label: label,
            value: validators[0].amount.toString()
        });
        validators[0].amount;
    }
    else if (mode === "undelegate" || mode === "redelegate") {
        return fields;
    }
    else {
        fields.push({
            type: "osmosis.extendedAmount",
            label: "Total",
            value: totalSpent.toString()
        });
    }
    return fields;
}
exports["default"] = getDeviceTransactionConfig;
//# sourceMappingURL=deviceTransactionConfig.js.map