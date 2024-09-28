import { useMemo } from "react";
import { IMessageDetail } from "./MessageDetail.model";

const useMessageDetailLogic = () => {
  const messageDetailList: IMessageDetail[] = useMemo(() => {
    return [
      {
        owner: "7qtcjkvwj9YMgCYKvJzDB6iJNwEoxLhbjDQrnGmjjYff",
        message: "Hello",
        passedTime: "2 hour",
      },
      {
        owner: "7qtcjkvwj9YMgCYKvJzDB6iJNwEoxLhbjDQrnGmjjYff",
        message: "Hi",
        passedTime: "2 hour",
      },
      {
        owner: "7qtcjkvwj9YMgCYKvJzDB6iJNwEoxLhbjDQrnGmjjYff",
        message: "What's up?",
        passedTime: "2 hour",
      },
      {
        owner: "BzzWi5EZdqLbw9GH5UxsKx7SXCwJ7RVyX4JQYfSbpXqG",
        message: "I am fine, how about you?",
        passedTime: "2 hour",
      },
      {
        owner: "BzzWi5EZdqLbw9GH5UxsKx7SXCwJ7RVyX4JQYfSbpXqG",
        message: "Shall we meet tomorrow?",
        passedTime: "2 hour",
      },
      {
        owner: "HVq52Jz298opwi1BKUKo4qbkBR7ZWrfRWwBkPq2KNvy8",
        message: "Sure. Let's meet at 10 AM at the park.",
        passedTime: "2 hour",
      },
      {
        owner: "HVq52Jz298opwi1BKUKo4qbkBR7ZWrfRWwBkPq2KNvy8",
        message: " Is that fine?",
        passedTime: "2 hour",
      },
      {
        owner: "BzzWi5EZdqLbw9GH5UxsKx7SXCwJ7RVyX4JQYfSbpXqG",
        message: "Yes, that's fine.",
        passedTime: "2 hour",
      },
    ];
  }, []);

  return { messageDetailList };
};

export default useMessageDetailLogic;
