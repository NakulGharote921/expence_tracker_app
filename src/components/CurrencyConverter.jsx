/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { RefreshCw, Coins, ArrowLeftRight } from 'lucide-react';
import { CURRENCY_RATES } from '../mockData';

const FLAG_MAPPING = {
    INR: {
        src: 'https://flagcdn.com/16x12/in.png',
        srcset: 'https://flagcdn.com/32x24/in.png 2x, https://flagcdn.com/48x36/in.png 3x',
        alt: 'India',
    },
    USD: {
        src: 'https://flagcdn.com/16x12/us.png',
        srcset: 'https://flagcdn.com/32x24/us.png 2x, https://flagcdn.com/48x36/us.png 3x',
        alt: 'United States',
    },
    EUR: {
        src: 'https://flagcdn.com/16x11/eu.png',
        srcset: 'https://flagcdn.com/32x22/eu.png 2x, https://flagcdn.com/48x33/eu.png 3x',
        alt: 'European Union',
    },
    GBP: {
        src: 'https://flagcdn.com/16x12/gb.png',
        srcset: 'https://flagcdn.com/32x24/gb.png 2x, https://flagcdn.com/48x36/gb.png 3x',
        alt: 'United Kingdom',
    },
    JPY: {
        src: 'https://flagcdn.com/16x12/jp.png',
        srcset: 'https://flagcdn.com/32x24/jp.png 2x, https://flagcdn.com/48x36/jp.png 3x',
        alt: 'Japan',
    },
    RON: {
        src: 'https://flagcdn.com/16x12/ro.png',
        srcset: 'https://flagcdn.com/32x24/ro.png 2x, https://flagcdn.com/48x36/ro.png 3x',
        alt: 'Romania',
    },
};

export default function CurrencyConverter({ totalINRAmount }) {
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [customAmount, setCustomAmount] = useState('');
    const [isFromINR, setIsFromINR] = useState(true);
    const [isConverting, setIsConverting] = useState(false);
    const [displayAmount, setDisplayAmount] = useState(0);
    const [apiRates, setApiRates] = useState({
        INR: 1.0,
        USD: CURRENCY_RATES.USD.rate,
        EUR: CURRENCY_RATES.EUR.rate,
        GBP: CURRENCY_RATES.GBP.rate,
        JPY: CURRENCY_RATES.JPY.rate,
        RON: CURRENCY_RATES.RON.rate,
    });
    const [isLive, setIsLive] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchRates = async () => {
        setIsConverting(true);
        try {
            const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const usdRates = data.usd || data.USD;
            if (usdRates) {
                const inrInUSD = usdRates.inr ?? usdRates.INR;
                if (inrInUSD && inrInUSD > 0) {
                    const getRateFor = (code, fallbackDefault) => {
                        const keyLower = code.toLowerCase();
                        const keyUpper = code.toUpperCase();
                        const targetInUSD = usdRates[keyLower] ?? usdRates[keyUpper];
                        if (targetInUSD !== undefined && targetInUSD > 0) {
                            return parseFloat((targetInUSD / inrInUSD).toFixed(code === 'JPY' ? 4 : 6));
                        }
                        return fallbackDefault;
                    };

                    setApiRates({
                        INR: 1.0,
                        USD: parseFloat((1 / inrInUSD).toFixed(6)),
                        EUR: getRateFor('EUR', CURRENCY_RATES.EUR.rate),
                        GBP: getRateFor('GBP', CURRENCY_RATES.GBP.rate),
                        JPY: getRateFor('JPY', CURRENCY_RATES.JPY.rate),
                        RON: getRateFor('RON', CURRENCY_RATES.RON.rate),
                    });
                    setIsLive(true);
                    setLastUpdated(data.date ? `${data.date} (fawazahmed0 API)` : new Date().toDateString());
                }
            }
        } catch (err) {
            console.error('Failed to fetch live exchange rates:', err);
        } finally {
            setIsConverting(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, []);

    const currentRateObj = CURRENCY_RATES[selectedCurrency];
    const rateToINR = apiRates[selectedCurrency];
    const foreignSymbol = currentRateObj.symbol;
    const defaultBaseAmount = isFromINR ? totalINRAmount : totalINRAmount * rateToINR;
    const inputAmount = customAmount !== '' ? parseFloat(customAmount) : defaultBaseAmount;
    const finalAmount = isNaN(inputAmount) ? 0 : inputAmount;

    useEffect(() => {
        setIsConverting(true);
        const timer = setTimeout(() => {
            if (isFromINR) {
                setDisplayAmount(finalAmount * rateToINR);
            } else {
                setDisplayAmount(rateToINR > 0 ? finalAmount / rateToINR : 0);
            }
            setIsConverting(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [selectedCurrency, finalAmount, rateToINR, isFromINR]);

    const handleSwapDirection = () => {
        if (customAmount !== '') {
            const parsed = parseFloat(customAmount);
            if (!isNaN(parsed)) {
                if (isFromINR) {
                    setCustomAmount((parsed * rateToINR).toFixed(2));
                } else {
                    setCustomAmount((parsed / rateToINR).toFixed(2));
                }
            }
        }
        setIsFromINR(!isFromINR);
    };

    const inverseRate = rateToINR > 0 ? (1 / rateToINR).toFixed(4) : '0';

    return (
        <div id="widget-currency-converter" className="relative flex h-full max-w-full flex-col justify-between overflow-hidden rounded-none border border-[#141414] bg-[#FFFFFE] p-3 sm:p-4 md:p-6 transition-all hover:shadow-[4px_4px_0px_0px_#141414]">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#141414]/60 sm:text-[10px]">
                    <Coins className="h-3.5 w-3.5 text-[#F27D26]"/>
                    EXCHANGE RATE / CONVERSION
                </span>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                        className={`flex select-none items-center gap-1.5 border px-1.5 py-0.5 text-[8px] font-bold ${isLive ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-amber-300 bg-amber-50 text-amber-700'}`}
                        title={lastUpdated ? `Last synchronized: ${lastUpdated}` : 'Fallback exchange rates loaded locally'}
                    >
                        <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}/>
                        {isLive ? 'LIVE' : 'LOCAL'}
                    </span>

                    {isConverting ? (
                        <div id="converter-spinner" className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#141414]/20 border-t-[#F27D26]"/>
                    ) : (
                        <button type="button" onClick={fetchRates} title="Refresh live rates via API" className="cursor-pointer text-[#141414]/40 transition-colors hover:text-[#F27D26]">
                            <RefreshCw className="h-3.5 w-3.5"/>
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-1.5">
                    <div className="grid w-full grid-cols-[auto_1fr_auto_auto_1fr] items-center gap-1.5 sm:flex sm:items-center">
                        <div className="flex h-[30px] w-[38px] shrink-0 items-center justify-center border border-[#141414] bg-[#EBEBE4] px-1.5 py-0.5">
                            <img
                                src={FLAG_MAPPING[isFromINR ? 'INR' : selectedCurrency].src}
                                srcSet={FLAG_MAPPING[isFromINR ? 'INR' : selectedCurrency].srcset}
                                width="16"
                                height="12"
                                alt={isFromINR ? 'INR' : selectedCurrency}
                                className="object-contain"
                            />
                        </div>

                        <div className="min-w-0 truncate text-[10px] font-bold text-[#141414]/60 sm:text-[11px]">
                            {isFromINR ? 'INR' : selectedCurrency}
                        </div>

                        <button
                            type="button"
                            onClick={handleSwapDirection}
                            title="Toggle conversion direction"
                            className="mx-1 flex shrink-0 items-center justify-center rounded-none border border-[#141414] bg-[#EBEBE4] p-1 text-[#141414] transition-all hover:bg-[#F27D26] hover:text-white"
                        >
                            <ArrowLeftRight className="h-3 w-3"/>
                        </button>

                        <div className="flex h-[30px] w-[38px] shrink-0 items-center justify-center border border-[#141414] bg-[#EBEBE4] px-1.5 py-0.5">
                            <img
                                src={FLAG_MAPPING[isFromINR ? selectedCurrency : 'INR'].src}
                                srcSet={FLAG_MAPPING[isFromINR ? selectedCurrency : 'INR'].srcset}
                                width="16"
                                height="12"
                                alt={isFromINR ? selectedCurrency : 'INR'}
                                className="object-contain"
                            />
                        </div>

                        <div className="min-w-0 truncate text-[10px] font-bold text-[#141414]/60 sm:text-[11px]">
                            {isFromINR ? selectedCurrency : 'INR'}
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <label className="mb-1 block text-[8px] font-bold uppercase tracking-[0.15em] text-[#141414]/50">
                        SELECT TARGET FOREIGN CURRENCY
                    </label>
                    <select
                        id="currency-select"
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className="w-full max-w-full appearance-none rounded-none border border-[#141414] bg-[#EBEBE4] px-3 py-2 pr-10 text-[11px] font-bold uppercase tracking-wide text-[#141414] transition-all focus:bg-white focus:outline-none sm:text-xs sm:tracking-widest"
                    >
                        {Object.keys(CURRENCY_RATES).map((code) => {
                            if (code === 'INR')
                                return null;
                            return (
                                <option key={code} value={code}>
                                    {CURRENCY_RATES[code].name}
                                </option>
                            );
                        })}
                    </select>
                    <div className="pointer-events-none absolute bottom-2.5 right-3.5 flex items-center text-[#141414]">
                        <span className="text-[9px]">▼</span>
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-[9px] font-bold uppercase tracking-[0.15em] text-[#141414]/50">
                        {isFromINR ? `AMOUNT TO CONVERT (INR -> ${selectedCurrency})` : `AMOUNT TO CONVERT (${selectedCurrency} -> INR)`}
                    </label>
                    <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 font-mono text-[11px] font-bold text-[#141414]/50">
                            {isFromINR ? 'Rs' : foreignSymbol.trim()}
                        </span>
                        <input
                            type="number"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            step="any"
                            className="w-full max-w-full rounded-none border border-[#141414] bg-[#EBEBE4] py-2 pl-8 pr-3 text-xs font-semibold text-[#141414] outline-none transition-all focus:bg-white"
                            placeholder={isFromINR ? `TOTAL: Rs${totalINRAmount.toFixed(2)}` : `TOTAL: ${foreignSymbol.trim()} ${(totalINRAmount * rateToINR).toFixed(2)}`}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 border-t border-[#141414]/10 pt-3">
                    <div className="flex items-baseline justify-between">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-[#141414]/50">CONVERTED SUM</span>
                        <span className="text-[8px] font-bold uppercase text-[#101010]/40">{isFromINR ? selectedCurrency : 'INR'}</span>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span id="converted-amount" className={`min-w-0 break-all font-serif text-2xl italic font-bold text-[#141414] transition-all duration-300 sm:text-3xl ${isConverting ? 'scale-95 opacity-40' : 'opacity-100'}`}>
                            {!isFromINR ? (
                                <>
                                    <span className="mr-1 font-sans text-lg font-medium not-italic text-[#F27D26] sm:text-xl">Rs</span>
                                    {displayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </>
                            ) : selectedCurrency === 'RON' ? (
                                <>
                                    {displayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    <span className="ml-1 font-sans text-base font-semibold not-italic text-[#F27D26]">{foreignSymbol.trim()}</span>
                                </>
                            ) : (
                                <>
                                    <span className="mr-1 font-sans text-lg font-medium not-italic text-[#F27D26] sm:text-xl">{foreignSymbol.trim()}</span>
                                    {displayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </>
                            )}
                        </span>

                        <div className="flex flex-col items-start gap-0.5 sm:items-end">
                            <span className="max-w-full break-all bg-[#E2E2D9] px-2 py-0.5 text-[9px] font-bold text-[#141414]/70">
                                1 INR = {rateToINR} {selectedCurrency}
                            </span>
                            <span className="break-all text-[8px] text-[#141414]/40">
                                1 {selectedCurrency} = {inverseRate} INR
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
