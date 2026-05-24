import React, { use, useEffect, useState } from 'react';
import { 
  Search, 
  User, 
  MessageCircle,
  ArrowLeft,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const UserSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const navigate = useNavigate();
  
  // Mock user data for demonstration
  const user=JSON.parse(localStorage.getItem("user"))
  useEffect(() => {
    try{
        const  fetchUsers = async () => {
        const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await fetch(`${VITE_BACKEND_URL}/api/auth/getAllUsers`,
          {method:'POST',
            headers:{
              'Content-Type':'application/json'
            },
            body:JSON.stringify({username:user.username})
          }
        );
        const data = await response.json();
        const formattedUsers = data.map(user => ({
          id: user._id,
          name: user.fullName,
          username: user.username,
          avatar: user.fullName.charAt(0).toUpperCase(),
          status: user.status, // Mock status
          lastSeen:"Last Seen : "+ new Date(user.lastSeen).toLocaleString() // Mock last seen
        }));
        console.log('Fetched users:', data);
        console.log('Fetched users:', formattedUsers);
        setAllUsers(formattedUsers);
    }
    fetchUsers();
    }catch (error) {
        console.log('Error fetching users:', error);
        console.error('Error fetching users:', error);
        setAllUsers([]); // Set to empty array on error
    }
  }, []);
  

  // Filter users based on search query
  const filteredUsers = searchQuery.length > 0
    ? allUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  ):'';

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const handleStartChat = (user) => {
    console.log(`Starting chat with ${user.name}`);
  };

  return (
    <div className="min-h-screen bg-[#18181b] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={()=>{navigate('/chatoptions')}} className="w-10 h-10 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl flex items-center justify-center hover:border-[#bd34fe]/50 transition-all duration-300">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Search Users</h1>
            <p className="text-gray-400">Find and connect with other users</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-[#bd34fe]/50 focus:bg-gray-800/50 transition-all duration-300"
            />
          </div>
        </div>

        {/* Results Container */}
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center gap-2 text-gray-400 mb-4">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              {searchQuery ? `${filteredUsers.length} results found` : `${allUsers.length} users available`}
            </span>
          </div>

          {/* User Results */}
          {filteredUsers.length > 0 ? (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  onClick={()=>{
                    navigate('/chatarea', { state:{
                        type:'single',
                        chatWithUser: user
                    }});
                  }}
                  key={user.id}
                  className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 hover:border-[#bd34fe]/50 hover:bg-gray-800/50 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#bd34fe] to-blue-500 rounded-xl flex items-center justify-center text-white font-semibold">
                          {user.avatar}
                        </div>
                        {/* Status indicator */}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.status)} rounded-full border-2 border-[#18181b]`}></div>
                      </div>

                      {/* User Info */}
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-[#bd34fe] transition-colors duration-300">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-400">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.lastSeen}</p>
                      </div>
                    </div>

                    {/* Chat Button */}
                    <button
                      onClick={() => handleStartChat(user)}
                      className="w-10 h-10 bg-gradient-to-r from-[#bd34fe] to-blue-500 rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
                    >
                      <MessageCircle className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* No Results */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No users found</h3>
              <p className="text-gray-400">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchPage;