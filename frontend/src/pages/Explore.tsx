//import reusable auth hook ere
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings } from "lucide-react";
import PersonalSidebar from "@/components/PersonalSidebar";
import { useNavigate } from "react-router-dom";
import { useStoreHydration } from '@/hooks/useStoreHydration';
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";
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

interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  email: string;
  profilePicture?: string;
  bio?: string | null;
  dateOfBirth?: string | null;
}

/*interface FollowRelation {
  id: number;
  followerId: number;
  followedId: number;
  followedAt: string;
}*/

const Explore = () => {
  const isHydrated = useStoreHydration();
  //auth hook
  const isAuthenticated = useAuthCheck();

  //
  //add sep states for search
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  //monitor sesrch query and check is search is active
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const navigate = useNavigate();
  //
  //  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("accounts");
  // State to manage current user ID and following user IDs
  const [hasLoadedFollowing, setHasLoadedFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const { followingUserIds, setFollowingUserIds } = useFollowStore();
  // const [loading, setLoading] = useState(true);
  // const [followingloading, setfollowingloading] = useState(true);
  const [unfollowingId, setUnfollowingId] = useState<number | null>(null);
  const [followingId, setFollowingId] = useState<number | null>(null);
  const { followStatus, setFollowStatus, bulkSetFollowStatus } = useFollowStore();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  //
  //cachce fetching for users in tabs
  const queryClient = useQueryClient();
  const {
    data: users = [],
    isLoading: usersLoading,

  } = useUsersQuery();

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/myInfo`, {
        credentials: "include",
      });
      if (!res.ok){
        throw new Error(`Failed to fetch user info: ${res.status}`);
      }
         
      const data: UserProfile = await res.json();
      if (!data.username || !data.displayName) {
        throw new Error("User info missing username or displayName");
      }
      return data;
    } catch (err) {
      console.error("Error fetching user info:", err);
      navigate("/login");
      return null;
    }
  };

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
      if (users.length > 0) {
        setDisplayedUsers(users); // Reset to all users when query is empty

      }

      return;
    }

    setIsSearchActive(true); // User is actively searching
    //setIsSearching(true);
    //first try abd flter from clinet side for instant results - quciker
    if (users.length > 0 && trimmedQuery.length <= 3) {
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

      if (trimmedQuery === searchQuery.trim()) { //added checking for if we're still seearching same thing
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
      if (!res.ok) {
        console.error(`HTTP ${res.status} for user ${userId}`);
        return false;
      }

      const data = await res.json();
      ////console.log(`Full response for user ${userId}:`, data); // Debug the full response
      //console.log(`isFollowing value for user ${userId}:`, data.isFollowing);
      // Handle undefined response - if you're following them, return true
      const isFollowing = data.isFollowing;
      if (isFollowing === undefined || isFollowing === null) {
        //console.warn(`Undefined follow status for user ${userId}, checking following list`);

        // Check if this user is in your following list
        const currentFollowing = useFollowStore.getState().followingUserIds;

        const fallbackFollowing = currentFollowing.includes(userId);
        //console.log(`Fallback value for user ${userId}:`, fallbackFollowing);
        return fallbackFollowing;
      }

      // return data.following;
      return Boolean(isFollowing);//ensure and heck we return true
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
      if (currentUserId) {
        await refetchFollowing();
        //invalidate to force refresh
        queryClient.invalidateQueries({ queryKey: ['following', currentUserId] });
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
      if (currentUserId) {
        await refetchFollowing();
        //force refresh
        queryClient.invalidateQueries({ queryKey: ['following', currentUserId] });
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
        setIsLoadingUser(true);
        const user = await fetchCurrentUser();
        if(!user){
          navigate("/login");
          setIsLoadingUser(false);
          return;
        }
        setCurrentUser(user);

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
        if (userId) {
          setCurrentUserId(userId);
          await refetchFollowing();//try wait for following data to load first

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
          //immediately get hydrated state
         const currentStatuses = useFollowStore.getState().followStatus;
        const currentFollowing = useFollowStore.getState().followingUserIds;
        
        //('Current hydrated statuses:', currentStatuses);
       // console.log('Current following IDs:', currentFollowing);
        
        // Instead of checking each user individually, use the following list
        const newStatuses: Record<number, boolean> = {};
        
        users.forEach(user => {
          // If we don't have a status for this user, determine it
          const shouldBeFollowing = currentFollowing.includes(user.id);
          if (!(user.id in currentStatuses) || currentStatuses[user.id] !== shouldBeFollowing) {
            // Use the following list to determine status
            newStatuses[user.id] = shouldBeFollowing;
          }
        });
        
       // console.log('New statuses to add from following list:', newStatuses);
        
        // Only update if we have new statuses
        if (Object.keys(newStatuses).length > 0) {
          bulkSetFollowStatus(newStatuses);
        }
      }

      setIsLoadingUser(false);
    } catch (err) {
      console.error("Failed to load data:", err);
      navigate("/login");
      setIsLoadingUser(false);
    }
  };
    //load only if we have users but no currenuserid
    if (users.length > 0 && isHydrated) {

      loadData();
    }
    //loadData();

    //return () => {
    //isMounted = false;
    //};

  }, [users, isHydrated]);//do it when users data changes and we have hydrated 
  //handle follwoing relations
  useEffect(() => {
    if (followingRelations.length > 0 && isHydrated) {
      const followedUserIds = followingRelations.map(relation => relation.followedId);
      setFollowingUserIds(followedUserIds);
      // Immediately update follow statuses based on the new following data
      const currentStatuses = useFollowStore.getState().followStatus;
      const newStatuses: Record<number, boolean> = {};

      followedUserIds.forEach(userId => {
        if (currentStatuses[userId] !== true) {
          newStatuses[userId] = true;
        }
      });

      if (Object.keys(newStatuses).length > 0) {
        // console.log('Updating follow statuses from relations:', newStatuses);
        bulkSetFollowStatus(newStatuses);
      }
    }
  }, [followingRelations, isHydrated]);
  //

  useEffect(() => {
    // When tab changes but search is active,this  maintain search results
    if (isSearchActive && searchQuery) {
      handleSearch(searchQuery);
    } else if (!isSearchActive && users.length > 0) {
      setDisplayedUsers(users);
    }
  }, [activeTab, isSearchActive, users]);

  const loadFollowingData = async (userId: number) => {
    await refetchFollowing();
    setHasLoadedFollowing(true);
    console.log(userId);
    //setfollowingloading(true);
    //await fetchFollowing(userId, users);
    //setfollowingloading(false);
    //setHasLoadedFollowing(true);
  }
  //have the hek happen b4 anything else
    //opionsl to display this , but it would be annoying if it apears for EVERY single page so i opted out
//if (isAuthenticated === null) {
    // Still checking auth,
  //  return (
    //  <div className="flex justify-center items-center min-h-screen dark:bg-blue-950">
      //  <p className="text-lg text-slate-400">Checking authentication...</p>
      //</div>
    //);
  //}

  if (!isAuthenticated) {
    // Redirect will happen automatically in useAuthCheck hook
    return null;
  }
  const renderUserCard = (user: User) => {
    const isFollowing = followStatus[user.id] === true; // Explicitly check for true

    if (unfollowingId === user.id || followingId === user.id) {
      return (
        <Card key={user.id} className=" future-feed:bg-card future-feed:border-lime">
          <CardContent className="flex border border gap-3 items-start p-4">
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
      <Card key={user.id} className="  text-black   border-rose-gold-accent-border future-feed:bg-card future-feed:border-lime future-feed:text-white  w-full  border">
        <CardContent className="flex gap-3 items-start p-4">
          <Avatar
            className="w-14 h-14 border-4 border-slate-300 hover:cursor-pointer"
            onClick={() => navigate(`/profile/${user.id}`)}
          >
            <AvatarImage src={user.profilePicture} alt={user.username} />
            <AvatarFallback>{user.username[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p
              className="font-semibold hover:cursor-pointer hover:underline"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              {user.displayName}</p>
            <p
              className="text-sm text-gray-500 hover:cursor-pointer hover:underline"
              onClick={() => navigate(`/profile/${user.id}`)}
            >@{user.username}</p>
            <p className="text-sm mt-1">{user.bio}</p>
          </div>
          {isFollowing ? (
            <Button variant={"secondary"}
              onClick={() => handleUnfollow(user.id)}
              className="min-w-[90px] px-4 py-1  rounded-full   font-semibold   hover:cursor-pointer transition-colors duration-200"
            >
              Unfollow
            </Button>
          ) : (
            <Button
              onClick={() => handleFollow(user.id)}
              className="min-w-[90px] px-4 py-1   rounded-full   font-semibold hover:cursor-pointer transition-colors duration-200"
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
      <Card key={idx} className="future-feed:bg-card future-feed:border-lime ">
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

  if (isLoadingUser) {
  return (
    <div className="flex flex-col lg:flex-row items-start future-feed:bg-black future-feed:text-lime min-h-screen bg-white dark:bg-blue-950 dark:text-white">
      <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>
      <main className="w-full lg:flex-1 p-2 overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-2 sticky top-0 dark:bg-indigo-950 dark:border-slate-200 z-10">
          <h1 className="text-xl dark:text-slate-200 font-bold">Explore</h1>
          <div className="flex items-center gap-3">
            <SearchUser onSearch={debouncedSearch} />
            <Link to="/settings">
              <Settings size={20} className="dark:text-slate-200" />
            </Link>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
            if (val === "accounts following" && !hasLoadedFollowing && currentUserId !== null) {
              loadFollowingData(currentUserId);
            }
          }}
          className="w-full p-0 future-feed:text-lime"
        >
          <TabsList className="w-full future-feed:text-lime flex justify-around">
            {["accounts", "accounts following"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-1 capitalize"
              >
                {tab.replace(/^[a-z]/, (c) => c.toUpperCase())}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="accounts">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
              {renderSkeleton()}
            </div>
          </TabsContent>

          <TabsContent value="accounts following">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
              {renderSkeleton()}
            </div>
          </TabsContent>
        </Tabs>

        <div className="w-full px-4 mt-7 py-2 space-y-6 block lg:hidden">
          <WhatsHappening />
          <WhoToFollow />
        </div>
      </main>

      <aside className="hidden lg:block w-full lg:w-[350px] lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto mr-6.5">
        <div className="w-full lg:w-[320px] mt-5 lg:ml-7">
          <WhatsHappening />
        </div>
        <div className="w-full lg:w-[320px] mt-5 lg:ml-7">
          <WhoToFollow />
        </div>
      </aside>
    </div>
  );
}

if(currentUser){
    console.log("Nothing to worry about, everything went well");
  }

  if (isLoadingUser) {
  return (
    <div className="flex flex-col lg:flex-row items-start future-feed:bg-black future-feed:text-lime  min-h-screen bg-white dark:bg-blue-950 dark:text-white">
      <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>
      <main className="w-full lg:flex-1 p-2 overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-2 sticky top-0 dark:bg-indigo-950 dark:border-slate-200 z-10">
          <h1 className="text-xl dark:text-slate-200 font-bold">Explore</h1>
          <div className="flex items-center gap-3">
            <SearchUser onSearch={debouncedSearch} />
            <Link to="/settings">
              <Settings size={20} className="dark:text-slate-200" />
            </Link>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
            if (val === "accounts following" && !hasLoadedFollowing && currentUserId !== null) {
              loadFollowingData(currentUserId);
            }
          }}
          className="w-full p-0 future-feed:text-lime"
        >
          <TabsList className="w-full future-feed:text-lime flex justify-around">
            {["accounts", "accounts following"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-1 capitalize"
              >
                {tab.replace(/^[a-z]/, (c) => c.toUpperCase())}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="accounts">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
              {renderSkeleton()}
            </div>
          </TabsContent>

          <TabsContent value="accounts following">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
              {renderSkeleton()}
            </div>
          </TabsContent>
        </Tabs>

        <div className="w-full px-4 mt-7 py-2 space-y-6 block lg:hidden">
          <WhatsHappening />
          <WhoToFollow />
        </div>
      </main>

      <aside className="hidden lg:block w-full lg:w-[350px] lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto mr-6.5">
        <div className="w-full lg:w-[320px] mt-5 lg:ml-7">
          <WhatsHappening />
        </div>
        <div className="w-full lg:w-[320px] mt-5 lg:ml-7">
          <WhoToFollow />
        </div>
      </aside>
    </div>
  );
}

if(currentUser){
    console.log("Nothing to worry about, everything went well");
  }

  //

  return (
    <div className="flex flex-col lg:flex-row items-start future-feed:bg-black future-feed:text-lime  min-h-screen bg-white">
      <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>
      <main className="w-full lg:flex-1 p-2 overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-2 sticky top-0 z-10">
          <h1 className="text-xl font-bold">Explore</h1>
          <div className="flex items-center gap-3">
            <SearchUser onSearch={debouncedSearch} />
            <Link to="/settings">
              <Settings size={20} />
            </Link>

          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
            if (val === "accounts following" && !hasLoadedFollowing && currentUserId !== null) {
              loadFollowingData(currentUserId);
            }
          }}
          className="w-full p-0 future-feed:text-lime">
          <TabsList className="w-full future-feed:text-lime flex justify-around ">
            {["accounts", "accounts following"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-1   capitalize  "
              >
                {tab.replace(/^[a-z]/, (c) => c.toUpperCase())}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="accounts">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
              {!isHydrated || usersLoading ? (
                renderSkeleton()
              ) : (
                displayedUsers.map(renderUserCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="accounts following">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
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

        <div className="w-full  px-4 mt-7 py-2  space-y-6 block lg:hidden">
          <WhatsHappening />
          <WhoToFollow />
        </div>
      </main>

      <aside className="hidden lg:block w-full lg:w-[350px] lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto mr-6.5 ">
        <div className="w-full lg:w-[320px] mt-5 lg:ml-7 ">
          <WhatsHappening />

        </div>
        <div className="w-full lg:w-[320px] mt-5 lg:ml-7">

          <WhoToFollow />
        </div>

      </aside>
    </div>
  );
};

export default Explore;