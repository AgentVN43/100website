import { useState } from "react";

const PostButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePost = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/post", { method: "GET" });
      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ Lỗi: ${data.error || "Không xác định"}`);
      }
    } catch (error) {
      setMessage("❌ Lỗi khi gọi API");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePost}
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          borderRadius: "5px",
        }}
      >
        {loading ? "Đang đăng bài..." : "Đăng bài lên tất cả website"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default PostButton;
