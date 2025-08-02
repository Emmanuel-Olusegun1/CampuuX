import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Resources from "./pages/Resources";
import Jobs from "./pages/Jobs";
import Scholarships from "./pages/Scholarships";
import Request from "./pages/Request"
import AdminJobsDashboard from "./pages/AdminJobsDashboard"
import NotFoundPage from "./pages/NotFoundPage"


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/scholarships" element={<Scholarships />} />
        <Route path="/request_resource" element={<Request />} />
        <Route path="admin" element={<AdminJobsDashboard />} />
        <Route path="/*" element={<NotFoundPage />} />
  
      </Routes>
    </Router>
  );
}

export default App;