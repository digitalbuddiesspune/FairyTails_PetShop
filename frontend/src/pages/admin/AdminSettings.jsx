import { useState, useEffect } from 'react';
import { type } from '../../styles/typography';

const AdminSettings = () => {
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        const adminData = localStorage.getItem('admin');
        if (adminData) {
            setAdmin(JSON.parse(adminData));
        }
    }, []);

    return (
        <div className="animate-fadeIn">
            <h2 className={`${type.h2} text-gray-900 mb-6`}>Settings</h2>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-lg">
                <h3 className={`${type.label} text-gray-800 mb-4`}>Admin Profile</h3>
                <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className={`${type.caption} text-gray-500 uppercase`}>Email</label>
                        <p className={`${type.label} text-gray-900`}>{admin?.email || 'N/A'}</p>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(8px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default AdminSettings;
