$(document).ready(function() {

    function validateField(field) {
        let isValid = true;
        let value = field.val();
        let feedback = field.closest('div').find('.invalid-feedback');

        field.removeClass('is-invalid is-valid');

        switch(field.attr('id')) {
            case 'fullName':
                isValid = value.trim().length >= 3;
                feedback.text(isValid ? '' : 'Full name must be at least 3 characters.');
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                feedback.text(isValid ? '' : 'Please enter a valid email address.');
                break;
            case 'phone':
                const phoneRegex = /^\d{10,}$/;
                isValid = phoneRegex.test(value.replace(/\D/g, ''));
                feedback.text(isValid ? '' : 'Phone must be at least 10 digits.');
                break;
            case 'postalCode':
                const postalRegex = /^\d{4,6}$/;
                isValid = postalRegex.test(value);
                feedback.text(isValid ? '' : 'Must be a 4-6 digit postal code.');
                break;
            case 'country':
            case 'address':
            case 'city':
                isValid = value.trim() !== '';
                feedback.text(isValid ? '' : 'This field is required.');
                break;
            case 'cc-name':
            case 'cc-number':
            case 'cc-expiration':
            case 'cc-cvv':
                if ($('#credit').is(':checked')) {
                    isValid = value.trim() !== '';
                    feedback.text(isValid ? '' : 'This field is required for credit card payment.');
                }
                break;
        }
        
        if (field.is(':not(:radio)')) {
            if (!isValid) {
                field.addClass('is-invalid');
            } else {
                field.addClass('is-valid');
            }
        }
        return isValid;
    }

    $('#checkout-form input:not(:radio), #checkout-form select').on('keyup change blur', function() {
        validateField($(this));
    });

    $('input[name="paymentMethod"]').on('change', function() {
        const isCreditCard = $('#credit').is(':checked');
        $('#credit-card-fields').toggle(isCreditCard);
        
        if (!isCreditCard) {
            $('#credit-card-fields input').removeClass('is-invalid is-valid');
        }
    });

    $('#checkout-form').on('submit', function(event) {
        event.preventDefault();
        
        let isFormValid = true;
        let firstError = null;

        const fieldsToValidate = $('#fullName, #email, #phone, #address, #city, #postalCode, #country');
        fieldsToValidate.each(function() {
            if (!validateField($(this))) {
                isFormValid = false;
                if (!firstError) firstError = $(this);
            }
        });

        if ($('#credit').is(':checked')) {
            $('#cc-name, #cc-number, #cc-expiration, #cc-cvv').each(function() {
                if (!validateField($(this))) {
                    isFormValid = false;
                    if (!firstError) firstError = $(this);
                }
            });
        }
        
        if (!$('#terms').is(':checked')) {
            isFormValid = false;
            $('#terms').addClass('is-invalid');
            $('#terms').next('.invalid-feedback').show();
            if (!firstError) firstError = $('#terms');
        } else {
            $('#terms').removeClass('is-invalid');
            $('#terms').next('.invalid-feedback').hide();
        }

        if (isFormValid) {
            alert('Form submitted successfully!');
        } else {
            if (firstError) {
                let errorAccordion = firstError.closest('.accordion-collapse');
                if (errorAccordion.length > 0 && !errorAccordion.hasClass('show')) {
                    new bootstrap.Collapse(errorAccordion[0]).show();
                }

                $('html, body').animate({
                    scrollTop: firstError.offset().top - 100
                }, 500);
            }
        }
    });
    
    $('#terms').on('change', function() {
        $('#placeOrderBtn').prop('disabled', !$(this).is(':checked'));
        if ($(this).is(':checked')) {
            $(this).removeClass('is-invalid');
        }
    });
});
