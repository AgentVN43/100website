import { NextResponse } from "next/server";
import connectDB from '../../../app/db/config';
import Category from "../../../app/db/models/Categories";

// GET: Lấy danh sách category
export async function GET() {
  await connectDB();
  try {
    const categories = await Category.find();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST: Tạo category mới
export async function POST(req: Request) {
  await connectDB();
  try {
    const body = await req.json();
    const newCategory = new Category(body);
    await newCategory.save();
    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 });
  }
}
