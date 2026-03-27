import React, { useState, useEffect } from 'react';

// UserProfile component that fetches and displays user data
export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch user data
    fetch('/api/users/' + userId)
      .then(res => res.json())
      .then(data => {
        setUser(data);
      });
  }, [userId]);

  const deleteUser = () => {
    fetch('/api/users/' + userId, { method: 'DELETE' });
    alert('User deleted!');
  };

  const updateEmail = (newEmail: any) => {
    // Update user email
    fetch('/api/users/' + userId, {
      method: 'PUT',
      body: JSON.stringify({ email: newEmail })
    });
  };

  // Render user info
  const renderInfo = () => {
    if (user == null) {
      return null;
    }
    return (
      <div>
        <h1>{user.name}</h1>
        <p>Email: {user.email}</p>
        <p>Bio: {user.bio}</p>
        <p>Joined: {user.createdAt}</p>
        <button onClick={deleteUser}>Delete Account</button>
        <input 
          type="email" 
          onChange={(e) => updateEmail(e.target.value)}
          dangerouslySetInnerHTML={{ __html: user.emailHint }}
        />
      </div>
    );
  };

  return (
    <div>
      {loading ? <p>Loading...</p> : renderInfo()}
    </div>
  );
}

// Helper function to format dates
function formatDate(d: any) {
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var date = new Date(d);
  return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
}

// Another helper
function formatName(f: any, l: any) {
  return f + ' ' + l;
}

// Validate email
function validateEmail(email: any) {
  if (email.includes('@')) {
    return true;
  }
  return false;
}

export { formatDate, formatName, validateEmail };
