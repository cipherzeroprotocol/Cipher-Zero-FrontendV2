import { useMemo } from "react";
import { IMessageDetail } from "./MessageDetail.model";

const useMessageDetailLogic = () => {
  const messageDetailList: IMessageDetail[] = useMemo(() => {
    return [
      {
        owner: "GNAbTfj6yqBSPeeTQdYZYezeu5DuXSpuwZ6PTzRB9Gwx",
        message: "Hello",
        passedTime: "2 hour",
      },
      {
        owner: "GNAbTfj6yqBSPeeTQdYZYezeu5DuXSpuwZ6PTzRB9Gwx",
        message: "Hi",
        passedTime: "2 hour",
      },
      {
        owner: "GNAbTfj6yqBSPeeTQdYZYezeu5DuXSpuwZ6PTzRB9Gwx",
        message: "What's up?",
        passedTime: "2 hour",
      },
    ];
  }, []);

  return { messageDetailList };
};

export default useMessageDetailLogic;
