/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import BlurText from '../BlurText';
import ScrollFloat from '../ScrollFloat';
import Container from './Container';
import { AiTerminalComplete, AiTerminalFallback } from './AiTerminal';

export default function AIExpenseEntrySection() {
    return (
        <section className="w-full bg-[#F5F5F0] text-[#141414] py-16 sm:py-20 lg:py-28 border-b border-[#141414]/10">
            <Container>
                <div className="max-w-3xl mb-10 sm:mb-14 lg:mb-16">
                    <BlurText text="Natural Language Parsing" delay={100} animateBy="words" direction="top" className="font-label-caps text-label-caps text-[#141414]/60 uppercase tracking-widest block mb-2" />
                    <ScrollFloat animationDuration={1} ease="back.inOut(2)" scrollStart="center bottom+=50%" scrollEnd="bottom bottom-=40%" stagger={0.03} containerClassName="font-display-hero font-extrabold tracking-tight text-[#141414] mb-3 w-full max-w-[1000px]" textClassName="!text-[clamp(1.75rem,4vw,3rem)] !leading-[1.1]">
                        Expense Tracking, Without the Forms.
                    </ScrollFloat>
                    <p className="font-body-lg text-body-lg text-[#141414]/70">Type or speak like a human. Wealth Flow&apos;s neural parser identifies the transaction details automatically.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                    <AiTerminalComplete />
                    <AiTerminalFallback />
                </div>
            </Container>
        </section>
    );
}
