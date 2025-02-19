export type PassResetParams = {
	link: string;
	username: string;
};

export const getPassResetTemplate = ({ link, username }: PassResetParams) =>
	`<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML CSS JS</title>
  <style>
    * {
      margin: 0;
      padding: 0 bo
    }

    body {
      background-color: #f0f0f0;
      /* Fondo gris claro */
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;

    }

    .card {
      background-color: #fff;
      /* Fondo blanco para el card */
      padding: 32px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-radius: 10px;
      gap: 16px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 320px;
    }

    .card h1 {
      font-size: 24px;
      margin: 0
    }


    .btn {
      background-color: #007bff;
      color: white;
      padding: 12px 20px;
      border: none;
      border-radius: 5px;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
    }

    .btn:hover {
      background-color: #0056b3;
    }

    img {
      max-width: 240px;
      height: auto;
    }

    .saludo {
      font-size: 24px;
    }
  </style>
</head>

<body>

  <div class="card">
    <img src="https://images.emojiterra.com/google/android-12l/512px/1f512.png" />
    <h1>Reinicio de Contraseña</h1>
    <p class="saludo">
      Saludos ${username},
    </p>
    <p>
      Se ha generado un enlace para que pueda reiniciar su contraseña. Porfavor haga clic en el botón y será redirigido
      al formulario.</p>
    <a href="${link}" class="btn">Reiniciar Contraseña</a>
  </div>

</body>

</html>`;
