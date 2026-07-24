import React, { useState } from 'react';
import { markBookingPaid } from '../api';

export default function Receipt({ booking = {}, onReset }) {
  const [status, setStatus] = useState(booking?.status || 'pending_payment');
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  const bank = {
    bank_name: "OPay",
    account_name: "Gabriel Osaghae",
    account_number: "8167059132",
  };

  const handleCopyAccount = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(bank.account_number);
      } else {
        // Fallback for non-HTTPS or legacy environments
        const textArea = document.createElement('textarea');
        textArea.value = bank.account_number;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy account number:", err);
    }
  };

  const handleConfirmPaid = async () => {
    if (!booking?.ref_id) return;
    setUpdating(true);
    try {
      const res = await markBookingPaid(booking.ref_id);
      if (res?.data?.success && res?.data?.booking?.status) {
        setStatus(res.data.booking.status);
      }
    } catch (err) {
      console.error("Failed to update payment status", err);
    } finally {
      setUpdating(false);
    }
  };

  const formattedStatus = (status || 'pending_payment').replace(/_/g, ' ');

  return (
    <div className="max-w-xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-6">
      {/* Header Badge */}
      <div className="text-center space-y-2">
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
          status === 'confirmed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
          status === 'awaiting_verification' ? 'bg-amber-950 text-amber-400 border border-amber-500/30' :
          'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
        }`}>
          {formattedStatus}
        </span>
        <h2 className="text-3xl font-extrabold text-white">Booking Receipt</h2>
        <p className="text-sm font-mono text-cyan-400 font-semibold">{booking?.ref_id || 'N/A'}</p>
      </div>

      {/* Payment Bank Details */}
      <div className="p-4 bg-slate-950 border border-cyan-500/20 rounded-xl space-y-3">
        <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Bank Transfer Instructions</p>
        
        <div className="space-y-1 text-sm text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">Bank:</span>
            <span className="font-semibold text-white">{bank.bank_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Account Name:</span>
            <span className="font-semibold text-white">{bank.account_name}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-slate-500">Account No:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-white text-base">{bank.account_number}</span>
              <button
                onClick={handleCopyAccount}
                className="px-2 py-0.5 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded transition"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
            <span className="text-amber-400 font-medium">Note:</span> Use <span className="font-mono text-white">{booking?.ref_id || 'Ref ID'}</span> as the transfer narration/description.
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="space-y-2 text-sm border-t border-b border-slate-800 py-4">
        <div className="flex justify-between text-slate-300">
          <span className="text-slate-500">Customer:</span>
          <span>{booking?.customer_name || 'Guest'}</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span className="text-slate-500">Zone:</span>
          <span>{booking?.zone_name || booking?.zone_id || 'Station'}</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span className="text-slate-500">Schedule:</span>
          <span>{booking?.session_date || 'Date N/A'} ({booking?.time_slot || 'Time N/A'})</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span className="text-slate-500">Games:</span>
          <span>{booking?.duration_min || 1}</span>
        </div>

        {booking?.drinks && booking.drinks.length > 0 && (
          <div className="pt-2">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block mb-1">Drinks Bar:</span>
            {booking.drinks.map((item, idx) => (
              <div key={item.item_id || idx} className="flex justify-between text-xs text-slate-400">
                <span>{item.qty}x {item.name || 'Drink Item'}</span>
                <span>₦{item.line_total ? item.line_total.toLocaleString() : 0}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-slate-800">
          <span>Total Amount:</span>
          <span className="text-cyan-400">₦{booking?.total_cost ? booking.total_cost.toLocaleString() : 0}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {status === 'pending_payment' && (
          <button
            onClick={handleConfirmPaid}
            disabled={updating}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition duration-200 disabled:opacity-50"
          >
            {updating ? 'Updating Status...' : 'I Have Transferred Payment'}
          </button>
        )}

        {status === 'awaiting_verification' && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-center text-xs text-amber-300">
            Payment marked as sent! Present your reference or receipt at the counter to activate your station.
          </div>
        )}

        <button
          onClick={onReset}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition"
        >
          Book Another Session
        </button>
      </div>
    </div>
  );
}
