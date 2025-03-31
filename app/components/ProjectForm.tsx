"use client";

import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Upload } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import Link from "next/link";
import PostButton from "./postButton";

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

export default function ProjectForm() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const router = useRouter();

  // Fetch projects from the API  
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

  const deleteProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      // Nếu không phải JSON, chỉ đọc text để kiểm tra lỗi
      const textResponse = await response.text();

      let data;
      try {
        data = JSON.parse(textResponse); // Chỉ parse nếu là JSON hợp lệ
      } catch {
        throw new Error("Server không trả về JSON hợp lệ");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete project");
      }

      message.success("Xóa dự án thành công!");
      fetchProjects(); // Cập nhật lại danh sách
    } catch (error: any) {
      message.error("Lỗi khi xóa dự án!");
    }
  };


  useEffect(() => {
    fetchProjects();
  }, []);

  // Define columns for the table
  const columns: ColumnsType<Project> = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Domain", dataIndex: "domain", key: "domain" },
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Note", dataIndex: "note", key: "note" },
    { title: "Last Posted Index", dataIndex: "lastPostedIndex", key: "lastPostedIndex" },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      render: (content: string) =>
        content ? (
          <a
            href={content}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            View File
          </a>
        ) : (
          "No File"
        ),
    },
    {
      title: "Last Update",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value: string) => dayjs(value).format("HH:mm:ss DD/MM/YYYY"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          danger
          onClick={(e) => {
            e.stopPropagation();
            deleteProject(record._id)
          }}
        >
          Delete
        </Button>
      ),
    },
  ];

  // Modal open/close handlers
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
    setFileList([]);
  };

  // Submit handler for the form using FormData (multipart/form-data)
  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("domain", values.domain);
      formData.append("username", values.username);
      formData.append("password", values.password);
      formData.append("note", values.note || "");

      // Ensure file is appended correctly
      if (fileList.length > 0) {
        const fileItem = fileList[0].originFileObj || fileList[0];
        if (fileItem) {
          formData.append("file", fileItem);
        }
      }

      // Do not manually set content-type header so the browser can set it with the proper boundary.
      const res = await fetch("/api/projects", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        message.success("Project created successfully!");
        fetchProjects();
        handleCloseModal();
      } else {
        message.error(data.error || "Error creating project.");
      }
    } catch (error: any) {
      message.error("Error creating project.");
    }
  };
  return (
    <div style={{ margin: "1rem 0" }}>
      <div className="flex justify-between">
        <Button type="primary" onClick={handleOpenModal}>
          + Add Project
        </Button>
        {/* <Link href="/api/post" >Đăng bài</Link> */}
        <PostButton />
      </div>
      <Table
        columns={columns}
        dataSource={projects}
        rowKey="_id"
        loading={loading}
        style={{ marginTop: "1rem" }}
        onRow={(record) => ({
          onClick: () => router.push(`/projects/${record._id}`),
          style: { cursor: "pointer" },
        })}
      />

      <Modal
        title="Add Project"
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Project Name"
            name="name"
            rules={[
              { required: true, message: "Please input the project name!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Project Domain"
            name="domain"
            rules={[
              { required: true, message: "Please input the project domain!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input the username!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input the password!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item label="Note" name="note">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Content File">
            <Upload
              beforeUpload={(file) => {
                setFileList([file]);
                return false; // Prevent auto upload
              }}
              fileList={fileList}
              onRemove={() => setFileList([])}
            >
              <Button>Select File</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
