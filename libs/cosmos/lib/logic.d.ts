import { BigNumber } from "bignumber.js";
import type { CosmosDelegation, CosmosDelegationInfo, CosmosValidatorItem, CosmosMappedDelegation, CosmosMappedDelegationInfo, CosmosSearchFilter, CosmosUnbonding, CosmosMappedUnbonding, CosmosRedelegation, CosmosMappedRedelegation, CosmosAccount } from "./types";
import type { Transaction } from "./types";
import type { Unit } from "@ledgerhq/types-cryptoassets";
export declare const COSMOS_MAX_REDELEGATIONS = 7;
export declare const COSMOS_MAX_UNBONDINGS = 7;
export declare const COSMOS_MAX_DELEGATIONS = 5;
export declare const COSMOS_MIN_SAFE: BigNumber;
export declare const COSMOS_MIN_FEES: BigNumber;
export declare function mapDelegations(delegations: CosmosDelegation[], validators: CosmosValidatorItem[], unit: Unit): CosmosMappedDelegation[];
export declare function mapUnbondings(unbondings: CosmosUnbonding[], validators: CosmosValidatorItem[], unit: Unit): CosmosMappedUnbonding[];
export declare function mapRedelegations(redelegations: CosmosRedelegation[], validators: CosmosValidatorItem[], unit: Unit): CosmosMappedRedelegation[];
export declare const mapDelegationInfo: (delegations: CosmosDelegationInfo[], validators: CosmosValidatorItem[], unit: Unit, transaction?: Transaction) => CosmosMappedDelegationInfo[];
export declare const formatValue: (value: BigNumber, unit: Unit) => number;
export declare const searchFilter: CosmosSearchFilter;
export declare function getMaxDelegationAvailable(account: CosmosAccount, validatorsLength: number): BigNumber;
export declare const getMaxEstimatedBalance: (a: CosmosAccount, estimatedFees: BigNumber) => BigNumber;
export declare function canUndelegate(account: CosmosAccount): boolean;
export declare function canDelegate(account: CosmosAccount): boolean;
export declare function canRedelegate(account: CosmosAccount, delegation: CosmosDelegation | CosmosValidatorItem): boolean;
export declare function canClaimRewards(account: CosmosAccount, delegation: CosmosDelegation): Promise<boolean>;
export declare function getRedelegation(account: CosmosAccount, delegation: CosmosMappedDelegation): CosmosRedelegation | null | undefined;
export declare function getRedelegationCompletionDate(account: CosmosAccount, delegation: CosmosMappedDelegation): Date | null | undefined;
//# sourceMappingURL=logic.d.ts.map