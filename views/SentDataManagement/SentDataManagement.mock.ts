import { ISentData, ISentDataStatus } from "./SentDataManagement.model";

export const sentFiles: ISentData[] = [
  {
    fileName: "File1.pdf",
    recipient: "0x1234...5678",
    size: "2 MB",
    timestamp: "2024-09-12 10:45",
    status: ISentDataStatus.CONFIRMED,
  },
  {
    fileName: "File2.jpg",
    recipient: "0x8765...4321",
    size: "1.5 MB",
    timestamp: "2024-09-11 09:20",
    status: ISentDataStatus.PENDING,
  },
  {
    fileName: "File3.zip",
    recipient: "0x1111...2222",
    size: "3 MB",
    timestamp: "2024-09-10 08:15",
    status: ISentDataStatus.FAILED,
  },
];
