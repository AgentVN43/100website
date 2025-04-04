"use client";

import { message, Modal, Button, Spin } from "antd";
import React, { useEffect, useState } from "react";

export default function Media({
  visible,
  selectedId,
  onClose,
  domain,
  credentials,
  onSelectImage,
}) {
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchMedia = async (page = 1, append = false) => {
    setLoading(true);
    try {
      const url = `${domain}/wp-json/wp/v2/media?_fields=id,guid.rendered&per_page=50`;
      const authHeader =
        "Basic " + btoa(`${credentials.username}:${credentials.password}`);
      const res = await fetch(url, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("API trả về không phải mảng:", data);
        setMedia([]); // Đảm bảo media luôn là mảng
        return;
      }

      const images = data.map((item) => ({
        id: item.id,
        url: item.guid.rendered,
      }));

      setMedia((prev) => (append ? [...prev, ...images] : images)); // Nối dữ liệu mới
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: parseInt(res.headers.get("X-WP-Total") || "0"),
      }));
    } catch (error) {
      console.error("Error fetching posts:", error);
      message.error("Failed to load posts");
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(1);
  }, []);

  const loadMore = () => {
    if (pagination.current * pagination.pageSize < pagination.total) {
      fetchMedia(pagination.current + 1, true);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      height={600}
      bodyStyle={{
        overflowY: 'auto', // Add this line to enable vertical scrolling
        maxHeight: 'calc(100vh - 200px)', // Adjust this based on your modal's size, this ensures scroll only happens within the modal content
      }}
    >
      <h2 className="">Chọn ảnh</h2>
      <div className="grid grid-cols-4 gap-3">
        {media.map((image) => (
          <img
            key={image.id}
            src={image.url}
            alt="Media"
            style={{
              width: "100%",
              cursor: "pointer",
              objectFit: "cover",
              borderRadius: "5px",
            }}
            onClick={() => onSelectImage(image.id, image.url)}
          />
        ))}
      </div>

      {pagination.current * pagination.pageSize < pagination.total && (
        <div className="text-center mt-4">
          <Button onClick={loadMore} loading={loading}>
            Xem thêm
          </Button>
        </div>
      )}
    </Modal>
  );
}
