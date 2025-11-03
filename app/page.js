'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef, useState } from 'react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  const messagesEndRef = useRef(null);
  const [resumeText, setResumeText] = useState(
    'Your resume preview will appear here once the assistant generates it.'
  );
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Detect client for copy/download buttons
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Extract resume text from conversation
  useEffect(() => {
    const fullConversation = messages.map(m => m.content).join('\n');
    const resumeStartIndex = fullConversation.indexOf('[RESUME_START]');
    const resumeEndIndex = fullConversation.indexOf('[RESUME_END]');

    if (resumeStartIndex !== -1 && resumeEndIndex !== -1) {
      const extractedResume = fullConversation
        .substring(resumeStartIndex + '[RESUME_START]'.length, resumeEndIndex)
        .trim();
      setResumeText(extractedResume);
    }
  }, [messages]);

  // Copy resume to clipboard
  const handleCopy = () => {
    if (
      resumeText &&
      resumeText !==
        'Your resume preview will appear here once the assistant generates it.'
    ) {
      navigator.clipboard.writeText(resumeText).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  // Download resume as PDF
  const handleDownloadPdf = async () => {
    if (
      resumeText &&
      resumeText !==
        'Your resume preview will appear here once the assistant generates it.'
    ) {
      setIsDownloading(true);
      try {
        const response = await fetch('/api/download-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText }),
        });

        if (!response.ok) throw new Error('PDF generation failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (error) {
        console.error('Error downloading PDF:', error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  return (
    <div className="flex flex-row w-full h-screen">
      {/* Chat Column (Left Side) */}
      <div className="flex flex-col w-1/2 h-full bg-white border-r border-gray-200">
        <div className="flex-grow overflow-auto p-6 space-y-4">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex message-appear ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`chat-bubble ${m.role === 'user' ? 'user' : 'assistant'}`}
              >
                <strong>{m.role === 'user' ? 'You' : 'Assistant'}: </strong>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start message-appear">
              <div className="chat-bubble assistant">
                <strong>Assistant: </strong>
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chat-input-form p-4 border-t border-gray-200">
          <input
            className="chat-input w-full border rounded px-3 py-2"
            value={input}
            placeholder="Say something to start..."
            onChange={handleInputChange}
          />
        </form>
      </div>

      {/* Resume Preview Column (Right Side) */}
      <div className="w-1/2 h-full p-8 overflow-y-auto bg-gray-50">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-bold">Resume Preview</h2>
          {isClient && (
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className={`btn ${isCopied ? 'btn-success' : 'btn-primary'}`}
                disabled={isCopied}
              >
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownloadPdf}
                className={`btn ${isDownloading ? 'btn-secondary' : 'btn-success'}`}
                disabled={isDownloading}
              >
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </button>
            </div>
          )}
        </div>
        <pre className="resume-preview whitespace-pre-wrap font-sans text-sm">
          {resumeText}
        </pre>
      </div>
    </div>
  );
}
