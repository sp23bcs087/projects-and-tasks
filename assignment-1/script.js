(function () {
  'use strict'

  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })

  const termsCheckbox = document.getElementById('terms');
  const placeOrderBtn = document.getElementById('placeOrderBtn');

  termsCheckbox.addEventListener('change', function() {
    placeOrderBtn.disabled = !this.checked;
  });

})()
