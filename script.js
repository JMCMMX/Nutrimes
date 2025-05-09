document.addEventListener('DOMContentLoaded', function () {
    const formRegistroProduccion = document.getElementById('formRegistroProduccion');
    const formResponseMessage = document.getElementById('formResponseMessage');

    if (formRegistroProduccion) {
        formRegistroProduccion.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevenir el envío tradicional del formulario

            const formData = new FormData(formRegistroProduccion);
            const submitButton = formRegistroProduccion.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;

            submitButton.disabled = true;
            submitButton.textContent = 'Guardando...';
            formResponseMessage.innerHTML = '';
            formResponseMessage.className = 'form-message';

            // Enviar datos al script PHP usando fetch
            // La ruta 'api/guardar_produccion.php' asume que la carpeta 'api' está
            // en el mismo nivel que 'formulario_produccion.html' desde la raíz del servidor.
            fetch('api/guardar_produccion.php', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().catch(() => {
                        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
                    }).then(errData => { throw errData; });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    formResponseMessage.textContent = data.message;
                    formResponseMessage.className = 'form-message success';
                    formRegistroProduccion.reset(); // Limpiar el formulario
                } else {
                    formResponseMessage.textContent = data.message || 'Ocurrió un error desconocido.';
                    formResponseMessage.className = 'form-message error';
                }
            })
            .catch(error => {
                console.error('Error en la solicitud fetch:', error);
                let errorMessage = 'Error al conectar con el servidor.';
                if (error && error.message) {
                    errorMessage = error.message;
                } else if (typeof error === 'string') {
                    errorMessage = error;
                }
                formResponseMessage.textContent = errorMessage;
                formResponseMessage.className = 'form-message error';
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            });
        });
    }

    console.log('Formulario de producción (formulario_produccion.html) inicializado.');
    
});

