<?php
header('Content-Type: application/json');

// Ruta a tu archivo de base de datos SQLite
// ¡ASEGÚRATE QUE ESTA RUTA SEA LA CORRECTA!
$sqlite_db_file = __DIR__ . '/../database/nutriwell_db.sqlite';
// Ejemplo de ruta absoluta si la necesitas:
// $sqlite_db_file = 'C:/laragon/www/NutriMES/database/nutriwell_db.sqlite';

$response = ['success' => false, 'data' => [], 'message' => ''];

try {
    if (!file_exists($sqlite_db_file)) {
        throw new Exception("El archivo de base de datos no existe en la ruta especificada: " . htmlspecialchars($sqlite_db_file));
    }

    $conn = new PDO('sqlite:' . $sqlite_db_file);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Consulta para obtener todos los datos de la tabla registros_produccion
    // Ordenar por fecha de registro descendente para ver los más recientes primero
    $stmt = $conn->query("SELECT id_registro, ot, id_externo, linea, producto, item, cantidad, fecha_registro FROM registros_produccion ORDER BY fecha_registro DESC");
    $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($registros) {
        $response['success'] = true;
        $response['data'] = $registros;
    } else {
        $response['message'] = 'No se encontraron registros de producción.';
        // No es un error si la tabla está vacía, success será false si no hay datos.
    }

} catch (PDOException $e) {
    error_log("Error de PDO en get_registros_produccion.php: " . $e->getMessage());
    $response['message'] = 'Error al conectar o consultar la base de datos.';
} catch (Exception $e) {
    error_log("Error general en get_registros_produccion.php: " . $e->getMessage());
    $response['message'] = $e->getMessage();
}

// Cerrar la conexión
$conn = null;

echo json_encode($response);
?>