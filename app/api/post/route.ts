import { NextResponse } from "next/server";
import { postToAllSites } from "../../utils/postToWordPress";

export async function GET() {
  console.log("Hàm GET() đã được gọi");
  try {
    await postToAllSites();
    return NextResponse.json({ message: "Đã đăng bài lên tất cả website!" });
  } catch (error) {
    console.error("Lỗi khi đăng bài:", error);

    // Kiểm tra nếu error là một instance của Error
    const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";

    return NextResponse.json(
      { message: "Lỗi khi đăng bài!", error: errorMessage },
      { status: 500 }
    );
  }
}
