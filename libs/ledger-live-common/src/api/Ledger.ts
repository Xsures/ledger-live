import { CryptoCurrency } from "@ledgerhq/types-cryptoassets";
import invariant from "invariant";
import { getEnv } from "../env";

type LedgerExplorer = {
  version: string;
  id: string;
  endpoint: string;
};

export const findCurrencyExplorer = (
  currency: CryptoCurrency
): LedgerExplorer | null | undefined => {
  if (getEnv("SATSTACK") && currency.id === "bitcoin") {
    return {
      endpoint: getEnv("EXPLORER_SATSTACK"),
      id: "btc",
      version: "v3",
    };
  }

  return {
    endpoint: getEnv("EXPLORER"),
    id: currency.ticker.toLocaleLowerCase(),
    version: "v4",
  };
};

export const hasCurrencyExplorer = (currency: CryptoCurrency): boolean =>
  !!findCurrencyExplorer(currency);

export const getCurrencyExplorer = (
  currency: CryptoCurrency
): LedgerExplorer => {
  const res = findCurrencyExplorer(currency);
  invariant(res, `no Ledger explorer for ${currency.id}`);
  return <LedgerExplorer>res;
};

export const blockchainBaseURL = (currency: CryptoCurrency): string => {
  const { id, version, endpoint } = getCurrencyExplorer(currency);
  return `${endpoint}/blockchain/${version}/${id}`;
};
