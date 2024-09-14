import { useMemo } from "react";
import { receivedFiles } from "./ReceivedFilesManagement.mock";

const useReceivedFilesManagementLogic = () => {
  const receivedFileList = useMemo(() => {
    return receivedFiles;
  }, []);

  return {
    receivedFileList,
  };
};

export default useReceivedFilesManagementLogic;
