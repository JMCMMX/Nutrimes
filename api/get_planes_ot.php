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

    // Consulta para obtener OT, linea, producto, e item de la tabla planes_maestros
    // Si una OT puede tener múltiples entradas, podrías querer DISTINCT ot y luego buscar detalles,
    // o agrupar, pero para este caso, traeremos todos los datos relevantes por OT.
    // Si OT no es único en planes_maestros y quieres una lista única de OTs,
    // podrías necesitar una consulta más compleja o procesarlo en JS.
    // Por ahora, asumimos que cada OT relevante tiene los datos que queremos autocompletar.
    // Podríamos usar GROUP BY ot si queremos asegurar OTs únicas y tomar la primera línea, producto, item.
    // $stmt = $conn->query("SELECT ot, linea, producto, item FROM planes_maestros WHERE ot IS NOT NULL AND ot != '' GROUP BY ot ORDER BY ot ASC");
    // O, para obtener todas las OTs y sus detalles (JS se encargará de la selección):
    $stmt = $conn->query("SELECT ot, linea, producto, item FROM planes_maestros WHERE ot IS NOT NULL AND ot != '' ORDER BY fecha_creacion DESC, ot ASC");


    $planes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($planes) {
        $response['success'] = true;
        // Para la lista desplegable, solo necesitamos las OTs únicas, pero para autocompletar, necesitamos todos los datos.
        // Vamos a enviar todos los datos y el JS manejará la creación de opciones únicas y el autocompletado.
        $response['data'] = $planes;
    } else {
        $response['message'] = 'No se encontraron OTs en los Planes Maestros.';
        // No necesariamente un error si la tabla está vacía.
    }

} catch (PDOException $e) {
    error_log("Error de PDO en get_planes_ot.php: " . $e->getMessage());
    $response['message'] = 'Error al conectar o consultar la base de datos.';
} catch (Exception $e) {
    error_log("Error general en get_planes_ot.php: " . $e->getMessage());
    $response['message'] = $e->getMessage();
}

// Cerrar la conexión
$conn = null;

echo json_encode($response);
?>