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
  content?: string; // File URL (JSON file)
  lastPostedIndex?: number;
}

export default function ProjectDetails() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [jsonLoading, setJsonLoading] = useState(false);

  // State for editing a JSON record
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // Function to fetch JSON file content
  const fetchJsonContent = async (fileUrl: string) => {
    setJsonLoading(true);
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) {
        throw new Error("Failed to fetch JSON content");
      }
      const data = await res.json();
      setJsonData(Array.isArray(data) ? data : [data]);
    } catch (error: any) {
      message.error(error.message || "Error loading JSON file.");
    } finally {
      setJsonLoading(false);
    }
  };

  useEffect(() => {
    if (!params || !params.id) {
      message.error("Invalid project ID.");
      setLoading(false);
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

        if (data.data.content && data.data.content.endsWith(".json")) {
          fetchJsonContent(data.data.content);
        }
      } catch (error: any) {
        message.error(error.message || "Error fetching project details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [params]);

  // Define table columns for JSON data, including an Actions column with an Edit button.
  const jsonColumns =
    jsonData.length > 0
      ? [
        ...Object.keys(jsonData[0]).map((key) => ({
          title: key.toUpperCase(),
          dataIndex: key,
          key: key,
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

  // Called when user clicks the Edit button
  const handleEdit = (record: any, index: number) => {
    setEditingRecord(record);
    setEditingIndex(index);
    setEditingContent(JSON.stringify(record, null, 2));
    setEditModalVisible(true);
  };

  // Called when saving changes from the edit modal
  const handleSaveEdit = async () => {
    try {
      const updatedRecord = JSON.parse(editingContent);
      if (project && editingIndex !== null) {
        // Call the API endpoint to update the single JSON array item
        const res = await fetch(`/api/projects/${project._id}/json`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ index: editingIndex, updatedRecord }),
        });
        const responseData = await res.json();
        if (!responseData.success) {
          message.error(
            responseData.error || "Failed to update JSON item on server"
          );
          return;
        }
        // Update local state
        const updatedData = [...jsonData];
        updatedData[editingIndex] = updatedRecord;
        setJsonData(updatedData);
        message.success("Record updated successfully.");
        setEditModalVisible(false);
      } else {
        message.error("Project or editing index not set.");
      }
    } catch (error) {
      message.error("Invalid JSON format or error updating file.");
    }
  };

  if (loading) return <div className="h-screen flex justify-center items-center"> <Spin /> </div>
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
        <Descriptions.Item label="Note">
          {project.note || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Content">
          {project.content ? (
            <a href={project.content} target="_blank" rel="noreferrer">
              View Raw File
            </a>
          ) : (
            "No File"
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Last Posted Index">
          {project.lastPostedIndex}
        </Descriptions.Item>
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

      {/* <Modal
        title="Edit JSON Record"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSaveEdit}
        width={'80vw'}
        destroyOnClose
      >
        <TextArea
          value={editingContent}
          onChange={(e) => setEditingContent(e.target.value)}
          rows={20}
        />
      </Modal> */}

      <Modal
        title="Edit JSON Record"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSaveEdit}
        width={'80vw'}
        destroyOnClose
      >
        <Tabs defaultActiveKey="1">
          {/* Tab 1: Hiển thị JSON */}
          <Tabs.TabPane tab="JSON View" key="1">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="flex gap-3">
                <div className="w-3/4">
                  <Input
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
                        const updatedJson = { ...JSON.parse(editingContent), title: e.target.value };
                        setEditingContent(JSON.stringify(updatedJson, null, 2));
                      } catch {
                        message.error("Invalid JSON format");
                      }
                    }}
                  />
                </div>
                <div className="w-1/4">
                  <Input
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
                        const updatedJson = { ...JSON.parse(editingContent), status: e.target.value };
                        setEditingContent(JSON.stringify(updatedJson, null, 2));
                      } catch {
                        message.error("Invalid JSON format");
                      }
                    }}
                  />
                </div>
              </div>

              <TextArea
                placeholder="Content"
                rows={18}
                value={(() => {
                  try {
                    return JSON.parse(editingContent)?.content || "";
                  } catch {
                    return "";
                  }
                })()}
                onChange={(e) => {
                  try {
                    const updatedJson = { ...JSON.parse(editingContent), content: e.target.value };
                    setEditingContent(JSON.stringify(updatedJson, null, 2));
                  } catch {
                    message.error("Invalid JSON format");
                  }
                }}
              />


            </div>
          </Tabs.TabPane>


          {/* Tab 2: Hiển thị HTML */}
          <Tabs.TabPane tab="Rendered HTML" key="2">
            <div
              style={{ maxHeight: '60vh', overflowY: "auto", border: "1px solid #ddd", padding: 10 }}
              dangerouslySetInnerHTML={{
                __html: (() => {
                  try {
                    return JSON.parse(editingContent)?.content || "Invalid JSON";
                  } catch (error) {
                    console.error("JSON parse error:", error);
                    return "Invalid JSON format";
                  }
                })(),
              }}
            />
          </Tabs.TabPane>

        </Tabs>
      </Modal>
    </div>
  );
}
