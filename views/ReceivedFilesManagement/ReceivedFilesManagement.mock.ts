import { IReceivedFile } from "./ReceivedFilesManagement.model";

export const receivedFiles: IReceivedFile[] = [
  {
    id: "1",
    fileName: "file1",
    fileSize: "1.2 MB",
    fileExtension: "pdf",
    from: "0x1234...5678",
    timestamp: "1 hour ago",
  },
  {
    id: "2",
    fileName: "file2",
    fileSize: "3.4 MB",
    fileExtension: "zip",
    from: "0x5678...1234",
    timestamp: "2 hours ago",
  },
  {
    id: "3",
    fileName: "file3",
    fileSize: "5.6 MB",
    fileExtension: "doc",
    from: "0x4321...8765",
    timestamp: "3 hours ago",
  },
];
