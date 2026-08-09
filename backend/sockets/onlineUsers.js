const onlineUsers = new Map();
const lastSeenUsers = new Map();

/**
 * Add a socket for a user
 */
function addUser(userId, socketId) {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  onlineUsers.get(userId).add(socketId);
  // User is online, so remove last-seen state
  lastSeenUsers.delete(userId);
}

/**
 * Remove a socket
 */
function removeUser(socketId) {
  for (const [userId, sockets] of onlineUsers.entries()) {
    if (sockets.has(socketId)) {
      sockets.delete(socketId);

      if (sockets.size === 0) {
        onlineUsers.delete(userId);
        // User completely went offline
        lastSeenUsers.set(userId, new Date());
      }

      break; // Stop searching
    }
  }
}

/**
 * Get all online users
 */
function getOnlineUsers() {
  return [...onlineUsers.keys()];
}

/**
 * Get all socket IDs of a user
 */
function getSocketIds(userId) {
  return onlineUsers.get(userId) || new Set();
}

/**
 * Check if user is online
 */
function isUserOnline(userId) {
  return onlineUsers.has(userId);
}
/*
==========================================
Get last seen
==========================================
*/

function getLastSeen(userId) {
  return lastSeenUsers.get(userId) || null;
}
/*
==========================================
Get ALL last seen users
==========================================
*/

function getAllLastSeen() {
  return Object.fromEntries(lastSeenUsers);
}

/*
/**
 * Debug helper
 */
function printOnlineUsers() {
  console.log("===== ONLINE USERS =====");

  for (const [userId, sockets] of onlineUsers.entries()) {
    console.log(userId, [...sockets]);
  }

  console.log("========================");
}

module.exports = {
  addUser,
  removeUser,
  getOnlineUsers,
  getSocketIds,
  isUserOnline,
  getLastSeen,
  getAllLastSeen,
  printOnlineUsers,
};
