import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export const convertSpeechToText = async (audioFilePath: string): Promise<string> => {
  if (!process.env.ELEVENLABS_API_KEY) {
    // Demo Mode: If API key is missing, return a dummy string or simulate.
    console.warn("ELEVENLABS_API_KEY is not set. Using Demo Mode.");
    return "This is a demo transcription because the ElevenLabs API key is missing.";
  }

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioFilePath));
    formData.append('model_id', 'scribe_v1'); // ElevenLabs Speech-to-Text model

    const response = await axios.post(
      'https://api.elevenlabs.io/v1/speech-to-text',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
      }
    );

    // According to ElevenLabs API, transcription is usually in response.data.text
    return response.data.text || '';
  } catch (error: any) {
    console.error('Error calling ElevenLabs API:', error.response?.data || error.message);
    throw new Error('Failed to convert speech to text');
  }
};
