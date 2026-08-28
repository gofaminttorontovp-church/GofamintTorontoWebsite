'use client';
import React from 'react';

/**
 * Scroll progress from 0 to 1 over the first `distance` pixels of the page,
 * written straight onto the element as the `--header-p` custom property.
 *
 * Deliberately skips React state: a scroll-linked value would re-render on
 * every frame, and the point here is one style write per frame so the shape
 * tracks the scroll rather than stepping behind it. Adapted from the
 * threshold-boolean useScroll hook that shipped with the header design.
 */
export function useScrollProgress<T extends HTMLElement>(distance: number) {
	const ref = React.useRef<T | null>(null);

	React.useEffect(() => {
		let frame = 0;

		const apply = () => {
			frame = 0;
			const el = ref.current;
			if (!el) return;
			const p = Math.min(1, Math.max(0, window.scrollY / distance));
			el.style.setProperty('--header-p', p.toFixed(4));
		};

		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(apply);
		};

		// also check on first load — the page can open part-way down
		apply();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	}, [distance]);

	return ref;
}
