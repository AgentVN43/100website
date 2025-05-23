import { NextResponse } from 'next/server';
import connectDB from '../../../../db/config';
import Project from '../../../../db/models/Project';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectDB();
    const project = await Project.findById(id);
    if (!project || !project.content) {
      return NextResponse.json(
        { success: false, error: 'Project or file not found' },
        { status: 404 }
      );
    }
    // Expect payload: { index: number, updatedRecord: object }
    const { index, updatedRecord } = await request.json();
    
    const filePath = path.join(process.cwd(), 'public', project.content);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'File not found on disk' },
        { status: 404 }
      );
    }
    
    // Read current JSON content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let data = JSON.parse(fileContent);
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { success: false, error: 'JSON content is not an array' },
        { status: 400 }
      );
    }
    if (index < 0 || index >= data.length) {
      return NextResponse.json(
        { success: false, error: 'Invalid index' },
        { status: 400 }
      );
    }
    // Update only the specified item
    data[index] = updatedRecord;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true, data: updatedRecord }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
