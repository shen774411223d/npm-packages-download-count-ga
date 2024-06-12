export interface ArgsType {
  mode: "range" | "point";
  packages: string;
  period: string;
}

export interface ParamsType {
  mode: string;
  packages: string;
  period: string;
}

export type DefaultType = { [key: string]: any };

export interface PackageInfoType {
  downloads: number;
  package: string;
  date: string;
}

export interface DownloadsListType {
  downloads: number;
  day: string;
}

export interface PackageInfoByRangeType
  extends Omit<PackageInfoType, "downloads"> {
  downloadsList: DownloadsListType[];
}

export interface PackagesResType {
  downloads: number;
  package: string;
  start: string;
  end: string;
}

export interface PackagesResByRangeType extends PackagesResType {
  downloads: DownloadsListType[];
}
