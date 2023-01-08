function viewImage(event, id) {
  const imgId = document.getElementById(id).dataset.id
  document.getElementById(imgId).src = URL.createObjectURL(event.target.files[0])
}