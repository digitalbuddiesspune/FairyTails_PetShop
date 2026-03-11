import { useNavigate } from 'react-router-dom';

const LoginRequiredModal = ({ isOpen, onClose, message = "You are not logged in. Please log in first." }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleOk = () => {
    onClose();
    navigate('/signin');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-popIn" onClick={(e) => e.stopPropagation()}>
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Login Required</h2>
        <p className="text-gray-600 text-sm mb-6">{message}</p>
        <button
          onClick={handleOk}
          className="w-full bg-[#2f5a87] hover:bg-[#1a4a7a] text-white font-bold py-3 rounded-xl transition-all text-sm"
        >
          OK
        </button>
      </div>
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-popIn {
          animation: popIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoginRequiredModal;
