document.addEventListener('DOMContentLoaded', function () {
    const formRegistroProduccion = document.getElementById('formRegistroProduccion');
    const formResponseMessage = document.getElementById('formResponseMessage');

    // Campos del formulario
    const otSelect = document.getElementById('ot');
    const lineaInput = document.getElementById('linea');
    const productoInput = document.getElementById('producto');
    const itemInput = document.getElementById('item');
    // const idExternoInput = document.getElementById('id_externo'); // Ya no se interactúa con él directamente aquí
    // const cantidadInput = document.getElementById('cantidad');   // Ya no se interactúa con él directamente aquí

    let planesMaestrosData = []; // Para almacenar los datos de planes_maestros

    // Función para poblar el select de OT
    function poblarOTs() {
        // La ruta es relativa a la ubicación de formulario_produccion.html
        fetch('api/get_planes_ot.php')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar OTs: ' + response.statusText);
                }
                return response.json();
            })
            .then(result => {
                otSelect.innerHTML = '<option value="">Seleccione una OT...</option>'; // Opción por defecto
                if (result.success && result.data && result.data.length > 0) {
                    planesMaestrosData = result.data; // Guardar todos los datos

                    // Crear opciones únicas para el select de OT
                    const otsUnicas = [...new Set(planesMaestrosData.map(plan => plan.ot))];
                    otsUnicas.sort(); // Opcional: ordenar OTs

                    otsUnicas.forEach(otValue => {
                        if (otValue) { // Asegurarse que no sea null o vacío
                            const option = document.createElement('option');
                            option.value = otValue;
                            option.textContent = otValue;
                            otSelect.appendChild(option);
                        }
                    });
                } else {
                    otSelect.innerHTML = `<option value="">${result.message || 'No hay OTs disponibles'}</option>`;
                    console.warn("Respuesta de get_planes_ot.php:", result.message || "No hay datos de OTs.");
                }
            })
            .catch(error => {
                otSelect.innerHTML = `<option value="">Error de red al cargar OTs</option>`;
                console.error('Error en fetch para poblar OTs:', error);
            });
    }

    // Función para autocompletar campos cuando se selecciona una OT
    function autocompletarCamposPorOT() {
        const selectedOT = otSelect.value;

        // Limpiar campos dependientes
        lineaInput.value = '';
        productoInput.value = '';
        itemInput.value = '';

        if (selectedOT && planesMaestrosData.length > 0) {
            // Encontrar el primer plan que coincida con la OT seleccionada
            // Si una OT puede tener múltiples productos/items/líneas en planes_maestros,
            // esta lógica tomará los del primer plan encontrado para esa OT.
            const planSeleccionado = planesMaestrosData.find(plan => plan.ot === selectedOT);

            if (planSeleccionado) {
                lineaInput.value = planSeleccionado.linea || '';
                productoInput.value = planSeleccionado.producto || '';
                itemInput.value = planSeleccionado.item || '';
            } else {
                console.warn(`No se encontraron detalles para la OT: ${selectedOT}`);
            }
        }
    }

    // Cargar OTs al iniciar la página
    if (otSelect) {
        poblarOTs();
        otSelect.addEventListener('change', autocompletarCamposPorOT);
    }

    // Manejar el envío del formulario (el resto de la lógica de envío es similar a antes)
    if (formRegistroProduccion) {
        formRegistroProduccion.addEventListener('submit', function (event) {
            event.preventDefault();

            const formData = new FormData(formRegistroProduccion); // FormData recogerá los valores actuales de los campos
            const submitButton = formRegistroProduccion.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;

            submitButton.disabled = true;
            submitButton.textContent = 'Guardando...';
            formResponseMessage.innerHTML = '';
            formResponseMessage.className = 'form-message';

            fetch('api/guardar_produccion.php', { // El script de guardado no cambia
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
                    // Resetear campos autocompletados y el select de OT
                    lineaInput.value = '';
                    productoInput.value = '';
                    itemInput.value = '';
                    if (otSelect) otSelect.value = ''; // Volver a "Seleccione una OT..."
                } else {
                    formResponseMessage.textContent = data.message || 'Ocurrió un error desconocido.';
                    formResponseMessage.className = 'form-message error';
                }
            })
            .catch(error => {
                console.error('Error en la solicitud fetch:', error);
                let errorMessage = 'Error al conectar con el servidor.';
                if (error && error.message) errorMessage = error.message;
                formResponseMessage.textContent = errorMessage;
                formResponseMessage.className = 'form-message error';
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            });
        });
    }
    console.log('Formulario de Registro de Producción (con OTs dinámicas) inicializado.');
});