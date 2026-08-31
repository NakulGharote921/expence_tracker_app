/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
export function getInitials(name) {
    if (!name || typeof name !== 'string') return 'U';
    return name
        .split(' ')
        .map(w => w[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';
}
export default function Avatar({ photoURL, name, className = '', imgClassName = '', initialClassName = '' }) {
    if (photoURL) {
        return (<span className={`rounded-full border border-[#141414] flex items-center justify-center overflow-hidden ${className}`}>
            <img src={photoURL} alt={name || 'Profile'} referrerPolicy="no-referrer" className={`w-full h-full shrink-0 object-cover ${imgClassName}`}/>
          </span>);
    }
    return (<span className={`rounded-full bg-[#141414] text-white font-mono tracking-widest flex items-center justify-center ${className}`}>
        <span className={initialClassName}>{getInitials(name)}</span>
      </span>);
}
