"use client";
import { useState, useEffect } from "react";
import { Domain } from "@/types/domain";
import { getDomains } from "@/utils/api";
import { Button, Spin, Table } from "antd";
import LoginModal from "./LoginModal";

export default function DomainTable() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchDomains = async () => {
      const data = await getDomains();
      setDomains(data);
      setLoading(false);
    };
    fetchDomains();
  }, []);

  const handleLogin = (domain: string) => {
    setSelectedDomain(domain);
    setIsModalOpen(true);
  };

  const columns = [
    { title: "Domain", dataIndex: "name", key: "name" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Domain) => (
        <Button type="primary" onClick={() => handleLogin(record.name)}>
          Login
        </Button>
      ),
    },
  ];

  return (
    <div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table dataSource={domains} columns={columns} rowKey="id" />
      )}
      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        domain={selectedDomain}
      />
    </div>
  );
}
