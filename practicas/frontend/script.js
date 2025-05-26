document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const fileInput = document.getElementById('file');
  const promptInput = document.getElementById('prompt');
  const statusDiv = document.getElementById('status');
  const fileList = document.getElementById('fileList');

  // Mostrar archivo seleccionado
  fileInput.addEventListener('change', () => {
    fileList.innerHTML = '';
    if (fileInput.files.length === 0) {
      fileList.innerHTML = '<li>No se seleccionaron archivos.</li>';
    } else {
      const li = document.createElement('li');
      li.textContent = `📄 ${fileInput.files[0].name}`;
      fileList.appendChild(li);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Esto previene recarga total de la página

    statusDiv.textContent = 'Enviando...';
    statusDiv.style.color = 'gray';

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('prompt', promptInput.value);

    try {
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        statusDiv.textContent = 'Archivo procesado con éxito ✔️';
        statusDiv.style.color = 'limegreen';
      } else {
        const err = await response.json();
        statusDiv.textContent = 'Error al procesar archivo: ' + (err.error || 'Error desconocido');
        statusDiv.style.color = 'red';
      }
    } catch (error) {
      statusDiv.textContent = 'Error al conectar con el servidor';
      statusDiv.style.color = 'red';
      console.error(error);
    }
  });
});