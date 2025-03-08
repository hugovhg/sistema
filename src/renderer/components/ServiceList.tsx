import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from '@mui/material';

interface Service {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  persons: string[];
  types: string[];
}

export default function ServiceList() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesList = await window.electron.ipcRenderer.getServices();
        setServices(servicesList);
      } catch (err) {
        console.error('Failed to fetch services:', err);
      }
    };

    fetchServices();
  }, []);

  // Filter services based on search query
  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Servicios
      </Typography>

      {/* Search input field */}
      <TextField
        label="Buscar"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        margin="normal"
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre del Servicio</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Fecha de Creación</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Tipos de Servicio</TableCell>
              <TableCell>Personas Asignadas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredServices.map((service) => (
              <TableRow
                key={service.id}
                hover
                onClick={() => navigate(`/service/${service.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.description}</TableCell>
                <TableCell>
                  {new Date(service.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{service.status}</TableCell>
                <TableCell>{service.types}</TableCell>
                <TableCell>{service.persons}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
