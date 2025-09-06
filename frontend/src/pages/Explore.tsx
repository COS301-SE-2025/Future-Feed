import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings } from "lucide-react";
import PersonalSidebar from "@/components/PersonalSidebar";


import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";
import RightSidebar from "@/components/RightSidebar";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useFollowStore } from "@/store/useFollowStore";
import { Button } from "@/components/ui/button";
import SearchUser from "@/components/SearchUser";
//for caching users on tabs
import { useUsersQuery, useFollowingQuery } from '@/hooks/useUsersQuery';
import { useQueryClient } from "@tanstack/react-query";
//import { update } from "@react-spring/web";
//introduce debounce
import { debounce } from "@/utils/debounce";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  profilePicture: string;
  bio: string;
}

/*interface FollowRelation {
  id: number;
  followerId: number;
  followedId: number;
  followedAt: string;
}*/

const Explore = () => {


//add sep states for search
const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
//monitor sesrch query and check is search is active
const [searchQuery, setSearchQuery] = useState(''); 
const [isSearchActive, setIsSearchActive] = useState(false);

  //
//  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("accounts");
  // State to manage current user ID and following user IDs
  const [hasLoadedFolllowing, setHasLoadedFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const { followingUserIds, setFollowingUserIds } = useFollowStore();
 // const [loading, setLoading] = useState(true);
 // const [followingloading, setfollowingloading] = useState(true);
  const [unfollowingId, setUnfollowingId] = useState<number | null>(null);
  const [followingId, setFollowingId] = useState<number | null>(null);
  const { followStatus, setFollowStatus, bulkSetFollowStatus } = useFollowStore();

  //
  //cachce fetching for users in tabs
  const queryClient = useQueryClient();
const { 
  data: users = [], 
  isLoading: usersLoading, 
  
} = useUsersQuery();

const { 
  data: followingRelations = [], 
  isLoading: followingLoading,
  refetch: refetchFollowing 
} = useFollowingQuery(currentUserId);
  //
  const handleSearch = async (query: string) => {
    const trimmedQuery = query.trim();
    setSearchQuery(query);
  if (!trimmedQuery) {
    //setIsSearching(false);
    setIsSearchActive(false);//user is not searching currenly
    //setSearchResults([]);
    //resery if users lpaded
    if(users.length > 0){
      setDisplayedUsers(users); // Reset to all users when query is empty

    }
    

    return;
  }
 
  setIsSearchActive(true); // User is actively searching
  //setIsSearching(true);
  //first try abd flter from clinet side for instant results - quciker
if(users.length > 0 && trimmedQuery.length <=3){
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
    user.displayName.toLowerCase().includes(trimmedQuery.toLowerCase())

  );
  setDisplayedUsers(filteredUsers);
  //update
  updateFollowStatuses(filteredUsers);
  return;
}
  //then for longer queries, fetch from server
  try {
    const res = await fetch(`${API_URL}/api/user/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Search failed");
    const data: User[] = await res.json();

    //set search results after fetching
    //setSearchResults(data);
    //show search results immediately and not have them populatd by all users

    if(trimmedQuery === searchQuery.trim() ){ //added checking for if we're still seearching same thing
setDisplayedUsers(data);
    }
    
    //console.log("search results",searchResults)
    /* const updateStatuses = async () => {
      const currentStatuses = useFollowStore.getState().followStatus;
      const newStatuses = { ...currentStatuses };

      await Promise.all(
        data.map(async (user) => {
          if (!(user.id in currentStatuses)) {
            newStatuses[user.id] = await checkFollowStatus(user.id);
          }
        })
      );
      
      useFollowStore.getState().bulkSetFollowStatus(newStatuses);
    };
    
    // update in background
    updateStatuses();*/
    
  } catch (err) {
    console.error(err);
          const filtered = users.filter(user => 
        user.username.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
        user.displayName.toLowerCase().includes(trimmedQuery.toLowerCase())
      );
      setDisplayedUsers(filtered);

  } finally {
    //setIsSearching(false);
   //setIsSearchActive(false);
   
  }
};
//client updatefollowstatus function
const updateFollowStatuses = async (users: User[]) => {
  const currentStatuses = useFollowStore.getState().followStatus;
  const newStatuses = { ...currentStatuses };
  
  // Only check statuses for users we don't already know about
  const usersToCheck = users.filter(user => !(user.id in currentStatuses));
  
  if (usersToCheck.length > 0) {
    const statusUpdates = await Promise.all(
      usersToCheck.map(async (user) => {
        const isFollowing = await checkFollowStatus(user.id);
        return { id: user.id, status: isFollowing };
      })
    );
    
    statusUpdates.forEach(({ id, status }) => {
      newStatuses[id] = status;
    });
    
    useFollowStore.getState().bulkSetFollowStatus(newStatuses);
  }
};
//
  //

  const fetchCurrentUserId = async () => {
    const res = await fetch(`${API_URL}/api/user/myInfo`, {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    return data.id;
  };

/*  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/api/user/all`, {
      method: "GET",
      credentials: "include",
    });
    return await res.json();
  };

  const fetchFollowing = async (userId: number, allUsers: User[]) => {
    try {
      const res = await fetch(`${API_URL}/api/follow/following/${userId}`, {
        method: "GET",
        credentials: "include",
      });

      const data: FollowRelation[] = await res.json();
      const followedUserIds = data.map((relation) => relation.followedId);
      const followedUsers = allUsers.filter((user) => followedUserIds.includes(user.id));
      console.log(followedUsers);
      setFollowingUserIds(followedUserIds);
    } catch (err) {
      console.error("Failed to fetch following users", err);
    }
  };*/

  const checkFollowStatus = async (userId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/follow/status/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      return data.following;
    } catch (err) {
      console.error("Failed to check follow status for user", userId, err);
      return false;
    }
  };

  const handleFollow = async (id: number) => {
    try {
      setFollowingId(id);
      await new Promise((res) => setTimeout(res, 600));
      await fetch(`${API_URL}/api/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ followedId: id }),
      });
      setFollowStatus(id, true);

      //if (currentUserId !== null) {
        //await fetchFollowing(currentUserId, users);
      //}
      //better handling
      if(currentUserId){
        await refetchFollowing();
        //invalidate to force refresh
        queryClient.invalidateQueries({queryKey: ['following',currentUserId] } );
          }
    } catch (err) {
      console.error("Follow failed", err);
    } finally {
      setFollowingId(null);
    }
  };

  const handleUnfollow = async (id: number) => {
    try {
      setUnfollowingId(id);
      await new Promise((res) => setTimeout(res, 600));
      await fetch(`${API_URL}/api/follow/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      setFollowStatus(id, false);

      //if (currentUserId !== null) {
        //await fetchFollowing(currentUserId, users);
      //}
      if(currentUserId){
        await refetchFollowing();
        //force refresh
        queryClient.invalidateQueries({queryKey: ['following',currentUserId] } );
      }
    } catch (err) {
      console.error("Unfollow failed", err);
    } finally {
      setUnfollowingId(null);
    }
  };

  useEffect(() => {
    //handle tab changes
    
    //
   // let isMounted = true;

    const loadData = async () => {
      try {
        // setLoading(true);
         //const [allUsers, userId] = await Promise.all([
          //fetchUsers(),
          //fetchCurrentUserId()
         //]);
         //
          //if(isMounted) {
         //setUsers(allUsers);
     
      //initialize displayed users
      ////setDisplayedUsers(allUsers);
       //setCurrentUserId(userId);

       
      //const statusEntries = await Promise.all(
        //allUsers.map(async (user: User) => {
          //const isFollowing = await checkFollowStatus(user.id);
          //return [user.id, isFollowing] as const;
       // })
      //);
      //bulkSetFollowStatus(Object.fromEntries(statusEntries));

      //}
      //caching impl
      const userId = await fetchCurrentUserId();
      if( userId){
        setCurrentUserId(userId);
        //prefetch in backgorund
        //const updateStatuses = async () => {
          //const statusEntries = await Promise.all(
            //users.map(async ( user: User) => {
          //const isFollowing = await checkFollowStatus(user.id);
              //return [user.id, isFollowing] as const;
          //  })
          //);
          //bulkSetFollowStatus(Object.fromEntries(statusEntries));
      //};
     // updateStatuses();
     //only update for users not alreaady in usefollowstore
     const currentStatuses = useFollowStore.getState().followStatus;
     const usersToCheck = users.filter(user => !(user.id in currentStatuses));

     if(usersToCheck.length > 0) {
      const statusEntries = await Promise.all(
        usersToCheck.map(async (user: User) => {
          const isFollowing = await checkFollowStatus(user.id);
          return [user.id, isFollowing] as const;
        })
      );
      bulkSetFollowStatus(Object.fromEntries(statusEntries));
     }
    }



      } catch (err) {
       // userError = err
        console.error("Failed to load data and user id", err);
      } finally {
        //if (isMounted){
          //setLoading(false);
        //}
      }

     

      //const allUsers = await fetchUsers();
       
      
      //const userId = await fetchCurrentUserId();
     
      

   
      
      // setLoading(false);

      

   



      
     
    };
//load only if we have users but no currenuserid
if(users.length > 0 && !currentUserId) {

      loadData();
    }
    //loadData();
    
    //return () => {
     //isMounted = false;
    //};
    
  }, [users]);//do it when users data changes
  //handle follwoing relations
useEffect(() => {
  if (followingRelations.length > 0) {
    const followedUserIds = followingRelations.map(relation => relation.followedId);
    setFollowingUserIds(followedUserIds);
  }
}, [followingRelations]);
  //

  useEffect(() => {
  // When tab changes but search is active,this  maintain search results
  if (isSearchActive && searchQuery) {
    handleSearch(searchQuery);
  } else if (!isSearchActive && users.length > 0) {
    setDisplayedUsers(users);
  }
}, [activeTab, isSearchActive,users]);

const loadFollowingData = async (userId: number) => {
  await refetchFollowing();
  setHasLoadedFollowing(true);
  console.log(userId, "has loaded following");
  //setfollowingloading(true);
   //await fetchFollowing(userId, users);
   //setfollowingloading(false);
   //setHasLoadedFollowing(true);
}
  const renderUserCard = (user: User) => {
    
    if (unfollowingId === user.id || followingId === user.id) {
      return (
        <Card key={user.id} className="dark:bg-stone-400 border-5 border dark:border-stone-700 rounded-2xl">
          <CardContent className="flex border border-5 gap-3 items-start p-4">
            <Skeleton className="w-14 h-14 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
          </CardContent>
        </Card>
      );
    }

    return (
      <Card key={user.id} className="w-full border border-5 dark:bg-stone-400 dark:text-white border dark:border-stone-700 rounded-2xl">
        <CardContent className="flex gap-3 items-start p-4">
          <Avatar className="w-14 h-14 border-4 border-slate-300">
            <AvatarImage src={user.profilePicture} alt={user.username} />
            <AvatarFallback>{user.username[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{user.displayName}</p>
            <p className="text-sm text-gray-500 dark:text-neutral-400">@{user.username}</p>
            <p className="text-sm dark:text-neutral-300 mt-1">{user.bio}</p>
          </div>
          {followStatus[user.id] ? (
            <Button
              onClick={() => handleUnfollow(user.id)}
              className="min-w-[90px] px-4 py-1  rounded-full  border border-gray-400 font-semibold dark:text-stone-400 dark:bg-teal-950 hover:bg-lime-500 hover:cursor-pointer transition-colors duration-200"
            >
              Unfollow
            </Button>
          ) : (
            <Button
              onClick={() => handleFollow(user.id)}
              className="min-w-[90px] px-4 py-1 dark:bg-teal-950  rounded-full bg-lime-500 text-stone-400  font-semibold hover:bg-lime-600 hover:cursor-pointer transition-colors duration-200"
            >
              Follow
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSkeleton = () =>
    Array.from({ length: 4 }).map((_, idx) => (
      <Card key={idx} className="dark:bg-stone-400 dark:border-stone-700 rounded-2xl">
        <CardContent className="flex gap-3 items-start p-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </CardContent>
      </Card>
    ));
 //debounce
 // const debouncedSearch = debounce(handleSearch, 300);
 //fix lint error by specyfing tyoe
 const debouncedSearch = debounce((query: string) => {
  handleSearch(query);
}, 300);

  //

  return (
    <div className="flex min-h-screen bg-gray-200 dark:bg-teal-950 dark:text-white">
      <aside className="  lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>

      <main className="flex-1 sm:p6 p-4 pl-2 min-h-screen overflow-y-auto">
        

        <div className="flex border-5 justify-between items-center px-4 py-3 sticky top-0 dark:bg-stone-400 border rounded-2xl dark:border-stone-700 z-10">
          <h1 className="text-xl dark:text-stone-700 font-bold">Explore</h1>
          <div className="flex items-center gap-2">
            <SearchUser onSearch={debouncedSearch} />
             <Link to="/settings">
            <Settings size={20} className="dark:text-stone-700" />
          </Link>

          </div>
          
         
        </div>

        <Tabs
        value={activeTab}
        onValueChange={ (val) => {
          setActiveTab(val);
          if (val === "accounts following" && !hasLoadedFolllowing && currentUserId !== null) {
            loadFollowingData(currentUserId);
          }
        }}
         className="w-full p-2">
          <TabsList className="w-full flex justify-around rounded-2xl border dark:border-stone-700  dark:bg-teal-950">
            {[ "accounts", "accounts following"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-1 rounded-2xl dark:teal-950 text-green capitalize dark:data-[state=active]:text-black dark:data-[state=active]:border-b-2 dark:data-[state=active]:border-stone-700"
              >
                {tab.replace(/^[a-z]/, (c) => c.toUpperCase())}
              </TabsTrigger>
            ))}
          </TabsList>

         

          <TabsContent value="accounts">
            <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-2 gap-2">
            {usersLoading ? (
      renderSkeleton()
    ) : (
      displayedUsers.map(renderUserCard)
    )}
            </div>
          </TabsContent>

          <TabsContent value="accounts following">
            <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-2 gap-2">
             {followingLoading ? (
      renderSkeleton()
    ) : (
      displayedUsers
        .filter(u => followingUserIds.includes(u.id))
        .map(renderUserCard)
    )}

          
        
          
      
        
          </div>

          </TabsContent>
        </Tabs>

        <div className="w-full  px-4 mt-7 py-2 space-y-6 block lg:hidden">
          <WhatsHappening />
          <WhoToFollow />
        </div>
      </main>

      <aside className="gap-4 flex flex-col ">
        <div className="sticky p-3 top-4 z-10  ">
         
        </div>
        
        <RightSidebar />
      </aside>
    </div>
  );
};

export default Explore;
