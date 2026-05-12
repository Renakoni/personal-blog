export function initMotionReveal() {
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const targets = Array.from(document.querySelectorAll<HTMLElement>('.anime-entry, .projects-entry, #home-posts > *'))
		.filter((element) => !element.hasAttribute('data-motion-reveal-bound'));

	targets.forEach((element, index) => {
		element.setAttribute('data-motion-reveal-bound', 'true');
		element.style.setProperty('--motion-reveal-index', String(Math.min(index % 8, 7)));
		if (!element.classList.contains('onload-animation')) {
			element.classList.add('motion-reveal');
		}
	});

	if (reduceMotion || targets.length === 0) {
		targets.forEach((element) => element.classList.add('motion-reveal--visible'));
		return;
	}

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;
			entry.target.classList.add('motion-reveal--visible');
			observer.unobserve(entry.target);
		});
	}, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

	targets.forEach((element) => observer.observe(element));
}
