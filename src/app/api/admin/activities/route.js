import { getActivityLogs, getActivityCount } from "../../../../lib/activityLogger";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    
    const filters = {
      userId: searchParams.get("userId"),
      section: searchParams.get("section"),
      limit: parseInt(searchParams.get("limit")) || 50,
      skip: parseInt(searchParams.get("skip")) || 0,
    };

    // Remove null/undefined filters
    Object.keys(filters).forEach(
      (key) =>
        (filters[key] === null || filters[key] === undefined) &&
        delete filters[key]
    );

    const logs = await getActivityLogs(filters);
    const total = await getActivityCount(filters);

    return Response.json({
      logs,
      total,
      limit: filters.limit,
      skip: filters.skip,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return Response.json(
      { error: "Failed to fetch activities", details: error.message },
      { status: 500 }
    );
  }
}
