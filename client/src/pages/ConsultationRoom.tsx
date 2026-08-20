import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Mic, Send, Square, AlertCircle, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderRole: 'PATIENT' | 'DOCTOR';
  content: string;
  messageType: 'TEXT' | 'SPEECH_TRANSCRIPTION';
  createdAt: string;
}

export const ConsultationRoom = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [processingAudio, setProcessingAudio] = useState(false);
  const [error, setError] = useState('');
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Connect Socket.IO
    socketRef.current = io('/');
    
    socketRef.current.emit('join_consultation', id);

    socketRef.current.on('new_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [id]);

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const res = await api.get(`/consultations/${id}`);
        setMessages(res.data.messages || []);
        scrollToBottom();
      } catch (err) {
        setError('Failed to load consultation');
      } finally {
        setLoading(false);
      }
    };
    fetchConsultation();
  }, [id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendTextMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    try {
      await api.post(`/consultations/${id}/messages`, { content: inputText });
      setInputText('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      setError('Microphone permission denied or unavailable');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const sendAudioMessage = async (audioBlob: Blob) => {
    setProcessingAudio(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('consultationId', id!);

    try {
      await api.post('/speech-to-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process audio');
    } finally {
      setProcessingAudio(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-xl">Loading room...</div>;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] max-w-5xl mx-auto w-full p-4">
      <div className="bg-white rounded-t-xl shadow-sm border p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Consultation Room</h2>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Back to Dashboard</Button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 flex items-center gap-2 border-x border-red-100">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 border-x border-b border-gray-200 p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 my-10">
            No messages yet. Start the conversation!
          </div>
        )}
        
        {messages.map((msg) => {
          const isMine = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${isMine ? (user?.role === 'PATIENT' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-emerald-600 text-white rounded-br-none') : 'bg-white border text-gray-900 rounded-bl-none shadow-sm'}`}>
                <div className="text-xs opacity-75 mb-1 font-semibold uppercase tracking-wider">
                  {msg.senderRole}
                </div>
                <div className="text-lg">
                  {msg.content}
                </div>
                <div className="text-xs opacity-60 mt-2 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-b-xl shadow-sm border border-t-0 p-4">
        {user?.role === 'PATIENT' ? (
          <form onSubmit={sendTextMessage} className="flex gap-2">
            <Input 
              label=""
              placeholder="Type your message here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="lg" className="h-[42px] mt-1" disabled={!inputText.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center py-4">
            {processingAudio ? (
              <div className="flex flex-col items-center text-gray-600">
                <RefreshCw className="h-10 w-10 animate-spin text-primary mb-2" />
                <span className="font-medium">Converting speech to text...</span>
              </div>
            ) : (
              <Button 
                onClick={recording ? stopRecording : startRecording}
                variant={recording ? 'danger' : 'primary'}
                size="lg"
                className="w-full sm:w-auto min-w-[250px] py-6 text-xl rounded-full shadow-lg flex items-center justify-center gap-3"
              >
                {recording ? (
                  <>
                    <Square className="h-8 w-8 fill-current" /> Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-8 w-8" /> Speak Response
                  </>
                )}
              </Button>
            )}
            {!recording && !processingAudio && (
              <p className="mt-4 text-gray-500">Click to start recording your response.</p>
            )}
            {recording && (
              <p className="mt-4 text-red-500 font-bold animate-pulse">Recording in progress...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
