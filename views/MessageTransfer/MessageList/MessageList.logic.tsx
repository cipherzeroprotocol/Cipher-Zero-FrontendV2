import { useMemo } from "react";
import { IMessageItem, IMessageListProps } from "./MessageList.model";

const useMessageListLogic = ({
  searchText,
}: Omit<IMessageListProps, "onSelectMessage">) => {
  const messageList: IMessageItem[] = useMemo(() => {
    const messageList = [
      {
        publicKey: "BzzWi5EZdqLbw9GH5UxsKx7SXCwJ7RVyX4JQYfSbpXqG",
        lastMessage: "Hello",
        lastMessageDate: "2021-09-01T14:00:00",
        unreadMessages: 0,
      },
      {
        publicKey: "HVq52Jz298opwi1BKUKo4qbkBR7ZWrfRWwBkPq2KNvy8",
        lastMessage: "Hi",
        lastMessageDate: "2021-09-01T14:00:00",
        unreadMessages: 1,
      },
      {
        publicKey: "CJSWi5EZdqLbw9GH5UxsKx7SXCwJ7RVyX4JQYfSbpXqG",
        lastMessage: "Hello",
        lastMessageDate: "2021-09-01T14:00:00",
        unreadMessages: 0,
      },
      {
        publicKey: "AAAA2Jz298opwi1BKUKo4qbkBR7ZWrfRWwBkPq2KNvy8",
        lastMessage: "Hi",
        lastMessageDate: "2021-09-01T14:00:00",
        unreadMessages: 2,
      },
      {
        publicKey: "UHJWi5EZdqLbw9GH5UxsKx7SXCwJ7RVyX4JQYfSbpXqG",
        lastMessage: "Hello",
        lastMessageDate: "2021-09-01T14:00:00",
        unreadMessages: 0,
      },
      {
        publicKey: "LJIR2Jz298opwi1BKUKo4qbkBR7ZWrfRWwBkPq2KNvy8",
        lastMessage: "Hi",
        lastMessageDate: "2021-09-01T14:00:00",
        unreadMessages: 3,
      },
    ];

    if (searchText) {
      return messageList.filter((messageItem) =>
        messageItem.publicKey.includes(searchText)
      );
    }
    return messageList;
  }, [searchText]);

  return { messageList };
};

export default useMessageListLogic;
