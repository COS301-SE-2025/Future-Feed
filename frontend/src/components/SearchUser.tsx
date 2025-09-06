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
      className="rounded-full border-stone-700 dark:bg-teal-950 dark:text-white dark:placeholder:text-stone-400"
    />
  
  );
};

export default SearchUser;
