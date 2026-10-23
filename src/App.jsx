import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ContentProvider } from "./lib/content.jsx";
import Home from "./pages/Home.jsx";
import Admin from "./pages/Admin.jsx";
import "./styles/tokens.css";

export default function App() {
  return (
    <ContentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </ContentProvider>
  );
}
