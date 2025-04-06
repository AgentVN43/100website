"use client";

import { useEffect, useState } from "react";
import { Table, Button, Form, message, Switch, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import PostButton from "../components/postButton";
import ProjectModal from "../components/ProjectForm";

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
  isActive: Boolean;
  category: Object;
}
interface Category {
  _id: string; // MongoDB thường dùng _id thay vì id
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export default function ProjectForm() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const router = useRouter();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const showDeleteModal = (id: string) => {
    setSelectedProjectId(id);
    setConfirmVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedProjectId) {
      await deleteProject(selectedProjectId);
      setConfirmVisible(false);
      setSelectedProjectId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmVisible(false);
    setSelectedProjectId(null);
  };

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

  const updateProject = async (id: string, updatedData: Partial<Project>) => {
    console.log("🚀 ~ updateProject ~ updatedData:", updatedData);

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const textResponse = await response.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch {
        throw new Error("Server không trả về JSON hợp lệ");
      }

      if (!response.ok) {
        throw new Error(data.error || "Cập nhật thất bại");
      }

      message.success("Cập nhật thành công!");
      fetchProjects(); // Load lại danh sách dự án
    } catch (error: any) {
      console.error("Lỗi cập nhật:", error.message);
      message.error(error.message || "Lỗi khi cập nhật!");
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        message.error("Failed to fetch categories");
      }
    } catch (error) {
      message.error("Error fetching categories");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProjects();
    fetchCategories();
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
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean, record) => (
        <Switch
          checked={isActive}
          onClick={(checked, e) => {
            e.stopPropagation();
            updateProject(record._id, { ...record, isActive: checked });
          }}
        />

      ),
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
            showDeleteModal(record._id); // Thay vì dùng Modal.confirm
          }}
        >
          Delete
        </Button>
      ),
    }


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
    console.log("🚀 ~ handleSubmit ~ values:", values)
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("domain", values.domain);
      formData.append("username", values.username);
      formData.append("password", values.password);
      formData.append("note", values.note || "");
      if (values.projectType) {
        formData.append("categories", values.projectType);
      } else {
        console.warn("⚠️ Missing projectType in values:", values);
      }

      // Ensure file is appended correctly
      if (fileList.length > 0) {
        const fileItem = fileList[0].originFileObj || fileList[0];
        if (fileItem) {
          formData.append("file", fileItem);
        }
      }

      console.log("🚀 ~ handleSubmit ~ formData:", formData)
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

      <ProjectModal
        open={isModalOpen}
        loading={loading}
        categories={categories}
        fileList={fileList}
        form={form}
        onClose={handleCloseModal}
        onFinish={handleSubmit}
        setFileList={setFileList}
      />
      <Modal
        open={confirmVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleCancelDelete}
        okText="Xóa"
        cancelText="Hủy"
        okType="danger"
        title="Xác nhận xóa"
      >
        Bạn có chắc chắn muốn xóa dự án này không?
      </Modal>
    </div>
  );
}