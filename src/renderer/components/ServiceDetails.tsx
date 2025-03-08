import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Delete } from '@mui/icons-material';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Box,
  TextField,
  Grid,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState('');
  const [updatedDescription, setUpdatedDescription] = useState('');
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [selectedPersons, setSelectedPersons] = useState<number[]>([]);
  const [allServiceTypes, setAllServiceTypes] = useState<any[]>([]);
  const [allPersons, setAllPersons] = useState<any[]>([]);
  const [messages, setMessages] = useState<
    { id: string; text: string; created_at: string }[]
  >([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [editedMessageText, setEditedMessageText] = useState('');

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const serviceId = Number(id);
        const details =
          await window.electron.ipcRenderer.getServiceById(serviceId);
        const serviceTypes =
          await window.electron.ipcRenderer.getServiceTypes();
        const persons = await window.electron.ipcRenderer.getPersons();
        const msgs =
          await window.electron.ipcRenderer.getServiceMessages(serviceId);

        setMessages(msgs);
        setService(details);
        setAllServiceTypes(serviceTypes);
        setAllPersons(persons);
        setUpdatedName(details.name);
        setUpdatedDescription(details.description);
        setUpdatedStatus(details.status);
        setSelectedTypes(details.serviceTypes.map((s) => s.id));
        setSelectedPersons(details.persons.map((p) => p.id));
      } catch (err) {
        console.error('Failed to fetch service details:', err);
      }
    };

    fetchServiceDetails();
  }, [id]);

  const handleUpdateService = async () => {
    try {
      await window.electron.ipcRenderer.updateService(
        Number(id),
        updatedName,
        updatedDescription,
        updatedStatus,
        selectedPersons,
        selectedTypes,
      );
      setService({
        ...service,
        name: updatedName,
        description: updatedDescription,
        status: updatedStatus,
        serviceTypes: allServiceTypes.filter((t) =>
          selectedTypes.includes(t.id),
        ),
        persons: allPersons.filter((p) => selectedPersons.includes(p.id)),
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update service:', err);
    }
  };

  const handleAddMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const addedMessage = await window.electron.ipcRenderer.addServiceMessage(
        newMessage,
        Number(id),
      );
      setMessages([...messages, addedMessage]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to add message:', err);
    }
  };

  const handleEditMessage = async (messageId) => {
    try {
      // const updatedMessage =
      //   await window.electron.ipcRenderer.updateServiceMessage(
      //     messageId,
      //     editedMessageText,
      //   );
      // setMessages(
      //   messages.map((msg) => (msg.id === messageId ? updatedMessage : msg)),
      // );
      setEditingMessage(null);
    } catch (err) {
      console.error('Failed to edit message:', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      // await window.electron.ipcRenderer.deleteServiceMessage(messageId);
      setMessages(messages.filter((msg) => msg.id !== messageId));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  if (!service) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="sm">
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {isEditing ? 'Editar Servicio' : `Título: ${service.name}`}
          </Typography>

          {isEditing ? (
            <>
              <TextField
                label="Nombre"
                variant="outlined"
                fullWidth
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
                margin="normal"
              />
              <TextField
                label="Descripción"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                value={updatedDescription}
                onChange={(e) => setUpdatedDescription(e.target.value)}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={updatedStatus}
                  onChange={(e) => setUpdatedStatus(e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
                  <MenuItem value="EN PROCESO">EN PROCESO</MenuItem>
                  <MenuItem value="FINALIZADO">FINALIZADO</MenuItem>
                </Select>
              </FormControl>
            </>
          ) : (
            <>
              <Typography variant="body1">
                Descripción: {service.description}
              </Typography>
              <Typography variant="body1">Estado: {service.status}</Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Fecha de Creación:{' '}
                {new Date(service.created_at).toLocaleDateString()}
              </Typography>
            </>
          )}

          {/* Service Types */}
          <Typography variant="body2" component="div" sx={{ mt: 2 }}>
            Tipos de Servicio:
            <Box component="span" display="inline-flex" gap={1} flexWrap="wrap">
              {isEditing
                ? allServiceTypes.map((t) => (
                    <FormControlLabel
                      key={t.id}
                      control={
                        <Checkbox
                          checked={selectedTypes.includes(t.id)}
                          onChange={(e) =>
                            setSelectedTypes((prev) =>
                              e.target.checked
                                ? [...prev, t.id]
                                : prev.filter((id) => id !== t.id),
                            )
                          }
                        />
                      }
                      label={t.type_name}
                    />
                  ))
                : service.serviceTypes.map((s) => (
                    <Chip key={s.id} label={s.type_name} />
                  ))}
            </Box>
          </Typography>

          {/* Persons */}
          <Typography variant="body2" component="div" sx={{ mt: 2 }}>
            Personas Asignadas:
            <Box component="span" display="inline-flex" gap={1} flexWrap="wrap">
              {isEditing
                ? allPersons.map((p) => (
                    <FormControlLabel
                      key={p.id}
                      control={
                        <Checkbox
                          checked={selectedPersons.includes(p.id)}
                          onChange={(e) =>
                            setSelectedPersons((prev) =>
                              e.target.checked
                                ? [...prev, p.id]
                                : prev.filter((id) => id !== p.id),
                            )
                          }
                        />
                      }
                      label={p.name}
                    />
                  ))
                : service.persons.map((p) => (
                    <Chip key={p.id} label={p.name} />
                  ))}
            </Box>
          </Typography>
        </CardContent>
      </Card>

      <Box mt={3}>
        <Typography variant="h6">Mensajes</Typography>
        <List>
          {messages.map((msg) => (
            <ListItem key={msg.id}>
              {editingMessage === msg.id ? (
                <TextField
                  fullWidth
                  value={editedMessageText}
                  onChange={(e) => setEditedMessageText(e.target.value)}
                />
              ) : (
                <ListItemText
                  primary={msg.text}
                  secondary={new Date(msg.created_at).toLocaleString()}
                />
              )}
              {editingMessage === msg.id && (
                <Button onClick={() => handleEditMessage(msg.id)}>
                  Guardar
                </Button>
              )}
            </ListItem>
          ))}
        </List>
        <TextField
          fullWidth
          label="Agregar Mensaje"
          variant="outlined"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddMessage}
          sx={{ mt: 1 }}
        >
          Enviar
        </Button>
      </Box>

      <Box sx={{ mt: 2 }}>
        {isEditing ? (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateService}
              sx={{ mr: 1 }}
            >
              Guardar Cambios
            </Button>
            <Button variant="outlined" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setIsEditing(true)}
              sx={{ mr: 1 }}
            >
              Editar
            </Button>
            <Button variant="contained" onClick={() => navigate('/')}>
              Volver
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
}
