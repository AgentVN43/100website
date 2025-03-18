import fs from "fs";
import path from "path";

const SITES_FILE = path.join(process.cwd(), "sites.json");

interface SiteConfig {
  name: string;
  url: string;
  username: string;
  password: string;
  jsonFile: string;
  lastPostedIndex: number;
}

// Lấy danh sách website
const getSites = (): SiteConfig[] => {
  return JSON.parse(fs.readFileSync(SITES_FILE, "utf8"));
};

// Cập nhật chỉ số bài viết đã đăng
const updateSiteIndex = (site: SiteConfig, newIndex: number) => {
  const sites = getSites();
  const updatedSites = sites.map((s) =>
    s.url === site.url ? { ...s, lastPostedIndex: newIndex } : s
  );

  fs.writeFileSync(SITES_FILE, JSON.stringify(updatedSites, null, 2));
};

// Đăng bài tiếp theo của từng website
const postNextArticle = async (site: SiteConfig) => {
  try {
    const postFilePath = path.join(process.cwd(), "./src/data", site.jsonFile);
    const posts = JSON.parse(fs.readFileSync(postFilePath, "utf8"));

    // Kiểm tra nếu đã đăng hết bài
    if (site.lastPostedIndex >= posts.length) {
      console.log(`✅ ${site.name} đã đăng hết bài viết.`);
      return;
    }

    // Lấy bài tiếp theo
    const nextPost = posts[site.lastPostedIndex];

    const auth = Buffer.from(`${site.username}:${site.password}`).toString("base64");
    const response = await fetch(`${site.url}/wp-json/wp/v2/posts`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(nextPost),
    });

    const data = await response.json();
    console.log(`📩 API Response từ ${site.name}:`, data);
    if (data.id) {
        console.log(`✅ Đã đăng bài lên ${site.name}: ${data.link}`);
      } else {
        console.error(`❌ Lỗi khi đăng bài lên ${site.name}:`, data);
      }
    // Cập nhật chỉ số bài đã đăng
    updateSiteIndex(site, site.lastPostedIndex + 1);
  } catch (error) {
    console.error(`❌ Lỗi khi đăng bài lên ${site.name}:`, error);
  }
};

// Hàm chạy tự động cho tất cả các site
export const postToAllSites = async () => {
  const sites = getSites();
  for (const site of sites) {
    await postNextArticle(site);
  }
};
