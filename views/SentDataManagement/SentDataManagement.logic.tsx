import { ISentDataStatus } from "./SentDataManagement.model";

const useSentDataManagementLogic = () => {
  const getStatusColor = (status: ISentDataStatus) => {
    switch (status) {
      case ISentDataStatus.CONFIRMED:
        return "text-green-500";
      case ISentDataStatus.PENDING:
        return "text-yellow-500";
      case ISentDataStatus.FAILED:
        return "text-red-500";
      default:
        return "";
    }
  };

  return {
    getStatusColor,
  };
};

export default useSentDataManagementLogic;
