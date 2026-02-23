import { currentUser } from "@clerk/nextjs/server";

/**
 * Get formatted user information from Clerk
 * @returns {Object} - { userId, userName, userEmail }
 */
export async function getClerkUserInfo() {
  const user = await currentUser();
  
  if (!user) {
    return {
      userId: null,
      userName: "Unknown User",
      userEmail: "",
    };
  }

  // Try to build name from multiple sources
  let userName = "";
  
  if (user.firstName && user.lastName) {
    userName = `${user.firstName} ${user.lastName}`;
  } else if (user.firstName) {
    userName = user.firstName;
  } else if (user.lastName) {
    userName = user.lastName;
  } else if (user.username) {
    userName = user.username;
  } else if (user.emailAddresses?.[0]) {
    // Use email name part if name not available
    const email = user.emailAddresses[0].emailAddress;
    userName = email.split("@")[0];
  } else {
    userName = user.id.substring(0, 8); // Last resort: use ID prefix
  }

  const userEmail = user.primaryEmailAddress?.emailAddress || 
                    user.emailAddresses?.[0]?.emailAddress || "";

  return {
    userId: user.id,
    userName,
    userEmail,
  };
}
