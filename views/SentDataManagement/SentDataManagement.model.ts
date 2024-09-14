export enum ISentDataStatus {
  CONFIRMED = "Confirmed",
  PENDING = "Pending",
  FAILED = "Failed",
}

export interface ISentData {
  fileName: string;
  recipient: string;
  size: string;
  timestamp: string;
  status: ISentDataStatus;
}
