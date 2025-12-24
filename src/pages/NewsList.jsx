import { useEffect, useState } from "react";
import { getAllNews, getLiveNews } from "../services/newsApi";
import { Link } from "react-router-dom";
import "./News.css";

export default function NewsList() {
  const [localNews, setLocalNews] = useState([]);
  const [liveNews, setLiveNews] = useState([]);

  useEffect(() => {
    getAllNews()
      .then((res) => setLocalNews(res.data))
      .catch((err) => console.log(err));

    getLiveNews()
      .then((res) => setLiveNews(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="news-list">
      <h1>📰 CampusGig News</h1>

      {/* LOCAL NEWS */}
      <div className="news-section">
        <h2>🏫 Local Campus News</h2>
        {localNews.length === 0 && <p>No campus news yet.</p>}

        <div className="news-cards-container">
          {localNews.map((item) => (
            <div key={item._id} className="news-card">
              <h3>{item.title}</h3>
              {item.image && <img src={item.image} alt={item.title} />}
              <p>{item.content.substring(0, 150)}...</p>
              <Link to={`/news/${item._id}`}>Read More →</Link>
              <hr />
            </div>
          ))}
        </div>
      </div>

      {/* LIVE NEWS */}
      <div className="news-section">
        <h2>🌍 Live News (TOI)</h2>
        {liveNews.length === 0 && <p>No live news available.</p>}

        <div className="news-cards-container">
          {liveNews.map((item, idx) => (
            <div key={idx} className="news-card">
              <h3>{item.title}</h3>
              <p>{item.contentSnippet}</p>
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
              >
                Read Full Article →
              </a>
              <hr />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}