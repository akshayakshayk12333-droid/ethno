# VoiceBridge

VoiceBridge is an accessibility-focused doctor-patient communication platform designed primarily for deaf, hard-of-hearing, and non-speaking patients.

## Features
- **Patient Dashboard**: Start consultations and communicate via text.
- **Doctor Dashboard**: Manage consultations and respond using voice.
- **Real-time Messaging**: Instant communication via Socket.IO.
- **Speech-to-Text**: Converts doctor's speech to text in real-time using the ElevenLabs Scribe API.
- **Accessibility Settings**: High contrast mode, dynamic font sizing.

## Architecture & Technology Stack
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, TypeScript, Socket.IO
- **Database**: PostgreSQL with Prisma ORM
- **Containerization**: Docker & Docker Compose
- **AI**: ElevenLabs API for Speech-to-Text

## Getting Started

### Prerequisites
- Docker and Docker Compose installed.

### Setup Instructions

1. Clone the repository and navigate into it.
2. Create environment variables.
   - For the server, copy `.env.example` to `.env`:
     ```bash
     cp server/.env.example server/.env
     ```
   - Update `server/.env` with your `ELEVENLABS_API_KEY`.
3. Start the application using Docker Compose:
   ```bash
   docker compose up -d
   ```
4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Environment Variables
The `server/.env` file requires the following variables:
- `DATABASE_URL`: PostgreSQL connection string (configured automatically if using Docker).
- `PORT`: Port for the backend server (default: 3000).
- `JWT_SECRET`: Secret key for JWT authentication.
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key for speech-to-text.

## Demo Workflow
1. Open the application and register as a **Patient**.
2. Open an incognito window and register as a **Doctor**.
3. As the Patient, log in, view available doctors, and click **Consult**.
4. Patient types a text message (e.g., "I have a headache").
5. The Doctor receives the message on their dashboard, clicks to open the consultation.
6. Doctor clicks **Speak Response** and talks into the microphone.
7. The audio is sent to the backend, transcribed via ElevenLabs, and sent back to the patient as text in real-time.

## Future Improvements
- Video/audio calling support.
- Multilingual translation.
- Integration with hospital EMR/EHR systems.
