document.addEventListener('DOMContentLoaded', function () {
    const pmpLineaSelect = document.getElementById('pmpLinea');
    const pmpTipoSelect = document.getElementById('pmpTipo');
    const pmpGpmInput = document.getElementById('pmpGpm');
    const pmpCantidadTotalInput = document.getElementById('pmpCantidadTotal');
    const pmpDiasProduccionInput = document.getElementById('pmpDiasProduccion');

    let capacidadesData = []; // Para almacenar los datos de capacidades

    function poblarLineas() {
        // La ruta a la API es relativa a la ubicación de plan_maestro.html
        // Si plan_maestro.html está en la raíz y api/ está en la raíz, 'api/get_capacidades.php' es correcto.
        fetch('api/get_capacidades.php')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar datos de capacidades: ' + response.statusText);
                }
                return response.json();
            })
            .then(result => {
                if (result.success && result.data) {
                    capacidadesData = result.data;
                    pmpLineaSelect.innerHTML = '<option value="">Seleccione linea...</option>';

                    const maquinasUnicas = [...new Set(capacidadesData.map(item => item.maquina))];
                    maquinasUnicas.sort(); // Opcional: ordenar alfabéticamente

                    maquinasUnicas.forEach(maquina => {
                        const option = document.createElement('option');
                        option.value = maquina;
                        option.textContent = maquina;
                        pmpLineaSelect.appendChild(option);
                    });
                } else {
                    pmpLineaSelect.innerHTML = `<option value="">Error: ${result.message || 'No se cargaron líneas'}</option>`;
                    console.error("Error al poblar líneas:", result.message);
                }
            })
            .catch(error => {
                pmpLineaSelect.innerHTML = `<option value="">Error de red al cargar líneas</option>`;
                console.error('Error en fetch para poblar Líneas:', error);
            });
    }

    function actualizarCalculos() {
        const maquinaSeleccionada = pmpLineaSelect.value;
        const tipoSeleccionado = pmpTipoSelect.value;
        const cantidadTotal = parseFloat(pmpCantidadTotalInput.value);
        let gpm = 0;

        pmpGpmInput.value = '';
        pmpDiasProduccionInput.value = '';

        if (maquinaSeleccionada && tipoSeleccionado && capacidadesData.length > 0) {
            const capacidad = capacidadesData.find(c => c.maquina === maquinaSeleccionada);
            if (capacidad) {
                if (tipoSeleccionado === 'frutas' && capacidad.gpm_frutas != null) { // != null también cubre undefined
                    gpm = parseFloat(capacidad.gpm_frutas);
                } else if (tipoSeleccionado === 'cereal' && capacidad.gpm_cereal != null) {
                    gpm = parseFloat(capacidad.gpm_cereal);
                }
            }
        }

        if (gpm > 0) {
            pmpGpmInput.value = gpm;
            if (!isNaN(cantidadTotal) && cantidadTotal > 0) {
                const horasLaboralesPorDia = 8; // Puedes hacer esto configurable o una constante
                const minutosPorDia = horasLaboralesPorDia * 60;
                const minutosTotales = cantidadTotal / gpm;
                const diasEstimados = minutosTotales / minutosPorDia;
                pmpDiasProduccionInput.value = diasEstimados.toFixed(2);
            } else {
                 pmpDiasProduccionInput.value = "Ingrese cantidad";
            }
        } else if (maquinaSeleccionada && tipoSeleccionado) {
            pmpGpmInput.value = "N/A";
            pmpDiasProduccionInput.value = "GPM no disponible";
        }
    }

    if (pmpLineaSelect) {
        poblarLineas();
        pmpLineaSelect.addEventListener('change', actualizarCalculos);
    }
    if (pmpTipoSelect) {
        pmpTipoSelect.addEventListener('change', actualizarCalculos);
    }
    if (pmpCantidadTotalInput) {
        pmpCantidadTotalInput.addEventListener('input', actualizarCalculos); // 'input' es más reactivo que 'change' para campos de texto/número
    }

    console.log('Plan Maestro de Producción UI (plan_maestro.html) inicializado.');
});
document.addEventListener('DOMContentLoaded', function () {
    const pmpLineaSelect = document.getElementById('pmpLinea');
    const pmpTipoSelect = document.getElementById('pmpTipo');
    const pmpOTInput = document.getElementById('pmpOT'); // Nuevo
    const pmpProductoInput = document.getElementById('pmpProducto'); // Nuevo
    const pmpItemInput = document.getElementById('pmpItem'); // Nuevo
    const pmpGpmInput = document.getElementById('pmpGpm');
    const pmpCantidadTotalInput = document.getElementById('pmpCantidadTotal');
    const pmpDiasProduccionInput = document.getElementById('pmpDiasProduccion');

    // Para el formulario y mensajes
    const formPlanMaestro = document.getElementById('formPlanMaestro'); // Nuevo
    const pmpFormResponseMessage = document.getElementById('pmpFormResponseMessage'); // Nuevo

    let capacidadesData = [];

    function poblarLineas() {
        fetch('api/get_capacidades.php')
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar datos de capacidades: ' + response.statusText);
                return response.json();
            })
            .then(result => {
                if (result.success && result.data) {
                    capacidadesData = result.data;
                    pmpLineaSelect.innerHTML = '<option value="">Seleccione línea...</option>';
                    const maquinasUnicas = [...new Set(capacidadesData.map(item => item.maquina))];
                    maquinasUnicas.sort();
                    maquinasUnicas.forEach(maquina => {
                        const option = document.createElement('option');
                        option.value = maquina;
                        option.textContent = maquina;
                        pmpLineaSelect.appendChild(option);
                    });
                } else {
                    pmpLineaSelect.innerHTML = `<option value="">Error: ${result.message || 'No se cargaron líneas'}</option>`;
                }
            })
            .catch(error => {
                pmpLineaSelect.innerHTML = `<option value="">Error de red al cargar líneas</option>`;
                console.error('Error en fetch para poblar Líneas:', error);
            });
    }

    function actualizarCalculos() {
        const maquinaSeleccionada = pmpLineaSelect.value;
        const tipoSeleccionado = pmpTipoSelect.value;
        const cantidadTotal = parseFloat(pmpCantidadTotalInput.value);
        let gpm = 0;

        pmpGpmInput.value = '';
        pmpDiasProduccionInput.value = '';

        if (maquinaSeleccionada && tipoSeleccionado && capacidadesData.length > 0) {
            const capacidad = capacidadesData.find(c => c.maquina === maquinaSeleccionada);
            if (capacidad) {
                if (tipoSeleccionado === 'frutas' && capacidad.gpm_frutas != null) {
                    gpm = parseFloat(capacidad.gpm_frutas);
                } else if (tipoSeleccionado === 'cereal' && capacidad.gpm_cereal != null) {
                    gpm = parseFloat(capacidad.gpm_cereal);
                }
            }
        }

        if (gpm > 0) {
            pmpGpmInput.value = gpm; // Guardamos el GPM calculado en el input
            if (!isNaN(cantidadTotal) && cantidadTotal > 0) {
                const horasLaboralesPorDia = 8;
                const minutosPorDia = horasLaboralesPorDia * 60;
                const minutosTotales = cantidadTotal / gpm;
                const diasEstimados = minutosTotales / minutosPorDia;
                pmpDiasProduccionInput.value = diasEstimados.toFixed(2); // Guardamos días en el input
            } else {
                pmpDiasProduccionInput.value = "Ingrese cantidad";
            }
        } else if (maquinaSeleccionada && tipoSeleccionado) {
            pmpGpmInput.value = "N/A";
            pmpDiasProduccionInput.value = "GPM no disponible";
        }
    }

    // Event listeners para cálculos
    if (pmpLineaSelect) {
        poblarLineas();
        pmpLineaSelect.addEventListener('change', actualizarCalculos);
    }
    if (pmpTipoSelect) {
        pmpTipoSelect.addEventListener('change', actualizarCalculos);
    }
    if (pmpCantidadTotalInput) {
        pmpCantidadTotalInput.addEventListener('input', actualizarCalculos);
    }

    // NUEVO: Event listener para el envío del formulario del Plan Maestro
    if (formPlanMaestro) {
        formPlanMaestro.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevenir el envío normal del formulario

            // Recolectar todos los datos del formulario, incluyendo los readonly
            const formData = new FormData();
            formData.append('pmpLinea', pmpLineaSelect.value);
            formData.append('pmpTipo', pmpTipoSelect.value);
            formData.append('pmpOT', pmpOTInput.value);
            formData.append('pmpProducto', pmpProductoInput.value);
            formData.append('pmpItem', pmpItemInput.value);
            formData.append('pmpGpm', pmpGpmInput.value); // GPM calculado
            formData.append('pmpCantidadTotal', pmpCantidadTotalInput.value);
            formData.append('pmpDiasProduccion', pmpDiasProduccionInput.value); // Días calculados

            const submitButton = formPlanMaestro.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;

            submitButton.disabled = true;
            submitButton.textContent = 'Guardando...';
            pmpFormResponseMessage.innerHTML = '';
            pmpFormResponseMessage.className = 'pmp-form-message';

            fetch('api/guardar_plan_maestro.php', {
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
                    pmpFormResponseMessage.textContent = data.message;
                    pmpFormResponseMessage.className = 'pmp-form-message success';
                    formPlanMaestro.reset(); // Limpiar el formulario
                    // También limpiar los campos calculados que no se resetean con form.reset() si son readonly
                    pmpGpmInput.value = '';
                    pmpDiasProduccionInput.value = '';
                    pmpLineaSelect.value = ''; // Resetear selects
                    pmpTipoSelect.value = '';
                } else {
                    pmpFormResponseMessage.textContent = data.message || 'Ocurrió un error desconocido.';
                    pmpFormResponseMessage.className = 'pmp-form-message error';
                }
            })
            .catch(error => {
                console.error('Error en la solicitud fetch para guardar plan:', error);
                let errorMessage = 'Error de conexión o el servidor no respondió correctamente.';
                if (error && error.message) errorMessage = error.message;
                pmpFormResponseMessage.textContent = errorMessage;
                pmpFormResponseMessage.className = 'pmp-form-message error';
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            });
        });
    }

    console.log('Plan Maestro de Producción UI (plan_maestro.html) inicializado.');
});