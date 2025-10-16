import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface SearchUserProps {
  onSearch: (query: string) => void;
}

const SearchUser = ({ onSearch }: SearchUserProps) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (query.trim() === '') {
      onSearch('');
    }
  }, [query, onSearch]);

  return (
    <Input
      type="text"
      placeholder="Search users..."
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        onSearch(e.target.value);
      }}
      className="drop-shadow-xl border-none bg-white  rounded-full future-feed:border-card future-feed:bg-card future-feed:text-lime border-3 future-feed:placeholder:text-lime"
    />

  );
};

export default SearchUser;