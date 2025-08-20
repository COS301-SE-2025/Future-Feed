// components/SearchUser.tsx
//notofies page whenever search value imput changes
import { useState,useEffect } from "react";
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
      placeholder="Search users..."
      value={query}
      onChange= {(e) =>{
        setQuery(e.target.value);
        onSearch(e.target.value);

      }}
      className="rounded-full border-lime-500 dark:bg-[#1a1a1a] dark:text-white dark:placeholder:text-lime-500"
    />
  
  );
};

export default SearchUser;
