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
      className=" border-rose-gold-accent-border bg-white  rounded-full future-feed:border-card future-feed:bg-card future-feed:text-lime dark:border-none dark:bg-blue-950 dark:text-white border-3 future-feed:placeholder:text-lime dark:placeholder:text-slate-200"
    />
  
  );
};

export default SearchUser;
