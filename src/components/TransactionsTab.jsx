/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Search, Trash2, Plus, ArrowUpDown, ChevronLeft, ChevronRight, Download, Receipt, Edit2, Check, X, FileText } from 'lucide-react';
import { formatDate } from './ExpenseHistory';
export default function TransactionsTab({ transactions, categories, onDeleteTransaction, onBulkDeleteTransactions, onAddTransaction, onUpdateTransaction }) {
    // Filters state
    const [localSearch, setLocalSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedType, setSelectedType] = useState('All');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    // Add dialogue state
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newCat, setNewCat] = useState(Object.keys(categories)[0] || 'Food');
    const [newType, setNewType] = useState('expense');
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
    // Edit dialogue state
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editAmount, setEditAmount] = useState('');
    const [editCat, setEditCat] = useState('');
    const [editDate, setEditDate] = useState('');
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    // Selected row state for bulk delete
    const [selectedRowIds, setSelectedRowIds] = useState([]);
    // Filter & search pipeline
    const filteredList = transactions.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(localSearch.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
        const matchesType = selectedType === 'All' || t.type === selectedType;
        return matchesSearch && matchesCategory && matchesType;
    });
    // Sort pipeline
    const sortedList = [...filteredList].sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'date') {
            comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        else if (sortBy === 'amount') {
            comparison = a.amount - b.amount;
        }
        else {
            comparison = a.name.localeCompare(b.name);
        }
        return sortOrder === 'desc' ? -comparison : comparison;
    });
    // Paginated elements
    const totalPages = Math.ceil(sortedList.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedList = sortedList.slice(startIndex, startIndex + itemsPerPage);
    const toggleSelectAll = () => {
        if (selectedRowIds.length === paginatedList.length) {
            setSelectedRowIds([]);
        }
        else {
            setSelectedRowIds(paginatedList.map(item => item.id));
        }
    };
    const toggleSelectRow = (id) => {
        if (selectedRowIds.includes(id)) {
            setSelectedRowIds(selectedRowIds.filter(i => i !== id));
        }
        else {
            setSelectedRowIds([...selectedRowIds, id]);
        }
    };
    const handleBulkDelete = () => {
        if (onBulkDeleteTransactions) {
            onBulkDeleteTransactions(selectedRowIds);
        }
        else {
            selectedRowIds.forEach(id => onDeleteTransaction(id));
        }
        setSelectedRowIds([]);
        setCurrentPage(1);
    };
    const handleToggleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        }
        else {
            setSortBy(field);
            setSortOrder('desc');
        }
        setCurrentPage(1);
    };
    const submitAddForm = (e) => {
        e.preventDefault();
        const parsedAmt = parseFloat(newAmount);
        if (!newName.trim() || isNaN(parsedAmt) || parsedAmt <= 0)
            return;
        onAddTransaction({
            name: newName.trim(),
            amount: parsedAmt,
            category: newCat,
            date: newDate,
            type: newType
        });
        // Reset
        setNewName('');
        setNewAmount('');
        setShowAddForm(false);
        setCurrentPage(1);
    };
    const startEditing = (tx) => {
        setEditingId(tx.id);
        setEditName(tx.name);
        setEditAmount(tx.amount.toString());
        setEditCat(tx.category);
        setEditDate(tx.date);
    };
    const saveInlineEdit = (id) => {
        const amt = parseFloat(editAmount);
        if (!editName.trim() || isNaN(amt) || amt <= 0)
            return;
        onUpdateTransaction(id, {
            name: editName.trim(),
            amount: amt,
            category: editCat,
            date: editDate
        });
        setEditingId(null);
    };
    // Export selected or all CSV list
    const handleExportCSV = () => {
        const targets = selectedRowIds.length > 0
            ? transactions.filter(t => selectedRowIds.includes(t.id))
            : transactions;
        const csvHeaders = ['ID', 'Name', 'Amount', 'Category', 'Date', 'Type'];
        const csvContent = [
            csvHeaders,
            ...targets.map(t => [t.id, `"${t.name}"`, t.amount, t.category, t.date, t.type])
        ].map(r => r.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `WealthFlow_Export_${selectedRowIds.length > 0 ? 'Selected' : 'All'}.csv`;
        link.click();
    };
    return (<div id="transactions-tab-view" className="space-y-6">
      
      {/* Title Header with actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#141414]/15 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-semibold text-[#141414] tracking-tight">Financial Ledger</h2>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#141414]/60 mt-2">AUDITS, FILTERING, DIRECT ENTRY, AND ARCHIVE LOGS</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {selectedRowIds.length > 0 && (<button id="btn-bulk-delete" onClick={handleBulkDelete} className="bg-red-600 hover:bg-[#141414] text-white border border-[#141414] rounded-none py-2 px-4 transition-all text-[10px] font-mono tracking-widest font-bold uppercase cursor-pointer">
              PURGE_SELECTED [{selectedRowIds.length}]
            </button>)}

          <button id="btn-export-reports" onClick={handleExportCSV} className="bg-[#EBEBE4] hover:bg-white text-[#141414] border border-[#141414] rounded-none py-2 px-4 transition-all text-[10px] font-mono tracking-widest font-bold uppercase cursor-pointer flex items-center gap-2">
            <Download className="w-3.5 h-3.5"/>
            {selectedRowIds.length > 0 ? 'EXPORT_SELECTED' : 'EXPORT_LEDGER'}
          </button>

          <button id="btn-open-add-transaction" onClick={() => setShowAddForm(!showAddForm)} className="bg-[#141414] text-white hover:bg-[#F27D26] border border-[#141414] rounded-none py-2 px-4 transition-all text-[10px] font-mono tracking-widest font-bold uppercase cursor-pointer flex items-center gap-2">
            <Plus className="w-3.5 h-3.5"/>
            RECORD_ENTRY
          </button>
        </div>
      </div>

      {/* Embedded add record panel modal inline */}
      {showAddForm && (<form onSubmit={submitAddForm} className="bg-white p-6 rounded-none border border-[#141414] hover:shadow-[4px_4px_0px_0px_#141414] space-y-5 animate-fade-in">
          <div className="flex justify-between items-center pb-3 border-b border-[#141414]/15">
            <span className="text-[10px] font-mono tracking-[0.2em] font-bold text-[#141414] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#F27D26]"/>
              RECORD DIRECT LEDGER ENTRY
            </span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-[#141414]/60 hover:text-[#141414] text-xs font-mono font-bold tracking-wider cursor-pointer">
              [✕ CLOSE]
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#141414]/60 mb-1.5 px-0.5">Title Name</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Tesla Stocks, Salary etc" className="w-full bg-[#EBEBE4] border border-[#141414] focus:bg-white rounded-none py-2 px-3 text-xs font-semibold outline-none transition-all placeholder:text-[#141414]/30" required/>
            </div>
            <div>
              <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#141414]/60 mb-1.5 px-0.5">Amount (INR)</label>
              <input type="number" step="0.01" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="499.00" className="w-full bg-[#EBEBE4] border border-[#141414] focus:bg-white rounded-none py-2 px-3 text-xs font-semibold font-mono outline-none transition-all placeholder:text-[#141414]/30" required/>
            </div>
            <div>
              <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#141414]/60 mb-1.5 px-0.5">Category</label>
              <select value={newCat} onChange={e => setNewCat(e.target.value)} className="w-full bg-[#EBEBE4] border border-[#141414] rounded-none py-2.5 px-3 text-xs font-bold uppercase tracking-wider outline-none text-[#141414]">
                {Object.keys(categories).map(c => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#141414]/60 mb-1.5 px-0.5">Transaction Type</label>
              <div className="flex bg-[#EBEBE4] border border-[#141414] p-1 h-[36px] items-center">
                <button type="button" onClick={() => setNewType('expense')} className={`flex-1 text-[10px] font-mono tracking-wider font-bold py-1.5 px-2 rounded-none transition-all cursor-pointer h-full ${newType === 'expense' ? 'bg-[#141414] text-white' : 'text-[#141414]/60 bg-[#EBEBE4]'}`}>
                  EXPENSE
                </button>
                <button type="button" onClick={() => setNewType('income')} className={`flex-1 text-[10px] font-mono tracking-wider font-bold py-1.5 px-2 rounded-none transition-all cursor-pointer h-full ${newType === 'income' ? 'bg-[#16a34a] text-white' : 'text-[#141414]/60 bg-[#EBEBE4]'}`}>
                  INCOME
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#141414]/60 mb-1.5 px-0.5">Audit Date</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full bg-[#EBEBE4] border border-[#141414] outline-none text-xs rounded-none py-2 px-3 text-[#141414] font-semibold font-mono"/>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs font-mono font-bold text-[#141414]/60 hover:text-[#141414] py-1.5 px-4 rounded-none transition-all cursor-pointer border border-transparent hover:border-[#141414]/10 bg-transparent">
              [CANCEL]
            </button>
            <button type="submit" className="bg-[#141414] hover:bg-[#F27D26] text-white border border-[#141414] text-xs font-mono font-bold uppercase tracking-widest py-2 px-6 rounded-none transition-all cursor-pointer">
              SAVE_ENTRY +
            </button>
          </div>
        </form>)}

      {/* Interactive Toolbar for filters */}
      <div className="bg-white p-4 rounded-none border border-[#141414] hover:shadow-[4px_4px_0px_0px_#141414] transition-all grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Keyword Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#141414]/50 absolute left-3 top-1/2 -translate-y-1/2"/>
          <input type="text" value={localSearch} onChange={e => { setLocalSearch(e.target.value); setCurrentPage(1); }} placeholder="Search matching names..." className="w-full pl-9 pr-4 py-2 bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none outline-none transition-all placeholder:text-[#141414]/40"/>
        </div>

        {/* Categories selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-[#141414]/60 uppercase tracking-[0.15em] shrink-0">CAT:</span>
          <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }} className="w-full bg-[#EBEBE4] border border-[#141414] rounded-none py-2 px-2 text-xs font-bold uppercase tracking-wider outline-none text-[#141414]">
            <option value="All">All Categories</option>
            {Object.keys(categories).map(c => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>

        {/* Expenses vs Income */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-[#141414]/60 uppercase tracking-[0.15em] shrink-0">TYPE:</span>
          <select value={selectedType} onChange={e => { setSelectedType(e.target.value); setCurrentPage(1); }} className="w-full bg-[#EBEBE4] border border-[#141414] rounded-none py-2 px-2 text-xs font-bold uppercase tracking-wider outline-none text-[#141414]">
            <option value="All">All Transactions</option>
            <option value="expense">Expense Only</option>
            <option value="income">Income Only</option>
          </select>
        </div>

        {/* Row summary info */}
        <div className="text-right text-[10px] font-mono uppercase tracking-wider text-[#141414]/60 font-semibold md:border-l md:border-[#141414]/15 md:pl-4">
          Filtered: <span className="font-extrabold text-[#F27D26]">{filteredList.length}</span> of {transactions.length}
        </div>
      </div>

      {/* Tables Grid Layout */}
      <div className="bg-white rounded-none border border-[#141414] hover:shadow-[4px_4px_0px_0px_#141414] transition-all overflow-hidden">
        
        {/* Desktop presentation Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-[#141414]">
            <thead className="bg-[#EBEBE4] text-[#141414] uppercase text-[9px] font-mono font-bold tracking-[0.15em] border-b border-[#141414]">
              <tr>
                <th className="p-3 w-12 text-center border-r border-[#141414]/10">
                  <input type="checkbox" checked={paginatedList.length > 0 && selectedRowIds.length === paginatedList.length} onChange={toggleSelectAll} className="rounded-none border border-[#141414] focus:ring-0 w-4 h-4 cursor-pointer"/>
                </th>
                <th className="p-3 border-r border-[#141414]/10 cursor-pointer hover:bg-neutral-200 transition-colors" onClick={() => handleToggleSort('name')}>
                  <div className="flex items-center gap-1.5 uppercase font-mono">
                    <span>Title Name</span>
                    <ArrowUpDown className="w-3 h-3 text-[#141414]"/>
                  </div>
                </th>
                <th className="p-3 border-r border-[#141414]/10 cursor-pointer hover:bg-neutral-200 transition-colors" onClick={() => handleToggleSort('amount')}>
                  <div className="flex items-center gap-1.5 uppercase font-mono">
                    <span>INR Amount</span>
                    <ArrowUpDown className="w-3 h-3 text-[#141414]"/>
                  </div>
                </th>
                <th className="p-3 border-r border-[#141414]/10 uppercase font-mono">Category</th>
                <th className="p-3 border-r border-[#141414]/10 cursor-pointer hover:bg-neutral-200 transition-colors" onClick={() => handleToggleSort('date')}>
                  <div className="flex items-center gap-1.5 uppercase font-mono">
                    <span>Audit Date</span>
                    <ArrowUpDown className="w-3 h-3 text-[#141414]"/>
                  </div>
                </th>
                <th className="p-3 uppercase font-mono text-center">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-[#141414]/10 font-medium">
              {paginatedList.length === 0 ? (<tr>
                  <td colSpan={6} className="p-12 text-center text-[#141414]/60">
                    <div className="flex flex-col items-center justify-center space-y-2">
                       <FileText className="w-10 h-10 text-[#141414]/40"/>
                       <p className="font-serif text-lg italic font-bold text-[#141414]">No ledger entries</p>
                       <p className="text-xs">Adjust your search parameters or register an entry above.</p>
                    </div>
                  </td>
                </tr>) : (paginatedList.map(tx => {
            const isEditing = editingId === tx.id;
            const catDef = categories[tx.category] || { name: 'Other', color: '#999', bgLight: 'bg-slate-100', iconName: 'HelpCircle' };
            const isIncome = tx.type === 'income';
            return (<tr key={tx.id} className={`hover:bg-[#EBEBE4]/20 transition-colors border-b border-[#141414]/10 last:border-b-0 ${selectedRowIds.includes(tx.id) ? 'bg-[#F27D26]/5' : ''} ${isIncome ? 'border-l-4 border-l-[#16a34a] bg-[#16a34a]/2 hover:bg-[#16a34a]/5' : 'border-l-4 border-l-transparent'}`}>
                      {/* Checkbox */}
                      <td className="p-3 text-center border-r border-[#141414]/10">
                        <input type="checkbox" checked={selectedRowIds.includes(tx.id)} onChange={() => toggleSelectRow(tx.id)} className="rounded-none border border-[#141414] focus:ring-0 w-4 h-4 cursor-pointer"/>
                      </td>

                      {/* Name column */}
                      <td className="p-3 border-r border-[#141414]/10">
                        {isEditing ? (<input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none px-2.5 py-1 outline-none w-48 font-bold"/>) : (<div className="flex items-center gap-2.5">
                             <span className="font-bold text-[13px] uppercase tracking-wide text-[#141414]">{tx.name}</span>
                             {isIncome && (<span className="text-[8px] font-mono font-black uppercase px-2 py-0.5 border border-[#16a34a] bg-[#16a34a]/10 text-[#16a34a]">
                                 INCOME
                               </span>)}
                          </div>)}
                      </td>

                      {/* Amount column */}
                      <td className={`p-3 border-r border-[#141414]/10 font-bold ${isIncome ? 'text-[#16a34a]' : 'text-[#141414]'}`}>
                        {isEditing ? (<div className="relative inline-block">
                            <span className="absolute left-2 top-1 font-bold font-mono text-xs">₹</span>
                            <input type="number" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} className="bg-[#EBEBE4] focus:bg-white border border-[#141414] pl-5 pr-2 py-1 text-xs rounded-none outline-none w-28 font-mono font-bold text-[#141414]"/>
                          </div>) : (<span className={`font-mono text-[13px] ${isIncome ? 'bg-[#16a34a]/10 px-1.5 py-0.5 border border-[#16a34a]/20 font-bold' : ''}`}>
                            {isIncome ? '+' : '-'}₹{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>)}
                      </td>

                      {/* Category column */}
                      <td className="p-3 border-r border-[#141414]/10">
                        {isEditing ? (<select value={editCat} onChange={e => setEditCat(e.target.value)} className="bg-[#EBEBE4] border border-[#141414] text-xs rounded-none px-2 py-1 outline-none font-bold">
                            {Object.keys(categories).map(c => (<option key={c} value={c}>{c}</option>))}
                          </select>) : (<span className="inline-block px-2.5 py-0.5 border border-[#141414] rounded-none text-[9px] font-mono font-bold tracking-wider uppercase" style={{ backgroundColor: `${catDef.color}25`, color: '#141414' }}>
                            {tx.category}
                          </span>)}
                      </td>

                      {/* Date column */}
                      <td className="p-3 border-r border-[#141414]/10 text-[#141414]/70 font-mono">
                        {isEditing ? (<input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="bg-[#EBEBE4] border border-[#141414] text-xs rounded-none px-2 py-1 outline-none text-[#141414] font-mono font-bold"/>) : (formatDate(tx.date))}
                      </td>

                      {/* Action buttons */}
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isEditing ? (<>
                              <button onClick={() => saveInlineEdit(tx.id)} className="p-1.5 text-white bg-[#141414] hover:bg-[#16a34a] border border-[#141414] rounded-none transition-all cursor-pointer" title="Save changes">
                                <Check className="w-3.5 h-3.5"/>
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-1.5 text-[#141414] bg-[#EBEBE4] hover:bg-neutral-300 border border-[#141414] rounded-none transition-all cursor-pointer" title="Cancel">
                                <X className="w-3.5 h-3.5"/>
                              </button>
                            </>) : (<>
                              <button onClick={() => startEditing(tx)} className="p-1.5 text-[#141414] hover:bg-[#F27D26] hover:text-white border border-[#141414]/20 hover:border-transparent rounded-none transition-all cursor-pointer" title="Modify row inline">
                                <Edit2 className="w-3.5 h-3.5"/>
                              </button>
                              <button onClick={() => onDeleteTransaction(tx.id)} className="p-1.5 text-white bg-[#141414] hover:bg-red-650 rounded-none border border-[#141414] transition-all cursor-pointer" title="Delete record">
                                <Trash2 className="w-3.5 h-3.5"/>
                              </button>
                            </>)}
                        </div>
                      </td>
                    </tr>);
        }))}
            </tbody>
          </table>
        </div>

        {/* Mobile presentation Stacked Cards */}
        <div className="block md:hidden divide-y divide-[#141414]/15">
          {paginatedList.length === 0 ? (<div className="p-8 text-center text-[#141414]/60">
              <FileText className="w-10 h-10 text-[#141414]/40 mx-auto mb-2"/>
              <p className="font-serif text-base italic font-bold text-[#141414]">No ledger entries</p>
              <p className="text-[11px] mt-1">Adjust search filters or add a new entry.</p>
            </div>) : (paginatedList.map(tx => {
            const isEditing = editingId === tx.id;
            const catDef = categories[tx.category] || { name: 'Other', color: '#999', bgLight: 'bg-slate-100', iconName: 'HelpCircle' };
            const isIncome = tx.type === 'income';
            return (<div key={tx.id} className={`p-4 space-y-3 relative ${selectedRowIds.includes(tx.id) ? 'bg-[#F27D26]/5' : ''} ${isIncome ? 'border-l-4 border-l-[#16a34a] bg-[#16a34a]/2' : 'border-l-4 border-l-transparent'}`}>
                  <div className="flex items-start justify-between gap-2">
                    {/* Checkbox + Title */}
                    <div className="flex items-start gap-2.5 min-w-0 w-full">
                      <input type="checkbox" checked={selectedRowIds.includes(tx.id)} onChange={() => toggleSelectRow(tx.id)} className="rounded-none border border-[#141414] focus:ring-0 w-4 h-4 mt-0.5 cursor-pointer shrink-0"/>
                      {isEditing ? (<div className="space-y-2 w-full pr-2">
                          <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-bold rounded-none px-2 py-1 outline-none w-full"/>
                          <div className="flex gap-2">
                            <div className="relative">
                              <span className="absolute left-1.5 top-1 font-bold font-mono text-[10px]">₹</span>
                              <input type="number" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} className="bg-[#EBEBE4] focus:bg-white border border-[#141414] pl-4 pr-1.5 py-1 text-[11px] rounded-none outline-none w-20 font-mono font-bold"/>
                            </div>
                            <select value={editCat} onChange={e => setEditCat(e.target.value)} className="bg-[#EBEBE4] border border-[#141414] text-[11px] rounded-none px-1.5 py-1 outline-none font-bold">
                              {Object.keys(categories).map(c => (<option key={c} value={c}>{c}</option>))}
                            </select>
                          </div>
                          <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="bg-[#EBEBE4] border border-[#141414] text-[11px] rounded-none px-1.5 py-1 outline-none text-[#141414] font-mono font-bold w-full"/>
                        </div>) : (<div className="min-w-0">
                          <p className="font-bold text-[13px] uppercase tracking-wide text-[#141414] break-words">{tx.name}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="inline-block px-2 py-0.5 border border-[#141414] rounded-none text-[8px] font-mono font-bold tracking-wider uppercase" style={{ backgroundColor: `${catDef.color}25`, color: '#141414' }}>
                              {tx.category}
                            </span>
                            <span className="text-[10px] text-[#141414]/50 font-mono">{formatDate(tx.date)}</span>
                          </div>
                        </div>)}
                    </div>

                    {/* Amount */}
                    {!isEditing && (<div className="text-right shrink-0">
                        <p className={`font-bold text-xs font-mono ${isIncome ? 'text-[#16a34a]' : 'text-[#141414]'}`}>
                          {isIncome ? '+' : '-'}₹{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>)}
                  </div>

                  {/* Actions for mobile card */}
                  <div className="flex justify-end gap-2 pt-1 border-t border-[#141414]/5">
                    {isEditing ? (<>
                        <button onClick={() => saveInlineEdit(tx.id)} className="px-2.5 py-1 text-white bg-[#141414] hover:bg-[#16a34a] border border-[#141414] rounded-none text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1">
                          <Check className="w-3 h-3"/> SAVE
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-2.5 py-1 text-[#141414] bg-[#EBEBE4] hover:bg-neutral-300 border border-[#141414] rounded-none text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1">
                          <X className="w-3 h-3"/> CANCEL
                        </button>
                      </>) : (<>
                        <button onClick={() => startEditing(tx)} className="p-1 px-2.5 text-[#141414] hover:bg-[#F27D26] hover:text-white border border-[#141414]/20 hover:border-transparent rounded-none transition-all cursor-pointer text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                          <Edit2 className="w-3 h-3"/> EDIT
                        </button>
                        <button onClick={() => onDeleteTransaction(tx.id)} className="p-1 px-2.5 text-white bg-[#141414] hover:bg-red-650 rounded-none border border-[#141414] transition-all cursor-pointer text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                          <Trash2 className="w-3 h-3"/> PURGE
                        </button>
                      </>)}
                  </div>
                </div>);
        }))}
        </div>

        {/* Pagination footer bar */}
        {totalPages > 1 && (<div className="p-4 bg-[#EBEBE4] border-t border-[#141414] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#141414]">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
              SHOWING <span className="font-extrabold text-neutral-900">{Math.min(startIndex + 1, sortedList.length)}</span> -{' '}
              <span className="font-extrabold text-neutral-900">{Math.min(startIndex + itemsPerPage, sortedList.length)}</span> OF{' '}
              <span className="font-extrabold text-neutral-900">{sortedList.length}</span> RECORDS
            </span>
            <div className="flex items-center gap-1.5 font-mono">
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-2 border border-[#141414] bg-white hover:bg-[#EBEBE4]/40 disabled:opacity-30 disabled:hover:bg-white text-[#141414] rounded-none transition-all outline-none cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5"/>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (<button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 flex items-center justify-center border font-bold text-xs transition-all ${currentPage === page
                    ? 'bg-[#141414] text-white border-[#141414]'
                    : 'bg-white hover:bg-[#EBEBE4]/40 text-[#141414] border-[#141414]'}`}>
                  {page}
                </button>))}

              <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-2 border border-[#141414] bg-white hover:bg-[#EBEBE4]/40 disabled:opacity-30 disabled:hover:bg-white text-[#141414] rounded-none transition-all outline-none cursor-pointer">
                <ChevronRight className="w-3.5 h-3.5"/>
              </button>
            </div>
          </div>)}
      </div>

    </div>);
}
