import React, { createContext, useState } from "react";
import defaultImage from "../assets/GRP1.jpg";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    username: "Syntex Squad",
    displayName: "Syntex Squad",
    bio: "Future Feed | Tech Enthusiast | Car Lover",
    profileImage: defaultImage,
    accountType: "personal"
  });

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};
