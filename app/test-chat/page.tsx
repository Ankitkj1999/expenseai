'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatTestPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('0:')) {
              const content = line.slice(2).replace(/^"|"$/g, '');
              assistantContent += content;
            }
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent || 'No response received',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>ExpenseAI Chat Test</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Test the AI integration with natural language queries
      </p>

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          maxHeight: '500px',
          overflowY: 'auto',
          backgroundColor: '#f9f9f9',
        }}
      >
        {messages.length === 0 && (
          <div style={{ color: '#999', textAlign: 'center', padding: '40px' }}>
            <p>No messages yet. Try asking:</p>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
              <li>• &quot;What&apos;s my spending this month?&quot;</li>
              <li>• &quot;I spent $50 on groceries&quot;</li>
              <li>• &quot;Show me my budget status&quot;</li>
              <li>• &quot;Where is my money going?&quot;</li>
            </ul>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              marginBottom: '15px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: m.role === 'user' ? '#e3f2fd' : '#fff',
              border: m.role === 'user' ? '1px solid #2196f3' : '1px solid #ddd',
            }}
          >
            <div
              style={{
                fontWeight: 'bold',
                marginBottom: '5px',
                color: m.role === 'user' ? '#1976d2' : '#333',
              }}
            >
              {m.role === 'user' ? 'You' : 'AI Assistant'}
            </div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
          </div>
        ))}

        {isLoading && (
          <div style={{ textAlign: 'center', color: '#666', padding: '10px' }}>
            AI is thinking...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about your expenses..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px',
          }}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            backgroundColor: isLoading ? '#ccc' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
        }}
      >
        <strong>Note:</strong> Make sure you&apos;re logged in and have some accounts/categories set up
        before testing transactions.
      </div>
    </div>
  );
}
