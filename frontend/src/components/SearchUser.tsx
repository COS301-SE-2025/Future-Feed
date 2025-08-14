// components/SearchUser.tsx
//notofies page whenever search value imput changes
import { useState,useEffect,useCallback } from "react";
import { Input } from "@/components/ui/input";

interface SearchUserProps {
  onSearch: (query: string) => void;
}

const SearchUser = ({ onSearch }: SearchUserProps) => {
  const [query, setQuery] = useState("");

  //speed up search cause weve now introduced caching
  useEffect(() => {
    if (query.trim() === '') {
      onSearch('');
    }
  }, [query, onSearch]);

  /*const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value.trim());
  };*/

  return (
    
      
    <Input
      type="text"
      placeholder="Search users."
      value={query}
      onChange= {(e) =>{
        setQuery(e.target.value);
        onSearch(e.target.value);

      }}
      className="border-lime-600 border-3 dark:placeholder:text-lime-500 rounded-2xl px-4 py-2 dark:bg-black dark:text-slate-100 border dark:border-lime-500 focus:ring-0 focus:outline-none"
    />
  
  );
};

export default SearchUser;
