import { connectDB } from "../../../../../lib/db";
import Activity from "../../../../../models/Activity";

async function clearActivities() {
  try {
    await connectDB();
    
    const result = await Activity.deleteMany({});
    
    return {
      success: true,
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} activities`,
    };
  } catch (error) {
    console.error("Error deleting activities:", error);
    return {
      success: false,
      error: "Failed to delete activities",
      details: error.message,
    };
  }
}

export async function GET(req) {
  const result = await clearActivities();
  
  if (result.success) {
    return Response.json(result);
  } else {
    return Response.json(result, { status: 500 });
  }
}

export async function DELETE(req) {
  const result = await clearActivities();
  
  if (result.success) {
    return Response.json(result);
  } else {
    return Response.json(result, { status: 500 });
  }
}
