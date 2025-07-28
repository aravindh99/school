import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Footer from './components/Footer';
import InstallPrompt from './components/InstallPrompt';
import Home from './components/Home';
import SchoolsList from './components/SchoolsList';
import CollegesList from './components/CollegesList';
import SchoolPage from './components/SchoolPage';
import CollegePage from './components/CollegePage';
import ClassPage from './components/ClassPage';
import CreateRumor from './components/CreateRumor';
import AdminPanel from './components/AdminPanel';
import AdminSchoolView from './components/AdminSchoolView';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <InstallPrompt />
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/schools" element={<SchoolsList />} />
              <Route path="/colleges" element={<CollegesList />} />
              <Route path="/school/:schoolId" element={<SchoolPage />} />
              <Route path="/college/:collegeId" element={<CollegePage />} />
              <Route path="/school/:schoolId/class/:classNumber" element={<ClassPage />} />
              <Route path="/school/:schoolId/class/:classNumber/create" element={<CreateRumor />} />
              <Route path="/school/:schoolId/create" element={<CreateRumor />} />
              <Route path="/college/:collegeId/create" element={<CreateRumor />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/school/:schoolId" element={<AdminSchoolView />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;