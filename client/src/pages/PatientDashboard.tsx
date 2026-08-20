import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../services/api';
import { Button } from '../components/Button';
import { User, MessageCircle } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
}

interface Consultation {
  id: string;
  doctor: Doctor;
  updatedAt: string;
}

export const PatientDashboard = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [docsRes, consRes] = await Promise.all([
        api.get('/auth/doctors'),
        api.get('/consultations')
      ]);
      setDoctors(docsRes.data);
      setConsultations(consRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Connect to Socket.IO for real-time dashboard updates
    const socket = io('/');
    socket.on('dashboard_update', () => {
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const startConsultation = async (doctorId: string) => {
    try {
      const res = await api.post('/consultations', { doctorId });
      navigate(`/consultation/${res.data.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-xl">Loading...</div>;

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-8">Patient Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <User className="text-primary" /> Available Doctors
          </h2>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {doctors.length === 0 ? (
              <p className="p-6 text-gray-500">No doctors available.</p>
            ) : (
              <ul className="divide-y">
                {doctors.map(doc => (
                  <li key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <span className="font-medium text-lg">{doc.name}</span>
                    <Button onClick={() => startConsultation(doc.id)}>Consult</Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MessageCircle className="text-primary" /> Active Consultations
          </h2>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {consultations.length === 0 ? (
              <p className="p-6 text-gray-500">No active consultations.</p>
            ) : (
              <ul className="divide-y">
                {consultations.map(cons => (
                  <li key={cons.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-lg">Dr. {cons.doctor.name}</p>
                      <p className="text-sm text-gray-500">Last updated: {new Date(cons.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate(`/consultation/${cons.id}`)}>Open</Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
