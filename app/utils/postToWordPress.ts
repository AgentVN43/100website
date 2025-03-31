import fs from "fs";
import path from "path";

interface SiteConfig {
  _id: string
  name: string;
  domain: string;
  username: string;
  password: string;
  content: string;
  lastPostedIndex: number;
  isActive: boolean;
}

const getSites = async (): Promise<SiteConfig[]> => {
  try {
    console.log("🔄 Đang fetch dữ liệu từ /api/projects...");
    const response = await fetch("http://localhost:3000/api/projects");

    if (!response.ok) {
      throw new Error(`❌ Server trả về lỗi: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ API response:", result);

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error("❌ Dữ liệu API không đúng định dạng!");
    }

    return result.data; // Trả về mảng từ `data`
  } catch (error) {
    console.error("❌ Lỗi khi fetch sites:", error);
    return [];
  }
};


const updateSiteIndex = async (site: SiteConfig, newIndex: number) => {
  try {
    const response = await fetch(`http://localhost:3000/api/projects/${site._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastPostedIndex: newIndex }),
    });

    if (!response.ok) {
      throw new Error(`Lỗi cập nhật index của site ${site.name}`);
    }

    console.log(`✅ Cập nhật lastPostedIndex thành ${newIndex} cho ${site.name}`);
  } catch (error) {
    console.error(`❌ Lỗi khi cập nhật index của site ${site.name}:`, error);
  }
};
// Đăng bài tiếp theo của từng website
const postNextArticle = async (site: SiteConfig) => {
  try {
    const postFilePath = path.join(process.cwd(), "public", site.content);
    console.log("🚀 ~ postNextArticle ~ postFilePath:", postFilePath)

    // Kiểm tra nếu file tồn tại
    if (!fs.existsSync(postFilePath)) {
      console.error(`❌ Không tìm thấy file bài viết: ${postFilePath}`);
      return;
    }

    const fileContent = fs.readFileSync(postFilePath, "utf8");
    let posts;
    try {
      posts = JSON.parse(fileContent);
    } catch (error) {
      console.error(`❌ Lỗi parse JSON file ${postFilePath}:`, error);
      return;
    }

    if (site.lastPostedIndex >= posts.length) {
      console.log(`✅ ${site.name} đã đăng hết bài viết.`);
      return;
    }

    // Lấy bài tiếp theo
    const nextPost = posts[site.lastPostedIndex];

    const auth = Buffer.from(`${site.username}:${site.password}`).toString("base64");
    const response = await fetch(`${site.domain}/wp-json/wp/v2/posts`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...nextPost
      }),
    });
    const data = await response.json();
    if (data.id) {
      console.log(`✅ Đã đăng bài lên ${site.name}: ${data.link}`);
      await updateSiteIndex(site, site.lastPostedIndex + 1);
    } else {
      console.error(`❌ Lỗi khi đăng bài lên ${site.name}:`, data);
    }
  } catch (error) {
    console.error(`❌ Lỗi khi đăng bài lên ${site.name}:`, error);
  }
};


// Hàm chạy tự động cho tất cả các site
export const postToAllSites = async () => {
  const sites = await getSites();
  if (!sites || sites.length === 0) {
    console.log("❌ Không có site nào để đăng bài.");
    return;
  }

  for (const site of sites) {
    await postNextArticle(site);
  }
};