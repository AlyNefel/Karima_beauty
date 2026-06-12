import React from 'react';
import { MessageSquare, Sparkles, X, Send, User, ChevronDown } from 'lucide-react';
import { ChatMessage, ChatSession } from '../types.ts';

interface SupportChatWidgetProps {
  onSendMessage: (sessionId: string, text: string) => Promise<ChatSession>;
  chats: ChatSession[];
}

export default function SupportChatWidget({ onSendMessage, chats }: SupportChatWidgetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [userName, setUserName] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');
  const [isLogged, setIsLogged] = React.useState(false);
  
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [inputText, setInputText] = React.useState('');
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  // Auto-scroll helper
  const chatBottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Synchronize message history from backend session when user resumes
  React.useEffect(() => {
    if (sessionId) {
      const activeSession = chats.find(c => c.sessionId === sessionId);
      if (activeSession) {
        setMessages(activeSession.messages);
      }
    }
  }, [chats, sessionId]);

  const handleStartChatSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/support/init-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, userEmail })
      });
      const data: ChatSession = await response.json();
      setSessionId(data.sessionId);
      setMessages(data.messages);
      setIsLogged(true);
    } catch (err) {
      console.error('Error starting chat session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !sessionId || loading) return;

    const currentText = inputText;
    setInputText('');
    setLoading(true);

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `msg-${Date.now()}-temp-user`,
      sender: 'user',
      text: currentText,
      date: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const updatedSession = await onSendMessage(sessionId, currentText);
      setMessages(updatedSession.messages);
    } catch (err) {
      console.error('Failed to receive AI response:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* Floating Action Circle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#1A1A1A] hover:bg-[#D4AF37] text-white p-4 rounded-none border border-[#E5E5E1] flex items-center justify-center cursor-pointer transition-all hover:scale-105 group relative"
          title="Diagnostic Peau & Routine Cosmetique IA"
        >
          <Sparkles className="animate-spin text-[#D4AF37] shrink-0 absolute -top-1 -right-0.5" size={10} />
          <MessageSquare size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out text-xs font-semibold uppercase tracking-widest whitespace-nowrap pl-0 group-hover:pl-2">
            Conseillère IA
          </span>
        </button>
      )}

      {/* Chat Window Frame */}
      {isOpen && (
        <div className="w-[330px] sm:w-[350px] h-[480px] bg-white border border-[#E5E5E1] flex flex-col overflow-hidden animate-scaleUp">
          
          {/* Header */}
          <div className="bg-[#1A1A1A] text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-8 h-8 bg-white border border-[#E5E5E1] flex items-center justify-center">
                  <Sparkles size={14} className="text-[#D4AF37] animate-pulse" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">KARIMA BEAUTY AI</h4>
                <p className="text-[9px] text-[#9E9E9E]">Beauty & Dermo Consultant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 transition-colors cursor-pointer text-[#9E9E9E] hover:text-white"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Form / Initial Login screen to gather user's name */}
          {!isLogged ? (
            <div className="flex-1 p-6 flex flex-col justify-center text-left bg-[#FAF9F6] space-y-4">
              <div className="text-center space-y-1 mb-2">
                <h5 className="font-serif text-[#1A1A1A] text-sm font-semibold tracking-wider">Diagnostic de Peau IA</h5>
                <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">Bénéficiez d'une recommandation sur-mesure.</p>
              </div>

              <form onSubmit={handleStartChatSession} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[#1A1A1A] font-bold uppercase tracking-wider mb-1 text-[10px]">Votre Prénom *</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Ex: Sarah"
                    className="w-full px-3 py-2 border border-[#E5E5E1] bg-white focus:outline-none focus:border-[#1A1A1A] rounded-none text-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-[#1A1A1A] font-bold uppercase tracking-wider mb-1 text-[10px]">Votre Email (Optionnel)</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full px-3 py-2 border border-[#E5E5E1] bg-white focus:outline-none focus:border-[#1A1A1A] rounded-none text-[#1A1A1A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#1A1A1A] text-white text-xs font-bold tracking-widest uppercase rounded-none hover:bg-[#D4AF37] transition-all cursor-pointer"
                >
                  {loading ? 'Connexion en cours...' : 'Démarrer la Discussion'}
                </button>
              </form>
            </div>
          ) : (
            // Chat Messages History window
            <div className="flex-1 flex flex-col justify-between bg-white min-h-0">
              
              {/* Message Streams */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF9F6]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`p-3 text-xs text-left ${
                        m.sender === 'user'
                          ? 'bg-[#1A1A1A] text-white rounded-none border border-[#1A1A1A]'
                          : 'bg-white text-[#1A1A1A] border border-[#E5E5E1] rounded-none'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed font-sans text-[11px]">
                        {m.text}
                      </p>
                      <span className={`block text-[8px] opacity-60 text-right mt-1 font-mono ${m.sender === 'user' ? 'text-gray-300' : 'text-[#6B6B6B]'}`}>
                        {new Date(m.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* AI is thinking indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-white border border-[#E5E5E1] text-[#9E9E9E] rounded-none text-xs flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                
                <div ref={chatBottomRef} />
              </div>

              {/* Message Typing Form */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#E5E5E1] flex space-x-2">
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Posez votre question (Ex: acné Vif)..."
                  className="flex-1 px-4 py-2 border border-[#E5E5E1] text-xs rounded-none focus:outline-none focus:border-[#1A1A1A] disabled:opacity-50 text-[#1A1A1A] bg-white"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#1A1A1A] hover:bg-[#D4AF37] text-white p-2 px-3 rounded-none transition-colors flex items-center justify-center cursor-pointer disabled:opacity-30"
                >
                  <Send size={12} />
                </button>
              </form>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
