"use client";

import { message, Modal } from "antd";
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

  const fetchMedia = async (page = 1) => {
    setLoading(true);
    try {
      const url = `${domain}/wp-json/wp/v2/media?_fields=id,guid.rendered&page=${page}`;
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
      const images = data.map((item) => ({
        id: item.id, // Lấy ID ảnh
        url: item.guid.rendered, // Lấy URL ảnh
      }));
      setMedia(images);

      setPagination((prev) => ({
        ...prev,
        total: parseInt(res.headers.get("X-WP-Total") || "0"),
      }));
      setLoading(false);
      console.log("Fetched posts:", data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      message.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  console.log(media);

  return (
    <>
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        width={1000}
        height={600}
      >
        <h2>Chọn ảnh</h2>
        {/* <div style={{ display: "flex", gap: "10px" }}> */}
        <div className="grid grid-cols-4 gap-2">
          {media.map((image) => (
            <img
              key={image.id}
              src={image.url}
              alt="Media"
              style={{ width: "100%", cursor: "pointer" }}
              onClick={() => onSelectImage(image)}
            />
          ))}
        </div>
      </Modal>
    </>
  );
}
