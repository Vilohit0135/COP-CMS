import { connectDB } from "./db";
import Activity from "../models/Activity";

/**
 * Log an activity to the Activity collection
 * @param {Object} options - Activity details
 * @param {string} options.userId - Clerk user ID
 * @param {string} options.userName - User's name
 * @param {string} options.userEmail - User's email
 * @param {string} options.action - create, update, delete, view
 * @param {string} options.section - Which section (leads, courses, etc.)
 * @param {string} options.itemId - ID of the item being modified
 * @param {string} options.itemName - Name of the item
 * @param {string} options.details - Details of what changed
 * @param {string} options.ipAddress - IP address (optional)
 * @returns {Promise<Object>} - Created activity document
 */
export async function logActivity(options) {
  try {
    await connectDB();

    const activity = await Activity.create({
      userId: options.userId,
      userName: options.userName,
      userEmail: options.userEmail,
      action: options.action,
      section: options.section,
      itemId: options.itemId || null,
      itemName: options.itemName || null,
      details: options.details || null,
      ipAddress: options.ipAddress || null,
      status: "success",
    });

    return activity;
  } catch (error) {
    console.error("Error logging activity:", error);
    // Don't throw - we don't want logging to break the main operation
    return null;
  }
}

/**
 * Get activity logs with filters
 * @param {Object} filters - Filter options
 * @param {string} filters.userId - Filter by user ID
 * @param {string} filters.section - Filter by section
 * @param {number} filters.limit - Max results (default: 50)
 * @param {number} filters.skip - Skip N results (for pagination)
 * @returns {Promise<Array>} - Activity logs
 */
export async function getActivityLogs(filters = {}) {
  try {
    await connectDB();

    const query = {};

    if (filters.userId) query.userId = filters.userId;
    if (filters.section) query.section = filters.section;

    const limit = filters.limit || 50;
    const skip = filters.skip || 0;

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    return activities;
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return [];
  }
}

/**
 * Get total count of activities
 * @param {Object} filters - Filter options
 * @returns {Promise<number>} - Total count
 */
export async function getActivityCount(filters = {}) {
  try {
    await connectDB();

    const query = {};

    if (filters.userId) query.userId = filters.userId;
    if (filters.section) query.section = filters.section;

    const count = await Activity.countDocuments(query);

    return count;
  } catch (error) {
    console.error("Error counting activities:", error);
    return 0;
  }
}
