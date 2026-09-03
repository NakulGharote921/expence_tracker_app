/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function Container({ children, className = '' }) {
    return (
        <div className={`w-full max-w-[1500px] mx-auto px-4 sm:px-5 lg:px-8 xl:px-12 ${className}`}>
            {children}
        </div>
    );
}
