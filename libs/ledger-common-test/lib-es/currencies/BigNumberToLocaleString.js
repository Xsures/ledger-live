// Implement a subset of Number#toLocaleString for BigNumber.js
// https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Number/toLocaleString
import { BigNumber } from "bignumber.js";
import { getSeparators } from "./localeUtility";
// FIXME later, might want to expose this format!
var getFormatForLocale = function (locale) {
    var _a = getSeparators(locale), decimal = _a.decimal, thousands = _a.thousands;
    var opts = {
        decimalSeparator: ".",
        groupSeparator: ",",
        groupSize: 3,
        secondaryGroupSize: 0,
        fractionGroupSeparator: "\xA0",
        // non-breaking space
        fractionGroupSize: 0
    };
    if (typeof decimal === "string")
        opts.decimalSeparator = decimal;
    if (typeof thousands === "string")
        opts.groupSeparator = thousands;
    return opts;
};
export var toLocaleString = function (n, localeInput, options) {
    if (options === void 0) { options = {}; }
    var locale = localeInput;
    if (!locale)
        locale = "en";
    var minimumFractionDigits = "minimumFractionDigits" in options
        ? options.minimumFractionDigits
        : 0;
    var maximumFractionDigits = "maximumFractionDigits" in options
        ? options.maximumFractionDigits
        : Math.max(minimumFractionDigits, 3);
    var useGrouping = "useGrouping" in options ? options.useGrouping : true;
    var format = getFormatForLocale(locale);
    if (!useGrouping) {
        format.groupSeparator = "";
    }
    var BN = BigNumber.clone({
        FORMAT: format
    });
    var bn = new BN(n);
    var maxDecimals = bn.toFormat(maximumFractionDigits, BigNumber.ROUND_FLOOR);
    if (maximumFractionDigits !== minimumFractionDigits) {
        var minDecimals = bn.toFormat(minimumFractionDigits, BigNumber.ROUND_FLOOR);
        var i = maxDecimals.length;
        // cleanup useless '0's from the right until the minimumFractionDigits
        while (i > minDecimals.length) {
            if (maxDecimals[i - 1] !== "0") {
                if (maxDecimals[i - 1] === format.decimalSeparator) {
                    i--;
                }
                break; // we reach decimal. stop now.
            }
            i--;
        }
        return maxDecimals.slice(0, i);
    }
    return maxDecimals;
};
//# sourceMappingURL=BigNumberToLocaleString.js.map