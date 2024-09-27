export interface IMessageDetailProps {
  selectedAccount: string;
  handleGoBack: () => void;
}

export interface IMessageDetail {
  owner: string;
  message: string;
  passedTime: string;
}
