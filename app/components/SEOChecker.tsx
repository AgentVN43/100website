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

const { Content, Sider } = Layout;
const { TextArea } = Input;
const { Title } = Typography;
export default function SEOChecker({
  visible,
  selectedId,
  onClose,
  domain,
  credentials,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isCodeView, setIsCodeView] = useState(false);

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
      const url = `${domain}/wp-json/wp/v2/posts/${selectedId}?_fields=title,content`;
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
      setPost(data);
      setTitle(data.title?.rendered);
      setContent(data.content?.rendered);
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
    };

    const authHeader =
      "Basic " + btoa(`${credentials.username}:${credentials.password}`);

      console.log(authHeader)

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
        onClose()
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

  useEffect(() => {
    if (!visible) {
      setTitle("");
      setContent("");
      setKeyword("");
    }
  }, [visible]); // Khi `visible` thay đổi, nếu `false` thì reset state

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      height={600}
    >
      <Layout style={{ minHeight: "100vh", padding: "20px" }}>
        <Content style={{ flex: 7, padding: "20px", background: "#fff" }}>
          <Title level={3}>{title}</Title>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ marginBottom: "10px" }}
          />
          <Switch
            checked={isCodeView}
            onChange={() => setIsCodeView(!isCodeView)}
            style={{ marginBottom: "10px" }}
          />{" "}
          Toggle Code View
          {isCodeView ? (
            <pre
              style={{
                padding: "10px",
                background: "#f5f5f5",
                minHeight: "150px",
              }}
            >
              {content}
            </pre>
          ) : (
            <div
              style={{
                padding: "10px",
                background: "#fff",
                minHeight: "150px",
                border: "1px solid #d9d9d9",
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
          <TextArea
            rows={6}
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ marginBottom: "10px" }}
          />
          <Input
            placeholder="Keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ marginBottom: "10px" }}
          />
          <Button
            type="primary"
            onClick={handleSave}
            style={{ marginTop: "10px" }}
          >
            Lưu
          </Button>
        </Content>

        <Sider width={300} style={{ padding: "20px", background: "#fafafa" }}>
          <Title level={4}>Checklist</Title>
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
              : `❌ Nội dung hiện có độ dài là ${wordCount} từ. Hãy cân nhắc viết ít nhất 600 từ để tối ưu hóa.`}
          </Checkbox>
        </Sider>
      </Layout>
    </Modal>
  );
}
