"use client";
import { Card, Col, message, Row } from "antd";
import { set } from "mongoose";
import React, { useEffect, useState } from "react";

export default function Reports() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [post, setPost] = useState([]);
  // Fetch projects from the API
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
        message.error(data.error || "Failed to load projects.");
      }
    } catch (error) {
      message.error("Error fetching projects.");
    } finally {
      setLoading(false);
    }
  };

  console.log(projects)


  const fetchPost = async (page = 1) => {
    setLoading(true);
    try {
      const url = `${domain}/wp-json/wp/v2/posts?_fields=id,link,title,type=post,meta.rank_math_focus_keyword,meta.rank_math_seo_score&per_page=${pagination.pageSize}&page=${page}`;

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
      console.log("Fetched posts:", data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      message.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const totalProjects = projects.length;
  const totalActiveProjects = projects.filter(
    (project) => project.isActive
  ).length;

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <>
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Card title" variant="borderless">
            Tổng project: {totalProjects}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Card title" variant="borderless">
            Tổng project đang chạy: {totalActiveProjects}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Card title" variant="borderless">
            Card content
          </Card>
        </Col>
      </Row>
    </>
  );
}
