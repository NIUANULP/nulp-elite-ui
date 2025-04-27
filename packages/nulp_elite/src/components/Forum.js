import Cookies from "js-cookie";
import Footer from "components/Footer";
import Header from "components/header";
import { useEffect } from "react";
const urlConfig = require("../configs/urlConfig.json");

const Forum = () => {
  useEffect(() => {
    fetch(urlConfig.FORUM.AUTH_TOKEN)
      .then((res) => res.json())
      .then((data) => {
        const token = data.access_token;
        Cookies.set("token", token, { path: "/", secure: false });
        // Redirect to forum URL after token is saved
        window.location.href = urlConfig.FORUM.FORUM_URL;
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      });
  }, []);

  return (
    <div>
      <Header />
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h2>Redirecting to forum...</h2>
      </div>
      <Footer />
    </div>
  );
};

export default Forum;
