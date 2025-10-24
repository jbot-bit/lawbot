import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, LiveSession } from '@google/genai';
import { Icon } from './Icon';

// Helper functions for audio encoding/decoding as per Gemini docs
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const AudioTranscriber: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  
  const startRecording = async () => {
    setError(null);
    setTranscript('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser does not support audio recording.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (event) => {
              const inputData = event.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscript(prev => prev + text);
            }
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              // Per API guidelines, the model's audio output stream must be handled,
              // even if, as in this transcription-only component, it is not being played.
              console.log("Received model audio data, but not playing it.");
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error("Live session error:", e);
            setError("A connection error occurred during transcription.");
            stopRecording();
          },
          onclose: (e: CloseEvent) => {
            console.log("Live session closed.");
          },
        },
        config: {
          // The Live API requires responseModalities to be configured.
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
        },
      });

      setIsRecording(true);
    } catch (err: any) {
      console.error("Failed to start recording:", err);
      setError("Could not access microphone. Please check your browser permissions.");
    }
  };

  const stopRecording = () => {
    sessionPromiseRef.current?.then((session) => session.close());
    sessionPromiseRef.current = null;
    
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;

    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;

    audioContextRef.current?.close();
    audioContextRef.current = null;

    setIsRecording(false);
  };
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if(isRecording) {
        stopRecording();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);


  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Icon name="microphone" /> Audio Transcription</h2>
        <p className="text-neutral-200">Record audio notes or dictations and get a live transcript.</p>
      </div>

      <div className="flex-grow bg-neutral-900 rounded-lg p-4 mb-4 overflow-y-auto">
        {transcript ? (
            <p className="whitespace-pre-wrap text-neutral-100">{transcript}</p>
        ): (
            <div className="text-center text-neutral-400 mt-8">
                <p>{isRecording ? "Listening..." : "Your transcript will appear here."}</p>
            </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        {!isRecording ? (
          <button onClick={startRecording} className="flex items-center gap-2 bg-red-600 text-white font-bold py-3 px-6 rounded-full hover:bg-red-700 transition-colors">
            <Icon name="microphone" className="w-5 h-5" />
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className="flex items-center gap-2 bg-neutral-600 text-white font-bold py-3 px-6 rounded-full hover:bg-neutral-500 transition-colors">
            <Icon name="stop" className="w-5 h-5" />
            Stop Recording
          </button>
        )}
      </div>
       {error && <p className="text-red-400 text-center mt-4">{error}</p>}
    </div>
  );
};