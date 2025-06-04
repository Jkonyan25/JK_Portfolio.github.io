document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const name = document.getElementById('demo-name').value;
        const email = document.getElementById('demo-email').value;
        const message = document.getElementById('demo-message').value;
        const sendCopy = document.getElementById('demo-copy').checked;
        
        // Show sending status
        const submitButton = contactForm.querySelector('input[type="submit"]');
        const originalText = submitButton.value;
        submitButton.value = 'Sending...';
        submitButton.disabled = true;

        // First email - User's message to you
        const messageToYou = {
            to_email: 'jkonyanswengineer@gmail.com',
            to_name: 'John Konyan',
            from_name: name,
            from_email: email,
            message: message,
            reply_to: email  // Ensure replies go back to the sender
        };

        // Send the initial email
        emailjs.send('service_304ig7d', 'template_kkd08cg', messageToYou)
            .then(function(response) {
                console.log('Main message sent!', response.status, response.text);
                submitButton.value = 'Sent!';
                
                // Send auto-reply if requested
                if (sendCopy) {
                    // Second email - Your auto-reply to the user
                    const autoReply = {
                        to_email: email,        // User's email
                        to_name: name,          // User's name
                        from_name: 'John Konyan',
                        from_email: 'jkonyanswengineer@gmail.com',
                        message: `Dear ${name},\n\nThank you for contacting me. I have received your message and will get back to you as soon as possible.\n\nBest regards,\nJohn Konyan`,
                        reply_to: 'jkonyanswengineer@gmail.com'
                    };
                    
                    // Use a different template for auto-reply if available
                    return emailjs.send('service_304ig7d', 'template_kkd08cg', autoReply);
                }
            })
            .then(function(response) {
                if (response) {
                    console.log('Auto-reply sent!', response.status, response.text);
                }
                // Reset form
                contactForm.reset();
                setTimeout(() => {
                    submitButton.value = originalText;
                    submitButton.disabled = false;
                }, 2000);
            })
            .catch(function(error) {
                console.log('FAILED...', error);
                submitButton.value = 'Error!';
                alert('There was an error sending your message. Please try again.');
                setTimeout(() => {
                    submitButton.value = originalText;
                    submitButton.disabled = false;
                }, 2000);
            });
    });
}); 