import React, { useState, useRef } from 'react';
import { PRELOADED_DOCUMENTS } from '../constants';
import { extractFactsFromDocument, analyzeImage } from '../services/geminiService';
import { Loader } from './Loader';
import { DocumentInfo } from '../types';
import { Icon } from './Icon';
import { useCaseContext } from '../contexts/CaseContext';

export const DocumentSummarizer: React.FC = () => {
  const { caseSummary, addFactSource } = useCaseContext();
  const [allDocuments, setAllDocuments] = useState<DocumentInfo[]>(PRELOADED_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<DocumentInfo | null>(allDocuments[0]);
  const [extractedFacts, setExtractedFacts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDocSelect = (docId: string) => {
    const doc = allDocuments.find(d => d.id === docId);
    if (doc) {
      setSelectedDoc(doc);
      setExtractedFacts([]);
      setFileName(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const readFileAsBase64 = (file: File): Promise<{base64: string, mimeType: string}> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve({ base64: base64String, mimeType: file.type });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setExtractedFacts([]);

    if (file.type === 'text/plain') {
      try {
        const textContent = await readFileAsText(file);
        const newDoc: DocumentInfo = {
          id: `uploaded-${Date.now()}`,
          name: file.name,
          content: textContent,
        };
        setAllDocuments(prevDocs => [...prevDocs, newDoc]);
        setSelectedDoc(newDoc);
        setFileName(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (e) {
        console.error(e);
        setError('Failed to read text file.');
      }
    } else if (file.type.startsWith('image/')) {
      setSelectedDoc(null);
      setFileName(file.name);
    } else {
      setError('Unsupported file type. Please upload a .txt, .jpg, or .png file.');
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };


  const handleSummarize = async () => {
    setIsLoading(true);
    setError(null);
    setExtractedFacts([]);

    try {
        let docContentToAnalyze = '';
        let docName = '';

        const file = fileInputRef.current?.files?.[0];

        if (fileName && file && file.name === fileName && file.type.startsWith('image/')) {
            const { base64, mimeType } = await readFileAsBase64(file);
            const prompt = "Analyze this image of a legal document page, identify key facts, entities, and dates, and return them as a JSON array of strings.";
            const imageAnalysisResult = await analyzeImage(base64, mimeType, prompt);
            // We expect analyzeImage to now also return a JSON array string
             const parsedFacts = JSON.parse(imageAnalysisResult);
             if (Array.isArray(parsedFacts)) {
                setExtractedFacts(parsedFacts);
             } else {
                // Fallback for non-JSON response from image analysis
                setExtractedFacts([imageAnalysisResult]);
             }
        } else if (selectedDoc) {
            docContentToAnalyze = selectedDoc.content;
            docName = selectedDoc.name;
            const factResponse = await extractFactsFromDocument(docContentToAnalyze, caseSummary);
            const parsedFacts = JSON.parse(factResponse);
            if(Array.isArray(parsedFacts)) {
                setExtractedFacts(parsedFacts);
            } else {
                throw new Error("Failed to extract facts in the correct format.");
            }
        } else {
            throw new Error("No document selected or uploaded for analysis.");
        }
    } catch (e: any) {
        setError(e.message || "An error occurred during analysis.");
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleIncorporate = () => {
    if (extractedFacts.length === 0) return;
    const docName = selectedDoc?.name || fileName || 'Uploaded Document';
    addFactSource(docName, extractedFacts);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 3000); // Hide message after 3 seconds
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Icon name="document" /> Document Analysis</h2>
        <p className="text-neutral-200">Select a case document or upload your own. The AI will perform a deep analysis and extract key facts.</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
        <div className="lg:w-1/3 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-100 mb-2">Select or Upload a Document</label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {allDocuments.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => handleDocSelect(doc.id)}
                  className={`w-full p-3 rounded-md text-left transition-colors truncate ${selectedDoc?.id === doc.id ? 'bg-brand-primary text-white' : 'bg-neutral-700 hover:bg-neutral-600'}`}
                >
                  {doc.name}
                </button>
              ))}
            </div>
          </div>
          <div className="text-center text-neutral-400 my-2">OR</div>
          <div>
            <label htmlFor="file-upload" className="w-full cursor-pointer bg-neutral-700 text-neutral-200 font-medium py-3 px-4 rounded-md hover:bg-neutral-600 transition-colors flex items-center justify-center gap-2">
                <Icon name="upload" className="w-5 h-5" />
                Upload File (.txt, .jpg, .png)
            </label>
            <input id="file-upload" type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="text/plain,image/jpeg,image/png" />
            {fileName && <p className="text-sm text-brand-accent mt-2 text-center">{fileName}</p>}
          </div>
          <button
            onClick={handleSummarize}
            disabled={isLoading || (!selectedDoc && !fileName)}
            className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-md hover:bg-brand-secondary transition-colors disabled:bg-neutral-600 disabled:cursor-not-allowed mt-auto"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Document'}
          </button>
        </div>
        
        <div className="lg:w-2/3 bg-neutral-900 rounded-lg p-6 flex flex-col overflow-y-auto">
          <h3 className="text-xl font-bold text-white mb-4">Extracted Key Facts</h3>
          {isLoading && <Loader message="Performing deep analysis..." />}
          {error && <p className="text-red-400">{error}</p>}
          {!isLoading && extractedFacts.length === 0 && !error && (
            <div className="text-center text-neutral-400 mt-8">
              <p>Key facts from your document will appear here.</p>
            </div>
          )}
          {extractedFacts.length > 0 && (
            <div>
              <ul className="space-y-2 list-disc list-inside text-neutral-200">
                  {extractedFacts.map((fact, index) => <li key={index}>{fact}</li>)}
              </ul>
               <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={handleIncorporate}
                  className="bg-brand-secondary text-white font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Icon name="brain" className="w-5 h-5" />
                  Incorporate into Case Brain
                </button>
                {showConfirmation && <p className="text-brand-accent">Facts added to Case Brain!</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};