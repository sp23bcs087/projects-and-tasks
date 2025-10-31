$(document).ready(function() {

    // --- FIELD VALIDATION FUNCTION ---
    function validateField(field) {
        let isValid = true;
        let value = field.val();
        let feedback = field.next('.invalid-feedback');
        if (field.parent().hasClass('form-floating')) {
            feedback = field.parent().find('.invalid-feedback');
        }

        // Reset validation state
        field.removeClass('is-invalid is-valid');

        switch(field.attr('id')) {
            case 'fullName':
                isValid = value.trim().length >= 3;
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                break;
            case 'phone':
                const phoneRegex = /^\d{10,}$/;
                isValid = phoneRegex.test(value.replace(/\D/g, ''));
                break;
            case 'postalCode':
                const postalRegex = /^\d{4,6}$/;
                isValid = postalRegex.test(value);
                break;
            case 'country':
            case 'address':
            case 'city':
                isValid = value.trim() !== '';
                break;
            case 'cc-name':
            case 'cc-number':
            case 'cc-expiration':
            case 'cc-cvv':
                // Only validate if credit card is the selected payment method
                if ($('#credit').is(':checked')) {
                    isValid = value.trim() !== '';
                }
                break;
        }
        
        // Apply classes based on validity
        field.addClass(isValid ? 'is-valid' : 'is-invalid');
        return isValid;
    }

    // --- EVENT LISTENERS ---

    // Toggle credit card fields based on payment method
    $('input[name="paymentMethod"]').on('change', function() {
        const isCreditCard = $('#credit').is(':checked');
        $('#credit-card-fields').toggleClass('d-none', !isCreditCard);
        
        // Clear validation if credit card is not selected
        if (!isCreditCard) {
            $('#credit-card-fields input').removeClass('is-invalid is-valid');
        }
    });

    // Enable/disable submit button based on terms checkbox
    $('#terms').on('change', function() {
        $('#placeOrderBtn').prop('disabled', !this.checked);
        if (this.checked) {
            $(this).removeClass('is-invalid').addClass('is-valid');
        } else {
             $(this).addClass('is-invalid');
        }
    });
    
    // Form submission handler
    $('#checkout-form').on('submit', function(event) {
        event.preventDefault();
        
        let isFormValid = true;
        let firstError = null;
        
        // Fields that are always required
        const fieldsToValidate = $('#fullName, #email, #phone, #address, #city, #postalCode, #country');
        
        fieldsToValidate.each(function() {
            if (!validateField($(this))) {
                isFormValid = false;
                if (!firstError) firstError = $(this);
            }
        });

        // Validate payment method
        if (!$('input[name="paymentMethod"]:checked').val()) {
            isFormValid = false;
            $('#payment-method-feedback').show();
            if (!firstError) firstError = $('#credit');
        } else {
            $('#payment-method-feedback').hide();
        }

        // Conditionally validate credit card fields
        if ($('#credit').is(':checked')) {
            $('#cc-name, #cc-number, #cc-expiration, #cc-cvv').each(function() {
                if (!validateField($(this))) {
                    isFormValid = false;
                    if (!firstError) firstError = $(this);
                }
            });
        }
        
        // Validate terms checkbox
        if (!$('#terms').is(':checked')) {
            isFormValid = false;
            $('#terms').addClass('is-invalid');
            if (!firstError) firstError = $('#terms');
        } else {
            $('#terms').removeClass('is-invalid');
        }

        // If form is valid, show success. Otherwise, focus the first error.
        if (isFormValid) {
            alert('Form submitted successfully!');
            // Here you would typically send the data to a server
        } else {
            if (firstError) {
                // Ensure the accordion containing the error is open
                let errorAccordion = firstError.closest('.accordion-collapse');
                if (errorAccordion.length > 0 && !errorAccordion.hasClass('show')) {
                    new bootstrap.Collapse(errorAccordion[0]).show();
                }

                // Smooth scroll to the first error
                $('html, body').animate({
                    scrollTop: firstError.offset().top - 100
                }, 500);
            }
        }
    });
});