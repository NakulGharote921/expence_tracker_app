/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from 'react-router-dom';
import ShinyText from '../ShinyText';
import Container from './Container';

export default function CTASection() {
    return (
        <section className="w-full bg-[#F5F5F0] text-[#141414] py-16 sm:py-20 lg:py-28 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#14141408_1px,transparent_1px),linear-gradient(to_bottom,#14141408_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
            <Container className="text-center relative z-10">
                <div className="max-w-3xl mx-auto flex flex-col items-center">
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }} className="font-display-hero font-extrabold tracking-tight text-[#141414] mb-5 leading-tight">
                        <ShinyText text="Start Managing Your Money Smarter." speed={3} color="#141414" shineColor="#F5F5F0" spread={120} direction="left" />
                    </h2>
                    <p className="font-body-lg text-body-lg text-[#141414]/70 max-w-xl mb-8 leading-relaxed">Build lasting financial sovereignty with a simple, intelligent expense tracker designed for modern capital stewards.</p>
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 w-full sm:w-auto">
                        <Link to="/register" className="w-full sm:w-auto max-w-[340px] sm:max-w-none inline-flex items-center justify-center border border-[#141414] bg-[#141414]/5 text-[#141414] hover:bg-[#141414] hover:text-[#F5F5F0] font-headline-sm text-body-lg font-bold h-12 px-10 rounded-2xl active:scale-[0.98] transition-all duration-200 shadow-sm">
                            Get Started Free
                        </Link>
                        <a href="#features" className="w-full sm:w-auto max-w-[340px] sm:max-w-none inline-flex items-center justify-center bg-transparent border border-[#141414]/30 text-[#141414] font-headline-sm text-body-md font-semibold h-12 px-8 rounded-2xl hover:border-[#141414] hover:bg-[#141414] hover:text-[#F5F5F0] active:scale-[0.98] transition-all duration-200">
                            Read Documentation
                        </a>
                    </div>
                    <p className="font-body-sm text-body-sm text-[#141414]/50 tracking-wide">No credit card required. Free tier available forever. Reclaim control in 60 seconds.</p>
                </div>
            </Container>
        </section>
    );
}
