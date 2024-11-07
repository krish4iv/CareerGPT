import { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, generatingAnswer]);

  async function generateAnswer(e) {
    e.preventDefault();
    if (!question.trim()) return;
    
    setGeneratingAnswer(true);
    const currentQuestion = question;
    setQuestion(""); // Clear input immediately after sending
    
    // Add user question to chat history
    const newChat = { type: 'question', content: currentQuestion };
    setChatHistory(prev => [...prev, newChat]);
    
    // Add to search history with timestamp
    const historyItem = {
      id: Date.now(),
      question: currentQuestion,
      timestamp: new Date().toLocaleString()
    };
    setSearchHistory(prev => [...prev, historyItem]);
    
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${
          import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT
        }`,
        method: "post",
        data: {
          contents: [{ 
            parts: [{ 
              text: `As a career and study roadmap advisor, please help with: ${question}. Focus on career guidance, learning paths, and professional development.` 
            }] 
          }],
        },
      });

      const aiResponse = response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setChatHistory(prev => [...prev, { type: 'answer', content: aiResponse }]);
      setAnswer(aiResponse);
    } catch (error) {
      console.log(error);
      setAnswer("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer(false);
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-blue-50 to-blue-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-blue-600 mb-4">Search History</h2>
        <div className="space-y-2">
          {searchHistory.map((item) => (
            <div
              key={item.id}
              className="p-2 hover:bg-blue-50 rounded cursor-pointer"
              onClick={() => {
                setSelectedChat(item.id);
                // You can implement chat restoration here
              }}
            >
              <p className="text-sm font-medium truncate">{item.question}</p>
              <p className="text-xs text-gray-500">{item.timestamp}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 h-full">
        <div className="h-full max-w-4xl mx-auto flex flex-col p-3">
          {/* Fixed Header */}
          <header className="text-center py-4">
            <a href="https://github.com/Vishesh-Pandey/chat-ai" 
               target="_blank" 
               rel="noopener noreferrer"
               className="block">
              <h1 className="text-4xl font-bold text-blue-500 hover:text-blue-600 transition-colors">
                CareerGPT
              </h1>
            </a>
          </header>

          {/* Scrollable Chat Container */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto mb-4 rounded-lg bg-white shadow-lg p-4 hide-scrollbar"
          >
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="bg-blue-50 rounded-xl p-8 max-w-2xl">
                  <h2 className="text-2xl font-bold text-blue-600 mb-4">Welcome to Career Advisor AI! 🎓</h2>
                  <p className="text-gray-600 mb-4">
                    I'm here to help guide your career journey. Ask me about:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <span className="text-blue-500">🎯</span> Career Paths
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <span className="text-blue-500">📚</span> Study Materials
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <span className="text-blue-500">🛣️</span> Learning Roadmaps
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <span className="text-blue-500">💼</span> Industry Insights
                    </div>
                  </div>
                  <p className="text-gray-500 mt-6 text-sm">
                    Type your career-related questions below!
                  </p>
                </div>
              </div>
            ) : (
              <>
                {chatHistory.map((chat, index) => (
                  <div key={index} className={`mb-4 ${chat.type === 'question' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-[80%] p-3 rounded-lg overflow-auto hide-scrollbar ${
                      chat.type === 'question' 
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}>
                      <ReactMarkdown className="overflow-auto hide-scrollbar">{chat.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </>
            )}
            {generatingAnswer && (
              <div className="text-left">
                <div className="inline-block bg-gray-100 p-3 rounded-lg animate-pulse">
                  Analyzing your career query...
                </div>
              </div>
            )}
          </div>

          {/* Fixed Input Form */}
          <form onSubmit={generateAnswer} className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex gap-2">
              <textarea
                required
                className="flex-1 border border-gray-300 rounded p-3 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about career paths, study materials, or learning roadmaps..."
                rows="2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    generateAnswer(e);
                  }
                }}
              ></textarea>
              <button
                type="submit"
                className={`px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${
                  generatingAnswer ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={generatingAnswer}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
