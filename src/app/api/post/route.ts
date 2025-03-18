import { NextResponse } from "next/server";
import { postToAllSites } from "@/utils/postToWordPress";

export async function GET() {
  await postToAllSites();
  return NextResponse.json({ message: "Đã đăng bài lên tất cả website!" });
}
