export interface IMessageItem {
  publicKey: string;
  lastMessage: string;
  lastMessageDate: string;
  unreadMessages: number;
}

export interface IMessageListProps {
  searchText: string;
  onSelectMessage: (selectedAccount: string) => void;
}
