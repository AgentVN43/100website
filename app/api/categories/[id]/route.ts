import { NextResponse } from "next/server";
import connectDB from "../../../db/config";
import Category from "../../../db/models/Categories";

// GET: Lấy thông tin chi tiết của category theo ID
export async function GET(
  context: { params: { id: string } }
) {
  await connectDB();

  const { id } = context.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error fetching category" },
      { status: 500 }
    );
  }
}

// PUT: Cập nhật category
export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  await connectDB();

  const { id } = context.params;

  try {
    const body = await req.json();
    const updatedCategory = await Category.findByIdAndUpdate(id, body, {
      new: true,
    });

    return NextResponse.json({ success: true, data: updatedCategory });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE: Xóa category
export async function DELETE(
  context: { params: { id: string } }
) {
  await connectDB();

  const { id } = context.params;

  try {
    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}