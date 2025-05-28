<h2>User Management Service Contract</h2>
<p>This service handles user login and authentication as well as CRUD operations on user accounts.</p>

<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Name:</strong> registerUser</td>
      <td>
        <strong>Purpose:</strong> Register a user<br/>
        <strong>Inputs:</strong> { string: username, string: email, string: password, string: displayName, string: profilePicture, LocalDate: dateofBirth }<br/>
        <strong>Outputs:</strong> Acknowledgement
      </td>
    </tr>
    <tr>
      <td><strong>Name:</strong> authenticateUser</td>
      <td>
        <strong>Purpose:</strong> Validates user credentials and returns a user.<br/>
        <strong>Inputs:</strong> { username, password }<br/>
        <strong>Outputs:</strong> { success: user, fail: “invalid username or password” }
      </td>
    </tr>
    <tr>
      <td><strong>Name:</strong> login</td>
      <td>
        <strong>Purpose:</strong> Logs a user into Future Feed<br/>
        <strong>Inputs:</strong> { string: username, string: password }<br/>
        <strong>Outputs:</strong> Acknowledgement, logged in
      </td>
    </tr>
    <tr>
      <td><strong>Name:</strong> getCurrentUser</td>
      <td>
        <strong>Purpose:</strong> Returns current user<br/>
        <strong>Inputs:</strong> { username }<br/>
        <strong>Outputs:</strong> { success: user, fail: appropriate error message }
      </td>
    </tr>
    <tr>
      <td><strong>Name:</strong> updateUser</td>
      <td>
        <strong>Purpose:</strong> Updates user's profile (bio, display picture, username, etc.)<br/>
        <strong>Inputs:</strong> { string: username, string: displayName, string: profilePicture, LocalDate: dateOfBirth, string: bio }<br/>
        <strong>Outputs:</strong> Acknowledgement
      </td>
    </tr>
    <tr>
      <td><strong>Name:</strong> deleteUser</td>
      <td>
        <strong>Purpose:</strong> Deletes user by username from Future Feed<br/>
        <strong>Inputs:</strong> { string: username, string: password, string: email, string: displayName, string: profilePicture, LocalDate: dateOfBirth }<br/>
        <strong>Outputs:</strong> Acknowledgement
      </td>
    </tr>
    <tr>
      <td><strong>Name:</strong> getCurrentUser</td>
      <td>
        <strong>Purpose:</strong> Validates user credentials and returns an authentication token.<br/>
        <strong>Inputs:</strong> { string: username, string: password }
      </td>
    </tr>
  </tbody>
</table>

<br/>

<h2>User Engagement Service Contract</h2>
<p>This service handles post creation and deletion as well as post liking and commenting.</p>

<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Name:</strong> createPost</td>
      <td>
        <strong>Purpose:</strong> Creates a post for the user<br/>
        <strong>Inputs:</strong> { integer: userId, string: content, string: imageURL, boolean: isBot }<br/>
        <strong>Outputs:</strong> Acknowledgement<br/>
        <strong>Error Cases:</strong> Null content or runtime exception
      </td>
    </tr>
    <tr>
      <td><strong>Name:</strong> deletePost</td>
      <td>
        <strong>Purpose:</strong> Deletes a user's post<br/>
        <strong>Inputs:</strong> { integer: userId }<br/>
        <strong>Outputs:</strong> Acknowledgement<br/>
        <strong>Error Cases:</strong> Null content or runtime exception
      </td>
    </tr>
    <tr>
      <td><strong>Name:</strong> likePost</td>
      <td>
        <strong>Purpose:</strong> Likes a post on the user's feed<br/>
        <strong>Inputs:</strong> { integer: userId, integer: postId }<br/>
        <strong>Outputs:</strong> Acknowledgement, post liked
      </td>
    </tr>
    <tr>
      <td><strong>Name:</strong> unlikePost</td>
      <td>
        <strong>Purpose:</strong> Unlikes a post<br/>
        <strong>Inputs:</strong> { integer: userId, integer: postId }<br/>
        <strong>Outputs:</strong> Acknowledgement
      </td>
    </tr>
    <tr>
      <td><strong>Name:</strong> addComment</td>
      <td>
        <strong>Purpose:</strong> Adds a comment to a post<br/>
        <strong>Inputs:</strong> { integer: userId, integer: postId, string: content }<br/>
        <strong>Outputs:</strong> Acknowledgement, comment added
      </td>
    </tr>
  </tbody>
</table>
