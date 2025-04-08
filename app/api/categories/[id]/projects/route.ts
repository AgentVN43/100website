import { NextResponse } from "next/server";
import connectDB from "../../../../db/config";
import Project from "../../../../db/models/Project";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const { id } = params;

  try {
    const projects = await Project.find({ category: id });

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error fetching projects" }, { status: 500 });
  }
}
