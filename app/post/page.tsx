"use client";

import React, { useState, useEffect } from "react";
import { Select, Form, message, Button, Table } from "antd";
import { useRouter } from "next/navigation";
const { Option } = Select;

interface Project {
  _id: string;
  name: string;
  domain: string;
  username: string;
  password: string;
  note?: string;
  content?: string;
  lastPostedIndex?: number;
  updatedAt?: number;
}

interface Post {
  id: number;
  link: string;
  meta: any;
  title: any;
}

export default function Post() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [form] = Form.useForm();
  const [post, setPost] = useState<Post[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch danh sách project
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      } else {
        message.error(data.error || "Failed to load projects.");
      }
    } catch (error) {
      message.error("Error fetching projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Khi danh sách projects đã load, nếu sessionStorage có domain thì tự động set lại thông tin.
  useEffect(() => {
    const storedDomain = JSON.parse(sessionStorage.getItem("domain") || '""');
    if (storedDomain && !domain) {
      handleChange(storedDomain);
    }
  }, [projects, domain]);

  // Khi domain state thay đổi, tự động fetch post
  useEffect(() => {
    if (domain) {
      fetchPost();
    }
  }, [domain]);

  // Hàm thay đổi domain: cập nhật state, lưu vào sessionStorage và set credentials từ projects
  const handleChange = (selectedDomain: string) => {
    const selectedProject = projects.find(
      (item) => item.domain === selectedDomain
    );
    if (selectedProject) {
      sessionStorage.setItem("domain", JSON.stringify(selectedDomain));
      sessionStorage.setItem(
        "credentials",
        JSON.stringify({
          username: selectedProject.username,
          password: selectedProject.password,
        })
      );
      setDomain(selectedDomain);
      setCredentials({
        username: selectedProject.username,
        password: selectedProject.password,
      });
    } else {
      message.error("Domain not found in projects list.");
    }
  };

  // Hàm fetch bài post từ domain đã chọn
  const fetchPost = async (page = 1) => {
    setLoading(true);
    try {
      const url = `${domain}/wp-json/wp/v2/posts?_fields=id,link,title,featured_media,meta.rank_math_focus_keyword,meta.rank_math_seo_score&per_page=${pagination.pageSize}&page=${page}`;
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
      setPagination((prev) => ({
        ...prev,
        total: parseInt(res.headers.get("X-WP-Total") || "0"),
      }));
      console.log("Fetched posts:", data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      message.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title: any) => title.rendered,
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      render: (link: string) => (
        <a href={link} target="_blank" rel="noopener noreferrer">
          {link}
        </a>
      ),
    },
    {
      title: "Focus Keyword",
      dataIndex: "meta",
      key: "focus_keyword",
      render: (meta: any) => meta?.rank_math_focus_keyword || "N/A",
    },
    {
      title: "SEO Score",
      dataIndex: "meta",
      key: "seo_score",
      render: (meta: any) => meta?.rank_math_seo_score ?? "N/A",
    },
    {
      title: "Thumbnail",
      dataIndex: "featured_media",
      key: "featured_media",
      render: (featured_media: any) => featured_media || "N/A",
    },
  ];

  console.log(projects);

  return (
    <div style={{ padding: "20px" }}>
      <Select
        placeholder="Select a domain"
        style={{ width: "100%", marginBottom: "20px" }}
        onChange={handleChange}
        loading={loading}
        value={domain || undefined}
      >
        {projects.map((item) => (
          <Option key={item._id} value={item.domain}>
            {item.domain}
          </Option>
        ))}
      </Select>

      <div className="flex justify-between">
        {/* <Button type="primary" onClick={() => fetchPost(1)} loading={loading}>
          Fetch Posts
        </Button> */}

        <Button
          type="primary"
          onClick={() =>
            window.open(
              `${domain}/wp-admin/admin.php?page=rank-math-status&view=tools#`,
              "_blank"
            )
          }
          disabled={!domain}
          style={{ marginBottom: 20 }}
        >
          Update Score
        </Button>
      </div>

      <Table
        dataSource={post}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onRow={(record) => ({
          onClick: () => router.push(`/post/${record?.id}`),
          style: { cursor: "pointer" },
        })}
        style={{ marginTop: "20px" }}
      />
    </div>
  );
}
