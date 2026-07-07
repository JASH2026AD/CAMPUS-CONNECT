import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader, LoadingSkeleton } from '../components/Common';
import { Send, MessageCircle, Clock, Check, User } from 'lucide-react';
import api from '../api/axios';

export default function Chat() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeContact, setActiveContact] = useState(null); // contact user details
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const chatBottomRef = useRef(null);

  // Parse contactId query parameter from product details "Chat with Seller" redirection
  const queryParams = new URLSearchParams(location.search);
  const queryContactId = queryParams.get('contactId');

  const fetchConversations = async (targetContactId = null) => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res.data);

      // Handle query param redirection
      if (targetContactId) {
        const id = parseInt(targetContactId);
        
        // Find existing conversation in list
        const existing = res.data.find(c => c.contact.id === id);
        if (existing) {
          setActiveContact(existing.contact);
        } else {
          // If conversation doesn't exist yet, we must fetch the seller profile info
          const profileRes = await api.get(`/auth/profile/${id}`);
          const newContact = {
            id: profileRes.data.id,
            email: profileRes.data.email,
            profile: profileRes.data.profile
          };
          setActiveContact(newContact);
          
          // Prepend temporary conversation entry
          setConversations(prev => [
            {
              contact: newContact,
              lastMessage: 'Starting conversation...',
              createdAt: new Date().toISOString(),
              isRead: true
            },
            ...prev
          ]);
        }
        
        // Remove query parameters from URL so refreshes behave normally
        navigate('/chat', { replace: true });
      } else if (res.data.length > 0 && !activeContact) {
        // Auto select first conversation by default if no contact is selected
        setActiveContact(res.data[0].contact);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConvos(false);
    }
  };

  useEffect(() => {
    fetchConversations(queryContactId);
  }, [queryContactId]);

  // Load message logs when active contact changes
  useEffect(() => {
    if (activeContact) {
      setLoadingMessages(true);
      api.get(`/chat/messages/${activeContact.id}`)
        .then(res => {
          setMessages(res.data);
          // Mark this conversation as read locally in sidebar list
          setConversations(prev => prev.map(c => 
            c.contact.id === activeContact.id ? { ...c, isRead: true } : c
          ));
        })
        .catch(err => console.error('Error loading messages:', err))
        .finally(() => setLoadingMessages(false));
    }
  }, [activeContact]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    const content = newMessage.trim();
    setNewMessage('');

    try {
      const res = await api.post('/chat/messages', {
        receiverId: activeContact.id,
        content
      });

      // Append message locally
      setMessages(prev => [...prev, res.data]);

      // Update sidebar conversations list
      setConversations(prev => {
        const filtered = prev.filter(c => c.contact.id !== activeContact.id);
        return [
          {
            contact: activeContact,
            lastMessage: content,
            createdAt: new Date().toISOString(),
            isRead: true
          },
          ...filtered
        ];
      });
    } catch (err) {
      console.error('Error sending message:', err);
      showToast('Failed to send message.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 h-[85vh] text-left">
      <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
        <PageHeader title="Direct Messages" subtitle="Connect securely with marketplace sellers or skill exchange partners" icon={MessageCircle} />
      </div>

      <div className="flex-1 glass-card overflow-hidden flex divide-x divide-gray-200 dark:divide-slate-800 min-h-0 shadow-xs">
        
        {/* Left Side: Conversations list */}
        <div className="w-1/3 flex flex-col min-w-[240px] max-w-[340px] bg-slate-50/50 dark:bg-slate-900/10">
          <div className="p-4 border-b border-gray-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-gray-600 dark:text-slate-550 uppercase tracking-widest">Active Channels</span>
          </div>

          {loadingConvos ? (
            <div className="p-4"><LoadingSkeleton type="list" count={3} /></div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-600 flex flex-col items-center justify-center gap-2 flex-1">
              <MessageCircle className="w-8 h-8 text-gray-300" />
              <span>No conversations yet. Chat with sellers from the marketplace!</span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800/40">
              {conversations.map(conv => {
                const isActive = activeContact?.id === conv.contact.id;
                return (
                  <button
                    key={conv.contact.id}
                    onClick={() => setActiveContact(conv.contact)}
                    className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                      isActive 
                        ? 'bg-white dark:bg-slate-800/80 border-l-2 border-primary shadow-xs' 
                        : 'hover:bg-white/40 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <img
                      src={conv.contact.profile?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar'}
                      alt="Avatar"
                      className="w-10 h-10 rounded-xl bg-orange-50 object-cover flex-shrink-0 border border-gray-100 dark:border-slate-750"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-xs font-bold text-black dark:text-slate-100 truncate">
                          {conv.contact.profile?.name || 'Student'}
                        </h4>
                        <span className="text-[9px] text-gray-600 dark:text-slate-500 font-bold whitespace-nowrap ml-1">
                          {new Date(conv.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`text-[10px] truncate mt-0.5 ${!conv.isRead && !isActive ? 'font-black text-black dark:text-white' : 'text-gray-600 font-semibold'}`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Message pane */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900/10 justify-between min-w-0">
          {activeContact ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/20 dark:bg-slate-900/10">
                <div className="flex items-center gap-3">
                  <img
                    src={activeContact.profile?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar'}
                    alt="Avatar"
                    className="w-9 h-9 rounded-lg bg-orange-50 object-cover border border-gray-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-black dark:text-slate-100">{activeContact.profile?.name}</h4>
                    <p className="text-[10px] text-gray-405 font-semibold">{activeContact.profile?.major || 'General studies'}</p>
                  </div>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {loadingMessages ? (
                  <LoadingSkeleton type="chat" count={1} />
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-xs text-gray-405 flex-1 gap-1 font-semibold leading-relaxed">
                    <span>Start matching ideas!</span>
                    <span>Send a message to propose a handoff place or session schedule.</span>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 max-w-[75%] ${isMe ? 'self-end flex-row-reverse text-right' : 'self-start text-left'}`}
                      >
                        <div
                          className={`p-3 rounded-xl text-xs font-semibold leading-relaxed ${
                            isMe
                              ? 'bg-primary text-white rounded-tr-none shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-750 text-black dark:text-slate-200 rounded-tl-none'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <span className={`text-[8px] font-bold block mt-1.5 ${isMe ? 'text-white/60' : 'text-gray-600'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-slate-800 flex gap-2.5 bg-slate-50/20 dark:bg-slate-900/10">
                <input
                  type="text"
                  placeholder="Type message details..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-white placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-xs text-gray-600 flex-1 gap-2">
              <MessageCircle className="w-12 h-12 text-gray-300" />
              <span>Select an active student channel to view messages.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
