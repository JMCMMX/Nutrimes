document.addEventListener('DOMContentLoaded', function () {
    const tablaRegistrosBody = document.querySelector('#tablaRegistrosProduccion tbody');

    function cargarRegistrosProduccion() {
        if (!tablaRegistrosBody) {
            console.error("No se encontró el tbody de la tabla.");
            return;
        }

        // Mostrar mensaje de carga inicial
        tablaRegistrosBody.innerHTML = '<tr><td colspan="8" class="loading-message">Cargando datos...</td></tr>';

        fetch('api/get_registros_produccion.php') // Asegúrate que la ruta sea correcta
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar los registros de producción: ' + response.statusText);
                }
                return response.json();
            })
            .then(result => {
                tablaRegistrosBody.innerHTML = ''; // Limpiar mensaje de carga o datos anteriores

                if (result.success && result.data && result.data.length > 0) {
                    result.data.forEach(registro => {
                        const fila = tablaRegistrosBody.insertRow();

                        fila.insertCell().textContent = registro.id_registro || 'N/A';
                        fila.insertCell().textContent = registro.ot || 'N/A';
                        fila.insertCell().textContent = registro.id_externo || 'N/A';
                        fila.insertCell().textContent = registro.linea || 'N/A';
                        fila.insertCell().textContent = registro.producto || 'N/A';
                        fila.insertCell().textContent = registro.item || 'N/A';
                        fila.insertCell().textContent = registro.cantidad !== null ? registro.cantidad : 'N/A';
                        
                        // Formatear la fecha (opcional pero recomendado)
                        let fechaFormateada = 'N/A';
                        if (registro.fecha_registro) {
                            try {
                                // Asumiendo que fecha_registro es YYYY-MM-DD HH:MM:SS o similar
                                const fecha = new Date(registro.fecha_registro.replace(' ', 'T') + 'Z'); // Añadir 'Z' para UTC si es necesario
                                if (!isNaN(fecha)) {
                                     // Formato: DD/MM/YYYY HH:MM
                                    fechaFormateada = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()} ${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
                                } else {
                                    fechaFormateada = registro.fecha_registro; // Mostrar como viene si no se puede parsear
                                }
                            } catch (e) {
                                 fechaFormateada = registro.fecha_registro; // Fallback
                            }
                        }
                        fila.insertCell().textContent = fechaFormateada;
                    });
                } else {
                    tablaRegistrosBody.innerHTML = `<tr><td colspan="8" class="no-data-message">${result.message || 'No hay registros para mostrar.'}</td></tr>`;
                }
            })
            .catch(error => {
                tablaRegistrosBody.innerHTML = `<tr><td colspan="8" class="no-data-message">Error de red al cargar los datos.</td></tr>`;
                console.error('Error en fetch para cargarRegistrosProduccion:', error);
            });
    }

    // Cargar los datos al iniciar la página
    cargarRegistrosProduccion();

    console.log('Data Master de Producción UI (data_master_produccion.html) inicializado.');
});