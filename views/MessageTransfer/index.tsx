"use client";

import InputSearch from "../common/InputSearch";
import MessageList from "./MessageList";
import { useState } from "react";
import MessageDetail from "./MessageDetail";

export default function MessageTransfer() {
  const [searchText, setSearchText] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  return (
    <section className="px-3">
      {selectedAccount ? (
        <MessageDetail
          handleGoBack={() => setSelectedAccount(null)}
          selectedAccount={selectedAccount}
        />
      ) : (
        <>
          <InputSearch
            placeholder="Search by account address"
            onSearch={(value: string) => setSearchText(value)}
          />
          <MessageList
            searchText={searchText}
            onSelectMessage={(selectedAccount) =>
              setSelectedAccount(selectedAccount)
            }
          />
        </>
      )}
    </section>
  );
}
