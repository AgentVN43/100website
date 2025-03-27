"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Descriptions, Button, message, Spin } from "antd";

interface Project {
  _id: string;
  name: string;
  domain: string;
  username: string;
  password: string;
  note?: string;
  content?: string; // File path returned from the API
  lastPostedIndex?: number;
}

export default function ProjectDetails() {
  const params = useParams(); // Ensure params are accessed correctly
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure `params` exists and contains `id`
    if (!params || !params.id) {
      message.error("Invalid project ID.");
      return;
    }

    const fetchProjectDetails = async () => {
      try {
        const res = await fetch(`/api/projects/${params.id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch project details");
        }
        const data = await res.json();
        setProject(data.data);
      } catch (error) {
        message.error(
          error instanceof Error ? error.message : "Error fetching project details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [params]);

  if (loading) return <Spin />;
  if (!project) return <div>No project found.</div>;

  return (
    <div style={{ padding: "1rem" }}>
      <Button onClick={() => router.back()} style={{ marginBottom: "1rem" }}>
        Back
      </Button>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Name">{project.name}</Descriptions.Item>
        <Descriptions.Item label="Domain">{project.domain}</Descriptions.Item>
        <Descriptions.Item label="Username">{project.username}</Descriptions.Item>
        <Descriptions.Item label="Note">{project.note || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Content">
          {project.content ? (
            <a href={project.content} target="_blank" rel="noreferrer">
              View File
            </a>
          ) : (
            "No File"
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Last Posted Index">
          {project.lastPostedIndex}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
}
