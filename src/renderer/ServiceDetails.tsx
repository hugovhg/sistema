import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [availablePersons, setAvailablePersons] = useState<
    { id: number; name: string }[]
  >([]);
  const [service, setService] = useState<{
    name: string;
    description: string;
    created_at: string;
    persons: { id: number; name: string }[];
    serviceTypes: { id: number; type_name: string }[];
    messages: string[];
  } | null>(null);

  const [message, setMessage] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null); // Store ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        const personsList = await window.electron.ipcRenderer.getPersons();
        setAvailablePersons(personsList);

        const serviceData = await window.electron.ipcRenderer.getServiceById(
          Number(id),
        );
        setService(serviceData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, [id]);

  const handleUpdateService = async () => {
    if (!service) return;
    try {
      await window.electron.ipcRenderer.updateService(
        Number(id),
        service.name,
        service.description,
        service.persons.map((p) => p.id),
        service.serviceTypes.map((t) => t.id),
      ); // Example
    } catch (err) {
      console.error('Failed to update service:', err);
    }
  };

  const handleAddMessage = async () => {
    if (!message.trim() || !service) return;
    try {
      const updatedMessages = [...service.messages, message];
      setService({ ...service, messages: updatedMessages });
      setMessage('');
      // await window.electron.ipcRenderer.updateServiceMessages(
      //   service.id,
      //   updatedMessages,
      // ); // Persist changes
    } catch (err) {
      console.error('Failed to add message:', err);
    }
  };

  const handleAddPerson = async () => {
    if (selectedPersonId === null || !service) return;

    const personToAdd = availablePersons.find((p) => p.id === selectedPersonId);
    if (!personToAdd || service.persons.find((p) => p.id === personToAdd.id))
      return;

    try {
      const updatedPersons = [...service.persons, personToAdd];
      setService({ ...service, persons: updatedPersons });
      setSelectedPersonId(null); // Clear selection

      // await window.electron.ipcRenderer.updateServicePersons(
      //   service.id,
      //   updatedPersons.map((p) => p.id),
      // );
    } catch (error) {
      console.error('Failed to add person:', error);
    }
  };

  const handleRemovePerson = async (personId: number) => {
    if (!service) return;
    try {
      const updatedPersons = service.persons.filter((p) => p.id !== personId);
      setService({ ...service, persons: updatedPersons });
      // await window.electron.ipcRenderer.updateServicePersons(
      //   service.id,
      //   updatedPersons.map((p) => p.id),
      // );
    } catch (error) {
      console.error('Failed to remove person:', error);
    }
  };

  if (!service) return <p>Loading...</p>;

  const availablePersonsFiltered = availablePersons.filter(
    (person) => !service.persons.find((p) => p.id === person.id),
  );

  return (
    <div>
      <h2>Service Details</h2>
      <label>
        Name:
        <input
          type="text"
          value={service.name}
          onChange={(e) => setService({ ...service, name: e.target.value })}
        />
      </label>
      <label>
        Description:
        <textarea
          value={service.description}
          onChange={(e) =>
            setService({ ...service, description: e.target.value })
          }
        />
      </label>
      <button onClick={handleUpdateService}>Update Service</button>

      {/* Manage Persons */}
      <h3>Persons</h3>
      <ul>
        {service.persons.map((person) => (
          <li key={person.id}>
            {person.name}
            <button onClick={() => handleRemovePerson(person.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <label>
        Add Person:
        <select
          value={selectedPersonId || ''}
          onChange={(e) => setSelectedPersonId(Number(e.target.value) || null)}
        >
          <option value="">Select a person</option>
          {availablePersonsFiltered.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </label>
      <button onClick={handleAddPerson} disabled={selectedPersonId === null}>
        Add Person
      </button>

      {/* ... Manage Messages ... */}

      <button onClick={() => navigate('/')}>Back to Services</button>
    </div>
  );
}

export default ServiceDetails;
