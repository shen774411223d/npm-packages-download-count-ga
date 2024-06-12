import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import type {
  DefaultType,
  PackageInfoType,
  PackageInfoByRangeType,
  DownloadsListType,
} from "@/types";
import { trim, compose, isEmpty, type, isNil } from "ramda";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import chalk from "chalk";

dayjs.extend(customParseFormat);

export const getArgs = <T = DefaultType>(): T => {
  return yargs(hideBin(process.argv)).parse() as T;
};

export const computedDiffTimestamp = (before: number, after: number) => {
  return `${(after - before) / 1000}秒`;
};

export const generatePackageList = (packages: string) =>
  compose(
    (list: string[]) => list.filter((item) => !isEmpty(item)),
    (list: string[]) => list.map((item) => trim(item)),
    (str: string) => str.split(","),
    (val: any) => (type(val) !== "String" ? "" : val)
  )(packages);

export const generatePackages = (packages: string) =>
  compose((list: string[]) => list.join(","), generatePackageList)(packages);

export const unExistPackage = (packages: string | boolean) =>
  type(packages) !== "String" || isEmpty(trim(packages as string));

export const checkError = (result: any) => {
  if (result.error || Object.values(result).some((item) => isNil(item))) {
    return true;
  }
  return false;
};

export const formatNumberToCh = (num: number) => {
  if (num < 10000) {
    return num;
  } else if (num < 100000000) {
    const thousands = num / 10000;
    return `${thousands.toFixed(1)}万`;
  } else {
    const billions = num / 100000000;
    return `${billions.toFixed(1)}亿`;
  }
};

export const showLogByTable = (list: PackageInfoType[]) => {
  console.table(
    compose(
      (d) =>
        d.map((item) => ({
          ...item,
          downloadByNum: item.downloads
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ","),
          downloadByCh: formatNumberToCh(item.downloads),
        })),
      (d: PackageInfoType[]) => d.sort((a, b) => b.downloads - a.downloads)
    )(list),
    ["package", "date", "downloadByNum", "downloadByCh"]
  );
};

export const fixedperiodOptions = [
  "last-day",
  "last-week",
  "last-month",
  "last-year",
];

export const checkPeriodValidate = (period: string) => {
  if (type(period) !== "String") return false;
  if (fixedperiodOptions.includes(period)) return true;

  const [start, end] = period.split(":");

  if (isNil(start) || isNil(end)) return false;

  return [start, end].every((date) =>
    dayjs(date, "YYYY-MM-DD", true).isValid()
  );
};

export const showRangeLogByTable = (list: PackageInfoByRangeType[]) => {
  list.forEach((item) => {
    console.log(chalk.blue(`package: ${item.package}, period: ${item.date}`));
    console.table(
      compose((d) =>
        d.map((item: DownloadsListType) => ({
          ...item,
          downloadByNum: item.downloads
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ","),
          downloadByCh: formatNumberToCh(item.downloads),
        }))
      )(item.downloadsList),
      ["day", "downloadByNum", "downloadByCh"]
    );
  });
};
