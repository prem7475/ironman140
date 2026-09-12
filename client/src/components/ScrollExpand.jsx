import { useEffect, useRef } from 'react';
import './ScrollExpand.css';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const ScrollExpand = ({ src, mobileSrc, alt = '', title = '', children, className = '', ...props }) => {
  const rootRef = useRef(null);
  const frameRef = useRef(null);
  const mediaRef = useRef(null);
  const mobileMediaRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const frame = frameRef.current;
    const media = mediaRef.current;
    const mobileMedia = mobileMediaRef.current;
    if (!root || !frame || !media) return undefined;
    let frameId = 0;
    const update = () => {
      const bounds = root.getBoundingClientRect();
      const progress = clamp((window.innerHeight - bounds.top) / (window.innerHeight + bounds.height), 0, 1);
      const eased = progress * progress * (3 - 2 * progress);
      const inset = 24 - eased * 24;
      frame.style.clipPath = `inset(${inset}% ${inset * 1.35}% ${inset}% ${inset * 1.35}% round ${24 - eased * 24}px)`;
      media.style.transform = `scale(${1.22 - eased * 0.22})`;
      if (mobileMedia) mobileMedia.style.transform = `scale(${1.22 - eased * 0.22})`;
      frame.style.setProperty('--scroll-expand-scrim', String(eased * 0.48));
    };
    const onScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(frameId); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  return (
    <section ref={rootRef} className={`scroll-expand ${className}`} {...props}>
      <div ref={frameRef} className="scroll-expand__frame">
        <img ref={mediaRef} src={src} alt={alt} className={`scroll-expand__media ${mobileSrc ? 'hidden sm:block' : ''}`} />
        {mobileSrc && <img ref={mobileMediaRef} src={mobileSrc} alt={alt} className="scroll-expand__media block sm:hidden" />}
        <div className="scroll-expand__scrim" />
        {children && <div className="scroll-expand__content">{children}</div>}
      </div>
      {title && <h2 className="scroll-expand__title">{title}</h2>}
    </section>
  );
};

export default ScrollExpand;
