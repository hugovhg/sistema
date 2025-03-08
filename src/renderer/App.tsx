import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import Navigation from './components/Navigation';
import ServiceList from './components/ServiceList';
import CreateService from './components/CreateService';
import AddPerson from './components/AddPerson';
import AddServiceType from './components/AddServiceType';
import ServiceDetails from './components/ServiceDetails';

export default function App() {
  return (
    <Router>
      <CssBaseline />
      <Navigation />
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<ServiceList />} />
          <Route path="/create-service" element={<CreateService />} />
          <Route path="/add-person" element={<AddPerson />} />
          <Route path="/add-service-type" element={<AddServiceType />} />
          <Route path="/service/:id" element={<ServiceDetails />} />
        </Routes>
      </Container>
    </Router>
  );
}
