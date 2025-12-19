$(document).ready(function() {

    function validateField(field) {
        let isValid = true;
        let value = field.val();
        let feedback = field.next('.invalid-feedback');
        if (field.parent().hasClass('form-floating')) {
            feedback = field.parent().find('.invalid-feedback');
        }

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

                if ($('#credit').is(':checked')) {
                    isValid = value.trim() !== '';
                }
                break;
        }

        field.addClass(isValid ? 'is-valid' : 'is-invalid');
        return isValid;
    }


    $('input[name="paymentMethod"]').on('change', function() {
        const isCreditCard = $('#credit').is(':checked');
        $('#credit-card-fields').toggleClass('d-none', !isCreditCard);

        if (!isCreditCard) {
            $('#credit-card-fields input').removeClass('is-invalid is-valid');
        }
    });

    $('#terms').on('change', function() {
        $('#placeOrderBtn').prop('disabled', !this.checked);
        if (this.checked) {
            $(this).removeClass('is-invalid').addClass('is-valid');
        } else {
             $(this).addClass('is-invalid');
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

        if (!$('input[name="paymentMethod"]:checked').val()) {
            isFormValid = false;
            $('#payment-method-feedback').show();
            if (!firstError) firstError = $('#credit');
        } else {
            $('#payment-method-feedback').hide();
        }

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
            if (!firstError) firstError = $('#terms');
        } else {
            $('#terms').removeClass('is-invalid');
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
});
