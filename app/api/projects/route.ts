import { NextResponse } from "next/server";
import connectDB from "../../../app/db/config";
import Project from "../../../app/db/models/Project";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();
    const projects = await Project.find({});
    return NextResponse.json(
      { success: true, data: projects },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Parse the multipart/form-data request
    const formData = await request.formData();

    const name = formData.get("name")?.toString();
    const domain = formData.get("domain")?.toString();
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();
    const note = formData.get("note")?.toString();
    const file = formData.get("file") as File | null;
    const categories = formData.get("categories")?.toString() || null;

    let filePath: string | null = null;

    if (file) {
      // Convert the file to a buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Determine the uploads directory
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Create a unique file name
      const filename = `${Date.now()}-${file.name}`;
      filePath = `/uploads/${filename}`;

      // Write the file to disk
      fs.writeFileSync(path.join(uploadsDir, filename), buffer);
    }

    // Connect to the database and create a new project document
    await connectDB();
    const newProject = new Project({
      name,
      domain,
      username,
      password,
      note,
      content: filePath, // Save the file path (or null if no file)
      lastPostedIndex: 0,
      categories,
    });
    await newProject.save();

    return NextResponse.json(
      { success: true, data: newProject },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
