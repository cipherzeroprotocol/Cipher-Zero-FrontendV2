import { SearchIcon } from "lucide-react";

interface InputSearchProps {
  onSearch: (searchText: string) => void;
  placeholder?: string;
  showSearchIcon?: boolean;
  className?: string;
}

export default function InputSearch({
  onSearch,
  placeholder = "Search",
  showSearchIcon = true,
  className,
}: InputSearchProps) {
  return (
    <div
      className={`border border-none bg-tabs-trigger flex items-center gap-2 px-3 rounded-lg py-1 ${
        className ? className : ""
      }`}
    >
      {showSearchIcon ? (
        <SearchIcon className="h-4 w-4 text-tabs-trigger-foreground" />
      ) : null}
      <input
        type="text"
        placeholder={placeholder}
        className="rounded p-2 w-full bg-tabs-trigger focus:outline-none"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
