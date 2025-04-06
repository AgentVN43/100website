"use client";

import {
  Button,
  Checkbox,
  Input,
  Layout,
  message,
  Modal,
  Switch,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Media from "../../components/Media";

const { Content, Sider } = Layout;
const { TextArea } = Input;
const { Title } = Typography;
export default function DetailPost() {
  const credentials = JSON.parse(sessionStorage.getItem("credentials") || "{}");
  const domain = JSON.parse(sessionStorage.getItem("domain") || "{}");
  const params = useParams();
  const selectedId = params?.id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [keyword, setKeyword] = useState("");
  const [score, setScore] = useState(0);
  const [isCodeView, setIsCodeView] = useState(false);
  const [currentFeaturedMedia, setCurrentFeaturedMedia] = useState(null);
  console.log("🚀 ~ DetailPost ~ currentFeaturedMedia:", currentFeaturedMedia)

  const [isMediaVisible, setIsMediaVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  console.log("🚀 ~ DetailPost ~ selectedImage:", selectedImage)

  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const wordCount = content.trim().split(/\s+/).length;
  const keywordInTitle = title.includes(keyword) && keyword !== "";
  const keywordInContent = content.includes(keyword) && keyword !== "";
  const keywordInFirst10Percent = content
    .slice(0, Math.ceil(content.length * 0.1))
    .includes(keyword);
  const contentLengthValid = wordCount >= 600 && wordCount <= 2500;

  const fetchPost = async (page = 1) => {
    setLoading(true);
    try {
      const url = `${domain}/wp-json/wp/v2/posts/${selectedId}?_fields=title,content,slug,meta.rank_math_focus_keyword,meta.rank_math_seo_score,featured_media`;
      const authHeader =
        "Basic " + btoa(`${credentials.username}:${credentials.password}`);
      const res = await fetch(url, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("🚀 ~ fetchPost ~ data:", data)
      setPost(data);
      setTitle(data.title?.rendered);
      setContent(data.content?.rendered);
      setSlug(data.slug);
      setKeyword(data.meta?.rank_math_focus_keyword || "");
      setScore(data.meta?.rank_math_seo_score || 0);
      setCurrentFeaturedMedia(data.featured_media);

      // Fetch thông tin chi tiết của hình ảnh (thumbnail)
      if (data.featured_media) {
        const mediaRes = await fetch(
          `${domain}/wp-json/wp/v2/media/${data.featured_media}`,
          {
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
          }
        );
        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          setSelectedImage({ id: data.featured_media, url: mediaData.source_url }); // Lưu URL hình ảnh thumbnail
        }
      }

      setPagination((prev) => ({
        ...prev,
        total: parseInt(res.headers.get("X-WP-Total") || "0"),
      }));
      setLoading(false);
      console.log("Fetched posts:", data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      message.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    if (!selectedId) {
      message.error("Không có ID được chọn!");
      return;
    }

    const body = {
      title: title,
      content: content,
      meta: {
        rank_math_focus_keyword: keyword, // ✅ Cập nhật meta keyword
      },
      featured_media: selectedImage?.id ?? currentFeaturedMedia, // ✅ Cập nhật featured media nếu có
    };

    const authHeader =
      "Basic " + btoa(`${credentials.username}:${credentials.password}`);

    console.log(authHeader);

    try {
      const response = await fetch(
        `${domain}/wp-json/wp/v2/posts/${selectedId}`,
        {
          method: "PUT",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        message.success("Cập nhật thành công!");
      } else {
        message.error("Cập nhật thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi request:", error);
      message.error("Lỗi kết nối đến server!");
    }
  };

  useEffect(() => {
    fetchPost();
  }, [selectedId]);

  const handleSelectImage = (id, url) => {
    setSelectedImage({ id, url }); // Cập nhật ảnh được chọn
    setIsMediaVisible(false); // Đóng modal Media
  };

  console.log(selectedImage)
  const [isVisual, setIsVisual] = useState(true); // Trạng thái: Trực quan hay Văn bản
  return (
    <div>
      <Layout style={{ minHeight: "100vh" }}>
        <Content style={{ flex: 7, padding: "20px", background: "#fff" }} className="relative !pt-36">
          <div className="fixed bg-white top-12 left-32 right-[432px] mx-4 px-3 pt-2 z-10">
            {/* <Title level={3}>{title}</Title> */}
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ marginBottom: "10px" }}
            />
            <Input
              placeholder="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              style={{ marginBottom: "10px" }}
            />

            <div className="flex text-center justify-center gap-3 mb-3">
              {/* Nút chuyển đổi */}
              <Button color="default" variant="solid" onClick={() => setIsVisual(!isVisual)}>
                {isVisual ? "Văn bản" : "Trực quan"}
              </Button>
              <Input
                placeholder="Keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <Button
                type="primary"
                onClick={handleSave}
              >
                Lưu
              </Button>
            </div>
          </div>
          <div>
            {isVisual ? (
              <div
                style={{
                  padding: "10px",
                  background: "#fff",
                  minHeight: "150px",
                  border: "1px solid #d9d9d9",
                }}
                className="rounded-md"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (

              <TextArea
                autoSize
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ marginBottom: "10px" }}
              />
            )}
          </div>
        </Content>

        <Sider className="!sticky top-12 z-10 h-[600px] shadow-sm rounded-xl" width={300} style={{ padding: "20px", background: "#ededed" }}>
          <Title level={4}>Checklist</Title>
          <p>Điểm SEO: {score}/100</p>
          <Checkbox checked={keywordInTitle}>
            {keywordInTitle
              ? "✅ Tuyệt vời! Bạn đang sử dụng từ khoá chính trong Tiêu đề SEO."
              : "❌ Từ khoá chính không xuất hiện trong tiêu đề SEO."}
          </Checkbox>
          <br />
          <br />
          <Checkbox checked={keywordInFirst10Percent}>
            {keywordInFirst10Percent
              ? "✅ Sử dụng Từ khoá chính ngay từ đầu nội dung của bạn."
              : "❌ Sử dụng Từ khoá chính ngay từ đầu nội dung của bạn."}
          </Checkbox>
          <br />
          <br />
          <Checkbox checked={keywordInContent}>
            {keywordInContent
              ? "✅ Từ khoá chính xuất hiện trong nội dung."
              : "❌ Từ khoá chính không xuất hiện trong nội dung."}
          </Checkbox>
          <br />
          <br />
          <Checkbox checked={contentLengthValid}>
            {contentLengthValid
              ? `✅ Nội dung hiện có độ dài là ${wordCount} từ.`
              : `❌ Nội dung hiện có độ dài là ${wordCount} từ. Hãy cân n hắc viết ít nhất 600 từ để tối ưu hóa.`}
          </Checkbox>
          <Button
            type="default"
            style={{ marginTop: "10px", width: "100%" }}
            onClick={() => setIsMediaVisible(true)}
          >
            Chọn ảnh
          </Button>

          {selectedImage && (
            <div className="flex justify-center pt-4">
              <img
                src={selectedImage.url}
                alt="Selected"
                style={{ width: "200px" }}
              />
              <button
                onClick={() => {
                  const imgTag = `<img src="${selectedImage.url}" alt="${keyword}" style="width: 100%;" />`;
                  navigator.clipboard
                    .writeText(imgTag)
                    .then(() => alert("Đã sao chép vào bộ nhớ đệm!"))
                    .catch((err) => console.error("Lỗi sao chép:", err));
                }}
                style={{
                  marginTop: "10px",
                  padding: "5px 10px",
                  cursor: "pointer",
                }}
              >
                Copy Ảnh
              </button>
            </div>
          )}
        </Sider>
      </Layout>
      {isMediaVisible && (
        <Media
          visible={isMediaVisible}
          selectedId={selectedId}
          onClose={() => setIsMediaVisible(false)}
          domain={domain}
          credentials={credentials}
          onSelectImage={handleSelectImage}
        />
      )}
    </div>
  );
}
