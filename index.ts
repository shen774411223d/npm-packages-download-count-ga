import {
  getArgs,
  computedDiffTimestamp,
  unExistPackage,
  generatePackages,
  generatePackageList,
  checkError,
  showLogByTable,
  checkPeriodValidate,
  showRangeLogByTable,
} from "@/helper";
import { isNil, pick } from "ramda";
import input from "@inquirer/input";
import select, { Separator } from "@inquirer/select";
import type {
  ArgsType,
  PackageInfoType,
  PackageInfoByRangeType,
  PackagesResType,
  PackagesResByRangeType,
} from "@/types.d";
import chalk from "chalk";

const args = getArgs<ArgsType>();

const getParams = async (): Promise<ArgsType> => {
  if (isNil(args.period)) {
    let inputCustomPeriod = "";
    const inputMode = await select<"point" | "range">({
      message: "Select a search mode",
      choices: [
        {
          name: "point(default)",
          value: "point",
          description: "时间段内的下载量总和",
        },
        {
          name: "range",
          value: "range",
          description: "时间段内输出每一天的下载量",
        },
      ],
    });
    const inputPeriod = await select({
      message: "Select a search period",
      choices: [
        {
          name: "last-day",
          value: "last-day",
          description: "最近一天，通常是昨天",
        },
        {
          name: "last-week",
          value: "last-week",
          description: "最近一周",
        },
        {
          name: "last-month",
          value: "last-month",
          description: "最近一个月",
        },
        {
          name: "last-year",
          value: "last-year",
          description: "最近一年",
        },
        new Separator(),
        {
          name: "custom",
          value: "custom",
          description: "由你自己自定义查询时间段",
        },
      ],
    });
    if (inputPeriod === "custom") {
      inputCustomPeriod = await input({
        message: "自定义查询时间段，格式为: YYYY-MM-DD:YYYY-MM-DD",
      });
    }
    const inputPackages = await input({
      message: '查询的包, 如查询多个用","隔开',
    });

    return {
      mode: inputMode,
      packages: inputPackages,
      period:
        inputCustomPeriod ||
        (inputPeriod !== "custom" && inputPeriod) ||
        "last-day",
    };
  }
  return {
    ...pick(["mode", "packages", "period"], args),
    mode: args.mode || "point",
  };
};

const modes = ["point", "range"];

const handleParamsValidate = (payload: ArgsType) => {
  const result = { ...payload };
  if (!checkPeriodValidate(payload.period)) {
    console.error(
      chalk.red(
        `period参数类型错误，自动帮你设置成 "last-day"。错误的值为: ${result.period}`
      )
    );
    result.period = "last-day";
  }
  if (!modes.includes(result.mode)) {
    console.error(
      chalk.red(
        `mode参数类型错误，自动帮你设置成 "point"。错误的值为: ${result.mode}`
      )
    );
    result.mode = "point";
  }
  return result;
};

const main = async () => {
  try {
    const { packages, mode, period } = handleParamsValidate(await getParams());
    const unExist = unExistPackage(packages);
    const searchPackages = unExist ? "" : `/${generatePackages(packages)}`;
    const url = `https://api.npmjs.org/downloads/${mode}/${period}${searchPackages}`;
    const packageList = generatePackageList(packages);
    const fetchBeforeTimestamp = Date.now();
    let renderAfterTimestamp = 0;
    const result = await fetch(url).then((res) => res.json());
    const logList: PackageInfoType[] = [];
    const logListByRange: PackageInfoByRangeType[] = [];
    if (checkError(result)) {
      throw new Error(`找不到这些packages: ${packages}`);
    }

    if (mode === "range") {
      switch (packageList.length) {
        case 0:
          logListByRange.push({
            package: "npm all packages",
            date: `${result.start}:${result.end}`,
            downloadsList: result.downloads,
          });
          break;
        case 1:
          logListByRange.push({
            package: result.package,
            date: `${result.start}:${result.end}`,
            downloadsList: result.downloads,
          });
          break;
        default:
          logListByRange.push(
            ...Object.values(result as PackagesResByRangeType[]).map(
              (item) => ({
                package: item.package,
                date: `${item.start}:${item.end}`,
                downloadsList: item.downloads,
              })
            )
          );
          break;
      }
      renderAfterTimestamp = Date.now();
      console.log(
        chalk.red(
          `已查询到结果, 耗时: ${computedDiffTimestamp(
            fetchBeforeTimestamp,
            renderAfterTimestamp
          )}`
        )
      );
      showRangeLogByTable(logListByRange);
      return;
    }
    switch (packageList.length) {
      case 0:
        logList.push({
          package: "npm all packages",
          date: `${result.start}:${result.end}`,
          downloads: result.downloads,
        });
        break;
      case 1:
        logList.push({
          package: result.package,
          date: `${result.start}:${result.end}`,
          downloads: result.downloads,
        });
        break;
      default:
        logList.push(
          ...Object.values(result as PackagesResType[]).map((item) => ({
            package: item.package,
            date: `${item.start}:${item.end}`,
            downloads: item.downloads,
          }))
        );
        break;
    }
    renderAfterTimestamp = Date.now();
    console.log(
      chalk.red(
        `已查询到结果, 耗时: ${computedDiffTimestamp(
          fetchBeforeTimestamp,
          renderAfterTimestamp
        )}`
      )
    );
    showLogByTable(logList);
  } catch (err: any) {
    console.error("main err", err.message);
  }
};

main();
