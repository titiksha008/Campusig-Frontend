import { useEffect, useState } from "react";
import { getNewsById } from "../services/newsApi";
import { useParams } from "react-router-dom";

export default function NewsDetail() {
  const { id } = useParams();
  const [news, setNews] = useState(null);

  useEffect(() => {
    getNewsById(id)
      .then((res) => setNews(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  if (!news) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{news.title}</h1>

      {news.image && (
        <img
          src={news.image}
          alt={news.title}
          style={{ width: "350px", margin: "10px 0", borderRadius: "8px" }}
        />
      )}

      <p style={{ fontSize: "18px", marginTop: "10px" }}>{news.content}</p>

      <p>
        <strong>Author:</strong> {news?.author?.name || "Unknown"}
      </p>
    </div>
  );
}