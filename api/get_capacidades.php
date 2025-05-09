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

    // Consulta para obtener todos los datos de la tabla capacidades
    // Seleccionamos DISTINCT maquina para la lista desplegable, y luego el resto de datos.
    // Mejor, seleccionamos todo y procesamos en JS, o hacemos dos consultas si es necesario.
    // Por simplicidad, vamos a obtener todo.
    $stmt = $conn->query("SELECT maquina, bajadas, g_minimo, g_maximo, gpm_frutas, gpm_cereal FROM capacidades ORDER BY maquina ASC");
    $capacidades = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($capacidades) {
        $response['success'] = true;
        $response['data'] = $capacidades;
    } else {
        $response['message'] = 'No se encontraron datos de capacidades.';
        // No necesariamente un error si la tabla está vacía, pero success será false.
    }

} catch (PDOException $e) {
    error_log("Error de PDO en get_capacidades.php: " . $e->getMessage());
    $response['message'] = 'Error al conectar o consultar la base de datos.';
} catch (Exception $e) {
    error_log("Error general en get_capacidades.php: " . $e->getMessage());
    $response['message'] = $e->getMessage();
}

// Cerrar la conexión
$conn = null;

echo json_encode($response);
?>