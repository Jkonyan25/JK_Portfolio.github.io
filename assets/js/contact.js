/*
	Contact form — EmailJS delivery with inline, accessible status feedback.
*/

document.addEventListener("DOMContentLoaded", function () {
	var form = document.getElementById("contact-form");
	if (!form) return;

	var button = document.getElementById("submit-btn");
	var status = document.getElementById("form-status");
	var buttonHTML = button ? button.innerHTML : "";
	var resetTimer;

	var SERVICE_ID = "service_304ig7d";
	var TEMPLATE_ID = "template_kkd08cg";
	var MY_EMAIL = "jkonyanswengineer@gmail.com";

	function say(message, state) {
		if (!status) return;
		status.textContent = message;
		status.classList.remove("is-ok", "is-err");
		if (state) status.classList.add(state);
		status.classList.add("is-shown");
	}

	function restore(delay) {
		clearTimeout(resetTimer);
		resetTimer = setTimeout(function () {
			if (button) {
				button.innerHTML = buttonHTML;
				button.disabled = false;
			}
		}, delay);
	}

	form.addEventListener("submit", function (e) {
		e.preventDefault();

		var name = document.getElementById("demo-name");
		var email = document.getElementById("demo-email");
		var message = document.getElementById("demo-message");
		var sendCopy = document.getElementById("demo-copy").checked;

		/* Let the browser point at the first problem field. */
		if (!form.checkValidity()) {
			say("Please fill in your name, a valid email, and a message.", "is-err");
			var invalid = form.querySelector(":invalid");
			if (invalid) invalid.focus();
			return;
		}

		if (typeof emailjs === "undefined") {
			say("The mail service didn't load. Please email me directly at " + MY_EMAIL + ".", "is-err");
			return;
		}

		if (button) {
			button.disabled = true;
			button.textContent = "Sending…";
		}
		say("Sending your message…");

		emailjs
			.send(SERVICE_ID, TEMPLATE_ID, {
				to_email: MY_EMAIL,
				to_name: "John Konyan",
				from_name: name.value,
				from_email: email.value,
				message: message.value,
				reply_to: email.value
			})
			.then(function () {
				if (!sendCopy) return null;

				return emailjs.send(SERVICE_ID, TEMPLATE_ID, {
					to_email: email.value,
					to_name: name.value,
					from_name: "John Konyan",
					from_email: MY_EMAIL,
					message:
						"Dear " +
						name.value +
						",\n\nThank you for contacting me. I have received your message and will get back to you as soon as possible.\n\nBest regards,\nJohn Konyan",
					reply_to: MY_EMAIL
				});
			})
			.then(function () {
				form.reset();
				if (button) button.textContent = "Sent";
				say(
					sendCopy
						? "Thanks — your message is on its way, and a confirmation is heading to your inbox."
						: "Thanks — your message is on its way. I'll be in touch soon.",
					"is-ok"
				);
				restore(2600);
			})
			.catch(function (error) {
				console.error("Contact form failed:", error);
				if (button) button.textContent = "Try again";
				say("Something went wrong. Please email me directly at " + MY_EMAIL + ".", "is-err");
				restore(2600);
			});
	});
});
