"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Descriptions,
  Button,
  message,
  Spin,
  Table,
  Modal,
  Input,
  Tabs,
} from "antd";

const { TextArea } = Input;

interface Project {
  _id: string;
  name: string;
  domain: string;
  username: string;
  password: string;
  note?: string;
  content?: string;
  lastPostedIndex?: number;
}

export default function ProjectDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [jsonLoading, setJsonLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [editField, setEditField] = useState<string | null>(null);
  const [editedProject, setEditedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (project) {
      setEditedProject({ ...project });
    }
  }, [project]);

  const handleFieldUpdate = async (field: keyof Project) => {
    if (!editedProject || !project) return;
    try {
      const res = await fetch(`/api/projects/${project._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: editedProject[field] }),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Update failed");

      setProject({ ...project, [field]: editedProject[field] });
      message.success("Project updated successfully");
      setEditField(null);
    } catch (error: any) {
      message.error(error.message || "Error updating project");
    }
  };

  const fetchJsonContent = async (fileUrl: string) => {
    setJsonLoading(true);
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error("Failed to fetch JSON content");
      const data = await res.json();
      setJsonData(Array.isArray(data) ? data : [data]);
    } catch (error: any) {
      message.error(error.message || "Error loading JSON file.");
    } finally {
      setJsonLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      message.error("Invalid project ID.");
      setLoading(false);
      return;
    }

    const fetchProjectDetails = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error("Failed to fetch project details");

        const data = await res.json();
        setProject(data.data);
        if (data.data.content?.endsWith(".json")) {
          fetchJsonContent(data.data.content);
        }
      } catch (error: any) {
        message.error(error.message || "Error fetching project details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  const jsonColumns = jsonData.length > 0
    ? [
      ...Object.keys(jsonData[0]).map((key) => ({
        title: key.toUpperCase(),
        dataIndex: key,
        key,
      })),
      {
        title: "Actions",
        key: "actions",
        render: (_: any, record: any, index: number) => (
          <Button onClick={() => handleEdit(record, index)}>Edit</Button>
        ),
      },
    ]
    : [];

  const handleEdit = (record: any, index: number) => {
    setEditingRecord(record);
    setEditingIndex(index);
    setEditingContent(JSON.stringify(record, null, 2));
    setEditModalVisible(true);
  };

  const htmlContent = (() => {
    try {
      const content = JSON.parse(editingContent)?.content || "Không có dữ liệu HTML";
      return content.replace(/```html\s*([\s\S]*?)\s*```/, "$1");
    } catch {
      return "JSON không hợp lệ";
    }
  })();

  const handleSaveEdit = async () => {
    try {
      const updatedRecord = JSON.parse(editingContent);
      if (project && editingIndex !== null) {
        const res = await fetch(`/api/projects/${project._id}/json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index: editingIndex, updatedRecord }),
        });

        const result = await res.json();
        if (!result.success) throw new Error(result.error);

        const updatedData = [...jsonData];
        updatedData[editingIndex] = updatedRecord;
        setJsonData(updatedData);
        message.success("Record updated successfully.");
        setEditModalVisible(false);
      }
    } catch {
      message.error("Invalid JSON format or error updating file.");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin />
      </div>
    );
  }

  if (!project) return <div>No project found.</div>;

  return (
    <div style={{ padding: "1rem" }}>
      <Button onClick={() => router.back()} style={{ marginBottom: "1rem" }}>
        Back
      </Button>

      <Descriptions bordered column={1}>
        {[
          { label: "Name", key: "name" },
          { label: "Domain", key: "domain" },
          { label: "Username", key: "username" },
          { label: "Note", key: "note" },
          { label: "Content", key: "content" },
          { label: "Last Posted Index", key: "lastPostedIndex" },
        ].map(({ label, key }) => (
          <Descriptions.Item key={key} label={label}>
            {editField === key ? (
              <div className="flex gap-2">
                <Input
                  value={editedProject?.[key] ?? ""}
                  onChange={(e) =>
                    setEditedProject((prev) =>
                      prev ? { ...prev, [key]: e.target.value } : prev
                    )
                  }
                />
                <Button
                  type="primary"
                  onClick={() => handleFieldUpdate(key as keyof Project)}
                >
                  Update
                </Button>
              </div>
            ) : key === "content" && project?.content ? (
              <div className="flex items-center justify-between gap-2">
                <a href={project.content} target="_blank" rel="noreferrer">
                  View Raw File
                </a>
                <Button onClick={() => setEditField(key)}>Edit</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <span>{project?.[key] || "N/A"}</span>
                <Button onClick={() => setEditField(key)}>Edit</Button>
              </div>
            )}
          </Descriptions.Item>
        ))}
      </Descriptions>

      {jsonData.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h3>JSON Data</h3>
          <Table
            columns={jsonColumns}
            dataSource={jsonData}
            rowKey={(record) => JSON.stringify(record)}
            loading={jsonLoading}
          />
        </div>
      )}

      <Modal
        title="Edit JSON Record"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSaveEdit}
        width="80vw"
        destroyOnClose
      >
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="JSON View" key="1">
            <div className="flex flex-col gap-2">
              <div className="flex gap-3">
                <Input
                  className="w-3/4"
                  placeholder="Title"
                  value={(() => {
                    try {
                      return JSON.parse(editingContent)?.title || "";
                    } catch {
                      return "";
                    }
                  })()}
                  onChange={(e) => {
                    try {
                      const updated = {
                        ...JSON.parse(editingContent),
                        title: e.target.value,
                      };
                      setEditingContent(JSON.stringify(updated, null, 2));
                    } catch {
                      message.error("Invalid JSON format");
                    }
                  }}
                />
                <Input
                  className="w-1/4"
                  placeholder="Status"
                  value={(() => {
                    try {
                      return JSON.parse(editingContent)?.status || "";
                    } catch {
                      return "";
                    }
                  })()}
                  onChange={(e) => {
                    try {
                      const updated = {
                        ...JSON.parse(editingContent),
                        status: e.target.value,
                      };
                      setEditingContent(JSON.stringify(updated, null, 2));
                    } catch {
                      message.error("Invalid JSON format");
                    }
                  }}
                />
              </div>
              <TextArea
                rows={18}
                placeholder="Content"
                value={(() => {
                  try {
                    return JSON.parse(editingContent)?.content || "";
                  } catch {
                    return "";
                  }
                })()}
                onChange={(e) => {
                  try {
                    const updated = {
                      ...JSON.parse(editingContent),
                      content: e.target.value,
                    };
                    setEditingContent(JSON.stringify(updated, null, 2));
                  } catch {
                    message.error("Invalid JSON format");
                  }
                }}
              />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Rendered HTML" key="2">
            <div
              className="max-h-[60vh] overflow-y-auto border border-gray-300 p-2"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    </div>
  );
}