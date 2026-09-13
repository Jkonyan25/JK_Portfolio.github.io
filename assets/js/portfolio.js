/*
	John Konyan — Portfolio
	Interaction layer: theme, navigation, scroll reveal, counters, parallax.
	No dependencies. Everything degrades gracefully without JavaScript.
*/

(function () {
	"use strict";

	var root = document.documentElement;
	var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ------------------------------------------------------------------
	   Theme (light / dark) with persistence
	   ------------------------------------------------------------------ */

	var toggle = document.getElementById("theme-toggle");
	var themeMeta = document.querySelector('meta[name="theme-color"]');

	function setTheme(theme) {
		root.setAttribute("data-theme", theme);
		try {
			localStorage.setItem("jk-theme", theme);
		} catch (e) {}
		if (toggle) {
			toggle.setAttribute(
				"aria-label",
				theme === "dark" ? "Switch to light appearance" : "Switch to dark appearance"
			);
		}
		if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#000000" : "#fbfbfd");
	}

	setTheme(root.getAttribute("data-theme") || "light");

	if (toggle) {
		toggle.addEventListener("click", function () {
			setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
		});
	}

	/* Follow the system setting until the visitor picks a side. */
	var systemDark = window.matchMedia("(prefers-color-scheme: dark)");
	var onSystemChange = function (e) {
		var stored = null;
		try {
			stored = localStorage.getItem("jk-theme");
		} catch (err) {}
		if (!stored) root.setAttribute("data-theme", e.matches ? "dark" : "light");
	};
	if (systemDark.addEventListener) systemDark.addEventListener("change", onSystemChange);
	else if (systemDark.addListener) systemDark.addListener(onSystemChange);

	/* ------------------------------------------------------------------
	   Mobile menu
	   ------------------------------------------------------------------ */

	var burger = document.getElementById("burger");
	var panel = document.getElementById("nav-panel");

	function closeMenu() {
		if (!panel || !burger) return;
		panel.classList.remove("is-open");
		burger.setAttribute("aria-expanded", "false");
		document.body.classList.remove("nav-open");
	}

	if (burger && panel) {
		burger.addEventListener("click", function () {
			var open = panel.classList.toggle("is-open");
			burger.setAttribute("aria-expanded", open ? "true" : "false");
			document.body.classList.toggle("nav-open", open);
		});

		panel.addEventListener("click", function (e) {
			if (e.target.closest("a")) closeMenu();
		});

		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape") closeMenu();
		});

		window.addEventListener("resize", function () {
			if (window.innerWidth > 860) closeMenu();
		});
	}

	/* ------------------------------------------------------------------
	   Smooth anchor scrolling that respects the fixed header
	   ------------------------------------------------------------------ */

	function headerOffset() {
		var nav = document.getElementById("nav");
		return (nav ? nav.offsetHeight : 52) + 12;
	}

	document.addEventListener("click", function (e) {
		var link = e.target.closest('a[href^="#"]');
		if (!link) return;

		var id = link.getAttribute("href");
		if (!id || id === "#") return;

		var target = document.querySelector(id);
		if (!target) return;

		e.preventDefault();
		var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();

		window.scrollTo({
			top: id === "#home" ? 0 : top,
			behavior: reduceMotion ? "auto" : "smooth"
		});

		/* Keep the URL shareable without the browser's instant jump. */
		if (history.replaceState) history.replaceState(null, "", id);
	});

	/* ------------------------------------------------------------------
	   Scroll reveal
	   ------------------------------------------------------------------ */

	var revealables = document.querySelectorAll("[data-reveal]");
	var pending = Array.prototype.slice.call(revealables);

	function reveal(el) {
		el.classList.add("is-visible");
		var i = pending.indexOf(el);
		if (i > -1) pending.splice(i, 1);
	}

	/* Safety net: anything scrolled into view is revealed even if the observer
	   missed it during a very fast scroll or an instant jump to an anchor. */
	function sweepReveals() {
		if (!pending.length) return;
		var limit = window.innerHeight * 0.94;
		pending.slice().forEach(function (el) {
			if (el.getBoundingClientRect().top < limit) reveal(el);
		});
	}

	if (!("IntersectionObserver" in window) || reduceMotion) {
		pending.slice().forEach(reveal);
	} else {
		var revealObserver = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						reveal(entry.target);
						revealObserver.unobserve(entry.target);
					}
				});
			},
			{ rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
		);

		Array.prototype.forEach.call(revealables, function (el) {
			revealObserver.observe(el);
		});
	}

	/* ------------------------------------------------------------------
	   Animated statistics
	   ------------------------------------------------------------------ */

	function countUp(el) {
		var target = parseFloat(el.getAttribute("data-count"));
		var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
		var suffix = el.getAttribute("data-suffix") || "";

		if (isNaN(target)) return;
		if (reduceMotion) {
			el.textContent = target.toFixed(decimals) + suffix;
			return;
		}

		var duration = 1600;
		var start = null;

		function step(now) {
			if (start === null) start = now;
			var progress = Math.min((now - start) / duration, 1);
			var eased = 1 - Math.pow(1 - progress, 3); /* easeOutCubic */
			el.textContent = (target * eased).toFixed(decimals) + suffix;
			if (progress < 1) requestAnimationFrame(step);
		}

		requestAnimationFrame(step);
	}

	var counters = document.querySelectorAll("[data-count]");

	if (!("IntersectionObserver" in window)) {
		Array.prototype.forEach.call(counters, countUp);
	} else {
		var countObserver = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						countUp(entry.target);
						countObserver.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.6 }
		);

		Array.prototype.forEach.call(counters, function (el) {
			countObserver.observe(el);
		});
	}

	/* ------------------------------------------------------------------
	   Active section highlighting
	   ------------------------------------------------------------------ */

	var navLinks = document.querySelectorAll(".nav__link");
	var sections = [];

	Array.prototype.forEach.call(navLinks, function (link) {
		var section = document.querySelector(link.getAttribute("href"));
		if (section) sections.push({ link: link, section: section });
	});

	function highlight() {
		var pos = window.pageYOffset + headerOffset() + 40;
		var current = null;

		sections.forEach(function (item) {
			if (item.section.offsetTop <= pos) current = item.link;
		});

		/* At the very bottom, the last section wins even if it is short. */
		if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 4 && sections.length) {
			current = sections[sections.length - 1].link;
		}

		Array.prototype.forEach.call(navLinks, function (link) {
			link.classList.toggle("is-active", link === current);
		});
	}

	/* ------------------------------------------------------------------
	   Scroll-driven chrome: progress bar, sticky nav, back-to-top, parallax
	   ------------------------------------------------------------------ */

	var progress = document.getElementById("progress");
	var nav = document.getElementById("nav");
	var toTop = document.getElementById("totop");
	var heroFigure = document.getElementById("hero-figure");
	var ticking = false;

	function onScroll() {
		var y = window.pageYOffset;
		var max = document.documentElement.scrollHeight - window.innerHeight;

		if (progress) progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
		if (nav) nav.classList.toggle("is-stuck", y > 8);
		if (toTop) toTop.classList.toggle("is-shown", y > window.innerHeight * 0.7);

		if (heroFigure && !reduceMotion && y < window.innerHeight) {
			heroFigure.style.transform = "translate3d(0," + y * 0.08 + "px,0)";
		}

		sweepReveals();
		highlight();
		ticking = false;
	}

	window.addEventListener(
		"scroll",
		function () {
			if (!ticking) {
				window.requestAnimationFrame(onScroll);
				ticking = true;
			}
		},
		{ passive: true }
	);

	window.addEventListener("resize", highlight);
	onScroll();

	if (toTop) {
		toTop.addEventListener("click", function () {
			window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
		});
	}

	/* ------------------------------------------------------------------
	   "Show more" on experience cards (small screens only)
	   ------------------------------------------------------------------ */

	Array.prototype.forEach.call(document.querySelectorAll(".job__toggle"), function (btn) {
		btn.addEventListener("click", function () {
			var job = btn.closest(".job");
			var expanded = btn.getAttribute("aria-expanded") === "true";

			job.classList.toggle("is-expanded", !expanded);
			btn.setAttribute("aria-expanded", expanded ? "false" : "true");
			btn.innerHTML = expanded
				? 'Show more <i class="fas fa-chevron-down" aria-hidden="true"></i>'
				: 'Show less <i class="fas fa-chevron-down" aria-hidden="true"></i>';
		});
	});

	/* ------------------------------------------------------------------
	   Footer year
	   ------------------------------------------------------------------ */

	var year = document.getElementById("year");
	if (year) year.textContent = new Date().getFullYear();
})();
