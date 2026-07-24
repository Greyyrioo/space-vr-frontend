import React, { useState } from 'react';
import BookingForm from './components/BookingForm';
import Receipt from './components/Receipt';
import Admin from './components/Admin';

export default function App() {
  const [activeBooking, setActiveBooking] = useState(null);
  const [view, setView] = useState('customer'); // 'customer' or 'admin'

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
      <header className="max-w-4xl mx-auto mb-8 text-center space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-cyan-400">SPACE VR BENIN</h1>
        <p className="text-slate-400 text-sm">Premium Gaming & Virtual Reality Center</p>
        
        {/* Portal Switcher */}
        <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl space-x-1 text-xs font-semibold">
          <button
            onClick={() => setView('customer')}
            className={`px-4 py-1.5 rounded-lg transition ${
              view === 'customer' 
                ? 'bg-cyan-500 text-slate-950 font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Booking Portal
          </button>
          <button
            onClick={() => setView('admin')}
            className={`px-4 py-1.5 rounded-lg transition ${
              view === 'admin' 
                ? 'bg-cyan-500 text-slate-950 font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Admin Control Center
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {view === 'admin' ? (
          <Admin />
        ) : !activeBooking ? (
          <BookingForm onBookingSuccess={(booking) => setActiveBooking(booking)} />
        ) : (
          <Receipt booking={activeBooking} onReset={() => setActiveBooking(null)} />
        )}
      </main>
    </div>
  );
}
