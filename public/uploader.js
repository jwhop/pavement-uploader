async function renameFile(originalFile, newName) {
  return new File([originalFile], newName, {
    type: originalFile.type,
    lastModified: originalFile.lastModified,
  });
}

const test = {
  "a": 1.0
}

const fileSelect = document.getElementById("upload");
console.log(fileSelect);
fileSelect.addEventListener('change', async function() {
  for (const file of this.files) {
    const originalFile = this.files[0];
    if (originalFile) {
      const renamedFile = await renameFile(originalFile, 'my-new-name.jpg');
      const reader = new FileReader();
      reader.readAsArrayBuffer(renamedFile);
      console.log(this.files[0]);
      const name = this.files[0].name.toLowerCase();
      const type = name.includes("heic") && !this.files[0].type ? 'heic' : this.files[0].type.includes('png')? 'png' : 'jpg';


      reader.onload = function(e) {
        console.log(e.target);
        const rawBuffer = e.target.result;
        console.log(typeof rawBuffer);
        // Process your raw buffer data here
        console.log("Raw buffer data:", rawBuffer);
        fetch('/image', {method: 'POST', headers:{ "Content-type": "application/octet-stream", "name": type }, body: file})

      };
    }  
  }
})

