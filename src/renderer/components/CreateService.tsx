import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Grid,
  Typography,
  Box,
} from '@mui/material';

interface Person {
  id: number;
  name: string;
}

interface ServiceType {
  id: number;
  type_name: string;
}

export default function CreateService() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedPersons, setSelectedPersons] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const typesList = await window.electron.ipcRenderer.getServiceTypes();
        const personsList = await window.electron.ipcRenderer.getPersons();
        setServiceTypes(typesList);
        setPersons(personsList);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, []);

  const handleCreateService = useCallback(async () => {
    if (!name.trim() || !description.trim()) return;
    try {
      await window.electron.ipcRenderer.addService(
        name,
        description,
        selectedTypes,
        selectedPersons,
      );
      navigate('/');
    } catch (err) {
      console.error('Failed to create service:', err);
    }
  }, [name, description, selectedTypes, selectedPersons, navigate]);

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Crear Servicio
      </Typography>

      <TextField
        label="Nombre"
        variant="outlined"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        margin="normal"
      />

      <TextField
        label="Descripción"
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        margin="normal"
      />

      {/* Service Types */}
      <Typography variant="h6" sx={{ marginTop: 2 }}>
        Seleccionar Tipo de Servicio
      </Typography>
      <Grid container spacing={2}>
        {serviceTypes.map((type) => (
          <Grid item xs={6} key={type.id}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedTypes.includes(type.id)}
                  onChange={(e) =>
                    setSelectedTypes((prev) =>
                      e.target.checked
                        ? [...prev, type.id]
                        : prev.filter((t) => t !== type.id),
                    )
                  }
                  sx={{
                    '& .MuiSvgIcon-root': {
                      borderRadius: '50%', // Circular shape
                      backgroundColor: selectedTypes.includes(type.id)
                        ? '#2196f3' // Blue background when checked
                        : '#e0e0e0', // Gray background when unchecked
                      color: 'white',
                      fontSize: 24,
                    },
                  }}
                />
              }
              label={type.type_name}
            />
          </Grid>
        ))}
      </Grid>

      {/* Select Persons */}
      <Typography variant="h6" sx={{ marginTop: 2 }}>
        Seleccionar Personas
      </Typography>
      <Grid container spacing={2}>
        {persons.map((person) => (
          <Grid item xs={6} key={person.id}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedPersons.includes(person.id)}
                  onChange={(e) =>
                    setSelectedPersons((prev) =>
                      e.target.checked
                        ? [...prev, person.id]
                        : prev.filter((id) => id !== person.id),
                    )
                  }
                  sx={{
                    '& .MuiSvgIcon-root': {
                      borderRadius: '50%', // Circular shape
                      backgroundColor: selectedPersons.includes(person.id)
                        ? '#4caf50' // Green background when checked
                        : '#e0e0e0', // Gray background when unchecked
                      color: 'white',
                      fontSize: 24,
                    },
                  }}
                />
              }
              label={person.name}
            />
          </Grid>
        ))}
      </Grid>

      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateService}
        sx={{ marginTop: 3 }}
      >
        Crear
      </Button>
    </Box>
  );
}
