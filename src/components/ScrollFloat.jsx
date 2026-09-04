import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollFloat = ({
  children,
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    const words = text.split(' ');
    return words.map((word, wordIndex) => (
      <span className="inline-block whitespace-nowrap" key={`w-${wordIndex}`}>
        {word.split('').map((char, charIndex) => (
          <span className="inline-block sf-char" key={`c-${wordIndex}-${charIndex}`}>
            {char}
          </span>
        ))}
        {wordIndex < words.length - 1 && <span className="inline-block">&nbsp;</span>}
      </span>
    ));
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

    const charElements = el.querySelectorAll('.sf-char');

    const tween = gsap.fromTo(
      charElements,
      {
        willChange: 'opacity, transform',
        opacity: 0,
        yPercent: 120,
        scaleY: 2.3,
        scaleX: 0.7,
        transformOrigin: '50% 0%'
      },
      {
        duration: animationDuration,
        ease: ease,
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        stagger: stagger,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: scrollStart,
          end: scrollEnd,
          scrub: true,
          refreshPriority: 1,
          invalidateOnRefresh: true
        }
      }
    );

    const st = tween.scrollTrigger;
    const doRefresh = () => {
      if (!st) return;
      st.refresh();
    };
    // Wait a tick + a frame so layout (images, fonts) has settled before measuring.
    requestAnimationFrame(() => requestAnimationFrame(doRefresh));
    window.addEventListener('load', doRefresh);

    return () => {
      window.removeEventListener('load', doRefresh);
      if (st) st.kill();
      tween.scrollTrigger = null;
      tween.kill();
    };
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <h2 ref={containerRef} className={`my-5 ${containerClassName}`} style={{ wordBreak: 'normal', overflowWrap: 'normal', hyphens: 'none' }}>
      <span className={`inline-block leading-[1.05] ${textClassName}`}>{splitText}</span>
    </h2>
  );
};

export default ScrollFloat;
