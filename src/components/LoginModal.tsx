"use client";
import { useState } from "react";
import { Modal, Input, Button, message, Form } from "antd";
import { login } from "@/utils/api";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string | null;
}

export default function LoginModal({ isOpen, onClose, domain }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!domain) return;
    setLoading(true);
    const success = await login(domain, username, password);
    setLoading(false);

    if (success) {
      message.success("Login successful!");
      onClose();
    } else {
      message.error("Invalid credentials");
    }
  };

  return (
    <Modal
      title={`Login to ${domain}`}
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="login" type="primary" loading={loading} onClick={handleLogin}>
          Login
        </Button>,
      ]}
    >
      <Form>
        <Form.Item label="Username">
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        </Form.Item>
        <Form.Item label="Password">
          <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
