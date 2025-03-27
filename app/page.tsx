import ProjectForm from "@/components/ProjectForm";
import { Layout } from "antd";
import Title from "antd/es/typography/Title";
import React from "react";

export default function HomePage() {
  return (
    <Layout style={{ padding: "2rem", background: "#fff" }}>
      <Title level={2}>Project Management</Title>
      <ProjectForm />
    </Layout>
  );
}
