document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const fileInput = document.getElementById('file');
  const promptInput = document.getElementById('prompt');
  const statusDiv = document.getElementById('status');
  const fileList = document.getElementById('fileList');
  const downloadBtn = document.getElementById('downloadBtn');

  let correctedText = ''; // Guardar respuesta IA para descargar luego

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
    downloadBtn.style.display = 'none'; // Ocultar botón al cambiar archivo
  });

  // Descargar archivo corregido al hacer click
  downloadBtn.addEventListener('click', () => {
    if (!correctedText) return;

    const blob = new Blob([correctedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Nombre del archivo corregido sin fecha
    const originalName = fileInput.files.length > 0 ? fileInput.files[0].name.replace(/\.[^/.]+$/, '') : 'corregido';
    link.download = `${originalName}_corregido.txt`;
    link.href = url;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  // Envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    statusDiv.textContent = 'Enviando...';
    statusDiv.style.color = 'gray';
    downloadBtn.style.display = 'none';
    correctedText = '';

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('prompt', promptInput.value);

    try {
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        statusDiv.textContent = 'Archivo procesado con éxito ✔️';
        statusDiv.style.color = 'limegreen';

        correctedText = data.respuesta || '';
        if (correctedText) {
          downloadBtn.style.display = 'inline-block';
        }
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