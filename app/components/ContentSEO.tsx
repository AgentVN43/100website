"use client";

import React, { useState, useEffect } from "react";
import { Select, Form, message, Button, Table, Input, Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import SEOChecker from "./SEOChecker";
import { useRouter } from "next/router";

const { Option } = Select;

interface Project {
  _id: string;
  name: string;
  domain: string;
  username: string;
  password: string;
  note?: string;
  content?: string; // File path returned from the API
  lastPostedIndex?: number;
  updatedAt?: number;
}

export default function ContentSEO() {
  const [domain, setDomain] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [form] = Form.useForm();
  const [post, setPost] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [selectedId, setSelectedId] = useState(null);

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

  // Khi chọn domain, lấy thông tin credentials từ projects
  const handleChange = (selectedDomain: string) => {
    const selectedProject = projects.find(
      (item) => item.domain === selectedDomain
    );
    if (selectedProject) {
      setDomain(selectedDomain);
      setCredentials({
        username: selectedProject.username,
        password: selectedProject.password,
      });
    } else {
      message.error("Domain not found in projects list.");
    }
  };


  const fetchPost = async (page = 1) => {
    setLoading(true);
    try {
      const url = `${domain}/wp-json/wp/v2/posts?_fields=id,link,title,type=post&meta_key=rank_math_seo_score&meta_compare=<&meta_value=70&per_page=${pagination.pageSize}&page=${page}`;

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
      setLoading(false);
      console.log("Fetched posts:", data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      message.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (record) => {
    setSelectedId(record.id);
    setModalVisible(true);
    console.log(selectedId);
  };

  console.log(post);

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title) => title.rendered,
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      render: (link) => (
        <a href={link} target="_blank" rel="noopener noreferrer">
          {link}
        </a>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Select
        placeholder="Select a domain"
        style={{ width: "100%", marginBottom: "20px" }}
        onChange={handleChange}
        loading={loading}
      >
        {projects.map((item) => (
          <Option key={item.domain} value={item.domain}>
            {item.domain}
          </Option>
        ))}
      </Select>
      <Button type="primary" onClick={() => fetchPost(1)} loading={loading}>
        Fetch Posts
      </Button>
      <Table
        dataSource={post}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
        style={{ marginTop: "20px" }}
      />

      <SEOChecker
        visible={modalVisible}
        selectedId={selectedId}
        onClose={() => setModalVisible(false)}
        domain={domain}
        credentials={credentials}
      />
    </div>
  );
}
