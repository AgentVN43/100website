import { NextResponse } from "next/server";
import connectDB from "../../../../db/config";
import Project from "../../../../db/models/Project";
type tParams = Promise<{ id: string[] }>;
  
export async function GET({ params }: { params: tParams }) {
  await connectDB();

  const { id } = await params;

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
