
<h2>User Management Service Contract</h2> <p>This service handles user login and authentication as well as CRUD operations on user accounts.</p> <table> <thead> <tr> <th>Field</th> <th>Description</th> </tr> </thead> <tbody> <tr> <td><strong>Name:</strong> registerUser</td> <td> <strong>Purpose:</strong> Register a user<br/> <strong>Inputs:</strong> { string: username, string: email, string: password, string: displayName, string: profilePicture, LocalDate: dateofBirth }<br/> <strong>Outputs:</strong> Acknowledgement </td> </tr> <tr> <td><strong>Name:</strong> authenticateUser</td> <td> <strong>Purpose:</strong> Validates user credentials and returns a user.<br/> <strong>Inputs:</strong> { username, password }<br/> <strong>Outputs:</strong> { success: user, fail: “invalid username or password” } </td> </tr> <tr> <td><strong>Name:</strong> login</td> <td> <strong>Purpose:</strong> Logs a user into Future Feed<br/> <strong>Inputs:</strong> { string: username, string: password }<br/> <strong>Outputs:</strong> Acknowledgement, logged in </td> </tr> <tr> <td><strong>Name:</strong> getCurrentUser</td> <td> <strong>Purpose:</strong> Returns current user<br/> <strong>Inputs:</strong> { username }<br/> <strong>Outputs:</strong> { success: user, fail: appropriate error message } </td> </tr> <tr> <td><strong>Name:</strong> api/user/update</td> <td> <strong>Purpose:</strong> Updates Update the profile infromation of currently authenticated user<br/> <strong>Inputs:</strong> { string: username, string: displayName, string: profilePicture, LocalDate: dateOfBirth, string: bio }
}<br/> <strong>Method:</strong> PUT<br/> <strong>Outputs:</strong> {RAW BODY JSON <br/>
"displayName": "Johnny Update",
  "profilePicture": "https://cdn.site.com/profile/new.jpg",
  "bio": "Updated bio",
  "dateOfBirth": "1996-01-15"
} </td> </tr> <tr> <td><strong>Name:</strong> api/user/delete</td> <td> <strong>Purpose:</strong>Delete the currently authenticated user and invalidate their session<br/> <strong>Inputs:</strong> {  }
<br/> <strong>Method:</strong> DELETE <br/> <strong>Outputs:</strong> Acknowledgement <br/>User 'john wick' deleted and session invalidated</td> </tr> <tr> <td><strong>Name:</strong> api/user/myInfo</td> <td> <strong>Purpose:</strong> Fetch the profile of the currently authenticated user.<br/> <strong>Inputs:</strong> {  }<br/> 
<strong>Method:</strong> GET
<strong>Outputs:</strong> {RAW JSON BODY FORMAT <Br/>
"id": 3,
  "username": "john_doe",
  "displayName": "John D",
  "email": "john@example.com",
  "profilePicture": "https://cdn.site.com/profile/john.jpg",
  "bio": "Just a regular coder.",
  "dateOfBirth": "1995-04-23"
} 
</td> </tr> <tr> <td><strong>Name:</strong> api/user/{id}</td> <td> <strong>Purpose:</strong>Retrieve a user's public profile by user id<br/> <strong>Inputs:</strong> {int: id  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON FORMAT <br/>"id": 3,
  "username": "john_doe",
  "displayName": "John D",
  "email": "john@example.com",
  "profilePicture": "https://cdn.site.com/profile/john.jpg",
  "bio": "Just a regular coder.",
  "dateOfBirth": "1995-04-23"}</td> </tr> <tr> <td>
  </td> </tr> <tr> <td><strong>Name:</strong> api/user/search?q={keyword}</td> <td> <strong>Purpose:</strong>Search for users whose profile info matches the keyword<br/> <strong>Inputs:</strong> {String: keyword  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON FORMAT <br/>"id": 3,
  "username": "john_doe",
  "displayName": "John D",
  "email": "john@example.com",
  "profilePicture": "https://cdn.site.com/profile/john.jpg",
  "bio": "Just a regular coder.",
  "dateOfBirth": "1995-04-23"}</td> </tr> <tr> <td>
  </td> </tr> <tr> <td><strong>Name:</strong> api/user/all</td> <td> <strong>Purpose:</strong>Retrieve a list of all registered users<br/> <strong>Inputs:</strong> {  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON FORMAT <br/>"id": 3,
  "username": "john_doe",
  "displayName": "John D",
  "email": "john@example.com",
  "profilePicture": "https://cdn.site.com/profile/john.jpg",
  "bio": "Just a regular coder.",
  "dateOfBirth": "1995-04-23"},<br/>
  ....</td> </tr> <tr> <td>
</td>
</td> </tr> <tr> <td><strong>Name:</strong> api/user/all-except-me</td> <td> <strong>Purpose:</strong>Retrieve all users except currently logged in user<br/> <strong>Inputs:</strong> {  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON FORMAT <br/>{
    "id": 2,
    "username": "JaneDoe",
    "email": "jane@example.com",
    "displayName": "Jane Doe",
    "profilePicture": "https://example.com/images/jane.jpg",
    "dateOfBirth": "1995-05-10",
    "bio": "Loving life and coffee."
  }, <br/>
  {
    "id": 3,
    "username": "MarkSmith",
    "email": "mark@example.com",
    "displayName": "Mark Smith",
    "profilePicture": "https://example.com/images/mark.jpg",
    "dateOfBirth": "1990-08-22",
    "bio": "Traveler, photographer."
  }>
  ....</td> </tr> <tr> <td>
</td>
 
</tr> 


</tbody> </table> <br/>
<h2>Post Management Service</h2> <p>This service handles user interaction in the form of posts</p> <table> <thead> <tr> <th>Field</th> <th>Description</th> </tr> </thead> <tbody> </td> </tr> <tr> <td><strong>Name:</strong> api/posts</td> <td> <strong>Purpose:</strong> Creates a post by the logged in user<br/> <strong>Inputs:</strong> {String: content  }
}<br/> <strong>Method:</strong> POST<br/> <strong>Outputs:</strong> {RAW BODY JSON <br/>
 "id": 12,
  "content": "This is my first post!",
  "authorId": 1,
  "createdAt": "2025-06-18T19:00:00Z"
} </td> </tr> <tr> <td><strong>Name:</strong> api/posts</td> <td> <strong>Purpose:</strong>Creates a post wih optional media file and JSON data<br/> <strong>Inputs:</strong> {String: content, Content-type: multipart/form-data  }
<br/> <strong>Method:</strong> POST <br/> <strong>Outputs:</strong> {RAW  BODY JSON<br/>"id": 13,
  "content": "This is my first post with an image!",
  "authorId": 1,
  "imageUrl": "https://cdn.example.com/uploads/image.jpg",
  "createdAt": "2025-06-18T19:05:00Z"}</td> </tr> <tr> <td><strong>Name:</strong> api/posts/{id}</td> <td> <strong>Purpose:</strong> Retrieves a single post by id.<br/> <strong>Inputs:</strong> {int: id  }<br/> 
<strong>Method:</strong> GET
<strong>Outputs:</strong> {RAW JSON BODY FORMAT <Br/>
"id": 12,
  "content": "This is my first post!",
  "authorId": 1,
  "createdAt": "2025-06-18T19:00:00Z"
} 
</td> </tr> <tr> <td><strong>Name:</strong> api/user/del/{id}</td> <td> <strong>Purpose:</strong>Deletes a post by its Id<br/> <strong>Inputs:</strong> {int: id  }
<br/> <strong>Method:</strong> DELETE <br/> <strong>Outputs:</strong> {Acknowledgement <br/>If found: "Post deleted successfully"}</td> </tr> <tr> <td>
  </td> </tr> <tr> <td><strong>Name:</strong> api/posts/search?keyword={keyword}</td> <td> <strong>Purpose:</strong>Searches for posts containing a specified keyword<br/> <strong>Inputs:</strong> {String: keyword  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON FORMAT <br/>{
    "id": 12,
    "content": "This is my first post!",
    "authorId": 1,
    "createdAt": "2025-06-18T19:00:00Z"
  }, <br/>
  ...}</td> </tr> <tr> <td>
  </td> </tr> <tr> <td><strong>Name:</strong> api/posts</td> <td> <strong>Purpose:</strong>Retreives all posts<br/> <strong>Inputs:</strong> {  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON FORMAT <br/>{
    "id": 12,
    "content": "This is my first post!",
    "authorId": 1,
    "createdAt": "2025-06-18T19:00:00Z"
  }, <br/>
  ...},<br/>
  ....</td> </tr> <tr> <td>
</td>
</td> </tr> <tr> <td><strong>Name:</strong> api/posts/user/{userId}</td> <td> <strong>Purpose:</strong>Retrieves posts created by a specific user<br/> <strong>Inputs:</strong> { int: id }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON FORMAT <br/>{
   {
    "id": 12,
    "content": "This is my first post!",
    "authorId": 1,
    "createdAt": "2025-06-18T19:00:00Z"
  }, <br/>
  ...</td> </tr> <tr> <td>
  </td> </tr> <tr> <td><strong>Name:</strong> api/posts/commented/{userId}</td> <td> <strong>Purpose:</strong>Retrieves posts commented  on by a specific user<br/> <strong>Inputs:</strong> { int: id }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON FORMAT <br/>{
 {
    "id": 8,
    "content": "Great discussion here.",
    "authorId": 2,
    "createdAt": "2025-06-16T09:15:00Z"
  }, <br/>
  ...</td> </tr> <tr> <td>
  </td> </tr> <tr> <td><strong>Name:</strong> api/posts/liked/{userId}</td> <td> <strong>Purpose:</strong>Retrieves posts liked by a specific user<br/> <strong>Inputs:</strong> { int: id }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON FORMAT <br/>{
   {
    "id": 12,
    "content": "This is my first post!",
    "authorId": 1,
    "createdAt": "2025-06-18T19:00:00Z"
  }, <br/>
  ...</td> </tr> <tr> <td>
  </td> </tr> <tr> <td><strong>Name:</strong> api/posts/paginated</td> <td> <strong>Purpose:</strong>Retrieves posts in a paginated format<br/> <strong>Inputs:</strong> { int: size}
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON FORMAT <br/>{
   "content": [
    {
      "id": 12,
      "content": "This is my first post!",
      "authorId": 1,
      "imageUrl": null,
      "createdAt": "2025-06-18T19:00:00Z"
    } <br/>
  ], <br/>
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },<br/>
  "totalPages": 1,
  "totalElements": 1</td> </tr> <tr> <td>
</td>
 
</tr> 


</tbody> </table>
</tbody> </table> <br/>
<h2>Like Management Service</h2> <p>This service handles user interaction in the form of likes</p> <table> <thead> <tr> <th>Field</th> <th>Description</th> </tr> </thead> <tbody> </td> </tr> <tr> <td><strong>Name:</strong> api/likes/{postId}</td> <td> <strong>Purpose:</strong> Likes a post by its Id<br/> <strong>Inputs:</strong> {int: id  }
}<br/> <strong>Method:</strong> POST<br/> <strong>Outputs:</strong> Acknowledgement <br/>
 "Post liked successfully </td> </tr> <tr> <td><strong>Name:</strong> api/likes/{postId}</td> <td> <strong>Purpose:</strong>Removes like from a post<br/> <strong>Inputs:</strong> {int: id  }
<br/> <strong>Method:</strong> DELETE <br/> <strong>Outputs:</strong> Acknowledgement<br/>"Post unliked"</td> </tr> <tr> <td><strong>Name:</strong> api/likes/count/{postid}</td> <td> <strong>Purpose:</strong> Get the number of likes on a post <br/> <strong>Inputs:</strong> {int: id  }<br/> 
<strong>Method:</strong> GET
<strong>Outputs:</strong> Expected response: 5
</td> </tr> <tr> <td><strong>Name:</strong> api/likes/has-liked/{postId}</td> <td> <strong>Purpose:</strong>Checks if the logged in user has liked the post<br/> <strong>Inputs:</strong> {int: postid  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> Expected Response: True or False</td> </tr> <tr> <td>
 
</tbody> </table>
 <br/> 
 

</tbody> </table>
</tbody> </table> <br/>
<h2>Comment Management Service</h2> <p>This service handles user interaction in the form of comments</p> <table> <thead> <tr> <th>Field</th> <th>Description</th> </tr> </thead> <tbody> </td> </tr> <tr> <td><strong>Name:</strong> api/comments/{postId}</td> <td> <strong>Purpose:</strong> Adds a new comment to a post.<br/> <strong>Inputs:</strong> {int: postid,String: text  }
}<br/> <strong>Method:</strong> POST<br/> <strong>Outputs:</strong> {RAW JSON BODY DATA<br/>
 "id": 7,
  "postId": 12,
  "authorId": 3,
  "content": "This is my comment",
  "createdAt": "2025-06-18T19:30:00Z"
}</td> </tr> <tr> <td><strong>Name:</strong> api/comments/posts/{postid}</td> <td> <strong>Purpose:</strong>Returns all comments for a specific post<br/> <strong>Inputs:</strong> {int: id  }
<br/> <strong>Method:</strong> GET<br/> <strong>Outputs:</strong> {RAW BODY JSON DATA<br/>{
    "id": 7,
    "postId": 12,
    "authorId": 3,
    "content": "This is my comment",
    "createdAt": "2025-06-18T19:30:00Z"
  }, <br/>
  {
    "id": 8,
    "postId": 12,
    "authorId": 4,
    "content": "Another comment!",
    "createdAt": "2025-06-18T19:32:10Z"
  }
</tbody> </table>
 <h2>
</tbody> </table>
</tbody> </table> <br/>
<h2>Follow Management Service</h2> <p>This service handles user interaction in the form of following a different user</p> <table> <thead> <tr> <th>Field</th> <th>Description</th> </tr> </thead> <tbody> </td> </tr> <tr> <td><strong>Name:</strong> api/follow</td> <td> <strong>Purpose:</strong>The logged in user follows another user.<br/> <strong>Inputs:</strong> {i  }
}<br/> <strong>Method:</strong> POST<br/> <strong>Outputs:</strong> Acknowledgement<br/>
 "Followed successfully""
</td> </tr> <tr> <td><strong>Name:</strong> api/follow/{followedId}</td> <td> <strong>Purpose:</strong>The logged in user unfollows another user by Id<br/> <strong>Inputs:</strong> {int: id  }
<br/> <strong>Method:</strong> DELETE <br/> <strong>Outputs:</strong> Acknowledgement<br/>{
  "Unfollowed successfully"
  </td> </tr> <tr> <td><strong>Name:</strong> api/follow/status/{followedId}</td> <td> <strong>Purpose:</strong>Check if the logged in user is following the specified user<br/> <strong>Inputs:</strong> {int: id  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON<br/>"following": true
  }
  </td> </tr> <tr> <td><strong>Name:</strong> api/follow/followers/{userid}</td> <td> <strong>Purpose:</strong>Returns a list of users who follow the given user<br/> <strong>Inputs:</strong> {int: id  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON<br/>
  ""id": 5,
    "followerId": 1,
    "followedId": 2,
    "followedAt": "2025-06-18T18:40:00Z"
  }</td> </tr> <tr> <td><strong>Name:</strong> api/follow/following/{userid}</td> <td> <strong>Purpose:</strong>Returns a list of users the given user is following <br/> <strong>Inputs:</strong> {int: id  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON<br/>"following": true
  }
  </td> </tr> <tr> <td><strong>Name:</strong> api/follow/{followedId}</td> <td> <strong>Purpose:</strong>The logged in user unfollows another user by Id<br/> <strong>Inputs:</strong> {int: id  }
<br/> <strong>Method:</strong> DELETE <br/> <strong>Outputs:</strong> {RAW BODY JSON<br/>"id": 6,
    "followerId": 1,
    "followedId": 3,
    "followedAt": "2025-06-18T18:42:00Z"
  }
</tbody> </table>
<br/>
<h2>Reshare Management Service</h2> <p>This service handles user interaction in the form of resharing posts </p> <table> <thead> <tr> <th>Field</th> <th>Description</th> </tr> </thead> <tbody> </td> </tr> <tr> <td><strong>Name:</strong> api/reshares</td> <td> <strong>Purpose:</strong>Reshare a post by Id.<br/> <strong>Inputs:</strong> {int: postid  }
}<br/> <strong>Method:</strong> POST<br/> <strong>Outputs:</strong> Acknowledgement<br/>
 "Post reshared""
</td> </tr> <tr> <td><strong>Name:</strong> api/reshares/{postId}</td> <td> <strong>Purpose:</strong>Remove a reshared post<br/> <strong>Inputs:</strong> {int: id  }
<br/> <strong>Method:</strong> DELETE <br/> <strong>Outputs:</strong> Acknowledgement<br/>{
  "Post unreshared"
  </td> </tr> <tr> <td><strong>Name:</strong> api/reshares</td> <td> <strong>Purpose:</strong>Returns all posts the logged in user has reshared<br/> <strong>Inputs:</strong> {  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON<br/>  {
    "id": 1,
    "userId": 3,
    "postId": 12,
    "resharedAt": "2025-06-18T20:05:00Z"
  }, <br/>
  {
    "id": 2,
    "userId": 3,
    "postId": 14,
    "resharedAt": "2025-06-18T20:10:00Z"
  }<br/>
  }
  </td> </tr> <tr> <td><strong>Name:</strong> api/reshares/{postid}/count</td> <td> <strong>Purpose:</strong>Returns the total number of times a post has been reshared<br/> <strong>Inputs:</strong> {int: id  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> Success response:<br/>
  5</td> </tr> <tr> <td><strong>Name:</strong> api/reshares/{postid}/has-reshared</td> <td> <strong>Purpose:</strong>Returns true if the logged in user has reshared the post , otherwise false <br/> <strong>Inputs:</strong> {int: id  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> Expected response:<br/>true or false
  
</tbody> </table>
<br/>
<h2>Topic Management Service</h2> <p>This service handles user interaction in the form of topic creation </p> <table> <thead> <tr> <th>Field</th> <th>Description</th> </tr> </thead> <tbody> </td> </tr> <tr> <td><strong>Name:</strong> api/topics</td> <td> <strong>Purpose:</strong>Creates a new topic.<br/> <strong>Inputs:</strong> {Authorization: Bearer <access token, Content-type: application/json ,String topic }
}<br/> <strong>Method:</strong> POST<br/> <strong>Outputs:</strong> {RAW BODY JSON<br/>
 "id": 1,
  "name": "Technology"}
</td> </tr> <tr> <td><strong>Name:</strong> api/topics</td> <td> <strong>Purpose:</strong>Retrieves all available topics<br/> <strong>Inputs:</strong> {Headers: optional, Authorization: Bearer <access token>  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON DATA<br/>{
    "id": 1,
    "name": "Technology"
  },<br/>
  {
    "id": 2,
    "name": "Science"
  }
  </td> </tr> <tr> <td><strong>Name:</strong> api/topics/assign</td> <td> <strong>Purpose:</strong>Assign multiple topic Ids to a post<br/> <strong>Inputs:</strong> {Headers: optional, Authorization: Bearer <access token>, Content-type:application/json, int: postid, int: topicids  }
<br/> <strong>Method:</strong> POST <br/> <strong>Outputs:</strong> Acknowledgement<br/> "Topics assigned to post"  </td> </tr> <tr> <td><strong>Name:</strong> api/topics/post/{postid}</td> <td> <strong>Purpose:</strong>Retrieves topic ids linked to a specific post<br/> <strong>Inputs:</strong> {int: postid  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> Expected response:<br/>
  [1,2]</td> </tr> <tr> <td><strong>Name:</strong> api/topics/by-topiv/{topicId}</td> <td> <strong>Purpose:</strong>Returns all post Ids that are tagged with the given topic <br/> <strong>Inputs:</strong> {int: topicid  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> Expected response:<br/>[12, 13, 22]
  
</tbody> </table>
<br/>
<h2>Feed Preset  Service</h2> <p>This service handles user engagement in the form of presets being displayed on the users feed </p> <table> <thead> <tr> <th>Field</th> <th>Description</th> </tr> </thead> <tbody> </td> </tr> <tr> <td><strong>Name:</strong> api/presets</td> <td> <strong>Purpose:</strong>Creates a named feed preset.<br/> <strong>Inputs:</strong> {Authorization: Bearer <access token, Content-type: application/json ,String: presetName }
}<br/> <strong>Method:</strong> POST <br/> <strong>Outputs:</strong> {RAW BODY JSON<br/>
   "id": 1,
  "userId": 3,
  "name": "Tech & Bots"}
</td> </tr> <tr> <td><strong>Name:</strong> api/presets</td> <td> <strong>Purpose:</strong>Retrieves all presets created by the logged in user<br/> <strong>Inputs:</strong> {Headers: optional, Authorization: Bearer <access token>  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON DATA<br/>{
    "id": 1,
    "userId": 3,
    "name": "Tech & Bots"
  },<br/>
  {
    "id": 2,
    "userId": 3,
    "name": "My Interests"
  }
  </td> </tr> <tr> <td><strong>Name:</strong> api/presets/rules</td> <td> <strong>Purpose:</strong>Add a rule to a preset to define feed filtering logic, either by topic or by keyword<br/> <strong>Inputs:</strong> {Headers: optional, Authorization: Bearer <access token>, Content-type:application/json, int: postid, int: topicids, String: type, int: presetid,String:value  }
<br/> <strong>Method:</strong> POST <br/> <strong>Outputs:</strong> {RAW JSON BODY DATA<br/> "id": 10,
  "presetId": 1,
  "type": "KEYWORD",
  "value": "AI"  }</td> </tr> <tr> <td><strong>Name:</strong> api/presets/rules/{presetid}</td> <td> <strong>Purpose:</strong>List all filtering rules for a given preset.<br/> <strong>Inputs:</strong> {{Headers: optional, Authorization: Bearer <access token>,int: presetId  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON DATA<br/>
  {
    "id": 10,
    "presetId": 1,
    "type": "KEYWORD",
    "value": "AI"
  },<br/>
  {
    "id": 11,
    "presetId": 1,
    "type": "TOPIC",
    "value": "technology"
  }</td> </tr> <tr> <td><strong>Name:</strong> api/preset/feed/{presetId}</td> <td> <strong>Purpose:</strong>Apply the rules of a preset to generate a filtered list of posts<br/> <strong>Inputs:</strong> {Headers: optional, Authorization: Bearer <access token>,int: presetid  }
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> Expected Success And Unsuccess response:<br/>{RAW BODY JSON DATA<br/>{
    "id": 101,
    "content": "The rise of AI in technology.",
    "authorId": 4,
    "createdAt": "2025-06-18T21:00:00Z"
  },<br/>
  {
    "id": 102,
    "content": "Latest in robotics and automation.",
    "authorId": 7,
    "createdAt": "2025-06-18T21:05:00Z"
  }<br/> "Error: Preset not found or invalid rules"
  
</tbody> </table>
<br/>
<h2>Bookmark Management  Service</h2> <p>This service handles user interaction in the form of bookmarks </p> <table> <thead> <tr> <th>Field</th> <th>Description</th> </tr> </thead> <tbody> </td> </tr> <tr> <td><strong>Name:</strong> api/bookmarks/{userId}/{postId
}</td> <td> <strong>Purpose:</strong>Adds a bookmark for the given post by the specified user.<br/> <strong>Inputs:</strong> {int: userid, int: postid }
}<br/> <strong>Method:</strong> POST <br/> <strong>Outputs:</strong> Acknowledgement<br/>
   "Bookmark added" or "Bookmark already exists"</td> </tr> <tr> <td><strong>Name:</strong> api/bookmarks/{userid}/{postid}</td> <td> <strong>Purpose:</strong>Removes a bookmark for the given post by the specified user<br/> <strong>Inputs:</strong> {int: postid, int: userid}
<br/> <strong>Method:</strong> DELETE <br/> <strong>Outputs:</strong> Acknowledgement<br/>"Bookmark removed" or "Bookmark not found"
  </td> </tr> <tr> <td><strong>Name:</strong> api/bookmarks/{userid}</td> <td> <strong>Purpose:</strong>retrieves a list of bookmarked posts by the specified user<br/> <strong>Inputs:</strong> {int: userid}
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW JSON BODY DATA<br/> {
    "postId": 12,
    "content": "This is my first post!",
    "authorId": 1,
    "createdAt": "2025-06-18T19:00:00Z"
  },<br/>
  {
    "postId": 15,
    "content": "Interesting read.",
    "authorId": 5,
    "createdAt": "2025-06-20T10:30:00Z"
  }
</tbody> </table>
<br/>
<h2>Bot Management  Service</h2> <p>This service handles user engagement in the form of bot and bot creation</p> <table> <thead> <tr> <th>Field</th> <th>Description</th> </tr> </thead> <tbody> </td> </tr> <tr> <td><strong>Name:</strong> api/bots</td> <td> <strong>Purpose:</strong>Create a new bot for the logged in user.<br/> <strong>Inputs:</strong> {String: name, String: prompt, String: scheduler, String: contextsource }
}<br/> <strong>Method:</strong> POST <br/> <strong>Outputs:</strong> {RAW BODY JSON DATA<br/>
   "id": 5,
  "ownerId": 3,
  "name": "My News Bot",
  "prompt": "Summarize the top tech headlines for the day.",
  "schedule": "hourly",
  "contextSource": "https://za.ign.com/article/news",
  "createdAt": "2025-06-18T19:55:00Z"}</td> </tr> <tr> <td><strong>Name:</strong> api/bots/{botid}</td> <td> <strong>Purpose:</strong>Update one or more fields on the bot owned by the user(partial update via PUT)<br/> <strong>Inputs:</strong> {String: name, String: prompt, String: scheduler, String: contextsource}
<br/> <strong>Method:</strong> PUT <br/> <strong>Outputs:</strong> {RAW BODY JSON DATA<br/> "id": 5,
  "ownerId": 3,
  "name": "My Tech Digest Bot",
  "prompt": "Summarize top tech stories into 3 bullets.",
  "schedule": "daily",
  "contextSource": "https://news.ycombinator.com/",
  "createdAt": "2025-06-18T19:55:00Z"
  }</td> </tr> <tr> <td><strong>Name:</strong> api/bots/{botId}</td> <td> <strong>Purpose:</strong>Deletes a bot owned by the current user<br/> <strong>Inputs:</strong> {int: userid}
<br/> <strong>Method:</strong> DELETE <br/> <strong>Outputs:</strong> Acknowledgement<br/>"Bot deleted successfully"
</td> </tr> <tr> <td><strong>Name:</strong> api/bots/my</td> <td> <strong>Purpose:</strong>Returns all bots created by the logged in user<br/> <strong>Inputs:</strong> {}
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON DATA<br/>   {
    "id": 5,
    "ownerId": 3,
    "name": "My Tech Digest Bot",
    "prompt": "Summarize top tech stories into 3 bullets.",
    "schedule": "daily",
    "contextSource": "https://news.ycombinator.com/",
    "createdAt": "2025-06-18T19:55:00Z"
  }, <br/>
  {
    "id": 6,
    "ownerId": 3,
    "name": "Market Watcher",
    "prompt": "Brief market summary at close.",
    "schedule": "weekly",
    "contextSource": "https://example.com/markets",
    "createdAt": "2025-06-19T08:10:00Z"
  }
  }</td> </tr> <tr> <td><strong>Name:</strong> api/bots/{botId}/execute</td> <td> <strong>Purpose:</strong>Manually execute a bot's logic<br/> <strong>Inputs:</strong> {int: botid}
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON DATA<br/>"output": "Top tech: Open-source tool X hits 10k stars; Company Y unveils Z..."}
</td> </tr> <tr> <td><strong>Name:</strong> api/bot-posts/by-bot{botId}</td> <td> <strong>Purpose:</strong>Returns all posts generated by a specific bot<br/> <strong>Inputs:</strong> {int: botid}
<br/> <strong>Method:</strong> GET <br/> <strong>Outputs:</strong> {RAW BODY JSON DATA<br/> {
    "id": 12,
    "botId": 1,
    "content": "Daily digest: ...",
    "createdAt": "2025-06-18T20:05:00Z"
  },<br/>
  {
    "id": 15,
    "botId": 1,
    "content": "Weekly wrap: ...",
    "createdAt": "2025-06-25T20:10:00Z"
  }
</tbody> </table>


