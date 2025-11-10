import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateText } from './services/geminiService';
import { Spinner } from './components/Spinner';

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
);

const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
);

const VideoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

type MediaState = {
    data: string;
    mimeType: string;
};

const App: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [media, setMedia] = useState<MediaState | null>(null);
    const [response, setResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isApiKeyMissing = !process.env.API_KEY;

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [prompt]);
    
    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // Expected format: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD..."
            const mimeType = result.substring(5, result.indexOf(';'));
            const data = result.substring(result.indexOf(',') + 1);
            setMedia({ data, mimeType });
        };
        reader.readAsDataURL(file);
    };

    const handleMediaRemove = () => {
        setMedia(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUploadClick = (accept: string) => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = accept;
            fileInputRef.current.click();
        }
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!prompt.trim() && !media) || isLoading || isApiKeyMissing) return;

        setIsLoading(true);
        setError(null);
        setResponse('');

        try {
            const result = await generateText(prompt, media);
            setResponse(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, media, isLoading, isApiKeyMissing]);
    

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-slate-900 to-black">
            <div className="w-full max-w-3xl mx-auto flex flex-col h-[90vh]">
                <header className="text-center mb-8 flex-shrink-0">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                        Gemini Prompt Kiosk
                    </h1>
                    <p className="text-gray-400 mt-2">Your direct interface to Google's Gemini AI</p>
                </header>
                
                {isApiKeyMissing && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                        <strong className="font-bold">Configuration Error:</strong>
                        <span className="block sm:inline"> GOOGLE_API_KEY is not set. Please configure your environment secrets.</span>
                    </div>
                )}

                <main className="flex-grow flex flex-col bg-slate-800/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm border border-slate-700">
                    <div className="flex-grow p-6 overflow-y-auto">
                        {isLoading && (
                            <div className="flex justify-center items-center h-full">
                                <Spinner />
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-500/20 text-red-300 p-4 rounded-lg border border-red-500/50">
                                <p className="font-semibold">An Error Occurred:</p>
                                <p>{error}</p>
                            </div>
                        )}
                        {response && !isLoading && (
                            <div className="prose prose-invert prose-p:text-gray-200 prose-headings:text-white max-w-none whitespace-pre-wrap animate-fade-in">
                                {response}
                            </div>
                        )}
                         {!response && !isLoading && !error && !isApiKeyMissing && (
                            <div className="flex justify-center items-center h-full text-gray-500">
                                <p>The AI's response will appear here.</p>
                            </div>
                        )}
                    </div>

                    <footer className="p-4 bg-slate-900/70 border-t border-slate-700 flex-shrink-0">
                        <div className="w-full">
                           {media && (
                                <div className="mb-4 relative w-48 h-36 rounded-lg overflow-hidden border-2 border-slate-600 group">
                                    {media.mimeType.startsWith('image/') ? (
                                        <img src={`data:${media.mimeType};base64,${media.data}`} alt="Media preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <video src={`data:${media.mimeType};base64,${media.data}`} muted autoPlay loop controls={false} className="w-full h-full object-cover" />
                                    )}
                                    <button
                                        onClick={handleMediaRemove}
                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                        aria-label="Remove media"
                                    >
                                        <CloseIcon />
                                    </button>
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="flex items-end gap-2.5">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleMediaChange}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleUploadClick('image/*')}
                                    disabled={isLoading || isApiKeyMissing || !!media}
                                    className="p-3 rounded-lg text-gray-400 bg-slate-800 hover:bg-indigo-600 hover:text-white disabled:bg-slate-800 disabled:text-gray-600 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-label="Upload image"
                                >
                                    <ImageIcon />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleUploadClick('video/*')}
                                    disabled={isLoading || isApiKeyMissing || !!media}
                                    className="p-3 rounded-lg text-gray-400 bg-slate-800 hover:bg-indigo-600 hover:text-white disabled:bg-slate-800 disabled:text-gray-600 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-label="Upload video"
                                >
                                    <VideoIcon />
                                </button>
                                <div className="relative flex-grow">
                                    <textarea
                                        ref={textareaRef}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder={isApiKeyMissing ? "API Key not configured" : "Enter a prompt or upload an image/video..."}
                                        className="w-full bg-slate-800 text-gray-200 placeholder-gray-500 rounded-lg p-4 pr-16 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow duration-300 disabled:opacity-50"
                                        rows={1}
                                        disabled={isLoading || isApiKeyMissing}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSubmit(e as any);
                                            }
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading || (!prompt.trim() && !media) || isApiKeyMissing}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 bg-slate-700 hover:bg-indigo-600 hover:text-white disabled:bg-slate-800 disabled:text-gray-600 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <SendIcon />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default App;