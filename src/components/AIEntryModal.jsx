/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AI Entry Modal Component
 * Natural language expense entry with AI extraction
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Sparkles, Loader2, CheckCircle, AlertCircle, 
  Edit2, ArrowRight, Calendar, Wallet, Tag, FileText,
  ChevronDown, CreditCard, Banknote
} from 'lucide-react';
import { extractExpenseData } from '../services/nvidiaNim';
import { 
  detectMissingFields, 
  getMissingFieldMessage, 
  validateTransaction,
  getConfidenceLabel,
  formatExtractedForDisplay
} from '../utils/aiValidation';
import { PAYMENT_METHODS } from '../mockData';

const PAYMENT_ICONS = {
  'Cash': Banknote,
  'UPI': Wallet,
  'Credit Card': CreditCard,
  'Debit Card': CreditCard,
  'Bank Transfer': Wallet
};

export default function AIEntryModal({ isOpen, onClose, onSave, categories }) {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    // Reset state on close
    if (!isOpen) {
      setUserInput('');
      setExtractedData(null);
      setMissingFields([]);
      setError('');
      setIsEditing(false);
      setEditData(null);
    }
  }, [isOpen]);

  // Handle AI analysis
  const handleAnalyze = async () => {
    if (!userInput.trim()) {
      setError('Please enter something to analyze');
      return;
    }

    setIsLoading(true);
    setError('');
    setExtractedData(null);
    setMissingFields([]);

    try {
      const categoryList = Object.keys(categories || {});
      const data = await extractExpenseData(userInput, categoryList);
      
      setExtractedData(data);
      setEditData({ ...data });
      
      // Detect missing fields
      const missing = detectMissingFields(data);
      setMissingFields(missing);
    } catch (err) {
      setError(err.message || 'Failed to analyze input. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard shortcut
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!extractedData) {
        handleAnalyze();
      }
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Handle field update in edit mode
  const handleFieldUpdate = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    // Remove from missing fields if now filled
    if (value && value.toString().trim()) {
      setMissingFields(prev => prev.filter(f => f !== field));
    }
  };

  // Handle payment method selection
  const handlePaymentSelect = (method) => {
    handleFieldUpdate('payment_method', method);
  };

  // Handle confirm/save
  const handleConfirm = () => {
    const dataToSave = isEditing ? editData : extractedData;
    const validationErrors = validateTransaction(dataToSave);
    
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    // Add source and confidence metadata
    const transactionData = {
      ...dataToSave,
      source: 'ai',
      ai_confidence: dataToSave.confidence,
      name: dataToSave.description || `${dataToSave.category} expense`
    };

    onSave(transactionData);
    onClose();
  };

  // Handle edit toggle
  const toggleEdit = () => {
    if (!isEditing) {
      setEditData({ ...extractedData });
    }
    setIsEditing(!isEditing);
  };

  if (!isOpen) return null;

  const displayData = isEditing ? editData : extractedData;
  const formattedData = displayData ? formatExtractedForDisplay(displayData) : null;
  const confidenceInfo = displayData?.confidence ? getConfidenceLabel(displayData.confidence) : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#141414]/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white border-2 border-[#141414] rounded-none w-full max-w-lg max-h-[90vh] overflow-hidden shadow-[8px_8px_0px_0px_#141414] animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#141414]/10 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-lg italic font-semibold text-[#141414]">
                AI Entry
              </h3>
              <p className="text-[9px] font-mono uppercase tracking-wider text-[#141414]/50">
                Natural Language Processing
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#141410]/10 transition-colors"
          >
            <X className="w-5 h-5 text-[#141414]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-180px)]">
          
          {/* Input Section */}
          {!extractedData && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#141414]/60 mb-2">
                  What did you spend on?
                </label>
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={(e) => {
                    setUserInput(e.target.value);
                    setError('');
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder='e.g., "Birthday party food ₹5000 paid through UPI"'
                  className="w-full h-24 px-4 py-3 border-2 border-[#141414] bg-[#EBEBE4] rounded-none text-sm font-medium text-[#141414] placeholder:text-[#141414]/40 focus:bg-white focus:outline-none resize-none"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 border border-red-500 bg-red-50 text-red-700 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isLoading || !userInput.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#141414] text-white font-mono text-[11px] uppercase tracking-wider font-bold border-2 border-[#141414] hover:bg-[#F27D26] hover:border-[#F27D26] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze
                  </>
                )}
              </button>

              {/* Example prompts */}
              <div className="pt-2 border-t border-[#141414]/10">
                <p className="text-[9px] font-mono uppercase tracking-wider text-[#141414]/40 mb-2">
                  Try these examples:
                </p>
                <div className="space-y-1.5">
                  {[
                    'Pizza ₹800 via UPI',
                    'Petrol ₹2000 cash',
                    'Netflix subscription ₹649',
                    'Electricity bill ₹1800'
                  ].map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setUserInput(example)}
                      className="w-full text-left px-3 py-2 text-xs text-[#141414]/70 hover:bg-[#EBEBE4] hover:text-[#141414] transition-colors border border-transparent hover:border-[#141414]/20"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {extractedData && (
            <div className="space-y-4">
              
              {/* Confidence Badge */}
              {confidenceInfo && (
                <div className="flex items-center justify-between p-3 bg-[#EBEBE4] border border-[#141414]/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-bold text-[#141414]">AI Analysis Complete</span>
                  </div>
                  <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${confidenceInfo.color}`}>
                    {confidenceInfo.label} Confidence
                  </span>
                </div>
              )}

              {/* Missing Fields Alert */}
              {missingFields.length > 0 && (
                <div className="p-4 border-2 border-dashed border-[#F27D26] bg-[#F27D26]/5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-[#F27D26]" />
                    <span className="text-xs font-bold text-[#F27D26] uppercase tracking-wider">
                      Missing Information
                    </span>
                  </div>
                  <p className="text-sm text-[#141414] mb-3">
                    {missingFields.map(f => getMissingFieldMessage(f)).join(' ')}
                  </p>
                  
                  {/* Payment Method Selection */}
                  {missingFields.includes('payment_method') && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#141414]/60">
                        Select Payment Method
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PAYMENT_METHODS.map((method) => {
                          const Icon = PAYMENT_ICONS[method] || Wallet;
                          return (
                            <button
                              key={method}
                              onClick={() => handlePaymentSelect(method)}
                              className="flex items-center gap-2 px-3 py-2 border border-[#141414]/20 hover:border-[#F27D26] hover:bg-[#F27D26]/10 transition-all text-xs font-medium text-[#141414]"
                            >
                              <Icon className="w-4 h-4" />
                              {method}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Amount Input */}
                  {missingFields.includes('amount') && (
                    <div className="mt-3">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#141414]/60 mb-1 block">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={editData?.amount || ''}
                        onChange={(e) => handleFieldUpdate('amount', parseFloat(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-[#141414] text-sm font-mono font-bold focus:outline-none focus:border-[#F27D26]"
                        placeholder="Enter amount"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Extracted Data Card */}
              <div className="border-2 border-[#141414] bg-white">
                <div className="px-4 py-3 bg-[#141414] text-white flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                    Extracted Data
                  </span>
                  <button
                    onClick={toggleEdit}
                    className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono uppercase tracking-wider hover:bg-white/20 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    {isEditing ? 'View' : 'Edit'}
                  </button>
                </div>
                
                <div className="p-4 space-y-3">
                  {/* Amount */}
                  <div className="flex items-start justify-between py-2 border-b border-[#141414]/10">
                    <div className="flex items-center gap-2 text-[#141414]/60">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold">AMOUNT</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData?.amount || ''}
                        onChange={(e) => handleFieldUpdate('amount', parseFloat(e.target.value) || null)}
                        className="w-32 px-2 py-1 border border-[#141414] text-right font-serif text-lg font-bold focus:outline-none focus:border-[#F27D26]"
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      <span className="font-serif text-lg font-bold text-[#141414]">
                        {formattedData.amount}
                      </span>
                    )}
                  </div>

                  {/* Type */}
                  <div className="flex items-start justify-between py-2 border-b border-[#141414]/10">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#141414]/60">TYPE</span>
                    {isEditing ? (
                      <select
                        value={editData?.type || 'expense'}
                        onChange={(e) => handleFieldUpdate('type', e.target.value)}
                        className="px-2 py-1 border border-[#141414] text-xs font-bold uppercase focus:outline-none focus:border-[#F27D26]"
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold ${
                        formattedData.type === 'Expense' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {formattedData.type}
                      </span>
                    )}
                  </div>

                  {/* Category */}
                  <div className="flex items-start justify-between py-2 border-b border-[#141414]/10">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#141414]/60">CATEGORY</span>
                    {isEditing ? (
                      <select
                        value={editData?.category || ''}
                        onChange={(e) => handleFieldUpdate('category', e.target.value)}
                        className="px-2 py-1 border border-[#141414] text-xs font-bold uppercase focus:outline-none focus:border-[#F27D26]"
                      >
                        {Object.keys(categories || {}).map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-[#141414]">
                        <Tag className="w-3.5 h-3.5 text-[#F27D26]" />
                        {formattedData.category}
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="flex items-start justify-between py-2 border-b border-[#141414]/10">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#141414]/60">DATE</span>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editData?.date || ''}
                        onChange={(e) => handleFieldUpdate('date', e.target.value)}
                        className="px-2 py-1 border border-[#141414] text-xs font-bold focus:outline-none focus:border-[#F27D26]"
                      />
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-[#141414]">
                        <Calendar className="w-3.5 h-3.5 text-[#F27D26]" />
                        {formattedData.date}
                      </span>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="flex items-start justify-between py-2 border-b border-[#141414]/10">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#141414]/60">PAYMENT</span>
                    {isEditing ? (
                      <select
                        value={editData?.payment_method || ''}
                        onChange={(e) => handleFieldUpdate('payment_method', e.target.value)}
                        className="px-2 py-1 border border-[#141414] text-xs font-bold uppercase focus:outline-none focus:border-[#F27D26]"
                      >
                        <option value="">Select</option>
                        {PAYMENT_METHODS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-[#141414]">
                        <Wallet className="w-3.5 h-3.5 text-[#F27D26]" />
                        {formattedData.payment_method}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="flex items-start justify-between py-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#141414]/60">NOTES</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData?.description || ''}
                        onChange={(e) => handleFieldUpdate('description', e.target.value)}
                        className="w-48 px-2 py-1 border border-[#141414] text-xs font-medium focus:outline-none focus:border-[#F27D26]"
                        placeholder="Add notes"
                      />
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-[#141414]/70 max-w-[200px] text-right">
                        <FileText className="w-3.5 h-3.5 text-[#F27D26] shrink-0" />
                        {formattedData.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {extractedData && (
          <div className="px-5 py-4 border-t border-[#141414]/10 bg-[#EBEBE4] flex gap-3">
            <button
              onClick={() => {
                setExtractedData(null);
                setEditData(null);
                setIsEditing(false);
                setMissingFields([]);
                setError('');
              }}
              className="flex-1 px-4 py-2.5 border border-[#141414] text-[#141414] font-mono text-[10px] uppercase tracking-wider font-bold hover:bg-[#141414]/10 transition-colors"
            >
              New Entry
            </button>
            <button
              onClick={handleConfirm}
              disabled={missingFields.length > 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#141414] text-white font-mono text-[10px] uppercase tracking-wider font-bold border-2 border-[#141414] hover:bg-[#F27D26] hover:border-[#F27D26] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm & Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
