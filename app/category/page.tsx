"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

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

  const handleAddOrEdit = async (values) => {
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

  const handleDelete = async (id) => {
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
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            type="link"
            onClick={() => {
              setEditingCategory(record);
              setModalVisible(true);
              form.setFieldsValue(record);
            }}
          >
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record._id)}>
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
      <Table dataSource={categories} columns={columns} rowKey="_id" loading={loading} />

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
