"use client";

import { Modal, Form, Input, Upload, Button, Select } from "antd";
import type { UploadFile } from "antd/es/upload/interface";

interface Category {
  _id: string;
  name: string;
}

interface ProjectModalProps {
  open: boolean;
  loading: boolean;
  categories: Category[];
  fileList: UploadFile[];
  form: any;
  onClose: () => void;
  onFinish: (values: any) => void;
  setFileList: (fileList: UploadFile[]) => void;
}

export default function ProjectModal({
  open,
  loading,
  categories,
  fileList,
  form,
  onClose,
  onFinish,
  setFileList,
}: ProjectModalProps) {
  return (
    <Modal
      title="Add Project"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Project Name"
          name="name"
          rules={[{ required: true, message: "Please input the project name!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Project Domain"
          name="domain"
          rules={[{ required: true, message: "Please input the project domain!" }]}
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
        <Form.Item
          label="Project Type"
          name="projectType"
          rules={[{ required: true, message: "Please select a project type!" }]}
        >
          <Select placeholder="Select a project type" loading={loading}>
            {categories.map((category) => (
              <Select.Option key={category._id} value={category._id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Content File">
          <Upload
            beforeUpload={(file) => {
              setFileList([file]);
              return false;
            }}
            fileList={fileList}
            onRemove={() => setFileList([])}
          >
            <Button>Select File</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}

