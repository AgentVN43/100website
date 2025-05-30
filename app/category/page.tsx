"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";
import { useRouter } from "next/navigation";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  const router = useRouter()

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
    fetchCategories();
  }, []);

  const handleAddOrEdit = async (values: any) => {
    try {
      const url = editingCategory ? `/api/categories/${editingCategory._id}` : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (data.success) {
        message.success(editingCategory ? "Category updated" : "Category added");
        fetchCategories();
        setModalVisible(false);
        setEditingCategory(null);
        form.resetFields();
      } else {
        message.error("Failed to save category");
      }
    } catch (error) {
      message.error("Error saving category");
    }
  };

  const handleDelete = async (id: any) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        message.success("Category deleted");
        fetchCategories();
      } else {
        message.error("Failed to delete category");
      }
    } catch (error) {
      message.error("Error deleting category");
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      render: (_: any, __: any, index: number) => <p>{index + 1}</p>,
    },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <>
          <Button
            type="link"
            onClick={(e) => {
              setEditingCategory(record);
              setModalVisible(true);
              form.setFieldsValue(record);
              e.stopPropagation();
            }}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={(e) => {
              handleDelete(record._id);
              e.stopPropagation();
            }}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginBottom: 20 }}>
        Add Category
      </Button>
      <Table
        dataSource={categories}
        columns={columns}
        rowKey="_id"
        loading={loading}
        onRow={(record) => ({
          onClick: () => router.push(`/category/${record._id}`),
          style: { cursor: "pointer" },
        })}
      />

      <Modal
        title={editingCategory ? "Edit Category" : "Add Category"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrEdit}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Enter category name" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryPage;
