<?php
// Establecer el Content-Type de la respuesta a JSON para todas las respuestas
header('Content-Type: application/json');

// --- CONFIGURACIÓN PARA SQLITE ---
// Ruta completa a tu archivo de base de datos SQLite.
// AJUSTA ESTA RUTA según dónde hayas guardado tu archivo .sqlite o .db
$sqlite_db_file = __DIR__ . '/../database/nutriwell_db.sqlite'; // Asume una carpeta 'database' al mismo nivel que 'api'
// Alternativamente, una ruta absoluta:
// $sqlite_db_file = 'C:/laragon/www/NutriMES/database/nutriwell_db.sqlite';

// Verificar que la carpeta 'database' exista si la ruta es relativa y la carpeta es nueva
// if (!file_exists(dirname($sqlite_db_file))) {
//     mkdir(dirname($sqlite_db_file), 0755, true);
// }

try {
    // Crear (o abrir) la conexión a la base de datos SQLite usando PDO
    // PDO creará el archivo si no existe, pero es mejor que ya lo hayas creado y definido su estructura.
    $conn = new PDO('sqlite:' . $sqlite_db_file);

    // Establecer el modo de error de PDO a excepción para un mejor manejo de errores
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Opcional: Habilitar claves foráneas si las usas (por defecto están desactivadas en SQLite con PDO)
    // $conn->exec('PRAGMA foreign_keys = ON;');

} catch (PDOException $e) {
    // Enviar una respuesta de error en formato JSON y terminar el script
    // En producción, registra $e->getMessage() en un log en lugar de mostrarlo.
    error_log("Error de conexión a SQLite: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos.']);
    exit();
}

// Verificar que la solicitud sea POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Obtener los datos del formulario
    $ot = $_POST['ot'] ?? null;
    $id_externo = $_POST['id_externo'] ?? null;
    $linea = $_POST['linea'] ?? null;
    $producto = $_POST['producto'] ?? null;
    $item = $_POST['item'] ?? null;
    $cantidad = $_POST['cantidad'] ?? null;

    // Validación básica de campos obligatorios
    if (empty($ot) || empty($linea) || empty($producto) || !isset($cantidad)) {
        echo json_encode(['success' => false, 'message' => 'Error: Los campos OT, Línea, Producto y Cantidad son obligatorios.']);
        $conn = null; // Cerrar conexión
        exit();
    }

    if (!is_numeric($cantidad) || intval($cantidad) < 0) {
        echo json_encode(['success' => false, 'message' => 'Error: La cantidad debe ser un número entero no negativo.']);
        $conn = null; // Cerrar conexión
        exit();
    }
    $cantidad_int = intval($cantidad);

    // Preparar la sentencia SQL para SQLite (la sintaxis es mayormente la misma para INSERT)
    // Asumiendo que tu tabla se llama 'registros_produccion' y tiene estas columnas:
    // ot, id_externo, linea, producto, item, cantidad
    // Si tu columna autoincremental se llama diferente a 'id_registro' o no es la PK estándar de SQLite (rowid), ajusta.
    $sql = "INSERT INTO registros_produccion (ot, id_externo, linea, producto, item, cantidad) VALUES (:ot, :id_externo, :linea, :producto, :item, :cantidad)";

    try {
        $stmt = $conn->prepare($sql);

        // Vincular parámetros (PDO usa placeholders con nombre o posicionales '?')
        $stmt->bindParam(':ot', $ot);
        $stmt->bindParam(':id_externo', $id_externo); // PDO maneja bien los NULL si el campo lo permite
        $stmt->bindParam(':linea', $linea);
        $stmt->bindParam(':producto', $producto);
        $stmt->bindParam(':item', $item); // PDO maneja bien los NULL
        $stmt->bindParam(':cantidad', $cantidad_int, PDO::PARAM_INT); // Especificar tipo para enteros

        // Ejecutar la sentencia
        if ($stmt->execute()) {
            // Obtener el ID del último registro insertado (para SQLite con PDO)
            $lastInsertId = $conn->lastInsertId();
            echo json_encode(['success' => true, 'message' => 'Registro de producción guardado exitosamente. ID: ' . $lastInsertId]);
        } else {
            // Esto es menos común con PDO::ERRMODE_EXCEPTION, ya que los errores de execute() lanzarían una excepción.
            echo json_encode(['success' => false, 'message' => 'Error al guardar el registro (execute falló sin excepción).']);
        }

    } catch (PDOException $e) {
        // En producción, registra $e->getMessage() en un log.
        error_log("Error al guardar en SQLite: " . $e->getMessage());
        // Puedes verificar $e->getCode() para errores específicos de SQL, como violaciones de unicidad.
        // Por ejemplo, el código '23000' en SQLite a menudo indica una violación de restricción (UNIQUE, etc.).
        if (strpos($e->getMessage(), 'UNIQUE constraint failed') !== false) {
             echo json_encode(['success' => false, 'message' => 'Error: Ya existe un registro con datos únicos (ej. OT duplicado si es UNIQUE).']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al guardar el registro en la base de datos.']);
        }
    }

} else {
    // Si no es una solicitud POST
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Error: Método de solicitud no permitido. Se esperaba POST.']);
}

// Cerrar la conexión a la base de datos (con PDO, se hace asignando null al objeto de conexión)
$conn = null;
?>