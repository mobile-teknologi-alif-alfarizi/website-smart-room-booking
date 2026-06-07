import { useState, useEffect, useRef } from 'react';
import { MdSend, MdDelete, MdSearch, MdMoreVert, MdClose, MdAdd, MdPerson, MdChat, MdChatBubble } from 'react-icons/md';
import DashboardLayout from '@/layouts/DashboardLayout';
import { messageApi } from '@/api/messageApi';
import { userApi } from '@/api/userApi';
import { initializeWebSocket, subscribeToChat, unsubscribeFromChat } from '@/utils/websocket';
import { formatDistanceToNow, format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function ChatManagement() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [followUpMessages, setFollowUpMessages] = useState([]);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch conversations on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        initializeWebSocket(token);
        setWsConnected(true);
      } catch (err) {
        console.error('Failed to initialize WebSocket:', err);
      }
    }

    // Fetch initial data
    fetchConversations();
    fetchUnreadCount();
    fetchFollowUpMessages();

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Subscribe to chat when selected conversation changes
  useEffect(() => {
    if (!selectedConversation || !wsConnected) return;

    const unsubscribe = subscribeToChat(currentUser.id, {
      onMessageSent: (data) => {
        // Only add if it's from the current conversation
        if (
          (String(data.sent_id) === String(selectedConversation.user_id) && String(data.receive_id) === String(currentUser.id)) ||
          (String(data.sent_id) === String(currentUser.id) && String(data.receive_id) === String(selectedConversation.user_id))
        ) {
          setMessages((prev) => [...prev, data]);
        }
        // Refresh conversations to update last message
        fetchConversations();
      },
      onMessageSeen: (data) => {
        // Update message seen status
        setMessages((prev) =>
          prev.map((msg) =>
            msg.uuid === data.uuid ? { ...msg, status_seen: true, seen_at: data.seen_at } : msg
          )
        );
      },
      onMessageDeleted: (data) => {
        // Remove deleted message
        setMessages((prev) => prev.filter((msg) => msg.uuid !== data.uuid));
      },
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [selectedConversation, wsConnected, currentUser.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messageApi.getConversations();
      const data = response.data.data || [];
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.response?.data?.message || 'Gagal mengambil percakapan');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await messageApi.getUnreadCount();
      setUnreadCount(response.data.data?.unread_count || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchFollowUpMessages = async () => {
    try {
      const response = await messageApi.getFollowUpMessages();
      const data = response.data.data || [];
      setFollowUpMessages(data);
    } catch (err) {
      console.error('Error fetching follow-up messages:', err);
    }
  };

  const handleSelectConversation = async (conversation) => {
    try {
      setSelectedConversation(conversation);
      setLoadingMessages(true);
      setNewMessage('');

      // Fetch full conversation
      const response = await messageApi.getConversation(conversation.user_id);
      setMessages(response.data.data || []);

      // Mark all as seen
      await messageApi.markConversationAsSeen(conversation.user_id);
      fetchConversations();
      fetchUnreadCount();
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError(err.response?.data?.message || 'Gagal mengambil percakapan');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSendingMessage(true);
      setError(null);

      await messageApi.sendMessage({
        receive_id: selectedConversation.user_id,
        message: newMessage.trim(),
      });

      setNewMessage('');
      setSuccessMessage('Pesan berhasil dikirim');
      // Refresh conversation after sending
      const response = await messageApi.getConversation(selectedConversation.user_id);
      setMessages(response.data.data || []);
      fetchConversations();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim pesan');
      console.error('Error sending message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pesan ini?')) return;

    try {
      setError(null);
      await messageApi.deleteMessage(messageId);
      setSuccessMessage('Pesan berhasil dihapus');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus pesan');
      console.error('Error deleting message:', err);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.nomor_induk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch all users for new chat modal
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await userApi.getAllUsers();
      const data = response.data.data || response.data || [];
      // Exclude current user from the list
      setAllUsers(data.filter((u) => String(u.id) !== String(currentUser.id)));
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Gagal mengambil daftar pengguna');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenNewChat = () => {
    setShowNewChatModal(true);
    setUserSearchQuery('');
    setUserRoleFilter('all');
    fetchUsers();
  };

  const handleStartNewChat = async (user) => {
    // Check if conversation already exists
    const existingConv = conversations.find((c) => String(c.user_id) === String(user.id));
    if (existingConv) {
      handleSelectConversation(existingConv);
    } else {
      // Create a virtual conversation object to open the chat area
      setSelectedConversation({
        user_id: user.id,
        user: {
          name: user.name,
          nomor_induk: user.nomor_induk,
          role: user.role,
        },
        last_message: '',
        last_message_at: new Date().toISOString(),
        unread_count: 0,
      });
      setMessages([]);
    }
    setShowNewChatModal(false);
  };

  // Filtered users for new chat modal
  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.nomor_induk?.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Helper: get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper: generate consistent color from name
  const getAvatarColor = (name) => {
    const colors = [
      'from-violet-500 to-purple-600',
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-teal-500',
      'from-orange-400 to-rose-500',
      'from-pink-500 to-fuchsia-500',
      'from-indigo-500 to-blue-600',
      'from-amber-400 to-orange-500',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <DashboardLayout>
      <div
        className="flex gap-0 overflow-hidden rounded-2xl shadow-xl border border-gray-200/60"
        style={{ height: 'calc(100vh - 7rem)' }}
      >
        {/* Conversations List */}
        <div className="w-96 bg-white flex flex-col border-r border-gray-200 flex-shrink-0">
          {/* Sidebar Header */}
          <div
            className="p-5 flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MdChatBubble size={24} className="text-white/90" />
                <h2 className="text-xl font-bold text-white tracking-tight">Chat</h2>
              </div>
              <button
                onClick={handleOpenNewChat}
                className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-200 flex items-center gap-1.5 text-sm font-medium border border-white/20"
                title="Chat Baru"
              >
                <MdAdd size={18} />
                Baru
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
              <input
                type="text"
                placeholder="Cari percakapan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/25 focus:border-white/40 transition-all duration-200 text-sm"
              />
            </div>

            {/* Status badges row */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs text-white/80">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-red-400'}`}
                ></span>
                {wsConnected ? 'Online' : 'Offline'}
              </div>
              {unreadCount > 0 && (
                <div className="px-2.5 py-1 bg-white/25 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                  {unreadCount} belum dibaca
                </div>
              )}
            </div>
          </div>

          {/* Follow-up Badge */}
          {followUpMessages.length > 0 && (
            <button
              onClick={() => setShowFollowUpModal(true)}
              className="mx-3 mt-3 px-3 py-2.5 bg-gradient-to-r from-red-50 to-orange-50 text-red-600 rounded-xl text-sm font-medium hover:from-red-100 hover:to-orange-100 transition-all duration-200 flex items-center gap-2 border border-red-100"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              {followUpMessages.length} Pesan perlu follow-up
            </button>
          )}

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-8 h-8 border-3 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400 mt-3">Memuat percakapan...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <MdChat size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm">Belum ada percakapan</p>
                <button
                  onClick={handleOpenNewChat}
                  className="mt-3 text-sm text-purple-500 hover:text-purple-600 font-medium"
                >
                  Mulai chat baru →
                </button>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.user_id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`w-full px-4 py-3.5 flex items-center gap-3 text-left transition-all duration-150 border-b border-gray-50 hover:bg-purple-50/50 ${
                    String(selectedConversation?.user_id) === String(conversation.user_id)
                      ? 'bg-purple-50 border-l-4 border-l-purple-500'
                      : 'border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarColor(
                      conversation.user.name
                    )} flex items-center justify-center flex-shrink-0 shadow-sm`}
                  >
                    <span className="text-white text-sm font-bold">
                      {getInitials(conversation.user.name)}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-semibold text-gray-900 text-sm truncate pr-2">
                        {conversation.user.name}
                      </h3>
                      <span className="text-[11px] text-gray-400 flex-shrink-0">
                        {formatDistanceToNow(new Date(conversation.last_message_at), {
                          addSuffix: false,
                          locale: id,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 truncate pr-2">{conversation.last_message}</p>
                      {conversation.unread_count > 0 && (
                        <span className="bg-purple-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div
                className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b border-gray-100"
                style={{ background: 'linear-gradient(to right, #f8f7ff, #ffffff)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(
                      selectedConversation.user.name
                    )} flex items-center justify-center shadow-sm`}
                  >
                    <span className="text-white text-sm font-bold">
                      {getInitials(selectedConversation.user.name)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {selectedConversation.user.name}
                    </h3>
                    <p className="text-xs text-gray-400">{selectedConversation.user.nomor_induk}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MdClose size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto px-6 py-4"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 80%, rgba(108,92,231,0.03) 0%, transparent 50%), 
                                    radial-gradient(circle at 80% 20%, rgba(162,155,254,0.03) 0%, transparent 50%)`,
                  backgroundColor: '#fafafa',
                }}
              >
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="inline-block w-8 h-8 border-3 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-400 mt-3">Memuat pesan...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-purple-50 rounded-full flex items-center justify-center">
                        <MdSend size={32} className="text-purple-300 -rotate-45" />
                      </div>
                      <p className="text-gray-400 text-sm font-medium mb-1">Belum ada pesan</p>
                      <p className="text-gray-300 text-xs">Kirim pesan pertama untuk memulai percakapan</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isMine = String(message.sent_id) === String(currentUser.id);
                    const showDate =
                      index === 0 ||
                      format(new Date(message.created_at), 'yyyy-MM-dd') !==
                        format(new Date(messages[index - 1].created_at), 'yyyy-MM-dd');

                    return (
                      <div key={message.uuid}>
                        {/* Date separator */}
                        {showDate && (
                          <div className="flex items-center justify-center my-4">
                            <span className="px-3 py-1 bg-white text-[11px] text-gray-400 rounded-full shadow-sm border border-gray-100 font-medium">
                              {format(new Date(message.created_at), 'dd MMMM yyyy', { locale: id })}
                            </span>
                          </div>
                        )}

                        <div className={`mb-3 flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
                          <div className="flex items-end gap-1.5 max-w-[70%]">
                            {/* Delete button (my messages only) */}
                            {isMine && (
                              <button
                                onClick={() => handleDeleteMessage(message.uuid)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-full mb-1 flex-shrink-0"
                                title="Hapus pesan"
                              >
                                <MdDelete size={14} className="text-red-400" />
                              </button>
                            )}
                            <div
                              className={`px-4 py-2.5 shadow-sm ${
                                isMine
                                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl rounded-br-md'
                                  : 'bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-100'
                              }`}
                            >
                              <p className="break-words text-sm leading-relaxed">{message.message}</p>
                              <div
                                className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
                                  isMine ? 'text-white/60' : 'text-gray-400'
                                }`}
                              >
                                <span>{format(new Date(message.created_at), 'HH:mm')}</span>
                                {isMine && (
                                  <span className="text-[11px]">{message.status_seen ? '✓✓' : '✓'}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
                {error && (
                  <div className="mb-2 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                      <MdClose size={14} />
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !sendingMessage && handleSendMessage()}
                    placeholder="Ketik pesan..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-300 focus:bg-white transition-all duration-200 text-sm resize-none"
                    disabled={sendingMessage}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl hover:from-purple-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0"
                  >
                    <MdSend size={20} className={sendingMessage ? 'animate-pulse' : ''} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(108,92,231,0.08) 0%, rgba(162,155,254,0.12) 100%)',
                  }}
                >
                  <MdChatBubble size={48} className="text-purple-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Pilih Percakapan</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-xs">
                  Pilih percakapan dari daftar di samping atau mulai percakapan baru
                </p>
                <button
                  onClick={handleOpenNewChat}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
                >
                  <MdAdd size={18} />
                  Mulai Chat Baru
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Follow-up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[70vh] overflow-y-auto shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-500 text-sm">🔔</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Follow-up</h3>
              </div>
              <button
                onClick={() => setShowFollowUpModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MdClose size={20} className="text-gray-400" />
              </button>
            </div>

            {followUpMessages.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">Tidak ada pesan yang memerlukan follow-up</p>
            ) : (
              <div className="space-y-3">
                {followUpMessages.map((message) => (
                  <div key={message.uuid} className="p-4 bg-red-50/50 border border-red-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(
                          message.sender.name
                        )} flex items-center justify-center`}
                      >
                        <span className="text-white text-[10px] font-bold">
                          {getInitials(message.sender.name)}
                        </span>
                      </div>
                      <span className="font-semibold text-sm text-gray-800">{message.sender.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">"{message.message}"</p>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-gray-400">
                        {format(new Date(message.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                      </p>
                      <button
                        onClick={() => {
                          handleSelectConversation({
                            user_id: message.sent_id,
                            user: message.sender,
                            last_message: message.message,
                            last_message_at: message.created_at,
                            unread_count: 1,
                          });
                          setShowFollowUpModal(false);
                        }}
                        className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
                      >
                        Balas →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col mx-4 overflow-hidden">
            {/* Modal Header */}
            <div
              className="px-6 py-4 flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MdAdd size={22} className="text-white/90" />
                  <h3 className="text-lg font-bold text-white">Chat Baru</h3>
                </div>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                >
                  <MdClose size={20} className="text-white/80" />
                </button>
              </div>

              {/* Search & Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
                  <input
                    type="text"
                    placeholder="Cari nama atau nomor induk..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/25 transition-all text-sm"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-2.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:bg-white/25 transition-all cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="all" className="text-gray-900">Semua</option>
                  <option value="dosen" className="text-gray-900">Dosen</option>
                  <option value="mahasiswa" className="text-gray-900">Mahasiswa</option>
                </select>
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto">
              {loadingUsers ? (
                <div className="p-10 text-center">
                  <div className="inline-block w-8 h-8 border-3 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-400 mt-3">Memuat daftar pengguna...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <MdPerson size={28} className="text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm">
                    {userSearchQuery || userRoleFilter !== 'all'
                      ? 'Tidak ada pengguna yang cocok'
                      : 'Tidak ada pengguna tersedia'}
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleStartNewChat(user)}
                      className="w-full px-5 py-3 flex items-center gap-3 hover:bg-purple-50/60 transition-all duration-150 text-left"
                    >
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(
                          user.name
                        )} flex items-center justify-center flex-shrink-0 shadow-sm`}
                      >
                        <span className="text-white text-xs font-bold">{getInitials(user.name)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.nomor_induk}</p>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-[11px] rounded-full font-semibold ${
                          user.role === 'dosen'
                            ? 'bg-blue-50 text-blue-600'
                            : user.role === 'mahasiswa'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {user.role === 'dosen' ? 'Dosen' : user.role === 'mahasiswa' ? 'Mahasiswa' : user.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 px-5 py-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 text-sm font-medium flex items-center gap-2 animate-slide-up z-50">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {successMessage}
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #d4d4d8;
          border-radius: 999px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #a1a1aa;
        }
      `}</style>
    </DashboardLayout>
  );
}
